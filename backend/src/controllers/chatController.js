const ChatTicket = require('../models/ChatTicket');

// Obtener el chat de un ticket
exports.getChat = async (req, res) => {
  const { ticket_id } = req.params;

  try {
    const chat = await ChatTicket.findOne({ ticket_id });

    if (!chat) {
      return res.status(404).json({ message: 'Chat no encontrado' });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el chat', error: error.message });
  }
};

// Enviar un mensaje al chat de un ticket
exports.sendMessage = async (req, res) => {
  const { ticket_id } = req.params;
  const { content } = req.body;

  try {
    const chat = await ChatTicket.findOne({ ticket_id });

    if (!chat) {
      return res.status(404).json({ message: 'Chat no encontrado' });
    }

    // Determinar el remitente
    const sender = req.user.clinicId ? 'clinic' : 'user';

    // Agregar mensaje al chat
    chat.messages.push({ sender, content });
    await chat.save();

    res.status(201).json({ message: 'Mensaje enviado exitosamente', chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar mensaje', error: error.message });
  }
};
