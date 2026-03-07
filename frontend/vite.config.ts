import { defineConfig } from "vite";

const keepSideEffectModules = (id: string): boolean => (
  id.endsWith("/src/belovodya-sidebar.ts")
  || id.endsWith("/src/belovodya-navbar.ts")
  || id.endsWith("/src/belovodya-layout.ts")
  || id.endsWith("/src/belovodya-card-editor.ts")
  || id.endsWith("/src/card-renderer.ts")
);

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
      fileName: () => "belovodya-ui.js",
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: (id) => keepSideEffectModules(id),
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
});
