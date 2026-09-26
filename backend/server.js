const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorMiddleware = require('./src/middlewares/error.middleware');
const authRoutes = require('./src/routes/auth.routes');
const clientRoutes = require('./src/routes/clients.routes');
const loanRoutes = require('./src/routes/loans.routes');
const transactionRoutes = require('./src/routes/transactions.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3020;

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware global de manejo de errores
app.use(errorMiddleware);

// Arrancar en local
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Servidor Backend corriendo en el puerto ${PORT}`);
    });
}

// Exportar para Vercel Serverless
module.exports = app;
