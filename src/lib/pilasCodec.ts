// ============================================================================
// PILAS! CODEC — Protocolo Binario PB2 + Retrocompatibilidad v1 (Dart VM Parity)
// Processing 100% cliente/edge zero-backend. NUNCA loggear ni persistir ?d=.
// ============================================================================

import * as fflate from 'fflate';

export const MAX_INPUT_LENGTH = 16_384;
export const MAX_DECODED_BYTES = 131_072; // 128 KB límite anti zip-bomb
export const EPOCH_BASE_SEC = 1_577_836_800; // 2020-01-01T00:00:00Z

export type PayloadKind =
  | 'amigo'
  | 'tarea'
  | 'tareas'
  | 'materiales'
  | 'curso'
  | 'junta';

export type CodecFormat =
  | 'pb2-raw'
  | 'pb2-deflate'
  | 'v1-gzip'
  | 'v1-zlib'
  | 'v1-json';

export type ModalityCode = 0 | 1 | 2 | 3;

export const MODALITY_LABELS: Record<ModalityCode, string> = {
  0: 'Por confirmar',
  1: 'Presencial',
  2: 'Virtual',
  3: 'Híbrida',
};

/**
 * Tabla de pre-compresión estática DIC_PB2 (idéntica byte a byte a Dart).
 * Nota: 0x0A NO está en el diccionario para preservar saltos de línea `\n`.
 */
export const DIC_PB2: Record<number, string> = {
  0x01: 'https://micampusvirtual.espe.edu.ec/',
  0x02: 'https://micampus.espe.edu.ec/',
  0x03: 'https://chat.whatsapp.com/',
  0x04: 'https://drive.google.com/',
  0x05: 'https://meet.google.com/',
  0x06: 'https://teams.microsoft.com/',
  0x07: 'https://',
  0x08: 'http://',
  0x09: 'Ingeniería en ',
  0x0b: 'Tecnologías de la ',
  0x0c: 'Programación ',
  0x0d: 'Laboratorio ',
  0x0e: 'Matemática ',
  0x0f: 'Fundamentos de ',
  0x10: 'Ecuaciones ',
  0x11: 'Arquitectura ',
  0x12: 'Cálculo ',
  0x13: 'Sistemas ',
  0x14: 'Software ',
  0x15: 'Bloque ',
  0x16: 'Edificio ',
  0x17: 'VIRTUAL',
  0x18: 'Campus ',
  0x19: 'Sangolquí',
  0x1a: 'Latacunga',
  0x1b: 'Santo Domingo',
  0x1c: 'Ing. ',
  0x1d: 'MSc. ',
  0x1e: 'Dr. ',
  0x1f: '.pdf',
};

export interface AmigoClassBlock {
  s: string;
  r: string;
  t: string;
  n: string;
  d: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  i: number;
  f: number;
  m: ModalityCode;
}

export interface AmigoPayload {
  kind: 'amigo';
  type: 1;
  friendName: string;
  university: string | null;
  campus: string | null;
  career: string | null;
  period: string | null;
  statusNote: string | null;
  level: number | null;
  isPrivateMode: boolean;
  lastSharedAt: string | null;
  scheduleHash: number;
  classes: AmigoClassBlock[];
}

export interface TareaPayload {
  kind: 'tarea';
  type: 2;
  title: string;
  subject: string;
  dueDate: string;
  createdAt: string;
  university: string | null;
  author: string | null;
  description: string | null;
  sourceUrl: string | null;
  hadStrippedToken?: boolean;
}

export interface TareasChecklistItem {
  title: string;
  isPriority: boolean;
  dueDate: string | null;
}

export interface TareasPayload {
  kind: 'tareas';
  type: 3;
  title: string;
  subject: string;
  author: string | null;
  createdAt: string;
  items: TareasChecklistItem[];
}

export interface MaterialFileItem {
  filename: string;
  fileurl: string | null;
  filesize: number;
  mimetype: string | null;
}

export interface MaterialesPayload {
  kind: 'materiales';
  type: 4;
  courseId: number;
  courseName: string;
  sectionName: string | null;
  createdAt: string;
  files: MaterialFileItem[];
  strippedTokenCount?: number;
  blockedUrlCount?: number;
  hasProtectedMoodleLinks?: boolean;
}

export interface CursoPayload {
  kind: 'curso';
  type: 5;
  courseId: number | null;
  courseName: string;
  university: string | null;
  campus: string | null;
  nrc: string | null;
  teacher: string | null;
  scheduleSummary: string | null;
  author: string | null;
  whatsappUrl: string | null;
  driveUrl: string | null;
  meetingUrl: string | null;
  customUrl: string | null;
  createdAt: string;
  blockedUrlCount?: number;
}

export interface JuntaPayload {
  kind: 'junta';
  type: 6;
  title: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  isVirtual: boolean;
  location: string | null;
  meetingUrl: string | null;
  organizer: string | null;
  campus: string | null;
  notes: string | null;
  participants: string[];
  hadBlockedUrl?: boolean;
}

export type AnyPilasPayload =
  | AmigoPayload
  | TareaPayload
  | TareasPayload
  | MaterialesPayload
  | CursoPayload
  | JuntaPayload;

export type DecodeErrorCode =
  | 'EMPTY'
  | 'TOO_LARGE'
  | 'UNKNOWN_FORMAT'
  | 'INVALID_BASE64'
  | 'DECOMPRESSION_FAILED'
  | 'INVALID_PAYLOAD'
  | 'UNEXPECTED_KIND';

export type DecodeResult<T extends AnyPilasPayload = AnyPilasPayload> =
  | {
    ok: true;
    format: CodecFormat;
    kind: T['kind'];
    payload: T;
  }
  | {
    ok: false;
    code: DecodeErrorCode;
    message: string;
    detectedKind?: PayloadKind;
  };

export class PilasCodecError extends Error {
  constructor(
    public readonly code: DecodeErrorCode,
    message: string,
    public readonly detectedKind?: PayloadKind,
  ) {
    super(message);
    this.name = 'PilasCodecError';
  }
}

const TYPE_TO_KIND: Record<number, PayloadKind> = {
  1: 'amigo',
  2: 'tarea',
  3: 'tareas',
  4: 'materiales',
  5: 'curso',
  6: 'junta',
};

const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const SENSITIVE_QUERY_KEYS = new Set([
  'token',
  'wstoken',
  'privatetoken',
  'private_token',
  'sesskey',
  'password',
  'pass',
  'passwd',
  'key',
  'moodlesession',
  'moodle_session',
]);

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { fatal: false });

// ----------------------------------------------------------------------------
// 1. Primitivas FNV-1a (Paridad Exacta Dart VM <-> JS), Saneamiento y Formato
// ----------------------------------------------------------------------------

/**
 * Checksum FNV-1a de 32 bits sin desbordar 53 bits en JS (paridad exacta Dart).
 */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  const bytes = textEncoder.encode(input);
  for (const byte of bytes) {
    hash = (hash ^ byte) >>> 0;
    const low = hash * 403;
    const high = (hash & 0xff) * 16777216;
    hash = (low + high) >>> 0;
  }
  return hash >>> 0;
}

