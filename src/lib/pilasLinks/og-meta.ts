// ============================================================================
// PILAS! LINKS — Metadatos Open Graph Dinámicos (Solo Datos Públicos)
// REGLA DE PRIVACIDAD: Si un horario viene en isPrivateMode=true o sin aulas/
// docentes/materias, jamás inferir ni fabricar información oculta. NUNCA loggear ?d=.
// ============================================================================

import {
  formatFileSize,
  safeText,
  stripNonLatinForOg,
  type AnyPilasPayload,
  type DecodeResult,
  type PayloadKind,
} from '../pilasCodec';
import { isSubjectHidden } from './schedule-compare';

export interface PublicOgMeta {
  kind: PayloadKind;
  badge: string;
  accentHex: string;
  title: string;
  description: string;
  stats: string[];
  footerNote: string;
  ogImageUrl: string;
}

const ROUTE_DEFAULTS: Record<
  PayloadKind,
  { badge: string; accentHex: string; title: string; description: string; stats: string[] }
> = {
  amigo: {
    badge: 'HORARIO COMPARTIDO',
    accentHex: '#FF3FA4',
    title: 'Horario universitario compartido en Pilas!',
    description:
      'Ábrelo para comparar huecos libres en común, ver materias coincidentes o exportarlo a tu calendario (.ics).',
    stats: ['Comparador en navegador', 'QR + .ics', 'Zero-Backend'],
  },
  tarea: {
    badge: 'FICHA DE TAREA',
    accentHex: '#FFDB60',
    title: 'Recordatorio de entrega compartida en Pilas!',
    description:
      'Consulta fecha límite, cuenta regresiva en vivo y agrega alertas a tu calendario en 1 toque.',
    stats: ['Cuenta regresiva', 'Exportar .ics', 'Alertas Moodle'],
  },
  tareas: {
    badge: 'CHECKLIST GRUPAL',
    accentHex: '#00FF87',
    title: 'Checklist compartida de proyecto en Pilas!',
    description:
      'Marca avances del equipo directamente en tu dispositivo sin logins ni servidores.',
    stats: ['Progreso local', 'Importable a Pilas!', 'Sin registro'],
  },
  materiales: {
    badge: 'LOTE DE MATERIALES',
    accentHex: '#38BDF8',
    title: 'Lista de materiales de curso en Pilas!',
    description:
      'Revisa los archivos compartidos del parcial. Cero tokens de sesión Moodle incluidos.',
    stats: ['Sin tokens Moodle', 'Índice offline', 'Pilas! App'],
  },
  curso: {
    badge: 'KIT DEL PARALELO',
    accentHex: '#FF3FA4',
    title: 'Kit de bienvenida de paralelo en Pilas!',
    description:
      'Ficha del paralelo y enlaces útiles compartidos por compañeros (WhatsApp, Drive, aula virtual).',
    stats: ['Kit del curso', 'Enlaces curados', 'NRC del paralelo'],
  },
  junta: {
    badge: 'INVITACIÓN A HUECO',
    accentHex: '#00FF87',
    title: 'Invitación a reunión de estudio en Pilas!',
    description:
      'Agrega el encuentro directo a Google Calendar o Apple Calendar (.ics) con un clic.',
    stats: ['Calendario .ics', 'Virtual / Presencial', 'Zero-Backend'],
  },
};

function buildEcuadorDateShort(isoOrEpoch: string | number): string {
  const ms = typeof isoOrEpoch === 'number' ? isoOrEpoch : Date.parse(isoOrEpoch);
  if (Number.isNaN(ms)) return 'Fecha por confirmar';
  const ec = new Date(ms - 5 * 60 * 60 * 1000);
  const d = String(ec.getUTCDate()).padStart(2, '0');
  const m = String(ec.getUTCMonth() + 1).padStart(2, '0');
  const hh = String(ec.getUTCHours()).padStart(2, '0');
  const mm = String(ec.getUTCMinutes()).padStart(2, '0');
  return `${d}/${m} · ${hh}:${mm}`;
}

function buildEcuadorTimeHHMM(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '--:--';
  const ec = new Date(ms - 5 * 60 * 60 * 1000);
  return `${String(ec.getUTCHours()).padStart(2, '0')}:${String(ec.getUTCMinutes()).padStart(2, '0')}`;
}

