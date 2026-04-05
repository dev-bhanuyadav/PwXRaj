import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const conn = new Client();
const config = {
  host: '95.111.225.90',
  port: 22,
  username: 'root',
  password: 'by541600'
};

const REMOTE_PATH = '/root/pw-app';
const LOCAL_TAR = path.join(__dirname, '../app.tar.gz');

conn.on('ready', () => {
  console.log('✅ Connected to VPS!');
  
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('❌ SFTP Error:', err);
      return conn.end();
    }
    
    console.log('📦 Uploading app bundle...');
    sftp.fastPut(LOCAL_TAR, '/root/app.tar.gz', (err) => {
      if (err) {
        console.error('❌ Upload failed:', err);
        return conn.end();
      }
      
      console.log('📂 Extracting and Installing...');
      const cmd = `
        mkdir -p ${REMOTE_PATH}
        tar -xzf /root/app.tar.gz -C ${REMOTE_PATH}
        cd ${REMOTE_PATH}/server && npm install
        cd ${REMOTE_PATH} && pm2 delete PW-App || true
        cd ${REMOTE_PATH} && pm2 start ecosystem.config.js --name "PW-App"
        pm2 save
      `;
      
      conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          console.log('🏁 Deployment DONE! Site: http://pw.pimaxer.in:5000');
          conn.end();
        }).on('data', (data) => console.log('STDOUT: ' + data.toString()))
          .on('stderr', (data) => console.error('STDERR: ' + data.toString()));
      });
    });
  });
}).on('error', (err) => {
  console.error('❌ SSH Error:', err.message);
}).connect(config);