export function safeText(input: unknown, maxLength = 240): string {
  if (input === null || input === undefined) return '';
  const cleaned = String(input)
    .replace(CONTROL_CHARS_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function safeMultilineText(input: unknown, maxLength = 600): string {
  if (input === null || input === undefined) return '';
  const cleaned = String(input)
    .replace(/\r\n/g, '\n')
    .replace(CONTROL_CHARS_RE, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export interface InspectedUrl {
  url: string | null;
  strippedToken: boolean;
  blocked: boolean;
  isMoodleProtected: boolean;
}

export function isMoodleProtectedUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    return (
      host.includes('micampus') ||
      host.includes('moodle') ||
      path.includes('pluginfile.php') ||
      path.includes('/webservice/')
    );
  } catch {
    return false;
  }
}

export function inspectPublicUrl(rawInput: unknown): InspectedUrl {
  if (typeof rawInput !== 'string') {
    const nonEmpty =
      rawInput !== undefined && rawInput !== null && String(rawInput).trim() !== '';
    return {
      url: null,
      strippedToken: false,
      blocked: nonEmpty,
      isMoodleProtected: false,
    };
  }

  const trimmed = rawInput.replace(CONTROL_CHARS_RE, '').trim();
  if (!trimmed) {
    return {
      url: null,
      strippedToken: false,
      blocked: false,
      isMoodleProtected: false,
    };
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return {
      url: null,
      strippedToken: false,
      blocked: true,
      isMoodleProtected: false,
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return {
        url: null,
        strippedToken: false,
        blocked: true,
        isMoodleProtected: false,
      };
    }
    if (parsed.username || parsed.password) {
      return {
        url: null,
        strippedToken: false,
        blocked: true,
        isMoodleProtected: false,
      };
    }

    let strippedToken = false;
    const toDelete: string[] = [];
    for (const key of parsed.searchParams.keys()) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
        toDelete.push(key);
      }
    }
    for (const key of toDelete) {
      parsed.searchParams.delete(key);
      strippedToken = true;
    }

    if (
      parsed.hash &&
      /(?:token|wstoken|privatetoken|sesskey|password|pass|key)=/i.test(parsed.hash)
    ) {
      parsed.hash = '';
      strippedToken = true;
    }

    const finalUrl = parsed.toString();
    return {
      url: finalUrl,
      strippedToken,
      blocked: false,
      isMoodleProtected: strippedToken || isMoodleProtectedUrl(finalUrl),
    };
  } catch {
    return {
      url: null,
      strippedToken: false,
      blocked: true,
      isMoodleProtected: false,
    };
  }
}

export function sanitizePublicUrl(rawInput: unknown): string | null {
  return inspectPublicUrl(rawInput).url;
}

export function stripNonLatinForOg(text: string): string {
  return safeText(text, 160)
    .replace(
      /[^\u0020-\u007E\u00A0-\u00FF\u0100-\u017F\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();
}

export function safeJsonScriptContent(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function formatMinutesHHMM(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.round(totalMinutes)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatFileSize(bytes?: number | null): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) {
    return 'Tamaño no indicado';
  }
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function normalizeModalityCode(raw: unknown): ModalityCode {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const code = Math.trunc(raw);
    if (code === 1 || code === 2 || code === 3) return code;
    return 0;
  }
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (s === '1' || s === 'p' || s === 'presencial') return 1;
  if (s === '2' || s === 'v' || s === 'virtual' || s === 'online' || s === 'en_linea') {
    return 2;
  }
  if (s === '3' || s === 'h' || s === 'hibrida' || s === 'híbrida' || s === 'hybrid') {
    return 3;
  }
  return 0;
}

export function modalityLabel(code: number | undefined | null): string {
  return MODALITY_LABELS[normalizeModalityCode(code)];
}

// ----------------------------------------------------------------------------
// 2. Base64Url Flexible + Descompresión Segura (Anti Zip-Bomb 128 KB)
// ----------------------------------------------------------------------------

export function base64UrlDecode(input: string): Uint8Array | null {
  const cleaned = input.trim().replace(/\s+/g, '');
  if (!cleaned) return null;

  const normalized = cleaned.replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    return null;
  }

  const mod = normalized.length % 4;
  if (mod === 1) return null;
  const padded =
    mod === 2
      ? `${normalized}==`
      : mod === 3
        ? `${normalized}=`
        : normalized;

  try {
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(padded, 'base64'));
    }
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      out[i] = bin.charCodeAt(i);
    }
    return out;
  } catch {
    return null;
  }
}

