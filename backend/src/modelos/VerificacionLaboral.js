// ========================================
// MODELO DE VERIFICACIÓN LABORAL - EMPRESAS VERIFICANDO EX-EMPLEADOS
// ========================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/baseDatos');

// Definir el modelo VerificacionLaboral
const VerificacionLaboral = sequelize.define('VerificacionLaboral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Referencias principales
  profesionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  
  empresaVerificadoraId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  
  // Información del trabajo verificado
  cargoDesempenado: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 150]
    }
  },
  
  departamento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: true // null significa que aún trabaja ahí
  },
  
  // Detalles de la verificación
  tipoContrato: {
    type: DataTypes.ENUM('empleado-fijo', 'contrato-temporal', 'freelance', 'consultor', 'practicante'),
    allowNull: false,
    defaultValue: 'empleado-fijo'
  },
  
  salario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  responsabilidades: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Evaluación de desempeño
  calificacion: {
    type: DataTypes.ENUM('excelente', 'muy-bueno', 'bueno', 'regular', 'malo'),
    allowNull: true
  },
  
  comentariosDesempeno: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Información adicional
  motivoSalida: {
    type: DataTypes.ENUM('renuncia-voluntaria', 'fin-contrato', 'despido', 'reduccion-personal', 'otro'),
    allowNull: true
  },
  
  elegibleRecontratacion: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  
  // Estado de la verificación
  estado: {
    type: DataTypes.ENUM('pendiente', 'verificado', 'rechazado', 'revisando'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  
  // Quién en la empresa hizo la verificación
  verificadoPor: {
    type: DataTypes.STRING(150),
    allowNull: true // Nombre del empleado/RRHH que verificó
  },
  
  // Fechas de proceso
  fechaSolicitud: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  fechaVerificacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Información de contacto para verificación externa
  emailContacto: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  
  telefonoContacto: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  // Hash de verificación para blockchain (futuro)
  hashVerificacion: {
    type: DataTypes.STRING(64),
    allowNull: true
  }
  
}, {
  // Configuración del modelo
  tableName: 'verificaciones_laborales',
  indexes: [
    {
      fields: ['profesionalId']
    },
    {
      fields: ['empresaVerificadoraId']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fechaInicio', 'fechaFin']
    },
    {
      fields: ['calificacion']
    }
  ]
});

// Métodos útiles del modelo
VerificacionLaboral.prototype.calcularDuracionTrabajo = function() {
  const inicio = new Date(this.fechaInicio);
  const fin = this.fechaFin ? new Date(this.fechaFin) : new Date();
  const diferenciaMeses = (fin.getFullYear() - inicio.getFullYear()) * 12 + 
                         (fin.getMonth() - inicio.getMonth());
  
  if (diferenciaMeses < 12) {
    return `${diferenciaMeses} ${diferenciaMeses === 1 ? 'mes' : 'meses'}`;
  } else {
    const años = Math.floor(diferenciaMeses / 12);
    const mesesRestantes = diferenciaMeses % 12;
    return mesesRestantes > 0 ? 
           `${años} ${años === 1 ? 'año' : 'años'} y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}` :
           `${años} ${años === 1 ? 'año' : 'años'}`;
  }
};

VerificacionLaboral.prototype.estaActualmenteTrabajando = function() {
  return !this.fechaFin;
};

VerificacionLaboral.prototype.getCalificacionTexto = function() {
  const calificaciones = {
    'excelente': 'Excelente (5/5)',
    'muy-bueno': 'Muy Bueno (4/5)',
    'bueno': 'Bueno (3/5)',
    'regular': 'Regular (2/5)',
    'malo': 'Malo (1/5)'
  };
  return calificaciones[this.calificacion] || 'No calificado';
};

VerificacionLaboral.prototype.getEstadoTexto = function() {
  const estados = {
    pendiente: 'Pendiente de Verificación',
    verificado: 'Verificado',
    rechazado: 'Información Incorrecta',
    revisando: 'En Proceso de Verificación'
  };
  return estados[this.estado] || this.estado;
};

VerificacionLaboral.prototype.calcularAñosExperiencia = function() {
  const inicio = new Date(this.fechaInicio);
  const fin = this.fechaFin ? new Date(this.fechaFin) : new Date();
  return Math.max(0, Math.floor((fin - inicio) / (1000 * 60 * 60 * 24 * 365.25)));
};

// Exportar el modelo
module.exports = VerificacionLaboral;