// ========================================
// CONTROLADOR DE EMPRESAS - GESTIÓN DE OFERTAS Y CANDIDATOS
// ========================================

const Usuario = require('../modelos/Usuario');
const OfertaLaboral = require('../modelos/OfertaLaboral');
const Aplicacion = require('../modelos/Aplicacion');
const VerificacionLaboral = require('../modelos/VerificacionLaboral');
const CredencialAcademica = require('../modelos/CredencialAcademica');
const ExperienciaLaboral = require('../modelos/ExperienciaLaboral');
const Habilidad = require('../modelos/Habilidad');

// ========================================
// GESTIÓN DE OFERTAS LABORALES
// ========================================

/**
 * Crear nueva oferta laboral
 */
async function crearOfertaLaboral(req, res) {
  try {
    const empresaId = req.usuario.id;
    
    // Verificar que sea una empresa
    if (req.usuario.tipoUsuario !== 'empresa') {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'Solo las empresas pueden crear ofertas laborales'
      });
    }

    const {
      titulo,
      descripcion,
      educacionRequerida,
      experienciaMinima,
      habilidadesRequeridas,
      ubicacion,
      tipoTrabajo,
      modalidad,
      salarioMin,
      salarioMax,
      fechaExpiracion
    } = req.body;

    // Validaciones básicas
    if (!titulo || !descripcion) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'Título y descripción son obligatorios'
      });
    }

    // Crear la oferta
    const nuevaOferta = await OfertaLaboral.create({
      titulo,
      descripcion,
      educacionRequerida: educacionRequerida || 'licenciatura',
      experienciaMinima: experienciaMinima || 0,
      habilidadesRequeridas: Array.isArray(habilidadesRequeridas) ? habilidadesRequeridas : [],
      ubicacion: ubicacion || 'Santa Cruz, Bolivia',
      tipoTrabajo: tipoTrabajo || 'tiempo-completo',
      modalidad: modalidad || 'presencial',
      salarioMin: salarioMin || null,
      salarioMax: salarioMax || null,
      fechaExpiracion: fechaExpiracion || null,
      empresaId: empresaId,
      estado: 'activa'
    });

    res.status(201).json({
      mensaje: 'Oferta laboral creada exitosamente',
      oferta: nuevaOferta
    });

  } catch (error) {
    console.error('❌ Error creando oferta laboral:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo crear la oferta laboral'
    });
  }
}

/**
 * Obtener ofertas de la empresa
 */
async function obtenerOfertasEmpresa(req, res) {
  try {
    const empresaId = req.usuario.id;
    const estado = req.query.estado || 'todas';
    const limite = parseInt(req.query.limite) || 20;
    const pagina = parseInt(req.query.pagina) || 1;
    const offset = (pagina - 1) * limite;

    // Verificar que sea una empresa
    if (req.usuario.tipoUsuario !== 'empresa') {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'Solo las empresas pueden ver sus ofertas'
      });
    }

    // Construir filtros
    const filtros = { empresaId };
    if (estado !== 'todas') {
      filtros.estado = estado;
    }

    // Obtener ofertas con aplicaciones
    const ofertas = await OfertaLaboral.findAndCountAll({
      where: filtros,
      include: [
        {
          model: Aplicacion,
          as: 'aplicaciones',
          include: [
            {
              model: Usuario,
              as: 'profesional',
              attributes: ['id', 'email']
            }
          ]
        }
      ],
      order: [['fechaCreacion', 'DESC']],
      limit: limite,
      offset: offset
    });

    // Agregar estadísticas a cada oferta
    const ofertasConEstadisticas = ofertas.rows.map(oferta => {
      const aplicaciones = oferta.aplicaciones || [];
      
      return {
        ...oferta.toJSON(),
        estadisticas: {
          totalAplicaciones: aplicaciones.length,
          aplicacionesEnviadas: aplicaciones.filter(a => a.estado === 'enviada').length,
          aplicacionesRevisando: aplicaciones.filter(a => a.estado === 'revisando').length,
          aplicacionesEntrevista: aplicaciones.filter(a => a.estado === 'entrevista').length,
          aplicacionesAceptadas: aplicaciones.filter(a => a.estado === 'aceptada').length,
          aplicacionesRechazadas: aplicaciones.filter(a => a.estado === 'rechazada').length
        }
      };
    });

    res.json({
      mensaje: 'Ofertas obtenidas exitosamente',
      total: ofertas.count,
      pagina: pagina,
      limite: limite,
      totalPaginas: Math.ceil(ofertas.count / limite),
      ofertas: ofertasConEstadisticas
    });

  } catch (error) {
    console.error('❌ Error obteniendo ofertas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener las ofertas'
    });
  }
}

