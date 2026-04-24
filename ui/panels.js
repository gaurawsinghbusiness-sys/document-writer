/**
 * Pro Book Editor - Panels Module
 * Side panels and layout controls
 */

const Panels = {
    zoom: 100,

    init() {
        this.setupTheme();
        this.setupZoom();
        this.applyPageSize();
        this.applyMargins();
    },

    // Theme toggle
    setupTheme() {
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                const newTheme = isDark ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                AppState.settings.theme = newTheme;
                localStorage.setItem('proeditor-theme', newTheme);
            });
        }
    },

    // Zoom controls
    setupZoom() {
        this.zoom = AppState.settings.zoom || 100;
        this.applyZoom();

        const zoomIn = document.getElementById('zoomIn');
        const zoomOut = document.getElementById('zoomOut');
        
        if (zoomIn) {
            zoomIn.addEventListener('click', () => {
                this.zoom = Math.min(200, this.zoom + 10);
                this.applyZoom();
            });
        }
        
        if (zoomOut) {
            zoomOut.addEventListener('click', () => {
                this.zoom = Math.max(50, this.zoom - 10);
                this.applyZoom();
            });
        }
    },

    applyZoom() {
        const paper = document.getElementById('paper');
        if (paper) {
            paper.style.transform = `scale(${this.zoom / 100})`;
            paper.style.transformOrigin = 'top center';
        }
        
        const zoomLevel = document.getElementById('zoomLevel');
        if (zoomLevel) {
            zoomLevel.textContent = this.zoom + '%';
        }
        
        AppState.settings.zoom = this.zoom;
    },

    // Apply page size
    applyPageSize() {
        const paper = document.getElementById('paper');
        if (paper) {
            const size = Styles.getPageSize(AppState.settings.pageSize);
            paper.style.width = size.width + 'in';
            paper.style.minHeight = size.height + 'in';
        }
    },

    // Apply margins
    applyMargins() {
        const paperInner = document.querySelector('.paper-inner');
        if (paperInner) {
            const { top, bottom, left, right } = AppState.settings.margins;
            paperInner.style.padding = `${top}in ${right}in ${bottom}in ${left}in`;
        }
    },

    // Show export panel
    showExportPanel() {
        // Export buttons
        document.querySelectorAll('[data-export]').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.export;
                Export[format]?.();
            });
        });
    }
};

window.Panels = Panels;
