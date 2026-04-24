/**
 * Document Writer - Pro Export Engine
 * KDP Print, KDP eBook, EPUB 3, Gumroad PDF, Markdown, ODT
 * KDP specs: 0.125" bleed, embedded fonts, 300dpi, no printer marks
 */

class ProExporter {
    constructor() {
        this.jszipLoaded = false;
        this.author = '';
        this.language = 'en';
    }

    /* ── Library Loader ─────────────────── */
    async loadJSZip() {
        if (this.jszipLoaded || window.JSZip) { this.jszipLoaded = true; return true; }
        return new Promise(resolve => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            s.onload = () => { this.jszipLoaded = true; resolve(true); };
            s.onerror = () => resolve(false);
            document.head.appendChild(s);
        });
    }

    /* ── Meta helpers ───────────────────── */
    getMeta() {
        return {
            title: document.getElementById('documentTitle')?.value || 'Untitled',
            author: document.getElementById('epubAuthor')?.value || 'Unknown Author',
            language: document.getElementById('epubLang')?.value || 'en',
            pageSize: window.currentPageSize || '6x9'
        };
    }

    getChapterContent() {
        const chapters = window.chapterManager?.getChapters() || [];
        return chapters.length
            ? chapters.map(c => `<h1>${c.title}</h1>${c.content}`).join('<div class="page-break"></div>')
            : (document.getElementById('editor')?.innerHTML || '');
    }

    stripHtml(html) {
        const d = document.createElement('div');
        d.innerHTML = html;
        return d.textContent || '';
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    toast(msg, type = 'info') {
        window.toolbar?.showToast(msg, type);
    }

    /* ── KDP Print PDF ──────────────────── */
    async exportKDPPrint() {
        const { title, author, pageSize } = this.getMeta();
        const content = this.getChapterContent();
        const dims = this.getKDPDims(pageSize);
        const pw = document.open('', '_blank');
        pw.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>
@page {
  size: ${dims.wBleed}in ${dims.hBleed}in;
  margin: ${dims.top}in ${dims.outside}in ${dims.bottom}in ${dims.inside}in;
}
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
body { font-family: Georgia,'Times New Roman',serif; font-size: 12pt; line-height: 1.6; margin: 0; color: #000; background: #fff; }
h1 { font-size: 24pt; text-align: center; page-break-before: always; margin-top: 1.5in; }
h1:first-of-type { page-break-before: avoid; }
h2 { font-size: 16pt; page-break-after: avoid; }
h3 { font-size: 13pt; }
p { text-align: justify; orphans: 3; widows: 3; margin-bottom: 0.6em; }
.page-break { page-break-after: always; visibility: hidden; height: 0; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #333; padding: 6px 10px; }
th { background: #f0f0f0; font-weight: 600; }
img { max-width: 100%; height: auto; }
blockquote { margin: 1em 0.5in; padding-left: 0.25in; border-left: 3px solid #999; font-style: italic; }
</style></head>
<body>
<h1 style="page-break-before:avoid;margin-top:2in;text-align:center;">${title}</h1>
<p style="text-align:center;font-style:italic">by ${author}</p>
<div class="page-break"></div>
${content}
</body></html>`);
        pw.document.close();
        setTimeout(() => { pw.print(); }, 600);
        this.toast('📄 KDP Print PDF — choose "Save as PDF", set exact page size. No bleed marks needed.', 'info');
    }

    getKDPDims(size) {
        const base = {
            '5x8':      { w: 5, h: 8,    inside: 0.75, outside: 0.5, top: 0.5, bottom: 0.5 },
            '5.25x8':   { w: 5.25, h: 8, inside: 0.75, outside: 0.5, top: 0.5, bottom: 0.5 },
            '5.5x8.5':  { w: 5.5, h: 8.5, inside: 0.75, outside: 0.5, top: 0.5, bottom: 0.5 },
            '6x9':      { w: 6, h: 9,    inside: 0.875, outside: 0.5, top: 0.5, bottom: 0.5 },
            '6.14x9.21':{ w: 6.14, h: 9.21, inside: 0.875, outside: 0.5, top: 0.5, bottom: 0.5 },
            '6.69x9.61':{ w: 6.69, h: 9.61, inside: 1, outside: 0.5, top: 0.5, bottom: 0.5 },
            '7x10':     { w: 7, h: 10,   inside: 1, outside: 0.5, top: 0.5, bottom: 0.5 },
            '8.5x11':   { w: 8.5, h: 11, inside: 1, outside: 0.75, top: 0.75, bottom: 0.75 },
            'a4':       { w: 8.27, h: 11.69, inside: 1, outside: 0.75, top: 0.75, bottom: 0.75 },
            'a5':       { w: 5.83, h: 8.27, inside: 0.75, outside: 0.5, top: 0.5, bottom: 0.5 },
            'b5':       { w: 6.93, h: 9.84, inside: 0.875, outside: 0.5, top: 0.5, bottom: 0.5 },
        };
        const d = base[size] || base['6x9'];
        return { ...d, wBleed: (d.w + 0.25).toFixed(3), hBleed: (d.h + 0.25).toFixed(3) };
    }

    /* ── KDP eBook EPUB ─────────────────── */
    async exportKDPEbook() {
        await this.exportEPUB(true);
    }

    /* ── EPUB 3 ─────────────────────────── */
    async exportEPUB(kdpMode = false) {
        const ok = await this.loadJSZip();
        if (!ok) { this.toast('JSZip library failed to load', 'error'); return; }
        const { title, author, language } = this.getMeta();
        const chapters = window.chapterManager?.getChapters() || [{ title: 'Chapter 1', content: document.getElementById('editor')?.innerHTML || '' }];
        const uid = `urn:uuid:${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
        const now = new Date().toISOString().split('.')[0] + 'Z';

        const zip = new JSZip();

        // mimetype (must be first, uncompressed)
        zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

        // META-INF/container.xml
        zip.folder('META-INF').file('container.xml',
            `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

        const oebps = zip.folder('OEBPS');

        // Stylesheet
        const css = `
body { font-family: Georgia, serif; line-height: 1.7; margin: 0; padding: 0; }
h1 { font-size: 1.8em; text-align: center; margin: 2em 0 1em; page-break-before: always; }
h1:first-of-type { page-break-before: avoid; }
h2 { font-size: 1.4em; margin: 1.5em 0 0.5em; }
h3 { font-size: 1.1em; margin: 1em 0 0.4em; }
p { text-align: justify; margin: 0 0 0.8em; }
blockquote { margin: 1em 2em; font-style: italic; }
img { max-width: 100%; height: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 6px; }`;
        oebps.file('style.css', css);

        // Chapter files
        const chapterIds = chapters.map((_, i) => `chapter${String(i+1).padStart(3,'0')}`);
        const chapterItems = chapters.map((ch, i) => {
            const id = chapterIds[i];
            const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${language}">
<head>
  <title>${ch.title || `Chapter ${i+1}`}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
${ch.content || '<p></p>'}
</body>
</html>`;
            oebps.file(`${id}.xhtml`, xhtml);
            return { id, title: ch.title || `Chapter ${i+1}`, file: `${id}.xhtml` };
        });

        // NAV (EPUB 3)
        const navToc = chapterItems.map(c => `<li><a href="${c.file}">${c.title}</a></li>`).join('\n    ');
        oebps.file('nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}">
<head><title>Table of Contents</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
<nav epub:type="toc" id="toc">
  <h1>Contents</h1>
  <ol>
    ${navToc}
  </ol>
</nav>
</body></html>`);

        // content.opf
        const manifestItems = chapterItems.map(c => `    <item id="${c.id}" href="${c.file}" media-type="application/xhtml+xml"/>`).join('\n');
        const spineItems = chapterItems.map(c => `    <itemref idref="${c.id}"/>`).join('\n');
        oebps.file('content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${language}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${uid}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>${language}</dc:language>
    <dc:date>${now.split('T')[0]}</dc:date>
    <meta property="dcterms:modified">${now}</meta>
    ${kdpMode ? '<meta name="kdp:contentProvided">true</meta>' : ''}
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="style.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>`);

        const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
        this.downloadBlob(blob, `${title}${kdpMode ? '-KDP' : ''}.epub`);
        this.toast(`✅ ${kdpMode ? 'KDP eBook' : 'EPUB 3'} exported successfully!`, 'success');
    }

    /* ── Gumroad PDF ────────────────────── */
    async exportGumroad() {
        const { title, author } = this.getMeta();
        const content = this.getChapterContent();
        const pw = window.open('', '_blank');
        pw.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>
@page { size: 8.5in 11in; margin: 1in; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
body { font-family: Georgia,'Times New Roman',serif; font-size: 13pt; line-height: 1.7; color: #111; background: #fff; margin: 0; }
.cover { text-align: center; padding: 2in 0; page-break-after: always; }
.cover h1 { font-size: 36pt; margin-bottom: 0.3em; }
.cover .byline { font-size: 16pt; color: #555; font-style: italic; }
h1 { font-size: 22pt; text-align: center; page-break-before: always; margin-top: 1in; }
h1:nth-of-type(1) { page-break-before: avoid; }
h2 { font-size: 16pt; margin-top: 1.5em; page-break-after: avoid; }
p { text-align: justify; margin: 0 0 0.8em; }
.page-break { page-break-after: always; height: 0; visibility: hidden; }
table { width: 100%; border-collapse: collapse; margin: 1em 0; }
th, td { border: 1px solid #ccc; padding: 8px 12px; }
th { background: #f5f5f5; }
img { max-width: 100%; }
blockquote { margin: 1em 1.5em; padding-left: 1em; border-left: 4px solid #ccc; font-style: italic; color: #555; }
footer { position: fixed; bottom: 0.5in; width: 100%; text-align: center; font-size: 10pt; color: #999; }
</style></head>
<body>
<div class="cover">
  <h1>${title}</h1>
  <p class="byline">by ${author}</p>
</div>
${content}
<footer>${title} &bull; ${author}</footer>
</body></html>`);
        pw.document.close();
        setTimeout(() => pw.print(), 600);
        this.toast('📦 Gumroad PDF — save as PDF, US Letter 8.5×11". Ready to upload!', 'info');
    }

    /* ── Markdown ───────────────────────── */
    exportMarkdown() {
        const { title, author } = this.getMeta();
        const content = this.getChapterContent();
        const tmp = document.createElement('div');
        tmp.innerHTML = content;

        const toMd = (el) => {
            if (el.nodeType === 3) return el.textContent;
            const tag = el.tagName?.toLowerCase();
            const inner = Array.from(el.childNodes).map(toMd).join('');
            switch(tag) {
                case 'h1': return `\n# ${inner}\n`;
                case 'h2': return `\n## ${inner}\n`;
                case 'h3': return `\n### ${inner}\n`;
                case 'h4': return `\n#### ${inner}\n`;
                case 'p': return `\n${inner}\n`;
                case 'b': case 'strong': return `**${inner}**`;
                case 'i': case 'em': return `*${inner}*`;
                case 'u': return `__${inner}__`;
                case 's': return `~~${inner}~~`;
                case 'a': return `[${inner}](${el.href || ''})`;
                case 'img': return `![${el.alt || ''}](${el.src || ''})`;
                case 'blockquote': return inner.split('\n').map(l => `> ${l}`).join('\n');
                case 'ul': return Array.from(el.children).map(li => `- ${li.textContent.trim()}`).join('\n') + '\n';
                case 'ol': return Array.from(el.children).map((li,i) => `${i+1}. ${li.textContent.trim()}`).join('\n') + '\n';
                case 'hr': return '\n---\n';
                case 'br': return '\n';
                default: return inner;
            }
        };

        const md = `# ${title}\n\n*by ${author}*\n\n---\n\n` +
            Array.from(tmp.childNodes).map(toMd).join('').replace(/\n{3,}/g, '\n\n').trim();

        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        this.downloadBlob(blob, `${title}.md`);
        this.toast('✅ Exported as Markdown', 'success');
    }

    /* ── ODT (OpenDocument) ─────────────── */
    async exportODT() {
        const ok = await this.loadJSZip();
        if (!ok) { this.toast('JSZip failed to load', 'error'); return; }
        const { title, author } = this.getMeta();
        const content = this.getChapterContent();
        const tmp = document.createElement('div');
        tmp.innerHTML = content;

        const toOdt = (el) => {
            if (el.nodeType === 3) return `<text:span>${el.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text:span>`;
            const tag = el.tagName?.toLowerCase();
            const inner = Array.from(el.childNodes).map(toOdt).join('');
            switch(tag) {
                case 'h1': return `<text:h text:style-name="Heading_1" text:outline-level="1">${inner}</text:h>`;
                case 'h2': return `<text:h text:style-name="Heading_2" text:outline-level="2">${inner}</text:h>`;
                case 'h3': return `<text:h text:style-name="Heading_3" text:outline-level="3">${inner}</text:h>`;
                case 'p': case 'div': return `<text:p text:style-name="Text_Body">${inner}</text:p>`;
                case 'b': case 'strong': return `<text:span text:style-name="Bold">${inner}</text:span>`;
                case 'i': case 'em': return `<text:span text:style-name="Italic">${inner}</text:span>`;
                case 'br': return `<text:line-break/>`;
                default: return inner;
            }
        };

        const bodyContent = Array.from(tmp.childNodes).map(toOdt).join('');

        const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  office:version="1.3">
<office:automatic-styles>
  <style:style style:name="Text_Body" style:family="paragraph">
    <style:paragraph-properties fo:text-align="justify" fo:margin-bottom="0.5cm"/>
    <style:text-properties fo:font-family="Georgia" fo:font-size="12pt"/>
  </style:style>
  <style:style style:name="Heading_1" style:family="paragraph">
    <style:paragraph-properties fo:text-align="center" fo:margin-top="1cm" fo:margin-bottom="0.5cm" fo:break-before="page"/>
    <style:text-properties fo:font-size="24pt" fo:font-weight="bold"/>
  </style:style>
  <style:style style:name="Heading_2" style:family="paragraph">
    <style:paragraph-properties fo:margin-top="0.8cm" fo:margin-bottom="0.3cm"/>
    <style:text-properties fo:font-size="18pt" fo:font-weight="bold"/>
  </style:style>
  <style:style style:name="Heading_3" style:family="paragraph">
    <style:text-properties fo:font-size="14pt" fo:font-weight="bold"/>
  </style:style>
  <style:style style:name="Bold" style:family="text">
    <style:text-properties fo:font-weight="bold"/>
  </style:style>
  <style:style style:name="Italic" style:family="text">
    <style:text-properties fo:font-style="italic"/>
  </style:style>
</office:automatic-styles>
<office:body>
<office:text>
<text:h text:style-name="Heading_1" text:outline-level="1">${title}</text:h>
<text:p text:style-name="Text_Body"><text:span text:style-name="Italic">by ${author}</text:span></text:p>
${bodyContent}
</office:text>
</office:body>
</office:document-content>`;

        const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/" office:version="1.3">
<office:meta>
  <dc:title>${title}</dc:title>
  <dc:creator>${author}</dc:creator>
  <dc:date>${new Date().toISOString()}</dc:date>
</office:meta>
</office:document-meta>`;

        const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

        const zip = new JSZip();
        zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });
        zip.folder('META-INF').file('manifest.xml', manifestXml);
        zip.file('content.xml', contentXml);
        zip.file('meta.xml', metaXml);

        const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.oasis.opendocument.text' });
        this.downloadBlob(blob, `${title}.odt`);
        this.toast('✅ Exported as ODT (LibreOffice/OpenOffice)', 'success');
    }

    /* ── A4 International PDF ───────────── */
    exportInternationalPDF(size = 'a4') {
        const { title, author } = this.getMeta();
        const content = this.getChapterContent();
        const sizes = { a4: '210mm 297mm', a5: '148mm 210mm', b5: '176mm 250mm' };
        const margins = { a4: '25mm 20mm', a5: '20mm 15mm', b5: '22mm 18mm' };
        const pw = window.open('', '_blank');
        pw.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>
@page { size: ${sizes[size] || sizes.a4}; margin: ${margins[size] || margins.a4}; }
@media print { body { -webkit-print-color-adjust: exact; } }
body { font-family: Georgia,serif; font-size: 11pt; line-height: 1.6; color: #000; margin: 0; }
h1 { font-size: 22pt; text-align: center; page-break-before: always; margin-top: 40mm; }
h1:first-of-type { page-break-before: avoid; }
h2 { font-size: 15pt; page-break-after: avoid; margin-top: 1.2em; }
p { text-align: justify; margin: 0 0 0.7em; }
.page-break { page-break-after: always; height: 0; visibility: hidden; }
</style></head><body>
<h1 style="page-break-before:avoid;margin-top:30mm">${title}</h1>
<p style="text-align:center;font-style:italic">by ${author}</p>
<div class="page-break"></div>
${content}
</body></html>`);
        pw.document.close();
        setTimeout(() => pw.print(), 600);
        this.toast(`🌍 ${size.toUpperCase()} PDF — save as PDF with paper size ${size.toUpperCase()}`, 'info');
    }
}

window.proExporter = new ProExporter();
