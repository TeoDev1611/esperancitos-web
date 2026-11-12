// ============================================================================
// PILAS! /tareas — Checklist Compartida Persistida Localmente en localStorage
// Clave exacta: pilas_cl_<fnv1a> (usando fnv1a32 parity Dart, nunca ?d= ni PII).
// ============================================================================

import { fnv1a32, type TareasPayload } from '../lib/pilasCodec';
import { copyTextToClipboard } from '../lib/pilasLinks/clipboard';

interface EmbeddedTasksBoot {
  payload: TareasPayload;
  storageSuffix: string;
}

function readBootData(): EmbeddedTasksBoot | null {
  const el = document.getElementById('pilas-tasks-data');
  if (!el?.textContent) return null;
  try {
    const parsed = JSON.parse(el.textContent) as EmbeddedTasksBoot;
    return parsed?.payload?.kind === 'tareas' ? parsed : null;
  } catch {
    return null;
  }
}

function initTareasPage() {
  const boot = readBootData();
  if (!boot) return;

  const { payload, storageSuffix } = boot;
  const seed =
    storageSuffix || `${payload.title}|${payload.subject}|${payload.createdAt}`;
  const storageKey = `pilas_cl_${fnv1a32(seed).toString(16).padStart(8, '0')}`;

  const checkboxes = Array.from(
    document.querySelectorAll<HTMLInputElement>('[data-task-checkbox]'),
  );
  const progressBar = document.getElementById(
    'tasks-progress-bar',
  ) as HTMLProgressElement | null;
  const progressText = document.getElementById('tasks-progress-text');
  const mascot = document.getElementById('tasks-mascot-img') as HTMLImageElement | null;
  const statusEl = document.getElementById('tasks-local-status');
  const resetBtn = document.getElementById('btn-tasks-reset');
  const clearBtn = document.getElementById('btn-tasks-clear-storage');
  const copyWaBtn = document.getElementById('btn-tasks-copy-wa');

  let stateMap: Record<string, boolean> = {};
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') {
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'boolean') stateMap[k] = v;
        }
      }
    }
  } catch {
    stateMap = {};
  }

  const syncUi = (announceSave = false) => {
    let doneCount = 0;
    const total = checkboxes.length;

    checkboxes.forEach((cb) => {
      const itemId = cb.dataset.itemId || '';
      const checked = itemId in stateMap ? Boolean(stateMap[itemId]) : false;
      cb.checked = checked;
      if (checked) doneCount++;

      const row = cb.closest<HTMLElement>('[data-check-row]');
      if (row) {
        row.classList.toggle('is-checked', checked);
      }
    });

    if (progressBar) {
      progressBar.max = Math.max(1, total);
      progressBar.value = doneCount;
    }

    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    if (progressText) {
      progressText.textContent = `${doneCount} de ${total} completadas (${pct}%)`;
    }

    if (mascot) {
      if (total > 0 && doneCount === total) {
        mascot.src = '/logos/mascota_aprobacion.svg';
        mascot.alt = 'Pilo celebrando que completaste toda la checklist';
      } else {
        mascot.src = '/logos/mascota_neutro.svg';
        mascot.alt = 'Pilo acompañando el avance de tu lista de tareas';
      }
    }

    if (announceSave && statusEl) {
      statusEl.textContent =
        'Avance guardado localmente en este navegador (sin servidor).';
    }
  };

  const persistState = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateMap));
    } catch {
      // Ignorar si almacenamiento privado está lleno o deshabilitado
    }
  };

  checkboxes.forEach((cb) => {
    cb.addEventListener('change', () => {
      const itemId = cb.dataset.itemId || '';
      if (!itemId) return;
      stateMap[itemId] = cb.checked;
      persistState();
      syncUi(true);
    });
  });

  resetBtn?.addEventListener('click', () => {
    stateMap = {};
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // noop
    }
    syncUi(false);
    if (statusEl) {
      statusEl.textContent = 'Checklist reiniciada al estado original sin marcas.';
    }
  });

  clearBtn?.addEventListener('click', () => {
    stateMap = {};
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // noop
    }
    syncUi(false);
    if (statusEl) {
      statusEl.textContent =
        'Progreso local eliminado de este navegador.';
    }
  });

  copyWaBtn?.addEventListener('click', async () => {
    const lines: string[] = [
      `✅ *${payload.title}*${payload.subject ? ` (${payload.subject})` : ''}`,
    ];
    checkboxes.forEach((cb) => {
      const titleEl = cb
        .closest('[data-check-row]')
        ?.querySelector<HTMLElement>('.ul-check-title');
      const label = titleEl?.textContent?.trim() || 'Ítem';
      const priorityTag = cb.dataset.isPriority === 'true' ? ' [Prioritario]' : '';
      lines.push(`${cb.checked ? '☑️' : '⬜'} ${label}${priorityTag}`);
    });
    lines.push('');
    lines.push('Editado localmente en pilas-ec.vercel.app');

    const ok = await copyTextToClipboard(lines.join('\n'));
    if (statusEl) {
      statusEl.textContent = ok
        ? 'Resumen con tus checks actuales copiado para WhatsApp.'
        : 'No se pudo copiar automáticamente al portapapeles en este navegador.';
    }
  });

  syncUi(false);
}

initTareasPage();
