import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split the heavy third-party libraries out of the entry chunk so the
        // landing page does not pay for the CRM's dependencies. Route-level
        // code splitting lives in src/App.tsx (React.lazy).
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts"],
          "vendor-dnd": ["@hello-pangea/dnd"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-motion": ["framer-motion"],
        },
      },
    },
  },
}));
