const mysql = require('mysql2/promise');

async function testRoot() {
    try {
        console.log("Probando con root y password 2wqrv3V9HpzIB66vz9OG...");
        const db = await mysql.createConnection({
            host: '89.117.56.39',
            port: 3308,
            user: 'root',
            password: '2wqrv3V9HpzIB66vz9OG'
        });
        console.log("Conectado exitosamente con root.");
        await db.end();
    } catch (e) {
        console.error("Error 1:", e.message);
        
        try {
            console.log("\nProbando con root y password Pap3l3r!4#S3cur3_2026...");
            const db2 = await mysql.createConnection({
                host: '89.117.56.39',
                port: 3308,
                user: 'root',
                password: 'Pap3l3r!4#S3cur3_2026'
            });
            console.log("Conectado exitosamente con root y pass 2.");
            await db2.end();
        } catch (e2) {
            console.error("Error 2:", e2.message);
        }
    }
}
testRoot();
