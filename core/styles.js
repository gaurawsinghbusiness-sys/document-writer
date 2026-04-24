/**
 * Pro Book Editor - Styles Module
 * Font management and styling utilities
 */

const Styles = {
    // Available fonts with categories
    fonts: {
        serif: [
            { name: 'Crimson Pro', family: "'Crimson Pro', Georgia, serif", category: 'Novel/Story' },
            { name: 'Merriweather', family: "'Merriweather', Georgia, serif", category: 'Novel/Story' },
            { name: 'Lora', family: "'Lora', Georgia, serif", category: 'Classic' },
            { name: 'Playfair Display', family: "'Playfair Display', Georgia, serif", category: 'Classic' },
            { name: 'EB Garamond', family: "'EB Garamond', Georgia, serif", category: 'Classic' },
            { name: 'Georgia', family: "Georgia, serif", category: 'Classic' },
            { name: 'Times New Roman', family: "'Times New Roman', serif", category: 'Classic' }
        ],
        sansSerif: [
            { name: 'Inter', family: "'Inter', system-ui, sans-serif", category: 'Report/Learning' },
            { name: 'Open Sans', family: "'Open Sans', sans-serif", category: 'Report/Learning' },
            { name: 'Roboto', family: "'Roboto', sans-serif", category: 'Report/Learning' },
            { name: 'Lato', family: "'Lato', sans-serif", category: 'Report/Learning' },
            { name: 'Source Sans Pro', family: "'Source Sans 3', sans-serif", category: 'Report/Learning' },
            { name: 'Arial', family: "Arial, sans-serif", category: 'Report' }
        ],
        handwritten: [
            { name: 'Caveat', family: "'Caveat', cursive", category: 'Handwritten' },
            { name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'Handwritten' },
            { name: 'Pacifico', family: "'Pacifico', cursive", category: 'Handwritten' },
            { name: 'Satisfy', family: "'Satisfy', cursive", category: 'Handwritten' },
            { name: 'Indie Flower', family: "'Indie Flower', cursive", category: 'Handwritten' },
            { name: 'Kalam', family: "'Kalam', cursive", category: 'Handwritten' }
        ],
        monospace: [
            { name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", category: 'Code/Technical' },
            { name: 'Fira Code', family: "'Fira Code', monospace", category: 'Code/Technical' },
            { name: 'Source Code Pro', family: "'Source Code Pro', monospace", category: 'Code/Technical' }
        ]
    },

    // Page sizes for publishing
    pageSizes: {
        '5x8': { width: 5, height: 8, label: '5" × 8" (Pocket)', category: 'Amazon KDP' },
        '5.25x8': { width: 5.25, height: 8, label: '5.25" × 8" (Mass Market)', category: 'Amazon KDP' },
        '5.5x8.5': { width: 5.5, height: 8.5, label: '5.5" × 8.5" (Digest)', category: 'Amazon KDP' },
        '6x9': { width: 6, height: 9, label: '6" × 9" (Novel)', category: 'Amazon KDP' },
        '7x10': { width: 7, height: 10, label: '7" × 10" (Textbook)', category: 'Amazon KDP' },
        '8.5x11': { width: 8.5, height: 11, label: '8.5" × 11" (Letter)', category: 'Standard' },
        'a4': { width: 8.27, height: 11.69, label: 'A4 (210mm × 297mm)', category: 'International' },
        'a5': { width: 5.83, height: 8.27, label: 'A5 (148mm × 210mm)', category: 'International' }
    },

    // Google Fonts to load
    googleFonts: [
        'Crimson+Pro:ital,wght@0,400;0,600;1,400',
        'Merriweather:ital,wght@0,400;0,700;1,400',
        'Lora:ital,wght@0,400;0,700;1,400',
        'Playfair+Display:wght@400;700',
        'EB+Garamond:ital,wght@0,400;0,700;1,400',
        'Inter:wght@400;500;600;700',
        'Open+Sans:wght@400;600;700',
        'Roboto:wght@400;500;700',
        'Lato:wght@400;700',
        'Source+Sans+3:wght@400;600;700',
        'Caveat:wght@400;700',
        'Dancing+Script:wght@400;700',
        'Pacifico',
        'Satisfy',
        'Indie+Flower',
        'Kalam:wght@400;700',
        'JetBrains+Mono:wght@400;700',
        'Fira+Code:wght@400;700',
        'Source+Code+Pro:wght@400;700'
    ],

    // Load all fonts
    loadFonts() {
        const fontUrl = `https://fonts.googleapis.com/css2?${this.googleFonts.map(f => `family=${f}`).join('&')}&display=swap`;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
    },

    // Get all fonts as flat array
    getAllFonts() {
        return [
            ...this.fonts.serif,
            ...this.fonts.sansSerif,
            ...this.fonts.handwritten,
            ...this.fonts.monospace
        ];
    },

    // Get fonts by category
    getFontsByCategory(category) {
        return this.getAllFonts().filter(f => f.category === category);
    },

    // Apply font to element
    applyFont(element, fontName) {
        const font = this.getAllFonts().find(f => f.name === fontName);
        if (font && element) {
            element.style.fontFamily = font.family;
        }
    },

    // Get page size dimensions
    getPageSize(sizeId) {
        return this.pageSizes[sizeId] || this.pageSizes['6x9'];
    },

    // Apply page size to element
    applyPageSize(element, sizeId) {
        const size = this.getPageSize(sizeId);
        if (element) {
            element.style.width = size.width + 'in';
            element.style.minHeight = size.height + 'in';
        }
    },

    // Initialize
    init() {
        this.loadFonts();
        return this;
    }
};

window.Styles = Styles;
