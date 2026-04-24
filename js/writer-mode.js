/**
 * DocumentWriter - Writer Mode Manager
 * Toggles between Write / Export Preview modes
 */

class WriterMode {
    constructor() {
        this.mode = localStorage.getItem('dw-mode') || 'write'; // 'write' | 'preview'
    }

    init() {
        this.applyMode(this.mode, false);
        this.bindButtons();
    }

    applyMode(mode, save = true) {
        this.mode = mode;
        const html = document.documentElement;

        if (mode === 'write') {
            html.classList.add('writer-mode');
            html.classList.remove('export-preview');
            document.querySelector('.export-preview-banner')?.classList.remove('show');
        } else {
            html.classList.remove('writer-mode');
            html.classList.add('export-preview');
            document.querySelector('.export-preview-banner')?.classList.add('show');
        }

        // Sync toggle buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        if (save) localStorage.setItem('dw-mode', mode);
    }

    bindButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyMode(btn.dataset.mode));
        });
        // "Back to Writing" in preview banner
        document.getElementById('bannerBackToWrite')?.addEventListener('click', () => {
            this.applyMode('write');
        });
    }

    isWriteMode() { return this.mode === 'write'; }
}

window.writerMode = new WriterMode();
