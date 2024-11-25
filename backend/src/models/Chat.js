const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user_id: {
    type: Number, // Relacionado con el usuario creador
    required: true,
  },
  ticket_id: {
    type: Number, // Relacionado con la tabla Tickets de PostgreSQL (opcional)
  },
  messages: [
    {
      sender: {
        type: String, // "user" o "bot"
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

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
