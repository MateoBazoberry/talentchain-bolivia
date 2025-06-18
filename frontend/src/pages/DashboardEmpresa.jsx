import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function DashboardEmpresa() {
  const [activeSection, setActiveSection] = useState('overview');
  const [estadisticas, setEstadisticas] = useState({
    ofertas: { total: 0, activas: 0, cerradas: 0 },
    aplicaciones: { total: 0, pendientes: 0, aceptadas: 0 },
    verificaciones: { hechas: 0 }
  });
  const [ofertas, setOfertas] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Función para obtener token
const obtenerToken = () => {
  return localStorage.getItem('talentchain_token');
};

  // Función para cerrar sesión
const manejarLogout = () => {
  localStorage.removeItem('talentchain_token'); // ← CAMBIO
  localStorage.removeItem('talentchain_usuario'); // ← CAMBIO
  window.location.href = '/login';
};

  // Cargar datos del dashboard
  useEffect(() => {
    cargarDashboard();
    cargarOfertas();
    cargarCandidatos();
  }, []);

  const cargarDashboard = async () => {
    try {
      const response = await fetch('http://localhost:3000/empresa/dashboard', {
        headers: {
          'Authorization': `Bearer ${obtenerToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data.estadisticas);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarOfertas = async () => {
    try {
      const response = await fetch('http://localhost:3000/empresa/ofertas', {
        headers: {
          'Authorization': `Bearer ${obtenerToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOfertas(data.ofertas || []);
      }
    } catch (error) {
      console.error('Error cargando ofertas:', error);
    }
  };

  const cargarCandidatos = async () => {
    try {
      const response = await fetch('http://localhost:3000/empresa/candidatos', {
        headers: {
          'Authorization': `Bearer ${obtenerToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidatos(data.candidatos || []);
      }
    } catch (error) {
      console.error('Error cargando candidatos:', error);
    }
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'ofertas':
        return <OfertasSection ofertas={ofertas} onOfertaChange={cargarOfertas} />;
      case 'candidatos':
        return <CandidatosSection candidatos={candidatos} />;
      case 'verificaciones':
        return <VerificacionesSection />;
      default:
        return <OverviewEmpresa estadisticas={estadisticas} onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header del dashboard */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🏢 TalentChain - Dashboard Empresa</h1>
          <div className="user-info">
            <span>Panel Empresarial</span>
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
              className={`nav-item ${activeSection === 'ofertas' ? 'active' : ''}`}
              onClick={() => setActiveSection('ofertas')}
            >
              <span className="nav-icon">💼</span>
              <span>Mis Ofertas</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'candidatos' ? 'active' : ''}`}
              onClick={() => setActiveSection('candidatos')}
            >
              <span className="nav-icon">👥</span>
              <span>Candidatos</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'verificaciones' ? 'active' : ''}`}
              onClick={() => setActiveSection('verificaciones')}
            >
              <span className="nav-icon">✅</span>
              <span>Verificaciones</span>
            </button>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="dashboard-main">
          {cargando ? (
            <div className="loading">⏳ Cargando dashboard empresarial...</div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}

// Componente de Resumen para Empresas
function OverviewEmpresa({ estadisticas, onNavigate }) {
  return (
    <div className="dashboard-content">
      <section className="welcome-section">
        <h2>🏢 Panel de Control Empresarial</h2>
        <p>Gestiona tus ofertas laborales y encuentra el mejor talento</p>
      </section>

      {/* Estadísticas empresariales */}
      <section className="profile-summary">
        <h3>📊 Estadísticas de tu Empresa</h3>
        <div className="stats-grid">
          <div className="stat-card clickable" onClick={() => onNavigate('ofertas')}>
            <div className="stat-number">{estadisticas.ofertas.total}</div>
            <div className="stat-label">Total Ofertas</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('ofertas')}>
            <div className="stat-number">{estadisticas.ofertas.activas}</div>
            <div className="stat-label">Ofertas Activas</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('candidatos')}>
            <div className="stat-number">{estadisticas.aplicaciones.total}</div>
            <div className="stat-label">Aplicaciones Recibidas</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('verificaciones')}>
            <div className="stat-number">{estadisticas.verificaciones.hechas}</div>
            <div className="stat-label">Verificaciones Realizadas</div>
          </div>
        </div>
      </section>

      {/* Acciones rápidas para empresas */}
      <section className="quick-actions">
        <h3>⚡ Acciones Rápidas</h3>
        <div className="actions-grid">
          <button className="action-card" onClick={() => onNavigate('ofertas')}>
            <div className="action-icon">💼</div>
            <div className="action-content">
              <h4>Crear Oferta</h4>
              <p>Publica una nueva oportunidad laboral</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => onNavigate('candidatos')}>
            <div className="action-icon">🔍</div>
            <div className="action-content">
              <h4>Buscar Candidatos</h4>
              <p>Encuentra profesionales calificados</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => onNavigate('verificaciones')}>
            <div className="action-icon">✅</div>
            <div className="action-content">
              <h4>Verificar Ex-empleado</h4>
              <p>Confirma experiencia laboral</p>
            </div>
          </button>
          
          <button className="action-card">
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h4>Ver Análisis</h4>
              <p>Estadísticas de contratación</p>
            </div>
          </button>
        </div>
      </section>

      {/* Estado de aplicaciones */}
      <section className="recent-credentials">
        <h3>📈 Estado de Aplicaciones</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{estadisticas.aplicaciones.pendientes}</div>
            <div className="stat-label">⏳ Pendientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estadisticas.aplicaciones.aceptadas}</div>
            <div className="stat-label">✅ Aceptadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estadisticas.aplicaciones.total - estadisticas.aplicaciones.pendientes - estadisticas.aplicaciones.aceptadas}</div>
            <div className="stat-label">❌ Rechazadas</div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Componente de Ofertas Laborales
function OfertasSection({ ofertas, onOfertaChange }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaOferta, setNuevaOferta] = useState({
    titulo: '',
    descripcion: '',
    educacionRequerida: 'licenciatura',
    experienciaMinima: 0,
    ubicacion: 'Santa Cruz, Bolivia',
    tipoTrabajo: 'tiempo-completo',
    modalidad: 'presencial',
    salarioMin: '',
    salarioMax: ''
  });

  const obtenerToken = () => {
  return localStorage.getItem('talentchain_token');
};


  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setNuevaOferta(prev => ({ ...prev, [name]: value }));
  };

  const crearOferta = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/empresa/ofertas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(nuevaOferta)
      });

      if (response.ok) {
        alert('✅ Oferta creada exitosamente');
        setMostrarFormulario(false);
        setNuevaOferta({
          titulo: '',
          descripcion: '',
          educacionRequerida: 'licenciatura',
          experienciaMinima: 0,
          ubicacion: 'Santa Cruz, Bolivia',
          tipoTrabajo: 'tiempo-completo',
          modalidad: 'presencial',
          salarioMin: '',
          salarioMax: ''
        });
        onOfertaChange();
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.mensaje);
      }
    } catch (error) {
      alert('❌ Error creando oferta: ' + error.message);
    }
  };

  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>💼 Gestión de Ofertas Laborales</h2>
        <button 
          className="btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? '❌ Cancelar' : '+ Nueva Oferta'}
        </button>
      </section>

      {/* Formulario para nueva oferta */}
      {mostrarFormulario && (
        <div className="credential-form-container">
          <div className="credential-form">
            <h3>📝 Nueva Oferta Laboral</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Título del Puesto *:</label>
                <input
                  type="text"
                  name="titulo"
                  value={nuevaOferta.titulo}
                  onChange={manejarCambio}
                  placeholder="Ej: Desarrollador React Senior"
                  required
                />
              </div>
              <div className="form-group">
                <label>Ubicación:</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={nuevaOferta.ubicacion}
                  onChange={manejarCambio}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción *:</label>
              <textarea
                name="descripcion"
                value={nuevaOferta.descripcion}
                onChange={manejarCambio}
                placeholder="Describe el puesto, responsabilidades y requisitos..."
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Educación Requerida:</label>
                <select name="educacionRequerida" value={nuevaOferta.educacionRequerida} onChange={manejarCambio}>
                  <option value="bachillerato">Bachillerato</option>
                  <option value="tecnico">Técnico</option>
                  <option value="licenciatura">Licenciatura</option>
                  <option value="ingenieria">Ingeniería</option>
                  <option value="maestria">Maestría</option>
                </select>
              </div>
              <div className="form-group">
                <label>Experiencia Mínima (años):</label>
                <input
                  type="number"
                  name="experienciaMinima"
                  value={nuevaOferta.experienciaMinima}
                  onChange={manejarCambio}
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Salario Mínimo (Bs.):</label>
                <input
                  type="number"
                  name="salarioMin"
                  value={nuevaOferta.salarioMin}
                  onChange={manejarCambio}
                  placeholder="5000"
                />
              </div>
              <div className="form-group">
                <label>Salario Máximo (Bs.):</label>
                <input
                  type="number"
                  name="salarioMax"
                  value={nuevaOferta.salarioMax}
                  onChange={manejarCambio}
                  placeholder="12000"
                />
              </div>
            </div>

            <div className="form-actions">
              <button onClick={crearOferta} className="btn-primary">💾 Crear Oferta</button>
              <button onClick={() => setMostrarFormulario(false)} className="btn-outline">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de ofertas */}
      <div className="credentials-grid">
        {ofertas.length === 0 ? (
          <div className="no-credentials">
            <div className="empty-state">
              <h3>📋 Aún no tienes ofertas publicadas</h3>
              <p>¡Crea tu primera oferta laboral para encontrar talento!</p>
              <button className="btn-primary" onClick={() => setMostrarFormulario(true)}>
                + Crear Mi Primera Oferta
              </button>
            </div>
          </div>
        ) : (
          ofertas.map(oferta => (
            <div key={oferta.id} className="credential-card">
              <div className="credential-header">
                <div className="credential-title-section">
                  <span className="credential-icon">💼</span>
                  <div>
                    <h4>{oferta.titulo}</h4>
                    <span className="credential-type">{oferta.tipoTrabajo}</span>
                  </div>
                </div>
                <span className={`status ${oferta.estado === 'activa' ? 'verificado' : 'en-proceso'}`}>
                  {oferta.estado === 'activa' ? '✅ Activa' : '⏳ ' + oferta.estado}
                </span>
              </div>
              
              <div className="credential-info">
                <p><strong>Ubicación:</strong> {oferta.ubicacion}</p>
                <p><strong>Educación:</strong> {oferta.educacionRequerida}</p>
                <p><strong>Experiencia:</strong> {oferta.experienciaMinima} años</p>
                <p><strong>Modalidad:</strong> {oferta.modalidad}</p>
                <p><strong>Aplicaciones:</strong> {oferta.numeroAplicaciones}</p>
              </div>
              
              <div className="credential-actions">
                <button className="btn-primary" disabled>Ver Aplicaciones</button>
                <button className="btn-outline" disabled>Editar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Componente de Candidatos
function CandidatosSection({ candidatos }) {
  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>👥 Candidatos Disponibles</h2>
        <p>🚧 Funcionalidad en desarrollo - Conectada con API real</p>
      </section>

      <div className="credentials-grid">
        {candidatos.length === 0 ? (
          <div className="empty-state">
            <h3>👥 No hay candidatos disponibles</h3>
            <p>Aún no hay profesionales registrados con credenciales verificadas</p>
          </div>
        ) : (
          candidatos.slice(0, 6).map((candidato, index) => (
            <div key={index} className="credential-card">
              <div className="credential-header">
                <div className="credential-title-section">
                  <span className="credential-icon">👤</span>
                  <div>
                    <h4>{candidato.email}</h4>
                    <span className="credential-type">Profesional</span>
                  </div>
                </div>
                <span className="status verificado">✅ Verificado</span>
              </div>
              
              <div className="credential-info">
                <p><strong>Credenciales:</strong> {candidato.credencialesAcademicas?.length || 0}</p>
                <p><strong>Experiencia:</strong> {candidato.experienciaLaboral?.length || 0} trabajos</p>
                <p><strong>Habilidades:</strong> {candidato.habilidades?.length || 0}</p>
              </div>
              
              <div className="credential-actions">
                <button className="btn-primary" disabled>Ver Perfil</button>
                <button className="btn-outline" disabled>Contactar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Componente de Verificaciones
function VerificacionesSection() {
  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>✅ Verificaciones Laborales</h2>
        <button className="btn-primary" disabled>+ Nueva Verificación</button>
      </section>

      <div className="empty-state">
        <h3>✅ Sistema de Verificaciones</h3>
        <p>Aquí podrás verificar la experiencia laboral de ex-empleados</p>
        <p>🚧 Funcionalidad en desarrollo para próxima sesión</p>
      </div>
    </div>
  );
}

export default DashboardEmpresa;