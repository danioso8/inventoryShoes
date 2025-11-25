import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import userRoutes from './routes/user.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import pool from './config/database.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares - CORS más permisivo
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://disciplined-connection-production.up.railway.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Configuración de CORS
app.use(cors({
  origin: function (origin, callback) {
    console.log('Origin recibido:', origin);
    
    // Permitir requests sin origin (como mobile apps, curl o mismo servidor)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir localhost
    if (origin.includes('localhost')) return callback(null, true);
    
    // Permitir Railway frontend
    if (origin.includes('railway.app')) return callback(null, true);
    
    // Verificar allowedOrigins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Permitir cualquier origen en producción (temporal)
    console.log('Permitiendo origen no listado:', origin);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Agregar headers adicionales de CORS manualmente
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API Inventario de Zapatos - Backend funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Función para inicializar la base de datos
async function initializeDatabaseIfNeeded() {
  try {
    // Verificar si la tabla usuarios existe
    const [tables] = await pool.query("SHOW TABLES LIKE 'usuarios'");
    
    if (tables.length === 0) {
      console.log('⚠️  Tablas no encontradas. Inicializando base de datos...');
      
      // Leer y ejecutar el script SQL
      const sqlFilePath = join(__dirname, '../init-database.sql');
      const sql = readFileSync(sqlFilePath, 'utf8');
      
      // Ejecutar el SQL (dividirlo por statements si es necesario)
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await pool.query(statement);
        }
      }
      
      console.log('✅ Base de datos inicializada correctamente');
      console.log('📊 Tablas creadas: tiendas, usuarios, productos, categorias, etc.');
    } else {
      console.log('✅ Base de datos ya está inicializada');
    }
  } catch (error) {
    console.error('❌ Error al verificar/inicializar la base de datos:', error.message);
    // No detener el servidor, solo registrar el error
  }
}

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  
  // Inicializar base de datos si es necesario
  await initializeDatabaseIfNeeded();
});

export default app;
