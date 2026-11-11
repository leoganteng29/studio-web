// Usage: node gen-commands.js <folder-ubot> <output.json>
// Membaca help[] semua plugin ubot -> commands.json untuk Mini App
const fs = require("fs"), path = require("path"), Module = require("module");
const root = path.resolve(process.argv[2] || "."), out = process.argv[3] || "commands.json";
const orig = Module._load;
const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => "" : stub()), apply: () => stub(), construct: () => stub() });
Module._load = function (r, ...a) {
  try { return orig.call(this, r, ...a); } catch (e) { if (/^[./]/.test(r) && !/Cannot find module/.test(e.message)) throw e; return stub(); }
};
const cats = {};
let n = 0;
for (const f of fs.readdirSync(path.join(root, "plugins")).filter((x) => x.endsWith(".js"))) {
  try {
    const p = require(path.join(root, "plugins", f));
    for (const h of (p && p.help) || []) {
      const cat = (p.category || "Lainnya").trim();
      (cats[cat] = cats[cat] || []).push({ cmd: h.cmd, alias: h.alias || [], desc: String(h.desc || "").replace(/\s+/g, " ").trim() });
      n++;
    }
  } catch (e) { console.error("skip", f, e.message.split("\n")[0]); }
}
const data = { generated: new Date().toISOString(), total: n, categories: Object.entries(cats).map(([name, list]) => ({ name, list })).sort((a, b) => b.list.length - a.list.length) };
fs.writeFileSync(out, JSON.stringify(data));
console.log("OK", n, "command,", data.categories.length, "kategori ->", out);
