/**
 * Controlador de interactividad para el Carnet Estudiantil 3D.
 * Maneja el volteo entre carnet ESPE y Pasaporte Multi-U con física 3D en hover.
 */
import { setCampusMode } from './campus-mode';

export function initCarnetFlip(): void {
  const carnetEl = document.getElementById('hub-carnet');
  if (!carnetEl) return;

  const html = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  carnetEl.addEventListener('click', (e: MouseEvent) => {
    const nextMode = html.dataset.mode === 'multi' ? 'espe' : 'multi';
    setCampusMode(nextMode, e.clientX, e.clientY);
  });

  // Soporte de accesibilidad con teclado (Enter y Espacio)
  carnetEl.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const nextMode = html.dataset.mode === 'multi' ? 'espe' : 'multi';
      const rect = carnetEl.getBoundingClientRect();
      setCampusMode(nextMode, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  });

  if (!reduce) {
    const passIn = carnetEl.querySelector('.pass-in') as HTMLElement | null;
    carnetEl.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = carnetEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      const isMulti = html.dataset.mode === 'multi';
      const baseFlip = isMulti ? 180 : 0;
      if (passIn) {
        passIn.style.transition = 'transform 0.1s ease-out';
        passIn.style.transform = `rotateY(${baseFlip + rotateY}deg) rotateX(${rotateX}deg) scale(1.02)`;
      }
    });

    carnetEl.addEventListener('mouseleave', () => {
      const isMulti = html.dataset.mode === 'multi';
      if (passIn) {
        passIn.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        passIn.style.transform = isMulti ? 'rotateY(180deg)' : 'rotateY(0deg)';
      }
    });
  }
}
