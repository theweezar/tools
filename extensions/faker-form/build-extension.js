/**
 * Build script for Faker Form extension
 * Bundles content.js with @faker-js/faker from node_modules
 * Run: npm run build:extension
 */

import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const extensionPath = join(__dirname);
const srcPath = join(extensionPath, 'src');
const distPath = join(extensionPath, 'dist');

async function build() {
  try {
    await esbuild.build({
      entryPoints: [join(srcPath, 'content.js')],
      bundle: true,
      outfile: join(distPath, 'content.js'),
      format: 'iife',
      target: 'es2020',
      external: [],
      logLevel: 'info',
    });

    console.log('✅ Extension bundled successfully!');
    console.log(`📦 Output: ${join(distPath, 'content.js')}`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
