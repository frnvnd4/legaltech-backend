const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Ajustar la ruta del .env

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432, // Aseguramos el puerto por defecto de PostgreSQL
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err);
});

module.exports = pool;
