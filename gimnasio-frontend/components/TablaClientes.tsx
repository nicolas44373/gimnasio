import React, { useState, useEffect } from 'react';
import { Edit2Icon, TrashIcon, SearchIcon } from 'lucide-react';
import '../styles/TablaClientes.css';

interface Clase {
  id: string;
  nombre: string;
}

interface Membresia {
  id: string;
  tipo: string;
  precio: number;
}

interface Cliente {
  id?: number;
  nombre: string;
  dni: string;
  id_membresia: string;
  id_clase: string;
  tipo_membresia?: string;
  clase?: Clase;
  telefono?: string; // Agregar este campo
}

const TablaClientes = ({
  clientes = [],
  membresias = [],
  clases = [],
  onEditar,
  onEliminar
}: {
  clientes: Cliente[];
  membresias: Membresia[];
  clases: Clase[];
  onEditar: (cliente: Cliente) => Promise<Cliente>;  // Aseguramos que onEditar devuelva un Cliente
  onEliminar: (id: number | undefined) => void;
}) => {
  const [clientesConDetalles, setClientesConDetalles] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState('');
  const [ordenamiento, setOrdenamiento] = useState({
    columna: 'nombre',
    direccion: 'asc',
  });

  useEffect(() => {
    // Función para agregar detalles de membresía y clase
    const agregarDetalles = () => {
      return clientes.map(cliente => {
        const membresia = membresias.find(m => m.id === cliente.id_membresia);
        const tipoMembresia = membresia ? membresia.tipo : 'No asignada';
        const clase = clases.find(c => String(c.id) === String(cliente.id_clase));
        const claseNombre = clase ? clase.nombre : 'No asignada';
    
        return {
          ...cliente,
          tipo_membresia: tipoMembresia,
          telefono: cliente.telefono || 'No disponible', // Agregar el teléfono
          clase: clase || { id: '0', nombre: claseNombre }, // Clase por defecto
        };
      });
    };

    setClientesConDetalles(agregarDetalles());
  }, [clientes, membresias, clases]); // Se actualiza cada vez que cambian los clientes, membresias o clases

  const clientesFiltrados = clientesConDetalles
    .filter(cliente =>
      Object.values(cliente).some(valor =>
        valor?.toString().toLowerCase().includes(filtro.toLowerCase())
      )
    )
    .sort((a, b) => {
      const valorA = a[ordenamiento.columna as keyof Cliente]?.toString() || '';
      const valorB = b[ordenamiento.columna as keyof Cliente]?.toString() || '';
      return ordenamiento.direccion === 'asc'
        ? valorA.localeCompare(valorB)
        : valorB.localeCompare(valorA);
    });

  const handleOrdenamiento = (columna: string) => {
    setOrdenamiento(prevOrden => ({
      columna,
      direccion: prevOrden.columna === columna && prevOrden.direccion === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Función para manejar la edición del cliente
  const manejarEdicionCliente = async (cliente: Cliente) => {
    try {
      // Llamar a la función que actualiza el cliente en el backend
      const clienteActualizado = await onEditar(cliente);
  
      if (!clienteActualizado) {
        console.error('El cliente no fue actualizado correctamente');
        return;
      }
  
      // Actualizamos el cliente con los detalles de la membresía y clase
      setClientesConDetalles(prevClientes => {
        return prevClientes.map(c => 
          c.id === cliente.id 
            ? { 
                ...c, 
                ...clienteActualizado,  // Actualizamos los datos del cliente
                tipo_membresia: clienteActualizado.tipo_membresia, // Actualizamos el tipo de membresía
                id_membresia: clienteActualizado.id_membresia,  // Aseguramos que el id de membresía también se actualice
              }
            : c
        );
      });
    } catch (error) {
      console.error('Error al editar cliente:', error);
    }
  };
  
  // Función para manejar la eliminación del cliente
  const manejarEliminarCliente = async (id: number | undefined) => {
    try {
      // Llamar a la función que elimina el cliente en el backend
      await onEliminar(id);

      // Eliminar el cliente de la lista
      setClientesConDetalles(prevClientes =>
        prevClientes.filter(c => c.id !== id)
      );

    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    }
  };

  // Validación de DNI y teléfono
  const validarDni = (dni: string) => dni.length <= 8 && /^\d+$/.test(dni);
  const validarTelefono = (telefono: string) => telefono.length <= 12 && /^\d+$/.test(telefono);

  return (
    <div className="tabla-clientes-container">
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <table className="tabla-clientes">
        <thead className="tabla-header">
          <tr>
            {['Nombre', 'DNI', 'Teléfono', 'Clase', 'Tipo de Membresía', 'Acciones'].map(header => (
              <th
                key={header}
                className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${header !== 'Acciones' ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                onClick={() => header !== 'Acciones' && handleOrdenamiento(header.toLowerCase())}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map((cliente, index) => (
              <tr key={cliente.id || `cliente-${index}`} className="tabla-row">
                <td className="px-6 py-4">{cliente.nombre}</td>
                <td className="px-6 py-4">
                  {validarDni(cliente.dni) ? cliente.dni : 'DNI inválido'}
                </td>
                <td className="px-6 py-4">
                  {validarTelefono(cliente.telefono || '') ? cliente.telefono : 'Teléfono inválido'}
                </td>
                <td className="px-6 py-4">{cliente.clase?.nombre}</td>
                <td className="px-6 py-4">{cliente.tipo_membresia}</td>
                <td className="tabla-acciones px-6 py-4">
                  <button onClick={() => manejarEdicionCliente(cliente)} className="tabla-boton tabla-boton-editar">
                    <Edit2Icon size={20} />
                  </button>
                  <button onClick={() => manejarEliminarCliente(cliente.id)} className="tabla-boton tabla-boton-eliminar">
                    <TrashIcon size={20} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="tabla-vacia">
                No se encontraron clientes
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="tabla-paginacion">
        <button className="tabla-paginacion-boton">Anterior</button>
        <button className="tabla-paginacion-boton">Siguiente</button>
      </div>
    </div>
  );
};

export default TablaClientes;
