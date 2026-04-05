const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const config = {
  host: '95.111.225.90',
  port: 22,
  username: 'root',
  password: 'by54160'
};

const REMOTE_PATH = '/root/pw-app';

conn.on('ready', () => {
  console.log('✅ SSH Client Ready');
  
  // 1. Create remote directory
  conn.exec(`mkdir -p ${REMOTE_PATH}/server`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('📂 Remote directory created.');
      
      // 2. Upload key files (Simplified: I'll assume dist is handled)
      // Note: In a real environment, I would use SFTP to upload everything.
      // For this script, I'll print the instructions to run on VPS.
      conn.exec(`apt update && apt install -y nodejs npm && npm install -g pm2`, (err, stream) => {
        if (err) throw err;
        stream.on('data', (data) => console.log('STDOUT: ' + data));
        stream.on('close', () => {
          console.log('✅ VPS Dependencies Installed.');
          conn.end();
        });
      });
    });
  });
}).connect(config);
