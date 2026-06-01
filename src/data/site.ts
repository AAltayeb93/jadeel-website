import type { Locale, RouteKey } from "../i18n";
import siteData from "./site.json";

/* Site chrome (brand, contact, nav, UI strings) — stored as JSON, editable
   via the control panel. */
export interface NavItem { key: RouteKey; label: string; }

export const brand = siteData.brand as Record<"name" | "tagline" | "fullName", Record<Locale, string>>;
export const contactInfo = siteData.contactInfo as {
  email: string;
  phone: string;
  phoneDisplay: Record<Locale, string>;
  city: Record<Locale, string>;
  social: { name: string; href: string; icon: string }[];
};
export const nav = siteData.nav as unknown as Record<Locale, NavItem[]>;
export const ui = siteData.ui as unknown as Record<Locale, Record<string, string>>;
export const forms = (siteData as { forms?: { web3formsKey?: string } }).forms ?? { web3formsKey: "" };
