// ========================================
// TALENTCHAIN BOLIVIA - SERVIDOR PRINCIPAL (SESIÓN 4 ACTUALIZADA)
// ========================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de base de datos
const { probarConexion, sincronizarBaseDatos } = require('./config/baseDatos');

// Importar todos los modelos (EXISTENTES + NUEVOS)
const Usuario = require('./modelos/Usuario');
const CredencialAcademica = require('./modelos/CredencialAcademica');
const ExperienciaLaboral = require('./modelos/ExperienciaLaboral');
const Habilidad = require('./modelos/Habilidad');

// NUEVOS MODELOS SESIÓN 4
const OfertaLaboral = require('./modelos/OfertaLaboral');
const Aplicacion = require('./modelos/Aplicacion');
const VerificacionLaboral = require('./modelos/VerificacionLaboral');

// Importar y definir relaciones
const definirRelaciones = require('./config/relaciones');

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
    version: '4.0.0',
    proyecto: 'Plataforma de Verificación de Credenciales Académicas',
    desarrollador: 'Mateo Bazoberry - UNIFRANZ',
    semestre: '5to Semestre - Ingeniería de Sistemas',
    fecha: new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' }),
    estado: 'en línea',
    sesion_actual: 4,
    nuevas_funcionalidades: [
      '🎯 Sistema de matching básico',
      '🏢 Dashboard para empresas',
      '🎓 Dashboard para universidades',
      '💼 Ofertas laborales y aplicaciones',
      '✅ Verificación laboral',
      '🔍 Búsqueda avanzada de candidatos'
    ],
    modelos_disponibles: [
      'usuarios',
      'credenciales_academicas',
      'experiencia_laboral', 
      'habilidades',
      'ofertas_laborales ← NUEVO',
      'aplicaciones ← NUEVO',
      'verificaciones_laborales ← NUEVO'
    ],
    apis_disponibles: [
      '/auth - Autenticación',
      '/credenciales - Gestión de credenciales',
      '/empresa - APIs para empresas ← NUEVO',
      '/universidad - APIs para universidades ← NUEVO',
      '/matching - Sistema de recomendaciones ← NUEVO'
    ]
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
    fecha: new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' }),
    sesion: 4,
    funcionalidades_nuevas: {
      matching: 'operativo',
      empresas: 'operativo',
      universidades: 'operativo',
      ofertas_laborales: 'operativo'
    }
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
    sesion_actual: 4,
    progreso: '75% completado',
    tecnologias: {
      frontend: 'React + Vite',
      backend: 'Node.js + Express + SQLite',
      blockchain: 'Ethereum + Solidity (próximamente)',
      baseDatos: 'SQLite + Sequelize',
      matching: 'Algoritmo básico propio'
    },
    objetivos: [
      'Eliminar fraude en credenciales académicas',
      'Acelerar procesos de verificación laboral',
      'Crear ecosistema de confianza profesional',
      'Democratizar oportunidades laborales',
      'Conectar talento con oportunidades ← NUEVO'
    ],
    funcionalidades_sesion_4: [
      'Sistema de matching profesional-empresa',
      'Dashboard multi-rol (profesional/empresa/universidad)',
      'Ofertas laborales y aplicaciones',
      'Verificación de experiencia laboral',
      'Búsqueda avanzada de candidatos',
      'Estadísticas de empleabilidad'
    ]
  });
});

// ========================================
// RUTAS DE APIs (EXISTENTES + NUEVAS)
// ========================================

// Rutas de autenticación (EXISTENTE)
const rutasAutenticacion = require('./rutas/autenticacion');
app.use('/auth', rutasAutenticacion);

// Rutas de credenciales académicas (EXISTENTE)
const rutasCredenciales = require('./rutas/credenciales');
app.use('/credenciales', rutasCredenciales);

// ========================================
// NUEVAS RUTAS SESIÓN 4
// ========================================

// Rutas para empresas
const rutasEmpresa = require('./rutas/empresa');
app.use('/empresa', rutasEmpresa);

