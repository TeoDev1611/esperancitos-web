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
  url: 'https://pilas-ec.vercel.app',
  name: 'Pilas!',
  locale: 'es_EC',
  lang: 'es-EC',

  /** Título y descripción por defecto de la home (se indexan tal cual). */
  title: 'Pilas! v1.1-beta.2 • Todo tu semestre bajo control. Rápido, privado y sin internet.',
  description:
    'La aplicación académica definitiva para estudiantes de la Universidad de las Fuerzas Armadas ESPE. Horario de clases de Banner, tareas y chat de Moodle con alarmas, calculadora de parciales ESPE, malla curricular interactiva, carnet digital y widgets de pantalla de inicio: tus credenciales nunca salen de tu teléfono. Disponible 100% gratis para todos los estudiantes.',

  /** Palabras clave orientadas a búsquedas reales de estudiantes de la ESPE. */
  keywords: [
    'Pilas!',
    'app Pilas',
    'ponte pilas',
    'pilas ñañ@s',
    'pilas ñaño',
    'pilas ñaña',
    'mijin',
    'socio',
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

  /** Imagen para Open Graph / Twitter Card. */
  ogImage: {
    path: '/logos/icono_logo2.svg',
    width: 1200,
    height: 630,
    alt: 'Pilas!: Tu vida universitaria al día. Sin rodeos. ESPE',
  },

  /** Versión publicada del APK. */
  version: '1.1.0-beta.2',
  versionTag: 'v1.1-beta.2',
  build: 5,
  releaseDate: '2026-10-10',
  fileSize: '37.2 MB',
  minAndroid: '8.0',

  /** APK principal de descarga (el que enlazan los CTA). */
  primaryApkPath: '/downloads/pilas-v1.1-beta.2-arm64-v8a.apk',

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
    'pilas-v1.1-beta.2-arm64-v8a.apk':
      '6146d397772f13c4aa3032e91ad4f5957af7d8fd612235bb9043e30ac66a9ff2',
    'pilas-v1.1-beta.2-armeabi-v7a.apk':
      'b5eb74cdb1b8e21609c9c10067f948b4125c57fa5043f552e376014e9340977a',
    'pilas-v1.1-beta.2-universal.apk':
      '9f5ba9c879b51b13c29491846673149174bfc004f2d9376fcbe7ad5eb4d04cbc',
    'pilas-v1.1-beta.2-x86_64.apk':
      '999c710f32bb91922a1fc089d841e65d152e2c48888ef7482df6c24cbb394953',
    'pilas-v1.1-beta.1-arm64-v8a.apk':
      'f9f2d4662b3532c639f829e5adce2eae824c4bfcf3712a0b93d4f8f6fe9dea81',
    'pilas-v1.1-beta.1-armeabi-v7a.apk':
      'b4bea6bdd30c4017cb93ef4ba9efb382e79975ab3bd063ca586d97dedb6135f0',
    'pilas-v1.1-beta.1-universal.apk':
      'b199849ec9e9413a3bb3034b52bcedfe2716360d644263e4483f1c5083111995',
    'pilas-v1.1-beta.1-x86_64.apk':
      'fe8a5eef4a6e44d1eb8f5ba043c2ad053821e636601996f03418b0210c2db92c',
    'esperancitos-v1.1.0-arm64-v8a.apk':
      '05447386e742c27fd2a5e9e6a78ad74309d31429594cae676e64070ad6bb5a39',
    'esperancitos-v1.1.0-armeabi-v7a.apk':
      'a46d64c302b7540491b4ddfce75e99a88fa74f3f069a202feaf29698dcbead27',
    'esperancitos-v1.1.0-universal.apk':
      'f28e8a763d638abfaa07fb0a7f9b58362bf3cc1bc1fa12fc0081adb5d0a46345',
    'esperancitos-v1.1.0-x86_64.apk':
      '4bfe6c0c4818b1338f5dee37412875a6c2ca388746adc935fbef432f78b183e8',
    'esperancitos-v1.0.0-arm64-v8a.apk':
      'e9a8a14fce3ecb23921f1289e918e70889786eb6f153b7dfa4dc6a9caa727861',
    'esperancitos-v1.0.0-armeabi-v7a.apk':
      '620a060758fd094838725491ef3c451d9175ca52ab6f1c53d67fb819e9087004',
    'esperancitos-v1.0.0-universal.apk':
      '6b47bf8fe58008c5378ab477e730c73b2acaf991d3ca4c7af22bee4f31e057d3',
    'esperancitos-v1.0.0-x86_64.apk':
      '649c041ff85e4e35cf6d685b18b882bb2642f4dd60e409be98b4b269cd98ffab',
  } as Record<string, string>,

  /** Páginas legales del sitio. */
  privacyPath: '/privacidad',

  /** Perfiles oficiales. Deja vacío ('') para omitir la etiqueta. */
  social: {
    github: '',
    instagram: '',
    email: 'teo.hurtado.16@gmail.com',
    whatsappChannel: 'https://whatsapp.com/channel/0029VbDorHS4SpkCdv49bM3g',
  },

  /** Autor del proyecto (se usa en los datos estructurados). */
  author: {
    name: 'Dev Pilas! ESPE',
    // Perfil de GitHub/red social del autor; vacío = se omite
    url: '',
  },
} as const;

/** URL absoluta de un recurso del sitio. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}
