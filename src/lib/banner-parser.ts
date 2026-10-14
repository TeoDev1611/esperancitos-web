/**
 * Parser y utilidades para Horarios de Banner 9 de la Universidad ESPE
 * Convierte el PDF o texto extraído al formato estándar .pilas y genera el QR esp://friend
 */
import { deflate, gzip } from 'pako';

export interface ClaseItem {
  dia: 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB' | 'DOM';
  inicio: string; // "07:00"
  fin: string;    // "09:00"
  aula: string;   // "BLOQUE B SANGOLQUI - B415"
}

export interface MateriaItem {
  nrc: string;
  materia: string;
  codigo: string;
  docente: string;
  clases: ClaseItem[];
}

export interface PilasSchedule {
  version: number;
  app: string;
  estudiante: string;
  periodo: string;
  generadoEl: string;
  materias: MateriaItem[];
}

export interface QrClassItem {
  s: string;  // Subject name
  d: number;  // 1=LUN, 2=MAR, 3=MIE, 4=JUE, 5=VIE, 6=SAB, 7=DOM
  sh: number; // Start hour
  sm: number; // Start minute
  eh: number; // End hour
  em: number; // End minute
  r: string;  // Short room code, ej: "B415"
  nrc: string;// NRC de 5 dígitos
}

export interface QrPayload {
  v: number;
  n: string;
  c: QrClassItem[];
}

export const DIA_MAP: Record<string, { code: ClaseItem['dia']; num: number }> = {
  lunes: { code: 'LUN', num: 1 },
  martes: { code: 'MAR', num: 2 },
  miercoles: { code: 'MIE', num: 3 },
  miércoles: { code: 'MIE', num: 3 },
  jueves: { code: 'JUE', num: 4 },
  viernes: { code: 'VIE', num: 5 },
  sabado: { code: 'SAB', num: 6 },
  sábado: { code: 'SAB', num: 6 },
  domingo: { code: 'DOM', num: 7 },
  lun: { code: 'LUN', num: 1 },
  mar: { code: 'MAR', num: 2 },
  mie: { code: 'MIE', num: 3 },
  mié: { code: 'MIE', num: 3 },
  jue: { code: 'JUE', num: 4 },
  vie: { code: 'VIE', num: 5 },
  sab: { code: 'SAB', num: 6 },
  sáb: { code: 'SAB', num: 6 },
  dom: { code: 'DOM', num: 7 },
  monday: { code: 'LUN', num: 1 },
  tuesday: { code: 'MAR', num: 2 },
  wednesday: { code: 'MIE', num: 3 },
  thursday: { code: 'JUE', num: 4 },
  friday: { code: 'VIE', num: 5 },
  saturday: { code: 'SAB', num: 6 },
  sunday: { code: 'DOM', num: 7 },
  mon: { code: 'LUN', num: 1 },
  tue: { code: 'MAR', num: 2 },
  wed: { code: 'MIE', num: 3 },
  thu: { code: 'JUE', num: 4 },
  fri: { code: 'VIE', num: 5 },
  sat: { code: 'SAB', num: 6 },
  sun: { code: 'DOM', num: 7 },
};

