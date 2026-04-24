/**
 * Document Writer - Editor Module
 * Rich text editing functionality
 */

class DocumentEditor {
    constructor() {
        this.editor = null;
        this.editorWrapper = null;
        this.pages = [];
        this.currentPage = 1;
        this.zoom = 100;
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
        this.isComposing = false;
        this.lastContent = '';
    }

    /**
     * Initialize the editor
     */
    init() {
        this.editor = document.getElementById('editor');
        this.editorWrapper = document.getElementById('editorWrapper');
        
        if (!this.editor) {
            console.error('Editor element not found');
            return;
        }

        this.setupEventListeners();
        this.updateStatistics();
        this.saveState();
        
        console.log('Editor initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Input events for content changes
        this.editor.addEventListener('input', () => {
            if (!this.isComposing) {
                this.handleInput();
            }
        });

        // Composition events for IME input
        this.editor.addEventListener('compositionstart', () => {
            this.isComposing = true;
        });

        this.editor.addEventListener('compositionend', () => {
            this.isComposing = false;
            this.handleInput();
        });

        // Keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Paste handling
        this.editor.addEventListener('paste', (e) => this.handlePaste(e));

        // Focus events
        this.editor.addEventListener('focus', () => {
            this.editor.parentElement.classList.add('focused');
        });

        this.editor.addEventListener('blur', () => {
            this.editor.parentElement.classList.remove('focused');
        });

        // Selection change for toolbar state
        document.addEventListener('selectionchange', () => {
            if (this.editor.contains(document.activeElement)) {
                this.updateToolbarState();
            }
        });
    }

    /**
     * Handle input changes
     */
    handleInput() {
        this.updateStatistics();
        this.scheduleAutoSave();
        this.checkPageBreaks();
        
        // Save state for undo
        const currentContent = this.editor.innerHTML;
        if (currentContent !== this.lastContent) {
            this.saveState();
            this.lastContent = currentContent;
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeydown(e) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modKey = isMac ? e.metaKey : e.ctrlKey;

        // Undo (Ctrl+Z / Cmd+Z)
        if (modKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this.undo();
            return;
        }

        // Redo (Ctrl+Y / Cmd+Shift+Z)
        if ((modKey && e.key === 'y') || (modKey && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            this.redo();
            return;
        }

        // Bold (Ctrl+B)
        if (modKey && e.key === 'b') {
            e.preventDefault();
            this.execCommand('bold');
            return;
        }

        // Italic (Ctrl+I)
        if (modKey && e.key === 'i') {
            e.preventDefault();
            this.execCommand('italic');
            return;
        }

        // Underline (Ctrl+U)
        if (modKey && e.key === 'u') {
            e.preventDefault();
            this.execCommand('underline');
            return;
        }

        // Save (Ctrl+S)
        if (modKey && e.key === 's') {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('save-document'));
            return;
        }

        // Tab handling
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                this.execCommand('outdent');
            } else {
                this.execCommand('indent');
            }
            return;
        }
    }

    /**
     * Handle paste events
     */
    handlePaste(e) {
        e.preventDefault();
        
        // Get plain text or HTML
        let content = e.clipboardData.getData('text/html');
        
        if (content) {
            // Clean HTML
            content = this.cleanPastedHTML(content);
            document.execCommand('insertHTML', false, content);
        } else {
            // Plain text
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        }
        
        this.handleInput();
    }

    /**
     * Clean pasted HTML to remove unwanted styles
     */
    cleanPastedHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remove scripts
        temp.querySelectorAll('script, style').forEach(el => el.remove());
        
        // Remove unwanted attributes
        temp.querySelectorAll('*').forEach(el => {
            const allowedAttrs = ['href', 'src', 'alt', 'title'];
            [...el.attributes].forEach(attr => {
                if (!allowedAttrs.includes(attr.name)) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        
        return temp.innerHTML;
    }

    /**
     * Execute formatting command
     */
    execCommand(command, value = null) {
        this.editor.focus();
        document.execCommand(command, false, value);
        this.handleInput();
        this.updateToolbarState();
    }

    /**
     * Set font family
     */
    setFontFamily(font) {
        this.execCommand('fontName', font);
    }

    /**
     * Set font size
     */
    setFontSize(size) {
        // Convert pt to execCommand size (1-7)
        const sizeMap = {
            8: 1, 9: 1, 10: 2, 11: 2, 12: 3, 14: 4, 
            16: 4, 18: 5, 20: 5, 24: 6, 28: 6, 32: 7, 
            36: 7, 48: 7, 72: 7
        };
        
        // Use CSS instead for more control
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (!range.collapsed) {
                const span = document.createElement('span');
                span.style.fontSize = `${size}pt`;
                range.surroundContents(span);
            }
        }
        
        this.handleInput();
    }

    /**
     * Set text color
     */
    setTextColor(color) {
        this.execCommand('foreColor', color);
    }

    /**
     * Set highlight/background color
     */
    setHighlightColor(color) {
        this.execCommand('hiliteColor', color);
    }

    /**
     * Set line height
     */
    setLineHeight(height) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            let container = selection.anchorNode;
            while (container && container !== this.editor) {
                if (container.nodeType === 1) {
                    container.style.lineHeight = height;
                    break;
                }
                container = container.parentNode;
            }
            
            // If no block element found, wrap in div
            if (container === this.editor || !container) {
                this.execCommand('formatBlock', 'div');
                const selection = window.getSelection();
                if (selection.anchorNode.parentElement) {
                    selection.anchorNode.parentElement.style.lineHeight = height;
                }
            }
        }
        
        this.handleInput();
    }

