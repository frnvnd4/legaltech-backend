const TicketAssignment = require('../models/TicketAssignment');
const Ticket = require('../models/Ticket');

// Asignar un ticket a una clínica (por una clínica)
exports.assignTicket = async (req, res) => {
  const { ticket_id } = req.params;

  try {
    const ticket = await Ticket.findByPk(ticket_id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    if (ticket.status !== 'open') {
      return res.status(400).json({ message: 'Solo se pueden asignar tickets abiertos' });
    }

    const assignment = await TicketAssignment.create({
      ticket_id: ticket_id,
      clinic_id: req.user.clinicId, // Extraer de token del usuario autenticado
    });

    // Actualizar el estado del ticket
    await ticket.update({ status: 'in_progress' });

    res.status(201).json({ message: 'Ticket asignado exitosamente', assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al asignar el ticket', error: error.message });
  }
};

// Obtener todos los tickets asignados a la clínica
exports.getAssignedTickets = async (req, res) => {
  try {
    const assignments = await TicketAssignment.findAll({
      where: { clinic_id: req.user.clinicId },
      include: { model: Ticket },
    });

    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los tickets asignados', error: error.message });
  }
};
