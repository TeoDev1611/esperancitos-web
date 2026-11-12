// ============================================================================
// PILAS! /amigo — Interactividad Cliente: Comparador, .ics, Filtro y WhatsApp
// Privacidad: Cero envío al servidor, cero logs de ?d=, cero innerHTML.
// ============================================================================

import { decodePilasParam, type AmigoPayload } from '../lib/pilasCodec';
import { copyTextToClipboard } from '../lib/pilasLinks/clipboard';
import { triggerIcsDownload } from '../lib/pilasLinks/download-ics';
import { buildScheduleIcs } from '../lib/pilasLinks/ics';
import { SAMPLE_AMIGO_MINE } from '../lib/pilasLinks/sample-payloads';
import {
  compareSchedules,
  formatDurationCompact,
  formatWhatsAppComparison,
} from '../lib/pilasLinks/schedule-compare';

function readEmbeddedFriendPayload(): AmigoPayload | null {
  const scriptEl = document.getElementById('pilas-friend-data');
  if (!scriptEl?.textContent) return null;
  try {
    const parsed = JSON.parse(scriptEl.textContent) as AmigoPayload;
    return parsed?.kind === 'amigo' ? parsed : null;
  } catch {
    return null;
  }
}

function createBadge(
  text: string,
  variant: 'success' | 'info' | 'primary',
): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = `ul-badge is-${variant}`;
  span.textContent = text;
  return span;
}

