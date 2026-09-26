require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('Agregando columna status a transactions...');
        await connection.query("ALTER TABLE transactions ADD COLUMN status ENUM('ACTIVO', 'ANULADO') DEFAULT 'ACTIVO'");
        console.log('OK');
    } catch (e) {
        console.log('La columna ya existe o error:', e.message);
    }

    try {
        console.log('Corrigiendo pago de agua...');
        await connection.query("UPDATE transactions SET type = 'EGRESO', category_id = 4 WHERE id = 2");
        await connection.query("DELETE FROM categories WHERE id = 8");
        console.log('OK');
    } catch (e) {
        console.log('Error corrigiendo pago de agua:', e.message);
    }

    await connection.end();
}

migrate();
