import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
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
    // Leer el archivo SQL
    const sql = fs.readFileSync('./backend/database.sql', 'utf8');
    
    // Ejecutar el script SQL
    console.log('📝 Ejecutando script SQL...');
    const [results] = await connection.query(sql);
    
    console.log('✅ Base de datos configurada exitosamente');
    console.log('📊 Tablas creadas:');
    
    // Listar las tablas creadas
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Error al configurar la base de datos:', error.message);
  } finally {
    await connection.end();
    console.log('🔌 Conexión cerrada');
  }
}

setupDatabase();
