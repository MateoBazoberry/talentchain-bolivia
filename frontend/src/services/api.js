// ========================================
// SERVICIO DE API - CONEXIÓN CON BACKEND
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
    
    // 🔍 NUEVOS LOGS PARA DEBUG:
    console.log('🔑 ¿Tiene token?', !!data.token);
    console.log('🎫 Token value:', data.token);
    console.log('👤 ¿Tiene usuario?', !!data.usuario);
    console.log('📊 Estructura completa:', JSON.stringify(data, null, 2));
    
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
 * Verificar si el usuario está autenticado
 */
export function estaAutenticado() {
  const token = localStorage.getItem('talentchain_token');
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
 * Obtener token actual
 */
export function obtenerToken() {
  return localStorage.getItem('talentchain_token');
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
 * Hacer petición autenticada (para futuras APIs)
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
        // Token inválido o expirado
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

// Obtener todas las credenciales del usuario
export async function obtenerCredenciales() {
  try {
    return await peticionAutenticada('/credenciales');
  } catch (error) {
    console.error('Error obteniendo credenciales:', error);
    throw error;
  }
}

// Obtener una credencial específica por ID
export async function obtenerCredencialPorId(id) {
  try {
    return await peticionAutenticada(`/credenciales/${id}`);
  } catch (error) {
    console.error('Error obteniendo credencial por ID:', error);
    throw error;
  }
}

// Crear nueva credencial académica
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

// Actualizar credencial existente
export async function actualizarCredencial(id, datosCredencial) {
  try {
    return await peticionAutenticada(`/credenciales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datosCredencial)
    });
  } catch (error) {
    console.error('Error actualizando credencial:', error);
    throw error;
  }
}

// Eliminar credencial
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
// FUNCIONES DE PRUEBA
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