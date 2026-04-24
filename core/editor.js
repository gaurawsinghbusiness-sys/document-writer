/**
 * Pro Book Editor - Editor Core
 * Main editor functionality
 */

const Editor = {
    element: null,
    paper: null,

    init() {
        this.element = document.getElementById('editor');
        this.paper = document.getElementById('paper');
        
        if (!this.element) return;
        
        this.setupEvents();
        this.loadContent();
        this.applyStyles();
    },

    setupEvents() {
        // Input handling
        this.element.addEventListener('input', () => {
            AppState.updateCurrentPage(this.element.innerHTML);
            this.updateStats();
            this.autoSave();
        });

        // Keyboard shortcuts
        this.element.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b': 
                        e.preventDefault(); 
                        this.format('bold'); 
                        break;
                    case 'i': 
                        e.preventDefault(); 
                        this.format('italic'); 
                        break;
                    case 'u': 
                        e.preventDefault(); 
                        this.format('underline'); 
                        break;
                    case 's': 
                        e.preventDefault(); 
                        this.save(); 
                        break;
                }
            }
        });

        // Focus handling
        this.element.addEventListener('focus', () => {
            this.paper.classList.add('focused');
        });

        this.element.addEventListener('blur', () => {
            this.paper.classList.remove('focused');
        });
    },

    // Apply formatting command
    format(command, value = null) {
        document.execCommand(command, false, value);
        this.element.focus();
    },

    // Set font family
    setFont(fontName) {
        const font = Styles.getAllFonts().find(f => f.name === fontName);
        if (font) {
            this.element.style.fontFamily = font.family;
            AppState.settings.font.family = fontName;
        }
    },

    // Set font size
    setFontSize(size) {
        this.element.style.fontSize = size + 'pt';
        AppState.settings.font.size = size;
    },

    // Set line height
    setLineHeight(height) {
        this.element.style.lineHeight = height;
        AppState.settings.font.lineHeight = height;
    },

    // Set text alignment
    setAlignment(align) {
        this.format('justify' + align.charAt(0).toUpperCase() + align.slice(1));
    },

    // Set heading
    setHeading(level) {
        if (level) {
            this.format('formatBlock', level);
        } else {
            this.format('formatBlock', 'p');
        }
    },

    // Insert content at cursor
    insert(html) {
        this.element.focus();
        document.execCommand('insertHTML', false, html);
    },

    // Insert section template
    insertSection(type) {
        const templates = Sections.getTemplates();
        const template = templates[type];
        if (template) {
            this.insert(template());
            AppState.save();
        }
    },

    // Apply current styles
    applyStyles() {
        const { font } = AppState.settings;
        this.setFont(font.family);
        this.setFontSize(font.size);
        this.setLineHeight(font.lineHeight);
    },

    // Load content from state
    loadContent() {
        const page = AppState.getCurrentPage();
        if (page) {
            this.element.innerHTML = page.content || '';
        }
    },

    // Save content
    saveContent() {
        AppState.updateCurrentPage(this.element.innerHTML);
    },

    // Update statistics
    updateStats() {
        const text = this.element.innerText || '';
        const words = text.trim().split(/\s+/).filter(w => w).length;
        const chars = text.length;

        AppState.runtime.wordCount = words;
        AppState.runtime.charCount = chars;

        // Update UI if elements exist
        const wordEl = document.getElementById('wordCount');
        const charEl = document.getElementById('charCount');
        const readEl = document.getElementById('readTime');
        
        if (wordEl) wordEl.textContent = words;
        if (charEl) charEl.textContent = chars;
        if (readEl) readEl.textContent = Math.ceil(words / 200);

        // Update goal progress
        this.updateGoal(words);
    },

    // Update writing goal
    updateGoal(words) {
        const goal = AppState.settings.wordGoal || 1000;
        const progress = Math.min(100, (words / goal) * 100);

        const progressEl = document.getElementById('goalProgress');
        const currentEl = document.getElementById('goalCurrent');
        const remainingEl = document.getElementById('goalRemaining');

        if (progressEl) progressEl.style.width = progress + '%';
        if (currentEl) currentEl.textContent = words + ' written';
        if (remainingEl) remainingEl.textContent = Math.max(0, goal - words) + ' to go';
    },

    // Auto-save with debounce
    autoSave: (function() {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                AppState.save();
                const statusEl = document.getElementById('saveStatus');
                if (statusEl) statusEl.textContent = '✓ Saved';
            }, 1000);
        };
    })(),

    // Manual save
    save() {
        this.saveContent();
        AppState.save();
        const statusEl = document.getElementById('saveStatus');
        if (statusEl) statusEl.textContent = '✓ Saved';
    },

    // Clear content
    clear() {
        this.element.innerHTML = '';
        this.saveContent();
    },

    // Get plain text
    getText() {
        return this.element.innerText || '';
    },

    // Get HTML content
    getHTML() {
        return this.element.innerHTML || '';
    },

    // Set HTML content
    setHTML(html) {
        this.element.innerHTML = html;
        this.saveContent();
    }
};

window.Editor = Editor;
