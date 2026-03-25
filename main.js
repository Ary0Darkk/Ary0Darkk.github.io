const pages = [
    { route: "index", file: "_posts/index.md" },
    { route: "blog", file: "_posts/blog.md" },
    { route: "about", file: "_posts/about.md" }
];

const manifest = [
    { slug: "attention-in-transformers", title: "Understanding Attention in Transformers", date: "March 27, 2026", description: "A deep dive into the attention mechanism that powers modern language models." },
    { slug: "hello-world", title: "Hello World", date: "March 26, 2026", description: "My first blog post on this new site." }
];

const pageToFile = {
    'index': '_posts/index.md',
    'blog': '_posts/blog.md',
    'about': '_posts/about.md'
};

function init() {
    const params = new URLSearchParams(window.location.search);
    const postFile = params.get('post');

    if (postFile) {
        loadPost(postFile);
    } else {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        loadPage(page);
    }
}

async function loadPage(page) {
    const file = pageToFile[page];
    if (!file) {
        document.getElementById('content').innerHTML = '<p>Page not found.</p>';
        return;
    }

    try {
        const response = await fetch(file);
        const markdown = await response.text();
        const { data, content } = parseFrontmatter(markdown);
        const mathBlocks = protectMath(content);
        let html = marked.parse(mathBlocks.text);
        html = restoreMath(html, mathBlocks.blocks);

        document.title = (data.title || page) + ' - Aryan';

        if (data.layout === 'home') {
            const postsHtml = renderPostList();
            html = `<article class="hero"><h1>Hi, I'm Aryan</h1>
                <p class="tagline">${data.tagline || 'I write about my learnings, experiments, and thoughts on software development.'}</p></article>
                <section class="recent-posts"><h2>Recent Posts</h2><ul class="post-list">${postsHtml}</ul></section>`;
        } else if (data.layout === 'list') {
            const postsHtml = renderPostList();
            html = `<h1>${data.title}</h1><p class="tagline">${data.description || ''}</p><ul class="post-list">${postsHtml}</ul>`;
        } else if (data.layout === 'page') {
            html = `<article><header class="post-header"><h1>${data.title}</h1></header><div class="post-content">${html}</div></article>`;
        }

        document.getElementById('content').innerHTML = html;
        renderMath();
        Prism.highlightAll();
    } catch (e) {
        document.getElementById('content').innerHTML = '<p>Error loading page. Note: This requires a local server (not file://). Try: npx serve or python -m http.server</p>';
    }
}

async function loadPost(slug) {
    try {
        const response = await fetch(`_posts/${slug}.md`);
        const markdown = await response.text();
        const { data, content } = parseFrontmatter(markdown);
        const mathBlocks = protectMath(content);
        let html = marked.parse(mathBlocks.text);
        html = restoreMath(html, mathBlocks.blocks);

        document.title = (data.title || slug) + ' - Aryan';

        html = `<article>
            <header class="post-header">
                <h1>${data.title || slug}</h1>
                ${data.date ? `<span class="post-meta">${data.date}</span>` : ''}
            </header>
            <div class="post-content">${html}</div>
        </article>`;

        document.getElementById('content').innerHTML = html;
        renderMath();
        Prism.highlightAll();
    } catch (e) {
        document.getElementById('content').innerHTML = '<p>Error loading post.</p>';
    }
}

function renderPostList() {
    return manifest.map(post => `
        <li class="post-item">
            <a href="post.html?post=${post.slug}" class="post-title">${post.title}</a>
            <span class="post-meta">${post.date}</span>
            <p class="post-excerpt">${post.description}</p>
        </li>
    `).join('');
}

function parseFrontmatter(text) {
    if (!text.startsWith('---')) return { data: {}, content: text };
    const endIndex = text.indexOf('---', 3);
    if (endIndex === -1) return { data: {}, content: text };
    const frontmatter = text.slice(3, endIndex).trim();
    const content = text.slice(endIndex + 3).trim();
    const data = {};
    frontmatter.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            data[line.slice(0, colonIndex).trim()] = line.slice(colonIndex + 1).trim();
        }
    });
    return { data, content };
}

function protectMath(text) {
    const blocks = [];
    let counter = 0;
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, content) => {
        blocks.push({ placeholder: `%%MATH_DISPLAY_${counter}%%`, content: content.trim(), display: true });
        return `%%MATH_DISPLAY_${counter++}%%`;
    });
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, content) => {
        if (/^\d/.test(content.trim())) return match;
        blocks.push({ placeholder: `%%MATH_INLINE_${counter}%%`, content: content.trim(), display: false });
        return `%%MATH_INLINE_${counter++}%%`;
    });
    return { text, blocks };
}

function restoreMath(html, blocks) {
    blocks.forEach(({ placeholder, content, display }) => {
        try {
            const rendered = katex.renderToString(content, { displayMode: display, throwOnError: false });
            html = html.replace(placeholder, display ? `<div class="katex-display">${rendered}</div>` : rendered);
        } catch (e) {
            html = html.replace(placeholder, `<code>${content}</code>`);
        }
    });
    return html;
}

function renderMath() {
    renderMathInElement(document.getElementById('content'), {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ],
        throwOnError: false
    });
}

init();