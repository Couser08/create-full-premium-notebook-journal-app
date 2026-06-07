import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-router')) {
              return 'react-vendors';
            } else if (id.includes('framer') || id.includes('lucide')) {
              return 'ui-vendors';
            } else if (id.includes('supabase')) {
              return 'supabase';
            } else if (id.includes('prismjs')) {
              return 'editor';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
