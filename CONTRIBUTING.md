# Contributing to Ary0Darkk's Blog

Thanks for your interest in contributing!

## Adding a New Post

1. Create a new `.md` file in the `content/` folder
2. Add frontmatter at the top:

```markdown
---
title: Your Title
date: Month DD, YYYY
description: A brief description of your post
---
```

3. Write your content in Markdown below the frontmatter

### Supported Features
- **Math**: Use `$...$` for inline math and `$$...$$` for display math (rendered with KaTeX)
- **Code blocks**: Use triple backticks with language name
- **Links**: Standard Markdown links
- **Images**: Add images to the content folder and reference them

4. Add the post to `main.js`:

```javascript
const posts = {
    'my-new-post': {
        title: 'My New Post',
        date: 'April 1, 2026',
        description: 'Description here',
        file: 'content/my-new-post.md'
    },
    // ...existing posts
};
```

## Adding a New Page

1. Create a new `.md` file in `content/`
2. Add frontmatter with `layout: page`

```markdown
---
title: Page Title
layout: page
---
```

3. Add route in `main.js`:

```javascript
const pages = [
    { route: "mypage", file: "content/mypage.md" },
    // ...existing pages
];
```

4. Create corresponding `.html` file (copy from about.html or blog.html)

## Running Locally

```bash
# Using Python
python -m http.server

# Using Node.js
npx serve
```

Then open http://localhost:8000

## Notes
- All content is stored as Markdown files in `content/`
- The site uses vanilla JavaScript to render Markdown in the browser
- Dark mode is supported and persists via localStorage