/**
 * DocumentWriter - Page System
 * Manages: page size, margins (T/B/L/R), page numbers, page breaks
 */

class PageSystem {
    constructor() {
        this.settings = {
            size: '6x9',
            marginTop: 0.5,
            marginBottom: 0.5,
            marginLeft: 0.875,
            marginRight: 0.5,
            unit: 'in',
            pgFormat: '1',          // '1' | 'Page 1' | 'roman' | 'chapter'
            pgStart: 1,
            skipTitlePage: true,
            pgPosition: 'footer-center',
            headerText: '',
            footerText: '',
        };
        this.pageCount = 1;
        this.currentPage = 1;
    }

    init() {
        this.loadSettings();
        this.applyMargins();
        this.buildRuler();
        this.buildMarginControls();
        this.bindPageNumberControls();
        this.updateAllPageBadges();
        this.bindJumpToPage();
        this.observePageBreaks();
    }

    /* ── Persistence ─────────────────────── */
    saveSettings() {
        localStorage.setItem('dw-page-settings', JSON.stringify(this.settings));
    }

    loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem('dw-page-settings') || '{}');
            Object.assign(this.settings, saved);
        } catch(e) {}
    }

    /* ── Apply Margins to CSS vars ───────── */
    applyMargins() {
        const root = document.documentElement;
        const u = this.settings.unit;
        root.style.setProperty('--margin-top',    `${this.settings.marginTop}${u}`);
        root.style.setProperty('--margin-bottom', `${this.settings.marginBottom}${u}`);
        root.style.setProperty('--margin-left',   `${this.settings.marginLeft}${u}`);
        root.style.setProperty('--margin-right',  `${this.settings.marginRight}${u}`);

        // Apply to actual page elements
        document.querySelectorAll('.page-content').forEach(el => {
            el.style.paddingLeft   = `${this.settings.marginLeft}${u}`;
            el.style.paddingRight  = `${this.settings.marginRight}${u}`;
        });
        document.querySelectorAll('.page-header, .page-footer').forEach(el => {
            el.style.paddingLeft  = `${this.settings.marginLeft}${u}`;
            el.style.paddingRight = `${this.settings.marginRight}${u}`;
        });
        document.querySelectorAll('.page-header').forEach(el => {
            el.style.paddingTop = `${Math.min(this.settings.marginTop * 0.5, 0.25)}${u}`;
        });
        document.querySelectorAll('.page-footer').forEach(el => {
            el.style.paddingBottom = `${Math.min(this.settings.marginBottom * 0.5, 0.25)}${u}`;
        });

        // Update margin guide heights
        document.querySelectorAll('.margin-guide-top').forEach(el => {
            el.style.height = `${this.settings.marginTop}${u}`;
            el.textContent = `↕ Top margin: ${this.settings.marginTop}${u}`;
        });
        document.querySelectorAll('.margin-guide-bottom').forEach(el => {
            el.style.height = `${this.settings.marginBottom}${u}`;
            el.textContent = `↕ Bottom margin: ${this.settings.marginBottom}${u}`;
        });

        this.saveSettings();
    }

    /* ── Build Ruler Bar ─────────────────── */
    buildRuler() {
        const rulerBar = document.getElementById('rulerBar');
        if (!rulerBar) return;
        rulerBar.innerHTML = '';

        const track = document.createElement('div');
        track.className = 'ruler-track';

        // Get page width in pixels (96dpi)
        const pageEl = document.querySelector('.page');
        const pageW = pageEl ? pageEl.offsetWidth : 6 * 96;
        track.style.width = pageW + 'px';

        const totalIn = pageW / 96;

        // Draw ticks every 0.25in
        for (let i = 0; i <= totalIn * 4; i++) {
            const tick = document.createElement('div');
            const isMajor = i % 4 === 0;
            tick.className = 'ruler-tick ' + (isMajor ? 'major' : 'minor');
            tick.style.left = ((i / 4 / totalIn) * 100) + '%';
            tick.style.top = isMajor ? '0' : '20px';
            track.appendChild(tick);

            if (isMajor && i > 0 && i < totalIn * 4) {
                const label = document.createElement('span');
                label.className = 'ruler-label';
                label.style.left = ((i / 4 / totalIn) * 100) + '%';
                label.textContent = (i / 4) + '"';
                track.appendChild(label);
            }
        }

        // Left margin zone
        const leftZone = document.createElement('div');
        leftZone.className = 'ruler-margin-zone';
        leftZone.id = 'rulerLeftZone';
        leftZone.style.left = '0';
        leftZone.style.width = ((this.settings.marginLeft / totalIn) * 100) + '%';
        track.appendChild(leftZone);

        // Right margin zone
        const rightZone = document.createElement('div');
        rightZone.className = 'ruler-margin-zone';
        rightZone.id = 'rulerRightZone';
        rightZone.style.right = '0';
        rightZone.style.width = ((this.settings.marginRight / totalIn) * 100) + '%';
        rightZone.style.left = 'auto';
        track.appendChild(rightZone);

        // Left drag handle
        const leftHandle = document.createElement('div');
        leftHandle.className = 'ruler-margin-handle';
        leftHandle.id = 'rulerLeftHandle';
        leftHandle.style.left = ((this.settings.marginLeft / totalIn) * 100) + '%';
        leftHandle.title = 'Drag to adjust left margin';
        this.bindRulerDrag(leftHandle, 'left', totalIn, track);
        track.appendChild(leftHandle);

        // Right drag handle
        const rightHandle = document.createElement('div');
        rightHandle.className = 'ruler-margin-handle';
        rightHandle.id = 'rulerRightHandle';
        rightHandle.style.left = ((1 - this.settings.marginRight / totalIn) * 100) + '%';
        rightHandle.title = 'Drag to adjust right margin';
        this.bindRulerDrag(rightHandle, 'right', totalIn, track);
        track.appendChild(rightHandle);

        rulerBar.appendChild(track);
    }

    bindRulerDrag(handle, side, totalIn, track) {
        let startX, startVal;
        const onMove = (e) => {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const dx = clientX - startX;
            const dIn = (dx / track.offsetWidth) * totalIn;
            let newVal = Math.round((startVal + (side === 'right' ? -dIn : dIn)) * 8) / 8;
            newVal = Math.max(0.25, Math.min(2, newVal));

            if (side === 'left') {
                this.settings.marginLeft = newVal;
                handle.style.left = ((newVal / totalIn) * 100) + '%';
                document.getElementById('rulerLeftZone').style.width = ((newVal / totalIn) * 100) + '%';
                document.getElementById('marginLeft').value = newVal;
            } else {
                this.settings.marginRight = newVal;
                handle.style.left = ((1 - newVal / totalIn) * 100) + '%';
                document.getElementById('rulerRightZone').style.width = ((newVal / totalIn) * 100) + '%';
                document.getElementById('marginRight').value = newVal;
            }
            this.applyMargins();
        };
        const onUp = () => {
            handle.classList.remove('dragging');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
        };
        handle.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startVal = side === 'left' ? this.settings.marginLeft : this.settings.marginRight;
            handle.classList.add('dragging');
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
        handle.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startVal = side === 'left' ? this.settings.marginLeft : this.settings.marginRight;
            handle.classList.add('dragging');
            document.addEventListener('touchmove', onMove);
            document.addEventListener('touchend', onUp);
        });
    }

    /* ── Margin Controls (type inputs) ───── */
    buildMarginControls() {
        const bind = (id, key) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.value = this.settings[key];
            el.addEventListener('change', () => {
                const val = parseFloat(el.value);
                if (!isNaN(val) && val > 0) {
                    this.settings[key] = val;
                    this.applyMargins();
                    this.buildRuler();
                }
            });
        };
        bind('marginTop', 'marginTop');
        bind('marginBottom', 'marginBottom');
        bind('marginLeft', 'marginLeft');
        bind('marginRight', 'marginRight');
    }

    /* ── Page Number Controls ────────────── */
    bindPageNumberControls() {
        const fmt = document.getElementById('pgFormat');
        const start = document.getElementById('pgStart');
        const skip = document.getElementById('pgSkipTitle');

        if (fmt) {
            fmt.value = this.settings.pgFormat;
            fmt.addEventListener('change', () => {
                this.settings.pgFormat = fmt.value;
                this.updateAllPageBadges();
                this.saveSettings();
            });
        }
        if (start) {
            start.value = this.settings.pgStart;
            start.addEventListener('change', () => {
                this.settings.pgStart = parseInt(start.value) || 1;
                this.updateAllPageBadges();
                this.saveSettings();
            });
        }
        if (skip) {
            skip.checked = this.settings.skipTitlePage;
            skip.addEventListener('change', () => {
                this.settings.skipTitlePage = skip.checked;
                this.updateAllPageBadges();
                this.saveSettings();
            });
        }
    }

    formatPageNumber(n) {
        const num = n + this.settings.pgStart - 1;
        switch(this.settings.pgFormat) {
            case 'Page 1': return `Page ${num}`;
            case 'roman': return this.toRoman(num);
            case 'chapter': return `${num}`;
            default: return String(num);
        }
    }

    toRoman(num) {
        const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
        const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
        let result = '';
        for (let i = 0; i < vals.length; i++) {
            while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
        }
        return result.toLowerCase();
    }

    updateAllPageBadges() {
        document.querySelectorAll('.page-num-badge').forEach((badge, i) => {
            if (this.settings.skipTitlePage && i === 0) {
                badge.textContent = '— title page —';
            } else {
                const pageNum = this.settings.skipTitlePage ? i : i + 1;
                badge.textContent = `p. ${this.formatPageNumber(pageNum)}`;
            }
        });
        // Also update footer page numbers in export mode
        document.querySelectorAll('.footer-center.page-number').forEach((el, i) => {
            const pageNum = this.settings.skipTitlePage ? i : i + 1;
            el.textContent = this.formatPageNumber(pageNum);
        });
    }

    /* ── Page Break Observer ─────────────── */
    observePageBreaks() {
        // Watch for manual page breaks inserted
        const observer = new MutationObserver(() => this.countPages());
        const editor = document.getElementById('editor');
        if (editor) observer.observe(editor, { childList: true, subtree: true });
    }

    countPages() {
        const breaks = document.querySelectorAll('.page-break').length;
        this.pageCount = breaks + 1;
        document.getElementById('totalPages').textContent = this.pageCount;
    }

    /* ── Jump To Page ────────────────────── */
    bindJumpToPage() {
        const input = document.getElementById('jumpToPage');
        if (!input) return;
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const n = parseInt(input.value);
                if (!isNaN(n)) this.jumpToPage(n);
                input.value = '';
            }
        });
    }

    jumpToPage(n) {
        const pages = document.querySelectorAll('.page');
        const target = pages[n - 1];
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ── Inject margin guides into pages ─── */
    injectMarginGuides() {
        document.querySelectorAll('.page').forEach((page, i) => {
            if (!page.querySelector('.margin-guide-top')) {
                const top = document.createElement('div');
                top.className = 'margin-guide-top';
                page.prepend(top);
            }
            if (!page.querySelector('.margin-guide-bottom')) {
                const bot = document.createElement('div');
                bot.className = 'margin-guide-bottom';
                page.appendChild(bot);
            }
            if (!page.querySelector('.margin-guide-right')) {
                const right = document.createElement('div');
                right.className = 'margin-guide-right';
                page.appendChild(right);
            }
            if (!page.querySelector('.page-num-badge')) {
                const badge = document.createElement('div');
                badge.className = 'page-num-badge';
                badge.textContent = `p. ${i + 1}`;
                page.appendChild(badge);
            }
        });
        this.applyMargins();
        this.updateAllPageBadges();
    }

    /* ── Apply preset margins ─────────────── */
    applyPreset(preset) {
        const presets = {
            kdp_print:  { size:'6x9',   marginTop:0.5,  marginBottom:0.5,  marginLeft:0.875, marginRight:0.5,  pgFormat:'1',      pgPosition:'footer-center' },
            amazon_pod: { size:'5.5x8.5',marginTop:0.5, marginBottom:0.5,  marginLeft:0.75,  marginRight:0.5,  pgFormat:'1',      pgPosition:'footer-center' },
            gumroad:    { size:'letter', marginTop:1,    marginBottom:1,    marginLeft:1,     marginRight:1,    pgFormat:'Page 1', pgPosition:'footer-right' },
            a4_intl:    { size:'a4',     marginTop:0.98, marginBottom:0.98, marginLeft:0.98,  marginRight:0.79, pgFormat:'1',      pgPosition:'footer-center' },
            letter:     { size:'letter', marginTop:1,    marginBottom:1,    marginLeft:1,     marginRight:1,    pgFormat:'1',      pgPosition:'footer-right' },
        };
        if (presets[preset]) {
            Object.assign(this.settings, presets[preset]);
            this.applyMargins();
            this.buildRuler();
            this.updateAllPageBadges();
            // Sync input fields
            ['marginTop','marginBottom','marginLeft','marginRight'].forEach(k => {
                const el = document.getElementById(k);
                if (el) el.value = this.settings[k];
            });
            this.saveSettings();
        }
    }
}

window.pageSystem = new PageSystem();
