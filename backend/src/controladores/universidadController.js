// ========================================
// CONTROLADOR DE UNIVERSIDADES - GESTIÓN DE GRADUADOS Y CREDENCIALES
// ========================================

const Usuario = require('../modelos/Usuario');
const CredencialAcademica = require('../modelos/CredencialAcademica');
const ExperienciaLaboral = require('../modelos/ExperienciaLaboral');
const Aplicacion = require('../modelos/Aplicacion');
const OfertaLaboral = require('../modelos/OfertaLaboral');

// ========================================
// VERIFICACIÓN DE GRADUADOS
// ========================================

/**
 * Verificar credencial académica de un graduado
 */
async function verificarCredencialGraduado(req, res) {
  try {
    const universidadId = req.usuario.id;
    const { credencialId, verificado, comentarios } = req.body;

    // Verificar que sea una institución
    if (req.usuario.tipoUsuario !== 'institucion') {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'Solo las instituciones educativas pueden verificar credenciales'
      });
    }

    // Buscar la credencial
    const credencial = await CredencialAcademica.findByPk(credencialId, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email']
        }
      ]
    });

    if (!credencial) {
      return res.status(404).json({
        error: 'Credencial no encontrada',
        mensaje: 'La credencial especificada no existe'
      });
    }

    // Verificar que la credencial menciona a esta institución
    // (En un sistema real, podríamos tener una tabla de relación universidad-credencial)
    const nombreUniversidad = req.usuario.email.split('@')[1]; // Asumir formato institucional
    
    if (!credencial.institucion.toLowerCase().includes(nombreUniversidad.split('.')[0].toLowerCase())) {
      return res.status(403).json({
        error: 'Institución no autorizada',
        mensaje: 'Solo puedes verificar credenciales emitidas por tu institución'
      });
    }

    // Actualizar credencial
    await credencial.update({
      verificado: verificado === true,
      comentarios: comentarios || null,
      fechaVerificacion: verificado ? new Date() : null,
      verificadoPor: req.usuario.email
    });

    res.json({
      mensaje: `Credencial ${verificado ? 'verificada' : 'rechazada'} exitosamente`,
      credencial: await CredencialAcademica.findByPk(credencialId, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'email']
          }
        ]
      })
    });

  } catch (error) {
    console.error('❌ Error verificando credencial:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo verificar la credencial'
    });
  }
}

/**
 * Obtener credenciales pendientes de verificación
 */
async function obtenerCredencialesPendientes(req, res) {
  try {
    const universidadId = req.usuario.id;
    const limite = parseInt(req.query.limite) || 20;
    const pagina = parseInt(req.query.pagina) || 1;
    const offset = (pagina - 1) * limite;

    // Verificar que sea una institución
    if (req.usuario.tipoUsuario !== 'institucion') {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'Solo las instituciones pueden ver credenciales pendientes'
      });
    }

    // Obtener nombre de la institución del email
    const nombreUniversidad = req.usuario.email.split('@')[1]?.split('.')[0] || '';

    // Buscar credenciales que mencionan esta institución y están pendientes
    const credenciales = await CredencialAcademica.findAndCountAll({
      where: {
        verificado: false,
        institucion: {
          [require('sequelize').Op.iLike]: `%${nombreUniversidad}%`
        }
      },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'fechaCreacion']
        }
      ],
      order: [['fechaCreacion', 'ASC']], // Más antiguos primero
      limit: limite,
      offset: offset
    });

    res.json({
      mensaje: 'Credenciales pendientes obtenidas exitosamente',
      universidad: {
        id: universidadId,
        email: req.usuario.email,
        nombreDetectado: nombreUniversidad
      },
      total: credenciales.count,
      pagina: pagina,
      limite: limite,
      totalPaginas: Math.ceil(credenciales.count / limite),
      credenciales: credenciales.rows
    });

  } catch (error) {
    console.error('❌ Error obteniendo credenciales pendientes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener las credenciales pendientes'
    });
  }
}

