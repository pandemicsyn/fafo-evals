import { flue } from '@flue/vite';
import { defineConfig } from 'vite';
export default defineConfig({
  plugins: [flue({ providers: ['openrouter'] })],
  server: { host: '127.0.0.1', port: 3583, strictPort: true, cors: false },
});
