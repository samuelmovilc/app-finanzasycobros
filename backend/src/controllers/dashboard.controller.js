const db = require('../config/db');

exports.getStats = async (req, res, next) => {
    try {
        const [loans] = await db.query("SELECT SUM(capital_amount) as total_prestado FROM loans WHERE status = 'ACTIVO'");
        
        // Calcular intereses pendientes (basado en capital_amount * interest_rate / 100)
        const [intereses] = await db.query("SELECT SUM(capital_amount * (interest_rate / 100)) as pendientes FROM loans WHERE status = 'ACTIVO'");

        // Calcular caja actual
        const [trans] = await db.query("SELECT type, SUM(amount) as total FROM transactions WHERE status != 'ANULADO' GROUP BY type");
        let caja = 0;
        let capitalInvertido = 150000; // Base inicial para demo, o sumar INGRESO_CAPITAL

        trans.forEach(t => {
            if (['PAGO_RECIBIDO', 'INGRESO_MANUAL', 'INGRESO_CAPITAL', 'INGRESO'].includes(t.type)) caja += Number(t.total);
            if (['PRESTAMO_OTORGADO', 'EGRESO_MANUAL', 'EGRESO'].includes(t.type)) caja -= Number(t.total);
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
        next(error);
    }
};
