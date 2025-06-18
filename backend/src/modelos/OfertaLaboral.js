// ========================================
// MODELO DE OFERTA LABORAL - TRABAJOS PUBLICADOS POR EMPRESAS
// ========================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');

// Definir el modelo OfertaLaboral
const OfertaLaboral = sequelize.define('OfertaLaboral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Información básica del trabajo
  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 150]
    }
  },
  
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [20, 2000]
    }
  },
  
  // Requisitos para el matching
  educacionRequerida: {
    type: DataTypes.ENUM('bachillerato', 'tecnico', 'licenciatura', 'ingenieria', 'maestria', 'doctorado'),
    allowNull: false,
    defaultValue: 'licenciatura'
  },
  
  experienciaMinima: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 20
    }
  },
  
  // Habilidades requeridas (como JSON array)
  habilidadesRequeridas: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  
  // Detalles del trabajo
  ubicacion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Santa Cruz, Bolivia'
  },
  
  tipoTrabajo: {
    type: DataTypes.ENUM('tiempo-completo', 'medio-tiempo', 'freelance', 'contrato', 'practicante'),
    allowNull: false,
    defaultValue: 'tiempo-completo'
  },
  
  modalidad: {
    type: DataTypes.ENUM('presencial', 'remoto', 'hibrido'),
    allowNull: false,
    defaultValue: 'presencial'
  },
  
  // Salario
  salarioMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  salarioMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  // Estado de la oferta
  estado: {
    type: DataTypes.ENUM('activa', 'pausada', 'cerrada', 'expirada'),
    allowNull: false,
    defaultValue: 'activa'
  },
  
  fechaExpiracion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Estadísticas de la oferta
  numeroAplicaciones: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  // Quién publicó esta oferta (FK a usuarios con tipo 'empresa')
  empresaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
  
}, {
  // Configuración del modelo
  tableName: 'ofertas_laborales',
  indexes: [
    {
      fields: ['empresaId']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['educacionRequerida']
    },
    {
      fields: ['ubicacion']
    },
    {
      fields: ['fechaExpiracion']
    }
  ]
});

// Métodos útiles del modelo
OfertaLaboral.prototype.estaActiva = function() {
  return this.estado === 'activa' && 
         (!this.fechaExpiracion || new Date() < this.fechaExpiracion);
};

OfertaLaboral.prototype.getRangoSalarial = function() {
  if (this.salarioMin && this.salarioMax) {
    return `Bs. ${this.salarioMin.toLocaleString()} - ${this.salarioMax.toLocaleString()}`;
  } else if (this.salarioMin) {
    return `Desde Bs. ${this.salarioMin.toLocaleString()}`;
  } else if (this.salarioMax) {
    return `Hasta Bs. ${this.salarioMax.toLocaleString()}`;
  }
  return 'Salario a convenir';
};

OfertaLaboral.prototype.getHabilidadesTexto = function() {
  return Array.isArray(this.habilidadesRequeridas) ? 
         this.habilidadesRequeridas.join(', ') : 
         'No especificadas';
};

// Exportar el modelo
module.exports = OfertaLaboral;