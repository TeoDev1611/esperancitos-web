// ============================================================================
// PILAS! LINKS — Comparador de Horarios 100% en Navegador (Huecos & Materias)
// Usa convención exacta Dart/PB2: d = 1 (Lunes) .. 7 (Domingo), i/f en minutos.
// ============================================================================

import {
  formatMinutesHHMM,
  type AmigoClassBlock,
  type AmigoPayload,
} from '../pilasCodec';

export const DAY_NAMES_ES: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

export const DAY_SHORT_ES: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
  7: 'Dom',
};

export interface TimeInterval {
  startMin: number;
  endMin: number;
}

export interface FreeGapSlot {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  dayName: string;
  startMin: number;
  endMin: number;
  durationMin: number;
  rangeLabel: string;
}

export interface SubjectOverlap {
  subjectName: string;
  mineName: string;
  exactSameSlotCount: number;
}

export interface ScheduleComparisonResult {
  commonGaps: FreeGapSlot[];
  totalCommonGapMinutes: number;
  matchingSubjects: SubjectOverlap[];
  subjectsHiddenByPrivacy: boolean;
  windowStartMin: number;
  windowEndMin: number;
  includedDays: Array<1 | 2 | 3 | 4 | 5 | 6 | 7>;
}

export interface CompareOptions {
  /** Hora inicio ventana académica en minutos (default 07:00 = 420) */
  windowStartMin?: number;
  /** Hora fin ventana académica en minutos (default 20:00 = 1200) */
  windowEndMin?: number;
  /** Mínimo de minutos contiguos libres (default 30 min) */
  minGapMinutes?: number;
}

export const ANONYMIZED_SUBJECT_RE =
  /^(bloque(\s+(ocupado|privado|reservado))?(\s+\d+)?|materia(\s+\d+)?|clase(\s+(ocupada|privada))?|ocupado|reservado|privado)$/i;

export function isSubjectHidden(payload: AmigoPayload): boolean {
  if (payload.isPrivateMode) return true;
  if (payload.classes.length === 0) return false;
  return payload.classes.every((c) => {
    const clean = c.s.trim();
    return !clean || ANONYMIZED_SUBJECT_RE.test(clean);
  });
}

function normalizeSubjectKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mergeBusyIntervals(
  classes: AmigoClassBlock[],
  day: number,
  windowStartMin: number,
  windowEndMin: number,
): TimeInterval[] {
  const raw = classes
    .filter((b) => b.d === day && b.f > b.i)
    .map((b) => ({
      startMin: Math.max(windowStartMin, b.i),
      endMin: Math.min(windowEndMin, b.f),
    }))
    .filter((iv) => iv.endMin > iv.startMin)
    .sort((a, b) => a.startMin - b.startMin);

  if (raw.length === 0) return [];
  const merged: TimeInterval[] = [{ ...raw[0] }];
  for (let i = 1; i < raw.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = raw[i];
    if (curr.startMin <= prev.endMin) {
      prev.endMin = Math.max(prev.endMin, curr.endMin);
    } else {
      merged.push({ ...curr });
    }
  }
  return merged;
}

export function invertBusyToFree(
  busy: TimeInterval[],
  windowStartMin: number,
  windowEndMin: number,
): TimeInterval[] {
  const free: TimeInterval[] = [];
  let cursor = windowStartMin;
  for (const iv of busy) {
    if (iv.startMin > cursor) {
      free.push({ startMin: cursor, endMin: iv.startMin });
    }
    cursor = Math.max(cursor, iv.endMin);
  }
  if (cursor < windowEndMin) {
    free.push({ startMin: cursor, endMin: windowEndMin });
  }
  return free;
}

export function intersectIntervals(
  aList: TimeInterval[],
  bList: TimeInterval[],
): TimeInterval[] {
  const out: TimeInterval[] = [];
  let i = 0;
  let j = 0;
  while (i < aList.length && j < bList.length) {
    const a = aList[i];
    const b = bList[j];
    const startMin = Math.max(a.startMin, b.startMin);
    const endMin = Math.min(a.endMin, b.endMin);
    if (endMin > startMin) {
      out.push({ startMin, endMin });
    }
    if (a.endMin < b.endMin) {
      i++;
    } else {
      j++;
    }
  }
  return out;
}

