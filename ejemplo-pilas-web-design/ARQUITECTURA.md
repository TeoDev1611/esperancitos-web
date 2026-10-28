# Web de Pilas!: cómo está hecha

Documento para quien reciba este proyecto. Cuenta qué hay, con qué paquetes, cómo funciona cada pieza y dónde se cambia cada cosa.

## 1. Resumen
Una sola página estática hecha con **Astro**. Casi todo vive en `src/pages/index.astro` (HTML, CSS y un `<script>`). No hay servidor ni base de datos. Se despliega en Vercel como sitio estático.

Qué hace:
- **Exposición** al abrir: Pilas nervioso presenta el proyecto con proyector, subtítulos retro, botón Saltar y botón Descargar ahora.
- **Dos modos** (ESPE y Multi-Universidad) con un interruptor que voltea un carnet 3D y repinta la página con una onda circular.
- **Compresor de PDF simulado** con el medidor de peso de la guía.

## 2. Estructura
```
pilas-astro/
├─ package.json            dependencias y scripts
├─ astro.config.mjs        solo define el sitio
├─ README.md               arranque rápido
├─ ARQUITECTURA.md         este archivo
├─ public/
│  ├─ logos/               SVG de las mascotas (los pones tú)
│  └─ downloads/           los APK
└─ src/pages/index.astro   toda la página
```
`public/logos` y `public/downloads` se sirven tal cual, en `/logos/...` y `/downloads/...`.

## 3. Paquetes y por qué
| Paquete | Para qué |
| :--- | :--- |
| `astro` | Genera HTML estático. Sin JavaScript por defecto, solo el `<script>` que escribimos. |
| `gsap` | Línea de tiempo de la intro, temblor y rebote de la mascota, iris retro, caída del carnet y animación del medidor. Elegido porque controla secuencias y se puede matar o pausar fácil. |
| `@fontsource-variable/outfit` | Fuente de títulos y números, empaquetada (la guía exige fuentes locales, no Google Fonts). |
| `@fontsource-variable/inter` | Fuente de cuerpo. |
| `@fontsource/special-elite` | Letra de máquina de escribir, solo para los subtítulos retro. |

Sin Tailwind ni frameworks de UI: el CSS es propio y usa los tokens de la guía como variables. Sin adaptador de Vercel porque es estático.

Comandos: `npm install`, `npm run dev`, `npm run build`, `npm run preview`.

## 4. Estructura de `index.astro`
1. **Frontmatter** (entre `---`): importa fuentes y define tres variables que son la única fuente de datos editable.
   - `V`: versión, build, peso, ruta del APK.
   - `M`: rutas de las 6 mascotas (`neutral`, `error`, `success`, `scared`, `sleeping`, `guard`).
   - `PLAY`, `IG`, `WA`: enlaces.
2. **Markup**: sprite de íconos SVG, intro (`#intro`), sitio (`#site`: cabecera, hero, secciones, pie).
3. **`<style is:global>`**: todo el CSS. Va como global porque JavaScript cambia clases y atributos en tiempo de ejecución y los estilos con alcance de Astro no los alcanzarían.
4. **`<script>`**: lo procesa Astro como módulo, por eso puede hacer `import gsap`.

## 5. Sistema de modos
- `<html data-mode="espe|multi">` es el interruptor. Se guarda en `localStorage.pilasMode`.
- **Contenido**: cualquier elemento con `data-for="espe"` o `data-for="multi"` se oculta en el otro modo con una regla CSS. Lo común va sin atributo.
- **Aspecto**: `--accent` y `--bg` cambian por modo (fucsia y `#101319` en ESPE; coral `#ff3d5e` y `#191d28` en Multi-U). El fondo cambia de cuadrícula a puntos.
- **Onda**: `setMode()` usa `document.startViewTransition()` y anima `clip-path: circle()` sobre `::view-transition-new(root)` desde las coordenadas del botón. Sin soporte del navegador o con movimiento reducido, cambia sin animación.
- **Carnet 3D**: dos caras (`.front` y `.back`) con `backface-visibility: hidden`; con `data-mode="multi"` el contenedor gira 180° en Y.

