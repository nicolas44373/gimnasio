const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes');

// Rutas existentes
router.get('/', clientesController.obtenerClientes);
router.post('/', clientesController.crearCliente);
router.put('/:id', clientesController.actualizarCliente);
router.delete('/:id', clientesController.eliminarCliente);

// Nueva ruta para consultar fecha de expiración por DNI
router.get('/expiracion/:dni', clientesController.calcularFechaExpiracion);

module.exports = router;
