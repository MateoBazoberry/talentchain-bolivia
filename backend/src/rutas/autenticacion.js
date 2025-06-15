// ========================================
// RUTAS DE AUTENTICACIÓN
// ========================================

const express = require('express');
const router = express.Router();
const { 
  registrarUsuario, 
  loginUsuario, 
  verificarToken 
} = require('../controladores/autenticacionController');

// ========================================
// RUTAS PÚBLICAS (no requieren autenticación)
// ========================================

// POST /auth/registro - Registrar nuevo usuario
router.post('/registro', registrarUsuario);

// POST /auth/login - Iniciar sesión
router.post('/login', loginUsuario);

// ========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ========================================

// GET /auth/verificar - Verificar si el token es válido
router.get('/verificar', verificarToken);

// GET /auth/perfil - Obtener información del usuario actual
router.get('/perfil', async (req, res) => {
  // TODO: Implementar middleware de autenticación primero
  res.json({
    mensaje: 'Ruta de perfil - próximamente',
    nota: 'Requiere middleware de autenticación'
  });
});

// ========================================
// RUTA DE INFORMACIÓN
// ========================================

// GET /auth/ - Información sobre las APIs disponibles
router.get('/', (req, res) => {
  res.json({
    mensaje: 'APIs de Autenticación - TalentChain Bolivia',
    version: '1.0.0',
    rutasDisponibles: {
      publicas: {
        'POST /auth/registro': 'Registrar nuevo usuario',
        'POST /auth/login': 'Iniciar sesión'
      },
      protegidas: {
        'GET /auth/verificar': 'Verificar token válido',
        'GET /auth/perfil': 'Obtener perfil de usuario'
      }
    },
    formatoRegistro: {
      email: 'string (requerido)',
      password: 'string (requerido, mín 6 caracteres)',
      tipoUsuario: 'string (opcional: profesional, empresa, institucion)',
      nombre: 'string (opcional)',
      empresa: 'string (opcional)',
      institucion: 'string (opcional)'
    },
    formatoLogin: {
      email: 'string (requerido)',
      password: 'string (requerido)'
    },
    ejemplos: {
      registro: {
        url: 'POST http://localhost:3000/auth/registro',
        body: {
          email: 'estudiante@unifranz.edu.bo',
          password: 'mipassword123',
          tipoUsuario: 'profesional',
          nombre: 'Juan Pérez'
        }
      },
      login: {
        url: 'POST http://localhost:3000/auth/login',
        body: {
          email: 'estudiante@unifranz.edu.bo',
          password: 'mipassword123'
        }
      }
    }
  });
});

module.exports = router;