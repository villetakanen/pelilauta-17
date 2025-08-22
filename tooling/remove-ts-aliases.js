#!/usr/bin/env node
/*
 Simple codemod: reads tsconfig.json 'paths' and replaces imports across the repo
 Usage: node tooling/remove-ts-aliases.js
 It will modify files in-place for extensions: .ts .js .tsx .jsx .svelte .astro
 */
const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const tsconfigPath = path.join(repoRoot, 'tsconfig.json');
  const tsRaw = await fs.readFile(tsconfigPath, 'utf8');
  const ts = JSON.parse(tsRaw);
  const paths = ts.compilerOptions?.paths || {};
  const mappings = Object.keys(paths).map((k) => {
    // key like 'src/utils/*' -> value array ['src/utils/*']
    const val = paths[k][0];
    const keyPrefix = k.replace(/\*$/, '');
    const valPrefix = val.replace(/\*$/, '');
    return { key: keyPrefix, val: valPrefix };
  });

  if (mappings.length === 0) {
    console.log('No path mappings found in tsconfig.json, nothing to do.');
    process.exit(0);
  }

  console.log('Mappings to replace:');
  mappings.forEach((m) => {
    console.log(`  ${m.key} -> ${m.val}`);
  });

  const exts = ['ts', 'js', 'tsx', 'jsx', 'svelte', 'astro'];
  const pattern = `**/*.{${exts.join(',')}}`;
  const files = glob.sync(pattern, {
    cwd: repoRoot,
    absolute: true,
    ignore: [
      '**/node_modules/**',
      'dist/**',
      'e2e/**',
      '.git/**',
      'pnpm-lock.yaml',
    ],
  });

  let changed = 0;
  for (const file of files) {
    const contentRaw = await fs.readFile(file, 'utf8');
    let content = contentRaw;
    for (const m of mappings) {
      // replace import strings '"src/utils/...' and "'src/utils/...'
      // Replace occurrences inside quotes: '...src/utils..', "...src/utils.."
      const fromPattern = new RegExp(
        `(['"])${escapeRegExp(m.key)}(/?)([^'"]*)`,
        'g',
      );
      content = content.replace(fromPattern, (match, quote, sep, rest) => {
        // match includes opening quote as capture group 1; we reconstruct using that quote
        return quote + path.posix.join(m.val, rest).replace(/\\/g, '/');
      });
      // Also replace bare occurrences inside import()/require() without surrounding quotes handling above covers
      // Replace occurrences like src/utils/foo without quotes (rare) -> src/...
      const bare = new RegExp(`${escapeRegExp(m.key)}([^s;,'"()[]]*)`, 'g');
      content = content.replace(bare, (match, rest) => {
        // avoid touching tsconfig or package.json references
        if (file.endsWith('tsconfig.json') || file.endsWith('package.json'))
          return match;
        return path.posix.join(m.val, rest).replace(/\\/g, '/');
      });
    }
    if (content !== contentRaw) {
      await fs.writeFile(file, content, 'utf8');
      changed++;
      console.log('Updated', path.relative(repoRoot, file));
    }
  }

  console.log(`Modified ${changed} files.`);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
