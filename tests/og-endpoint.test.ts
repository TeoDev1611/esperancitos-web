import { describe, it, expect } from 'vitest';
import { GET } from '../src/pages/api/og/[kind]';
import { encodePb2 } from '../src/lib/pilasCodec';
import { DART_VM_VECTORS, SAMPLE_JUNTA } from '../src/lib/pilasLinks/sample-payloads';

describe('Endpoint Open Graph dinámico (/api/og/[kind])', () => {
  it('renderiza PNG 1200x630 válido con vector real de Dart VM', async () => {
    const pairs = [
      ['amigo', DART_VM_VECTORS.amigoCompactVector1],
      ['a', DART_VM_VECTORS.amigoExtendedVector2],
      ['tarea', DART_VM_VECTORS.tareaVector4],
      ['tareas', DART_VM_VECTORS.tareasVector5],
      ['materiales', DART_VM_VECTORS.materialesVector6],
      ['curso', DART_VM_VECTORS.cursoVector7],
      ['junta', DART_VM_VECTORS.juntaVector8],
    ] as const;

    for (const [kind, token] of pairs) {
      const reqUrl = new URL(
        `https://pilas-ec.vercel.app/api/og/${kind}?d=${encodeURIComponent(token)}`,
      );
      const res = await GET({
        params: { kind },
        url: reqUrl,
      } as any);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('image/png');
      expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
      expect(res.headers.get('Referrer-Policy')).toBe('no-referrer');

      const buf = new Uint8Array(await res.arrayBuffer());
      expect(Array.from(buf.slice(0, 8))).toEqual([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      expect(buf.byteLength).toBeGreaterThan(5_000);
    }
  });

  it('soporta sufijo .png, ?d= vacío y devuelve PNG fallback si ?d= está dañado', async () => {
    const resEmpty = await GET({
      params: { kind: 'junta.png' },
      url: new URL('https://pilas-ec.vercel.app/api/og/junta.png'),
    } as any);
    expect(resEmpty.status).toBe(200);
    expect(resEmpty.headers.get('Content-Type')).toBe('image/png');

    const resCorrupt = await GET({
      params: { kind: 'tarea' },
      url: new URL('https://pilas-ec.vercel.app/api/og/tarea?d=2CORRUPTO'),
    } as any);
    expect(resCorrupt.status).toBe(200);
    expect(resCorrupt.headers.get('Content-Type')).toBe('image/png');
    const buf = new Uint8Array(await resCorrupt.arrayBuffer());
    expect(Array.from(buf.slice(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it('renderiza PNG válido con títulos largos, tildes/eñes y emojis filtrados sin desbordar', async () => {
    const token = await encodePb2({
      ...SAMPLE_JUNTA,
      title:
        '🚀 Sesión Intensiva de Arquitectura de Microservicios y Computación Distribuida Avanzada Para Ingeniería 🔥',
      location: 'Edificio Politécnico Central Bloque H Auditorio 302 Piso 3 Sangolquí',
      campus: 'Matriz Sangolquí',
    });
    const res = await GET({
      params: { kind: 'junta' },
      url: new URL(`https://pilas-ec.vercel.app/api/og/junta?d=${token}`),
    } as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(Array.from(buf.slice(0, 8))).toEqual([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
  });

  it('devuelve 404 para rutas OG no registradas', async () => {
    const res = await GET({
      params: { kind: 'desconocido' },
      url: new URL('https://pilas-ec.vercel.app/api/og/desconocido'),
    } as any);
    expect(res.status).toBe(404);
  });
});
