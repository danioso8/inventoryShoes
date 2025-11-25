import express from 'express';
import { 
  createPaymentIntent, 
  wompiWebhook, 
  checkTransactionStatus 
} from '../controllers/payment.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.post('/create-intent', authMiddleware, createPaymentIntent);
router.get('/transaction/:transactionId', authMiddleware, checkTransactionStatus);

// Webhook público (Wompi lo llama sin autenticación)
router.post('/webhook/wompi', wompiWebhook);

export default router;
