// ============================================================================
// PILAS! LINKS — Ejemplos Demostrativos y Vectores Reales Dart VM
// Usados únicamente en estados vacíos / "Ver ejemplo interactivo" o al pulsar
// "Probar con horario demo". NUNCA para rellenar enlaces reales compartidos.
// ============================================================================

import {
  encodePb2,
  fnv1a32,
  type AmigoPayload,
  type CursoPayload,
  type JuntaPayload,
  type MaterialesPayload,
  type PayloadKind,
  type TareaPayload,
  type TareasPayload,
} from '../pilasCodec';

/** Vectores PB2 de referencia (texto directo sin catálogos estáticos) y legacy v1. */
export const DART_VM_VECTORS = {
  amigoCompactVector1:
    '3AZ8KQW5hIEzDs3BlegRFU1BFCE1hdHJpeiAZCQlTb2Z0d2FyZQYyMDI2NTASTGlicmUgdGFyZGVzIMK3IBVIBejWkGF8Rz13AgoSVmVjdG9yaWFsAAAENDUxMgELE09wZXJhdGl2b3MAAAQ3ODIwAgMjDCBjDCBHjEE',
  amigoExtendedVector2:
    '3AUcKTWF0ZW8gUnVpegtZYWNoYXkgVGVjaAhVcmN1cXXDrQ0TSW50ZWxpZ2VudGVzkN-UYcUtLukBBg1SZWRlcwYVQi0xMDIGHkxlw7NuBDkwMDEDAROxA48EAA',
  amigoV1LegacyVector3:
    'H4sIAAAAAAAACh2OO04DMRRFt2Ld2hO9mQmD8sqIBik0IRQEIWQ8L8TSjK34U0CUJVGxhGwsMv0995wz3AhGivajg8bBg_FksgS1Le4HGjaC8exSltkk9eizTO5LfJYEjZzA6KgbGhqadtjRiomYaEFE-wpP4Lcz6mpjPkM0OUQX1FbGf7xer6dwKqLWTUs1YAQvNRx42fcaB_Bdd6-RwXiIC7WR65-HRq1cEbXQmMH95V2jeAfGq7FH8612Yo9VP4PxEm05lesvLjdZlf337AAAAA==',
  tareaVector4:
    '2Y-IXdklNSi1SMLZSEApLTS7JL8pMzOFCMK_0rU18cW1CIotrcIArs2NeolpQanF-ThlQS3rp4bWJCqlZqUXJmcmZ-cXyCql5CgWJRalZicV6Uoy5-Sn6icXFmel5-mWZqeV6BRkF9pkptpaGAA',
  tareasVector5:
    '3AwETQ2hlY2tsaXN0IFBhcmNpYWwgMQkJU29mdHdhcmUFTWF0ZW_o1pBhAgMTU3ViaXIgZGlhZ3JhbWEgU1JTH8DaoWEAGVJldmlzYXIgcHJ1ZWJhcyB1bml0YXJpYXM',
  materialesVector6:
    '2TY4xTgMxEEVZlAIkpBTQxyeIcUQbhQBRWiQOsJrYs8kg47Fm7Cyk2iMgDscZOAZLR_2f3vuT5uviZqNFqi9VQE1A8wSF9fIZxBNE436-P-G8udpWgnYr0LHOXpoed4pyJI82x7qn1FHEeT5k627vFvaNQyuoXGUEPKeCqVhn_ztWHY9j4D5FhrB0w2CmkHMkD4U42Ry6s-vNK44vPLG2a9lxRJ2ZyV_KBuvWD4_vHyd7JOxXVfNSDyCU9sNw_ws',
  cursoVector7:
    '2Y61n5xb2L0gtSizJLMsvPsz64tqERBbX4ABXDt_EkqLMKgVJFgsLI0N-WefEopxEBefUssScnPxiYd_EIn2v0lQFQwMrAwNdQyMgyQZSkl_Mxezo5GxoZGxiaibKklKUWZaqn5afk5JaVKwf7G9kYGTGy1pRWaWbmJScopualg4A',
  juntaVector8:
    '3Bj0PUmVwYXNvIBJQYXJjaWFs8M2gYVoNBXBpbC1hc3YyLWVkdQNBbmEJRW4gTMOtbmVhGlRyYWVyIGVqZXJjaWNpb3MgcmVzdWVsdG9zAwVNYXRlbwZTb2bDrWEETHVpcw',
} as const;

export const SAMPLE_AMIGO_FRIEND: AmigoPayload = {
  kind: 'amigo',
  type: 1,
  friendName: 'Ana López',
  university: 'ESPE',
  campus: 'Matriz Sangolquí',
  career: 'Ingeniería en Software',
  period: '202650',
  statusNote: 'Libre tardes · Bloque H',
  level: 5,
  isPrivateMode: false,
  lastSharedAt: '2026-06-15T14:30:00.000Z',
  scheduleHash: 2085043575,
  classes: [
    { s: 'Cálculo Vectorial', r: '', t: '', n: '4512', d: 1, i: 420, f: 540, m: 1 },
    { s: 'Cálculo Vectorial', r: '', t: '', n: '4512', d: 3, i: 420, f: 540, m: 1 },
    { s: 'Sistemas Operativos', r: '', t: '', n: '7820', d: 2, i: 600, f: 720, m: 2 },
  ],
};

