const mysql = require('mysql2');

// Configuración de la conexión
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'gimnasio',
});

// Función auxiliar para realizar consultas
const queryDatabase = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Obtener todos los clientes con detalles de la membresía
exports.obtenerClientes = async (req, res) => {
    const sql = `
        SELECT 
            clientes.id, 
            clientes.nombre, 
            clientes.dni, 
            clientes.telefono, 
            clientes.email, 
            clientes.direccion, 
            clientes.fecha_registro, 
            membresias.tipo AS tipo_membresia, 
            membresias.precio AS precio_membresia
        FROM clientes
        LEFT JOIN membresias ON clientes.id_membresia = membresias.id
    `;
    try {
        const clientes = await queryDatabase(sql);
        res.json(clientes);
    } catch (err) {
        console.error('Error al obtener los clientes:', err);
        res.status(500).json({ message: 'Hubo un problema al cargar los clientes', error: err.message });
    }
};

// Crear un cliente con validación de membresía
exports.crearCliente = async (req, res) => {
    const { nombre, dni, telefono, email, direccion, id_membresia } = req.body;

    if (!nombre || !dni || !telefono || !email || !direccion || !id_membresia) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Validar que la membresía exista antes de insertar
        const validarMembresia = 'SELECT id FROM membresias WHERE id = ?';
        const result = await queryDatabase(validarMembresia, [id_membresia]);

        if (result.length === 0) {
            return res.status(400).json({ message: 'La membresía proporcionada no existe' });
        }

        // Insertar cliente
        const sql = `
            INSERT INTO clientes (nombre, dni, telefono, email, direccion, id_membresia) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const insertResult = await queryDatabase(sql, [nombre, dni, telefono, email, direccion, id_membresia]);

        res.status(201).json({ id: insertResult.insertId, ...req.body });
    } catch (err) {
        console.error('Error al crear cliente:', err);
        res.status(500).json({ message: 'Hubo un problema al crear el cliente', error: err.message });
    }
};

exports.actualizarCliente = async (req, res) => {
    const { id } = req.params;  // Obtenemos el ID del cliente desde la URL
    const { nombre, dni, telefono, email, direccion, id_membresia, id_clase } = req.body;

    // Verificamos que los campos obligatorios estén presentes
    if (!nombre || !dni || !telefono || !email || !direccion) {
        return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados' });
    }

    try {
        // Comprobar si el cliente existe
        const clienteExistente = await queryDatabase('SELECT * FROM clientes WHERE id = ?', [id]);

        if (clienteExistente.length === 0) {
            return res.status(404).json({ message: `Cliente con ID ${id} no encontrado.` });
        }

        // Si se proporciona `id_membresia`, validamos que sea válida
        if (id_membresia !== undefined && id_membresia !== null) {
            const resultMembresia = await queryDatabase('SELECT id FROM membresias WHERE id = ?', [id_membresia]);
            if (resultMembresia.length === 0) {
                return res.status(400).json({ message: 'La membresía proporcionada no existe' });
            }
        }

        // Si se proporciona `id_clase`, validamos que sea válida
        let validIdClase = id_clase;
        if (id_clase === "") {
            validIdClase = null;  // Si id_clase está vacío, lo dejamos como null
        } else if (id_clase !== undefined && id_clase !== null) {
            const resultClase = await queryDatabase('SELECT id FROM clases WHERE id = ?', [id_clase]);
            if (resultClase.length === 0) {
                return res.status(400).json({ message: 'La clase proporcionada no existe' });
            }
        }

        // Construir la consulta SQL para actualizar
        const sql = `
            UPDATE clientes
            SET 
                nombre = ?, 
                dni = ?, 
                telefono = ?, 
                email = ?, 
                direccion = ?, 
                id_membresia = ?, 
                id_clase = ?
            WHERE id = ?
        `;

        // Ejecutar la consulta para actualizar el cliente
        const params = [
            nombre, 
            dni, 
            telefono, 
            email, 
            direccion, 
            id_membresia !== undefined && id_membresia !== null ? id_membresia : clienteExistente[0].id_membresia, 
            validIdClase,  // Usar el valor corregido para id_clase
            id
        ];

        const result = await queryDatabase(sql, params);

        // Verificar si la actualización fue exitosa
        if (result.affectedRows > 0) {
            // Obtener el tipo de membresía actualizado
            const membresia = await queryDatabase('SELECT tipo FROM membresias WHERE id = ?', [id_membresia || clienteExistente[0].id_membresia]);
            const tipoMembresia = membresia.length > 0 ? membresia[0].tipo : 'No asignada';

            // Devolver los datos del cliente actualizado junto con el tipo de membresía
            res.json({
                id, 
                nombre, 
                dni, 
                telefono, 
                email, 
                direccion, 
                id_membresia: id_membresia || clienteExistente[0].id_membresia, 
                tipo_membresia: tipoMembresia,  // Devolver el tipo de membresía
                id_clase: validIdClase || clienteExistente[0].id_clase
            });
        } else {
            res.status(404).json({ message: `Cliente con ID ${id} no encontrado.` });
        }
    } catch (err) {
        console.error('Error al actualizar cliente:', err);
        res.status(500).json({ message: 'Hubo un problema al actualizar el cliente', error: err.message });
    }
};


// Eliminar un cliente
exports.eliminarCliente = (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM clientes WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar cliente:', err);
            return res.status(500).json({ message: 'Hubo un problema al eliminar el cliente', error: err.message });
        }

        // Verifica si el cliente fue eliminado
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json({ message: 'Cliente eliminado' });
    });
};

// Consultar fecha de expiración de membresía por DNI
exports.calcularFechaExpiracion = async (req, res) => {
    const { dni } = req.params; // Obtener el DNI desde los parámetros de la URL

    try {
        // Consulta para obtener la fecha de registro y el tipo de membresía del cliente
        const sql = `
            SELECT c.fecha_registro, m.tipo 
            FROM clientes c 
            JOIN membresias m ON c.id_membresia = m.id 
            WHERE c.dni = ?
        `;
        const result = await queryDatabase(sql, [dni]);

        // Validar si se encontró un cliente con el DNI proporcionado
        if (result.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        const { fecha_registro, tipo } = result[0];

        // Calcular la duración de la membresía en meses
        const duracionMeses = tipo === 'Mensual' ? 1 : tipo === 'Semanal' ? 0.25 : tipo === 'Clase' ? 0 : 0;

        // Calcular la fecha de expiración
        const fechaExpiracion = new Date(fecha_registro);
        fechaExpiracion.setMonth(fechaExpiracion.getMonth() + duracionMeses);

        res.json({
            fecha_registro,
            fecha_expiracion: fechaExpiracion.toISOString().split('T')[0], // Formato YYYY-MM-DD
        });
    } catch (err) {
        console.error('Error al calcular la fecha de expiración:', err);
        res.status(500).json({ message: 'Hubo un problema al calcular la fecha de expiración', error: err.message });
    }
};