function initAmigoPage() {
  const friendPayload = readEmbeddedFriendPayload();
  if (!friendPayload) return;

  // 1. Botón Exportar .ics en el navegador
  const icsBtn = document.getElementById('btn-export-schedule-ics');
  const icsStatus = document.getElementById('schedule-ics-status');
  icsBtn?.addEventListener('click', () => {
    const ics = buildScheduleIcs(friendPayload, new Date());
    const ownerSlug = friendPayload.friendName
      ? `horario-${friendPayload.friendName.toLowerCase()}`
      : 'horario-compartido-pilas';
    triggerIcsDownload(`${ownerSlug}.ics`, ics);
    if (icsStatus) {
      icsStatus.textContent =
        'Archivo .ics descargado. Ábrelo para importarlo en Google Calendar o Apple Calendar.';
    }
  });

  // 2. Filtro interactivo por día sobre la tabla semanal (1=Lun .. 7=Dom)
  const filterBtns = document.querySelectorAll<HTMLButtonElement>('[data-day-filter]');
  const dayCells = document.querySelectorAll<HTMLElement>('[data-schedule-day]');
  const scheduleRows = document.querySelectorAll<HTMLTableRowElement>('[data-schedule-row]');

  const applyDayFilter = (selected: string) => {
    filterBtns.forEach((btn) => {
      const isSelected = btn.dataset.dayFilter === selected;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    dayCells.forEach((cell) => {
      const match = selected === 'all' || cell.dataset.scheduleDay === selected;
      cell.hidden = !match;
    });

    scheduleRows.forEach((row) => {
      if (selected === 'all') {
        row.hidden = false;
        return;
      }
      const targetCell = row.querySelector<HTMLElement>(
        `td[data-schedule-day="${selected}"]`,
      );
      const hasClass = targetCell ? targetCell.dataset.empty !== 'true' : false;
      row.hidden = !hasClass;
    });
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyDayFilter(btn.dataset.dayFilter || 'all');
    });
  });

  // 3. Comparador 100% en navegador ("Comparar con mi horario")
  const form = document.getElementById('compare-form') as HTMLFormElement | null;
  const input = document.getElementById('my-schedule-input') as HTMLTextAreaElement | null;
  const demoCompareBtn = document.getElementById('btn-compare-demo');
  const statusEl = document.getElementById('compare-status');
  const resultsBox = document.getElementById('compare-results');
  const summaryEl = document.getElementById('compare-summary');
  const gapsContainer = document.getElementById('compare-gaps-list');
  const subjectsSection = document.getElementById('compare-subjects-section');
  const subjectsContainer = document.getElementById('compare-subjects-list');
  const copyWaBtn = document.getElementById('btn-copy-wa-gaps');
  const copyWaStatus = document.getElementById('copy-wa-status');

  let lastWhatsAppText = '';

  const renderComparison = (mine: AmigoPayload, usedDemo = false) => {
    if (!resultsBox || !summaryEl || !gapsContainer || !subjectsContainer || !subjectsSection) {
      return;
    }

    const result = compareSchedules(friendPayload, mine);
    const friendLabel = friendPayload.friendName || 'tu amigo';
    lastWhatsAppText = formatWhatsAppComparison(result, friendLabel);

    const demoNote = usedDemo ? ' (usando horario demo de prueba)' : '';
    summaryEl.textContent =
      result.commonGaps.length > 0
        ? `${result.commonGaps.length} huecos libres en común (${formatDurationCompact(result.totalCommonGapMinutes)} totales entre semana)${demoNote}.`
        : `No se encontraron huecos libres contiguos de 30+ minutos entre 07:00 y 20:00${demoNote}.`;

    const gapNodes: HTMLElement[] = [];
    for (const gap of result.commonGaps) {
      const row = document.createElement('div');
      row.className = 'ul-item-row is-gap';

      const left = document.createElement('div');
      const dayTitle = document.createElement('div');
      dayTitle.className = 'schedule-block-title';
      dayTitle.textContent = gap.dayName;

      const timeRange = document.createElement('div');
      timeRange.className = 'ul-hint ul-tabular';
      timeRange.textContent = gap.rangeLabel;

      left.append(dayTitle, timeRange);

      const badge = createBadge(
        `${formatDurationCompact(gap.durationMin)} libres`,
        'success',
      );
      badge.classList.add('ul-tabular');

      row.append(left, badge);
      gapNodes.push(row);
    }

    if (gapNodes.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'ul-hint';
      emptyMsg.textContent =
        'Sus bloques académicos ocupan toda la jornada 07:00–20:00 en los mismos tramos.';
      gapNodes.push(emptyMsg);
    }
    gapsContainer.replaceChildren(...gapNodes);

    if (result.subjectsHiddenByPrivacy) {
      subjectsSection.hidden = false;
      const privNote = document.createElement('p');
      privNote.className = 'ul-hint';
      privNote.textContent =
        'Uno de los horarios omitió nombres de materias (Modo Privado); solo se compararon bloques horarios ocupados.';
      subjectsContainer.replaceChildren(privNote);
    } else if (result.matchingSubjects.length > 0) {
      subjectsSection.hidden = false;
      const subjNodes: HTMLElement[] = result.matchingSubjects.map((s) => {
        const row = document.createElement('div');
        row.className = 'ul-item-row';

        const left = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'schedule-block-title';
        title.textContent = s.subjectName;
        left.appendChild(title);

        if (s.mineName !== s.subjectName) {
          const alias = document.createElement('div');
          alias.className = 'ul-hint';
          alias.textContent = `En tu horario: ${s.mineName}`;
          left.appendChild(alias);
        }

        const badge = createBadge(
          s.exactSameSlotCount > 0
            ? `${s.exactSameSlotCount} bloque(s) exacto(s)`
            : 'Misma materia',
          s.exactSameSlotCount > 0 ? 'primary' : 'info',
        );

        row.append(left, badge);
        return row;
      });
      subjectsContainer.replaceChildren(...subjNodes);
    } else {
      subjectsSection.hidden = false;
      const noneMsg = document.createElement('p');
      noneMsg.className = 'ul-hint';
      noneMsg.textContent =
        'No coinciden materias con nombre idéntico entre ambos horarios.';
      subjectsContainer.replaceChildren(noneMsg);
    }

    resultsBox.hidden = false;
    resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!input || !statusEl) return;

    const rawValue = input.value.trim();
    if (!rawValue) {
      statusEl.textContent =
        'Pega tu enlace /amigo?d=... o tu código de horario antes de comparar.';
      input.focus();
      return;
    }

    statusEl.textContent = 'Decodificando tu horario localmente en el navegador…';
    const decoded = await decodePilasParam(rawValue, 'amigo');
    if (!decoded.ok) {
      if (decoded.code === 'UNEXPECTED_KIND') {
        statusEl.textContent =
          'Ese enlace no corresponde a un horario (/amigo). Pega un link compartido desde "Compartir mi horario" en Pilas!.';
      } else {
        statusEl.textContent = decoded.message;
      }
      return;
    }

    statusEl.textContent =
      'Comparación lista. Los datos nunca salieron de tu dispositivo.';
    renderComparison(decoded.payload, false);
  });

  demoCompareBtn?.addEventListener('click', () => {
    if (statusEl) {
      statusEl.textContent =
        'Comparación generada con horario de ejemplo (puedes pegar el tuyo arriba cuando quieras).';
    }
    renderComparison(SAMPLE_AMIGO_MINE, true);
  });

  copyWaBtn?.addEventListener('click', async () => {
    if (!lastWhatsAppText) return;
    const ok = await copyTextToClipboard(lastWhatsAppText);
    if (copyWaStatus) {
      copyWaStatus.textContent = ok
        ? 'Resumen de huecos libres copiado. Listo para pegar en WhatsApp.'
        : 'No se pudo acceder al portapapeles automáticamente en este navegador.';
    }
  });
}

initAmigoPage();
