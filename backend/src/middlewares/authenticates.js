const jwt = require('jsonwebtoken');
const RevokedToken = require('../models/RevokedToken');
const SECRET_KEY = process.env.SECRET_KEY || "LEGALTECH_SECRET_KEY";

exports.authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Token de acceso no proporcionado" });
  }

  try {
    // Verificar si el token está en la lista de revocación
    const revoked = await RevokedToken.findOne({ where: { token } });
    if (revoked) {
      return res.status(401).json({ message: "Token inválido o revocado" });
    }

    // Verificar la validez del token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token inválido o expirado" });
      }

      req.user = decoded; // Guardar la información decodificada del token en req.user
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Error al validar el token", error: error.message });
  }
};


// Middleware para validar tokens contra la lista negra
exports.checkTokenBlacklist = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (tokenBlacklist.has(token)) {
    return res.status(403).json({ message: "Token inválido: usuario desconectado", status: "error" });
  }
  next();
};

// Middleware para validar que sea un usuario regular
exports.authenticateUser = (req, res, next) => {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ message: 'Acceso denegado: Solo usuarios regulares pueden realizar esta acción' });
  }
  next();
};

// Middleware para validar que sea una clínica
exports.authenticateClinic = (req, res, next) => {
  if (!req.user || req.user.role !== 'clinic') {
    return res.status(403).json({ message: 'Acceso denegado: Solo clínicas pueden realizar esta acción' });
  }
  next();
};

// Middleware para validar que sea un administrador
exports.authenticateAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: Solo administradores pueden realizar esta acción' });
  }
  next();
};

