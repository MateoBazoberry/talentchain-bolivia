const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');

// Modelo para almacenar credenciales académicas de los usuarios
const CredencialAcademica = sequelize.define('CredencialAcademica', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Relación con el usuario propietario
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  
  // Información del título
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  
  // Institución que otorgó el título
  institucion: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 150]
    }
  },
  
  // Tipo de credencial
  tipo: {
    type: DataTypes.ENUM('bachillerato', 'tecnico', 'licenciatura', 'ingenieria', 'maestria', 'doctorado', 'certificacion'),
    allowNull: false,
    defaultValue: 'licenciatura'
  },
  
  // Fecha de graduación
  fechaGraduacion: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString().split('T')[0] // No puede ser fecha futura
    }
  },
  
  // Campo para notas adicionales
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Estado de verificación
  verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Institución que verificó (si está verificado)
  verificadoPor: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  
  // Fecha de verificación
  fechaVerificacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'credenciales_academicas',
  timestamps: true, // Añade createdAt y updatedAt automáticamente
  
  // Índices para mejorar rendimiento de consultas
  indexes: [
    {
      fields: ['usuarioId']
    },
    {
      fields: ['tipo']
    },
    {
      fields: ['verificado']
    }
  ]
});

module.exports = CredencialAcademica;