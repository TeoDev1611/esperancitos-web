import { describe, it, expect } from 'vitest';
import {
  formatCompressorSize,
  isOverMoodleLimit,
  getCompressorFeedback,
} from '../src/scripts/compressor-demo';

describe('Lógica del compresor PDF para Moodle (Límite 5 MB)', () => {
  describe('formatCompressorSize', () => {
    it('debe formatear tamaños en MB con un decimal', () => {
      expect(formatCompressorSize(24.8)).toBe('24.8 MB');
      expect(formatCompressorSize(3.2)).toBe('3.2 MB');
      expect(formatCompressorSize(5)).toBe('5.0 MB');
      expect(formatCompressorSize(0.85)).toBe('0.9 MB');
    });
  });

  describe('isOverMoodleLimit', () => {
    it('debe ser verdadero si supera los 5 MB', () => {
      expect(isOverMoodleLimit(5.01)).toBe(true);
      expect(isOverMoodleLimit(24.8)).toBe(true);
      expect(isOverMoodleLimit(50)).toBe(true);
    });

    it('debe ser falso si no supera los 5 MB (inclusive en el límite exacto de 5.0 MB)', () => {
      expect(isOverMoodleLimit(5.0)).toBe(false);
      expect(isOverMoodleLimit(4.99)).toBe(false);
      expect(isOverMoodleLimit(3.2)).toBe(false);
      expect(isOverMoodleLimit(0.5)).toBe(false);
    });
  });

  describe('getCompressorFeedback', () => {
    it('debe advertir claramente con badge b-crit cuando supera 5 MB', () => {
      const feedback = getCompressorFeedback(24.8);
      expect(feedback.isOver).toBe(true);
      expect(feedback.badgeClass).toBe('b-crit');
      expect(feedback.message).toContain('Supera el límite de Moodle (5 MB)');
    });

    it('debe confirmar que está listo para entregar con badge b-ok cuando pesa <= 5 MB', () => {
      const feedback = getCompressorFeedback(3.2);
      expect(feedback.isOver).toBe(false);
      expect(feedback.badgeClass).toBe('b-ok');
      expect(feedback.message).toContain('Reducido a 3.2 MB · Listo para entregar');
    });
  });
});
