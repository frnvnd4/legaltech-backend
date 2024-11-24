const express = require('express');
const authMiddleware = require('../middlewares/authenticates');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/users/signup', authController.signUpUser);
router.post('/clinics/signup', authController.signUpClinic);
router.post('/users/signin', authController.signInUser);
router.post('/clinics/signin', authController.signInClinic);
router.post('/signout', authController.signOut);

// Ruta protegida de ejemplo
router.get('/protected', authMiddleware.authenticateToken, (req, res) => {
  res.status(200).json({ message: "Acceso permitido a ruta protegida" });
});

module.exports = router;
