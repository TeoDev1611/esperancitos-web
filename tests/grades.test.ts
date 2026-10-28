import { describe, it, expect } from 'vitest';
import { calculateRequiredP3, clampGrade } from '../src/lib/grades';

describe('Cálculo de notas ESPE (Regla 42/60 puntos)', () => {
  describe('clampGrade', () => {
    it('debe mantener valores válidos entre 0 y 20 con dos decimales', () => {
      expect(clampGrade(15.5)).toBe(15.5);
      expect(clampGrade(0)).toBe(0);
      expect(clampGrade(20)).toBe(20);
      expect(clampGrade(14.256)).toBe(14.26);
    });

    it('debe restringir valores negativos a 0', () => {
      expect(clampGrade(-5)).toBe(0);
      expect(clampGrade(-0.01)).toBe(0);
    });

    it('debe restringir valores superiores a 20 a 20', () => {
      expect(clampGrade(25)).toBe(20);
      expect(clampGrade(100)).toBe(20);
    });

    it('debe devolver 0 si el valor no es un número válido', () => {
      expect(clampGrade(NaN)).toBe(0);
      expect(clampGrade(undefined as any)).toBe(0);
    });
  });

  describe('calculateRequiredP3', () => {
    it('caso aprobado con margen (P1=16, P2=16 -> suma 32, necesita 10)', () => {
      const res = calculateRequiredP3(16, 16);
      expect(res.sumParciales).toBe(32);
      expect(res.neededP3).toBe(10);
      expect(res.status).toBe('approved');
      expect(res.isPassing).toBe(true);
      expect(res.mascotMood).toBe('success');
      expect(res.verdictText).toContain('APROBADO');
    });

    it('caso ya aprobado antes del Parcial 3 (P1=20, P2=20 -> suma 40, necesita 2)', () => {
      const res = calculateRequiredP3(20, 20);
      expect(res.sumParciales).toBe(40);
      expect(res.neededP3).toBe(2);
      expect(res.status).toBe('approved');
      expect(res.isPassing).toBe(true);
    });

    it('caso aprobado en el límite de comodidad (necesita exactamente 12.00, P1=15, P2=15 -> suma 30)', () => {
      const res = calculateRequiredP3(15, 15);
      expect(res.sumParciales).toBe(30);
      expect(res.neededP3).toBe(12);
      expect(res.status).toBe('approved');
      expect(res.isPassing).toBe(true);
    });

    it('caso salvar el parcial (necesita entre 12.01 y 20, P1=14, P2=14 -> suma 28, necesita 14)', () => {
      const res = calculateRequiredP3(14, 14);
      expect(res.sumParciales).toBe(28);
      expect(res.neededP3).toBe(14);
      expect(res.status).toBe('save_partial');
      expect(res.isPassing).toBe(true);
      expect(res.mascotMood).toBe('scared');
      expect(res.verdictText).toContain('A SALVAR EL PARCIAL');
    });

    it('caso salvar el parcial en el límite extremo (P1=11, P2=11 -> suma 22, necesita 20)', () => {
      const res = calculateRequiredP3(11, 11);
      expect(res.sumParciales).toBe(22);
      expect(res.neededP3).toBe(20);
      expect(res.status).toBe('save_partial');
      expect(res.isPassing).toBe(true);
      expect(res.average).toBe(14);
    });

    it('caso imposible de aprobar en parciales regulares (P1=10, P2=10 -> suma 20, necesitaría 22 > 20)', () => {
      const res = calculateRequiredP3(10, 10);
      expect(res.sumParciales).toBe(20);
      expect(res.neededP3).toBe(22);
      expect(res.status).toBe('supletorio');
      expect(res.isPassing).toBe(false);
      expect(res.mascotMood).toBe('error');
      expect(res.verdictText).toContain('SUPLETORIO');
    });

    it('manejo exacto de decimales comunes de actas Banner (ej. 15.50 y 14.25)', () => {
      const res = calculateRequiredP3(15.5, 14.25);
      expect(res.sumParciales).toBe(29.75);
      expect(res.neededP3).toBe(12.25);
      expect(res.status).toBe('save_partial');
    });

    it('umbral de aprobación: promedio acumulado total debe ser >= 14.00 / 20 al sumar 42 puntos', () => {
      const resAtLimit = calculateRequiredP3(14, 14);
      expect(resAtLimit.average).toBeGreaterThanOrEqual(14.0);
      expect(resAtLimit.total).toBe(42);
    });
  });
});
