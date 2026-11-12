// ============================================================================
// PILAS! /tarea — Cuenta Regresiva en Vivo (America/Guayaquil) y Export .ics
// Reglas: Temporal API + Intl.DurationFormat cuando estén disponibles, 0 red.
// ============================================================================

import type { TareaPayload } from '../lib/pilasCodec';
import { triggerIcsDownload } from '../lib/pilasLinks/download-ics';
import { buildTaskIcs } from '../lib/pilasLinks/ics';

const ECUADOR_TZ = 'America/Guayaquil';

interface TemporalDurationLike {
  sign: number;
  days?: number;
  hours?: number;
  minutes?: number;
}

interface TemporalZonedLike {
  until: (
    other: TemporalZonedLike,
    options?: { largestUnit?: string; smallestUnit?: string },
  ) => TemporalDurationLike;
}

interface TemporalGlobalLike {
  Now: {
    zonedDateTimeISO: (tz: string) => TemporalZonedLike;
  };
  Instant: {
    fromEpochMilliseconds: (ms: number) => {
      toZonedDateTimeISO: (tz: string) => TemporalZonedLike;
    };
  };
}

function formatDurationCompactEs(parts: {
  days: number;
  hours: number;
  minutes: number;
}): string {
  const days = Math.abs(Math.trunc(parts.days));
  const hours = Math.abs(Math.trunc(parts.hours));
  const minutes = Math.abs(Math.trunc(parts.minutes));

  if ('Intl' in globalThis && 'DurationFormat' in Intl) {
    try {
      const DurationFmt = (
        Intl as unknown as {
          DurationFormat: new (
            locales?: string | string[],
            options?: { style?: string },
          ) => { format: (d: Record<string, number>) => string };
        }
      ).DurationFormat;
      const formatter = new DurationFmt('es-EC', { style: 'narrow' });
      const nonZero: Record<string, number> = {};
      if (days > 0) nonZero.days = days;
      if (hours > 0) nonZero.hours = hours;
      if (minutes > 0 || (days === 0 && hours === 0)) {
        nonZero.minutes = minutes;
      }
      return formatter.format(nonZero);
    } catch {
      // Fallback determinista abajo
    }
  }

  const chunks: string[] = [];
  if (days > 0) chunks.push(`${days}d`);
  if (hours > 0) chunks.push(`${hours}h`);
  if (minutes > 0 || chunks.length === 0) chunks.push(`${minutes}m`);
  return chunks.join(' ');
}

