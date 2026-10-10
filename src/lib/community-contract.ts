import { z } from "zod";

// ============================================================================
// CONTRATO API v1 - COMUNIDAD PILAS!
// ============================================================================
// Base: https://pilas-ec.vercel.app/api/v1/
// Solo JSON UTF-8, solo HTTPS.
// Texto plano, sin HTML. IDs estables (slug). Fechas ISO 8601 con offset.
// Campos desconocidos se ignoran. Entradas inválidas se omiten.
// Cada JSON <= 200 KB; logos WebP <= 60 KB.
// ============================================================================

export const API_BASE_URL = "https://pilas-ec.vercel.app/api/v1/";
export const MAX_JSON_SIZE_BYTES = 200 * 1024; // 200 KB
export const MAX_LOGO_SIZE_BYTES = 60 * 1024; // 60 KB

export const AVISO_TYPES = [
  "info",
  "evento",
  "mantenimiento",
  "importante",
] as const;
export type AvisoType = (typeof AVISO_TYPES)[number];

export const NEGOCIO_CATEGORIES = [
  "comida",
  "copias",
  "papeleria",
  "transporte",
  "vivienda",
  "salud",
  "servicios",
  "otros",
] as const;
export type NegocioCategory = (typeof NEGOCIO_CATEGORIES)[number];

// ============================================================================
// VALIDADORES AUXILIARES
// ============================================================================

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const noHtmlRegex = /<\/?[a-z][\s\S]*>/i;
export const isoDateWithOffsetRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
export const logoPathRegex = /^\/api\/v1\/img\/[a-z0-9-]+\.webp$/;

export const noHtml = (val: string): boolean => !noHtmlRegex.test(val);

export const isValidIsoDate = (val: string): boolean => {
  return isoDateWithOffsetRegex.test(val) && !Number.isNaN(Date.parse(val));
};

