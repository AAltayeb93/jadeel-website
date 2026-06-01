// i18n helpers — Arabic is the default locale at "/", English lives under "/en".
export type Locale = "ar" | "en";

export const LOCALES: Locale[] = ["ar", "en"];
export const DEFAULT_LOCALE: Locale = "ar";

export const dir = (locale: Locale): "rtl" | "ltr" => (locale === "ar" ? "rtl" : "ltr");

// Base path the site is served under (e.g. "" locally, "/jadeel-website" on GitHub Pages).
// Vite injects import.meta.env.BASE_URL from the `base` option in astro.config.mjs.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// Prefix a public asset (logo, favicon, image) with the base path.
export const asset = (p: string): string => `${BASE}${p.startsWith("/") ? p : "/" + p}`;

// The page "slug" keys shared across both locales -> their localized path segment.
// Arabic keeps clean Latin slugs for shareable URLs; both locales use the same paths.
export const ROUTES = {
  home: "",
  about: "about",
  services: "services",
  products: "products",
  methodology: "methodology",
  sectors: "sectors",
  cases: "cases",
  knowledge: "knowledge",
  contact: "contact",
} as const;

export type RouteKey = keyof typeof ROUTES;

// Build a localized href for a route key.
export function path(locale: Locale, key: RouteKey): string {
  const seg = ROUTES[key];
  const loc = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${BASE}${loc}/${seg}`.replace(/\/+$/, "") || "/";
}

// Given the current path, produce the equivalent path in the other locale.
export function altLocalePath(locale: Locale, key: RouteKey): string {
  const other: Locale = locale === "ar" ? "en" : "ar";
  return path(other, key);
}

export function localizedRoot(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? BASE || "/" : `${BASE}/${locale}`;
}
