const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Ajustar la ruta del .env

const connectMongo = async () => {
    try {
        await mongoose.connect(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/${process.env.MONGO_DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            authSource: "admin", // Para autenticación inicial
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectMongo;
