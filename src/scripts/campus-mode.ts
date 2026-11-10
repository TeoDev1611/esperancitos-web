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

export function setCampusMode(mode: string): void {
  if (html.dataset.mode === mode) return;

  trackEvent('cambio_campus', { campus: mode });
  paintCampusMode(mode);
}

export function initCampusMode(): void {
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

