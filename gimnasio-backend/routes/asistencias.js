const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistencias');

// Ruta para buscar asistencia por DNI
router.get('/buscar', asistenciaController.buscarAsistencia);

// Nueva ruta para registrar asistencia
router.post('/registrar', asistenciaController.registrarAsistencia);

module.exports = router;
