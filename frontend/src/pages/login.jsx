import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { loginUsuario } from '../services/api';

function Login() {
  // 🎯 ESTADO - Datos que cambian en tiempo real
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🧭 NAVEGACIÓN - Hook para navegar programáticamente
  const navigate = useNavigate();

  // 🎯 FUNCIÓN - Manejar envío del formulario CON API REAL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // 🔍 VALIDACIONES MEJORADAS
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!email.includes('@')) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Si hay errores, mostrarlos
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log('📤 Enviando login al backend...');
      
      // 🌐 LLAMAR A LA API REAL DEL BACKEND
      const resultado = await loginUsuario({
        email: email,
        password: password
      });

if (resultado.exito) {
  console.log('✅ Login exitoso:', resultado.usuario);
  console.log('🔑 Token recibido:', resultado.token ? 'Sí' : 'No');
  console.log('📦 Datos completos del resultado:', resultado);
  
  // Verificar localStorage después del login CON DELAY Y NAVEGAR DESPUÉS
  setTimeout(() => {
    const tokenGuardado = localStorage.getItem('talentchain_token');
    const usuarioGuardado = localStorage.getItem('talentchain_usuario');
    console.log('💾 Token en localStorage:', tokenGuardado);
    console.log('👤 Usuario en localStorage:', usuarioGuardado);
    
    // NAVEGAR SOLO DESPUÉS DE VERIFICAR EL TOKEN
    if (tokenGuardado) {
      console.log('🚀 Navegando al dashboard...');
      navigate('/dashboard');
    } else {
      console.log('❌ Error: Token no se guardó correctamente');
      setErrors({ 
        general: 'Error guardando la sesión. Intenta nuevamente.'
      });
    }
  }, 300); // Esperar 300ms para asegurar que se guardó
  
} else {
  // ❌ CREDENCIALES INCORRECTAS O ERROR DE LA API
  setErrors({ 
    general: resultado.error || 'Error desconocido en login'
  });
}
      
    } catch (error) {
      console.error('❌ Error inesperado en login:', error);
      setErrors({ 
        general: 'Error de conexión con el servidor. Verifica que el backend esté corriendo.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 FUNCIONES - Manejar cambios en los inputs
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Limpiar error cuando el usuario empiece a escribir
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Limpiar error cuando el usuario empiece a escribir
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  return (
    <div className="login-container">
      {/* Header con link para volver */}
      <div className="login-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Volver al inicio
        </button>
        <h1>TalentChain Bolivia</h1>
      </div>

      {/* Formulario de login */}
      <div className="login-card">
        <div className="login-content">
          <h2>Iniciar Sesión</h2>

          {/* Error general */}
          {errors.general && (
            <div className="error-message">
              ❌ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Campo de email */}
            <div className="form-group">
              <label htmlFor="email">📧 Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Correo electronico"
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Campo de contraseña */}
            <div className="form-group">
              <label htmlFor="password">🔒 Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Contraseña"
                className={`form-input ${errors.password ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Botón de envío */}
            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? '🔄 Verificando en servidor...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Enlaces adicionales */}
          <div className="login-links">
            <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
            <p>
              ¿No tienes cuenta? 
              <a href="#" className="register-link" onClick={() => navigate('/register')}> Regístrate aquí</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;