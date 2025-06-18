// ========================================
// CONTROLADOR DE MATCHING - ALGORITMO BÁSICO DE COMPATIBILIDAD
// ========================================

const Usuario = require('../modelos/Usuario');
const OfertaLaboral = require('../modelos/OfertaLaboral');
const CredencialAcademica = require('../modelos/CredencialAcademica');
const ExperienciaLaboral = require('../modelos/ExperienciaLaboral');
const Habilidad = require('../modelos/Habilidad');
const Aplicacion = require('../modelos/Aplicacion');

// ========================================
// ALGORITMO BÁSICO DE MATCHING
// ========================================

/**
 * Calcula la compatibilidad entre un profesional y una oferta laboral
 * Retorna un porcentaje de 0 a 100
 */
async function calcularCompatibilidad(profesionalId, ofertaId) {
  try {
    // Obtener datos del profesional
    const profesional = await Usuario.findByPk(profesionalId, {
      include: [
        { model: CredencialAcademica, as: 'credencialesAcademicas' },
        { model: ExperienciaLaboral, as: 'experienciaLaboral' },
        { model: Habilidad, as: 'habilidades' }
      ]
    });

    // Obtener datos de la oferta
    const oferta = await OfertaLaboral.findByPk(ofertaId);

    if (!profesional || !oferta) {
      throw new Error('Profesional u oferta no encontrados');
    }

    // Variables para calcular el puntaje
    let puntajeTotal = 0;
    const pesos = {
      educacion: 0.30,    // 30% del puntaje
      experiencia: 0.35,  // 35% del puntaje
      habilidades: 0.25,  // 25% del puntaje
      ubicacion: 0.10     // 10% del puntaje
    };

    // ========================================
    // 1. EVALUACIÓN DE EDUCACIÓN (30%)
    // ========================================
    const puntajeEducacion = evaluarEducacion(
      profesional.credencialesAcademicas, 
      oferta.educacionRequerida
    );
    puntajeTotal += puntajeEducacion * pesos.educacion;

    // ========================================
    // 2. EVALUACIÓN DE EXPERIENCIA (35%)
    // ========================================
    const puntajeExperiencia = evaluarExperiencia(
      profesional.experienciaLaboral, 
      oferta.experienciaMinima
    );
    puntajeTotal += puntajeExperiencia * pesos.experiencia;

    // ========================================
    // 3. EVALUACIÓN DE HABILIDADES (25%)
    // ========================================
    const puntajeHabilidades = evaluarHabilidades(
      profesional.habilidades, 
      oferta.habilidadesRequeridas || []
    );
    puntajeTotal += puntajeHabilidades * pesos.habilidades;

    // ========================================
    // 4. EVALUACIÓN DE UBICACIÓN (10%)
    // ========================================
    const puntajeUbicacion = evaluarUbicacion(
      profesional, // Podríamos agregar campo ubicacion al modelo Usuario
      oferta.ubicacion
    );
    puntajeTotal += puntajeUbicacion * pesos.ubicacion;

    // Convertir a porcentaje y redondear
    const porcentajeFinal = Math.round(puntajeTotal * 100);

    return {
      porcentajeMatching: Math.min(100, Math.max(0, porcentajeFinal)),
      detalles: {
        educacion: Math.round(puntajeEducacion * 100),
        experiencia: Math.round(puntajeExperiencia * 100),
        habilidades: Math.round(puntajeHabilidades * 100),
        ubicacion: Math.round(puntajeUbicacion * 100)
      }
    };

  } catch (error) {
    console.error('❌ Error calculando compatibilidad:', error);
    return {
      porcentajeMatching: 0,
      detalles: {
        educacion: 0,
        experiencia: 0,
        habilidades: 0,
        ubicacion: 0
      },
      error: error.message
    };
  }
}

// ========================================
// FUNCIONES DE EVALUACIÓN INDIVIDUAL
// ========================================

/**
 * Evalúa el nivel educativo del profesional vs lo requerido
 * Retorna un valor de 0 a 1
 */
function evaluarEducacion(credenciales, educacionRequerida) {
  if (!credenciales || credenciales.length === 0) {
    return 0; // Sin credenciales = 0 puntos
  }

  // Jerarquía de niveles educativos (de menor a mayor)
  const nivelesEducativos = {
    'bachillerato': 1,
    'tecnico': 2,
    'licenciatura': 3,
    'ingenieria': 4,
    'maestria': 5,
    'doctorado': 6
  };

  // Obtener el nivel más alto del profesional
  let nivelMaximoProfesional = 0;
  credenciales.forEach(credencial => {
    const nivel = nivelesEducativos[credencial.tipo] || 0;
    if (nivel > nivelMaximoProfesional) {
      nivelMaximoProfesional = nivel;
    }
  });

  const nivelRequerido = nivelesEducativos[educacionRequerida] || 3;

  // Calcular puntaje
  if (nivelMaximoProfesional >= nivelRequerido) {
    // Si cumple o supera el requisito
    const exceso = nivelMaximoProfesional - nivelRequerido;
    return Math.min(1.0, 0.8 + (exceso * 0.05)); // Base 80% + bonus por exceso
  } else {
    // Si no cumple el requisito
    const deficiencia = nivelRequerido - nivelMaximoProfesional;
    return Math.max(0, 0.5 - (deficiencia * 0.15)); // Penalización por deficiencia
  }
}

