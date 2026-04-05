import { Client } from 'ssh2';

const conn = new Client();
const config = {
  host: '95.111.225.90',
  port: 22,
  username: 'root',
  password: 'by541600'
};

conn.on('ready', () => {
  console.log('✅ Connected to VPS!');
  
  const cmd = `
    echo "🔍--- System Diagnostic ---"
    echo "1. Checking if Port 5000 is listening:"
    netstat -tulnp | grep 5000 || echo "❌ NOT LISTENING"
    
    echo "2. Checking PM2 Status:"
    pm2 status
    
    echo "3. Checking PM2 Logs (last 10 lines):"
    pm2 logs PW-App --lines 10 --no-daemon
    
    echo "4. Checking UFW Status:"
    sudo ufw status
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    }).on('data', (data) => console.log(data.toString()))
      .on('stderr', (data) => console.error('STDERR: ' + data.toString()));
  });
}).on('error', (err) => {
  console.error('❌ SSH Error:', err.message);
}).connect(config);
