const db = require('../config/db');

exports.getAll = async (req, res, next) => {
    try {
        const [loans] = await db.query(`
            SELECT l.*, c.name as client_name 
            FROM loans l 
            JOIN clients c ON l.client_id = c.id 
            ORDER BY l.created_at DESC
        `);
        res.json(loans);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { client_id, capital_amount, interest_rate } = req.body;
        
        if (!client_id || !capital_amount || !interest_rate) {
            const err = new Error('Faltan datos obligatorios');
            err.statusCode = 400;
            throw err;
        }

        const [loanResult] = await connection.query(
            'INSERT INTO loans (client_id, capital_amount, interest_rate) VALUES (?, ?, ?)',
            [client_id, capital_amount, interest_rate]
        );
        const loanId = loanResult.insertId;

        await connection.query(
            'INSERT INTO transactions (type, amount, concept, loan_id) VALUES (?, ?, ?, ?)',
            ['PRESTAMO_OTORGADO', capital_amount, 'Desembolso de Préstamo', loanId]
        );

        await connection.commit();
        res.status(201).json({ id: loanId, success: true, message: 'Préstamo creado exitosamente' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE loans SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: `Préstamo actualizado a ${status}` });
    } catch (error) {
        next(error);
    }
};

exports.getPayments = async (req, res, next) => {
    try {
        const [payments] = await db.query(
            'SELECT * FROM transactions WHERE loan_id = ? AND type = "PAGO_RECIBIDO" ORDER BY created_at DESC',
            [req.params.id]
        );
        res.json(payments);
    } catch (error) {
        next(error);
    }
};

exports.createPayment = async (req, res, next) => {
    try {
        const { loan_id, amount, concept } = req.body;
        await db.query(
            'INSERT INTO transactions (type, amount, concept, loan_id) VALUES (?, ?, ?, ?)',
            ['PAGO_RECIBIDO', amount, concept, loan_id]
        );
        res.status(201).json({ success: true, message: 'Pago registrado exitosamente' });
    } catch (error) {
        next(error);
    }
};
