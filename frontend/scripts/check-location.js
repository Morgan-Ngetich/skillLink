// ESM-compatible way to get __dirname
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Move one level up to check if current working directory is 'frontend'
const cwd = process.cwd();
const projectDirName = path.basename(cwd);

if (projectDirName !== 'frontend') {
  console.error('❌ Please run npm install from the "frontend" directory, not from the root.');
  process.exit(1);
} else {
  console.log('✅ Running npm install from correct directory.');
}
