import pool from '../config/database.js';
import wompiService from '../services/wompi.service.js';

// Crear intención de pago (checkout)
export const createPaymentIntent = async (req, res) => {
  try {
    const { tienda_id, usuario_id, email } = req.user;
    const { plan_id, periodo } = req.body;

    // Validar plan
    const [planInfo] = await pool.execute(
      'SELECT * FROM limites_planes WHERE plan = ?',
      [plan_id]
    );

    if (planInfo.length === 0) {
      return res.status(404).json({ 
        error: 'Plan no encontrado',
        message: 'El plan seleccionado no existe' 
      });
    }

    const plan = planInfo[0];
    const precio = periodo === 'anual' ? plan.precio_anual : plan.precio_mensual;
    const amountInCents = Math.round(precio * 100); // Convertir a centavos

    // Generar referencia única
    const reference = `SUB-${tienda_id}-${Date.now()}`;

    // Generar firma de integridad
    const signature = wompiService.generateIntegritySignature(
      reference,
      amountInCents,
      'COP'
    );

    // Guardar intención de pago en BD
    await pool.execute(
      `INSERT INTO pagos 
       (tienda_id, monto, moneda, plan_pagado, metodo_pago, estado, referencia_pago, datos_adicionales) 
       VALUES (?, ?, 'COP', ?, 'wompi', 'pendiente', ?, ?)`,
      [
        tienda_id,
        precio,
        plan_id,
        reference,
        JSON.stringify({ periodo, signature })
      ]
    );

    res.json({
      publicKey: process.env.WOMPI_PUBLIC_KEY,
      reference,
      amountInCents,
      currency: 'COP',
      signature,
      customerEmail: email,
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`
    });

  } catch (error) {
    console.error('Error al crear intención de pago:', error);
    res.status(500).json({ 
      error: 'Error en el servidor',
      message: 'No se pudo crear la intención de pago' 
    });
  }
};

// Webhook de Wompi para confirmación de pagos
export const wompiWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-event-signature'];
    const payload = req.body;

    // Verificar firma del webhook
    if (!wompiService.verifyWebhookSignature(payload, signature)) {
      console.error('Firma de webhook inválida');
      return res.status(401).json({ error: 'Firma inválida' });
    }

    const { event, data } = payload;

    // Solo procesar eventos de transacciones aprobadas
    if (event === 'transaction.updated' && data.status === 'APPROVED') {
      const { reference, id: transactionId, amount_in_cents, customer_email } = data.transaction;

      // Buscar el pago en BD
      const [pagos] = await pool.execute(
        'SELECT * FROM pagos WHERE referencia_pago = ? AND estado = "pendiente"',
        [reference]
      );

      if (pagos.length === 0) {
        console.error('Pago no encontrado:', reference);
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      const pago = pagos[0];
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        // Actualizar estado del pago
        await connection.execute(
          `UPDATE pagos 
           SET estado = 'completado', 
               datos_adicionales = JSON_SET(datos_adicionales, '$.transactionId', ?) 
           WHERE id = ?`,
          [transactionId, pago.id]
        );

        // Cancelar suscripciones activas anteriores
        await connection.execute(
          `UPDATE suscripciones 
           SET estado = 'cancelada', fecha_fin = NOW() 
           WHERE tienda_id = ? AND estado = 'activa'`,
          [pago.tienda_id]
        );

        // Obtener datos adicionales del pago
        const datosAdicionales = JSON.parse(pago.datos_adicionales);
        const periodo = datosAdicionales.periodo || 'mensual';

        // Calcular fecha de próximo pago
        const fechaProximoPago = periodo === 'anual' 
          ? 'DATE_ADD(NOW(), INTERVAL 1 YEAR)'
          : 'DATE_ADD(NOW(), INTERVAL 1 MONTH)';

        // Crear nueva suscripción activa
        const [suscripcionResult] = await connection.execute(
          `INSERT INTO suscripciones 
           (tienda_id, plan_id, estado, fecha_inicio, fecha_proximo_pago, monto, periodo, metodo_pago) 
           VALUES (?, ?, 'activa', NOW(), ${fechaProximoPago}, ?, ?, 'wompi')`,
          [pago.tienda_id, pago.plan_pagado, pago.monto, periodo]
        );

        // Actualizar plan en la tabla tiendas
        await connection.execute(
          'UPDATE tiendas SET plan = ?, fecha_ultimo_pago = NOW() WHERE id = ?',
          [pago.plan_pagado, pago.tienda_id]
        );

        // Actualizar el pago con el ID de suscripción
        await connection.execute(
          'UPDATE pagos SET suscripcion_id = ? WHERE id = ?',
          [suscripcionResult.insertId, pago.id]
        );

        await connection.commit();

        console.log(`✅ Pago confirmado - Referencia: ${reference}, Tienda: ${pago.tienda_id}, Plan: ${pago.plan_pagado}`);

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error en webhook de Wompi:', error);
    res.status(500).json({ error: 'Error al procesar webhook' });
  }
};

// Consultar estado de transacción
export const checkTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { tienda_id } = req.user;

    // Verificar que la transacción pertenezca a la tienda
    const [pagos] = await pool.execute(
      `SELECT * FROM pagos 
       WHERE tienda_id = ? 
       AND JSON_EXTRACT(datos_adicionales, '$.transactionId') = ?`,
      [tienda_id, transactionId]
    );

    if (pagos.length === 0) {
      return res.status(404).json({ 
        error: 'Transacción no encontrada',
        message: 'La transacción no existe o no pertenece a esta tienda' 
      });
    }

    // Consultar estado en Wompi
    const transaction = await wompiService.getTransactionStatus(transactionId);

    res.json({
      transaction,
      payment: pagos[0]
    });

  } catch (error) {
    console.error('Error al consultar transacción:', error);
    res.status(500).json({ 
      error: 'Error en el servidor',
      message: 'No se pudo consultar el estado de la transacción' 
    });
  }
};

export default {
  createPaymentIntent,
  wompiWebhook,
  checkTransactionStatus
};
