const pool = require('../config/database');

// Obtener todas las facturas de una tienda
exports.getInvoices = async (req, res) => {
  try {
    const { tiendaId } = req.user;

    const [invoices] = await pool.query(
      `SELECT f.*, 
              u.nombre as vendedor_nombre,
              COUNT(fi.id) as total_items,
              SUM(fi.cantidad) as total_productos
       FROM facturas f
       LEFT JOIN usuarios u ON f.usuario_id = u.id
       LEFT JOIN factura_items fi ON f.id = fi.factura_id
       WHERE f.tienda_id = ?
       GROUP BY f.id
       ORDER BY f.fecha_creacion DESC`,
      [tiendaId]
    );

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las facturas',
      error: error.message
    });
  }
};

// Obtener una factura específica con sus items
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { tiendaId } = req.user;

    // Obtener datos de la factura
    const [invoices] = await pool.query(
      `SELECT f.*, 
              u.nombre as vendedor_nombre,
              t.nombre as tienda_nombre
       FROM facturas f
       LEFT JOIN usuarios u ON f.usuario_id = u.id
       LEFT JOIN tiendas t ON f.tienda_id = t.id
       WHERE f.id = ? AND f.tienda_id = ?`,
      [id, tiendaId]
    );

    if (invoices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    // Obtener items de la factura
    const [items] = await pool.query(
      `SELECT fi.*,
              p.nombre as producto_nombre,
              p.codigo_barras,
              pt.talla,
              pt.color
       FROM factura_items fi
       LEFT JOIN productos p ON fi.producto_id = p.id
       LEFT JOIN producto_tallas pt ON fi.producto_talla_id = pt.id
       WHERE fi.factura_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...invoices[0],
        items
      }
    });
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la factura',
      error: error.message
    });
  }
};

// Crear una nueva factura
exports.createInvoice = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { tiendaId, userId } = req.user;
    const { 
      cliente_nombre,
      cliente_documento,
      cliente_telefono,
      cliente_direccion,
      metodo_pago,
      items // Array de { producto_id, producto_talla_id, cantidad, precio_unitario }
    } = req.body;

    // Validaciones
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto en la factura'
      });
    }

    await connection.beginTransaction();

    // Calcular totales
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.cantidad * item.precio_unitario;
    }
    const impuestos = subtotal * 0.19; // IVA 19%
    const total = subtotal + impuestos;

    // Crear la factura
    const [facturaResult] = await connection.query(
      `INSERT INTO facturas (
        tienda_id, 
        usuario_id, 
        cliente_nombre, 
        cliente_documento, 
        cliente_telefono, 
        cliente_direccion,
        subtotal,
        impuestos,
        total,
        metodo_pago
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tiendaId,
        userId,
        cliente_nombre,
        cliente_documento || null,
        cliente_telefono || null,
        cliente_direccion || null,
        subtotal,
        impuestos,
        total,
        metodo_pago
      ]
    );

    const facturaId = facturaResult.insertId;

    // Insertar items y actualizar inventario
    for (const item of items) {
      // Insertar item
      await connection.query(
        `INSERT INTO factura_items (
          factura_id,
          producto_id,
          producto_talla_id,
          cantidad,
          precio_unitario,
          subtotal
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          facturaId,
          item.producto_id,
          item.producto_talla_id,
          item.cantidad,
          item.precio_unitario,
          item.cantidad * item.precio_unitario
        ]
      );

      // Actualizar stock
      await connection.query(
        `UPDATE producto_tallas 
         SET stock = stock - ?
         WHERE id = ? AND producto_id = ?`,
        [item.cantidad, item.producto_talla_id, item.producto_id]
      );

      // Verificar que el stock no quedó negativo
      const [stockCheck] = await connection.query(
        `SELECT stock FROM producto_tallas WHERE id = ?`,
        [item.producto_talla_id]
      );

      if (stockCheck[0].stock < 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente para uno o más productos'
        });
      }
    }

    await connection.commit();

    // Obtener la factura completa creada
    const [nuevaFactura] = await connection.query(
      `SELECT f.*, 
              u.nombre as vendedor_nombre
       FROM facturas f
       LEFT JOIN usuarios u ON f.usuario_id = u.id
       WHERE f.id = ?`,
      [facturaId]
    );

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: nuevaFactura[0]
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la factura',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Cancelar una factura (solo mismo día)
exports.cancelInvoice = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { tiendaId, role } = req.user;

    // Verificar que la factura existe y pertenece a la tienda
    const [facturas] = await connection.query(
      `SELECT * FROM facturas WHERE id = ? AND tienda_id = ?`,
      [id, tiendaId]
    );

    if (facturas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    const factura = facturas[0];

    // Verificar que ya no esté cancelada
    if (factura.estado === 'cancelada') {
      return res.status(400).json({
        success: false,
        message: 'La factura ya está cancelada'
      });
    }

    // Verificar que sea del mismo día (solo owner y admin pueden cancelar facturas antiguas)
    const fechaFactura = new Date(factura.fecha_creacion);
    const hoy = new Date();
    const esMismoDia = fechaFactura.toDateString() === hoy.toDateString();

    if (!esMismoDia && !['owner', 'admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Solo se pueden cancelar facturas del mismo día'
      });
    }

    await connection.beginTransaction();

    // Obtener items de la factura para restaurar stock
    const [items] = await connection.query(
      `SELECT * FROM factura_items WHERE factura_id = ?`,
      [id]
    );

    // Restaurar stock
    for (const item of items) {
      await connection.query(
        `UPDATE producto_tallas 
         SET stock = stock + ?
         WHERE id = ?`,
        [item.cantidad, item.producto_talla_id]
      );
    }

    // Marcar factura como cancelada
    await connection.query(
      `UPDATE facturas SET estado = 'cancelada' WHERE id = ?`,
      [id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Factura cancelada exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al cancelar factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la factura',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Obtener estadísticas de ventas
exports.getSalesStats = async (req, res) => {
  try {
    const { tiendaId } = req.user;
    const { fecha_inicio, fecha_fin } = req.query;

    let whereClause = 'WHERE f.tienda_id = ? AND f.estado = "completada"';
    const params = [tiendaId];

    if (fecha_inicio && fecha_fin) {
      whereClause += ' AND DATE(f.fecha_creacion) BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    // Ventas totales
    const [totalVentas] = await pool.query(
      `SELECT 
        COUNT(*) as total_facturas,
        SUM(total) as ventas_totales,
        AVG(total) as ticket_promedio
       FROM facturas f
       ${whereClause}`,
      params
    );

    // Productos más vendidos
    const [topProductos] = await pool.query(
      `SELECT 
        p.nombre,
        p.codigo_barras,
        SUM(fi.cantidad) as cantidad_vendida,
        SUM(fi.subtotal) as total_ventas
       FROM factura_items fi
       JOIN facturas f ON fi.factura_id = f.id
       JOIN productos p ON fi.producto_id = p.id
       ${whereClause.replace('f.estado', 'f.estado')}
       GROUP BY p.id
       ORDER BY cantidad_vendida DESC
       LIMIT 10`,
      params
    );

    // Ventas por día
    const [ventasPorDia] = await pool.query(
      `SELECT 
        DATE(fecha_creacion) as fecha,
        COUNT(*) as facturas,
        SUM(total) as ventas
       FROM facturas f
       ${whereClause}
       GROUP BY DATE(fecha_creacion)
       ORDER BY fecha DESC
       LIMIT 30`,
      params
    );

    // Ventas por método de pago
    const [ventasPorMetodo] = await pool.query(
      `SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        SUM(total) as total
       FROM facturas f
       ${whereClause}
       GROUP BY metodo_pago`,
      params
    );

    res.json({
      success: true,
      data: {
        resumen: totalVentas[0],
        productos_top: topProductos,
        ventas_por_dia: ventasPorDia,
        ventas_por_metodo: ventasPorMetodo
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};
