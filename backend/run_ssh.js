const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH :: Conectado a Contabo');
  
  // Buscar el nombre del contenedor que está escuchando en el puerto 3308
  conn.exec('docker ps | grep 3308', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', (code, signal) => {
      console.log('Contenedor encontrado (si hay salida):', output.trim());
      
      const parts = output.trim().split(/\s+/);
      const containerId = parts[0];
      
      if (!containerId) {
          console.log("No se encontró el contenedor. Saliendo.");
          conn.end();
          return;
      }
      
      // Intentar ver el environment del contenedor para sacar la clave root de MYSQL
      const getEnvCmd = `docker exec ${containerId} env | grep MYSQL_ROOT_PASSWORD`;
      
      conn.exec(getEnvCmd, (err2, stream2) => {
          let envOutput = '';
          stream2.on('close', () => {
              const rootPass = envOutput.trim().replace('MYSQL_ROOT_PASSWORD=', '');
              console.log('Clave root recuperada del entorno:', rootPass);
              
              if (!rootPass) {
                  console.log("No se pudo obtener la clave root. Fallo.");
                  conn.end();
                  return;
              }
              
              // Ejecutar la creación de la DB
              const sqlCmd = `CREATE DATABASE IF NOT EXISTS finanzas_db; GRANT ALL PRIVILEGES ON finanzas_db.* TO 'pos_user'@'%'; FLUSH PRIVILEGES;`;
              const createCmd = `docker exec ${containerId} mysql -u root -p"${rootPass}" -e "${sqlCmd}"`;
              
              conn.exec(createCmd, (err3, stream3) => {
                  stream3.on('close', (code3) => {
                      console.log("Comando de creación de base de datos finalizado con código", code3);
                      conn.end();
                  }).on('data', (data) => {
                      console.log('SQL_OUT: ' + data);
                  }).stderr.on('data', (data) => {
                      console.error('SQL_ERR: ' + data);
                  });
              });
              
          }).on('data', (data) => {
              envOutput += data.toString();
          });
      });
      
    }).on('data', (data) => {
      output += data.toString();
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
}).connect({
  host: '89.117.56.39',
  port: 22,
  username: 'root',
  password: 'Henogo0521*'
});
