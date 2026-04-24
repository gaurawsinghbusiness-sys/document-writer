/**
 * Pro Book Editor - EPUB Export
 * Export document as EPUB for e-readers
 */

const EPUBExport = {
    async export() {
        const statusEl = document.getElementById('saveStatus');
        if (statusEl) statusEl.textContent = 'Exporting EPUB...';

        try {
            const pages = AppState.document.pages;
            const title = AppState.document.title || 'Untitled Book';
            const author = AppState.document.author || 'Unknown Author';

            // Create HTML for each page
            const chapters = pages.map((page, index) => ({
                title: `Page ${index + 1}`,
                content: page.content
            }));

            // For now, export as HTML (true EPUB requires JSZip)
            const html = this.generateEPUBHTML(title, author, chapters);
            
            const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
            this.download(blob, `${title}.html`);

            if (statusEl) statusEl.textContent = '✓ Exported (HTML format)';
            
            // TODO: Add proper EPUB generation with JSZip
            console.log('Note: For proper EPUB, integrate JSZip library');

        } catch (error) {
            console.error('EPUB export failed:', error);
            if (statusEl) statusEl.textContent = 'Export failed';
        }
    },

    generateEPUBHTML(title, author, chapters) {
        const content = chapters.map((ch, i) => `
            <section id="chapter-${i + 1}">
                ${ch.content}
            </section>
        `).join('\n');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="author" content="${author}">
    <style>
        :root { color-scheme: light dark; }
        body {
            font-family: Georgia, 'Times New Roman', serif;
            max-width: 40em;
            margin: 0 auto;
            padding: 2em;
            line-height: 1.8;
        }
        h1 { text-align: center; margin-bottom: 2em; }
        h2 { margin-top: 2em; }
        p { text-align: justify; margin-bottom: 1em; }
        section { margin-bottom: 3em; }
    </style>
</head>
<body>
    <header>
        <h1>${title}</h1>
        <p style="text-align:center"><em>by ${author}</em></p>
    </header>
    <main>
        ${content}
    </main>
</body>
</html>`;
    },

    download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

window.Export = window.Export || {};
window.Export.epub = () => EPUBExport.export();
