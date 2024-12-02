const express = require('express');
const router = express.Router();
const clasesController = require('../controllers/clases');

router.get('/', clasesController.obtenerClases);
router.post('/', clasesController.crearClase);
router.put('/:id', clasesController.actualizarClase);
router.delete('/:id', clasesController.eliminarClase);

module.exports = router;
