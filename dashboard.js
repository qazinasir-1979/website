// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const dashboardForm = document.getElementById('dashboardForm');
    const outputArea = document.getElementById('outputArea');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadFilename = document.getElementById('downloadFilename');
    const snippetOutput = document.getElementById('snippetOutput');
    const copySnippetBtn = document.getElementById('copySnippetBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const formTitle = document.getElementById('formTitle');
    const originalSlugInput = document.getElementById('originalSlug');
    
    // Auth elements
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    let apiToken = sessionStorage.getItem('apiToken');
    if (apiToken) {
        showDashboard();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;

            fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    apiToken = data.token;
                    sessionStorage.setItem('apiToken', apiToken);
                    loginError.style.display = 'none';
                    showDashboard();
                } else {
                    loginError.textContent = 'Invalid credentials.';
                    loginError.style.display = 'block';
                }
            })
            .catch(err => {
                loginError.innerHTML = 'Server not running. Please start <code>node server.js</code>';
                loginError.style.display = 'block';
            });
        });
    }

    function showDashboard() {
        if (!loginSection) return;
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        loadPosts();
    }

    // Pre-fill date to today
    const dateInput = document.getElementById('postDate');
    if (dateInput && !dateInput.value) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateInput.value = new Date().toLocaleDateString('en-US', options);
    }

    // Initialize Quill Rich Text Editor
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: 'Write your beautiful blog post here...',
        modules: {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image', 'video'],
                    ['clean']
                ],
                handlers: {
                    image: function() {
                        const input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');
                        input.click();

                        input.onchange = () => {
                            const file = input.files[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = () => {
                                fetch('http://localhost:3000/api/upload', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': apiToken },
                                    body: JSON.stringify({ filename: file.name, data: reader.result })
                                })
                                .then(res => {
                                    if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
                                    return res.json();
                                })
                                .then(data => {
                                    if (data.success) {
                                        const range = quill.getSelection(true);
                                        quill.insertEmbed(range.index, 'image', data.url);
                                    } else {
                                        throw new Error('Upload failed');
                                    }
                                })
                                .catch(err => { if(err.message !== 'Unauthorized') alert('Image upload failed. Is the server running?'); });
                            };
                        };
                    }
                }
            }
        }
    });

    if (dashboardForm) {
        dashboardForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('postTitle').value.trim();
            const category = document.getElementById('postCategory').value.trim();
            const dateStr = document.getElementById('postDate').value.trim();
            const author = document.getElementById('postAuthor').value.trim();
            const excerpt = document.getElementById('postExcerpt').value.trim();
            
            const content = quill.root.innerHTML.trim();
            
            if (content === '<p><br></p>' || content === '') {
                alert('Please enter some content for your post.');
                return;
            }

            const slug = createSlug(title);
            const filename = `${slug}.html`;

            const fullHtml = generatePostHtml(title, category, dateStr, author, content);
            const snippetHtml = generateSnippetHtml(title, category, dateStr, excerpt, filename);

            const originalSlug = originalSlugInput.value;
            fetch('http://localhost:3000/api/save', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': apiToken
                },
                body: JSON.stringify({ slug, originalSlug, html: fullHtml, snippet: snippetHtml })
            })
            .then(res => {
                if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    outputArea.innerHTML = `
                        <h2 style="margin-top: 0; color: #10b981;">🎉 Success! Post Published</h2>
                        <p style="margin-bottom: 20px;">Your blog post has been successfully generated and published automatically into <code>blog.html</code>! You can go check the blog page now.</p>
                        <a href="blog.html" class="btn">View Blog</a>
                        <a href="${filename}" class="btn btn-outline" style="margin-left: 10px;">View Post</a>
                    `;
                    outputArea.style.display = 'block';
                    outputArea.scrollIntoView({ behavior: 'smooth' });
                    resetEdit();
                    loadPosts();
                } else {
                    throw new Error('Local server returned an error');
                }
            })
            .catch(err => {
                if(err.message === 'Unauthorized') return;
                console.log("Local CMS server not running. Falling back to manual download.");
                
                const blob = new Blob([fullHtml], { type: 'text/html' });
                if (downloadBtn.href && downloadBtn.href !== '#') {
                    URL.revokeObjectURL(downloadBtn.href);
                }
                const url = URL.createObjectURL(blob);

                downloadBtn.href = url;
                downloadBtn.download = filename;
                if(downloadFilename) downloadFilename.textContent = `Filename will be: ${filename}`;

                if(snippetOutput) snippetOutput.value = snippetHtml;

                outputArea.style.display = 'block';
                outputArea.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    window.editPost = function(filename) {
        fetch(`http://localhost:3000/api/post/${filename}`, {
            headers: { 'Authorization': apiToken }
        })
            .then(res => {
                if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
                return res.json();
            })
            .then(data => {
                document.getElementById('postTitle').value = data.title;
                document.getElementById('postDate').value = data.dateStr;
                document.getElementById('postCategory').value = data.category;
                document.getElementById('postAuthor').value = data.author;
                document.getElementById('postExcerpt').value = data.excerpt;
                quill.root.innerHTML = data.content;

                originalSlugInput.value = data.filename.replace('.html', '');
                formTitle.textContent = 'Edit Post';
                cancelEditBtn.style.display = 'block';
                document.querySelector('#dashboardForm button[type="submit"]').textContent = 'Update Post';
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(err => { if(err.message !== 'Unauthorized') alert('Error loading post.'); });
    };

    function resetEdit() {
        if(dashboardForm) dashboardForm.reset();
        quill.root.innerHTML = '';
        originalSlugInput.value = '';
        if(formTitle) formTitle.textContent = 'Create New Post';
        if(cancelEditBtn) cancelEditBtn.style.display = 'none';
        const submitBtn = document.querySelector('#dashboardForm button[type="submit"]');
        if(submitBtn) submitBtn.textContent = 'Publish Post';
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', resetEdit);
    }

    window.deletePost = function(filename) {
        if (!confirm(`Are you sure you want to delete ${filename}?\nThis will permanently remove the file and clean it from your blog page.`)) return;
        
        fetch(`http://localhost:3000/api/post/${filename}`, {
            method: 'DELETE',
            headers: { 'Authorization': apiToken }
        })
        .then(res => {
            if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
            return res.json();
        })
        .then(data => {
            if (data.success) {
                alert('Post deleted permanently!');
                loadPosts(); 
            } else {
                throw new Error('Failed to delete');
            }
        })
        .catch(err => { if(err.message !== 'Unauthorized') alert('Error deleting post. Make sure server.js is running.'); });
    };

    function loadPosts() {
        const postsList = document.getElementById('postsList');
        if (!postsList || !apiToken) return;
        
        fetch('http://localhost:3000/api/posts', {
            headers: { 'Authorization': apiToken }
        })
            .then(res => {
                if (res.status === 401) { logout(); throw new Error('Unauthorized'); }
                return res.json();
            })
            .then(posts => {
                if (posts.length === 0) {
                    postsList.innerHTML = '<p>No posts found.</p>';
                    return;
                }
                
                postsList.innerHTML = posts.map(post => `
                    <div style="background: #fff; padding: 15px 20px; border: 1px solid var(--border); border-radius: var(--radius); display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: var(--text-main); font-size: 1.1rem;">${post.title}</strong>
                        <div>
                            <button onclick="editPost('${post.filename}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem; margin-right: 10px;">Edit</button>
                            <button onclick="deletePost('${post.filename}')" class="btn" style="background-color: #ef4444; border-color: #ef4444; color: white; padding: 6px 12px; font-size: 0.85rem;">Delete</button>
                        </div>
                    </div>
                `).join('');
            })
            .catch(err => {
                if(err.message !== 'Unauthorized') postsList.innerHTML = '<p style="color: #ef4444;">Please run the local CMS server (<code>node server.js</code>) to view and delete posts.</p>';
            });
    }

    function logout() {
        sessionStorage.removeItem('apiToken');
        apiToken = null;
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        resetEdit();
    }

    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', logout);
    }

    if (copySnippetBtn) {
        copySnippetBtn.addEventListener('click', () => {
            snippetOutput.select();
            document.execCommand('copy');
            const originalText = copySnippetBtn.textContent;
            copySnippetBtn.textContent = 'Copied!';
            setTimeout(() => {
                copySnippetBtn.textContent = originalText;
            }, 2000);
        });
    }

    function createSlug(text) {
        let words = text.toLowerCase().split(/[^a-z0-9]+/).filter(w => w);
        return words.slice(0, 2).join('-') || 'post';
    }

    function generatePostHtml(title, category, dateStr, author, content) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Qazi Nasir Blog</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <header>
        <div class="container nav-container">
            <a href="index.html" class="logo">Qazi Nasir <span>blogs</span></a>
            <button class="menu-toggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="blog.html" class="active">Blog</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </div>
    </header>

    <main>
        <article class="container">
            <div class="post-header">
                <span class="post-meta">${dateStr} • ${category}</span>
                <h1>${title}</h1>
                <div style="color: var(--text-muted); margin-top: 15px;">
                    By <strong>${author}</strong>
                </div>
            </div>

            <div class="post-content">
${content}
                
                <hr style="margin: 40px 0; border: none; border-top: 1px solid var(--border);">
                <a href="blog.html" style="font-weight: 500; color: var(--primary);">← Back to all posts</a>
            </div>
        </article>
    </main>

    <footer>
        <div class="container">
            <div class="social-links">
                <a href="#">Google Scholar</a>
                <a href="#">ResearchGate</a>
                <a href="#">LinkedIn</a>
                <a href="#">GitHub</a>
            </div>
            <p>&copy; <span id="current-year">${new Date().getFullYear()}</span> Qazi Nasir. All rights reserved.</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
    }

    function generateSnippetHtml(title, category, dateStr, excerpt, filename) {
        return `            <article class="blog-card">
                <span class="post-meta">${dateStr} • ${category}</span>
                <h3><a href="${filename}">${title}</a></h3>
                <p>${excerpt}</p>
                <a href="${filename}" class="read-more">Read more →</a>
            </article>`;
    }
});