function computeCountdownParts(dueEpochMs: number): {
  expired: boolean;
  totalMinutes: number;
  formatted: string;
} {
  const temporalApi = (
    globalThis as unknown as { Temporal?: TemporalGlobalLike }
  ).Temporal;

  if (temporalApi?.Now && temporalApi?.Instant) {
    try {
      const nowEc = temporalApi.Now.zonedDateTimeISO(ECUADOR_TZ);
      const dueEc = temporalApi.Instant.fromEpochMilliseconds(dueEpochMs).toZonedDateTimeISO(
        ECUADOR_TZ,
      );
      const diff = nowEc.until(dueEc, {
        largestUnit: 'day',
        smallestUnit: 'minute',
      });
      const expired = diff.sign < 0;
      const absDiff = expired
        ? dueEc.until(nowEc, { largestUnit: 'day', smallestUnit: 'minute' })
        : diff;
      const days = Math.abs(absDiff.days ?? 0);
      const hours = Math.abs(absDiff.hours ?? 0);
      const minutes = Math.abs(absDiff.minutes ?? 0);
      const totalMinutes = days * 24 * 60 + hours * 60 + minutes;
      return {
        expired,
        totalMinutes,
        formatted: formatDurationCompactEs({ days, hours, minutes }),
      };
    } catch {
      // Continuar a cálculo directo UTC-05
    }
  }

  const diffMs = dueEpochMs - Date.now();
  const expired = diffMs <= 0;
  const totalMinutes = Math.max(0, Math.round(Math.abs(diffMs) / 60_000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return {
    expired,
    totalMinutes,
    formatted: formatDurationCompactEs({ days, hours, minutes }),
  };
}

function readTaskPayload(): TareaPayload | null {
  const el = document.getElementById('pilas-task-data');
  if (!el?.textContent) return null;
  try {
    const parsed = JSON.parse(el.textContent) as TareaPayload;
    return parsed?.kind === 'tarea' ? parsed : null;
  } catch {
    return null;
  }
}

function initTareaPage() {
  const payload = readTaskPayload();
  if (!payload) return;

  const dueEpochMs = Date.parse(payload.dueDate);
  if (Number.isNaN(dueEpochMs)) return;

  const countdownVal = document.getElementById('task-countdown-value');
  const countdownSub = document.getElementById('task-countdown-sub');
  const statusBadge = document.getElementById('task-urgency-badge');
  const card = document.getElementById('task-hero-card');
  const mascot = document.getElementById('task-mascot-img') as HTMLImageElement | null;

  const refreshCountdown = () => {
    const state = computeCountdownParts(dueEpochMs);

    if (state.expired) {
      if (countdownVal) {
        countdownVal.textContent = `Cerró hace ${state.formatted}`;
      }
      if (countdownSub) {
        countdownSub.textContent =
          'El plazo límite ya pasó según la hora oficial de Ecuador (UTC-05). Verifica si Moodle permite entregas tardías.';
      }
      if (statusBadge) {
        statusBadge.className = 'ul-badge is-critical';
        statusBadge.textContent = 'Atrasada · Plazo vencido';
      }
      if (card) {
        card.className = 'ul-card is-critical';
      }
      if (mascot) {
        mascot.src = '/logos/mascota_negacion.svg';
        mascot.alt = 'Pilo indicando que el plazo de entrega ya venció';
      }
      return;
    }

    const isUrgent = state.totalMinutes <= 24 * 60;
    if (countdownVal) {
      countdownVal.textContent = `Vence en ${state.formatted}`;
    }
    if (countdownSub) {
      countdownSub.textContent = isUrgent
        ? 'Quedan menos de 24 horas para entregar. Exporta el recordatorio o ábrelo en Pilas! para alertas continuas.'
        : 'Tiempo restante calculado en zona horaria oficial de Ecuador (America/Guayaquil).';
    }
    if (statusBadge) {
      statusBadge.className = isUrgent ? 'ul-badge is-warning' : 'ul-badge is-info';
      statusBadge.textContent = isUrgent ? 'Por vencer (< 24 h)' : 'Pendiente';
    }
    if (card) {
      card.className = isUrgent ? 'ul-card is-warning' : 'ul-card is-primary';
    }
    if (mascot) {
      mascot.src = isUrgent
        ? '/logos/mascota_asustado.svg'
        : '/logos/mascota_neutro.svg';
      mascot.alt = isUrgent
        ? 'Pilo preocupado porque la tarea vence en menos de 24 horas'
        : 'Pilo acompañando el recordatorio de tarea';
    }
  };

  refreshCountdown();
  const intervalId = window.setInterval(refreshCountdown, 30_000);
  window.addEventListener('pagehide', () => window.clearInterval(intervalId), {
    once: true,
  });

  const icsBtn = document.getElementById('btn-export-task-ics');
  const icsStatus = document.getElementById('task-ics-status');
  icsBtn?.addEventListener('click', () => {
    const ics = buildTaskIcs(payload, new Date());
    const slug = `tarea-${(payload.subject || payload.title).toLowerCase()}`;
    triggerIcsDownload(`${slug}.ics`, ics);
    if (icsStatus) {
      icsStatus.textContent =
        'Recordatorio .ics descargado con alertas automáticas 24h y 2h antes del cierre.';
    }
  });
}

initTareaPage();
