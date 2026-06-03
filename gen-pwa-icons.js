// Tao PWA icons tu icon.png (xe may) cho GiaoHangDN
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

// Doc icon.png duoi dang base64 de nhung vao HTML
const iconBase64 = fs.readFileSync(path.join(DIR, 'icon.png')).toString('base64');
const iconDataUrl = `data:image/png;base64,${iconBase64}`;

async function makeIcon(size) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });

  const radius = Math.round(size * 0.22);
  const padding = Math.round(size * 0.12);

  await page.setContent(`<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;
  background:linear-gradient(145deg, #FF6B35, #e85a24);
  display:flex;align-items:center;justify-content:center;
  border-radius:${radius}px;">
  <img src="${iconDataUrl}"
    style="width:${size - padding * 2}px;height:${size - padding * 2}px;
    object-fit:contain;filter:brightness(0) invert(1);" />
</body>
</html>`);

  await page.waitForTimeout(200);
  const buf = await page.screenshot({ type: 'png' });
  await browser.close();
  return buf;
}

(async () => {
  console.log('Tao icons cho GiaoHangDN PWA...');

  for (const size of SIZES) {
    const buf = await makeIcon(size);
    let fname;
    if (size === 180) {
      fname = 'apple-touch-icon.png';
    } else {
      fname = `icon-${size}.png`;
    }
    fs.writeFileSync(path.join(DIR, fname), buf);
    console.log(`  Da tao ${fname} (${size}x${size})`);
  }

  // Ghi de icon-192 va icon-512 chinh
  console.log('Tat ca icons da duoc tao!');
})().catch(e => { console.error('LOI:', e.message); process.exit(1); });
