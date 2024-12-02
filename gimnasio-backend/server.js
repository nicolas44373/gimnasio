const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();
const routesAsistencias = require('./routes/asistencias');
const clasesRoutes = require('./routes/clases');
// Crear una instancia de la aplicación Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a la base de datos usando promesas
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'gimnasio',
});

// Verificar la conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1); // Terminar el proceso si no se puede conectar
    }
    console.log('Conexión exitosa a la base de datos');
});

// Función auxiliar para manejar las consultas de la base de datos usando promesas
const queryDB = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.promise().query(sql, params)  // Usamos .promise() para permitir uso de promesas
            .then(([results]) => resolve(results)) // Resolución de la promesa
            .catch((err) => {
                console.error('Error en la consulta a la base de datos:', err);
                reject(err);
            });
    });
};


// ----------------------------
// RUTAS PARA CLIENTES
// ----------------------------
app.get('/clientes', async (req, res) => {
    try {
        const results = await queryDB('SELECT * FROM clientes');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener clientes', error: err });
    }
});

app.post('/clientes', async (req, res) => {
    const { nombre, dni, telefono, email, direccion, id_membresia } = req.body;
    const sql = 'INSERT INTO clientes (nombre, dni, telefono, email, direccion, id_membresia) VALUES (?, ?, ?, ?, ?, ?)';
    try {
        const result = await queryDB(sql, [nombre, dni, telefono, email, direccion, id_membresia]);
        res.json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear cliente', error: err });
    }
});

