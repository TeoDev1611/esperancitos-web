import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import yaml from 'js-yaml';
import {
  avisoSchema,
  negocioSchema,
  enlaceGroupSchema,
  updateSchema,
  toPublicAviso,
  toPublicNegocio,
  toPublicEnlaceGroup,
  toPublicUpdate,
  NEGOCIO_CATEGORIES,
  MAX_JSON_SIZE_BYTES,
  MAX_LOGO_SIZE_BYTES,
  type AvisoInput,
  type NegocioInput,
  type EnlaceGroupInput,
  type UpdateInput,
  type AvisosJsonResponse,
  type NegociosJsonResponse,
  type EnlacesJsonResponse,
  type UpdateJsonResponse,
  type ManifestJsonResponse,
} from './community-contract.ts';

export interface ContentFileReport {
  file: string;
  collection: string;
  id?: string;
  valid: boolean;
  errors: string[];
}

export interface ValidationSummary {
  valid: boolean;
  totalFiles: number;
  reports: ContentFileReport[];
  duplicateIds: { collection: string; id: string; files: string[] }[];
  logoErrors: { file: string; logo: string; error: string }[];
  sizeErrors: { file: string; sizeBytes: number; maxBytes: number }[];
}

export interface LoadOptions {
  includeExamples?: boolean;
  now?: Date;
  rootDir?: string;
}

export function getProjectRootDir(customDir?: string): string {
  if (customDir) return customDir;
  return process.cwd();
}

/**
 * Lee y parsea un archivo que puede ser .json o .yaml/.yml
 */
export function readContentFile<T = unknown>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.yaml' || ext === '.yml') {
    return yaml.load(content) as T;
  }
  return JSON.parse(content) as T;
}

/**
 * Encuentra todos los archivos de contenido soportados en un directorio
 */
export function listCollectionFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.json', '.yaml', '.yml'].includes(ext)) {
        files.push(path.join(dirPath, entry.name));
      }
    }
  }
  return files.sort();
}

/**
 * Valida todas las colecciones y devuelve un reporte completo detallado sin romper la ejecución
 */
