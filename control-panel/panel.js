/* ============================================================================
   لوحة تحكم موقع جديل — Jadeel control panel
   Reads/writes the project's JSON, image and Markdown files directly via the
   File System Access API. No backend, no build step for the panel itself.
   ========================================================================== */

const PATHS = {
  ar: "src/data/content/ar.json",
  en: "src/data/content/en.json",
  site: "src/data/site.json",
  theme: "src/data/theme.json",
  articlesDir: "src/content/articles",
};

const THEME_DEFAULTS = {
  colors: { navy:"#11335e", green:"#2c7a5b", green700:"#1f5a42", gold:"#be8c3a",
            gold600:"#a6792e", ink:"#18202b", slate:"#5b6573", cloud:"#e6eaf0", paper:"#f5f7fa" },
  radius: { button:"6px", card:"10px", panel:"16px" },
};

// Friendly Arabic labels for keys (fallback = the key itself)
const LABELS = {
  meta:"إعدادات SEO (عناوين الصفحات)", home:"الصفحة الرئيسية", about:"من نحن",
  services:"خدماتنا", products:"المنتجات", methodology:"المنهجية", sectors:"القطاعات",
  cases:"نماذج تطبيقية", knowledge:"المعرفة", contact:"تواصل معنا",
  hero:"القسم الافتتاحي", why:"قسم: لماذا جديل", audience:"قسم: من نخدم",
  caseFeature:"قسم: نموذج مميّز", finalCta:"قسم: الدعوة الأخيرة", positioning:"التموضع",
  notUs:"ما لا نكونه", promise:"وعدنا المهني", vmv:"الرؤية والرسالة والاسم",
  distinct:"ما يميّز منهجيتنا", outputs:"المخرجات", entities:"الجهات", domains:"المجالات",
  phases:"المراحل", families:"عائلات الخدمات", channels:"قنوات التواصل",
  requestTypes:"أنواع الطلبات", entityTypes:"أنواع الجهات", form:"حقول نموذج التواصل",
  title:"العنوان", desc:"الوصف", lead:"النص التمهيدي", eyebrow:"النص العلوي الصغير",
  text:"النص", summary:"الملخص", name:"الاسم", forWhom:"لمن يناسب؟",
  problem:"المشكلة التي يعالجها", duration:"المدة", nextStep:"الخطوة التالية",
  featured:"منتج مميّز", icon:"الأيقونة", n:"الرقم", cta:"نص الزر", label:"التسمية",
  value:"القيمة", items:"العناصر", points:"النقاط", steps:"الخطوات", questions:"الأسئلة",
  list:"القائمة", tags:"الوسوم", stats:"الأرقام (إحصاءات)", contactName:"اسم المسؤول",
  entityType:"نوع الجهة", service:"الخدمة المطلوبة", website:"رابط الموقع", email:"البريد",
  message:"الرسالة", submit:"زر الإرسال", field:"المجال", names:"الاسم", tagline:"الشعار النصي",
  fullName:"الاسم الكامل", phone:"رقم الهاتف", phoneDisplay:"نص الهاتف المعروض", city:"المدينة",
  social:"روابط التواصل الاجتماعي", href:"الرابط", brand:"اسم الشركة", nav:"روابط القائمة",
  contactInfo:"بيانات التواصل", ar:"عربي", en:"إنجليزي",
};
const HIDDEN = new Set(["key", "slug"]); // structural — never edited in the panel