    /**
     * Set heading level
     */
    setHeading(level) {
        if (level) {
            this.execCommand('formatBlock', level);
        } else {
            this.execCommand('formatBlock', 'p');
        }
    }

    /**
     * Insert a link
     */
    insertLink(url, text) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            if (text && range.collapsed) {
                // Insert new link with text
                const link = document.createElement('a');
                link.href = url;
                link.textContent = text;
                link.target = '_blank';
                range.insertNode(link);
            } else if (!range.collapsed) {
                // Wrap selection in link
                this.execCommand('createLink', url);
            } else if (text) {
                // Insert new link with text
                const link = document.createElement('a');
                link.href = url;
                link.textContent = text;
                link.target = '_blank';
                range.insertNode(link);
            }
        }
        
        this.handleInput();
    }

    /**
     * Insert a table
     */
    insertTable(rows, cols) {
        let html = '<table><tbody>';
        
        for (let i = 0; i < rows; i++) {
            html += '<tr>';
            for (let j = 0; j < cols; j++) {
                const tag = i === 0 ? 'th' : 'td';
                html += `<${tag}><br></${tag}>`;
            }
            html += '</tr>';
        }
        
        html += '</tbody></table><p><br></p>';
        
        document.execCommand('insertHTML', false, html);
        this.handleInput();
    }

    /**
     * Insert an image
     */
    insertImage(src, alt = '') {
        const html = `<img src="${src}" alt="${alt}"><br>`;
        document.execCommand('insertHTML', false, html);
        this.handleInput();
    }

    /**
     * Insert page break
     */
    insertPageBreak() {
        const html = '<div class="page-break"></div><p><br></p>';
        document.execCommand('insertHTML', false, html);
        this.handleInput();
    }

    /**
     * Update toolbar state based on selection
     */
    updateToolbarState() {
        const commands = ['bold', 'italic', 'underline', 'strikeThrough', 
                         'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
                         'insertUnorderedList', 'insertOrderedList'];
        
        commands.forEach(cmd => {
            const btn = document.querySelector(`[data-command="${cmd}"]`);
            if (btn) {
                if (document.queryCommandState(cmd)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    }

    /**
     * Update word and character count
     */
    updateStatistics() {
        const text = this.editor.innerText || '';
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        
        document.getElementById('wordCount').textContent = words.length;
        document.getElementById('charCount').textContent = text.length;
    }

    /**
     * Check and handle page breaks
     */
    checkPageBreaks() {
        // Calculate if content exceeds page height
        const pageContent = this.editor;
        const pageHeight = 11 * 96 - 1.5 * 96; // 11 inches minus margins
        
        if (pageContent.scrollHeight > pageHeight) {
            // Content exceeds page - could auto-add new page
            // For now, just update page count
            const estimatedPages = Math.ceil(pageContent.scrollHeight / pageHeight);
            document.getElementById('totalPages').textContent = estimatedPages;
        }
    }

    /**
     * Zoom functionality
     */
    setZoom(level) {
        this.zoom = Math.max(50, Math.min(200, level));
        this.editorWrapper.style.transform = `scale(${this.zoom / 100})`;
        document.getElementById('zoomLevel').textContent = `${this.zoom}%`;
    }

    zoomIn() {
        this.setZoom(this.zoom + 10);
    }

    zoomOut() {
        this.setZoom(this.zoom - 10);
    }

    /**
     * Undo/Redo functionality
     */
    saveState() {
        const content = this.editor.innerHTML;
        
        // Don't save if same as last state
        if (this.undoStack.length > 0 && 
            this.undoStack[this.undoStack.length - 1] === content) {
            return;
        }
        
        this.undoStack.push(content);
        
        // Limit stack size
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        
        // Clear redo stack on new action
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length <= 1) return;
        
        const current = this.undoStack.pop();
        this.redoStack.push(current);
        
        const previous = this.undoStack[this.undoStack.length - 1];
        this.editor.innerHTML = previous;
        this.lastContent = previous;
        
        this.updateStatistics();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        
        const next = this.redoStack.pop();
        this.undoStack.push(next);
        
        this.editor.innerHTML = next;
        this.lastContent = next;
        
        this.updateStatistics();
    }

    /**
     * Schedule auto-save
     */
    scheduleAutoSave() {
        window.documentStorage.scheduleAutoSave(() => {
            window.dispatchEvent(new CustomEvent('auto-save'));
        });
    }

    /**
     * Get editor content
     */
    getContent() {
        return this.editor.innerHTML;
    }

    /**
     * Set editor content
     */
    setContent(html) {
        this.editor.innerHTML = html;
        this.lastContent = html;
        this.undoStack = [html];
        this.redoStack = [];
        this.updateStatistics();
    }

    /**
     * Clear editor
     */
    clear() {
        this.editor.innerHTML = '';
        this.lastContent = '';
        this.undoStack = [''];
        this.redoStack = [];
        this.updateStatistics();
    }

    /**
     * Focus editor
     */
    focus() {
        this.editor.focus();
    }
}

// Export singleton instance
window.documentEditor = new DocumentEditor();
