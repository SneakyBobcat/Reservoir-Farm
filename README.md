# GH Nutrient Calculator

Mobile-first Progressive Web App for General Hydroponics nutrient systems, styled with native iOS design language.

## Supported Brands & Systems

| Brand | Systems |
|---|---|
| **Classic** | 3-Part Classic · 6-Part Advanced · 10-Part Professional |
| **FloraPro** | Standard · High EC |
| **BioThrive** | Basic 2-Part · Custom 7-Part |
| **MaxiSeries** | Indoor 2-Part · Outdoor 1-Part |
| **FloraNova** | 1-Part · 4-Part · 8-Part |

## Features

- 8-step wizard: Medium → Brand → System → Plant → Stage → Settings → Supplements → Results
- 7 growth stages including Peak Flower for fruiting crops
- iOS design language — SF Pro system fonts, grouped backgrounds, frosted nav, native button physics
- Substrate-aware dosing — Hydroponics / Inert / Potting Soil / Ground Soil
- Substrate-specific cal-mag scaling — full dose in coco (binds Ca), reduced in lime-amended potting mixes and Ca-rich soil
- Plant modifier toggle on Classic — crop-specific dose adjustments with agronomic reasoning
- Legal disclaimer accessible from the first page
- Water source calibration — Tap, Soft, RO/DI
- Light / Medium / Aggressive feed strength tiers
- EC budget with per-plant ceiling alerts
- Always-visible mixing order with numbered product rows
- FloraKleen included in 10-Part and FloraNova 8-Part flush stage
- Direct gram totals for dry concentrate systems
- Substrate-specific pH targets

---

## Deploy to Netlify

### 1 — Push to GitHub
1. Create a repo at **github.com**
2. Upload all files from this folder into the repo

### 2 — Connect to Netlify
1. Sign in at **netlify.com** with GitHub
2. **Add new site → Import an existing project → GitHub**
3. Select your repo — `netlify.toml` handles build settings automatically
4. Click **Deploy**

---

## Install on iPhone

1. Open the live URL in **Safari**
2. Tap **Share → Add to Home Screen**
3. Tap **Add** — runs full-screen, works offline

---

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → /dist
```

---

## Project structure

```
gh-nutrient-calculator/
├── index.html
├── vite.config.js
├── package.json
├── netlify.toml
├── public/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
└── src/
    ├── main.jsx
    └── App.jsx
```
