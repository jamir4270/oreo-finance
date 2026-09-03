const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SPLASH_DIR = path.join(__dirname, '../public/splash');
const ICONS_DIR = path.join(__dirname, '../public/icons');
const SOURCE_IMG = path.join(__dirname, '../public/oreo.png');

if (!fs.existsSync(SPLASH_DIR)) fs.mkdirSync(SPLASH_DIR, { recursive: true });
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

const BG_COLOR = '#d8dcff';

const splashSizes = [
  { name: 'iphone-1170x2532.png', width: 1170, height: 2532 },
  { name: 'iphone-1290x2796.png', width: 1290, height: 2796 },
  { name: 'iphone-750x1334.png', width: 750, height: 1334 },
  { name: 'ipad-1668x2388.png', width: 1668, height: 2388 },
  { name: 'ipad-2048x2732.png', width: 2048, height: 2732 },
];

async function generate() {
  console.log("Generating icons...");
  await sharp(SOURCE_IMG).resize(192, 192).toFile(path.join(ICONS_DIR, 'icon-192.png'));
  await sharp(SOURCE_IMG).resize(512, 512).toFile(path.join(ICONS_DIR, 'icon-512.png'));
  
  await sharp(SOURCE_IMG)
    .resize(300, 300)
    .extend({
      top: 106,
      bottom: 106,
      left: 106,
      right: 106,
      background: BG_COLOR
    })
    .toFile(path.join(ICONS_DIR, 'icon-512-maskable.png'));

  console.log("Generating splash screens...");
  
  // Resize source img for splash overlay
  const splashOverlay = await sharp(SOURCE_IMG).resize(200, 200).toBuffer();

  for (const size of splashSizes) {
    await sharp({
      create: {
        width: size.width,
        height: size.height,
        channels: 4,
        background: BG_COLOR
      }
    })
    .composite([
      {
        input: splashOverlay,
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.join(SPLASH_DIR, size.name));
    
    console.log(`Generated ${size.name}`);
  }
}

generate().catch(console.error);
