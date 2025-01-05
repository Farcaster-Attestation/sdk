import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'], // Output CommonJS and ES Modules
    outDir: 'dist',
    dts: true, // Generate TypeScript declaration files
    sourcemap: true,
  },
]);