export function findMatchingSubjects(
  friend: AmigoPayload,
  mine: AmigoPayload,
): SubjectOverlap[] {
  if (isSubjectHidden(friend) || isSubjectHidden(mine)) {
    return [];
  }

  const friendSubjects = new Map<
    string,
    { display: string; slots: AmigoClassBlock[] }
  >();
  for (const b of friend.classes) {
    const clean = b.s.trim();
    if (!clean || ANONYMIZED_SUBJECT_RE.test(clean)) continue;
    const key = normalizeSubjectKey(clean);
    if (!key) continue;
    const entry = friendSubjects.get(key) ?? { display: clean, slots: [] };
    entry.slots.push(b);
    friendSubjects.set(key, entry);
  }

  const mineSubjects = new Map<
    string,
    { display: string; slots: AmigoClassBlock[] }
  >();
  for (const b of mine.classes) {
    const clean = b.s.trim();
    if (!clean || ANONYMIZED_SUBJECT_RE.test(clean)) continue;
    const key = normalizeSubjectKey(clean);
    if (!key) continue;
    const entry = mineSubjects.get(key) ?? { display: clean, slots: [] };
    entry.slots.push(b);
    mineSubjects.set(key, entry);
  }

  const overlaps: SubjectOverlap[] = [];
  for (const [key, fEntry] of friendSubjects.entries()) {
    const mEntry = mineSubjects.get(key);
    if (!mEntry) continue;
    let exactSameSlotCount = 0;
    for (const fb of fEntry.slots) {
      const matchesTime = mEntry.slots.some((mb) => {
        if (mb.d !== fb.d) return false;
        return Math.min(fb.f, mb.f) - Math.max(fb.i, mb.i) >= 15;
      });
      if (matchesTime) exactSameSlotCount++;
    }
    overlaps.push({
      subjectName: fEntry.display,
      mineName: mEntry.display,
      exactSameSlotCount,
    });
  }

  return overlaps.sort((a, b) => a.subjectName.localeCompare(b.subjectName, 'es'));
}

export function compareSchedules(
  friend: AmigoPayload,
  mine: AmigoPayload,
  options: CompareOptions = {},
): ScheduleComparisonResult {
  const windowStartMin = options.windowStartMin ?? 7 * 60;
  const windowEndMin = options.windowEndMin ?? 20 * 60;
  const minGapMinutes = options.minGapMinutes ?? 30;

  const hasSat = [...friend.classes, ...mine.classes].some((b) => b.d === 6);
  const hasSun = [...friend.classes, ...mine.classes].some((b) => b.d === 7);
  const includedDays: Array<1 | 2 | 3 | 4 | 5 | 6 | 7> = [1, 2, 3, 4, 5];
  if (hasSat) includedDays.push(6);
  if (hasSun) includedDays.push(7);

  const commonGaps: FreeGapSlot[] = [];
  let totalCommonGapMinutes = 0;

  for (const day of includedDays) {
    const allBusy = mergeBusyIntervals(
      [...friend.classes, ...mine.classes],
      day,
      windowStartMin,
      windowEndMin,
    );
    const freeSlots = invertBusyToFree(allBusy, windowStartMin, windowEndMin);

    for (const slot of freeSlots) {
      const dur = slot.endMin - slot.startMin;
      if (dur < minGapMinutes) continue;
      totalCommonGapMinutes += dur;
      commonGaps.push({
        day,
        dayName: DAY_NAMES_ES[day],
        startMin: slot.startMin,
        endMin: slot.endMin,
        durationMin: dur,
        rangeLabel: `${formatMinutesHHMM(slot.startMin)}–${formatMinutesHHMM(slot.endMin)}`,
      });
    }
  }

  return {
    commonGaps,
    totalCommonGapMinutes,
    matchingSubjects: findMatchingSubjects(friend, mine),
    subjectsHiddenByPrivacy: isSubjectHidden(friend) || isSubjectHidden(mine),
    windowStartMin,
    windowEndMin,
    includedDays,
  };
}

export function formatDurationCompact(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h}h ${m}m`;
}

export function formatWhatsAppComparison(
  result: ScheduleComparisonResult,
  friendLabel?: string,
): string {
  const who = friendLabel?.trim() ? `con ${friendLabel.trim()}` : 'en común';
  const lines: string[] = [`⚡ *Huecos libres ${who} (Pilas!)*`];

  if (result.commonGaps.length === 0) {
    lines.push('No coincidimos en huecos de 30+ minutos entre 07:00 y 20:00.');
  } else {
    const byDay = new Map<number, FreeGapSlot[]>();
    for (const gap of result.commonGaps) {
      const list = byDay.get(gap.day) ?? [];
      list.push(gap);
      byDay.set(gap.day, list);
    }
    for (const day of result.includedDays) {
      const slots = byDay.get(day);
      if (!slots || slots.length === 0) continue;
      const formatted = slots
        .map((s) => `${s.rangeLabel} (${formatDurationCompact(s.durationMin)})`)
        .join(', ');
      lines.push(`• *${DAY_NAMES_ES[day]}*: ${formatted}`);
    }
  }

  if (result.matchingSubjects.length > 0) {
    lines.push('');
    lines.push('📚 *Materias coincidentes:*');
    for (const subj of result.matchingSubjects) {
      const suffix =
        subj.exactSameSlotCount > 0 ? ' _(mismo horario)_' : '';
      lines.push(`• ${subj.subjectName}${suffix}`);
    }
  }

  lines.push('');
  lines.push('Calculado gratis en pilas-ec.vercel.app');
  return lines.join('\n');
}