// Icons available in the site (mirror of src/components/Icon.astro)
const ICONS = {
  diagnose:`<path d="M5 3v4a4 4 0 0 0 8 0V3"/><path d="M9 11v3a6 6 0 0 0 6 6a4 4 0 0 0 4-4v-1"/><circle cx="19" cy="13" r="2"/>`,
  model:`<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>`,
  handshake:`<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0l-1.6 1.6a2 2 0 0 1-2.8 0l-.6-.6a2 2 0 0 1 0-2.8L11 5"/><path d="m21 3-3 3-3-3"/>`,
  report:`<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/>`,
  search:`<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  blocks:`<rect x="3" y="13" width="8" height="8" rx="1"/><path d="M13 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2Z"/><path d="M14 14h7v7h-7z"/>`,
  trending:`<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>`,
  presentation:`<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>`,
  flask:`<path d="M9 3h6"/><path d="M10 3v6.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9.5V3"/><path d="M7.5 14h9"/>`,
  link:`<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>`,
  compass:`<circle cx="12" cy="12" r="9"/><polygon points="16 8 10 10 8 16 14 14 16 8"/>`,
  layers:`<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>`,
  ruler:`<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z"/>`,
  gauge:`<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>`,
  fingerprint:`<path d="M12 10a2 2 0 0 0-2 2c0 1.5.5 3 2 4.5"/><path d="M6 12a6 6 0 0 1 12 0c0 2-.5 3.5-1 5"/><path d="M3.5 12a8.5 8.5 0 0 1 17 0c0 2.5-.5 4-1.5 6"/>`,
  "shield-check":`<path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6Z"/><path d="m9 12 2 2 4-4"/>`,
  feather:`<path d="M20 5a5 5 0 0 0-7 0L5 13v6h6l8-8a5 5 0 0 0 1-6Z"/><line x1="16" y1="8" x2="3" y2="21"/>`,
  pulse:`<path d="M3 12h4l2 6 4-14 2 8h6"/>`,
  gift:`<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/>`,
  briefcase:`<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M2 13h20"/>`,
  users:`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>`,
  landmark:`<line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/>`,
  rocket:`<path d="M5 13c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8a2 2 0 0 0-3 0Z"/><path d="M9 12c0-4 2-8 8-9 1 6-1 11-5 13"/>`,
  building:`<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h.01M12 7h.01M15 7h.01M9 11h.01M12 11h.01M15 11h.01"/>`,
  seedling:`<path d="M12 22V11"/><path d="M12 11C12 7 9 5 5 5c0 4 3 6 7 6Z"/><path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6Z"/>`,
  shield:`<path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6Z"/>`,
  layout:`<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>`,
  microscope:`<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z"/>`,
  eye:`<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>`,
  target:`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>`,
  braid:`<path d="M9 3c0 4 6 5 6 9s-6 5-6 9"/><path d="M15 3c0 4-6 5-6 9s6 5 6 9"/>`,
  mail:`<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>`,
  phone:`<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/>`,
  pin:`<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
  clock:`<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>`,
  check:`<polyline points="20 6 9 17 4 12"/>`,
  linkedin:`<path d="M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-4 0v6h-4v-12h4v1.5A4 4 0 0 1 16 8Z"/><rect x="2" y="9" width="4" height="11"/><circle cx="4" cy="4" r="2"/>`,
  x:`<path d="M4 4l16 16M20 4 4 20"/>`,
  instagram:`<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>`,
  whatsapp:`<path d="M3 21l1.6-5A8 8 0 1 1 8 18.4Z"/>`,
};
const ICON_NAMES = Object.keys(ICONS).sort();
const iconSVG = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||""}</svg>`;

/* ---- state ---- */
let dirHandle = null;
let data = { ar:null, en:null, site:null, theme:null };
let lang = "ar";
let currentPage = "home";

/* ---- DOM ---- */
const $ = (s) => document.querySelector(s);
const statusEl = $("#status"), saveBtn = $("#saveBtn"), linkBtn = $("#linkBtn");

/* ---- File System helpers ---- */
async function getFileHandle(path, create=false){
  const parts = path.split("/"); let dir = dirHandle;
  for(let i=0;i<parts.length-1;i++) dir = await dir.getDirectoryHandle(parts[i], {create});
  return dir.getFileHandle(parts[parts.length-1], {create});
}
async function getDir(path, create=false){
  let dir = dirHandle;
  for(const p of path.split("/").filter(Boolean)) dir = await dir.getDirectoryHandle(p, {create});
  return dir;
}
async function readText(path){ return (await (await getFileHandle(path)).getFile()).text(); }
async function readJSON(path){ return JSON.parse(await readText(path)); }
async function writeText(path, text){
  const w = await (await getFileHandle(path, true)).createWritable();
  await w.write(text); await w.close();
}
async function writeJSON(path, obj){ await writeText(path, JSON.stringify(obj, null, 2) + "\n"); }
async function readBlobURL(path){ return URL.createObjectURL(await (await getFileHandle(path)).getFile()); }
async function writeBlob(path, blob){
  const w = await (await getFileHandle(path, true)).createWritable();
  await w.write(blob); await w.close();
}

/* ---- status / toast ---- */
function setStatus(text, state="idle"){ statusEl.textContent = text; statusEl.dataset.state = state; }
function markDirty(){ saveBtn.disabled = false; setStatus("تغييرات غير محفوظة — لا تنسَ الحفظ", "linked"); }
let toastTimer;
function toast(msg, err=false){
  const el = $("#toast"); el.textContent = msg; el.className = "toast" + (err?" err":""); el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>{ el.hidden = true; }, 2600);
}

