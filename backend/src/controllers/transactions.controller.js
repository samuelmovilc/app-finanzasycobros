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
        const validTypes = ['INGRESO', 'EGRESO', 'INGRESO_MANUAL', 'EGRESO_MANUAL', 'INGRESO_CAPITAL'];
        if (!validTypes.includes(type)) {
            const err = new Error('Tipo de transacción inválido');
            err.statusCode = 400;
            return next(err);
        }

        if (['INGRESO_MANUAL', 'EGRESO_MANUAL', 'INGRESO', 'EGRESO'].includes(type) && !category_id) {
            const err = new Error('La categoría es estrictamente obligatoria');
            err.statusCode = 400;
            return next(err);
        }

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

exports.update = async (req, res, next) => {
    try {
        const { amount, concept, type, category_id } = req.body;
        
        if (!category_id) {
            const err = new Error('La categoría es estrictamente obligatoria para editar');
            err.statusCode = 400;
            return next(err);
        }

        const finalType = type.includes('INGRESO') ? 'INGRESO' : 'EGRESO';

        await db.query(
            'UPDATE transactions SET amount = ?, concept = ?, type = ?, category_id = ? WHERE id = ?',
            [amount, concept, finalType, category_id, req.params.id]
        );
        res.json({ success: true, message: 'Transacción actualizada' });
    } catch (error) {
        next(error);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        await db.query("UPDATE transactions SET status = 'ANULADO' WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Transacción anulada' });
    } catch (error) {
        next(error);
    }
};

exports.migrate = async (req, res, next) => {
    try {
        try {
            await db.query("ALTER TABLE transactions ADD COLUMN status ENUM('ACTIVO', 'ANULADO') DEFAULT 'ACTIVO'");
        } catch (e) {
            console.log('Column status already exists or error:', e.message);
        }
        try {
            await db.query("UPDATE transactions SET type = 'EGRESO', category_id = 4 WHERE id = 2");
            await db.query("DELETE FROM categories WHERE id = 8");
        } catch (e) {
            console.log('Error correcting agua:', e.message);
        }
        res.json({ success: true, message: 'Migración y corrección completadas' });
    } catch (error) {
        next(error);
    }
};
