import { describe, it, expect } from 'vitest';
import {
  decodePilasParam,
  encodePb2,
  fnv1a32,
  inspectPublicUrl,
  safeJsonScriptContent,
  stripNonLatinForOg,
} from '../src/lib/pilasCodec';
import { buildJuntaIcs, buildScheduleIcs, buildTaskIcs } from '../src/lib/pilasLinks/ics';
import { buildPublicOgMeta, sanitizeOgRenderFields } from '../src/lib/pilasLinks/og-meta';
import {
  SAMPLE_AMIGO_FRIEND,
  SAMPLE_AMIGO_MINE,
  SAMPLE_JUNTA,
  createSampleTarea,
} from '../src/lib/pilasLinks/sample-payloads';

describe('Generador RFC 5545 (.ics)', () => {
  const fixedRef = new Date('2026-11-11T15:00:00.000Z'); // Miércoles

  it('genera calendario semanal con CRLF, VTIMEZONE America/Guayaquil, RRULE BYDAY=MO y escape RFC 5545', () => {
    const ics = buildScheduleIcs(
      {
        ...SAMPLE_AMIGO_MINE,
        classes: [
          {
            ...SAMPLE_AMIGO_MINE.classes[0],
            s: 'Álgebra, Lógica; Conjuntos',
            r: 'Edificio C, Sala 1',
          },
        ],
      },
      fixedRef,
    );

    expect(ics.endsWith('\r\n')).toBe(true);
    const lines = ics.split('\r\n');
    expect(lines[0]).toBe('BEGIN:VCALENDAR');
    expect(lines).toContain('TZID:America/Guayaquil');
    expect(lines).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=16');
    expect(ics).toContain('Álgebra\\, Lógica\\; Conjuntos');
    expect(ics).toContain('LOCATION:Edificio C\\, Sala 1');

    for (const rawLine of lines) {
      expect(rawLine.length).toBeLessThanOrEqual(75);
    }
  });

  it('respeta privacidad en .ics cuando las materias están ocultas y omite LOCATION si no hay aula', () => {
    const ics = buildScheduleIcs(
      {
        ...SAMPLE_AMIGO_FRIEND,
        isPrivateMode: true,
        classes: SAMPLE_AMIGO_FRIEND.classes.map((c) => ({ ...c, s: '' })),
      },
      fixedRef,
    );
    expect(ics).toContain('Bloque ocupado');
    expect(
      ics.split('\r\n').some((line) => line.startsWith('LOCATION:')),
    ).toBe(false);
    expect(ics).not.toContain('Cálculo Vectorial');
    expect(ics).not.toContain('NRC:');
  });

  it('genera recordatorio de tarea en UTC-05 con alarmas -PT2H y -P1D y sin sufijo vacío si falta materia', () => {
    const task = {
      ...createSampleTarea(),
      dueDate: '2026-11-15T04:55:00.000Z', // 2026-11-14 23:55 ECT
    };
    const ics = buildTaskIcs(task, fixedRef);
    expect(ics).toContain('DTEND;TZID=America/Guayaquil:20261114T235500');
    expect(ics).toContain('TRIGGER:-PT2H');
    expect(ics).toContain('TRIGGER:-P1D');

    const noSubjectIcs = buildTaskIcs({ ...task, subject: '' }, fixedRef);
    expect(noSubjectIcs).toContain('SUMMARY:[Entrega] Deber 3: Cálculo Vectorial');
    expect(noSubjectIcs).not.toContain('Cálculo Vectorial · \r\n');
    expect(noSubjectIcs).not.toContain('Materia:');
  });

  it('genera invitación .ics de junta con rango exacto startAt..endAt y alarma -PT15M', () => {
    const ics = buildJuntaIcs(SAMPLE_JUNTA, fixedRef);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART;TZID=America/Guayaquil:20260618T100000');
    expect(ics).toContain('DTEND;TZID=America/Guayaquil:20260618T113000');
    expect(ics).toContain('TRIGGER:-PT15M');
    expect(ics).toContain('URL:https://meet.google.com/pil-asv2-edu');
    expect(ics).toContain('END:VCALENDAR');
  });
});

describe('Seguridad URL, JSON script e higiene Open Graph', () => {
  it('bloquea esquemas inseguros y limpia tokens Moodle de URLs externas', () => {
    expect(inspectPublicUrl('javascript:alert(1)')).toMatchObject({
      url: null,
      blocked: true,
    });
    expect(inspectPublicUrl('data:text/html,<script>x</script>').blocked).toBe(true);
    expect(inspectPublicUrl('vbscript:msgbox(1)').blocked).toBe(true);
    expect(inspectPublicUrl('https://user:pass@evil.example/path').blocked).toBe(true);

    const cleaned = inspectPublicUrl(
      'https://micampus.espe.edu.ec/course/view.php?id=42&wstoken=SECRET123&sesskey=XYZ&privatetoken=ABC',
    );
    expect(cleaned.blocked).toBe(false);
    expect(cleaned.strippedToken).toBe(true);
    expect(cleaned.isMoodleProtected).toBe(true);
    expect(cleaned.url).toBe('https://micampus.espe.edu.ec/course/view.php?id=42');
  });

  it('escapa caracteres peligrosos al serializar JSON dentro de <script type="application/json">', () => {
    const dangerous = { title: '</script><script>alert(1)</script>&\u2028' };
    const serialized = safeJsonScriptContent(dangerous);
    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003c/script\\u003e');
    expect(serialized).toContain('\\u0026');
  });

  it('genera metadatos OG privados sin inventar materias ocultas y remueve emojis para Satori', async () => {
    const token = await encodePb2({
      ...SAMPLE_AMIGO_FRIEND,
      isPrivateMode: true,
      classes: SAMPLE_AMIGO_FRIEND.classes.map((c) => ({ ...c, s: '', r: '', t: '' })),
    });
    const decoded = await decodePilasParam(token, 'amigo');
    const og = buildPublicOgMeta('amigo', decoded, 'https://pilas-ec.vercel.app', token);
    expect(og.badge).toContain('MODO PRIVADO');
    expect(og.description).toContain('Modo Privado');
    expect(og.description).not.toContain('Cálculo Vectorial');

    const withEmoji = sanitizeOgRenderFields({
      ...og,
      title: '⚡ Horario de Ana 😎 · ESPE',
      description: '🎓 Comparar huecos 🚀',
    });
    expect(withEmoji.title).toBe('Horario de Ana · ESPE');
    expect(withEmoji.description).toBe('Comparar huecos');
    expect(stripNonLatinForOg('⚡📚 Pilas!')).toBe('Pilas!');
    expect(fnv1a32('test-1')).not.toBe(fnv1a32('test-2'));
  });
});
