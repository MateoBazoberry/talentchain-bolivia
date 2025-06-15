// ========================================
// MODELO DE USUARIO - TABLA PRINCIPAL
// ========================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');

// Definir el modelo Usuario (esta será una tabla en la base de datos)
const Usuario = sequelize.define('Usuario', {
  // Campos de la tabla usuarios
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,           // Clave primaria
    autoIncrement: true         // Se incrementa automáticamente (1, 2, 3, ...)
  },
  
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,           // Campo obligatorio
    unique: true,               // No puede repetirse
    validate: {
      isEmail: true             // Validar formato de email
    }
  },
  
  password: {
    type: DataTypes.STRING(255),
    allowNull: false            // Campo obligatorio
  },
  
  tipoUsuario: {
    type: DataTypes.ENUM('profesional', 'empresa', 'institucion'),
    allowNull: false,
    defaultValue: 'profesional'
  },
  
  estado: {
    type: DataTypes.ENUM('activo', 'pendiente', 'suspendido'),
    allowNull: false,
    defaultValue: 'activo'
  },
  
  // Campos automáticos (no los defines, Sequelize los crea)
  // fechaCreacion - cuando se creó el registro
  // fechaActualizacion - cuando se modificó por última vez
  
}, {
  // Configuración del modelo
  tableName: 'usuarios',        // Nombre de la tabla en la base de datos
  indexes: [
    {
      fields: ['email']         // Crear índice en email para búsquedas rápidas
    },
    {
      fields: ['tipoUsuario']   // Crear índice en tipoUsuario
    }
  ]
});

// Métodos del modelo (funciones útiles)
Usuario.prototype.esProfeional = function() {
  return this.tipoUsuario === 'profesional';
};

Usuario.prototype.esEmpresa = function() {
  return this.tipoUsuario === 'empresa';
};

Usuario.prototype.esInstitucion = function() {
  return this.tipoUsuario === 'institucion';
};

// Exportar el modelo para usarlo en otros archivos
module.exports = Usuario;