/**
 * Obtener aplicaciones para una oferta específica
 */
async function obtenerAplicacionesOferta(req, res) {
  try {
    const { ofertaId } = req.params;
    const empresaId = req.usuario.id;
    const estado = req.query.estado || 'todas';

    // Verificar que la oferta pertenece a esta empresa
    const oferta = await OfertaLaboral.findOne({
      where: { id: ofertaId, empresaId }
    });

    if (!oferta) {
      return res.status(404).json({
        error: 'Oferta no encontrada',
        mensaje: 'La oferta no existe o no te pertenece'
      });
    }

    // Construir filtros para aplicaciones
    const filtros = { ofertaId };
    if (estado !== 'todas') {
      filtros.estado = estado;
    }

    // Obtener aplicaciones con datos del profesional
    const aplicaciones = await Aplicacion.findAll({
      where: filtros,
      include: [
        {
          model: Usuario,
          as: 'profesional',
          attributes: ['id', 'email', 'fechaCreacion'],
          include: [
            {
              model: CredencialAcademica,
              as: 'credencialesAcademicas'
            },
            {
              model: ExperienciaLaboral,
              as: 'experienciaLaboral'
            },
            {
              model: Habilidad,
              as: 'habilidades'
            }
          ]
        }
      ],
      order: [['porcentajeMatching', 'DESC'], ['fechaAplicacion', 'ASC']]
    });

    res.json({
      mensaje: 'Aplicaciones obtenidas exitosamente',
      oferta: {
        id: oferta.id,
        titulo: oferta.titulo
      },
      total: aplicaciones.length,
      aplicaciones: aplicaciones
    });

  } catch (error) {
    console.error('❌ Error obteniendo aplicaciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener las aplicaciones'
    });
  }
}

/**
 * Actualizar estado de una aplicación
 */
async function actualizarEstadoAplicacion(req, res) {
  try {
    const { aplicacionId } = req.params;
    const { estado, notasEmpresa, fechaEntrevista } = req.body;
    const empresaId = req.usuario.id;

    // Verificar que la aplicación corresponde a una oferta de esta empresa
    const aplicacion = await Aplicacion.findOne({
      where: { id: aplicacionId },
      include: [
        {
          model: OfertaLaboral,
          as: 'oferta',
          where: { empresaId }
        }
      ]
    });

    if (!aplicacion) {
      return res.status(404).json({
        error: 'Aplicación no encontrada',
        mensaje: 'La aplicación no existe o no corresponde a tus ofertas'
      });
    }

    // Actualizar aplicación
    const datosActualizacion = {
      estado,
      fechaRevision: new Date(),
      vistaPorEmpresa: true,
      fechaUltimaVista: new Date()
    };

    if (notasEmpresa) {
      datosActualizacion.notasEmpresa = notasEmpresa;
    }

    if (fechaEntrevista && estado === 'entrevista') {
      datosActualizacion.fechaEntrevista = fechaEntrevista;
    }

    if (['aceptada', 'rechazada'].includes(estado)) {
      datosActualizacion.fechaRespuesta = new Date();
    }

    await aplicacion.update(datosActualizacion);

    res.json({
      mensaje: 'Estado de aplicación actualizado exitosamente',
      aplicacion: await Aplicacion.findByPk(aplicacionId, {
        include: [
          {
            model: Usuario,
            as: 'profesional',
            attributes: ['id', 'email']
          },
          {
            model: OfertaLaboral,
            as: 'oferta',
            attributes: ['id', 'titulo']
          }
        ]
      })
    });

  } catch (error) {
    console.error('❌ Error actualizando aplicación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo actualizar la aplicación'
    });
  }
}

