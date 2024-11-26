const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middlewares/authenticates');


const router = express.Router();

// Obtener el chat de un ticket
router.get('/:ticket_id', authenticateToken, chatController.getChatByTicketId);
router.get('/', authenticateToken, chatController.getUserChats);
// Ruta para interactuar con el bot
router.post('/ask', authenticateToken, chatController.askLegalBot);

module.exports = router;
