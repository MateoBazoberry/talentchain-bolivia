import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import { registrarUsuario } from '../services/api';

function Register() {
  // 🎯 ESTADO - Formulario de registro
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    ci: '',
    telefono: '',
    tipoUsuario: 'profesional' // profesional, empresa, institucion
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // 🎯 FUNCIÓN - Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 🔍 FUNCIÓN - Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar nombres
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios';
    } else if (formData.nombres.length < 2) {
      newErrors.nombres = 'Los nombres deben tener al menos 2 caracteres';
    }

    // Validar apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    } else if (formData.apellidos.length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Ingresa un email válido';
    }

    // Validar contraseña
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar CI
    if (!formData.ci.trim()) {
      newErrors.ci = 'El CI es obligatorio';
    } else if (formData.ci.length < 7) {
      newErrors.ci = 'El CI debe tener al menos 7 caracteres';
    }

    return newErrors;
  };

  // 🎯 FUNCIÓN - Manejar envío del formulario CON API REAL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validar formulario
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      console.log('📤 Enviando registro al backend...');
      
      // 🌐 LLAMAR A LA API REAL DEL BACKEND
      const resultado = await registrarUsuario({
        email: formData.email,
        password: formData.password,
        tipoUsuario: formData.tipoUsuario,
        // Datos adicionales que podríamos usar después
        nombre: `${formData.nombres} ${formData.apellidos}`,
        ci: formData.ci,
        telefono: formData.telefono
      });

      if (resultado.exito) {
        console.log('✅ Registro exitoso:', resultado.data);
        
        // Limpiar formulario
        setFormData({
          nombres: '',
          apellidos: '',
          email: '',
          password: '',
          confirmPassword: '',
          ci: '',
          telefono: '',
          tipoUsuario: 'profesional'
        });
        
        // Mostrar mensaje de éxito brevemente
        alert(`✅ ¡Registro exitoso!\n\nBienvenido a TalentChain Bolivia\nEmail: ${formData.email}\nTipo: ${formData.tipoUsuario}\n\nRedirigiendo al login...`);
        
        // Navegar al login después del registro
        setTimeout(() => {
          navigate('/login');
        }, 1000);
        
      } else {
        // Error devuelto por la API
        setErrors({ general: resultado.error });
      }

    } catch (error) {
      console.error('❌ Error inesperado en registro:', error);
      setErrors({ 
        general: 'Error de conexión con el servidor. Verifica que el backend esté corriendo.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Header */}
      <div className="register-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Volver al inicio
        </button>
        <h1>TalentChain Bolivia</h1>
      </div>

      {/* Formulario de registro */}
      <div className="register-card">
        <div className="register-content">
          <h2>Crear Cuenta</h2>
          <p>Únete a TalentChain Bolivia y verifica tus credenciales</p>

          {/* Error general */}
          {errors.general && (
            <div className="error-message">
              ❌ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Tipo de usuario */}
            <div className="form-group">
              <label htmlFor="tipoUsuario">👤 Tipo de Usuario</label>
              <select
                id="tipoUsuario"
                name="tipoUsuario"
                value={formData.tipoUsuario}
                onChange={handleChange}
                className="form-select"
                disabled={isLoading}
              >
                <option value="profesional">🎓 Profesional</option>
                <option value="empresa">🏢 Empresa</option>
                <option value="institucion">🏫 Institución Educativa</option>
              </select>
            </div>

            {/* Nombres */}
            <div className="form-group">
              <label htmlFor="nombres">👤 Nombres</label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Mateo Sebastian"
                className={`form-input ${errors.nombres ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.nombres && <span className="field-error">{errors.nombres}</span>}
            </div>

            {/* Apellidos */}
            <div className="form-group">
              <label htmlFor="apellidos">👤 Apellidos</label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Bazoberry Grigoriu"
                className={`form-input ${errors.apellidos ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.apellidos && <span className="field-error">{errors.apellidos}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">📧 Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu-email@ejemplo.com"
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* CI */}
            <div className="form-group">
              <label htmlFor="ci">🆔 Cédula de Identidad</label>
              <input
                type="text"
                id="ci"
                name="ci"
                value={formData.ci}
                onChange={handleChange}
                placeholder="1234567"
                className={`form-input ${errors.ci ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.ci && <span className="field-error">{errors.ci}</span>}
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label htmlFor="telefono">📱 Teléfono (Opcional)</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+591 70123456"
                className="form-input"
                disabled={isLoading}
              />
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label htmlFor="password">🔒 Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={`form-input ${errors.password ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Confirmar contraseña */}
            <div className="form-group">
              <label htmlFor="confirmPassword">🔒 Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            {/* Botón de registro */}
            <button 
              type="submit" 
              className="btn-register"
              disabled={isLoading}
            >
              {isLoading ? '🔄 Creando cuenta en servidor...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Enlaces */}
          <div className="register-links">
            <p>
              ¿Ya tienes cuenta? 
              <Link to="/login" className="login-link"> Inicia sesión aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;