// ========================================
// CONTROLADOR DE AUTENTICACIÓN
// ========================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../modelos/Usuario');

// ========================================
// REGISTRO DE USUARIOS
// ========================================
async function registrarUsuario(req, res) {
  try {
    console.log('📝 Recibiendo solicitud de registro:', req.body);
    
    // Obtener datos del formulario
    const { 
      email, 
      password, 
      tipoUsuario,
      // Campos adicionales según el tipo
      nombre,
      empresa,
      institucion
    } = req.body;
    
    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'Email y contraseña son obligatorios'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Contraseña muy corta',
        mensaje: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (usuarioExistente) {
      return res.status(400).json({
        error: 'Email ya registrado',
        mensaje: 'Ya existe una cuenta con este email'
      });
    }
    
    // Encriptar contraseña
    const passwordEncriptado = await bcrypt.hash(password, 12);
    console.log('🔒 Contraseña encriptada correctamente');
    
    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      email: email.toLowerCase(),
      password: passwordEncriptado,
      tipoUsuario: tipoUsuario || 'profesional',
      estado: 'activo'
    });
    
    console.log('✅ Usuario creado con ID:', nuevoUsuario.id);
    
    // Respuesta exitosa (NO enviar la contraseña)
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        tipoUsuario: nuevoUsuario.tipoUsuario,
        estado: nuevoUsuario.estado,
        fechaCreacion: nuevoUsuario.fechaCreacion
      },
      siguientePaso: 'Procede a hacer login con tus credenciales'
    });
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    // Errores específicos de Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Email ya registrado',
        mensaje: 'Ya existe una cuenta con este email'
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: error.errors[0].message
      });
    }
    
    // Error genérico
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo registrar el usuario, intenta de nuevo'
    });
  }
}

// ========================================
// LOGIN DE USUARIOS
// ========================================
async function loginUsuario(req, res) {
  try {
    console.log('🔑 Recibiendo solicitud de login:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'Email y contraseña son obligatorios'
      });
    }
    
    // Buscar usuario por email
    const usuario = await Usuario.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (!usuario) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({
        error: 'Credenciales incorrectas',
        mensaje: 'Email o contraseña incorrectos'
      });
    }
    
    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValido) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.status(401).json({
        error: 'Credenciales incorrectas',
        mensaje: 'Email o contraseña incorrectos'
      });
    }
    
    // Verificar que el usuario esté activo
    if (usuario.estado !== 'activo') {
      return res.status(401).json({
        error: 'Cuenta inactiva',
        mensaje: `Tu cuenta está ${usuario.estado}. Contacta al administrador.`
      });
    }
    
    // Crear token JWT
const token = jwt.sign(
  { 
    id: usuario.id,            // ← Usar "id" en lugar de "userId"
    email: usuario.email,
    tipoUsuario: usuario.tipoUsuario
  },
  process.env.JWT_SECRETO,
  { expiresIn: process.env.JWT_EXPIRA_EN || '7d' }
);
    
    // Respuesta exitosa
    res.json({
      mensaje: 'Login exitoso',
      token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        estado: usuario.estado,
        fechaCreacion: usuario.fechaCreacion
      },
      validoHasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
    });
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo procesar el login, intenta de nuevo'
    });
  }
}

// ========================================
// VERIFICAR TOKEN
// ========================================
async function verificarToken(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Token no proporcionado',
        mensaje: 'Se requiere autenticación'
      });
    }
    
    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRETO);
    
    // Buscar usuario actual
    const usuario = await Usuario.findByPk(decoded.userId);
    
    if (!usuario || usuario.estado !== 'activo') {
      return res.status(401).json({
        error: 'Token inválido',
        mensaje: 'Usuario no encontrado o inactivo'
      });
    }
    
    res.json({
      valido: true,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        estado: usuario.estado
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        mensaje: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        mensaje: 'Tu sesión ha expirado, inicia sesión de nuevo'
      });
    }
    
    console.error('❌ Error verificando token:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'No se pudo verificar el token'
    });
  }
}

// Exportar las funciones
module.exports = {
  registrarUsuario,
  loginUsuario,
  verificarToken
};