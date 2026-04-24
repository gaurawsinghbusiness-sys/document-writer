/**
 * DocumentWriter - One-Click Export Presets + Zen Mode + Research Notes
 */

/* ══════════════════════════════════════════
   EXPORT PRESETS
══════════════════════════════════════════ */
class ExportPresets {
    constructor() {
        this.presets = [
            {
                id: 'kdp_manuscript',
                label: 'KDP Manuscript',
                emoji: '📚',
                badge: 'KDP',
                badgeColor: '#ff9a00',
                desc: '6×9", Times New Roman 12pt, pg footer center',
                settings: { size:'6x9', marginTop:0.5, marginBottom:0.5, marginLeft:0.875, marginRight:0.5, pgFormat:'1', pgPosition:'footer-center', font:'Times New Roman', fontSize:12 }
            },
            {
                id: 'amazon_pod',
                label: 'Amazon Print-on-Demand',
                emoji: '🖨️',
                badge: 'POD',
                badgeColor: '#ff9a00',
                desc: '5.5×8.5", Georgia 12pt, bleed-ready',
                settings: { size:'5.5x8.5', marginTop:0.5, marginBottom:0.5, marginLeft:0.75, marginRight:0.5, pgFormat:'1', pgPosition:'footer-center', font:'Georgia', fontSize:12 }
            },
            {
                id: 'gumroad_pdf',
                label: 'Gumroad PDF',
                emoji: '🛍️',
                badge: 'SELL',
                badgeColor: '#ff4f81',
                desc: 'Letter 8.5×11", styled cover, clean headers',
                settings: { size:'8.5x11', marginTop:1, marginBottom:1, marginLeft:1, marginRight:1, pgFormat:'Page 1', pgPosition:'footer-right', font:'Georgia', fontSize:13 }
            },
            {
                id: 'epub_ebook',
                label: 'EPUB / eBook',
                emoji: '📱',
                badge: 'ePub',
                badgeColor: '#6c5ce7',
                desc: 'Reflowable, metadata fields embedded',
                settings: { size:'6x9', marginTop:0.5, marginBottom:0.5, marginLeft:0.75, marginRight:0.5, pgFormat:'1', pgPosition:'footer-center', font:'Georgia', fontSize:12 }
            },
            {
                id: 'docx_word',
                label: 'DOCX / Word',
                emoji: '📝',
                badge: 'DOC',
                badgeColor: '#2b579a',
                desc: 'Letter, Calibri 11pt, styles preserved',
                settings: { size:'8.5x11', marginTop:1, marginBottom:1, marginLeft:1, marginRight:1, pgFormat:'1', pgPosition:'footer-right', font:'Calibri', fontSize:11 }
            },
            {
                id: 'print_pdf',
                label: 'Print PDF',
                emoji: '🖨️',
                badge: 'PRINT',
                badgeColor: '#636e72',
                desc: 'A4 / Letter, ready to print at home or office',
                settings: { size:'a4', marginTop:0.98, marginBottom:0.98, marginLeft:0.98, marginRight:0.79, pgFormat:'1', pgPosition:'footer-center', font:'Georgia', fontSize:12 }
            },
        ];
    }

    init() {
        this.buildPresetsSection();
    }

