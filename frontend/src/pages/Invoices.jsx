import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import invoiceService from '../services/invoiceService';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    loadInvoices();
  }, [navigate]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getAll();
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      alert('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (invoice) => {
    try {
      const response = await invoiceService.getById(invoice.id);
      setSelectedInvoice(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      alert('Error al cargar el detalle de la factura');
    }
  };

  const handleCancelInvoice = async (invoiceId) => {
    if (!window.confirm('¿Está seguro de cancelar esta factura? El stock será restaurado.')) {
      return;
    }

    try {
      const response = await invoiceService.cancel(invoiceId);
      if (response.success) {
        alert('Factura cancelada exitosamente');
        loadInvoices();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error al cancelar factura:', error);
      alert(error.response?.data?.message || 'Error al cancelar la factura');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      completada: { bg: 'success', text: 'Completada' },
      cancelada: { bg: 'danger', text: 'Cancelada' },
      pendiente: { bg: 'warning', text: 'Pendiente' }
    };
    const badge = badges[estado] || badges.pendiente;
    return <span className={`badge bg-${badge.bg}`}>{badge.text}</span>;
  };

  const getMetodoPagoIcon = (metodo) => {
    const icons = {
      efectivo: '💵',
      tarjeta: '💳',
      transferencia: '🏦'
    };
    return icons[metodo] || '💰';
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg shadow-sm mb-4" style={{ 
        background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)'
      }}>
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 fw-bold text-white" style={{ fontSize: '1.3rem' }}>
            📄 Historial de Facturas
          </span>
          <button 
            className="btn btn-sm text-white"
            style={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Volver al Dashboard
          </button>
        </div>
      </nav>

      <div className="container-fluid px-4 py-4">
        {/* Estadísticas rápidas */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">Total Facturas</p>
                    <h3 className="mb-0 fw-bold">{invoices.length}</h3>
                  </div>
                  <div style={{ fontSize: '2rem' }}>📊</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">Completadas</p>
                    <h3 className="mb-0 fw-bold text-success">
                      {invoices.filter(i => i.estado === 'completada').length}
                    </h3>
                  </div>
                  <div style={{ fontSize: '2rem' }}>✅</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">Total Ventas</p>
                    <h3 className="mb-0 fw-bold text-primary">
                      {formatCurrency(invoices.reduce((sum, i) => sum + (i.estado === 'completada' ? parseFloat(i.total) : 0), 0))}
                    </h3>
                  </div>
                  <div style={{ fontSize: '2rem' }}>💰</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">Canceladas</p>
                    <h3 className="mb-0 fw-bold text-danger">
                      {invoices.filter(i => i.estado === 'cancelada').length}
                    </h3>
                  </div>
                  <div style={{ fontSize: '2rem' }}>❌</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de facturas */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <div className="card-header bg-white border-0" style={{ borderRadius: '16px 16px 0 0' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Facturas Registradas</h5>
              <button 
                className="btn btn-sm btn-primary"
                onClick={loadInvoices}
                disabled={loading}
              >
                {loading ? '🔄 Cargando...' : '🔄 Actualizar'}
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: '4rem' }}>📄</div>
                <h5 className="mt-3 text-muted">No hay facturas registradas</h5>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Vendedor</th>
                      <th>Items</th>
                      <th>Método Pago</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="fw-semibold">#{invoice.id}</td>
                        <td>{formatDate(invoice.fecha_creacion)}</td>
                        <td>
                          <div>
                            <div className="fw-semibold">{invoice.cliente_nombre}</div>
                            {invoice.cliente_documento && (
                              <small className="text-muted">{invoice.cliente_documento}</small>
                            )}
                          </div>
                        </td>
                        <td>{invoice.vendedor_nombre}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {invoice.total_items} items ({invoice.total_productos} unidades)
                          </span>
                        </td>
                        <td>
                          {getMetodoPagoIcon(invoice.metodo_pago)} {invoice.metodo_pago}
                        </td>
                        <td className="fw-bold text-primary">{formatCurrency(invoice.total)}</td>
                        <td>{getEstadoBadge(invoice.estado)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetail(invoice)}
                          >
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      {showDetailModal && selectedInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Detalle de Factura #{selectedInvoice.id}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Información general */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">Información del Cliente</h6>
                    <p className="mb-1"><strong>Nombre:</strong> {selectedInvoice.cliente_nombre}</p>
                    {selectedInvoice.cliente_documento && (
                      <p className="mb-1"><strong>Documento:</strong> {selectedInvoice.cliente_documento}</p>
                    )}
                    {selectedInvoice.cliente_telefono && (
                      <p className="mb-1"><strong>Teléfono:</strong> {selectedInvoice.cliente_telefono}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">Información de Venta</h6>
                    <p className="mb-1"><strong>Vendedor:</strong> {selectedInvoice.vendedor_nombre}</p>
                    <p className="mb-1"><strong>Fecha:</strong> {formatDate(selectedInvoice.fecha_creacion)}</p>
                    <p className="mb-1"><strong>Método de Pago:</strong> {getMetodoPagoIcon(selectedInvoice.metodo_pago)} {selectedInvoice.metodo_pago}</p>
                    <p className="mb-1"><strong>Estado:</strong> {getEstadoBadge(selectedInvoice.estado)}</p>
                  </div>
                </div>

                {/* Items de la factura */}
                <h6 className="fw-bold mb-3">Productos</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Talla</th>
                        <th>Color</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="fw-semibold">{item.producto_nombre}</div>
                            <small className="text-muted">{item.codigo_barras}</small>
                          </td>
                          <td>{item.talla}</td>
                          <td>{item.color}</td>
                          <td>{item.cantidad}</td>
                          <td>{formatCurrency(item.precio_unitario)}</td>
                          <td className="fw-bold">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totales */}
                <div className="row mt-4">
                  <div className="col-md-6 offset-md-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal:</span>
                          <span className="fw-semibold">{formatCurrency(selectedInvoice.subtotal)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Impuestos (19%):</span>
                          <span className="fw-semibold">{formatCurrency(selectedInvoice.impuestos)}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold fs-5">Total:</span>
                          <span className="fw-bold fs-5 text-primary">{formatCurrency(selectedInvoice.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                {selectedInvoice.estado === 'completada' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCancelInvoice(selectedInvoice.id)}
                  >
                    Cancelar Factura
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;
