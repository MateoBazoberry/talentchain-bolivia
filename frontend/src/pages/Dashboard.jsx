import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  // 🎯 ESTADO - Datos del dashboard
  const [userData] = useState({
    nombre: "Juan Carlos",
    apellido: "Morales",
    email: "admin@talentchain.bo",
    tipoUsuario: "Profesional",
    credencialesVerificadas: 3,
    perfilCompletado: 75
  });

  const [activeSection, setActiveSection] = useState('overview'); // overview, credentials, jobs, profile

  // 🎯 FUNCIONES - Manejar navegación en el dashboard
  const handleAgregarCredencial = () => {
    setActiveSection('credentials');
  };

  const handleBuscarEmpleos = () => {
    setActiveSection('jobs');
  };

  const handleCompletarPerfil = () => {
    setActiveSection('profile');
  };

  const handleVerificarCredenciales = () => {
    alert('🔍 Verificar Credenciales\n\n• Título: Ingeniería de Sistemas - UNIFRANZ ✅\n• Título: Bachiller en Humanidades ✅\n• Certificación: JavaScript Developer ⏳\n\nEstado: 2 verificadas, 1 en proceso');
  };

  // 🎯 FUNCIÓN - Renderizar contenido según sección activa
  const renderContent = () => {
    switch(activeSection) {
      case 'credentials':
        return <CredentialsSection />;
      case 'jobs':
        return <JobsSection />;
      case 'profile':
        return <ProfileSection userData={userData} />;
      default:
        return <OverviewSection userData={userData} onNavigate={setActiveSection} />;
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
            <Link to="/" className="logout-btn">Cerrar Sesión</Link>
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

// 📊 COMPONENTE - Sección de resumen
function OverviewSection({ userData, onNavigate }) {
  return (
    <div className="dashboard-content">
      {/* Bienvenida personalizada */}
      <section className="welcome-section">
        <h2>🎉 ¡Bienvenido a tu Dashboard!</h2>
        <p>Gestiona tus credenciales y oportunidades laborales desde aquí</p>
      </section>

      {/* Resumen del perfil */}
      <section className="profile-summary">
        <h3>📊 Resumen de tu Perfil</h3>
        <div className="stats-grid">
          <div className="stat-card clickable" onClick={() => onNavigate('credentials')}>
            <div className="stat-number">{userData.credencialesVerificadas}</div>
            <div className="stat-label">Credenciales Verificadas</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('profile')}>
            <div className="stat-number">{userData.perfilCompletado}%</div>
            <div className="stat-label">Perfil Completado</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('jobs')}>
            <div className="stat-number">12</div>
            <div className="stat-label">Oportunidades Disponibles</div>
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
    </div>
  );
}

// 🎓 COMPONENTE - Sección de credenciales
function CredentialsSection() {
  const [credentials] = useState([
    {
      id: 1,
      tipo: 'Título Universitario',
      nombre: 'Ingeniería de Sistemas',
      institucion: 'UNIFRANZ',
      fechaObtencion: '2024',
      estado: 'Verificado',
      blockchain: true
    },
    {
      id: 2,
      tipo: 'Bachillerato',
      nombre: 'Bachiller en Humanidades',
      institucion: 'Colegio San Patricio',
      fechaObtencion: '2019',
      estado: 'Verificado',
      blockchain: true
    },
    {
      id: 3,
      tipo: 'Certificación',
      nombre: 'JavaScript Developer',
      institucion: 'Platzi',
      fechaObtencion: '2023',
      estado: 'En proceso',
      blockchain: false
    }
  ]);

  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>🎓 Mis Credenciales</h2>
        <button className="btn-primary">+ Agregar Nueva Credencial</button>
      </section>

      <div className="credentials-grid">
        {credentials.map(credential => (
          <div key={credential.id} className="credential-card">
            <div className="credential-header">
              <h4>{credential.nombre}</h4>
              <span className={`status ${credential.estado.toLowerCase().replace(' ', '-')}`}>
                {credential.estado}
              </span>
            </div>
            <div className="credential-info">
              <p><strong>Tipo:</strong> {credential.tipo}</p>
              <p><strong>Institución:</strong> {credential.institucion}</p>
              <p><strong>Año:</strong> {credential.fechaObtencion}</p>
              <p><strong>Blockchain:</strong> {credential.blockchain ? '✅ Registrado' : '⏳ Pendiente'}</p>
            </div>
            <div className="credential-actions">
              <button className="btn-secondary">Ver Detalles</button>
              <button className="btn-outline">Descargar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 💼 COMPONENTE - Sección de empleos
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
        <button className="btn-primary">Configurar Alertas</button>
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
              <button className="btn-primary">Aplicar</button>
              <button className="btn-outline">Ver Detalles</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 👤 COMPONENTE - Sección de perfil
function ProfileSection({ userData }) {
  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>👤 Mi Perfil</h2>
        <button className="btn-primary">Editar Perfil</button>
      </section>

      <div className="profile-grid">
        <div className="profile-card">
          <h4>Información Personal</h4>
          <div className="profile-info">
            <p><strong>Nombre:</strong> {userData.nombre} {userData.apellido}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Tipo:</strong> {userData.tipoUsuario}</p>
            <p><strong>Completitud:</strong> {userData.perfilCompletado}%</p>
          </div>
        </div>

        <div className="profile-card">
          <h4>Habilidades Técnicas</h4>
          <div className="skills-list">
            <span className="skill-tag">JavaScript</span>
            <span className="skill-tag">React</span>
            <span className="skill-tag">Node.js</span>
            <span className="skill-tag">MySQL</span>
            <span className="skill-tag">Blockchain</span>
          </div>
        </div>

        <div className="profile-card">
          <h4>Estadísticas</h4>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">15</span>
              <span className="stat-label">Aplicaciones</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">8</span>
              <span className="stat-label">Entrevistas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">3</span>
              <span className="stat-label">Ofertas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;