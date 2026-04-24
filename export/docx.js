/**
 * Pro Book Editor - DOCX Export
 * Export document as Microsoft Word DOCX
 */

const DOCXExport = {
    async export() {
        const statusEl = document.getElementById('saveStatus');
        if (statusEl) statusEl.textContent = 'Exporting DOCX...';

        try {
            const pages = AppState.document.pages;
            const title = AppState.document.title || 'document';
            const content = pages.map(p => p.content).join('<div class="page-break"></div>');
            const size = Styles.getPageSize(AppState.settings.pageSize);
            const margins = AppState.settings.margins;

            // Word-compatible HTML
            const html = `
                <!DOCTYPE html>
                <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                      xmlns:w="urn:schemas-microsoft-com:office:word"
                      xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta charset="utf-8">
                    <title>${title}</title>
                    <!--[if gte mso 9]>
                    <xml>
                        <w:WordDocument>
                            <w:View>Print</w:View>
                            <w:Zoom>100</w:Zoom>
                            <w:DoNotOptimizeForBrowser/>
                        </w:WordDocument>
                    </xml>
                    <![endif]-->
                    <style>
                        @page {
                            size: ${size.width}in ${size.height}in;
                            margin: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
                        }
                        body { 
                            font-family: '${AppState.settings.font.family}', 'Times New Roman', serif; 
                            font-size: ${AppState.settings.font.size}pt; 
                            line-height: ${AppState.settings.font.lineHeight};
                        }
                        h1 { font-size: 24pt; text-align: center; }
                        h2 { font-size: 18pt; page-break-after: avoid; }
                        h3 { font-size: 14pt; }
                        p { margin-bottom: 0.5em; }
                        .page-break { page-break-after: always; }
                    </style>
                </head>
                <body>${content}</body>
                </html>
            `;

            const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
            this.download(blob, `${title}.doc`);

            if (statusEl) statusEl.textContent = '✓ Exported';
        } catch (error) {
            console.error('DOCX export failed:', error);
            if (statusEl) statusEl.textContent = 'Export failed';
        }
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
window.Export.docx = () => DOCXExport.export();
