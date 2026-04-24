/**
 * Document Writer - Theme & Export Panel Manager
 */

class ThemeManager {
    constructor() {
        this.themes = [
            { id: 'light',    label: 'Light',    emoji: '☀️' },
            { id: 'dark',     label: 'Dark',     emoji: '🌙' },
            { id: 'sepia',    label: 'Sepia',    emoji: '📜' },
            { id: 'forest',   label: 'Forest',   emoji: '🌿' },
            { id: 'ocean',    label: 'Ocean',    emoji: '🌊' },
            { id: 'midnight', label: 'Midnight', emoji: '✨' },
            { id: 'sunset',   label: 'Sunset',   emoji: '🌅' },
            { id: 'paper',    label: 'Paper',    emoji: '📄' },
            { id: 'focus',    label: 'Focus',    emoji: '🎯' },
        ];
        this.current = localStorage.getItem('dw-theme') || 'light';
    }

    init() {
        this.applyTheme(this.current, false);
        this.buildThemesPanel();
        this.buildExportPanel();
        this.bindHeaderButtons();
    }

    applyTheme(id, save = true) {
        document.documentElement.setAttribute('data-theme', id);
        this.current = id;
        if (save) localStorage.setItem('dw-theme', id);
        // Update active card
        document.querySelectorAll('.theme-card').forEach(c => {
            c.classList.toggle('active', c.dataset.theme === id);
        });
    }

