// ============================================================================
// AVISOS DE COLABORACIÓN
// ============================================================================
// Este archivo alimenta la sección "Buscamos colaboradores" de la home.
//
// Sirve como TABLÓN DE AVISOS: puedes cambiar los textos cuando quieras. Si en
// algún momento no necesitas ayuda, pon `isOpen: false` y la sección pasa a
// mostrar un mensaje de "por ahora no buscamos a nadie" en lugar de desaparecer
// (así la gente que ya vio el aviso entiende qué pasó).
//
// Para apuntarse, el interesado escribe al correo indicado abajo.
// ============================================================================

export interface CollaboratorRole {
  id: string;
  /** Título corto del puesto */
  title: string;
  /** Una frase que resume qué haría */
  summary: string;
  /** Qué necesitas que tenga o sepa */
  needs: string[];
  /** Icono: 'apple' | 'design' | 'test' | 'code' */
  icon: 'apple' | 'design' | 'test' | 'code';
  /** Etiqueta de urgencia */
  priority: 'alta' | 'media' | 'abierta';
}

export const COLLABORATION_CONFIG = {
  /** Si es false, se muestra el aviso de que no se busca a nadie ahora mismo */
  isOpen: true,

  /** Correo de contacto para colaboraciones */
  contactEmail: 'teo.hurtado.16@gmail.com',

  /** Tiempo de respuesta prometido */
  responseTime: 'Respondo todos los correos en 24–48 horas',

  /** Texto que aparece si `isOpen` es false */
  closedMessage:
    'Por ahora no estamos buscando colaboradores, pero si tienes una idea o quieres aportar algo, escríbenos igual: siempre leemos los correos.',

  /** Mensaje general de la sección */
  intro:
    'Pilas! hoy solo existe para Android y lo mantiene una sola persona. Para dar el salto a iPhone necesitamos manos: si sabes programar para iOS o tienes un Mac, ¡ponte pilas y sé parte del proyecto!',

  /** Puestos abiertos */
  roles: <CollaboratorRole[]>[
    {
      id: 'ios',
      title: 'Desarrollador para iPhone (iOS)',
      summary:
        'Portar la app a iPhone y publicarla en la App Store. Es el objetivo principal del proyecto ahora mismo.',
      needs: [
        'Saber Swift o Flutter con experiencia en iOS',
        'Conocer Xcode y el proceso de publicación en la App Store',
        'Disponer de un Mac para compilar y firmar la app',
      ],
      icon: 'apple',
      priority: 'alta',
    },
    {
      id: 'mac',
      title: 'Alguien con Mac para compilar',
      summary:
        'No hace falta que programes: solo con prestar acceso a un Mac se puede generar y firmar la versión de iPhone.',
      needs: [
        'Un Mac con Xcode instalado',
        'Disposición a ejecutar los comandos de compilación',
      ],
      icon: 'code',
      priority: 'alta',
    },
    {
      id: 'design',
      title: 'Diseño y experiencia de usuario',
      summary:
        'Revisar la interfaz de la app y proponer mejoras para que se entienda sin explicaciones.',
      needs: [
        'Manejo de Figma o similar',
        'Criterio para organizar información densa (mallas, horarios, notas)',
      ],
      icon: 'design',
      priority: 'media',
    },
    {
      id: 'testing',
      title: 'Probadores en celulares distintos',
      summary:
        'Probar versiones nuevas en tu propio teléfono y reportar qué falla, sobre todo en equipos antiguos.',
      needs: [
        'Un celular Android (cualquier versión)',
        'Ganas de reportar errores con capturas',
      ],
      icon: 'test',
      priority: 'abierta',
    },
  ] as CollaboratorRole[],
} as const;

/** Correo de contacto, exportado aparte por comodidad */
export const CONTACT_EMAIL = COLLABORATION_CONFIG.contactEmail;