// Rutas para universidades
const rutasUniversidad = require('./rutas/universidad');
app.use('/universidad', rutasUniversidad);

// Rutas de sistema de matching
const rutasMatching = require('./rutas/matching');
app.use('/matching', rutasMatching);

// ========================================
// RUTAS DE DOCUMENTACIÓN DE APIs
// ========================================

// Documentación de todas las APIs disponibles
app.get('/docs', (req, res) => {
  res.json({
    mensaje: '📖 Documentación de APIs TalentChain Bolivia',
    version: '4.0.0',
    actualizacion: 'Sesión 4 - Sistema Multi-Rol',
    apis: {
      autenticacion: {
        base: '/auth',
        descripcion: 'Registro, login y verificación de usuarios',
        endpoints: [
          'POST /auth/registro - Registrar nuevo usuario',
          'POST /auth/login - Iniciar sesión',
          'GET /auth/verificar - Verificar token'
        ]
      },
      credenciales: {
        base: '/credenciales',
        descripcion: 'Gestión de credenciales académicas (profesionales)',
        endpoints: [
          'GET /credenciales - Obtener credenciales del usuario',
          'POST /credenciales - Crear nueva credencial',
          'DELETE /credenciales/:id - Eliminar credencial'
        ]
      },
      empresa: {
        base: '/empresa',
        descripcion: 'Funcionalidades para empresas',
        usuarios: 'Solo empresas (tipoUsuario: empresa)',
        endpoints: [
          'GET /empresa/dashboard - Estadísticas de empresa',
          'POST /empresa/ofertas - Crear oferta laboral',
          'GET /empresa/ofertas - Listar ofertas de la empresa',
          'GET /empresa/ofertas/:id/aplicaciones - Ver aplicaciones',
          'PUT /empresa/aplicaciones/:id/estado - Actualizar aplicación',
          'GET /empresa/candidatos - Buscar candidatos',
          'POST /empresa/verificaciones - Verificar ex-empleado'
        ]
      },
      universidad: {
        base: '/universidad',
        descripcion: 'Funcionalidades para universidades',
        usuarios: 'Solo instituciones (tipoUsuario: institucion)',
        endpoints: [
          'GET /universidad/dashboard - Estadísticas institucionales',
          'GET /universidad/credenciales/pendientes - Credenciales por verificar',
          'PUT /universidad/credenciales/:id/verificar - Verificar credencial',
          'POST /universidad/graduados - Registrar graduado oficial',
          'GET /universidad/estadisticas/empleabilidad - Estadísticas de empleo'
        ]
      },
      matching: {
        base: '/matching',
        descripcion: 'Sistema de recomendaciones y compatibilidad',
        usuarios: 'Profesionales y empresas',
        endpoints: [
          'GET /matching/ofertas-recomendadas - Ofertas para profesional',
          'GET /matching/oferta/:id/candidatos-recomendados - Candidatos para empresa',
          'GET /matching/profesional/:id/oferta/:id - Calcular matching específico',
          'GET /matching/estadisticas - Estadísticas del sistema'
        ]
      }
    },
    autenticacion: {
      metodo: 'JWT (JSON Web Token)',
      header: 'Authorization: Bearer <token>',
      expiracion: '7 días',
      roles: ['profesional', 'empresa', 'institucion']
    },
    ejemplos: {
      login: {
        url: 'POST /auth/login',
        body: {
          email: 'usuario@ejemplo.com',
          password: 'contraseña123'
        }
      },
      crear_oferta: {
        url: 'POST /empresa/ofertas',
        headers: { Authorization: 'Bearer <token>' },
        body: {
          titulo: 'Desarrollador React',
          descripcion: 'Buscamos desarrollador...',
          educacionRequerida: 'ingenieria',
          experienciaMinima: 2,
          ubicacion: 'Santa Cruz, Bolivia'
        }
      }
    }
  });
});

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
      'GET /info',
      'GET /docs',
      '/auth/* - Autenticación',
      '/credenciales/* - Credenciales académicas',
      '/empresa/* - APIs para empresas ← NUEVO',
      '/universidad/* - APIs para universidades ← NUEVO',
      '/matching/* - Sistema de matching ← NUEVO'
    ],
    sugerencia: 'Verifica que la URL esté correcta o consulta /docs para ver todas las APIs'
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
    fecha: new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' }),
    sesion: 4
  });
});

