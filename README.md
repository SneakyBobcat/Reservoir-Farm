# Reservoir

Mobile-first PWA for multi-brand hydroponic nutrient calculation, styled with native iOS design language. Live at **reservoir.farm**.

## Manufacturers & Lines

**17 manufacturers, 38 base systems.** Each line carries its own products, mixing order, EC ranges, and gap-based supplement logic.

### Mineral & Synthetic

| Manufacturer | Lines |
|---|---|
| **General Hydroponics** | Classic (3/6/10-Part) · FloraPro (Standard/High-EC) · BioThrive (Basic/Custom) · MaxiSeries (Indoor/Outdoor) · FloraNova (1/4/8-Part) |
| **Advanced Nutrients** | pH Perfect Trio · pH Perfect Sensi · pH Perfect Connoisseur · Jungle Juice · Iguana Juice |
| **Botanicare** | Pure Blend Pro · CNS17 · KIND |
| **Fox Farm** | Liquid Trio (Grow Big · Tiger Bloom · Big Bloom) |
| **CANNA** | Coco A+B · Terra |
| **Athena** | Pro Line (dry) · Blended Line (liquid) |
| **Humboldts Secret** | Starter Kit (Base A+B · Golden Tree) |
| **Emerald Harvest** | Cali Pro (Grow · Micro · Bloom) |
| **House & Garden** | Aqua Flakes · Cocos · Soil |
| **Dyna-Gro** | Grow & Bloom · Foliage Pro |
| **Technaflora** | B.C. Grow & Bloom |
| **Remo Nutrients** | Grow · Micro · Bloom |
| **Heavy 16** | Veg & Bud A+B |
| **Mills Nutrients** | Basis A+B |

### Dry & Powder

| Manufacturer | Lines |
|---|---|
| **Jack's Nutrients** | 321 (Part A · Epsom · Part B) |

### Organic

| Manufacturer | Lines |
|---|---|
| **Roots Organics** | Buddha Grow & Bloom |
| **Nectar for the Gods** | Greek Goddess (Medusa's Magic · Gaia Mania · Demeter's Destiny · Zeus Juice · Herculean Harvest) |

## Flow

Fertilizer → Medium → Brand → System → Crop → Stage → Settings → Supplements → Results

The **Brand** step only appears when a manufacturer has more than one line, and the **System** step only appears when a line has more than one variation, so simpler programs like Jack's 321 skip straight ahead.

## Features

- 9-step wizard, manufacturer-aware (auto-skips Brand/System when there's only one option)
- Searchable, category-grouped home page (Mineral · Organic · Dry) that scales to all 17 brands
- 7 growth stages including Peak Flower, gated to fruiting crops (tomatoes, cannabis, peppers, cucumbers, strawberries, roses)
- iOS design language — SF Pro fonts, grouped backgrounds, frosted nav, blue/green/gray progress dots
- Substrate-aware dosing — Hydro / Inert / Potting / Soil — with separate cal-mag scaling per medium
- Feed-strength tiers (Light / Medium / Aggressive) with DLI-based light guidance
- Gap-based supplement engine: a supplement is flagged **Recommended** only when the selected base actually leaves that gap
  - Cal-Mag is base-aware per system (full / lean / none)
  - Fulvic/Humic is base-aware (skipped when the base already contains humic acids)
  - Silica, PK, sulfur, root, enzyme each explain why the base does or doesn't cover them
- EC budget with per-plant ceiling alerts
- Always-visible mixing order with numbered product rows
- Gram totals for dry concentrate systems
- Link to each brand's **official feeding chart** on the Results page — direct to the product's PDF/schedule where available, manufacturer feed-chart page otherwise
- **My Tent** — save multiple plants and compare their feeds side by side, with mixed-phase and EC-spread warnings
- Offline-capable PWA, installable to the iPhone home screen

## Deploy to Netlify

1. Create a GitHub repo and upload all files from this folder
2. At netlify.com → Add new site → Import from GitHub → select the repo
3. `netlify.toml` handles build settings — click Deploy
4. Point the **reservoir.farm** domain at the Netlify site (Netlify → Domain settings → Add custom domain)

## Install on iPhone

Open https://reservoir.farm in Safari → Share → Add to Home Screen → Add.

## Before going live

- In `public/security.txt` and `public/.well-known/security.txt`, replace `REPLACE_WITH_YOUR_EMAIL@example.com` with a real contact address.
- If you ever change the domain, update the canonical/sitemap references in `index.html`, `public/robots.txt`, `public/sitemap.xml`, and both `security.txt` files.

## Local dev

```bash
npm install
npm run dev
npm run build
```
