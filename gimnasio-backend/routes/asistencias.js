// Suponiendo que ya tienes configurada la ruta en tu backend
const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistencias');

// Ruta para buscar asistencia por DNI
router.get('/buscar', asistenciaController.buscarAsistencia);

module.exports = router;
