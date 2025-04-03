const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const marked = require('marked');
const handlebars = require('handlebars');

// Register partials
handlebars.registerPartial('header', fs.readFileSync('_includes/header.html', 'utf8'));
handlebars.registerPartial('footer', fs.readFileSync('_includes/footer.html', 'utf8'));

// Process posts and collect metadata
const postsDir = 'posts';
const posts = fs.readdirSync(postsDir)
    .filter(file => path.extname(file) === '.md')
    .map(file => {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
        const { attributes } = fm(content);
        return {
            ...attributes,
            slug: path.basename(file, '.md')
        };
    });

// Process all markdown files (including index.md)
['.', postsDir].forEach(dir => {
    fs.readdirSync(dir).forEach(file => {
        if (path.extname(file) === '.md') {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            const { attributes, body } = fm(content);
            const htmlContent = marked.parse(body);
            
            // Get layout template
            const layout = fs.readFileSync(`layouts/${attributes.layout}.html`, 'utf8');
            const template = handlebars.compile(layout);
            
            // Render final HTML
            const html = template({
                ...attributes,
                content: htmlContent,
                posts: dir === '.' ? [] : posts // Only pass posts to home template
            });
            
            // Save output
            const outputFilename = file.replace('.md', '.html');
            fs.writeFileSync(path.join(dir === '.' ? '.' : postsDir, outputFilename), html);
        }
    });
});

// At the bottom of build.js where you write files:
fs.writeFileSync(
    path.join(dir === '.' ? 'docs' : 'docs/posts', outputFilename), 
    html
);
