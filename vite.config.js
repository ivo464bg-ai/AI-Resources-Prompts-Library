import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.', // Проектът започва от тук
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // Това ще бъде пренасочващият файл
        home: resolve(__dirname, 'pages/home/home.html'),
        dashboard: resolve(__dirname, 'pages/dashboard/dashboard.html'),
        prompts: resolve(__dirname, 'pages/prompts/prompts.html'),
        login: resolve(__dirname, 'pages/login/login.html'),
      },
    },
  },
  server: {
    open: true, // Автоматично отваря браузъра
  },
})