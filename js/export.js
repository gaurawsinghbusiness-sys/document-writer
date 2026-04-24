/**
 * Document Writer - Enhanced Export Module
 * Export documents to DOCX, PDF, HTML, TXT, and more
 */

class DocumentExporter {
    constructor() {
        this.formats = ['docx', 'pdf', 'html', 'txt', 'rtf', 'print'];
        this.docxLibLoaded = false;
        this.pdfLibLoaded = false;
    }

    init() {
        window.addEventListener('export-document', (e) => {
            this.export(e.detail.format);
        });
        
        // Preload libraries
        this.loadDocxLib();
        this.loadPdfLib();
    }

    /**
     * Load docx.js library for proper DOCX export
     */
    async loadDocxLib() {
        if (this.docxLibLoaded) return true;
        
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/docx@8.2.0/build/index.umd.js';
            script.onload = () => {
                this.docxLibLoaded = true;
                console.log('DOCX library loaded');
                resolve(true);
            };
            script.onerror = () => {
                console.warn('Failed to load DOCX library, using fallback');
                resolve(false);
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Load jsPDF library for PDF export
     */
    async loadPdfLib() {
        if (this.pdfLibLoaded) return true;
        
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                // Also load html2canvas for HTML to PDF
                const html2canvasScript = document.createElement('script');
                html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                html2canvasScript.onload = () => {
                    this.pdfLibLoaded = true;
                    console.log('PDF libraries loaded');
                    resolve(true);
                };
                html2canvasScript.onerror = () => resolve(false);
                document.head.appendChild(html2canvasScript);
            };
            script.onerror = () => {
                console.warn('Failed to load PDF library, using fallback');
                resolve(false);
            };
            document.head.appendChild(script);
        });
    }

    async export(format) {
        const title = document.getElementById('documentTitle')?.value || 'document';
        const content = this.getFullContent();
        const pageSize = window.currentPageSize || '6x9';

        window.toolbar?.showToast(`Exporting as ${format.toUpperCase()}...`, 'info');

        try {
            switch (format) {
                case 'docx':
                    await this.exportDOCX(title, content, pageSize);
                    break;
                case 'pdf':
                    await this.exportPDF(title, content, pageSize);
                    break;
                case 'html':
                    this.exportHTML(title, content);
                    break;
                case 'txt':
                    this.exportTXT(title, content);
                    break;
                case 'rtf':
                    this.exportRTF(title, content);
                    break;
                case 'print':
                    this.print();
                    break;
            }
        } catch (error) {
            console.error('Export failed:', error);
            window.toolbar?.showToast('Export failed. Please try again.', 'error');
        }
    }

    getFullContent() {
        const chapters = window.chapterManager.getChapters();
        return chapters.map(ch => `<h1>${ch.title}</h1>${ch.content}`).join('<div class="page-break"></div>');
    }

    /**
     * Get page dimensions for export
     */
    getPageDimensions(size) {
        const dimensions = {
            '5x8': { width: 5, height: 8, unit: 'in' },
            '5.25x8': { width: 5.25, height: 8, unit: 'in' },
            '5.5x8.5': { width: 5.5, height: 8.5, unit: 'in' },
            '6x9': { width: 6, height: 9, unit: 'in' },
            '6.14x9.21': { width: 6.14, height: 9.21, unit: 'in' },
            '6.69x9.61': { width: 6.69, height: 9.61, unit: 'in' },
            '7x10': { width: 7, height: 10, unit: 'in' },
            '7.5x9.25': { width: 7.5, height: 9.25, unit: 'in' },
            '8x10': { width: 8, height: 10, unit: 'in' },
            '8.5x8.5': { width: 8.5, height: 8.5, unit: 'in' },
            '8.25x6': { width: 8.25, height: 6, unit: 'in' },
            '8.5x11': { width: 8.5, height: 11, unit: 'in' },
            'a4': { width: 210, height: 297, unit: 'mm' },
            'a5': { width: 148, height: 210, unit: 'mm' },
            'b5': { width: 176, height: 250, unit: 'mm' }
        };
        return dimensions[size] || dimensions['6x9'];
    }

    /**
     * Export to proper DOCX format using docx.js
     */
    async exportDOCX(title, content, pageSize) {
        await this.loadDocxLib();
        
        if (window.docx && this.docxLibLoaded) {
            try {
                const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } = window.docx;
                const dims = this.getPageDimensions(pageSize);
                
                // Parse HTML content into document elements
                const elements = this.parseHTMLToDocxElements(content, { Document, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType });
                
                const doc = new Document({
                    sections: [{
                        properties: {
                            page: {
                                size: {
                                    width: dims.unit === 'in' ? dims.width * 1440 : dims.width * 56.7,
                                    height: dims.unit === 'in' ? dims.height * 1440 : dims.height * 56.7
                                },
                                margin: {
                                    top: dims.unit === 'in' ? 720 : 567, // 0.5in or 10mm
                                    bottom: dims.unit === 'in' ? 720 : 567,
                                    left: dims.unit === 'in' ? 1080 : 850, // 0.75in inside margin
                                    right: dims.unit === 'in' ? 720 : 567
                                }
                            }
                        },
                        children: elements
                    }]
                });

                const blob = await Packer.toBlob(doc);
                this.downloadBlob(blob, `${title}.docx`);
                window.toolbar?.showToast('✅ Exported as DOCX successfully!', 'success');
                return;
            } catch (err) {
                console.error('DOCX lib export failed, using fallback:', err);
            }
        }
        
        // Fallback to DOC format
        this.exportDOCFallback(title, content, pageSize);
    }

    /**
     * Parse HTML content to DOCX elements
     */
    parseHTMLToDocxElements(htmlContent, docx) {
        const { Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } = docx;
        const elements = [];
        
        // Create a temporary container to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;
        
        const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) {
                    elements.push(new Paragraph({
                        children: [new TextRun(text)]
                    }));
                }
                return;
            }
            
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            
            const tagName = node.tagName.toLowerCase();
            
            switch (tagName) {
                case 'h1':
                    elements.push(new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        children: [new TextRun({ text: node.textContent, bold: true, size: 48 })]
                    }));
                    break;
                    
                case 'h2':
                    elements.push(new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        children: [new TextRun({ text: node.textContent, bold: true, size: 36 })]
                    }));
                    break;
                    
                case 'h3':
                    elements.push(new Paragraph({
                        heading: HeadingLevel.HEADING_3,
                        children: [new TextRun({ text: node.textContent, bold: true, size: 28 })]
                    }));
                    break;
                    
                case 'p':
                    const runs = this.parseInlineElements(node, TextRun);
                    elements.push(new Paragraph({
                        children: runs,
                        alignment: this.getAlignment(node, AlignmentType)
                    }));
                    break;
                    
                case 'div':
                    if (node.classList.contains('page-break')) {
                        elements.push(new Paragraph({
                            children: [new PageBreak()]
                        }));
                    } else {
                        Array.from(node.childNodes).forEach(processNode);
                    }
                    break;
                    
                case 'ul':
                case 'ol':
                    Array.from(node.children).forEach((li, index) => {
                        const bullet = tagName === 'ul' ? '• ' : `${index + 1}. `;
                        elements.push(new Paragraph({
                            children: [new TextRun(bullet + li.textContent)],
                            indent: { left: 720 }
                        }));
                    });
                    break;
                    
                case 'blockquote':
                    elements.push(new Paragraph({
                        children: [new TextRun({ text: node.textContent, italics: true })],
                        indent: { left: 720 }
                    }));
                    break;
                    
                default:
                    // Process children for unknown elements
                    Array.from(node.childNodes).forEach(processNode);
            }
        };
        
        Array.from(temp.childNodes).forEach(processNode);
        
        // Ensure at least one paragraph
        if (elements.length === 0) {
            elements.push(new Paragraph({ children: [new TextRun('')] }));
        }
        
        return elements;
    }

    /**
     * Parse inline elements (bold, italic, etc.)
     */
    parseInlineElements(node, TextRun) {
        const runs = [];
        
        const processInline = (el, styles = {}) => {
            if (el.nodeType === Node.TEXT_NODE) {
                if (el.textContent.trim()) {
                    runs.push(new TextRun({ text: el.textContent, ...styles }));
                }
                return;
            }
            
            if (el.nodeType !== Node.ELEMENT_NODE) return;
            
            const newStyles = { ...styles };
            const tag = el.tagName.toLowerCase();
            
            if (tag === 'b' || tag === 'strong') newStyles.bold = true;
            if (tag === 'i' || tag === 'em') newStyles.italics = true;
            if (tag === 'u') newStyles.underline = {};
            if (tag === 's' || tag === 'strike') newStyles.strike = true;
            
            Array.from(el.childNodes).forEach(child => processInline(child, newStyles));
        };
        
        Array.from(node.childNodes).forEach(child => processInline(child));
        
        if (runs.length === 0) {
            runs.push(new TextRun(node.textContent || ''));
        }
        
        return runs;
    }

    /**
     * Get paragraph alignment
     */
    getAlignment(node, AlignmentType) {
        const style = node.style?.textAlign || '';
        switch (style) {
            case 'center': return AlignmentType.CENTER;
            case 'right': return AlignmentType.RIGHT;
            case 'justify': return AlignmentType.JUSTIFIED;
            default: return AlignmentType.LEFT;
        }
    }

    /**
     * Fallback DOC export (Word-compatible HTML)
     */
    exportDOCFallback(title, content, pageSize) {
        const dims = this.getPageDimensions(pageSize);
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
                        size: ${dims.width}${dims.unit} ${dims.height}${dims.unit};
                        margin: 0.75in 0.5in;
                    }
                    body { 
                        font-family: 'Times New Roman', serif; 
                        font-size: 12pt; 
                        line-height: 1.5;
                        margin: 0;
                    }
                    h1 { font-size: 24pt; page-break-before: always; margin-top: 2in; text-align: center; }
                    h1:first-child { page-break-before: avoid; }
                    h2 { font-size: 18pt; page-break-after: avoid; }
                    h3 { font-size: 14pt; }
                    p { text-align: justify; margin-bottom: 0.5em; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #000; padding: 8px; }
                    .page-break { page-break-after: always; }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `;

        const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
        this.downloadBlob(blob, `${title}.doc`);
        window.toolbar?.showToast('✅ Exported as DOC format', 'success');
    }

    /**
     * Export to PDF with proper page size
     */
    async exportPDF(title, content, pageSize) {
        await this.loadPdfLib();
        const dims = this.getPageDimensions(pageSize);
        
        if (window.jspdf && window.html2canvas && this.pdfLibLoaded) {
            try {
                const { jsPDF } = window.jspdf;
                
                // Create temporary container with exact dimensions
                const container = document.createElement('div');
                container.style.cssText = `
                    position: absolute;
                    left: -9999px;
                    width: ${dims.width}${dims.unit};
                    padding: 0.75in;
                    box-sizing: border-box;
                    font-family: Georgia, serif;
                    font-size: 12pt;
                    line-height: 1.6;
                    background: white;
                    color: black;
                `;
                container.innerHTML = `
                    <style>
                        h1 { font-size: 24pt; text-align: center; margin-top: 0; }
                        h2 { font-size: 18pt; }
                        h3 { font-size: 14pt; }
                        p { text-align: justify; margin-bottom: 0.8em; }
                        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
                        th, td { border: 1px solid #333; padding: 8px; }
                        th { background: #f0f0f0; }
                        img { max-width: 100%; }
                    </style>
                    ${content}
                `;
                document.body.appendChild(container);
                
                // Convert to canvas
                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                });
                
                document.body.removeChild(container);
                
                // Create PDF with correct dimensions
                const unit = dims.unit === 'in' ? 'in' : 'mm';
                const pdf = new jsPDF({
                    orientation: dims.width > dims.height ? 'landscape' : 'portrait',
                    unit: unit,
                    format: [dims.width, dims.height]
                });
                
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const pdfWidth = dims.width;
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                // Add pages as needed
                let heightLeft = pdfHeight;
                let position = 0;
                const pageHeight = dims.height;
                
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
                
                while (heightLeft > 0) {
                    position = heightLeft - pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pageHeight;
                }
                
                pdf.save(`${title}.pdf`);
                window.toolbar?.showToast('✅ Exported as PDF successfully!', 'success');
                return;
            } catch (err) {
                console.error('PDF lib export failed, using fallback:', err);
            }
        }
        
        // Fallback to print dialog
        this.exportPDFPrintFallback(title, content, pageSize);
    }

    /**
     * Fallback PDF export using print dialog
     */
    exportPDFPrintFallback(title, content, pageSize) {
        const dims = this.getPageDimensions(pageSize);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    @page { 
                        size: ${dims.width}${dims.unit} ${dims.height}${dims.unit}; 
                        margin: 0.5in 0.5in 0.5in 0.75in; 
                    }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                    body { 
                        font-family: Georgia, serif; 
                        font-size: 12pt; 
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                    }
                    h1 { font-size: 24pt; text-align: center; page-break-after: avoid; }
                    h2 { font-size: 18pt; page-break-after: avoid; }
                    h3 { font-size: 14pt; }
                    p { text-align: justify; orphans: 3; widows: 3; }
                    table { border-collapse: collapse; width: 100%; page-break-inside: avoid; }
                    th, td { border: 1px solid #333; padding: 8px; }
                    th { background: #f0f0f0; }
                    img { max-width: 100%; height: auto; page-break-inside: avoid; }
                    .page-break { page-break-after: always; }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        window.toolbar?.showToast('📄 Select "Save as PDF" in print dialog', 'info');
    }

    /**
     * Export as HTML
     */
    exportHTML(title, content) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        :root { --text: #1a1a1a; --bg: #fafafa; --accent: #2b579a; }
        @media (prefers-color-scheme: dark) {
            :root { --text: #e0e0e0; --bg: #1a1a1a; }
        }
        * { box-sizing: border-box; }
        body { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 60px 24px;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 18px;
            line-height: 1.8;
            color: var(--text);
            background: var(--bg);
        }
        h1 { font-size: 2.5em; margin: 1.5em 0 0.5em; text-align: center; }
        h2 { font-size: 1.75em; margin: 1.2em 0 0.5em; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; }
        h3 { font-size: 1.3em; margin: 1em 0 0.4em; }
        p { text-align: justify; margin-bottom: 1em; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5em 0; }
        table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: rgba(0,0,0,0.05); font-weight: 600; }
        blockquote { 
            margin: 1.5em 0; 
            padding: 1em 1.5em; 
            border-left: 4px solid var(--accent); 
            background: rgba(0,0,0,0.03);
            font-style: italic; 
        }
        ul, ol { margin: 1em 0; padding-left: 2em; }
        li { margin-bottom: 0.5em; }
        a { color: var(--accent); }
        .page-break { border-top: 2px dashed #ccc; margin: 3em 0; }
    </style>
</head>
<body>
${content}
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        this.downloadBlob(blob, `${title}.html`);
        window.toolbar?.showToast('✅ Exported as HTML', 'success');
    }

    /**
     * Export as plain text
     */
    exportTXT(title, content) {
        // Strip HTML tags and convert to plain text
        const temp = document.createElement('div');
        temp.innerHTML = content;
        
        // Replace headings with text formatting
        temp.querySelectorAll('h1').forEach(h => {
            h.textContent = '\n\n' + h.textContent.toUpperCase() + '\n' + '='.repeat(h.textContent.length) + '\n';
        });
        temp.querySelectorAll('h2').forEach(h => {
            h.textContent = '\n\n' + h.textContent + '\n' + '-'.repeat(h.textContent.length) + '\n';
        });
        temp.querySelectorAll('h3, h4, h5, h6').forEach(h => {
            h.textContent = '\n\n' + h.textContent + '\n';
        });
        temp.querySelectorAll('p').forEach(p => {
            p.textContent = p.textContent + '\n\n';
        });
        temp.querySelectorAll('br').forEach(br => {
            br.textContent = '\n';
        });
        temp.querySelectorAll('li').forEach(li => {
            li.textContent = '  • ' + li.textContent + '\n';
        });
        temp.querySelectorAll('.page-break').forEach(pb => {
            pb.textContent = '\n\n' + '─'.repeat(40) + '\n\n';
        });
        
        const text = temp.textContent.replace(/\n{3,}/g, '\n\n').trim();
        
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        this.downloadBlob(blob, `${title}.txt`);
        window.toolbar?.showToast('✅ Exported as TXT', 'success');
    }

    /**
     * Export as RTF (Rich Text Format)
     */
    exportRTF(title, content) {
        // Convert HTML to basic RTF
        const temp = document.createElement('div');
        temp.innerHTML = content;
        
        let rtf = '{\\rtf1\\ansi\\deff0\n';
        rtf += '{\\fonttbl{\\f0 Times New Roman;}}\n';
        rtf += '\\f0\\fs24\n';
        
        const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent.replace(/[\\{}]/g, '\\$&');
            }
            
            if (node.nodeType !== Node.ELEMENT_NODE) return '';
            
            const tag = node.tagName.toLowerCase();
            let result = '';
            
            switch (tag) {
                case 'h1':
                    result = '\\par\\pard\\fs48\\b ' + Array.from(node.childNodes).map(processNode).join('') + '\\b0\\fs24\\par\\par\n';
                    break;
                case 'h2':
                    result = '\\par\\pard\\fs36\\b ' + Array.from(node.childNodes).map(processNode).join('') + '\\b0\\fs24\\par\\par\n';
                    break;
                case 'h3':
                    result = '\\par\\pard\\fs28\\b ' + Array.from(node.childNodes).map(processNode).join('') + '\\b0\\fs24\\par\\par\n';
                    break;
                case 'p':
                    result = '\\par\\pard ' + Array.from(node.childNodes).map(processNode).join('') + '\\par\n';
                    break;
                case 'b':
                case 'strong':
                    result = '\\b ' + Array.from(node.childNodes).map(processNode).join('') + '\\b0 ';
                    break;
                case 'i':
                case 'em':
                    result = '\\i ' + Array.from(node.childNodes).map(processNode).join('') + '\\i0 ';
                    break;
                case 'u':
                    result = '\\ul ' + Array.from(node.childNodes).map(processNode).join('') + '\\ul0 ';
                    break;
                case 'br':
                    result = '\\line\n';
                    break;
                case 'div':
                    if (node.classList.contains('page-break')) {
                        result = '\\page\n';
                    } else {
                        result = Array.from(node.childNodes).map(processNode).join('');
                    }
                    break;
                default:
                    result = Array.from(node.childNodes).map(processNode).join('');
            }
            
            return result;
        };
        
        rtf += Array.from(temp.childNodes).map(processNode).join('');
        rtf += '}';
        
        const blob = new Blob([rtf], { type: 'application/rtf' });
        this.downloadBlob(blob, `${title}.rtf`);
        window.toolbar?.showToast('✅ Exported as RTF', 'success');
    }

    /**
     * Print document
     */
    print() {
        window.print();
    }

    /**
     * Download blob as file
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

window.documentExporter = new DocumentExporter();
