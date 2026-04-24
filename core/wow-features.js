/**
 * Pro Book Editor - WOW Features
 * Inspired by iA Writer, Ulysses, Notion, Scrivener
 */

const WowFeatures = {
    // Feature states
    typewriterMode: false,
    soundEnabled: false,
    sessionStart: Date.now(),
    sessionWords: 0,
    
    init() {
        this.setupTypewriterMode();
        this.setupSlashCommands();
        this.setupDragHandles();
        this.setupKeyboardSounds();
        this.setupSessionStats();
        this.setupSmoothCursor();
        this.injectWowStyles();
    },

    // ===== TYPEWRITER MODE =====
    // Keeps cursor vertically centered while typing
    setupTypewriterMode() {
        const toggle = document.getElementById('typewriterToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTypewriter());
        }

        // Listen for typing to scroll
        const editor = document.getElementById('editor') || document.getElementById('editorContainer');
        if (editor) {
            editor.addEventListener('input', () => {
                if (this.typewriterMode) {
                    this.scrollToCursor();
                }
            });
        }
    },

    toggleTypewriter() {
        this.typewriterMode = !this.typewriterMode;
        const toggle = document.getElementById('typewriterToggle');
        const editorScroll = document.getElementById('editorScroll');
        
        if (toggle) {
            toggle.classList.toggle('active', this.typewriterMode);
        }
        
        if (editorScroll) {
            editorScroll.classList.toggle('typewriter-mode', this.typewriterMode);
        }
    },

    scrollToCursor() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorScroll = document.getElementById('editorScroll');
        
        if (editorScroll && rect.top) {
            const scrollTop = editorScroll.scrollTop;
            const containerHeight = editorScroll.clientHeight;
            const cursorOffset = rect.top - editorScroll.getBoundingClientRect().top;
            const targetScroll = scrollTop + cursorOffset - (containerHeight / 2);
            
            editorScroll.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    },

    // ===== SLASH COMMANDS (Notion-style) =====
    setupSlashCommands() {
        const editor = document.getElementById('editor') || document.getElementById('editorContainer');
        if (!editor) return;

        editor.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                // Show slash menu after a tiny delay
                setTimeout(() => this.showSlashMenu(), 10);
            }
        });

        // Hide on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideSlashMenu();
            }
        });
    },

    showSlashMenu() {
        // Remove existing
        this.hideSlashMenu();

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const menu = document.createElement('div');
        menu.className = 'slash-menu';
        menu.id = 'slashMenu';
        menu.innerHTML = `
            <div class="slash-menu-header">Quick Insert</div>
            <div class="slash-menu-items">
                <button class="slash-item" data-action="heading1">
                    <span class="slash-icon">H1</span>
                    <span class="slash-label">Heading 1</span>
                </button>
                <button class="slash-item" data-action="heading2">
                    <span class="slash-icon">H2</span>
                    <span class="slash-label">Heading 2</span>
                </button>
                <button class="slash-item" data-action="quote">
                    <span class="slash-icon">❝</span>
                    <span class="slash-label">Quote</span>
                </button>
                <button class="slash-item" data-action="divider">
                    <span class="slash-icon">—</span>
                    <span class="slash-label">Divider</span>
                </button>
                <button class="slash-item" data-action="note">
                    <span class="slash-icon">📝</span>
                    <span class="slash-label">Note</span>
                </button>
                <button class="slash-item" data-action="chapter">
                    <span class="slash-icon">📖</span>
                    <span class="slash-label">New Chapter</span>
                </button>
            </div>
        `;

        menu.style.position = 'fixed';
        menu.style.left = rect.left + 'px';
        menu.style.top = (rect.bottom + 8) + 'px';
        
        document.body.appendChild(menu);

        // Animate in
        requestAnimationFrame(() => menu.classList.add('visible'));

        // Handle clicks
        menu.querySelectorAll('.slash-item').forEach(item => {
            item.addEventListener('click', () => {
                this.executeSlashCommand(item.dataset.action);
                this.hideSlashMenu();
            });
        });

        // Hide on outside click
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick);
        }, 100);
    },

    handleOutsideClick(e) {
        const menu = document.getElementById('slashMenu');
        if (menu && !menu.contains(e.target)) {
            WowFeatures.hideSlashMenu();
        }
    },

    hideSlashMenu() {
        const menu = document.getElementById('slashMenu');
        if (menu) {
            menu.remove();
        }
        document.removeEventListener('click', this.handleOutsideClick);
    },

    executeSlashCommand(action) {
        // Delete the "/" character first
        document.execCommand('delete');
        
        switch (action) {
            case 'heading1':
                document.execCommand('formatBlock', false, 'h1');
                break;
            case 'heading2':
                document.execCommand('formatBlock', false, 'h2');
                break;
            case 'quote':
                document.execCommand('formatBlock', false, 'blockquote');
                break;
            case 'divider':
                document.execCommand('insertHTML', false, '<hr class="scene-break">');
                break;
            case 'note':
                document.execCommand('insertHTML', false, '<div class="inline-note">Add your note here...</div>');
                break;
            case 'chapter':
                if (window.Sections) {
                    Sections.insert('chapter');
                }
                break;
        }
    },

    // ===== DRAG HANDLES (Notion-style) =====
    setupDragHandles() {
        // Add drag handles to blocks on hover
        document.addEventListener('mouseover', (e) => {
            const block = e.target.closest('.block');
            if (block && !block.querySelector('.drag-handle')) {
                const handle = document.createElement('div');
                handle.className = 'drag-handle';
                handle.innerHTML = '⋮⋮';
                handle.title = 'Drag to move';
                block.prepend(handle);
            }
        });
    },

    // ===== KEYBOARD SOUNDS =====
    setupKeyboardSounds() {
        const toggle = document.getElementById('soundToggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleSound());
        }

        // Create audio context on first interaction
        document.addEventListener('keydown', (e) => {
            if (this.soundEnabled && e.target.isContentEditable) {
                this.playKeySound(e.key);
            }
        }, { once: false });
    },

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const toggle = document.getElementById('soundToggle');
        if (toggle) {
            toggle.classList.toggle('active', this.soundEnabled);
            toggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
    },

    playKeySound(key) {
        // Use Web Audio API for low-latency sounds
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Different sounds for different keys
        if (key === 'Enter') {
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        } else if (key === ' ') {
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        } else {
            oscillator.frequency.setValueAtTime(800 + Math.random() * 200, this.audioContext.currentTime);
        }
        
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    },

    // ===== SESSION STATS =====
    setupSessionStats() {
        this.sessionStart = Date.now();
        this.updateSessionStats();
        
        // Track words added this session
        const editor = document.getElementById('editor') || document.getElementById('editorContainer');
        if (editor) {
            const initialWords = this.countWords(editor.innerText);
            this.sessionStartWords = initialWords;
            
            editor.addEventListener('input', () => {
                const currentWords = this.countWords(editor.innerText);
                this.sessionWords = Math.max(0, currentWords - this.sessionStartWords);
                this.updateSessionStats();
            });
        }
    },

    countWords(text) {
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    },

    updateSessionStats() {
        const statsEl = document.getElementById('sessionStats');
        if (!statsEl) return;

        const elapsed = Date.now() - this.sessionStart;
        const minutes = Math.floor(elapsed / 60000);
        const hours = Math.floor(minutes / 60);
        
        let timeStr = minutes < 60 ? `${minutes}m` : `${hours}h ${minutes % 60}m`;
        
        statsEl.innerHTML = `
            <span class="session-time">⏱ ${timeStr}</span>
            <span class="session-words">✏️ +${this.sessionWords}</span>
        `;
    },

    // ===== SMOOTH CURSOR =====
    setupSmoothCursor() {
        // Add smooth caret animation
        const style = document.createElement('style');
        style.textContent = `
            [contenteditable] {
                caret-color: var(--accent);
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    },

    // ===== INJECT WOW STYLES =====
    injectWowStyles() {
        const style = document.createElement('style');
        style.id = 'wow-styles';
        style.textContent = `
            /* Typewriter Mode */
            .typewriter-mode {
                scroll-behavior: smooth;
            }
            
            .typewriter-mode .paper {
                padding-top: 40vh;
                padding-bottom: 40vh;
            }

            /* Slash Menu */
            .slash-menu {
                background: var(--panel);
                border: 1px solid var(--border);
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                padding: 8px;
                min-width: 200px;
                z-index: 10000;
                opacity: 0;
                transform: translateY(-8px) scale(0.95);
                transition: all 0.15s ease;
            }

            .slash-menu.visible {
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            .slash-menu-header {
                font-size: 0.65rem;
                font-weight: 600;
                text-transform: uppercase;
                color: var(--text-muted);
                padding: 4px 8px 8px;
                border-bottom: 1px solid var(--border);
                margin-bottom: 4px;
            }

            .slash-item {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
                padding: 8px 12px;
                border: none;
                background: transparent;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.1s;
                text-align: left;
            }

            .slash-item:hover {
                background: var(--accent);
                color: white;
            }

            .slash-icon {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg);
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 600;
            }

            .slash-item:hover .slash-icon {
                background: rgba(255,255,255,0.2);
            }

            .slash-label {
                font-size: 0.85rem;
            }

            /* Drag Handle */
            .drag-handle {
                position: absolute;
                left: -24px;
                top: 4px;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.7rem;
                color: var(--text-muted);
                cursor: grab;
                opacity: 0;
                transition: opacity 0.15s;
                border-radius: 4px;
                letter-spacing: -2px;
            }

            .structured-mode .block:hover .drag-handle {
                opacity: 0.5;
            }

            .drag-handle:hover {
                opacity: 1 !important;
                background: var(--bg);
            }

            /* Session Stats */
            .session-stats {
                display: flex;
                gap: 12px;
                font-size: 0.75rem;
                color: var(--text-muted);
            }

            .session-time, .session-words {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .session-words {
                color: var(--success);
                font-weight: 500;
            }

            /* Inline Note */
            .inline-note {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                padding: 12px 16px;
                border-radius: 6px;
                margin: 8px 0;
                font-size: 0.9em;
                border-left: 3px solid #f59e0b;
            }

            [data-theme="dark"] .inline-note {
                background: linear-gradient(135deg, rgba(254, 243, 199, 0.1) 0%, rgba(253, 230, 138, 0.05) 100%);
            }

            /* Scene Break */
            .scene-break {
                border: none;
                text-align: center;
                margin: 2em 0;
            }

            .scene-break::before {
                content: '✦ ✦ ✦';
                color: var(--text-muted);
                font-size: 0.8rem;
                letter-spacing: 0.5em;
            }

            /* Progress Ring */
            .progress-ring {
                width: 40px;
                height: 40px;
            }

            .progress-ring-circle {
                transition: stroke-dashoffset 0.3s;
                transform: rotate(-90deg);
                transform-origin: 50% 50%;
            }

            /* Reading Time Badge */
            .reading-time {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                background: var(--bg);
                border-radius: 12px;
                font-size: 0.7rem;
                color: var(--text-muted);
            }

            /* Smooth transitions everywhere */
            * {
                transition-property: background-color, border-color, color, opacity, transform, box-shadow;
                transition-duration: 0.15s;
                transition-timing-function: ease;
            }

            [contenteditable], input, textarea, button {
                transition: none;
            }
        `;
        document.head.appendChild(style);
    }
};

window.WowFeatures = WowFeatures;
