const db = require('../db/connection');

// Obtener todas las membresías
exports.obtenerMembresias = (req, res) => {
    db.query('SELECT * FROM membresias', (err, results) => {
        if (err) {
            console.error('Error al obtener membresías:', err);
            return res.status(500).json({ message: 'Error al obtener membresías', error: err });
        }
        res.json(results);
    });
};

// Crear una nueva membresía
exports.crearMembresia = (req, res) => {
    const { tipo, precio } = req.body;

    // Validación de los datos
    if (!tipo || !precio) {
        return res.status(400).json({ message: 'Tipo y precio son requeridos' });
    }

    const sql = 'INSERT INTO membresias (tipo, precio) VALUES (?, ?)';
    db.query(sql, [tipo, precio], (err, result) => {
        if (err) {
            console.error('Error al crear membresía:', err);
            return res.status(500).json({ message: 'Error al crear membresía', error: err });
        }
        res.json({ id: result.insertId, tipo, precio });
    });
};

// Actualizar una membresía existente
exports.actualizarMembresia = (req, res) => {
    const { id } = req.params;
    const { tipo, precio } = req.body;

    // Verificar si la membresía existe
    db.query('SELECT * FROM membresias WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al verificar membresía:', err);
            return res.status(500).json({ message: 'Error al verificar membresía', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Membresía no encontrada' });
        }

        const sql = 'UPDATE membresias SET tipo = ?, precio = ? WHERE id = ?';
        db.query(sql, [tipo, precio, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar membresía:', err);
                return res.status(500).json({ message: 'Error al actualizar membresía', error: err });
            }
            res.json({ message: 'Membresía actualizada' });
        });
    });
};

// Eliminar una membresía
exports.eliminarMembresia = (req, res) => {
    const { id } = req.params;

    // Verificar si la membresía existe
    db.query('SELECT * FROM membresias WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al verificar membresía:', err);
            return res.status(500).json({ message: 'Error al verificar membresía', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Membresía no encontrada' });
        }

        const sql = 'DELETE FROM membresias WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar membresía:', err);
                return res.status(500).json({ message: 'Error al eliminar membresía', error: err });
            }
            res.json({ message: 'Membresía eliminada' });
        });
    });
};
