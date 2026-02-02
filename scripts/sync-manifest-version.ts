#!/usr/bin/env bun
/**
 * Sync manifest.json version with package.json version
 * This script is run during the 'version' lifecycle hook after package.json is updated
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const rootDir = process.cwd();

// Read package.json to get the new version
const packageJsonPath = join(rootDir, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const newVersion = packageJson.version;

if (!newVersion) {
  console.error("Error: No version found in package.json");
  process.exit(1);
}

// Read manifest.json
const manifestPath = join(rootDir, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

// Update version
manifest.version = newVersion;

// Write back with proper formatting (2-space indent, trailing newline)
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Updated manifest.json version to ${newVersion}`);
