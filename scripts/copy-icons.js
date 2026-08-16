const fs = require('fs');
const path = require('path');

const files = ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.ico'];

const srcBase = path.resolve(__dirname, '..', 'dating app ---', 'fixyo-landing-main', 'client', 'public');
const destBase = path.resolve(__dirname, '..', 'client', 'public');

if (!fs.existsSync(destBase)) fs.mkdirSync(destBase, { recursive: true });

files.forEach((file) => {
  const src = path.join(srcBase, file);
  const dest = path.join(destBase, file);
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${file} -> ${path.relative(process.cwd(), dest)}`);
    } else {
      console.warn(`Source not found: ${src}`);
    }
  } catch (err) {
    console.error(`Failed copying ${file}:`, err.message || err);
  }
});
