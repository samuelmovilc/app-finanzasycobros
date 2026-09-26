const db = require('../config/db');

exports.getAll = async (req, res, next) => {
    try {
        const [clients] = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
        res.json(clients);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { name, document, phone, address } = req.body;
        const [result] = await db.query('INSERT INTO clients (name, document, phone, address) VALUES (?, ?, ?, ?)', [name, document, phone, address]);
        res.status(201).json({ id: result.insertId, name, document });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const err = new Error('El documento ya está registrado para otro cliente');
            err.statusCode = 400;
            return next(err);
        }
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { name, phone, address } = req.body;
        await db.query('UPDATE clients SET name=?, phone=?, address=? WHERE id=?', [name, phone, address, req.params.id]);
        res.json({ success: true, message: 'Cliente actualizado' });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await db.query('DELETE FROM clients WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Cliente eliminado' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            const err = new Error('No se puede eliminar porque tiene préstamos asociados');
            err.statusCode = 400;
            return next(err);
        }
        next(error);
    }
};
