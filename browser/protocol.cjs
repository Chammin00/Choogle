'use strict';

const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.cjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMarkdownAsHtml(markdownText, title) {
  const lines = String(markdownText || '').split(/\r?\n/);
  const htmlParts = [];
  let inCode = false;
  let inList = false;

  const closeList = () => {
    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }
  };

  for (const rawLine of lines) {
    if (rawLine.trim().startsWith('```')) {
      closeList();
      if (!inCode) {
        inCode = true;
        htmlParts.push('<pre><code>');
      } else {
        inCode = false;
        htmlParts.push('</code></pre>');
      }
      continue;
    }
    if (inCode) {
      htmlParts.push(escapeHtml(rawLine) + '\n');
      continue;
    }

    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }
    if (line.startsWith('### ')) {
      closeList();
      htmlParts.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      closeList();
      htmlParts.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      closeList();
      htmlParts.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
    } else if (/^[-*] /.test(line)) {
      if (!inList) {
        inList = true;
        htmlParts.push('<ul>');
      }
      htmlParts.push(`<li>${escapeHtml(line.slice(2))}</li>`);
    } else {
      closeList();
      let formatted = escapeHtml(line)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      htmlParts.push(`<p>${formatted}</p>`);
    }
  }
  closeList();
  if (inCode) htmlParts.push('</code></pre>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} — Choogle Reader</title>
  <link rel="stylesheet" href="choogle://pages/common.css">
  <style>
    body { padding: 36px 24px 64px; }
    .md-shell { max-width: 880px; margin: 0 auto; background: var(--bg-panel); border: 1px solid var(--border); border-radius: 12px; padding: 32px 36px; }
    .md-eyebrow { font-size: 12px; color: var(--gold); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .md-body h1 { font-size: 26px; margin: 0 0 14px; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 10px; }
    .md-body h2 { font-size: 19px; margin: 24px 0 10px; color: var(--gold); }
    .md-body h3 { font-size: 15px; margin: 18px 0 8px; color: var(--text-primary); }
    .md-body p { color: var(--text-secondary); line-height: 1.68; margin: 10px 0; }
    .md-body ul { margin: 10px 0 14px 20px; color: var(--text-secondary); line-height: 1.65; }
    .md-body code { background: var(--bg-inset); border: 1px solid var(--border); border-radius: 4px; padding: 1px 6px; font-family: var(--font-mono); font-size: 0.9em; color: var(--gold-bright); }
    .md-body pre { background: var(--bg-inset); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; overflow-x: auto; margin: 14px 0; }
    .md-body pre code { border: none; padding: 0; background: transparent; color: var(--text-primary); }
  </style>
</head>
<body>
  <div class="md-shell">
    <div class="md-eyebrow">
      <span>Choogle Document Reader</span>
      <a class="btn-secondary" href="choogle://hub" style="text-decoration:none;padding:5px 10px;border-radius:6px;border:1px solid var(--border);color:var(--text-secondary);font-size:12px;">Back to App Hub</a>
    </div>
    <article class="md-body">${htmlParts.join('\n')}</article>
  </div>
</body>
</html>`;
}

function isWithinRoot(rootDir, targetPath) {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedTarget = path.resolve(targetPath);
  const rel = path.relative(resolvedRoot, resolvedTarget);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

async function serveFile(filePath, request) {
  const stat = await fs.promises.stat(filePath);
  const mime = getMimeType(filePath);

  if (filePath.toLowerCase().endsWith('.md')) {
    const mdText = await fs.promises.readFile(filePath, 'utf8');
    const html = renderMarkdownAsHtml(mdText, path.basename(filePath));
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  const rangeHeader = request && request.headers ? request.headers.get('range') : null;
  if (rangeHeader && stat.size > 0) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader);
    if (match) {
      const start = Math.min(Number(match[1]), stat.size - 1);
      const end = match[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;
      const chunkSize = end - start + 1;
      const handle = await fs.promises.open(filePath, 'r');
      const buf = Buffer.alloc(chunkSize);
      await handle.read(buf, 0, chunkSize, start);
      await handle.close();
      return new Response(buf, {
        status: 206,
        headers: {
          'Content-Type': mime,
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize)
        }
      });
    }
  }

  const data = await fs.promises.readFile(filePath);
  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Length': String(data.length),
      'Accept-Ranges': 'bytes'
    }
  });
}

function registerChoogleProtocol(protocol, choogleRoot) {
  const projectsRoot = path.dirname(choogleRoot);

  const pageMap = {
    home: 'pages/home.html',
    newtab: 'pages/home.html',
    hub: 'pages/hub.html',
    icons: 'pages/icons.html',
    bookmarks: 'pages/bookmarks.html',
    history: 'pages/history.html',
    downloads: 'pages/downloads.html',
    settings: 'pages/settings.html'
  };

  protocol.handle('choogle', async (request) => {
    try {
      const parsed = new URL(request.url);
      const host = (parsed.hostname || '').toLowerCase();
      const rawPath = parsed.pathname || '/';
      const cleanSegments = rawPath
        .split('/')
        .filter(Boolean)
        .map((s) => decodeURIComponent(s));

      let baseRoot = choogleRoot;
      let targetPath = null;

      if (pageMap[host]) {
        if (cleanSegments.length === 0) {
          targetPath = path.resolve(choogleRoot, pageMap[host]);
        } else {
          const inPages = path.resolve(choogleRoot, 'pages', ...cleanSegments);
          if (isWithinRoot(choogleRoot, inPages) && fs.existsSync(inPages)) {
            targetPath = inPages;
          } else {
            targetPath = path.resolve(choogleRoot, ...cleanSegments);
          }
        }
      } else if (host === 'assets') {
        targetPath = path.resolve(choogleRoot, 'assets', ...cleanSegments);
      } else if (host === 'pages') {
        targetPath = path.resolve(choogleRoot, 'pages', ...cleanSegments);
      } else if (host === 'app') {
        if (cleanSegments.length === 0) {
          targetPath = path.resolve(choogleRoot, 'pages', 'home.html');
        } else {
          const directAppPath = path.resolve(choogleRoot, ...cleanSegments);
          if (isWithinRoot(choogleRoot, directAppPath) && fs.existsSync(directAppPath)) {
            targetPath = directAppPath;
          } else {
            // Legacy HTML files sometimes link to sibling project folders via ../project/...
            const siblingPath = path.resolve(projectsRoot, ...cleanSegments);
            if (isWithinRoot(projectsRoot, siblingPath) && fs.existsSync(siblingPath)) {
              baseRoot = projectsRoot;
              targetPath = siblingPath;
            } else {
              targetPath = directAppPath;
            }
          }
        }
      } else if (host === 'projects') {
        baseRoot = projectsRoot;
        targetPath = path.resolve(projectsRoot, ...cleanSegments);
      } else {
        return new Response('Unknown Choogle route: ' + host, { status: 404 });
      }

      if (!isWithinRoot(baseRoot, targetPath)) {
        return new Response('Forbidden', { status: 403 });
      }

      let stat;
      try {
        stat = await fs.promises.stat(targetPath);
      } catch {
        return new Response('Not Found: ' + targetPath, { status: 404 });
      }

      if (stat.isDirectory()) {
        const indexHtml = path.join(targetPath, 'index.html');
        const readmeMd = path.join(targetPath, 'README.md');
        if (fs.existsSync(indexHtml)) {
          targetPath = indexHtml;
        } else if (fs.existsSync(readmeMd)) {
          targetPath = readmeMd;
        } else {
          return new Response('Directory index not available', { status: 404 });
        }
      }

      return await serveFile(targetPath, request);
    } catch (err) {
      return new Response('Choogle protocol error: ' + (err && err.message ? err.message : String(err)), {
        status: 500
      });
    }
  });
}

module.exports = { registerChoogleProtocol, getMimeType, isWithinRoot };
