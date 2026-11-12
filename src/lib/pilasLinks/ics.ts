// ============================================================================
// PILAS! LINKS — Generador RFC 5545 (.ics) 100% Cliente / JS
// Zona horaria oficial Ecuador: America/Guayaquil (UTC-05:00, sin DST)
// Días Dart/PB2: 1 = Lunes .. 7 = Domingo
// ============================================================================

import {
  modalityLabel,
  type AmigoClassBlock,
  type AmigoPayload,
  type JuntaPayload,
  type TareaPayload,
} from '../pilasCodec';
import { ANONYMIZED_SUBJECT_RE } from './schedule-compare';

const EC_OFFSET_MS = -5 * 60 * 60 * 1000;

const BYDAY_CODES: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string> = {
  1: 'MO',
  2: 'TU',
  3: 'WE',
  4: 'TH',
  5: 'FR',
  6: 'SA',
  7: 'SU',
};

const VTIMEZONE_GUAYAQUIL = [
  'BEGIN:VTIMEZONE',
  'TZID:America/Guayaquil',
  'X-LIC-LOCATION:America/Guayaquil',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:-0500',
  'TZOFFSETTO:-0500',
  'TZNAME:ECT',
  'DTSTART:19700101T000000',
  'END:STANDARD',
  'END:VTIMEZONE',
];

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function foldLine(line: string): string {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  parts.push(line.slice(0, 74));
  let pos = 74;
  while (pos < line.length) {
    parts.push(` ${line.slice(pos, pos + 73)}`);
    pos += 73;
  }
  return parts.join('\r\n');
}

function pad2(n: number): string {
  return String(Math.floor(Math.abs(n))).padStart(2, '0');
}

function formatUtcStamp(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}` +
    `T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`
  );
}

/** Convierte UTC epoch ms a YYYYMMDDTHHMMSS en America/Guayaquil (-05:00 fijo) */
export function formatGuayaquilLocal(epochMs: number): string {
  const ec = new Date(epochMs + EC_OFFSET_MS);
  return (
    `${ec.getUTCFullYear()}${pad2(ec.getUTCMonth() + 1)}${pad2(ec.getUTCDate())}` +
    `T${pad2(ec.getUTCHours())}${pad2(ec.getUTCMinutes())}${pad2(ec.getUTCSeconds())}`
  );
}

/** Obtiene el día YYYYMMDD correspondiente al próximo (o actual) día 1..7 (1=Lun..7=Dom) */
function resolveDayDateYYYYMMDD(
  targetDay1to7: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  referenceDate: Date,
): { y: number; m: number; d: number } {
  const ecNow = new Date(referenceDate.getTime() + EC_OFFSET_MS);
  const jsDay = ecNow.getUTCDay(); // 0=Dom .. 6=Sab
  const currentMonOne = jsDay === 0 ? 7 : jsDay; // 1=Lun .. 7=Dom
  const deltaDays = (targetDay1to7 - currentMonOne + 7) % 7;
  const targetEc = new Date(
    Date.UTC(
      ecNow.getUTCFullYear(),
      ecNow.getUTCMonth(),
      ecNow.getUTCDate() + deltaDays,
    ),
  );
  return {
    y: targetEc.getUTCFullYear(),
    m: targetEc.getUTCMonth() + 1,
    d: targetEc.getUTCDate(),
  };
}

function formatDateTimeParts(
  y: number,
  m: number,
  d: number,
  minutesFromMidnight: number,
): string {
  const normalizedDays = Math.floor(minutesFromMidnight / (24 * 60));
  const remMin = ((minutesFromMidnight % (24 * 60)) + 24 * 60) % (24 * 60);
  const dt = new Date(Date.UTC(y, m - 1, d + normalizedDays));
  const hh = Math.floor(remMin / 60);
  const mm = remMin % 60;
  return `${dt.getUTCFullYear()}${pad2(dt.getUTCMonth() + 1)}${pad2(dt.getUTCDate())}T${pad2(hh)}${pad2(mm)}00`;
}

function finalizeCalendar(lines: string[]): string {
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}

function appendScheduleEvent(
  lines: string[],
  block: AmigoClassBlock,
  idx: number,
  dtStamp: string,
  referenceDate: Date,
  prefixLabel: string,
  isPrivateMode: boolean,
  recurrenceWeeks = 16,
) {
  const { y, m, d } = resolveDayDateYYYYMMDD(block.d, referenceDate);
  const dtStart = formatDateTimeParts(y, m, d, block.i);
  const endMinutes = block.f > block.i ? block.f : block.i + 60;
  const dtEnd = formatDateTimeParts(y, m, d, endMinutes);
  const byDay = BYDAY_CODES[block.d] ?? 'MO';

  const cleanSubj = block.s.trim();
  const isAnon = isPrivateMode || !cleanSubj || ANONYMIZED_SUBJECT_RE.test(cleanSubj);
  const summary = isAnon
    ? `${prefixLabel}Bloque ocupado`
    : `${prefixLabel}${cleanSubj}`;

  const descParts: string[] = [`Modalidad: ${modalityLabel(block.m)}`];
  if (!isPrivateMode) {
    if (block.t) descParts.push(`Docente: ${block.t}`);
    if (block.n) descParts.push(`NRC: ${block.n}`);
  }
  descParts.push('Exportado desde Pilas! (Atelier)');

  lines.push('BEGIN:VEVENT');
  lines.push(`UID:pilas-blk-${idx}-${dtStart}@pilas-ec.vercel.app`);
  lines.push(`DTSTAMP:${dtStamp}`);
  lines.push(`DTSTART;TZID=America/Guayaquil:${dtStart}`);
  lines.push(`DTEND;TZID=America/Guayaquil:${dtEnd}`);
  lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay};COUNT=${recurrenceWeeks}`);
  lines.push(`SUMMARY:${escapeIcsText(summary)}`);
  if (!isPrivateMode && block.r) {
    lines.push(`LOCATION:${escapeIcsText(block.r)}`);
  }
  lines.push(`DESCRIPTION:${escapeIcsText(descParts.join('\n'))}`);
  lines.push('END:VEVENT');
}

