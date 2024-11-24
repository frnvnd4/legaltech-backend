const app = require('../app');
const connectMongo = require('./db/mongo');
const pool = require('./db/postgres');
require('dotenv').config({ path: '../.env' });

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        // Conectar a MongoDB
        await connectMongo();

        // Verificar conexión a PostgreSQL
        await pool.query('SELECT 1 + 1 AS result');
        console.log('PostgreSQL is ready');

        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error initializing the server:', error);
        process.exit(1);
    }
})();
