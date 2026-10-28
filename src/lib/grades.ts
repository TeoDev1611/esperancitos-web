/**
 * Lógica pura para el cálculo de notas y regla de 42/60 puntos de la ESPE.
 *
 * En la Universidad de las Fuerzas Armadas ESPE (y universidades con régimen trimestral/parcial similar):
 * - Cada semestre se evalúa en 3 parciales sobre 20 puntos cada uno (total 60 puntos).
 * - Para aprobar directamente la asignatura se requiere acumular mínimo 42 puntos en total (promedio >= 14.00 / 20).
 * - Si la suma de P1 + P2 + P3 es inferior a 42 puntos, o si el estudiante no alcanza el puntaje regular,
 *   debe rendir examen supletorio o de recuperación.
 *
 * TODO(owner): Confirmar con el vicerrectorado académico o reglamento vigente si existe una nota mínima
 * obligatoria en el Parcial 3 (ej. nota piso de 10.00/20) para poder promediar, o si cualquier combinación
 * que sume 42 puntos es legalmente aprobatoria.
 */

export interface GradeInput {
  p1: number;
  p2: number;
  p3?: number;
}

export type GradeStatus = 'approved' | 'save_partial' | 'supletorio';

export interface GradeCalculationResult {
  p1: number;
  p2: number;
  sumParciales: number;
  neededP3: number;
  simP3: number;
  total: number;
  average: number;
  status: GradeStatus;
  isPassing: boolean;
  verdictText: string;
  badgeClass: string;
  mascotStatus: string;
  mascotQuote: string;
  mascotMood: 'success' | 'scared' | 'error';
}

/**
 * Limpia y normaliza una nota para asegurar que se encuentre en el rango [0, 20].
 * Maneja valores nulos, no numéricos o fuera de rango.
 */
export function clampGrade(grade: number): number {
  if (typeof grade !== 'number' || Number.isNaN(grade)) {
    return 0;
  }
  return Math.min(20, Math.max(0, Math.round(grade * 100) / 100));
}

/**
 * Calcula la situación académica y la nota requerida en el Parcial 3 para alcanzar los 42/60 puntos.
 *
 * @param p1 Nota del primer parcial (0 - 20)
 * @param p2 Nota del segundo parcial (0 - 20)
 * @returns Resultado detallado con la nota requerida, promedio, estado y mensajes
 */
export function calculateRequiredP3(p1: number, p2: number): GradeCalculationResult {
  const cleanP1 = clampGrade(p1);
  const cleanP2 = clampGrade(p2);
  const sumParciales = Math.round((cleanP1 + cleanP2) * 100) / 100;

  // Para 42 puntos en total
  const rawNeeded = 42 - sumParciales;
  const neededP3 = rawNeeded <= 0 ? 0 : Math.round(rawNeeded * 100) / 100;
  const simP3 = Math.min(20, neededP3);
  const total = Math.round((sumParciales + simP3) * 100) / 100;
  const average = Math.round((total / 3) * 100) / 100;
  const isPassing = total >= 42;

  // 1. Aprobado con margen razonable (necesita <= 12.00 puntos en P3)
  if (neededP3 <= 12) {
    return {
      p1: cleanP1,
      p2: cleanP2,
      sumParciales,
      neededP3,
      simP3,
      total,
      average,
      status: 'approved',
      isPassing,
      verdictText: `✓ APROBADO (${average.toFixed(2)})`,
      badgeClass: 'badge b-ok',
      mascotStatus: '¡Tranqui, vas sobrado!',
      mascotQuote: neededP3 === 0
        ? '¡Ya acumulaste los 42 puntos! Estás formalmente aprobado.'
        : `Con ${neededP3.toFixed(2)} pts en el Parcial 3 pasas directo el semestre.`,
      mascotMood: 'success',
    };
  }

  // 2. A salvar el parcial (necesita entre 12.01 y 20.00 puntos en P3)
  if (neededP3 <= 20) {
    return {
      p1: cleanP1,
      p2: cleanP2,
      sumParciales,
      neededP3,
      simP3,
      total,
      average,
      status: 'save_partial',
      isPassing,
      verdictText: `⚠️ A SALVAR EL PARCIAL (${average.toFixed(2)})`,
      badgeClass: 'badge b-warn',
      mascotStatus: '¡Ponte pilas con el Parcial 3!',
      mascotQuote: `Necesitas sacar mínimo ${neededP3.toFixed(2)} / 20 para evitar el supletorio.`,
      mascotMood: 'scared',
    };
  }

  // 3. Imposible de aprobar en parciales regulares (necesita > 20 puntos) -> Directo a Supletorio
  return {
    p1: cleanP1,
    p2: cleanP2,
    sumParciales,
    neededP3,
    simP3,
    total,
    average,
    status: 'supletorio',
    isPassing: false,
    verdictText: '⚠️ SUPLETORIO',
    badgeClass: 'badge b-crit',
    mascotStatus: '¡Chuta! No alcanza a 42',
    mascotQuote: `La suma P1+P2 (${sumParciales.toFixed(2)}) requeriría ${neededP3.toFixed(2)} pts (más de 20). Toca preparar el supletorio.`,
    mascotMood: 'error',
  };
}
