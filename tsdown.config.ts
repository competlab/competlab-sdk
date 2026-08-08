import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  // Both JS formats, or neither. Previously only the ESM bundle carried a map, so CJS
  // consumers got no stack-trace mapping at all. The dangling declaration-map reference
  // this also emits is removed by scripts/strip-dts-sourcemap-ref.mjs.
  sourcemap: true,
});
