const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_2026';

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            const err = new Error('Usuario no encontrado');
            err.statusCode = 404;
            return next(err);
        }
        
        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            const err = new Error('Contraseña incorrecta');
            err.statusCode = 401;
            return next(err);
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        next(error);
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
        const match = await bcrypt.compare(currentPassword, users[0].password);
        if (!match) {
            const err = new Error('Contraseña actual incorrecta');
            err.statusCode = 401;
            return next(err);
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
        res.json({ success: true, message: 'Contraseña actualizada' });
    } catch (error) {
        next(error);
    }
};
