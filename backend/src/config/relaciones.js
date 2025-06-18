// ========================================
// RELACIONES ENTRE MODELOS - ACTUALIZADO SESIÓN 4
// ========================================

const Usuario = require('../modelos/Usuario');
const CredencialAcademica = require('../modelos/CredencialAcademica');
const ExperienciaLaboral = require('../modelos/ExperienciaLaboral');
const Habilidad = require('../modelos/Habilidad');

// NUEVOS MODELOS SESIÓN 4
const OfertaLaboral = require('../modelos/OfertaLaboral');
const Aplicacion = require('../modelos/Aplicacion');
const VerificacionLaboral = require('../modelos/VerificacionLaboral');

function definirRelaciones() {
  console.log('🔗 Definiendo relaciones entre modelos...');
  
  // ========================================
  // RELACIONES EXISTENTES (Sesión 3)
  // ========================================
  
  // Un Usuario puede tener muchas CredencialesAcademicas
  Usuario.hasMany(CredencialAcademica, {
    foreignKey: 'usuarioId',
    as: 'credencialesAcademicas'
  });
  CredencialAcademica.belongsTo(Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario'
  });

  // Un Usuario puede tener mucha ExperienciaLaboral
  Usuario.hasMany(ExperienciaLaboral, {
    foreignKey: 'usuarioId',
    as: 'experienciaLaboral'
  });
  ExperienciaLaboral.belongsTo(Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario'
  });

  // Un Usuario puede tener muchas Habilidades
  Usuario.hasMany(Habilidad, {
    foreignKey: 'usuarioId',
    as: 'habilidades'
  });
  Habilidad.belongsTo(Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario'
  });

  // ========================================
  // NUEVAS RELACIONES (Sesión 4)
  // ========================================
  
  // OFERTAS LABORALES
  // Una Empresa (Usuario tipo 'empresa') puede tener muchas OfertasLaborales
  Usuario.hasMany(OfertaLaboral, {
    foreignKey: 'empresaId',
    as: 'ofertasLaborales',
    scope: {
      tipoUsuario: 'empresa' // Solo usuarios tipo empresa pueden crear ofertas
    }
  });
  OfertaLaboral.belongsTo(Usuario, {
    foreignKey: 'empresaId',
    as: 'empresa'
  });
  
  // APLICACIONES
  // Un Profesional (Usuario tipo 'profesional') puede tener muchas Aplicaciones
  Usuario.hasMany(Aplicacion, {
    foreignKey: 'profesionalId',
    as: 'aplicaciones',
    scope: {
      tipoUsuario: 'profesional' // Solo profesionales pueden aplicar
    }
  });
  Aplicacion.belongsTo(Usuario, {
    foreignKey: 'profesionalId',
    as: 'profesional'
  });
  
  // Una OfertaLaboral puede tener muchas Aplicaciones
  OfertaLaboral.hasMany(Aplicacion, {
    foreignKey: 'ofertaId',
    as: 'aplicaciones'
  });
  Aplicacion.belongsTo(OfertaLaboral, {
    foreignKey: 'ofertaId',
    as: 'oferta'
  });
  
  // VERIFICACIONES LABORALES
  // Un Profesional puede tener muchas VerificacionesLaborales
  Usuario.hasMany(VerificacionLaboral, {
    foreignKey: 'profesionalId',
    as: 'verificacionesLaborales'
  });
  VerificacionLaboral.belongsTo(Usuario, {
    foreignKey: 'profesionalId',
    as: 'profesional'
  });
  
  // Una Empresa puede verificar muchos ex-empleados
  Usuario.hasMany(VerificacionLaboral, {
    foreignKey: 'empresaVerificadoraId',
    as: 'verificacionesHechas'
  });
  VerificacionLaboral.belongsTo(Usuario, {
    foreignKey: 'empresaVerificadoraId',
    as: 'empresaVerificadora'
  });

  console.log('✅ Relaciones definidas correctamente:');
  console.log('   - Usuario → CredencialesAcademicas (1:N)');
  console.log('   - Usuario → ExperienciaLaboral (1:N)');
  console.log('   - Usuario → Habilidades (1:N)');
  console.log('   - Usuario (empresa) → OfertasLaborales (1:N) ← NUEVO');
  console.log('   - Usuario (profesional) → Aplicaciones (1:N) ← NUEVO');
  console.log('   - OfertaLaboral → Aplicaciones (1:N) ← NUEVO');
  console.log('   - Usuario (profesional) → VerificacionesLaborales (1:N) ← NUEVO');
  console.log('   - Usuario (empresa) → VerificacionesHechas (1:N) ← NUEVO');
}

module.exports = definirRelaciones;