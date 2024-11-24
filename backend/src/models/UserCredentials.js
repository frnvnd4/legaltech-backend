const { DataTypes } = require('sequelize');
const sequelize = require('../../db/sequelize');
const User = require('./User');

const UserCredentials = sequelize.define('UserCredentials', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    unique: true,
    references: {
      model: User,
      key: 'user_id',
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

User.hasOne(UserCredentials, { foreignKey: 'user_id' });
UserCredentials.belongsTo(User, { foreignKey: 'user_id' });

module.exports = UserCredentials;
