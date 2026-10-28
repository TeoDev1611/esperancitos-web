---
name: pilas-web-design
description: Adapta el contenido actual de Pilas! (versión, funciones, modos ESPE y Multi-Universidad, herramientas, privacidad, descarga) al estilo oficial de la web "Exposición": intro con Pilas nervioso presentando con proyector y un botón de saltar, interruptor de modo con carnet 3D y onda de repintado. Úsala siempre que haya que crear, actualizar o ampliar cualquier página o texto de la web de Pilas (landing, FAQ, guías, novedades, avisos, negocios, colaboradores), aunque el usuario solo diga "actualiza la web", "agrega esta función" o "sube la nueva versión".
---

# Web de Pilas!: adaptar contenido al estilo "Exposición"

## Tu trabajo
Tú ya tienes la información real y actual del proyecto. Esta skill **no aporta datos**: define dónde va cada dato y cómo se dice. Si falta un dato (peso del APK, enlace, cifra), **no lo inventes**: déjalo en una variable del frontmatter y avisa qué falta.

Antes de escribir, lee:
1. `GUIA_DE_DISENO_PILAS.md` (v2.2.0). Es la fuente de verdad visual; si algo choca, gana la guía.
2. `src/pages/index.astro`. Es la implementación de referencia (Astro + GSAP + fuentes `@fontsource-variable` Outfit e Inter). No cambies su estructura, solo su contenido.

## El concepto
La web empieza como una **exposición**: sala oscura, haz de proyector, una diapositiva encendida y **Pilas nervioso** (estado `scared`) presentando el proyecto con un globo de texto. Siempre hay un botón **Saltar presentación** (también Esc). Se muestra una vez por sesión, se omite con `prefers-reduced-motion` y se puede repetir con "Ver la presentación". En la última diapositiva el usuario elige su modo y entra.

La intro tiene **subtítulos retro** (estilo dibujo animado de los años 30: tarjeta negra con marco doble, letra de máquina de escribir, grano de película, viñeta, rayones y apertura en iris) que el usuario puede **desactivar** con el botón "Subtítulos retro"; sin ellos se ve el globo moderno. La preferencia se guarda. Siempre hay un botón **Descargar ahora** visible en la intro, junto a Saltar. Los subtítulos son la única excepción tipográfica a Outfit e Inter, y solo dentro de la intro. La mascota nunca se filtra ni se recolorea.

Después, el sitio gira en torno al **interruptor de modo**: **ESPE** y **Multi-Universidad**. Al cambiarlo, el carnet 3D del hero se voltea, la página se repinta con una onda circular desde el botón y cambia todo el contenido que depende del modo.

## Proceso para adaptar contenido
1. **Inventaria** lo que te pidan publicar (funciones, cifras, versiones, textos legales).
2. **Clasifica cada dato**: común, solo ESPE, solo Multi-Universidad. Lo común se escribe una vez, sin atributo. Lo exclusivo lleva `data-for="espe"` o `data-for="multi"`. Lo que no existe en un modo no se muestra en ese modo.
3. **Asigna cada dato a un slot** de la tabla siguiente. Si no cabe en ninguno, ve a "Contenido que no cabe".
4. **Reescribe en la voz de Pilas** (abajo). Una idea por frase, qué hace y qué gana el estudiante, sin jerga técnica.
5. **Verifica** con la lista final.

## Slots y límites

| Slot | Qué contiene | Límite |
| :--- | :--- | :--- |
| Intro (`slides`) | 5 a 7 diapositivas: portada, propuesta con los dos modos, el dolor principal, funciona sin internet, privacidad, gratis y elegir modo | Título ≤ 6 palabras, texto ≤ 1 frase, subtítulo ≤ 2 frases cortas más una acotación entre paréntesis en `cues`, por ejemplo (traga saliva) |
| Hero | `h1` y `lead` por modo, interruptor, CTA de descarga, línea fina con versión, peso y requisitos | `h1` ≤ 12 palabras, `lead` ≤ 2 frases |
| Carnet 3D | 4 pares etiqueta/valor por cara, más una insignia | Valores ≤ 4 palabras |
| Sección "modo" | 4 reglas por modo: título + una frase; una línea de sedes o universidades | Frase ≤ 20 palabras |
| Herramientas | Demo interactiva + lista con todas las herramientas actuales | Título + una frase. Ajusta el número ("Ocho de las trece") al total real |
| Privacidad | 4 garantías concretas | Título ≤ 4 palabras, una frase |
| Descarga | Versión, build, peso, APK, beta de Play Store, 3 pasos | Datos desde `V` y `PLAY` |
| Pie | Enlaces, aviso legal de 2 frases, año | Sin párrafos nuevos |

