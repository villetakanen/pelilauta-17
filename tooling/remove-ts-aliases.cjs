#!/usr/bin/env node
/* CommonJS version of the codemod */
const fs = require('fs').promises;
const path = require('path');
// simple recursive walker instead of glob

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const tsconfigPath = path.join(repoRoot, 'tsconfig.json');
  const tsRaw = await fs.readFile(tsconfigPath, 'utf8');
  const ts = JSON.parse(tsRaw);
  const paths = ts.compilerOptions?.paths || {};
  const mappings = Object.keys(paths).map(function(k) {
    const val = paths[k][0];
    const keyPrefix = k.replace(/\*$/, '');
    const valPrefix = val.replace(/\*$/, '');
    return { key: keyPrefix, val: valPrefix };
  });

  // If tsconfig.json has no paths (for example it was already removed),
  // fall back to the project's known alias -> src mappings so the codemod
  // can still run. This avoids a situation where we remove paths first
  // and then the replacer has nothing to do.
  let usedMappings = mappings;
  if (usedMappings.length === 0) {
    console.log('No path mappings found in tsconfig.json — using fallback mappings.');
    usedMappings = [
      { key: '@utils/', val: 'src/utils/' },
      { key: '@server/', val: 'src/components/server/' },
      { key: '@shared/', val: 'src/components/shared/' },
      { key: '@schemas/', val: 'src/schemas/' },
      { key: '@layouts/', val: 'src/layouts/' },
      { key: '@stores/', val: 'src/stores/' },
      { key: '@firebase/', val: 'src/firebase/' },
      { key: '@svelte/', val: 'src/components/svelte/' }
    ];
  }
  console.log('Mappings to replace:');
  usedMappings.forEach(function(m){ console.log('  ' + m.key + ' -> ' + m.val); });

  const exts = new Set(['.ts','.js','.tsx','.jsx','.svelte','.astro']);
  const ignoreDirs = new Set(['node_modules','dist','e2e','.git']);
  const files = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (ignoreDirs.has(e.name)) continue;
        await walk(full);
      } else if (e.isFile()) {
        const ext = path.extname(e.name);
        if (exts.has(ext)) files.push(full);
      }
    }
  }
  await walk(repoRoot);

  let changed = 0;
  for (const file of files) {
    const contentRaw = await fs.readFile(file, 'utf8');
    let content = contentRaw;
  for (const m of usedMappings) {
      const fromPattern = new RegExp(`(['\"])${escapeRegExp(m.key)}(/?)([^'\"]*)`, 'g');
      content = content.replace(fromPattern, function(match, quote, sep, rest) {
        return quote + path.posix.join(m.val, rest).replace(/\\/g, '/');
      });

      const bare = new RegExp(escapeRegExp(m.key) + '([^\\s;,\'"()\[\]]*)', 'g');
      content = content.replace(bare, function(match, rest) {
        if (file.endsWith('tsconfig.json') || file.endsWith('package.json')) return match;
        return path.posix.join(m.val, rest).replace(/\\/g, '/');
      });
    }
    if (content !== contentRaw) {
      await fs.writeFile(file, content, 'utf8');
      changed++;
      console.log('Updated', path.relative(repoRoot, file));
    }
  }

  console.log('Modified ' + changed + ' files.');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

main().catch(function(err){
  console.error(err);
  process.exit(1);
});