/**
 * Evalúa la experiencia laboral del profesional vs lo requerido
 * Retorna un valor de 0 a 1
 */
function evaluarExperiencia(experienciaLaboral, experienciaMinima) {
  if (!experienciaLaboral || experienciaLaboral.length === 0) {
    return experienciaMinima === 0 ? 0.8 : 0; // Si no requiere experiencia, dar algo de puntaje
  }

  // Calcular años totales de experiencia
  let añosTotales = 0;
  experienciaLaboral.forEach(exp => {
    const inicio = new Date(exp.fechaInicio);
    const fin = exp.fechaFin ? new Date(exp.fechaFin) : new Date();
    const años = (fin - inicio) / (1000 * 60 * 60 * 24 * 365.25);
    añosTotales += Math.max(0, años);
  });

  // Calcular puntaje
  if (añosTotales >= experienciaMinima) {
    // Cumple o supera la experiencia requerida
    if (experienciaMinima === 0) return 1.0;
    
    const ratio = añosTotales / experienciaMinima;
    return Math.min(1.0, 0.7 + (ratio - 1) * 0.1); // Base 70% + bonus
  } else {
    // No cumple la experiencia mínima
    if (experienciaMinima === 0) return 0.8;
    
    const ratio = añosTotales / experienciaMinima;
    return ratio * 0.6; // Puntaje proporcional hasta 60%
  }
}

/**
 * Evalúa las habilidades del profesional vs las requeridas
 * Retorna un valor de 0 a 1
 */
function evaluarHabilidades(habilidadesProfesional, habilidadesRequeridas) {
  if (!habilidadesRequeridas || habilidadesRequeridas.length === 0) {
    return 1.0; // Si no se requieren habilidades específicas, puntaje perfecto
  }

  if (!habilidadesProfesional || habilidadesProfesional.length === 0) {
    return 0; // Sin habilidades registradas
  }

  // Convertir habilidades del profesional a un mapa para búsqueda rápida
  const habilidadesMap = {};
  habilidadesProfesional.forEach(hab => {
    const nombreLower = hab.nombre.toLowerCase();
    habilidadesMap[nombreLower] = hab.nivel || 'basico';
  });

  // Calcular coincidencias
  let habilidadesCoincidentes = 0;
  let bonusPorNivel = 0;

  habilidadesRequeridas.forEach(habilidadRequerida => {
    const nombreRequeridoLower = habilidadRequerida.toLowerCase();
    
    if (habilidadesMap[nombreRequeridoLower]) {
      habilidadesCoincidentes++;
      
      // Bonus por nivel de habilidad
      const nivel = habilidadesMap[nombreRequeridoLower];
      if (nivel === 'experto') bonusPorNivel += 0.3;
      else if (nivel === 'avanzado') bonusPorNivel += 0.2;
      else if (nivel === 'intermedio') bonusPorNivel += 0.1;
      // 'basico' no da bonus
    }
  });

  // Calcular puntaje base
  const porcentajeCoincidencia = habilidadesCoincidentes / habilidadesRequeridas.length;
  
  // Agregar bonus por nivel (limitado)
  const bonusTotal = Math.min(0.2, bonusPorNivel / habilidadesRequeridas.length);
  
  return Math.min(1.0, porcentajeCoincidencia + bonusTotal);
}

/**
 * Evalúa la ubicación del profesional vs la oferta
 * Retorna un valor de 0 a 1
 */
function evaluarUbicacion(profesional, ubicacionOferta) {
  // Por ahora, evaluación simple
  // En el futuro podríamos agregar campo 'ubicacion' al modelo Usuario
  
  // Evaluación básica: si no especifica ubicación, asumir disponibilidad
  if (!ubicacionOferta) {
    return 1.0;
  }

  // Por ahora, dar puntaje medio ya que no tenemos ubicación del profesional
  // Esto se puede mejorar agregando campos de ubicación al perfil
  return 0.7;
}

// ========================================
// API ENDPOINTS PARA MATCHING
// ========================================

/**
 * Obtener ofertas recomendadas para un profesional
 */
