const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function backup() {
    console.log('Iniciando respaldo de finanzas_db en Contabo...');
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '89.117.56.39',
        port: process.env.DB_PORT || 3308,
        user: process.env.DB_USER || 'pos_user',
        password: process.env.DB_PASSWORD || 'Pap3l3r!4#S3cur3_2026',
        database: process.env.DB_NAME || 'finanzas_db',
    });

    try {
        const tables = ['users', 'clients', 'loans', 'transactions'];
        let sqlDump = `-- Backup Completo de finanzas_db\n-- Fecha: ${new Date().toISOString()}\n\n`;

        for (const table of tables) {
            console.log(`Exportando tabla: ${table}...`);
            const [rows] = await connection.query(`SELECT * FROM ${table}`);
            
            if (rows.length > 0) {
                const keys = Object.keys(rows[0]);
                
                rows.forEach(row => {
                    const values = keys.map(k => {
                        let val = row[k];
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        return val;
                    });
                    sqlDump += `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')});\n`;
                });
            }
            sqlDump += '\n';
        }

        const filename = `backup_finanzas_db_${Date.now()}.sql`;
        fs.writeFileSync(filename, sqlDump);
        console.log(`✅ Respaldo exitoso guardado en: ${filename}`);

    } catch (err) {
        console.error('Error durante el respaldo:', err);
    } finally {
        await connection.end();
    }
}

backup();