// ========================================
// VERIFICACIÓN DE EX-EMPLEADOS
// ========================================

/**
 * Verificar experiencia laboral de un ex-empleado
 */
async function verificarExEmpleado(req, res) {
  try {
    const empresaId = req.usuario.id;
    
    const {
      profesionalId,
      cargoDesempenado,
      departamento,
      fechaInicio,
      fechaFin,
      tipoContrato,
      salario,
      responsabilidades,
      calificacion,
      comentariosDesempeno,
      motivoSalida,
      elegibleRecontratacion,
      verificadoPor,
      emailContacto,
      telefonoContacto
    } = req.body;

    // Validaciones básicas
    if (!profesionalId || !cargoDesempenado || !fechaInicio) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'ID del profesional, cargo y fecha de inicio son obligatorios'
      });
    }

    // Verificar que el profesional existe
    const profesional = await Usuario.findOne({
      where: { id: profesionalId, tipoUsuario: 'profesional' }
    });

    if (!profesional) {
      return res.status(404).json({
        error: 'Profesional no encontrado',
        mensaje: 'El profesional especificado no existe'
      });
    }

    // Crear verificación laboral
    const verificacion = await VerificacionLaboral.create({
      profesionalId,
      empresaVerificadoraId: empresaId,
      cargoDesempenado,
      departamento,
      fechaInicio,
      fechaFin,
      tipoContrato: tipoContrato || 'empleado-fijo',
      salario,
      responsabilidades,
      calificacion,
      comentariosDesempeno,
      motivoSalida,
      elegibleRecontratacion: elegibleRecontratacion !== undefined ? elegibleRecontratacion : true,
      verificadoPor,
      emailContacto,
      telefonoContacto,
      estado: 'verificado',
      fechaVerificacion: new Date()
    });

    res.status(201).json({
      mensaje: 'Verificación laboral registrada exitosamente',
      verificacion: verificacion
    });

  } catch (error) {
    console.error('❌ Error verificando ex-empleado:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Verificación duplicada',
        mensaje: 'Ya has verificado la experiencia laboral de este profesional'
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo registrar la verificación laboral'
    });
  }
}

/**
 * Obtener verificaciones laborales hechas por la empresa
 */
async function obtenerVerificacionesHechas(req, res) {
  try {
    const empresaId = req.usuario.id;

    const verificaciones = await VerificacionLaboral.findAll({
      where: { empresaVerificadoraId: empresaId },
      include: [
        {
          model: Usuario,
          as: 'profesional',
          attributes: ['id', 'email']
        }
      ],
      order: [['fechaVerificacion', 'DESC']]
    });

    res.json({
      mensaje: 'Verificaciones obtenidas exitosamente',
      total: verificaciones.length,
      verificaciones: verificaciones
    });

  } catch (error) {
    console.error('❌ Error obteniendo verificaciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener las verificaciones'
    });
  }
}

// ========================================
// BÚSQUEDA DE CANDIDATOS
// ========================================

/**
 * Buscar candidatos con filtros avanzados
 */