export function base64UrlEncode(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function decompressViaWebStream(
  bytes: Uint8Array,
  format: 'gzip' | 'deflate-raw' | 'deflate',
): Promise<Uint8Array> {
  const ds = new DecompressionStream(format);
  const writer = ds.writable.getWriter();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);

  const writePromise = writer.write(copy).then(() => writer.close());
  writePromise.catch(() => { });
  const reader = ds.readable.getReader();

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > MAX_DECODED_BYTES) {
        await reader.cancel('MAX_DECODED_BYTES_EXCEEDED');
        throw new PilasCodecError(
          'DECOMPRESSION_FAILED',
          'El enlace supera el límite de seguridad de 128 KB descomprimidos.',
        );
      }
      chunks.push(value);
    }
  }

  await writePromise;

  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function decompressViaFflate(
  bytes: Uint8Array,
  mode: 'gzip' | 'deflate-raw' | 'zlib',
): Uint8Array {
  const chunks: Uint8Array[] = [];
  let total = 0;
  let error: unknown = null;

  const onData = (chunk: Uint8Array, final: boolean) => {
    total += chunk.byteLength;
    if (total > MAX_DECODED_BYTES) {
      error = new PilasCodecError(
        'DECOMPRESSION_FAILED',
        'El enlace supera el límite de seguridad de 128 KB descomprimidos.',
      );
      throw error;
    }
    if (chunk.byteLength > 0) {
      chunks.push(chunk);
    }
    void final;
  };

  if (mode === 'gzip') {
    const gz = new fflate.Gunzip(onData);
    gz.push(bytes, true);
  } else if (mode === 'zlib') {
    const uz = new fflate.Unzlib(onData);
    uz.push(bytes, true);
  } else {
    const inf = new fflate.Inflate(onData);
    inf.push(bytes, true);
  }

  if (error) throw error;
  if (total === 0) {
    throw new PilasCodecError(
      'DECOMPRESSION_FAILED',
      'El contenido descomprimido resultó vacío.',
    );
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

export async function safeInflate(
  bytes: Uint8Array,
  mode: 'gzip' | 'deflate-raw' | 'zlib',
): Promise<Uint8Array> {
  if (bytes.byteLength === 0) {
    throw new PilasCodecError(
      'DECOMPRESSION_FAILED',
      'No hay bytes comprimidos para decodificar.',
    );
  }

  if (typeof DecompressionStream !== 'undefined') {
    const streamFmt = mode === 'zlib' ? 'deflate' : mode;
    try {
      const out = await decompressViaWebStream(bytes, streamFmt);
      if (out.byteLength === 0 || out.byteLength > MAX_DECODED_BYTES) {
        throw new PilasCodecError(
          'DECOMPRESSION_FAILED',
          'Tamaño descomprimido inválido.',
        );
      }
      return out;
    } catch (err) {
      if (err instanceof PilasCodecError && err.message.includes('128 KB')) {
        throw err;
      }
      // Fallback a fflate en Safari < 16.4 u otros runtimes sin deflate-raw
    }
  }

  const out = decompressViaFflate(bytes, mode);
  if (out.byteLength === 0 || out.byteLength > MAX_DECODED_BYTES) {
    throw new PilasCodecError(
      'DECOMPRESSION_FAILED',
      'El paquete supera el límite de seguridad de 128 KB.',
    );
  }
  return out;
}

export async function inflateRawBytes(bytes: Uint8Array): Promise<Uint8Array> {
  return safeInflate(bytes, 'deflate-raw');
}

export async function gunzipBytes(bytes: Uint8Array): Promise<Uint8Array> {
  return safeInflate(bytes, 'gzip');
}

export async function openEnvelope(
  rawD: string,
  expectedKind?: PayloadKind,
): Promise<{ encoding: CodecFormat; bytes: Uint8Array }> {
  const trimmed = rawD.trim();
  if (!trimmed) {
    throw new PilasCodecError('EMPTY', 'No se recibió ningún parámetro ?d=.');
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    throw new PilasCodecError(
      'TOO_LARGE',
      'El enlace supera el límite máximo permitido (16 384 caracteres).',
    );
  }

  // 1. v1 legacy Gzip JSON (`H4sI...`)
  if (trimmed.startsWith('H4sI')) {
    const compressed = base64UrlDecode(trimmed);
    if (!compressed) {
      throw new PilasCodecError('INVALID_BASE64', 'Base64Url v1 inválido.');
    }
    const bytes = await safeInflate(compressed, 'gzip');
    return { encoding: 'v1-gzip', bytes };
  }

  // 2. PB2 Raw Deflate (`2...`)
  if (trimmed.startsWith('2')) {
    const bodyB64 = trimmed.slice(1);
    const compressed = base64UrlDecode(bodyB64);
    if (!compressed) {
      throw new PilasCodecError('INVALID_BASE64', 'Trama Base64Url PB2 inválida.');
    }
    const bytes = await safeInflate(compressed, 'deflate-raw');
    return { encoding: 'pb2-deflate', bytes };
  }

  // 3. PB2 Uncompressed (`3...`)
  if (trimmed.startsWith('3')) {
    const bodyB64 = trimmed.slice(1);
    const bytes = base64UrlDecode(bodyB64);
    if (!bytes || bytes.byteLength === 0) {
      throw new PilasCodecError('INVALID_BASE64', 'Trama Base64Url PB2 sin comprimir inválida.');
    }
    if (bytes.byteLength > MAX_DECODED_BYTES) {
      throw new PilasCodecError('TOO_LARGE', 'El paquete binario excede 128 KB.');
    }
    return { encoding: 'pb2-raw', bytes };
  }

  // 4. Fallback /tareas JSON Base64Url plano (`{ app: 'esp', v: 1, ... }`)
  if (expectedKind === 'tareas') {
    const bytes = base64UrlDecode(trimmed);
    if (!bytes || bytes.byteLength === 0) {
      throw new PilasCodecError('UNKNOWN_FORMAT', 'Formato de checklist no reconocido.');
    }
    if (bytes.byteLength > MAX_DECODED_BYTES) {
      throw new PilasCodecError('TOO_LARGE', 'La checklist excede 128 KB.');
    }
    return { encoding: 'v1-json', bytes };
  }

  // 5. Fallback /materiales zlib deflate v1 (`eJ...`, cabecera zlib 0x78)
  if (expectedKind === 'materiales') {
    const raw = base64UrlDecode(trimmed);
    if (raw && raw.byteLength >= 2 && (raw[0] & 0x0f) === 8) {
      const bytes = await safeInflate(raw, 'zlib');
      return { encoding: 'v1-zlib', bytes };
    }
  }

  throw new PilasCodecError(
    'UNKNOWN_FORMAT',
    'Formato no reconocido. Se esperaba PB2 ("2..." o "3...") o v1 legacy ("H4sI...").',
  );
}

// ----------------------------------------------------------------------------
// 3. Lector Binario Exacto Pb2Reader + compactSecToDate
// ----------------------------------------------------------------------------

export function compactSecToDate(sec: number): Date {
  return new Date((sec + EPOCH_BASE_SEC) * 1000);
}

export class Pb2Reader {
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) { }

  get remaining(): number {
    return this.bytes.byteLength - this.offset;
  }

  private ensure(count: number): void {
    if (this.offset + count > this.bytes.byteLength) {
      throw new PilasCodecError(
        'INVALID_PAYLOAD',
        'El paquete binario PB2 está truncado o corrupto.',
      );
    }
  }

  readByte(): number {
    this.ensure(1);
    return this.bytes[this.offset++];
  }

  readUint16(): number {
    const b0 = this.readByte();
    const b1 = this.readByte();
    return b0 * 256 + b1;
  }

  readUint24(): number {
    const b0 = this.readByte();
    const b1 = this.readByte();
    const b2 = this.readByte();
    return b0 * 65_536 + b1 * 256 + b2;
  }

  readUint32(): number {
    const b0 = this.readByte();
    const b1 = this.readByte();
    const b2 = this.readByte();
    const b3 = this.readByte();
    return (b0 * 16_777_216 + b1 * 65_536 + b2 * 256 + b3) >>> 0;
  }

  readVarint(): number {
    let res = 0;
    let mult = 1;
    let count = 0;
    while (true) {
      const b = this.readByte();
      res += (b & 0x7f) * mult;
      if ((b & 0x80) === 0) return res;
      mult *= 128;
      if (++count > 7) {
        throw new PilasCodecError(
          'INVALID_PAYLOAD',
          'Entero varint inválido en el paquete PB2.',
        );
      }
    }
  }

  readTokenString(): string {
    const len = this.readVarint();
    if (len > MAX_DECODED_BYTES) {
      throw new PilasCodecError(
        'INVALID_PAYLOAD',
        'Cadena PB2 supera el límite permitido.',
      );
    }
    this.ensure(len);
    const slice = this.bytes.subarray(this.offset, this.offset + len);
    this.offset += len;

    if (len === 0) return '';

    const expanded: number[] = [];
    for (let i = 0; i < slice.length; i++) {
      const byte = slice[i];
      const replacement = DIC_PB2[byte];
      if (replacement !== undefined) {
        const repBytes = textEncoder.encode(replacement);
        for (let j = 0; j < repBytes.length; j++) {
          expanded.push(repBytes[j]);
        }
      } else {
        expanded.push(byte);
      }
    }

    return textDecoder.decode(new Uint8Array(expanded));
  }

  readCompactDateIso(): string {
    return compactSecToDate(this.readVarint()).toISOString();
  }
}

// ----------------------------------------------------------------------------
// 4. Decodificadores PB2 Exactos para Tipos 1..6 (`bytes[0] = type`)
// ----------------------------------------------------------------------------

function clampDay1To7(raw: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  if (raw >= 1 && raw <= 7) return raw as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  throw new PilasCodecError('INVALID_PAYLOAD', 'Día de semana fuera de rango (1..7).');
}

export function decodePb2Bytes(
  bytes: Uint8Array,
  expectedKind?: PayloadKind,
  format: 'pb2-raw' | 'pb2-deflate' = 'pb2-raw',
): DecodeResult {
  if (bytes.byteLength < 2) {
    return {
      ok: false,
      code: 'INVALID_PAYLOAD',
      message: 'El paquete binario PB2 está incompleto.',
    };
  }

  const r = new Pb2Reader(bytes);
  const type = r.readByte();
  const detectedKind = TYPE_TO_KIND[type];

  if (!detectedKind) {
    return {
      ok: false,
      code: 'INVALID_PAYLOAD',
      message: `Tipo de paquete PB2 desconocido (${type}).`,
    };
  }

  if (expectedKind && detectedKind !== expectedKind) {
    return {
      ok: false,
      code: 'UNEXPECTED_KIND',
      message: `Este enlace corresponde a "/${detectedKind}", no a "/${expectedKind}".`,
      detectedKind,
    };
  }

  try {
    const flags = r.readByte();

    // ---------------- Tipo 1: /amigo ----------------
    if (type === 1) {
      const friendName = safeText(r.readTokenString(), 120);
      const university =
        (flags & 0x01) !== 0
          ? safeText(r.readTokenString(), 100) || null
          : null;
      const campus =
        (flags & 0x04) !== 0
          ? safeText(r.readTokenString(), 100) || null
          : null;
      const career =
        (flags & 0x02) !== 0 ? safeText(r.readTokenString(), 140) || null : null;
      const period =
        (flags & 0x08) !== 0 ? safeText(r.readTokenString(), 40) || null : null;
      const statusNote =
        (flags & 0x10) !== 0 ? safeText(r.readTokenString(), 180) || null : null;
      const level = (flags & 0x80) !== 0 ? r.readByte() : null;
      const isPrivateMode = (flags & 0x20) !== 0;
      const extendedSlots = (flags & 0x40) !== 0;

      const lastSharedAt = r.readCompactDateIso();
      const scheduleHash = r.readUint32();

      const courseCount = r.readVarint();
      if (courseCount > 256) {
        throw new PilasCodecError('INVALID_PAYLOAD', 'Demasiadas materias en el paquete.');
      }

      const courses: Array<{
        s: string;
        r: string;
        t: string;
        n: string;
        m: ModalityCode;
      }> = [];

      for (let idx = 0; idx < courseCount; idx++) {
        courses.push({
          s: safeText(r.readTokenString(), 120),
          r: safeText(r.readTokenString(), 80),
          t: safeText(r.readTokenString(), 100),
          n: safeText(r.readTokenString(), 32),
          m: normalizeModalityCode(r.readByte()),
        });
      }

      const slotCount = r.readVarint();
      if (slotCount > 512) {
        throw new PilasCodecError('INVALID_PAYLOAD', 'Demasiados bloques en el horario.');
      }

      const classes: AmigoClassBlock[] = [];
      for (let idx = 0; idx < slotCount; idx++) {
        let dayOfWeek: number;
        let startMinutes: number;
        let endMinutes: number;
        let slotMod: number;
        let courseIdx: number;

        if (!extendedSlots) {
          const packed = r.readUint24();
          dayOfWeek = (packed >> 21) & 0x07;
          const s5 = (packed >> 13) & 0xff;
          const d5 = (packed >> 7) & 0x3f;
          startMinutes = 300 + s5 * 5;
          endMinutes = startMinutes + d5 * 5;
          slotMod = (packed >> 5) & 0x03;
          courseIdx = packed & 0x1f;
        } else {
          const dm = r.readByte();
          dayOfWeek = (dm >> 2) & 0x07;
          slotMod = dm & 0x03;
          startMinutes = r.readVarint();
          endMinutes = r.readVarint();
          courseIdx = r.readVarint();
        }

        const course = courses[courseIdx];
        if (!course) {
          throw new PilasCodecError(
            'INVALID_PAYLOAD',
            'Referencia de materia fuera de rango en PB2.',
          );
        }

        const effectiveModality = normalizeModalityCode(
          slotMod !== 0 ? slotMod : course.m,
        );

        classes.push({
          s: course.s,
          r: course.r,
          t: course.t,
          n: course.n,
          d: clampDay1To7(dayOfWeek),
          i: startMinutes,
          f: endMinutes,
          m: effectiveModality,
        });
      }

      const payload: AmigoPayload = {
        kind: 'amigo',
        type: 1,
        friendName,
        university: university ? safeText(university, 100) : null,
        campus: campus ? safeText(campus, 100) : null,
        career,
        period,
        statusNote,
        level,
        isPrivateMode,
        lastSharedAt,
        scheduleHash,
        classes,
      };
      return { ok: true, format, kind: 'amigo', payload };
    }

    // ---------------- Tipo 2: /tarea ----------------
    if (type === 2) {
      const title = safeText(r.readTokenString(), 180);
      const subject = safeText(r.readTokenString(), 140);
      const dueDate = r.readCompactDateIso();
      const createdAt = r.readCompactDateIso();
      const university =
        (flags & 0x08) !== 0
          ? safeText(r.readTokenString(), 100) || null
          : null;
      const author =
        (flags & 0x04) !== 0 ? safeText(r.readTokenString(), 100) || null : null;
      const description =
        (flags & 0x01) !== 0
          ? safeMultilineText(r.readTokenString(), 600) || null
          : null;
      const rawUrl = (flags & 0x02) !== 0 ? r.readTokenString() : '';
      const urlInfo = (flags & 0x02) !== 0 ? inspectPublicUrl(rawUrl) : null;

      if (!title) {
        throw new PilasCodecError('INVALID_PAYLOAD', 'La tarea no incluye título.');
      }

      const payload: TareaPayload = {
        kind: 'tarea',
        type: 2,
        title,
        subject,
        dueDate,
        createdAt,
        university: university ? safeText(university, 100) : null,
        author,
        description,
        sourceUrl: urlInfo ? urlInfo.url : null,
        ...(urlInfo?.strippedToken ? { hadStrippedToken: true } : {}),
      };
      return { ok: true, format, kind: 'tarea', payload };
    }

    // ---------------- Tipo 3: /tareas ----------------
    if (type === 3) {
      const title = safeText(r.readTokenString(), 180) || 'Checklist compartida';
      const subject = safeText(r.readTokenString(), 140);
      const author =
        (flags & 0x01) !== 0 ? safeText(r.readTokenString(), 100) || null : null;
      const createdAt = r.readCompactDateIso();
      const count = r.readVarint();
      if (count > 500) {
        throw new PilasCodecError('INVALID_PAYLOAD', 'Demasiados ítems en checklist.');
      }

      const items: TareasChecklistItem[] = [];
      for (let idx = 0; idx < count; idx++) {
        const itemFlags = r.readByte();
        const isPriority = (itemFlags & 0x01) !== 0;
        const hasDue = (itemFlags & 0x02) !== 0;
        const itemTitle = safeText(r.readTokenString(), 220);
        const dueDate = hasDue ? r.readCompactDateIso() : null;
        if (itemTitle) {
          items.push({ title: itemTitle, isPriority, dueDate });
        }
      }

      const payload: TareasPayload = {
        kind: 'tareas',
        type: 3,
        title,
        subject,
        author,
        createdAt,
        items,
      };
      return { ok: true, format, kind: 'tareas', payload };
    }

    // ---------------- Tipo 4: /materiales ----------------
    if (type === 4) {
      const courseId = r.readVarint();
      const courseName = safeText(r.readTokenString(), 160) || 'Curso';
      const sectionName =
        (flags & 0x01) !== 0 ? safeText(r.readTokenString(), 120) || null : null;
      const createdAt = r.readCompactDateIso();
      const fileCount = r.readVarint();
      if (fileCount > 500) {
        throw new PilasCodecError('INVALID_PAYLOAD', 'Demasiados archivos en el lote.');
      }

      const files: MaterialFileItem[] = [];
      let strippedTokenCount = 0;
      let blockedUrlCount = 0;
      let hasProtectedMoodleLinks = false;

      for (let idx = 0; idx < fileCount; idx++) {
        const itemFlags = r.readByte();
        const hasMime = (itemFlags & 0x01) !== 0;
        const filename = safeText(r.readTokenString(), 200);
        const rawUrl = r.readTokenString();
        const filesize = r.readVarint();
        const mimetype = hasMime ? safeText(r.readTokenString(), 100) || null : null;

        const checked = inspectPublicUrl(rawUrl);
        if (checked.strippedToken) strippedTokenCount++;
        if (checked.blocked) blockedUrlCount++;
        if (checked.isMoodleProtected) hasProtectedMoodleLinks = true;

        if (filename) {
          files.push({
            filename,
            fileurl: checked.url,
            filesize,
            mimetype,
          });
        }
      }

      const payload: MaterialesPayload = {
        kind: 'materiales',
        type: 4,
        courseId,
        courseName,
        sectionName,
        createdAt,
        files,
        ...(strippedTokenCount > 0 ? { strippedTokenCount } : {}),
        ...(blockedUrlCount > 0 ? { blockedUrlCount } : {}),
        ...(hasProtectedMoodleLinks ? { hasProtectedMoodleLinks: true } : {}),
      };
      return { ok: true, format, kind: 'materiales', payload };
    }

    // ---------------- Tipo 5: /curso ----------------
    if (type === 5) {
      const linkMask = r.readByte();
      const courseName = safeText(r.readTokenString(), 160) || 'Curso';
      const courseId = (flags & 0x40) !== 0 ? r.readVarint() : null;
      const createdAt = r.readCompactDateIso();
      const university =
        (flags & 0x01) !== 0
          ? safeText(r.readTokenString(), 100) || null
          : null;
      const campus =
        (flags & 0x02) !== 0
          ? safeText(r.readTokenString(), 100) || null
          : null;
      const nrc =
        (flags & 0x04) !== 0 ? safeText(r.readTokenString(), 40) || null : null;
      const teacher =
        (flags & 0x08) !== 0 ? safeText(r.readTokenString(), 100) || null : null;
      const scheduleSummary =
        (flags & 0x10) !== 0 ? safeText(r.readTokenString(), 180) || null : null;
      const author =
        (flags & 0x20) !== 0 ? safeText(r.readTokenString(), 100) || null : null;

      let blockedUrlCount = 0;
      const readUrlField = (bit: number): string | null => {
        if ((linkMask & bit) === 0) return null;
        const checked = inspectPublicUrl(r.readTokenString());
        if (checked.blocked) blockedUrlCount++;
        return checked.url;
      };

      const whatsappUrl = readUrlField(0x01);
      const driveUrl = readUrlField(0x02);
      const meetingUrl = readUrlField(0x04);
      const customUrl = readUrlField(0x08);

      const payload: CursoPayload = {
        kind: 'curso',
        type: 5,
        courseId,
        courseName,
        university: university ? safeText(university, 100) : null,
        campus: campus ? safeText(campus, 100) : null,
        nrc,
        teacher,
        scheduleSummary,
        author,
        whatsappUrl,
        driveUrl,
        meetingUrl,
        customUrl,
        createdAt,
        ...(blockedUrlCount > 0 ? { blockedUrlCount } : {}),
      };
      return { ok: true, format, kind: 'curso', payload };
    }

    // ---------------- Tipo 6: /junta ----------------
    const isVirtual = (flags & 0x01) !== 0;
    const title = safeText(r.readTokenString(), 180) || 'Reunión de estudio';
    const startDate = compactSecToDate(r.readVarint());
    const startAt = startDate.toISOString();
    const durationMinutes = r.readVarint();
    const endAt = new Date(
      startDate.getTime() + Math.max(5, durationMinutes) * 60_000,
    ).toISOString();
    const location =
      (flags & 0x02) !== 0 ? safeText(r.readTokenString(), 120) || null : null;
    const rawMeeting = (flags & 0x04) !== 0 ? r.readTokenString() : '';
    const meetingCheck =
      (flags & 0x04) !== 0 ? inspectPublicUrl(rawMeeting) : null;
    const organizer =
      (flags & 0x08) !== 0 ? safeText(r.readTokenString(), 100) || null : null;
    const campus =
      (flags & 0x10) !== 0
        ? safeText(r.readTokenString(), 100) || null
        : null;
    const notes =
      (flags & 0x20) !== 0
        ? safeMultilineText(r.readTokenString(), 400) || null
        : null;

    const participantCount = r.readVarint();
    if (participantCount > 200) {
      throw new PilasCodecError('INVALID_PAYLOAD', 'Demasiados participantes en la junta.');
    }
    const participants: string[] = [];
    for (let idx = 0; idx < participantCount; idx++) {
      const person = safeText(r.readTokenString(), 80);
      if (person) participants.push(person);
    }

    const payload: JuntaPayload = {
      kind: 'junta',
      type: 6,
      title,
      startAt,
      endAt,
      durationMinutes,
      isVirtual,
      location,
      meetingUrl: meetingCheck ? meetingCheck.url : null,
      organizer,
      campus: campus ? safeText(campus, 100) : null,
      notes,
      participants,
      ...(meetingCheck?.blocked ? { hadBlockedUrl: true } : {}),
    };
    return { ok: true, format, kind: 'junta', payload };
  } catch (err) {
    if (err instanceof PilasCodecError) {
      return {
        ok: false,
        code: err.code,
        message: err.message,
        detectedKind: err.detectedKind ?? detectedKind,
      };
    }
    return {
      ok: false,
      code: 'INVALID_PAYLOAD',
      message: 'No se pudo interpretar el contenido binario PB2.',
      detectedKind,
    };
  }
}

// ----------------------------------------------------------------------------
// 5. Decodificadores Retrocompatibles v1 Legacy (JSON Gzip / Zlib / Plano)
// ----------------------------------------------------------------------------

function parseLegacyTimestampIso(
  raw: unknown,
  fallbackIso: string | null = null,
): string | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (raw >= 1e12) {
      const dt = new Date(raw);
      return Number.isNaN(dt.getTime()) ? fallbackIso : dt.toISOString();
    }
    if (raw >= EPOCH_BASE_SEC) {
      const dt = new Date(raw * 1000);
      return Number.isNaN(dt.getTime()) ? fallbackIso : dt.toISOString();
    }
    if (raw >= 0) {
      return compactSecToDate(raw).toISOString();
    }
  }
  if (typeof raw === 'string' && raw.trim()) {
    const dt = new Date(raw.trim());
    if (!Number.isNaN(dt.getTime())) {
      return dt.toISOString();
    }
  }
  return fallbackIso;
}

