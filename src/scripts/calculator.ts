/**
 * Lógica pura e interactiva para el simulador de notas de la regla ESPE 42/60 puntos.
 */

export interface GradeCalculationResult {
  p1: number;
  p2: number;
  neededP3: number;
  simP3: number;
  total: number;
  average: number;
  status: 'approved' | 'save_partial' | 'supletorio';
  verdictText: string;
  badgeClass: string;
  mascotStatus: string;
  mascotQuote: string;
  mascotMood: 'success' | 'scared' | 'error';
}

export function calculateGrade(p1: number, p2: number): GradeCalculationResult {
  const cleanP1 = Math.min(20, Math.max(0, p1));
  const cleanP2 = Math.min(20, Math.max(0, p2));
  const sumParciales = cleanP1 + cleanP2;
  const needed = Math.max(0, 42 - sumParciales);
  const simP3 = Math.min(20, needed);
  const total = sumParciales + simP3;
  const average = total / 3;

  if (needed <= 12) {
    return {
      p1: cleanP1,
      p2: cleanP2,
      neededP3: needed,
      simP3,
      total,
      average,
      status: 'approved',
      verdictText: `✓ APROBADO (${average.toFixed(2)})`,
      badgeClass: 'badge b-ok',
      mascotStatus: '¡Tranqui, vas sobrado!',
      mascotQuote: `Con ${needed.toFixed(2)} pts en el Parcial 3 pasas directo el semestre.`,
      mascotMood: 'success',
    };
  }

  if (needed <= 20) {
    return {
      p1: cleanP1,
      p2: cleanP2,
      neededP3: needed,
      simP3,
      total,
      average,
      status: 'save_partial',
      verdictText: `⚠️ A SALVAR EL PARCIAL (${average.toFixed(2)})`,
      badgeClass: 'badge b-warn',
      mascotStatus: '¡Ponte pilas con el Parcial 3!',
      mascotQuote: `Necesitas sacar mínimo ${needed.toFixed(2)} / 20 para evitar el supletorio.`,
      mascotMood: 'scared',
    };
  }

  return {
    p1: cleanP1,
    p2: cleanP2,
    neededP3: needed,
    simP3,
    total,
    average,
    status: 'supletorio',
    verdictText: '⚠️ SUPLETORIO',
    badgeClass: 'badge b-crit',
    mascotStatus: '¡Chuta! No alcanza a 42',
    mascotQuote: 'La suma de los tres parciales no llega a 42. Toca preparar el supletorio.',
    mascotMood: 'error',
  };
}

export function initGradeCalculator(mascotImages?: Record<string, string>): void {
  const p1Slider = document.getElementById('site-p1-slider') as HTMLInputElement | null;
  const p2Slider = document.getElementById('site-p2-slider') as HTMLInputElement | null;
  const p1Val = document.getElementById('site-p1-val');
  const p2Val = document.getElementById('site-p2-val');
  const p3Req = document.getElementById('site-p3-req');
  const calcVerdict = document.getElementById('site-calc-verdict');

  if (!p1Slider || !p2Slider) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function update(): void {
    if (!p1Slider || !p2Slider) return;
    const p1 = parseFloat(p1Slider.value);
    const p2 = parseFloat(p2Slider.value);

    if (p1Val) p1Val.textContent = p1.toFixed(2) + ' / 20';
    if (p2Val) p2Val.textContent = p2.toFixed(2) + ' / 20';

    const res = calculateGrade(p1, p2);

    if (p3Req) {
      p3Req.textContent = res.neededP3 > 20 ? 'No alcanza (> 20 pts)' : res.neededP3.toFixed(2) + ' / 20';
    }

    if (calcVerdict) {
      calcVerdict.className = res.badgeClass;
      calcVerdict.textContent = res.verdictText;
    }

    const mascotImg = document.getElementById('calc-mascot-img') as HTMLImageElement | null;
    const mascotStatus = document.getElementById('calc-mascot-status');
    const mascotQuote = document.getElementById('calc-mascot-quote');

    if (mascotImg && mascotImages) {
      mascotImg.src = mascotImages[res.mascotMood] || mascotImg.src;
    }
    if (mascotStatus) mascotStatus.textContent = res.mascotStatus;
    if (mascotQuote) mascotQuote.textContent = res.mascotQuote;

    if (!reduce && calcVerdict) {
      try {
        if (res.status === 'approved') {
          calcVerdict.animate(
            [{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
            { duration: 250, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
          );
        } else if (res.status === 'supletorio') {
          calcVerdict.animate(
            [{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }],
            { duration: 180, iterations: 2 }
          );
        }
      } catch {}
    }
  }

  p1Slider.addEventListener('input', update);
  p2Slider.addEventListener('input', update);
  update();
}
