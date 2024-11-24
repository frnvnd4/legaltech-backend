const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  ticket_id: {
    type: Number, // Relacionado con la tabla Tickets de PostgreSQL
    required: true,
  },
  user_id: {
    type: Number, // Relacionado con el usuario creador
    required: true,
  },
  messages: [
    {
      sender: {
        type: String, // "user" o "clinic"
        required: true,
      },
      content: {
        type: String, // Contenido del mensaje
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const ChatTicket = mongoose.model('ChatTicket', chatSchema);

module.exports = ChatTicket;
