import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function Pricing() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const planes = [
    {
      id: 'free',
      nombre: 'Free',
      precio: 0,
      periodo: 'Gratis por 3 meses',
      descripcion: 'Perfecto para comenzar',
      caracteristicas: [
        'Hasta 50 productos',
        '1 usuario',
        'Facturación básica',
        'Reportes básicos',
        'Soporte por email'
      ],
      color: 'secondary',
      destacado: false
    },
    {
      id: 'basic',
      nombre: 'Basic',
      precio: 29,
      periodo: '/mes',
      descripcion: 'Para tiendas pequeñas',
      caracteristicas: [
        'Hasta 500 productos',
        '3 usuarios',
        'Facturación completa',
        'Reportes avanzados',
        'Soporte prioritario',
        'Backup automático'
      ],
      color: 'primary',
      destacado: false
    },
    {
      id: 'premium',
      nombre: 'Premium',
      precio: 79,
      periodo: '/mes',
      descripcion: 'Para tiendas en crecimiento',
      caracteristicas: [
        'Productos ilimitados',
        '10 usuarios',
        'Facturación + POS',
        'Analytics avanzados',
        'Soporte 24/7',
        'Backup automático',
        'API personalizada',
        'Integración e-commerce'
      ],
      color: 'warning',
      destacado: true
    },
    {
      id: 'enterprise',
      nombre: 'Enterprise',
      precio: 199,
      periodo: '/mes',
      descripcion: 'Para grandes operaciones',
      caracteristicas: [
        'Todo lo de Premium',
        'Usuarios ilimitados',
        'Multi-tienda',
        'Personalización completa',
        'Soporte dedicado',
        'Capacitación incluida',
        'SLA garantizado',
        'Desarrollo a medida'
      ],
      color: 'dark',
      destacado: false
    }
  ];

  const handleSelectPlan = (planId) => {
    if (!user) {
      navigate('/register');
      return;
    }

    if (planId === 'free') {
      alert('Ya estás en el plan gratuito');
      return;
    }

    // Redirigir al checkout
    navigate(`/checkout/${planId}?periodo=mensual`);
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/">
            👟 Inventory Shoes Online
          </a>
          <div>
            {user ? (
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={() => navigate('/dashboard')}
              >
                Ir al Dashboard
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-outline-light btn-sm me-2"
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </button>
                <button 
                  className="btn btn-light btn-sm"
                  onClick={() => navigate('/register')}
                >
                  Crear Cuenta
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">
            Planes para cada tipo de negocio
          </h1>
          <p className="lead text-muted mb-4">
            Comienza gratis y crece con nosotros. Sin contratos, cancela cuando quieras.
          </p>
          <div className="badge bg-success fs-6 mb-3">
            🎉 3 meses gratis en tu primer registro
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container py-5">
        <div className="row g-4">
          {planes.map((plan) => (
            <div key={plan.id} className="col-12 col-md-6 col-lg-3">
              <div 
                className={`card h-100 ${plan.destacado ? 'border-warning shadow-lg' : ''}`}
                style={{ transform: plan.destacado ? 'scale(1.05)' : 'none' }}
              >
                {plan.destacado && (
                  <div className="card-header bg-warning text-center fw-bold">
                    ⭐ MÁS POPULAR
                  </div>
                )}
                <div className="card-body d-flex flex-column">
                  <div className="text-center mb-4">
                    <h3 className="card-title fw-bold">{plan.nombre}</h3>
                    <div className="my-3">
                      <span className="display-4 fw-bold">
                        ${plan.precio}
                      </span>
                      <span className="text-muted">{plan.periodo}</span>
                    </div>
                    <p className="text-muted small">{plan.descripcion}</p>
                  </div>

                  <ul className="list-unstyled mb-4 flex-grow-1">
                    {plan.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                        {caracteristica}
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`btn btn-${plan.color} w-100 ${plan.destacado ? 'btn-lg' : ''}`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.id === 'free' ? 'Comenzar Gratis' : 'Seleccionar Plan'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="row mt-5">
          <div className="col-12">
            <h2 className="text-center mb-4">Preguntas Frecuentes</h2>
          </div>
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">¿Puedo cambiar de plan?</h5>
                <p className="card-text">
                  Sí, puedes hacer upgrade o downgrade en cualquier momento.
                  Los cambios se aplican inmediatamente.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">¿Cómo funciona el período de prueba?</h5>
                <p className="card-text">
                  Al registrarte, obtienes 3 meses gratis del plan Free.
                  No se requiere tarjeta de crédito.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">¿Qué métodos de pago aceptan?</h5>
                <p className="card-text">
                  Aceptamos tarjetas de crédito/débito, transferencias bancarias
                  y billeteras digitales (Yape, Plin).
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">¿Hay descuentos por pago anual?</h5>
                <p className="card-text">
                  Sí, obtén 2 meses gratis pagando anualmente.
                  Contáctanos para más información.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">
            © 2025 Inventory Shoes Online. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Pricing;
