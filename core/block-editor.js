/**
 * Pro Book Editor - Block Editor
 * Renders and manages blocks in structured mode
 */

const BlockEditor = {
    container: null,
    activeBlock: null,
    draggedBlock: null,

    init() {
        this.container = document.getElementById('editorContainer');
        if (!this.container) return;

        this.setupEventListeners();
        this.setupBlockHover();
        
        // Listen for mode changes
        document.addEventListener('modeChange', (e) => {
            this.handleModeChange(e.detail.mode);
        });
    },

    setupEventListeners() {
        // Block content editing
        this.container.addEventListener('input', (e) => {
            const block = e.target.closest('.block');
            if (block) {
                this.updateBlockContent(block);
            }
        });

        // Block control actions
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('.block-btn');
            if (btn) {
                e.preventDefault();
                const block = btn.closest('.block');
                const action = btn.dataset.action;
                this.handleBlockAction(block, action);
            }
        });

        // Add block menu
        this.container.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-block-btn');
            if (addBtn) {
                this.showAddBlockMenu(addBtn);
            }
        });

        // Focus tracking for focus tunnel
        this.container.addEventListener('focusin', (e) => {
            const block = e.target.closest('.block');
            if (block) {
                this.setActiveBlock(block);
            }
        });
    },

    setupBlockHover() {
        // Show controls on hover (only in structured mode)
        this.container.addEventListener('mouseenter', (e) => {
            if (WritingModes.currentMode !== 'structured') return;
            
            const block = e.target.closest('.block');
            if (block) {
                block.classList.add('is-hovered');
            }
        }, true);

        this.container.addEventListener('mouseleave', (e) => {
            const block = e.target.closest('.block');
            if (block) {
                block.classList.remove('is-hovered');
            }
        }, true);
    },

    handleModeChange(mode) {
        if (mode === 'structured') {
            this.enterStructuredMode();
        } else {
            this.enterGeneralMode();
        }
    },

    enterStructuredMode() {
        // Convert current content to blocks if needed
        const currentPage = AppState.getCurrentPage();
        
        if (!currentPage.blocks || currentPage.blocks.length === 0) {
            // Convert existing content to blocks
            currentPage.blocks = Blocks.contentToBlocks(currentPage.content);
        }

        this.renderBlocks(currentPage.blocks);
    },

    enterGeneralMode() {
        // Convert blocks back to content if needed
        const currentPage = AppState.getCurrentPage();
        
        if (currentPage.blocks && currentPage.blocks.length > 0) {
            currentPage.content = Blocks.blocksToContent(currentPage.blocks);
        }

        // Render as regular editor
        const editor = document.getElementById('editor');
        if (editor) {
            editor.innerHTML = currentPage.content || '';
        }
    },

    renderBlocks(blocks) {
        const editor = document.getElementById('editor');
        if (!editor) return;

        const html = blocks.map(block => 
            Blocks.renderBlock(block, WritingModes.currentMode === 'structured')
        ).join('');

        // Add "Add Block" button at the end
        const addBlockBtn = `
            <div class="add-block-zone">
                <button class="add-block-btn" title="Add new block">
                    <span>+</span> Add Block
                </button>
            </div>
        `;

        editor.innerHTML = html + addBlockBtn;
    },

    updateBlockContent(blockEl) {
        const blockId = blockEl.dataset.blockId;
        const contentEl = blockEl.querySelector('.block-content');
        const currentPage = AppState.getCurrentPage();
        
        if (currentPage.blocks) {
            Blocks.updateBlock(currentPage.blocks, blockId, 'content', contentEl.innerHTML);
            AppState.save();
        }
    },

    handleBlockAction(blockEl, action) {
        const blockId = blockEl.dataset.blockId;
        const currentPage = AppState.getCurrentPage();
        
        if (!currentPage.blocks) return;

        switch (action) {
            case 'move-up':
                Blocks.moveBlockUp(currentPage.blocks, blockId);
                break;
            case 'move-down':
                Blocks.moveBlockDown(currentPage.blocks, blockId);
                break;
            case 'align-left':
                Blocks.updateBlock(currentPage.blocks, blockId, 'align', 'left');
                break;
            case 'align-center':
                Blocks.updateBlock(currentPage.blocks, blockId, 'align', 'center');
                break;
            case 'align-right':
                Blocks.updateBlock(currentPage.blocks, blockId, 'align', 'right');
                break;
            case 'width-narrow':
                this.adjustBlockWidth(currentPage.blocks, blockId, -10);
                break;
            case 'width-wide':
                this.adjustBlockWidth(currentPage.blocks, blockId, 10);
                break;
            case 'delete':
                if (confirm('Delete this block?')) {
                    currentPage.blocks = Blocks.removeBlock(currentPage.blocks, blockId);
                }
                break;
            case 'lock':
                const block = Blocks.getBlock(currentPage.blocks, blockId);
                if (block) {
                    Blocks.updateBlock(currentPage.blocks, blockId, 'locked', !block.locked);
                }
                break;
        }

        AppState.save();
        this.renderBlocks(currentPage.blocks);
    },

    adjustBlockWidth(blocks, blockId, delta) {
        const block = Blocks.getBlock(blocks, blockId);
        if (block) {
            const newWidth = Math.max(30, Math.min(100, block.width + delta));
            Blocks.updateBlock(blocks, blockId, 'width', newWidth);
        }
    },

    showAddBlockMenu(btn) {
        // Remove existing menu
        const existing = document.querySelector('.add-block-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.className = 'add-block-menu';
        
        const blockTypes = Object.entries(Blocks.blockTypes)
            .filter(([type]) => type !== 'title')
            .map(([type, config]) => `
                <button class="add-block-option" data-type="${type}">
                    <span class="icon">${config.icon}</span>
                    <span class="label">${config.label}</span>
                </button>
            `).join('');

        menu.innerHTML = blockTypes;
        btn.parentElement.appendChild(menu);

        // Handle selection
        menu.addEventListener('click', (e) => {
            const option = e.target.closest('.add-block-option');
            if (option) {
                const type = option.dataset.type;
                this.addBlock(type);
                menu.remove();
            }
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function close(e) {
                if (!menu.contains(e.target) && !btn.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', close);
                }
            });
        }, 0);
    },

    addBlock(type) {
        const currentPage = AppState.getCurrentPage();
        if (!currentPage.blocks) {
            currentPage.blocks = Blocks.contentToBlocks(currentPage.content || '');
        }

        Blocks.addBlock(currentPage.blocks, type);
        AppState.save();
        this.renderBlocks(currentPage.blocks);
    },

    setActiveBlock(blockEl) {
        // Remove active from all blocks
        document.querySelectorAll('.block.is-active').forEach(b => {
            b.classList.remove('is-active');
        });

        if (blockEl) {
            blockEl.classList.add('is-active');
            this.activeBlock = blockEl;
        }
    }
};

window.BlockEditor = BlockEditor;
