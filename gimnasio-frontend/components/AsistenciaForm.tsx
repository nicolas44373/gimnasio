import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Asegúrate de que la ruta de importación sea correcta
import '../styles/AsistenciaForm.css';

interface Asistencia {
    nombre: string;
    fecha_registro: string;
    fecha_vencimiento: string;
    membresia: string;
    precio: string;
}

const AsistenciaForm: React.FC = () => {
    const [dni, setDni] = useState<string>('');
    const [resultado, setResultado] = useState<Asistencia | null>(null);
    const [error, setError] = useState<string>('');

    const handleBuscar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setResultado(null);
    
        if (!dni) {
            setError('Por favor, ingresa un DNI válido.');
            return;
        }
    
        try {
            // Buscar información del cliente
            const buscarResponse = await axios.get(`http://localhost:5000/asistencias/buscar?dni=${dni}`);
            setResultado(buscarResponse.data);
    
            // Registrar la asistencia
            await axios.post('http://localhost:5000/asistencias/registrar', { dni });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Hubo un error al buscar o registrar la asistencia.');
        }
    };
    

    // Función para formatear la fecha a DD/MM/AA
    const formatearFecha = (fecha: string): string => {
        const date = new Date(fecha);
        const dia = ("0" + date.getDate()).slice(-2);
        const mes = ("0" + (date.getMonth() + 1)).slice(-2); // Los meses son indexados desde 0
        const año = date.getFullYear().toString().slice(-2); // Tomamos solo los dos últimos dígitos del año

        return `${dia}/${mes}/${año}`;
    };

    return (
        <div className="asistencia-form-container">
            {/* Aquí agregamos el Navbar */}
            <Navbar />  {/* El Navbar se renderiza correctamente arriba del formulario */}

            <div className="form-content">
                <h2 className="form-title">Buscar Asistencia</h2>

                {error && <div className="form-error-message">{error}</div>}

                <form onSubmit={handleBuscar} className="asistencia-form">
                    <div className="form-group">
                        <label htmlFor="dni" className="form-label">DNI</label>
                        <input
                            type="text"
                            id="dni"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            className="form-input"
                            placeholder="Ingresa tu DNI"
                            required
                        />
                    </div>
                    <button type="submit" className="form-button form-button-primary">Buscar</button>
                </form>

                {resultado && (
                    <div className="asistencia-result">
                        <div className="result-item">
                            <strong>Nombre:</strong> <span>{resultado.nombre}</span>
                        </div>
                        <div className="result-item">
                            <strong>Fecha de Registro:</strong> <span>{formatearFecha(resultado.fecha_registro)}</span>
                        </div>
                        <div className="result-item">
                            <strong>Fecha de Vencimiento:</strong> <span>{formatearFecha(resultado.fecha_vencimiento)}</span>
                        </div>
                        <div className="result-item">
                            <strong>Membresía:</strong> <span>{resultado.membresia}</span>
                        </div>
                        <div className="result-item">
                            <strong>Precio:</strong> <span>{resultado.precio}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AsistenciaForm;
