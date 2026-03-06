#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, 'custom_components', 'belovodya_ui', 'manifest.json');
const constPath = path.join(repoRoot, 'custom_components', 'belovodya_ui', 'const.py');

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function bumpPatch(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  const [, major, minor, patch] = match;
  return `${major}.${minor}.${Number(patch) + 1}`;
}

function hasVersionTag(tags, version) {
  return tags.has(`v${version}`) || tags.has(version);
}

function replaceConstVersion(source, version) {
  const pattern = /VERSION: Final = "[^"]+"/;
  if (!pattern.test(source)) {
    throw new Error('Failed to locate VERSION constant in const.py');
  }

  return source.replace(pattern, `VERSION: Final = "${version}"`);
}

const manifest = readJson(manifestPath);
const originalVersion = manifest.version;
const tags = new Set(
  execSync('git tag --list', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean),
);

let releaseVersion = originalVersion;
while (hasVersionTag(tags, releaseVersion)) {
  releaseVersion = bumpPatch(releaseVersion);
}

if (releaseVersion !== originalVersion) {
  manifest.version = releaseVersion;
  writeJson(manifestPath, manifest);

  const constSource = readFileSync(constPath, 'utf8');
  writeFileSync(constPath, replaceConstVersion(constSource, releaseVersion), 'utf8');
}

const output = [
  `original_version=${originalVersion}`,
  `release_version=${releaseVersion}`,
  `tag_name=v${releaseVersion}`,
  `version_changed=${String(releaseVersion !== originalVersion)}`,
].join('\n');

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `${output}\n`, 'utf8');
} else {
  console.log(output);
}
