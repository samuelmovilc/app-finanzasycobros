const axios = require('axios');

async function testEndpoint() {
    try {
        console.log('Autenticando...');
        const loginRes = await axios.post('https://app-finanzasycobros-rust.vercel.app/api/auth/login', {
            email: 'admin@finanzas.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Login exitoso. Token obtenido.');

        console.log('Fetching /api/loans...');
        const loansRes = await axios.get('https://app-finanzasycobros-rust.vercel.app/api/loans', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Loans response:', loansRes.status, loansRes.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testEndpoint();