function normalizeLegacyDay1To7(raw: unknown): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  if (typeof raw === 'number' && Number.isInteger(raw)) {
    if (raw >= 1 && raw <= 7) return raw as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    if (raw === 0) return 1;
  }
  const s = String(raw ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (s.startsWith('l')) return 1;
  if (s.startsWith('ma')) return 2;
  if (s.startsWith('mi') || s === 'x') return 3;
  if (s.startsWith('j')) return 4;
  if (s.startsWith('v')) return 5;
  if (s.startsWith('s')) return 6;
  if (s.startsWith('d')) return 7;
  return 1;
}

function decodeV1FriendJson(
  obj: Record<string, unknown>,
  expectedKind?: PayloadKind,
): DecodeResult {
  if (expectedKind && expectedKind !== 'amigo') {
    return {
      ok: false,
      code: 'UNEXPECTED_KIND',
      message: `Este enlace corresponde a "/amigo", no a "/${expectedKind}".`,
      detectedKind: 'amigo',
    };
  }

  const rawClasses = Array.isArray(obj.cl) ? obj.cl : [];
  const classes: AmigoClassBlock[] = [];

  for (const item of rawClasses) {
    if (!item || typeof item !== 'object') continue;
    const c = item as Record<string, unknown>;
    const startMin = typeof c.i === 'number' && Number.isFinite(c.i) ? Math.round(c.i) : 0;
    const endMin =
      typeof c.f === 'number' && Number.isFinite(c.f)
        ? Math.round(c.f)
        : startMin + 60;

    classes.push({
      s: safeText(c.s, 120),
      r: safeText(c.r, 80),
      t: safeText(c.t, 100),
      n: safeText(c.n, 32),
      d: normalizeLegacyDay1To7(c.d),
      i: startMin,
      f: endMin,
      m: normalizeModalityCode(c.m),
    });
  }

  const friendName = safeText(obj.fn, 120);
  const university = safeText(obj.uni, 100) || null;
  const campus = safeText(obj.cm, 100) || null;
  const career = safeText(obj.cr, 140) || null;
  const period = safeText(obj.pr, 40) || null;
  const statusNote = safeText(obj.st, 180) || null;
  const level =
    typeof obj.lvl === 'number' && Number.isFinite(obj.lvl)
      ? Math.trunc(obj.lvl)
      : null;
  const isPrivateMode = Boolean(obj.pm);
  const lastSharedAt = parseLegacyTimestampIso(obj.ls ?? obj.ts, null);
  const scheduleHash =
    typeof obj.h === 'number' && Number.isFinite(obj.h) ? obj.h >>> 0 : 0;

  return {
    ok: true,
    format: 'v1-gzip',
    kind: 'amigo',
    payload: {
      kind: 'amigo',
      type: 1,
      friendName,
      university,
      campus,
      career,
      period,
      statusNote,
      level,
      isPrivateMode,
      lastSharedAt,
      scheduleHash,
      classes,
    },
  };
}

