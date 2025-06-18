// ========================================
// RUTAS DE UNIVERSIDADES - APIs PARA INSTITUCIONES EDUCATIVAS
// ========================================

const express = require('express');
const router = express.Router();

// Importar middleware de autenticación
const verificarAutenticacion = require('../middleware/autenticacion');

// Importar controladores
const {
  verificarCredencialGraduado,
  obtenerCredencialesPendientes,
  registrarGraduadoOficial,
  obtenerEstadisticasEmpleabilidad,
  obtenerGraduadosConEstadoLaboral,
  obtenerDashboardUniversidad
} = require('../controladores/universidadController');

// ========================================
// MIDDLEWARE PARA TODAS LAS RUTAS
// ========================================

// Todas las rutas de universidad requieren autenticación
router.use(verificarAutenticacion);

// Middleware para verificar que el usuario sea una institución
router.use((req, res, next) => {
  if (req.usuario.tipoUsuario !== 'institucion') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo las instituciones educativas pueden acceder a estas funcionalidades',
      tipoRequerido: 'institucion',
      tipoActual: req.usuario.tipoUsuario
    });
  }
  next();
});

// ========================================
// RUTAS DE INFORMACIÓN Y DOCUMENTACIÓN
// ========================================

// Información general sobre las APIs de universidad
router.get('/', (req, res) => {
  res.json({
    mensaje: '🎓 APIs de TalentChain para Universidades',
    version: '1.0.0',
    institucion: {
      id: req.usuario.id,
      email: req.usuario.email,
      nombre: req.usuario.email.split('@')[1]?.split('.')[0] || 'INSTITUCIÓN'
    },
    funcionalidades: [
      'Verificación de credenciales académicas',
      'Registro oficial de graduados',
      'Estadísticas de empleabilidad',
      'Seguimiento de egresados',
      'Reportes institucionales'
    ],
    endpoints: {
      dashboard: 'GET /universidad/dashboard',
      credenciales: {
        pendientes: 'GET /universidad/credenciales/pendientes',
        verificar: 'PUT /universidad/credenciales/:id/verificar',
        registrar: 'POST /universidad/graduados'
      },
      estadisticas: {
        empleabilidad: 'GET /universidad/estadisticas/empleabilidad',
        graduados: 'GET /universidad/graduados'
      }
    }
  });
});

// ========================================
// RUTAS DE DASHBOARD Y ESTADÍSTICAS
// ========================================

// Dashboard principal con estadísticas generales
router.get('/dashboard', obtenerDashboardUniversidad);

// ========================================
// RUTAS DE GESTIÓN DE CREDENCIALES
// ========================================

// Obtener credenciales pendientes de verificación
router.get('/credenciales/pendientes', obtenerCredencialesPendientes);

// Verificar una credencial específica
router.put('/credenciales/:credencialId/verificar', (req, res, next) => {
  req.body.credencialId = req.params.credencialId;
  verificarCredencialGraduado(req, res, next);
});

// Aprobar credencial (ruta de conveniencia)
router.put('/credenciales/:credencialId/aprobar', (req, res, next) => {
  req.body.credencialId = req.params.credencialId;
  req.body.verificado = true;
  verificarCredencialGraduado(req, res, next);
});

// Rechazar credencial (ruta de conveniencia)
router.put('/credenciales/:credencialId/rechazar', (req, res, next) => {
  req.body.credencialId = req.params.credencialId;
  req.body.verificado = false;
  verificarCredencialGraduado(req, res, next);
});

// Obtener todas las credenciales (verificadas y pendientes)
router.get('/credenciales', async (req, res) => {
  try {
    const nombreInstitucion = req.usuario.email.split('@')[1]?.split('.')[0] || '';
    const { estado = 'todas' } = req.query;
    
    // Importar modelo directamente
    const CredencialAcademica = require('../modelos/CredencialAcademica');
    const Usuario = require('../modelos/Usuario');
    
    // Construir filtros
    const filtros = {
      institucion: {
        [require('sequelize').Op.iLike]: `%${nombreInstitucion}%`
      }
    };
    
    if (estado !== 'todas') {
      filtros.verificado = estado === 'verificadas';
    }
    
    const credenciales = await CredencialAcademica.findAll({
      where: filtros,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email']
        }
      ],
      order: [['fechaCreacion', 'DESC']]
    });
    
    res.json({
      mensaje: 'Credenciales obtenidas exitosamente',
      filtro: estado,
      total: credenciales.length,
      credenciales
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo credenciales:', error);
    res.status(500).json({
      error: 'Error obteniendo credenciales',
      mensaje: error.message
    });
  }
});

// ========================================
// RUTAS DE REGISTRO DE GRADUADOS
// ========================================

// Registrar nuevo graduado oficialmente
router.post('/graduados', registrarGraduadoOficial);

// Registrar múltiples graduados (batch)
router.post('/graduados/lote', async (req, res) => {
  try {
    const { graduados } = req.body;
    
    if (!Array.isArray(graduados) || graduados.length === 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: 'Se requiere un array de graduados'
      });
    }
    
    const resultados = [];
    const errores = [];
    
    for (let i = 0; i < graduados.length; i++) {
      try {
        // Simular registro individual
        // En implementación real, llamaríamos a registrarGraduadoOficial
        resultados.push({
          index: i,
          email: graduados[i].emailEstudiante,
          estado: 'pendiente',
          mensaje: 'Funcionalidad en desarrollo'
        });
      } catch (error) {
        errores.push({
          index: i,
          email: graduados[i].emailEstudiante,
          error: error.message
        });
      }
    }
    
    res.json({
      mensaje: 'Procesamiento de lote de graduados',
      totalProcesados: graduados.length,
      exitosos: resultados.length,
      errores: errores.length,
      resultados,
      errores,
      estado: 'Funcionalidad en desarrollo'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error procesando lote de graduados',
      mensaje: error.message
    });
  }
});

