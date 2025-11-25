import axios from 'axios';
import crypto from 'crypto';

const WOMPI_API_URL = process.env.WOMPI_API_URL || 'https://production.wompi.co/v1';
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET;

// Crear cliente de Wompi
const wompiClient = axios.create({
  baseURL: WOMPI_API_URL,
  headers: {
    'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Generar firma de integridad para pagos
export const generateIntegritySignature = (reference, amountInCents, currency) => {
  const data = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Crear transacción de pago
export const createPaymentTransaction = async (paymentData) => {
  try {
    const {
      amount, // en centavos
      currency = 'COP',
      customerEmail,
      reference,
      description,
      redirectUrl
    } = paymentData;

    const signature = generateIntegritySignature(reference, amount, currency);

    const transactionData = {
      acceptance_token: null, // Se obtiene del widget
      amount_in_cents: amount,
      currency: currency,
      customer_email: customerEmail,
      payment_method: {
        type: 'CARD',
        installments: 1
      },
      reference: reference,
      signature: signature,
      redirect_url: redirectUrl
    };

    const response = await wompiClient.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error al crear transacción Wompi:', error.response?.data || error.message);
    throw error;
  }
};

// Consultar estado de transacción
export const getTransactionStatus = async (transactionId) => {
  try {
    const response = await wompiClient.get(`/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error al consultar transacción:', error.response?.data || error.message);
    throw error;
  }
};

// Obtener métodos de pago disponibles
export const getPaymentMethods = async () => {
  try {
    const response = await wompiClient.get('/payment_methods');
    return response.data;
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error.response?.data || error.message);
    throw error;
  }
};

// Crear fuente de pago (tarjeta tokenizada)
export const createPaymentSource = async (sourceData) => {
  try {
    const response = await wompiClient.post('/payment_sources', sourceData);
    return response.data;
  } catch (error) {
    console.error('Error al crear fuente de pago:', error.response?.data || error.message);
    throw error;
  }
};

// Verificar firma de webhook
export const verifyWebhookSignature = (payload, signature) => {
  const calculatedSignature = crypto
    .createHmac('sha256', process.env.WOMPI_EVENTS_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return calculatedSignature === signature;
};

export default {
  createPaymentTransaction,
  getTransactionStatus,
  getPaymentMethods,
  createPaymentSource,
  generateIntegritySignature,
  verifyWebhookSignature
};
