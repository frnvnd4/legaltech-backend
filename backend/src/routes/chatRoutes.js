const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middlewares/authenticates');

const router = express.Router();

// Obtener el chat de un ticket
router.get('/:ticket_id', authenticateToken, chatController.getChat);

// Enviar un mensaje al chat de un ticket
router.post('/:ticket_id', authenticateToken, chatController.sendMessage);

module.exports = router;
