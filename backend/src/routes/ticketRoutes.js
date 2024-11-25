const express = require('express');
const ticketController = require('../controllers/ticketController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/authenticates');

const router = express.Router();

// Solo usuarios autenticados
router.post('/', authenticateToken, ticketController.createTicket);
router.get('/', authenticateToken, ticketController.getUserTickets);
router.put('/:id', authenticateToken, ticketController.updateTicket);
router.delete('/:id', authenticateToken, ticketController.deleteTicket);
router.get('/:id', authenticateToken, ticketController.getTicketDetails);
router.get('/all', authenticateToken, authenticateAdmin, ticketController.getAllTickets);
// Actualizar estado y prioridad: Solo administradores y clínicas
router.put('/:id/status',authenticateToken,
  (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'clinic') {
      return next();
    }
    return res.status(403).json({ message: 'Acceso denegado: Solo administradores o clínicas pueden actualizar estado y prioridad' });
  },
  ticketController.updateTicketStatusAndPriority
);

module.exports = router;