    buildPresetsSection() {
        // Inject into export panel body (after existing groups)
        const body = document.querySelector('.export-panel-body');
        if (!body || document.getElementById('presetsGroup')) return;

        const group = document.createElement('div');
        group.className = 'export-group';
        group.id = 'presetsGroup';
        group.innerHTML = `
<div class="export-group-label">⚡ One-Click Presets</div>
<div class="presets-info">Auto-applies margins, font, page size & numbering — zero manual work.</div>
<div class="export-btn-row" id="presetsList"></div>`;
        body.prepend(group);

        const list = document.getElementById('presetsList');
        this.presets.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'export-btn-item preset-btn';
            btn.dataset.preset = p.id;
            btn.innerHTML = `
<div class="export-btn-icon" style="background:${p.badgeColor}22;font-size:1.1rem;">${p.emoji}</div>
<div class="export-btn-info">
  <span class="export-btn-name">${p.label}</span>
  <span class="export-btn-desc">${p.desc}</span>
</div>
<span class="export-btn-badge" style="background:${p.badgeColor};color:#fff;">${p.badge}</span>`;
            btn.addEventListener('click', () => this.applyPreset(p));
            list.appendChild(btn);
        });
    }

    applyPreset(preset) {
        const s = preset.settings;

        // Apply to page system
        if (window.pageSystem) {
            Object.assign(window.pageSystem.settings, s);
            window.pageSystem.applyMargins();
            window.pageSystem.buildRuler();
            window.pageSystem.updateAllPageBadges();
            ['marginTop','marginBottom','marginLeft','marginRight'].forEach(k => {
                const el = document.getElementById(k);
                if (el) el.value = s[k];
            });
            window.pageSystem.saveSettings();
        }

        // Apply font
        if (s.font) {
            const fontEl = document.getElementById('fontFamily');
            if (fontEl) {
                fontEl.value = s.font;
                fontEl.dispatchEvent(new Event('change'));
            }
        }
        if (s.fontSize) {
            const sizeEl = document.getElementById('fontSize');
            if (sizeEl) {
                sizeEl.value = s.fontSize;
                sizeEl.dispatchEvent(new Event('change'));
            }
        }

        // Apply page size in toolbar
        const pageSizeEl = document.getElementById('pageSize');
        if (pageSizeEl && s.size) {
            pageSizeEl.value = s.size;
            pageSizeEl.dispatchEvent(new Event('change'));
        }

        // Close panel and notify
        window.themeManager?.closePanels();
        window.toolbar?.showToast(`✅ "${preset.label}" preset applied!`, 'success');
    }
}

/* ══════════════════════════════════════════
   ZEN / FOCUS MODE — True Distraction-Free
══════════════════════════════════════════ */
class ZenMode {
    constructor() {
        this.active       = false;
        this.focusPara    = false;
        this.hud          = null;
        this.peekZone     = null;
        this.peekTimer    = null;
        this.typingTimer  = null;
        this.hudInterval  = null;
    }

    init() {
        this.buildButton();
        this.buildHUD();
        this.buildPeekZone();
        this.bindKeys();
    }

    /* ── Build HUD (floating bottom bar) ── */
    buildHUD() {
        if (document.getElementById('zenHUD')) return;
        const hud = document.createElement('div');
        hud.id = 'zenHUD';
        hud.className = 'zen-hud';
        hud.innerHTML = `
<div class="zen-hud-stat">Words <span id="zenWords">0</span></div>
<div class="zen-hud-sep"></div>
<div class="zen-hud-stat">Time <span id="zenTime">0 min</span></div>
<div class="zen-hud-sep"></div>
<div class="zen-hud-stat" id="zenGoalStat">Goal <span id="zenGoal">–</span></div>
<div class="zen-hud-sep"></div>
<button class="zen-exit-btn" id="zenHUDFocusToggle" title="Toggle paragraph focus fade">Focus</button>
<div class="zen-hud-sep"></div>
<button class="zen-exit-btn" id="zenHUDExit">ESC · Exit Zen</button>`;
        document.body.appendChild(hud);
        this.hud = hud;

        hud.querySelector('#zenHUDExit').addEventListener('click', () => this.toggle(false));
        hud.querySelector('#zenHUDFocusToggle').addEventListener('click', () => this.toggleFocusPara());
    }

    /* ── Peek zone (top 60px invisible strip) ── */
    buildPeekZone() {
        if (document.getElementById('zenPeekZone')) return;
        const zone = document.createElement('div');
        zone.id = 'zenPeekZone';
        zone.className = 'zen-peek-zone';
        document.body.appendChild(zone);
        this.peekZone = zone;

        zone.addEventListener('mouseenter', () => this.peek(true));
        zone.addEventListener('mouseleave', () => {
            this.peekTimer = setTimeout(() => this.peek(false), 1200);
        });

        // Also bind to actual header/toolbar so peek persists while over them
        ['app-header', 'toolbar'].forEach(cls => {
            document.querySelector(`.${cls}`)?.addEventListener('mouseenter', () => {
                clearTimeout(this.peekTimer);
                this.peek(true);
            });
            document.querySelector(`.${cls}`)?.addEventListener('mouseleave', () => {
                this.peekTimer = setTimeout(() => this.peek(false), 800);
            });
        });
    }

