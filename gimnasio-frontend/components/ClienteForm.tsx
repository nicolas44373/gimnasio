import React, { useState, useEffect } from 'react';
import { obtenerClases, crearCliente, actualizarCliente } from '../utils/api';
import '../styles/ClienteForm.css';

interface Cliente {
    id?: number;
    nombre: string;
    dni: string;
    telefono: string;
    email: string;
    direccion: string;
    id_membresia: string;
    id_clase: string | null; // Mantener null como valor permitido
    [key: string]: string | number | null | undefined; // Permitir null para id_clase
}

interface Membresia {
    id: string;
    tipo: string;
    precio: number;
}

interface Clase {
    id: string;
    nombre: string;
}

interface ClienteFormProps {
    setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
    clienteSeleccionado: Cliente | null;
    setClienteSeleccionado: React.Dispatch<React.SetStateAction<Cliente | null>>;
    membresias: Membresia[];
    clases: Clase[];
    clientes: Cliente[];
}

const ClienteForm: React.FC<ClienteFormProps> = ({
    setClientes,
    clienteSeleccionado,
    setClienteSeleccionado,
    membresias = [],
    clases = [],
    clientes = [],
}) => {
    const clienteInicial: Cliente = {
        nombre: '',
        dni: '',
        telefono: '',
        email: '',
        direccion: '',
        id_membresia: '',
        id_clase: null, // Establecer id_clase como null por defecto
    };

    const [formData, setFormData] = useState<Cliente>(clienteInicial);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (clienteSeleccionado) {
            setFormData(clienteSeleccionado);
        } else {
            setFormData(clienteInicial);
        }
    }, [clienteSeleccionado]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Verifica si ya existe un cliente con el mismo DNI, teléfono o email
    const validarCamposUnicos = (): boolean => {
        const { dni, telefono, email } = formData;

        // Buscar clientes con los mismos valores, excepto el cliente actual
        const clienteExistente = clientes.find(cliente => {
            return (
                (cliente.dni === dni && cliente.id !== formData.id) ||
                (cliente.telefono === telefono && cliente.id !== formData.id) ||
                (cliente.email === email && cliente.id !== formData.id)
            );
        });

        if (clienteExistente) {
            if (clienteExistente.dni === dni) {
                setError('El DNI ya está registrado.');
            } else if (clienteExistente.telefono === telefono) {
                setError('El Teléfono ya está registrado.');
            } else if (clienteExistente.email === email) {
                setError('El Email ya está registrado.');
            }
            return false;
        }

        return true;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        // Verificar si todos los campos obligatorios están llenos
        const { nombre, dni, telefono, email, direccion, id_membresia, id_clase } = formData;
        if (!nombre || !dni || !telefono || !email || !direccion || !id_membresia) {
            setError('Todos los campos son obligatorios');
            return;
        }
    
        // Si no se ha seleccionado una clase, establecer el valor de id_clase a null
        if (!id_clase) {
            setFormData(prev => ({
                ...prev,
                id_clase: null, // Ahora id_clase puede ser null
            }));
        }
    
        // Verificar si los campos son únicos
        if (!validarCamposUnicos()) {
            return;
        }
    
        try {
            let response: Cliente;
            if (clienteSeleccionado?.id) {
                // Si hay un cliente seleccionado, actualizarlo
                response = await actualizarCliente({
                    ...formData,
                    id: clienteSeleccionado.id,
                });
    
                // Actualizar el estado de los clientes con los nuevos datos, incluyendo el tipo de membresía
                setClientes(prev => prev.map(cliente =>
                    cliente.id === clienteSeleccionado.id
                        ? { ...cliente, ...formData, id_membresia: formData.id_membresia } // Actualizamos el tipo de membresía
                        : cliente
                ));
            } else {
                // Si no hay cliente seleccionado, crear uno nuevo
                response = await crearCliente(formData);
                setClientes(prev => [...prev, response]);
            }
    
            setError(''); // Limpiar error
            setClienteSeleccionado(null); // Limpiar cliente seleccionado
            setFormData(clienteInicial); // Resetear formulario
        } catch (error: unknown) {
            // Manejo del error
            if (error instanceof Error) {
                console.error('Error al guardar el cliente:', error);
                setError('Hubo un error al guardar el cliente');
            } else if (error && (error as any).response?.data?.message) {
                setError((error as any).response.data.message);
            } else {
                setError('Hubo un error desconocido');
            }
        }
    };
    

    const handleCancelar = () => {
        setClienteSeleccionado(null);
        setFormData(clienteInicial);
        setError('');
    };

    const fieldLabels: { [key: string]: string } = {
        id_membresia: 'Tipo de Membresía',
        id_clase: 'Clase',
        email: 'Correo Electrónico',
        nombre: 'Nombre',
        dni: 'DNI',
        telefono: 'Teléfono',
    };

    return (
        <div className="cliente-form-container">
            <h2 className="form-title">
                {clienteSeleccionado ? 'Editar Cliente' : 'Agregar Cliente'}
            </h2>

            {error && <div className="form-error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="cliente-form">
                {Object.keys(clienteInicial)
                    .filter(key => key !== 'id')
                    .map(key => (
                        <div className="form-group" key={key}>
                            <label htmlFor={key} className="form-label">
                                {fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                            </label>

                            {key === 'id_membresia' ? (
                                <select
                                    id={key}
                                    name={key}
                                    value={formData[key] || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Seleccionar Membresía</option>
                                    {membresias.map(membresia => (
                                        <option key={membresia.id} value={membresia.id}>
                                            {`${membresia.tipo} - $${membresia.precio}`}
                                        </option>
                                    ))}
                                </select>
                            ) : key === 'id_clase' ? (
                                <select
                                    id={key}
                                    name={key}
                                    value={formData[key] || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">Seleccionar Clase (Ninguna si no aplica)</option>
                                    <option value="">No quiere ninguna</option>
                                    {clases.map(clase => (
                                        <option key={clase.id} value={clase.id}>
                                            {clase.nombre}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={key === 'email' ? 'email' : 'text'}
                                    id={key}
                                    name={key}
                                    value={formData[key] || ''}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                            )}
                        </div>
                    ))}

                <div className="form-submit-buttons">
                    <button type="submit" className="form-button form-button-primary">
                        {clienteSeleccionado ? 'Actualizar Cliente' : 'Guardar Cliente'}
                    </button>
                    {clienteSeleccionado && (
                        <button
                            type="button"
                            onClick={handleCancelar}
                            className="form-button form-button-secondary"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ClienteForm;
