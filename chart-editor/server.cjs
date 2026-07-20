const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 59124;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  // 1. Try to serve from editor folder
  let filePath = path.join(__dirname, reqPath);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      serveFile(filePath, res);
    } else {
      // 2. Fallback to parent public folder (loads public/my_heart.mp3, key sounds, etc.)
      let publicFilePath = path.join(__dirname, '..', 'public', reqPath);
      fs.access(publicFilePath, fs.constants.F_OK, (publicErr) => {
        if (!publicErr) {
          serveFile(publicFilePath, res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 File Not Found');
        }
      });
    }
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
      return;
    }
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.length,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🎵 KLIKY-BEAT Visual Chart Editor Server Started!`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