export function validateAllContent(options: { rootDir?: string; now?: Date } = {}): ValidationSummary {
  const root = getProjectRootDir(options.rootDir);
  const contentRoot = path.join(root, 'src', 'content');
  const publicDir = path.join(root, 'public');

  const reports: ContentFileReport[] = [];
  const duplicateIds: ValidationSummary['duplicateIds'] = [];
  const logoErrors: ValidationSummary['logoErrors'] = [];
  const sizeErrors: ValidationSummary['sizeErrors'] = [];

  const idMap: Record<string, Map<string, string[]>> = {
    avisos: new Map(),
    negocios: new Map(),
    enlaces_groups: new Map(),
    enlaces_items: new Map(),
    update: new Map(),
  };

  function recordId(coll: string, id: string, file: string) {
    const map = idMap[coll];
    if (!map) return;
    const existing = map.get(id) || [];
    existing.push(file);
    map.set(id, existing);
  }

  // 1. Avisos
  const avisosFiles = listCollectionFiles(path.join(contentRoot, 'avisos'));
  for (const file of avisosFiles) {
    const relFile = path.relative(root, file);
    try {
      const raw = readContentFile<any>(file);
      const parsed = avisoSchema.safeParse(raw);
      if (!parsed.success) {
        reports.push({
          file: relFile,
          collection: 'avisos',
          id: raw?.id,
          valid: false,
          errors: parsed.error.issues.map(
            (issue) => `[${issue.path.join('.') || 'raíz'}]: ${issue.message}`
          ),
        });
      } else {
        recordId('avisos', parsed.data.id, relFile);
        reports.push({
          file: relFile,
          collection: 'avisos',
          id: parsed.data.id,
          valid: true,
          errors: [],
        });
      }
    } catch (err: any) {
      reports.push({
        file: relFile,
        collection: 'avisos',
        valid: false,
        errors: [`Error de sintaxis al leer archivo: ${err.message}`],
      });
    }
  }

  // 2. Negocios
  const negociosFiles = listCollectionFiles(path.join(contentRoot, 'negocios'));
  for (const file of negociosFiles) {
    const relFile = path.relative(root, file);
    try {
      const raw = readContentFile<any>(file);
      const parsed = negocioSchema.safeParse(raw);
      if (!parsed.success) {
        reports.push({
          file: relFile,
          collection: 'negocios',
          id: raw?.id,
          valid: false,
          errors: parsed.error.issues.map(
            (issue) => `[${issue.path.join('.') || 'raíz'}]: ${issue.message}`
          ),
        });
      } else {
        recordId('negocios', parsed.data.id, relFile);
        reports.push({
          file: relFile,
          collection: 'negocios',
          id: parsed.data.id,
          valid: true,
          errors: [],
        });

        // Validar logo si está presente
        if (parsed.data.logo) {
          const logoDiskPath = path.join(publicDir, parsed.data.logo.replace(/^\//, ''));
          if (!fs.existsSync(logoDiskPath)) {
            logoErrors.push({
              file: relFile,
              logo: parsed.data.logo,
              error: `El archivo de logo no existe en disco: ${path.relative(root, logoDiskPath)}`,
            });
          } else {
            const stats = fs.statSync(logoDiskPath);
            if (stats.size > MAX_LOGO_SIZE_BYTES) {
              logoErrors.push({
                file: relFile,
                logo: parsed.data.logo,
                error: `El logo supera el límite de 60 KB: ${(stats.size / 1024).toFixed(1)} KB`,
              });
            }
          }
        }
      }
    } catch (err: any) {
      reports.push({
        file: relFile,
        collection: 'negocios',
        valid: false,
        errors: [`Error de sintaxis al leer archivo: ${err.message}`],
      });
    }
  }

  // 3. Enlaces
  const enlacesFiles = listCollectionFiles(path.join(contentRoot, 'enlaces'));
  for (const file of enlacesFiles) {
    const relFile = path.relative(root, file);
    try {
      const raw = readContentFile<any>(file);
      const parsed = enlaceGroupSchema.safeParse(raw);
      if (!parsed.success) {
        reports.push({
          file: relFile,
          collection: 'enlaces',
          id: raw?.id || raw?.title,
          valid: false,
          errors: parsed.error.issues.map(
            (issue) => `[${issue.path.join('.') || 'raíz'}]: ${issue.message}`
          ),
        });
      } else {
        if (parsed.data.id) {
          recordId('enlaces_groups', parsed.data.id, relFile);
        }
        for (const item of parsed.data.items) {
          recordId('enlaces_items', item.id, relFile);
        }
        reports.push({
          file: relFile,
          collection: 'enlaces',
          id: parsed.data.id || parsed.data.title,
          valid: true,
          errors: [],
        });
      }
    } catch (err: any) {
      reports.push({
        file: relFile,
        collection: 'enlaces',
        valid: false,
        errors: [`Error de sintaxis al leer archivo: ${err.message}`],
      });
    }
  }

  // 4. Update
  const updateFiles = listCollectionFiles(path.join(contentRoot, 'update'));
  for (const file of updateFiles) {
    const relFile = path.relative(root, file);
    try {
      const raw = readContentFile<any>(file);
      const parsed = updateSchema.safeParse(raw);
      if (!parsed.success) {
        reports.push({
          file: relFile,
          collection: 'update',
          id: raw?.latestVersion,
          valid: false,
          errors: parsed.error.issues.map(
            (issue) => `[${issue.path.join('.') || 'raíz'}]: ${issue.message}`
          ),
        });
      } else {
        reports.push({
          file: relFile,
          collection: 'update',
          id: parsed.data.latestVersion,
          valid: true,
          errors: [],
        });
      }
    } catch (err: any) {
      reports.push({
        file: relFile,
        collection: 'update',
        valid: false,
        errors: [`Error de sintaxis al leer archivo: ${err.message}`],
      });
    }
  }

  // Buscar duplicados
  for (const [coll, map] of Object.entries(idMap)) {
    for (const [id, files] of map.entries()) {
      if (files.length > 1) {
        duplicateIds.push({ collection: coll, id, files });
      }
    }
  }

  // Probar generación de payloads para verificar límites de tamaño (<= 200 KB)
  try {
    const payloads = buildApiPayloads({ rootDir: root, includeExamples: true, now: options.now });
    for (const [name, p] of Object.entries(payloads.rawStrings)) {
      const bytes = Buffer.byteLength(p, 'utf8');
      if (bytes > MAX_JSON_SIZE_BYTES) {
        sizeErrors.push({
          file: `${name}.json`,
          sizeBytes: bytes,
          maxBytes: MAX_JSON_SIZE_BYTES,
        });
      }
    }
  } catch (err) {
    // Si falla la construcción, los errores individuales ya están capturados
  }

  const hasErrors =
    reports.some((r) => !r.valid) ||
    duplicateIds.length > 0 ||
    logoErrors.length > 0 ||
    sizeErrors.length > 0;

  return {
    valid: !hasErrors,
    totalFiles: reports.length,
    reports,
    duplicateIds,
    logoErrors,
    sizeErrors,
  };
}

/**
 * Construye los 5 payloads de la API v1 de forma determinista y consistente.
 */
export function buildApiPayloads(options: LoadOptions = {}) {
  const root = getProjectRootDir(options.rootDir);
  const contentRoot = path.join(root, 'src', 'content');
  const now = options.now || new Date();

  const includeExamples =
    options.includeExamples !== undefined
      ? options.includeExamples
      : process.env.INCLUDE_EXAMPLES === 'true' ||
        process.env.PUBLIC_API_INCLUDE_EXAMPLES === 'true';

  // --- 1. CARGAR AVISOS ---
  const avisosFiles = listCollectionFiles(path.join(contentRoot, 'avisos'));
  const avisosRaw: AvisoInput[] = [];
  const avisosSeenIds = new Set<string>();

  for (const file of avisosFiles) {
    try {
      const data = readContentFile<any>(file);
      const parsed = avisoSchema.parse(data);
      if (avisosSeenIds.has(parsed.id)) {
        throw new Error(
          `ID duplicado en colección avisos: "${parsed.id}" (encontrado en ${path.relative(root, file)})`
        );
      }
      avisosSeenIds.add(parsed.id);

      // Regla de ejemplo
      if (!includeExamples && parsed.ejemplo) {
        continue;
      }

      // Regla de caducidad en build time: expiresAt > now
      if (parsed.expiresAt) {
        const expTime = new Date(parsed.expiresAt).getTime();
        if (expTime <= now.getTime()) {
          continue; // Caducado
        }
      }

      avisosRaw.push(parsed);
    } catch (err: any) {
      // Si la entrada es inválida por error en archivo, se omite según el contrato
      // o se lanza si hay duplicados
      if (err.message.includes('ID duplicado')) throw err;
      console.warn(`[API v1 / avisos] Omitiendo entrada inválida ${file}: ${err.message}`);
    }
  }

  // Orden determinista de avisos:
  // 1. Pinned primero (true antes de false)
  // 2. publishedAt descendente (más recientes primero)
  // 3. id alfabético ascendente para total estabilidad
  avisosRaw.sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    const timeA = new Date(a.publishedAt).getTime();
    const timeB = new Date(b.publishedAt).getTime();
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return a.id.localeCompare(b.id);
  });

  const avisosPayload: AvisosJsonResponse = {
    items: avisosRaw.map(toPublicAviso),
  };

  // --- 2. CARGAR NEGOCIOS ---
  const negociosFiles = listCollectionFiles(path.join(contentRoot, 'negocios'));
  const negociosRaw: NegocioInput[] = [];
  const negociosSeenIds = new Set<string>();

  for (const file of negociosFiles) {
    try {
      const data = readContentFile<any>(file);
      const parsed = negocioSchema.parse(data);
      if (negociosSeenIds.has(parsed.id)) {
        throw new Error(
          `ID duplicado en colección negocios: "${parsed.id}" (encontrado en ${path.relative(root, file)})`
        );
      }
      negociosSeenIds.add(parsed.id);

      // Regla de ejemplo
      if (!includeExamples && parsed.ejemplo) {
        continue;
      }

      // Regla de caducidad en build time: validUntil > now
      const validUntilTime = new Date(parsed.validUntil).getTime();
      if (validUntilTime <= now.getTime()) {
        continue; // Caducado
      }

      negociosRaw.push(parsed);
    } catch (err: any) {
      if (err.message.includes('ID duplicado')) throw err;
      console.warn(`[API v1 / negocios] Omitiendo entrada inválida ${file}: ${err.message}`);
    }
  }

  // Orden determinista de negocios:
  // "por categoría y nombre"
  negociosRaw.sort((a, b) => {
    const catIndexA = NEGOCIO_CATEGORIES.indexOf(a.category);
    const catIndexB = NEGOCIO_CATEGORIES.indexOf(b.category);
    if (catIndexA !== catIndexB) {
      return catIndexA - catIndexB;
    }
    const nameComp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    if (nameComp !== 0) {
      return nameComp;
    }
    return a.id.localeCompare(b.id);
  });

  const negociosPayload: NegociosJsonResponse = {
    categories: NEGOCIO_CATEGORIES,
    items: negociosRaw.map(toPublicNegocio),
  };

  // --- 3. CARGAR ENLACES ---
  const enlacesFiles = listCollectionFiles(path.join(contentRoot, 'enlaces'));
  const enlacesRaw: EnlaceGroupInput[] = [];
  const enlacesSeenItemIds = new Set<string>();

  for (const file of enlacesFiles) {
    try {
      const data = readContentFile<any>(file);
      const parsed = enlaceGroupSchema.parse(data);

      for (const it of parsed.items) {
        if (enlacesSeenItemIds.has(it.id)) {
          throw new Error(
            `ID duplicado de enlace: "${it.id}" (encontrado en ${path.relative(root, file)})`
          );
        }
        enlacesSeenItemIds.add(it.id);
      }

      if (!includeExamples && parsed.ejemplo) {
        continue;
      }

      enlacesRaw.push(parsed);
    } catch (err: any) {
      if (err.message.includes('ID duplicado')) throw err;
      console.warn(`[API v1 / enlaces] Omitiendo entrada inválida ${file}: ${err.message}`);
    }
  }

  // Orden de grupos: por 'order' si existe, o alfabético por title
  enlacesRaw.sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title, 'es');
  });

  const enlacesGroups = enlacesRaw
    .map((g) => toPublicEnlaceGroup(g, includeExamples))
    .filter((g): g is NonNullable<typeof g> => g !== null && g.items.length > 0);

  const enlacesPayload: EnlacesJsonResponse = {
    groups: enlacesGroups,
  };

  // --- 4. CARGAR UPDATE ---
  const updateFiles = listCollectionFiles(path.join(contentRoot, 'update'));
  let latestUpdate: UpdateInput | null = null;

  for (const file of updateFiles) {
    try {
      const data = readContentFile<any>(file);
      const parsed = updateSchema.parse(data);
      if (!includeExamples && parsed.ejemplo) {
        continue;
      }
      if (!latestUpdate || parsed.latestBuild > latestUpdate.latestBuild) {
        latestUpdate = parsed;
      }
    } catch (err: any) {
      console.warn(`[API v1 / update] Omitiendo entrada inválida ${file}: ${err.message}`);
    }
  }

  // Fallback si no hay archivos en update o si se excluyeron por ejemplo en prod
  const updatePayload: UpdateJsonResponse = latestUpdate
    ? toPublicUpdate(latestUpdate)
    : {
        latestVersion: '1.0.0',
        latestBuild: 1,
        minSupportedBuild: 1,
        publishedAt: now.toISOString(),
        notes: ['Versión inicial estable de Esperancitos'],
        downloadPage: 'https://esperancitos.app/#descargar',
      };

  // --- 5. SERIALIZACIÓN DETERMINISTA ---
  // JSON UTF-8 formateado a 2 espacios para inspección limpia y tamaño reducido
  const updateJsonStr = JSON.stringify(updatePayload, null, 2);
  const avisosJsonStr = JSON.stringify(avisosPayload, null, 2);
  const negociosJsonStr = JSON.stringify(negociosPayload, null, 2);
  const enlacesJsonStr = JSON.stringify(enlacesPayload, null, 2);

  function sha256(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }

  // Fecha de actualización por archivo
  function maxDate(dates: (string | undefined)[], fallback: string): string {
    const validTimes = dates
      .filter((d): d is string => Boolean(d))
      .map((d) => ({ str: d, time: new Date(d).getTime() }))
      .filter((o) => !Number.isNaN(o.time));
    if (validTimes.length === 0) return fallback;
    validTimes.sort((a, b) => b.time - a.time);
    return validTimes[0].str;
  }

  const generatedAtIso = now.toISOString();

  const updateUpdatedAt = updatePayload.publishedAt;
  const avisosUpdatedAt = maxDate(
    avisosPayload.items.map((i) => i.publishedAt),
    generatedAtIso
  );
  const negociosUpdatedAt = maxDate(
    negociosPayload.items.map((i) => i.updatedAt),
    generatedAtIso
  );
  const enlacesUpdatedAt = maxDate(
    enlacesPayload.groups.flatMap((g) => g.items.map((i) => i.updatedAt)),
    generatedAtIso
  );

  const manifestPayload: ManifestJsonResponse = {
    schemaVersion: 1,
    generatedAt: generatedAtIso,
    files: {
      update: {
        path: 'update.json',
        sha256: sha256(updateJsonStr),
        updatedAt: updateUpdatedAt,
      },
      avisos: {
        path: 'avisos.json',
        sha256: sha256(avisosJsonStr),
        updatedAt: avisosUpdatedAt,
      },
      negocios: {
        path: 'negocios.json',
        sha256: sha256(negociosJsonStr),
        updatedAt: negociosUpdatedAt,
      },
      enlaces: {
        path: 'enlaces.json',
        sha256: sha256(enlacesJsonStr),
        updatedAt: enlacesUpdatedAt,
      },
    },
  };

  const manifestJsonStr = JSON.stringify(manifestPayload, null, 2);

  return {
    parsed: {
      manifest: manifestPayload,
      update: updatePayload,
      avisos: avisosPayload,
      negocios: negociosPayload,
      enlaces: enlacesPayload,
    },
    rawStrings: {
      manifest: manifestJsonStr,
      update: updateJsonStr,
      avisos: avisosJsonStr,
      negocios: negociosJsonStr,
      enlaces: enlacesJsonStr,
    },
  };
}
