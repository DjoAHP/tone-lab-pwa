// generate-icons.js - Crée les icônes PWA avec le logo ToneLab
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BG_COLOR = { r: 10, g: 14, b: 26 }; // #0a0e1a
const LOGO_SVG_PATH = path.join(__dirname, 'src/assets/icons/Menubar/logo.svg');
const ICONS_DIR = path.join(__dirname, 'public/icons');

const SIZES = [192, 512];

async function generateIcons() {
  try {
    // Lire le contenu du logo SVG
    const logoSvgContent = fs.readFileSync(LOGO_SVG_PATH, 'utf-8');

    for (const size of SIZES) {
      // Taille du logo = 60% de l'icône
      const logoSize = Math.floor(size * 0.6);
      // Le viewBox du logo original est 192x192
      const logoSvgResized = logoSvgContent
        .replace('width="192"', `width="${logoSize}"`)
        .replace('height="192"', `height="${logoSize}"`)
        .replace('viewBox="0 0 192 192"', `viewBox="0 0 ${logoSize} ${logoSize}"`);

      const logoBuffer = Buffer.from(logoSvgResized);

      // Créer le fond coloré
      const background = Buffer.from(
        `<svg width="${size}" height="${size}">
          <rect width="${size}" height="${size}" fill="rgb(${BG_COLOR.r},${BG_COLOR.g},${BG_COLOR.b})"/>
        </svg>`
      );

      // Redimensionner le logo et le composer sur le fond
      const logoResized = await sharp(logoBuffer)
        .png()
        .toBuffer();

      // Composer : fond + logo centré
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
    console.error('❌ Erreur lors de la génération des icônes:', err.message);
    process.exit(1);
  }
}

generateIcons();
