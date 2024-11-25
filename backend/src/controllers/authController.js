const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sequelize = require('../../db/sequelize');
const User = require('../models/User');
const UserCredentials = require('../models/UserCredentials');
const RevokedToken = require('../models/RevokedToken'); 
const LegalClinic = require('../models/LegalClinic');
const ClinicCredentials = require('../models/ClinicCredentials');

// Configuraciones
const SECRET_KEY = process.env.SECRET_KEY || "LEGALTECH_SECRET_KEY"; // Usa variables de entorno para claves sensibles
const SALT_ROUNDS = 10; // Niveles de encriptación

// Registro de usuario
exports.signUpUser = async (req, res) => {
  const { rut, name, email, role, password } = req.body;

  try {
    const user = await User.create({ rut, name, email, role });
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await UserCredentials.create({ user_id: user.user_id, password_hash: hashedPassword });

    res.status(201).json({ message: 'Usuario registrado exitosamente', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

exports.signUpClinic = async (req, res) => {
  const { name, address, contact_email, phone_number, password } = req.body;

  try {
    const clinic = await LegalClinic.create({ name, address, contact_email, phone_number });
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await ClinicCredentials.create({ clinic_id: clinic.clinic_id, password_hash: hashedPassword });

    res.status(201).json({ message: 'Clínica registrada exitosamente', clinic });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar clínica', error: error.message });
  }
};

// Inicio de sesión
exports.signInUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const credentials = await UserCredentials.findOne({ where: { user_id: user.user_id } });
    const isPasswordValid = await bcrypt.compare(password, credentials.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ userId: user.user_id, role: user.role }, SECRET_KEY, { expiresIn: '2h' });
    // Devolver datos del usuario sin la contraseña
    const userData = {
      user_id: user.user_id,
      rut: user.rut,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    res.status(200).json({ message: 'Inicio de sesión exitoso', token, user: userData });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

exports.signInClinic = async (req, res) => {
  const { contact_email, password } = req.body;

  try {
    const clinic = await LegalClinic.findOne({ where: { contact_email } });
    if (!clinic) {
      return res.status(404).json({ message: 'Clínica no encontrada' });
    }

    const credentials = await ClinicCredentials.findOne({ where: { clinic_id: clinic.clinic_id } });
    const isPasswordValid = await bcrypt.compare(password, credentials.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { clinicId: clinic.clinic_id, role: 'clinic' },
      SECRET_KEY,
      { expiresIn: '2h' }
    );
    // Devolver datos de la clínica
    const clinicData = {
      clinic_id: clinic.clinic_id,
      name: clinic.name,
      address: clinic.address,
      contact_email: clinic.contact_email,
      phone_number: clinic.phone_number,
      created_at: clinic.created_at,
    };

    res.status(200).json({ message: 'Inicio de sesión exitoso', token, clinic: clinicData });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// Cerrar sesión
exports.signOut = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ message: "Token no proporcionado" });
  }

  try {
    // Decodifica el token para obtener la fecha de expiración
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: "Token inválido" });
    }

    // Calcula la fecha de expiración del token
    const expiryDate = new Date(decoded.exp * 1000); // `exp` está en segundos, convertir a milisegundos

    // Agregar el token y su fecha de expiración a la lista de tokens revocados
    await RevokedToken.create({ token, expiryDate });

    res.status(200).json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cerrar sesión", error: error.message });
  }
};
