# WARAQA · وَرَقة

**From your office bin to your ESG report.**

WARAQA collects a company's office paper and turns it into that company's own custom, plantable products: Eid cards, invitations, certificates, notebooks and gift packs, made by young Bahrainis. This repository holds the live demo for the **Mutamahin Startup Pitch Challenge 2026** (submit 26 Nov, present 28 Nov).

## The demo

One example order runs through the whole demo: Alba orders 500 Eid cards made from its own office paper.

| # | Screen | What happens |
|---|--------|--------------|
| S0 | Opening | A sheet of paper drops in, gets written on, then morphs into a leaf with a burst of paper fibres. |
| S1 | Custom studio | Pick a product, logo name, Arabic and English message, seed, paper colour and quantity. The preview, price and paper used update live. Confirm packs the item into a WARAQA box. |
| S2 | Order tracker | Six stages from paper collected to delivered. "Next stage" moves the order live on stage. Delivery updates the impact totals. |
| S3 | QR passport | A phone passport with count-up savings and a working QR code that opens `#passport`. |
| S4 | WARAQA Days | Book a make-and-plant morning. Seats fill and seeds burst. |
| S5 | Client account | Totals, a monthly chart and a generated ESG summary you can copy. |

### Presenting

- `→` / `PageDown`: next section · `←` / `PageUp`: previous section
- `N` while on the tracker: next stage
- "Replay opening" in the hero, or "Play it again" at the end
- Open `index.html#passport` to jump straight to the passport (this is where the QR code points)

## Run locally

It is a static site with no build step:

```bash
npx http-server@14.1.1 -p 5173
# then open http://localhost:5173
```

Or open `index.html` directly in a browser.

## Hosting

Any static host works (GitHub Pages, Netlify, Cloudflare Pages). For GitHub Pages: **Settings → Pages → Deploy from branch → `main` / root**.

When the site has its final URL, set `PUBLIC_URL` at the top of `assets/js/app.js` so the QR code always points to the hosted passport, for example:

```js
var PUBLIC_URL = 'https://<user>.github.io/waraqa/';
```

## Structure

```
index.html            page markup, sections S0 to S5
assets/css/styles.css design tokens, layout, animations
assets/js/app.js      opening morph, particles, studio, tracker, passport, days, impact
```

The only outside dependencies are Google Fonts (Bricolage Grotesque, IBM Plex Sans, IBM Plex Sans Arabic, IBM Plex Mono) and `qrcodejs` 1.0.0 from cdnjs. Animations respect `prefers-reduced-motion`.

## Data note

Alba is an illustrative example client. Orders, quantities and figures are examples, not real transactions. Impact numbers use EPA factors per tonne of recycled paper: 17 trees, 26.5 m³ of water and 4,100 kWh.
