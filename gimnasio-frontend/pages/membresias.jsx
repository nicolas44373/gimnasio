import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { obtenerMembresias, crearMembresia, actualizarMembresia, eliminarMembresia } from '../utils/api';
import '../styles/membresias.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Membresias = () => {
    const [membresias, setMembresias] = useState([]);
    const [tipo, setTipo] = useState('');
    const [precio, setPrecio] = useState('');
    const [membresiaEditando, setMembresiaEditando] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMembresias = async () => {
            try {
                setCargando(true);
                const data = await obtenerMembresias();
                setMembresias(data);
            } catch (error) {
                setError('Error al cargar las membresías.');
            } finally {
                setCargando(false);
            }
        };
        fetchMembresias();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar si ya existe una membresía con el mismo tipo, excluyendo la membresía que se está editando
        const membresiaExistente = membresias.some(
            (membresia) =>
                membresia.tipo.toLowerCase() === tipo.toLowerCase() &&
                (!membresiaEditando || membresia.id !== membresiaEditando.id)
        );

        if (membresiaExistente) {
            setError('Ya existe una membresía con el mismo nombre.');
            return;
        }

        try {
            if (membresiaEditando) {
                // Actualizar membresía
                await actualizarMembresia(membresiaEditando.id, { tipo, precio });
                setMembresias((prev) =>
                    prev.map((m) =>
                        m.id === membresiaEditando.id ? { ...m, tipo, precio } : m
                    )
                );
                setMembresiaEditando(null);
            } else {
                // Crear nueva membresía
                const nuevaMembresia = await crearMembresia({ tipo, precio });
                setMembresias([...membresias, nuevaMembresia]);
            }
            setTipo('');
            setPrecio('');
            setError('');
        } catch (error) {
            setError('Error al guardar la membresía.');
        }
    };

    const handleEditar = (membresia) => {
        setTipo(membresia.tipo);
        setPrecio(membresia.precio);
        setMembresiaEditando(membresia);
    };

    const handleEliminar = async (id) => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar esta membresía?');
        if (confirmDelete) {
            try {
                await eliminarMembresia(id);
                setMembresias((prev) => prev.filter((m) => m.id !== id));
            } catch (error) {
                setError('Error al eliminar la membresía.');
            }
        }
    };

    return (
        <div className="membresias-container">
            <Navbar />
            <div className="form-container">
                <h1 className="title">Gestionar Membresías</h1>
                <form onSubmit={handleSubmit} className="form">
                    <div className="input-group">
                        <label htmlFor="tipo" className="input-label">Tipo de Membresía</label>
                        <input
                            type="text"
                            id="tipo"
                            placeholder="Tipo de Membresía"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="precio" className="input-label">Precio</label>
                        <input
                            type="number"
                            id="precio"
                            placeholder="Precio"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="submit-btn">
                        {membresiaEditando ? 'Actualizar Membresía' : 'Agregar Membresía'}
                    </button>
                    {membresiaEditando && (
                        <button
                            type="button"
                            onClick={() => {
                                setTipo('');
                                setPrecio('');
                                setMembresiaEditando(null);
                            }}
                            className="cancel-btn"
                        >
                            Cancelar Edición
                        </button>
                    )}
                </form>
                {error && <p className="error">{error}</p>}
            </div>

            <div className="membresias-list">
                <h2 className="subtitle">Membresías Disponibles</h2>
                {cargando ? (
                    <p className="loading">Cargando...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <div className="membresias-cards">
                        {membresias.map((membresia) => (
                            <div key={membresia.id} className="card">
                                <div className="card-content">
                                    <h3 className="card-title">{membresia.tipo}</h3>
                                    <p className="card-price">Precio: ${membresia.precio}</p>
                                </div>
                                <div className="card-actions">
                                    <button
                                        onClick={() => handleEditar(membresia)}
                                        className="edit-btn"
                                    >
                                        <i className="fas fa-pencil-alt"></i> Editar
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(membresia.id)}
                                        className="delete-btn"
                                    >
                                        <i className="fas fa-trash-alt"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Membresias;
