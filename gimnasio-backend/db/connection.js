const mysql = require('mysql2');

// Crear un pool de conexiones a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,  // Espera conexiones si el pool está lleno
    connectionLimit: 10,       // Número máximo de conexiones simultáneas
    queueLimit: 0              // Sin límite de cola
});

// Promesa para usar las consultas con async/await
const promisePool = pool.promise();

module.exports = { promisePool };
