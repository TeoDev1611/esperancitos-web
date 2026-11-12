import { describe, it, expect } from 'vitest';
import type { AmigoPayload } from '../src/lib/pilasCodec';
import {
  compareSchedules,
  findMatchingSubjects,
  formatDurationCompact,
  formatWhatsAppComparison,
  intersectIntervals,
  invertBusyToFree,
  mergeBusyIntervals,
} from '../src/lib/pilasLinks/schedule-compare';
import { SAMPLE_AMIGO_FRIEND, SAMPLE_AMIGO_MINE } from '../src/lib/pilasLinks/sample-payloads';

describe('Intervalos de tiempo y fusión de huecos (días 1..7)', () => {
  it('fusiona bloques contiguos y solapados en el mismo día', () => {
    const classes: AmigoPayload['classes'] = [
      { d: 1, i: 420, f: 540, s: 'A', r: '', t: '', n: '', m: 1 },
      { d: 1, i: 540, f: 600, s: 'A', r: '', t: '', n: '', m: 1 },
      { d: 1, i: 570, f: 660, s: 'B', r: '', t: '', n: '', m: 1 },
    ];
    expect(mergeBusyIntervals(classes, 1, 420, 1200)).toEqual([
      { startMin: 420, endMin: 660 },
    ]);
  });

  it('invierte bloques ocupados en huecos libres exactos dentro de la ventana', () => {
    const busy = [
      { startMin: 435, endMin: 555 },
      { startMin: 705, endMin: 795 },
    ];
    expect(invertBusyToFree(busy, 420, 1200)).toEqual([
      { startMin: 420, endMin: 435 },
      { startMin: 555, endMin: 705 },
      { startMin: 795, endMin: 1200 },
    ]);
  });

  it('calcula intersecciones exactas de intervalos', () => {
    expect(
      intersectIntervals(
        [{ startMin: 480, endMin: 660 }],
        [{ startMin: 540, endMin: 720 }],
      ),
    ).toEqual([{ startMin: 540, endMin: 660 }]);
    expect(
      intersectIntervals(
        [{ startMin: 480, endMin: 540 }],
        [{ startMin: 540, endMin: 600 }],
      ),
    ).toEqual([]);
  });
});

describe('compareSchedules & findMatchingSubjects', () => {
  it('encuentra huecos libres >= 30 min y materias coincidentes con Vector 1 y Mateo', () => {
    const result = compareSchedules(SAMPLE_AMIGO_FRIEND, SAMPLE_AMIGO_MINE);
    expect(result.includedDays).toEqual([1, 2, 3, 4, 5]);
    expect(result.commonGaps.length).toBeGreaterThan(0);
    expect(result.commonGaps.every((g) => g.durationMin >= 30)).toBe(true);

    const calc = result.matchingSubjects.find((s) => s.subjectName === 'Cálculo Vectorial');
    expect(calc).toBeDefined();
    expect(calc?.exactSameSlotCount).toBe(1);
  });

  it('normaliza tildes y mayúsculas al comparar materias coincidentes', () => {
    const p1: AmigoPayload = {
      ...SAMPLE_AMIGO_FRIEND,
      classes: [{ d: 1, i: 420, f: 540, s: 'Calculo Vectorial', r: '', t: '', n: '', m: 1 }],
    };
    const p2: AmigoPayload = {
      ...SAMPLE_AMIGO_MINE,
      classes: [{ d: 1, i: 420, f: 540, s: 'cálculo vectorial', r: '', t: '', n: '', m: 2 }],
    };
    const matches = findMatchingSubjects(p1, p2);
    expect(matches).toHaveLength(1);
    expect(matches[0].exactSameSlotCount).toBe(1);
  });

  it('no fabrica ni reporta coincidencias cuando las materias fueron ocultadas en modo privado', () => {
    const anon: AmigoPayload = {
      ...SAMPLE_AMIGO_FRIEND,
      isPrivateMode: true,
      classes: SAMPLE_AMIGO_FRIEND.classes.map((b) => ({
        ...b,
        s: 'Bloque ocupado',
      })),
    };
    const matches = findMatchingSubjects(anon, SAMPLE_AMIGO_MINE);
    expect(matches).toEqual([]);
  });

  it('incluye sábado dinámicamente cuando algún horario tiene clase en día 6', () => {
    const satSchedule: AmigoPayload = {
      ...SAMPLE_AMIGO_FRIEND,
      classes: [
        ...SAMPLE_AMIGO_FRIEND.classes,
        { d: 6, i: 540, f: 660, s: 'Cálculo Vectorial', r: '', t: '', n: '', m: 1 },
      ],
    };
    const result = compareSchedules(satSchedule, SAMPLE_AMIGO_MINE);
    expect(result.includedDays).toContain(6);
  });

  it('formatea texto legible para compartir por WhatsApp', () => {
    const result = compareSchedules(SAMPLE_AMIGO_FRIEND, SAMPLE_AMIGO_MINE);
    const text = formatWhatsAppComparison(result, 'Ana López');
    expect(text).toContain('Huecos libres con Ana López');
    expect(text).toContain('Materias coincidentes');
    expect(text).toContain('Cálculo Vectorial');
    expect(text).toContain('pilas-ec.vercel.app');
    expect(formatDurationCompact(90)).toBe('1h 30m');
    expect(formatDurationCompact(120)).toBe('2 h');
  });
});
