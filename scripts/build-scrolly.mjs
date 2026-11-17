// Convierte los fotogramas PNG originales (fuera del repo) a WebP dentro de public/scrolly.
// Uso: node scripts/build-scrolly.mjs [carpeta-de-origen] [clip ...]
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = process.argv[2] ?? '/Users/solarte1999/Documents';
const OUT = path.resolve('public/scrolly');
const QUALITY = 90;
// nombre público -> carpeta de origen. Si se regenera un clip, cambia el nombre público
// (p. ej. filtro-v2) para invalidar la caché larga de /scrolly.
const SETS = { grano: 'grano_frames_v2', filtro: 'filtro_frames', latte: 'latte_frames' };
// Sin argumentos de nombre convierte solo los clips que faltan; con nombres, fuerza esos.
const ONLY = process.argv.slice(3);

let total = 0;
for (const [name, dir] of Object.entries(SETS)) {
  const out = path.join(OUT, name);
  const exists = await stat(path.join(out, 'poster.webp')).then(() => true, () => false);
  if (ONLY.length ? !ONLY.includes(name) : exists) continue;
  await mkdir(out, { recursive: true });
  const files = (await readdir(path.join(SRC, dir))).filter((f) => f.endsWith('.png')).sort();
  let bytes = 0;
  for (const file of files) {
    const target = path.join(out, file.replace('.png', '.webp'));
    await sharp(path.join(SRC, dir, file)).webp({ quality: QUALITY, effort: 6 }).toFile(target);
    bytes += (await stat(target)).size;
  }
  await copyFile(path.join(out, 'f000.webp'), path.join(out, 'poster.webp'));
  total += bytes;
  console.log(`${name}: ${files.length} fotogramas, ${(bytes / 1048576).toFixed(2)} MB`);
}
console.log(`total: ${(total / 1048576).toFixed(2)} MB`);
