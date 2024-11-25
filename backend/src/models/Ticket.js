const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../../db/sequelize');
const User = require('./User'); // Asegúrate de importar correctamente el modelo de usuario

const Ticket = sequelize.define('Ticket', {
  ticket_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'open', // Estados posibles: open, in_progress, closed
    validate: {
      isIn: [['open', 'in_progress', 'closed']],
    },
  },
  priority: {
    type: DataTypes.STRING(50),
    defaultValue: 'medium', // Prioridades posibles: low, medium, high
    validate: {
      isIn: [['low', 'medium', 'high']],
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id',
    },
    onDelete: 'CASCADE', // Eliminar los tickets si el usuario es eliminado
  },
  chat_id: {
    type: DataTypes.STRING, // Almacena el ObjectId del chat en MongoDB como texto
    allowNull: true, // Puede no tener un chat asociado inicialmente
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});

// Relaciones para Tickets
User.hasMany(Ticket, { foreignKey: 'user_id' });
Ticket.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Ticket;

