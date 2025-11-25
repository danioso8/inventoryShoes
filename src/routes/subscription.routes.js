import express from 'express';
import { 
  getPlanes, 
  getSuscripcionActual, 
  cambiarPlan, 
  getHistorialPagos,
  cancelarSuscripcion 
} from '../controllers/subscription.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.get('/planes', getPlanes);

// Rutas protegidas (requieren autenticación)
router.get('/actual', authMiddleware, getSuscripcionActual);
router.post('/cambiar-plan', authMiddleware, cambiarPlan);
router.get('/historial-pagos', authMiddleware, getHistorialPagos);
router.post('/cancelar', authMiddleware, cancelarSuscripcion);

export default router;
