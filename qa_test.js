async function testEndpoint(method, path, body, token) {
    const url = `https://app-finanzasycobros-rust.vercel.app${path}`;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (body) options.body = body;

    const res = await fetch(url, options);
    const data = await res.text();
    return { statusCode: res.status, body: data };
}

async function runQA() {
    console.log("=== INICIANDO QA DE LA API DE VERCEL ===");
    
    console.log("\n[TEST 1] GET /api/dashboard (Sin Auth)");
    try {
        const res1 = await testEndpoint('GET', '/api/dashboard');
        console.log(`Status: ${res1.statusCode} | Body: ${res1.body}`);
    } catch(e) { console.log(e); }

    console.log("\n[TEST 2] POST /api/auth/login (Credenciales Válidas)");
    let token = '';
    try {
        const loginBody = JSON.stringify({ email: 'admin@finanzas.com', password: 'admin123' });
        const res2 = await testEndpoint('POST', '/api/auth/login', loginBody);
        console.log(`Status: ${res2.statusCode} | Body: ${res2.body.substring(0, 100)}...`);
        if (res2.statusCode === 200) {
            token = JSON.parse(res2.body).token;
        }
    } catch(e) { console.log(e); }

    if (token) {
        console.log("\n[TEST 3] GET /api/dashboard (Con Token)");
        try {
            const res3 = await testEndpoint('GET', '/api/dashboard', null, token);
            console.log(`Status: ${res3.statusCode} | Body: ${res3.body}`);
        } catch(e) { console.log(e); }
    }
}

runQA();
