// Generate .pages.yml for PagesCMS by introspecting the real content files.
// Generating from the actual JSON guarantees EVERY field is mapped → no data loss.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const read = (p) => JSON.parse(readFileSync(resolve(root, p), "utf8"));

const ar = read("src/data/content/ar.json");
const en = read("src/data/content/en.json");
const site = read("src/data/site.json");
const theme = read("src/data/theme.json");

const ICON_NAMES = ["arrow-left","blocks","braid","briefcase","building","check","clock","compass",
"diagnose","eye","feather","fingerprint","flask","gauge","gift","handshake","instagram","landmark",
"layers","layout","link","linkedin","mail","microscope","model","phone","pin","presentation","pulse",
"report","rocket","ruler","search","seedling","shield","shield-check","target","trending","users",
"whatsapp","x"];

const LABELS = {
  meta:"إعدادات SEO (عناوين الصفحات)", home:"الصفحة الرئيسية", about:"من نحن", services:"خدماتنا",
  products:"المنتجات", methodology:"المنهجية", sectors:"القطاعات", cases:"نماذج تطبيقية",
  knowledge:"المعرفة", contact:"تواصل معنا", hero:"القسم الافتتاحي", why:"قسم: لماذا جديل",
  audience:"قسم: من نخدم", caseFeature:"قسم: نموذج مميّز", finalCta:"الدعوة الأخيرة",
  positioning:"التموضع", notUs:"ما لا نكونه", promise:"وعدنا المهني", vmv:"الرؤية والرسالة والاسم",
  distinct:"ما يميّز منهجيتنا", outputs:"المخرجات", entities:"الجهات", domains:"المجالات",
  phases:"المراحل", families:"عائلات الخدمات", channels:"قنوات التواصل", requestTypes:"أنواع الطلبات",
  entityTypes:"أنواع الجهات", form:"حقول نموذج التواصل", title:"العنوان", desc:"الوصف",
  lead:"النص التمهيدي", eyebrow:"النص العلوي الصغير", text:"النص", summary:"الملخص", name:"الاسم",
  forWhom:"لمن يناسب؟", problem:"المشكلة التي يعالجها", duration:"المدة", nextStep:"الخطوة التالية",
  featured:"منتج مميّز", icon:"الأيقونة", n:"الرقم", cta:"نص الزر", label:"التسمية", value:"القيمة",
  items:"العناصر", points:"النقاط", steps:"الخطوات", questions:"الأسئلة", list:"القائمة",
  tags:"الوسوم", stats:"الأرقام", contactName:"اسم المسؤول", entityType:"نوع الجهة",
  service:"الخدمة المطلوبة", website:"رابط الموقع", email:"البريد", message:"الرسالة",
  submit:"زر الإرسال", field:"المجال", tagline:"الشعار النصي", fullName:"الاسم الكامل",
  phone:"رقم الهاتف", phoneDisplay:"نص الهاتف المعروض", city:"المدينة", social:"روابط التواصل",
  href:"الرابط", brand:"اسم الشركة", nav:"روابط القائمة", contactInfo:"بيانات التواصل",
  ar:"عربي", en:"إنجليزي", ui:"نصوص الواجهة", colors:"الألوان", radius:"استدارة الحواف",
  forms:"إعدادات النماذج", web3formsKey:"مفتاح نموذج التواصل (Web3Forms)", key:"المعرّف (لا تغيّره)",
  slug:"المعرّف (لا تغيّره)", navy:"الكحلي الأساسي", green:"الأخضر", green700:"الأخضر الداكن",
  gold:"الذهبي", gold600:"الذهبي الداكن", ink:"لون النص", slate:"النص الثانوي", cloud:"الحدود الفاتحة",
  paper:"خلفية الأقسام", button:"الأزرار", card:"البطاقات", panel:"الألواح",
};
const labelFor = (k) => LABELS[k] || k;

