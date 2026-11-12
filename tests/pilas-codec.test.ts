import * as fflate from 'fflate';
import { describe, it, expect } from 'vitest';
import {
  base64UrlEncode,
  decodePilasParam,
  encodePb2,
  extractPilasParam,
  fnv1a32,
  MAX_DECODED_BYTES,
  MAX_INPUT_LENGTH,
  Pb2Reader,
  Pb2Writer,
  sanitizePublicUrl,
  type CursoPayload,
} from '../src/lib/pilasCodec';
import {
  DART_VM_VECTORS,
  SAMPLE_AMIGO_FRIEND,
  SAMPLE_AMIGO_MINE,
  SAMPLE_CURSO,
  SAMPLE_JUNTA,
  SAMPLE_MATERIALES,
  SAMPLE_TAREAS,
  createSampleTarea,
} from '../src/lib/pilasLinks/sample-payloads';
import { extractRawDFromUrl } from '../src/lib/pilasLinks/ssr-helpers';

describe('FNV-1a 32-bit Dart <-> JS parity', () => {
  it('reproduce exactamente los checksums de Dart VM sin desbordar 53 bits', () => {
    expect(fnv1a32('')).toBe(2166136261);
    expect(fnv1a32('ESPE|Matriz Sangolquí|2026')).toBe(2421859389);
  });
});

