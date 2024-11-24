const express = require('express');
const clinicController = require('../controllers/clinicController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/authenticates');

const router = express.Router();

// Acceso clínica autenticada
router.get('/clinics/profile', authenticateToken, clinicController.getClinicProfile); 
router.put('/clinics/profile', authenticateToken, clinicController.updateClinicProfile); 
router.delete('/clinics/profile', authenticateToken, clinicController.deleteClinicProfile);
// Acceso para administradores
router.post('/clinics', authenticateToken, authenticateAdmin, clinicController.createClinic);
router.get('/clinics', authenticateToken, authenticateAdmin, clinicController.getAllClinics);
router.get('/clinics/:id', authenticateToken, authenticateAdmin, clinicController.getClinicById);
router.put('/clinics/:id', authenticateToken, authenticateAdmin, clinicController.updateClinic);
router.delete('/clinics/:id', authenticateToken, authenticateAdmin, clinicController.deleteClinic);


module.exports = router;