// Build a PagesCMS field definition for value `v` at key `k`.
function field(k, v) {
  const f = { name: k, label: labelFor(k) };
  if (Array.isArray(v)) {
    f.list = true;
    const first = v[0];
    if (first && typeof first === "object") {
      f.type = "object";
      f.fields = Object.keys(first).map((sk) => field(sk, first[sk]));
    } else {
      f.type = "string";
    }
    return f;
  }
  if (v && typeof v === "object") {
    f.type = "object";
    f.fields = Object.keys(v).map((sk) => field(sk, v[sk]));
    return f;
  }
  if (typeof v === "boolean") { f.type = "boolean"; return f; }
  if (typeof v === "number") { f.type = "number"; return f; }
  // strings
  if (k === "icon") { f.type = "select"; f.options = { values: ICON_NAMES }; return f; }
  if (String(v).length > 70 || String(v).includes("\n")) f.type = "text";
  else f.type = "string";
  return f;
}

const fieldsOf = (obj) => Object.keys(obj).map((k) => field(k, obj[k]));

const config = {
  media: { input: "public/images", output: "/images" },
  content: [
    {
      name: "articles",
      label: "المقالات",
      type: "collection",
      path: "src/content/articles",
      filename: "{fields.locale}-{year}{month}{day}{hour}{minute}.md",
      view: { fields: ["title", "locale", "date"] },
      fields: [
        { name: "title", label: "العنوان", type: "string" },
        { name: "description", label: "الوصف", type: "text" },
        { name: "locale", label: "اللغة", type: "select", options: { values: [
          { value: "ar", label: "عربي" }, { value: "en", label: "English" } ] }, default: "ar" },
        { name: "date", label: "التاريخ", type: "date" },
        { name: "category", label: "التصنيف", type: "string", required: false },
        { name: "readingTime", label: "مدة القراءة", type: "string", required: false },
        { name: "body", label: "نص المقال", type: "rich-text" },
      ],
    },
    { name: "content_ar", label: "محتوى الصفحات (عربي)", type: "file",
      path: "src/data/content/ar.json", fields: fieldsOf(ar) },
    { name: "content_en", label: "محتوى الصفحات (إنجليزي)", type: "file",
      path: "src/data/content/en.json", fields: fieldsOf(en) },
    { name: "site", label: "إعدادات الموقع (الاسم، التواصل، القائمة)", type: "file",
      path: "src/data/site.json", fields: fieldsOf(site) },
    { name: "theme", label: "الألوان والتصميم", type: "file",
      path: "src/data/theme.json", fields: fieldsOf(theme) },
  ],
};

/* ---- minimal YAML emitter (all strings double-quoted & escaped) ---- */
const q = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
function yaml(v, indent = 0) {
  const pad = "  ".repeat(indent);
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    return "\n" + v.map((item) => {
      if (item && typeof item === "object") {
        const inner = yaml(item, indent + 1).replace(/^\n/, "");
        return `${pad}- ` + inner.replace(new RegExp("^" + "  ".repeat(indent + 1)), "");
      }
      return `${pad}- ${typeof item === "string" ? q(item) : item}`;
    }).join("\n");
  }
  if (v && typeof v === "object") {
    const lines = Object.entries(v).map(([k, val]) => {
      if (val && typeof val === "object") return `${pad}${k}:${yaml(val, indent + 1)}`;
      return `${pad}${k}: ${typeof val === "string" ? q(val) : val}`;
    });
    return "\n" + lines.join("\n");
  }
  return typeof v === "string" ? q(v) : String(v);
}

const header = `# .pages.yml — إعداد PagesCMS (app.pagescms.org) لموقع جديل\n# مُولّد تلقائيًا من بنية المحتوى. لإعادة التوليد: node scripts/gen-pagescms.mjs\n`;
writeFileSync(resolve(root, ".pages.yml"), header + yaml(config).replace(/^\n/, "") + "\n", "utf8");
console.log("Wrote .pages.yml");
