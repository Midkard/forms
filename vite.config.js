// vite.config.js
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig(({mode}) => {
  const dev = mode === 'development';
  const config = {
    // root: 'src',
    base: './',
    publicDir: false,
    resolve: {
      alias: {
        '@dnt-theme/forms': path.resolve(__dirname, 'src/namespace.ts'),
      },
    },
    css: {
      devSourcemap: true,
    },
    build: {
      outDir: `lib`,
      assetsDir: '.',
      emptyOutDir: false,
      copyPublicDir: false,
      lib: {
        entry: path.resolve(__dirname, 'src/forms.ts'),
        formats: ['es'],
        fileName: 'forms',
      },
      // rollupOptions: {
      //   input: 'src/index.ts',
      // },
    },
  }

  if (dev) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const host = '0.0.0.0';
    const port = 3000;

    config.server = {
      host,
      port,
      strictPort: true,
      cors: {
        // the origin you will be accessing via browser
        origin: 'http://localhost',
      },
      //подставляется в урл ассетов
      origin: `http://localhost:3000`,
      allowedHosts: ['localhost', '127.0.0.1'],
    };
  }
  return config
})
