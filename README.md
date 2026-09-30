# Esperancitos — Landing Page

Sitio web oficial (una sola página) de **Esperancitos**, la app estudiantil todo-en-uno para la
comunidad de la **Universidad de las Fuerzas Armadas ESPE**.

Construido con [Astro](https://astro.build) y CSS puro. Sin frameworks de UI, sin trackers.

---

## 🚀 Comandos

```sh
npm install       # Instala dependencias
npm run dev       # Servidor de desarrollo en http://localhost:4321
npm run build     # Compila el sitio estático en ./dist/
npm run preview   # Previsualiza el build de producción
```

### Herramientas de recursos (`tools/`)

Solo hay que ejecutarlas cuando cambien los archivos de origen:

```sh
python tools/build_assets.py   # Tarjeta social, favicons, WebP y miniatura del QR
python tools/fetch_fonts.py    # Descarga las fuentes a public/fonts y regenera fonts.css
```

| Script | Qué regenera |
| :--- | :--- |
| `build_assets.py` | `og-esperancitos.jpg` (1200x630), `favicon.ico`, `apple-touch-icon.png`, `icon-192/512.png`, los `.webp` de los mockups y la miniatura del QR |
| `fetch_fonts.py` | Los `.woff2` de `public/fonts/` y `src/styles/fonts.css` |

---

## ⚙️ Qué debes configurar antes de publicar

Todo lo que necesitas tocar está centralizado en `src/config/`. **No hay textos
que editar dentro de los componentes.**

| Archivo | Qué contiene | Qué cambiar |
| :--- | :--- | :--- |
| `src/config/site.ts` | Dominio, título, descripción, keywords, versión del APK, huellas SHA-256, autor | El dominio si migras; las huellas si recompilas la app |
| `src/config/donation.ts` | Enlace de **Deuna** y QR | `deunaLink`, `qrImage` y la miniatura `qrThumbImage` |
| `src/config/feedback.ts` | Formularios de **errores**, **sugerencias** y encuesta | El campo `url` de cada canal |
| `src/config/faq.ts` | Preguntas frecuentes | Añadir o editar preguntas |

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
├── fonts/                        # Fuentes autoalojadas (.woff2)
├── images/                       # Capturas, QR y tarjeta social
├── downloads/                    # APK publicados
├── favicon.svg / favicon.ico     # Iconos
├── icon-192.png / icon-512.png   # Iconos PWA
├── apple-touch-icon.png
├── site.webmanifest
├── robots.txt / sitemap.xml
tools/
├── build_assets.py               # Genera imágenes, favicons y WebP
└── fetch_fonts.py                # Descarga las fuentes a public/fonts
src/
├── components/
│   ├── Header.astro              # Ticker, nav sticky y menú móvil
│   ├── Hero.astro                # Héroe con recreación de la app en CSS
│   ├── AppScreensShowcase.astro  # Pestañas con las vistas de la app
│   ├── Features.astro            # Bento grid de funciones
│   ├── DownloadSection.astro     # Descargas, checksums y capturas
│   ├── FeedbackSection.astro     # Errores, sugerencias y contacto
│   ├── SupportSection.astro      # Apoyo voluntario (Deuna + QR)
│   ├── DocsSection.astro         # Guías paso a paso y FAQ
│   ├── SupportModal.astro        # Modal de apoyo
│   └── Footer.astro
├── config/                       # ← Toda la configuración editable
├── layouts/
│   ├── BaseLayout.astro          # <head>, SEO, header, footer y modal
│   └── Layout.astro              # Envoltorio de la home
├── pages/
│   ├── index.astro               # Página de inicio
│   └── privacidad.astro          # Política de privacidad
└── styles/
    ├── global.css                # Design system y animaciones
    └── fonts.css                 # @font-face (generado)
```

---

## ♿ Accesibilidad y rendimiento

- Enlace "saltar al contenido", foco visible de alto contraste y `aria-label` en botones.
- Tablists navegables con teclado (flechas, Home, End).
- `prefers-reduced-motion` respetado en **todas** las animaciones.
- Fuentes autoalojadas: sin conexiones a Google y sin bloqueo de renderizado.
- Imágenes en WebP con reserva JPEG y `width`/`height` declarados para evitar saltos de layout.
- CSS y JS se compilan e inclusionan en un único archivo; sin dependencias de runtime.