    peek(show) {
        if (!this.active) return;
        clearTimeout(this.peekTimer);
        document.documentElement.classList.toggle('zen-peek', show);
    }

    /* ── Zen button in header ── */
    buildButton() {
        if (document.getElementById('zenModeBtn')) return;
        const btn = document.createElement('button');
        btn.id = 'zenModeBtn';
        btn.className = 'btn-themes';
        btn.title = 'Zen / Focus Mode (F11)';
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg> Zen`;
        const themesBtn = document.getElementById('themesBtn');
        themesBtn?.parentNode?.insertBefore(btn, themesBtn);
        btn.addEventListener('click', () => this.toggle());
    }

    /* ── Toggle ── */
    toggle(forceState) {
        this.active = forceState !== undefined ? forceState : !this.active;
        const html = document.documentElement;
        html.classList.toggle('zen-mode', this.active);
        if (!this.active) html.classList.remove('zen-peek', 'zen-typing', 'zen-focus');

        const btn = document.getElementById('zenModeBtn');
        if (this.active) {
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg> Exit Zen`;
            this.startHUD();
            this.bindTypingGlow();
            this.bindTypewriterScroll();
            setTimeout(() => document.getElementById('editor')?.focus(), 400);
        } else {
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg> Zen`;
            this.stopHUD();
            this.focusPara = false;
        }
    }

    /* ── Focus paragraph fade ── */
    toggleFocusPara() {
        this.focusPara = !this.focusPara;
        document.documentElement.classList.toggle('zen-focus', this.focusPara);
        const btn = document.getElementById('zenHUDFocusToggle');
        if (btn) btn.style.color = this.focusPara ? 'rgba(255,255,255,0.9)' : '';
    }

    /* ── Live HUD stats update ── */
    startHUD() {
        this.updateHUD();
        this.hudInterval = setInterval(() => this.updateHUD(), 2000);
    }

    stopHUD() {
        clearInterval(this.hudInterval);
    }

    updateHUD() {
        const editor = document.getElementById('editor');
        if (!editor) return;
        const text  = editor.innerText || '';
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const goal  = parseInt(localStorage.getItem('dw-goal') || '1000');
        const pct   = Math.min(100, Math.round(words / goal * 100));

        const wEl = document.getElementById('zenWords');
        const tEl = document.getElementById('zenTime');
        const gEl = document.getElementById('zenGoal');

        if (wEl) wEl.textContent = words.toLocaleString();
        if (tEl) tEl.textContent = Math.ceil(words / 200) + ' min read';
        if (gEl) gEl.textContent = `${pct}%`;
    }

    /* ── Warm glow on typing ── */
    bindTypingGlow() {
        const editor = document.getElementById('editor');
        if (!editor || editor._zenTyping) return;
        editor._zenTyping = true;
        editor.addEventListener('keypress', () => {
            document.documentElement.classList.add('zen-typing');
            clearTimeout(this.typingTimer);
            this.typingTimer = setTimeout(() => {
                document.documentElement.classList.remove('zen-typing');
            }, 2000);
        });
    }

    /* ── Typewriter scroll ── */
    bindTypewriterScroll() {
        const editor = document.getElementById('editor');
        if (!editor || editor._zenScroll) return;
        editor._zenScroll = true;
        editor.addEventListener('keypress', () => {
            if (!this.active) return;
            const sel = window.getSelection();
            if (!sel?.rangeCount) return;
            const range = sel.getRangeAt(0).cloneRange();
            range.collapse(true);
            const rect = range.getBoundingClientRect();
            if (!rect.top) return;
            const container = document.querySelector('.zen-mode .editor-container') ||
                              document.querySelector('.editor-container');
            if (!container) return;
            const targetY = container.scrollTop + rect.top - (window.innerHeight * 0.42);
            container.scrollTo({ top: targetY, behavior: 'smooth' });
        });
    }

    /* ── Keyboard shortcuts ── */
    bindKeys() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.active) this.toggle(false);
            if (e.key === 'F11') { e.preventDefault(); this.toggle(); }
        });
    }
}

/* ══════════════════════════════════════════
   RESEARCH / NOTES PANEL
══════════════════════════════════════════ */
class NotesPanel {
    constructor() {
        this.notes = {};
        this.currentChapter = 1;
        this.open = false;
    }

    init() {
        this.loadNotes();
        this.buildPanel();
        this.buildToggleBtn();
    }

    loadNotes() {
        try { this.notes = JSON.parse(localStorage.getItem('dw-notes') || '{}'); } catch(e) {}
    }
    saveNotes() { localStorage.setItem('dw-notes', JSON.stringify(this.notes)); }

    buildToggleBtn() {
        const sidebar = document.querySelector('.sidebar-footer');
        if (!sidebar) return;
        const btn = document.createElement('button');
        btn.className = 'btn-text';
        btn.id = 'notesToggleBtn';
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Research Notes`;
        btn.addEventListener('click', () => this.togglePanel());
        sidebar.appendChild(btn);
    }

