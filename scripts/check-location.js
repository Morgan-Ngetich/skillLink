#!/usr/bin/env node

const path = require("path");
const cwd = process.cwd();

const rootPath = path.resolve(__dirname); // Monorepo root
const frontendPath = path.join(rootPath, "frontend");

if (cwd === rootPath) {
  console.log("✅ You are in the monorepo root. Proceeding...");
} else if (cwd.startsWith(frontendPath)) {
  console.log("📦 Installing from 'frontend' folder.");
} else {
  console.warn(`
⚠️  You are installing packages from:
   ${cwd}

This is not a recognized project root.

👉 Please navigate to either:
  - Root folder: ${rootPath}
  - Frontend folder: ${frontendPath}
`);
  process.exit(1); // optionally block the install
}
 