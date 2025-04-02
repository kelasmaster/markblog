// build.js
const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const marked = require('marked');
const handlebars = require('handlebars');

// Register partials
const header = fs.readFileSync('_includes/header.html', 'utf8');
const footer = fs.readFileSync('_includes/footer.html', 'utf8');
handlebars.registerPartial('header', header);
handlebars.registerPartial('footer', footer);

// Process markdown files
const postsDir = 'posts';
fs.readdirSync(postsDir).forEach(file => {
    if (path.extname(file) === '.md') {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
        const { attributes, body } = fm(content);
        const htmlContent = marked.parse(body);
        
        // Get layout template
        const layout = fs.readFileSync(`layouts/${attributes.layout}.html`, 'utf8');
        const template = handlebars.compile(layout);
        
        // Render final HTML
        const html = template({
            title: attributes.title,
            description: attributes.description,
            content: htmlContent
        });
        
        // Save output
        const outputFilename = file.replace('.md', '.html');
        fs.writeFileSync(path.join(postsDir, outputFilename), html);
    }
});