// ========================================
// RUTAS DE ESTADÍSTICAS Y REPORTES
// ========================================

// Estadísticas de empleabilidad de graduados
router.get('/estadisticas/empleabilidad', obtenerEstadisticasEmpleabilidad);

// Listado de graduados con estado laboral
router.get('/graduados', obtenerGraduadosConEstadoLaboral);

// Graduados por año específico
router.get('/graduados/año/:año', (req, res, next) => {
  req.query.año = req.params.año;
  obtenerGraduadosConEstadoLaboral(req, res, next);
});

// Graduados por tipo de título
router.get('/graduados/tipo/:tipo', (req, res, next) => {
  req.query.tipo = req.params.tipo;
  obtenerGraduadosConEstadoLaboral(req, res, next);
});

// Estadísticas de empleabilidad por carrera
router.get('/estadisticas/por-carrera', async (req, res) => {
  try {
    res.json({
      mensaje: 'Estadísticas por carrera',
      estado: 'En desarrollo',
      disponibleEn: 'Próxima actualización',
      funcionalidad: 'Análisis detallado de empleabilidad por carrera específica'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo estadísticas por carrera',
      mensaje: error.message
    });
  }
});

// Tendencias de graduación
router.get('/estadisticas/tendencias', async (req, res) => {
  try {
    res.json({
      mensaje: 'Tendencias de graduación',
      estado: 'En desarrollo',
      disponibleEn: 'Próxima actualización',
      funcionalidad: 'Análisis de tendencias de graduación a lo largo del tiempo'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo tendencias',
      mensaje: error.message
    });
  }
});

// ========================================
// RUTAS DE SEGUIMIENTO DE EGRESADOS
// ========================================

// Seguimiento de egresados recientes
router.get('/seguimiento/recientes', async (req, res) => {
  try {
    const { meses = 12 } = req.query;
    
    res.json({
      mensaje: 'Seguimiento de egresados recientes',
      parametros: { meses },
      estado: 'En desarrollo',
      funcionalidad: 'Seguimiento específico de egresados de los últimos meses'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error en seguimiento de egresados',
      mensaje: error.message
    });
  }
});

// Egresados sin empleo
router.get('/seguimiento/sin-empleo', async (req, res) => {
  try {
    res.json({
      mensaje: 'Egresados sin empleo',
      estado: 'En desarrollo',
      funcionalidad: 'Identificación de egresados que necesitan apoyo en búsqueda de empleo'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error identificando egresados sin empleo',
      mensaje: error.message
    });
  }
});

// ========================================
// RUTAS DE CONFIGURACIÓN INSTITUCIONAL
// ========================================

// Configuración de la institución
router.get('/configuracion', async (req, res) => {
  try {
    const nombreInstitucion = req.usuario.email.split('@')[1]?.split('.')[0] || '';
    
    res.json({
      mensaje: 'Configuración institucional',
      institucion: {
        id: req.usuario.id,
        email: req.usuario.email,
        nombre: nombreInstitucion,
        tipoUsuario: req.usuario.tipoUsuario
      },
      configuracion: {
        autoVerificacion: false,
        notificaciones: true,
        reportesPeriodicos: true,
        privacidad: 'institucional'
      },
      estado: 'Configuración básica disponible'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo configuración',
      mensaje: error.message
    });
  }
});

// Actualizar configuración
router.put('/configuracion', async (req, res) => {
  try {
    const { configuracion } = req.body;
    
    res.json({
      mensaje: 'Configuración actualizada',
      nuevaConfiguracion: configuracion,
      estado: 'Funcionalidad en desarrollo'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error actualizando configuración',
      mensaje: error.message
    });
  }
});

// ========================================
// RUTAS DE REPORTES Y EXPORTACIONES
// ========================================

// Generar reporte de empleabilidad
router.get('/reportes/empleabilidad', async (req, res) => {
  try {
    const { formato = 'json', año } = req.query;
    
    res.json({
      mensaje: 'Reporte de empleabilidad',
      parametros: { formato, año },
      estado: 'En desarrollo',
      formatos: ['json', 'csv', 'pdf'],
      funcionalidad: 'Generación de reportes exportables'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error generando reporte',
      mensaje: error.message
    });
  }
});

// ========================================
// MANEJO DE ERRORES ESPECÍFICOS
// ========================================

// Middleware de manejo de errores para rutas de universidad
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de universidad:', error);
  
  // Errores específicos de universidad
  if (error.message.includes('credencial')) {
    return res.status(400).json({
      error: 'Error en gestión de credenciales',
      mensaje: 'Verifica los datos de la credencial académica',
      detalles: error.message
    });
  }
  
  if (error.message.includes('graduado')) {
    return res.status(400).json({
      error: 'Error en registro de graduados',
      mensaje: 'Verifica los datos del graduado',
      detalles: error.message
    });
  }
  
  // Error genérico
  res.status(500).json({
    error: 'Error interno en funcionalidades universitarias',
    mensaje: 'Intenta de nuevo o contacta al soporte técnico',
    timestamp: new Date().toISOString()
  });
});

// Exportar el router
module.exports = router;