/* ---- Link project ---- */
async function linkProject(){
  // Guard: the API only works over http(s)://localhost in Chrome/Edge.
  if(!window.isSecureContext || !("showDirectoryPicker" in window)){
    toast("افتح اللوحة عبر http://localhost:4400 في Chrome أو Edge (لا تفتح الملف مباشرة)", true);
    setStatus("بيئة غير مدعومة", "error");
    return;
  }
  let picked;
  try{
    picked = await window.showDirectoryPicker({ mode:"readwrite", id:"jadeel-project" });
  }catch(e){
    if(e?.name === "AbortError") return; // user cancelled the dialog
    console.error(e);
    toast("تعذّر فتح نافذة المجلد: " + (e.name || e.message), true);
    return;
  }
  try{
    // Ensure we have read-write permission (some browsers need an explicit grant).
    if(picked.queryPermission){
      let p = await picked.queryPermission({ mode:"readwrite" });
      if(p !== "granted" && picked.requestPermission) p = await picked.requestPermission({ mode:"readwrite" });
      if(p && p !== "granted"){
        toast("الرجاء السماح بالتعديل (Edit/Allow) عند الطلب", true); return;
      }
    }
    dirHandle = picked;
    // Validate it's the right folder by reading a known file.
    try{ data.theme = await readJSON(PATHS.theme); }
    catch{
      dirHandle = null;
      toast("هذا ليس مجلد jadeel-website. اختر المجلد الذي يحوي package.json", true);
      setStatus("مجلد غير صحيح", "error"); return;
    }
    data.ar = await readJSON(PATHS.ar);
    data.en = await readJSON(PATHS.en);
    data.site = await readJSON(PATHS.site);
    if(!data.theme.colors) data.theme = structuredClone(THEME_DEFAULTS);
    $("#onboard").hidden = true; $("#app").hidden = false;
    setStatus("تم ربط المشروع ✓", "linked");
    buildContent(); buildImages(); buildDesign(); buildArticles();
    toast("تم ربط المشروع — يمكنك التعديل الآن");
  }catch(e){
    console.error(e); dirHandle = null;
    toast("تعذّر قراءة الملفات: " + (e.name || e.message), true);
    setStatus("خطأ", "error");
  }
}

/* ---- Save all JSON ---- */
async function saveAll(){
  if(!dirHandle) return;
  try{
    setStatus("جارٍ الحفظ…", "linked");
    await writeJSON(PATHS.ar, data.ar);
    await writeJSON(PATHS.en, data.en);
    await writeJSON(PATHS.site, data.site);
    await writeJSON(PATHS.theme, data.theme);
    saveBtn.disabled = true;
    setStatus("تم الحفظ ✓", "saved");
    toast("تم حفظ كل التغييرات ✓");
  }catch(e){ console.error(e); setStatus("فشل الحفظ", "error"); toast("حدث خطأ أثناء الحفظ", true); }
}

/* ============================ CONTENT TAB ============================ */
const labelFor = (k) => LABELS[k] || k;

function contentPages(){
  // page definitions: id, label, getter() -> object/array to edit, langScoped
  const pages = [];
  for(const k of ["meta","home","about","services","products","methodology","sectors","cases","knowledge","contact"])
    pages.push({ id:k, label:labelFor(k), get:()=>data[lang][k] });
  pages.push({ id:"__sep" });
  pages.push({ id:"__nav",   label:"روابط القائمة", get:()=>data.site.nav[lang] });
  pages.push({ id:"__contact", label:"بيانات التواصل", get:()=>data.site.contactInfo });
  pages.push({ id:"__brand", label:"اسم الشركة", get:()=>data.site.brand });
  return pages;
}

function buildContent(){
  const nav = $("#pageNav"); nav.innerHTML = "";
  for(const p of contentPages()){
    if(p.id === "__sep"){ const hr=document.createElement("hr"); hr.style.cssText="border:0;border-top:1px solid var(--cloud);margin:8px 4px"; nav.appendChild(hr); continue; }
    const b = document.createElement("button");
    b.textContent = p.label; b.dataset.id = p.id;
    if(p.id === currentPage) b.classList.add("active");
    b.onclick = ()=>{ currentPage = p.id; buildContent(); };
    nav.appendChild(b);
  }
  const def = contentPages().find(p => p.id === currentPage) || contentPages()[0];
  currentPage = def.id;
  const area = $("#formArea"); area.innerHTML = "";
  area.appendChild(renderNode(def.get(), labelFor(currentPage)));
}

