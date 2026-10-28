import { calculateRequiredP3, type GradeCalculationResult } from '../lib/grades';
import { trackEvent } from '../lib/analytics';

export type { GradeCalculationResult };
export const calculateGrade = calculateRequiredP3;

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

  let trackTimeout: number = 0;
  function onSliderInput(): void {
    update();
    clearTimeout(trackTimeout);
    trackTimeout = window.setTimeout(() => {
      trackEvent('calculadora_uso');
    }, 500);
  }

  p1Slider.addEventListener('input', onSliderInput);
  p2Slider.addEventListener('input', onSliderInput);
  update();
}
