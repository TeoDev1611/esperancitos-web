# Esperancitos — Landing Page

Sitio web oficial (una sola página) de **Esperancitos**, la app estudiantil todo-en-uno para la
comunidad de la **Universidad de las Fuerzas Armadas ESPE**.

Construido con [Astro](https://astro.build) y CSS puro. Sin frameworks de UI, sin trackers.

---

## 🚀 Comandos

```sh
npm install             # Instala dependencias
npm run dev             # Servidor de desarrollo en http://localhost:4321
npm run build           # Compila el sitio estático en ./dist/
npm run preview         # Previsualiza el build de producción
npm run validate:content # Valida colecciones de comunidad sin compilar
```

### Herramientas de recursos (`tools/`)

Solo hay que ejecutarlas cuando cambien los archivos de origen:

```sh
python tools/build_assets.py   # Tarjeta social, favicons, WebP y miniatura del QR
python tools/fetch_fonts.py    # Descarga las fuentes a public/fonts y regenera fonts.css
```

| Script            | Qué regenera                                                                                                                                  |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `build_assets.py` | `og-esperancitos.jpg` (1200x630), `favicon.ico`, `apple-touch-icon.png`, `icon-192/512.png`, los `.webp` de los mockups y la miniatura del QR |
| `fetch_fonts.py`  | Los `.woff2` de `public/fonts/` y `src/styles/fonts.css`                                                                                      |

---

## ⚙️ Qué debes configurar antes de publicar

Todo lo que necesitas tocar está centralizado en `src/config/`. **No hay textos
que editar dentro de los componentes.**

| Archivo                   | Qué contiene                                                                    | Qué cambiar                                            |
| :------------------------ | :------------------------------------------------------------------------------ | :----------------------------------------------------- |
| `src/config/site.ts`      | Dominio, título, descripción, keywords, versión del APK, huellas SHA-256, autor | El dominio si migras; las huellas si recompilas la app |
| `src/config/donation.ts`  | Enlace de **Deuna** y QR                                                        | `deunaLink`, `qrImage` y la miniatura `qrThumbImage`   |
| `src/config/feedback.ts`  | Formularios de **errores**, **sugerencias** y encuesta                          | El campo `url` de cada canal                           |
| `src/config/faq.ts`       | Preguntas frecuentes                                                            | Añadir o editar preguntas                              |
| `src/config/community.ts` | Formulario de postulación de negocios y correo de reportes                      | `NEGOCIOS_FORM_URL` y `COMUNIDAD_REPORTE_EMAIL`        |

### Apoyo al proyecto (Deuna)

En `src/config/donation.ts`:

```ts
deunaLink: "https://deuna.app/tu-enlace-de-cobro", // tu enlace real
qrImage: "/images/qr-donacion.jpg",               // QR grande (se muestra a 240 px)
qrThumbImage: "/images/qr-donacion-thumb.png",    // miniatura para el héroe y el modal
```

- Si dejas `deunaLink` vacío, el botón se sustituye por un aviso y queda solo el QR.
- **Al cambiar el QR principal, vuelve a ejecutar `python tools/build_assets.py`**
  para regenerar la miniatura.

### Formularios de reporte y sugerencias

En `src/config/feedback.ts`, pega el enlace de tu formulario (Google Forms, Tally,
Microsoft Forms…) en el campo `url` de cada canal:

```ts
{ id: 'bug',     label: 'Reportar un error',   url: '' /* <-- aquí */, ... },
{ id: 'feature', label: 'Sugerir una idea',    url: '' /* <-- aquí */, ... },
```

- Con `url` vacía, el botón se muestra **deshabilitado** con la etiqueta "Próximamente".
- El canal `survey` tiene `optional: true`, así que **se oculta** mientras no tenga enlace.

### Postulación y reportes de negocios

En `src/config/community.ts`:

```ts
export const NEGOCIOS_FORM_URL = ""; // Enlace a tu Google Forms o Tally (vacío = oculta el botón)
export const COMUNIDAD_REPORTE_EMAIL = "teo.hurtado.16@gmail.com";
```

---

## 🌐 API Estática de Comunidad (`/api/v1/`)

El sitio genera en build una API estática JSON bajo `https://esperancitos.app/api/v1/` consultada por la aplicación móvil y las páginas públicas `/avisos` y `/negocios`:

- `manifest.json`: Índice con huellas SHA-256 y fecha de actualización de cada archivo.
- `update.json`: Información de versión, notas y enlace a la página de descarga.
- `avisos.json`: Avisos comunitarios vigentes (fijados primero y por fecha descendente).
- `negocios.json`: Directorio de negocios y servicios estudiantiles por categoría y nombre.
- `enlaces.json`: Enlaces de interés agrupados por categorías.

Para la especificación técnica completa, consulta [docs/COMMUNITY_API.md](docs/COMMUNITY_API.md).

### 📝 Cómo agregar contenido

1. **Aviso:** Crea un archivo en `src/content/avisos/<slug>.json` con `id`, `type` (`info|evento|mantenimiento|importante`), `title` (≤80), `body` (≤500 texto plano), `publishedAt` (ISO 8601 con offset), `pinned` (bool) y opcionalmente `link`, `campus` y `expiresAt`.
2. **Negocio:** Crea un archivo en `src/content/negocios/<slug>.json` con `id`, `name` (≤60), `category` (`comida|copias|papeleria|transporte|vivienda|salud|servicios|otros`), `description` (≤200), `address` (≤120), `zone` (≤40), `updatedAt` y `validUntil` (obligatorio). Opcionalmente `lat`, `lng`, `hours`, `contact`, `verifiedAt` y `logo` (`/api/v1/img/<id>.webp` con logo en WebP ≤60 KB en `public/api/v1/img/`).
3. **Enlace:** Edita o crea un grupo en `src/content/enlaces/<grupo>.json` con `title` (≤40) y lista de `items` (URL https obligatoria).
4. **Nueva versión de app:** Edita `src/content/update/current.json` actualizando `latestVersion`, `latestBuild`, `minSupportedBuild`, `notes` y `publishedAt`.
5. **Retirar un listado:** Elimina el archivo de contenido (y su logo si existe) o coloca su `expiresAt`/`validUntil` en una fecha pasada.

> **Datos internos:** Los campos `consentimiento`, `contactoDueno` y `notas` están permitidos para control administrativo y moderación en los archivos de `src/content/`, pero **se excluyen automáticamente del JSON público y de las páginas web**.

### 🛡️ Política de moderación y verificación

- **Aprobación:** Solo se aprueban servicios legales, verificables y de utilidad directa para estudiantes en las zonas aledañas a los campus de la ESPE.
- **Caducidad obligatoria (`validUntil`):** Todos los negocios caducan (máximo 6 meses) para garantizar que los datos sigan vigentes. Si un negocio no confirma sus datos antes de vencer, deja de compilarse automáticamente.
- **Verificación (`verifiedAt`):** Solo se añade cuando se ha verificado presencialmente o mediante contacto directo con el dueño la existencia del local.

### ⚠️ Regla de Oro: Gratuidad total vs. Publicidad

> **COBRAR POR LISTADOS O POSICIONES CONVERTIRÍA EL SITIO EN PUBLICITARIO.**
>
> Si alguna vez se cobrara por publicar o posicionar negocios:
>
> 1. Se rompería la naturaleza no lucrativa y comunitaria de Esperancitos.
> 2. Se violarían las políticas de uso gratuito de la mayoría de plataformas de hosting (como Vercel Hobby), obligando a pagar planes comerciales Pro/Enterprise.
> 3. Requeriría cambiar radicalmente los términos legales del sitio, emitir facturas con el SRI y gestionar obligaciones tributarias comerciales.
>
> Por tanto, **todos los listados son gratuitos** y el orden de aparición es neutral (alfabético y por categoría), sin favoritismos ni cobros de ninguna índole.

### 🧪 Validación de contenido sin compilar

Antes de subir cambios, valida la sintaxis, límites y unicidad de IDs ejecutando:

```sh
npm run validate:content
```

---

## 🔍 SEO

- **Metadatos completos**: canonical, robots, Open Graph (con dimensiones de imagen),
  Twitter Card y geoetiquetas.
- **Datos estructurados JSON-LD**: `SoftwareApplication`, `WebSite`, `FAQPage` y
  `BreadcrumbList`. El `FAQPage` se genera desde `src/config/faq.ts`, la misma
  fuente que el acordeón visible, así que nunca se contradicen.
- **Archivos estáticos**: `public/robots.txt`, `public/sitemap.xml` y
  `public/site.webmanifest`.
- **Imagen social**: `public/images/og-esperancitos.jpg`, 1200x630. Generada por
  `tools/build_assets.py`.

> ⚠️ Si cambias el dominio, actualízalo en **tres** sitios: `astro.config.mjs` (`site`),
> `src/config/site.ts` y los archivos estáticos `robots.txt` / `sitemap.xml`.

> ⚠️ Si añades páginas nuevas, agrégalas a `public/sitemap.xml` y a la navegación del
> `Header`/`Footer` con enlaces absolutos (`/#seccion`), no relativos, para que
> funcionen desde cualquier ruta.

---

## 🗂️ Estructura

```text
public/
├── api/v1/img/                   # Logos WebP de negocios locales (≤ 60 KB)
├── fonts/                        # Fuentes autoalojadas (.woff2)
├── images/                       # Capturas, QR y tarjeta social
├── downloads/                    # APK publicados
├── favicon.svg / favicon.ico     # Iconos
├── icon-192.png / icon-512.png   # Iconos PWA
├── site.webmanifest
└── robots.txt / sitemap.xml      # Indexación y sitemap
scripts/
└── validate-content.mjs          # Validador de contenido sin compilar
src/
├── components/                   # Componentes visuales de la interfaz
├── config/                       # Centralización de configuración editable
│   ├── site.ts
│   ├── donation.ts
│   ├── feedback.ts
│   ├── faq.ts
│   └── community.ts              # URL de postulación y correo de reportes
├── content/                      # Colecciones de contenido de comunidad
│   ├── avisos/                   # Comunicados y eventos (.json)
│   ├── negocios/                 # Directorio de servicios (.json)
│   ├── enlaces/                  # Enlaces por grupos (.json)
│   └── update/                   # Novedades y versión de la app (.json)
├── lib/
│   ├── community-contract.ts     # Esquemas Zod y tipos del contrato API v1
│   └── community-payloads.ts     # Carga y serialización determinista
├── layouts/
│   ├── BaseLayout.astro          # <head>, SEO, header, footer y modal
│   └── Layout.astro              # Envoltorio de la home
├── pages/
│   ├── api/v1/                   # Endpoints estáticos de la API v1
│   │   ├── manifest.json.ts      # Índice con SHA-256 de archivos
│   │   ├── update.json.ts        # Control de versiones y notas
│   │   ├── avisos.json.ts        # Avisos comunitarios
│   │   ├── negocios.json.ts      # Directorio de negocios
│   │   └── enlaces.json.ts       # Enlaces recomendados
│   ├── index.astro               # Landing page principal
│   ├── avisos.astro              # Tablón público de avisos
│   ├── negocios.astro            # Directorio público con buscador
│   └── privacidad.astro          # Política de privacidad actualizada
├── styles/
│   ├── global.css                # Design system y animaciones
│   └── fonts.css                 # @font-face (generado)
├── content.config.ts             # Configuración de Content Layer Astro
tools/
├── build_assets.py               # Genera imágenes, favicons y WebP
└── fetch_fonts.py                # Descarga las fuentes a public/fonts
vercel.json                       # Cabeceras de caché y seguridad para /api/v1/*
```

---

## ♿ Accesibilidad y rendimiento

- Enlace "saltar al contenido", foco visible de alto contraste y `aria-label` en botones.
- Tablists navegables con teclado (flechas, Home, End).
- `prefers-reduced-motion` respetado en **todas** las animaciones.
- Fuentes autoalojadas: sin conexiones a Google y sin bloqueo de renderizado.
- Imágenes en WebP con reserva JPEG y `width`/`height` declarados para evitar saltos de layout.
- CSS y JS se compilan e inclusionan en un único archivo; sin dependencias de runtime.