**Cada dato tiene un solo dueño.** Versión, build, peso y ruta del APK viven en `V` (frontmatter). Rutas de mascotas en `M`. Enlace de Play en `PLAY`. Subir una versión nueva = cambiar `V`, nada más.

### Contenido que no cabe
Preguntas frecuentes, guías de sincronización, novedades o changelog, colaboradores, fichas técnicas, huellas SHA-256: van en **páginas propias** (`/faq`, `/guias`, `/novedades`, `/colaborar`) con el mismo sistema (encabezado, tokens, filetes), o dentro de `<details>` en la sección de descarga. Nunca como cuadrícula de tarjetas. Los acordeones usan borde `border-control` y alto mínimo 48 px.

## Mascota: un estado por situación (guía §5.2)
`neutral` presentación y dashboard · `success` entregado, aprobado, terminado · `error` fallo, atraso, portal caído · `scared` vence pronto, límite superado, nervios de la intro · `sleeping` sin conexión · `guard` seguridad, permisos, QR. **Una mascota por pantalla.** No recolorear ni voltear. `error` y `scared` no van juntos. En `guard` no la presentes como autoridad ni institución. Se carga con `<img>`, con `alt` descriptivo.

## Voz
Español de Ecuador, juvenil y claro, con expresiones locales de vez en cuando ("ponte pilas", "chuta") y sin forzarlas. Nada de "revolucionario", "definitivo" ni "la mejor". Botones con verbo concreto ("Descargar para Android", "Comprimir"). Un error dice qué pasó y qué hacer. Sentence case, sin MAYÚSCULAS decorativas, sin emojis como íconos, sin flechas en botones, sin cadenas "A · B · C". Comillas “ ” y apóstrofo ’. Cifras con `font-variant-numeric: tabular-nums`.

Textos obligatorios por la guía: "Firma visual" (no "firma digital"; aclara que no tiene validez de firma electrónica), "cifrado AES de 256 bits" (sin "militar"), "si pierdes la contraseña no se puede recuperar", "Código privado, no es open source" donde corresponda, y el aviso de que Pilas! es independiente y no está afiliada a la ESPE ni a otras universidades.

## Sistema visual (no se negocia)
- Fondo `#101319` (Multi-U usa `#191d28`), superficie `#161a23`, elevado `#1e2230`. Primario `#ff3fa4`, texto sobre él **siempre negro**. Acento Multi-U `#ff3d5e` (`primary-coral`). Texto `#faf7f7`, `#e1e2eb`, `#8f9cae`. Borde `#2a3142`; en controles `#6b7894`.
- **Verde solo para éxito** (aprobado, entregado, en vivo, dentro del límite). Nunca como color de modo, marca ni decoración. Ámbar para advertencia, rojo para crítico, celeste para información.
- Todo estado lleva **color + ícono + texto**.
- Sombras duras `3px 3px 0`, **blur 0**, bordes de 2 px, radios 8, 12, 14, 16 y pill. Controles de 48 px mínimo, foco visible.
- Outfit 700–800 para títulos y números, Inter 400–600 para cuerpo.
- Modo oscuro únicamente.

## Animación
Hecha con GSAP y CSS. Permitido: la intro, el flip del carnet, la onda de modo (View Transitions API con respaldo sin animación), el medidor de peso y la entrada del carnet al abrir el sitio. **No agregues** fade-up por sección, hover animado en cada tarjeta, marquesinas ni parallax. Todo respeta `prefers-reduced-motion`. Ninguna información depende de que una animación termine.

## Anti-genérico
No conviertas contenido en: hero con captura de móvil, cuadrícula de tarjetas iguales con ícono, titular con una palabra resaltada, eyebrows en mayúsculas, bloques de "confianza" con logos. Para presentar varias funciones usa **listas con filetes** (`<dl class="rules">`) o una **demo interactiva pequeña** cuando la función se pueda probar en 5 segundos (calculadora, medidor de peso, huecos libres).

## Antes de entregar
- [ ] Ningún dato inventado; faltantes marcados en el frontmatter y avisados.
- [ ] Cada texto específico de un modo tiene `data-for` y el otro modo no lo muestra.
- [ ] Ninguna sombra con blur; ningún texto blanco sobre fucsia o coral; verde solo en éxito.
- [ ] La intro se puede saltar con botón y con Esc, y respeta `prefers-reduced-motion`.
- [ ] Un solo estado de mascota por pantalla, con `alt`.
- [ ] Se ve bien a 360 px y los controles miden 48 px.
- [ ] Versión, peso y enlaces salen de `V`, `M` y `PLAY`, no están repetidos en el texto.
- [ ] `npm run build` termina sin errores.
