// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://pilas-ec.vercel.app',
  integrations: [sitemap()],

  // El sitio es una sola página; se mantiene estático sin integraciones extra.
  build: {
    // Genera las etiquetas <link> de los estilos por página
    inlineStylesheets: 'auto',
  },

  // Comprime el HTML de salida para reducir el peso de la página
  compressHTML: true,

  // Redirecciones seguras para URLs obsoletas de la versión anterior
  redirects: {
    '/horario': '/#descargar',
    '/conectar': '/#descargar',
    '/convertidor': '/#descargar',
  },

  // Configuración de Vite para evitar bloqueos de archivos en Windows (ej. PDFs de screencapture)
  vite: {
    server: {
      watch: {
        ignored: ['**/ejemplo-pilas-web-design/**', '**/*.pdf'],
      },
    },
  },
});
