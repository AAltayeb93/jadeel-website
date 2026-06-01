# Jadeel Business Solutions — Website / موقع جديل لحلول الأعمال

A bilingual (Arabic-first / English) marketing + sales website for **Jadeel Business
Solutions**, built with [Astro](https://astro.build). Arabic is the default reading
direction (RTL) at `/`; English (LTR) lives under `/en/`.

Design follows the official **Brand Guidelines v1.0 (2026)** — Navy `#11335E`,
Green `#2C7A5B`, Gold `#BE8C3A`, El Messiri (Arabic display) + Readex Pro (body/UI).

## Running locally

This machine uses Node via nvm. In a new terminal:

```bash
# load Node (v24 LTS installed via nvm)
export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"

cd jadeel-website
npm install        # first time only
npm run dev        # dev server at http://localhost:4321
npm run build      # production build into dist/
npm run preview    # preview the built site
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, Cloudflare Pages,
GitHub Pages, or a plain web server).

## Control panel (لوحة التحكم) — edit content without code

A local, Arabic, no-code editor ships with the project. It edits the site's text,
images and colours directly, then you rebuild to publish.

```bash
export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"
cd jadeel-website
npm run panel     # → open http://localhost:4400 in Chrome or Edge
```

In the panel: click **«ربط مجلد المشروع»**, pick the `jadeel-website` folder, allow
editing — then use the tabs:
- **📝 المحتوى** — all page text, Arabic & English, with add/remove lists.
- **🖼️ الصور والشعار** — replace the logo and favicons.
- **🎨 الألوان والتصميم** — brand colours + corner radius, with live preview.
- **📰 المقالات** — add/edit/delete Knowledge articles.

Click **«حفظ كل التغييرات»** to save, then `npm run build` (or keep `npm run dev`
running to preview live). Full Arabic guide: open **`control-panel/guide.html`** in a
browser (or the "📖 دليل الاستخدام" link on the panel's welcome screen).

> Requires Chrome or Edge (they support saving straight into the files). The panel is
> a local tool only — it is **not** part of the deployed `dist/` site.

### How content is stored
The panel reads/writes plain data files, which the site imports:
`src/data/content/ar.json`, `src/data/content/en.json`, `src/data/site.json`,
`src/data/theme.json`, and `src/content/articles/*.md`. You can also edit these by hand.

## Pages (9 × 2 languages = 18 routes)

| Arabic (`/`)        | English (`/en/…`)       | Page              |
|---------------------|-------------------------|-------------------|
| `/`                 | `/en/`                  | Home / الرئيسية   |
| `/about`            | `/en/about`             | About / من نحن    |
| `/services`         | `/en/services`          | Services / خدماتنا|
| `/products`         | `/en/products`          | Products / منتجات |
| `/methodology`      | `/en/methodology`       | Methodology       |
| `/sectors`          | `/en/sectors`           | Sectors / القطاعات|
| `/cases`            | `/en/cases`             | Case Models       |
| `/knowledge`        | `/en/knowledge`         | Knowledge / المعرفة|
| `/contact`          | `/en/contact`           | Contact / تواصل   |

## Project structure

```
src/
  data/
    content.ts      # all page copy, keyed by locale (ar / en)
    site.ts         # nav, footer, UI strings, contact info, brand
  i18n.ts           # locale + routing helpers (dir, paths, alt-locale)
  layouts/BaseLayout.astro   # <html lang/dir>, head/SEO, fonts, header+footer
  components/       # Header, Footer, Icon, PageHero, FeatureCard, CTABand
  views/            # one component per page (locale-agnostic)
  pages/            # thin route files: ar at root, en under /en
  content/articles/ # Knowledge articles (Markdown, 3 ar + 3 en)
  styles/global.css # design tokens + component styles
public/
  logo/             # mark-color, mark-white, primary-stack (from brand PDF)
  favicon*.png/.ico
```

### Editing content
Use the **control panel** (above) — or edit the JSON/Markdown directly: page text in
`src/data/content/{ar,en}.json`, chrome in `src/data/site.json`, colours in
`src/data/theme.json`, and Knowledge articles as Markdown in `src/content/articles/`
(set `locale` in the frontmatter — see existing files).

## ⚠️ Before going live — placeholders to fill

These were left as placeholders because the source profile marked them "to be set later":

- **Phone number** — `src/data/site.ts` → `contactInfo.phone` / `phoneDisplay`.
- **Email** — currently `hello@jadeel.sa` (update if different).
- **Social links** — `contactInfo.social` hrefs are `#`.
- **Contact form** — currently validates and shows a success message client-side
  only. Wire `src/views/ContactView.astro`'s form to an email service or endpoint
  (e.g. Formspree, a serverless function, or your CRM).
- **Domain** — `astro.config.mjs` → `site: "https://jadeel.sa"` (used for canonical/OG URLs).
