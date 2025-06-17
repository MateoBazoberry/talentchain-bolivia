// Archivo para definir relaciones entre modelos
// Ubicación: backend/src/config/relaciones.js

// Importar modelos usando la ruta correcta
const Usuario = require('../modelos/Usuario');
const CredencialAcademica = require('../modelos/CredencialAcademica');
const ExperienciaLaboral = require('../modelos/ExperienciaLaboral');
const Habilidad = require('../modelos/Habilidad');

// Función para definir todas las relaciones entre modelos
function definirRelaciones() {
  
  // RELACIONES USUARIO -> CREDENCIALES ACADÉMICAS
  // Un usuario puede tener muchas credenciales académicas
  Usuario.hasMany(CredencialAcademica, {
    foreignKey: 'usuarioId',
    as: 'credencialesAcademicas',
    onDelete: 'CASCADE' // Si se elimina usuario, se eliminan sus credenciales
  });
  
  // Una credencial académica pertenece a un usuario
  CredencialAcademica.belongsTo(Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario'
  });
  
  // RELACIONES USUARIO -> EXPERIENCIA LABORAL
  // Un usuario puede tener muchas experiencias laborales
  Usuario.hasMany(ExperienciaLaboral, {
    foreignKey: 'usuarioId',
    as: 'experienciaLaboral',
    onDelete: 'CASCADE'
  });
  
  // Una experiencia laboral pertenece a un usuario
  ExperienciaLaboral.belongsTo(Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario'
  });
  
  // RELACIONES USUARIO -> HABILIDADES
  // Un usuario puede tener muchas habilidades
  Usuario.hasMany(Habilidad, {
    foreignKey: 'usuarioId',
    as: 'habilidades',
    onDelete: 'CASCADE'
  });
  
  // Una habilidad pertenece a un usuario
  Habilidad.belongsTo(Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario'
  });
  
  console.log('✅ Relaciones entre modelos definidas correctamente');
}

module.exports = definirRelaciones;