async function buscarCandidatos(req, res) {
  try {
    const {
      educacion,
      experienciaMinima,
      habilidades,
      ubicacion,
      limite = 20,
      pagina = 1
    } = req.query;

    const offset = (parseInt(pagina) - 1) * parseInt(limite);
    
    // Construir filtros base
    const filtrosUsuario = {
      tipoUsuario: 'profesional',
      estado: 'activo'
    };

    // Buscar profesionales con sus datos completos
    const profesionales = await Usuario.findAndCountAll({
      where: filtrosUsuario,
      include: [
        {
          model: CredencialAcademica,
          as: 'credencialesAcademicas',
          required: educacion ? true : false,
          where: educacion ? { tipo: educacion } : undefined
        },
        {
          model: ExperienciaLaboral,
          as: 'experienciaLaboral'
        },
        {
          model: Habilidad,
          as: 'habilidades',
          required: habilidades ? true : false,
          where: habilidades ? { 
            nombre: {
              [require('sequelize').Op.iLike]: `%${habilidades}%`
            }
          } : undefined
        }
      ],
      attributes: ['id', 'email', 'fechaCreacion'],
      limit: parseInt(limite),
      offset: offset,
      order: [['fechaCreacion', 'DESC']]
    });

    // Filtrar por años de experiencia si se especifica
    let candidatosFiltrados = profesionales.rows;
    
    if (experienciaMinima) {
      candidatosFiltrados = candidatosFiltrados.filter(profesional => {
        const experienciaTotal = profesional.experienciaLaboral.reduce((total, exp) => {
          const inicio = new Date(exp.fechaInicio);
          const fin = exp.fechaFin ? new Date(exp.fechaFin) : new Date();
          const años = (fin - inicio) / (1000 * 60 * 60 * 24 * 365.25);
          return total + Math.max(0, años);
        }, 0);
        
        return experienciaTotal >= parseInt(experienciaMinima);
      });
    }

    res.json({
      mensaje: 'Búsqueda de candidatos completada',
      filtros: {
        educacion: educacion || 'todas',
        experienciaMinima: experienciaMinima || 'sin filtro',
        habilidades: habilidades || 'todas',
        ubicacion: ubicacion || 'todas'
      },
      total: candidatosFiltrados.length,
      totalSinFiltros: profesionales.count,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      candidatos: candidatosFiltrados
    });

  } catch (error) {
    console.error('❌ Error buscando candidatos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo realizar la búsqueda de candidatos'
    });
  }
}

/**
 * Obtener perfil completo de un candidato
 */
