const express = require('express');
const clinicController = require('../controllers/clinicController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/authenticates');

const router = express.Router();

// Acceso clínica autenticada
router.get('/profile', authenticateToken, clinicController.getClinicProfile); 
router.put('/profile', authenticateToken, clinicController.updateClinicProfile); 
router.delete('/profile', authenticateToken, clinicController.deleteClinicProfile);
// Acceso para administradores
router.post('/', authenticateToken, authenticateAdmin, clinicController.createClinic);
router.get('/', authenticateToken, authenticateAdmin, clinicController.getAllClinics);
router.get('/:id', authenticateToken, authenticateAdmin, clinicController.getClinicById);
router.put('/:id', authenticateToken, authenticateAdmin, clinicController.updateClinic);
router.delete('/:id', authenticateToken, authenticateAdmin, clinicController.deleteClinic);


module.exports = router;
