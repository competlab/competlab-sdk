// tsdown's `sourcemap: true` writes a `//# sourceMappingURL=index.d.*.map` comment into the
// declaration files but never emits those .map files. We want the JS source maps (they carry
// inlined sourcesContent, so stack traces resolve) without shipping a reference to a file that
// does not exist. Declaration maps themselves are not worth emitting: `files` doesn't publish
// `src/`, so they could only ever point outside the tarball.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PATTERN = /\n?\/\/# sourceMappingURL=index\.d\.[cm]ts\.map\s*$/;

let stripped = 0;
for (const name of readdirSync(DIST)) {
  if (!/\.d\.[cm]ts$/.test(name)) continue;
  const path = join(DIST, name);
  const before = readFileSync(path, 'utf8');
  const after = before.replace(PATTERN, '\n');
  if (after !== before) {
    writeFileSync(path, after, 'utf8');
    stripped++;
  }
}

console.log(`stripped dangling declaration-map references: ${stripped}`);
