const { promisePool } = require('../db/connection');  // Usa promisePool

// Función auxiliar para manejar las consultas de la base de datos
const queryDB = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        promisePool.query(sql, params)  // Usa promisePool aquí
            .then(([results]) => resolve(results))  // Resolución de la promesa
            .catch((err) => {
                console.error('Error en la consulta a la base de datos:', err);
                reject(err);
            });
    });
};

// Obtener todas las clases
const obtenerClases = async (req, res) => {
    try {
        const clases = await queryDB('SELECT * FROM clases');
        res.json(clases);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clases', error });
    }
};

// Crear una nueva clase
const crearClase = async (req, res) => {
    const { nombre, horario, id_entrenador } = req.body;
    try {
        const result = await queryDB('INSERT INTO clases (nombre, horario, id_entrenador) VALUES (?, ?, ?)', [
            nombre,
            horario,
            id_entrenador,
        ]);
        res.json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear clase', error });
    }
};

// Actualizar clase en la base de datos
const actualizarClase = async (req, res) => {
    const { id } = req.params;  // Obtenemos el ID de la clase desde los parámetros de la URL
    const { nombre, horario, id_entrenador } = req.body;  // Obtenemos los nuevos datos de la clase

    try {
        // Actualiza la clase en la base de datos
        const result = await queryDB(
            'UPDATE clases SET nombre = ?, horario = ?, id_entrenador = ? WHERE id = ?',
            [nombre, horario, id_entrenador, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Clase no encontrada' });
        }

        // Recuperar la clase actualizada
        const claseActualizada = await queryDB('SELECT * FROM clases WHERE id = ?', [id]);
        res.json(claseActualizada[0]); // Devolver la clase actualizada

    } catch (error) {
        console.error('Error al actualizar la clase:', error);
        res.status(500).json({ message: 'Error al actualizar la clase', error });
    }
};

// Eliminar clase
const eliminarClase = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await queryDB('DELETE FROM clases WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.json({ message: `Clase con ID ${id} eliminada correctamente.` });
        } else {
            res.status(404).json({ message: `Clase con ID ${id} no encontrada.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar clase', error });
    }
};

module.exports = {
    obtenerClases,
    crearClase,
    actualizarClase,
    eliminarClase,
};
