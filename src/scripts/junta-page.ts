// ============================================================================
// PILAS! /junta — Exportar Invitación (.ics) a Google Calendar / Apple Calendar
// ============================================================================

import type { JuntaPayload } from '../lib/pilasCodec';
import { triggerIcsDownload } from '../lib/pilasLinks/download-ics';
import { buildJuntaIcs } from '../lib/pilasLinks/ics';

function readJuntaPayload(): JuntaPayload | null {
  const el = document.getElementById('pilas-junta-data');
  if (!el?.textContent) return null;
  try {
    const parsed = JSON.parse(el.textContent) as JuntaPayload;
    return parsed?.kind === 'junta' ? parsed : null;
  } catch {
    return null;
  }
}

function initJuntaPage() {
  const payload = readJuntaPayload();
  if (!payload) return;

  const icsButtons = [
    document.getElementById('btn-export-junta-ics'),
    document.getElementById('btn-export-junta-ics-inline'),
  ].filter((el): el is HTMLButtonElement => Boolean(el));

  const statusEl = document.getElementById('junta-ics-status');

  const handleDownloadIcs = () => {
    const ics = buildJuntaIcs(payload, new Date());
    const slug = `junta-${payload.title.toLowerCase()}`;
    triggerIcsDownload(`${slug}.ics`, ics);
    if (statusEl) {
      statusEl.textContent =
        'Invitación .ics descargada. Ábrela para añadir la junta directo a Google Calendar o Apple Calendar.';
    }
  };

  icsButtons.forEach((btn) => btn.addEventListener('click', handleDownloadIcs));
}

initJuntaPage();
