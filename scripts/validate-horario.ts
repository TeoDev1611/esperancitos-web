import {
  parseBannerSchedule,
  generateQrPayload,
  generateFriendQrProtocol,
  normalizeTime,
  formatDocente,
  normalizeAula,
} from '../src/lib/banner-parser.ts';
import { inflate } from 'pako';

console.log('--- TEST 1: NORMALIZE TIME & 59 MINUTES ---');
const t1 = normalizeTime('07:00', false);
const t2 = normalizeTime('08:59', true);
const t3 = normalizeTime('14:59', true);
console.log('07:00 start:', t1);
console.log('08:59 end (should round to 09:00):', t2);
console.log('14:59 end (should round to 15:00):', t3);
if (t2.formatted !== '09:00' || t3.formatted !== '15:00') {
  throw new Error('Falló el redondeo de :59 minutos');
}

console.log('\n--- TEST 2: FORMAT DOCENTE ---');
const d1 = formatDocente('DOCENTE EJEMPLO, CARLOS ALBERTO');
const d2 = formatDocente('PROFESORA PRUEBA, MARIA FERNANDA (P)');
console.log('d1:', d1);
console.log('d2:', d2);
if (d1 !== 'Carlos Alberto Docente Ejemplo' || d2 !== 'Maria Fernanda Profesora Prueba') {
  throw new Error('Falló el formateo de docente');
}

console.log('\n--- TEST 3: NORMALIZE AULA ---');
const a1 = normalizeAula('CAMPUS CENTRAL ESPE, BLOQUE X FICTICIO, AULA-X101');
console.log('a1:', a1);
if (a1.full !== 'BLOQUE X FICTICIO - AULA-X101' || a1.roomShort !== 'AULA-X101') {
  throw new Error('Falló la normalización de aula');
}

console.log('\n--- TEST 4: PARSE BANNER SCHEDULE ---');
const raw = `
Universidad de las Fuerzas Armadas ESPE
Detalle del Horario del Estudiante
Estudiante: ESTUDIANTE EJEMPLO, JUAN CARLOS
Periodo: 202651

CIENCIAS DE LOS MATERIALES EMEC A0202 120 6.0 33218 21-Sep-2026 - 12-Feb-2027
Lunes, Miércoles
07:00 - 08:59
CAMPUS CENTRAL ESPE, BLOQUE X FICTICIO, AULA-X101
DOCENTE EJEMPLO, CARLOS ALBERTO
Jueves
07:00 - 07:59
CAMPUS CENTRAL ESPE, BLOQUE Y FICTICIO, AULA-Y102
DOCENTE EJEMPLO, CARLOS ALBERTO
`;

const schedule = parseBannerSchedule(raw);
console.log('Parsed Schedule:', JSON.stringify(schedule, null, 2));

if (schedule.materias.length !== 1) {
  throw new Error('Debería detectar 1 materia');
}
const m = schedule.materias[0];
if (m.nrc !== '33218' || m.codigo !== 'EMEC A0202' || m.clases.length !== 3) {
  throw new Error(`Datos de materia incorrectos: clases=${m.clases.length}`);
}

console.log('\n--- TEST 5: QR GENERATION & PROTOCOL ---');
const qrPayload = generateQrPayload(schedule);
const qrUri = generateFriendQrProtocol(qrPayload);
console.log('QR URI:', qrUri);

if (!qrUri.startsWith('esp://friend?d=')) {
  throw new Error('El protocolo debe iniciar con esp://friend?d=');
}

// Descomprimir para verificar la integridad
const base64url = qrUri.replace('esp://friend?d=', '');
let b64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
while (b64.length % 4) b64 += '=';
const buffer = Buffer.from(b64, 'base64');
const decompressed = new TextDecoder().decode(inflate(buffer));
const parsedBack = JSON.parse(decompressed);
console.log('Decompressed from QR:', parsedBack);

if (parsedBack.v !== 1 || parsedBack.c.length !== 3) {
  throw new Error('Error en la descompresión del payload QR');
}

