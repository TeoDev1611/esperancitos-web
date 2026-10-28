// ============================================================================
// CONFIGURACIÓN CENTRAL DEL SITIO
// ============================================================================
// Todo lo que afecta a SEO (dominio, título, descripción, imagen social) vive
// aquí para que Layout.astro, robots.txt y sitemap.xml no se desincronicen.
//
// IMPORTANTE: si cambias el dominio, actualiza también `public/robots.txt` y
// `public/sitemap.xml` (son archivos estáticos que no pueden leer este módulo).
// ============================================================================

import {
  RELEASE,
  PRIMARY_ARCH,
  PRIMARY_APK_SIZE,
  APK_CHECKSUMS,
  DOWNLOAD_STATS,
} from "../lib/release";
import { ACADEMIC_STATS } from "../lib/academic";

export const SITE = {
  /** URL canónica de producción, sin barra final. */
  url: "https://pilas-ec.vercel.app",
  name: "Pilas!",
  locale: "es_EC",
  lang: "es-EC",

  /** Título y descripción por defecto de la home (se indexan tal cual). */
  title:
    `Pilas! v${RELEASE.version} • La app universitaria definitiva para Android (ESPE & Multi-Universidad)`,
  description:
    `Pilas! conecta tu Moodle, tus horarios con aulas exactas, tu carnet digital y una suite de ${ACADEMIC_STATS.toolsCount} herramientas offline en una app ultra rápida, privada y sin publicidad. Diseñada para la ESPE y lista para cualquier campus universitario con Moodle.`,

  /** Enlace a formulario de inscripción a la beta cerrada de Google Play */
  playStoreBetaUrl: "https://forms.gle/svzBYKL2ZhWrS7M78",

  /** Palabras clave orientadas a búsquedas de estudiantes de la ESPE y Multi-Universidad. */
  keywords: [
    "Pilas!",
    "app Pilas",
    "ponte pilas",
    "pilas ñañ@s",
    "pilas ñaño",
    "pilas ñaña",
    "mijin",
    "socio",
    "app ESPE",
    "malla curricular ESPE",
    "horario ESPE",
    "miESPE",
    "Moodle ESPE",
    "micampus.espe.edu.ec",
    "Moodle UCE",
    "Moodle EPN",
    "Moodle UTA",
    "Moodle UNACH",
    "Moodle PUCE",
    "Moodle ESPOL",
    "Moodle Ecuador",
    "compresor PDF Moodle",
    "caratulas universitarias Ecuador",
    "calculadora notas 14.01 ESPE",
    "app estudiantes Ecuador",
    "Universidad de las Fuerzas Armadas ESPE",
    "Sangolquí",
    "Latacunga",
    "Santo Domingo",
    "calculadora de notas ESPE",
    "app horario universitario Ecuador",
    "app universitaria sin internet",
    "carnet digital universitario",
    "horas huecas universidad",
  ].join(", "),

  /** Imagen para Open Graph / Twitter Card. */
  ogImage: {
    path: "/logos/icono_logo2.svg",
    width: 1200,
    height: 630,
    alt: "Pilas!: La app universitaria definitiva. ESPE y Multi-Universidad",
  },

  /** Versión del producto y del APK distribuido */
  version: RELEASE.version,
  versionTag: `v${RELEASE.version}`,
  build: RELEASE.build,
  apkVersion: RELEASE.apkVersion,
  apkVersionTag: `v${RELEASE.apkVersion}`,
  releaseDate: RELEASE.releaseDate,
  fileSize: PRIMARY_APK_SIZE,
  minAndroid: RELEASE.minAndroid,
  versionDiscrepancyNote: RELEASE.versionDiscrepancyNote,

  /** Métricas de descargas en la comunidad universitaria */
  downloads: DOWNLOAD_STATS,

  /** APK principal de descarga (el que enlazan los CTA). */
  primaryApkPath: PRIMARY_ARCH.url,

  /** Huellas SHA-256 de los APK publicados */
  apkChecksums: APK_CHECKSUMS,

  /** Estadísticas dinámicas de mallas y herramientas offline */
  academicStats: ACADEMIC_STATS,

  /** Fecha de corte de mallas curriculares, distribución de aulas y reglas semestrales */
  academicDataLastUpdated: "20 de marzo de 2026",
  currentSemester: "2026-A",

  /** Páginas legales del sitio. */
  privacyPath: "/privacidad",

  /** Perfiles oficiales. Deja vacío ('') para omitir la etiqueta. */
  social: {
    github: "",
    instagram: "https://www.instagram.com/pilas_ec.app/",
    email: "teo.hurtado.16@gmail.com",
    whatsappChannel: "https://whatsapp.com/channel/0029VbDorHS4SpkCdv49bM3g",
    whatsappTestersGroup: "https://chat.whatsapp.com/FAwkWyYVK2x3sEtGuoLVzc",
  },

  /** Autor del proyecto (se usa en los datos estructurados). */
  author: {
    name: "Dev Pilas! ESPE",
    // Perfil de GitHub/red social del autor; vacío = se omite
    url: "",
  },
} as const;

/** URL absoluta de un recurso del sitio. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}
