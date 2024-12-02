import React, { useState, useEffect } from 'react';
import { PlusIcon, CalendarIcon, UserIcon, TrashIcon, EditIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import { obtenerClases, crearClase, eliminarClase, actualizarClase, obtenerEntrenadores } from '../utils/api';
import '../styles/clases.css';

const Clases = () => {
  const [clases, setClases] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [formData, setFormData] = useState({
    id: '', // Añadimos un campo de id para poder actualizar clases
    nombre: '',
    horario: '',
    idEntrenador: ''
  });
  const [errors, setErrors] = useState({});
  const [editando, setEditando] = useState(false); // Estado para saber si estamos editando una clase
  const [mensaje, setMensaje] = useState(''); // Estado para mostrar un mensaje de éxito o error

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clasesData, entrenadoresData] = await Promise.all([
          obtenerClases(),
          obtenerEntrenadores()
        ]);
        setClases(clasesData);
        setEntrenadores(entrenadoresData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMensaje('Error al obtener las clases y entrenadores.');
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Función de validación para verificar duplicados
  const validateForm = () => {
    const newErrors = {};

    // Verificar si ya existe una clase con el mismo horario
    if (clases.some(clase => clase.horario === formData.horario && clase.id !== formData.id)) {
      newErrors.horario = 'Ya existe una clase con este horario';
    }

    // Verificar campos vacíos
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!formData.horario) newErrors.horario = 'El horario es requerido';
    if (!formData.idEntrenador) newErrors.idEntrenador = 'Seleccione un entrenador';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        let claseActualizada;
        if (editando) {
          // Actualizar la clase si estamos en modo edición
          claseActualizada = await actualizarClase(formData.id, formData);

          // Verificar la clase actualizada
          console.log("Clase actualizada:", claseActualizada);

          // Actualizar el estado de las clases con la clase actualizada
          setClases((prevClases) =>
            prevClases.map((clase) =>
              clase.id === claseActualizada.id ? claseActualizada : clase
            )
          );
        } else {
          // Crear una nueva clase
          const nuevaClase = await crearClase(formData);
          console.log("Nueva clase creada:", nuevaClase);
          setClases((prevClases) => [...prevClases, nuevaClase]);
        }

        setFormData({ id: '', nombre: '', horario: '', idEntrenador: '' });
        setEditando(false); // Resetear el estado de edición
        setMensaje('Clase guardada exitosamente');
      } catch (error) {
        console.error('Error al crear o actualizar clase:', error);
        setMensaje('Error al crear o actualizar la clase. Intenta nuevamente.');
      }
    } else {
      console.log('Formulario con errores:', errors);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarClase(id);
      setClases((prev) => prev.filter((clase) => clase.id !== id));
      setMensaje('Clase eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar clase:', error);
      setMensaje('Error al eliminar la clase');
    }
  };

  const handleEditar = (clase) => {
    setFormData({
      id: clase.id, // Asignar el ID de la clase
      nombre: clase.nombre,
      horario: clase.horario,
      idEntrenador: clase.idEntrenador
    });
    setEditando(true); // Establecer que estamos en modo edición
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-12 text-center text-blue-600">
          Gestión de Clases
        </h1>

        {/* Mensaje de éxito o error */}
        {mensaje && (
          <div className="mb-4 text-center p-4 rounded-lg bg-blue-100 text-blue-700">
            {mensaje}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Formulario de Clases */}
          <div className="bg-white shadow-xl rounded-lg p-8 space-y-8">
            <h2 className="text-3xl font-semibold mb-8 flex items-center space-x-4">
              <PlusIcon className="text-blue-500" />
              <span>{editando ? 'Editar Clase' : 'Agregar Nueva Clase'}</span>
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <CalendarIcon className="mr-3 text-blue-500" />
                  Nombre de la Clase
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Yoga, Zumba"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-2">{errors.nombre}</p>
                )}
              </div>

              <div className="mb-8">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <CalendarIcon className="mr-3 text-blue-500" />
                  Horario
                </label>
                <input
                  type="text"
                  name="horario"
                  value={formData.horario}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Lunes 18:00"
                />
                {errors.horario && (
                  <p className="text-red-500 text-sm mt-2">{errors.horario}</p>
                )}
              </div>

              <div className="mb-8">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <UserIcon className="mr-3 text-blue-500" />
                  Entrenador
                </label>
                <select
                  name="idEntrenador"
                  value={formData.idEntrenador}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar Entrenador</option>
                  {entrenadores.map((entrenador) => (
                    <option key={entrenador.id} value={entrenador.id}>
                      {entrenador.nombre}
                    </option>
                  ))}
                </select>
                {errors.idEntrenador && (
                  <p className="text-red-500 text-sm mt-2">{errors.idEntrenador}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
              >
                {editando ? 'Actualizar Clase' : 'Crear Clase'}
              </button>
            </form>
          </div>

          {/* Lista de Clases */}
          <div className="bg-white shadow-xl rounded-lg p-8 space-y-8">
            <h2 className="text-3xl font-semibold mb-8">Clases Actuales</h2>
            {clases.length > 0 ? (
              <ul className="space-y-4">
                {clases.map((clase) => (
                  <li key={clase.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{clase.nombre}</h3>
                      <p className="text-sm text-gray-600">{clase.horario}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleEditar(clase)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleEliminar(clase.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No hay clases disponibles.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clases;
