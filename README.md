# Nutrient Calculator

Mobile-first PWA for multi-brand hydroponic nutrient calculation, styled with native iOS design language.

## Manufacturers & Lines

| Manufacturer | Lines |
|---|---|
| **General Hydroponics** | Classic (3/6/10-Part) · FloraPro · BioThrive · MaxiSeries · FloraNova (1/4/8-Part) |
| **Athena** | Pro Line (dry) · Blended Line (liquid) |
| **Jack's Nutrients** | 321 (Part A · Epsom · Part B) |

## Flow

Fertilizer → Medium → Brand → System → Crop → Stage → Settings → Supplements → Results

The **Brand** step only appears when a manufacturer has more than one line, and the **System** step only appears when a line has more than one variation, so simpler programs like Jack's 321 skip straight ahead.

## Features

- 9-step wizard, manufacturer-aware (auto-skips Brand/System when there's only one option)
- 7 growth stages including Peak Flower for fruiting crops
- iOS design language — SF Pro fonts, grouped backgrounds, frosted nav, blue/green/gray progress dots
- Substrate-aware dosing — Hydro / Inert / Potting / Soil
- Substrate-specific cal-mag scaling (full in coco, reduced in lime-amended and soil)
- Athena EC targets mapped onto Light / Medium / Aggressive tiers
- Jack's 3-2-1 with correct mix order (Part A → Epsom → Part B)
- EC budget with per-plant ceiling alerts
- Always-visible mixing order with numbered product rows
- Gram totals for dry concentrate systems

## Deploy to Netlify

1. Create a GitHub repo and upload all files from this folder
2. At netlify.com → Add new site → Import from GitHub → select the repo
3. `netlify.toml` handles build settings — click Deploy

## Install on iPhone

Open the live URL in Safari → Share → Add to Home Screen → Add.

## Local dev

```bash
npm install
npm run dev
npm run build
```
