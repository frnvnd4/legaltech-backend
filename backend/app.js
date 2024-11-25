const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Para MongoDB
const sequelize = require('./db/sequelize'); // Para PostgreSQL
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const clinicRoutes = require('./src/routes/clinicRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const ticketAssignmentRoutes = require('./src/routes/ticketAssignmentRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
require('events').EventEmitter.defaultMaxListeners = 15;

// Inicializar la app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Conexión a PostgreSQL
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL exitosa.');

    // Sincronizar modelos (sin force para no sobreescribir datos existentes)
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con PostgreSQL.');
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error.message);
  }
})();

// Conexión a MongoDB
(async () => {
  try {
    await mongoose.connect(
      `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/${process.env.MONGO_DB_NAME}`,
      {
        authSource: 'admin', // Base de datos de autenticación
      }
    );
    console.log('Conexión a MongoDB exitosa.');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
  }
})();

// Uso de rutas
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/users', userRoutes); // Rutas de usuarios
app.use('/api/clinics', clinicRoutes); // Rutas de Clínicas Jurídicas
app.use('/api/tickets', ticketRoutes); // Rutas para tickets
app.use('/api/ticket-assignments', ticketAssignmentRoutes); // Rutas para asignaciones
app.use('/api/chats', chatRoutes); // Rutas para chats


// Ruta por defecto
app.get('/', (req, res) => {
  res.send('LegalTech Backend is running...');
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Ocurrió un error en el servidor', error: err.message });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

const cleanExpiredTokens = async () => {
    try {
      const now = new Date();
      await RevokedToken.destroy({ where: { expiryDate: { [Sequelize.Op.lt]: now } } });
      console.log('Tokens expirados eliminados.');
    } catch (error) {
      console.error('Error al limpiar tokens expirados:', error.message);
    }
  };
  
  setInterval(cleanExpiredTokens, 24 * 60 * 60 * 1000); // Limpia cada 24 horas
  

module.exports = app;