export const SAMPLE_AMIGO_MINE: AmigoPayload = {
  kind: 'amigo',
  type: 1,
  friendName: 'Mateo T.',
  university: 'ESPE',
  campus: 'Matriz Sangolquí',
  career: 'Ingeniería en Software',
  period: '202650',
  statusNote: 'En campus mañanas',
  level: 5,
  isPrivateMode: false,
  lastSharedAt: '2026-06-15T14:30:00.000Z',
  scheduleHash: fnv1a32('ESPE|Matriz Sangolquí|2026'),
  classes: [
    { s: 'Cálculo Vectorial', r: 'Bloque B · B-204', t: 'Ing. Morales', n: '4512', d: 1, i: 420, f: 540, m: 1 },
    { s: 'Base de Datos', r: 'Lab. Software 2', t: 'MSc. Paredes', n: '6190', d: 2, i: 480, f: 600, m: 1 },
    { s: 'Física II', r: 'Edificio C · C-108', t: 'Dr. Torres', n: '3301', d: 4, i: 540, f: 660, m: 1 },
  ],
};

export function createSampleTarea(): TareaPayload {
  const now = Date.now();
  const dueMs = now + 20 * 60 * 60 * 1000;
  return {
    kind: 'tarea',
    type: 2,
    title: 'Deber 3: Cálculo Vectorial',
    subject: 'Cálculo Vectorial',
    dueDate: new Date(dueMs).toISOString(),
    createdAt: new Date(now).toISOString(),
    university: 'ESPE',
    author: 'Ana',
    description: 'Resolver guía ejercicios.pdf en parejas y subir antes de las 23:55.',
    sourceUrl: 'https://micampusvirtual.espe.edu.ec/mod/assign/view.php?id=91',
  };
}

export const SAMPLE_TAREAS: TareasPayload = {
  kind: 'tareas',
  type: 3,
  title: 'Checklist Parcial 1',
  subject: 'Ingeniería en Software',
  author: 'Mateo',
  createdAt: '2026-06-15T14:30:00.000Z',
  items: [
    { title: 'Subir diagrama SRS.pdf', isPriority: true, dueDate: '2026-06-18T20:00:00.000Z' },
    { title: 'Revisar pruebas unitarias', isPriority: false, dueDate: null },
  ],
};

export const SAMPLE_MATERIALES: MaterialesPayload = {
  kind: 'materiales',
  type: 4,
  courseId: 1042,
  courseName: 'Estructuras de Datos',
  sectionName: 'Parcial 1',
  createdAt: '2026-06-15T14:30:00.000Z',
  files: [
    {
      filename: 'Guia_Grafos.pdf',
      fileurl: 'https://micampusvirtual.espe.edu.ec/webservice/pluginfile.php/1042/mod_resource/content/1/Guia_Grafos.pdf?forcedownload=1',
      filesize: 524288,
      mimetype: 'application/pdf',
    },
    {
      filename: 'Ejercicios_Arboles.pdf',
      fileurl: 'https://drive.google.com/file/d/1ABCxyz/view?usp=sharing',
      filesize: 1048576,
      mimetype: null,
    },
  ],
  hasProtectedMoodleLinks: true,
};

export const SAMPLE_CURSO: CursoPayload = {
  kind: 'curso',
  type: 5,
  courseId: 707,
  courseName: 'Sistemas Operativos',
  university: 'ESPE',
  campus: 'Matriz Sangolquí',
  nrc: '8821',
  teacher: 'MSc. Carla Cevallos',
  scheduleSummary: 'Mar/Jue 10:00-12:00',
  author: 'Carlos',
  whatsappUrl: 'https://chat.whatsapp.com/ABC123456',
  driveUrl: 'https://drive.google.com/drive/folders/SO2026',
  meetingUrl: 'https://meet.google.com/xyz-abcd-efg',
  customUrl: null,
  createdAt: '2026-06-15T14:30:00.000Z',
};

export const SAMPLE_JUNTA: JuntaPayload = {
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
};

export async function getSampleEncodedParam(kind: PayloadKind | 'mine'): Promise<string> {
  if (kind === 'mine') return encodePb2(SAMPLE_AMIGO_MINE, { compress: true });
  switch (kind) {
    case 'amigo':
      return DART_VM_VECTORS.amigoCompactVector1;
    case 'tarea':
      return encodePb2(createSampleTarea(), { compress: true });
    case 'tareas':
      return DART_VM_VECTORS.tareasVector5;
    case 'materiales':
      return DART_VM_VECTORS.materialesVector6;
    case 'curso':
      return DART_VM_VECTORS.cursoVector7;
    case 'junta':
      return DART_VM_VECTORS.juntaVector8;
  }
}
