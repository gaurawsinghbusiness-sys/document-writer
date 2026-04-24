/**
 * Document Writer - Toolbar Module
 * Handles toolbar interactions and formatting
 */

class Toolbar {
    constructor() {
        this.buttons = null;
        this.selects = null;
        this.dropdowns = null;
    }

    /**
     * Initialize toolbar
     */
    init() {
        this.setupFormatButtons();
        this.setupSelects();
        this.setupColorPickers();
        this.setupDropdowns();
        this.setupInsertButtons();
        
        console.log('Toolbar initialized');
    }

    /**
     * Setup formatting buttons
     */
    setupFormatButtons() {
        const buttons = document.querySelectorAll('.toolbar-btn[data-command]');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                window.documentEditor.execCommand(command);
            });
        });
    }

    /**
     * Setup select dropdowns
     */
    setupSelects() {
        // Font family
        const fontFamily = document.getElementById('fontFamily');
        if (fontFamily) {
            fontFamily.addEventListener('change', (e) => {
                window.documentEditor.setFontFamily(e.target.value);
            });
        }

        // Font size
        const fontSize = document.getElementById('fontSize');
        if (fontSize) {
            fontSize.addEventListener('change', (e) => {
                window.documentEditor.setFontSize(parseInt(e.target.value));
            });
        }

        // Line height
        const lineHeight = document.getElementById('lineHeight');
        if (lineHeight) {
            lineHeight.addEventListener('change', (e) => {
                window.documentEditor.setLineHeight(e.target.value);
            });
        }

        // Heading style
        const headingStyle = document.getElementById('headingStyle');
        if (headingStyle) {
            headingStyle.addEventListener('change', (e) => {
                window.documentEditor.setHeading(e.target.value);
            });
        }

        // Page size selector
        const pageSize = document.getElementById('pageSize');
        if (pageSize) {
            // Initialize with default
            this.setPageSize('6x9');
            
            pageSize.addEventListener('change', (e) => {
                this.setPageSize(e.target.value);
            });
        }
    }

    /**
     * Set page size for the document
     */
    setPageSize(size) {
        const page = document.querySelector('.page');
        if (!page) return;

        // Page size labels for display
        const sizeLabels = {
            '6x9': '6" × 9" - Novel',
            '5.5x8.5': '5.5" × 8.5" - Digest',
            '5x8': '5" × 8" - Pocket',
            '5.25x8': '5.25" × 8" - Mass Market',
            '6.14x9.21': '6.14" × 9.21" - Royal',
            '6.69x9.61': '6.69" × 9.61" - Crown Quarto',
            '7x10': '7" × 10" - Textbook',
            '7.5x9.25': '7.5" × 9.25" - Executive',
            '8x10': '8" × 10" - US Trade',
            '8.5x8.5': '8.5" × 8.5" - Square',
            '8.25x6': '8.25" × 6" - Landscape',
            '8.5x11': '8.5" × 11" - US Letter',
            'a4': 'A4 - International',
            'a5': 'A5 - International',
            'b5': 'B5 - International'
        };

        // Set the data attribute for CSS sizing
        page.setAttribute('data-size', size);
        page.setAttribute('data-size-label', sizeLabels[size] || size);

        // Adjust margins based on size (Amazon KDP requirements)
        const margins = this.getMargins(size);
        const pageContent = page.querySelector('.page-content');
        const pageHeader = page.querySelector('.page-header');
        const pageFooter = page.querySelector('.page-footer');

        if (pageContent) {
            pageContent.style.paddingLeft = margins.inside;
            pageContent.style.paddingRight = margins.outside;
        }
        if (pageHeader) {
            pageHeader.style.paddingLeft = margins.inside;
            pageHeader.style.paddingRight = margins.outside;
        }
        if (pageFooter) {
            pageFooter.style.paddingLeft = margins.inside;
            pageFooter.style.paddingRight = margins.outside;
        }

        // Store in settings
        window.currentPageSize = size;
        
        this.showToast(`Page size changed to ${sizeLabels[size] || size}`, 'info');
    }

    /**
     * Get recommended margins for page size (based on Amazon KDP guidelines)
     */
    getMargins(size) {
        // Amazon KDP minimum margins vary by page count
        // Using safe margins that work for most books
        const marginMap = {
            '5x8': { inside: '0.625in', outside: '0.5in', top: '0.5in', bottom: '0.5in' },
            '5.25x8': { inside: '0.625in', outside: '0.5in', top: '0.5in', bottom: '0.5in' },
            '5.5x8.5': { inside: '0.75in', outside: '0.5in', top: '0.5in', bottom: '0.5in' },
            '6x9': { inside: '0.75in', outside: '0.5in', top: '0.5in', bottom: '0.5in' },
            '6.14x9.21': { inside: '0.75in', outside: '0.5in', top: '0.5in', bottom: '0.5in' },
            '6.69x9.61': { inside: '0.875in', outside: '0.5in', top: '0.5in', bottom: '0.5in' },
            '7x10': { inside: '0.875in', outside: '0.5in', top: '0.5in', bottom: '0.5in' },
            '7.5x9.25': { inside: '0.875in', outside: '0.5in', top: '0.5in', bottom: '0.5in' },
            '8x10': { inside: '1in', outside: '0.5in', top: '0.5in', bottom: '0.5in' },
            '8.5x8.5': { inside: '0.75in', outside: '0.75in', top: '0.5in', bottom: '0.5in' },
            '8.25x6': { inside: '0.5in', outside: '0.5in', top: '0.5in', bottom: '0.5in' },
            '8.5x11': { inside: '1in', outside: '0.75in', top: '0.75in', bottom: '0.75in' },
            'a4': { inside: '25mm', outside: '20mm', top: '20mm', bottom: '20mm' },
            'a5': { inside: '20mm', outside: '15mm', top: '15mm', bottom: '15mm' },
            'b5': { inside: '22mm', outside: '18mm', top: '18mm', bottom: '18mm' }
        };

        return marginMap[size] || { inside: '0.75in', outside: '0.5in', top: '0.5in', bottom: '0.5in' };
    }

    /**
     * Setup color pickers
     */
    setupColorPickers() {
        // Text color
        const textColorBtn = document.getElementById('textColorBtn');
        const textColorPicker = document.getElementById('textColorPicker');
        const textColorIndicator = document.getElementById('textColorIndicator');
        
        if (textColorBtn && textColorPicker) {
            textColorBtn.addEventListener('click', () => {
                textColorPicker.click();
            });
            
            textColorPicker.addEventListener('input', (e) => {
                const color = e.target.value;
                window.documentEditor.setTextColor(color);
                if (textColorIndicator) {
                    textColorIndicator.style.stroke = color;
                }
            });
        }

        // Highlight color
        const highlightBtn = document.getElementById('highlightBtn');
        const highlightPicker = document.getElementById('highlightPicker');
        const highlightIndicator = document.getElementById('highlightIndicator');
        
        if (highlightBtn && highlightPicker) {
            highlightBtn.addEventListener('click', () => {
                highlightPicker.click();
            });
            
            highlightPicker.addEventListener('input', (e) => {
                const color = e.target.value;
                window.documentEditor.setHighlightColor(color);
                if (highlightIndicator) {
                    highlightIndicator.style.stroke = color;
                }
            });
        }
    }

    /**
     * Setup dropdown menus
     */
    setupDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Close other dropdowns
                    dropdowns.forEach(d => {
                        if (d !== dropdown) d.classList.remove('open');
                    });
                    
                    dropdown.classList.toggle('open');
                });
            }
        });

        // Close dropdowns on outside click
        document.addEventListener('click', () => {
            dropdowns.forEach(d => d.classList.remove('open'));
        });

        // Export menu items
        const exportItems = document.querySelectorAll('[data-export]');
        exportItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.export;
                window.dispatchEvent(new CustomEvent('export-document', { 
                    detail: { format } 
                }));
            });
        });
    }

    /**
     * Setup insert buttons (image, link, table, page break)
     */
    setupInsertButtons() {
        // Insert image
        const insertImageBtn = document.getElementById('insertImageBtn');
        if (insertImageBtn) {
            insertImageBtn.addEventListener('click', () => {
                this.openModal('imageModal');
            });
        }

        // Insert link
        const insertLinkBtn = document.getElementById('insertLinkBtn');
        if (insertLinkBtn) {
            insertLinkBtn.addEventListener('click', () => {
                this.openModal('linkModal');
            });
        }

        // Insert table
        const insertTableBtn = document.getElementById('insertTableBtn');
        if (insertTableBtn) {
            insertTableBtn.addEventListener('click', () => {
                this.openModal('tableModal');
            });
        }

        // Insert page break
        const insertPageBreakBtn = document.getElementById('insertPageBreakBtn');
        if (insertPageBreakBtn) {
            insertPageBreakBtn.addEventListener('click', () => {
                window.documentEditor.insertPageBreak();
            });
        }

        // Setup modal handlers
        this.setupLinkModal();
        this.setupTableModal();
        this.setupImageModal();
    }

    /**
     * Open a modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            
            // Focus first input
            const input = modal.querySelector('input');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }

    /**
     * Close a modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
            
            // Clear inputs
            modal.querySelectorAll('input').forEach(input => {
                input.value = '';
            });
        }
    }

    /**
     * Setup link modal
     */
    setupLinkModal() {
        const modal = document.getElementById('linkModal');
        if (!modal) return;

        const closeBtn = document.getElementById('closeLinkModal');
        const cancelBtn = document.getElementById('cancelLink');
        const insertBtn = document.getElementById('insertLink');
        const overlay = modal.querySelector('.modal-overlay');

        const close = () => this.closeModal('linkModal');

        closeBtn?.addEventListener('click', close);
        cancelBtn?.addEventListener('click', close);
        overlay?.addEventListener('click', close);

        insertBtn?.addEventListener('click', () => {
            const text = document.getElementById('linkText').value;
            const url = document.getElementById('linkUrl').value;
            
            if (url) {
                window.documentEditor.insertLink(url, text);
                close();
            }
        });

        // Enter key to submit
        modal.querySelectorAll('input').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    insertBtn?.click();
                }
            });
        });
    }

    /**
     * Setup table modal
     */
    setupTableModal() {
        const modal = document.getElementById('tableModal');
        if (!modal) return;

        const closeBtn = document.getElementById('closeTableModal');
        const cancelBtn = document.getElementById('cancelTable');
        const insertBtn = document.getElementById('insertTable');
        const overlay = modal.querySelector('.modal-overlay');

        const close = () => this.closeModal('tableModal');

        closeBtn?.addEventListener('click', close);
        cancelBtn?.addEventListener('click', close);
        overlay?.addEventListener('click', close);

        insertBtn?.addEventListener('click', () => {
            const rows = parseInt(document.getElementById('tableRows').value) || 3;
            const cols = parseInt(document.getElementById('tableCols').value) || 3;
            
            window.documentEditor.insertTable(rows, cols);
            close();
        });
    }

    /**
     * Setup image modal
     */
    setupImageModal() {
        const modal = document.getElementById('imageModal');
        if (!modal) return;

        const closeBtn = document.getElementById('closeImageModal');
        const cancelBtn = document.getElementById('cancelImage');
        const insertBtn = document.getElementById('insertImage');
        const overlay = modal.querySelector('.modal-overlay');
        const uploadArea = document.getElementById('imageUploadArea');
        const imageInput = document.getElementById('imageInput');
        const imageUrl = document.getElementById('imageUrl');

        const close = () => {
            this.closeModal('imageModal');
            this.selectedImageData = null;
        };

        closeBtn?.addEventListener('click', close);
        cancelBtn?.addEventListener('click', close);
        overlay?.addEventListener('click', close);

        // Click to upload
        uploadArea?.addEventListener('click', () => {
            imageInput?.click();
        });

        // Drag and drop
        uploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea?.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.handleImageFile(files[0]);
            }
        });

        // File input change
        imageInput?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageFile(e.target.files[0]);
            }
        });

        // Insert button — use mousedown so we can restore saved selection
        insertBtn?.addEventListener('click', () => {
            const url = imageUrl?.value?.trim() || this.selectedImageData;
            if (url) {
                if (window.imageManager) {
                    window.imageManager.insertFromModal(url);
                } else {
                    window.documentEditor.insertImage(url);
                }
                // Reset caption and url
                if (imageUrl) imageUrl.value = '';
                document.getElementById('imgCaption').value = '';
                close();
            } else {
                alert('Please select an image file or enter an image URL.');
            }
        });
    }

    /**
     * Handle uploaded image file
     */
    handleImageFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.selectedImageData = e.target.result;
            
            // Update upload area to show preview
            const uploadArea = document.getElementById('imageUploadArea');
            if (uploadArea) {
                uploadArea.innerHTML = `
                    <img src="${this.selectedImageData}" style="max-height: 150px; border-radius: 8px;">
                    <p style="margin-top: 8px;">Click to change image</p>
                `;
            }
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// Export singleton instance
window.toolbar = new Toolbar();
