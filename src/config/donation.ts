// ============================================================================
// CONFIGURACIÓN DE APOYO AL PROYECTO — Deuna
// ============================================================================
// Deuna es el único método de aporte: el estudiante escanea el QR o abre el
// enlace directo. Ya no se muestran datos de transferencia bancaria.
//
// ¿PARA QUÉ SIRVE EL DINERO?
//   Los aportes cubren la cuenta de desarrollador de Google Play (25 USD por
//   única vez) y el dominio. Nada más: la app es gratis y sin publicidad.
//
// CÓMO COMPLETARLO:
//   1. deunaLink -> tu enlace de cobro de Deuna (ej. https://deuna.app/...).
//                   Si lo dejas vacío, la interfaz oculta el botón "Aportar"
//                   y deja sólo el QR.
//   2. qrImage   -> reemplaza public/images/qr-donacion.jpg por tu QR real.
// ============================================================================

export const DEUNA_LINK_READY = false;

export interface DonationGoal {
  label: string;
  detail: string;
  status: 'en curso' | 'listo';
}

export const DONATION_CONFIG = {
  // Si sigues usando valores de ejemplo, la interfaz muestra el aviso de borrador
  isPlaceholder: true,

  // --- Deuna ------------------------------------------------------------------
  deunaLinkReady: DEUNA_LINK_READY,
  deunaLink: 'https://deuna.app/tu-enlace-de-cobro', // <-- REEMPLAZAR
  deunaHolder: 'Mateo (Dev Esperancitos)',

  /** QR principal: se muestra a 240 px en la sección de apoyo. Debe verse nítido
   *  para poder escanearlo desde otra pantalla. Reemplaza el archivo por el tuyo. */
  qrImage: '/images/qr-donacion.jpg',

  /** Versión reducida del mismo QR, para el chip del héroe y el modal (32-130 px).
   *  Si cambias el QR principal, regenera esta miniatura con:
   *      python tools/build_assets.py */
  qrThumbImage: '/images/qr-donacion-thumb.png',

  /**
   * En qué se usa el dinero. Se muestra en la sección de apoyo para que quien
   * aporta sepa exactamente a qué va. Edita o añade metas según avance el proyecto.
   */
  goals: [
    {
      label: 'Cuenta de desarrollador de Google Play',
      detail: '25 USD por única vez, para que la app esté en la tienda oficial',
      status: 'en curso',
    },
    {
      label: 'Dominio y hosting de esta web',
      detail: 'Mantener la página en línea para que puedas descargar la app',
      status: 'en curso',
    },
  ] as DonationGoal[],

  // Checksum SHA-256 opcional para verificación de integridad del APK
  apkSha256: '', // Dejar vacío si no se publica el checksum
} as const;

// Aviso en compilación si todavía quedan datos de ejemplo
if (DONATION_CONFIG.isPlaceholder) {
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "⚠️ [ESPERANCITOS CONFIG] DONATION_CONFIG usa datos de ejemplo (PLACEHOLDER). Actualiza deunaLink y qrImage en src/config/donation.ts antes del despliegue final."
  );
}
