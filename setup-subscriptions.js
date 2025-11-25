import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function setupSubscriptions() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    multipleStatements: true
  });

  console.log('✅ Conectado a MySQL');

  try {
    // Leer el archivo SQL de suscripciones
    const sql = fs.readFileSync('./backend/database-subscriptions.sql', 'utf8');
    
    // Ejecutar el script SQL
    console.log('📝 Ejecutando script de suscripciones...');
    await connection.query(sql);
    
    console.log('✅ Tablas de suscripciones creadas exitosamente');
    console.log('📊 Nuevas tablas:');
    console.log('  - suscripciones');
    console.log('  - pagos');
    console.log('  - limites_planes');
    
  } catch (error) {
    console.error('❌ Error al configurar suscripciones:', error.message);
  } finally {
    await connection.end();
    console.log('🔌 Conexión cerrada');
  }
}

setupSubscriptions();
