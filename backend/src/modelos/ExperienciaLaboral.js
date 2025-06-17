const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');

// Modelo para almacenar experiencia laboral de los usuarios
const ExperienciaLaboral = sequelize.define('ExperienciaLaboral', {
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
  
  // Información de la empresa
  empresa: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 150]
    }
  },
  
  // Cargo o posición desempeñada
  cargo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  
  // Descripción detallada de responsabilidades
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Fecha de inicio del trabajo
  fechaInicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  
  // Fecha de fin del trabajo (null si es trabajo actual)
  fechaFin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true,
      // Validación personalizada: fecha fin debe ser después de fecha inicio
      isAfterStartDate(value) {
        if (value && this.fechaInicio && value <= this.fechaInicio) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
    }
  },
  
  // Indica si es el trabajo actual
  esTrabajoActual: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Ubicación del trabajo
  ubicacion: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // Tipo de empleo
  tipoEmpleo: {
    type: DataTypes.ENUM('tiempo_completo', 'medio_tiempo', 'contrato', 'practicante', 'freelance', 'voluntario'),
    allowNull: false,
    defaultValue: 'tiempo_completo'
  },
  
  // Estado de verificación
  verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Empresa que verificó (si está verificado)
  verificadoPor: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  
  // Fecha de verificación
  fechaVerificacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Persona de contacto para referencias
  contactoReferencia: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'experiencia_laboral',
  timestamps: true,
  
  // Índices para mejorar rendimiento
  indexes: [
    {
      fields: ['usuarioId']
    },
    {
      fields: ['empresa']
    },
    {
      fields: ['esTrabajoActual']
    },
    {
      fields: ['verificado']
    }
  ],
  
  // Hooks para lógica automática
  hooks: {
    // Antes de guardar, si es trabajo actual, fechaFin debe ser null
    beforeSave: (experiencia, options) => {
      if (experiencia.esTrabajoActual) {
        experiencia.fechaFin = null;
      }
    }
  }
});

module.exports = ExperienciaLaboral;