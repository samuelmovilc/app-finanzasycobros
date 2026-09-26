const mysql = require('mysql2/promise');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'papeleria_app';

const db = mysql.createPool({
    host: process.env.DB_HOST || '89.117.56.39',
    port: process.env.DB_PORT || 3308,
    user: process.env.DB_USER || 'pos_user',
    password: process.env.DB_PASSWORD || 'Pap3l3r!4#S3cur3_2026',
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;
