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

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            👟 Inventory Shoes Online
          </span>
          <div className="d-flex align-items-center gap-3">
            {user && (
              <>
                <span className="text-white">
                  <i className="bi bi-person-circle"></i> {user.nombre}
                </span>
                <span className="badge bg-primary">{user.tienda_nombre}</span>
                <button 
                  className="btn btn-outline-light btn-sm" 
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="container mt-5">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-success" role="alert">
              <h4 className="alert-heading">¡Bienvenido, {user?.nombre}! 🎉</h4>
              <p>Has iniciado sesión correctamente en tu tienda: <strong>{user?.tienda_nombre}</strong></p>
              <hr />
              <p className="mb-0">Tienes <strong>3 meses gratis</strong> para probar todas las funcionalidades.</p>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body text-center">
                <h1 className="display-4">📦</h1>
                <h5 className="card-title">Productos</h5>
                <p className="card-text">Gestiona tu inventario de zapatos</p>
                <button className="btn btn-primary">Ver Productos</button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-body text-center">
                <h1 className="display-4">🧾</h1>
                <h5 className="card-title">Facturas</h5>
                <p className="card-text">Registra ventas y genera facturas</p>
                <button className="btn btn-primary">Nueva Venta</button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-body text-center">
                <h1 className="display-4">📊</h1>
                <h5 className="card-title">Reportes</h5>
                <p className="card-text">Analiza tus ventas e inventario</p>
                <button className="btn btn-primary">Ver Reportes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;