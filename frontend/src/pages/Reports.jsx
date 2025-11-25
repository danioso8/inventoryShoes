import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import invoiceService from '../services/invoiceService';

function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    inicio: '',
    fin: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Cargar estadísticas del último mes por defecto
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    setDateRange({
      inicio: hace30Dias.toISOString().split('T')[0],
      fin: hoy.toISOString().split('T')[0]
    });
    
    loadStats(hace30Dias.toISOString().split('T')[0], hoy.toISOString().split('T')[0]);
  }, [navigate]);

  const loadStats = async (inicio, fin) => {
    setLoading(true);
    try {
      const response = await invoiceService.getStats(inicio, fin);
      setStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      alert('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    if (dateRange.inicio && dateRange.fin) {
      loadStats(dateRange.inicio, dateRange.fin);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getMetodoPagoColor = (metodo) => {
    const colors = {
      efectivo: '#10b981',
      tarjeta: '#3b82f6',
      transferencia: '#8b5cf6'
    };
    return colors[metodo] || '#6b7280';
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg shadow-sm mb-4" style={{ 
        background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)'
      }}>
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 fw-bold text-white" style={{ fontSize: '1.3rem' }}>
            📊 Reportes y Estadísticas
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
        {/* Filtro de fechas */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Fecha Inicio</label>
                <input
                  type="date"
                  className="form-control"
                  name="inicio"
                  value={dateRange.inicio}
                  onChange={handleDateChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Fecha Fin</label>
                <input
                  type="date"
                  className="form-control"
                  name="fin"
                  value={dateRange.fin}
                  onChange={handleDateChange}
                />
              </div>
              <div className="col-md-4">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleApplyFilter}
                  disabled={loading}
                >
                  {loading ? '🔄 Cargando...' : '🔍 Aplicar Filtro'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : !stats ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '4rem' }}>📊</div>
            <h5 className="mt-3 text-muted">Seleccione un rango de fechas</h5>
          </div>
        ) : (
          <>
            {/* KPIs principales */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="card-body text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1 small opacity-75">Total Ventas</p>
                        <h3 className="mb-0 fw-bold">{formatCurrency(stats.resumen?.ventas_totales)}</h3>
                      </div>
                      <div style={{ fontSize: '2.5rem' }}>💰</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <div className="card-body text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1 small opacity-75">Total Facturas</p>
                        <h3 className="mb-0 fw-bold">{stats.resumen?.total_facturas || 0}</h3>
                      </div>
                      <div style={{ fontSize: '2.5rem' }}>📄</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <div className="card-body text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1 small opacity-75">Ticket Promedio</p>
                        <h3 className="mb-0 fw-bold">{formatCurrency(stats.resumen?.ticket_promedio)}</h3>
                      </div>
                      <div style={{ fontSize: '2.5rem' }}>🎫</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                  <div className="card-body text-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1 small opacity-75">Productos Vendidos</p>
                        <h3 className="mb-0 fw-bold">
                          {stats.productos_top?.reduce((sum, p) => sum + parseInt(p.cantidad_vendida), 0) || 0}
                        </h3>
                      </div>
                      <div style={{ fontSize: '2.5rem' }}>👟</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Productos más vendidos */}
              <div className="col-lg-6 mb-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-white border-0" style={{ borderRadius: '16px 16px 0 0' }}>
                    <h5 className="mb-0 fw-bold">🏆 Top 10 Productos Más Vendidos</h5>
                  </div>
                  <div className="card-body">
                    {stats.productos_top && stats.productos_top.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Total Ventas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.productos_top.map((producto, index) => (
                              <tr key={index}>
                                <td>
                                  <span className="badge" style={{
                                    background: index < 3 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#6c757d'
                                  }}>
                                    {index + 1}
                                  </span>
                                </td>
                                <td>
                                  <div className="fw-semibold">{producto.nombre}</div>
                                  <small className="text-muted">{producto.codigo_barras}</small>
                                </td>
                                <td>
                                  <span className="badge bg-primary">{producto.cantidad_vendida} unidades</span>
                                </td>
                                <td className="fw-bold text-success">{formatCurrency(producto.total_ventas)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted">No hay datos disponibles</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ventas por método de pago */}
              <div className="col-lg-6 mb-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-white border-0" style={{ borderRadius: '16px 16px 0 0' }}>
                    <h5 className="mb-0 fw-bold">💳 Ventas por Método de Pago</h5>
                  </div>
                  <div className="card-body">
                    {stats.ventas_por_metodo && stats.ventas_por_metodo.length > 0 ? (
                      <>
                        {stats.ventas_por_metodo.map((metodo, index) => {
                          const totalGeneral = stats.resumen?.ventas_totales || 1;
                          const porcentaje = ((parseFloat(metodo.total) / totalGeneral) * 100).toFixed(1);
                          return (
                            <div key={index} className="mb-4">
                              <div className="d-flex justify-content-between mb-2">
                                <span className="fw-semibold text-capitalize">
                                  {metodo.metodo_pago === 'efectivo' && '💵 '}
                                  {metodo.metodo_pago === 'tarjeta' && '💳 '}
                                  {metodo.metodo_pago === 'transferencia' && '🏦 '}
                                  {metodo.metodo_pago}
                                </span>
                                <span className="text-muted">{metodo.cantidad} ventas</span>
                              </div>
                              <div className="progress mb-2" style={{ height: '25px', borderRadius: '10px' }}>
                                <div
                                  className="progress-bar fw-semibold"
                                  style={{ 
                                    width: `${porcentaje}%`,
                                    background: `linear-gradient(90deg, ${getMetodoPagoColor(metodo.metodo_pago)} 0%, ${getMetodoPagoColor(metodo.metodo_pago)}dd 100%)`
                                  }}
                                >
                                  {porcentaje}%
                                </div>
                              </div>
                              <div className="text-end fw-bold" style={{ color: getMetodoPagoColor(metodo.metodo_pago) }}>
                                {formatCurrency(metodo.total)}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted">No hay datos disponibles</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de ventas por día */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-white border-0" style={{ borderRadius: '16px 16px 0 0' }}>
                    <h5 className="mb-0 fw-bold">📈 Ventas por Día</h5>
                  </div>
                  <div className="card-body">
                    {stats.ventas_por_dia && stats.ventas_por_dia.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Fecha</th>
                              <th>Facturas</th>
                              <th>Total Ventas</th>
                              <th>Promedio</th>
                              <th>Gráfico</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.ventas_por_dia.slice().reverse().map((dia, index) => {
                              const maxVenta = Math.max(...stats.ventas_por_dia.map(d => parseFloat(d.ventas)));
                              const porcentaje = (parseFloat(dia.ventas) / maxVenta) * 100;
                              return (
                                <tr key={index}>
                                  <td className="fw-semibold">{formatDate(dia.fecha)}</td>
                                  <td>
                                    <span className="badge bg-secondary">{dia.facturas}</span>
                                  </td>
                                  <td className="fw-bold text-primary">{formatCurrency(dia.ventas)}</td>
                                  <td className="text-muted">
                                    {formatCurrency(parseFloat(dia.ventas) / parseInt(dia.facturas))}
                                  </td>
                                  <td style={{ width: '40%' }}>
                                    <div className="progress" style={{ height: '20px', borderRadius: '10px' }}>
                                      <div
                                        className="progress-bar"
                                        style={{ 
                                          width: `${porcentaje}%`,
                                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                        }}
                                      >
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted">No hay datos disponibles</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Reports;
