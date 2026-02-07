const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'out');
const SW_PATH = path.join(OUT_DIR, 'sw.js');
const BASE = '/gym_app';

function walk(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const allFiles = walk(OUT_DIR)
  .map((f) => '/' + path.relative(OUT_DIR, f).replace(/\\/g, '/'))
  .filter((f) => {
    // Skip sw.js itself, .txt files, and source maps
    if (f === '/sw.js') return false;
    if (f.endsWith('.txt')) return false;
    if (f.endsWith('.map')) return false;
    return true;
  })
  .map((f) => BASE + f);

// Add trailing-slash directory URLs for HTML pages
// e.g. /gym_app/history/ should also be cached alongside /gym_app/history/index.html
const dirUrls = allFiles
  .filter((f) => f.endsWith('/index.html') && f !== BASE + '/index.html')
  .map((f) => f.replace('/index.html', '/'));

const precacheList = [...allFiles, ...dirUrls, BASE + '/'];

const sw = fs.readFileSync(SW_PATH, 'utf8');
const replaced = sw.replace('__PRECACHE_FILES__', JSON.stringify(precacheList, null, 2));
fs.writeFileSync(SW_PATH, replaced, 'utf8');

console.log(`Injected ${precacheList.length} URLs into sw.js`);
