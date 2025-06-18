// ========================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ========================================
// Ubicación: backend/src/middleware/autenticacion.js

const jwt = require('jsonwebtoken');
const Usuario = require('../modelos/Usuario');

// Middleware para verificar que el usuario esté autenticado
const verificarToken = async (req, res, next) => {
  try {
    // 1. Obtener el token del header Authorization
    const authorization = req.headers.authorization;
    
    if (!authorization) {
      return res.status(401).json({
        error: 'Token no proporcionado',
        mensaje: 'Debes incluir el header Authorization con tu token'
      });
    }
    
    // 2. Extraer el token (formato: "Bearer TOKEN_AQUÍ")
    const token = authorization.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Formato de token inválido',
        mensaje: 'El formato debe ser: Bearer TOKEN_AQUÍ'
      });
    }
    
    // 3. Verificar que el token sea válido
    const tokenDecodificado = jwt.verify(token, process.env.JWT_SECRETO || 'talentchain_secreto_jwt_2025');
    
    // 4. Buscar el usuario en la base de datos
    const usuario = await Usuario.findByPk(tokenDecodificado.id);
    
    if (!usuario) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        mensaje: 'El usuario asociado al token no existe'
      });
    }
    
    // 5. Verificar que el usuario esté activo
    if (usuario.estado !== 'activo') {
      return res.status(401).json({
        error: 'Usuario inactivo',
        mensaje: 'Tu cuenta está suspendida o pendiente de activación'
      });
    }
    
    // 6. Agregar información del usuario a la petición
    req.usuario = {
      id: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
      estado: usuario.estado
    };
    
    // 7. Continuar al siguiente middleware o controlador
    next();
    
  } catch (error) {
    // Manejar errores específicos de JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        mensaje: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        mensaje: 'Tu sesión ha expirado, inicia sesión nuevamente'
      });
    }
    
    // Error genérico
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'Error verificando autenticación'
    });
  }
};

// Middleware para verificar que el usuario sea de un tipo específico
const verificarTipoUsuario = (tiposPermitidos) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado primero
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        mensaje: 'Debes estar logueado para acceder a este recurso'
      });
    }
    
    // Verificar que el tipo de usuario esté permitido
    if (!tiposPermitidos.includes(req.usuario.tipoUsuario)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: `Esta funcionalidad está disponible solo para: ${tiposPermitidos.join(', ')}`,
        tu_tipo: req.usuario.tipoUsuario
      });
    }
    
    next();
  };
};

// Exportar middlewares
module.exports = verificarToken;  // Export por defecto
module.exports.verificarTipoUsuario = verificarTipoUsuario;