export const DIA_REGEX = /\b(Lunes|Martes|Mi[eé]rcoles|Jueves|Viernes|S[aá]bado|Domingo|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Lun|Mar|Mi[eé]|Jue|Vie|S[aá]b|Dom|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/gi;
export const TIME_RANGE_REGEX = /\b([0-2]?\d:[0-5]\d(?:\s*[AaPp][Mm])?)\s*-\s*([0-2]?\d:[0-5]\d(?:\s*[AaPp][Mm])?)\b/;

/**
 * Expresión regular universal para cabecera de materia Banner 9 ESPE:
 * Soporta códigos de departamento de 2 a 6 letras (ej. CS, ID, EMEC, BIOT),
 * códigos de materia de 2 a 7 caracteres, secciones de 1 a 6 caracteres (ej. 0, 1, 101, A, L1),
 * créditos enteros o decimales, NRC de 4 a 6 dígitos y fechas flexibles (o en la línea siguiente).
 */
export const COURSE_HEADER_REGEX = /^(.*?)\s+([A-Z]{2,6})\s+([A-Z0-9]{2,7})\s+([A-Z0-9-]{1,6})\s+(\d+(?:[.,]\d+)?)\s+(\d{4,6})(?:\s+(\d{1,2}[-/][A-Za-z0-9]{2,4}[-/]\d{2,4}\s*-\s*\d{1,2}[-/][A-Za-z0-9]{2,4}[-/]\d{2,4}))?/i;
export const SPLIT_COURSE_HEADER_REGEX = /^([A-Z]{2,6})\s+([A-Z0-9]{2,7})\s+([A-Z0-9-]{1,6})\s+(\d+(?:[.,]\d+)?)\s+(\d{4,6})(?:\s+(\d{1,2}[-/][A-Za-z0-9]{2,4}[-/]\d{2,4}\s*-\s*\d{1,2}[-/][A-Za-z0-9]{2,4}[-/]\d{2,4}))?/i;

/**
 * Normaliza y redondea horas según las reglas de Banner:
 * Si los minutos terminan en :59 (ej. 14:59), redondea a la hora siguiente (ej. 15:00).
 * Soporta formato 24 horas y 12 horas AM/PM.
 */
export function normalizeTime(timeStr: string, isEndTime = false): { formatted: string; h: number; m: number } {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
  if (!match) return { formatted: timeStr, h: 0, m: 0 };
  let h = parseInt(match[1], 10);
  let m = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === 'PM' && h < 12) {
    h += 12;
  } else if (ampm === 'AM' && h === 12) {
    h = 0;
  }

  if (isEndTime && m === 59) {
    m = 0;
    h = (h + 1) % 24;
  }

  const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  return { formatted, h, m };
}

/**
 * Verifica si un texto contiene palabras clave institucionales de campus, bloques, talleres, laboratorios o aulas.
 * Cubre Matriz Sangolquí, Latacunga, Santo Domingo, IASA, extensiones y modalidades en línea.
 */
export function isAulaString(str: string): boolean {
  return /\b(ESPE|BLOQUE|EDIFICIO|LABORATORIO|LAB|AULA|CAMPUS|MATRIZ|SANGOLQUI|SANTO DOMINGO|LATACUNGA|IASA|HACIENDA|TALLER|COLISEO|CANCHA|GIMNASIO|AUDITORIO|SALA|MODULO|MÓDULO|VIRTUAL|ONLINE|EXTENSIÓN|CENTRO|SEDE)\b/i.test(str);
}

/**
 * Formatea nombres de docentes desde Banner (ej. 'DOCENTE DEMO, CARLOS ALBERTO' -> 'Carlos Alberto Docente Demo')
 * Limpia sufijos institucionales como (P), (S), (A), (T) y títulos profesionales si existen.
 */