    buildPanel() {
        if (document.getElementById('notesPanel')) return;
        const panel = document.createElement('div');
        panel.id = 'notesPanel';
        panel.className = 'notes-panel';
        panel.innerHTML = `
<div class="notes-panel-header">
  <h3>📋 Research Notes</h3>
  <small style="color:var(--text-tertiary);font-size:0.65rem">Never exported</small>
  <button class="themes-panel-close" id="closeNotesPanel">&times;</button>
</div>
<div class="notes-panel-body">
  <div class="notes-tabs" id="notesTabs">
    <button class="notes-tab active" data-tab="notes">Notes</button>
    <button class="notes-tab" data-tab="characters">Characters</button>
    <button class="notes-tab" data-tab="refs">References</button>
  </div>
  <div class="notes-content">
    <div class="notes-tab-pane active" id="notesTab-notes">
      <textarea class="notes-textarea" id="notesText" placeholder="Your research notes, scene ideas, reminders..."></textarea>
    </div>
    <div class="notes-tab-pane" id="notesTab-characters">
      <textarea class="notes-textarea" id="notesChars" placeholder="Character profiles, names, traits, backstory..."></textarea>
    </div>
    <div class="notes-tab-pane" id="notesTab-refs">
      <textarea class="notes-textarea" id="notesRefs" placeholder="URLs, book references, quotes, research links..."></textarea>
    </div>
  </div>
  <div class="notes-footer">
    <span style="font-size:0.65rem;color:var(--text-tertiary)">📌 Saved per chapter — never included in any export</span>
  </div>
</div>`;
        document.body.appendChild(panel);
        document.getElementById('closeNotesPanel').addEventListener('click', () => this.togglePanel(false));

        // Tabs
        panel.querySelectorAll('.notes-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                panel.querySelectorAll('.notes-tab, .notes-tab-pane').forEach(el => el.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`notesTab-${tab.dataset.tab}`)?.classList.add('active');
            });
        });

        // Auto-save on input
        ['notesText','notesChars','notesRefs'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.saveCurrentNotes());
        });
    }

    setChapter(chapterId) {
        this.saveCurrentNotes();
        this.currentChapter = chapterId;
        this.loadCurrentNotes();
    }

    loadCurrentNotes() {
        const data = this.notes[this.currentChapter] || {};
        document.getElementById('notesText').value = data.notes || '';
        document.getElementById('notesChars').value = data.characters || '';
        document.getElementById('notesRefs').value = data.refs || '';
    }

    saveCurrentNotes() {
        this.notes[this.currentChapter] = {
            notes: document.getElementById('notesText')?.value || '',
            characters: document.getElementById('notesChars')?.value || '',
            refs: document.getElementById('notesRefs')?.value || '',
        };
        this.saveNotes();
    }

    togglePanel(forceState) {
        this.open = forceState !== undefined ? forceState : !this.open;
        document.getElementById('notesPanel')?.classList.toggle('open', this.open);
        if (this.open) this.loadCurrentNotes();
    }
}

