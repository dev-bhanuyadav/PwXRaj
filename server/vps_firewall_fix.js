import { Client } from 'ssh2';
import fetch from 'node-fetch';

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
    echo "🔓 Fixing Firewall..."
    # Try UFW (Ubuntu/Debian)
    sudo ufw allow 5000/tcp || true
    sudo ufw allow 80/tcp || true
    sudo ufw allow 443/tcp || true
    sudo ufw --force enable || true
    
    # Try Firewalld (CentOS/RHEL)
    sudo firewall-cmd --permanent --add-port=5000/tcp || true
    sudo firewall-cmd --reload || true
    
    # Direct IPTables catch-all
    sudo iptables -I INPUT -p tcp --dport 5000 -j ACCEPT || true
    
    echo "🔥 Firewall fixed for Port 5000."
    pm2 restart PW-App
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('🏁 Firewall fix applied! Try refreshing now.');
      conn.end();
    }).on('data', (data) => console.log('STDOUT: ' + data.toString()))
      .on('stderr', (data) => console.error('STDERR: ' + data.toString()));
  });
}).on('error', (err) => {
  console.error('❌ SSH Error:', err.message);
}).connect(config);