/**
 * Registrar nuevo graduado (credencial oficial)
 */
async function registrarGraduadoOficial(req, res) {
  try {
    const universidadId = req.usuario.id;
    
    const {
      emailEstudiante,
      titulo,
      tipo,
      fechaGraduacion,
      descripcion,
      numeroTitulo,
      registroAcademico
    } = req.body;

    // Validaciones básicas
    if (!emailEstudiante || !titulo || !fechaGraduacion) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'Email del estudiante, título y fecha de graduación son obligatorios'
      });
    }

    // Buscar al profesional
    const profesional = await Usuario.findOne({
      where: { 
        email: emailEstudiante.toLowerCase(),
        tipoUsuario: 'profesional'
      }
    });

    if (!profesional) {
      return res.status(404).json({
        error: 'Estudiante no encontrado',
        mensaje: 'No se encontró un profesional registrado con este email'
      });
    }

    // Obtener nombre de la institución
    const nombreInstitucion = req.usuario.email.split('@')[1]?.replace('.edu.bo', '').toUpperCase() || 'INSTITUCIÓN';

    // Crear credencial oficial verificada
    const credencial = await CredencialAcademica.create({
      usuarioId: profesional.id,
      titulo,
      institucion: nombreInstitucion,
      tipo: tipo || 'licenciatura',
      fechaGraduacion,
      descripcion,
      verificado: true, // Automáticamente verificado por ser oficial
      fechaVerificacion: new Date(),
      verificadoPor: req.usuario.email,
      numeroTitulo,
      registroAcademico,
      esOficial: true // Campo que podríamos agregar para distinguir registros oficiales
    });

    res.status(201).json({
      mensaje: 'Graduado registrado oficialmente',
      credencial: credencial,
      profesional: {
        id: profesional.id,
        email: profesional.email
      }
    });

  } catch (error) {
    console.error('❌ Error registrando graduado oficial:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo registrar el graduado'
    });
  }
}

// ========================================
// ESTADÍSTICAS Y REPORTES
// ========================================

/**
 * Obtener estadísticas de empleabilidad de graduados
 */
async function obtenerEstadisticasEmpleabilidad(req, res) {
  try {
    const universidadId = req.usuario.id;
    
    // Obtener nombre de la institución
    const nombreInstitucion = req.usuario.email.split('@')[1]?.split('.')[0] || '';

    // Graduados de esta institución
    const graduados = await CredencialAcademica.findAll({
      where: {
        institucion: {
          [require('sequelize').Op.iLike]: `%${nombreInstitucion}%`
        },
        verificado: true
      },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          include: [
            {
              model: ExperienciaLaboral,
              as: 'experienciaLaboral'
            },
            {
              model: Aplicacion,
              as: 'aplicaciones',
              include: [
                {
                  model: OfertaLaboral,
                  as: 'oferta'
                }
              ]
            }
          ]
        }
      ]
    });

    // Calcular estadísticas
    const totalGraduados = graduados.length;
    const graduadosConExperiencia = graduados.filter(g => 
      g.usuario.experienciaLaboral && g.usuario.experienciaLaboral.length > 0
    ).length;

    const graduadosConAplicaciones = graduados.filter(g => 
      g.usuario.aplicaciones && g.usuario.aplicaciones.length > 0
    ).length;

    const graduadosContratados = graduados.filter(g => 
      g.usuario.aplicaciones && g.usuario.aplicaciones.some(a => a.estado === 'aceptada')
    ).length;

    // Estadísticas por tipo de título
    const estadisticasPorTipo = {};
    graduados.forEach(graduado => {
      const tipo = graduado.tipo;
      if (!estadisticasPorTipo[tipo]) {
        estadisticasPorTipo[tipo] = {
          total: 0,
          conExperiencia: 0,
          conAplicaciones: 0,
          contratados: 0
        };
      }
      
      estadisticasPorTipo[tipo].total++;
      
      if (graduado.usuario.experienciaLaboral && graduado.usuario.experienciaLaboral.length > 0) {
        estadisticasPorTipo[tipo].conExperiencia++;
      }
      
      if (graduado.usuario.aplicaciones && graduado.usuario.aplicaciones.length > 0) {
        estadisticasPorTipo[tipo].conAplicaciones++;
      }
      
      if (graduado.usuario.aplicaciones && graduado.usuario.aplicaciones.some(a => a.estado === 'aceptada')) {
        estadisticasPorTipo[tipo].contratados++;
      }
    });

    // Graduados por año
    const graduadosPorAño = {};
    graduados.forEach(graduado => {
      const año = new Date(graduado.fechaGraduacion).getFullYear();
      if (!graduadosPorAño[año]) {
        graduadosPorAño[año] = 0;
      }
      graduadosPorAño[año]++;
    });

    const estadisticas = {
      resumen: {
        totalGraduados,
        graduadosConExperiencia,
        graduadosConAplicaciones,
        graduadosContratados,
        tasaEmpleabilidad: totalGraduados > 0 ? Math.round((graduadosConExperiencia / totalGraduados) * 100) : 0,
        tasaBusquedaEmpleo: totalGraduados > 0 ? Math.round((graduadosConAplicaciones / totalGraduados) * 100) : 0,
        tasaContratacion: graduadosConAplicaciones > 0 ? Math.round((graduadosContratados / graduadosConAplicaciones) * 100) : 0
      },
      porTipoTitulo: estadisticasPorTipo,
      graduacionesPorAño: graduadosPorAño
    };

    res.json({
      mensaje: 'Estadísticas de empleabilidad obtenidas exitosamente',
      institucion: {
        id: universidadId,
        email: req.usuario.email,
        nombre: nombreInstitucion
      },
      estadisticas
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de empleabilidad:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener las estadísticas de empleabilidad'
    });
  }
}

