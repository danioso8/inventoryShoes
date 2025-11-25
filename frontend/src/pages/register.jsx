import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [nombreTienda, setNombreTienda] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validación básica
    if (!nombre || !email || !password || !confirmar || !nombreTienda) {
      setError("Todos los campos obligatorios deben ser completados");
      return;
    }
    
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        nombre,
        email,
        password,
        nombre_tienda: nombreTienda,
        telefono
      });
      
      console.log("Registro exitoso:", response);
      
      // Redirigir al dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message || "Error al registrar el usuario");
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
               INVENTARIO DE ZAPATOS ONLINE
              </h1>
            </div>

            {/* Tabs */}
            <div className="d-flex mb-4">
              <Link 
                to="/login" 
                className="btn btn-outline-dark flex-fill text-uppercase fw-bold small rounded-0 py-2"
              >
                Iniciar Sesión
              </Link>
              <button className="btn btn-dark flex-fill text-uppercase fw-bold small rounded-0 py-2">
                Crear Cuenta
              </button>
            </div>

            {/* Botón Google */}
            <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 mb-3 py-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" width="20" height="20" />
              <span className="text-primary fw-medium">Regístrate con Google</span>
            </button>

            {/* Separador */}
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="px-3 text-muted small">O usa tu email</span>
              <hr className="flex-grow-1" />
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show small text-center" role="alert">
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Nombre Completo <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ingresa tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="form-control form-control-lg"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Correo Electrónico <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control form-control-lg"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Nombre de tu Tienda <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Zapatería El Paso"
                  value={nombreTienda}
                  onChange={(e) => setNombreTienda(e.target.value)}
                  className="form-control form-control-lg"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Teléfono (Opcional)
                </label>
                <input
                  type="tel"
                  placeholder="987654321"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="form-control form-control-lg"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Contraseña <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control form-control-lg"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">
                  Confirmar Contraseña <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirma tu contraseña"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className="form-control form-control-lg"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="acceptTerms" required />
                <label className="form-check-label small" htmlFor="acceptTerms">
                  Acepto los{' '}
                  <Link to="#" className="text-primary">Términos y Condiciones</Link>
                  {' '}y{' '}
                  <Link to="#" className="text-primary">Política de Privacidad</Link>
                </label>
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
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>

            <p className="mt-4 small text-muted text-center">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary fw-bold">
                Inicia sesión aquí
              </Link>
            </p>
            <p className="small text-danger text-center">* Campos requeridos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;