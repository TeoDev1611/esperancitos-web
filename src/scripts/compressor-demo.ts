/**
 * Controlador para la demo interactiva del compresor de PDF para Moodle (límite 5 MB).
 */

const LIM = 5;
const MAX = 30;

export function formatCompressorSize(mb: number): string {
  return `${mb.toFixed(1)} MB`;
}

export function isOverMoodleLimit(mb: number): boolean {
  return mb > LIM;
}

export function initCompressorDemo(mascotImages?: Record<string, string>): void {
  const gb = document.getElementById('gb');
  const gf = document.getElementById('gfill');
  const gn = document.getElementById('gnow');
  const gbtn = document.getElementById('gbtn');

  if (!gbtn || !gf || !gn || !gb) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let comp = false;
  let gaugeAnimId = 0;

  function setGauge(mb: number): void {
    if (!gf || !gn || !gb) return;
    gf.style.width = Math.max(2, (mb / MAX) * 100) + '%';
    gn.textContent = formatCompressorSize(mb);
    const isOver = isOverMoodleLimit(mb);
    const k = isOver
      ? ['b-crit', 'Supera el límite de Moodle (5 MB)']
      : ['b-ok', `Reducido a ${formatCompressorSize(mb)} · Listo para entregar`];

    gf.style.background = isOver ? 'var(--critical)' : 'var(--success)';
    gb.className = 'badge ' + k[0];
    gb.textContent = k[1];

    const gMascot = document.getElementById('gauge-mascot-img') as HTMLImageElement | null;
    const gStatus = document.getElementById('gauge-mascot-status');
    const gQuote = document.getElementById('gauge-mascot-quote');

    if (gMascot && gStatus && gQuote) {
      if (isOver) {
        if (mascotImages?.scared) gMascot.src = mascotImages.scared;
        gMascot.alt = 'Pilo preocupado porque el PDF excede el límite de subida de Moodle';
        gStatus.textContent = '¡Cuidado con la entrega!';
        gQuote.textContent = 'Moodle rebotará tu tarea si pesa más de 5 MB. Comprímelo en un toque.';
      } else {
        if (mascotImages?.success) gMascot.src = mascotImages.success;
        gMascot.alt = 'Pilo feliz con pulgar arriba porque el PDF entra en el límite de Moodle';
        gStatus.textContent = '¡De una! Archivo listo';
        gQuote.textContent = `Comprimido a ${formatCompressorSize(mb)} sin perder nitidez legible.`;
      }
    }
  }

  function animateGauge(from: number, to: number, duration: number = 750): void {
    if (gaugeAnimId) cancelAnimationFrame(gaugeAnimId);
    const t0 = performance.now();
    function step(now: number): void {
      const p = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur = from + (to - from) * ease;
      setGauge(cur);
      if (p < 1) {
        gaugeAnimId = requestAnimationFrame(step);
      }
    }
    gaugeAnimId = requestAnimationFrame(step);
  }

  setGauge(24.8);

  gbtn.addEventListener('click', () => {
    const from = comp ? 2.1 : 24.8;
    const to = comp ? 24.8 : 2.1;
    comp = !comp;
    gbtn.textContent = comp ? 'Probar de nuevo' : 'Probar compresión';
    if (reduce) return setGauge(to);
    animateGauge(from, to, 750);
  });
}
