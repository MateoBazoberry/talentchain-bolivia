import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

// Importar servicios de API
import { obtenerCredenciales, crearCredencial, eliminarCredencial, cerrarSesion, obtenerUsuarioActual } from '../services/api';

function Dashboard() {
  // Estados para datos reales del usuario
  const [userData, setUserData] = useState({
    nombre: "Usuario",
    apellido: "",
    email: "usuario@talentchain.bo",
    tipoUsuario: "Profesional",
    credencialesVerificadas: 0,
    perfilCompletado: 25
  });

  const [activeSection, setActiveSection] = useState('overview');
  const [credencialesReales, setCredencialesReales] = useState([]);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    cargarDatosUsuario();
    cargarCredencialesUsuario();
  }, []);

  // Función para cargar datos del usuario desde localStorage/token
  const cargarDatosUsuario = () => {
    const usuario = obtenerUsuarioActual();
    if (usuario) {
      setUserData(prev => ({
        ...prev,
        email: usuario.email || prev.email,
        tipoUsuario: usuario.tipoUsuario || prev.tipoUsuario,
        nombre: usuario.email.split('@')[0] || prev.nombre // Usar parte del email como nombre
      }));
    }
  };

  // Función para cargar credenciales reales
  const cargarCredencialesUsuario = async () => {
    try {
      const response = await obtenerCredenciales();
      const credenciales = response.credenciales || [];
      setCredencialesReales(credenciales);
      
      // Actualizar estadísticas
      setUserData(prev => ({
        ...prev,
        credencialesVerificadas: credenciales.filter(c => c.verificado).length,
        perfilCompletado: credenciales.length > 0 ? 75 : 25 // Aumentar completitud si tiene credenciales
      }));
    } catch (error) {
      console.error('Error cargando credenciales en dashboard:', error);
    }
  };

  // Función para manejar logout
  const manejarLogout = () => {
    cerrarSesion();
    window.location.href = '/login';
  };

  // Función para renderizar contenido según sección activa
  const renderContent = () => {
    switch(activeSection) {
      case 'credentials':
        return <CredentialsSection onCredentialChange={cargarCredencialesUsuario} />;
      case 'jobs':
        return <JobsSection />;
      case 'profile':
        return <ProfileSection userData={userData} credenciales={credencialesReales} />;
      default:
        return <OverviewSection userData={userData} credenciales={credencialesReales} onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header del dashboard */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>TalentChain Bolivia</h1>
          <div className="user-info">
            <span>Bienvenido, {userData.nombre}</span>
            <button onClick={manejarLogout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar de navegación */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <span className="nav-icon">📊</span>
              <span>Resumen</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'credentials' ? 'active' : ''}`}
              onClick={() => setActiveSection('credentials')}
            >
              <span className="nav-icon">🎓</span>
              <span>Credenciales</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveSection('jobs')}
            >
              <span className="nav-icon">💼</span>
              <span>Empleos</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <span className="nav-icon">👤</span>
              <span>Perfil</span>
            </button>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// 📊 COMPONENTE - Sección de resumen CON DATOS REALES
function OverviewSection({ userData, credenciales, onNavigate }) {
  return (
    <div className="dashboard-content">
      {/* Bienvenida personalizada */}
      <section className="welcome-section">
        <h2>🎉 ¡Bienvenido a tu Dashboard!</h2>
        <p>Gestiona tus credenciales y oportunidades laborales desde aquí</p>
      </section>

      {/* Resumen del perfil CON DATOS REALES */}
      <section className="profile-summary">
        <h3>📊 Resumen de tu Perfil</h3>
        <div className="stats-grid">
          <div className="stat-card clickable" onClick={() => onNavigate('credentials')}>
            <div className="stat-number">{credenciales.length}</div>
            <div className="stat-label">Credenciales Registradas</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('credentials')}>
            <div className="stat-number">{userData.credencialesVerificadas}</div>
            <div className="stat-label">Credenciales Verificadas</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('profile')}>
            <div className="stat-number">{userData.perfilCompletado}%</div>
            <div className="stat-label">Perfil Completado</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('jobs')}>
            <div className="stat-number">0</div>
            <div className="stat-label">Empleos Aplicados</div>
          </div>
        </div>
      </section>

      {/* Acciones rápidas */}
      <section className="quick-actions">
        <h3>⚡ Acciones Rápidas</h3>
        <div className="actions-grid">
          <button className="action-card" onClick={() => onNavigate('credentials')}>
            <div className="action-icon">🎓</div>
            <div className="action-content">
              <h4>Agregar Credencial</h4>
              <p>Registra un nuevo título o certificación</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => onNavigate('jobs')}>
            <div className="action-icon">💼</div>
            <div className="action-content">
              <h4>Buscar Empleos</h4>
              <p>Explora oportunidades laborales</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => onNavigate('profile')}>
            <div className="action-icon">👤</div>
            <div className="action-content">
              <h4>Completar Perfil</h4>
              <p>Mejora tu perfil profesional</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => onNavigate('credentials')}>
            <div className="action-icon">🔍</div>
            <div className="action-content">
              <h4>Verificar Credenciales</h4>
              <p>Revisa el estado de tus verificaciones</p>
            </div>
          </button>
        </div>
      </section>

      {/* Credenciales recientes */}
      {credenciales.length > 0 && (
        <section className="recent-credentials">
          <h3>🎓 Credenciales Recientes</h3>
          <div className="recent-credentials-list">
            {credenciales.slice(0, 3).map(credencial => (
              <div key={credencial.id} className="recent-credential-item">
                <span className="credential-icon">
                  {credencial.tipo === 'ingenieria' ? '⚙️' : 
                   credencial.tipo === 'licenciatura' ? '📚' : 
                   credencial.tipo === 'maestria' ? '🎯' : '🎓'}
                </span>
                <div className="credential-info">
                  <h4>{credencial.titulo}</h4>
                  <p>{credencial.institucion}</p>
                </div>
                <span className={`credential-status ${credencial.verificado ? 'verified' : 'pending'}`}>
                  {credencial.verificado ? '✅' : '⏳'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// 🎓 COMPONENTE - Sección de credenciales CON DATOS REALES
function CredentialsSection({ onCredentialChange }) {
  // Estados para datos reales
  const [credentials, setCredentials] = useState([]);
  const [cargandoCredenciales, setCargandoCredenciales] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);
  
  // Estado para el formulario de nueva credencial
  const [nuevaCredencial, setNuevaCredencial] = useState({
    titulo: '',
    institucion: '',
    tipo: 'licenciatura',
    fechaGraduacion: '',
    descripcion: ''
  });

  // Cargar credenciales al montar el componente
  useEffect(() => {
    cargarCredenciales();
  }, []);

  // Función para cargar credenciales desde la API
  const cargarCredenciales = async () => {
    try {
      setCargandoCredenciales(true);
      const response = await obtenerCredenciales();
      setCredentials(response.credenciales || []);
      
      // Notificar al componente padre que las credenciales cambiaron
      if (onCredentialChange) {
        onCredentialChange();
      }
    } catch (error) {
      console.error('Error cargando credenciales:', error);
      if (error.message.includes('Sesión expirada')) {
        alert('Tu sesión ha expirado. Serás redirigido al login.');
        window.location.href = '/login';
      } else {
        alert('Error cargando credenciales: ' + error.message);
      }
    } finally {
      setCargandoCredenciales(false);
    }
  };

  // Función para manejar cambios en el formulario
  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setNuevaCredencial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para enviar nueva credencial
  const enviarNuevaCredencial = async (e) => {
    e.preventDefault();
    
    try {
      setEnviandoFormulario(true);
      await crearCredencial(nuevaCredencial);
      
      // Limpiar formulario y cerrar
      setNuevaCredencial({
        titulo: '',
        institucion: '',
        tipo: 'licenciatura',
        fechaGraduacion: '',
        descripcion: ''
      });
      setMostrarFormulario(false);
      
      // Recargar credenciales
      await cargarCredenciales();
      alert('✅ Credencial creada exitosamente');
      
    } catch (error) {
      console.error('Error creando credencial:', error);
      alert('Error creando credencial: ' + error.message);
    } finally {
      setEnviandoFormulario(false);
    }
  };

  // Función para eliminar credencial
  const manejarEliminarCredencial = async (id, titulo) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${titulo}"?`)) {
      try {
        await eliminarCredencial(id);
        await cargarCredenciales(); // Recargar la lista
        alert('✅ Credencial eliminada exitosamente');
      } catch (error) {
        console.error('Error eliminando credencial:', error);
        alert('Error eliminando credencial: ' + error.message);
      }
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Función para obtener ícono por tipo de credencial
  const obtenerIconoCredencial = (tipo) => {
    const iconos = {
      bachillerato: '🎓',
      tecnico: '🔧',
      licenciatura: '📚',
      ingenieria: '⚙️',
      maestria: '🎯',
      doctorado: '👨‍🎓',
      certificacion: '📜'
    };
    return iconos[tipo] || '📋';
  };

  // Mapear tipo de backend a texto legible
  const obtenerTipoTexto = (tipo) => {
    const tipos = {
      bachillerato: 'Bachillerato',
      tecnico: 'Técnico',
      licenciatura: 'Licenciatura',
      ingenieria: 'Ingeniería',
      maestria: 'Maestría',
      doctorado: 'Doctorado',
      certificacion: 'Certificación'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>🎓 Mis Credenciales</h2>
        <button 
          className="btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? '❌ Cancelar' : '+ Agregar Nueva Credencial'}
        </button>
      </section>

      {/* Formulario para nueva credencial */}
      {mostrarFormulario && (
        <div className="credential-form-container">
          <form className="credential-form" onSubmit={enviarNuevaCredencial}>
            <h3>📝 Nueva Credencial Académica</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Título/Carrera *:</label>
                <input
                  type="text"
                  name="titulo"
                  value={nuevaCredencial.titulo}
                  onChange={manejarCambioFormulario}
                  placeholder="Ej: Ingeniería de Sistemas"
                  required
                />
              </div>

              <div className="form-group">
                <label>Institución *:</label>
                <input
                  type="text"
                  name="institucion"
                  value={nuevaCredencial.institucion}
                  onChange={manejarCambioFormulario}
                  placeholder="Ej: UNIFRANZ"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  name="tipo"
                  value={nuevaCredencial.tipo}
                  onChange={manejarCambioFormulario}
                >
                  <option value="bachillerato">Bachillerato</option>
                  <option value="tecnico">Técnico</option>
                  <option value="licenciatura">Licenciatura</option>
                  <option value="ingenieria">Ingeniería</option>
                  <option value="maestria">Maestría</option>
                  <option value="doctorado">Doctorado</option>
                  <option value="certificacion">Certificación</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fecha de Graduación *:</label>
                <input
                  type="date"
                  name="fechaGraduacion"
                  value={nuevaCredencial.fechaGraduacion}
                  onChange={manejarCambioFormulario}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción (opcional):</label>
              <textarea
                name="descripcion"
                value={nuevaCredencial.descripcion}
                onChange={manejarCambioFormulario}
                placeholder="Información adicional sobre tu título..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={enviandoFormulario}
              >
                {enviandoFormulario ? '⏳ Guardando...' : '💾 Guardar Credencial'}
              </button>
              <button 
                type="button" 
                className="btn-outline"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de credenciales */}
      <div className="credentials-grid">
        {cargandoCredenciales ? (
          <div className="loading-credentials">
            <p>⏳ Cargando tus credenciales...</p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="no-credentials">
            <div className="empty-state">
              <h3>📋 Aún no tienes credenciales registradas</h3>
              <p>¡Agrega tu primera credencial académica usando el botón de arriba!</p>
              <button 
                className="btn-primary"
                onClick={() => setMostrarFormulario(true)}
              >
                + Agregar Mi Primera Credencial
              </button>
            </div>
          </div>
        ) : (
          credentials.map(credential => (
            <div key={credential.id} className="credential-card">
              <div className="credential-header">
                <div className="credential-title-section">
                  <span className="credential-icon">
                    {obtenerIconoCredencial(credential.tipo)}
                  </span>
                  <div>
                    <h4>{credential.titulo}</h4>
                    <span className="credential-type">{obtenerTipoTexto(credential.tipo)}</span>
                  </div>
                </div>
                <span className={`status ${credential.verificado ? 'verificado' : 'en-proceso'}`}>
                  {credential.verificado ? '✅ Verificado' : '⏳ Pendiente'}
                </span>
              </div>
              
              <div className="credential-info">
                <p><strong>Institución:</strong> {credential.institucion}</p>
                <p><strong>Graduación:</strong> {formatearFecha(credential.fechaGraduacion)}</p>
                {credential.descripcion && (
                  <p><strong>Descripción:</strong> {credential.descripcion}</p>
                )}
                <p><strong>Blockchain:</strong> {credential.verificado ? '✅ Registrado' : '⏳ Pendiente'}</p>
              </div>
              
              <div className="credential-actions">
                <button className="btn-secondary" disabled>
                  Ver Detalles
                </button>
                <button 
                  className="btn-outline btn-danger"
                  onClick={() => manejarEliminarCredencial(credential.id, credential.titulo)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 💼 COMPONENTE - Sección de empleos (sin cambios)
function JobsSection() {
  const [jobs] = useState([
    {
      id: 1,
      titulo: 'Desarrollador Frontend React',
      empresa: 'TechBolivia SRL',
      ubicacion: 'Santa Cruz, Bolivia',
      salario: 'Bs. 8,000 - 12,000',
      tipo: 'Tiempo completo',
      fechaPublicacion: '2 días atrás',
      match: 95
    },
    {
      id: 2,
      titulo: 'Ingeniero de Software',
      empresa: 'Jalasoft',
      ubicacion: 'La Paz, Bolivia',
      salario: 'Bs. 10,000 - 15,000',
      tipo: 'Tiempo completo',
      fechaPublicacion: '1 semana atrás',
      match: 88
    },
    {
      id: 3,
      titulo: 'Desarrollador Full Stack',
      empresa: 'Digital Solutions',
      ubicacion: 'Cochabamba, Bolivia',
      salario: 'Bs. 9,000 - 13,000',
      tipo: 'Híbrido',
      fechaPublicacion: '3 días atrás',
      match: 82
    }
  ]);

  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>💼 Oportunidades Laborales</h2>
        <p>🚧 Funcionalidad en desarrollo - Próxima sesión</p>
      </section>

      <div className="jobs-grid">
        {jobs.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <h4>{job.titulo}</h4>
              <span className="match-score">{job.match}% match</span>
            </div>
            <div className="job-info">
              <p><strong>🏢 {job.empresa}</strong></p>
              <p>📍 {job.ubicacion}</p>
              <p>💰 {job.salario}</p>
              <p>⏰ {job.tipo}</p>
              <p className="job-date">📅 {job.fechaPublicacion}</p>
            </div>
            <div className="job-actions">
              <button className="btn-primary" disabled>Aplicar</button>
              <button className="btn-outline" disabled>Ver Detalles</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 👤 COMPONENTE - Sección de perfil CON DATOS REALES
function ProfileSection({ userData, credenciales }) {
  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>👤 Mi Perfil</h2>
        <button className="btn-primary" disabled>Editar Perfil</button>
      </section>

      <div className="profile-grid">
        <div className="profile-card">
          <h4>Información Personal</h4>
          <div className="profile-info">
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Tipo de Usuario:</strong> {userData.tipoUsuario}</p>
            <p><strong>Credenciales Registradas:</strong> {credenciales.length}</p>
            <p><strong>Credenciales Verificadas:</strong> {userData.credencialesVerificadas}</p>
            <p><strong>Completitud del Perfil:</strong> {userData.perfilCompletado}%</p>
          </div>
        </div>

        <div className="profile-card">
          <h4>Credenciales por Tipo</h4>
          <div className="credentials-breakdown">
            {credenciales.length === 0 ? (
              <p>No tienes credenciales registradas aún</p>
            ) : (
              Object.entries(
                credenciales.reduce((acc, credencial) => {
                  const tipo = credencial.tipo;
                  acc[tipo] = (acc[tipo] || 0) + 1;
                  return acc;
                }, {})
              ).map(([tipo, cantidad]) => (
                <div key={tipo} className="credential-breakdown-item">
                  <span className="breakdown-type">
                    {tipo === 'ingenieria' ? '⚙️ Ingeniería' :
                     tipo === 'licenciatura' ? '📚 Licenciatura' :
                     tipo === 'maestria' ? '🎯 Maestría' :
                     tipo === 'bachillerato' ? '🎓 Bachillerato' :
                     tipo === 'doctorado' ? '👨‍🎓 Doctorado' :
                     tipo === 'certificacion' ? '📜 Certificación' :
                     tipo === 'tecnico' ? '🔧 Técnico' : tipo}
                  </span>
                  <span className="breakdown-count">{cantidad}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="profile-card">
          <h4>Progreso del Perfil</h4>
          <div className="profile-progress">
            <div className="progress-item">
              <span>Información básica</span>
              <span className="progress-status">✅ Completo</span>
            </div>
            <div className="progress-item">
              <span>Credenciales académicas</span>
              <span className="progress-status">
                {credenciales.length > 0 ? '✅ Completo' : '⏳ Pendiente'}
              </span>
            </div>
            <div className="progress-item">
              <span>Experiencia laboral</span>
              <span className="progress-status">⏳ Pendiente</span>
            </div>
            <div className="progress-item">
              <span>Habilidades técnicas</span>
              <span className="progress-status">⏳ Pendiente</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h4>Estadísticas</h4>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{credenciales.length}</span>
              <span className="stat-label">Credenciales</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{userData.credencialesVerificadas}</span>
              <span className="stat-label">Verificadas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Empleos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Habilidades</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;