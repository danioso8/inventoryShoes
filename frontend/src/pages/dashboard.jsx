import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const stats = [
    { label: "Total Productos", value: "0", icon: "📦", color: "primary", change: "+0%" },
    { label: "Ventas del Mes", value: "$0", icon: "💰", color: "success", change: "+0%" },
    { label: "Facturas", value: "0", icon: "🧾", color: "info", change: "+0%" },
    { label: "Stock Bajo", value: "0", icon: "⚠️", color: "warning", change: "0" },
  ];

  const quickActions = [
    { 
      title: "Productos", 
      description: "Gestiona tu inventario de zapatos",
      icon: "📦",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      buttonText: "Ver Productos",
      action: () => navigate('/productos')
    },
    { 
      title: "Facturas", 
      description: "Registra ventas y genera facturas",
      icon: "🧾",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      buttonText: "Nueva Venta",
      action: () => navigate('/facturas')
    },
    { 
      title: "Reportes", 
      description: "Analiza tus ventas e inventario",
      icon: "📊",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      buttonText: "Ver Reportes",
      action: () => navigate('/reportes')
    },
  ];

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Navbar Moderna */}
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ 
        background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="container-fluid px-4">
          <span className="navbar-brand mb-0 fw-bold" style={{ 
            fontSize: '1.5rem',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1px'
          }}>
            👟 Inventory Shoes Online
          </span>
          <div className="d-flex align-items-center gap-3">
            {user && (
              <>
                <div className="text-white d-none d-md-block">
                  <div className="small opacity-75">Bienvenido</div>
                  <div className="fw-semibold">{user.nombre}</div>
                </div>
                <div className="vr text-white opacity-25 d-none d-md-block"></div>
                <span className="badge px-3 py-2" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '0.85rem'
                }}>
                  {user.tienda_nombre}
                </span>
                <button 
                  className="btn btn-sm text-white border-0 px-3 py-2"
                  style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="container-fluid px-4 py-4">
        {/* Banner de Bienvenida */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              overflow: 'hidden'
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="text-white">
                    <h2 className="mb-2 fw-bold">¡Bienvenido, {user?.nombre}! 🎉</h2>
                    <p className="mb-0 opacity-90" style={{ fontSize: '1.05rem' }}>
                      Has iniciado sesión correctamente en tu tienda: <strong>{user?.tienda_nombre}</strong>
                    </p>
                    <div className="mt-3 d-flex align-items-center gap-2">
                      <span className="badge bg-white text-dark px-3 py-2" style={{ fontSize: '0.9rem' }}>
                        Plan: FREE
                      </span>
                      <span className="text-white opacity-90">
                        Tienes <strong>3 meses gratis</strong> para probar todas las funcionalidades.
                      </span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-light btn-lg mt-3 mt-md-0 shadow-sm px-4 py-2"
                    style={{ 
                      borderRadius: '12px',
                      fontWeight: '600',
                      transition: 'all 0.3s'
                    }}
                    onClick={() => navigate('/pricing')}
                  >
                    Ver Planes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="row g-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100" style={{ 
                borderRadius: '16px',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-2 small fw-semibold text-uppercase">{stat.label}</p>
                      <h3 className="mb-0 fw-bold">{stat.value}</h3>
                      <small className={`text-${stat.color} fw-semibold`}>
                        {stat.change} vs mes anterior
                      </small>
                    </div>
                    <div className="rounded-circle p-3" style={{ 
                      background: `var(--bs-${stat.color})`,
                      opacity: 0.1,
                      fontSize: '1.8rem'
                    }}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones Rápidas */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold mb-3" style={{ color: '#1a1a2e' }}>Acciones Rápidas</h4>
          </div>
        </div>

        <div className="row g-4">
          {quickActions.map((action, index) => (
            <div key={index} className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100" style={{ 
                borderRadius: '20px',
                overflow: 'hidden',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}>
                <div style={{ 
                  background: action.color,
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '4rem' }}>{action.icon}</div>
                </div>
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-2">{action.title}</h5>
                  <p className="card-text text-muted mb-4">{action.description}</p>
                  <button 
                    className="btn w-100 text-white border-0 py-2 fw-semibold"
                    style={{ 
                      background: action.color,
                      borderRadius: '10px',
                      transition: 'all 0.3s'
                    }}
                    onClick={action.action}
                  >
                    {action.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;