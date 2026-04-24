/**
 * Pro Book Editor - Toolbar Module
 * Formatting toolbar functionality
 */

const Toolbar = {
    init() {
        this.setupFormatButtons();
        this.setupSelects();
        this.setupControls();
    },

    setupFormatButtons() {
        // Formatting buttons
        document.querySelectorAll('.tool-btn[data-cmd]').forEach(btn => {
            btn.addEventListener('click', () => {
                Editor.format(btn.dataset.cmd);
            });
        });
    },

    setupSelects() {
        // Font family
        const fontSelect = document.getElementById('fontFamily');
        if (fontSelect) {
            // Populate with fonts
            this.populateFontSelect(fontSelect);
            
            fontSelect.addEventListener('change', (e) => {
                Editor.setFont(e.target.value);
            });
        }

        // Font size
        const sizeSelect = document.getElementById('fontSize');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => {
                Editor.setFontSize(parseInt(e.target.value));
            });
        }

        // Heading style
        const headingSelect = document.getElementById('headingStyle');
        if (headingSelect) {
            headingSelect.addEventListener('change', (e) => {
                Editor.setHeading(e.target.value);
            });
        }

        // Line height
        const lineSelect = document.getElementById('lineHeight');
        if (lineSelect) {
            lineSelect.addEventListener('change', (e) => {
                Editor.setLineHeight(parseFloat(e.target.value));
            });
        }
    },

    populateFontSelect(select) {
        const fonts = Styles.getAllFonts();
        const categories = ['Novel/Story', 'Classic', 'Report/Learning', 'Handwritten', 'Code/Technical'];
        
        select.innerHTML = '';
        
        categories.forEach(category => {
            const categoryFonts = fonts.filter(f => f.category === category);
            if (categoryFonts.length > 0) {
                const group = document.createElement('optgroup');
                group.label = category;
                
                categoryFonts.forEach(font => {
                    const option = document.createElement('option');
                    option.value = font.name;
                    option.textContent = font.name;
                    option.style.fontFamily = font.family;
                    if (font.name === AppState.settings.font.family) {
                        option.selected = true;
                    }
                    group.appendChild(option);
                });
                
                select.appendChild(group);
            }
        });
    },

    setupControls() {
        // Page size
        const pageSize = document.getElementById('pageSize');
        if (pageSize) {
            pageSize.value = AppState.settings.pageSize;
            pageSize.addEventListener('change', (e) => {
                AppState.settings.pageSize = e.target.value;
                Panels.applyPageSize();
            });
        }

        // Margins
        ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                const key = id.replace('margin', '').toLowerCase();
                input.value = AppState.settings.margins[key];
                input.addEventListener('change', (e) => {
                    AppState.settings.margins[key] = parseFloat(e.target.value);
                    Panels.applyMargins();
                });
            }
        });

        // Word goal
        const goalInput = document.getElementById('wordGoal');
        if (goalInput) {
            goalInput.value = AppState.settings.wordGoal;
            goalInput.addEventListener('change', (e) => {
                AppState.settings.wordGoal = parseInt(e.target.value) || 1000;
                Editor.updateStats();
            });
        }
    },

    // Update active state of format buttons
    updateActiveStates() {
        document.querySelectorAll('.tool-btn[data-cmd]').forEach(btn => {
            const cmd = btn.dataset.cmd;
            const isActive = document.queryCommandState(cmd);
            btn.classList.toggle('active', isActive);
        });
    }
};

window.Toolbar = Toolbar;
