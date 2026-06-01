// Minimal dependency-free static server for the Jadeel control panel.
// Serving from http://localhost makes the page a "secure context", which the
// File System Access API requires for direct-saving into the project files.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve, extname, normalize } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../control-panel");
const PORT = 4400;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent((req.url || "/").split("?")[0]);
    if (path === "/") path = "/index.html";
    const file = resolve(root, "." + normalize(path));
    if (!file.startsWith(root)) { res.writeHead(403); res.end("Forbidden"); return; }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`\n  لوحة تحكم جديل تعمل الآن على:\n  Jadeel control panel running at:\n\n    http://localhost:${PORT}\n\n  افتح الرابط في متصفح Chrome أو Edge.  (Ctrl+C للإيقاف)\n`);
});
