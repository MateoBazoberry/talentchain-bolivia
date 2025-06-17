const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');

// Modelo para almacenar habilidades técnicas de los usuarios
const Habilidad = sequelize.define('Habilidad', {
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
  
  // Nombre de la habilidad
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  
  // Categoría de la habilidad
  categoria: {
    type: DataTypes.ENUM('programacion', 'diseño', 'marketing', 'ventas', 'gestion', 'idiomas', 'analisis', 'liderazgo', 'otra'),
    allowNull: false,
    defaultValue: 'otra'
  },
  
  // Nivel de dominio (1-5 estrellas)
  nivel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5
    }
  },
  
  // Años de experiencia con esta habilidad
  anosExperiencia: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 50
    }
  },
  
  // Estado de verificación
  verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Método de verificación (proyecto, certificación, recomendación)
  metodoVerificacion: {
    type: DataTypes.ENUM('proyecto', 'certificacion', 'recomendacion', 'evaluacion', 'experiencia_laboral'),
    allowNull: true
  },
  
  // Descripción de cómo se verificó la habilidad
  detalleVerificacion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'habilidades',
  timestamps: true,
  
  // Índices para mejorar rendimiento
  indexes: [
    {
      fields: ['usuarioId']
    },
    {
      fields: ['categoria']
    },
    {
      fields: ['nivel']
    },
    {
      fields: ['verificado']
    }
  ],
  
  // Prevenir habilidades duplicadas por usuario
  indexes: [
    {
      unique: true,
      fields: ['usuarioId', 'nombre']
    }
  ]
});

module.exports = Habilidad;