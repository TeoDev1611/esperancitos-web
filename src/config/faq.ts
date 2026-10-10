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
  { id: "instalacion", name: "Instalación & APK", icon: "📱" },
  { id: "seguridad", name: "Seguridad & Cuentas", icon: "🛡️" },
  { id: "moodle", name: "Moodle & Tareas", icon: "📚" },
  { id: "horarios", name: "Horario, Aulas & Notas", icon: "⏰" },
  { id: "malla", name: "Malla & Modo Offline", icon: "📊" },
  { id: "general", name: "General, Sedes & iPhone", icon: "💬" },
];

function toPlain(answer: string, bullets: string[] = []): string {
  const strip = (html: string) =>
    html
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  return [strip(answer), ...bullets.map(strip)].join(" ");
}

const raw: Array<Omit<FaqEntry, "plainAnswer">> = [
  // --- 1. INSTALACIÓN & APK ---
  {
    id: "play-protect-peligroso",
    category: "instalacion",
    question:
      '¿Por qué Android dice "Archivo potencialmente dañino" o aviso de Play Protect al descargar el APK?',
    answer:
      '<strong>Es totalmente normal y preventivo.</strong> Android muestra esa advertencia para <strong>cualquier aplicación</strong> que se instale directamente mediante archivo APK fuera de la Google Play Store oficial. Android no conoce a los desarrolladores independientes que no pagan la licencia anual de distribución. Pilas! es 100% segura, libre de virus, no tiene anuncios ni malware, y puedes verificar la huella criptográfica SHA-256 oficial en la sección de descargas. Solo debes presionar <em>"Descargar de todos modos"</em> y marcar <em>"Permitir desde esta fuente"</em> al instalar.',
  },
  {
    id: "requisitos-android",
    category: "instalacion",
    question: "¿En qué versiones de Android funciona y qué celular necesito?",
    answer:
      "Pilas! funciona en <strong>casi cualquier celular Android del 2019 en adelante</strong>. Solo necesitas <strong>Android 8.0 (Oreo) o superior</strong>. La versión recomendada (`ARM64-v8a`) pesa apenas 37 MB. Si tienes un teléfono de gama de entrada con más de 5 años, también ofrecemos la variante `ARMeabi-v7a` de 33 MB, o la versión `x86_64` para emuladores en PC.",
  },
  {
    id: "por-que-no-play-store",
    category: "instalacion",
    question:
      "¿Por qué la app todavía no está publicada en la Google Play Store oficial?",
    answer:
      "Porque la cuenta de desarrollador oficial de Google Play cuesta <strong>$25 dólares</strong> (pago único) y el proyecto es una iniciativa estudiantil financiada de nuestro propio bolsillo sin fondos universitarios. Estamos reuniendo ese monto mediante aportes voluntarios de la comunidad estudiantil. Mientras tanto, el APK se distribuye directamente desde esta web oficial de forma 100% gratuita.",
  },
  {
    id: "como-se-actualiza",
    category: "instalacion",
    question:
      "¿Cómo se actualiza la app cuando sale una nueva versión con mejoras?",
    answer:
      "La app incluye un verificador estático ultra-ligero que consulta <code>update.json</code>. Cuando hay una nueva actualización, recibirás un aviso dentro de la app con el botón para descargar el nuevo APK. <strong>No perderás tus notas, materias ni horario al actualizar</strong>: Android instala la nueva versión encima de la anterior conservando tu base de datos local intacta. También anunciamos cada actualización en nuestro Canal oficial de WhatsApp.",
  },
  {
    id: "permisos-solicitados",
    category: "instalacion",
    question:
      "¿Qué permisos solicita la aplicación en Android y para qué sirve cada uno?",
    answer:
      "Pilas! solo pide los permisos estrictamente necesarios para su funcionamiento:",
    bullets: [
      "<strong>Notificaciones:</strong> Para avisarte de tareas de Moodle próximas a vencer y recordatorios de tus clases.",
      "<strong>Alarmas exactas:</strong> Para que las alertas de tareas suenen en el minuto programado incluso con el teléfono en reposo.",
      "<strong>Cámara (Opcional):</strong> Únicamente para escanear el código QR de sincronización de Moodle o compartir archivos con compañeros.",
      "<strong>Almacenamiento (Scoped Storage):</strong> Para guardar diapositivas y PDFs de Moodle en tu carpeta de Descargas sin tocar tus fotos ni archivos personales.",
    ],
  },

  // --- 2. SEGURIDAD & CUENTAS ---
  {
    id: "es-oficial-espe",
    category: "seguridad",
    question:
      "¿Es una aplicación oficial de la Universidad de las Fuerzas Armadas ESPE?",
    answer:
      "<strong>No.</strong> Pilas! es un proyecto independiente desarrollado por y para estudiantes  . No es una app institucional ni cuenta con respaldo oficial de la universidad, pero está diseñada cumpliendo con los más altos estándares de privacidad.",
  },
  {
    id: "servidores-credenciales",
    category: "seguridad",
    question:
      "¿Se guardan mis credenciales o contraseñas en algún servidor externo o en la nube?",
    answer:
      "<strong>No, jamás.</strong> Pilas! opera bajo una estricta arquitectura <strong>Zero-Backend (Cero Servidores Intermedios)</strong>. No tenemos servidores que almacenen tus contraseñas, correos, notas ni cédula. La conexión viaja directamente cifrada desde tu celular hacia los portales institucionales de la ESPE. Tus credenciales de sesión se guardan cifradas por hardware en el enclave seguro de tu teléfono (Android Keystore con AES-256).",
  },
  {
    id: "donde-escribo-contrasena",
    category: "seguridad",
    question: "¿Dónde y cómo escribo mi contraseña institucional?",
    answer:
      "<strong>Para Moodle no escribes contraseña:</strong> se conecta en 1 segundo escaneando el código QR oficial de tu perfil en miCampus o con miESPE. Para Banner (horario y notas), la autenticación se realiza directamente en la pasarela oficial de Microsoft 365 / miESPE en el navegador web seguro del sistema. La app nunca intercepta ni almacena tu contraseña en texto plano.",
  },
  {
    id: "responsabilidad-cuenta",
    category: "seguridad",
    question: "¿Quién es responsable de las acciones realizadas con mi cuenta?",
    answer:
      "Tú eres el único responsable del uso de tu cuenta institucional. Pilas! es una herramienta cliente que interactúa con tus portales tal como lo harías desde Chrome o Firefox. Siempre debes verificar notas y trámites en los portales oficiales de miESPE y Moodle.",
  },
  {
    id: "cambios-sistemas-espe",
    category: "seguridad",
    question:
      "¿Qué sucede si la universidad cambia, restringe o actualiza sus plataformas?",
    answer:
      "Al ser un cliente independiente, cambios drásticos en la infraestructura de Banner o Moodle pueden requerir un parche de actualización. Sin embargo, tus datos académicos descargados permanecerán guardados en tu teléfono y disponibles sin internet.",
  },
  {
    id: "codigo-abierto-privado",
    category: "seguridad",
    question: "¿Pilas! es de código abierto (Open Source)?",
    answer:
      "<strong>No.</strong> Pilas! es de <strong>código privado y propietario</strong>, pero es <strong>100% gratuita para todos los estudiantes de la ESPE</strong>. El código se mantiene privado para proteger la integridad, estabilidad y seguridad de los endpoints y mecanismos de conexión con las plataformas institucionales.",
  },

  // --- 3. MOODLE & TAREAS ---
  {
    id: "conectar-moodle-qr",
    category: "moodle",
    question:
      "¿Cómo conecto mi Moodle sin escribir mi contraseña institucional?",
    answer:
      'Se utiliza el protocolo de vinculación móvil oficial de Moodle: ingresas a <code>micampus.espe.edu.ec</code> desde tu computadora, abres tu <strong>Perfil de Usuario</strong> y haces clic en <em>"Código QR para la app móvil"</em>. En Pilas!, pulsas <em>"Escanear QR de Moodle"</em>, apuntas la cámara y tu sesión quedará sincronizada al instante de forma segura.',
  },
  {
    id: "descargar-archivos-moodle",
    category: "moodle",
    question:
      "¿Puedo descargar diapositivas, PDFs y tareas de Moodle a mi teléfono?",
    answer:
      "<strong>Sí.</strong> En la pestaña de Moodle puedes explorar todas tus materias, tareas, guías de práctica y recursos. Con solo pulsar un archivo se descargará en el almacenamiento seguro de tu dispositivo para abrirlo cuando quieras, incluso en el aula o laboratorio sin señal.",
  },
  {
    id: "compartir-qr-archivos",
    category: "moodle",
    question:
      "¿Cómo funciona la opción de compartir archivos mediante Código QR?",
    answer:
      'En la versión v1.1 incorporamos un generador de QR instantáneo. Si descargaste una guía o documento de Moodle y tu compañero no tiene señal o megas, tocas <em>"Compartir por QR"</em> para que tu compañero lo escanee y lo abra en su teléfono de inmediato sin cables ni WhatsApp.',
  },
  {
    id: "notificaciones-segundo-plano",
    category: "moodle",
    question:
      "¿Cómo y cada cuánto consulta la app las tareas y mensajes en segundo plano?",
    answer:
      "La vigilancia de mensajes en Moodle se realiza de forma ligera cada 15 minutos; la comprobación de tareas pendientes y notas se ejecuta cada 6 horas. Todos los servicios en segundo plano aplican suspensión inteligente y ahorro de batería cuando no estás conectado a internet.",
  },

  // --- 4. HORARIO, AULAS & NOTAS ---
  {
    id: "sincronizar-horario-banner",
    category: "horarios",
    question: "¿Cómo sincronizo mi horario de clases y mis notas desde Banner?",
    answer:
      'Entras en Pilas!, seleccionas <em>"Sincronizar Banner"</em>, inicias sesión con tu usuario en el portal oficial de miESPE, y la app leerá automáticamente tus NRCs, asignaturas, días, horas, docentes y aulas, guardándolos en tu base de datos local para que los veas siempre sin internet.',
  },
  {
    id: "resolucion-aulas-bloques",
    category: "horarios",
    question:
      "¿Cómo descifro las aulas y bloques del campus (Sangolquí y Sedes)?",
    answer:
      'Pilas! integra un decodificador de aulas que traduce códigos crudos de Banner (como "BLOQUE G AULA 201" o "G-201") en información clara: <strong>Bloque, Piso y Aula exacta</strong>. En Ajustes puedes elegir el formato que prefieras: Conciso (G-201), Descriptivo (Bloque G, Piso 2) o Híbrido.',
  },
  {
    id: "calculadora-notas-ponderadas",
    category: "horarios",
    question:
      "¿Cómo funciona la calculadora de notas parciales y con cuánto paso el semestre?",
    answer:
      "La calculadora aplica la fórmula oficial del reglamento de evaluación de la ESPE: <strong>33.34% en el Primer Parcial, 33.33% en el Segundo Parcial y 33.33% en el Tercer Parcial</strong> (mínimo 14.00 acumulados sobre 20.00 para aprobar). Con solo ingresar tus notas del 1.° y 2.° parcial, la app calcula con precisión matemática cuántos puntos necesitas en el tercer parcial o si requieres examen de recuperación.",
  },
  {
    id: "materia-no-aparece",
    category: "horarios",
    question:
      "¿Qué hago si una materia recién matriculada no aparece en mi horario o Moodle?",
    answer:
      "Si acabas de matricularte o hiciste un cambio de NRC, los servidores de Banner y Moodle pueden demorar de 24 a 48 horas hábiles en reflejar el cambio. Para actualizar en Pilas!, desliza hacia abajo la pantalla de tu horario (gesto pull-to-refresh) para volver a consultar los servidores oficiales.",
  },

  // --- 5. MALLA & MODO OFFLINE ---
  {
    id: "funciona-sin-internet-offline",
    category: "malla",
    question: "¿La app funciona 100% sin conexión a internet?",
    answer:
      "<strong>Sí, absolutamente.</strong> Tu horario, tus materias de la malla, el carnet digital, tus tareas y tus notas se almacenan en una base de datos SQLite local dentro de tu celular. Puedes consultar tu horario en el aula subterránea, en el laboratorio sin señal o en modo avión. Solo necesitas internet cuando desees sincronizar datos nuevos.",
  },
  {
    id: "calculo-graduacion-malla",
    category: "malla",
    question:
      "¿Cómo calcula la Malla Interactiva el año estimado de graduación?",
    answer:
      "La app calcula la cantidad de créditos aprobados frente al total exigido por tu malla curricular, evalúa el promedio de materias aprobadas por período y con base en eso proyecta el semestre y año aproximado en que concluirás tu carrera (por ejemplo, 2028 o 2029).",
  },
  {
    id: "malla-recortada-pantalla",
    category: "malla",
    question:
      "¿Qué hago si la pantalla de la Malla se ve recortada en mi celular?",
    answer:
      "La vista de malla cuenta con dos herramientas ergonómicas en la barra superior:",
    bullets: [
      "<strong>Minimizar resumen:</strong> Presiona la flecha superior para encoger el panel de créditos y dejar libre toda la pantalla para las asignaturas.",
      "<strong>Modo Pantalla Completa:</strong> Toca el icono de pantalla completa para ocultar la cabecera y navegar libremente en horizontal y vertical por los 8 o 9 niveles.",
    ],
  },
  {
    id: "consumo-bateria-datos",
    category: "malla",
    question: "¿La aplicación consume mucha batería o datos móviles (megas)?",
    answer:
      "<strong>Cero consumo excesivo.</strong> Al funcionar de manera local y sin servidores intermedios pesados, la app no descarga publicidad ni scripts de seguimiento. Consume menos del 1% de batería diario y prácticamente cero datos móviles fuera de las sincronizaciones puntuales.",
  },

  // --- 6. GENERAL, SEDES & IPHONE ---
  {
    id: "sedes-latacunga-santo-domingo",
    category: "general",
    question:
      "¿Pilas! funciona para estudiantes de las sedes de Latacunga y Santo Domingo?",
    answer:
      "<strong>¡Sí, para todas las sedes y modalidades!</strong> Banner y Moodle (miCampus) comparten la misma infraestructura tecnológica para la Matriz Sangolquí, Sede Latacunga, Sede Santo Domingo y las carreras en modalidad En Línea y Distancia. Todos los estudiantes pueden usar Pilas! por igual.",
  },
  {
    id: "version-iphone-ios",
    category: "general",
    question: "¿Hay o habrá versión de Pilas! para iPhone (iOS)?",
    answer:
      "Por ahora está disponible únicamente para Android. La app fue programada en Flutter (por lo que su código es compatible con iOS), pero publicar en la App Store requiere una computadora Mac y pagar la suscripción de $99/año a Apple. Si eres estudiante, programas en iOS o tienes una Mac y deseas ayudar a compilar, revisa la sección <em>Colaboradores</em> o escríbenos a nuestro correo de contacto.",
  },
  {
    id: "gratuita-siempre",
    category: "general",
    question: "¿La aplicación seguirá siendo 100% gratuita en el futuro?",
    answer:
      "<strong>Sí, siempre.</strong> Pilas! nació como un proyecto solidario de un estudiante para sus compañeros.",
  },
  {
    id: "como-reportar-error",
    category: "general",
    question:
      "¿Cómo reporto un error, propongo una nueva función o contacto al desarrollador?",
    answer:
      "Puedes usar el formulario directo de comentarios en esta web, unirte al <strong>Canal oficial de WhatsApp de Pilas!</strong>, o escribir directamente por correo electrónico a <code>teo.hurtado.16@gmail.com</code>. Todos los mensajes se leen y se toman en cuenta para las siguientes versiones.",
  },
];

export const FAQ_ENTRIES: FaqEntry[] = raw.map((entry) => ({
  ...entry,
  plainAnswer: toPlain(entry.answer, entry.bullets),
}));
