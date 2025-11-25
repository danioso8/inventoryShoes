
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlesubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Por favor, completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      console.log("Login exitoso:", response);
      
      // Redirigir al dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message || "Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            {/* Logo */}
            <div className="text-center mb-4">
              <h1 className="fw-black display-5" style={{fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px'}}>
                INVENTORY SHOES ONLINE
              </h1>
            </div>

            {/* Tabs */}
            <div className="d-flex mb-4">
              <button className="btn btn-dark flex-fill text-uppercase fw-bold small rounded-0 py-2">
                Iniciar Sesión
              </button>
              <Link 
                to="/register" 
                className="btn btn-outline-dark flex-fill text-uppercase fw-bold small rounded-0 py-2"
              >
                Crear Cuenta
              </Link>
            </div>

            {/* Botón Google */}
            <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 mb-3 py-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" width="20" height="20" />
              <span className="text-primary fw-medium">Ingresa con Google</span>
            </button>

            {/* Separador */}
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="px-3 text-muted small">O también puedes</span>
              <hr className="flex-grow-1" />
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show small text-center" role="alert">
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handlesubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Correo Electrónico <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Ingresa tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control form-control-lg"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Contraseña <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control form-control-lg"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="showpass" />
                  <label className="form-check-label small" htmlFor="showpass">
                    Mostrar contraseña
                  </label>
                </div>
                <Link to="#" className="small text-primary text-decoration-none">
                  ¿Has olvidado tu contraseña?
                </Link>
              </div>

              {/* Espacio para reCAPTCHA */}
              <div className="d-flex justify-content-center mb-3">
                <div className="bg-light border rounded p-3 text-center text-muted small" style={{width: '100%', maxWidth: '300px', height: '64px'}}>
                  reCAPTCHA placeholder
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-dark w-100 text-uppercase fw-bold py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Iniciando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <p className="mt-4 small text-muted text-center">
              Al continuar, confirmo que he leído y acepto{' '}
              <Link to="#" className="text-primary">Términos y Condiciones</Link> y{' '}
              <Link to="#" className="text-primary">Política de Privacidad</Link>.
            </p>
            <p className="small text-danger text-center">* Campos requeridos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;