/**
 * Pro Book Editor - PDF Export
 * Export document as PDF
 */

const PDFExport = {
    async export() {
        // Show loading
        const statusEl = document.getElementById('saveStatus');
        if (statusEl) statusEl.textContent = 'Exporting PDF...';

        try {
            // Get all pages content
            const pages = AppState.document.pages;
            const title = AppState.document.title || 'document';
            const size = Styles.getPageSize(AppState.settings.pageSize);
            const margins = AppState.settings.margins;

            // Create print-ready HTML
            const content = pages.map(p => p.content).join('<div style="page-break-after:always"></div>');

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=Merriweather&family=Lora&family=EB+Garamond&family=Inter&family=Open+Sans&family=Caveat&family=Dancing+Script&display=swap" rel="stylesheet">
                    <style>
                        @page { 
                            size: ${size.width}in ${size.height}in; 
                            margin: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
                        }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                        body { 
                            font-family: '${AppState.settings.font.family}', serif;
                            font-size: ${AppState.settings.font.size}pt;
                            line-height: ${AppState.settings.font.lineHeight};
                            color: #000;
                            margin: 0;
                            padding: 0;
                        }
                        h1, h2, h3 { page-break-after: avoid; }
                        p { orphans: 3; widows: 3; }
                        img { max-width: 100%; page-break-inside: avoid; }
                        table { page-break-inside: avoid; }
                    </style>
                </head>
                <body>${content}</body>
                </html>
            `);
            printWindow.document.close();

            setTimeout(() => {
                printWindow.print();
                if (statusEl) statusEl.textContent = '✓ Saved';
            }, 500);

        } catch (error) {
            console.error('PDF export failed:', error);
            if (statusEl) statusEl.textContent = 'Export failed';
        }
    }
};

window.Export = window.Export || {};
window.Export.pdf = () => PDFExport.export();
