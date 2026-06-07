import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep prismjs in the main chunk to avoid race conditions
          if (id.includes('prismjs')) {
            return undefined; // Return to main chunk
          }
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-router')) {
              return 'react-vendors';
            } else if (id.includes('framer') || id.includes('lucide')) {
              return 'ui-vendors';
            } else if (id.includes('supabase')) {
              return 'supabase';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
