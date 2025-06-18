// ========================================
// RUTAS DE CREDENCIALES ACADÉMICAS
// ========================================
// Ubicación: backend/src/rutas/credenciales.js

const express = require('express');
const router = express.Router();

// Importar middleware de autenticación
const verificarToken = require('../middleware/autenticacion');
const { verificarTipoUsuario } = require('../middleware/autenticacion');

// Importar controladores
const {
  obtenerCredenciales,
  obtenerCredencialPorId,
  crearCredencial,
  actualizarCredencial,
  eliminarCredencial
} = require('../controladores/credencialesController');

// ========================================
// MIDDLEWARE APLICADO A TODAS LAS RUTAS
// ========================================

// Verificar que el usuario esté autenticado en todas las rutas
router.use(verificarToken);

// Solo profesionales pueden gestionar credenciales académicas
router.use(verificarTipoUsuario(['profesional']));

// ========================================
// DEFINICIÓN DE RUTAS
// ========================================

// GET /credenciales - Obtener todas las credenciales del usuario
router.get('/', obtenerCredenciales);

// GET /credenciales/:id - Obtener una credencial específica
router.get('/:id', obtenerCredencialPorId);

// POST /credenciales - Crear nueva credencial académica
router.post('/', crearCredencial);

// PUT /credenciales/:id - Actualizar credencial existente
router.put('/:id', actualizarCredencial);

// DELETE /credenciales/:id - Eliminar credencial
router.delete('/:id', eliminarCredencial);

// ========================================
// RUTA DE INFORMACIÓN DE LA API
// ========================================

// GET /credenciales/info - Información sobre las APIs disponibles
router.get('/api/info', (req, res) => {
  res.json({
    api: 'Credenciales Académicas',
    version: '1.0.0',
    descripcion: 'API para gestionar títulos universitarios y certificaciones académicas',
    usuario_autenticado: req.usuario,
    rutas_disponibles: [
      {
        metodo: 'GET',
        ruta: '/credenciales',
        descripcion: 'Obtener todas las credenciales del usuario'
      },
      {
        metodo: 'GET',
        ruta: '/credenciales/:id',
        descripcion: 'Obtener una credencial específica'
      },
      {
        metodo: 'POST',
        ruta: '/credenciales',
        descripcion: 'Crear nueva credencial académica',
        campos_requeridos: ['titulo', 'institucion', 'fechaGraduacion'],
        campos_opcionales: ['tipo', 'descripcion']
      },
      {
        metodo: 'PUT',
        ruta: '/credenciales/:id',
        descripcion: 'Actualizar credencial existente'
      },
      {
        metodo: 'DELETE',
        ruta: '/credenciales/:id',
        descripcion: 'Eliminar credencial'
      }
    ],
    tipos_credencial: [
      'bachillerato',
      'tecnico',
      'licenciatura',
      'ingenieria',
      'maestria',
      'doctorado',
      'certificacion'
    ]
  });
});

// ========================================
// EXPORTAR ROUTER
// ========================================
module.exports = router;