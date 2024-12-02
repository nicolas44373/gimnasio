const express = require('express');
const router = express.Router();
const entrenadoresController = require('../controllers/entrenadores');

router.get('/', entrenadoresController.obtenerEntrenadores);
router.post('/', entrenadoresController.crearEntrenador);
router.put('/:id', entrenadoresController.actualizarEntrenador);
router.delete('/:id', entrenadoresController.eliminarEntrenador);

module.exports = router;
