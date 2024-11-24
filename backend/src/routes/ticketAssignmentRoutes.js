const express = require('express');
const ticketAssignmentController = require('../controllers/ticketAssignmentController');
const { authenticateToken } = require('../middlewares/authenticates');

const router = express.Router();

// Asignar un ticket a una clínica (solo clínicas autenticadas)
router.post('/:ticket_id/assign', authenticateToken, ticketAssignmentController.assignTicket);
//Falta el del admin
// Obtener todos los tickets asignados a la clínica (solo clínicas autenticadas)
router.get('/assigned', authenticateToken, ticketAssignmentController.getAssignedTickets);

module.exports = router;