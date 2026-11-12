// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const DYNAMIC_UNIVERSAL_PREFIXES = [
  '/amigo',
  '/a',
  '/tarea',
  '/tareas',
  '/materiales',
  '/curso',
  '/junta',
  '/api/og',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://pilas-ec.vercel.app',
  output: 'static',
  adapter: vercel({
    imageService: false,
  }),
  integrations: [
    sitemap({
      filter: (page) => {
        try {
          const { pathname } = new URL(page);
          return !DYNAMIC_UNIVERSAL_PREFIXES.some((prefix) =>
            pathname === prefix || pathname.startsWith(`${prefix}/`),
          );
        } catch {
          return true;
        }
      },
    }),
  ],

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

  // Configuración de Vite para Windows y dependencias SSR con assets WASM/TTF (@vercel/og)
  vite: {
    ssr: {
      external: ['@vercel/og'],
    },
    server: {
      watch: {
        ignored: ['**/ejemplo-pilas-web-design/**', '**/*.pdf'],
      },
    },
  },
});
