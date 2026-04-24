/**
 * DocumentWriter - Advanced Image Editor
 * Move, Crop, Rotate, Flip, Filter, Opacity, Border, Shadow
 */
class ImageEditor {

    init() {
        this.savedRange = null;
        this.selectedFigure = null;
        this.bindClipboardPaste();
        this.bindEditorClick();
        this.patchToolbarImageBtn();
    }

    /* ═══ Selection ═══════════════════════ */
    selectFigure(figure) {
        document.querySelectorAll('.img-figure.selected').forEach(f => {
            if (f !== figure) f.classList.remove('selected');
        });
        figure.classList.add('selected');
        this.selectedFigure = figure;
    }

    deselectAll() {
        document.querySelectorAll('.img-figure.selected').forEach(f => f.classList.remove('selected'));
        this.selectedFigure = null;
    }

    bindEditorClick() {
        document.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.img-figure') && !e.target.closest('.img-editor-toolbar') && !e.target.closest('.crop-actions')) {
                this.deselectAll();
            }
        });
    }

    /* ═══ Selection save/restore ══════════ */
    saveSelection() {
        const sel = window.getSelection();
        if (sel?.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const editor = document.getElementById('editor');
            if (editor?.contains(range.commonAncestorContainer)) {
                this.savedRange = range.cloneRange();
            }
        }
    }

    restoreSelection() {
        if (!this.savedRange) return;
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(this.savedRange);
    }

    patchToolbarImageBtn() {
        document.getElementById('insertImageBtn')?.addEventListener('mousedown', () => this.saveSelection(), true);
    }

    /* ═══ Build Figure ═════════════════════ */
    insertImage(src, align = 'center', caption = '') {
        const editor = document.getElementById('editor');
        if (!editor) return;
        editor.focus();
        this.restoreSelection();

        const figure = this.buildFigure(src, align, caption);

        const sel = window.getSelection();
        if (sel?.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.collapse(false);
            range.insertNode(figure);
            const after = document.createRange();
            after.setStartAfter(figure);
            after.collapse(true);
            sel.removeAllRanges();
            sel.addRange(after);
        } else {
            editor.appendChild(figure);
        }

        this.savedRange = null;
        this.bindFigure(figure);
        setTimeout(() => this.selectFigure(figure), 50);
    }

    buildFigure(src, align, caption) {
        const figure = document.createElement('figure');
        figure.className = `img-figure img-align-${align} img-filter-none img-border-none img-shadow-none`;
        figure.contentEditable = 'false';
        figure.draggable = true;
        figure.innerHTML = `
<div class="img-wrapper">
  <div class="img-editor-toolbar">${this.buildToolbarHTML()}</div>
  <img src="${src}" alt="Image" draggable="false" style="max-width:100%;height:auto;">
  <div class="img-move-handle" title="Drag to move"></div>
  ${this.buildResizeHandles()}
</div>
<figcaption class="img-caption" contentEditable="true" data-placeholder="Add a caption...">${caption}</figcaption>`;
        return figure;
    }

    buildToolbarHTML() {
        return `
<span class="img-tool-label">Move</span>
<button class="img-tool-btn" data-action="align-left" title="Align left">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
</button>
<button class="img-tool-btn" data-action="align-center" title="Center">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
</button>
<button class="img-tool-btn" data-action="align-right" title="Align right">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
</button>
<button class="img-tool-btn" data-action="align-full" title="Full width">↔</button>
<div class="img-tool-sep"></div>
<span class="img-tool-label">Edit</span>
<button class="img-tool-btn" data-action="crop" title="Crop">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 2 6 22"/><polyline points="2 6 22 6"/><path d="M18 2v4"/><path d="M2 18h4"/><rect x="6" y="6" width="12" height="12"/></svg>
</button>
<button class="img-tool-btn" data-action="rotate-left" title="Rotate 90° left">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 2v6h6"/><path d="M2.66 15.57a10 10 0 1 0 .57-8.38"/></svg>
</button>
<button class="img-tool-btn" data-action="rotate-right" title="Rotate 90° right">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38"/></svg>
</button>
<button class="img-tool-btn" data-action="flip-h" title="Flip horizontal">↔</button>
<button class="img-tool-btn" data-action="flip-v" title="Flip vertical">↕</button>
<div class="img-tool-sep"></div>
<span class="img-tool-label">Style</span>
<button class="img-tool-btn" data-action="filter" title="Filters">🎨</button>
<button class="img-tool-btn" data-action="border" title="Border">⬜</button>
<button class="img-tool-btn" data-action="shadow" title="Shadow">🌑</button>
<div class="img-tool-sep"></div>
<input class="img-opacity-slider" type="range" min="10" max="100" value="100" title="Opacity" data-action="opacity">
<div class="img-tool-sep"></div>
<button class="img-tool-btn" data-action="alt-text" title="Alt text">Alt</button>
<button class="img-tool-btn" data-action="delete" title="Delete image" style="color:#ff6b6b;">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
</button>`;
    }

    buildResizeHandles() {
        return ['nw','n','ne','w','e','sw','s','se'].map(dir =>
            `<div class="img-resize-handle ${dir}" data-dir="${dir}"></div>`
        ).join('');
    }

    /* ═══ Bind Figure Events ═══════════════ */
    bindFigure(figure) {
        const img = figure.querySelector('img');
        const wrapper = figure.querySelector('.img-wrapper');

        // Select on click
        wrapper.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.img-editor-toolbar') && !e.target.closest('.img-opacity-slider')) {
                e.preventDefault();
                this.selectFigure(figure);
            }
        });

        // Toolbar actions
        figure.querySelector('.img-editor-toolbar').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            e.stopPropagation();
            this.handleAction(btn.dataset.action, figure, img);
        });

        // Opacity slider
        figure.querySelector('.img-opacity-slider')?.addEventListener('input', (e) => {
            img.style.opacity = (e.target.value / 100).toFixed(2);
        });

        // 8-point resize
        this.bindResize(figure, img);

        // Drag to move (HTML5 drag API)
        this.bindDragMove(figure);
    }

    handleAction(action, figure, img) {
        switch(action) {
            case 'align-left':   this.setAlign(figure, 'left'); break;
            case 'align-center': this.setAlign(figure, 'center'); break;
            case 'align-right':  this.setAlign(figure, 'right'); break;
            case 'align-full':   this.setAlign(figure, 'full'); break;
            case 'crop':         this.startCrop(figure, img); break;
            case 'rotate-left':  this.rotate(figure, img, -90); break;
            case 'rotate-right': this.rotate(figure, img, 90); break;
            case 'flip-h':       this.flip(figure, img, 'h'); break;
            case 'flip-v':       this.flip(figure, img, 'v'); break;
            case 'filter':       this.showFilterMenu(figure); break;
            case 'border':       this.showBorderMenu(figure); break;
            case 'shadow':       this.showShadowMenu(figure); break;
            case 'alt-text':     this.editAltText(img); break;
            case 'delete':       figure.remove(); break;
        }
    }

    /* ═══ Alignment ═══════════════════════ */
    setAlign(figure, align) {
        figure.className = figure.className.replace(/img-align-\w+/, `img-align-${align}`);
    }

    /* ═══ Rotate ══════════════════════════ */
    rotate(figure, img, deg) {
        const current = parseInt(img.dataset.rotation || '0');
        const next = (current + deg + 360) % 360;
        img.dataset.rotation = next;
        this.applyTransform(img);
    }

    /* ═══ Flip ════════════════════════════ */
    flip(figure, img, axis) {
        if (axis === 'h') img.dataset.flipH = img.dataset.flipH === '1' ? '0' : '1';
        if (axis === 'v') img.dataset.flipV = img.dataset.flipV === '1' ? '0' : '1';
        this.applyTransform(img);
    }

    applyTransform(img) {
        const rot = img.dataset.rotation || '0';
        const fh  = img.dataset.flipH === '1' ? -1 : 1;
        const fv  = img.dataset.flipV === '1' ? -1 : 1;
        img.style.transform = `rotate(${rot}deg) scale(${fh}, ${fv})`;
    }

    /* ═══ 8-point Resize ══════════════════ */
    bindResize(figure, img) {
        figure.querySelectorAll('.img-resize-handle').forEach(handle => {
            let startX, startY, startW, startH, dir;
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                startX = e.clientX; startY = e.clientY;
                startW = img.offsetWidth; startH = img.offsetHeight;
                dir = handle.dataset.dir;
                const onMove = (ev) => {
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;
                    let newW = startW, newH = startH;
                    if (dir.includes('e')) newW = Math.max(50, startW + dx);
                    if (dir.includes('s')) newH = Math.max(50, startH + dy);
                    if (dir.includes('w')) newW = Math.max(50, startW - dx);
                    if (dir.includes('n')) newH = Math.max(50, startH - dy);
                    img.style.width  = newW + 'px';
                    img.style.height = newH + 'px';
                };
                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        });
    }

    /* ═══ Drag to Move ════════════════════ */
    bindDragMove(figure) {
        const moveHandle = figure.querySelector('.img-move-handle');
        if (!moveHandle) return;

        moveHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            figure.classList.add('dragging');
            let lastTarget = null;
            let indicator = null;

            const onMove = (ev) => {
                const el = document.elementFromPoint(ev.clientX, ev.clientY);
                const editor = document.getElementById('editor');
                if (!el || !editor?.contains(el)) return;

                // Find nearest block element
                const target = el.closest('p, h1, h2, h3, h4, div, li, blockquote') || el;
                if (target !== lastTarget && target !== figure) {
                    indicator?.remove();
                    indicator = document.createElement('div');
                    indicator.className = 'img-drop-indicator';
                    const rect = target.getBoundingClientRect();
                    if (ev.clientY < rect.top + rect.height / 2) {
                        target.before(indicator);
                    } else {
                        target.after(indicator);
                    }
                    lastTarget = target;
                }
            };

            const onUp = (ev) => {
                figure.classList.remove('dragging');
                if (indicator) {
                    indicator.replaceWith(figure);
                } else {
                    // No indicator shown — try caretRangeFromPoint
                    const range = document.caretRangeFromPoint?.(ev.clientX, ev.clientY);
                    if (range) {
                        range.insertNode(figure);
                    }
                }
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    /* ═══ Crop ════════════════════════════ */
    startCrop(figure, img) {
        if (figure.querySelector('.crop-overlay')) return;

        const wrapper = figure.querySelector('.img-wrapper');
        wrapper.style.position = 'relative';

        // Wait a tick to ensure layout is stable
        const W = img.offsetWidth  || parseInt(img.style.width)  || 400;
        const H = img.offsetHeight || parseInt(img.style.height) || 300;

        let crop = {
            x: Math.round(W * 0.1), y: Math.round(H * 0.1),
            w: Math.round(W * 0.8), h: Math.round(H * 0.8)
        };

        // ── Overlay container ────────────────
        const overlay = document.createElement('div');
        overlay.className = 'crop-overlay';
        overlay.style.cssText = `
            position:absolute; top:0; left:0;
            width:${W}px; height:${H}px;
            z-index:50; overflow:visible; pointer-events:none;`;

        // ── 4 dark panels (top/bottom/left/right) ─
        const mkPanel = () => {
            const d = document.createElement('div');
            d.style.cssText = 'position:absolute;background:rgba(0,0,0,0.58);pointer-events:none;';
            return d;
        };
        const pTop = mkPanel(), pBot = mkPanel(), pLeft = mkPanel(), pRight = mkPanel();

        // ── Crop selection box ───────────────
        const box = document.createElement('div');
        box.style.cssText = `
            position:absolute; border:2px solid #fff;
            cursor:move; box-sizing:border-box;
            pointer-events:auto;`;

        // Rule-of-thirds grid (CSS only, pointer-events:none)
        box.innerHTML = `
<div style="position:absolute;inset:0;pointer-events:none;">
  <div style="position:absolute;top:33.33%;left:0;right:0;height:1px;background:rgba(255,255,255,0.35)"></div>
  <div style="position:absolute;top:66.66%;left:0;right:0;height:1px;background:rgba(255,255,255,0.35)"></div>
  <div style="position:absolute;left:33.33%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.35)"></div>
  <div style="position:absolute;left:66.66%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.35)"></div>
</div>`;

        // ── 8 resize handles inside box ──────
        ['nw','n','ne','w','e','sw','s','se'].forEach(dir => {
            const h = document.createElement('div');
            h.className = `crop-handle ${dir}`;
            h.dataset.dir = dir;
            h.style.pointerEvents = 'auto';
            box.appendChild(h);
        });

        // ── Action buttons OUTSIDE the box ───
        // (inside overlay but positioned independently so no drag conflict)
        const actions = document.createElement('div');
        actions.style.cssText = `
            position:absolute; display:flex; gap:8px;
            z-index:60; pointer-events:auto; white-space:nowrap;`;
        actions.innerHTML = `
<button id="cropApply" style="
  padding:7px 18px;background:#4f85eb;color:white;border:none;
  border-radius:8px;font-size:0.8rem;font-weight:700;
  cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3);">✂ Apply Crop</button>
<button id="cropCancel" style="
  padding:7px 14px;background:rgba(0,0,0,0.65);color:white;
  border:none;border-radius:8px;font-size:0.8rem;
  cursor:pointer;">Cancel</button>`;

        overlay.appendChild(pTop);
        overlay.appendChild(pBot);
        overlay.appendChild(pLeft);
        overlay.appendChild(pRight);
        overlay.appendChild(box);
        overlay.appendChild(actions);
        wrapper.appendChild(overlay);

        // ── Layout update function ────────────
        const update = () => {
            // Dark panels
            pTop.style.cssText   += `left:0;top:0;width:100%;height:${crop.y}px;`;
            pBot.style.cssText   += `left:0;top:${crop.y+crop.h}px;width:100%;height:${Math.max(0,H-crop.y-crop.h)}px;`;
            pLeft.style.cssText  += `left:0;top:${crop.y}px;width:${crop.x}px;height:${crop.h}px;`;
            pRight.style.cssText += `left:${crop.x+crop.w}px;top:${crop.y}px;width:${Math.max(0,W-crop.x-crop.w)}px;height:${crop.h}px;`;
            // Crop box
            box.style.left   = crop.x + 'px';
            box.style.top    = crop.y + 'px';
            box.style.width  = crop.w + 'px';
            box.style.height = crop.h + 'px';
            // Action buttons below crop box, clamped to overlay
            const btnY = Math.min(crop.y + crop.h + 10, H - 44);
            const btnX = Math.max(0, Math.min(W - 200, crop.x + crop.w / 2 - 100));
            actions.style.left = btnX + 'px';
            actions.style.top  = btnY + 'px';
        };
        update();

        // ── Resize handles ────────────────────
        box.querySelectorAll('.crop-handle').forEach(handle => {
            handle.addEventListener('mousedown', e => {
                e.preventDefault(); e.stopPropagation();
                const sx = e.clientX, sy = e.clientY, sc = {...crop};
                const dir = handle.dataset.dir;
                const onMove = ev => {
                    const dx = ev.clientX - sx, dy = ev.clientY - sy;
                    const nc = {...sc};
                    if (dir.includes('e')) nc.w = Math.max(30, sc.w + dx);
                    if (dir.includes('s')) nc.h = Math.max(30, sc.h + dy);
                    if (dir.includes('w')) { nc.x = sc.x + dx; nc.w = Math.max(30, sc.w - dx); }
                    if (dir.includes('n')) { nc.y = sc.y + dy; nc.h = Math.max(30, sc.h - dy); }
                    nc.x = Math.max(0, Math.min(W - nc.w, nc.x));
                    nc.y = Math.max(0, Math.min(H - nc.h, nc.y));
                    nc.w = Math.min(W - nc.x, nc.w);
                    nc.h = Math.min(H - nc.y, nc.h);
                    Object.assign(crop, nc);
                    update();
                };
                const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        });

        // ── Drag box ──────────────────────────
        box.addEventListener('mousedown', e => {
            if (e.target.classList.contains('crop-handle')) return;
            e.preventDefault(); e.stopPropagation();
            const sx = e.clientX, sy = e.clientY, sc = {...crop};
            const onMove = ev => {
                crop.x = Math.max(0, Math.min(W - crop.w, sc.x + ev.clientX - sx));
                crop.y = Math.max(0, Math.min(H - crop.h, sc.y + ev.clientY - sy));
                update();
            };
            const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // ── Apply / Cancel ────────────────────
        actions.querySelector('#cropApply').addEventListener('click', e => {
            e.stopPropagation();
            this.applyCrop(img, crop, overlay);
        });
        actions.querySelector('#cropCancel').addEventListener('click', e => {
            e.stopPropagation();
            overlay.remove();
        });
    }

    applyCrop(img, crop, overlay) {
        const doCanvasCrop = () => {
            const canvas = document.createElement('canvas');
            const scaleX = img.naturalWidth  / (img.offsetWidth  || crop.w);
            const scaleY = img.naturalHeight / (img.offsetHeight || crop.h);
            canvas.width  = Math.round(crop.w * scaleX);
            canvas.height = Math.round(crop.h * scaleY);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img,
                Math.round(crop.x * scaleX), Math.round(crop.y * scaleY),
                canvas.width, canvas.height,
                0, 0, canvas.width, canvas.height
            );
            img.src = canvas.toDataURL('image/png');
            img.style.width  = crop.w + 'px';
            img.style.height = crop.h + 'px';
            overlay.remove();
        };

        // If crossOrigin already set or src is data URL — just crop
        if (img.src.startsWith('data:') || img.crossOrigin === 'anonymous') {
            try { doCanvasCrop(); } catch(err) { this.cropFallback(img, crop, overlay); }
            return;
        }

        // External URL: reload with crossOrigin then crop
        const originalSrc = img.src;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                doCanvasCrop();
            } catch(err) {
                // CORS blocked — use CSS clip as visual-only fallback
                this.cropFallback(img, crop, overlay);
            }
        };
        img.onerror = () => this.cropFallback(img, crop, overlay);
        img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + '_cors=' + Date.now();
    }

    /* CSS-clip fallback for CORS-blocked images */
    cropFallback(img, crop, overlay) {
        // Wrap img in a clipping container — no CORS needed, works always
        const dispW = img.offsetWidth  || parseInt(img.style.width)  || 400;
        const dispH = img.offsetHeight || parseInt(img.style.height) || 300;

        const container = document.createElement('div');
        container.style.cssText = `
            display:inline-block; overflow:hidden; position:relative;
            width:${crop.w}px; height:${crop.h}px; vertical-align:top;`;

        img.style.position = 'absolute';
        img.style.width    = dispW + 'px';
        img.style.height   = dispH + 'px';
        img.style.maxWidth = 'none';
        img.style.top      = `-${crop.y}px`;
        img.style.left     = `-${crop.x}px`;

        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        overlay.remove();
    }

    /* ═══ Filter Menu ═════════════════════ */
    showFilterMenu(figure) {
        this.showPickerMenu(figure, 'filter', [
            { cls: 'none',      label: 'Original' },
            { cls: 'grayscale', label: '⬛ B&W' },
            { cls: 'sepia',     label: '📜 Sepia' },
            { cls: 'warm',      label: '🔥 Warm' },
            { cls: 'cool',      label: '❄️ Cool' },
            { cls: 'vivid',     label: '🌈 Vivid' },
            { cls: 'fade',      label: '🌫 Fade' },
            { cls: 'noir',      label: '🌑 Noir' },
        ]);
    }

    /* ═══ Border Menu ═════════════════════ */
    showBorderMenu(figure) {
        this.showPickerMenu(figure, 'border', [
            { cls: 'none',   label: 'None' },
            { cls: 'thin',   label: 'Thin' },
            { cls: 'medium', label: 'Medium' },
            { cls: 'thick',  label: 'Thick' },
            { cls: 'round',  label: '⬜ Rounded' },
            { cls: 'circle', label: '⭕ Circle' },
        ]);
    }

    /* ═══ Shadow Menu ═════════════════════ */
    showShadowMenu(figure) {
        this.showPickerMenu(figure, 'shadow', [
            { cls: 'none', label: 'None' },
            { cls: 'soft', label: '💭 Soft' },
            { cls: 'hard', label: '🔲 Hard' },
            { cls: 'glow', label: '✨ Glow' },
        ]);
    }

    showPickerMenu(figure, type, options) {
        document.querySelectorAll('.img-picker-menu').forEach(m => m.remove());
        const menu = document.createElement('div');
        menu.className = 'img-picker-menu';
        menu.style.cssText = `
position:absolute;top:-80px;left:50%;transform:translateX(-50%);
background:#1a1a2e;border-radius:8px;padding:6px;display:flex;gap:4px;flex-wrap:wrap;
z-index:200;box-shadow:0 4px 20px rgba(0,0,0,0.35);width:220px;`;

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.style.cssText = `
background:rgba(255,255,255,0.07);border:none;color:#e0e0e0;border-radius:5px;
padding:4px 8px;font-size:0.68rem;cursor:pointer;white-space:nowrap;`;
            btn.textContent = opt.label;
            btn.addEventListener('click', () => {
                // Remove old class of this type
                figure.className = figure.className.replace(new RegExp(`img-${type}-\\w+`), `img-${type}-${opt.cls}`);
                menu.remove();
            });
            menu.appendChild(btn);
        });

        figure.querySelector('.img-wrapper').style.position = 'relative';
        figure.querySelector('.img-wrapper').appendChild(menu);
        setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 100);
    }

    /* ═══ Alt Text ════════════════════════ */
    editAltText(img) {
        const current = img.alt || '';
        const newAlt = prompt('Image alt text (for accessibility & EPUB/HTML exports):', current);
        if (newAlt !== null) img.alt = newAlt;
    }

    /* ═══ Clipboard Paste ══════════════════ */
    bindClipboardPaste() {
        document.getElementById('editor')?.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items || [];
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const reader = new FileReader();
                    reader.onload = (ev) => this.insertImage(ev.target.result, 'center');
                    reader.readAsDataURL(item.getAsFile());
                    return;
                }
            }
        });
    }

    /* ═══ Modal Insert ═════════════════════ */
    insertFromModal(src) {
        const align = document.getElementById('imgAlignSelect')?.value || 'center';
        const caption = document.getElementById('imgCaption')?.value || '';
        this.insertImage(src, align, caption);
    }

    /* ═══ Re-bind on load ══════════════════ */
    rebindExisting() {
        document.querySelectorAll('.img-figure').forEach(f => this.bindFigure(f));
    }
}

/* Replace the old imageManager */
window.imageManager = new ImageEditor();
