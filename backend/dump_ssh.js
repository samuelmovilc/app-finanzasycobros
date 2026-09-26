const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH :: Conectado a Contabo para Backup');
  
  conn.exec('docker ps | grep 3308', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      const parts = output.trim().split(/\s+/);
      const containerId = parts[0];
      
      if (!containerId) {
          console.log("No se encontró el contenedor.");
          conn.end(); return;
      }
      
      conn.exec(`docker exec ${containerId} env | grep MYSQL_ROOT_PASSWORD`, (err2, stream2) => {
          let envOutput = '';
          stream2.on('close', () => {
              const rootPass = envOutput.trim().replace('MYSQL_ROOT_PASSWORD=', '');
              
              if (!rootPass) {
                  console.log("Fallo obteniendo clave root.");
                  conn.end(); return;
              }
              
              console.log('Iniciando mysqldump en contenedor...');
              const dumpCmd = `docker exec ${containerId} mysqldump -u root -p"${rootPass}" finanzas_db`;
              
              conn.exec(dumpCmd, (err3, stream3) => {
                  let sqlData = '';
                  stream3.on('close', () => {
                      const filename = `backup_finanzas_db_root_${Date.now()}.sql`;
                      fs.writeFileSync(filename, sqlData);
                      console.log(`✅ Backup completado y guardado en: ${filename}`);
                      conn.end();
                  }).on('data', (data) => {
                      sqlData += data.toString();
                  }).stderr.on('data', (data) => {
                      if (!data.toString().includes('Using a password on the command line interface can be insecure')) {
                          console.error('SQL_ERR: ' + data);
                      }
                  });
              });
          }).on('data', (data) => {
              envOutput += data.toString();
          });
      });
    }).on('data', (data) => {
      output += data.toString();
    });
  });
}).connect({
  host: '89.117.56.39',
  port: 22,
  username: 'root',
  password: 'Henogo0521*'
});
