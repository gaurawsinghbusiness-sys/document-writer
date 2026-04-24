# ✍️ Document Writer — Pro Book Writing & Publishing Tool

> A professional-grade, browser-based book writing suite — write, format, and publish like a pro.

🌐 **Live:** [documentriter.netlify.app](https://documentriter.netlify.app/)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/gaurawsinghbusiness-sys/document-writer)

---

## ✨ Features

### 🖊️ Writer Mode
- **Editable margin rulers** — drag or type exact values (Top / Bottom / Left Gutter / Right)
- **Visual page guides** — dashed margin zones, header/footer zones visible while writing
- **Page number formats** — `1, 2, 3` / `Page 1` / `i, ii, iii` — start from custom page, skip title page
- **Page size selector** — A4, 6×9 (KDP), 5×8, 5.5×8.5, Letter
- **Visual page break indicators** — dashed lines showing page boundaries
- All helpers **vanish on export** — clean professional PDF output

### 👁️ Preview / Export Mode
- One-click toggle — see exactly how your document exports
- Amber preview banner — clear visual signal you're in export view

### ⚡ One-Click Export Presets
| Preset | Size | Font | Margins |
|--------|------|------|---------|
| KDP Manuscript | 6×9" | Times New Roman 12pt | 0.875" gutter |
| Amazon POD | 5.5×8.5" | Georgia 12pt | Bleed-ready |
| Gumroad PDF | Letter | Georgia 13pt | 1" all sides |
| EPUB / eBook | 6×9" | Georgia 12pt | Standard |
| DOCX / Word | Letter | Calibri 11pt | 1" all sides |
| Print PDF | A4 | Georgia 12pt | Standard |

### 🖼️ Image Editor
- Insert from local file, URL, or **paste from clipboard**
- **Crop** with rule-of-thirds overlay and 8 drag handles
- **Rotate** (90° left/right), **Flip** (horizontal/vertical)
- **8 filter presets** — Original, B&W, Sepia, Warm, Cool, Vivid, Fade, Noir
- **6 border styles** — None, Thin, Medium, Thick, Rounded, Circle
- **4 shadow styles** — None, Soft, Hard, Glow
- **Opacity slider**, **Alt text** for accessibility
- **Drag to reposition** within editor flow
- Caption field — exports as `<figcaption>`

### 🧘 Zen Mode (F11)
- Header & toolbar **slide away completely** — no opacity tricks
- **Warm dark (#1a1410)** writing canvas — like a dimly lit study
- Page gets a **warm amber glow** while typing
- **Floating HUD** at bottom — live word count, reading time, daily goal %
- **Focus Mode** (from HUD) — dims all paragraphs except the one you're typing
- **Typewriter scroll** — cursor stays at 42% from screen top automatically
- **Peek controls** — move mouse to top 60px → header slides back in
- Exit with `ESC`, `F11`, or the HUD button

### 📊 Stats Bar
- Live **word count**, **character count**, **reading time**
- **Session words today** tracker
- **Daily goal** progress bar (configurable)
- **Jump-to-page** input

### 📋 Research Notes Panel
- 3-tab panel: Notes / Characters / References
- Saved **per chapter** in localStorage
- **Never exported** — invisible in any output format

### ⏱️ Version Snapshots
- Named saves with restore modal
- Up to 20 snapshots stored locally

### 🎨 Themes
- Light, Dark, Sepia, Forest, Ocean, Midnight and more
- Applied instantly with smooth transitions

---

## 🚀 Deploy Your Own

### Option 1: Netlify Drag & Drop
1. Download / clone this repo
2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag the folder onto the deploy zone
4. Live in 30 seconds

### Option 2: One-Click Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/gaurawsinghbusiness-sys/document-writer)

### Option 3: Vercel
```bash
npx vercel
```

### Option 4: GitHub Pages
Settings → Pages → Deploy from branch `master` → root `/`

---

## 📁 Project Structure

```
document-writer/
├── index.html           # Main app shell
├── manifest.json        # PWA manifest (installable)
├── sw.js                # Service worker (offline support)
├── netlify.toml         # Netlify config + security headers
├── css/
│   ├── main.css         # Core design system + tokens
│   ├── editor.css       # Page & content styles
│   ├── toolbar.css      # Toolbar & controls
│   ├── themes.css       # All theme definitions
│   ├── writer-mode.css  # Ruler, margin guides, page badges
│   ├── features.css     # Zen mode, Notes panel
│   └── image-editor.css # Image toolbar, crop overlay
├── js/
│   ├── app.js           # Init & module wiring
│   ├── editor.js        # ContentEditable engine
│   ├── toolbar.js       # Toolbar actions & modals
│   ├── page-system.js   # Rulers, margins, page numbers
│   ├── image-manager.js # Full image editor
│   ├── features.js      # Zen mode, presets, notes, snapshots
│   ├── export-pro.js    # PDF / DOCX / EPUB export engine
│   └── themes.js        # Theme switcher
└── templates/
    ├── fiction.json
    ├── nonfiction.json
    └── poetry.json
```

---

## 🛠️ Tech Stack

- **Pure HTML + CSS + Vanilla JS** — zero framework, zero dependencies
- **localStorage** — documents persist between sessions
- **Canvas API** — image cropping
- **Service Worker** — offline-first PWA
- **CSS Custom Properties** — dynamic theming & margin control

---

## 📝 License

MIT — free to use, modify, and deploy.
