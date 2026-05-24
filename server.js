const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8088;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.woff2': 'font/woff2',
};

const ROOT = path.resolve(process.cwd());

const server = http.createServer((req, res) => {
    let file = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url));
    file = path.resolve(file);
    if (!file.startsWith(ROOT + path.sep) && file !== ROOT) {
        res.writeHead(403);
        return res.end('Forbidden');
    }
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
        } else {
            const ext = path.extname(file);
            res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`服务器已启动: http://localhost:${PORT}`);
    console.log('按 Ctrl+C 关闭服务器');

    const { exec } = require('child_process');
    exec('start http://localhost:' + PORT);
});
