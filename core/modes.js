/**
 * Pro Book Editor - Writing Modes
 * Different writing experiences: General, Structured, Focus
 */

const WritingModes = {
    // Current mode state
    currentMode: 'general', // 'general' | 'structured'
    focusTunnel: false,
    styleLocked: false,

    // Writing presets (style modes)
    presets: {
        'classic': {
            id: 'classic',
            name: 'Classic Book',
            icon: '📖',
            description: 'Elegant serif typography for novels',
            styles: {
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: 12,
                lineHeight: 1.8,
                textAlign: 'justify',
                indent: true,
                paragraphSpacing: 0,
                pageTexture: 'cream'
            }
        },
        'modern': {
            id: 'modern',
            name: 'Modern Clean',
            icon: '✨',
            description: 'Clean sans-serif for contemporary writing',
            styles: {
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 11,
                lineHeight: 1.6,
                textAlign: 'left',
                indent: false,
                paragraphSpacing: 16,
                pageTexture: 'white'
            }
        },
        'handwritten': {
            id: 'handwritten',
            name: 'Handwritten Journal',
            icon: '✍️',
            description: 'Personal journal with handwritten feel',
            styles: {
                fontFamily: "'Caveat', cursive",
                fontSize: 18,
                lineHeight: 2,
                textAlign: 'left',
                indent: false,
                paragraphSpacing: 12,
                pageTexture: 'lined'
            }
        },
        'learning': {
            id: 'learning',
            name: 'Learning & Study',
            icon: '📚',
            description: 'Clear format for educational content',
            styles: {
                fontFamily: "'Open Sans', sans-serif",
                fontSize: 11,
                lineHeight: 1.6,
                textAlign: 'left',
                indent: false,
                paragraphSpacing: 16,
                pageTexture: 'white'
            }
        },
        'screenplay': {
            id: 'screenplay',
            name: 'Screenplay',
            icon: '🎬',
            description: 'Standard screenplay format',
            styles: {
                fontFamily: "'Courier New', monospace",
                fontSize: 12,
                lineHeight: 1.5,
                textAlign: 'left',
                indent: false,
                paragraphSpacing: 0,
                pageTexture: 'white'
            }
        }
    },

    currentPreset: 'classic',

    init() {
        this.setupModeToggle();
        this.setupFocusTunnel();
        this.setupStyleLock();
        this.setupPresetSelector();
        this.loadSavedMode();
    },

    // Toggle between General and Structured mode
    setupModeToggle() {
        const toggle = document.getElementById('modeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleMode());
        }
    },

    toggleMode() {
        this.currentMode = this.currentMode === 'general' ? 'structured' : 'general';
        this.applyMode();
        this.saveMode();
    },

    setMode(mode) {
        this.currentMode = mode;
        this.applyMode();
        this.saveMode();
    },

    applyMode() {
        const container = document.getElementById('editorContainer');
        const toggle = document.getElementById('modeToggle');
        const modeLabel = document.getElementById('modeLabel');
        
        if (container) {
            container.classList.toggle('structured-mode', this.currentMode === 'structured');
            container.classList.toggle('general-mode', this.currentMode === 'general');
        }

        if (toggle) {
            toggle.classList.toggle('active', this.currentMode === 'structured');
        }

        if (modeLabel) {
            modeLabel.textContent = this.currentMode === 'general' 
                ? '📝 General Mode' 
                : '📐 Structured Mode';
        }

        // Dispatch mode change event
        document.dispatchEvent(new CustomEvent('modeChange', { 
            detail: { mode: this.currentMode } 
        }));
    },

    // Focus Tunnel Mode
    setupFocusTunnel() {
        const toggle = document.getElementById('focusToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleFocusTunnel());
        }
    },

    toggleFocusTunnel() {
        this.focusTunnel = !this.focusTunnel;
        this.applyFocusTunnel();
    },

    applyFocusTunnel() {
        const container = document.getElementById('editorContainer');
        const toggle = document.getElementById('focusToggle');
        
        if (container) {
            container.classList.toggle('focus-tunnel', this.focusTunnel);
        }

        if (toggle) {
            toggle.classList.toggle('active', this.focusTunnel);
            toggle.title = this.focusTunnel ? 'Exit Focus Mode' : 'Enter Focus Mode';
        }
    },

    // Style Lock
    setupStyleLock() {
        const toggle = document.getElementById('styleLockToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleStyleLock());
        }
    },

    toggleStyleLock() {
        this.styleLocked = !this.styleLocked;
        this.applyStyleLock();
    },

    applyStyleLock() {
        const toggle = document.getElementById('styleLockToggle');
        const toolbar = document.querySelector('.toolbar');
        
        if (toolbar) {
            toolbar.classList.toggle('styles-locked', this.styleLocked);
        }

        if (toggle) {
            toggle.classList.toggle('active', this.styleLocked);
            toggle.innerHTML = this.styleLocked ? '🔒 Locked' : '🔓 Lock Styles';
        }

        // Disable style controls when locked
        if (this.styleLocked) {
            document.querySelectorAll('.tool-select, .tool-btn').forEach(el => {
                el.disabled = true;
                el.style.opacity = '0.5';
                el.style.pointerEvents = 'none';
            });
        } else {
            document.querySelectorAll('.tool-select, .tool-btn').forEach(el => {
                el.disabled = false;
                el.style.opacity = '';
                el.style.pointerEvents = '';
            });
        }
    },

    // Writing Presets
    setupPresetSelector() {
        const selector = document.getElementById('writingPreset');
        if (selector) {
            // Populate presets
            selector.innerHTML = Object.values(this.presets).map(preset => 
                `<option value="${preset.id}">${preset.icon} ${preset.name}</option>`
            ).join('');

            selector.addEventListener('change', (e) => {
                this.applyPreset(e.target.value);
            });
        }
    },

    applyPreset(presetId) {
        const preset = this.presets[presetId];
        if (!preset || this.styleLocked) return;

        this.currentPreset = presetId;
        const styles = preset.styles;

        // Apply to editor
        const editor = document.getElementById('editor');
        const paper = document.getElementById('paper');
        
        if (editor) {
            editor.style.fontFamily = styles.fontFamily;
            editor.style.fontSize = styles.fontSize + 'pt';
            editor.style.lineHeight = styles.lineHeight;
            editor.style.textAlign = styles.textAlign;
            editor.classList.toggle('has-indent', styles.indent);
        }

        if (paper) {
            paper.dataset.texture = styles.pageTexture;
        }

        // Update state
        if (window.AppState) {
            AppState.settings.font.family = styles.fontFamily;
            AppState.settings.font.size = styles.fontSize;
            AppState.settings.font.lineHeight = styles.lineHeight;
            AppState.save();
        }

        this.saveMode();
    },

    getPreset() {
        return this.presets[this.currentPreset];
    },

    // Persistence
    saveMode() {
        const data = {
            mode: this.currentMode,
            focusTunnel: this.focusTunnel,
            styleLocked: this.styleLocked,
            preset: this.currentPreset
        };
        localStorage.setItem('proeditor-modes', JSON.stringify(data));
    },

    loadSavedMode() {
        const saved = localStorage.getItem('proeditor-modes');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentMode = data.mode || 'general';
                this.focusTunnel = data.focusTunnel || false;
                this.styleLocked = data.styleLocked || false;
                this.currentPreset = data.preset || 'classic';
            } catch (e) {}
        }

        // Apply loaded settings
        this.applyMode();
        this.applyFocusTunnel();
        this.applyPreset(this.currentPreset);
        
        // Set selector value
        const selector = document.getElementById('writingPreset');
        if (selector) {
            selector.value = this.currentPreset;
        }
    }
};

window.WritingModes = WritingModes;
