import axios from 'axios';

async function testE2E() {
    try {
        console.log('Autenticando...');
        const loginRes = await axios.post('https://app-finanzasycobros-rust.vercel.app/api/auth/login', {
            email: 'admin@finanzas.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        console.log('\n--- 1. Ejecutando migración ---');
        const migRes = await axios.get('https://app-finanzasycobros-rust.vercel.app/api/transactions/migrate', config);
        console.log('Migración:', migRes.data);

        console.log('\n--- 2. Verificando "pago de agua" ---');
        let transRes = await axios.get('https://app-finanzasycobros-rust.vercel.app/api/transactions', config);
        const waterPayment = transRes.data.find(t => t.id === 2);
        console.log('Pago de agua (debe ser EGRESO, categoria 4):', waterPayment.type, waterPayment.category_id);

        console.log('\n--- 3. Creando transacción de prueba ---');
        const createRes = await axios.post('https://app-finanzasycobros-rust.vercel.app/api/transactions', {
            amount: 150,
            concept: 'Test a anular',
            type: 'EGRESO',
            category_id: 4
        }, config);
        console.log('Transacción creada:', createRes.data);

        transRes = await axios.get('https://app-finanzasycobros-rust.vercel.app/api/transactions', config);
        const testTrans = transRes.data[0]; // La más reciente
        console.log('Nueva transacción ID:', testTrans.id, 'Status:', testTrans.status);

        console.log('\n--- 4. Dashboard (Caja actual ANTES de anular) ---');
        let dashRes = await axios.get('https://app-finanzasycobros-rust.vercel.app/api/dashboard', config);
        const cajaAntes = dashRes.data.caja_actual;
        console.log('Caja:', cajaAntes);

        console.log('\n--- 5. Anulando la transacción de prueba ---');
        const cancelRes = await axios.put(`https://app-finanzasycobros-rust.vercel.app/api/transactions/${testTrans.id}/cancel`, {}, config);
        console.log('Anulada:', cancelRes.data);

        console.log('\n--- 6. Dashboard (Caja actual DESPUÉS de anular) ---');
        dashRes = await axios.get('https://app-finanzasycobros-rust.vercel.app/api/dashboard', config);
        const cajaDespues = dashRes.data.caja_actual;
        console.log('Caja:', cajaDespues);
        console.log('Diferencia de caja:', cajaDespues - cajaAntes, '(Debería ser 150 porque el egreso se anuló)');

    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}

testE2E();
