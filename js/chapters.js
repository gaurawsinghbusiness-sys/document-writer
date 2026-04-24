/**
 * Document Writer - Chapters Module
 * Chapter management and navigation
 */

class ChapterManager {
    constructor() {
        this.chapters = [];
        this.activeChapterId = 1;
        this.chapterList = null;
    }

    init() {
        this.chapterList = document.getElementById('chapterList');
        this.chapters = [{ id: 1, title: 'Chapter 1', content: '' }];
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addBtn = document.getElementById('addChapterBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.addChapter());

        const tocBtn = document.getElementById('generateTocBtn');
        if (tocBtn) tocBtn.addEventListener('click', () => this.generateTOC());

        if (this.chapterList) {
            this.chapterList.addEventListener('click', (e) => {
                const item = e.target.closest('.chapter-item');
                if (item) this.switchToChapter(parseInt(item.dataset.chapter));
            });

            this.chapterList.addEventListener('blur', (e) => {
                if (e.target.classList.contains('chapter-title')) {
                    const item = e.target.closest('.chapter-item');
                    if (item) {
                        const id = parseInt(item.dataset.chapter);
                        const ch = this.chapters.find(c => c.id === id);
                        if (ch) ch.title = e.target.textContent || `Chapter ${id}`;
                    }
                }
            }, true);

            this.chapterList.addEventListener('keydown', (e) => {
                if (e.target.classList.contains('chapter-title') && e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
        }
    }

    addChapter() {
        const newId = Math.max(...this.chapters.map(c => c.id), 0) + 1;
        this.chapters.push({ id: newId, title: `Chapter ${newId}`, content: '' });
        this.renderChapterList();
        this.switchToChapter(newId);
    }

    switchToChapter(id) {
        const current = this.chapters.find(c => c.id === this.activeChapterId);
        if (current) current.content = window.documentEditor.getContent();
        
        const next = this.chapters.find(c => c.id === id);
        if (next) {
            this.activeChapterId = id;
            window.documentEditor.setContent(next.content);
            this.updateActiveState();
        }
    }

    getChapters() {
        const current = this.chapters.find(c => c.id === this.activeChapterId);
        if (current) current.content = window.documentEditor.getContent();
        return this.chapters;
    }

    setChapters(chapters) {
        this.chapters = chapters || [{ id: 1, title: 'Chapter 1', content: '' }];
        this.activeChapterId = this.chapters[0].id;
        this.renderChapterList();
        window.documentEditor.setContent(this.chapters[0].content);
    }

    renderChapterList() {
        if (!this.chapterList) return;
        this.chapterList.innerHTML = this.chapters.map((ch, i) => `
            <li class="chapter-item ${ch.id === this.activeChapterId ? 'active' : ''}" data-chapter="${ch.id}">
                <span class="chapter-number">${i + 1}</span>
                <span class="chapter-title" contenteditable="true">${ch.title}</span>
            </li>
        `).join('');
    }

    updateActiveState() {
        this.chapterList?.querySelectorAll('.chapter-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.chapter) === this.activeChapterId);
        });
    }

    generateTOC() {
        const current = this.chapters.find(c => c.id === this.activeChapterId);
        if (current) current.content = window.documentEditor.getContent();
        
        let toc = '<h1>Table of Contents</h1><nav>';
        this.chapters.forEach((ch, i) => {
            toc += `<p>${i + 1}. ${ch.title}</p>`;
        });
        toc += '</nav><div class="page-break"></div>';
        
        if (this.chapters.length > 0) {
            this.chapters[0].content = toc + this.chapters[0].content;
            if (this.activeChapterId === this.chapters[0].id) {
                window.documentEditor.setContent(this.chapters[0].content);
            }
        }
        window.toolbar?.showToast('Table of Contents generated!', 'success');
    }
}

window.chapterManager = new ChapterManager();
