/**
 * Pro Book Editor - State Management
 * Centralized state for the entire application
 */

const AppState = {
    // Document data
    document: {
        title: 'Untitled Book',
        author: 'Author Name',
        pages: [{ id: 1, content: '', type: 'chapter' }],
        currentPage: 0,
        template: 'novel',
        createdAt: null,
        updatedAt: null
    },

    // Editor settings
    settings: {
        theme: 'light',
        pageSize: '6x9',
        margins: { top: 1, bottom: 1, left: 0.75, right: 0.5 },
        font: {
            family: 'Crimson Pro',
            size: 12,
            lineHeight: 1.5
        },
        zoom: 100,
        wordGoal: 1000
    },

    // Runtime state
    runtime: {
        isDirty: false,
        lastSaved: null,
        wordCount: 0,
        charCount: 0,
        chapterNum: 1
    },

    // Initialize state
    init() {
        this.load();
        this.document.createdAt = this.document.createdAt || new Date().toISOString();
        return this;
    },

    // Get current page
    getCurrentPage() {
        return this.document.pages[this.document.currentPage];
    },

    // Update current page content
    updateCurrentPage(content) {
        this.document.pages[this.document.currentPage].content = content;
        this.runtime.isDirty = true;
        this.document.updatedAt = new Date().toISOString();
    },

    // Add new page
    addPage(type = 'chapter') {
        const newPage = {
            id: Date.now(),
            content: '',
            type: type
        };
        this.document.pages.push(newPage);
        this.document.currentPage = this.document.pages.length - 1;
        this.runtime.isDirty = true;
        return newPage;
    },

    // Switch page
    switchPage(index) {
        if (index >= 0 && index < this.document.pages.length) {
            this.document.currentPage = index;
            return this.getCurrentPage();
        }
        return null;
    },

    // Delete page
    deletePage(index) {
        if (this.document.pages.length > 1) {
            this.document.pages.splice(index, 1);
            if (this.document.currentPage >= this.document.pages.length) {
                this.document.currentPage = this.document.pages.length - 1;
            }
            this.runtime.isDirty = true;
        }
    },

    // Apply template
    applyTemplate(template) {
        this.document.template = template.id;
        this.settings.font.family = template.styles.fontFamily;
        this.settings.font.size = template.styles.fontSize;
        this.settings.font.lineHeight = template.styles.lineHeight;
        this.settings.pageSize = template.styles.pageSize || '6x9';
        this.runtime.isDirty = true;
    },

    // Save to localStorage
    save() {
        const data = {
            document: this.document,
            settings: this.settings,
            runtime: {
                chapterNum: this.runtime.chapterNum
            }
        };
        localStorage.setItem('proeditor-state', JSON.stringify(data));
        this.runtime.isDirty = false;
        this.runtime.lastSaved = new Date();
    },

    // Load from localStorage
    load() {
        const saved = localStorage.getItem('proeditor-state');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.assign(this.document, data.document || {});
                Object.assign(this.settings, data.settings || {});
                if (data.runtime) {
                    this.runtime.chapterNum = data.runtime.chapterNum || 1;
                }
            } catch (e) {
                console.warn('Failed to load saved state');
            }
        }

        // Apply theme
        if (this.settings.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    },

    // Reset to defaults
    reset() {
        localStorage.removeItem('proeditor-state');
        location.reload();
    },

    // Export state for debugging
    export() {
        return JSON.stringify({ document: this.document, settings: this.settings }, null, 2);
    }
};

// Make globally available
window.AppState = AppState;
