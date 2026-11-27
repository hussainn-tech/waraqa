# WARAQA · وَرَقة

**ورقة تُزرع، وأثر يبقى · A paper that's planted, an impact that stays.**

WARAQA collects a company's office paper and turns it into that company's own plantable products, printed with its logo and made by young Bahrainis, then counts the impact for its ESG report.

This repository is the live product demo for the **Mutamahin Startup Pitch Challenge 2026**: a 10-second opening film, then the working client app, **WARAQA for Business**. It runs on a laptop, a projector or a phone.

## The 60-second demo

| Time | What you do | What the judges see |
|------|-------------|---------------------|
| 0–10 s | Open the page, tap **Tap to begin** | Yesterday's waste: an office memo flutters down, is shredded, swirls into pulp while seeds fall in, and the fibres grow into a living leaf that becomes the WARAQA mark. |
| 10 s | Tap **Start the demo** | The app opens through the leaf, on Alba's account (illustrative data). |
| 10–20 s | Overview | Paper flowing from Alba's bins into products, recyclers and stock; a live studio feed; impact so far; the plan and upcoming occasions. |
| 20–38 s | **Design** on an occasion, switch product, tap the preview | Waraqi the studio robot greets the team. The live mock-up carries Alba's logo. Tap it for a 3D showcase: turn it, flip it to the planting guide, plant it. **Place order** packs it into a WARAQA box. |
| 38–50 s | The order plays automatically | The camera glides through the WARAQA studio: collect, pulp, seed, form & press, dry, create, deliver. Judges can scan the real QR code for the item's passport. |
| 50–60 s | **Impact & ESG** → **Download ESG report (PDF)** | Trees, water, energy and landfill saved, the 15-tonne Year-1 goal, and a three-page ESG report with a GRI index. |

**Start from scratch** (on the opening screen, or in the company menu) creates a real, empty account: type any company name, upload a logo, pick a plan, and optionally upload past paper data as a CSV.

### Company menu

Tap the company card in the sidebar (or the logo at the top right on a phone) to:
- switch between four demo companies: Alba (main), National Bank of Bahrain, Bapco Energies and University of Bahrain (logos from Wikimedia; all figures are illustrative),
- start from scratch,
- replay the opening.

## Sound

The opening has its own soundtrack, generated live in the browser (`assets/js/sound.js`), with no audio files and no licences: paper flutter and sparse felt piano, a muffled shred, a water swirl with seed ticks, then a warm swell, an oud-style phrase and a chime as the leaf forms, resolving and fading out by 10 seconds so you can speak. Browsers only allow sound after a tap, so the page opens on **Tap to begin** (or **Start without sound**). The speaker button at the top left mutes it; the setting is remembered.

## What is in the app

- **Overview**: animated paper flow, live studio feed, impact, occasions with order-by dates, plan and WARAQA Days left, weekly pickups.
- **Design studio**: 9 products at the deck's prices, seasonal Bahraini seeds, Waraqi the assistant, a 3D showcase (spin, flip, plant), and **Create your own**: a toolbox of shapes and elements you drag into place, then **Send to a designer**, which opens an email to `W.DESIGN_EMAIL` in `assets/js/data.js`.
- **Orders**: the illustrated studio following the deck's six making steps plus delivery, a production log, the QR passport and the approved design.
- **Impact & ESG**: EPA factors per tonne (17 trees, 26,500 L water, 4,100 kWh, 2,500 L landfill), where the paper went (products, licensed recyclers, stock), the Year-1 goal, a written ESG summary, a downloadable PDF report, CSV or manual data import, and Bahrain's waste context.
- **WARAQA Days**: five activities with dates you can book; included days follow the plan (Seedling 1, Grove 2, Forest 4), extra days BD 750.
- **Impact passport** (`#/p/…`): the phone page each QR code opens, with the front and back of the item, the maker's first name, the seed, planting steps and an "I planted it" button.

Prices and plans follow the CFO section: Seedling BD 150, Grove BD 250, Forest BD 400 a month, with a free 3-month pilot; products from BD 0.250 to BD 3.500 per item.

All dates are calculated from today's date. Data is saved in the browser.

## Run locally

Static site, no build step. The QR and PDF libraries are bundled in `assets/vendor`, so everything except the web fonts works offline.

```bash
npx http-server@14.1.1 -p 5173
# then open http://localhost:5173  (add ?nointro to skip the opening while rehearsing)
```

## Hosting

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**. When the demo runs from `localhost`, QR codes point to `PUBLIC_URL` at the top of `assets/js/app.js`.

## Structure

```
index.html              opening film + app shell
assets/css/app.css      all styling and animation
assets/js/data.js       plans, products, seeds, occasions, activities, demo companies, saved state
assets/js/render.js     seed-paper textures, client logo, product mock-ups (front and back), Waraqi, custom builder, icons
assets/js/intro.js      the opening film (canvas particles + SVG leaf)
assets/js/sound.js      the opening's generated soundtrack (Web Audio)
assets/js/factory.js    the illustrated studio for the production tracker
assets/js/app.js        screens, routing, order flow, showcase, ESG writer and PDF, WARAQA Days, passport
assets/img/             team photos and seed photos
assets/vendor/          qrcode.js (MIT), jsPDF (MIT)
```
