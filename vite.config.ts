import { defineConfig } from "vite";

const PACKAGE_NAME = 'normal_text'
const fileName = {
  es: `${PACKAGE_NAME}.mjs`,
  cjs: `${PACKAGE_NAME}.cjs`,
  iife: `${PACKAGE_NAME}.iife.js`,
};

export default defineConfig({
  base: './',
  build: {
    lib: {
      entry: 'src/index.ts',
      name: PACKAGE_NAME,
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => fileName[format],
    }
  },
})
