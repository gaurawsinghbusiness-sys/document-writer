/**
 * Document Writer - Main Application
 * Initializes and coordinates all modules
 */

class DocumentWriterApp {
    constructor() {
        this.isInitialized = false;
        this.currentDocument = null;
    }

    async init() {
        try {
            // Initialize storage first
            await window.documentStorage.init();
            
            // Initialize all modules
            window.documentEditor.init();
            window.toolbar.init();
            window.chapterManager.init();
            window.documentExporter.init();

            // Initialize themes & export panel
            if (window.themeManager) window.themeManager.init();

            // Initialize Writer Mode (write vs preview toggle)
            if (window.writerMode) window.writerMode.init();

            // Initialize Page System (margins, pg numbers, ruler)
            if (window.pageSystem) {
                window.pageSystem.init();
                window.pageSystem.injectMarginGuides();
            }

            // Initialize Live Stats Bar
            if (window.statsManager) window.statsManager.init();

            // Phase 2: Image manager (clipboard paste, drag resize, caption)
            if (window.imageManager) window.imageManager.init();

            // Phase 3: Export presets, Zen mode, Notes panel
            if (window.exportPresets) window.exportPresets.init();
            if (window.zenMode) window.zenMode.init();
            if (window.notesPanel) window.notesPanel.init();

            // Phase 4: Version snapshots
            if (window.snapshots) window.snapshots.init();

            // Initialize WOW features (typewriter, slash commands, sounds)
            if (window.WowFeatures) window.WowFeatures.init();
            
            // Setup app-level event listeners
            this.setupEventListeners();
            
            // Setup theme toggle
            this.setupThemeToggle();
            
            // Setup zoom controls
            this.setupZoomControls();
            
            // Check for saved document or show template modal
            await this.checkForSavedDocument();
            
            this.isInitialized = true;
            console.log('Document Writer initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            window.toolbar?.showToast('Failed to initialize. Please refresh.', 'error');
        }
    }

    setupEventListeners() {
        // Save button
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveDocument());
        
        // Open button
        document.getElementById('openBtn')?.addEventListener('click', () => this.openDocument());
        
        // Document title change
        document.getElementById('documentTitle')?.addEventListener('change', () => {
            this.updateSaveStatus('saving');
            this.saveDocument();
        });
        
        // Auto-save event
        window.addEventListener('auto-save', () => this.saveDocument(true));
        
        // Save shortcut event
        window.addEventListener('save-document', () => this.saveDocument());
        
        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
        
        // Template modal close
        document.getElementById('closeTemplateModal')?.addEventListener('click', () => {
            document.getElementById('templateModal')?.classList.remove('open');
        });
        
        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const template = card.dataset.template;
                this.applyTemplate(template);
                document.getElementById('templateModal')?.classList.remove('open');
            });
        });
    }

    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        toggle?.addEventListener('click', () => {
            // Quick toggle: if on a dark variant stay light, otherwise go dark
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const darkThemes = ['dark', 'forest', 'ocean', 'midnight', 'sunset', 'focus'];
            const next = darkThemes.includes(current) ? 'light' : 'dark';
            if (window.themeManager) {
                window.themeManager.applyTheme(next);
            } else {
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('documentwriter-theme', next);
            }
        });
    }

    setupZoomControls() {
        document.getElementById('zoomIn')?.addEventListener('click', () => {
            window.documentEditor.zoomIn();
        });
        
        document.getElementById('zoomOut')?.addEventListener('click', () => {
            window.documentEditor.zoomOut();
        });
    }

    async checkForSavedDocument() {
        try {
            const docs = await window.documentStorage.getAllDocuments();
            
            if (docs.length > 0) {
                // Load most recent document
                const recent = docs[0];
                await this.loadDocument(recent.id);
            } else {
                // Show template modal for new users
                document.getElementById('templateModal')?.classList.add('open');
            }
        } catch (error) {
            console.log('Starting with new document');
        }
    }

    async saveDocument(isAutoSave = false) {
        try {
            this.updateSaveStatus('saving');
            
            const data = {
                title: document.getElementById('documentTitle')?.value || 'Untitled Document',
                content: window.documentEditor.getContent(),
                chapters: window.chapterManager.getChapters(),
                settings: {
                    fontFamily: document.getElementById('fontFamily')?.value,
                    fontSize: document.getElementById('fontSize')?.value,
                    lineHeight: document.getElementById('lineHeight')?.value
                }
            };
            
            await window.documentStorage.saveDocument(data);
            this.updateSaveStatus('saved');
            
            if (!isAutoSave) {
                window.toolbar?.showToast('Document saved!', 'success');
            }
            
        } catch (error) {
            console.error('Failed to save:', error);
            this.updateSaveStatus('error');
            window.toolbar?.showToast('Failed to save document', 'error');
        }
    }

    async loadDocument(id) {
        try {
            const doc = await window.documentStorage.loadDocument(id);
            
            document.getElementById('documentTitle').value = doc.title;
            window.chapterManager.setChapters(doc.chapters);
            
            if (doc.settings) {
                if (doc.settings.fontFamily) {
                    document.getElementById('fontFamily').value = doc.settings.fontFamily;
                }
                if (doc.settings.fontSize) {
                    document.getElementById('fontSize').value = doc.settings.fontSize;
                }
                if (doc.settings.lineHeight) {
                    document.getElementById('lineHeight').value = doc.settings.lineHeight;
                }
            }
            
            this.currentDocument = doc;
            this.updateSaveStatus('saved');
            
        } catch (error) {
            console.error('Failed to load document:', error);
        }
    }

    async openDocument() {
        // Create file input for opening local files
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.html,.txt';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                if (file.name.endsWith('.json')) {
                    const doc = await window.documentStorage.importFromJSON(file);
                    await this.loadDocument(doc.id);
                    window.toolbar?.showToast('Document loaded!', 'success');
                } else {
                    const text = await file.text();
                    window.documentEditor.setContent(text);
                    document.getElementById('documentTitle').value = file.name.replace(/\.[^/.]+$/, '');
                    window.toolbar?.showToast('File imported!', 'success');
                }
            } catch (error) {
                window.toolbar?.showToast('Failed to open file', 'error');
            }
        };
        
        input.click();
    }

    applyTemplate(template) {
        let content = '';
        let title = 'Untitled Document';
        
        switch (template) {
            case 'novel':
                title = 'My Novel';
                content = '<h1 style="text-align: center; margin-top: 3in;">My Novel</h1><p style="text-align: center;"><em>by Author Name</em></p><div class="page-break"></div><h2>Chapter One</h2><p>It was a dark and stormy night...</p>';
                break;
                
            case 'academic':
                title = 'Research Paper';
                content = '<h1 style="text-align: center;">Research Paper Title</h1><p style="text-align: center;">Author Name<br>Institution</p><h2>Abstract</h2><p>Brief summary of the research...</p><h2>Introduction</h2><p>Background and context...</p>';
                break;
                
            case 'report':
                title = 'Business Report';
                content = '<h1>Business Report</h1><p><strong>Date:</strong> ' + new Date().toLocaleDateString() + '</p><p><strong>Prepared by:</strong> Your Name</p><h2>Executive Summary</h2><p>Key findings and recommendations...</p><h2>Analysis</h2><p>Detailed analysis...</p>';
                break;
                
            default:
                title = 'Untitled Document';
                content = '<p><br></p>';
        }
        
        document.getElementById('documentTitle').value = title;
        
        // Reset chapters
        window.chapterManager.setChapters([{
            id: 1,
            title: 'Chapter 1',
            content: content
        }]);
        
        // Create new document
        window.documentStorage.newDocument();
        this.saveDocument();
    }

    updateSaveStatus(status) {
        const el = document.getElementById('saveStatus');
        if (!el) return;
        
        el.classList.remove('saving', 'saved', 'error');
        
        switch (status) {
            case 'saving':
                el.textContent = 'Saving...';
                el.classList.add('saving');
                break;
            case 'saved':
                el.textContent = 'All changes saved';
                el.classList.add('saved');
                break;
            case 'error':
                el.textContent = 'Save failed';
                el.classList.add('error');
                break;
        }
    }

    hasUnsavedChanges() {
        // Simple check - could be enhanced
        return false;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DocumentWriterApp();
    window.app.init();
});
