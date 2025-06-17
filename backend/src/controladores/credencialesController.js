// ========================================
// CONTROLADOR DE CREDENCIALES ACADÉMICAS
// ========================================
// Ubicación: backend/src/controladores/credencialesController.js

const CredencialAcademica = require('../modelos/CredencialAcademica');
const Usuario = require('../modelos/Usuario');

// ========================================
// OBTENER TODAS LAS CREDENCIALES DEL USUARIO
// ========================================
const obtenerCredenciales = async (req, res) => {
  try {
    // Obtener credenciales del usuario autenticado
    const credenciales = await CredencialAcademica.findAll({
      where: {
        usuarioId: req.usuario.id
      },
      order: [['fechaGraduacion', 'DESC']], // Más recientes primero
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['email', 'tipoUsuario'] // Solo campos seguros
      }]
    });
    
    res.json({
      mensaje: 'Credenciales obtenidas exitosamente',
      cantidad: credenciales.length,
      credenciales: credenciales
    });
    
  } catch (error) {
    console.error('Error obteniendo credenciales:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudieron obtener las credenciales'
    });
  }
};

// ========================================
// OBTENER UNA CREDENCIAL ESPECÍFICA
// ========================================
const obtenerCredencialPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la credencial específica del usuario
    const credencial = await CredencialAcademica.findOne({
      where: {
        id: id,
        usuarioId: req.usuario.id // Solo puede ver sus propias credenciales
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['email', 'tipoUsuario']
      }]
    });
    
    if (!credencial) {
      return res.status(404).json({
        error: 'Credencial no encontrada',
        mensaje: 'La credencial solicitada no existe o no te pertenece'
      });
    }
    
    res.json({
      mensaje: 'Credencial encontrada',
      credencial: credencial
    });
    
  } catch (error) {
    console.error('Error obteniendo credencial por ID:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo obtener la credencial'
    });
  }
};

// ========================================
// CREAR NUEVA CREDENCIAL ACADÉMICA
// ========================================
const crearCredencial = async (req, res) => {
  try {
    const {
      titulo,
      institucion,
      tipo,
      fechaGraduacion,
      descripcion
    } = req.body;
    
    // Validaciones básicas
    if (!titulo || !institucion || !fechaGraduacion) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'Los campos título, institución y fecha de graduación son obligatorios',
        campos_requeridos: ['titulo', 'institucion', 'fechaGraduacion']
      });
    }
    
    // Validar que la fecha no sea futura
    const fechaActual = new Date();
    const fechaGrad = new Date(fechaGraduacion);
    
    if (fechaGrad > fechaActual) {
      return res.status(400).json({
        error: 'Fecha inválida',
        mensaje: 'La fecha de graduación no puede ser futura'
      });
    }
    
    // Crear la nueva credencial
    const nuevaCredencial = await CredencialAcademica.create({
      usuarioId: req.usuario.id, // Asociar al usuario autenticado
      titulo,
      institucion,
      tipo: tipo || 'licenciatura',
      fechaGraduacion,
      descripcion,
      verificado: false // Por defecto no está verificada
    });
    
    res.status(201).json({
      mensaje: 'Credencial académica creada exitosamente',
      credencial: nuevaCredencial
    });
    
  } catch (error) {
    console.error('Error creando credencial:', error);
    
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const erroresValidacion = error.errors.map(err => ({
        campo: err.path,
        mensaje: err.message
      }));
      
      return res.status(400).json({
        error: 'Errores de validación',
        errores: erroresValidacion
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo crear la credencial'
    });
  }
};

// ========================================
// ACTUALIZAR CREDENCIAL EXISTENTE
// ========================================
const actualizarCredencial = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      institucion,
      tipo,
      fechaGraduacion,
      descripcion
    } = req.body;
    
    // Buscar la credencial del usuario
    const credencial = await CredencialAcademica.findOne({
      where: {
        id: id,
        usuarioId: req.usuario.id
      }
    });
    
    if (!credencial) {
      return res.status(404).json({
        error: 'Credencial no encontrada',
        mensaje: 'La credencial que intentas actualizar no existe o no te pertenece'
      });
    }
    
    // Validar fecha si se proporciona
    if (fechaGraduacion) {
      const fechaActual = new Date();
      const fechaGrad = new Date(fechaGraduacion);
      
      if (fechaGrad > fechaActual) {
        return res.status(400).json({
          error: 'Fecha inválida',
          mensaje: 'La fecha de graduación no puede ser futura'
        });
      }
    }
    
    // Actualizar solo los campos proporcionados
    const datosActualizacion = {};
    if (titulo) datosActualizacion.titulo = titulo;
    if (institucion) datosActualizacion.institucion = institucion;
    if (tipo) datosActualizacion.tipo = tipo;
    if (fechaGraduacion) datosActualizacion.fechaGraduacion = fechaGraduacion;
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion;
    
    // Aplicar la actualización
    await credencial.update(datosActualizacion);
    
    // Obtener la credencial actualizada
    const credencialActualizada = await CredencialAcademica.findByPk(credencial.id);
    
    res.json({
      mensaje: 'Credencial actualizada exitosamente',
      credencial: credencialActualizada
    });
    
  } catch (error) {
    console.error('Error actualizando credencial:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const erroresValidacion = error.errors.map(err => ({
        campo: err.path,
        mensaje: err.message
      }));
      
      return res.status(400).json({
        error: 'Errores de validación',
        errores: erroresValidacion
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo actualizar la credencial'
    });
  }
};

// ========================================
// ELIMINAR CREDENCIAL
// ========================================
const eliminarCredencial = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar la credencial del usuario
    const credencial = await CredencialAcademica.findOne({
      where: {
        id: id,
        usuarioId: req.usuario.id
      }
    });
    
    if (!credencial) {
      return res.status(404).json({
        error: 'Credencial no encontrada',
        mensaje: 'La credencial que intentas eliminar no existe o no te pertenece'
      });
    }
    
    // Guardar información antes de eliminar (para respuesta)
    const infoCredencial = {
      id: credencial.id,
      titulo: credencial.titulo,
      institucion: credencial.institucion
    };
    
    // Eliminar la credencial
    await credencial.destroy();
    
    res.json({
      mensaje: 'Credencial eliminada exitosamente',
      credencial_eliminada: infoCredencial
    });
    
  } catch (error) {
    console.error('Error eliminando credencial:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo eliminar la credencial'
    });
  }
};

// ========================================
// EXPORTAR CONTROLADORES
// ========================================
module.exports = {
  obtenerCredenciales,
  obtenerCredencialPorId,
  crearCredencial,
  actualizarCredencial,
  eliminarCredencial
};