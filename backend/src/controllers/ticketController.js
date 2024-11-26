const Ticket = require('../models/Ticket');
const Chat = require('../models/Chat');
const TicketAssignment = require('../models/TicketAssignment');

exports.createTicket = async (req, res) => {
  const { chat_id, title, description } = req.body;
  const userId = req.user.userId;

  try {
    // Buscar el historial del chat actual del usuario
    const existingChat = await Chat.findById(chat_id);
    console.log(chat_id);
    if (!existingChat) {
      return res.status(404).json({ error: 'El chat especificado no existe.' });
    }

    // Crear el ticket en PostgreSQL
    const newTicket = await Ticket.create({
      title,
      description,
      user_id: userId,
      chat_id,
    });

    res.status(201).json({
      message: 'Ticket creado y asociado al chat existente.',
      ticket: newTicket,
      chat: existingChat,
    });
  } catch (error) {
    console.error('Error al crear ticket asociado a chat existente:', error.message);
    res.status(500).json({ error: 'No se pudo crear el ticket asociado al chat.' });
  }
};

// Obtener todos los tickets del usuario autenticado
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({ where: { user_id: req.user.userId } });
    res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los tickets', error: error.message });
  }
};

// Actualizar un ticket: Solo permitir cambios en el título y descripción para el usuario creador
exports.updateTicket = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const ticket = await Ticket.findByPk(id);

    // Verificar si el ticket pertenece al usuario autenticado
    if (!ticket || ticket.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este ticket' });
    }

    // Solo actualizar título y descripción
    await ticket.update({ title, description });

    res.status(200).json({ message: 'Ticket actualizado exitosamente', ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el ticket', error: error.message });
  }
};

// Eliminar un ticket (solo el creador)
exports.deleteTicket = async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await Ticket.findByPk(id);

    if (!ticket || ticket.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este ticket' });
    }

    await ticket.destroy();
    res.status(200).json({ message: 'Ticket eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el ticket', error: error.message });
  }
};

// Actualizar estado y prioridad del ticket: Solo para administradores y clínicas
exports.updateTicketStatusAndPriority = async (req, res) => {
  const { id } = req.params;
  const { status, priority } = req.body;

  try {
    const ticket = await Ticket.findByPk(id);

    // Verificar si el ticket existe
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    // Actualizar estado y prioridad
    await ticket.update({ status, priority });

    res.status(200).json({ message: 'Estado y prioridad actualizados exitosamente', ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el estado y prioridad del ticket', error: error.message });
  }
};

// Obtener un ticket específico por ID
exports.getTicketDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar el ticket por ID
    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: TicketAssignment,
          attributes: ['clinic_id'], // Ver si el ticket está asignado
        },
      ],
    });

    // Verificar si el ticket existe
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    const clinicId = req.user.clinicId || null; // Extraer clinicId si es una clínica
    const userId = req.user.userId || null; // Extraer userId si es un usuario
    const role = req.user.role; // Extraer rol

    // Verificar si el usuario tiene acceso al ticket
    const isCreator = userId && ticket.user_id === userId;
    const isClinicAssigned = clinicId && ticket.TicketAssignment?.clinic_id === clinicId;
    const isClinicUnassigned = clinicId && !ticket.TicketAssignment?.clinic_id;
    const isAdmin = role === 'admin';

    if (!isCreator && !isClinicAssigned && !isClinicUnassigned && !isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado: No tienes permiso para acceder a este ticket' });
    }

    // Obtener el historial de chat del ticket desde MongoDB
    const chat = await Chat.findOne({ ticket_id: id });

    // Si tiene acceso, devolver la información del ticket y el chat
    res.status(200).json({
      ticket,
      chat: chat ? chat.messages : [], // Enviar los mensajes si existen
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el ticket', error: error.message });
  }
};

// Obtener todos los tickets (solo para administradores)
exports.getAllTickets = async (req, res) => {
  try {
    // Recuperar todos los tickets
    const tickets = await Ticket.findAll({
      include: [
        {
          model: TicketAssignment,
          attributes: ['clinic_id'], // Incluir la clínica asignada (si aplica)
        },
      ],
    });

    // Mapear los chats asociados desde MongoDB
    const chatPromises = tickets.map(async (ticket) => {
      const chat = await Chat.findOne({ ticket_id: ticket.ticket_id });
      return {
        ...ticket.dataValues,
        chat: chat ? chat.messages : [], // Incluir los mensajes del chat si existen
      };
    });

    const ticketsWithChats = await Promise.all(chatPromises);

    res.status(200).json(ticketsWithChats);
  } catch (error) {
    console.error('Error al obtener todos los tickets:', error.message);
    res.status(500).json({ message: 'Error al obtener los tickets', error: error.message });
  }
};
