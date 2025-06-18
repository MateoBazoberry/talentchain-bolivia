// ========================================
// RUTAS DE EMPRESAS - APIs PARA GESTIÓN EMPRESARIAL
// ========================================

const express = require('express');
const router = express.Router();

// Importar middleware de autenticación
const verificarAutenticacion = require('../middleware/autenticacion');

// Importar controladores
const {
  crearOfertaLaboral,
  obtenerOfertasEmpresa,
  obtenerAplicacionesOferta,
  actualizarEstadoAplicacion,
  verificarExEmpleado,
  obtenerVerificacionesHechas,
  buscarCandidatos,
  obtenerPerfilCandidato,
  obtenerEstadisticasEmpresa
} = require('../controladores/empresaController');

// ========================================
// MIDDLEWARE PARA TODAS LAS RUTAS
// ========================================

// Todas las rutas de empresa requieren autenticación
router.use(verificarAutenticacion);

// Middleware para verificar que el usuario sea una empresa
router.use((req, res, next) => {
  if (req.usuario.tipoUsuario !== 'empresa') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo las empresas pueden acceder a estas funcionalidades',
      tipoRequerido: 'empresa',
      tipoActual: req.usuario.tipoUsuario
    });
  }
  next();
});

// ========================================
// RUTAS DE INFORMACIÓN Y DOCUMENTACIÓN
// ========================================

// Información general sobre las APIs de empresa
router.get('/', (req, res) => {
  res.json({
    mensaje: '🏢 APIs de TalentChain para Empresas',
    version: '1.0.0',
    empresa: {
      id: req.usuario.id,
      email: req.usuario.email
    },
    funcionalidades: [
      'Gestión de ofertas laborales',
      'Revisión de aplicaciones',
      'Búsqueda de candidatos',
      'Verificación de ex-empleados',
      'Estadísticas y reportes'
    ],
    endpoints: {
      dashboard: 'GET /empresa/dashboard',
      ofertas: {
        crear: 'POST /empresa/ofertas',
        listar: 'GET /empresa/ofertas',
        aplicaciones: 'GET /empresa/ofertas/:id/aplicaciones'
      },
      candidatos: {
        buscar: 'GET /empresa/candidatos',
        perfil: 'GET /empresa/candidatos/:id'
      },
      verificaciones: {
        crear: 'POST /empresa/verificaciones',
        listar: 'GET /empresa/verificaciones'
      }
    }
  });
});

// ========================================
// RUTAS DE DASHBOARD Y ESTADÍSTICAS
// ========================================

// Dashboard principal con estadísticas
router.get('/dashboard', obtenerEstadisticasEmpresa);

// ========================================
// RUTAS DE OFERTAS LABORALES
// ========================================

// Crear nueva oferta laboral
router.post('/ofertas', crearOfertaLaboral);

// Obtener todas las ofertas de la empresa
router.get('/ofertas', obtenerOfertasEmpresa);

// Obtener ofertas con filtros específicos
router.get('/ofertas/activas', (req, res, next) => {
  req.query.estado = 'activa';
  next();
}, obtenerOfertasEmpresa);

router.get('/ofertas/cerradas', (req, res, next) => {
  req.query.estado = 'cerrada';
  next();
}, obtenerOfertasEmpresa);

// Obtener aplicaciones para una oferta específica
router.get('/ofertas/:ofertaId/aplicaciones', obtenerAplicacionesOferta);

// Obtener aplicaciones con estados específicos
router.get('/ofertas/:ofertaId/aplicaciones/pendientes', (req, res, next) => {
  req.query.estado = 'enviada';
  next();
}, obtenerAplicacionesOferta);

router.get('/ofertas/:ofertaId/aplicaciones/aceptadas', (req, res, next) => {
  req.query.estado = 'aceptada';
  next();
}, obtenerAplicacionesOferta);

// ========================================
// RUTAS DE GESTIÓN DE APLICACIONES
// ========================================

// Actualizar estado de una aplicación
router.put('/aplicaciones/:aplicacionId/estado', actualizarEstadoAplicacion);

// Rutas de conveniencia para cambios de estado comunes
router.put('/aplicaciones/:aplicacionId/aceptar', (req, res, next) => {
  req.body.estado = 'aceptada';
  next();
}, actualizarEstadoAplicacion);

router.put('/aplicaciones/:aplicacionId/rechazar', (req, res, next) => {
  req.body.estado = 'rechazada';
  next();
}, actualizarEstadoAplicacion);

