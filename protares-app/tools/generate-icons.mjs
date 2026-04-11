/**
 * ProtaRes brand-asset generator.
 *
 * Produces the three PNGs referenced by app.config.ts:
 *
 *   assets/icon.png                      — 1024×1024, NHS Blue solid, white "ProtaRes"
 *   assets/splash-icon.png               — 1024×1024, transparent, white "ProtaRes"
 *   assets/adaptive-icon-foreground.png  — 1024×1024, transparent, white "ProtaRes"
 *                                           sized to the Android safe zone (inner 66%)
 *
 * Design notes:
 *   - NHS Blue (#005EB8) is the brand primary, matching the master
 *     instructions §6. Do not swap without updating app.config.ts
 *     and theme.ts.
 *   - Text is set in a heavy sans-serif to mirror the visual weight
 *     of the NHS wordmark. We name a stack of common system fonts
 *     so resvg picks the first one available on the host OS.
 *   - The adaptive icon is smaller because Android crops the outer
 *     ~33% for dynamic shape masks (circle, squircle, teardrop…).
 *
 * Usage:
 *   cd protares-app/tools
 *   npm install
 *   node generate-icons.mjs
 */

import { Resvg } from '@resvg/resvg-js';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '..', 'assets');

const NHS_BLUE = '#005EB8';
const WHITE = '#FFFFFF';

const FONT_STACK =
  "'Segoe UI', 'Helvetica Neue', 'Arial', 'DejaVu Sans', 'Liberation Sans', sans-serif";

/**
 * SVG template for an icon where the background is either solid NHS Blue
 * or transparent. The text fills most of the available width and is
 * vertically centred.
 */
function buildIconSvg({
  size,
  backgroundColor,
  text,
  textBoxSize,
  fontSize,
}) {
  const backgroundRect = backgroundColor
    ? `<rect width="${size}" height="${size}" fill="${backgroundColor}" />`
    : '';
  const cx = size / 2;
  const cy = size / 2;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${backgroundRect}
  <text
    x="${cx}"
    y="${cy}"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="${FONT_STACK}"
    font-weight="900"
    font-size="${fontSize}"
    letter-spacing="-4"
    fill="${WHITE}">${text}</text>
  <!-- Safe zone marker (inner ${Math.round((textBoxSize / size) * 100)}%) left as a comment for reference:
       ${(size - textBoxSize) / 2}, ${(size - textBoxSize) / 2}, ${textBoxSize}, ${textBoxSize} -->
</svg>`;
}

async function rasterize(svg, outputPath) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'original' },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Arial',
      sansSerifFamily: 'Arial',
    },
    background: 'rgba(0, 0, 0, 0)',
  });
  const pngData = resvg.render().asPng();
  await writeFile(outputPath, pngData);
  return pngData.length;
}

async function main() {
  await mkdir(ASSETS_DIR, { recursive: true });

  const icons = [
    {
      name: 'icon.png',
      svg: buildIconSvg({
        size: 1024,
        backgroundColor: NHS_BLUE,
        text: 'ProtaRes',
        textBoxSize: 900,
        fontSize: 170,
      }),
      description: '1024×1024 iOS / fallback app icon (NHS Blue bg)',
    },
    {
      name: 'splash-icon.png',
      svg: buildIconSvg({
        size: 1024,
        backgroundColor: null, // transparent — splash bg is set in app.config.ts
        text: 'ProtaRes',
        textBoxSize: 900,
        fontSize: 170,
      }),
      description: '1024×1024 splash mark (transparent bg)',
    },
    {
      name: 'adaptive-icon-foreground.png',
      svg: buildIconSvg({
        size: 1024,
        backgroundColor: null, // transparent — Android background layer is NHS Blue
        text: 'ProtaRes',
        textBoxSize: 680, // Android safe zone is ~66% of total
        fontSize: 130,
      }),
      description: '1024×1024 Android adaptive foreground (transparent bg)',
    },
  ];

  console.log('Generating brand assets in', ASSETS_DIR);
  for (const icon of icons) {
    const outputPath = join(ASSETS_DIR, icon.name);
    const bytes = await rasterize(icon.svg, outputPath);
    console.log(`  ${icon.name.padEnd(34)} ${String(bytes).padStart(7)} bytes  ${icon.description}`);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
