const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../../db/sequelize');

const LegalClinic = sequelize.define('LegalClinic', {
  clinic_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  contact_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true, // Establecer restricción de unicidad
    validate: {
      isEmail: true, // Validar formato de correo electrónico
    },
  },
  phone_number: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  }
});

module.exports = LegalClinic;
