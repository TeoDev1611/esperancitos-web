# Pilas! Links — Enlaces Universales Zero-Backend y Protocolo Binario PB2

**Proyecto:** Pilas! (Web + App Móvil Flutter/Dart)  
**Última actualización:** 12 de noviembre de 2026  
**Estado:** Implementado en web (SSR en Vercel + procesamiento cliente), pruebas unitarias aprobadas (`60/60`)

---

## 1. Visión General

**Pilas! Links** permite compartir horarios, tareas, checklists, lotes de materiales, kits de paralelo y juntas de estudio mediante enlaces HTTPS compactos (`?d=...`) sin almacenar datos de usuarios ni payloads en bases de datos o servidores (**arquitectura Zero-Backend**).

Toda la información viaja codificada en el parámetro `?d=` de la URL:
- En SSR (`export const prerender = false` con `@astrojs/vercel`), Astro decodifica `?d=` únicamente en memoria para renderizar la vista web e imprimir metadatos Open Graph dinámicos (nunca registra ni persiste `?d=`).
- Las acciones interactivas (comparador de horarios, exportación `.ics`, progreso de checklists en `localStorage`, generación de código QR en `<canvas>`) se ejecutan 100 % en el navegador del usuario.

---

## 2. Rutas Web, Deep Links y App Links

| Tipo PB2 | Ruta Web HTTPS | Alias | Deep Link móvil (`pilas://`) | Contenido del QR en web |
| :--- | :--- | :--- | :--- | :--- |
| `1` | `/amigo` | `/a` | `pilas://friend?d=...` | `https://<origin>/amigo?d=...` |
| `2` | `/tarea` | — | `pilas://tarea?d=...` | `https://<origin>/tarea?d=...` |
| `3` | `/tareas` | — | `pilas://tareas?d=...` | `https://<origin>/tareas?d=...` |
| `4` | `/materiales` | — | `pilas://materiales?d=...` | `https://<origin>/materiales?d=...` |
| `5` | `/curso` | — | `pilas://curso?d=...` | `https://<origin>/curso?d=...` |
| `6` | `/junta` | — | `pilas://junta?d=...` | `https://<origin>/junta?d=...` |

### Archivos de interfaz y rutas
- **Páginas SSR:** `src/pages/amigo.astro`, `src/pages/a.astro`, `src/pages/tarea.astro`, `src/pages/tareas.astro`, `src/pages/materiales.astro`, `src/pages/curso.astro`, `src/pages/junta.astro`.
- **Layout y componentes compartidos:** `src/layouts/UniversalLinkLayout.astro`, `src/components/links/AmigoRouteView.astro`, `src/components/links/PlatformActions.astro`, `src/components/links/LinkStateCard.astro`, `src/styles/universal-links.css`.
- **Scripts de cliente:** `src/scripts/universal-link-actions.ts`, `src/scripts/amigo-page.ts`, `src/scripts/tarea-page.ts`, `src/scripts/tareas-page.ts`, `src/scripts/junta-page.ts`.
- **Exclusión SEO:** `astro.config.mjs` excluye los 7 prefijos y `/api/og` del sitemap; las cabeceras HTTP y `<meta name="robots">` envían `noindex, nofollow`.

### Comportamiento por plataforma (`universal-link-actions.ts`)
1. **Detección:** Prioriza `navigator.userAgentData?.platform` (UA-CH) y hace fallback a `navigator.userAgent` + `maxTouchPoints` (para detectar iPadOS).
2. **Android:** Dispara `pilas://<deepPath>?d=<encoded>`. Si la pestaña sigue visible tras `1350 ms`, consulta `/api/v1/update.json` para mostrar el fallback de descarga oficial.
3. **iOS / iPadOS:** Oculta por completo botones de `.apk` y muestra guía para instalar como PWA (*Compartir → Agregar a pantalla de inicio*) más exportación a Apple Calendar (`.ics`).
4. **Escritorio (PC):** Prioriza el código QR escaneable (generado en `<canvas>` con `qrcode`) y el botón de copiar enlace para WhatsApp.

### Verificación nativa (`.well-known`)
- **Android App Links:** `public/.well-known/assetlinks.json` (`package_name: "dev.teodev.pilas"`).
- **iOS Universal Links:** `public/.well-known/apple-app-site-association`.
- **Cabeceras Vercel:** `vercel.json` sirve `/.well-known/*` con `Content-Type: application/json; charset=utf-8`.