/**
 * Obtener listado de graduados con su estado laboral
 */
async function obtenerGraduadosConEstadoLaboral(req, res) {
  try {
    const universidadId = req.usuario.id;
    const año = req.query.año;
    const tipo = req.query.tipo;
    const limite = parseInt(req.query.limite) || 50;
    
    // Obtener nombre de la institución
    const nombreInstitucion = req.usuario.email.split('@')[1]?.split('.')[0] || '';

    // Construir filtros
    const filtros = {
      institucion: {
        [require('sequelize').Op.iLike]: `%${nombreInstitucion}%`
      },
      verificado: true
    };

    if (año) {
      filtros.fechaGraduacion = {
        [require('sequelize').Op.between]: [
          new Date(`${año}-01-01`),
          new Date(`${año}-12-31`)
        ]
      };
    }

    if (tipo) {
      filtros.tipo = tipo;
    }

    // Obtener graduados con información laboral
    const graduados = await CredencialAcademica.findAll({
      where: filtros,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'fechaCreacion'],
          include: [
            {
              model: ExperienciaLaboral,
              as: 'experienciaLaboral',
              order: [['fechaInicio', 'DESC']]
            },
            {
              model: Aplicacion,
              as: 'aplicaciones',
              where: { estado: 'aceptada' },
              required: false,
              include: [
                {
                  model: OfertaLaboral,
                  as: 'oferta',
                  attributes: ['titulo', 'ubicacion', 'salarioMin', 'salarioMax']
                }
              ]
            }
          ]
        }
      ],
      order: [['fechaGraduacion', 'DESC']],
      limit: limite
    });

    // Agregar información de estado laboral a cada graduado
    const graduadosConEstado = graduados.map(graduado => {
      const usuario = graduado.usuario;
      const experienciaReciente = usuario.experienciaLaboral?.[0];
      const aplicacionesExitosas = usuario.aplicaciones || [];
      
      let estadoLaboral = 'Sin información';
      let empleoActual = null;
      
      if (experienciaReciente && !experienciaReciente.fechaFin) {
        estadoLaboral = 'Empleado actualmente';
        empleoActual = {
          cargo: experienciaReciente.cargo,
          empresa: experienciaReciente.empresa,
          fechaInicio: experienciaReciente.fechaInicio
        };
      } else if (aplicacionesExitosas.length > 0) {
        estadoLaboral = 'Contratado recientemente';
        empleoActual = {
          cargo: aplicacionesExitosas[0].oferta.titulo,
          empresa: 'A través de TalentChain',
          ubicacion: aplicacionesExitosas[0].oferta.ubicacion
        };
      } else if (usuario.experienciaLaboral && usuario.experienciaLaboral.length > 0) {
        estadoLaboral = 'Con experiencia laboral';
      } else {
        estadoLaboral = 'Buscando empleo';
      }

      return {
        ...graduado.toJSON(),
        estadoLaboral,
        empleoActual,
        totalExperiencias: usuario.experienciaLaboral?.length || 0,
        contratacionesTalentChain: aplicacionesExitosas.length
      };
    });

    res.json({
      mensaje: 'Graduados con estado laboral obtenidos exitosamente',
      filtros: {
        año: año || 'todos',
        tipo: tipo || 'todos',
        limite
      },
      total: graduadosConEstado.length,
      graduados: graduadosConEstado
    });

  } catch (error) {
    console.error('❌ Error obteniendo graduados con estado laboral:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener los graduados con estado laboral'
    });
  }
}

