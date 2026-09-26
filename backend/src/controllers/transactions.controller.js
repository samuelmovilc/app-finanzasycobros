const db = require('../config/db');

exports.getAll = async (req, res, next) => {
    try {
        const [transactions] = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { amount, concept, type } = req.body;
        // Tipos permitidos para registro manual: INGRESO_MANUAL, EGRESO_MANUAL, INGRESO_CAPITAL
        const validTypes = ['INGRESO_MANUAL', 'EGRESO_MANUAL', 'INGRESO_CAPITAL'];
        if (!validTypes.includes(type)) {
            const err = new Error('Tipo de transacción inválido');
            err.statusCode = 400;
            return next(err);
        }

        await db.query(
            'INSERT INTO transactions (amount, concept, type, user_id) VALUES (?, ?, ?, ?)',
            [amount, concept, type, req.user.id || 1] 
        );
        res.status(201).json({ success: true, message: 'Transacción registrada' });
    } catch (error) {
        next(error);
    }
};