// Recursive form renderer. parentRef[key] is the bound value.
function renderNode(node, title){
  const wrap = document.createElement("div");
  if(title){ const h=document.createElement("div"); h.className="group-title"; h.textContent=title; wrap.appendChild(h); }
  for(const key of Object.keys(node)){
    if(HIDDEN.has(key)) continue;
    wrap.appendChild(renderField(node, key));
  }
  return wrap;
}

function renderField(parent, key){
  const val = parent[key];
  const label = labelFor(key);
  if(typeof val === "boolean") return boolField(parent, key, label);
  if(typeof val === "string") return key === "icon" ? iconField(parent, key, label) : textField(parent, key, label);
  if(Array.isArray(val)) return arrayField(parent, key, label);
  if(val && typeof val === "object"){
    const g = document.createElement("div"); g.className="group";
    g.appendChild(renderNode(val, label));
    return g;
  }
  return document.createElement("span");
}

function textField(parent, key, label){
  const v = parent[key];
  const f = document.createElement("div"); f.className="fld";
  const long = v.length > 70 || v.includes("\n");
  f.innerHTML = `<label>${label}</label>`;
  const inp = document.createElement(long ? "textarea" : "input");
  if(!long) inp.type = "text";
  inp.value = v;
  inp.oninput = ()=>{ parent[key] = inp.value; markDirty(); };
  f.appendChild(inp); return f;
}

function boolField(parent, key, label){
  const f = document.createElement("label"); f.className="fld";
  f.style.cssText="display:flex;gap:8px;align-items:center;cursor:pointer";
  const cb = document.createElement("input"); cb.type="checkbox"; cb.checked = parent[key];
  cb.style.cssText="width:18px;height:18px;accent-color:var(--navy)";
  cb.onchange = ()=>{ parent[key] = cb.checked; markDirty(); };
  const sp = document.createElement("span"); sp.textContent = label; sp.style.fontWeight="600";
  f.append(cb, sp); return f;
}

function iconField(parent, key, label){
  const f = document.createElement("div"); f.className="fld";
  f.innerHTML = `<label>${label}</label>`;
  const row = document.createElement("div"); row.className="icon-row";
  const prev = document.createElement("span"); prev.className="icon-prev"; prev.innerHTML = iconSVG(parent[key]);
  const sel = document.createElement("select");
  for(const n of ICON_NAMES){ const o=document.createElement("option"); o.value=n; o.textContent=n; if(n===parent[key]) o.selected=true; sel.appendChild(o); }
  sel.onchange = ()=>{ parent[key]=sel.value; prev.innerHTML=iconSVG(sel.value); markDirty(); };
  row.append(sel, prev); f.appendChild(row); return f;
}

function arrayField(parent, key, label){
  const arr = parent[key];
  const g = document.createElement("div"); g.className="group";
  const isObj = arr.length && typeof arr[0] === "object";
  const head = document.createElement("div"); head.className="group-title";
  head.innerHTML = `<span>${label} <span class="secnum">${arr.length}</span></span>`;
  const addBtn = document.createElement("button"); addBtn.className="mini add"; addBtn.textContent="＋ إضافة";
  addBtn.onclick = ()=>{
    arr.push(isObj ? blankLike(arr[0]) : "");
    markDirty(); buildContent();
  };
  head.appendChild(addBtn); g.appendChild(head);

  arr.forEach((item, i) => {
    const card = document.createElement("div"); card.className="item-card";
    const del = document.createElement("button"); del.className="mini del"; del.textContent="✕";
    del.title="حذف"; del.style.cssText="position:absolute;inset-inline-end:10px;top:10px";
    del.onclick = ()=>{ arr.splice(i,1); markDirty(); buildContent(); };
    card.appendChild(del);
    if(isObj){
      const h=document.createElement("div"); h.className="item-h";
      h.textContent = (item.name || item.title || item.label || `عنصر ${i+1}`);
      card.appendChild(h);
      for(const k of Object.keys(item)){ if(HIDDEN.has(k)) continue; card.appendChild(renderField(item, k)); }
    }else{
      const inp=document.createElement("input"); inp.type="text"; inp.value=item;
      inp.style.width="calc(100% - 40px)";
      inp.oninput = ()=>{ arr[i]=inp.value; markDirty(); };
      card.appendChild(inp);
    }
    g.appendChild(card);
  });
  return g;
}

