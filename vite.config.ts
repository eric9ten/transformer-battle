import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path';

export default defineConfig({
  plugins: [
    reactRouter(),
    tailwindcss(),
    tsconfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
  root: 'app',
  assetsInclude: ['**/*.json', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
      '~/': path.resolve(__dirname, 'app/'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  ssr: {
    noExternal: []
  },
  server: {
    host: 'localhost',
    port: 5173,
  },
  base: '/',  
  build: {
    sourcemap: false,
  },
});
