import axios from 'axios';

async function checkDb() {
    try {
        const loginRes = await axios.post('https://app-finanzasycobros-rust.vercel.app/api/auth/login', {
            email: 'admin@finanzas.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        
        const res = await axios.get('https://app-finanzasycobros-rust.vercel.app/api/transactions', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const waterPayment = res.data.find(t => t.concept && t.concept.toLowerCase().includes('agua'));
        console.log('Transacción de agua:', waterPayment);
    } catch (e) {
        console.error('Error:', e);
    }
}

checkDb();