export const isHttpsUrl = (val: string): boolean => {
  try {
    const url = new URL(val);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

// ============================================================================
// ESQUEMAS ZOD
// ============================================================================

// --- 1. AVISOS ---
export const avisoLinkSchema = z.object({
  url: z
    .string()
    .refine(isHttpsUrl, "La URL del enlace debe comenzar con https://"),
  label: z
    .string()
    .max(30, "La etiqueta del enlace no puede superar 30 caracteres")
    .refine(noHtml, "La etiqueta no puede contener código HTML"),
});

export const avisoSchema = z
  .object({
    id: z
      .string()
      .regex(
        slugRegex,
        "El id debe ser un slug válido (minúsculas, números y guiones)",
      ),
    type: z.enum(AVISO_TYPES, {
      message: `El tipo debe ser uno de: ${AVISO_TYPES.join(", ")}`,
    }),
    title: z
      .string()
      .min(1, "El título no puede estar vacío")
      .max(80, "El título no puede superar 80 caracteres")
      .refine(noHtml, "El título no puede contener código HTML"),
    body: z
      .string()
      .min(1, "El cuerpo no puede estar vacío")
      .max(500, "El cuerpo no puede superar 500 caracteres")
      .refine(noHtml, "El cuerpo no puede contener código HTML"),
    link: avisoLinkSchema.optional(),
    campus: z
      .array(
        z
          .string()
          .min(1)
          .refine(noHtml, "El nombre de campus no puede contener código HTML"),
      )
      .optional(),
    publishedAt: z
      .string()
      .refine(
        isValidIsoDate,
        "publishedAt debe ser una fecha ISO 8601 con offset (ej. 2026-10-02T10:00:00-05:00 o Z)",
      ),
    expiresAt: z
      .string()
      .refine(
        isValidIsoDate,
        "expiresAt debe ser una fecha ISO 8601 con offset (ej. 2026-10-02T10:00:00-05:00 o Z)",
      )
      .optional(),
    pinned: z.boolean().default(false),
    minBuild: z
      .number()
      .int()
      .positive("minBuild debe ser un entero positivo")
      .optional(),
    maxBuild: z
      .number()
      .int()
      .positive("maxBuild debe ser un entero positivo")
      .optional(),

    // Campos internos / de moderación (permitidos en content, excluidos del JSON público)
    ejemplo: z.boolean().default(false).optional(),
    consentimiento: z.unknown().optional(),
    contactoDueno: z.unknown().optional(),
    notas: z.unknown().optional(),
  })
  .refine(
    (data) => {
      if (data.expiresAt) {
        return (
          new Date(data.expiresAt).getTime() >
          new Date(data.publishedAt).getTime()
        );
      }
      return true;
    },
    {
      message: "expiresAt debe ser estrictamente posterior a publishedAt",
      path: ["expiresAt"],
    },
  )
  .refine(
    (data) => {
      if (data.minBuild !== undefined && data.maxBuild !== undefined) {
        return data.maxBuild >= data.minBuild;
      }
      return true;
    },
    {
      message: "maxBuild debe ser mayor o igual a minBuild",
      path: ["maxBuild"],
    },
  );

export type AvisoInput = z.infer<typeof avisoSchema>;

export interface PublicAvisoItem {
  id: string;
  type: AvisoType;
  title: string;
  body: string;
  link?: { url: string; label: string };
  campus?: string[];
  publishedAt: string;
  expiresAt?: string;
  pinned: boolean;
  minBuild?: number;
  maxBuild?: number;
}

export interface AvisosJsonResponse {
  items: PublicAvisoItem[];
}

// --- 2. NEGOCIOS ---
export const negocioContactSchema = z.object({
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  instagram: z
    .string()
    .refine(isHttpsUrl, "El enlace de Instagram debe usar https://")
    .optional(),
  web: z
    .string()
    .refine(isHttpsUrl, "El enlace web debe usar https://")
    .optional(),
});

export const negocioSchema = z.object({
  id: z
    .string()
    .regex(
      slugRegex,
      "El id debe ser un slug válido (minúsculas, números y guiones)",
    ),
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío")
    .max(60, "El nombre no puede superar 60 caracteres")
    .refine(noHtml, "El nombre no puede contener código HTML"),
  category: z.enum(NEGOCIO_CATEGORIES, {
    message: `La categoría debe ser una de: ${NEGOCIO_CATEGORIES.join(", ")}`,
  }),
  description: z
    .string()
    .min(1, "La descripción no puede estar vacía")
    .max(200, "La descripción no puede superar 200 caracteres")
    .refine(noHtml, "La descripción no puede contener código HTML"),
  address: z
    .string()
    .min(1, "La dirección no puede estar vacía")
    .max(120, "La dirección no puede superar 120 caracteres")
    .refine(noHtml, "La dirección no puede contener código HTML"),
  zone: z
    .string()
    .min(1, "La zona no puede estar vacía")
    .max(40, "La zona no puede superar 40 caracteres")
    .refine(noHtml, "La zona no puede contener código HTML"),
  lat: z
    .number()
    .min(-90)
    .max(90, "Latitud debe estar entre -90 y 90")
    .optional(),
  lng: z
    .number()
    .min(-180)
    .max(180, "Longitud debe estar entre -180 y 180")
    .optional(),
  hours: z
    .string()
    .max(80, "El horario no puede superar 80 caracteres")
    .refine(noHtml, "El horario no puede contener código HTML")
    .optional(),
  contact: negocioContactSchema.optional(),
  logo: z
    .string()
    .regex(
      logoPathRegex,
      "El logo debe ser una ruta relativa local en /api/v1/img/<id>.webp (sin host externo)",
    )
    .optional(),
  verifiedAt: z
    .string()
    .refine(isValidIsoDate, "verifiedAt debe ser una fecha ISO 8601 con offset")
    .optional(),
  updatedAt: z
    .string()
    .refine(isValidIsoDate, "updatedAt debe ser una fecha ISO 8601 con offset"),
  validUntil: z
    .string()
    .refine(
      isValidIsoDate,
      "validUntil es obligatorio y debe ser una fecha ISO 8601 con offset",
    ),

  // Campos internos / de moderación (permitidos en content, excluidos del JSON público)
  ejemplo: z.boolean().default(false).optional(),
  consentimiento: z.unknown().optional(),
  contactoDueno: z.unknown().optional(),
  notas: z.unknown().optional(),
});

export type NegocioInput = z.infer<typeof negocioSchema>;

export interface PublicNegocioItem {
  id: string;
  name: string;
  category: NegocioCategory;
  description: string;
  address: string;
  zone: string;
  lat?: number;
  lng?: number;
  hours?: string;
  contact?: {
    whatsapp?: string;
    phone?: string;
    instagram?: string;
    web?: string;
  };
  logo?: string;
  verifiedAt?: string;
  updatedAt: string;
  validUntil: string;
}

export interface NegociosJsonResponse {
  categories: typeof NEGOCIO_CATEGORIES;
  items: PublicNegocioItem[];
}

// --- 3. ENLACES ---
export const enlaceItemSchema = z.object({
  id: z
    .string()
    .regex(
      slugRegex,
      "El id debe ser un slug válido (minúsculas, números y guiones)",
    ),
  title: z
    .string()
    .min(1, "El título no puede estar vacío")
    .max(60, "El título no puede superar 60 caracteres")
    .refine(noHtml, "El título no puede contener código HTML"),
  url: z.string().refine(isHttpsUrl, "La URL debe usar el protocolo https://"),
  description: z
    .string()
    .max(120, "La descripción no puede superar 120 caracteres")
    .refine(noHtml, "La descripción no puede contener código HTML")
    .optional(),
  updatedAt: z
    .string()
    .refine(isValidIsoDate, "updatedAt debe ser una fecha ISO 8601 con offset"),
  ejemplo: z.boolean().default(false).optional(),
  notas: z.unknown().optional(),
});

export const enlaceGroupSchema = z.object({
  id: z.string().regex(slugRegex).optional(),
  title: z
    .string()
    .min(1, "El título del grupo no puede estar vacío")
    .max(40, "El título del grupo no puede superar 40 caracteres")
    .refine(noHtml, "El título del grupo no puede contener código HTML"),
  order: z.number().int().default(0).optional(),
  items: z
    .array(enlaceItemSchema)
    .min(1, "El grupo debe contener al menos un enlace"),
  ejemplo: z.boolean().default(false).optional(),
  notas: z.unknown().optional(),
});

export type EnlaceGroupInput = z.infer<typeof enlaceGroupSchema>;

export interface PublicEnlaceItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  updatedAt: string;
}

export interface PublicEnlaceGroup {
  title: string;
  items: PublicEnlaceItem[];
}

export interface EnlacesJsonResponse {
  groups: PublicEnlaceGroup[];
}

// --- 4. UPDATE ---
export const updateSchema = z
  .object({
    id: z.string().optional(),
    latestVersion: z
      .string()
      .min(1, "latestVersion no puede estar vacío")
      .regex(
        /^\d+\.\d+\.\d+(?:-[\w.]+)?$/,
        "latestVersion debe seguir versionado semántico (ej. 1.1.0)",
      ),
    latestBuild: z
      .number()
      .int()
      .positive("latestBuild debe ser un entero positivo"),
    minSupportedBuild: z
      .number()
      .int()
      .positive("minSupportedBuild debe ser un entero positivo"),
    publishedAt: z
      .string()
      .refine(
        isValidIsoDate,
        "publishedAt debe ser una fecha ISO 8601 con offset",
      ),
    notes: z
      .array(
        z
          .string()
          .min(1)
          .refine(noHtml, "Las notas no pueden contener código HTML"),
      )
      .min(1, "Debe incluir al menos una nota de versión"),
    downloadPage: z
      .string()
      .refine(
        isHttpsUrl,
        "downloadPage debe ser una URL HTTPS (no enlace directo de APK)",
      ),
    ejemplo: z.boolean().default(false).optional(),
    notas: z.unknown().optional(),
  })
  .refine((data) => data.latestBuild >= data.minSupportedBuild, {
    message: "latestBuild debe ser mayor o igual a minSupportedBuild",
    path: ["minSupportedBuild"],
  });

export type UpdateInput = z.infer<typeof updateSchema>;

export interface UpdateJsonResponse {
  latestVersion: string;
  latestBuild: number;
  minSupportedBuild: number;
  publishedAt: string;
  notes: string[];
  downloadPage: string;
}

// --- 5. MANIFEST ---
export interface ManifestFileEntry {
  path: string;
  sha256: string;
  updatedAt: string;
}

export interface ManifestJsonResponse {
  schemaVersion: 1;
  generatedAt: string;
  files: {
    update: ManifestFileEntry;
    avisos: ManifestFileEntry;
    negocios: ManifestFileEntry;
    enlaces: ManifestFileEntry;
  };
}

// ============================================================================
// FUNCIONES DE LIMPIEZA PARA EXCLUIR DATOS INTERNOS
// ============================================================================

export function toPublicAviso(raw: AvisoInput): PublicAvisoItem {
  const item: PublicAvisoItem = {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    body: raw.body,
    publishedAt: raw.publishedAt,
    pinned: Boolean(raw.pinned),
  };
  if (raw.link) item.link = { url: raw.link.url, label: raw.link.label };
  if (raw.campus && raw.campus.length > 0) item.campus = raw.campus;
  if (raw.expiresAt) item.expiresAt = raw.expiresAt;
  if (raw.minBuild !== undefined) item.minBuild = raw.minBuild;
  if (raw.maxBuild !== undefined) item.maxBuild = raw.maxBuild;
  return item;
}

export function toPublicNegocio(raw: NegocioInput): PublicNegocioItem {
  const item: PublicNegocioItem = {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    description: raw.description,
    address: raw.address,
    zone: raw.zone,
    updatedAt: raw.updatedAt,
    validUntil: raw.validUntil,
  };
  if (raw.lat !== undefined) item.lat = raw.lat;
  if (raw.lng !== undefined) item.lng = raw.lng;
  if (raw.hours) item.hours = raw.hours;
  if (raw.contact) {
    const contactObj: NonNullable<PublicNegocioItem["contact"]> = {};
    if (raw.contact.whatsapp) contactObj.whatsapp = raw.contact.whatsapp;
    if (raw.contact.phone) contactObj.phone = raw.contact.phone;
    if (raw.contact.instagram) contactObj.instagram = raw.contact.instagram;
    if (raw.contact.web) contactObj.web = raw.contact.web;
    if (Object.keys(contactObj).length > 0) item.contact = contactObj;
  }
  if (raw.logo) item.logo = raw.logo;
  if (raw.verifiedAt) item.verifiedAt = raw.verifiedAt;
  return item;
}

export function toPublicEnlaceGroup(
  raw: EnlaceGroupInput,
  includeExamples = false,
): PublicEnlaceGroup | null {
  const items = raw.items
    .filter((it) => includeExamples || !it.ejemplo)
    .map((it) => {
      const publicIt: PublicEnlaceItem = {
        id: it.id,
        title: it.title,
        url: it.url,
        updatedAt: it.updatedAt,
      };
      if (it.description) publicIt.description = it.description;
      return publicIt;
    });

  if (items.length === 0) return null;

  return {
    title: raw.title,
    items,
  };
}

export function toPublicUpdate(raw: UpdateInput): UpdateJsonResponse {
  return {
    latestVersion: raw.latestVersion,
    latestBuild: raw.latestBuild,
    minSupportedBuild: raw.minSupportedBuild,
    publishedAt: raw.publishedAt,
    notes: raw.notes,
    downloadPage: raw.downloadPage,
  };
}
