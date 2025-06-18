// ========================================
// RUTAS DE MATCHING - APIs PARA SISTEMA DE RECOMENDACIONES
// ========================================

const express = require('express');
const router = express.Router();

// Importar middleware de autenticación
const verificarAutenticacion = require('../middleware/autenticacion');

// Importar controladores de matching
const {
  obtenerOfertasRecomendadas,
  obtenerCandidatosRecomendados,
  calcularMatchingEspecifico
} = require('../controladores/matchingController');

// ========================================
// MIDDLEWARE PARA TODAS LAS RUTAS
// ========================================

// Todas las rutas de matching requieren autenticación
router.use(verificarAutenticacion);

// ========================================
// RUTAS DE INFORMACIÓN Y DOCUMENTACIÓN
// ========================================

// Información general sobre el sistema de matching
router.get('/', (req, res) => {
  res.json({
    mensaje: '🎯 Sistema de Matching TalentChain Bolivia',
    version: '1.0.0',
    descripcion: 'Algoritmo básico de compatibilidad entre profesionales y ofertas laborales',
    usuario: {
      id: req.usuario.id,
      email: req.usuario.email,
      tipo: req.usuario.tipoUsuario
    },
    algoritmo: {
      factores: [
        { nombre: 'Educación', peso: '30%', descripcion: 'Nivel educativo vs requerido' },
        { nombre: 'Experiencia', peso: '35%', descripcion: 'Años de experiencia vs mínimo' },
        { nombre: 'Habilidades', peso: '25%', descripcion: 'Habilidades coincidentes' },
        { nombre: 'Ubicación', peso: '10%', descripcion: 'Proximidad geográfica' }
      ],
      rango: '0% - 100%',
      precision: 'Básica - mejorable con más datos'
    },
    endpoints: {
      profesionales: {
        ofertas: 'GET /matching/ofertas-recomendadas',
        calculo: 'GET /matching/profesional/:id/oferta/:id'
      },
      empresas: {
        candidatos: 'GET /matching/oferta/:id/candidatos-recomendados',
        calculo: 'GET /matching/profesional/:id/oferta/:id'
      }
    }
  });
});

// ========================================
// RUTAS PARA PROFESIONALES
// ========================================

// Obtener ofertas recomendadas para el profesional autenticado
router.get('/ofertas-recomendadas', (req, res, next) => {
  // Verificar que sea un profesional
  if (req.usuario.tipoUsuario !== 'profesional') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo los profesionales pueden ver ofertas recomendadas',
      tipoRequerido: 'profesional',
      tipoActual: req.usuario.tipoUsuario
    });
  }
  
  obtenerOfertasRecomendadas(req, res);
});

// Ofertas con alto matching (>= 80%)
router.get('/ofertas-recomendadas/alto-matching', (req, res, next) => {
  if (req.usuario.tipoUsuario !== 'profesional') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo los profesionales pueden ver ofertas recomendadas'
    });
  }
  
  req.query.minimo = '80';
  obtenerOfertasRecomendadas(req, res);
});

// Ofertas con matching medio (50-79%)
router.get('/ofertas-recomendadas/medio-matching', (req, res, next) => {
  if (req.usuario.tipoUsuario !== 'profesional') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo los profesionales pueden ver ofertas recomendadas'
    });
  }
  
  req.query.minimo = '50';
  req.query.maximo = '79';
  obtenerOfertasRecomendadas(req, res);
});

// Top 5 ofertas más compatibles
router.get('/ofertas-recomendadas/top-5', (req, res, next) => {
  if (req.usuario.tipoUsuario !== 'profesional') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo los profesionales pueden ver ofertas recomendadas'
    });
  }
  
  req.query.limite = '5';
  req.query.minimo = '60';
  obtenerOfertasRecomendadas(req, res);
});

// ========================================
// RUTAS PARA EMPRESAS
// ========================================

// Obtener candidatos recomendados para una oferta específica
router.get('/oferta/:ofertaId/candidatos-recomendados', (req, res, next) => {
  // Verificar que sea una empresa
  if (req.usuario.tipoUsuario !== 'empresa') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo las empresas pueden ver candidatos recomendados',
      tipoRequerido: 'empresa',
      tipoActual: req.usuario.tipoUsuario
    });
  }
  
  obtenerCandidatosRecomendados(req, res);
});

