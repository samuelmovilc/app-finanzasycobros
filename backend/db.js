const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbServer = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initDatabase() {
    try {
        await dbServer.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        
        const db = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('ADMIN', 'USER') DEFAULT 'ADMIN',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        const createClientsTable = `
            CREATE TABLE IF NOT EXISTS clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                document VARCHAR(50) UNIQUE NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        const createLoansTable = `
            CREATE TABLE IF NOT EXISTS loans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT NOT NULL,
                capital_amount DECIMAL(15,2) NOT NULL,
                interest_rate DECIMAL(5,2) NOT NULL,
                status ENUM('ACTIVO', 'PAGADO', 'ATRASADO') DEFAULT 'ACTIVO',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
            );
        `;

        const createTransactionsTable = `
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type ENUM('INGRESO', 'EGRESO', 'PRESTAMO_OTORGADO', 'PAGO_RECIBIDO') NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                concept VARCHAR(255),
                loan_id INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE SET NULL
            );
        `;

        await db.query(createUsersTable);
        await db.query(createClientsTable);
        await db.query(createLoansTable);
        await db.query(createTransactionsTable);

        // Crear usuario admin por defecto si no existe
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', ['admin@finanzas.com']);
        if (users.length === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', ['Administrador', 'admin@finanzas.com', hash]);
        }

        return db;
    } catch (error) {
        console.error('Error inicializando la DB:', error);
        throw error;
    }
}

module.exports = { initDatabase };
