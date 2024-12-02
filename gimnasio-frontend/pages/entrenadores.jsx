import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { obtenerEntrenadores, crearEntrenador, eliminarEntrenador, actualizarEntrenador } from '../utils/api';
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import '../styles/entrenadores.css'

const Entrenadores = () => {
    const [entrenadores, setEntrenadores] = useState([]);
    const [nombre, setNombre] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false); // Para saber si estamos en modo edición
    const [entrenadorEditando, setEntrenadorEditando] = useState(null); // Para saber qué entrenador estamos editando

    // Cargar los entrenadores
    useEffect(() => {
        const fetchEntrenadores = async () => {
            setCargando(true);
            try {
                const data = await obtenerEntrenadores();
                setEntrenadores(data);
            } catch (error) {
                setError('No se pudieron cargar los entrenadores');
            } finally {
                setCargando(false);
            }
        };
        fetchEntrenadores();
    }, []);

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validación de campos
        if (!nombre || !especialidad) {
            alert('Por favor, complete todos los campos');
            return;
        }
    
        const nuevoEntrenador = { nombre, especialidad };
    
        try {
            setCargando(true);
            if (modoEdicion) {
                // Si estamos en modo edición, actualizamos el entrenador
                const data = await actualizarEntrenador(entrenadorEditando.id, nuevoEntrenador);
    
                // Aquí, actualizamos el entrenador en el estado usando los datos de la respuesta
                console.log('Entrenador actualizado:', data);
    
                // Actualizar el estado con los datos del entrenador actualizado
                setEntrenadores((prevEntrenadores) =>
                    prevEntrenadores.map((entrenador) =>
                        entrenador.id === entrenadorEditando.id ? { ...entrenador, ...data } : entrenador
                    )
                );
                setModoEdicion(false);
            } else {
                // Si no estamos en modo edición, creamos un nuevo entrenador
                const data = await crearEntrenador(nuevoEntrenador);
                setEntrenadores((prevEntrenadores) => [...prevEntrenadores, data]);
            }
    
            // Limpiar formulario
            setNombre('');
            setEspecialidad('');
            setError(null);
    
            // Refrescar la lista de entrenadores, después de agregar o actualizar
            const entrenadoresActualizados = await obtenerEntrenadores();
            setEntrenadores(entrenadoresActualizados);
    
        } catch (error) {
            setError('Hubo un error al agregar o actualizar el entrenador');
        } finally {
            setCargando(false);
        }
    };
    
    

    // Función para eliminar un entrenador
    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este entrenador?')) {
            try {
                setCargando(true);
                await eliminarEntrenador(id);
                setEntrenadores(entrenadores.filter(entrenador => entrenador.id !== id));
            } catch (error) {
                setError('Hubo un error al eliminar el entrenador');
            } finally {
                setCargando(false);
            }
        }
    };

    // Función para cargar los datos del entrenador a editar
    const handleEditar = (entrenador) => {
        setNombre(entrenador.nombre);
        setEspecialidad(entrenador.especialidad);
        setModoEdicion(true);
        setEntrenadorEditando(entrenador);
    };

    return (
        <div className="entradores-container">
            <Navbar />
            <div className="entradores-content">
                <h1 className="title">Gestión de Entrenadores</h1>

                {error && <div className="error-message">{error}</div>}

                {/* Formulario para agregar o editar entrenador */}
                <form onSubmit={handleSubmit} className="form-container">
                    <h2 className="form-title">
                        <PlusIcon className="icon" />
                        {modoEdicion ? 'Editar Entrenador' : 'Agregar Nuevo Entrenador'}
                    </h2>

                    <div className="input-group">
                        <label htmlFor="nombre" className="input-label">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="input-field"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="especialidad" className="input-label">Especialidad</label>
                        <input
                            type="text"
                            id="especialidad"
                            value={especialidad}
                            onChange={(e) => setEspecialidad(e.target.value)}
                            className="input-field"
                            placeholder="Ej: Yoga, Zumba, Crossfit"
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={cargando}
                    >
                        {cargando ? 'Cargando...' : modoEdicion ? 'Actualizar Entrenador' : 'Agregar Entrenador'}
                    </button>
                </form>

                {/* Lista de Entrenadores */}
                <h2 className="list-title">Entrenadores Registrados</h2>
                <div className="trainer-list">
                    {entrenadores.length > 0 ? (
                        entrenadores.map((entrenador) => (
                            <div key={entrenador.id} className="trainer-card">
                                <div>
                                    <h3 className="trainer-name">{entrenador.nombre}</h3>
                                    <p className="trainer-specialty">{entrenador.especialidad}</p>
                                </div>
                                <div className="actions">
                                    <button
                                        onClick={() => handleEditar(entrenador)}
                                        className="edit-button"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(entrenador.id)}
                                        className="delete-button"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-trainers-message">No hay entrenadores registrados</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Entrenadores;