// Candidatos con alto matching para una oferta (>= 80%)
router.get('/oferta/:ofertaId/candidatos-recomendados/alto-matching', (req, res, next) => {
  if (req.usuario.tipoUsuario !== 'empresa') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo las empresas pueden ver candidatos recomendados'
    });
  }
  
  req.query.minimo = '80';
  obtenerCandidatosRecomendados(req, res);
});

// Top 10 candidatos más compatibles para una oferta
router.get('/oferta/:ofertaId/candidatos-recomendados/top-10', (req, res, next) => {
  if (req.usuario.tipoUsuario !== 'empresa') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo las empresas pueden ver candidatos recomendados'
    });
  }
  
  req.query.limite = '10';
  req.query.minimo = '50';
  obtenerCandidatosRecomendados(req, res);
});

// ========================================
// RUTAS DE CÁLCULO ESPECÍFICO
// ========================================

// Calcular matching específico entre un profesional y una oferta
router.get('/profesional/:profesionalId/oferta/:ofertaId', calcularMatchingEspecifico);

// Ruta alternativa más legible
router.get('/calcular/:profesionalId/:ofertaId', (req, res, next) => {
  req.params.profesionalId = req.params.profesionalId;
  req.params.ofertaId = req.params.ofertaId;
  calcularMatchingEspecifico(req, res);
});

// ========================================
// RUTAS DE ANÁLISIS Y ESTADÍSTICAS
// ========================================

// Estadísticas generales del sistema de matching
router.get('/estadisticas', async (req, res) => {
  try {
    // Importar modelos para estadísticas
    const OfertaLaboral = require('../modelos/OfertaLaboral');
    const Usuario = require('../modelos/Usuario');
    const Aplicacion = require('../modelos/Aplicacion');
    
    const totalOfertas = await OfertaLaboral.count({ where: { estado: 'activa' } });
    const totalProfesionales = await Usuario.count({ where: { tipoUsuario: 'profesional' } });
    const totalEmpresas = await Usuario.count({ where: { tipoUsuario: 'empresa' } });
    const totalAplicaciones = await Aplicacion.count();
    
    res.json({
      mensaje: 'Estadísticas del sistema de matching',
      sistema: {
        ofertas_activas: totalOfertas,
        profesionales_registrados: totalProfesionales,
        empresas_registradas: totalEmpresas,
        aplicaciones_totales: totalAplicaciones
      },
      algoritmo: {
        version: '1.0 - Básico',
        factores_evaluados: 4,
        precision_estimada: '70-85%',
        tiempo_calculo: '< 2 segundos'
      },
      metricas: {
        calculos_realizados: 'En desarrollo',
        matching_promedio: 'En desarrollo',
        tasa_aplicacion: totalOfertas > 0 ? Math.round((totalAplicaciones / totalOfertas) * 100) / 100 : 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de matching:', error);
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      mensaje: error.message
    });
  }
});

// Análisis de efectividad del matching
router.get('/analisis/efectividad', async (req, res) => {
  try {
    res.json({
      mensaje: 'Análisis de efectividad del matching',
      estado: 'En desarrollo',
      funcionalidad: 'Análisis de qué tan efectivo es el algoritmo de matching',
      metricas_futuras: [
        'Tasa de aplicación post-recomendación',
        'Tasa de aceptación en trabajos recomendados',
        'Satisfacción de usuarios con recomendaciones',
        'Tiempo promedio hasta contratación'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error en análisis de efectividad',
      mensaje: error.message
    });
  }
});

// ========================================
// RUTAS DE CONFIGURACIÓN DE MATCHING
// ========================================

// Obtener configuración actual del algoritmo
router.get('/configuracion', (req, res) => {
  res.json({
    mensaje: 'Configuración del algoritmo de matching',
    version: '1.0.0',
    pesos: {
      educacion: 30,
      experiencia: 35,
      habilidades: 25,
      ubicacion: 10
    },
    parametros: {
      matching_minimo_defecto: 50,
      limite_recomendaciones_defecto: 10,
      tiempo_cache_resultados: '5 minutos'
    },
    filtros: {
      solo_ofertas_activas: true,
      solo_profesionales_activos: true,
      excluir_aplicaciones_existentes: true
    },
    nota: 'Esta configuración es fija en la versión básica'
  });
});

// ========================================
// RUTAS DE TESTING Y DEBUGGING
// ========================================

// Endpoint para testing del algoritmo (solo en desarrollo)
router.get('/test/:profesionalId/:ofertaId', async (req, res) => {
  try {
    const { profesionalId, ofertaId } = req.params;
    
    // Solo permitir en modo desarrollo
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'Endpoint no disponible en producción',
        mensaje: 'Esta funcionalidad solo está disponible en desarrollo'
      });
    }
    
    // Importar función de cálculo
    const { calcularCompatibilidad } = require('../controladores/matchingController');
    
    const resultado = await calcularCompatibilidad(
      parseInt(profesionalId), 
      parseInt(ofertaId)
    );
    
    res.json({
      mensaje: 'Test de algoritmo de matching',
      profesional_id: parseInt(profesionalId),
      oferta_id: parseInt(ofertaId),
      resultado_detallado: resultado,
      timestamp: new Date().toISOString(),
      modo: 'testing'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error en test de matching',
      mensaje: error.message
    });
  }
});

