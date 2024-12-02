const express = require('express');
const router = express.Router();
const membresiasController = require('../controllers/membresias');

router.get('/', membresiasController.obtenerMembresias);
router.post('/', membresiasController.crearMembresia);
router.put('/:id', membresiasController.actualizarMembresia);
router.delete('/:id', membresiasController.eliminarMembresia);

module.exports = router;