export function formatDocente(raw: string): string {
  let cleaned = raw.replace(/\s*\([A-Za-z0-9]+\)\s*$/, '').trim();
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/^(?:ING|DR|DRA|MGTR|MSC|LIC|PHD|PROF|ABG)\.?\s+/i, '');

  if (cleaned.includes(',')) {
    const parts = cleaned.split(',').map(p => p.trim());
    if (parts.length >= 2 && parts[0] && parts[1]) {
      cleaned = `${parts[1]} ${parts[0]}`;
    }
  }

  return cleaned
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => {
      if (['de', 'del', 'la', 'las', 'los', 'y'].includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Normaliza el aula y extrae el identificador corto para el código QR
 */
export function normalizeAula(raw: string): { full: string; roomShort: string } {
  let cleaned = raw.replace(/\s+/g, ' ').trim();
  const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);

  let roomShort = '';
  let full = cleaned;

  if (parts.length >= 3) {
    const block = parts[1];
    const room = parts[2];
    full = `${block} - ${room}`;
    roomShort = room;
  } else if (parts.length === 2) {
    full = `${parts[0]} - ${parts[1]}`;
    roomShort = parts[1];
  } else {
    const match = cleaned.match(/([A-Z0-9]+-?[A-Z0-9]+)$/i);
    roomShort = match ? match[1] : cleaned;
  }

  // Extraer código corto limpio de aula (ej. B415, A102, G-402, LAB-01, 15, LR101A)
  const shortMatch = roomShort.match(/([A-Za-z]{1,4}[- ]?[0-9]{1,4}|LAB-[A-Za-z0-9-]+|[A-Z0-9]+-[A-Z0-9]+|[A-Za-z]\d{2,4}|\d{2,4})/);
  if (shortMatch) {
    roomShort = shortMatch[1].toUpperCase().replace(/\s+/, '-');
  }

  return { full, roomShort: roomShort || 'Aula' };
}


interface RawCourseHeader {
  title: string;
  subjCode: string;
  courseNum: string;
  section: string;
  credits: string;
  nrc: string;
  dateRange: string;
}

interface CourseChunk {
  header: RawCourseHeader;
  bodyLines: string[];
}

/**
 * Parsea el texto íntegro extraído de Banner 9 ESPE
 */
export function parseBannerSchedule(rawText: string): PilasSchedule {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  let estudiante = 'Estudiante ESPE';
  let periodo = '202651';

  // Extraer metadatos de cabecera general
  for (const line of lines) {
    // Formato Banner clásico: Horario ESTUDIANTE EJEMPLO, ALEX JAVIER PREGRADO S-II SEP 26 - FEB 27
    const horarioHeaderMatch = line.match(/^Horario\s+([A-ZÁÉÍÓÚÑ\s,]+?)\s+(?:PREGRADO|POSGRADO|GRADO|S-[I|V|X]+)/i);
    if (horarioHeaderMatch && horarioHeaderMatch[1].trim().length > 3) {
      estudiante = formatDocente(horarioHeaderMatch[1].trim());
      continue;
    }

    const estMatch = line.match(/(?:Estudiante|Alumno|Nombre(?:\s+del\s+Alumno)?):\s*([A-Za-zÁÉÍÓÚÑáéíóúñ\s,]+)/i);
    if (estMatch && estMatch[1].trim().length > 3) {
      estudiante = formatDocente(estMatch[1].trim());
      continue;
    }

    const perMatch = line.match(/(?:Periodo|T[eé]rmino):\s*(\d{6})/i);
    if (perMatch) {
      periodo = perMatch[1];
      continue;
    }

    const semMatch = line.match(/\b(S-[I|V|X]+\s+[A-Z]{3}\s*\d{2}\s*-\s*[A-Z]{3}\s*\d{2}|SEP\s*\d{2}\s*-\s*[A-Z]{3}\s*\d{2})\b/i);
    if (semMatch) {
      periodo = semMatch[1];
    }
  }

  // Fallback si no se encontró estudiante: buscar en las primeras 5 líneas nombre en formato APELLIDOS, NOMBRES
  if (estudiante === 'Estudiante ESPE') {
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const l = lines[i];
      if (/^[A-ZÁÉÍÓÚÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ]{2,})*,\s+[A-ZÁÉÍÓÚÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ]{2,})*$/.test(l)) {
        estudiante = formatDocente(l);
        break;
      }
    }
  }

  // Detectar bloques de materia
  const chunks: CourseChunk[] = [];
  let currentChunk: CourseChunk | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detenerse al llegar al resumen semanal de horas para evitar ruido del calendario gráfico
    if (/^Total de horas\s*\|/i.test(line)) {
      break;
    }

    // Ignorar encabezados repetidos de página y URLs de pie de página
    if (/^(Título\s+Detalles|https?:\/\/|Banner$|\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}\s+Banner)/i.test(line)) {
      continue;
    }

    const match = line.match(COURSE_HEADER_REGEX);
    if (match) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = {
        header: {
          title: match[1].trim(),
          subjCode: match[2].trim(),
          courseNum: match[3].trim(),
          section: match[4].trim(),
          credits: match[5].trim(),
          nrc: match[6].trim(),
          dateRange: match[7] ? match[7].trim() : '',
        },
        bodyLines: [],
      };
    } else {
      const splitMatch = line.match(SPLIT_COURSE_HEADER_REGEX);
      if (splitMatch) {
        let title = 'MATERIA';
        if (i > 0 && !lines[i - 1].match(TIME_RANGE_REGEX) && !lines[i - 1].match(DIA_REGEX) && !lines[i - 1].match(/^(Horario|Título|Total)/i)) {
          title = lines[i - 1];
        }
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = {
          header: {
            title: title.trim(),
            subjCode: splitMatch[1].trim(),
            courseNum: splitMatch[2].trim(),
            section: splitMatch[3].trim(),
            credits: splitMatch[4].trim(),
            nrc: splitMatch[5].trim(),
            dateRange: splitMatch[6] ? splitMatch[6].trim() : '',
          },
          bodyLines: [],
        };
      } else if (currentChunk) {
        currentChunk.bodyLines.push(line);
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  const materias: MateriaItem[] = [];

  for (const chunk of chunks) {
    const { header, bodyLines } = chunk;
    const clases: ClaseItem[] = [];
    let detectedDocente = '';

    // Buscar docente etiquetado explícitamente
    for (const line of bodyLines) {
      const profMatch = line.match(/(?:Profesor|Docente|Instructor):\s*([A-Za-zÁÉÍÓÚÑáéíóúñ\s,]+)/i);
      if (profMatch) {
        detectedDocente = formatDocente(profMatch[1]);
        break;
      }
    }

    interface ScheduleSubBlock {
      days: string[];
      timeRange: { start: string; end: string } | null;
      aula: string;
    }

    const subBlocks: ScheduleSubBlock[] = [];
    let currentSub: ScheduleSubBlock = {
      days: [],
      timeRange: null,
      aula: 'POR ASIGNAR',
    };

    const flushCurrentSub = () => {
      // Guardar el sub-bloque si tiene rango de hora y al menos un día definido
      if (currentSub.timeRange && currentSub.days.length > 0) {
        subBlocks.push(currentSub);
      }
      currentSub = {
        days: [],
        timeRange: null,
        aula: 'POR ASIGNAR',
      };
    };

    for (const rawLine of bodyLines) {
      let line = rawLine;

      // Ignorar cabeceras de tablas de Banner
      if (/^(Horario|D[ií]as?|Ubicaci[oó]n|Edificio|Aula|Tipo de Horario|Fecha)/i.test(line)) {
        continue;
      }

      // Si la línea contiene docente en formato APELLIDOS, NOMBRES que no es aula
      const docRegex = /\b([A-ZÁÉÍÓÚÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ]{2,})*,\s+[A-ZÁÉÍÓÚÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ]{2,})*(?:\s*\([Pp]\))?)\b/g;
      const docMatches = Array.from(line.matchAll(docRegex));
      for (const dm of docMatches) {
        if (!isAulaString(dm[1])) {
          if (!detectedDocente) {
            detectedDocente = formatDocente(dm[1]);
          }
          // Remover docente de la línea para no interferir con el aula
          line = line.replace(dm[0], ' ');
        }
      }

      const timeMatch = line.match(TIME_RANGE_REGEX);
      const dayMatches = Array.from(line.matchAll(DIA_REGEX)).map(m => m[1]);
      const hasAulaKeyword = isAulaString(line) && !line.match(COURSE_HEADER_REGEX) && !line.match(SPLIT_COURSE_HEADER_REGEX);

      // Si ya teníamos hora y encontramos nuevos días o una nueva hora, dividir sub-bloque
      if ((dayMatches.length > 0 || timeMatch) && currentSub.timeRange) {
        flushCurrentSub();
      }

      if (dayMatches.length > 0) {
        for (const d of dayMatches) {
          if (!currentSub.days.includes(d)) {
            currentSub.days.push(d);
          }
        }
      }

      if (timeMatch) {
        const startNorm = normalizeTime(timeMatch[1], false);
        const endNorm = normalizeTime(timeMatch[2], true);
        currentSub.timeRange = {
          start: startNorm.formatted,
          end: endNorm.formatted,
        };
      }

      if (hasAulaKeyword) {
        // Limpiar el texto del aula aislando la parte arquitectónica
        let aulaText = line;
        if (timeMatch) {
          aulaText = aulaText.replace(timeMatch[0], ' ');
        }
        aulaText = aulaText.replace(DIA_REGEX, ' ').trim();
        const { full } = normalizeAula(aulaText);
        currentSub.aula = full;
      }
    }

    flushCurrentSub();

    // Expandir clases por cada día del bloque
    for (const block of subBlocks) {
      if (!block.timeRange) continue;

      for (const dayStr of block.days) {
        const dayKey = dayStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const diaInfo = DIA_MAP[dayKey] || DIA_MAP['lunes'];

        clases.push({
          dia: diaInfo.code,
          inicio: block.timeRange.start,
          fin: block.timeRange.end,
          aula: block.aula,
        });
      }
    }

    materias.push({
      nrc: header.nrc,
      materia: header.title,
      codigo: `${header.subjCode} ${header.courseNum}`,
      docente: detectedDocente || 'Docente Por Asignar',
      clases,
    });
  }


  return {
    version: 1,
    app: 'pilas',
    estudiante,
    periodo,
    generadoEl: new Date().toISOString(),
    materias,
  };
}

