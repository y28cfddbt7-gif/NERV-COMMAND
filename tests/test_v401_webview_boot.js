'use strict';
// v4.0.2 WebView startup safety: no first-load network dependency,
// guard installed before all large third-party/vendor code.
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const config=JSON.parse(read('src/build.json'));
const page=read('src/ui/index.html');
const geo=read('src/browser/geographic-map.js');
const watchdog=read('src/browser/boot-diagnostics.js');
const flow=read('src/scriptable/webview.js');
assert.equal(config.version,'4.0.4');
assert.equal(config.browser_modules[0],'src/browser/boot-diagnostics.js');
assert(page.includes('All app-critical styles are inline'));
assert(!page.includes('<link rel="stylesheet" href="https://unpkg.com/'));
assert(!page.includes('media="print"')&&!page.includes('maplibre-gl.css'));
assert(geo.includes("asset('link',{rel:'stylesheet'"));
assert(geo.includes("asset('script',{"));
assert(geo.includes("function requireMapLibre()"));
assert(!geo.includes("document.head.appendChild(script);"));
assert(watchdog.includes("window.addEventListener('error'"));
assert(watchdog.includes("window.addEventListener('unhandledrejection'"));
assert(watchdog.includes("nervBootDiagnostics"));
assert(watchdog.includes("保存データには操作していません"));
assert(!watchdog.includes("callNative(")&&!watchdog.includes("localStorage."));
assert(flow.includes('await web.loadHTML(html)'),'WebView handoff retained');
console.log('PASS v4.0.2: no initial network stylesheet or premature map load; iOS screen has boot diagnostics with zero save writes');
