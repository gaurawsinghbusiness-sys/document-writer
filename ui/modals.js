/**
 * Pro Book Editor - Modals Module
 * Modal dialogs and overlays
 */

const Modals = {
    activeModal: null,

    init() {
        this.setupTemplateModal();
        this.setupExportModal();
        this.setupKeyboardHandler();
    },

    // Create modal container
    create(options) {
        const { id, title, content, width = '500px', onClose } = options;

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = id;
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.2s;
        `;

        // Modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            background: var(--panel);
            border-radius: 12px;
            width: ${width};
            max-width: 90vw;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            transform: translateY(20px);
            transition: transform 0.2s;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        header.innerHTML = `
            <h3 style="font-size:1.1rem;font-weight:600">${title}</h3>
            <button class="modal-close" style="
                width:32px;height:32px;border:none;background:transparent;
                cursor:pointer;font-size:1.5rem;color:var(--text-muted);
                border-radius:6px;
            ">&times;</button>
        `;

        // Body
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.style.cssText = `
            padding: 20px;
            overflow-y: auto;
            max-height: calc(80vh - 120px);
        `;
        body.innerHTML = content;

        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);

        // Close handlers
        const close = () => {
            overlay.style.opacity = '0';
            modal.style.transform = 'translateY(20px)';
            setTimeout(() => {
                overlay.remove();
                this.activeModal = null;
                onClose?.();
            }, 200);
        };

        header.querySelector('.modal-close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        document.body.appendChild(overlay);
        this.activeModal = overlay;

        // Animate in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0)';
        });

        return { overlay, modal, body, close };
    },

    // Template selection modal
    setupTemplateModal() {
        const newBtn = document.getElementById('newDocBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.showTemplateModal());
        }
    },

    showTemplateModal() {
        const templates = this.getAllTemplates();
        const categories = [...new Set(templates.map(t => t.category))];

        let content = '<div style="display:grid;gap:12px">';
        
        categories.forEach(category => {
            content += `<h4 style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;margin-top:8px">${category}</h4>`;
            content += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">';
            
            templates.filter(t => t.category === category).forEach(template => {
                content += `
                    <button class="template-btn" data-template="${template.id}" style="
                        padding:16px 12px;
                        border:1px solid var(--border);
                        background:var(--panel);
                        border-radius:8px;
                        cursor:pointer;
                        text-align:center;
                        transition:all 0.15s;
                    ">
                        <span style="font-size:2rem;display:block;margin-bottom:8px">${template.icon}</span>
                        <span style="font-size:0.85rem;font-weight:500">${template.name}</span>
                    </button>
                `;
            });
            
            content += '</div>';
        });
        
        content += '</div>';

        const { body, close } = this.create({
            id: 'template-modal',
            title: 'Choose Template',
            content,
            width: '600px'
        });

        body.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.borderColor = 'var(--accent)';
                btn.style.background = 'var(--bg)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.borderColor = 'var(--border)';
                btn.style.background = 'var(--panel)';
            });
            btn.addEventListener('click', () => {
                const templateId = btn.dataset.template;
                this.applyTemplate(templateId);
                close();
            });
        });
    },

    getAllTemplates() {
        // Combine all template files
        return [
            // Fiction
            { id: 'novel', name: 'Novel', icon: '📖', category: 'Fiction' },
            { id: 'short-story', name: 'Short Story', icon: '📝', category: 'Fiction' },
            { id: 'romance', name: 'Romance', icon: '💕', category: 'Fiction' },
            { id: 'thriller', name: 'Thriller', icon: '🔍', category: 'Fiction' },
            { id: 'fantasy', name: 'Fantasy', icon: '🐉', category: 'Fiction' },
            { id: 'childrens', name: "Children's", icon: '🧸', category: 'Fiction' },
            
            // Non-Fiction
            { id: 'report', name: 'Report Writing', icon: '📊', category: 'Non-Fiction' },
            { id: 'learning', name: 'Learning Doc', icon: '📚', category: 'Non-Fiction' },
            { id: 'textbook', name: 'Textbook', icon: '📖', category: 'Non-Fiction' },
            { id: 'memoir', name: 'Memoir', icon: '📝', category: 'Non-Fiction' },
            { id: 'self-help', name: 'Self-Help', icon: '💡', category: 'Non-Fiction' },
            { id: 'business', name: 'Business', icon: '💼', category: 'Non-Fiction' },
            
            // Special
            { id: 'classic', name: 'Classic Style', icon: '📜', category: 'Special' },
            { id: 'handwritten-journal', name: 'Journal', icon: '✍️', category: 'Handwritten' },
            { id: 'handwritten-letter', name: 'Letter', icon: '💌', category: 'Handwritten' },
            { id: 'handwritten-notes', name: 'Notes', icon: '📓', category: 'Handwritten' },
            { id: 'screenplay', name: 'Screenplay', icon: '🎬', category: 'Special' },
            { id: 'blank', name: 'Blank', icon: '📄', category: 'Other' }
        ];
    },

    applyTemplate(templateId) {
        // Template styles mapping
        const templateStyles = {
            'novel': { font: 'Crimson Pro', size: 12, lineHeight: 1.8, pageSize: '6x9' },
            'short-story': { font: 'Merriweather', size: 12, lineHeight: 1.6, pageSize: '5.5x8.5' },
            'romance': { font: 'Lora', size: 12, lineHeight: 1.8, pageSize: '5x8' },
            'thriller': { font: 'Georgia', size: 11, lineHeight: 1.6, pageSize: '6x9' },
            'fantasy': { font: 'EB Garamond', size: 12, lineHeight: 1.7, pageSize: '6x9' },
            'childrens': { font: 'Comic Sans MS', size: 16, lineHeight: 2, pageSize: '8.5x11' },
            'report': { font: 'Inter', size: 11, lineHeight: 1.5, pageSize: '8.5x11' },
            'learning': { font: 'Open Sans', size: 11, lineHeight: 1.6, pageSize: 'a4' },
            'textbook': { font: 'Source Sans 3', size: 11, lineHeight: 1.5, pageSize: '7x10' },
            'memoir': { font: 'Merriweather', size: 12, lineHeight: 1.8, pageSize: '6x9' },
            'self-help': { font: 'Lato', size: 11, lineHeight: 1.6, pageSize: '6x9' },
            'business': { font: 'Inter', size: 11, lineHeight: 1.5, pageSize: '8.5x11' },
            'classic': { font: 'Playfair Display', size: 12, lineHeight: 1.7, pageSize: '6x9' },
            'handwritten-journal': { font: 'Caveat', size: 18, lineHeight: 2, pageSize: '5.5x8.5' },
            'handwritten-letter': { font: 'Dancing Script', size: 16, lineHeight: 1.8, pageSize: '8.5x11' },
            'handwritten-notes': { font: 'Indie Flower', size: 16, lineHeight: 2, pageSize: 'a5' },
            'screenplay': { font: 'Courier New', size: 12, lineHeight: 1.5, pageSize: '8.5x11' },
            'blank': { font: 'Crimson Pro', size: 12, lineHeight: 1.6, pageSize: '8.5x11' }
        };

        const style = templateStyles[templateId] || templateStyles['blank'];

        // Apply styles
        AppState.document.template = templateId;
        AppState.settings.font.family = style.font;
        AppState.settings.font.size = style.size;
        AppState.settings.font.lineHeight = style.lineHeight;
        AppState.settings.pageSize = style.pageSize;

        // Update UI
        Editor.applyStyles();
        Panels.applyPageSize();
        
        // Update selects
        const fontSelect = document.getElementById('fontFamily');
        const sizeSelect = document.getElementById('fontSize');
        const lineSelect = document.getElementById('lineHeight');
        const pageSelect = document.getElementById('pageSize');
        
        if (fontSelect) fontSelect.value = style.font;
        if (sizeSelect) sizeSelect.value = style.size;
        if (lineSelect) lineSelect.value = style.lineHeight;
        if (pageSelect) pageSelect.value = style.pageSize;

        AppState.save();
    },

    // Export modal
    setupExportModal() {
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.showExportModal());
        }
    },

    showExportModal() {
        const content = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <button class="export-option" data-format="docx" style="
                    padding:20px;border:1px solid var(--border);background:var(--panel);
                    border-radius:8px;cursor:pointer;text-align:center;
                ">
                    <span style="font-size:2rem;display:block;margin-bottom:8px">📄</span>
                    <strong>DOCX</strong>
                    <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">Microsoft Word</p>
                </button>
                <button class="export-option" data-format="pdf" style="
                    padding:20px;border:1px solid var(--border);background:var(--panel);
                    border-radius:8px;cursor:pointer;text-align:center;
                ">
                    <span style="font-size:2rem;display:block;margin-bottom:8px">📕</span>
                    <strong>PDF</strong>
                    <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">Print-ready</p>
                </button>
                <button class="export-option" data-format="epub" style="
                    padding:20px;border:1px solid var(--border);background:var(--panel);
                    border-radius:8px;cursor:pointer;text-align:center;
                ">
                    <span style="font-size:2rem;display:block;margin-bottom:8px">📱</span>
                    <strong>EPUB</strong>
                    <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">E-readers</p>
                </button>
                <button class="export-option" data-format="txt" style="
                    padding:20px;border:1px solid var(--border);background:var(--panel);
                    border-radius:8px;cursor:pointer;text-align:center;
                ">
                    <span style="font-size:2rem;display:block;margin-bottom:8px">📝</span>
                    <strong>TXT</strong>
                    <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">Plain text</p>
                </button>
            </div>
        `;

        const { body, close } = this.create({
            id: 'export-modal',
            title: 'Export Document',
            content,
            width: '400px'
        });

        body.querySelectorAll('.export-option').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.borderColor = 'var(--accent)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.borderColor = 'var(--border)';
            });
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                Export[format]?.();
                close();
            });
        });
    },

    // Keyboard handler
    setupKeyboardHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.activeModal.querySelector('.modal-close')?.click();
            }
        });
    },

    // Close all modals
    closeAll() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
        this.activeModal = null;
    }
};

window.Modals = Modals;
