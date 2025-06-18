// ========================================
// MODELO DE APLICACIÓN - PROFESIONALES APLICANDO A OFERTAS
// ========================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');

// Definir el modelo Aplicacion
const Aplicacion = sequelize.define('Aplicacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Referencias a las tablas relacionadas
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  
  ofertaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ofertas_laborales',
      key: 'id'
    }
  },
  
  // Estado de la aplicación
  estado: {
    type: DataTypes.ENUM('enviada', 'revisando', 'entrevista', 'aceptada', 'rechazada', 'retirada'),
    allowNull: false,
    defaultValue: 'enviada'
  },
  
  // Puntuación de matching calculada automáticamente
  porcentajeMatching: {
    type: DataTypes.DECIMAL(5, 2), // Permite valores como 87.25
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  // Carta de presentación del profesional
  cartaPresentacion: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1500]
    }
  },
  
  // Notas de la empresa sobre este candidato
  notasEmpresa: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Fechas importantes del proceso
  fechaAplicacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  fechaRevision: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  fechaEntrevista: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  fechaRespuesta: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Información adicional
  salarioEsperado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  disponibilidadInicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Datos útiles para el seguimiento
  vistaPorEmpresa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  fechaUltimaVista: {
    type: DataTypes.DATE,
    allowNull: true
  }
  
}, {
  // Configuración del modelo
  tableName: 'aplicaciones',
  indexes: [
    {
      fields: ['profesionalId']
    },
    {
      fields: ['ofertaId']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['porcentajeMatching']
    },
    {
      fields: ['fechaAplicacion']
    },
    {
      // Índice único para evitar aplicaciones duplicadas
      unique: true,
      fields: ['profesionalId', 'ofertaId']
    }
  ]
});

// Métodos útiles del modelo
Aplicacion.prototype.estaEnProceso = function() {
  return ['enviada', 'revisando', 'entrevista'].includes(this.estado);
};

Aplicacion.prototype.estaCompletada = function() {
  return ['aceptada', 'rechazada', 'retirada'].includes(this.estado);
};

Aplicacion.prototype.puedeSerEditada = function() {
  return this.estado === 'enviada';
};

Aplicacion.prototype.getEstadoTexto = function() {
  const estados = {
    enviada: 'Enviada',
    revisando: 'En Revisión',
    entrevista: 'Entrevista Programada',
    aceptada: 'Aceptada',
    rechazada: 'No Seleccionada',
    retirada: 'Retirada por Candidato'
  };
  return estados[this.estado] || this.estado;
};

Aplicacion.prototype.getEstadoColor = function() {
  const colores = {
    enviada: 'blue',
    revisando: 'orange',
    entrevista: 'purple',
    aceptada: 'green',
    rechazada: 'red',
    retirada: 'gray'
  };
  return colores[this.estado] || 'gray';
};

Aplicacion.prototype.getDiasTranscurridos = function() {
  const ahora = new Date();
  const fechaApp = new Date(this.fechaAplicacion);
  const diferencia = Math.floor((ahora - fechaApp) / (1000 * 60 * 60 * 24));
  return diferencia;
};

// Exportar el modelo
module.exports = Aplicacion;