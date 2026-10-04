# 🌐 API Estática de Comunidad y Directorio (v1)

Especificación completa del sistema de contenido estático de **Esperancitos** para avisos, directorio de negocios, enlaces útiles y control de versiones de la aplicación.

---

## 1. Arquitectura y Principios de Diseño

El sistema opera completamente como **archivos JSON estáticos generados en tiempo de compilación (build-time)**.
No requiere servidores backend, base de datos ni funciones serverless en tiempo de ejecución.

- **Base URL:** `https://esperancitos.app/api/v1/`
- **Formato:** Solo JSON UTF-8, estrictamente sobre HTTPS.
- **Sin servidores intermedios:** El hosting actúa como una CDN estática de alto rendimiento.
- **Límites de tamaño por contrato:**
  - Cada archivo JSON: `<= 200 KB`.
  - Cada logotipo en WebP: `<= 60 KB`.
- **Cabeceras de red (`vercel.json`):**
  - `Content-Type: application/json; charset=utf-8`
  - `X-Content-Type-Options: nosniff`
  - `Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=86400`
  - **Sin CORS abierto** (`Access-Control-Allow-Origin: *` omitido intencionalmente).

---

## 2. Contrato API v1

### 2.1. `manifest.json`
El cliente móvil consulta este archivo primero enviando la cabecera `If-None-Match` (ETag) o comparando hashes. Contiene la huella criptográfica SHA-256 de cada recurso y su fecha de última actualización:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-10-02T10:00:00-05:00",
  "files": {
    "update": {
      "path": "update.json",
      "sha256": "98c3c6345120a1... (64 hex)",
      "updatedAt": "2026-10-02T10:00:00-05:00"
    },
    "avisos": {
      "path": "avisos.json",
      "sha256": "8d405f1411e5b2...",
      "updatedAt": "2026-10-01T08:00:00-05:00"
    },
    "negocios": {
      "path": "negocios.json",
      "sha256": "6876d3dec53d81...",
      "updatedAt": "2026-10-01T10:00:00-05:00"
    },
    "enlaces": {
      "path": "enlaces.json",
      "sha256": "bc8cb1743a95c3...",
      "updatedAt": "2026-10-01T08:00:00-05:00"
    }
  }
}
```

### 2.2. `update.json`
Indica la versión más reciente publicada, notas de versión y la página de descarga. No contiene enlaces directos a archivos APK; la aplicación redirige al usuario a la página web en su navegador:

```json
{
  "latestVersion": "1.1.0",
  "latestBuild": 12,
  "minSupportedBuild": 8,
  "publishedAt": "2026-10-02T10:00:00-05:00",
  "notes": [
    "Sincronización mejorada de horarios y aulas de Banner",
    "Consulta offline de avisos y novedades comunitarias"
  ],
  "downloadPage": "https://esperancitos.app/#descargar"
}
```

### 2.3. `avisos.json`
Lista de avisos y comunicados estudiantiles vigentes.
- **Orden determinista:** Fijados (`pinned: true`) primero y luego por fecha `publishedAt` descendente (más recientes primero).
- **Caducidad:** Entradas con `expiresAt` en el pasado al momento de compilar son excluidas automáticamente del JSON público.

```json
{
  "items": [
    {
      "id": "bienvenida-semestre",
      "type": "info",
      "title": "Bienvenida al período académico Octubre 2026",
      "body": "Te damos la bienvenida al nuevo ciclo en la ESPE. Recuerda verificar tu horario.",
      "campus": ["presencial", "virtual"],
      "publishedAt": "2026-10-01T08:00:00-05:00",
      "expiresAt": "2026-12-31T23:59:59-05:00",
      "pinned": true,
      "minBuild": 8
    }
  ]
}
```

### 2.4. `negocios.json`
Directorio de servicios y negocios cercanos a los campus universitarios.
- **Categorías permitidas:** `comida`, `copias`, `papeleria`, `transporte`, `vivienda`, `salud`, `servicios`, `otros`.
- **Orden determinista:** Por categoría (según el orden oficial del contrato) y luego por nombre alfabético (`localeCompare` en español).
- **Caducidad obligatoria:** Todo negocio debe contar con `validUntil`. Si ha vencido, no se compila en el JSON.

```json
{
  "categories": [
    "comida",
    "copias",
    "papeleria",
    "transporte",
    "vivienda",
    "salud",
    "servicios",
    "otros"
  ],
  "items": [
    {
      "id": "polyprint-copias",
      "name": "Copias y Anillados PolyPrint",
      "category": "copias",
      "description": "Impresiones láser, copias B/N y a color frente a la ESPE.",
      "address": "Av. General Rumiñahui y Ambato, local 3",
      "zone": "Frente a Puerta 1",
      "lat": -0.31512,
      "lng": -78.44521,
      "hours": "Lunes a Viernes 07:00 - 18:30",
      "contact": {
        "whatsapp": "+593991234567",
        "phone": "022334455",
        "instagram": "https://instagram.com/polyprint_ejemplo"
      },
      "logo": "/api/v1/img/polyprint-ejemplo.webp",
      "verifiedAt": "2026-10-01T09:00:00-05:00",
      "updatedAt": "2026-10-01T09:00:00-05:00",
      "validUntil": "2026-12-31T23:59:59-05:00"
    }
  ]
}
```

### 2.5. `enlaces.json`
Enlaces académicos y de servicios clasificados por grupos:

```json
{
  "groups": [
    {
      "title": "Sistemas Académicos",
      "items": [
        {
          "id": "miespe-portal",
          "title": "Portal miESPE",
          "url": "https://miespe.espe.edu.ec",
          "description": "Portal institucional para consultar horarios y notas",
          "updatedAt": "2026-10-01T08:00:00-05:00"
        }
      ]
    }
  ]
}
```

---

## 3. Guía de Operaciones y Flujo Editorial

### 3.1. Cómo agregar un aviso
1. Crea un archivo JSON en `src/content/avisos/<slug-estable>.json` (o YAML).
2. Estructura requerida:
```json
{
  "id": "charla-bienestar-estudiantil",
  "type": "evento",
  "title": "Charla sobre bienestar y salud mental",
  "body": "Acompáñanos este viernes en el auditorio del bloque central a las 10:00.",
  "campus": ["presencial"],
  "publishedAt": "2026-10-05T09:00:00-05:00",
  "expiresAt": "2026-10-09T18:00:00-05:00",
  "pinned": false,
  "notas": "Organizado por el club estudiantil"
}
```
3. Ejecuta la validación:
```sh
npm run validate:content
```

### 3.2. Cómo agregar un negocio
1. Si el negocio cuenta con logotipo, optimízalo en formato **WebP**, redimensionalo a un tamaño prudente (ej. 200x200 px), verifica que pese **menos de 60 KB** y guárdalo en `public/api/v1/img/<slug>.webp`.
2. Crea un archivo JSON en `src/content/negocios/<slug-estable>.json`:
```json
{
  "id": "libreria-politecnica",
  "name": "Librería y Útiles Politécnica",
  "category": "papeleria",
  "description": "Cuadernos, calculadoras científicas y material de dibujo técnico.",
  "address": "Calle Ambato 450",
  "zone": "Puerta 2",
  "hours": "Lunes a Viernes 07:30 - 19:00",
  "contact": {
    "whatsapp": "+593980000000",
    "instagram": "https://instagram.com/libreria_poli"
  },
  "logo": "/api/v1/img/libreria-politecnica.webp",
  "updatedAt": "2026-10-02T10:00:00-05:00",
  "validUntil": "2027-04-01T23:59:59-05:00",
  "consentimiento": {
    "otorgado": true,
    "fecha": "2026-10-02",
    "medio": "formulario"
  },
  "contactoDueno": {
    "nombre": "Carlos Morales",
    "telefono": "0980000000"
  },
  "notas": "Local verificado presencialmente"
}
```
> **IMPORTANTE:** Los campos `consentimiento`, `contactoDueno` y `notas` son de uso administrativo interno y **jamás** se exponen en los JSON públicos ni en la web.

### 3.3. Cómo agregar o editar enlaces
1. Dirígete a `src/content/enlaces/` y edita el grupo correspondiente o crea un archivo nuevo.
2. Cada grupo debe contener un `title` (<= 40 car.) y una lista de `items` con `url` sobre HTTPS y `updatedAt`.

### 3.4. Cómo marcar una versión nueva de la aplicación
1. Edita `src/content/update/current.json`:
   - Incrementa `latestVersion` (ej. `1.1.0`).
   - Incrementa `latestBuild` (ej. `13`).
   - Si la actualización incluye cambios críticos en la API o en el inicio de sesión, ajusta `minSupportedBuild` para que versiones antiguas muestren el aviso de actualización requerida.
   - Detalla las novedades en el arreglo `notes` (texto plano, sin HTML).
   - Actualiza `publishedAt` con la fecha y hora de publicación ISO 8601 con offset.
2. Actualiza también `src/config/site.ts` (`version`, `releaseDate`, `primaryApkPath`, `apkChecksums`).

### 3.5. Cómo dar de baja o retirar un listado
Existen dos formas limpias:
1. **Borrado directo:** Elimina el archivo correspondiente en `src/content/avisos/` o `src/content/negocios/` (y su logo en `public/api/v1/img/` si aplica).
2. **Por caducidad:** Ajusta el campo `expiresAt` (en avisos) o `validUntil` (en negocios) a una fecha pasada. El generador estático lo excluirá de inmediato en la siguiente compilación.

---

## 4. Política de Moderación y Verificación

Para mantener la integridad, calidad y seguridad de la información estudiantil, todo contenido debe cumplir estos criterios:

1. **Relevancia Estudiantil:** Los negocios y servicios deben estar dirigidos a la comunidad politécnica y ubicados en el entorno de los campus de la ESPE (Sangolquí, Matriz, IASA, Latacunga, Santo Domingo, etc.) o proveer servicios digitales útiles para estudiantes.
2. **Consentimiento del Propietario:** Solo se publican datos con autorización expresa del titular o administrador del negocio.
3. **Prohibiciones estrictas:**
   - Queda terminantemente prohibido publicar negocios o servicios relacionados con: resolución fraudulenta de exámenes o tareas, venta de alcohol, sustancias ilícitas, contenido para adultos, préstamos informales o actividades contrarias a los reglamentos de la ESPE y leyes de la República del Ecuador.
4. **Caducidad por `validUntil`:**
   - La vigencia estándar es de **3 a 6 meses**.
   - Pasada la fecha `validUntil`, el negocio deja de publicarse para evitar datos obsoletos (locales cerrados, cambios de número, etc.).
   - Para renovar, el propietario debe ratificar la vigencia de sus datos.
5. **Criterio de Verificación (`verifiedAt`):**
   - El distintivo `✓ Verificado` se asigna únicamente cuando un moderador de Esperancitos ha validado presencial o documentalmente la existencia del negocio y la exactitud de su contacto.

---

## 5. Regla Fundamental: Gratuidad y No Publicidad

> ### ⚠️ Advertencia Legal y Operativa
> **Los listados en Esperancitos son 100% gratuitos y de libre acceso.**
> **Está estrictamente prohibido cobrar por publicar o destacar un negocio.**

### ¿Por qué?
1. **Pérdida de la naturaleza no comercial:** Cobrar por listados o posiciones convertiría la aplicación y el sitio en un **medio publicitario comercial**.
2. **Revisión obligatoria del plan de alojamiento:** Las plataformas de hosting actuales (como Vercel Hobby / planes para proyectos personales y no comerciales) **prohíben terminantemente el uso comercial y la venta de espacios publicitarios sin contratar un plan comercial de pago (Pro/Enterprise)**.
3. **Implicaciones legales y tributarias:** Generar ingresos publicitarios exigiría facturación electrónica, RUC comercial, declaraciones tributarias ante el SRI y una reescritura total de la Política de Privacidad y Términos de Servicio.
4. **Independencia y orden neutral:** Los listados se organizan siempre por categoría y en orden alfabético, garantizando equidad para todos los emprendimientos estudiantiles.

---

## 6. Comandos de Validación

Para validar todo el contenido sin compilar ni abrir servidores:

```sh
node scripts/validate-content.mjs
# o
npm run validate:content
```

Para verificar tipos en TypeScript y componentes Astro:
```sh
npm run astro -- check
```

---

## 7. Cláusula de Privacidad y Aviso Legal (App Móvil y Web)

### 📢 Avisos, Comunidad y Actualizaciones en la App Móvil
1. **Archivos Públicos y Estáticos:**  
   La aplicación móvil consulta periódicamente archivos estáticos en formato JSON alojados en `https://esperancitos.vercel.app/api/v1/` (`manifest.json`, `avisos.json`, `negocios.json`, `enlaces.json`, `update.json`).
2. **Cero Datos Personales:**  
   La aplicación **no envía** ningún dato del usuario, identificadores de dispositivo, cookies, credenciales institucionales de Moodle ni tokens de Banner. La cabecera HTTP enviada es transparente (`User-Agent: Esperancitos/<versión>`).
3. **Dirección IP:**  
   Al tratarse de una conexión HTTPS estándar a través de CDN/Vercel, el servidor de alojamiento únicamente registra la dirección IP técnica de la conexión para la entrega del contenido estático, tal como ocurre al visitar cualquier página web en un navegador.
4. **Control Total del Usuario:**  
   El estudiante puede desactivar estas consultas en cualquier momento desde **Ajustes > Comunidad y Avisos > Novedades y comunidad**. Al desactivarlo, la app suspende de forma inmediata y absoluta toda petición de red hacia el servidor de la comunidad.

