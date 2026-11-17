// ============================================================================
// PREGUNTAS FRECUENTES (FAQ) - PILAS! APP
// ============================================================================
// Fuente única de verdad: alimenta tanto la página /faq, la sección de vista previa
// en la home, como el JSON-LD FAQPage que Google usa para los resultados enriquecidos.
// ============================================================================

export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  /** Respuesta con marcado ligero para la UI */
  answer: string;
  /** Lista de puntos opcional que se renderiza como lista en la UI */
  bullets?: string[];
  /** Respuesta sin HTML para el JSON-LD */
  plainAnswer: string;
}

export interface FaqCategory {
  id: string;
  name: string;
  icon: string;
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  { id: "todos", name: "Todas las preguntas", icon: "✨" },
  { id: "instalacion", name: "Instalación: Android y iPhone", icon: "📱" },
  { id: "seguridad", name: "Seguridad & Cuentas", icon: "🛡️" },
  { id: "moodle", name: "Moodle & Tareas", icon: "📚" },
  { id: "horarios", name: "Horario, Amigos & Notas", icon: "⏰" },
  { id: "malla", name: "Malla, Sin internet & Bienestar", icon: "📊" },
  { id: "general", name: "General & Herramientas", icon: "💬" },
];

function toPlain(answer: string, bullets: string[] = []): string {
  const strip = (html: string) =>
    html
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  return [strip(answer), ...bullets.map(strip)].join(" ");
}

const PLAY_URL = "https://play.google.com/store/apps/details?id=dev.teodev.pilas";
const IOS_URL = "https://pilas-pwa.vercel.app";
const WA_GROUP = "https://chat.whatsapp.com/FAwkWyYVK2x3sEtGuoLVzc";
const IG_LINK = '<a href="https://www.instagram.com/pilas_ec.app/" target="_blank" rel="noopener noreferrer">@pilas_ec.app</a>';
const WA_LINK = `<a href="${WA_GROUP}" target="_blank" rel="noopener noreferrer">grupo de WhatsApp</a>`;

