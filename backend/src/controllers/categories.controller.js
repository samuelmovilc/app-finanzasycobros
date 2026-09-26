const db = require('../config/db');

// Ejecuta la migración estructural (creación de tabla categories y relación)
exports.migrate = async (req, res, next) => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type ENUM('INGRESO', 'EGRESO') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

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
        }

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
        }

        res.json({ success: true, message: 'Migración de categorías completada con éxito.' });
    } catch (error) {
        next(error);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY type, name');
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) {
            const err = new Error('Nombre y tipo son obligatorios');
            err.statusCode = 400;
            return next(err);
        }
        const [result] = await db.query('INSERT INTO categories (name, type) VALUES (?, ?)', [name, type]);
        res.status(201).json({ success: true, id: result.insertId, name, type });
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Categoría eliminada' });
    } catch (error) {
        next(error);
    }
};
