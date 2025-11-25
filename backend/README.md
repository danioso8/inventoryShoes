# Backend - Inventario de Zapatos SaaS

Sistema backend para gestión de inventario de zapatos multi-tenant (SaaS).

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **bcryptjs** - Hash de contraseñas

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Copia .env y edita con tus datos de MySQL
```

## ⚙️ Configuración

### 1. Crear base de datos MySQL

Ejecuta el script `database.sql` en tu servidor MySQL:

```bash
mysql -u root -p < database.sql
```

O desde MySQL Workbench/phpMyAdmin importa el archivo.

### 2. Configurar .env

Edita el archivo `.env` con tus credenciales:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=inventario_zapatos
JWT_SECRET=cambiar_en_produccion
```

## 🏃‍♂️ Ejecutar

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará en: `http://localhost:5000`

## 📚 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar usuario y tienda
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere token)

### Ejemplo de registro:

```json
POST /api/auth/register
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "123456",
  "nombre_tienda": "Zapatería Juan",
  "telefono": "987654321"
}
```

### Ejemplo de login:

```json
POST /api/auth/login
{
  "email": "juan@ejemplo.com",
  "password": "123456"
}
```

## 🗄️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # Conexión a MySQL
│   ├── controllers/
│   │   └── auth.controller.js # Lógica de autenticación
│   ├── middleware/
│   │   └── auth.middleware.js # Validación JWT
│   ├── routes/
│   │   └── auth.routes.js    # Rutas de autenticación
│   └── server.js             # Servidor Express
├── database.sql              # Script de base de datos
├── .env                      # Variables de entorno
└── package.json
```

## 🔒 Seguridad

- Las contraseñas se hashean con bcrypt
- Autenticación con JWT (tokens de 7 días)
- Validación de datos en todas las rutas
- Middleware de autenticación para rutas protegidas

## 📝 Datos de Prueba

El script SQL incluye una tienda y usuario demo:

- **Email:** admin@zapateria.com
- **Contraseña:** 123456
- **Tienda:** Zapatería Demo (3 meses gratis)
