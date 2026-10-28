/**
 * Controlador de modo de campus: ESPE (/espe) vs Multi-Universidad (/multi-u)
 * Soporta View Transitions circulares en navegadores compatibles.
 */
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

export function setCampusMode(mode: string, clientX?: number, clientY?: number): void {
  if (html.dataset.mode === mode) return;

  const doc = document as any;
  if (!doc.startViewTransition || reduce || clientX === undefined || clientY === undefined) {
    paintCampusMode(mode);
    return;
  }

  const radius = Math.hypot(
    Math.max(clientX, window.innerWidth - clientX),
    Math.max(clientY, window.innerHeight - clientY)
  );

  doc.documentElement.style.setProperty('--cx', `${clientX}px`);
  doc.documentElement.style.setProperty('--cy', `${clientY}px`);
  doc.documentElement.style.setProperty('--cr', `${radius}px`);

  const transition = doc.startViewTransition(() => paintCampusMode(mode));
  transition.ready.then(() => {
    doc.documentElement.animate(
      [
        { clipPath: 'circle(0px at var(--cx) var(--cy))' },
        { clipPath: 'circle(var(--cr) at var(--cx) var(--cy))' }
      ],
      {
        duration: 380,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        pseudoElement: '::view-transition-new(root)'
      }
    );
  });
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
}
