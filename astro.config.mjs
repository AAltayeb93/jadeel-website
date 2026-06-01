// @ts-check
import { defineConfig } from 'astro/config';

// Jadeel Business Solutions — bilingual (Arabic default / English) website.
// Arabic is the primary reading direction (RTL); English is the mirrored exception.
// --- GitHub Pages settings -------------------------------------------------
// When hosted at  https://USERNAME.github.io/REPO/  set:
//   site = 'https://USERNAME.github.io'   base = '/REPO'
// When using a custom domain (e.g. jadeel.sa) set:  site = 'https://jadeel.sa'  base = '/'
// Override without editing this file via env vars, e.g.  SITE=... BASE=... npm run build
// Served from the custom domain jadeel.sa at the root, so BASE = "/".
const SITE = process.env.SITE || 'https://jadeel.sa';
const BASE = process.env.BASE || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  i18n: {
    defaultLocale: 'ar',
    locales: ['ar', 'en'],
    routing: {
      prefixDefaultLocale: false, // ar at "/", en at "/en/"
    },
  },
  build: {
    assets: 'assets',
  },
});
