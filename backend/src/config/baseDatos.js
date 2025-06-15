// ========================================
// CONFIGURACIÓN DE BASE DE DATOS SQLITE
// ========================================

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Crear la ruta completa al archivo de base de datos
const rutaBaseDatos = path.join(__dirname, '../../database/talentchain.sqlite');

// Asegurar que la carpeta database existe
const carpetaDatabase = path.dirname(rutaBaseDatos);
if (!fs.existsSync(carpetaDatabase)) {
  fs.mkdirSync(carpetaDatabase, { recursive: true });
  console.log('📁 Carpeta database creada');
}

// Crear conexión a SQLite (archivo local, no necesita servidor)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: rutaBaseDatos, // Archivo donde se guardará la base de datos
  logging: console.log,   // Mostrar consultas SQL en la consola (para aprender)
  
  // Configuración para desarrollo
  define: {
    // Usar timestamps automáticos (fechaCreacion, fechaActualizacion)
    timestamps: true,
    // Nombres de campos en español
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaActualizacion',
    // No usar nombres de tabla en plural (usuario en vez de usuarios)
    freezeTableName: true
  }
});

// Función para probar si podemos conectarnos a SQLite
async function probarConexion() {
  try {
    // Intentar conectarse a SQLite
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite establecida correctamente');
    console.log(`📊 Base de datos: talentchain.sqlite`);
    console.log(`📁 Ubicación: ${rutaBaseDatos}`);
    console.log(`📈 Tamaño del archivo: ${obtenerTamanoArchivo(rutaBaseDatos)}`);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a SQLite:', error.message);
    console.log('💡 Posibles soluciones:');
    console.log('   - Verifica que la carpeta database existe');
    console.log('   - Verifica permisos de escritura en la carpeta');
    return false;
  }
}

// Función para obtener el tamaño del archivo de base de datos
function obtenerTamanoArchivo(ruta) {
  try {
    if (fs.existsSync(ruta)) {
      const stats = fs.statSync(ruta);
      const tamanoBytes = stats.size;
      
      if (tamanoBytes === 0) return '0 KB (vacía)';
      if (tamanoBytes < 1024) return `${tamanoBytes} bytes`;
      if (tamanoBytes < 1024 * 1024) return `${(tamanoBytes / 1024).toFixed(1)} KB`;
      return `${(tamanoBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return 'Archivo no existe aún';
  } catch (error) {
    return 'No se pudo determinar';
  }
}

// Función para crear las tablas automáticamente
async function sincronizarBaseDatos() {
  try {
    // sync({ force: false }) = crear tablas solo si no existen
    // sync({ force: true }) = borrar y recrear todas las tablas (¡cuidado!)
    await sequelize.sync({ force: false });
    console.log('✅ Tablas de base de datos sincronizadas correctamente');
    console.log(`📈 Tamaño final: ${obtenerTamanoArchivo(rutaBaseDatos)}`);
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error.message);
  }
}

// Función para obtener información de la base de datos
async function obtenerInfoBaseDatos() {
  try {
    const query = `
      SELECT 
        name as tabla,
        type as tipo
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name;
    `;
    
    const [resultados] = await sequelize.query(query);
    return resultados;
  } catch (error) {
    console.error('Error obteniendo información de tablas:', error.message);
    return [];
  }
}

// Exportar para usar en otros archivos
module.exports = {
  sequelize,              // La conexión principal
  probarConexion,         // Función para probar conexión
  sincronizarBaseDatos,   // Función para crear tablas
  obtenerInfoBaseDatos,   // Función para ver qué tablas existen
  rutaBaseDatos           // Ruta del archivo de base de datos
};