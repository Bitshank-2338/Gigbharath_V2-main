import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // 1. Added this import

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
     server: {
  port: 5173,
  strictPort: false,
  host: '127.0.0.1',
},
      plugins: [
        react(),
        tailwindcss(), // 2. Added this to the plugins array
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});