/**
 * Convierte el objeto PilasSchedule al payload compacto para el QR de PWA
 */
export function generateQrPayload(schedule: PilasSchedule): QrPayload {
  const classes: QrClassItem[] = [];

  for (const m of schedule.materias) {
    for (const c of m.clases) {
      const dayKey = c.dia.toLowerCase();
      let dNum = 1;
      if (dayKey === 'mar') dNum = 2;
      else if (dayKey === 'mie') dNum = 3;
      else if (dayKey === 'jue') dNum = 4;
      else if (dayKey === 'vie') dNum = 5;
      else if (dayKey === 'sab') dNum = 6;
      else if (dayKey === 'dom') dNum = 7;

      const [shStr, smStr] = c.inicio.split(':');
      const [ehStr, emStr] = c.fin.split(':');

      const { roomShort } = normalizeAula(c.aula);

      classes.push({
        s: m.materia,
        d: dNum,
        sh: parseInt(shStr, 10) || 0,
        sm: parseInt(smStr, 10) || 0,
        eh: parseInt(ehStr, 10) || 0,
        em: parseInt(emStr, 10) || 0,
        r: roomShort,
        nrc: m.nrc,
      });
    }
  }

  return {
    v: 1,
    n: schedule.estudiante || 'Mi Horario',
    c: classes,
  };
}

/**
 * Convierte un Uint8Array a cadena Base64Url sin padding
 */
export function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Comprime el payload con deflate/gzip y produce la URI: esp://friend?d=...
 */
export function generateFriendQrProtocol(payload: QrPayload): string {
  const jsonStr = JSON.stringify(payload);
  // Usar deflate tal como se indica en la especificación
  const compressed = deflate(jsonStr);
  const base64url = uint8ArrayToBase64Url(compressed);
  return `esp://friend?d=${base64url}`;
}

/**
 * Descarga el archivo JSON con extensión .pilas
 */
export function downloadPilasFile(schedule: PilasSchedule, filename = 'horario_espe.pilas'): void {
  const jsonStr = JSON.stringify(schedule, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
