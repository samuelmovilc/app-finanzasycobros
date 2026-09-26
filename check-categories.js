import axios from 'axios';

async function checkDb() {
    try {
        const loginRes = await axios.post('https://app-finanzasycobros-rust.vercel.app/api/auth/login', {
            email: 'admin@finanzas.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        
        const res = await axios.get('https://app-finanzasycobros-rust.vercel.app/api/categories', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Categories:', res.data);
    } catch (e) {
        console.error('Error:', e);
    }
}

checkDb();
