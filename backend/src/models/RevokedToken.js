const { DataTypes } = require('sequelize');
const sequelize = require('../../db/sequelize');

const RevokedToken = sequelize.define('RevokedToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  token: {
    type: DataTypes.TEXT, // Los tokens pueden ser largos, por eso es mejor usar TEXT
    allowNull: false,
  },
  expiryDate: {
    type: DataTypes.DATE, // Fecha de expiración para limpiar automáticamente tokens antiguos
    allowNull: false,
  },
}, {
  timestamps: true, // Agrega automáticamente campos createdAt y updatedAt
  tableName: 'revoked_tokens', // Nombre de la tabla en la base de datos
});

module.exports = RevokedToken;
