// ============================================================================
// PREGUNTAS FRECUENTES
// ============================================================================
// Fuente única de verdad: alimenta tanto el acordeón visible de DocsSection.astro
// como el JSON-LD FAQPage que Google usa para los resultados enriquecidos. Antes
// estaba duplicado en dos sitios y podían desincronizarse.
//
// `answer` admite HTML en línea sencillo (<strong>, <em>) porque se inyecta con
// set:html. `plainAnswer` es la versión sin marcado para los datos estructurados.
// ============================================================================

export interface FaqEntry {
  question: string;
  /** Respuesta con marcado ligero para la UI */
  answer: string;
  /** Lista de puntos opcional que se renderiza como <br/>• en la UI */
  bullets?: string[];
  /** Respuesta sin HTML para el JSON-LD */
  plainAnswer: string;
}

// Unifica respuesta + puntos en el texto plano del esquema
function toPlain(answer: string, bullets: string[] = []): string {
  const strip = (html: string) =>
    html
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  return [strip(answer), ...bullets.map(strip)].join(' ');
}

const raw: Array<Omit<FaqEntry, 'plainAnswer'>> = [
  {
    question: '¿Es una app oficial de la Universidad de las Fuerzas Armadas ESPE?',
    answer:
      '<strong>No.</strong> Esperancitos la hice yo, un estudiante, por mi cuenta y para ayudar a mis compañeros. No es una app oficial ni tiene el respaldo de la universidad.',
  },
  {
    question: '¿Se guardan mis credenciales en algún servidor externo o en la nube?',
    answer:
      '<strong>No.</strong> Esperancitos no tiene servidores propios que guarden tus datos. La conexión va directo de tu celular a las páginas oficiales de la ESPE. Tus credenciales de sesión (tokens de Moodle y cookies de Banner) se almacenan cifradas en el almacenamiento seguro de tu dispositivo (Android Keystore con cifrado por hardware AES y Keychain en iOS), y tu información académica se guarda localmente (Drift SQLite) en el sandbox privado y aislado de la app.',
  },
  {
    question: '¿Dónde escribo mi contraseña?',
    answer:
      'Para Moodle no la escribes: entras con el código QR oficial. Para el horario y las notas, el inicio de sesión se realiza directamente en el navegador del sistema mediante el portal oficial de Microsoft 365 / miESPE. Esperancitos nunca conoce, intercepta, guarda ni transmite tu contraseña institucional; únicamente recibe y almacena las cookies de sesión temporal necesarias para consultar tu horario, cifradas en el almacenamiento seguro del sistema.',
  },
  {
    question: '¿Quién es responsable de lo que hago con mi cuenta?',
    answer:
      'Tú. Esperancitos usa únicamente tu propia cuenta y el reglamento de tecnologías de la ESPE hace al estudiante responsable de las acciones realizadas desde ella. Verifica siempre tu información en miESPE y Moodle.',
  },
  {
    question: '¿Qué pasa si la ESPE cambia o bloquea sus sistemas?',
    answer:
      'La app puede dejar de funcionar total o parcialmente. Es un proyecto independiente y no hay garantía de disponibilidad. Tus datos descargados siguen en tu teléfono hasta que cierres sesión o desinstales.',
  },
  {
    question: '¿Cómo y cada cuánto consulta la app en segundo plano?',
    answer:
      'La vigilancia de mensajes en Moodle se ejecuta cada 15 minutos; la verificación de tareas y notas pendientes se realiza cada 6 horas (con límite mínimo de 1 hora entre consultas); y la sincronización de horario de Banner es configurable por el usuario (6h, 12h, 24h o apagado manual). Todos los servicios en segundo plano aplican suspensión y reintento exponencial (backoff) ante pérdidas de conectividad o errores de red.',
  },
  {
    question: '¿Cómo funciona el cálculo del año estimado de graduación en la Malla?',
    answer:
      'La app mira cuántos créditos ya aprobaste frente al total que exige tu carrera, calcula a qué ritmo vas aprobando materias por semestre y con eso te da un año aproximado de graduación (por ejemplo, 2028 o 2029).',
  },
  {
    question: '¿Cómo conecto mi Moodle sin escribir mi contraseña?',
    answer:
      'Se usa el código QR oficial de Moodle: entras a <code>micampus.espe.edu.ec</code>, abres tu perfil y generas el <em>código QR para la app móvil</em>. Desde Esperancitos tocas <em>Escanear QR de Moodle</em> y listo. Tu contraseña nunca pasa por la aplicación.',
  },
  {
    question: '¿Qué hago si la pantalla de la Malla se ve recortada en mi teléfono?',
    answer: 'Tienes dos botones para eso:',
    bullets: [
      '<strong>Minimizar resumen:</strong> toca la flecha de arriba para encoger el resumen de graduación a una barrita y ganar espacio.',
      '<strong>Pantalla completa:</strong> toca el botón de pantalla completa en la barra de filtros para ocultar la cabecera y ver la malla entera.',
    ],
  },
  {
    question: '¿Funciona sin conexión a internet?',
    answer:
      'Sí. Tu malla, tu horario, tus tareas y tus notas se guardan dentro de la app, así que puedes verlos en un sótano, en un laboratorio sin señal o en modo avión. Solo necesitas internet para volver a sincronizar con la universidad.',
  },
  {
    question: '¿La aplicación seguirá siendo gratis?',
    answer:
      'Sí, y seguirá sin publicidad. La mantengo activa en mi tiempo libre. Si quieres ayudar a que siga así, puedes aportar de forma voluntaria o simplemente contarme errores e ideas desde la sección de comentarios.',
  },
  {
    question: '¿Hay versión para iPhone?',
    answer:
      'Todavía no. La app está hecha solo para Android porque publicar en la App Store requiere un Mac, y el proyecto lo lleva una sola persona. Estamos <strong>buscando colaboradores</strong> que sepan programar para iOS o que tengan un Mac para poder compilar. Si puedes ayudar, en la sección <em>Colaboradores</em> están los detalles y el correo de contacto.',
  },
  {
    question: '¿Por qué la app no está en Google Play?',
    answer:
      'Porque la cuenta de desarrollador de Google cuesta <strong>25 dólares, una sola vez</strong>, y ese gasto lo cubre el proyecto de su propio bolsillo. Estamos juntando ese monto con aportes voluntarios. Mientras tanto la app se descarga desde esta página, y por eso Android pide autorizar la instalación.',
  },
  {
    question: '¿Cómo reporto un error o sugiero una nueva función?',
    answer:
      'En la sección <em>Cuéntame qué opinas</em> de esta página tienes un botón para reportar errores y otro para enviar ideas. Los mensajes llegan directo a mí.',
  },
];

export const FAQ_ENTRIES: FaqEntry[] = raw.map((entry) => ({
  ...entry,
  plainAnswer: toPlain(entry.answer, entry.bullets),
}));
