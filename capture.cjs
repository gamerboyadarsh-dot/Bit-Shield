const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function capture(url, outputPath, width = 1280, height = 900) {
  const fullPath = path.resolve(outputPath);
  const cmd = `"${CHROME}" --headless --disable-gpu --window-size=${width},${height} --screenshot="${fullPath}" "${url}"`;
  execSync(cmd, { stdio: 'ignore' });
  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    console.log(`[Captured] ${path.basename(fullPath)} (${stat.size} bytes)`);
    return true;
  }
  console.error(`[Failed] ${fullPath}`);
  return false;
}

const target = process.argv[2] || 'http://localhost:5173/#home';
const name = process.argv[3] || 'home_desktop.png';
const w = parseInt(process.argv[4] || '1280', 10);
const h = parseInt(process.argv[5] || '900', 10);

capture(target, path.join(__dirname, 'screenshots', name), w, h);
