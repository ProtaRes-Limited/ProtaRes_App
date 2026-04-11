/**
 * Verification helper — composes the transparent icons over an NHS Blue
 * background so we can visually confirm the text is actually in the file
 * (a viewer showing the bare transparent PNG against a white page
 * will wrongly appear blank because the text is also white).
 */

import { Resvg } from '@resvg/resvg-js';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '..', 'assets');
const PREVIEWS_DIR = join(__dirname, 'previews');

import { mkdir } from 'node:fs/promises';

async function composeOverBlue(sourcePath, outputPath) {
  const source = await readFile(sourcePath);
  const base64 = source.toString('base64');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#005EB8"/>
  <image width="1024" height="1024" href="data:image/png;base64,${base64}"/>
</svg>`;
  const resvg = new Resvg(svg, { fitTo: { mode: 'original' } });
  await writeFile(outputPath, resvg.render().asPng());
}

async function main() {
  await mkdir(PREVIEWS_DIR, { recursive: true });
  const files = ['splash-icon.png', 'adaptive-icon-foreground.png'];
  for (const file of files) {
    const src = join(ASSETS_DIR, file);
    const dst = join(PREVIEWS_DIR, `preview-${file}`);
    await composeOverBlue(src, dst);
    console.log(`preview → ${dst}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
