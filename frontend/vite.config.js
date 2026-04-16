import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Keep a single React runtime in dev even when workspace installs leave
    // duplicate copies under the repo root and frontend package folders.
    dedupe: ['react', 'react-dom'],
  },
  oxc: {
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
    jsx: {
      runtime: 'automatic',
    },
  },
  optimizeDeps: {
    rolldownOptions: {
      moduleTypes: {
        '.js': 'jsx',
      },
    },
  },
});
