# WARAQA · وَرَقة

**From paper to purpose.** WARAQA collects a company's office paper and turns it into that company's own plantable products, printed with its logo and made by young Bahrainis, then counts the impact for its ESG report.

This repository is the live product demo for the **Mutamahin Startup Pitch Challenge 2026**: an opening film followed by a working client app, **WARAQA for Business**.

## The 60-second demo

| Time | What you do | What the judges see |
|------|-------------|---------------------|
| 0–8 s | Open the page | An office memo flutters down, is shredded into strips, swirls into pulp while seeds fall in, then the fibres fly into a living leaf that becomes the WARAQA mark. |
| 8–15 s | Press **Space**, type a company name (a judge's company works well) | The app opens through the leaf. The logo builds as you type, with an estimate of how much paper an office that size throws away. |
| 15–20 s | **Create account** | The overview: paper in stock, the next pickup, upcoming occasions (National Day, Ramadan, Eid), impact so far. |
| 20–38 s | Click **Design** on Bahrain National Day, switch products, pick a seed, **Place order** | The live mock-up changes with every choice and always shows the client's logo. The order is packed into a WARAQA box and flies into Orders. |
| 38–50 s | **Watch it being made** | Six animated stages: pickup, certified shredding, pulping, seed pressing, logo printing, delivery. A judge can scan the QR code to open the item's impact passport on their phone. |
| 50–60 s | **Impact & ESG** → **Write my ESG summary** | Trees, water, energy and landfill saved, progress towards the 15-tonne Year-1 goal, and an ESG paragraph (GRI 306-4) typed out from the numbers. |

### Keys

- `Space` / `Enter`: enter the app from the opening · `Esc`: skip the opening
- `N` on an order: move it to the next production stage
- `D`: show presenter controls (replay the opening, next stage, start again with a new company)
- Add `?nointro` to the URL to skip the opening, for example while rehearsing

## What is in the app

- **Sign-up**: company name, brand colour, logo upload (or drag a logo file onto the studio preview later), staff size.
- **Overview**: paper in stock, next pickup, upcoming occasions with order-by dates, orders, weekly pickups, WARAQA Days.
- **Design studio**: 9 products (greeting cards, invitations, certificates, business cards, notebooks, bookmarks, desk calendars, grow pots, gift packs), each with its own options. Seeds follow Bahrain's seasons: winter (sweet alyssum, sweet basil, marigold) and summer (purslane, zinnia, holy basil).
- **Orders**: live production tracker, certified shredding note, a real QR code, the approved design.
- **Impact & ESG**: EPA factors per tonne (17 trees, 26,500 L water, 4,100 kWh, 2,500 L landfill), the Year-1 goal and a generated ESG summary you can copy or download.
- **WARAQA Days**: book a make-and-plant morning for staff.
- **Impact passport** (`#/p/…`): the phone page each QR code opens.

All dates are calculated from today's date, so the demo always looks current. Data is saved in the browser; **D → New company** resets it.

## Run locally

It is a static site with no build step. The QR library is bundled in `assets/vendor`, so the app works without internet. Only the web fonts need a connection, and system fonts are used if there is none.

```bash
npx http-server@14.1.1 -p 5173
# then open http://localhost:5173
```

## Hosting

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**. The QR code uses the page's own address when it is hosted; when the demo runs from `localhost` it points to `PUBLIC_URL` at the top of `assets/js/app.js`.

## Structure

```
index.html              opening film + app shell
assets/css/app.css      all styling
assets/js/data.js       products, seeds, occasions, impact factors, saved state
assets/js/render.js     seed-paper textures, client logo, product mock-ups, icons
assets/js/intro.js      the opening film (canvas particles + SVG leaf)
assets/js/app.js        screens, routing, order flow, ESG writer, passport
assets/img/             team photos and seed photos
assets/vendor/          qrcode.js (MIT)
```