/* ══════════════════════════════════════════
   VERSION SNAPSHOTS
══════════════════════════════════════════ */
class Snapshots {
    constructor() { this.max = 20; }

    init() { this.buildButton(); }

    getAll() {
        try { return JSON.parse(localStorage.getItem('dw-snapshots') || '[]'); } catch(e) { return []; }
    }
    saveAll(snaps) { localStorage.setItem('dw-snapshots', JSON.stringify(snaps)); }

    save() {
        const name = prompt('Name this version:', `Version ${new Date().toLocaleString()}`);
        if (!name) return;
        const snaps = this.getAll();
        snaps.unshift({
            name,
            date: new Date().toISOString(),
            content: document.getElementById('editor')?.innerHTML || '',
            title: document.getElementById('documentTitle')?.value || 'Untitled'
        });
        if (snaps.length > this.max) snaps.splice(this.max);
        this.saveAll(snaps);
        window.toolbar?.showToast(`✅ Saved: "${name}"`, 'success');
    }

    restore(index) {
        const snaps = this.getAll();
        if (!snaps[index]) return;
        if (!confirm(`Restore "${snaps[index].name}"? Current content will be replaced.`)) return;
        const editor = document.getElementById('editor');
        if (editor) editor.innerHTML = snaps[index].content;
        window.toolbar?.showToast(`✅ Restored: "${snaps[index].name}"`, 'success');
    }

    buildButton() {
        const saveBtn = document.getElementById('saveBtn');
        if (!saveBtn) return;

        const vBtn = document.createElement('button');
        vBtn.className = 'btn-secondary';
        vBtn.id = 'snapshotBtn';
        vBtn.title = 'Save a named version snapshot';
        vBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Snapshot`;
        saveBtn.insertAdjacentElement('afterend', vBtn);
        vBtn.addEventListener('click', () => this.save());

        // History button
        const hBtn = document.createElement('button');
        hBtn.className = 'btn-secondary';
        hBtn.id = 'snapshotHistoryBtn';
        hBtn.title = 'View version history';
        hBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
        vBtn.insertAdjacentElement('afterend', hBtn);
        hBtn.addEventListener('click', () => this.showHistory());
    }

    showHistory() {
        const snaps = this.getAll();
        if (!snaps.length) { window.toolbar?.showToast('No snapshots yet. Click "Snapshot" to save one.', 'info'); return; }

        let existing = document.getElementById('snapshotModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'snapshotModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
<div style="background:var(--surface-card);border-radius:16px;padding:24px;width:480px;max-height:70vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
    <h3 style="margin:0;color:var(--text-primary);font-size:1rem;">⏱ Version History</h3>
    <button onclick="this.closest('#snapshotModal').remove()" style="border:none;background:transparent;font-size:1.2rem;cursor:pointer;color:var(--text-secondary);">&times;</button>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    ${snaps.map((s, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--border-light);border-radius:8px;background:var(--surface-bg);">
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.83rem;font-weight:600;color:var(--text-primary);margin-bottom:2px;">${s.name}</div>
        <div style="font-size:0.68rem;color:var(--text-tertiary);">${new Date(s.date).toLocaleString()}</div>
      </div>
      <button onclick="window.snapshots.restore(${i});this.closest('#snapshotModal').remove();" 
        style="padding:5px 12px;background:var(--primary-500);color:white;border:none;border-radius:6px;font-size:0.72rem;cursor:pointer;white-space:nowrap;">
        Restore
      </button>
    </div>`).join('')}
  </div>
</div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
}

/* ── Instantiate & export ─────────────────── */
window.exportPresets = new ExportPresets();
window.zenMode = new ZenMode();
window.notesPanel = new NotesPanel();
window.snapshots = new Snapshots();
