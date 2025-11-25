# Guía de Deploy en Vercel (Frontend)

## 🚀 Pasos para Desplegar Frontend React

### 1. Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Sign Up"
3. Conecta tu cuenta de GitHub
4. Autoriza Vercel para acceder a tus repositorios

### 2. Asegúrate de que el código esté en GitHub

Si aún no has subido tu código:

```bash
cd "D:\ESCRITORIO\inventario de zapatos"
git add .
git commit -m "Add frontend for deployment"
git push origin main
```

### 3. Importar Proyecto en Vercel

1. En Vercel Dashboard, haz clic en "Add New..." → "Project"
2. Busca tu repositorio `inventario-zapatos`
3. Haz clic en "Import"

### 4. Configurar Build Settings

Vercel detectará automáticamente que es un proyecto Vite, pero verifica:

**Root Directory:** `frontend`

**Build Command:** `npm run build`

**Output Directory:** `dist`

**Install Command:** `npm install`

### 5. Agregar Variables de Entorno

Antes de deploy, agrega esta variable de entorno:

```
VITE_API_URL=https://tu-backend.railway.app/api
```

**Importante:** Cambia `tu-backend.railway.app` por la URL real de tu backend en Railway.

### 6. Deploy

1. Haz clic en "Deploy"
2. Espera 1-2 minutos
3. Vercel te dará una URL: `https://inventario-zapatos.vercel.app`

### 7. Configurar Dominio Personalizado (Opcional)

Si tienes un dominio:
1. Ve a "Settings" → "Domains"
2. Agrega tu dominio
3. Configura DNS según las instrucciones

### 8. Actualizar CORS en Backend

En tu backend (`src/server.js`), actualiza el origen de CORS:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://inventario-zapatos.vercel.app', // Tu URL de Vercel
    'https://tu-dominio.com' // Si tienes dominio personalizado
  ],
  credentials: true
}));
```

Luego haz push para que Railway actualice:

```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

### 9. Probar la Aplicación

1. Visita tu URL de Vercel
2. Prueba el registro de un nuevo usuario
3. Verifica que se conecte correctamente con el backend

---

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push` a la rama `main`:
- **Vercel** actualizará automáticamente el frontend
- **Railway** actualizará automáticamente el backend

---

## 📊 Variables de Entorno para Diferentes Ambientes

### Desarrollo Local (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Producción Vercel
```
VITE_API_URL=https://tu-backend.railway.app/api
```

---

## ✅ Checklist Final

- [ ] Backend desplegado en Railway
- [ ] Base de datos MySQL creada en Railway
- [ ] Tablas creadas con script SQL
- [ ] Frontend desplegado en Vercel
- [ ] Variable VITE_API_URL configurada
- [ ] CORS actualizado en backend
- [ ] Probado registro e inicio de sesión

---

## 🎉 ¡Listo!

Tu aplicación SaaS está en producción y puedes:
- Compartir la URL con clientes
- Desarrollar localmente con BD de producción
- Actualizaciones automáticas con cada push
