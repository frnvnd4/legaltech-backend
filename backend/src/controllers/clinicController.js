const bcrypt = require('bcrypt');
const LegalClinic = require('../models/LegalClinic');
const Credentials = require('../models/UserCredentials');

const SALT_ROUNDS = 10;

// Crear una nueva clínica jurídica (solo admin)
exports.createClinic = async (req, res) => {
  const { name, address, contact_email, phone_number, password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ message: "La contraseña es obligatoria." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear la clínica
    const clinic = await LegalClinic.create({
      name,
      address,
      contact_email,
      phone_number,
    });

    // Crear credenciales asociadas
    await Credentials.create({
      clinic_id: clinic.clinic_id,
      type: 'clinic',
      password_hash: hashedPassword,
    });

    res.status(201).json({ message: "Clínica creada exitosamente.", clinic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la clínica.", error: error.message });
  }
};

// Obtener todas las clínicas jurídicas
exports.getAllClinics = async (req, res) => {
  try {
    const clinics = await LegalClinic.findAll();
    res.status(200).json(clinics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las clínicas jurídicas', error: error.message });
  }
};

// Actualizar una clínica jurídica
exports.updateClinic = async (req, res) => {
  const { id } = req.params;
  const { name, address, contact_email, phone_number } = req.body;

  try {
    const clinic = await LegalClinic.findByPk(id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clínica jurídica no encontrada' });
    }

    await clinic.update({ name, address, contact_email, phone_number });
    res.status(200).json({ message: 'Clínica jurídica actualizada exitosamente', clinic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la clínica jurídica', error: error.message });
  }
};

// Eliminar una clínica jurídica
exports.deleteClinic = async (req, res) => {
  const { id } = req.params;

  try {
    const clinic = await LegalClinic.findByPk(id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clínica jurídica no encontrada' });
    }

    await clinic.destroy();
    res.status(200).json({ message: 'Clínica jurídica eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la clínica jurídica', error: error.message });
  }
};

// Obtener clínica jurídica específica
exports.getClinicById = async (req, res) => {
  const { id } = req.params;

  try {
    const clinic = await LegalClinic.findByPk(id);
    if (!clinic) {
      return res.status(404).json({ message: 'Clínica jurídica no encontrada.' });
    }

    res.status(200).json(clinic);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clínica jurídica.', error: error.message });
  }
};

// Actualizar datos de la clínica jurídica (Propietario o Administrador)
exports.updateClinicProfile = async (req, res) => {
  const { name, address, contact_email, phone_number } = req.body;

  try {
    const clinic = await LegalClinic.findOne({ where: { clinic_id: req.user.clinicId } });
    if (!clinic) {
      return res.status(404).json({ message: 'Clínica jurídica no encontrada.' });
    }

    // Actualizar los datos
    if (name) clinic.name = name;
    if (address) clinic.address = address;
    if (contact_email) clinic.contact_email = contact_email;
    if (phone_number) clinic.phone_number = phone_number;

    await clinic.save();

    res.status(200).json({ message: 'Datos de la clínica actualizados exitosamente.', clinic });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar datos de la clínica.', error: error.message });
  }
};

// Eliminar la cuenta de la clínica jurídica
exports.deleteClinicProfile = async (req, res) => {
  try {
    const clinic = await LegalClinic.findOne({ where: { clinic_id: req.user.clinicId } });
    if (!clinic) {
      return res.status(404).json({ message: 'Clínica jurídica no encontrada.' });
    }

    await clinic.destroy();

    // Revocar el token
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.decode(token);
    await RevokedToken.create({
      token,
      expiryDate: new Date(decoded.exp * 1000),
    });

    res.status(200).json({ message: 'Cuenta de la clínica eliminada y token revocado.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la cuenta de la clínica.', error: error.message });
  }
};

// Obtener perfil de la clínica jurídica autenticada
exports.getClinicProfile = async (req, res) => {
  try {
    // Usar clinicId del token para obtener el perfil de la clínica
    const clinic = await LegalClinic.findOne({ where: { clinic_id: req.user.clinicId } });
    if (!clinic) {
      return res.status(404).json({ message: 'Clínica jurídica no encontrada.' });
    }

    res.status(200).json(clinic);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil de la clínica.', error: error.message });
  }
};