function decodeV1MaterialsJson(
  obj: Record<string, unknown>,
  expectedKind: PayloadKind | undefined,
  format: 'v1-gzip' | 'v1-zlib',
): DecodeResult {
  if (expectedKind && expectedKind !== 'materiales') {
    return {
      ok: false,
      code: 'UNEXPECTED_KIND',
      message: `Este enlace corresponde a "/materiales", no a "/${expectedKind}".`,
      detectedKind: 'materiales',
    };
  }

  const rawFiles = Array.isArray(obj.f) ? obj.f : [];
  const files: MaterialFileItem[] = [];
  let strippedTokenCount = 0;
  let blockedUrlCount = 0;
  let hasProtectedMoodleLinks = false;

  for (const entry of rawFiles) {
    let filename = '';
    let rawUrl: unknown = '';
    let filesize = 0;
    let mimetype: string | null = null;

    if (Array.isArray(entry)) {
      filename = safeText(entry[0], 200);
      rawUrl = entry[1];
      filesize =
        typeof entry[2] === 'number' && Number.isFinite(entry[2])
          ? Math.max(0, Math.round(entry[2]))
          : 0;
      mimetype = entry[3] ? safeText(entry[3], 100) || null : null;
    } else if (entry && typeof entry === 'object') {
      const fObj = entry as Record<string, unknown>;
      filename = safeText(fObj.filename ?? fObj.name ?? fObj.fn, 200);
      rawUrl = fObj.fileurl ?? fObj.url ?? fObj.u;
      const sz = Number(fObj.filesize ?? fObj.size ?? 0);
      filesize = Number.isFinite(sz) && sz >= 0 ? Math.round(sz) : 0;
      mimetype = safeText(fObj.mimetype ?? fObj.mime, 100) || null;
    }

    if (!filename) continue;
    const checked = inspectPublicUrl(rawUrl);
    if (checked.strippedToken) strippedTokenCount++;
    if (checked.blocked) blockedUrlCount++;
    if (checked.isMoodleProtected) hasProtectedMoodleLinks = true;

    files.push({
      filename,
      fileurl: checked.url,
      filesize,
      mimetype,
    });
  }

  const courseId =
    typeof obj.cid === 'number' && Number.isFinite(obj.cid)
      ? Math.max(0, Math.trunc(obj.cid))
      : 0;
  const courseName = safeText(obj.cn, 160) || 'Curso';
  const sectionName = safeText(obj.sn, 120) || null;
  const createdAt =
    parseLegacyTimestampIso(obj.ca, new Date(EPOCH_BASE_SEC * 1000).toISOString()) ??
    new Date(EPOCH_BASE_SEC * 1000).toISOString();

  return {
    ok: true,
    format,
    kind: 'materiales',
    payload: {
      kind: 'materiales',
      type: 4,
      courseId,
      courseName,
      sectionName,
      createdAt,
      files,
      ...(strippedTokenCount > 0 ? { strippedTokenCount } : {}),
      ...(blockedUrlCount > 0 ? { blockedUrlCount } : {}),
      ...(hasProtectedMoodleLinks ? { hasProtectedMoodleLinks: true } : {}),
    },
  };
}

