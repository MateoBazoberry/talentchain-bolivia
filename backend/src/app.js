// ========================================
// TALENTCHAIN BOLIVIA - SERVIDOR PRINCIPAL
// ========================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de base de datos
const { probarConexion, sincronizarBaseDatos } = require('./config/baseDatos');
const Usuario = require('./modelos/Usuario');

// Crear la aplicación Express (nuestro servidor web)
const app = express();
const PUERTO = process.env.PUERTO || 3000;

// ========================================
// MIDDLEWARES (Funciones que procesan TODAS las peticiones)
// ========================================

// CORS: Permite que React (puerto 5173) se comunique con nuestro servidor (puerto 3000)
app.use(cors({
  origin: process.env.URL_FRONTEND,  // Solo permitir peticiones desde nuestro React
  credentials: true                  // Permitir envío de cookies y headers de autenticación
}));

// Middleware para entender datos JSON que llegan del frontend
app.use(express.json({ limit: '10mb' }));

// Middleware para entender datos de formularios HTML
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware personalizado para registrar todas las peticiones (como un portero)
app.use((req, res, next) => {
  const ahora = new Date().toLocaleString('es-BO', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  console.log(`📥 ${req.method} ${req.path} - ${ahora}`);
  
  // Si viene información en el body, mostrarla (útil para debugging)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   📦 Datos recibidos:', req.body);
  }
  
  next(); // Continuar al siguiente middleware o ruta
});

// ========================================
// RUTAS BÁSICAS PARA PROBAR EL SERVIDOR
// ========================================

// Ruta principal - Para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({
    mensaje: '🚀 TalentChain Bolivia Backend funcionando correctamente',
    version: '1.0.0',
    proyecto: 'Plataforma de Verificación de Credenciales Académicas',
    desarrollador: 'Mateo Bazoberry - UNIFRANZ',
    semestre: '5to Semestre - Ingeniería de Sistemas',
    fecha: new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' }),
    estado: 'en línea'
  });
});

// Ruta de estado del servidor - Para verificar conexiones y rendimiento
app.get('/estado', async (req, res) => {
  // Probar conexión a base de datos
  const baseDatosConectada = await probarConexion();
  
  // Información del sistema
  const estadoServidor = {
    estado: 'funcionando',
    baseDatos: baseDatosConectada ? 'conectada' : 'desconectada',
    tiempoFuncionando: process.uptime(), // Segundos que lleva corriendo
    memoriaUsada: process.memoryUsage(),
    version: process.version,
    plataforma: process.platform,
    fecha: new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' })
  };
  
  res.json(estadoServidor);
});

// Ruta de información del proyecto
app.get('/info', (req, res) => {
  res.json({
    proyecto: 'TalentChain Bolivia',
    descripcion: 'Plataforma de verificación de credenciales académicas y profesionales usando blockchain',
    universidad: 'UNIFRANZ',
    carrera: 'Ingeniería de Sistemas',
    materia: 'Proyecto Integrador Intermedio I',
    semestre: '5to Semestre',
    gestion: 'I-2025',
    tecnologias: {
      frontend: 'React + Vite',
      backend: 'Node.js + Express + MySQL',
      blockchain: 'Ethereum + Solidity (próximamente)',
      baseDatos: 'MySQL + Sequelize'
    },
    objetivos: [
      'Eliminar fraude en credenciales académicas',
      'Acelerar procesos de verificación laboral',
      'Crear ecosistema de confianza profesional',
      'Democratizar oportunidades laborales'
    ]
  });
});

// Rutas de autenticación
const rutasAutenticacion = require('./rutas/autenticacion');
app.use('/auth', rutasAutenticacion);

// ========================================
// MANEJO DE ERRORES
// ========================================

// Middleware para rutas que no existen (Error 404)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe en nuestro servidor`,
    rutasDisponibles: [
      'GET /',
      'GET /estado',
      'GET /info'
    ],
    sugerencia: 'Verifica que la URL esté correcta'
  });
});

// Middleware para manejo de errores generales del servidor
app.use((error, req, res, next) => {
  console.error('❌ Error en el servidor:', error);
  
  // En desarrollo mostrar el error completo, en producción solo un mensaje genérico
  const esDesarrollo = process.env.MODO_ENTORNO === 'desarrollo';
  
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: esDesarrollo ? error.message : 'Algo salió mal, intenta de nuevo',
    fecha: new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' })
  });
});

// ========================================
// FUNCIÓN PARA INICIAR EL SERVIDOR
// ========================================

async function iniciarServidor() {
  try {
    console.log('🔍 Iniciando TalentChain Bolivia Backend...');
    console.log('');
    
    // PASO 1: Probar conexión a base de datos
    console.log('📊 Probando conexión a base de datos...');
    const baseDatosConectada = await probarConexion();
    
    if (!baseDatosConectada) {
      console.log('⚠️  Base de datos no conectada, pero el servidor arrancará de todas formas');
      console.log('💡 Para conectar MySQL:');
      console.log('   1. Abre XAMPP Control Panel');
      console.log('   2. Inicia Apache y MySQL');
      console.log('   3. Reinicia este servidor');
    }
    
    // PASO 2: Sincronizar base de datos (crear tablas)
    if (baseDatosConectada) {
      console.log('🔄 Sincronizando base de datos (creando tablas)...');
      await sincronizarBaseDatos();
    }
    
    // PASO 3: Iniciar el servidor web
    app.listen(PUERTO, () => {
      console.log('');
      console.log('🎉 ==========================================');
      console.log('    TALENTCHAIN BOLIVIA BACKEND INICIADO');
      console.log('🎉 ==========================================');
      console.log(`🚀 Servidor corriendo en: http://localhost:${PUERTO}`);
      console.log(`🌐 Frontend esperado en: ${process.env.URL_FRONTEND}`);
      console.log(`🗄️  Base de datos: ${baseDatosConectada ? 'Conectada ✅' : 'Desconectada ❌'}`);
      console.log(`📅 Iniciado: ${new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}`);
      console.log('==========================================');
      console.log('');
      console.log('📝 Rutas disponibles para probar:');
      console.log(`   GET  http://localhost:${PUERTO}/        - Información básica`);
      console.log(`   GET  http://localhost:${PUERTO}/estado  - Estado del servidor`);
      console.log(`   GET  http://localhost:${PUERTO}/info    - Información del proyecto`);
      console.log('');
      console.log('🔄 Para detener el servidor: Ctrl + C');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error crítico iniciando servidor:', error.message);
    console.log('💡 Posibles soluciones:');
    console.log('   - Verifica que el puerto 3000 no esté en uso');
    console.log('   - Revisa el archivo .env');
    console.log('   - Verifica las dependencias con: npm install');
    process.exit(1); // Salir del programa si hay error crítico
  }
}

// ¡INICIAR EL SERVIDOR!
iniciarServidor();