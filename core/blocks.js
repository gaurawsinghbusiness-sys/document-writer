/**
 * Pro Book Editor - Block System
 * Fixed-but-movable layout blocks for structured writing
 */

const Blocks = {
    // Block types with their default properties
    blockTypes: {
        'title': {
            role: 'fixed',
            deletable: false,
            defaultWidth: 100,
            defaultAlign: 'center',
            minHeight: 60,
            icon: '📌',
            label: 'Title Block'
        },
        'text': {
            role: 'movable',
            deletable: true,
            defaultWidth: 100,
            defaultAlign: 'left',
            minHeight: 100,
            icon: '📝',
            label: 'Text Block'
        },
        'quote': {
            role: 'movable',
            deletable: true,
            defaultWidth: 80,
            defaultAlign: 'center',
            minHeight: 80,
            icon: '💬',
            label: 'Quote Block'
        },
        'image': {
            role: 'movable',
            deletable: true,
            defaultWidth: 60,
            defaultAlign: 'center',
            minHeight: 150,
            icon: '🖼️',
            label: 'Image Block'
        },
        'note': {
            role: 'movable',
            deletable: true,
            defaultWidth: 90,
            defaultAlign: 'left',
            minHeight: 80,
            icon: '📒',
            label: 'Note Block'
        },
        'learning': {
            role: 'movable',
            deletable: true,
            defaultWidth: 100,
            defaultAlign: 'left',
            minHeight: 100,
            icon: '📚',
            label: 'Learning Block'
        }
    },

    // Create a new block
    createBlock(type, content = '') {
        const config = this.blockTypes[type];
        if (!config) return null;

        return {
            id: 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            type: type,
            content: content,
            width: config.defaultWidth,
            align: config.defaultAlign,
            locked: false,
            styles: {
                fontSize: null, // inherit from mode
                fontFamily: null,
                lineHeight: null,
                indent: type === 'text',
                spacing: { top: 0, bottom: 16 }
            }
        };
    },

    // Create default page with title block
    createDefaultPage() {
        return {
            id: 'page-' + Date.now(),
            blocks: [
                this.createBlock('title', 'Chapter Title'),
                this.createBlock('text', '')
            ]
        };
    },

    // Add block to page
    addBlock(pageBlocks, type, afterBlockId = null) {
        const newBlock = this.createBlock(type);
        if (!newBlock) return pageBlocks;

        if (afterBlockId) {
            const index = pageBlocks.findIndex(b => b.id === afterBlockId);
            if (index !== -1) {
                pageBlocks.splice(index + 1, 0, newBlock);
            } else {
                pageBlocks.push(newBlock);
            }
        } else {
            pageBlocks.push(newBlock);
        }

        return pageBlocks;
    },

    // Remove block from page
    removeBlock(pageBlocks, blockId) {
        const block = pageBlocks.find(b => b.id === blockId);
        if (block && this.blockTypes[block.type].deletable) {
            return pageBlocks.filter(b => b.id !== blockId);
        }
        return pageBlocks;
    },

    // Move block up
    moveBlockUp(pageBlocks, blockId) {
        const index = pageBlocks.findIndex(b => b.id === blockId);
        // Can't move title block or first movable block
        if (index <= 1) return pageBlocks;
        
        [pageBlocks[index - 1], pageBlocks[index]] = [pageBlocks[index], pageBlocks[index - 1]];
        return pageBlocks;
    },

    // Move block down
    moveBlockDown(pageBlocks, blockId) {
        const index = pageBlocks.findIndex(b => b.id === blockId);
        if (index < 0 || index >= pageBlocks.length - 1) return pageBlocks;
        
        [pageBlocks[index], pageBlocks[index + 1]] = [pageBlocks[index + 1], pageBlocks[index]];
        return pageBlocks;
    },

    // Update block property
    updateBlock(pageBlocks, blockId, property, value) {
        const block = pageBlocks.find(b => b.id === blockId);
        if (block) {
            if (property.includes('.')) {
                const [parent, child] = property.split('.');
                if (block[parent]) block[parent][child] = value;
            } else {
                block[property] = value;
            }
        }
        return pageBlocks;
    },

    // Get block by ID
    getBlock(pageBlocks, blockId) {
        return pageBlocks.find(b => b.id === blockId);
    },

    // Render block to HTML
    renderBlock(block, isStructuredMode = false) {
        const config = this.blockTypes[block.type];
        const isEditable = !block.locked;
        
        const widthStyle = block.width < 100 ? `width: ${block.width}%;` : '';
        const alignClass = `align-${block.align}`;
        const modeClass = isStructuredMode ? 'structured-mode' : 'general-mode';
        
        let blockStyles = '';
        if (block.styles.fontSize) blockStyles += `font-size: ${block.styles.fontSize}pt;`;
        if (block.styles.fontFamily) blockStyles += `font-family: ${block.styles.fontFamily};`;
        if (block.styles.lineHeight) blockStyles += `line-height: ${block.styles.lineHeight};`;
        if (block.styles.spacing) {
            blockStyles += `margin-top: ${block.styles.spacing.top}px;`;
            blockStyles += `margin-bottom: ${block.styles.spacing.bottom}px;`;
        }

        const indentClass = block.styles.indent ? 'has-indent' : '';
        const lockedClass = block.locked ? 'is-locked' : '';

        // LAYER MODEL:
        // 1. block-outline = UI layer (hover effects apply here)
        // 2. block-content = Content layer (NEVER modify visually)
        // 3. block-controls = Control layer (appears on hover)
        
        return `
            <div class="block block-${block.type} ${alignClass} ${indentClass} ${lockedClass}" 
                 data-block-id="${block.id}" 
                 data-block-type="${block.type}"
                 style="${widthStyle}">
                
                <!-- UI LAYER: Outline (receives hover effects, never affects text) -->
                <div class="block-outline"></div>
                
                <!-- UI LAYER: Controls (hidden by default, shown on hover) -->
                <div class="block-controls">
                    <span class="block-type-label">${config.icon} ${config.label}</span>
                    <div class="block-actions">
                        ${block.type === 'title' ? '' : `
                            <button class="block-btn" data-action="move-up" title="Move up">↑</button>
                            <button class="block-btn" data-action="move-down" title="Move down">↓</button>
                        `}
                        <button class="block-btn" data-action="align-left" title="Align left">◀</button>
                        <button class="block-btn" data-action="align-center" title="Center">◆</button>
                        <button class="block-btn" data-action="align-right" title="Align right">▶</button>
                        <button class="block-btn" data-action="width-narrow" title="Narrow">⊏</button>
                        <button class="block-btn" data-action="width-wide" title="Wide">⊐</button>
                        ${config.deletable ? `<button class="block-btn block-btn-delete" data-action="delete" title="Delete">✕</button>` : ''}
                        <button class="block-btn" data-action="lock" title="${block.locked ? 'Unlock' : 'Lock'}">
                            ${block.locked ? '🔒' : '🔓'}
                        </button>
                    </div>
                </div>
                
                <!-- CONTENT LAYER: Text (SACRED - never opacity/blur/color changes) -->
                <div class="block-content ${block.type}-content" 
                     contenteditable="${isEditable}" 
                     data-placeholder="${this.getPlaceholder(block.type)}"
                     style="${blockStyles}">
                    ${block.content}
                </div>
                
                <!-- UI LAYER: Resize handle -->
                <div class="block-resize-handle"></div>
            </div>
        `;
    },

    // Get placeholder text for block type
    getPlaceholder(type) {
        const placeholders = {
            'title': 'Enter chapter title...',
            'text': 'Start writing your paragraph...',
            'quote': '"Enter a quote..."',
            'image': 'Click to add image',
            'note': 'Add a note or tip...',
            'learning': 'Key learning point...'
        };
        return placeholders[type] || 'Enter content...';
    },

    // Convert general mode content to blocks
    contentToBlocks(htmlContent) {
        const blocks = [this.createBlock('title', 'Untitled')];
        
        if (htmlContent.trim()) {
            // Simple conversion: wrap content in text block
            blocks.push(this.createBlock('text', htmlContent));
        } else {
            blocks.push(this.createBlock('text', ''));
        }
        
        return blocks;
    },

    // Convert blocks to general mode content
    blocksToContent(blocks) {
        return blocks
            .filter(b => b.type !== 'title')
            .map(b => b.content)
            .join('\n');
    }
};

window.Blocks = Blocks;