    buildThemesPanel() {
        if (document.getElementById('themesPanel')) return;
        const overlay = document.createElement('div');
        overlay.className = 'panel-overlay';
        overlay.id = 'panelOverlay';
        overlay.addEventListener('click', () => this.closePanels());
        document.body.appendChild(overlay);

        const panel = document.createElement('div');
        panel.className = 'themes-panel';
        panel.id = 'themesPanel';
        panel.innerHTML = `
<div class="themes-panel-header">
  <h3>🎨 Themes</h3>
  <button class="themes-panel-close" id="closeThemesPanel">&times;</button>
</div>
<div class="themes-panel-body">
  <div class="themes-section-title">Writing Themes</div>
  <div class="themes-grid">
    ${this.themes.map(t => `
    <div class="theme-card ${t.id === this.current ? 'active' : ''}" data-theme="${t.id}">
      <div class="theme-preview t-${t.id}">
        <div class="theme-preview-bar"></div>
        <div class="theme-preview-bar"></div>
        <div class="theme-preview-bar"></div>
      </div>
      <div class="theme-label t-${t.id}">${t.emoji} ${t.label}</div>
    </div>`).join('')}
  </div>
  <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-light);">
    <div class="themes-section-title">Typography</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
      <button class="export-btn-item" onclick="document.getElementById('fontFamily').value='Georgia';document.getElementById('fontFamily').dispatchEvent(new Event('change'))">
        <div class="export-btn-icon" style="background:#f0f4ff;font-size:1rem;">Ge</div>
        <div class="export-btn-info"><span class="export-btn-name" style="font-family:Georgia">Georgia</span><span class="export-btn-desc">Classic serif — great for novels</span></div>
      </button>
      <button class="export-btn-item" onclick="document.getElementById('fontFamily').value='Merriweather';document.getElementById('fontFamily').dispatchEvent(new Event('change'))">
        <div class="export-btn-icon" style="background:#f0fff4;font-size:1rem;">Me</div>
        <div class="export-btn-info"><span class="export-btn-name" style="font-family:Merriweather">Merriweather</span><span class="export-btn-desc">Readable serif — academic writing</span></div>
      </button>
      <button class="export-btn-item" onclick="document.getElementById('fontFamily').value='Playfair Display';document.getElementById('fontFamily').dispatchEvent(new Event('change'))">
        <div class="export-btn-icon" style="background:#fff0f4;font-size:1rem;">Pl</div>
        <div class="export-btn-info"><span class="export-btn-name" style="font-family:'Playfair Display'">Playfair</span><span class="export-btn-desc">Elegant — literary fiction</span></div>
      </button>
      <button class="export-btn-item" onclick="document.getElementById('fontFamily').value='Inter';document.getElementById('fontFamily').dispatchEvent(new Event('change'))">
        <div class="export-btn-icon" style="background:#f5f0ff;font-size:1rem;">In</div>
        <div class="export-btn-info"><span class="export-btn-name" style="font-family:Inter">Inter</span><span class="export-btn-desc">Modern sans — business/tech docs</span></div>
      </button>
    </div>
  </div>
</div>`;
        document.body.appendChild(panel);

        document.getElementById('closeThemesPanel').addEventListener('click', () => this.closePanels());
        panel.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => this.applyTheme(card.dataset.theme));
        });
    }

    buildExportPanel() {
        if (document.getElementById('exportPanel')) return;
        const panel = document.createElement('div');
        panel.className = 'export-panel';
        panel.id = 'exportPanel';
        panel.innerHTML = `
<div class="export-panel-header">
  <h3>📤 Export Document</h3>
  <button class="themes-panel-close" id="closeExportPanel">&times;</button>
</div>
<div class="export-panel-body">
  <div class="export-meta-form">
    <label>Author Name</label>
    <input id="epubAuthor" placeholder="Your name" value="">
    <label>Language Code</label>
    <input id="epubLang" placeholder="en" value="en" style="margin-bottom:0">
  </div>

  <div class="export-group">
    <div class="export-group-label">Amazon KDP</div>
    <div class="export-btn-row">
      <button class="export-btn-item" id="expKdpPrint">
        <div class="export-btn-icon" style="background:#fff3e0;">📚</div>
        <div class="export-btn-info">
          <span class="export-btn-name">KDP Print PDF</span>
          <span class="export-btn-desc">Print-ready — correct margins &amp; page size</span>
        </div>
        <span class="export-btn-badge badge-kdp">KDP</span>
      </button>
      <button class="export-btn-item" id="expKdpEbook">
        <div class="export-btn-icon" style="background:#ede7f6;">📱</div>
        <div class="export-btn-info">
          <span class="export-btn-name">KDP eBook (EPUB)</span>
          <span class="export-btn-desc">EPUB 3 for Kindle / KDP upload</span>
        </div>
        <span class="export-btn-badge badge-kdp">KDP</span>
      </button>
    </div>
  </div>

  <div class="export-group">
    <div class="export-group-label">Gumroad / Etsy</div>
    <div class="export-btn-row">
      <button class="export-btn-item" id="expGumroad">
        <div class="export-btn-icon" style="background:#fce4ec;">🛍️</div>
        <div class="export-btn-info">
          <span class="export-btn-name">Gumroad PDF</span>
          <span class="export-btn-desc">US Letter 8.5×11" — ready to sell</span>
        </div>
        <span class="export-btn-badge badge-gumroad">SELL</span>
      </button>
      <button class="export-btn-item" id="expEpub">
        <div class="export-btn-icon" style="background:#e8f5e9;">📖</div>
        <div class="export-btn-info">
          <span class="export-btn-name">EPUB 3</span>
          <span class="export-btn-desc">Universal eBook — Apple Books, Kobo, etc.</span>
        </div>
        <span class="export-btn-badge badge-ebook">ePub</span>
      </button>
    </div>
  </div>

  <div class="export-group">
    <div class="export-group-label">International / Print</div>
    <div class="export-btn-row">
      <button class="export-btn-item" id="expA4">
        <div class="export-btn-icon" style="background:#e3f2fd;">🌍</div>
        <div class="export-btn-info">
          <span class="export-btn-name">A4 PDF</span>
          <span class="export-btn-desc">210×297mm — Europe / Asia standard</span>
        </div>
        <span class="export-btn-badge badge-intl">A4</span>
      </button>
      <button class="export-btn-item" id="expA5">
        <div class="export-btn-icon" style="background:#e0f7fa;">📓</div>
        <div class="export-btn-info">
          <span class="export-btn-name">A5 PDF</span>
          <span class="export-btn-desc">148×210mm — pocket books / IngramSpark</span>
        </div>
        <span class="export-btn-badge badge-intl">A5</span>
      </button>
      <button class="export-btn-item" id="expB5">
        <div class="export-btn-icon" style="background:#f3e5f5;">📘</div>
        <div class="export-btn-info">
          <span class="export-btn-name">B5 PDF</span>
          <span class="export-btn-desc">176×250mm — Japanese / Korean standard</span>
        </div>
        <span class="export-btn-badge badge-intl">B5</span>
      </button>
      <button class="export-btn-item" id="expODT">
        <div class="export-btn-icon" style="background:#e8eaf6;">📝</div>
        <div class="export-btn-info">
          <span class="export-btn-name">ODT (OpenDocument)</span>
          <span class="export-btn-desc">LibreOffice / OpenOffice compatible</span>
        </div>
        <span class="export-btn-badge badge-intl">ODT</span>
      </button>
    </div>
  </div>

  <div class="export-group">
    <div class="export-group-label">Developer / Writer Formats</div>
    <div class="export-btn-row">
      <button class="export-btn-item" id="expMarkdown">
        <div class="export-btn-icon" style="background:#f0f0f0;">Md</div>
        <div class="export-btn-info">
          <span class="export-btn-name">Markdown (.md)</span>
          <span class="export-btn-desc">GitHub, Obsidian, Notion-compatible</span>
        </div>
        <span class="export-btn-badge badge-print">MD</span>
      </button>
      <button class="export-btn-item" data-export="docx">
        <div class="export-btn-icon" style="background:#e8f0fe;">W</div>
        <div class="export-btn-info">
          <span class="export-btn-name">DOCX (Word)</span>
          <span class="export-btn-desc">Microsoft Word compatible</span>
        </div>
        <span class="export-btn-badge badge-print">DOC</span>
      </button>
      <button class="export-btn-item" data-export="rtf">
        <div class="export-btn-icon" style="background:#fafafa;">Rt</div>
        <div class="export-btn-info">
          <span class="export-btn-name">RTF (Rich Text)</span>
          <span class="export-btn-desc">Cross-platform rich text</span>
        </div>
        <span class="export-btn-badge badge-print">RTF</span>
      </button>
    </div>
  </div>
</div>`;
        document.body.appendChild(panel);

        document.getElementById('closeExportPanel').addEventListener('click', () => this.closePanels());

        // Pro exports
        document.getElementById('expKdpPrint').addEventListener('click', () => window.proExporter.exportKDPPrint());
        document.getElementById('expKdpEbook').addEventListener('click', () => window.proExporter.exportKDPEbook());
        document.getElementById('expGumroad').addEventListener('click', () => window.proExporter.exportGumroad());
        document.getElementById('expEpub').addEventListener('click', () => window.proExporter.exportEPUB());
        document.getElementById('expA4').addEventListener('click', () => window.proExporter.exportInternationalPDF('a4'));
        document.getElementById('expA5').addEventListener('click', () => window.proExporter.exportInternationalPDF('a5'));
        document.getElementById('expB5').addEventListener('click', () => window.proExporter.exportInternationalPDF('b5'));
        document.getElementById('expODT').addEventListener('click', () => window.proExporter.exportODT());
        document.getElementById('expMarkdown').addEventListener('click', () => window.proExporter.exportMarkdown());

        // Legacy exports
        panel.querySelectorAll('[data-export]').forEach(btn => {
            btn.addEventListener('click', () => {
                const fmt = btn.dataset.export;
                window.dispatchEvent(new CustomEvent('export-document', { detail: { format: fmt } }));
            });
        });
    }

    bindHeaderButtons() {
        document.getElementById('themesBtn')?.addEventListener('click', () => this.openThemesPanel());
        document.getElementById('exportPanelBtn')?.addEventListener('click', () => this.openExportPanel());
    }

    openThemesPanel() {
        document.getElementById('exportPanel')?.classList.remove('open');
        document.getElementById('themesPanel')?.classList.add('open');
        document.getElementById('panelOverlay')?.classList.add('active');
    }

    openExportPanel() {
        document.getElementById('themesPanel')?.classList.remove('open');
        document.getElementById('exportPanel')?.classList.add('open');
        document.getElementById('panelOverlay')?.classList.add('active');
    }

    closePanels() {
        document.getElementById('themesPanel')?.classList.remove('open');
        document.getElementById('exportPanel')?.classList.remove('open');
        document.getElementById('panelOverlay')?.classList.remove('active');
    }
}

window.themeManager = new ThemeManager();
