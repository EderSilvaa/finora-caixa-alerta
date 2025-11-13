import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking for better code splitting
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tooltip'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'icons': ['lucide-react'],
          'ai': ['openai'],
        },
      },
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  define: {
    // Force override system environment variables
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://ixcjeoibvhkdhqitkbat.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y2plb2lidmhrZGhxaXRrYmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTExNDYsImV4cCI6MjA3Nzc2NzE0Nn0.PhZ6z8fVuN--2trqPNt9dDEQ8wpEDuUEwDEh6u7EMmc'),
    'import.meta.env.VITE_PLUGGY_CLIENT_ID': JSON.stringify('336477b1-5df9-4152-9001-37db407d6353'),
    'import.meta.env.VITE_PLUGGY_CLIENT_SECRET': JSON.stringify('b25d418c-b5d9-4ac3-a426-3278c69c1774'),
    // OpenAI API Key: Configure in .env.local file
    // 'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.VITE_OPENAI_API_KEY || ''),
  },
});