describe('Vectores reales generados por Dart VM (Paridad bit a bit 100%)', () => {
  it('Vector 1: decodifica /amigo PB2 compacto (3...) con privacidad de aulas OFF', async () => {
    const res = await decodePilasParam(DART_VM_VECTORS.amigoCompactVector1, 'amigo');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.format).toBe('pb2-raw');
    const p = res.payload;
    expect(p.friendName).toBe('Ana López');
    expect(p.university).toBe('ESPE');
    expect(p.campus).toBe('Matriz Sangolquí');
    expect(p.career).toBe('Ingeniería en Software');
    expect(p.period).toBe('202650');
    expect(p.level).toBe(5);
    expect(p.statusNote).toBe('Libre tardes · Bloque H');
    expect(p.isPrivateMode).toBe(false);
    expect(p.lastSharedAt).toBe('2026-06-15T14:30:00.000Z');
    expect(p.scheduleHash).toBe(2085043575);
    expect(p.classes).toHaveLength(3);
    expect(p.classes[0]).toMatchObject({
      s: 'Cálculo Vectorial',
      r: '',
      n: '4512',
      d: 1,
      i: 420,
      f: 540,
      m: 1,
    });
    expect(p.classes[1]).toMatchObject({
      s: 'Cálculo Vectorial',
      r: '',
      n: '4512',
      d: 3,
      i: 420,
      f: 540,
      m: 1,
    });
    expect(p.classes[2]).toMatchObject({
      s: 'Sistemas Operativos',
      r: '',
      n: '7820',
      d: 2,
      i: 600,
      f: 720,
      m: 2,
    });
  });

  it('Vector 2: decodifica /amigo PB2 extendido (3...) con minutos 07:13-08:47 y universidad/campus texto libre', async () => {
    const res = await decodePilasParam(DART_VM_VECTORS.amigoExtendedVector2, 'amigo');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const p = res.payload;
    expect(p.friendName).toBe('Mateo Ruiz');
    expect(p.university).toBe('Yachay Tech');
    expect(p.campus).toBe('Urcuquí');
    expect(p.career).toBe('Sistemas Inteligentes');
    expect(p.lastSharedAt).toBe('2026-06-16T09:00:00.000Z');
    expect(p.scheduleHash).toBe(3308072681);
    expect(p.classes[0]).toEqual({
      s: 'Laboratorio Redes',
      r: 'Bloque B-102',
      t: 'Dr. León',
      n: '9001',
      d: 4,
      i: 433,
      f: 527,
      m: 3,
    });
  });

  it('Vector 3: decodifica /amigo v1 legacy JSON + Gzip (H4sI...)', async () => {
    const res = await decodePilasParam(DART_VM_VECTORS.amigoV1LegacyVector3, 'amigo');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.format).toBe('v1-gzip');
    expect(res.payload.friendName).toBe('Mateo Ruiz');
    expect(res.payload.career).toBe('Sistemas Inteligentes');
    expect(res.payload.university).toBe('Yachay Tech');
    expect(res.payload.campus).toBe('Urcuquí');
    expect(res.payload.classes[0]).toEqual({
      s: 'Laboratorio Redes',
      r: 'Bloque B-102',
      t: 'Dr. León',
      n: '9001',
      d: 4,
      i: 433,
      f: 527,
      m: 3,
    });
  });

  it('Vector 4: decodifica /tarea PB2 Raw Deflate (2...)', async () => {
    const res = await decodePilasParam(DART_VM_VECTORS.tareaVector4, 'tarea');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.format).toBe('pb2-deflate');
    expect(res.payload).toMatchObject({
      title: 'Deber 3: Cálculo Vectorial',
      subject: 'Cálculo Vectorial',
      dueDate: '2026-06-20T23:55:00.000Z',
      createdAt: '2026-06-15T14:30:00.000Z',
      university: 'ESPE',
      author: 'Ana',
      description: 'Resolver guía ejercicios.pdf en parejas.',
      sourceUrl: 'https://micampusvirtual.espe.edu.ec/mod/assign/view.php?id=91',
    });
  });

  it('Vector 5: decodifica /tareas PB2 (3...) checklist con prioridades y metas', async () => {
    const res = await decodePilasParam(DART_VM_VECTORS.tareasVector5, 'tareas');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.format).toBe('pb2-raw');
    expect(res.payload).toMatchObject({
      title: 'Checklist Parcial 1',
      subject: 'Ingeniería en Software',
      author: 'Mateo',
      createdAt: '2026-06-15T14:30:00.000Z',
      items: [
        {
          title: 'Subir diagrama SRS.pdf',
          isPriority: true,
          dueDate: '2026-06-18T20:00:00.000Z',
        },
        {
          title: 'Revisar pruebas unitarias',
          isPriority: false,
          dueDate: null,
        },
      ],
    });
  });

  it('Vector 6: decodifica /materiales PB2 Raw Deflate (2...)', async () => {
    const res = await decodePilasParam(DART_VM_VECTORS.materialesVector6, 'materiales');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.format).toBe('pb2-deflate');
    expect(res.payload.courseId).toBe(1042);
    expect(res.payload.courseName).toBe('Estructuras de Datos');
    expect(res.payload.sectionName).toBe('Parcial 1');
    expect(res.payload.createdAt).toBe('2026-06-15T14:30:00.000Z');
    expect(res.payload.files).toEqual([
      {
        filename: 'Guia_Grafos.pdf',
        fileurl:
          'https://micampusvirtual.espe.edu.ec/webservice/pluginfile.php/1042/mod_resource/content/1/Guia_Grafos.pdf?forcedownload=1',
        filesize: 524288,
        mimetype: 'application/pdf',
      },
      {
        filename: 'Ejercicios_Arboles.pdf',
        fileurl: 'https://drive.google.com/file/d/1ABCxyz/view?usp=sharing',
        filesize: 1048576,
        mimetype: null,
      },
    ]);
  });

  it('Vector 7: decodifica /curso PB2 Raw Deflate (2...)', async () => {
    const res = await decodePilasParam(DART_VM_VECTORS.cursoVector7, 'curso');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.format).toBe('pb2-deflate');
    expect(res.payload).toMatchObject({
      courseId: 707,
      courseName: 'Sistemas Operativos',
      nrc: '8821',
      university: 'ESPE',
      campus: 'Matriz Sangolquí',
      teacher: 'MSc. Carla Cevallos',
      scheduleSummary: 'Mar/Jue 10:00-12:00',
      author: 'Carlos',
      whatsappUrl: 'https://chat.whatsapp.com/ABC123456',
      driveUrl: 'https://drive.google.com/drive/folders/SO2026',
      meetingUrl: 'https://meet.google.com/xyz-abcd-efg',
      customUrl: null,
      createdAt: '2026-06-15T14:30:00.000Z',
    });
  });

  it('Vector 8: decodifica /junta PB2 (3...)', async () => {
    const res = await decodePilasParam(DART_VM_VECTORS.juntaVector8, 'junta');
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.format).toBe('pb2-raw');
    expect(res.payload).toEqual({
      kind: 'junta',
      type: 6,
      title: 'Repaso Cálculo Parcial',
      startAt: '2026-06-18T15:00:00.000Z',
      endAt: '2026-06-18T16:30:00.000Z',
      durationMinutes: 90,
      isVirtual: true,
      location: null,
      meetingUrl: 'https://meet.google.com/pil-asv2-edu',
      organizer: 'Ana',
      campus: 'En Línea',
      notes: 'Traer ejercicios resueltos',
      participants: ['Mateo', 'Sofía', 'Luis'],
    });
  });
});

