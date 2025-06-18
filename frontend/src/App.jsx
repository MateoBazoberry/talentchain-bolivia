import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import './App.css'
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import React, { useState, useEffect } from 'react';

// NUEVOS IMPORTS - Dashboards específicos
import DashboardEmpresa from './pages/DashboardEmpresa';
import DashboardUniversidad from './pages/DashboardUniversidad';

// 🏠 COMPONENTE HOME - Página principal
function Home() {
  const navigate = useNavigate();
  
  // Funciones para las tarjetas - navegación directa sin alertas
  const handleProfesionales = () => {
    // Navegar directamente al registro como profesional
    navigate('/register');
  };

  const handleEmpresas = () => {
    // Navegar directamente al registro como empresa
    navigate('/register');
  };

  const handleUniversidades = () => {
    // Navegar directamente al registro como institución
    navigate('/register');
  };

  const handleCrearCuenta = () => {
    // Navegar al registro en lugar de mostrar alerta
    window.location.href = '/register';
  };

  return (
    <div className="app">
      {/* Header de la aplicación */}
      <header className="header">
        <h1>🔗 TalentChain Bolivia</h1>
        <p>Verificación de credenciales académicas y profesionales con blockchain</p>
      </header>

      {/* Contenido principal */}
      <main className="main">
        <div className="hero">
          <h2>¡Bienvenido a TalentChain Bolivia!</h2>
          <p>
            La primera plataforma boliviana que utiliza blockchain para verificar
            títulos universitarios y experiencia laboral de manera inmutable.
          </p>
          
          <div className="features">
            {/* 🎯 TARJETAS CLICKEABLES */}
            <div className="feature" onClick={handleProfesionales} style={{cursor: 'pointer'}}>
              <h3>🎓 Para Profesionales</h3>
              <p>Verifica tus credenciales académicas y construye un perfil confiable</p>
            </div>
            
            <div className="feature" onClick={handleEmpresas} style={{cursor: 'pointer'}}>
              <h3>🏢 Para Empresas</h3>
              <p>Encuentra candidatos con credenciales 100% verificadas</p>
            </div>
            
            <div className="feature" onClick={handleUniversidades} style={{cursor: 'pointer'}}>
              <h3>🏫 Para Universidades</h3>
              <p>Protege la reputación institucional con verificación blockchain</p>
            </div>
          </div>

          <div className="buttons">
            {/* 🎯 BOTONES CON NAVEGACIÓN REAL */}
            <button className="btn-primary" onClick={handleCrearCuenta}>
              Crear Cuenta
            </button>
            
            {/* 🔥 BOTÓN QUE NAVEGA A LOGIN */}
            <Link to="/login" className="btn-secondary">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>TalentChain Bolivia - Proyecto Integrador UNIFRANZ 2025</p>
      </footer>
    </div>
  );
}

// ========================================
// 🎯 COMPONENTE DASHBOARD INTELIGENTE MULTI-ROL
// ========================================
function DashboardInteligente() {
  // Version simplificada que evita loops de navegación
  const token = localStorage.getItem('talentchain_token');
  
  console.log('🔥 DashboardInteligente - Token existe:', !!token);
  
  if (!token) {
    console.log('🔥 No hay token, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  try {
    // Decodificar token JWT
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    console.log('🔥 Usuario decodificado:', tokenData);
    
    // Mostrar dashboard según tipo de usuario
    switch (tokenData.tipoUsuario) {
      case 'profesional':
        console.log('🔥 Mostrando Dashboard Profesional');
        return <Dashboard />;
      case 'empresa':
        console.log('🔥 Mostrando Dashboard Empresa');
        return <DashboardEmpresa />;
      case 'institucion':
        console.log('🔥 Mostrando Dashboard Universidad');
        return <DashboardUniversidad />;
      default:
        console.log('🔥 Tipo de usuario no reconocido:', tokenData.tipoUsuario);
        return <div>Tipo de usuario no reconocido: {tokenData.tipoUsuario}</div>;
    }
  } catch (error) {
    console.error('🔥 Error decodificando token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    return <Navigate to="/login" replace />;
  }
}

// 🎯 COMPONENTE PRINCIPAL APP - Con Router completo y multi-rol
function App() {
  return (
    <Router>
      <Routes>
        {/* 🏠 Ruta de la página principal */}
        <Route path="/" element={<Home />} />
        
        {/* 🔐 Ruta de la página de login */}
        <Route path="/login" element={<Login />} />
        
        {/* 📝 Ruta de registro */}
        <Route path="/register" element={<Register />} />
        
        {/* 📊 Ruta del dashboard INTELIGENTE - Detecta tipo de usuario automáticamente */}
        <Route path="/dashboard" element={<DashboardInteligente />} />
        
        {/* 📊 Rutas específicas por tipo de usuario (opcionales - acceso directo) */}
        <Route path="/dashboard/profesional" element={<Dashboard />} />
        <Route path="/dashboard/empresa" element={<DashboardEmpresa />} />
        <Route path="/dashboard/universidad" element={<DashboardUniversidad />} />
      </Routes>
    </Router>
  );
}

export default App