console.log('\n--- TEST 6: REAL BANNER PATTERN WITH FICTIONAL DATA ---');
const fictionalBannerRaw = `
12/10/26, 23:39 Banner
ESTUDIANTE DEMO, ALEX JAVIER
Universidad de FF.AA-ESPE
Horario ESTUDIANTE DEMO, ALEX JAVIER PREGRADO S-II SEP 26 - FEB 27
Clasificación: Nivel: PREGRADO
Escuela: C. ENERGIA Y MECANICA Carrera: [PRES] MECANICA (J)
Departamento:CIENCIAS DE ENERGIA Y MECANICA
Título Detalles del curso Horas crédito NRC Horas de reunión
CIENCIAS DE LOS MATERIALES EMEC A0202 120 6.0 33218 21-Sep-2026 - 12-Feb-2027
15:00 - 15:59
DOCENTE DEMO, CARLOS ALBERTO
21-Sep-2026 - 12-Feb-2027
Jueves
07:00 - 07:59
CAMPUS CENTRAL ESPE, BLOQUE X FICTICIO, B416
DOCENTE DEMO, CARLOS ALBERTO
21-Sep-2026 - 12-Feb-2027
Martes
07:00 - 08:59
CAMPUS CENTRAL ESPE, BLOQUE Y FICTICIO, B415
DOCENTE DEMO, CARLOS ALBERTO
CIENCIAS DE LOS MATERIALES EMEC A0202 111 0.0 33227 21-Sep-2026 - 12-Feb-2027
Martes
13:00 - 14:59
CAMPUS CENTRAL ESPE, LABORATORIO DEMO, LR101A
DOCENTE PRUEBA, JORGE LUIS
DIBUJO MEC. ASIST. COMPUTADOR EMEC A0305 20 9.0 33263 21-Sep-2026 - 12-Feb-2027
15:00 - 15:59
INSTRUCTOR VIRTUAL, HECTOR DAVID
21-Sep-2026 - 12-Feb-2027
Lunes, Miércoles, Viernes
13:00 - 14:59
CAMPUS CENTRAL ESPE, LABORATORIO EXPERIMENTAL, G-402
INSTRUCTOR VIRTUAL, HECTOR DAVID
ESTADÍSTICA EXCT A0501 0 9.0 36033 21-Sep-2026 - 12-Feb-2027
Miércoles, Viernes
07:00 - 08:59
CAMPUS CENTRAL ESPE, BLOQUE Z KRYPTON, B112
PROFESORA FICTICIA, PATRICIA ELENA
21-Sep-2026 - 12-Feb-2027
Martes
14:00 - 14:59
PROFESORA FICTICIA, PATRICIA ELENA
21-Sep-2026 - 12-Feb-2027
Lunes
07:00 - 08:59
CAMPUS CENTRAL ESPE, LABORATORIO ALPHA, G-403
PROFESORA FICTICIA, PATRICIA ELENA
MÉTODOS NUMÉRICOS EXCT A0402 0 6.0 36041 21-Sep-2026 - 12-Feb-2027
Jueves
14:00 - 14:59
21-Sep-2026 - 12-Feb-2027
Martes, Jueves
11:00 - 12:59
CAMPUS CENTRAL ESPE, LABORATORIO BETA, H-201
MATEMATICA SUPERIOR EXCT A0403 0 6.0 36042 21-Sep-2026 - 12-Feb-2027
Miércoles
15:00 - 15:59
Título Detalles del curso Horas crédito NRC Horas de reunión
PROFESOR PRUEBA, SANTIAGO ANDRES
21-Sep-2026 - 12-Feb-2027
Martes, Jueves
09:00 - 10:59
CAMPUS CENTRAL ESPE, BLOQUE OMEGA, C206
PROFESOR PRUEBA, SANTIAGO ANDRES
Total de horas | Inscritas: 36 | Cobro: 36 | UEC: 0
`;

const demoSchedule = parseBannerSchedule(fictionalBannerRaw);
console.log('Demo student:', demoSchedule.estudiante);
console.log('Demo period:', demoSchedule.periodo);
console.log('Demo courses count:', demoSchedule.materias.length);

if (demoSchedule.estudiante !== 'Alex Javier Estudiante Demo') {
  throw new Error(`Nombre de estudiante incorrecto: ${demoSchedule.estudiante}`);
}
if (demoSchedule.materias.length !== 6) {
  throw new Error(`Se esperaban 6 materias, se encontraron ${demoSchedule.materias.length}`);
}

const nrcs = demoSchedule.materias.map(m => m.nrc);
if (!nrcs.includes('33218') || !nrcs.includes('36033') || !nrcs.includes('36042')) {
  throw new Error('Faltan NRCs esperados en el horario');
}

console.log('\n✅ ¡TODOS LOS TESTS CON DATOS 100% FICTICIOS PASARON EXITOSAMENTE!');
