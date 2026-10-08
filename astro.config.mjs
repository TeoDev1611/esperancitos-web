// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Dominio de producción: lo usa Astro para `Astro.site`, la URL canónica y
  // todas las etiquetas absolutas de Open Graph. Cámbialo aquí y en
  // src/config/site.ts si algún día migras de dominio.
  site: 'https://pilas-ec.vercel.app',

  // El sitio es una sola página; se mantiene estático sin integraciones extra.
  build: {
    // Genera las etiquetas <link> de los estilos por página
    inlineStylesheets: 'auto',
  },

  // Comprime el HTML de salida para reducir el peso de la página
  compressHTML: true,
});
