const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const PORT = (() => {
    const p = parseInt(process.env.PORT, 10);
    if (Number.isInteger(p) && p >= 1 && p <= 65535) return p;
    return 8088;
})();

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
    // 只处理 GET 请求
    if (req.method !== 'GET') {
        res.writeHead(405, { 'Allow': 'GET' });
        return res.end('Method Not Allowed');
    }

    // 解析 URL，去除查询参数
    let pathname;
    try {
        pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
    } catch {
        res.writeHead(400);
        return res.end('Bad Request');
    }

    let file = path.join(ROOT, pathname === '/' ? 'index.html' : decodeURIComponent(pathname));
    file = path.resolve(file);

    // 禁止访问 ROOT 之外的路径
    const relative = path.relative(ROOT, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    // 禁止访问隐藏文件/目录（如 .git）
    if (relative.split(path.sep).some(seg => seg.startsWith('.'))) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    fs.readFile(file, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Not Found');
            } else if (err.code === 'EISDIR') {
                res.writeHead(403);
                res.end('Forbidden');
            } else {
                res.writeHead(500);
                res.end('Internal Server Error');
            }
        } else {
            const ext = path.extname(file);
            res.writeHead(200, {
                'Content-Type': MIME[ext] || 'text/plain',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'",
                'Referrer-Policy': 'no-referrer',
            });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`服务器已启动: http://localhost:${PORT}`);
    console.log('按 Ctrl+C 关闭服务器');

    execFile('start', ['http://localhost:' + PORT]);
});