const raw: Array<Omit<FaqEntry, "plainAnswer">> = [
  // --- 1. INSTALACIÓN: ANDROID Y IPHONE ---
  {
    id: "como-instalar-android",
    category: "instalacion",
    question: "¿Cómo instalo Pilas! en Android?",
    answer: `Desde <strong>Google Play</strong>, como cualquier app: busca <em>Pilas!</em> o entra directo a <a href="${PLAY_URL}" target="_blank" rel="noopener noreferrer">la ficha de Pilas! en Google Play</a> y toca <em>Instalar</em>. Es gratis y funciona desde <strong>Android 8.0</strong>. Ya no necesitas formularios, correos ni APK.`,
  },
  {
    id: "como-instalar-iphone",
    category: "instalacion",
    question: "¿Hay Pilas! para iPhone? ¿Cómo la instalo?",
    answer: "<strong>Sí.</strong> En iPhone se instala desde Safari, no desde el App Store:",
    bullets: [
      `Abre <a href="${IOS_URL}" target="_blank" rel="noopener noreferrer"><strong>pilas-pwa.vercel.app</strong></a> en <strong>Safari</strong>.`,
      "Toca <strong>Compartir</strong> y luego <strong>Agregar a pantalla de inicio</strong>.",
      "Abre Pilas! desde el ícono que aparece en tu pantalla de inicio, como cualquier otra app.",
    ],
  },
  {
    id: "diferencias-iphone",
    category: "instalacion",
    question: "¿Qué cambia entre la versión de Android y la de iPhone?",
    answer:
      "Casi todo es igual: Moodle (tareas, notas, entregas, foros, cuestionarios y mensajes), horario, amigos, Wrapped, malla, calculadora, carnet y herramientas PDF. Las diferencias:",
    bullets: [
      "<strong>Alarma de entregas:</strong> en Android suena con el teléfono bloqueado. En iPhone tus entregas se exportan al <strong>Calendario de iPhone</strong>, que te avisa aunque Pilas esté cerrada.",
      "<strong>Avisos de notas, tareas y mensajes:</strong> en Android llegan en segundo plano. En iPhone aparecen al abrir Pilas, y el ícono muestra el número de pendientes.",
      "<strong>Widgets:</strong> en Android hay widgets de Pilas. En iPhone usas los widgets del Calendario, que muestran tus entregas.",
      "<strong>OCR (texto desde una foto)</strong> y <strong>bloqueo con PIN o huella:</strong> por ahora solo en Android.",
    ],
  },
  {
    id: "puente-pilas",
    category: "instalacion",
    question: "¿Qué es el Puente Pilas?",
    answer:
      "Es un <strong>favorito de Safari</strong> que conecta Mi Campus y Banner con Pilas! en iPhone. Lo usas para traer tu horario y tu historial de la ESPE, y también sirve para entrar a cualquier Moodle. En Android no lo necesitas: inicias sesión dentro de la app.",
  },
  {
    id: "como-se-actualiza",
    category: "instalacion",
    question: "¿Cómo se actualiza la app?",
    answer: `En Android, <strong>Google Play</strong> la actualiza como cualquier otra app. En iPhone, la app se actualiza sola al abrirla con internet. Tus datos se conservan. Anunciamos cada versión en nuestro Canal de WhatsApp y en Instagram (${IG_LINK}).`,
  },
  {
    id: "permisos-solicitados",
    category: "instalacion",
    question: "¿Qué permisos pide la app en Android y para qué?",
    answer: "Solo los necesarios:",
    bullets: [
      "<strong>Notificaciones:</strong> para avisarte de notas, tareas y mensajes nuevos.",
      "<strong>Alarmas exactas:</strong> para que la alarma de entregas suene a la hora que elegiste, incluso con el teléfono bloqueado.",
      "<strong>Cámara (opcional):</strong> para escanear códigos QR y documentos.",
      "<strong>Archivos:</strong> para guardar materiales de Moodle y los PDF que generas con las herramientas.",
    ],
  },

  // --- 2. SEGURIDAD & CUENTAS ---
  {
    id: "es-oficial-espe",
    category: "seguridad",
    question: "¿Es una aplicación oficial de la ESPE o de mi universidad?",
    answer:
      "<strong>No.</strong> Pilas! es un proyecto independiente, hecho por estudiantes para estudiantes. No es una app institucional ni tiene respaldo oficial de ninguna universidad.",
  },
  {
    id: "servidores-credenciales",
    category: "seguridad",
    question: "¿Se guardan mis datos o contraseñas en algún servidor?",
    answer:
      "<strong>No.</strong> Pilas! no tiene servidores que guarden tus notas, tus contraseñas ni tu horario: ni siquiera nosotros los vemos. La app habla directo con Moodle y Banner desde tu teléfono. Tus datos se guardan en tu teléfono, con el acceso a Moodle cifrado. No hay anuncios, ni analítica, ni cuentas de Pilas.",
  },
  {
    id: "cerrar-sesion",
    category: "seguridad",
    question: "¿Qué pasa con mis datos si cierro sesión?",
    answer:
      "Al cerrar sesión <strong>se borra todo</strong> lo que Pilas! guardó en tu teléfono. Si quieres, puedes conservar tu agenda y tu malla. En Android también puedes bloquear la app con <strong>PIN o huella</strong>.",
  },
  {
    id: "responsabilidad-cuenta",
    category: "seguridad",
    question: "¿Quién es responsable de las acciones realizadas con mi cuenta?",
    answer:
      "Tú eres responsable del uso de tu cuenta institucional. Pilas! es una herramienta que usa tus portales igual que lo harías desde el navegador. Verifica siempre las notas y los trámites importantes en los portales oficiales de tu universidad.",
  },
  {
    id: "cambios-sistemas-espe",
    category: "seguridad",
    question: "¿Qué pasa si la universidad cambia sus plataformas?",
    answer:
      "Al ser una app independiente, un cambio grande en Banner o Moodle puede requerir una actualización. Mientras tanto, los datos que ya cargaste siguen guardados en tu teléfono y disponibles sin internet.",
  },
  {
    id: "codigo-abierto-privado",
    category: "seguridad",
    question: "¿Pilas! es de código abierto?",
    answer:
      "<strong>No.</strong> El código es privado, pero la app es <strong>gratis</strong> para todos los estudiantes.",
  },

  // --- 3. MOODLE & TAREAS ---
  {
    id: "conectar-moodle",
    category: "moodle",
    question: "¿Cómo conecto mi Moodle?",
    answer: "Tienes varias formas:",
    bullets: [
      "<strong>ESPE:</strong> inicias sesión con tu cuenta miESPE dentro de la app (Android) o con el Puente Pilas desde Safari (iPhone).",
      "<strong>Otras universidades:</strong> con tu usuario y contraseña de Moodle, con el <strong>código QR</strong> de tu aula virtual (Perfil → Código QR para la app móvil) o con el Puente Pilas.",
      "Puedes tener <strong>varias cuentas de Moodle</strong> a la vez, por ejemplo si estudias en dos instituciones.",
    ],
  },
  {
    id: "moodle-compatible",
    category: "moodle",
    question: "¿Funciona con cualquier Moodle?",
    answer: `Funciona con los Moodle que tienen habilitada la <strong>app móvil oficial</strong> por parte de la universidad. Si tu Moodle no conecta, escríbenos al ${WA_LINK} y lo revisamos.`,
  },
  {
    id: "entregar-tareas",
    category: "moodle",
    question: "¿Puedo entregar tareas desde el teléfono?",
    answer:
      "<strong>Sí.</strong> Puedes subir archivos o texto a tus tareas de Moodle. También ver tus notas en árbol (igual al libro de calificaciones de Moodle), resolver cuestionarios con temporizador y autoguardado, responder en los foros y escribir mensajes tipo chat.",
  },
  {
    id: "descargar-archivos-moodle",
    category: "moodle",
    question: "¿Puedo descargar los materiales de Moodle para verlos sin internet?",
    answer:
      "<strong>Sí.</strong> Los materiales del curso se descargan a tu teléfono con un gestor de descargas, para abrirlos cuando quieras, aunque estés sin señal. También puedes compartir una tarea, un checklist, materiales o el \"kit del paralelo\" con un enlace.",
  },
  {
    id: "alarma-entregas",
    category: "moodle",
    question: "¿Cómo me avisa Pilas! antes de una entrega?",
    answer:
      "Recibes recordatorios escalonados (7 días, 3 días, 24 h y 3 h) y puedes activar <strong>No molestar</strong> en tus horas de descanso.",
    bullets: [
      "<strong>Android:</strong> una alarma real antes de cada entrega, que suena con el teléfono bloqueado. Eliges la anticipación, las materias o solo las urgentes.",
      "<strong>iPhone:</strong> exportas tus entregas al Calendario de iPhone, que te avisa a la hora que elijas y un día antes, aunque Pilas esté cerrada.",
    ],
  },

  // --- 4. HORARIO, AMIGOS & NOTAS ---
  {
    id: "sincronizar-horario-banner",
    category: "horarios",
    question: "¿Cómo traigo mi horario desde Banner (ESPE)?",
    answer:
      "En Android inicias sesión con miESPE dentro de la app; en iPhone usas el Puente Pilas desde Safari. Pilas! importa tus materias con aula, bloque y piso, y tu historial académico de periodos anteriores. Luego puedes exportar el horario al calendario del teléfono (.ics) o como imagen.",
  },
  {
    id: "horario-otras-u",
    category: "horarios",
    question: "No estudio en la ESPE, ¿cómo pongo mi horario?",
    answer:
      "Lo agregas a mano en pocos minutos, o un amigo de tu paralelo te lo comparte por QR o enlace de WhatsApp y lo importas.",
  },
  {
    id: "amigos-horarios",
    category: "horarios",
    question: "¿Cómo funciona lo de comparar horarios con amigos?",
    answer:
      "Compartes tu horario por <strong>QR o enlace de WhatsApp</strong> y eliges qué mostrar (aulas, docentes o solo ocupado/libre). Puedes comparar hasta 3 amigos encima del tuyo, ver las <strong>horas huecas en común</strong> en un mapa de calor, guardar grupos (\"parches\"), enviar invitaciones a juntas y ver si un amigo está en clase o libre ahora. Funciona entre Android e iPhone.",
  },
  {
    id: "calculadora-notas-ponderadas",
    category: "horarios",
    question: "¿Cómo funciona la calculadora de notas?",
    answer:
      "Con la escala ESPE, apruebas con <strong>14 sobre 20</strong>, o <strong>42 de 60</strong> sumando los 3 parciales. Ingresas tus notas y Pilas! te dice cuánto necesitas en el siguiente parcial. Si estudias en otra universidad, puedes configurar una escala personalizada. También hay un <strong>modo privacidad</strong> que oculta tus notas con \"•••\".",
  },
  {
    id: "materia-no-aparece",
    category: "horarios",
    question: "¿Qué hago si una materia recién matriculada no aparece?",
    answer:
      "Banner y Moodle pueden demorar en reflejar una matrícula o un cambio de NRC. Espera un poco y vuelve a actualizar desde Pilas!. Si sigue sin aparecer, escríbenos al grupo de WhatsApp.",
  },

  // --- 5. MALLA, SIN INTERNET & BIENESTAR ---
  {
    id: "funciona-sin-internet-offline",
    category: "malla",
    question: "¿La app funciona sin internet?",
    answer:
      "<strong>Sí</strong>, una vez cargados tus datos: horario, tareas, notas, malla y materiales descargados se guardan en tu teléfono. Solo necesitas internet para traer datos nuevos.",
  },
  {
    id: "malla-interactiva",
    category: "malla",
    question: "¿Qué muestra la malla curricular?",
    answer:
      "Una malla interactiva con tus materias aprobadas y pendientes, y los prerrequisitos de cada una, para que sepas qué puedes tomar el próximo semestre.",
  },
  {
    id: "bienestar",
    category: "malla",
    question: "¿Tiene algo para no cansar la vista o no agobiarme?",
    answer:
      "Sí. Hay un <strong>modo migraña</strong> (menos brillo, contraste y animaciones), un <strong>filtro cálido</strong> para leer de noche y la opción <strong>una cosa a la vez</strong>, que muestra tus tareas en acordeones para no saturarte.",
  },

  // --- 6. GENERAL & HERRAMIENTAS ---
  {
    id: "diferencia-espe-vs-multiu",
    category: "general",
    question: "¿Qué diferencia hay entre usar Pilas! en la ESPE y en otra universidad?",
    answer: "<strong>Pilas! se adapta a tu universidad:</strong>",
    bullets: [
      "<strong>ESPE (Sangolquí, Latacunga, Santo Domingo):</strong> la experiencia completa, con Mi Campus y Banner. Tu horario y tu historial se importan solos, y la calculadora usa la escala ESPE (14 sobre 20, o 42 de 60 sumando los 3 parciales).",
      "<strong>Otras universidades con Moodle (UCE, UNL y más):</strong> todo lo de Moodle y las herramientas. El horario lo agregas a mano o te lo comparte un amigo, y la calculadora admite escalas personalizadas.",
    ],
  },
  {
    id: "modo-multi-universidad",
    category: "general",
    question: "¿Funciona si estudio en otra universidad?",
    answer: `<strong>Sí, si tu universidad usa Moodle.</strong> Ya la usan estudiantes de la UTA, UCE, EPN y UNACH, además de la ESPE. Tienes todo lo de Moodle y las herramientas; el horario lo agregas a mano o te lo comparte un amigo.<br><br>¿Tu Moodle no conecta? Escríbenos al ${WA_LINK}.`,
  },
  {
    id: "que-es-pilas-tools",
    category: "general",
    question: "¿Qué herramientas incluye?",
    answer:
      "Una navaja suiza para tus deberes. Todo funciona en tu teléfono, sin subir tus archivos a ningún servidor:",
    bullets: [
      "<strong>PDF:</strong> comprimir para Moodle, unir, dividir, organizar y rotar, proteger o desbloquear, numerar con marca de agua y limpiar metadatos.",
      "<strong>Convertir:</strong> Word, fotos y tablas a PDF, y PDF a Word, PowerPoint o imágenes.",
      "<strong>Escáner de documentos</strong> con la cámara, <strong>firma</strong> dibujada y <strong>ZIP</strong>.",
      "<strong>Carátula universitaria</strong> con los logos ESPE o el logo de tu universidad, unida a tu deber.",
      "<strong>Diagnóstico de Moodle y de la red:</strong> te dice si se cayó Moodle o es tu internet.",
      "<strong>OCR</strong> (texto desde una foto): solo en Android.",
    ],
  },
  {
    id: "carnet-digital",
    category: "general",
    question: "¿Cómo funciona el carnet digital?",
    answer:
      "Guardas en Pilas! la captura de tu credencial (en la ESPE, desde espematico.espe.edu.ec) y la ves a pantalla completa con un efecto holográfico. Es una forma rápida de tenerla a la mano; <strong>no reemplaza a tu carnet físico</strong>.",
  },
  {
    id: "wrapped",
    category: "general",
    question: "¿Qué es Pilas! Wrapped?",
    answer:
      "El resumen de tu semestre con un arquetipo de estudiante, calculado en tu teléfono. Listo para compartir en historias.",
  },
  {
    id: "sedes-latacunga-santo-domingo",
    category: "general",
    question: "¿Funciona para las sedes de Latacunga y Santo Domingo?",
    answer:
      "<strong>Sí.</strong> La experiencia completa con Mi Campus y Banner funciona en Sangolquí, Latacunga y Santo Domingo.",
  },
  {
    id: "gratuita-siempre",
    category: "general",
    question: "¿Pilas! es gratis?",
    answer: "<strong>Sí.</strong> Es gratis y sin anuncios, en Android y en iPhone.",
  },
  {
    id: "como-reportar-error",
    category: "general",
    question: "¿Cómo reporto un error o propongo una función?",
    answer: `Escríbenos al ${WA_LINK}, donde damos soporte directo, o a nuestro Instagram (${IG_LINK}). También puedes escribir por correo a <code>teo.hurtado.16@gmail.com</code>.`,
  },
];

export const FAQ_ENTRIES: FaqEntry[] = raw.map((entry) => ({
  ...entry,
  plainAnswer: toPlain(entry.answer, entry.bullets),
}));
