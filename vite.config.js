import { defineConfig } from 'vite';
import path from 'path';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [uni()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      },
    extensions: ['.js', '.ts', '.vue', '.json']
  }, 
  build: {},
  
  optimizeDeps: {
    include: ['@dcloudio/uni-mp-weixin'] 
  }
});