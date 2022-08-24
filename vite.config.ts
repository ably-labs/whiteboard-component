import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  root: "sample-app",
  server: {
    port: 8080
  },
  build: {
    outDir: "../dist-sample-app",
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: []
})