/**
 * Obtener dashboard de estadísticas para universidades
 */
async function obtenerDashboardUniversidad(req, res) {
  try {
    const universidadId = req.usuario.id;
    const nombreInstitucion = req.usuario.email.split('@')[1]?.split('.')[0] || '';

    // Estadísticas generales
    const credencialesEmitidas = await CredencialAcademica.count({
      where: {
        institucion: {
          [require('sequelize').Op.iLike]: `%${nombreInstitucion}%`
        }
      }
    });

    const credencialesVerificadas = await CredencialAcademica.count({
      where: {
        institucion: {
          [require('sequelize').Op.iLike]: `%${nombreInstitucion}%`
        },
        verificado: true
      }
    });

    const credencialesPendientes = await CredencialAcademica.count({
      where: {
        institucion: {
          [require('sequelize').Op.iLike]: `%${nombreInstitucion}%`
        },
        verificado: false
      }
    });

    // Graduados recientes (último año)
    const fechaUnAñoAtras = new Date();
    fechaUnAñoAtras.setFullYear(fechaUnAñoAtras.getFullYear() - 1);

    const graduadosRecientes = await CredencialAcademica.count({
      where: {
        institucion: {
          [require('sequelize').Op.iLike]: `%${nombreInstitucion}%`
        },
        fechaGraduacion: {
          [require('sequelize').Op.gte]: fechaUnAñoAtras
        }
      }
    });

    const estadisticas = {
      credenciales: {
        emitidas: credencialesEmitidas,
        verificadas: credencialesVerificadas,
        pendientes: credencialesPendientes,
        tasaVerificacion: credencialesEmitidas > 0 ? Math.round((credencialesVerificadas / credencialesEmitidas) * 100) : 0
      },
      graduados: {
        recientes: graduadosRecientes,
        total: credencialesVerificadas
      },
      actividad: {
        verificacionesPendientes: credencialesPendientes,
        requiereAtencion: credencialesPendientes > 10
      }
    };

    res.json({
      mensaje: 'Dashboard de universidad obtenido exitosamente',
      universidad: {
        id: universidadId,
        email: req.usuario.email,
        nombre: nombreInstitucion
      },
      estadisticas
    });

  } catch (error) {
    console.error('❌ Error obteniendo dashboard de universidad:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo obtener el dashboard'
    });
  }
}

// Exportar todas las funciones
module.exports = {
  // Verificación de graduados
  verificarCredencialGraduado,
  obtenerCredencialesPendientes,
  registrarGraduadoOficial,
  
  // Estadísticas y reportes
  obtenerEstadisticasEmpleabilidad,
  obtenerGraduadosConEstadoLaboral,
  obtenerDashboardUniversidad
};