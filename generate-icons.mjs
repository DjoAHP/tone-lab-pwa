// generate-icons.mjs - Crée les icônes PWA avec le logo ToneLab
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BG_COLOR = { r: 10, g: 14, b: 26 };
const LOGO_SVG_PATH = path.join(__dirname, 'src/assets/icons/Menubar/logo.svg');
const ICONS_DIR = path.join(__dirname, 'public/icons');

const SIZES = [192, 512];

async function generateIcons() {
  try {
    const svgContent = fs.readFileSync(LOGO_SVG_PATH, 'utf-8');

    for (const size of SIZES) {
      const logoSize = Math.floor(size * 0.6);

      const logoResized = await sharp(Buffer.from(svgContent))
        .resize(logoSize, logoSize, { fit: 'contain' })
        .png()
        .toBuffer();

      const background = Buffer.from(
        `<svg width="${size}" height="${size}">
          <rect width="${size}" height="${size}" fill="rgb(${BG_COLOR.r},${BG_COLOR.g},${BG_COLOR.b})"/>
        </svg>`
      );

      await sharp(background)
        .composite([{
          input: logoResized,
          top: Math.floor((size - logoSize) / 2),
          left: Math.floor((size - logoSize) / 2)
        }])
        .png()
        .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`));

      console.log(`✓ icon-${size}x${size}.png créé`);
    }
    console.log('\n✅ Toutes les icônes ont été générées avec succès !');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

generateIcons();
