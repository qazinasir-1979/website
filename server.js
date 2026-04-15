const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

function removeSnippet(htmlContent, slug) {
    if (!slug) return htmlContent;
    const startTag = '<article class="blog-card">';
    const endTag = '</article>';
    
    let parts = htmlContent.split(startTag);
    let result = [parts[0]];
    
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (part.includes(`href="${slug}.html"`)) {
            const endParts = part.split(endTag);
            result.push(endParts.slice(1).join(endTag));
        } else {
            result.push(startTag + part);
        }
    }
    
    return result.join('');
}

http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { username, password } = JSON.parse(body);
                if (username === 'admin' && password === 'password123') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, token: 'Basic YWRtaW46cGFzc3dvcmQxMjM=' }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid credentials' }));
                }
            } catch (e) {
                res.writeHead(400);
                res.end();
            }
        });
        return;
    }

    // Authenticate all other /api/ endpoints
    if (req.url.startsWith('/api/')) {
        const auth = req.headers['authorization'];
        if (auth !== 'Basic YWRtaW46cGFzc3dvcmQxMjM=') {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
            return;
        }
    }

    if (req.method === 'GET' && req.url === '/api/posts') {
        try {
            const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
            const exclude = ['index.html', 'about.html', 'blog.html', 'contact.html', 'dashboard.html'];
            
            const posts = files.filter(f => !exclude.includes(f)).map(f => {
                const content = fs.readFileSync(path.join(__dirname, f), 'utf8');
                const titleMatch = content.match(/<title>(.*?) - Qazi Nasir Blog<\/title>/) || content.match(/<h1>(.*?)<\/h1>/);
                const title = titleMatch ? titleMatch[1].trim() : f;
                return { filename: f, title };
            });
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(posts));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    if (req.method === 'GET' && req.url.startsWith('/api/post/')) {
        try {
            const filename = req.url.split('/').pop();
            const slug = filename.replace('.html', '');
            
            if (filename.endsWith('.html') && !filename.includes('..')) {
                const html = fs.readFileSync(path.join(__dirname, filename), 'utf8');
                
                const titleMatch = html.match(/<h1>([\s\S]*?)<\/h1>/);
                const title = titleMatch ? titleMatch[1].trim() : '';

                const metaMatch = html.match(/<span class="post-meta">(.*?) • (.*?)<\/span>/);
                const dateStr = metaMatch ? metaMatch[1].trim() : '';
                const category = metaMatch ? metaMatch[2].trim() : '';

                const authorMatch = html.match(/By <strong>(.*?)<\/strong>/);
                const author = authorMatch ? authorMatch[1].trim() : 'Qazi Nasir';

                // Look for content inside post-content until the <hr
                const contentMatch = html.match(/<div class="post-content">([\s\S]*?)<hr style=/);
                const content = contentMatch ? contentMatch[1].trim() : '';

                // Get excerpt from blog.html
                let excerpt = '';
                const blogPath = path.join(__dirname, 'blog.html');
                if (fs.existsSync(blogPath)) {
                    const blogText = fs.readFileSync(blogPath, 'utf8');
                    const snippetParts = blogText.split('<article class="blog-card">');
                    for (let i = 1; i < snippetParts.length; i++) {
                        const part = snippetParts[i];
                        if (part.includes(`href="${filename}"`)) {
                            const pMatch = part.match(/<p>([\s\S]*?)<\/p>/);
                            if (pMatch) excerpt = pMatch[1].trim();
                            break; // found it
                        }
                    }
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ title, dateStr, category, author, content, excerpt, filename }));
            } else {
                res.writeHead(400);
                res.end();
            }
        } catch (err) {
            console.error('Fetch post error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    if (req.method === 'DELETE' && req.url.startsWith('/api/post/')) {
        try {
            const filename = req.url.split('/').pop();
            const slug = filename.replace('.html', '');
            
            if (filename.endsWith('.html') && !filename.includes('..')) {
                const filePath = path.join(__dirname, filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }

                const blogPath = path.join(__dirname, 'blog.html');
                if (fs.existsSync(blogPath)) {
                    fs.writeFileSync(blogPath, removeSnippet(fs.readFileSync(blogPath, 'utf8'), slug));
                }
                
                const indexPath = path.join(__dirname, 'index.html');
                if (fs.existsSync(indexPath)) {
                    fs.writeFileSync(indexPath, removeSnippet(fs.readFileSync(indexPath, 'utf8'), slug));
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: `Deleted ${filename}` }));
                console.log(`[-] Deleted: ${filename}`);
            } else {
                res.writeHead(400);
                res.end();
            }
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    if (req.method === 'POST' && req.url === '/api/upload') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const matches = data.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (!matches || matches.length !== 3) {
                    res.writeHead(400); res.end(JSON.stringify({success: false, error: 'Invalid image format'})); return;
                }
                const fileData = Buffer.from(matches[2], 'base64');
                const safeName = Date.now() + '-' + data.filename.replace(/[^a-zA-Z0-9.-]/g, '');
                const mediaPath = path.join(__dirname, 'media');
                if (!fs.existsSync(mediaPath)) fs.mkdirSync(mediaPath);
                
                fs.writeFileSync(path.join(mediaPath, safeName), fileData);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, url: `media/${safeName}` }));
            } catch(e) {
                console.error(e);
                res.writeHead(500); res.end(JSON.stringify({success: false, error: e.message}));
            }
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/api/save') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { slug, originalSlug, html, snippet } = data;
                
                if (originalSlug && originalSlug !== slug) {
                    const oldPath = path.join(__dirname, `${originalSlug}.html`);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }

                const slugToRemove = originalSlug || slug;

                const newFilePath = path.join(__dirname, `${slug}.html`);
                fs.writeFileSync(newFilePath, html);

                const blogPath = path.join(__dirname, 'blog.html');
                let blogText = fs.readFileSync(blogPath, 'utf8');
                
                blogText = removeSnippet(blogText, slugToRemove);

                const target = '<div class="blog-list">';
                if (blogText.includes(target)) {
                    blogText = blogText.replace(target, `${target}\n${snippet}`);
                    fs.writeFileSync(blogPath, blogText);
                }

                const indexPath = path.join(__dirname, 'index.html');
                if (fs.existsSync(indexPath)) {
                    let indexText = fs.readFileSync(indexPath, 'utf8');
                    indexText = removeSnippet(indexText, slugToRemove);
                    if (indexText.includes(target)) {
                        indexText = indexText.replace(target, `${target}\n${snippet}`);
                        fs.writeFileSync(indexPath, indexText);
                    }
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: `Successfully published ${slug}.html` }));
                console.log(`[+] Published: ${slug}.html`);
            } catch (err) {
                console.error('Error saving post:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(PORT, () => {
    console.log('=============================================');
    console.log(`🚀 Local Blog CMS running on http://localhost:${PORT}`);
    console.log('Leave this terminal open while you use the dashboard.');
    console.log('=============================================');
});