describe('Retrocompatibilidad v1 adicional y Diccionario DIC_PB2', () => {
  it('decodifica /tareas v1 JSON Base64Url plano { app: "esp", v: 1, ... }', async () => {
    const legacyList = {
      app: 'esp',
      v: 1,
      t: 'Proyecto Integrador',
      s: 'Redes',
      a: 'Mateo',
      c: '2026-06-15T14:30:00.000Z',
      it: [
        { n: 'Configurar VLAN', d: '2026-06-18T20:00:00.000Z', p: true },
        { n: 'Documentar topología', d: null, p: false },
      ],
    };
    const token = base64UrlEncode(new TextEncoder().encode(JSON.stringify(legacyList)));
    const res = await decodePilasParam(token, 'tareas');
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.format).toBe('v1-json');
    expect(res.payload.title).toBe('Proyecto Integrador');
    expect(res.payload.items).toEqual([
      { title: 'Configurar VLAN', isPriority: true, dueDate: '2026-06-18T20:00:00.000Z' },
      { title: 'Documentar topología', isPriority: false, dueDate: null },
    ]);
  });

  it('decodifica /materiales v1 JSON Gzip (H4sI...) y Zlib con tuplas f', async () => {
    const legacyMat = {
      cid: 2048,
      cn: 'Álgebra Lineal',
      sn: 'Unidad 2',
      ca: '2026-06-15T14:30:00.000Z',
      f: [
        [
          'Vectores.pdf',
          'https://micampus.espe.edu.ec/mod/resource/view.php?id=5&token=SECRET123',
          123456,
          'application/pdf',
        ],
      ],
    };
    const raw = new TextEncoder().encode(JSON.stringify(legacyMat));
    const gzipToken = base64UrlEncode(fflate.gzipSync(raw));
    expect(gzipToken.startsWith('H4sI')).toBe(true);

    const resGz = await decodePilasParam(gzipToken, 'materiales');
    expect(resGz.ok).toBe(true);
    if (resGz.ok) {
      expect(resGz.payload.courseId).toBe(2048);
      expect(resGz.payload.sectionName).toBe('Unidad 2');
      expect(resGz.payload.files[0].fileurl).toBe('https://micampus.espe.edu.ec/mod/resource/view.php?id=5');
      expect(resGz.payload.strippedTokenCount).toBe(1);
    }

    const zlibToken = base64UrlEncode(fflate.zlibSync(raw));
    const resZlib = await decodePilasParam(zlibToken, 'materiales');
    expect(resZlib.ok).toBe(true);
    if (resZlib.ok) {
      expect(resZlib.format).toBe('v1-zlib');
      expect(resZlib.payload.courseName).toBe('Álgebra Lineal');
    }
  });

  it('preserva tildes, eñes y \\n (0x0A) sin colisionar en DIC_PB2', () => {
    const w = new Pb2Writer();
    const texts = [
      'Cálculo Vectorial y Programación',
      'Line 1 con Software\nLine 2 con Laboratorio\nhttps://chat.whatsapp.com/XYZ',
    ];
    texts.forEach((t) => w.writeTokenString(t));
    const r = new Pb2Reader(w.toUint8Array());
    expect(r.readTokenString()).toBe(texts[0]);
    expect(r.readTokenString()).toBe(texts[1]);
  });

  it('hace round-trip completo de los 6 tipos con encodePb2 (compress true & false)', async () => {
    const payloads = [
      SAMPLE_AMIGO_FRIEND,
      SAMPLE_AMIGO_MINE,
      createSampleTarea(),
      SAMPLE_TAREAS,
      SAMPLE_MATERIALES,
      SAMPLE_CURSO,
      SAMPLE_JUNTA,
    ];
    for (const compress of [false, true]) {
      for (const p of payloads) {
        const token = await encodePb2(p, { compress });
        expect(token.startsWith(compress ? '2' : '3')).toBe(true);
        const decoded = await decodePilasParam(token, p.kind);
        expect(decoded.ok).toBe(true);
        if (decoded.ok) {
          expect(decoded.kind).toBe(p.kind);
        }
      }
    }
  });
});

