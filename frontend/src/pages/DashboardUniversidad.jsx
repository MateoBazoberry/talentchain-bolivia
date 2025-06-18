import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function DashboardUniversidad() {
  const [activeSection, setActiveSection] = useState('overview');
  const [estadisticas, setEstadisticas] = useState({
    credenciales: { emitidas: 0, verificadas: 0, pendientes: 0 },
    graduados: { recientes: 0, total: 0 }
  });
  const [credencialesPendientes, setCredencialesPendientes] = useState([]);
  const [graduados, setGraduados] = useState([]);
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
    cargarCredencialesPendientes();
    cargarGraduados();
  }, []);

  const cargarDashboard = async () => {
    try {
      const response = await fetch('http://localhost:3000/universidad/dashboard', {
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

  const cargarCredencialesPendientes = async () => {
    try {
      const response = await fetch('http://localhost:3000/universidad/credenciales/pendientes', {
        headers: {
          'Authorization': `Bearer ${obtenerToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredencialesPendientes(data.credenciales || []);
      }
    } catch (error) {
      console.error('Error cargando credenciales pendientes:', error);
    }
  };

  const cargarGraduados = async () => {
    try {
      const response = await fetch('http://localhost:3000/universidad/graduados', {
        headers: {
          'Authorization': `Bearer ${obtenerToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGraduados(data.graduados || []);
      }
    } catch (error) {
      console.error('Error cargando graduados:', error);
    }
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'verificaciones':
        return <VerificacionesSection credenciales={credencialesPendientes} onVerificacionChange={cargarCredencialesPendientes} />;
      case 'graduados':
        return <GraduadosSection graduados={graduados} />;
      case 'estadisticas':
        return <EstadisticasSection />;
      default:
        return <OverviewUniversidad estadisticas={estadisticas} onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header del dashboard */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎓 TalentChain - Dashboard Universidad</h1>
          <div className="user-info">
            <span>Panel Institucional</span>
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
              className={`nav-item ${activeSection === 'verificaciones' ? 'active' : ''}`}
              onClick={() => setActiveSection('verificaciones')}
            >
              <span className="nav-icon">✅</span>
              <span>Verificaciones</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'graduados' ? 'active' : ''}`}
              onClick={() => setActiveSection('graduados')}
            >
              <span className="nav-icon">🎓</span>
              <span>Graduados</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'estadisticas' ? 'active' : ''}`}
              onClick={() => setActiveSection('estadisticas')}
            >
              <span className="nav-icon">📈</span>
              <span>Estadísticas</span>
            </button>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="dashboard-main">
          {cargando ? (
            <div className="loading">⏳ Cargando dashboard institucional...</div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}

// Componente de Resumen para Universidades
function OverviewUniversidad({ estadisticas, onNavigate }) {
  return (
    <div className="dashboard-content">
      <section className="welcome-section">
        <h2>🎓 Panel de Control Institucional</h2>
        <p>Gestiona la verificación de credenciales y seguimiento de graduados</p>
      </section>

      {/* Estadísticas institucionales */}
      <section className="profile-summary">
        <h3>📊 Estadísticas Institucionales</h3>
        <div className="stats-grid">
          <div className="stat-card clickable" onClick={() => onNavigate('verificaciones')}>
            <div className="stat-number">{estadisticas.credenciales.emitidas}</div>
            <div className="stat-label">Credenciales Emitidas</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('verificaciones')}>
            <div className="stat-number">{estadisticas.credenciales.verificadas}</div>
            <div className="stat-label">Credenciales Verificadas</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('verificaciones')}>
            <div className="stat-number">{estadisticas.credenciales.pendientes}</div>
            <div className="stat-label">Pendientes de Verificación</div>
          </div>
          <div className="stat-card clickable" onClick={() => onNavigate('graduados')}>
            <div className="stat-number">{estadisticas.graduados.recientes}</div>
            <div className="stat-label">Graduados Recientes</div>
          </div>
        </div>
      </section>

      {/* Acciones rápidas para universidades */}
      <section className="quick-actions">
        <h3>⚡ Acciones Rápidas</h3>
        <div className="actions-grid">
          <button className="action-card" onClick={() => onNavigate('verificaciones')}>
            <div className="action-icon">✅</div>
            <div className="action-content">
              <h4>Verificar Credenciales</h4>
              <p>Revisa y aprueba títulos pendientes</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => onNavigate('graduados')}>
            <div className="action-icon">🎓</div>
            <div className="action-content">
              <h4>Registrar Graduado</h4>
              <p>Registra oficialmente un nuevo graduado</p>
            </div>
          </button>
          
          <button className="action-card" onClick={() => onNavigate('estadisticas')}>
            <div className="action-icon">📈</div>
            <div className="action-content">
              <h4>Ver Empleabilidad</h4>
              <p>Estadísticas de empleo de graduados</p>
            </div>
          </button>
          
          <button className="action-card">
            <div className="action-icon">📋</div>
            <div className="action-content">
              <h4>Generar Reportes</h4>
              <p>Reportes institucionales</p>
            </div>
          </button>
        </div>
      </section>

      {/* Tasa de verificación */}
      <section className="recent-credentials">
        <h3>📊 Progreso de Verificaciones</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{estadisticas.credenciales.tasaVerificacion || 0}%</div>
            <div className="stat-label">📈 Tasa de Verificación</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estadisticas.actividad?.requiereAtencion ? 'SÍ' : 'NO'}</div>
            <div className="stat-label">⚠️ Requiere Atención</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estadisticas.graduados.total}</div>
            <div className="stat-label">👨‍🎓 Total Graduados</div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Componente de Verificaciones
function VerificacionesSection({ credenciales, onVerificacionChange }) {
  const obtenerToken = () => {
  return localStorage.getItem('talentchain_token');
};


  const verificarCredencial = async (credencialId, verificado) => {
    try {
      const response = await fetch(`http://localhost:3000/universidad/credenciales/${credencialId}/verificar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify({
          verificado: verificado,
          comentarios: verificado ? 'Credencial verificada por la institución' : 'Credencial rechazada'
        })
      });

      if (response.ok) {
        alert(verificado ? '✅ Credencial verificada exitosamente' : '❌ Credencial rechazada');
        onVerificacionChange();
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.mensaje);
      }
    } catch (error) {
      alert('❌ Error verificando credencial: ' + error.message);
    }
  };

  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>✅ Verificación de Credenciales</h2>
        <p>Revisa y verifica las credenciales académicas pendientes</p>
      </section>

      <div className="credentials-grid">
        {credenciales.length === 0 ? (
          <div className="empty-state">
            <h3>✅ No hay credenciales pendientes</h3>
            <p>Todas las credenciales han sido verificadas</p>
          </div>
        ) : (
          credenciales.map(credencial => (
            <div key={credencial.id} className="credential-card">
              <div className="credential-header">
                <div className="credential-title-section">
                  <span className="credential-icon">🎓</span>
                  <div>
                    <h4>{credencial.titulo}</h4>
                    <span className="credential-type">{credencial.tipo}</span>
                  </div>
                </div>
                <span className="status en-proceso">⏳ Pendiente</span>
              </div>
              
              <div className="credential-info">
                <p><strong>Estudiante:</strong> {credencial.usuario?.email}</p>
                <p><strong>Institución:</strong> {credencial.institucion}</p>
                <p><strong>Fecha Graduación:</strong> {new Date(credencial.fechaGraduacion).toLocaleDateString('es-ES')}</p>
                {credencial.descripcion && (
                  <p><strong>Descripción:</strong> {credencial.descripcion}</p>
                )}
                <p><strong>Registrado:</strong> {new Date(credencial.fechaCreacion).toLocaleDateString('es-ES')}</p>
              </div>
              
              <div className="credential-actions">
                <button 
                  className="btn-primary"
                  onClick={() => verificarCredencial(credencial.id, true)}
                >
                  ✅ Verificar
                </button>
                <button 
                  className="btn-outline btn-danger"
                  onClick={() => verificarCredencial(credencial.id, false)}
                >
                  ❌ Rechazar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Componente de Graduados
function GraduadosSection({ graduados }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoGraduado, setNuevoGraduado] = useState({
    emailEstudiante: '',
    titulo: '',
    tipo: 'licenciatura',
    fechaGraduacion: '',
    descripcion: '',
    numeroTitulo: '',
    registroAcademico: ''
  });

  const obtenerToken = () => {
  return localStorage.getItem('talentchain_token');
};


  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setNuevoGraduado(prev => ({ ...prev, [name]: value }));
  };

  const registrarGraduado = async () => {
    try {
      const response = await fetch('http://localhost:3000/universidad/graduados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(nuevoGraduado)
      });

      if (response.ok) {
        alert('✅ Graduado registrado oficialmente');
        setMostrarFormulario(false);
        setNuevoGraduado({
          emailEstudiante: '',
          titulo: '',
          tipo: 'licenciatura',
          fechaGraduacion: '',
          descripcion: '',
          numeroTitulo: '',
          registroAcademico: ''
        });
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.mensaje);
      }
    } catch (error) {
      alert('❌ Error registrando graduado: ' + error.message);
    }
  };

  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>🎓 Gestión de Graduados</h2>
        <button 
          className="btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? '❌ Cancelar' : '+ Registrar Graduado'}
        </button>
      </section>

      {/* Formulario para registrar graduado */}
      {mostrarFormulario && (
        <div className="credential-form-container">
          <div className="credential-form">
            <h3>📝 Registrar Nuevo Graduado</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email del Estudiante *:</label>
                <input
                  type="email"
                  name="emailEstudiante"
                  value={nuevoGraduado.emailEstudiante}
                  onChange={manejarCambio}
                  placeholder="estudiante@ejemplo.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Título *:</label>
                <input
                  type="text"
                  name="titulo"
                  value={nuevoGraduado.titulo}
                  onChange={manejarCambio}
                  placeholder="Ej: Ingeniería de Sistemas"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Título:</label>
                <select name="tipo" value={nuevoGraduado.tipo} onChange={manejarCambio}>
                  <option value="bachillerato">Bachillerato</option>
                  <option value="tecnico">Técnico</option>
                  <option value="licenciatura">Licenciatura</option>
                  <option value="ingenieria">Ingeniería</option>
                  <option value="maestria">Maestría</option>
                  <option value="doctorado">Doctorado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Graduación *:</label>
                <input
                  type="date"
                  name="fechaGraduacion"
                  value={nuevoGraduado.fechaGraduacion}
                  onChange={manejarCambio}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Número de Título:</label>
                <input
                  type="text"
                  name="numeroTitulo"
                  value={nuevoGraduado.numeroTitulo}
                  onChange={manejarCambio}
                  placeholder="IS-2023-001"
                />
              </div>
              <div className="form-group">
                <label>Registro Académico:</label>
                <input
                  type="text"
                  name="registroAcademico"
                  value={nuevoGraduado.registroAcademico}
                  onChange={manejarCambio}
                  placeholder="REG-001-2023"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                name="descripcion"
                value={nuevoGraduado.descripcion}
                onChange={manejarCambio}
                placeholder="Información adicional del título..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button onClick={registrarGraduado} className="btn-primary">💾 Registrar Graduado</button>
              <button onClick={() => setMostrarFormulario(false)} className="btn-outline">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="empty-state">
        <h3>🎓 Gestión de Graduados</h3>
        <p>Registra oficialmente a tus graduados en blockchain</p>
        <p>🚧 Lista de graduados en desarrollo para próxima sesión</p>
      </div>
    </div>
  );
}

// Componente de Estadísticas
function EstadisticasSection() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);

  const obtenerToken = () => localStorage.getItem('token');

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('http://localhost:3000/universidad/estadisticas/empleabilidad', {
        headers: {
          'Authorization': `Bearer ${obtenerToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data.estadisticas);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="dashboard-content">
        <div className="loading">⏳ Cargando estadísticas de empleabilidad...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <section className="section-header">
        <h2>📈 Estadísticas de Empleabilidad</h2>
        <p>Análisis del desempeño laboral de tus graduados</p>
      </section>

      {estadisticas ? (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{estadisticas.resumen?.totalGraduados || 0}</div>
            <div className="stat-label">👨‍🎓 Total Graduados</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estadisticas.resumen?.graduadosConExperiencia || 0}</div>
            <div className="stat-label">💼 Con Experiencia</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estadisticas.resumen?.tasaEmpleabilidad || 0}%</div>
            <div className="stat-label">📊 Tasa de Empleabilidad</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{estadisticas.resumen?.tasaContratacion || 0}%</div>
            <div className="stat-label">✅ Tasa de Contratación</div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h3>📈 Estadísticas de Empleabilidad</h3>
          <p>No hay datos suficientes para generar estadísticas</p>
          <p>💡 Se necesitan más graduados con experiencia laboral registrada</p>
        </div>
      )}

      <section className="recent-credentials">
        <h3>📊 Análisis por Carrera</h3>
        <div className="empty-state">
          <p>🚧 Análisis detallado por carrera en desarrollo</p>
          <p>Próximamente: estadísticas por tipo de título, tendencias de graduación, y más</p>
        </div>
      </section>
    </div>
  );
}

export default DashboardUniversidad;