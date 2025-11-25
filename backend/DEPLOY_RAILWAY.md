# Guía de Deploy en Railway

## 🚀 Pasos para Desplegar Backend + MySQL

### 1. Crear Cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en "Start a New Project"
3. Conecta tu cuenta de GitHub
4. Autoriza Railway para acceder a tus repositorios

### 2. Subir Código a GitHub

Primero, necesitas subir tu código a GitHub:

```bash
# Inicializar repositorio Git (si no lo has hecho)
cd "D:\ESCRITORIO\inventario de zapatos"
git init
git add .
git commit -m "Initial commit - Inventory Shoes App"

# Crear repositorio en GitHub y subirlo
# Ve a github.com y crea un nuevo repositorio llamado "inventario-zapatos"
git remote add origin https://github.com/TU_USUARIO/inventario-zapatos.git
git branch -M main
git push -u origin main
```

### 3. Crear Proyecto en Railway

1. En Railway, haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca y selecciona tu repositorio `inventario-zapatos`
4. Railway detectará automáticamente el backend

### 4. Agregar Base de Datos MySQL

1. En tu proyecto Railway, haz clic en "+ New"
2. Selecciona "Database" → "Add MySQL"
3. Railway creará automáticamente una base de datos MySQL
4. Copia las credenciales que aparecen

### 5. Configurar Variables de Entorno

En Railway, ve a tu servicio de backend y agrega estas variables:

```
PORT=5000
NODE_ENV=production

# Railway generará estas automáticamente al conectar MySQL:
MYSQLHOST=containers-us-west-xxx.railway.app
MYSQLPORT=6543
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=xxxxxxxxxxxxx

# Tus variables personalizadas:
DB_HOST=${{MYSQLHOST}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
DB_NAME=${{MYSQLDATABASE}}
DB_PORT=${{MYSQLPORT}}

JWT_SECRET=tu_clave_secreta_super_segura_cambiala_123456789
```

### 6. Ejecutar Script SQL

Para crear las tablas en la base de datos de Railway:

**Opción A: Usando Railway CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar a tu proyecto
railway link

# Conectar a MySQL y ejecutar script
railway run mysql -u root -p < database.sql
```

**Opción B: Usando MySQL Workbench o TablePlus**
1. Descarga MySQL Workbench o TablePlus
2. Conecta usando las credenciales de Railway
3. Importa el archivo `database.sql`

**Opción C: Usando código (Automático)**
Puedes crear un endpoint en tu backend para inicializar la BD:
- Visita: `https://tu-backend.railway.app/api/init-db`

### 7. Verificar Deploy

Una vez desplegado:
1. Railway te dará una URL pública: `https://inventario-zapatos-backend-xxx.railway.app`
2. Prueba la API: `https://tu-url.railway.app/api/auth/login`

### 8. Conectar Desarrollo Local a Railway

En tu `.env` local, cambia las credenciales por las de Railway:

```env
DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=xxxxxxxxxxxxx
DB_NAME=railway
DB_PORT=6543
```

Ahora trabajarás con la misma base de datos en desarrollo y producción.

---

## ⚠️ Importante

- **Backup automático:** Railway hace backups automáticos
- **$5 gratis:** El primer mes es gratis con el crédito
- **Monitoreo:** Ve métricas en el dashboard de Railway
- **Variables de entorno:** Nunca subas `.env` a GitHub

---

## 🎯 Siguiente Paso: Desplegar Frontend en Vercel

Ver archivo: `DEPLOY_VERCEL.md`
