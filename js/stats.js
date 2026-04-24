/**
 * DocumentWriter - Live Stats Bar
 */
class StatsManager {
    constructor() {
        this.dailyGoal = parseInt(localStorage.getItem('dw-daily-goal') || '1000');
        this.sessionStart = Date.now();
        this.sessionWords = 0;
        this.lastWordCount = 0;
    }

    init() {
        this.buildStatsBar();
        this.bindEditor();
        this.update();
        setInterval(() => this.update(), 10000);
    }

    getEditorText() {
        return document.getElementById('editor')?.innerText || '';
    }

    countWords(text) {
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    getReadingTime(words) {
        const mins = Math.ceil(words / 200);
        return mins < 60 ? `${mins} min read` : `${Math.floor(mins/60)}h ${mins%60}m read`;
    }

    buildStatsBar() {
        const bar = document.getElementById('statsBar');
        if (!bar) return;
        bar.innerHTML = `
<div class="stats-group">
  <span class="stat-item" id="statWords" title="Total words">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
    <span id="wc">0</span> words
  </span>
  <span class="stat-item" id="statChars" title="Characters">
    <span id="cc">0</span> chars
  </span>
  <span class="stat-sep">·</span>
  <span class="stat-item" id="statRead" title="Estimated reading time">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    <span id="readTime">0 min</span>
  </span>
  <span class="stat-sep">·</span>
  <span class="stat-item" id="statSession" title="Words this session">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
    +<span id="sessionWc">0</span> today
  </span>
</div>
<div class="stats-group stats-right">
  <span class="stat-item goal-group" id="goalGroup" title="Daily word goal">
    <span id="goalLabel">Goal: <span id="goalWc">0</span>/<span id="goalTarget">${this.dailyGoal}</span></span>
    <div class="goal-bar-wrap"><div class="goal-bar" id="goalBar"></div></div>
  </span>
  <span class="stat-sep">·</span>
  <span class="stat-item jump-group">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="9 18 15 12 9 6"/></svg>
    <span>p.</span>
    <input id="jumpToPage" class="jump-input" type="number" min="1" placeholder="Go…" title="Jump to page (press Enter)">
    <span>/ <span id="totalPagesStat">1</span></span>
  </span>
</div>`;
    }

    bindEditor() {
        const editor = document.getElementById('editor');
        if (!editor) return;
        editor.addEventListener('input', () => {
            const words = this.countWords(this.getEditorText());
            this.sessionWords += Math.max(0, words - this.lastWordCount);
            this.lastWordCount = words;
            this.update();
        });
    }

    update() {
        const text = this.getEditorText();
        const words = this.countWords(text);
        const chars = text.length;

        const wc = document.getElementById('wc');
        const cc = document.getElementById('cc');
        const readTime = document.getElementById('readTime');
        const sessionWc = document.getElementById('sessionWc');
        const goalWc = document.getElementById('goalWc');
        const goalTarget = document.getElementById('goalTarget');
        const goalBar = document.getElementById('goalBar');
        const totalPagesStat = document.getElementById('totalPagesStat');

        if (wc) wc.textContent = words.toLocaleString();
        if (cc) cc.textContent = chars.toLocaleString();
        if (readTime) readTime.textContent = this.getReadingTime(words);
        if (sessionWc) sessionWc.textContent = this.sessionWords.toLocaleString();
        if (goalWc) goalWc.textContent = this.sessionWords.toLocaleString();
        if (goalTarget) goalTarget.textContent = this.dailyGoal.toLocaleString();
        if (goalBar) {
            const pct = Math.min(100, Math.round((this.sessionWords / this.dailyGoal) * 100));
            goalBar.style.width = pct + '%';
            goalBar.style.background = pct >= 100
                ? 'var(--success)'
                : pct >= 50 ? 'var(--warning)' : 'var(--primary-500)';
        }
        if (totalPagesStat) {
            const pg = document.getElementById('totalPages');
            totalPagesStat.textContent = pg?.textContent || '1';
        }

        // Sync original status bar counters too
        document.getElementById('wordCount').textContent = words;
        document.getElementById('charCount').textContent = chars;
    }
}

window.statsManager = new StatsManager();
