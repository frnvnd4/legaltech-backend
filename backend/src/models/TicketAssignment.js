const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../../db/sequelize');
const Ticket = require('./Ticket'); // Importar modelo de tickets
const LegalClinic = require('./LegalClinic'); // Importar modelo de clínicas jurídicas

const TicketAssignment = sequelize.define('TicketAssignment', {
  assignment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ticket_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ticket,
      key: 'ticket_id',
    },
    onDelete: 'CASCADE', // Eliminar asignaciones si el ticket es eliminado
  },
  clinic_id: {
    type: DataTypes.INTEGER,
    references: {
      model: LegalClinic,
      key: 'clinic_id',
    },
    onDelete: 'SET NULL', // Si la clínica es eliminada, asignación queda sin clínica
  },
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});

// Relaciones para TicketAssignments
Ticket.hasOne(TicketAssignment, { foreignKey: 'ticket_id' });
TicketAssignment.belongsTo(Ticket, { foreignKey: 'ticket_id' });

LegalClinic.hasMany(TicketAssignment, { foreignKey: 'clinic_id' });
TicketAssignment.belongsTo(LegalClinic, { foreignKey: 'clinic_id' });

module.exports = TicketAssignment;
