import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const reference = searchParams.get('ref');

  useEffect(() => {
    if (!reference) {
      navigate('/dashboard');
      return;
    }

    // Esperar unos segundos para que el webhook procese el pago
    setTimeout(() => {
      checkPaymentStatus();
    }, 3000);
  }, [reference]);

  const checkPaymentStatus = async () => {
    try {
      // Aquí podrías consultar el estado del pago si lo necesitas
      setLoading(false);
    } catch (error) {
      console.error('Error al verificar pago:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Verificando pago...</span>
          </div>
          <h5>Verificando tu pago...</h5>
          <p className="text-muted">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg border-0">
              <div className="card-body text-center p-5">
                {/* Icono de éxito */}
                <div className="mb-4">
                  <div 
                    className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="bi bi-check-lg text-white" style={{ fontSize: '3rem' }}></i>
                  </div>
                </div>

                <h2 className="mb-3">¡Pago Exitoso!</h2>
                <p className="text-muted mb-4">
                  Tu suscripción ha sido activada correctamente.
                  Ya puedes disfrutar de todas las funcionalidades de tu plan.
                </p>

                <div className="bg-light rounded p-3 mb-4">
                  <small className="text-muted d-block mb-1">Referencia de pago:</small>
                  <code className="text-primary">{reference}</code>
                </div>

                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate('/dashboard')}
                  >
                    Ir al Dashboard
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/pricing')}
                  >
                    Ver Planes
                  </button>
                </div>

                <p className="text-muted small mt-4 mb-0">
                  Recibirás un correo de confirmación con los detalles de tu suscripción
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
