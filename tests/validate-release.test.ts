import { describe, it, expect } from 'vitest';
import { validateReleaseData, type ReleaseData } from '../scripts/validate-release';

describe('Validación de Release y Descargas (Fase 1)', () => {
  const validBaseData: ReleaseData = {
    version: '1.2.0',
    build: 8,
    apkVersion: '1.1-beta.2',
    releaseDate: '2026-03-20',
    minAndroid: '8.0 (API 26)',
    versionDiscrepancyNote: 'La app móvil está en v1.1-beta.2 mientras el Hub web avanza a v1.2.0.',
    downloads: {
      showDownloadCount: true,
      count: 100,
      label: '+100 descargas verificadas',
    },
    architectures: {
      'arm64-v8a': {
        name: 'arm64-v8a',
        description: 'Celulares modernos (64-bit)',
        file: 'pilas-v1.1-beta.2-arm64-v8a.apk',
        sizeBytes: 38999344,
        sha256: '6146d397772f13c4aa3032e91ad4f5957af7d8fd612235bb9043e30ac66a9ff2',
        url: '/downloads/pilas-v1.1-beta.2-arm64-v8a.apk',
        isPrimary: true,
      },
      'armeabi-v7a': {
        name: 'armeabi-v7a',
        description: 'Celulares antiguos (32-bit)',
        file: 'pilas-v1.1-beta.2-armeabi-v7a.apk',
        sizeBytes: 35229604,
        sha256: 'b5eb74cdb1b8e21609c9c10067f948b4125c57fa5043f552e376014e9340977a',
        url: '/downloads/pilas-v1.1-beta.2-armeabi-v7a.apk',
      },
      universal: {
        name: 'universal',
        description: 'Todas las arquitecturas',
        file: 'pilas-v1.1-beta.2-universal.apk',
        sizeBytes: 99424798,
        sha256: '9f5ba9c879b51b13c29491846673149174bfc004f2d9376fcbe7ad5eb4d04cbc',
        url: '/downloads/pilas-v1.1-beta.2-universal.apk',
      },
      x86_64: {
        name: 'x86_64',
        description: 'Emuladores y PCs (64-bit)',
        file: 'pilas-v1.1-beta.2-x86_64.apk',
        sizeBytes: 41588008,
        sha256: '999c710f32bb91922a1fc089d841e65d152e2c48888ef7482df6c24cbb394953',
        url: '/downloads/pilas-v1.1-beta.2-x86_64.apk',
      },
    },
  };

  it('debe pasar limpiamente con datos de release válidos y completos', () => {
    const errors = validateReleaseData(validBaseData);
    expect(errors).toHaveLength(0);
  });

  it('debe fallar si la versión del producto y del APK no coinciden y falta la nota explicativa', () => {
    const invalid = {
      ...validBaseData,
      version: '1.2.0',
      apkVersion: '1.1-beta.2',
      versionDiscrepancyNote: '',
    };
    const errors = validateReleaseData(invalid);
    expect(errors.some((e) => e.includes('Discrepancia detectada'))).toBe(true);
  });

  it('debe pasar si la versión del producto y del APK coinciden aunque la nota esté vacía', () => {
    const validSame = {
      ...validBaseData,
      version: '1.2.0',
      apkVersion: '1.2.0',
      versionDiscrepancyNote: '',
    };
    const errors = validateReleaseData(validSame);
    expect(errors).toHaveLength(0);
  });

  it('debe fallar si falta un hash SHA-256 o no tiene 64 caracteres hexadecimales', () => {
    const invalidHash = JSON.parse(JSON.stringify(validBaseData)) as ReleaseData;
    invalidHash.architectures!['arm64-v8a'].sha256 = 'abc123short';
    const errors = validateReleaseData(invalidHash);
    expect(errors.some((e) => e.includes('sha256') && e.includes('64 caracteres'))).toBe(true);
  });

  it('debe fallar si el hash SHA-256 contiene caracteres no hexadecimales', () => {
    const invalidChars = JSON.parse(JSON.stringify(validBaseData)) as ReleaseData;
    invalidChars.architectures!['arm64-v8a'].sha256 = 'z'.repeat(64);
    const errors = validateReleaseData(invalidChars);
    expect(errors.some((e) => e.includes('sha256') && e.includes('inválido'))).toBe(true);
  });

  it('debe fallar si falta alguna de las 4 arquitecturas requeridas', () => {
    const missingArch = JSON.parse(JSON.stringify(validBaseData)) as ReleaseData;
    delete missingArch.architectures!['armeabi-v7a'];
    const errors = validateReleaseData(missingArch);
    expect(errors.some((e) => e.includes("Falta la arquitectura requerida 'armeabi-v7a'"))).toBe(true);
  });

  it('debe fallar si falta showDownloadCount o count en downloads', () => {
    const missingDl = JSON.parse(JSON.stringify(validBaseData)) as ReleaseData;
    delete (missingDl.downloads as any).showDownloadCount;
    const errors = validateReleaseData(missingDl);
    expect(errors.some((e) => e.includes('showDownloadCount'))).toBe(true);
  });

  it('debe fallar si ninguna arquitectura está marcada como isPrimary: true', () => {
    const noPrimary = JSON.parse(JSON.stringify(validBaseData)) as ReleaseData;
    delete noPrimary.architectures!['arm64-v8a'].isPrimary;
    const errors = validateReleaseData(noPrimary);
    expect(errors.some((e) => e.includes('isPrimary'))).toBe(true);
  });
});