function decodeV1ChecklistJson(
  obj: Record<string, unknown>,
  expectedKind?: PayloadKind,
  format: 'v1-json' | 'v1-gzip' = 'v1-json',
): DecodeResult {
  if (expectedKind && expectedKind !== 'tareas') {
    return {
      ok: false,
      code: 'UNEXPECTED_KIND',
      message: `Este enlace corresponde a "/tareas", no a "/${expectedKind}".`,
      detectedKind: 'tareas',
    };
  }

  if (obj.app !== 'esp' && !Array.isArray(obj.it)) {
    return {
      ok: false,
      code: 'INVALID_PAYLOAD',
      message: 'Estructura de checklist v1 no válida.',
      detectedKind: 'tareas',
    };
  }

  const rawItems = Array.isArray(obj.it) ? obj.it : [];
  const items: TareasChecklistItem[] = [];
  for (const item of rawItems) {
    if (!item || typeof item !== 'object') continue;
    const it = item as Record<string, unknown>;
    const title = safeText(it.n, 220);
    if (!title) continue;
    items.push({
      title,
      isPriority: Boolean(it.p),
      dueDate: parseLegacyTimestampIso(it.d, null),
    });
  }

  const title = safeText(obj.t, 180) || 'Checklist compartida';
  const subject = safeText(obj.s, 140);
  const author = safeText(obj.a, 100) || null;
  const createdAt =
    parseLegacyTimestampIso(obj.c, new Date(EPOCH_BASE_SEC * 1000).toISOString()) ??
    new Date(EPOCH_BASE_SEC * 1000).toISOString();

  return {
    ok: true,
    format,
    kind: 'tareas',
    payload: {
      kind: 'tareas',
      type: 3,
      title,
      subject,
      author,
      createdAt,
      items,
    },
  };
}