export function buildPublicOgMeta(
  kind: PayloadKind,
  decoded: DecodeResult<AnyPilasPayload> | null,
  siteOrigin: string,
  rawD?: string | null,
): PublicOgMeta {
  const base = ROUTE_DEFAULTS[kind];
  const ogUrl = new URL(`/api/og/${kind}`, siteOrigin);
  if (rawD && decoded?.ok) {
    ogUrl.searchParams.set('d', rawD);
  }

  if (!decoded || !decoded.ok) {
    return {
      kind,
      badge: base.badge,
      accentHex: base.accentHex,
      title: base.title,
      description: base.description,
      stats: base.stats,
      footerNote: 'pilas-ec.vercel.app · Atelier',
      ogImageUrl: ogUrl.toString(),
    };
  }

  const p = decoded.payload;

  if (p.kind === 'amigo') {
    const owner = p.friendName ? `Horario de ${p.friendName}` : 'Horario compartido';
    const title = safeText(p.university ? `${owner} (${p.university})` : owner, 88);
    const totalBlocks = p.classes.length;
    const subjectsHidden = isSubjectHidden(p);
    const distinctSubjects = subjectsHidden
      ? 0
      : new Set(p.classes.map((c) => c.s.trim()).filter(Boolean)).size;
    const hasRooms = p.classes.some((c) => Boolean(c.r));

    // PRIVACIDAD: nunca fabricar materias/aulas si faltan o si isPrivateMode=true
    const summaryBits: string[] = [];
    if (totalBlocks > 0) summaryBits.push(`${totalBlocks} bloques semanales`);
    if (distinctSubjects > 0) summaryBits.push(`${distinctSubjects} materias`);
    if (p.isPrivateMode || !hasRooms) {
      summaryBits.push('Modo Privado / sin aulas expuestas');
    }

    const description = safeText(
      summaryBits.length > 0
        ? `${summaryBits.join(' · ')}. Compara huecos libres en común y descárgalo en .ics.`
        : 'Compara huecos libres en común directo en tu navegador.',
      160,
    );

    const stats = [
      totalBlocks > 0 ? `${totalBlocks} bloques` : 'Horario semanal',
      p.isPrivateMode || !hasRooms ? 'Sin aulas privadas' : 'Con aulas',
      p.university || 'Universidad EC',
    ];

    return {
      kind,
      badge: p.isPrivateMode ? 'HORARIO · MODO PRIVADO' : 'HORARIO COMPARTIDO',
      accentHex: '#FF3FA4',
      title,
      description,
      stats,
      footerNote: 'Compara horas huecas en navegador · Pilas! by Atelier',
      ogImageUrl: ogUrl.toString(),
    };
  }

  if (p.kind === 'tarea') {
    const dueLabel = buildEcuadorDateShort(p.dueDate);
    const title = safeText(
      p.subject ? `${p.title} · ${p.subject}` : p.title,
      96,
    );
    const description = safeText(
      `Fecha límite: ${dueLabel} (ECT). Consulta la cuenta regresiva en vivo o añádelo a tu calendario (.ics).`,
      160,
    );
    return {
      kind,
      badge: 'ENTREGA MOODLE',
      accentHex: '#FFDB60',
      title,
      description,
      stats: [p.subject || 'Tarea', `Límite ${dueLabel}`, 'Recordatorio .ics'],
      footerNote: 'Alertas académicas · Pilas! by Atelier',
      ogImageUrl: ogUrl.toString(),
    };
  }

  if (p.kind === 'tareas') {
    const priorityCount = p.items.filter((i) => i.isPriority).length;
    const title = safeText(
      p.subject ? `${p.title} · ${p.subject}` : p.title,
      96,
    );
    const description = safeText(
      `Checklist compartida con ${p.items.length} ítems${priorityCount > 0 ? ` (${priorityCount} prioritarios)` : ''}. Guarda tu avance local sin servidores.`,
      160,
    );
    return {
      kind,
      badge: 'CHECKLIST GRUPAL',
      accentHex: '#00FF87',
      title,
      description,
      stats: [
        `${p.items.length} ítems`,
        p.subject || 'Proyecto grupal',
        'Progreso local',
      ],
      footerNote: 'Importa esta lista en Pilas! · Atelier',
      ogImageUrl: ogUrl.toString(),
    };
  }

  if (p.kind === 'materiales') {
    const totalBytes = p.files.reduce((sum, f) => sum + (f.filesize ?? 0), 0);
    const sizeText = totalBytes > 0 ? formatFileSize(totalBytes) : 'Lote de estudio';
    const scope = p.sectionName || 'Materia completa';
    const title = safeText(`${p.courseName} · ${scope}`, 96);
    const description = safeText(
      `${p.files.length} archivos listados (${sizeText}). Índice seguro sin tokens de sesión Moodle.`,
      160,
    );
    return {
      kind,
      badge: 'LOTE DE MATERIALES',
      accentHex: '#38BDF8',
      title,
      description,
      stats: [`${p.files.length} archivos`, sizeText, 'Sin tokens Moodle'],
      footerNote: 'Descarga offline en lote con Pilas! · Atelier',
      ogImageUrl: ogUrl.toString(),
    };
  }

  if (p.kind === 'curso') {
    const title = safeText(
      p.nrc ? `${p.courseName} (NRC ${p.nrc})` : p.courseName,
      96,
    );
    const linkCount = [
      p.whatsappUrl,
      p.driveUrl,
      p.meetingUrl,
      p.customUrl,
    ].filter(Boolean).length;
    const descBits: string[] = [];
    if (p.campus) descBits.push(p.campus);
    if (p.scheduleSummary) descBits.push(p.scheduleSummary);
    if (linkCount > 0) descBits.push(`${linkCount} enlaces útiles del paralelo`);
    const description = safeText(
      descBits.length > 0
        ? `Kit del paralelo: ${descBits.join(' · ')}.`
        : 'Kit de bienvenida con datos del paralelo y accesos rápidos compartidos.',
      160,
    );
    return {
      kind,
      badge: p.nrc ? `KIT PARALELO · NRC ${p.nrc}` : 'KIT DEL PARALELO',
      accentHex: '#FF3FA4',
      title,
      description,
      stats: [
        p.campus || p.university || 'Paralelo EC',
        `${linkCount} enlace(s)`,
        p.teacher || 'Kit de curso',
      ],
      footerNote: 'Importa el paralelo a Pilas! · Atelier',
      ogImageUrl: ogUrl.toString(),
    };
  }

  // junta
  const dateShort = buildEcuadorDateShort(p.startAt);
  const endTime = buildEcuadorTimeHHMM(p.endAt);
  const modalityTag = p.isVirtual ? 'Virtual' : 'Presencial';
  const where = p.location || p.campus || (p.isVirtual ? 'Sala virtual' : 'Campus por confirmar');
  const title = safeText(p.title, 96);
  const description = safeText(
    `${dateShort}–${endTime} (ECT) · ${modalityTag} · ${where}. Agrégalo directo a Google o Apple Calendar (.ics).`,
    160,
  );
  return {
    kind,
    badge: `JUNTA · ${modalityTag.toUpperCase()}`,
    accentHex: '#00FF87',
    title,
    description,
    stats: [`${dateShort}-${endTime}`, modalityTag, where],
    footerNote: 'Agrega directo a tu calendario .ics · Pilas!',
    ogImageUrl: ogUrl.toString(),
  };
}

export function sanitizeOgRenderFields(meta: PublicOgMeta): PublicOgMeta {
  return {
    ...meta,
    badge: safeText(stripNonLatinForOg(meta.badge), 36) || 'PILAS! ENLACE UNIVERSAL',
    title: safeText(stripNonLatinForOg(meta.title), 84) || 'Pilas! Enlace Universal',
    description:
      safeText(stripNonLatinForOg(meta.description), 148) ||
      'Herramienta estudiantil Zero-Backend desarrollada por Atelier.',
    stats: meta.stats
      .map((s) => safeText(stripNonLatinForOg(s), 26))
      .filter(Boolean)
      .slice(0, 3),
    footerNote:
      safeText(stripNonLatinForOg(meta.footerNote), 52) || 'pilas-ec.vercel.app',
  };
}
