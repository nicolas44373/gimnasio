const db = require('../db/connection');

// Obtener todos los entrenadores
exports.obtenerEntrenadores = (req, res) => {
    db.query('SELECT * FROM entrenadores', (err, results) => {
        if (err) {
            console.error('Error al obtener entrenadores:', err);
            return res.status(500).json({ message: 'Error al obtener entrenadores', error: err });
        }
        res.json(results);  // Retorna los resultados obtenidos
    });
};

// Crear un nuevo entrenador
exports.crearEntrenador = (req, res) => {
    const { nombre, especialidad } = req.body;

    // Validación de los datos
    if (!nombre || !especialidad) {
        return res.status(400).json({ message: 'Nombre y especialidad son requeridos' });
    }

    const sql = 'INSERT INTO entrenadores (nombre, especialidad) VALUES (?, ?)';
    db.query(sql, [nombre, especialidad], (err, result) => {
        if (err) {
            console.error('Error al crear entrenador:', err);
            return res.status(500).json({ message: 'Error al crear entrenador', error: err });
        }
        res.status(201).json({ id: result.insertId, nombre, especialidad });  // Devuelve los datos del nuevo entrenador con el ID
    });
};


// Actualizar un entrenador existente
// Actualizar un entrenador existente
exports.actualizarEntrenador = (req, res) => {
    const { id } = req.params;
    const { nombre, especialidad } = req.body;

    // Verificar si el entrenador existe
    db.query('SELECT * FROM entrenadores WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al verificar entrenador:', err);
            return res.status(500).json({ message: 'Error al verificar entrenador', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Entrenador no encontrado' });
        }

        const sql = 'UPDATE entrenadores SET nombre = ?, especialidad = ? WHERE id = ?';
        db.query(sql, [nombre, especialidad, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar entrenador:', err);
                return res.status(500).json({ message: 'Error al actualizar entrenador', error: err });
            }

            // Asegúrate de enviar los datos actualizados al frontend
            const updatedEntrenador = { id, nombre, especialidad };
            res.json(updatedEntrenador); // Retorna los datos actualizados
        });
    });
};

// Eliminar un entrenador
exports.eliminarEntrenador = (req, res) => {
    const { id } = req.params;

    // Verificar si el entrenador existe
    db.query('SELECT * FROM entrenadores WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al verificar entrenador:', err);
            return res.status(500).json({ message: 'Error al verificar entrenador', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Entrenador no encontrado' });
        }

        const sql = 'DELETE FROM entrenadores WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar entrenador:', err);
                return res.status(500).json({ message: 'Error al eliminar entrenador', error: err });
            }
            res.json({ message: 'Entrenador eliminado', id });  // Responde con el ID del entrenador eliminado
        });
    });
};

