import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Use esbuild minifier (built-in, no extra deps)
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  // SPA routing configuration for dev server
  server: {
    middlewareMode: false,
    historyApiFallback: true,
  },
});
