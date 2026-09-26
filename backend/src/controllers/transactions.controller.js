const db = require('../config/db');

exports.getAll = async (req, res, next) => {
    try {
        const [transactions] = await db.query(`
            SELECT t.*, c.name as category_name 
            FROM transactions t 
            LEFT JOIN categories c ON t.category_id = c.id 
            ORDER BY t.created_at DESC
        `);
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { amount, concept, type, category_id } = req.body;
        // Tipos permitidos para registro manual: INGRESO, EGRESO (modificado para ser coherente con la BD de categorías)
        const validTypes = ['INGRESO', 'EGRESO', 'INGRESO_MANUAL', 'EGRESO_MANUAL', 'INGRESO_CAPITAL'];
        if (!validTypes.includes(type)) {
            const err = new Error('Tipo de transacción inválido');
            err.statusCode = 400;
            return next(err);
        }

        // Si mandan INGRESO_MANUAL mapearlo a INGRESO para la base de datos (por consistencia)
        const finalType = type.includes('INGRESO') ? 'INGRESO' : 'EGRESO';

        await db.query(
            'INSERT INTO transactions (amount, concept, type, category_id, loan_id) VALUES (?, ?, ?, ?, NULL)',
            [amount, concept, finalType, category_id || null] 
        );
        res.status(201).json({ success: true, message: 'Transacción registrada' });
    } catch (error) {
        next(error);
    }
};