function blankLike(obj){
  const out = {};
  for(const k of Object.keys(obj)){
    const v = obj[k];
    if(Array.isArray(v)) out[k] = [];
    else if(v && typeof v === "object") out[k] = blankLike(v);
    else if(typeof v === "boolean") out[k] = false;
    else if(k === "icon") out[k] = "check";
    else if(k === "slug") out[k] = "new-" + Math.floor(Date.now()/1000);
    else out[k] = "";
  }
  return out;
}

/* ============================ IMAGES TAB ============================ */
const IMAGE_SLOTS = [
  { path:"public/logo/mark-color.png", name:"الشعار الملوّن", desc:"يظهر في المعاينات والبطاقات", dark:false },
  { path:"public/logo/mark-white.png", name:"الشعار الأبيض", desc:"الترويسة والتذييل (خلفية كحلية)", dark:true },
  { path:"public/logo/primary-stack.png", name:"الشعار الكامل (مع الاسم)", desc:"للاستخدامات الكبيرة", dark:false },
  { path:"public/favicon-32.png", name:"أيقونة المتصفح", desc:"٣٢×٣٢ بكسل", dark:false },
  { path:"public/favicon-512.png", name:"أيقونة كبيرة / مشاركة", desc:"٥١٢×٥١٢ بكسل", dark:false },
];

