import type { Locale } from "../i18n";
import arData from "./content/ar.json";
import enData from "./content/en.json";

/* Content is stored as JSON (editable via the control panel) and typed here. */
export interface Feature { icon: string; title: string; text: string; }
export interface Step { icon: string; n: string; title: string; text: string; }
export interface Product {
  slug: string;
  icon: string;
  name: string;
  summary: string;
  forWhom: string;
  problem: string;
  outputs: string[];
  duration: string;
  nextStep: string;
  featured?: boolean;
}
export interface ServiceFamily { icon: string; title: string; items: string[]; }
export interface CaseModel { icon: string; title: string; text: string; tags: string[]; }

// The JSON files share one identical shape; we take Arabic as the canonical type.
type SiteContent = typeof arData;

export const content: Record<Locale, SiteContent> = {
  ar: arData as SiteContent,
  en: enData as SiteContent,
};