router.put('/aplicaciones/:aplicacionId/entrevista', (req, res, next) => {
  req.body.estado = 'entrevista';
  next();
}, actualizarEstadoAplicacion);

// ========================================
// RUTAS DE BÚSQUEDA DE CANDIDATOS
// ========================================

// Búsqueda general de candidatos
router.get('/candidatos', buscarCandidatos);

// Búsqueda con filtros específicos
router.get('/candidatos/ingenieros', (req, res, next) => {
  req.query.educacion = 'ingenieria';
  next();
}, buscarCandidatos);

router.get('/candidatos/licenciados', (req, res, next) => {
  req.query.educacion = 'licenciatura';
  next();
}, buscarCandidatos);

router.get('/candidatos/con-experiencia', (req, res, next) => {
  req.query.experienciaMinima = req.query.experienciaMinima || '1';
  next();
}, buscarCandidatos);

// Obtener perfil completo de un candidato específico
router.get('/candidatos/:candidatoId', obtenerPerfilCandidato);

// ========================================
// RUTAS DE VERIFICACIÓN LABORAL
// ========================================

// Verificar experiencia laboral de un ex-empleado
router.post('/verificaciones', verificarExEmpleado);

// Obtener todas las verificaciones hechas por la empresa
router.get('/verificaciones', obtenerVerificacionesHechas);

// ========================================
// RUTAS DE RECOMENDACIONES Y MATCHING
// ========================================

// Estas rutas se conectarán con el controlador de matching
// que crearemos después

// Obtener candidatos recomendados para una oferta específica
router.get('/ofertas/:ofertaId/candidatos-recomendados', async (req, res) => {
  try {
    // Importar controlador de matching dinámicamente para evitar dependencias circulares
    const { obtenerCandidatosRecomendados } = require('../controladores/matchingController');
    await obtenerCandidatosRecomendados(req, res);
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo recomendaciones',
      mensaje: 'El sistema de matching no está disponible temporalmente'
    });
  }
});

// ========================================
// RUTAS DE ESTADÍSTICAS AVANZADAS
// ========================================

// Estadísticas de contratación por período
router.get('/estadisticas/contratacion', async (req, res) => {
  try {
    const empresaId = req.usuario.id;
    const { periodo = '30' } = req.query; // días
    
    // Aquí podríamos agregar lógica más específica de estadísticas
    res.json({
      mensaje: 'Funcionalidad en desarrollo',
      parametros: { empresaId, periodo },
      disponibleEn: 'Próxima actualización'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      mensaje: error.message
    });
  }
});

// Estadísticas de ofertas más exitosas
router.get('/estadisticas/ofertas-exitosas', async (req, res) => {
  try {
    res.json({
      mensaje: 'Estadísticas de ofertas exitosas',
      estado: 'En desarrollo',
      disponibleEn: 'Próxima actualización'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      mensaje: error.message
    });
  }
});

// ========================================
// RUTAS DE CONFIGURACIÓN DE EMPRESA
// ========================================

// Obtener configuración de la empresa
router.get('/configuracion', async (req, res) => {
  try {
    res.json({
      mensaje: 'Configuración de empresa',
      empresa: {
        id: req.usuario.id,
        email: req.usuario.email,
        tipoUsuario: req.usuario.tipoUsuario
      },
      configuracion: {
        notificaciones: true,
        privacidad: 'empresa',
        idioma: 'es'
      },
      estado: 'Funcionalidad básica disponible'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo configuración',
      mensaje: error.message
    });
  }
});

// ========================================
// MANEJO DE ERRORES ESPECÍFICOS
// ========================================

// Middleware de manejo de errores para rutas de empresa
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de empresa:', error);
  
  // Errores específicos de empresa
  if (error.message.includes('oferta')) {
    return res.status(400).json({
      error: 'Error en gestión de ofertas',
      mensaje: 'Verifica los datos de la oferta laboral',
      detalles: error.message
    });
  }
  
  if (error.message.includes('candidato')) {
    return res.status(400).json({
      error: 'Error en búsqueda de candidatos',
      mensaje: 'Verifica los filtros de búsqueda',
      detalles: error.message
    });
  }
  
  // Error genérico
  res.status(500).json({
    error: 'Error interno en funcionalidades de empresa',
    mensaje: 'Intenta de nuevo o contacta al soporte técnico',
    timestamp: new Date().toISOString()
  });
});

// Exportar el router
module.exports = router;