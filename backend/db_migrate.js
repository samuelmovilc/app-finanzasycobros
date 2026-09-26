require('dotenv').config();
const db = require('./src/config/db');

async function migrate() {
    try {
        console.log('Iniciando migración de base de datos...');
        
        // 1. Crear tabla categories
        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type ENUM('INGRESO', 'EGRESO') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla categories verificada/creada.');

        // 2. Insertar categorías por defecto si está vacía
        const [rows] = await db.query('SELECT COUNT(*) as count FROM categories');
        if (rows[0].count === 0) {
            await db.query(`
                INSERT INTO categories (name, type) VALUES 
                ('Ventas / Servicios', 'INGRESO'),
                ('Aporte de Capital', 'INGRESO'),
                ('Intereses Cobrados', 'INGRESO'),
                ('Servicios Públicos', 'EGRESO'),
                ('Nómina / Salarios', 'EGRESO'),
                ('Insumos / Compras', 'EGRESO'),
                ('Otros Egresos', 'EGRESO')
            `);
            console.log('✅ Categorías por defecto insertadas.');
        }

        // 3. Alterar tabla transactions
        // Chequear si category_id ya existe para evitar errores
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'transactions' 
            AND COLUMN_NAME = 'category_id'
        `);

        if (columns.length === 0) {
            await db.query('ALTER TABLE transactions ADD COLUMN category_id INT NULL');
            await db.query('ALTER TABLE transactions ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL');
            console.log('✅ Tabla transactions alterada exitosamente.');
        } else {
            console.log('✅ Columna category_id ya existe en transactions.');
        }

        console.log('Migración completada con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante migración:', error);
        process.exit(1);
    }
}

migrate();
