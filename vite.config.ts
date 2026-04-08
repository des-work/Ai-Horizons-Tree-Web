import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        host: '0.0.0.0',
        port: 3000,
      },
      plugins: [react()],
      define: {
        'process.env.OLLAMA_URL': JSON.stringify(env.OLLAMA_URL || 'http://localhost:11434'),
        'process.env.OPENWEBUI_URL': JSON.stringify(env.OPENWEBUI_URL || ''),
        'process.env.OPENWEBUI_API_KEY': JSON.stringify(env.OPENWEBUI_API_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
    };
});
