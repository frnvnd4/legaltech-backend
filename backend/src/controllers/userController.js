const User = require('../models/User');
const UserCredentials = require('../models/UserCredentials');
const jwt = require('jsonwebtoken');
const RevokedToken = require('../models/RevokedToken');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: UserCredentials,
        attributes: ['last_password_change'],
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios.', error: error.message });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await user.update({ name, email, role });
    res.status(200).json({ message: 'Usuario actualizado exitosamente.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario.', error: error.message });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Eliminar credenciales primero (por la relación)
    await UserCredentials.destroy({ where: { user_id: user.user_id } });
    await user.destroy();

    res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario.', error: error.message });
  }
};

// Obtener usuario por id
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id); // Busca el usuario por su clave primaria (ID)

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario.', error: error.message });
  }
};

// Obtener datos del usuario autenticado
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ where: { user_id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los datos del usuario', error: error.message });
  }
};

// Actualizar datos del usuario autenticado
exports.updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findOne({ where: { user_id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar información básica
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    // Actualizar contraseña, si se proporciona
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await UserCredentials.update(
        { password_hash: hashedPassword },
        { where: { user_id: user.user_id } }
      );
    }

    res.status(200).json({ message: 'Datos actualizados exitosamente', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar los datos del usuario', error: error.message });
  }
};

// Borrar cuenta del usuario autenticado
exports.deleteUserProfile = async (req, res) => {
  const userId = req.user.userId; // Extraído del token
  console.log(userId)

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar usuario y credenciales
    await UserCredentials.destroy({ where: { user_id: userId } });
    await User.destroy({ where: { user_id: userId } });

    // Revocar el token
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.decode(token);
    await RevokedToken.create({
      token,
      expiryDate: new Date(decoded.exp * 1000), // Decodificar el tiempo de expiración del token
    });

    res.status(200).json({ message: "Cuenta eliminada y token revocado." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la cuenta", error: error.message });
  }
};