export function buildScheduleIcs(
  payload: AmigoPayload,
  referenceDate = new Date(),
): string {
  const dtStamp = formatUtcStamp(referenceDate);
  const ownerPrefix = payload.friendName ? `[${payload.friendName}] ` : '';
  const calName = payload.friendName
    ? `Horario de ${payload.friendName} (Pilas!)`
    : 'Horario Compartido (Pilas!)';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pilas! by Atelier//EC//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calName)}`,
    'X-WR-TIMEZONE:America/Guayaquil',
    ...VTIMEZONE_GUAYAQUIL,
  ];

  payload.classes.forEach((blk, idx) => {
    appendScheduleEvent(
      lines,
      blk,
      idx,
      dtStamp,
      referenceDate,
      ownerPrefix,
      payload.isPrivateMode,
      16,
    );
  });

  lines.push('END:VCALENDAR');
  return finalizeCalendar(lines);
}

export function buildTaskIcs(
  payload: TareaPayload,
  referenceDate = new Date(),
): string {
  const dtStamp = formatUtcStamp(referenceDate);
  const parsedDue = Date.parse(payload.dueDate);
  const dueEpochMs = Number.isNaN(parsedDue) ? referenceDate.getTime() : parsedDue;
  const startMs = Math.max(0, dueEpochMs - 30 * 60 * 1000);
  const dtStart = formatGuayaquilLocal(startMs);
  const dtEnd = formatGuayaquilLocal(dueEpochMs);

  const descParts: string[] = [];
  if (payload.subject) descParts.push(`Materia: ${payload.subject}`);
  if (payload.description) descParts.push(payload.description);
  if (payload.author) descParts.push(`Compartido por: ${payload.author}`);
  if (payload.sourceUrl) descParts.push(`Enlace: ${payload.sourceUrl}`);
  descParts.push('Recordatorio generado con Pilas! (pilas-ec.vercel.app)');

  const summaryText = payload.subject
    ? `[Entrega] ${payload.title} · ${payload.subject}`
    : `[Entrega] ${payload.title}`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pilas! by Atelier//EC//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-TIMEZONE:America/Guayaquil',
    ...VTIMEZONE_GUAYAQUIL,
    'BEGIN:VEVENT',
    `UID:pilas-task-${dueEpochMs}@pilas-ec.vercel.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=America/Guayaquil:${dtStart}`,
    `DTEND;TZID=America/Guayaquil:${dtEnd}`,
    `SUMMARY:${escapeIcsText(summaryText)}`,
    `DESCRIPTION:${escapeIcsText(descParts.join('\n'))}`,
    ...(payload.sourceUrl ? [`URL:${payload.sourceUrl}`] : []),
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`Vence en 2 horas: ${payload.title}`)}`,
    'TRIGGER:-PT2H',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`Mañana vence: ${payload.title}`)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return finalizeCalendar(lines);
}

export function buildJuntaIcs(
  payload: JuntaPayload,
  referenceDate = new Date(),
): string {
  const dtStamp = formatUtcStamp(referenceDate);
  const parsedStart = Date.parse(payload.startAt);
  const startMs = Number.isNaN(parsedStart) ? referenceDate.getTime() : parsedStart;
  const parsedEnd = Date.parse(payload.endAt);
  const endMs = Number.isNaN(parsedEnd)
    ? startMs + Math.max(5, payload.durationMinutes) * 60_000
    : parsedEnd;

  const dtStart = formatGuayaquilLocal(startMs);
  const dtEnd = formatGuayaquilLocal(endMs);

  const descParts: string[] = [
    `Modalidad: ${payload.isVirtual ? 'Virtual' : 'Presencial'}`,
  ];
  if (payload.organizer) descParts.push(`Organiza: ${payload.organizer}`);
  if (payload.campus) descParts.push(`Campus: ${payload.campus}`);
  if (payload.participants.length > 0) {
    descParts.push(`Participantes: ${payload.participants.join(', ')}`);
  }
  if (payload.meetingUrl) descParts.push(`Reunión virtual: ${payload.meetingUrl}`);
  if (payload.notes) descParts.push(payload.notes);
  descParts.push('Invitación creada en Pilas! (pilas-ec.vercel.app)');

  const locValue = payload.location || payload.meetingUrl || payload.campus;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pilas! by Atelier//EC//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-TIMEZONE:America/Guayaquil',
    ...VTIMEZONE_GUAYAQUIL,
    'BEGIN:VEVENT',
    `UID:pilas-junta-${dtStart}-${payload.durationMinutes}@pilas-ec.vercel.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=America/Guayaquil:${dtStart}`,
    `DTEND;TZID=America/Guayaquil:${dtEnd}`,
    `SUMMARY:${escapeIcsText(payload.title)}`,
    ...(locValue ? [`LOCATION:${escapeIcsText(locValue)}`] : []),
    ...(payload.meetingUrl ? [`URL:${payload.meetingUrl}`] : []),
    `DESCRIPTION:${escapeIcsText(descParts.join('\n'))}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`Empieza pronto: ${payload.title}`)}`,
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return finalizeCalendar(lines);
}