describe('Seguridad, límites anti zip-bomb y saneamiento URL', () => {
  it('extrae ?d= de HTTPS, /a?d=, pilas://, query suelta, texto mixto y preserva + literal', () => {
    expect(extractPilasParam('https://pilas-ec.vercel.app/amigo?d=2AbC123&x=1')).toBe('2AbC123');
    expect(extractPilasParam('https://pilas-ec.vercel.app/a?d=3AbC123')).toBe('3AbC123');
    expect(extractPilasParam('pilas://tareas?d=3XYZ')).toBe('3XYZ');
    expect(extractPilasParam('pilas://curso?d=2XYZ')).toBe('2XYZ');
    expect(
      extractPilasParam('https://pilas-ec.vercel.app/amigo?d=3Ab+C/def==&utm=wa'),
    ).toBe('3Ab+C/def==');
    expect(
      extractPilasParam('Mira mi horario https://pilas-ec.vercel.app/amigo?d=2AbC%2B123 qué opinas?'),
    ).toBe('2AbC+123');
    expect(
      extractPilasParam('https://pilas-ec.vercel.app/amigo?d=3AbC\n123'),
    ).toBe('3AbC123');
    expect(
      extractRawDFromUrl(new URL('https://pilas-ec.vercel.app/amigo?d=H4sI+foo/bar==')),
    ).toBe('H4sI+foo/bar==');
  });

  it('rechaza entradas mayores a 16384 chars y zip-bombs > 131072 bytes', async () => {
    expect(await decodePilasParam('')).toMatchObject({ ok: false, code: 'EMPTY' });
    expect(await decodePilasParam('2' + 'A'.repeat(MAX_INPUT_LENGTH))).toMatchObject({
      ok: false,
      code: 'TOO_LARGE',
    });

    const bomb = new Uint8Array(MAX_DECODED_BYTES + 4096);
    bomb.fill(65);
    const bombToken = `2${base64UrlEncode(fflate.deflateSync(bomb))}`;
    expect(bombToken.length).toBeLessThan(MAX_INPUT_LENGTH);
    const res = await decodePilasParam(bombToken);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe('DECOMPRESSION_FAILED');
    }
  });

  it('bloquea javascript:, data:, vbscript: y elimina token/wstoken/privatetoken/sesskey/password/pass/key', async () => {
    expect(sanitizePublicUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizePublicUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizePublicUrl('vbscript:msgbox(1)')).toBeNull();
    expect(sanitizePublicUrl('https://user:pass@evil.example')).toBeNull();

    const dirtyUrl =
      'https://micampusvirtual.espe.edu.ec/file.php?id=9&token=1&wstoken=2&privatetoken=3&sesskey=4&password=5&pass=6&key=7&forcedownload=1';
    expect(sanitizePublicUrl(dirtyUrl)).toBe(
      'https://micampusvirtual.espe.edu.ec/file.php?id=9&forcedownload=1',
    );

    const maliciousCourse: CursoPayload = {
      ...SAMPLE_CURSO,
      whatsappUrl: 'javascript:alert(1)',
      driveUrl: 'https://drive.google.com/folders/123?token=leak&pass=123',
      meetingUrl: 'vbscript:bad',
      customUrl: 'data:text/plain,hack',
    };
    const token = await encodePb2(maliciousCourse);
    const decoded = await decodePilasParam(token, 'curso');
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.payload.whatsappUrl).toBeNull();
      expect(decoded.payload.driveUrl).toBe('https://drive.google.com/folders/123');
      expect(decoded.payload.meetingUrl).toBeNull();
      expect(decoded.payload.customUrl).toBeNull();
      expect(decoded.payload.blockedUrlCount).toBe(3);
    }

    const wrongKind = await decodePilasParam(DART_VM_VECTORS.tareaVector4, 'amigo');
    expect(wrongKind).toMatchObject({
      ok: false,
      code: 'UNEXPECTED_KIND',
      detectedKind: 'tarea',
    });
  });
});
