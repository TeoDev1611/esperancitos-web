/**
 * Controlador de modo de campus: ESPE (/espe) vs Multi-Universidad (/multi-u)
 * Soporta View Transitions circulares en navegadores compatibles.
 */
import { trackEvent } from '../lib/analytics';

const html = document.documentElement;
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function paintCampusMode(mode: string): void {
  html.dataset.mode = mode;
  document.querySelectorAll<HTMLElement>('[data-mode-btn]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.modeBtn === mode));
  });
  try {
    localStorage.pilasMode = mode;
  } catch {}
}

export function setCampusMode(mode: string, x?: number, y?: number): void {
  if (html.dataset.mode === mode) return;

  trackEvent('cambio_campus', { campus: mode });

  // Barrido circular desde el punto tocado: el cambio de U se ve en toda la página.
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!reduce && typeof doc.startViewTransition === 'function') {
    const cx = x ?? window.innerWidth / 2;
    const cy = y ?? window.innerHeight / 3;
    const r = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));
    html.style.setProperty('--vt-x', cx + 'px');
    html.style.setProperty('--vt-y', cy + 'px');
    html.style.setProperty('--vt-r', r + 'px');
    doc.startViewTransition(() => paintCampusMode(mode));
    return;
  }
  paintCampusMode(mode);
}

export function initCampusMode(): void {
  paintCampusMode(html.dataset.mode === 'multi' ? 'multi' : 'espe');
  document.querySelectorAll<HTMLButtonElement>('[data-mode-btn]').forEach((btn) => {
    btn.addEventListener('click', (e: MouseEvent) => {
      const mode = btn.dataset.modeBtn;
      if (mode === 'espe' || mode === 'multi') {
        setCampusMode(mode, e.clientX, e.clientY);
      }
    });
  });

  // Pausar animaciones intensivas cuando la pestaña esté oculta o en segundo plano
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.body.classList.add('page-hidden');
    } else {
      document.body.classList.remove('page-hidden');
    }
  });
}

