// One-off: serialize the existing TS content into JSON data files that the
// control panel can safely read/write. Run with Node 24 (type stripping).
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { content } from "../src/data/content.ts";
import { brand, contactInfo, nav, ui } from "../src/data/site.ts";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, "../src/data");
const contentDir = resolve(dataDir, "content");
mkdirSync(contentDir, { recursive: true });

const w = (p: string, obj: unknown) =>
  writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");

w(resolve(contentDir, "ar.json"), content.ar);
w(resolve(contentDir, "en.json"), content.en);
w(resolve(dataDir, "site.json"), { brand, contactInfo, nav, ui });

// Theme tokens — the editable brand palette (mirrors global.css defaults).
const theme = {
  colors: {
    navy: "#11335e",
    green: "#2c7a5b",
    green700: "#1f5a42",
    gold: "#be8c3a",
    gold600: "#a6792e",
    ink: "#18202b",
    slate: "#5b6573",
    cloud: "#e6eaf0",
    paper: "#f5f7fa",
  },
  radius: {
    button: "6px",
    card: "10px",
    panel: "16px",
  },
};
w(resolve(dataDir, "theme.json"), theme);

console.log("Wrote ar.json, en.json, site.json, theme.json");
