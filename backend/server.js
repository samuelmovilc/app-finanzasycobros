const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { initDatabase } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3020;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_2026';

let db;

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
    // Transacción SQL para asegurar consistencia
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { client_id, capital_amount, interest_rate } = req.body;
        
        // 1. Crear Préstamo
        const [loanResult] = await connection.query(
            'INSERT INTO loans (client_id, capital_amount, interest_rate) VALUES (?, ?, ?)',
            [client_id, capital_amount, interest_rate]
        );
        const loanId = loanResult.insertId;

        // 2. Registrar Egreso (Sale dinero de la caja)
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

// Registrar un Pago
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

// ======================= DASHBOARD =======================
app.get('/api/dashboard', async (req, res) => {
    try {
        const [loans] = await db.query("SELECT SUM(capital_amount) as total_prestado FROM loans WHERE status = 'ACTIVO'");
        const [incomes] = await db.query("SELECT SUM(amount) as total_caja FROM transactions WHERE type = 'PAGO_RECIBIDO'");
        
        const [recentLoans] = await db.query(`
            SELECT l.id, l.capital_amount, l.interest_rate, l.status, c.name as client_name 
            FROM loans l JOIN clients c ON l.client_id = c.id 
            ORDER BY l.created_at DESC LIMIT 5
        `);

        res.json({
            capital_prestado: loans[0].total_prestado || 0,
            caja_actual: incomes[0].total_caja || 0,
            recentLoans
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar el dashboard' });
    }
});

async function startServer() {
    try {
        db = await initDatabase();
        app.listen(PORT, () => {
            console.log(`✅ Servidor Backend corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}
startServer();
