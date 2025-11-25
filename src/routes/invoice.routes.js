const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todas las facturas
router.get('/', invoiceController.getInvoices);

// Obtener estadísticas de ventas
router.get('/stats', invoiceController.getSalesStats);

// Obtener una factura específica
router.get('/:id', invoiceController.getInvoiceById);

// Crear nueva factura
router.post('/', invoiceController.createInvoice);

// Cancelar factura
router.patch('/:id/cancel', invoiceController.cancelInvoice);

module.exports = router;
