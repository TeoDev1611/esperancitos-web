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

console.log('\n--- TEST 7: REAL BANNER MULTI-PAGE SCHEDULE (MARCH DATE COLLISION TEST) ---');
const marchBannerRaw = `Universidad de FF.AA-ESPE
Horario ESPINOZA GONZALEZ, CARLOS ALEXANDER NIVELACION S-II OCT24 - MAR25
Clasificación: Nivel: NIVELACION SNNA
Escuela: ESCUELA NO DESIGNADA Carrera: [PRES]CARRERAS TECNICAS
Departamento:No Declarado
Título Detalles del curso Horas crédito NRC Horas de reunión
QUIMICA GENERAL EXCT QUI01 0 4.0 4070 28-Oct-2024 - 11-Mar-2025
12:00 - 12:59
PAZMIÑO NARANJO, MARCELA GABRIELA
28-Oct-2024 - 11-Mar-2025
Jueves
15:00 - 16:59
ESPE MATRIZ SANGOLQUI, BLOQUE D SANGOLQUI, D202
PAZMIÑO NARANJO, MARCELA GABRIELA
28-Oct-2024 - 11-Mar-2025
Martes
17:00 - 18:59
ESPE MATRIZ SANGOLQUI, BLOQUE D SANGOLQUI, D202
PAZMIÑO NARANJO, MARCELA GABRIELA
FISICA EXCT FIS01 026 6.0 4135 28-Oct-2024 - 11-Mar-2025
12:00 - 12:59
NARANJO TORRES, ESTEBAN DANIEL
28-Oct-2024 - 11-Mar-2025
Lunes, Miércoles, Viernes
17:00 - 18:59
ESPE MATRIZ SANGOLQUI, BLOQUE D SANGOLQUI, D202
NARANJO TORRES, ESTEBAN DANIEL
ALGEBRA EXCT ALG01 0 8.0 4201 28-Oct-2024 - 11-Mar-2025
12:00 - 12:59
ANDRANGO PAILLACHO, ALEX ALEJANDRO
28-Oct-2024 - 11-Mar-2025
Jueves
17:00 - 18:59
ESPE MATRIZ SANGOLQUI, BLOQUE D SANGOLQUI, D202
ANDRANGO PAILLACHO, ALEX ALEJANDRO
28-Oct-2024 - 11-Mar-2025
Miércoles
15:00 - 16:59
ESPE MATRIZ SANGOLQUI, BLOQUE D SANGOLQUI, D202
ANDRANGO PAILLACHO, ALEX ALEJANDRO
28-Oct-2024 - 11-Mar-2025
Lunes, Martes
13:00 - 14:59
ESPE MATRIZ SANGOLQUI, BLOQUE D SANGOLQUI, D202
ANDRANGO PAILLACHO, ALEX ALEJANDRO
GEOMETRÍA EXCT GEO01 0 6.0 4290 28-Oct-2024 - 11-Mar-2025
12:00 - 12:59
SALAZAR ESCOBAR, HUGO DAVID
28-Oct-2024 - 11-Mar-2025
Miércoles, Viernes
13:00 - 14:59
ESPE MATRIZ SANGOLQUI, BLOQUE D SANGOLQUI, D202
ESPINOZA GONZALEZ, CARLOS ALEXANDER
Clases sin horas de reunión:
Título Detalles del curso Horas crédito NRC Horas de reunión
SALAZAR ESCOBAR, HUGO DAVID
28-Oct-2024 - 11-Mar-2025
Martes
15:00 - 16:59
ESPE MATRIZ SANGOLQUI, BLOQUE D SANGOLQUI, D202
SALAZAR ESCOBAR, HUGO DAVID
COMUNICACION ORAL Y ESCRITA CHUM LINP6 0 4.0 4433 28-Oct-2024 - 11-Mar-2025
12:00 - 12:59
MARTINEZ PASTOR, ERICKA GABRIELA
28-Oct-2024 - 11-Mar-2025
Martes
07:00 - 08:59
MARTINEZ PASTOR, ERICKA GABRIELA
OFIMATICA COMP A0F00 0 4.0 4458 28-Oct-2024 - 11-Mar-2025
12:00 - 12:59
QUISPE CANDO, TRANSITO DEL ROSARIO
28-Oct-2024 - 11-Mar-2025
Lunes
07:00 - 08:59
QUISPE CANDO, TRANSITO DEL ROSARIO
PROM. NIV. FINAL PRESENCIAL | EXCT MVNP 0 | NRC: 4381 | Horas crédito: 0.0 | Tipo de horario: TEORIA
Total de horas | Inscritas: 32 | Cobro: 32 | UEC: 0`;

const marchSchedule = parseBannerSchedule(marchBannerRaw);
console.log('Student:', marchSchedule.estudiante);
console.log('Period:', marchSchedule.periodo);
console.log('Total subjects:', marchSchedule.materias.length);

if (marchSchedule.estudiante !== 'Carlos Alexander Espinoza Gonzalez') {
  throw new Error(`Nombre de estudiante erróneo: ${marchSchedule.estudiante}`);
}
if (marchSchedule.periodo !== 'S-II OCT24 - MAR25') {
  throw new Error(`Periodo erróneo: ${marchSchedule.periodo}`);
}
if (marchSchedule.materias.length !== 6) {
  throw new Error(`Se esperaban 6 materias, se obtuvieron ${marchSchedule.materias.length}`);
}

const allClasses = marchSchedule.materias.flatMap(m => m.clases);
const countsByDay: Record<string, number> = { LUN: 0, MAR: 0, MIE: 0, JUE: 0, VIE: 0 };
for (const c of allClasses) {
  countsByDay[c.dia] = (countsByDay[c.dia] || 0) + 1;
}

console.log('Clases por día:', countsByDay);
// En la cuadrícula oficial de Banner (página 3):
// Lunes: 3 clases (Ofimática 07-09, Álgebra 13-15, Física 17-19)
// Martes: 4 clases (Comunicación 07-09, Álgebra 13-15, Geometría 15-17, Química 17-19)
// Miércoles: 3 clases (Geometría 13-15, Álgebra 15-17, Física 17-19)
// Jueves: 2 clases (Química 15-17, Álgebra 17-19)
// Viernes: 2 clases (Geometría 13-15, Física 17-19)
if (countsByDay.LUN !== 3 || countsByDay.MAR !== 4 || countsByDay.MIE !== 3 || countsByDay.JUE !== 2 || countsByDay.VIE !== 2) {
  throw new Error(`Distribución de clases por día incorrecta: ${JSON.stringify(countsByDay)}`);
}

console.log('\n✅ ¡TODOS LOS TESTS (INCLUYENDO CASO REAL DE MARZO) PASARON EXITOSAMENTE!');