function decodeV1JsonBytes(
  bytes: Uint8Array,
  expectedKind: PayloadKind | undefined,
  format: 'v1-gzip' | 'v1-zlib' | 'v1-json',
): DecodeResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(textDecoder.decode(bytes));
  } catch {
    return {
      ok: false,
      code: 'INVALID_PAYLOAD',
      message: 'El contenido JSON v1 está dañado o incompleto.',
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      code: 'INVALID_PAYLOAD',
      message: 'Estructura JSON v1 inválida.',
    };
  }

  const obj = parsed as Record<string, unknown>;

  if (format === 'v1-json' || obj.app === 'esp' || Array.isArray(obj.it)) {
    return decodeV1ChecklistJson(
      obj,
      expectedKind,
      format === 'v1-json' ? 'v1-json' : 'v1-gzip',
    );
  }

  if (Array.isArray(obj.f) && ('cn' in obj || 'cid' in obj)) {
    return decodeV1MaterialsJson(
      obj,
      expectedKind,
      format === 'v1-zlib' ? 'v1-zlib' : 'v1-gzip',
    );
  }

  if ('fn' in obj || Array.isArray(obj.cl)) {
    return decodeV1FriendJson(obj, expectedKind);
  }

  return {
    ok: false,
    code: 'INVALID_PAYLOAD',
    message: 'No se pudo identificar el esquema v1 del enlace.',
  };
}

// ----------------------------------------------------------------------------
// 6. API Pública: extractPilasParam + decodePilasParam
// ----------------------------------------------------------------------------

/**
 * Extrae el valor `?d=...` si el estudiante pega una URL completa
 * (`https://pilas-ec.vercel.app/amigo?d=...`, `/a?d=...`, `pilas://friend?d=...`)
 * o directamente el token codificado.
 */
