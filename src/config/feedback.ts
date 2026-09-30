// ============================================================================
// CANALES DE CONTACTO: reportes de bugs, sugerencias y soporte
// ============================================================================
// CONFIGURA AQUÍ TUS FORMULARIOS. Sustituye `url` por el enlace real de tu
// formulario (Google Forms, Tally, Microsoft Forms, Airtable, etc.).
//
//   · Si una `url` queda vacía (''), su botón aparece DESHABILITADO con el
//     rótulo "Próximamente" en vez de llevar a un enlace roto.
//   · Si ese formulario además es opcional, pon `optional: true` y su tarjeta
//     se oculta por completo.
//
// Ejemplo de enlace de Google Forms:
//   https://docs.google.com/forms/d/e/1FAIpQLSd.../viewform
// ============================================================================

export interface FeedbackChannel {
  id: string;
  /** Texto del botón */
  label: string;
  /** Enlace al formulario. Vacío = botón deshabilitado */
  url: string;
  /** Frase corta que explica para qué sirve */
  description: string;
  /** Texto de apoyo dentro de la tarjeta */
  hint: string;
  /** Icono identificador */
  icon: 'bug' | 'sparkles' | 'star' | 'mail';
  /** Color de acento */
  accent: 'green' | 'amber' | 'critical';
  /** Si es true y no hay url, la tarjeta entera se oculta */
  optional?: boolean;
}

export const FEEDBACK_CONFIG = {
  /** Tiempo de respuesta que prometes, en texto libre */
  responseTime: 'Normalmente respondo en 24–48 horas',

  channels: <FeedbackChannel[]>[
    {
      id: 'bug',
      label: 'Reportar un error',
      url: '', // <-- PEGA AQUÍ EL ENLACE DE TU FORMULARIO DE ERRORES
      description: '¿Algo no funciona como debería?',
      hint: 'Cuéntame qué pasó, en qué pantalla y qué celular usas. Si puedes, adjunta una captura de pantalla.',
      icon: 'bug',
      accent: 'critical',
    },
    {
      id: 'feature',
      label: 'Sugerir una idea',
      url: '', // <-- PEGA AQUÍ EL ENLACE DE TU FORMULARIO DE SUGERENCIAS
      description: '¿Se te ocurre algo que le falta a la app?',
      hint: 'Ideas de nuevas funciones, cosas que se podrían mejorar o carreras que quieras ver integradas.',
      icon: 'sparkles',
      accent: 'green',
    },
    {
      id: 'survey',
      label: 'Dejar mi opinión',
      url: '', // <-- OPCIONAL: encuesta corta de satisfacción
      description: 'Una encuesta rápida de 1 minuto',
      hint: 'Ayúdame a entender qué es lo que más usas y qué debería mejorar primero en la próxima versión.',
      icon: 'star',
      accent: 'amber',
      optional: true,
    },
  ] as FeedbackChannel[],
} as const;

/** Canales con enlace configurado. */
export function enabledChannels(): FeedbackChannel[] {
  return FEEDBACK_CONFIG.channels.filter(
    (channel) => channel.url.trim().length > 0 || !channel.optional
  );
}

/** true si al menos un canal tiene formulario listo. */
export const hasAnyFormUrl = FEEDBACK_CONFIG.channels.some(
  (channel) => channel.url.trim().length > 0
);