app.put('/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, direccion, id_membresia, id_clase } = req.body;

    // Validar que los campos esenciales estén presentes
    if (!nombre || !email || !telefono || !direccion || !id_membresia) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Si id_clase no se pasa o es una cadena vacía, establecerlo como null
    const clase = (id_clase === null || id_clase === '') ? null : id_clase;

    const sql = 'UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ?, id_membresia = ?, id_clase = ? WHERE id = ?';

    try {
        const result = await queryDB(sql, [nombre, email, telefono, direccion, id_membresia, clase, id]);

        if (result.affectedRows > 0) {
            // Buscar el cliente actualizado y devolverlo
            const clienteActualizado = { id, nombre, email, telefono, direccion, id_membresia, id_clase: clase };
            res.json({ success: true, data: clienteActualizado });
        } else {
            res.status(404).json({ message: `Cliente con ID ${id} no encontrado.` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al actualizar cliente', error: err.message });
    }
});

app.delete('/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM clientes WHERE id = ?';
    try {
        const result = await queryDB(sql, [id]);
        if (result.affectedRows > 0) {
            res.json({ message: `Cliente con ID ${id} eliminado correctamente.` });
        } else {
            res.status(404).json({ message: `Cliente con ID ${id} no encontrado.` });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar cliente', error: err });
    }
});

// ----------------------------
// RUTAS PARA MEMBRESÍAS
// ----------------------------
// Obtener todas las membresías
app.get('/membresias', async (req, res) => {
    try {
        const results = await queryDB('SELECT * FROM membresias');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener membresías', error: err });
    }
});

// Crear una membresía
app.post('/membresias', async (req, res) => {
    const { tipo, precio } = req.body;
    const sql = 'INSERT INTO membresias (tipo, precio) VALUES (?, ?)';
    try {
        const result = await queryDB(sql, [tipo, precio]);
        res.json({ id: result.insertId, tipo, precio });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear la membresía', error: err });
    }
});

// Actualizar una membresía
app.put('/membresias/:id', async (req, res) => {
    const { id } = req.params;
    const { tipo, precio } = req.body;
    const sql = 'UPDATE membresias SET tipo = ?, precio = ? WHERE id = ?';
    try {
        const result = await queryDB(sql, [tipo, precio, id]);
        if (result.affectedRows > 0) {
            res.json({ message: `Membresía con ID ${id} actualizada correctamente.` });
        } else {
            res.status(404).json({ message: `Membresía con ID ${id} no encontrada.` });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar la membresía', error: err });
    }
});

// Eliminar una membresía
app.delete('/membresias/:id', async (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM membresias WHERE id = ?';
    try {
        const result = await queryDB(sql, [id]);
        if (result.affectedRows > 0) {
            res.json({ message: `Membresía con ID ${id} eliminada correctamente.` });
        } else {
            res.status(404).json({ message: `Membresía con ID ${id} no encontrada.` });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar la membresía', error: err });
    }
});

// ----------------------------
// RUTAS PARA ENTRENADORES
// ----------------------------
// Obtener todos los entrenadores
app.get('/entrenadores', async (req, res) => {
    try {
        const results = await queryDB('SELECT * FROM entrenadores');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener entrenadores', error: err });
    }
});

// Crear un entrenador
app.post('/entrenadores', async (req, res) => {
    const { nombre, especialidad } = req.body;
    const sql = 'INSERT INTO entrenadores (nombre, especialidad) VALUES (?, ?)';
    try {
        const result = await queryDB(sql, [nombre, especialidad]);
        res.json({ id: result.insertId, nombre, especialidad });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear entrenador', error: err });
    }
});

// Actualizar un entrenador
// Actualizar un entrenador
app.put('/entrenadores/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, especialidad } = req.body;

    if (!nombre || !especialidad) {
        return res.status(400).json({ message: 'Nombre y especialidad son requeridos' });
    }

    const sql = 'UPDATE entrenadores SET nombre = ?, especialidad = ? WHERE id = ?';
  
    try {
        // Actualiza el entrenador en la base de datos
        const result = await queryDB(sql, [nombre, especialidad, id]);

        // Verifica si hubo filas afectadas (es decir, si se encontró el entrenador)
        if (result.affectedRows > 0) {
            // Recupera el entrenador actualizado
            const entrenadorActualizado = await queryDB('SELECT * FROM entrenadores WHERE id = ?', [id]);
            res.json(entrenadorActualizado[0]);  // Devuelve el entrenador actualizado
        } else {
            res.status(404).json({ message: `Entrenador con ID ${id} no encontrado.` });
        }
    } catch (err) {
        console.error('Error al actualizar el entrenador:', err);
        res.status(500).json({ message: 'Error al actualizar entrenador', error: err });
    }
});



// Eliminar un entrenador
app.delete('/entrenadores/:id', async (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM entrenadores WHERE id = ?';
    try {
        const result = await queryDB(sql, [id]);
        if (result.affectedRows > 0) {
            res.json({ message: `Entrenador con ID ${id} eliminado correctamente.` });
        } else {
            res.status(404).json({ message: `Entrenador con ID ${id} no encontrado.` });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar entrenador', error: err });
    }
});

// ----------------------------
// RUTAS PARA CLASES
// ----------------------------
// Obtener todas las clases
app.get('/clases', async (req, res) => {
    try {
        const results = await queryDB('SELECT * FROM clases');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener clases', error: err });
    }
});

// Crear una clase
app.post('/clases', async (req, res) => {
    const { nombre, horario, id_entrenador } = req.body;
    const sql = 'INSERT INTO clases (nombre, horario, id_entrenador) VALUES (?, ?, ?)';
    try {
        const result = await queryDB(sql, [nombre, horario, id_entrenador]);
        res.json({ id: result.insertId, nombre, horario, id_entrenador });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear clase', error: err });
    }
});

// Actualizar una clase
app.put('/api/clases/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, horario, idEntrenador } = req.body;
  
    try {
      // Actualiza la clase en la base de datos (asegurándote de usar el ID correcto)
      const result = await pool.query(
        'UPDATE clases SET nombre = ?, horario = ?, idEntrenador = ? WHERE id = ?',
        [nombre, horario, idEntrenador, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Clase no encontrada' });
      }
  
      // Recuperar la clase actualizada
      const [claseActualizada] = await pool.query('SELECT * FROM clases WHERE id = ?', [id]);
      res.json(claseActualizada[0]); // Devolver la clase actualizada
    } catch (error) {
      console.error('Error al actualizar la clase:', error);
      res.status(500).json({ message: 'Error al actualizar la clase' });
    }
  });
  

// Eliminar una clase
app.delete('/clases/:id', async (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM clases WHERE id = ?';
    try {
        const result = await queryDB(sql, [id]);
        if (result.affectedRows > 0) {
            res.json({ message: `Clase con ID ${id} eliminada correctamente.` });
        } else {
            res.status(404).json({ message: `Clase con ID ${id} no encontrada.` });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar clase', error: err });
    }
});
app.use('/clases', clasesRoutes);

// ----------------------------
// RUTA PARA EXPIRACIÓN DE ASISTENCIAS
// ----------------------------

app.use('/asistencias', routesAsistencias);


// Iniciar el servidor
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Servidor en funcionamiento en el puerto ${port}`);
});
module.exports = {
    queryDB,
    db, // También puedes exportar la conexión directamente si la necesitas en otros lugares
};