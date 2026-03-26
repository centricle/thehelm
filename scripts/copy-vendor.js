import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const vendor = join(root, 'public', 'vendor');

mkdirSync(vendor, { recursive: true });

const files = [
  ['node_modules/htmx.org/dist/htmx.min.js', 'htmx.min.js'],
  ['node_modules/htmx-ext-sse/sse.js', 'htmx-ext-sse.js']
];

for (const [src, dest] of files) {
  try {
    copyFileSync(join(root, src), join(vendor, dest));
    console.log(`Copied ${dest}`);
  } catch (err) {
    console.warn(`Could not copy ${src}: ${err.message}`);
  }
}
