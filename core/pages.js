/**
 * Pro Book Editor - Pages Module
 * Multi-page document management
 */

const Pages = {
    init() {
        this.setupEvents();
        this.render();
    },

    setupEvents() {
        // Add page button
        const addBtn = document.getElementById('addPage');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.add());
        }

        // Page list click
        const pageList = document.getElementById('pageList');
        if (pageList) {
            pageList.addEventListener('click', (e) => {
                const item = e.target.closest('.page-item');
                if (item) {
                    const index = parseInt(item.dataset.page);
                    this.switchTo(index);
                }
            });

            // Right-click context menu
            pageList.addEventListener('contextmenu', (e) => {
                const item = e.target.closest('.page-item');
                if (item) {
                    e.preventDefault();
                    const index = parseInt(item.dataset.page);
                    this.showContextMenu(e.clientX, e.clientY, index);
                }
            });
        }
    },

    // Get all pages
    getAll() {
        return AppState.document.pages;
    },

    // Get current page index
    getCurrentIndex() {
        return AppState.document.currentPage;
    },

    // Get page count
    getCount() {
        return AppState.document.pages.length;
    },

    // Add new page
    add(type = 'chapter') {
        Editor.saveContent();
        const page = AppState.addPage(type);
        Editor.clear();
        this.render();
        this.updateInfo();
        return page;
    },

    // Switch to page
    switchTo(index) {
        Editor.saveContent();
        const page = AppState.switchPage(index);
        if (page) {
            Editor.loadContent();
            Editor.updateStats();
            this.render();
            this.updateInfo();
        }
    },

    // Delete page
    delete(index) {
        if (this.getCount() > 1) {
            if (confirm('Delete this page?')) {
                AppState.deletePage(index);
                Editor.loadContent();
                this.render();
                this.updateInfo();
            }
        }
    },

    // Duplicate page
    duplicate(index) {
        const pages = this.getAll();
        const source = pages[index];
        if (source) {
            const newPage = {
                id: Date.now(),
                content: source.content,
                type: source.type
            };
            pages.splice(index + 1, 0, newPage);
            this.render();
            this.updateInfo();
        }
    },

    // Move page up
    moveUp(index) {
        if (index > 0) {
            const pages = this.getAll();
            [pages[index - 1], pages[index]] = [pages[index], pages[index - 1]];
            if (AppState.document.currentPage === index) {
                AppState.document.currentPage--;
            } else if (AppState.document.currentPage === index - 1) {
                AppState.document.currentPage++;
            }
            this.render();
        }
    },

    // Move page down
    moveDown(index) {
        const pages = this.getAll();
        if (index < pages.length - 1) {
            [pages[index], pages[index + 1]] = [pages[index + 1], pages[index]];
            if (AppState.document.currentPage === index) {
                AppState.document.currentPage++;
            } else if (AppState.document.currentPage === index + 1) {
                AppState.document.currentPage--;
            }
            this.render();
        }
    },

    // Render page list
    render() {
        const list = document.getElementById('pageList');
        if (!list) return;

        const pages = this.getAll();
        const current = this.getCurrentIndex();

        list.innerHTML = pages.map((page, i) => `
            <div class="page-item ${i === current ? 'active' : ''}" data-page="${i}">
                <span class="num">${i + 1}</span>
                Page ${i + 1}
            </div>
        `).join('');
    },

    // Update page info in status bar
    updateInfo() {
        const infoEl = document.getElementById('currentPage');
        if (infoEl) {
            infoEl.textContent = `Page ${this.getCurrentIndex() + 1} of ${this.getCount()}`;
        }

        const countEl = document.getElementById('pageCount');
        if (countEl) {
            countEl.textContent = this.getCount();
        }
    },

    // Show context menu
    showContextMenu(x, y, index) {
        // Remove existing menu
        const existing = document.querySelector('.context-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
        `;

        const actions = [
            { label: '📄 Duplicate', action: () => this.duplicate(index) },
            { label: '⬆️ Move Up', action: () => this.moveUp(index), disabled: index === 0 },
            { label: '⬇️ Move Down', action: () => this.moveDown(index), disabled: index === this.getCount() - 1 },
            { label: '🗑️ Delete', action: () => this.delete(index), disabled: this.getCount() <= 1 }
        ];

        actions.forEach(({ label, action, disabled }) => {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.disabled = disabled;
            btn.style.cssText = `
                display: block;
                width: 100%;
                padding: 8px 12px;
                border: none;
                background: transparent;
                color: ${disabled ? 'var(--text-muted)' : 'var(--text)'};
                text-align: left;
                cursor: ${disabled ? 'not-allowed' : 'pointer'};
                font-size: 0.85rem;
                border-radius: 4px;
            `;
            if (!disabled) {
                btn.addEventListener('click', () => {
                    action();
                    menu.remove();
                });
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = 'var(--bg)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'transparent';
                });
            }
            menu.appendChild(btn);
        });

        document.body.appendChild(menu);

        // Close on click outside
        const close = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', close);
            }
        };
        setTimeout(() => document.addEventListener('click', close), 0);
    }
};

window.Pages = Pages;
