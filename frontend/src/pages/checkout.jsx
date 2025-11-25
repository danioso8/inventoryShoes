import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/authService';

function Checkout() {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const periodo = searchParams.get('periodo') || 'mensual';

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    initializeCheckout();
  }, [planId, periodo]);

  const initializeCheckout = async () => {
    try {
      setLoading(true);
      
      // Crear intención de pago en el backend
      const response = await api.post('/payments/create-intent', {
        plan_id: planId,
        periodo: periodo
      });

      setPaymentData(response.data);
      
      // Cargar script de Wompi
      loadWompiScript();
      
    } catch (err) {
      console.error('Error al inicializar checkout:', err);
      setError(err.response?.data?.message || 'Error al cargar el checkout');
    } finally {
      setLoading(false);
    }
  };

  const loadWompiScript = () => {
    if (document.getElementById('wompi-widget-script')) {
      initializeWompiWidget();
      return;
    }

    const script = document.createElement('script');
    script.id = 'wompi-widget-script';
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    script.onload = () => initializeWompiWidget();
    script.onerror = () => setError('Error al cargar el widget de pagos');
    document.body.appendChild(script);
  };

  const initializeWompiWidget = () => {
    if (!paymentData || !window.WidgetCheckout) return;

    const checkout = new window.WidgetCheckout({
      currency: 'COP',
      amountInCents: paymentData.amountInCents,
      reference: paymentData.reference,
      publicKey: paymentData.publicKey,
      signature: {
        integrity: paymentData.signature
      },
      redirectUrl: paymentData.redirectUrl,
      customerData: {
        email: paymentData.customerEmail,
        fullName: authService.getCurrentUser()?.nombre
      }
    });

    checkout.open((result) => {
      const transaction = result.transaction;
      
      if (transaction.status === 'APPROVED') {
        setProcessing(true);
        setTimeout(() => {
          navigate('/payment/success?ref=' + paymentData.reference);
        }, 2000);
      } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
        setError('El pago fue rechazado. Por favor, intenta con otro método de pago.');
      }
    });
  };

  const getPlanInfo = () => {
    const planes = {
      basic: { nombre: 'Basic', precio: 29 },
      premium: { nombre: 'Premium', precio: 79 },
      enterprise: { nombre: 'Enterprise', precio: 199 }
    };
    return planes[planId] || {};
  };

  const planInfo = getPlanInfo();
  const precioTotal = periodo === 'anual' ? planInfo.precio * 10 : planInfo.precio;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Preparando checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-danger">
                <div className="card-body text-center">
                  <i className="bi bi-exclamation-triangle text-danger display-1"></i>
                  <h3 className="mt-3">Error en el pago</h3>
                  <p className="text-muted">{error}</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/pricing')}
                  >
                    Volver a Planes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Procesando...</span>
          </div>
          <h4 className="text-success">¡Pago exitoso!</h4>
          <p className="text-muted">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* Resumen del pedido */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Resumen del pedido</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <div>
                    <h6 className="mb-1">Plan {planInfo.nombre}</h6>
                    <small className="text-muted">
                      Facturación {periodo === 'anual' ? 'Anual' : 'Mensual'}
                    </small>
                  </div>
                  <div className="text-end">
                    <h6 className="mb-1">${precioTotal} USD</h6>
                    {periodo === 'anual' && (
                      <small className="text-success">
                        ¡Ahorra ${planInfo.precio * 2}!
                      </small>
                    )}
                  </div>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total a pagar:</strong>
                  <strong className="text-primary">${precioTotal} USD</strong>
                </div>
              </div>
            </div>

            {/* Contenedor del widget de Wompi */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="mb-3">Método de pago</h6>
                <div id="wompi-widget-container"></div>
                <div className="text-center mt-3">
                  <small className="text-muted">
                    Pago seguro procesado por <strong>Wompi</strong>
                  </small>
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/pricing')}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
