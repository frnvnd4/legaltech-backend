const { DataTypes } = require('sequelize');
const sequelize = require('../../db/sequelize');
const LegalClinic = require('./LegalClinic');

const ClinicCredentials = sequelize.define('ClinicCredentials', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clinic_id: {
    type: DataTypes.INTEGER,
    unique: true,
    references: {
      model: LegalClinic,
      key: 'clinic_id',
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  last_password_change: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

LegalClinic.hasOne(ClinicCredentials, { foreignKey: 'clinic_id' });
ClinicCredentials.belongsTo(LegalClinic, { foreignKey: 'clinic_id' });

module.exports = ClinicCredentials;
