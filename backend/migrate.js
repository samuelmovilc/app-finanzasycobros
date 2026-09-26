const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');

async function migrate() {
    console.log("Conectando al servidor Contabo en el puerto 3308...");
    // Conectarse sin base de datos específica para crearla
    const serverDb = await mysql.createConnection({
        host: '89.117.56.39',
        port: 3308,
        user: 'pos_user',
        password: 'Pap3l3r!4#S3cur3_2026'
    });

    console.log("Creando base de datos finanzas_db si no existe...");
    await serverDb.query('CREATE DATABASE IF NOT EXISTS finanzas_db;');
    await serverDb.end();

    console.log("Conectando a finanzas_db para crear las tablas...");
    const db = await mysql.createConnection({
        host: '89.117.56.39',
        port: 3308,
        user: 'pos_user',
        password: 'Pap3l3r!4#S3cur3_2026',
        database: 'finanzas_db',
        multipleStatements: true
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

    console.log("Ejecutando sentencias de creación de tablas...");
    await db.query(createUsersTable);
    await db.query(createClientsTable);
    await db.query(createLoansTable);
    await db.query(createTransactionsTable);

    // Insertar usuario administrador por defecto
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', ['admin@finanzas.com']);
    if (users.length === 0) {
        console.log("Creando usuario administrador por defecto...");
        const hash = await bcrypt.hash('admin123', 10);
        await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', ['Administrador', 'admin@finanzas.com', hash]);
    }

    console.log("¡Migración completada exitosamente! Base de datos lista.");
    await db.end();
}

migrate().catch(err => {
    console.error("Error durante la migración:", err);
    process.exit(1);
});