async function buildImages(){
  const grid = $("#imgGrid"); grid.innerHTML = "";
  for(const slot of IMAGE_SLOTS){
    const card = document.createElement("div"); card.className = "img-card" + (slot.dark?" dark":"");
    let src = ""; try{ src = await readBlobURL(slot.path); }catch{}
    card.innerHTML = `
      <div class="thumb">${src?`<img src="${src}" alt="">`:"<span style='color:#aaa'>لا توجد صورة</span>"}</div>
      <h4>${slot.name}</h4><small>${slot.desc}</small>
      <label class="replace">استبدال الصورة<input type="file" accept="image/png,image/jpeg,image/svg+xml,image/x-icon"></label>`;
    const input = card.querySelector("input[type=file]");
    input.onchange = async ()=>{
      const file = input.files[0]; if(!file) return;
      try{
        await writeBlob(slot.path, file);
        const img = card.querySelector(".thumb"); img.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="">`;
        toast(`تم استبدال «${slot.name}» ✓`);
      }catch(e){ console.error(e); toast("تعذّر حفظ الصورة", true); }
    };
    grid.appendChild(card);
  }
}

/* ============================ DESIGN TAB ============================ */
const COLOR_FIELDS = [
  ["navy","الكحلي الأساسي"], ["green","الأخضر"], ["green700","الأخضر الداكن (نصوص)"],
  ["gold","الذهبي"], ["gold600","الذهبي الداكن (عند التمرير)"],
  ["ink","لون النص الأساسي"], ["slate","لون النص الثانوي"],
  ["cloud","لون الحدود الفاتح"], ["paper","خلفية الأقسام الفاتحة"],
];
const RADIUS_FIELDS = [["button","الأزرار"],["card","البطاقات"],["panel","الألواح الكبيرة"]];

function buildDesign(){
  const box = $("#designControls"); box.innerHTML = `<div class="subhead">ألوان الهوية</div>`;
  for(const [k,label] of COLOR_FIELDS){
    const row = document.createElement("div"); row.className="color-row";
    const val = data.theme.colors[k];
    row.innerHTML = `<label>${label}</label>
      <input type="color" class="swatch" value="${val}">
      <input type="text" value="${val}">`;
    const [picker, hex] = row.querySelectorAll("input");
    const apply = (v)=>{ data.theme.colors[k]=v; picker.value=v; hex.value=v; updatePreview(); markDirty(); };
    picker.oninput = ()=>apply(picker.value);
    hex.onchange = ()=>{ if(/^#([0-9a-fA-F]{6})$/.test(hex.value)) apply(hex.value.toLowerCase()); else hex.value=data.theme.colors[k]; };
    box.appendChild(row);
  }
  const rh = document.createElement("div"); rh.className="subhead"; rh.textContent="استدارة الحواف"; box.appendChild(rh);
  for(const [k,label] of RADIUS_FIELDS){
    const cur = parseInt(data.theme.radius[k]) || 0;
    const row = document.createElement("div"); row.className="radius-row";
    row.innerHTML = `<label>${label}</label><input type="range" min="0" max="24" value="${cur}"><output>${cur}px</output>`;
    const [range] = row.querySelectorAll("input"); const out = row.querySelector("output");
    range.oninput = ()=>{ data.theme.radius[k]=range.value+"px"; out.textContent=range.value+"px"; updatePreview(); markDirty(); };
    box.appendChild(row);
  }
  updatePreview();
}

function updatePreview(){
  const c = data.theme.colors, r = data.theme.radius, s = $("#previewBox").style;
  s.setProperty("--pv-navy", c.navy);
  s.setProperty("--pv-navy050", `color-mix(in srgb, ${c.navy}, #fff 92%)`);
  s.setProperty("--pv-green", c.green700);
  s.setProperty("--pv-gold", c.gold);
  s.setProperty("--pv-slate", c.slate);
  s.setProperty("--pv-cloud", c.cloud);
  s.setProperty("--pv-rbtn", r.button);
  s.setProperty("--pv-rcard", r.card);
}

$("#resetTheme").onclick = ()=>{
  data.theme = structuredClone(THEME_DEFAULTS);
  buildDesign(); markDirty(); toast("تمت استعادة الألوان الأصلية (احفظ للتطبيق)");
};

/* ============================ ARTICLES TAB ============================ */
let articleFiles = []; // {name, fm, body}
function parseFrontmatter(text){
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if(!m) return { fm:{}, body:text };
  const fm = {};
  for(const line of m[1].split("\n")){
    const i = line.indexOf(":"); if(i<0) continue;
    const k = line.slice(0,i).trim();
    let v = line.slice(i+1).trim().replace(/^["']|["']$/g,"");
    fm[k] = v;
  }
  return { fm, body:m[2] };
}
function serializeArticle(fm, body){
  const q = (s)=>`"${String(s).replace(/"/g,'\\"')}"`;
  const lines = [
    `title: ${q(fm.title||"")}`,
    `description: ${q(fm.description||"")}`,
    `locale: ${q(fm.locale||"ar")}`,
    `date: ${fm.date||new Date().toISOString().slice(0,10)}`,
  ];
  if(fm.category) lines.push(`category: ${q(fm.category)}`);
  if(fm.readingTime) lines.push(`readingTime: ${q(fm.readingTime)}`);
  return `---\n${lines.join("\n")}\n---\n\n${body||""}`;
}

async function buildArticles(){
  articleFiles = [];
  try{
    const dir = await getDir(PATHS.articlesDir);
    for await (const [name, h] of dir.entries()){
      if(!name.endsWith(".md") || h.kind!=="file") continue;
      const text = await (await h.getFile()).text();
      const { fm, body } = parseFrontmatter(text);
      articleFiles.push({ name, fm, body });
    }
  }catch(e){ console.error(e); }
  articleFiles.sort((a,b)=> (b.fm.date||"").localeCompare(a.fm.date||""));
  renderArticleList();
}

function renderArticleList(active){
  const list = $("#articleList"); list.innerHTML = "";
  for(const a of articleFiles){
    const b = document.createElement("button");
    b.innerHTML = `<span class="alang">${a.fm.locale==="en"?"إنجليزي":"عربي"}</span>${a.fm.title||a.name}`;
    if(a.name===active) b.classList.add("active");
    b.onclick = ()=>openArticle(a);
    list.appendChild(b);
  }
}

$("#newArticleBtn").onclick = ()=>openArticle(null);

function openArticle(a){
  const isNew = !a;
  const fm = a ? a.fm : { locale:"ar", title:"", description:"", category:"", readingTime:"", date:new Date().toISOString().slice(0,10) };
  const body = a ? a.body : "";
  renderArticleList(a?.name);
  const form = $("#articleForm");
  form.innerHTML = `
    <div class="row2">
      <div class="fld"><label>اللغة</label>
        <select id="aLocale"><option value="ar"${fm.locale==="ar"?" selected":""}>عربي</option><option value="en"${fm.locale==="en"?" selected":""}>إنجليزي</option></select></div>
      <div class="fld"><label>اسم الملف (إنجليزي، بدون مسافات)</label>
        <input id="aSlug" type="text" value="${isNew?"":a.name.replace(/^(ar|en)-/,"").replace(/\.md$/,"")}" ${isNew?"":"readonly"} placeholder="my-article" dir="ltr"></div>
    </div>
    <div class="fld"><label>العنوان</label><input id="aTitle" type="text" value="${esc(fm.title)}"></div>
    <div class="fld"><label>الوصف المختصر</label><textarea id="aDesc">${esc(fm.description)}</textarea></div>
    <div class="row2">
      <div class="fld"><label>التصنيف</label><input id="aCat" type="text" value="${esc(fm.category||"")}"></div>
      <div class="fld"><label>مدة القراءة</label><input id="aRead" type="text" value="${esc(fm.readingTime||"")}" placeholder="٥ دقائق"></div>
    </div>
    <div class="fld"><label>التاريخ</label><input id="aDate" type="date" value="${fm.date||""}"></div>
    <div class="fld"><label>نص المقال (بصيغة Markdown)</label><textarea id="aBody" style="min-height:240px">${esc(body)}</textarea></div>
    <div style="display:flex;gap:10px"><button class="btn btn-save" id="aSave" style="opacity:1;cursor:pointer">💾 حفظ المقال</button>
    ${isNew?"":`<button class="btn btn-ghost" id="aDelete">🗑 حذف المقال</button>`}</div>`;
  $("#aSave").onclick = ()=>saveArticle(isNew, a);
  if(!isNew) $("#aDelete").onclick = ()=>deleteArticle(a);
}
const esc = (s)=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");

async function saveArticle(isNew, existing){
  const locale = $("#aLocale").value;
  const slug = ($("#aSlug").value||"").trim().replace(/[^a-zA-Z0-9-_]/g,"-");
  if(isNew && !slug){ toast("اكتب اسم ملف بالإنجليزية", true); return; }
  const fm = { locale, title:$("#aTitle").value, description:$("#aDesc").value,
    category:$("#aCat").value, readingTime:$("#aRead").value, date:$("#aDate").value };
  const body = $("#aBody").value;
  const name = isNew ? `${locale}-${slug}.md` : existing.name;
  try{
    await writeText(`${PATHS.articlesDir}/${name}`, serializeArticle(fm, body));
    toast("تم حفظ المقال ✓");
    await buildArticles();
    const saved = articleFiles.find(x=>x.name===name); if(saved) openArticle(saved);
  }catch(e){ console.error(e); toast("تعذّر حفظ المقال", true); }
}

async function deleteArticle(a){
  if(!confirm(`حذف المقال «${a.fm.title||a.name}» نهائيًا؟`)) return;
  try{
    const dir = await getDir(PATHS.articlesDir);
    await dir.removeEntry(a.name);
    toast("تم حذف المقال");
    $("#articleForm").innerHTML = `<p class="empty">اختر مقالًا من القائمة أو أضف مقالًا جديدًا.</p>`;
    await buildArticles();
  }catch(e){ console.error(e); toast("تعذّر الحذف", true); }
}

/* ============================ TABS / INIT ============================ */
document.querySelectorAll(".tab").forEach(t => t.onclick = ()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
  t.classList.add("active");
  document.querySelector(`.panel[data-panel="${t.dataset.tab}"]`).classList.add("active");
});
document.querySelectorAll(".lang").forEach(b => b.onclick = ()=>{
  document.querySelectorAll(".lang").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); lang = b.dataset.lang; buildContent();
});

linkBtn.onclick = linkProject;
saveBtn.onclick = saveAll;
window.addEventListener("beforeunload", (e)=>{ if(!saveBtn.disabled){ e.preventDefault(); e.returnValue=""; } });

// Environment hints
if(!("showDirectoryPicker" in window)){
  linkBtn.disabled = true;
  $("#browserHint").innerHTML = "⚠️ متصفحك لا يدعم الحفظ المباشر. افتح هذه اللوحة في <strong>Google Chrome</strong> أو <strong>Microsoft Edge</strong>.";
} else if(!window.isSecureContext || location.protocol === "file:"){
  $("#browserHint").innerHTML = "⚠️ يبدو أنك فتحت الملف مباشرةً. شغّل <code>npm run panel</code> ثم افتح <strong>http://localhost:4400</strong>.";
}
