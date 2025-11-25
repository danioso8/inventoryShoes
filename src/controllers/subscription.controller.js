import pool from '../config/database.js';

// Obtener planes disponibles
export const getPlanes = async (req, res) => {
  try {
    const [planes] = await pool.execute(
      'SELECT * FROM limites_planes ORDER BY precio_mensual ASC'
    );

    res.json({ planes });
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({ 
      error: 'Error en el servidor',
      message: 'No se pudieron obtener los planes' 
    });
  }
};

// Obtener suscripción actual de la tienda
export const getSuscripcionActual = async (req, res) => {
  try {
    const { tienda_id } = req.user;

    const [suscripciones] = await pool.execute(
      `SELECT s.*, l.* 
       FROM suscripciones s
       INNER JOIN limites_planes l ON s.plan_id = l.plan
       WHERE s.tienda_id = ? AND s.estado = 'activa'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [tienda_id]
    );

    if (suscripciones.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontró suscripción activa',
        message: 'La tienda no tiene una suscripción activa' 
      });
    }

    res.json({ suscripcion: suscripciones[0] });
  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    res.status(500).json({ 
      error: 'Error en el servidor',
      message: 'No se pudo obtener la suscripción' 
    });
  }
};

// Cambiar plan (upgrade/downgrade)
export const cambiarPlan = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { tienda_id, usuario_id } = req.user;
    const { nuevo_plan, periodo, metodo_pago } = req.body;

    // Validar plan
    const planesValidos = ['free', 'basic', 'premium', 'enterprise'];
    if (!planesValidos.includes(nuevo_plan)) {
      return res.status(400).json({ 
        error: 'Plan inválido',
        message: 'El plan seleccionado no es válido' 
      });
    }

    await connection.beginTransaction();

    // Obtener información del nuevo plan
    const [planInfo] = await connection.execute(
      'SELECT * FROM limites_planes WHERE plan = ?',
      [nuevo_plan]
    );

    if (planInfo.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'Plan no encontrado',
        message: 'No se encontró información del plan' 
      });
    }

    const plan = planInfo[0];
    const monto = periodo === 'anual' ? plan.precio_anual : plan.precio_mensual;

    // Cancelar suscripción actual
    await connection.execute(
      `UPDATE suscripciones 
       SET estado = 'cancelada', fecha_fin = NOW() 
       WHERE tienda_id = ? AND estado = 'activa'`,
      [tienda_id]
    );

    // Crear nueva suscripción
    const fechaProximoPago = periodo === 'anual' 
      ? 'DATE_ADD(NOW(), INTERVAL 1 YEAR)'
      : 'DATE_ADD(NOW(), INTERVAL 1 MONTH)';

    const [suscripcionResult] = await connection.execute(
      `INSERT INTO suscripciones 
       (tienda_id, plan_id, estado, fecha_inicio, fecha_proximo_pago, monto, periodo, metodo_pago) 
       VALUES (?, ?, 'activa', NOW(), ${fechaProximoPago}, ?, ?, ?)`,
      [tienda_id, nuevo_plan, monto, periodo, metodo_pago]
    );

    const suscripcion_id = suscripcionResult.insertId;

    // Si no es plan gratuito, registrar pago pendiente
    if (nuevo_plan !== 'free') {
      await connection.execute(
        `INSERT INTO pagos 
         (tienda_id, suscripcion_id, monto, plan_pagado, metodo_pago, estado, referencia_pago) 
         VALUES (?, ?, ?, ?, ?, 'pendiente', ?)`,
        [
          tienda_id, 
          suscripcion_id, 
          monto, 
          nuevo_plan, 
          metodo_pago,
          `PAY-${Date.now()}-${tienda_id}`
        ]
      );
    }

    // Actualizar plan en la tabla tiendas
    await connection.execute(
      'UPDATE tiendas SET plan = ? WHERE id = ?',
      [nuevo_plan, tienda_id]
    );

    await connection.commit();

    res.json({
      message: 'Plan actualizado exitosamente',
      suscripcion: {
        id: suscripcion_id,
        plan: nuevo_plan,
        monto,
        periodo,
        estado: 'activa'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al cambiar plan:', error);
    res.status(500).json({ 
      error: 'Error en el servidor',
      message: 'No se pudo cambiar el plan' 
    });
  } finally {
    connection.release();
  }
};

// Obtener historial de pagos
export const getHistorialPagos = async (req, res) => {
  try {
    const { tienda_id } = req.user;

    const [pagos] = await pool.execute(
      `SELECT * FROM pagos 
       WHERE tienda_id = ? 
       ORDER BY fecha_pago DESC 
       LIMIT 50`,
      [tienda_id]
    );

    res.json({ pagos });
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({ 
      error: 'Error en el servidor',
      message: 'No se pudo obtener el historial de pagos' 
    });
  }
};

// Cancelar suscripción
export const cancelarSuscripcion = async (req, res) => {
  try {
    const { tienda_id } = req.user;

    await pool.execute(
      `UPDATE suscripciones 
       SET estado = 'cancelada', fecha_fin = NOW() 
       WHERE tienda_id = ? AND estado = 'activa'`,
      [tienda_id]
    );

    // Cambiar a plan free
    await pool.execute(
      'UPDATE tiendas SET plan = ? WHERE id = ?',
      ['free', tienda_id]
    );

    res.json({ 
      message: 'Suscripción cancelada exitosamente',
      nuevo_plan: 'free'
    });
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    res.status(500).json({ 
      error: 'Error en el servidor',
      message: 'No se pudo cancelar la suscripción' 
    });
  }
};
