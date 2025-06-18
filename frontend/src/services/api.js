// ========================================
// SERVICIO DE API COMPLETO - TODAS LAS FUNCIONALIDADES SESIÓN 4
// ========================================

// URL base de nuestro backend
const API_BASE_URL = 'http://localhost:3000';

// ========================================
// FUNCIONES DE AUTENTICACIÓN
// ========================================

/**
 * Registrar nuevo usuario
 */
export async function registrarUsuario(datosUsuario) {
  try {
    console.log('📤 Enviando registro al backend:', datosUsuario);
    
    const response = await fetch(`${API_BASE_URL}/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosUsuario)
    });
    
    const data = await response.json();
    console.log('📥 Respuesta del backend:', data);
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error en el registro');
    }
    
    return {
      exito: true,
      data: data,
      mensaje: data.mensaje
    };
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    return {
      exito: false,
      error: error.message
    };
  }
}

/**
 * Iniciar sesión
 */
export async function loginUsuario(credenciales) {
  try {
    console.log('📤 Enviando login al backend:', { email: credenciales.email });
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credenciales)
    });
    
    const data = await response.json();
    console.log('📥 Respuesta del backend:', data);
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error en el login');
    }
    
    // Guardar token en localStorage para mantener sesión
    if (data.token) {
      console.log('💾 Guardando token en localStorage...');
      localStorage.setItem('talentchain_token', data.token);
      localStorage.setItem('talentchain_usuario', JSON.stringify(data.usuario));
      
      // Verificar que se guardó
      const tokenGuardado = localStorage.getItem('talentchain_token');
      console.log('✅ Token guardado exitosamente:', !!tokenGuardado);
    } else {
      console.log('❌ No se recibió token del backend');
    }
    
    return {
      exito: true,
      data: data,
      mensaje: data.mensaje,
      usuario: data.usuario,
      token: data.token
    };
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    return {
      exito: false,
      error: error.message
    };
  }
}

/**
 * Obtener token actual
 */
export function obtenerToken() {
  return localStorage.getItem('talentchain_token');
}

/**
 * Obtener usuario actual
 */
export function obtenerUsuarioActual() {
  try {
    const usuario = localStorage.getItem('talentchain_usuario');
    return usuario ? JSON.parse(usuario) : null;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
}

/**
 * Cerrar sesión
 */
export function cerrarSesion() {
  localStorage.removeItem('talentchain_token');
  localStorage.removeItem('talentchain_usuario');
  console.log('🚪 Sesión cerrada');
}

/**
 * Hacer petición autenticada
 */
export async function peticionAutenticada(url, opciones = {}) {
  const token = obtenerToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const opcionesConToken = {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...opciones.headers
    }
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, opcionesConToken);
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        cerrarSesion();
        throw new Error('Sesión expirada');
      }
      throw new Error(data.mensaje || 'Error en la petición');
    }
    
    return data;
  } catch (error) {
    console.error('Error en petición autenticada:', error);
    throw error;
  }
}

// ========================================
// FUNCIONES DE CREDENCIALES ACADÉMICAS
// ========================================

export async function obtenerCredenciales() {
  try {
    return await peticionAutenticada('/credenciales');
  } catch (error) {
    console.error('Error obteniendo credenciales:', error);
    throw error;
  }
}

export async function crearCredencial(datosCredencial) {
  try {
    return await peticionAutenticada('/credenciales', {
      method: 'POST',
      body: JSON.stringify(datosCredencial)
    });
  } catch (error) {
    console.error('Error creando credencial:', error);
    throw error;
  }
}

export async function eliminarCredencial(id) {
  try {
    return await peticionAutenticada(`/credenciales/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error eliminando credencial:', error);
    throw error;
  }
}

// ========================================
// NUEVAS FUNCIONES - APIS DE EMPRESAS
// ========================================

/**
 * Obtener estadísticas del dashboard de empresa
 */
export async function obtenerEstadisticasEmpresa() {
  try {
    return await peticionAutenticada('/empresa/dashboard');
  } catch (error) {
    console.error('Error obteniendo estadísticas de empresa:', error);
    throw error;
  }
}

/**
 * Crear nueva oferta laboral
 */
export async function crearOfertaLaboral(datosOferta) {
  try {
    return await peticionAutenticada('/empresa/ofertas', {
      method: 'POST',
      body: JSON.stringify(datosOferta)
    });
  } catch (error) {
    console.error('Error creando oferta laboral:', error);
    throw error;
  }
}

/**
 * Obtener ofertas de la empresa
 */
export async function obtenerOfertasEmpresa() {
  try {
    return await peticionAutenticada('/empresa/ofertas');
  } catch (error) {
    console.error('Error obteniendo ofertas de empresa:', error);
    throw error;
  }
}

/**
 * Buscar candidatos
 */
export async function buscarCandidatos(filtros = {}) {
  try {
    const params = new URLSearchParams(filtros);
    return await peticionAutenticada(`/empresa/candidatos?${params}`);
  } catch (error) {
    console.error('Error buscando candidatos:', error);
    throw error;
  }
}

/**
 * Verificar experiencia laboral de ex-empleado
 */
export async function verificarExEmpleado(datosVerificacion) {
  try {
    return await peticionAutenticada('/empresa/verificaciones', {
      method: 'POST',
      body: JSON.stringify(datosVerificacion)
    });
  } catch (error) {
    console.error('Error verificando ex-empleado:', error);
    throw error;
  }
}

/**
 * Obtener verificaciones hechas por la empresa
 */
export async function obtenerVerificacionesEmpresa() {
  try {
    return await peticionAutenticada('/empresa/verificaciones');
  } catch (error) {
    console.error('Error obteniendo verificaciones de empresa:', error);
    throw error;
  }
}

// ========================================
// NUEVAS FUNCIONES - APIS DE UNIVERSIDADES
// ========================================

/**
 * Obtener estadísticas del dashboard de universidad
 */
export async function obtenerEstadisticasUniversidad() {
  try {
    return await peticionAutenticada('/universidad/dashboard');
  } catch (error) {
    console.error('Error obteniendo estadísticas de universidad:', error);
    throw error;
  }
}

/**
 * Obtener credenciales pendientes de verificación
 */
export async function obtenerCredencialesPendientes() {
  try {
    return await peticionAutenticada('/universidad/credenciales/pendientes');
  } catch (error) {
    console.error('Error obteniendo credenciales pendientes:', error);
    throw error;
  }
}

/**
 * Verificar credencial académica
 */
export async function verificarCredencialAcademica(credencialId, verificado, comentarios = '') {
  try {
    return await peticionAutenticada(`/universidad/credenciales/${credencialId}/verificar`, {
      method: 'PUT',
      body: JSON.stringify({
        verificado: verificado,
        comentarios: comentarios
      })
    });
  } catch (error) {
    console.error('Error verificando credencial académica:', error);
    throw error;
  }
}

/**
 * Registrar graduado oficial
 */
export async function registrarGraduadoOficial(datosGraduado) {
  try {
    return await peticionAutenticada('/universidad/graduados', {
      method: 'POST',
      body: JSON.stringify(datosGraduado)
    });
  } catch (error) {
    console.error('Error registrando graduado oficial:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de empleabilidad
 */
export async function obtenerEstadisticasEmpleabilidad() {
  try {
    return await peticionAutenticada('/universidad/estadisticas/empleabilidad');
  } catch (error) {
    console.error('Error obteniendo estadísticas de empleabilidad:', error);
    throw error;
  }
}

/**
 * Obtener graduados con estado laboral
 */
export async function obtenerGraduadosConEstadoLaboral(filtros = {}) {
  try {
    const params = new URLSearchParams(filtros);
    return await peticionAutenticada(`/universidad/graduados?${params}`);
  } catch (error) {
    console.error('Error obteniendo graduados con estado laboral:', error);
    throw error;
  }
}

// ========================================
// NUEVAS FUNCIONES - SISTEMA DE MATCHING
// ========================================

/**
 * Obtener ofertas recomendadas para profesional
 */
export async function obtenerOfertasRecomendadas(filtros = {}) {
  try {
    const params = new URLSearchParams(filtros);
    return await peticionAutenticada(`/matching/ofertas-recomendadas?${params}`);
  } catch (error) {
    console.error('Error obteniendo ofertas recomendadas:', error);
    throw error;
  }
}

/**
 * Obtener candidatos recomendados para una oferta
 */
export async function obtenerCandidatosRecomendados(ofertaId, filtros = {}) {
  try {
    const params = new URLSearchParams(filtros);
    return await peticionAutenticada(`/matching/oferta/${ofertaId}/candidatos-recomendados?${params}`);
  } catch (error) {
    console.error('Error obteniendo candidatos recomendados:', error);
    throw error;
  }
}

/**
 * Calcular matching específico
 */
export async function calcularMatchingEspecifico(profesionalId, ofertaId) {
  try {
    return await peticionAutenticada(`/matching/profesional/${profesionalId}/oferta/${ofertaId}`);
  } catch (error) {
    console.error('Error calculando matching específico:', error);
    throw error;
  }
}

// ========================================
// FUNCIONES DE PRUEBA Y UTILIDADES
// ========================================

/**
 * Probar conexión con backend
 */
export async function probarConexion() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    
    console.log('✅ Conexión con backend exitosa:', data.mensaje);
    return true;
  } catch (error) {
    console.error('❌ Error conectando con backend:', error);
    return false;
  }
}

/**
 * Verificar si el usuario está autenticado
 */
export function estaAutenticado() {
  const token = obtenerToken();
  const usuario = localStorage.getItem('talentchain_usuario');
  
  if (!token || !usuario) {
    return false;
  }
  
  try {
    // Verificar si el token ha expirado (básico)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const ahora = Date.now() / 1000;
    
    if (payload.exp < ahora) {
      // Token expirado
      cerrarSesion();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verificando token:', error);
    cerrarSesion();
    return false;
  }
}