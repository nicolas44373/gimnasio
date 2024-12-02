import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TablaClientes from '../components/TablaClientes';
import ClienteForm from '../components/ClienteForm';
import { 
    obtenerClientes, 
    obtenerMembresias, 
    obtenerClases, 
    eliminarCliente 
} from '../utils/api';
import '../styles/index.css';
import '../styles/globals.css';
import { PlusCircleIcon, RefreshCwIcon, UserPlusIcon } from 'lucide-react';

const Index = () => {
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [membresias, setMembresias] = useState([]);
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleEditarCliente = (cliente) => {
        setClienteSeleccionado(cliente);
        setMostrarFormulario(true);
    };

    const handleEliminarCliente = async (id) => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este cliente?');
        if (confirmDelete) {
            try {
                await eliminarCliente(id);
                setClientes(clientes.filter((cliente) => cliente.id !== id));
                alert('Cliente eliminado correctamente');
            } catch (error) {
                console.error('Error al eliminar cliente:', error);
                alert('No se pudo eliminar el cliente. Intente nuevamente.');
            }
        }
    };

    const handleAgregarCliente = (nuevoCliente) => {
        setClientes([...clientes, nuevoCliente]);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientesData, membresiasData, clasesData] = await Promise.all([
                    obtenerClientes(),
                    obtenerMembresias(),
                    obtenerClases(),
                ]);
                console.log('Clientes obtenidos:', clientesData);
                console.log('Clases obtenidas:', clasesData);
                console.log('Membresías obtenidas:', membresiasData);

                setClientes(clientesData);
                setMembresias(membresiasData);
                setClases(clasesData);
                setLoading(false);
            } catch (error) {
                setError('No se pudieron cargar los datos');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="text-center">
                    <RefreshCwIcon className="loading-spinner text-indigo-500 w-20 h-20 mb-4" />
                    <p className="text-lg font-semibold">Cargando datos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <UserPlusIcon className="text-red-600 w-16 h-16 mb-4" />
                    <h2 className="text-xl font-bold text-red-700">Error de Conexión</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary mt-4"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-6 space-y-6">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="flex justify-between items-center space-y-4 md:space-y-0">
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => {
                                    setClienteSeleccionado(null);
                                    setMostrarFormulario(!mostrarFormulario);
                                }}
                                className="btn btn-primary"
                            >
                                <PlusCircleIcon className="w-5 h-5" />
                                {mostrarFormulario ? 'Cancelar' : 'Nuevo Cliente'}
                            </button>
                        </div>
                    </div>
                </div>
                {mostrarFormulario && (
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <ClienteForm
                            clienteSeleccionado={clienteSeleccionado}
                            setClienteSeleccionado={setClienteSeleccionado}
                            setClientes={setClientes}
                            membresias={membresias}
                            clases={clases}
                        />
                    </div>
                )}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <TablaClientes
                        clientes={clientes}
                        membresias={membresias}
                        clases={clases}
                        onEditar={handleEditarCliente}
                        onEliminar={handleEliminarCliente}
                    />
                </div>
            </div>
        </div>
    );
};

export default Index;