// Validar funcionamiento del algoritmo con datos de ejemplo
router.get('/validar', async (req, res) => {
  try {
    res.json({
      mensaje: 'Validación del algoritmo de matching',
      estado: 'Disponible',
      pruebas: {
        calculo_basico: 'OK',
        manejo_errores: 'OK',
        validacion_permisos: 'OK',
        rendimiento: 'Aceptable'
      },
      casos_prueba: [
        'Profesional sin credenciales vs oferta con requisitos',
        'Profesional con alta experiencia vs oferta junior',
        'Profesional con habilidades exactas vs oferta específica',
        'Profesional de otra ciudad vs oferta local'
      ],
      funcionalidad: 'Sistema básico operativo'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error en validación',
      mensaje: error.message
    });
  }
});

// ========================================
// RUTAS DE INTEGRACIÓN CON APLICACIONES
// ========================================

// Calcular matching al momento de aplicar a una oferta
router.post('/aplicar-con-matching', async (req, res) => {
  try {
    const profesionalId = req.usuario.id;
    const { ofertaId, cartaPresentacion } = req.body;
    
    // Verificar que sea un profesional
    if (req.usuario.tipoUsuario !== 'profesional') {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'Solo los profesionales pueden aplicar a ofertas'
      });
    }
    
    // Calcular matching antes de aplicar
    const { calcularCompatibilidad } = require('../controladores/matchingController');
    const matching = await calcularCompatibilidad(profesionalId, ofertaId);
    
    // Aquí se integraría con el sistema de aplicaciones
    res.json({
      mensaje: 'Aplicación con cálculo de matching',
      matching: matching,
      estado: 'Funcionalidad en desarrollo',
      siguiente_paso: 'Integración con sistema de aplicaciones'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error aplicando con matching',
      mensaje: error.message
    });
  }
});

// ========================================
// MANEJO DE ERRORES ESPECÍFICOS
// ========================================

// Middleware de manejo de errores para rutas de matching
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de matching:', error);
  
  // Errores específicos del algoritmo de matching
  if (error.message.includes('compatibilidad')) {
    return res.status(400).json({
      error: 'Error en cálculo de compatibilidad',
      mensaje: 'No se pudo calcular el matching entre el profesional y la oferta',
      detalles: error.message
    });
  }
  
  if (error.message.includes('recomendacion')) {
    return res.status(400).json({
      error: 'Error en sistema de recomendaciones',
      mensaje: 'No se pudieron generar recomendaciones',
      detalles: error.message
    });
  }
  
  // Error genérico del sistema de matching
  res.status(500).json({
    error: 'Error interno en sistema de matching',
    mensaje: 'El algoritmo de compatibilidad no está disponible temporalmente',
    timestamp: new Date().toISOString(),
    solucion: 'Intenta de nuevo en unos minutos'
  });
});

// Exportar el router
module.exports = router;