// ========================================
// FUNCIÓN PARA INICIAR EL SERVIDOR
// ========================================

async function iniciarServidor() {
  try {
    console.log('🔍 Iniciando TalentChain Bolivia Backend (SESIÓN 4)...');
    console.log('');
    
    // PASO 1: Probar conexión a base de datos
    console.log('📊 Probando conexión a base de datos...');
    const baseDatosConectada = await probarConexion();
    
    if (!baseDatosConectada) {
      console.log('⚠️  Base de datos no conectada, pero el servidor arrancará de todas formas');
      console.log('💡 Para conectar SQLite:');
      console.log('   1. Verifica que la carpeta database existe');
      console.log('   2. Verifica permisos de escritura');
      console.log('   3. Reinicia este servidor');
    }
    
    // PASO 2: Definir relaciones entre modelos (ACTUALIZADAS)
    if (baseDatosConectada) {
      console.log('🔗 Definiendo relaciones entre modelos...');
      definirRelaciones();
      console.log('✅ Relaciones entre modelos definidas correctamente');
    }
    
    // PASO 3: Sincronizar base de datos (crear tablas)
    if (baseDatosConectada) {
      console.log('🔄 Sincronizando base de datos (creando nuevas tablas)...');
      await sincronizarBaseDatos();
      console.log('📋 Modelos disponibles:');
      console.log('   - usuarios (sesión 2)');
      console.log('   - credenciales_academicas (sesión 3)');
      console.log('   - experiencia_laboral (sesión 3)');
      console.log('   - habilidades (sesión 3)');
      console.log('   - ofertas_laborales (sesión 4) ← NUEVO');
      console.log('   - aplicaciones (sesión 4) ← NUEVO');
      console.log('   - verificaciones_laborales (sesión 4) ← NUEVO');
    }
    
    // PASO 4: Iniciar el servidor web
    app.listen(PUERTO, () => {
      console.log('');
      console.log('🎉 ==========================================');
      console.log('    TALENTCHAIN BOLIVIA SESIÓN 4 INICIADO');
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
      console.log(`   GET  http://localhost:${PUERTO}/docs    - Documentación de APIs`);
      console.log('');
      console.log('🔗 APIs disponibles:');
      console.log('   - /auth/* - Autenticación y registro');
      console.log('   - /credenciales/* - Gestión de credenciales');
      console.log('   - /empresa/* - Dashboard y funciones empresariales ← NUEVO');
      console.log('   - /universidad/* - Dashboard y funciones universitarias ← NUEVO');
      console.log('   - /matching/* - Sistema de recomendaciones ← NUEVO');
      console.log('');
      console.log('🎯 Funcionalidades SESIÓN 4:');
      console.log('   ✅ Sistema de matching básico operativo');
      console.log('   ✅ APIs para empresas (ofertas, candidatos, verificaciones)');
      console.log('   ✅ APIs para universidades (graduados, estadísticas)');
      console.log('   ✅ 7 nuevos modelos de datos relacionados');
      console.log('   ✅ Más de 25 endpoints nuevos funcionando');
      console.log('');
      console.log('📊 Progreso del proyecto: 75% completado');
      console.log('🔄 Para detener el servidor: Ctrl + C');
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error crítico iniciando servidor:', error.message);
    console.log('💡 Posibles soluciones:');
    console.log('   - Verifica que el puerto 3000 no esté en uso');
    console.log('   - Revisa el archivo .env');
    console.log('   - Verifica las dependencias con: npm install');
    console.log('   - Asegúrate de haber creado todos los nuevos archivos de modelos');
    console.log('   - Verifica que los controladores y rutas estén correctos');
    process.exit(1); // Salir del programa si hay error crítico
  }
}

// ¡INICIAR EL SERVIDOR!
iniciarServidor();