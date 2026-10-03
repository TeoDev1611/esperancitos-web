// ============================================================================
// CONFIGURACIÓN CENTRAL DEL SITIO
// ============================================================================
// Todo lo que afecta a SEO (dominio, título, descripción, imagen social) vive
// aquí para que Layout.astro, robots.txt y sitemap.xml no se desincronicen.
//
// IMPORTANTE: si cambias el dominio, actualiza también `public/robots.txt` y
// `public/sitemap.xml` (son archivos estáticos que no pueden leer este módulo).
// ============================================================================

export const SITE = {
  /** URL canónica de producción, sin barra final. */
  url: 'https://esperancitos.app',
  name: 'Esperancitos',
  locale: 'es_EC',
  lang: 'es-EC',

  /** Título y descripción por defecto de la home (se indexan tal cual). */
  title: 'Esperancitos • La App Estudiantil Todo-en-Uno para la ESPE',
  description:
    'Mira tu malla curricular y calcula en qué año te gradúas, revisa tu horario con el aula de cada clase y entra a tu Moodle escaneando un código QR. Gratis, sin anuncios y funciona sin internet.',

  /** Palabras clave orientadas a búsquedas reales de estudiantes de la ESPE. */
  keywords: [
    'Esperancitos',
    'app ESPE',
    'malla curricular ESPE',
    'horario ESPE',
    'miESPE',
    'Moodle ESPE',
    'micampus.espe.edu.ec',
    'app estudiantes politécnicos',
    'Universidad de las Fuerzas Armadas ESPE',
    'Sangolquí',
    'calculadora de notas ESPE',
    'app horario universitario Ecuador',
    'app universitaria sin internet',
  ].join(', '),

  /** Imagen para Open Graph / Twitter Card. Debe ser 1200x630 apaisada. */
  ogImage: {
    path: '/images/og-esperancitos.jpg',
    width: 1200,
    height: 630,
    alt: 'Esperancitos: malla curricular, horario con aulas y Moodle por QR para estudiantes de la ESPE',
  },

  /** Versión publicada del APK. */
  version: '1.0.0',
  build: 4,
  releaseDate: '2026-10-03',
  fileSize: '35.8 MB',
  minAndroid: '8.0',

  /** APK principal de descarga (el que enlazan los CTA). */
  primaryApkPath: '/downloads/esperancitos-v1.0.0-arm64-v8a.apk',

  /**
   * Huellas SHA-256 de los APK publicados. Se muestran en la sección de
   * descargas para que cualquiera pueda verificar que el archivo que bajó es
   * exactamente el que se publicó aquí.
   *
   * PARA RECALCULARLAS tras recompilar la app:
   *   Windows : Get-FileHash archivo.apk -Algorithm SHA256
   *   Linux   : sha256sum archivo.apk
   */
  apkChecksums: {
    'esperancitos-v1.0.0-arm64-v8a.apk':
      'e9a8a14fce3ecb23921f1289e918e70889786eb6f153b7dfa4dc6a9caa727861',
    'esperancitos-v1.0.0-armeabi-v7a.apk':
      '620a060758fd094838725491ef3c451d9175ca52ab6f1c53d67fb819e9087004',
    'esperancitos-v1.0.0-universal.apk':
      '6b47bf8fe58008c5378ab477e730c73b2acaf991d3ca4c7af22bee4f31e057d3',
    'esperancitos-v1.0.0-x86_64.apk':
      '649c041ff85e4e35cf6d685b18b882bb2642f4dd60e409be98b4b269cd98ffab',
    'esperancitos-v1.0.0-arm64.apk':
      'e9a8a14fce3ecb23921f1289e918e70889786eb6f153b7dfa4dc6a9caa727861',
    'esperancitos-v1.0.0-arm32.apk':
      '620a060758fd094838725491ef3c451d9175ca52ab6f1c53d67fb819e9087004',
  } as Record<string, string>,

  /** Páginas legales del sitio. */
  privacyPath: '/privacidad',

  /** Perfiles oficiales. Deja vacío ('') para omitir la etiqueta. */
  social: {
    github: '',
    instagram: '',
    email: 'teo.hurtado.16@gmail.com',
  },

  /** Autor del proyecto (se usa en los datos estructurados). */
  author: {
    name: 'Mateo (Dev Esperancitos)',
    // Perfil de GitHub/red social del autor; vacío = se omite
    url: '',
  },
} as const;

/** URL absoluta de un recurso del sitio. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}
