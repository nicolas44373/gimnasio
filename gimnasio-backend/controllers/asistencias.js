const { promisePool } = require('../db/connection'); // Importa el pool de conexiones

// Controlador para buscar la asistencia por DNI
const buscarAsistencia = async (req, res) => {
    const { dni } = req.query;

    if (!dni) {
        return res.status(400).json({ error: 'El DNI es obligatorio.' });
    }

    try {
        // Consultar cliente por DNI y obtener la membresía asociada
        const clienteQuery = `
            SELECT c.id, c.nombre, c.fecha_registro, c.dni, m.tipo AS membresia, m.precio 
            FROM clientes c
            JOIN membresias m ON c.id_membresia = m.id
            WHERE c.dni = ?
        `;
        const [clienteResults] = await promisePool.query(clienteQuery, [dni]);

        if (clienteResults.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        const cliente = clienteResults[0];
        console.log(`Membresía del cliente (${dni}):`, cliente.membresia);

        // Limpia el valor de la membresía para evitar problemas de formato
        const tipoMembresia = cliente.membresia.trim().toLowerCase();
        console.log('Membresía procesada:', tipoMembresia);

        // Calcular la fecha de vencimiento según el tipo de membresía
        let fechaVencimiento = new Date(cliente.fecha_registro);

        switch (tipoMembresia) {
            case 'semanal':
                fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);
                break;
            case 'mensual':
                fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
                break;
            case 'trimestral':
                fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 3);
                break;
            case 'anual':
                fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
                break;
            default:
                console.error(`Tipo de membresía desconocido: ${cliente.membresia}`);
                return res.status(400).json({ error: `Tipo de membresía desconocido: ${cliente.membresia}` });
        }

        // Consultar asistencia para el cliente
        const asistenciaQuery = `
            SELECT fecha 
            FROM asistencias 
            WHERE id_cliente = ?
        `;
        const [asistenciaResults] = await promisePool.query(asistenciaQuery, [cliente.id]);

        // Responder con la información del cliente y la fecha de vencimiento
        res.json({
            nombre: cliente.nombre,
            fecha_registro: cliente.fecha_registro,
            fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0], // Convertir a formato YYYY-MM-DD
            membresia: cliente.membresia,
            precio: cliente.precio,
            asistencias: asistenciaResults // Incluye las fechas de asistencia si es necesario
        });
    } catch (error) {
        console.error('Error al buscar asistencia:', error);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
    }
};

module.exports = { buscarAsistencia };