export function extractPilasParam(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';

  // Extraer ?d= / &d= / #d= directamente antes de usar URLSearchParams para
  // preservar signos '+' literales y tolerar URLs partidas en múltiples líneas.
  const directMatch = trimmed.match(/(?:^|[?&#])d=([^&#]+)/i);
  if (directMatch?.[1]) {
    const candidate =
      directMatch[1].replace(/[\r\n]+/g, '').split(/[ \t]/)[0] ?? '';
    if (candidate) {
      try {
        return decodeURIComponent(candidate).replace(/\s+/g, '').trim();
      } catch {
        return candidate.replace(/\s+/g, '').trim();
      }
    }
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const d = parsed.searchParams.get('d');
      if (d) return d.replace(/\s+/g, '').trim();
    } catch {
      // fallback a token directo
    }
  }

  return trimmed.replace(/\s+/g, '');
}

export async function decodePilasParam<
  K extends PayloadKind | undefined = undefined,
>(
  rawInput: string | null | undefined,
  expectedKind?: K,
): Promise<
  K extends PayloadKind
  ? DecodeResult<Extract<AnyPilasPayload, { kind: K }>>
  : DecodeResult<AnyPilasPayload>
> {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    return {
      ok: false,
      code: 'EMPTY',
      message: 'No se recibió ningún parámetro ?d= en el enlace.',
    } as any;
  }

  const rawD = extractPilasParam(rawInput);
  if (!rawD) {
    return {
      ok: false,
      code: 'EMPTY',
      message: 'El enlace no contiene un bloque ?d= válido.',
    } as any;
  }

  try {
    const { encoding, bytes } = await openEnvelope(rawD, expectedKind);

    if (encoding === 'pb2-raw' || encoding === 'pb2-deflate') {
      return decodePb2Bytes(bytes, expectedKind, encoding) as any;
    }

    return decodeV1JsonBytes(bytes, expectedKind, encoding) as any;
  } catch (err) {
    if (err instanceof PilasCodecError) {
      return {
        ok: false,
        code: err.code,
        message: err.message,
        detectedKind: err.detectedKind,
      } as any;
    }
    return {
      ok: false,
      code: 'DECOMPRESSION_FAILED',
      message: 'No se pudo abrir o descomprimir el paquete del enlace.',
    } as any;
  }
}

// ----------------------------------------------------------------------------
// 7. Codificador PB2 Compatible Dart (Útil para demos y tests round-trip)
// ----------------------------------------------------------------------------

const DIC_ENCODE_ENTRIES = Object.entries(DIC_PB2)
  .map(([code, phrase]) => ({ code: Number(code), phrase }))
  .sort((a, b) => b.phrase.length - a.phrase.length);

export class Pb2Writer {
  private readonly buf: number[] = [];

  writeByte(v: number): void {
    this.buf.push(v & 0xff);
  }

  writeUint24(v: number): void {
    const u = v >>> 0;
    this.buf.push((u >>> 16) & 0xff, (u >>> 8) & 0xff, u & 0xff);
  }

  writeUint32(v: number): void {
    const u = v >>> 0;
    this.buf.push(
      (u >>> 24) & 0xff,
      (u >>> 16) & 0xff,
      (u >>> 8) & 0xff,
      u & 0xff,
    );
  }

  writeVarint(v: number): void {
    let n = Math.max(0, Math.floor(v));
    while (n >= 0x80) {
      this.buf.push((n & 0x7f) | 0x80);
      n = Math.floor(n / 128);
    }
    this.buf.push(n & 0x7f);
  }

  writeTokenString(str: string | null | undefined): void {
    if (!str) {
      this.writeVarint(0);
      return;
    }
    const out: number[] = [];
    let idx = 0;
    while (idx < str.length) {
      let matched = false;
      for (const entry of DIC_ENCODE_ENTRIES) {
        if (str.startsWith(entry.phrase, idx)) {
          out.push(entry.code);
          idx += entry.phrase.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        const cp = str.codePointAt(idx)!;
        const ch = String.fromCodePoint(cp);
        const bytes = textEncoder.encode(ch);
        for (let i = 0; i < bytes.length; i++) {
          out.push(bytes[i]);
        }
        idx += ch.length;
      }
    }
    this.writeVarint(out.length);
    for (let i = 0; i < out.length; i++) {
      this.buf.push(out[i]);
    }
  }

  writeCompactDateIso(iso: string | null | undefined): void {
    const ms = iso ? Date.parse(iso) : Date.now();
    const sec = Math.max(
      0,
      Math.round((Number.isNaN(ms) ? Date.now() : ms) / 1000) - EPOCH_BASE_SEC,
    );
    this.writeVarint(sec);
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buf);
  }
}

export async function encodePb2(
  payload: AnyPilasPayload,
  options: { compress?: boolean } = {},
): Promise<string> {
  const compress = options.compress ?? true;
  const w = new Pb2Writer();

  if (payload.kind === 'amigo') {
    const uniqueCourses: Array<{
      s: string;
      r: string;
      t: string;
      n: string;
      m: ModalityCode;
    }> = [];
    const courseMap = new Map<string, number>();

    const slotIndexes = payload.classes.map((blk) => {
      const key = `${blk.s}\0${blk.r}\0${blk.t}\0${blk.n}\0${blk.m}`;
      let cIdx = courseMap.get(key);
      if (cIdx === undefined) {
        cIdx = uniqueCourses.length;
        courseMap.set(key, cIdx);
        uniqueCourses.push({
          s: blk.s,
          r: blk.r,
          t: blk.t,
          n: blk.n,
          m: blk.m,
        });
      }
      return cIdx;
    });

    const extendedSlots = payload.classes.some((blk, idx) => {
      const dur = blk.f - blk.i;
      return (
        slotIndexes[idx] >= 31 ||
        blk.i < 300 ||
        blk.i > 300 + 255 * 5 ||
        blk.i % 5 !== 0 ||
        dur < 0 ||
        dur > 63 * 5 ||
        dur % 5 !== 0
      );
    });

    const flags =
      (payload.university ? 0x01 : 0) |
      (payload.career ? 0x02 : 0) |
      (payload.campus ? 0x04 : 0) |
      (payload.period ? 0x08 : 0) |
      (payload.statusNote ? 0x10 : 0) |
      (payload.isPrivateMode ? 0x20 : 0) |
      (extendedSlots ? 0x40 : 0) |
      (payload.level !== null && payload.level !== undefined ? 0x80 : 0);

    w.writeByte(1);
    w.writeByte(flags);
    w.writeTokenString(payload.friendName);
    if (flags & 0x01) w.writeTokenString(payload.university);
    if (flags & 0x04) w.writeTokenString(payload.campus);
    if (flags & 0x02) w.writeTokenString(payload.career);
    if (flags & 0x08) w.writeTokenString(payload.period);
    if (flags & 0x10) w.writeTokenString(payload.statusNote);
    if (flags & 0x80) w.writeByte(payload.level ?? 0);
    w.writeCompactDateIso(payload.lastSharedAt);
    w.writeUint32(payload.scheduleHash ?? 0);

    w.writeVarint(uniqueCourses.length);
    for (const c of uniqueCourses) {
      w.writeTokenString(c.s);
      w.writeTokenString(c.r);
      w.writeTokenString(c.t);
      w.writeTokenString(c.n);
      w.writeByte(c.m);
    }

    w.writeVarint(payload.classes.length);
    payload.classes.forEach((blk, idx) => {
      const cIdx = slotIndexes[idx];
      if (!extendedSlots) {
        const s5 = Math.floor((blk.i - 300) / 5);
        const d5 = Math.floor((blk.f - blk.i) / 5);
        const packed =
          ((blk.d & 0x07) << 21) |
          ((s5 & 0xff) << 13) |
          ((d5 & 0x3f) << 7) |
          ((blk.m & 0x03) << 5) |
          (cIdx & 0x1f);
        w.writeUint24(packed);
      } else {
        const dm = ((blk.d & 0x07) << 2) | (blk.m & 0x03);
        w.writeByte(dm);
        w.writeVarint(blk.i);
        w.writeVarint(blk.f);
        w.writeVarint(cIdx);
      }
    });
  } else if (payload.kind === 'tarea') {
    const flags =
      (payload.description ? 0x01 : 0) |
      (payload.sourceUrl ? 0x02 : 0) |
      (payload.author ? 0x04 : 0) |
      (payload.university ? 0x08 : 0);

    w.writeByte(2);
    w.writeByte(flags);
    w.writeTokenString(payload.title);
    w.writeTokenString(payload.subject);
    w.writeCompactDateIso(payload.dueDate);
    w.writeCompactDateIso(payload.createdAt);
    if (flags & 0x08) w.writeTokenString(payload.university);
    if (flags & 0x04) w.writeTokenString(payload.author);
    if (flags & 0x01) w.writeTokenString(payload.description);
    if (flags & 0x02) w.writeTokenString(payload.sourceUrl);
  } else if (payload.kind === 'tareas') {
    const flags = payload.author ? 0x01 : 0;
    w.writeByte(3);
    w.writeByte(flags);
    w.writeTokenString(payload.title);
    w.writeTokenString(payload.subject);
    if (flags & 0x01) w.writeTokenString(payload.author);
    w.writeCompactDateIso(payload.createdAt);
    w.writeVarint(payload.items.length);
    for (const item of payload.items) {
      const itemFlags =
        (item.isPriority ? 0x01 : 0) | (item.dueDate ? 0x02 : 0);
      w.writeByte(itemFlags);
      w.writeTokenString(item.title);
      if (itemFlags & 0x02) w.writeCompactDateIso(item.dueDate);
    }
  } else if (payload.kind === 'materiales') {
    const flags = payload.sectionName ? 0x01 : 0;
    w.writeByte(4);
    w.writeByte(flags);
    w.writeVarint(payload.courseId);
    w.writeTokenString(payload.courseName);
    if (flags & 0x01) w.writeTokenString(payload.sectionName);
    w.writeCompactDateIso(payload.createdAt);
    w.writeVarint(payload.files.length);
    for (const f of payload.files) {
      const itemFlags = f.mimetype ? 0x01 : 0;
      w.writeByte(itemFlags);
      w.writeTokenString(f.filename);
      w.writeTokenString(f.fileurl ?? '');
      w.writeVarint(f.filesize);
      if (itemFlags & 0x01) w.writeTokenString(f.mimetype);
    }
  } else if (payload.kind === 'curso') {
    const flags =
      (payload.university ? 0x01 : 0) |
      (payload.campus ? 0x02 : 0) |
      (payload.nrc ? 0x04 : 0) |
      (payload.teacher ? 0x08 : 0) |
      (payload.scheduleSummary ? 0x10 : 0) |
      (payload.author ? 0x20 : 0) |
      (payload.courseId !== null && payload.courseId !== undefined ? 0x40 : 0);
    const linkMask =
      (payload.whatsappUrl ? 0x01 : 0) |
      (payload.driveUrl ? 0x02 : 0) |
      (payload.meetingUrl ? 0x04 : 0) |
      (payload.customUrl ? 0x08 : 0);

    w.writeByte(5);
    w.writeByte(flags);
    w.writeByte(linkMask);
    w.writeTokenString(payload.courseName);
    if (flags & 0x40) w.writeVarint(payload.courseId ?? 0);
    w.writeCompactDateIso(payload.createdAt);
    if (flags & 0x01) w.writeTokenString(payload.university);
    if (flags & 0x02) w.writeTokenString(payload.campus);
    if (flags & 0x04) w.writeTokenString(payload.nrc);
    if (flags & 0x08) w.writeTokenString(payload.teacher);
    if (flags & 0x10) w.writeTokenString(payload.scheduleSummary);
    if (flags & 0x20) w.writeTokenString(payload.author);
    if (linkMask & 0x01) w.writeTokenString(payload.whatsappUrl);
    if (linkMask & 0x02) w.writeTokenString(payload.driveUrl);
    if (linkMask & 0x04) w.writeTokenString(payload.meetingUrl);
    if (linkMask & 0x08) w.writeTokenString(payload.customUrl);
  } else {
    const flags =
      (payload.isVirtual ? 0x01 : 0) |
      (payload.location ? 0x02 : 0) |
      (payload.meetingUrl ? 0x04 : 0) |
      (payload.organizer ? 0x08 : 0) |
      (payload.campus ? 0x10 : 0) |
      (payload.notes ? 0x20 : 0);

    w.writeByte(6);
    w.writeByte(flags);
    w.writeTokenString(payload.title);
    w.writeCompactDateIso(payload.startAt);
    w.writeVarint(payload.durationMinutes);
    if (flags & 0x02) w.writeTokenString(payload.location);
    if (flags & 0x04) w.writeTokenString(payload.meetingUrl);
    if (flags & 0x08) w.writeTokenString(payload.organizer);
    if (flags & 0x10) w.writeTokenString(payload.campus);
    if (flags & 0x20) w.writeTokenString(payload.notes);
    w.writeVarint(payload.participants.length);
    for (const p of payload.participants) {
      w.writeTokenString(p);
    }
  }

  const raw = w.toUint8Array();
  if (!compress) {
    return `3${base64UrlEncode(raw)}`;
  }

  const deflated = fflate.deflateSync(raw, { level: 6 });
  return `2${base64UrlEncode(deflated)}`;
}