> [!IMPORTANT]
> Antes de habilitar App Links / Universal Links en producción, sustituye los placeholders pendientes:
> - `<PEGAR_SHA256_KEYSTORE_RELEASE>` en `public/.well-known/assetlinks.json` por la huella SHA-256 real del keystore de release (y Play App Signing si aplica).
> - `<APPLE_TEAM_ID>.com.esperancitos.esperancitos` en `public/.well-known/apple-app-site-association` por el Team ID y Bundle ID definitivos si se compila para iOS.

---

## 3. Especificación del Protocolo Binario PB2 (`src/lib/pilasCodec.ts`)

### A. Envolturas (`?d=`) y retrocompatibilidad
`openEnvelope` soporta los siguientes formatos en orden:
1. **`H4sI...` (`v1-gzip`):** JSON legado comprimido con Gzip y codificado en Base64/Base64Url (soportado para `/amigo`, `/tareas` y `/materiales`).
2. **`2...` (`pb2-deflate`):** Payload binario PB2 comprimido con **Raw Deflate** (`deflate-raw`, sin cabecera zlib) en Base64Url sin padding `=`.
3. **`3...` (`pb2-raw`):** Payload binario PB2 sin comprimir en Base64Url sin padding `=`.
4. **Fallback `/tareas` (`v1-json`):** JSON plano `{ app: 'esp', v: 1, ... }` en Base64Url.
5. **Fallback `/materiales` (`v1-zlib`):** JSON comprimido con zlib estándar (`(byte0 & 0x0f) === 8`).

`extractRawDFromUrl` y `extractPilasParam` preservan signos `+` literales antes de usar `URLSearchParams` para no corromper enlaces legacy `H4sI...` compartidos sin `%2B`.

### B. Límites de seguridad (anti zip-bomb)
- `MAX_INPUT_LENGTH = 16_384` caracteres en `?d=`.
- `MAX_DECODED_BYTES = 131_072` bytes (128 KB) máximos al descomprimir (verificados en streaming con `DecompressionStream` y con fallback a `fflate` para navegadores sin `deflate-raw`).
- Límite de colección: máx. 256 materias / 512 bloques en Tipo 1, 500 ítems en Tipo 3, 500 archivos en Tipo 4, 200 participantes en Tipo 6.

### C. Primitivas binarias
- **Enteros `varint`:** 7 bits por byte en little-endian (máx. 7 bytes).
- **Fechas compactas (`EPOCH_BASE_SEC = 1_577_836_800`):** `varint` de segundos transcurridos desde `2020-01-01T00:00:00Z`.
- **Strings (`writeTokenString` / `readTokenString`):** longitud en `varint` + bytes UTF-8 con sustitución estática mediante `DIC_PB2` (`0x01..0x1F`, **omitiendo `0x0A`** para preservar `\n`).
- **Universidades y campus sin catálogo estático:** Tanto `university` como `campus` se codifican y decodifican **directamente con `writeTokenString` / `readTokenString`** (sin tablas fijas ni byte `tag` de catálogo), evitando limitar el soporte multi-universidad o acoplar índices entre web y móvil.
- **Checksum `fnv1a32`:** FNV-1a de 32 bits calculado sobre los bytes **UTF-8** (`TextEncoder`), usando multiplicación sin desbordamiento de 53 bits en JS (`low = hash * 403; high = (hash & 0xff) * 16777216`) para paridad exacta con Dart VM.

### D. Estructura exacta de los 6 tipos PB2 (`bytes[0] = type`, `bytes[1] = flags`)

1. **Tipo 1 — `/amigo` (`pilas://friend`):**
   - `flags`: `0x01` university, `0x02` career, `0x04` campus, `0x08` period, `0x10` statusNote, `0x20` isPrivateMode, `0x40` extendedSlots, `0x80` level.
   - Campos: `friendName` → `university (0x01)` → `campus (0x04)` → `career (0x02)` → `period (0x08)` → `statusNote (0x10)` → `level (0x80, 1 byte)` → `lastSharedAt` → `scheduleHash (uint32)` → `courseCount` → lista de cursos (`s`, `r`, `t`, `n`, `m`) → `slotCount` → lista de bloques:
     - Modo compacto (`!(flags & 0x40)`): `uint24` con `[d:3][s5:8][d5:6][slotMod:2][courseIdx:5]`, donde `d` es `1..7` (`1 = Lunes`), `startMin = 300 + s5 * 5` y `endMin = startMin + d5 * 5`.
     - Modo extendido (`flags & 0x40`): byte `(d << 2) | slotMod` + 3 `varint` (`startMinutes`, `endMinutes`, `courseIdx`).
