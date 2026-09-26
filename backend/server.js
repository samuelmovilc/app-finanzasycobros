const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3020;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_2026';

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token requerido' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// ======================= AUTH =======================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        
        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.put('/api/auth/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
        const match = await bcrypt.compare(currentPassword, users[0].password);
        if (!match) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
});

// Todas las rutas debajo requieren autenticación
app.use('/api', authMiddleware);

// ======================= CLIENTS =======================
app.get('/api/clients', async (req, res) => {
    try {
        const [clients] = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

app.post('/api/clients', async (req, res) => {
    try {
        const { name, document, phone, address } = req.body;
        const [result] = await db.query('INSERT INTO clients (name, document, phone, address) VALUES (?, ?, ?, ?)', [name, document, phone, address]);
        res.status(201).json({ id: result.insertId, name, document });
    } catch (error) {
        res.status(400).json({ error: 'Error al crear cliente. Puede que el documento ya exista.' });
    }
});

app.put('/api/clients/:id', async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        await db.query('UPDATE clients SET name=?, phone=?, address=? WHERE id=?', [name, phone, address, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

app.delete('/api/clients/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM clients WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar. Verifique dependencias.' });
    }
});

// ======================= LOANS & TRANSACTIONS =======================
app.get('/api/loans', async (req, res) => {
    try {
        const [loans] = await db.query(`
            SELECT l.*, c.name as client_name 
            FROM loans l 
            JOIN clients c ON l.client_id = c.id 
            ORDER BY l.created_at DESC
        `);
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener préstamos' });
    }
});

app.post('/api/loans', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { client_id, capital_amount, interest_rate } = req.body;
        
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
        res.status(201).json({ id: loanId, success: true });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al procesar el préstamo' });
    } finally {
        connection.release();
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const { loan_id, amount, concept } = req.body;
        await db.query(
            'INSERT INTO transactions (type, amount, concept, loan_id) VALUES (?, ?, ?, ?)',
            ['PAGO_RECIBIDO', amount, concept, loan_id]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar pago' });
    }
});

app.get('/api/loans/:id/payments', async (req, res) => {
    try {
        const [payments] = await db.query(
            'SELECT * FROM transactions WHERE loan_id = ? AND type = "PAGO_RECIBIDO" ORDER BY created_at DESC',
            [req.params.id]
        );
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

app.put('/api/loans/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE loans SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar estado' });
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        const [transactions] = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener transacciones' });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const { amount, concept, type } = req.body;
        // Tipos permitidos para registro manual: INGRESO_MANUAL, EGRESO_MANUAL, INGRESO_CAPITAL
        await db.query(
            'INSERT INTO transactions (amount, concept, type, user_id) VALUES (?, ?, ?, ?)',
            [amount, concept, type, 1] // Asumiendo user_id 1
        );
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar transacción' });
    }
});

// ======================= DASHBOARD =======================
app.get('/api/dashboard', async (req, res) => {
    try {
        const [loans] = await db.query("SELECT SUM(capital_amount) as total_prestado FROM loans WHERE status = 'ACTIVO'");
        
        // Calcular intereses pendientes (basado en capital_amount * interest_rate / 100)
        const [intereses] = await db.query("SELECT SUM(capital_amount * (interest_rate / 100)) as pendientes FROM loans WHERE status = 'ACTIVO'");

        // Calcular caja actual
        // Entradas: PAGO_RECIBIDO, INGRESO_MANUAL, INGRESO_CAPITAL
        // Salidas: PRESTAMO_OTORGADO, EGRESO_MANUAL
        const [trans] = await db.query("SELECT type, SUM(amount) as total FROM transactions GROUP BY type");
        let caja = 0;
        let capitalInvertido = 150000; // Base inicial para demo, o sumar INGRESO_CAPITAL

        trans.forEach(t => {
            if (['PAGO_RECIBIDO', 'INGRESO_MANUAL', 'INGRESO_CAPITAL'].includes(t.type)) caja += Number(t.total);
            if (['PRESTAMO_OTORGADO', 'EGRESO_MANUAL'].includes(t.type)) caja -= Number(t.total);
            if (t.type === 'INGRESO_CAPITAL') capitalInvertido += Number(t.total);
        });
        
        // Datos de préstamos por mes (últimos 6 meses)
        const [chartDataQuery] = await db.query(`
            SELECT DATE_FORMAT(created_at, '%b') as name, SUM(capital_amount) as total 
            FROM loans 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY name
            ORDER BY MIN(created_at) ASC
        `);

        // Préstamos recientes
        const [recentLoans] = await db.query(`
            SELECT l.id, l.capital_amount, l.interest_rate, l.status, c.name as client_name 
            FROM loans l JOIN clients c ON l.client_id = c.id 
            ORDER BY l.created_at DESC LIMIT 5
        `);

        res.json({
            capital_prestado: loans[0].total_prestado || 0,
            intereses_pendientes: intereses[0].pendientes || 0,
            caja_actual: caja,
            total_invertido: capitalInvertido,
            chartData: chartDataQuery.length > 0 ? chartDataQuery : [
                { name: 'Abr', total: 0 }, { name: 'May', total: 0 }, { name: 'Jun', total: 0 }, 
                { name: 'Jul', total: 0 }, { name: 'Ago', total: 0 }, { name: 'Sep', total: 0 }
            ],
            recentLoans
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cargar el dashboard' });
    }
});

// Arrancar en local
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Servidor Backend corriendo en el puerto ${PORT}`);
    });
}

// Exportar para Vercel Serverless
module.exports = app;
