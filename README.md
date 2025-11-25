# Inventario de Zapatos - SaaS Multi-tenant

Sistema completo de gestión de inventario de zapatos para múltiples tiendas (SaaS).

## 🚀 Stack Tecnológico

### Frontend
- **React 18** - Librería de UI
- **Vite** - Build tool
- **Bootstrap 5** - Framework CSS
- **React Router** - Navegación
- **Axios** - Peticiones HTTP

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

## 📦 Estructura del Proyecto

```
inventario-zapatos/
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/        # Páginas (Login, Register, Dashboard)
│   │   ├── services/     # Servicios API
│   │   └── App.jsx       # Componente principal
│   └── package.json
│
├── backend/               # API Node.js
│   ├── src/
│   │   ├── config/       # Configuración (DB)
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── middleware/   # Middlewares (auth)
│   │   ├── routes/       # Rutas API
│   │   └── server.js     # Servidor Express
│   ├── database.sql      # Script de BD
│   └── package.json
```

## 🏃‍♂️ Ejecutar Localmente

### Backend

```bash
cd backend
npm install
# Configurar .env con credenciales de MySQL
npm run dev
```

El servidor correrá en `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación correrá en `http://localhost:5173`

## 🌐 Deploy en Producción

### Backend + MySQL → Railway
Ver guía completa: [backend/DEPLOY_RAILWAY.md](backend/DEPLOY_RAILWAY.md)

### Frontend → Vercel
Ver guía completa: [frontend/DEPLOY_VERCEL.md](frontend/DEPLOY_VERCEL.md)

## 🔑 Características

- ✅ Registro de usuarios con tienda
- ✅ Autenticación con JWT
- ✅ Multi-tenant (cada tienda aislada)
- ✅ 3 meses gratis de prueba
- ✅ Dashboard básico
- 🚧 Gestión de productos (próximamente)
- 🚧 Sistema de facturación (próximamente)
- 🚧 Reportes y analytics (próximamente)

## 📝 Variables de Entorno

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=inventario_zapatos
DB_PORT=3306
JWT_SECRET=tu_clave_secreta
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🗄️ Base de Datos

El script `backend/database.sql` incluye:
- Tabla de tiendas (multi-tenant)
- Tabla de usuarios
- Tabla de productos y variantes
- Tabla de facturas
- Tabla de movimientos de inventario

## 📄 Licencia

ISC

## 👨‍💻 Autor

Tu nombre aquí
