const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/authenticates');
const router = express.Router();

// Rutas del perfil del usuario autenticado
router.get('/profile', authenticateToken, userController.getUserProfile);
router.put('/profile', authenticateToken, userController.updateUserProfile);
router.delete('/profile', authenticateToken, userController.deleteUserProfile);

// Rutas que requieren acceso de administrador
router.get('/', authenticateToken, authenticateAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, authenticateAdmin, userController.getUserById);
router.put('/:id', authenticateToken, authenticateAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, authenticateAdmin, userController.deleteUser);

module.exports = router;
