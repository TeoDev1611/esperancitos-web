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
  releaseDate: '2026-09-30',
  fileSize: '30.8MB',
  minAndroid: '8.0',

  /** APK principal de descarga (el que enlazan los CTA). */
  primaryApkPath: '/downloads/esperancitos-v1.0.0-arm64.apk',

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
    'esperancitos-v1.0.0-arm64.apk':
      'b311a1ee815a0e033d589a2d42524fd87851b187d1105e862d8ffd4b7c4b5b09',
    'esperancitos-v1.0.0-arm32.apk':
      'b91df92ada6666dec2a9732a99fa7c7b3ec2290bf78e59a2e555a620ec3a901a',
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