2. **Tipo 2 — `/tarea`:**
   - `flags`: `0x01` description, `0x02` sourceUrl, `0x04` author, `0x08` university.
   - Campos: `title` → `subject` → `dueDate` → `createdAt` → `university (0x08)` → `author (0x04)` → `description (0x01)` → `sourceUrl (0x02)`.
3. **Tipo 3 — `/tareas`:**
   - `flags`: `0x01` author.
   - Campos: `title` → `subject` → `author (0x01)` → `createdAt` → `count` → ítems (`itemFlags`: `0x01` isPriority, `0x02` hasDue; `title`; `dueDate` si `0x02`).
4. **Tipo 4 — `/materiales`:**
   - `flags`: `0x01` sectionName.
   - Campos: `courseId (varint)` → `courseName` → `sectionName (0x01)` → `createdAt` → `fileCount` → archivos (`itemFlags`: `0x01` hasMime; `filename`; `fileurl`; `filesize (varint)`; `mimetype` si `0x01`).
5. **Tipo 5 — `/curso`:**
   - `flags`: `0x01` university, `0x02` campus, `0x04` nrc, `0x08` teacher, `0x10` scheduleSummary, `0x20` author, `0x40` courseId.
   - `linkMask` (tercer byte): `0x01` whatsappUrl, `0x02` driveUrl, `0x04` meetingUrl, `0x08` customUrl.
   - Campos: `linkMask` → `courseName` → `courseId (0x40)` → `createdAt` → `university (0x01)` → `campus (0x02)` → `nrc (0x04)` → `teacher (0x08)` → `scheduleSummary (0x10)` → `author (0x20)` → URLs según `linkMask`.
6. **Tipo 6 — `/junta`:**
   - `flags`: `0x01` isVirtual, `0x02` location, `0x04` meetingUrl, `0x08` organizer, `0x10` campus, `0x20` notes.
   - Campos: `title` → `startAt` → `durationMinutes (varint)` → `location (0x02)` → `meetingUrl (0x04)` → `organizer (0x08)` → `campus (0x10)` → `notes (0x20)` → `participantCount` → `participants[]`.

---

## 4. Seguridad, Privacidad y Generación de Assets

- **Saneamiento de URLs (`inspectPublicUrl`):** solo permite `http:`/`https:`, rechaza credenciales embebidas (`user:pass@`), bloquea `javascript:`, `data:`, `vbscript:` y elimina automáticamente parámetros sensibles de sesión (`token`, `wstoken`, `privatetoken`, `private_token`, `sesskey`, `password`, `pass`, `passwd`, `key`, `moodlesession`, `moodle_session`).
- **Modo Privado (`/amigo`):** cuando `isPrivateMode = true` o las materias coinciden con `ANONYMIZED_SUBJECT_RE`, la vista web, el exportador `.ics` y las tarjetas Open Graph nunca fabrican ni muestran aulas, docentes o materias ocultas.
- **Open Graph dinámico (`/api/og/[kind]`):** genera tarjetas PNG `1200x630` en `@vercel/og` (con `stripNonLatinForOg` para evitar errores de glifos en Satori) y fallback PNG automático si `?d=` está corrupto o vacío.
- **Calendario RFC 5545 (`src/lib/pilasLinks/ics.ts`):** genera archivos `.ics` con `VTIMEZONE` `America/Guayaquil` (`UTC-05:00`), CRLF, folding a ≤ 75 caracteres y alarmas `VALARM` para horarios, entregas y juntas.
- **Serialización segura en HTML:** `safeJsonScriptContent` escapa `<`, `>`, `&`, `\u2028` y `\u2029` dentro de `<script type="application/json">`.

---

## 5. Pruebas Automatizadas

Ejecutar con `npm test` (`vitest run`):
- `tests/pilas-codec.test.ts`: paridad `fnv1a32`, 8 vectores de referencia PB2 y v1 (`src/lib/pilasLinks/sample-payloads.ts`), round-trip de los 6 tipos, límites anti zip-bomb y saneamiento de URLs.
- `tests/og-endpoint.test.ts`: renderizado PNG `1200x630` para las 7 variantes (`/api/og/{amigo,a,tarea,tareas,materiales,curso,junta}`), sufijo `.png`, fallback y 404.
- `tests/ics-and-sanitize.test.ts`: validez RFC 5545, privacidad en `.ics`, alarmas, saneamiento de URLs y OG privado.
- `tests/schedule-compare.test.ts`: fusión de intervalos, cálculo de huecos libres comunes (`≥ 30 min` en ventana `07:00–20:00`), detección de materias coincidentes respetando privacidad y formato para WhatsApp.
