import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    outDir: "../dist",
    emptyOutDir: true,
    minify: "esbuild",
    cssCodeSplit: false,
    sourcemap: false,
    lib: {
      entry: "src/belovodya-app.ts",
      formats: ["es"],
      fileName: () => "belovodya-ui.js"
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    }
  }
});
