import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login/login.html'),
        dashboard: resolve(__dirname, 'pages/dashboard/dashboard.html'),
        prompts: resolve(__dirname, 'pages/prompts/prompts.html')
      }
    }
  }
});