## 6. La exposición
- **Datos**: arreglo `slides` (mascota, título, texto, badge opcional, frase) y arreglo `cues` (acotaciones como “(traga saliva)”).
- **Flujo**: `start()` → `show(n)` → `next()` automático por temporizador GSAP o con el botón; la última diapositiva muestra “Soy de la ESPE” y “Soy de otra universidad”, que llaman a `close(modo)`.
- **Mascota**: se cambia el `src` del `<img>` según `M[estado]`. `scared` tiembla en bucle, `sleeping` flota, el resto rebota al entrar. Se cargan como `<img>`, nunca SVG inline, por los ids repetidos dentro de los archivos.
- **Texto**: un “escritor” (`setInterval`) escribe la frase en el globo y en el subtítulo al mismo tiempo. Un `div` con `aria-live` lee la frase completa a lector de pantalla.
- **Proyector**: un `div` con `clip-path: polygon()` y degradado; el polígono usa `calc()` con el ancho de la pantalla (`--sw`).
- **Cierre**: `close()` apaga la pantalla (escala en Y, desvanece), quita la clase `intro-on` y lanza la entrada del carnet.
- **Control**: botón Saltar, Esc y flecha derecha. El sitio queda con `inert` mientras la intro está abierta, para que el teclado no se escape detrás.
- **Descargar ahora**: un enlace directo al APK, siempre visible arriba a la derecha.
- Se muestra una vez por sesión (`sessionStorage.pilas`) y no aparece con `prefers-reduced-motion`. “Ver la presentación” en la cabecera la repite.

## 7. Subtítulos retro
Activados por la clase `retro-on` en `<html>`. El botón “Subtítulos retro” la alterna y guarda la preferencia en `localStorage.pilasRetro`; un script en `<head>` la aplica antes de pintar para evitar parpadeos.

Con la clase activa:
- **Subtítulo**: tarjeta negra con borde doble crema, letra Special Elite, acotación en gris arriba. El globo moderno se oculta.
- **Película antigua** (`.film`): grano (ruido SVG con `feTurbulence`, movido en pasos), viñeta radial, dos rayones verticales intermitentes.
- **Pantalla**: tono sepia leve, parpadeo, marco doble.
- **Cambio de diapositiva**: apertura en iris (`clip-path: circle()` animado con GSAP).

Sin la clase, la intro se ve con el globo blanco y sin efectos. La mascota nunca lleva filtro (la guía prohíbe recolorearla); el grano pasa por encima pero no la tiñe.

## 8. Compresor de PDF
Un medidor de 0 a 30 MB con el límite de 5 MB marcado. `gauge(mb)` pinta el ancho, el texto y la insignia: rojo sobre el límite, ámbar a menos del 10 % del límite, verde dentro (guía §13.2). GSAP anima de 24.8 a 2.1 MB.

## 9. Accesibilidad y movimiento
- Todo estado tiene color, ícono y texto.
- Controles de 48 px, foco visible con anillo fucsia, texto negro sobre fucsia.
- `prefers-reduced-motion`: se omite la intro, se desactivan animaciones CSS y las de GSAP se saltan con `if (reduce)`.
- Imágenes con `alt`; los decorativos (proyector, película, subtítulos duplicados) con `aria-hidden`.

## 10. Claves de almacenamiento
| Clave | Dónde | Para qué |
| :--- | :--- | :--- |
| `pilas` | `sessionStorage` | Ya vio la intro en esta sesión |
| `pilasMode` | `localStorage` | Último modo elegido |
| `pilasRetro` | `localStorage` | `0` si desactivó los subtítulos retro |

## 11. Cómo cambiar cosas
- **Nueva versión**: edita `V`.
- **Frase, orden o cantidad de diapositivas**: edita `slides` y `cues` en el `<script>`.
- **Funciones por modo**: edita las listas `<dl class="rules">` con `data-for`.
- **Nueva mascota o renombrado de SVG**: edita `M`.
- **Colores**: solo en las variables de `:root`; no pongas colores sueltos en el resto del CSS.

## 12. Cosas a tener en cuenta
- Los SVG de las mascotas tienen proporciones distintas; por eso van en cajas cuadradas con `object-fit: contain`.
- `startViewTransition` funciona en Chrome, Edge y Safari recientes; en otros, el cambio de modo es inmediato.
- No se compiló ni se probó en un navegador al escribirlo. Primera tarea: `npm install && npm run build`, y revisar la intro en móvil a 360 px.
- Faltan por migrar FAQ, guías, novedades, colaboradores y las páginas `/horario`, `/conectar`, `/avisos` y `/negocios`. Deben usar el mismo sistema (ver `pilas-web-design/SKILL.md`).