async function obtenerPerfilCandidato(req, res) {
  try {
    const { candidatoId } = req.params;

    const candidato = await Usuario.findOne({
      where: { 
        id: candidatoId, 
        tipoUsuario: 'profesional' 
      },
      include: [
        {
          model: CredencialAcademica,
          as: 'credencialesAcademicas'
        },
        {
          model: ExperienciaLaboral,
          as: 'experienciaLaboral'
        },
        {
          model: Habilidad,
          as: 'habilidades'
        },
        {
          model: VerificacionLaboral,
          as: 'verificacionesLaborales',
          include: [
            {
              model: Usuario,
              as: 'empresaVerificadora',
              attributes: ['id', 'email']
            }
          ]
        }
      ]
    });

    if (!candidato) {
      return res.status(404).json({
        error: 'Candidato no encontrado',
        mensaje: 'El candidato especificado no existe'
      });
    }

    // Calcular estadísticas del candidato
    const estadisticas = {
      credencialesVerificadas: candidato.credencialesAcademicas.filter(c => c.verificado).length,
      totalCredenciales: candidato.credencialesAcademicas.length,
      añosExperiencia: candidato.experienciaLaboral.reduce((total, exp) => {
        const inicio = new Date(exp.fechaInicio);
        const fin = exp.fechaFin ? new Date(exp.fechaFin) : new Date();
        const años = (fin - inicio) / (1000 * 60 * 60 * 24 * 365.25);
        return total + Math.max(0, años);
      }, 0),
      totalHabilidades: candidato.habilidades.length,
      verificacionesLaborales: candidato.verificacionesLaborales.filter(v => v.estado === 'verificado').length
    };

    res.json({
      mensaje: 'Perfil de candidato obtenido exitosamente',
      candidato: {
        ...candidato.toJSON(),
        estadisticas
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo perfil de candidato:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo obtener el perfil del candidato'
    });
  }
}

// ========================================
// DASHBOARD ESTADÍSTICAS PARA EMPRESAS
// ========================================

/**
 * Obtener estadísticas del dashboard de empresa
 */
async function obtenerEstadisticasEmpresa(req, res) {
  try {
    const empresaId = req.usuario.id;

    // Estadísticas de ofertas
    const totalOfertas = await OfertaLaboral.count({
      where: { empresaId }
    });

    const ofertasActivas = await OfertaLaboral.count({
      where: { empresaId, estado: 'activa' }
    });

    const ofertasCerradas = await OfertaLaboral.count({
      where: { empresaId, estado: 'cerrada' }
    });

    // Estadísticas de aplicaciones
    const aplicacionesTotales = await Aplicacion.count({
      include: [
        {
          model: OfertaLaboral,
          as: 'oferta',
          where: { empresaId }
        }
      ]
    });

    const aplicacionesPendientes = await Aplicacion.count({
      where: { estado: 'enviada' },
      include: [
        {
          model: OfertaLaboral,
          as: 'oferta',
          where: { empresaId }
        }
      ]
    });

    const aplicacionesAceptadas = await Aplicacion.count({
      where: { estado: 'aceptada' },
      include: [
        {
          model: OfertaLaboral,
          as: 'oferta',
          where: { empresaId }
        }
      ]
    });

    // Verificaciones laborales hechas
    const verificacionesHechas = await VerificacionLaboral.count({
      where: { empresaVerificadoraId: empresaId }
    });

    // Ofertas más populares (con más aplicaciones)
    const ofertasPopulares = await OfertaLaboral.findAll({
      where: { empresaId },
      include: [
        {
          model: Aplicacion,
          as: 'aplicaciones',
          attributes: []
        }
      ],
      attributes: [
        'id',
        'titulo',
        'fechaCreacion',
        [require('sequelize').fn('COUNT', require('sequelize').col('aplicaciones.id')), 'totalAplicaciones']
      ],
      group: ['OfertaLaboral.id'],
      order: [[require('sequelize').literal('totalAplicaciones'), 'DESC']],
      limit: 5
    });

    const estadisticas = {
      ofertas: {
        total: totalOfertas,
        activas: ofertasActivas,
        cerradas: ofertasCerradas,
        pausadas: totalOfertas - ofertasActivas - ofertasCerradas
      },
      aplicaciones: {
        total: aplicacionesTotales,
        pendientes: aplicacionesPendientes,
        aceptadas: aplicacionesAceptadas,
        rechazadas: aplicacionesTotales - aplicacionesPendientes - aplicacionesAceptadas
      },
      verificaciones: {
        hechas: verificacionesHechas
      },
      ofertasPopulares: ofertasPopulares,
      metricas: {
        promedioAplicacionesPorOferta: totalOfertas > 0 ? Math.round(aplicacionesTotales / totalOfertas) : 0,
        tasaAceptacion: aplicacionesTotales > 0 ? Math.round((aplicacionesAceptadas / aplicacionesTotales) * 100) : 0
      }
    };

    res.json({
      mensaje: 'Estadísticas obtenidas exitosamente',
      empresa: {
        id: empresaId,
        email: req.usuario.email
      },
      estadisticas
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de empresa:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener las estadísticas'
    });
  }
}

// Exportar todas las funciones
module.exports = {
  // Gestión de ofertas laborales
  crearOfertaLaboral,
  obtenerOfertasEmpresa,
  obtenerAplicacionesOferta,
  actualizarEstadoAplicacion,
  
  // Verificación de ex-empleados
  verificarExEmpleado,
  obtenerVerificacionesHechas,
  
  // Búsqueda de candidatos
  buscarCandidatos,
  obtenerPerfilCandidato,
  
  // Dashboard y estadísticas
  obtenerEstadisticasEmpresa
};