async function obtenerOfertasRecomendadas(req, res) {
  try {
    const profesionalId = req.usuario.id;
    const limite = parseInt(req.query.limite) || 10;
    const porcentajeMinimo = parseInt(req.query.minimo) || 50;

    // Verificar que sea un profesional
    if (req.usuario.tipoUsuario !== 'profesional') {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'Solo los profesionales pueden ver recomendaciones de ofertas'
      });
    }

    // Obtener ofertas activas
    const ofertasActivas = await OfertaLaboral.findAll({
      where: { estado: 'activa' },
      include: [
        {
          model: Usuario,
          as: 'empresa',
          attributes: ['id', 'email']
        }
      ],
      limit: 50 // Limitar para no sobrecargar
    });

    // Calcular matching para cada oferta
    const ofertasConMatching = [];
    
    for (const oferta of ofertasActivas) {
      const matching = await calcularCompatibilidad(profesionalId, oferta.id);
      
      if (matching.porcentajeMatching >= porcentajeMinimo) {
        ofertasConMatching.push({
          ...oferta.toJSON(),
          porcentajeMatching: matching.porcentajeMatching,
          detallesMatching: matching.detalles
        });
      }
    }

    // Ordenar por porcentaje de matching (mayor a menor)
    ofertasConMatching.sort((a, b) => b.porcentajeMatching - a.porcentajeMatching);

    // Limitar resultados
    const ofertasRecomendadas = ofertasConMatching.slice(0, limite);

    res.json({
      mensaje: 'Ofertas recomendadas obtenidas exitosamente',
      total: ofertasRecomendadas.length,
      totalEvaluadas: ofertasActivas.length,
      porcentajeMinimo: porcentajeMinimo,
      ofertas: ofertasRecomendadas
    });

  } catch (error) {
    console.error('❌ Error obteniendo ofertas recomendadas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener las recomendaciones'
    });
  }
}

/**
 * Obtener candidatos recomendados para una oferta (para empresas)
 */
async function obtenerCandidatosRecomendados(req, res) {
  try {
    const { ofertaId } = req.params;
    const limite = parseInt(req.query.limite) || 10;
    const porcentajeMinimo = parseInt(req.query.minimo) || 60;
    const empresaId = req.usuario.id;

    // Verificar que sea una empresa
    if (req.usuario.tipoUsuario !== 'empresa') {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'Solo las empresas pueden ver candidatos recomendados'
      });
    }

    // Verificar que la oferta pertenece a esta empresa
    const oferta = await OfertaLaboral.findOne({
      where: { 
        id: ofertaId, 
        empresaId: empresaId 
      }
    });

    if (!oferta) {
      return res.status(404).json({
        error: 'Oferta no encontrada',
        mensaje: 'La oferta no existe o no te pertenece'
      });
    }

    // Obtener profesionales activos
    const profesionales = await Usuario.findAll({
      where: { 
        tipoUsuario: 'profesional',
        estado: 'activo'
      },
      limit: 100 // Limitar para no sobrecargar
    });

    // Calcular matching para cada profesional
    const candidatosConMatching = [];
    
    for (const profesional of profesionales) {
      const matching = await calcularCompatibilidad(profesional.id, ofertaId);
      
      if (matching.porcentajeMatching >= porcentajeMinimo) {
        candidatosConMatching.push({
          id: profesional.id,
          email: profesional.email,
          tipoUsuario: profesional.tipoUsuario,
          fechaCreacion: profesional.fechaCreacion,
          porcentajeMatching: matching.porcentajeMatching,
          detallesMatching: matching.detalles
        });
      }
    }

    // Ordenar por porcentaje de matching (mayor a menor)
    candidatosConMatching.sort((a, b) => b.porcentajeMatching - a.porcentajeMatching);

    // Limitar resultados
    const candidatosRecomendados = candidatosConMatching.slice(0, limite);

    res.json({
      mensaje: 'Candidatos recomendados obtenidos exitosamente',
      oferta: {
        id: oferta.id,
        titulo: oferta.titulo
      },
      total: candidatosRecomendados.length,
      totalEvaluados: profesionales.length,
      porcentajeMinimo: porcentajeMinimo,
      candidatos: candidatosRecomendados
    });

  } catch (error) {
    console.error('❌ Error obteniendo candidatos recomendados:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener los candidatos recomendados'
    });
  }
}

/**
 * Calcular matching específico entre un profesional y una oferta
 */
async function calcularMatchingEspecifico(req, res) {
  try {
    const { profesionalId, ofertaId } = req.params;

    // Solo permitir si es el propio profesional o la empresa dueña de la oferta
    if (req.usuario.tipoUsuario === 'profesional' && req.usuario.id != profesionalId) {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'Solo puedes ver tu propio matching'
      });
    }

    const matching = await calcularCompatibilidad(profesionalId, ofertaId);

    res.json({
      mensaje: 'Matching calculado exitosamente',
      profesionalId: parseInt(profesionalId),
      ofertaId: parseInt(ofertaId),
      resultado: matching
    });

  } catch (error) {
    console.error('❌ Error calculando matching específico:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo calcular el matching'
    });
  }
}

// Exportar funciones
module.exports = {
  calcularCompatibilidad,
  obtenerOfertasRecomendadas,
  obtenerCandidatosRecomendados,
  calcularMatchingEspecifico,
  evaluarEducacion,
  evaluarExperiencia,
  evaluarHabilidades,
  evaluarUbicacion
};