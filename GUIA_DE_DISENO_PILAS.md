# 🎨 Guía Oficial de Diseño — PILAS
## Sistema de Diseño: Neo-Student Brutalism — **Edición Fucsia & Sticker** (v2.2.0)
### Universidad de las Fuerzas Armadas ESPE — Cliente Móvil Estudiantil

> **Estado:** Documento Maestro Oficial. Es la única fuente de verdad visual; el informe técnico y el código deben ajustarse a este documento.
> **Versión:** `v2.2.0` (reemplaza a v2.1.0)
> **Stack UI:** Flutter 3.27+, Material 3 personalizado, `flutter_svg`, fuentes variables `Outfit` e `Inter`
> **Ámbito:** Mobile (Android / iOS) y portales de apoyo web (mismos tokens, ver §2.1)
> **Fecha:** 20 de octubre de 2026

### Cambios respecto a v2.1.0
- Tokens web CSS integrados y corregidos (§2): estados `hover`, `on-*`, `shadow` y `border-control` completos.
- Ratios de contraste **recalculados con fórmula de luminancia relativa** (§2.3). Los de v2.1.0 estaban mal.
- Mascota ampliada de 3 a **6 estados** (§5): se suman asustado, dormido y policía.
- Tabla de bordes y sombras **por componente** (§6), para eliminar valores ambiguos.
- Estados de componentes: deshabilitado, cargando, error, foco, seleccionado (§8–§10).
- Nuevas secciones: patrones de UI para **Moodle** (§12) y **herramientas PDF** (§13).
- Regla de identidad ESPE definida (§2.5) y reglas para los 7 acentos del usuario (§2.6).
- Sección de decisiones pendientes (§15).

---

## 📑 Tabla de Contenidos
1. Filosofía & ADN Estético
2. Paleta de Colores, Tokens & Accesibilidad WCAG
3. Fondos, Superficies & Gradientes
4. Tipografía
5. Identidad Visual: Logotipo, SVGs & Mascota (6 estados)
6. Bordes, Sombras & Físicas Brutalistas
7. Microinteracciones & Animaciones
8. Botones Hápticos
9. Formularios, Inputs & Controles
10. Tarjetas, Chips & Vistas de Estado
11. Implementación en Flutter
12. Patrones de UI — Moodle
13. Patrones de UI — Herramientas PDF
14. Reglas de Oro
15. Decisiones pendientes

---

## 1. Filosofía & ADN Estético

**PILAS** combina la firmeza del **Neo-Brutalismo** (bordes de 1.5 a 2 px, sombras duras ortogonales sin difuminado, alta densidad de información) con el carisma del lenguaje **Cartoon / Sticker**: contornos negros gruesos (hasta 4.5 px), brillos cálidos, extrusiones magenta y una mascota que comunica el estado académico del estudiante de un vistazo.

### Pilares
1. **Fucsia Pop como marca.** `#FF3FA4` es el color primario. Transmite energía y juventud ("¡Pilas!").
2. **El verde es solo éxito.** `#00FF87` significa: materia aprobada (≥ 14.0), tarea entregada o clase en vivo. Nunca es color de marca ni de acento.
3. **Dark-mode first.** Fondos oscuros (Slate `#101319` u OLED `#000000`) para estudio nocturno y ahorro de batería en AMOLED.
4. **La mascota habla.** Cada estado emocional de la mascota corresponde a una situación concreta de la app (§5).
5. **El color nunca va solo.** Todo estado se comunica con color **+ ícono + texto**. Las sombras son decorativas y no transmiten información.

---

## 2. Paleta de Colores, Tokens & Accesibilidad WCAG

### 2.1 Tokens oficiales (web CSS = Flutter `AppColors`)

Los mismos valores viven en la web y en Flutter. Un cambio se hace en ambos lados o en ninguno.

```css
:root {
  /* Marca */
  --color-primary: #ff3fa4;
  --color-primary-hover: #e5147d;
  --color-primary-extrude: #7a0a45;
  --color-primary-shadow: #4a0026;
  --color-primary-coral: #ff3d5e;

  /* Estados semánticos */
  --color-success: #00ff87;
  --color-success-hover: #00d974;
  --color-success-shadow: #059669;
  --color-warning: #ffdb60;
  --color-warning-hover: #f5c53d;
  --color-warning-shadow: #7a4b00;
  --color-critical: #ef4444;
  --color-critical-shadow: #7f1d1d;
  --color-info: #38bdf8;

  /* Superficies */
  --color-bg-base: #101319;
  --color-bg-subtle: #191d28;
  --color-bg-surface: #161a23;
  --color-bg-elevated: #1e2230;
  --color-bg-container: #242938;

  /* Bordes */
  --color-border: #2a3142;           /* decorativo / estructural */
  --color-border-control: #6b7894;   /* bordes de inputs y controles (>= 3:1) */
  --color-border-subtle: rgb(255 255 255 / 0.08);
  --color-border-heavy: #000000;
  --color-border-white: #ffffff;

  /* Texto */
  --color-text-title: #faf7f7;
  --color-text-body: #e1e2eb;
  --color-text-muted: #8f9cae;

  /* Texto sobre color */
  --color-on-primary: #000000;
  --color-on-success: #00210c;
  --color-on-warning: #2a1c00;
  --color-on-critical: #000000;
}
```

El CSS completo (radios, tipografía, movimiento, foco, modo OLED, `prefers-reduced-motion`) está en el archivo de tokens web; esta guía documenta el significado de cada grupo.

### 2.2 Tabla de roles

| Token | Flutter | Hex | Rol |
| :--- | :--- | :---: | :--- |
| `--color-primary` | `primary` | `#FF3FA4` | Botón primario, tab activo, foco, acento de marca |
| `--color-primary-hover` | `primaryHover` | `#E5147D` | Estado presionado y punto medio del gradiente hero |
| `--color-primary-extrude` | `primaryDark` | `#7A0A45` | Borde del botón primario y extrusión del logo |
| `--color-primary-shadow` | `primaryShadow` | `#4A0026` | Sombra dura de elementos fucsia |
| `--color-primary-coral` | `primaryLight` | `#FF3D5E` | Remate del gradiente hero |
| `--color-success` | `success` | `#00FF87` | Aprobado, entregado, en vivo |
| `--color-warning` | `urgent` | `#FFDB60` | Vence en < 24 h, advertencias |
| `--color-critical` | `critical` | `#EF4444` | Atrasado, reprobado, error |
| `--color-info` | `info` | `#38BDF8` | Información, enlaces, borradores |
| `--color-bg-base` | `background` | `#101319` | Lienzo de pantalla |
| `--color-bg-surface` | `surface` | `#161A23` | Tarjetas, diálogos |
| `--color-bg-elevated` | `surfaceElevated` | `#1E2230` | Inputs, botones secundarios, hojas |
| `--color-bg-container` | `surfaceContainerHigh` | `#242938` | Paneles altos, cabeceras |
| `--color-border` | `border` | `#2A3142` | Contorno decorativo de tarjetas |
| `--color-border-control` | `borderControl` | `#6B7894` | Contorno de inputs, checks, switches, chips |
| `--color-text-title` | `textPrimary` | `#FAF7F7` | Títulos y números |
| `--color-text-body` | `textSecondary` | `#E1E2EB` | Cuerpo |
| `--color-text-muted` | `textMuted` | `#8F9CAE` | Metadatos y placeholders |

> **Cambio importante:** los textos oficiales son los de la web (`#FAF7F7`, `#E1E2EB`, `#8F9CAE`). Los valores `#F8FAFC`, `#CBD5E1` y `#94A3B8` de v2.1.0 quedan **obsoletos** en Flutter.
> **Eliminados del código y la documentación:** `#0B0F19` (fondo viejo) y `#10B981` como color de marca.

### 2.3 Contraste (calculado, WCAG 2.1)

Ratios obtenidos con la fórmula de luminancia relativa. Mínimos: **4.5:1** texto normal, **3:1** texto grande (≥ 24 px o ≥ 18.66 px en negrita) y componentes de interfaz.

| Par | Ratio | Resultado | Uso |
| :--- | :---: | :---: | :--- |
| Título `#FAF7F7` / base `#101319` | 17.46 | AAA | Títulos |
| Título / superficie `#161A23` | 16.34 | AAA | Títulos en tarjeta |
| Cuerpo `#E1E2EB` / superficie | 13.50 | AAA | Texto en tarjeta |
| Cuerpo / elevado `#1E2230` | 12.27 | AAA | Texto en inputs |
| Muted `#8F9CAE` / superficie | 6.25 | AA | Metadatos |
| Muted / elevado | 5.68 | AA | Placeholders |
| Muted / contenedor `#242938` | 5.20 | AA | Metadatos en cabeceras |
| **Negro `#000` / primario `#FF3FA4`** | **6.50** | **AA** | **Texto del botón primario** |
| Blanco / primario `#FF3FA4` | 3.23 | **Falla** | No usar en texto normal |
| Blanco / hover `#E5147D` | 4.44 | **Falla (por poco)** | Solo texto grande o negrita ≥ 18.66 px |
| Negro / hover `#E5147D` | 4.73 | AA | Alternativa para estado presionado |
| Primario `#FF3FA4` / base | 5.76 | AA | Texto o ícono fucsia sobre fondo |
| Primario / elevado | 4.90 | AA | Texto fucsia en inputs |
| Éxito `#00FF87` / base | 13.86 | AAA | Indicador de éxito |
| `#00210C` / éxito | 12.80 | AAA | Texto del botón success |
| Advertencia `#FFDB60` / base | 13.77 | AAA | Alerta |
| `#2A1C00` / advertencia | 12.30 | AAA | Texto del botón warning |
| Crítico `#EF4444` / base | 4.94 | AA | Texto de error |
| Crítico / superficie | 4.63 | AA | Texto de error en tarjeta |
| Negro / crítico | 5.58 | AA | Texto del botón crítico |
| Blanco / crítico | 3.76 | **Falla** | No usar blanco sobre rojo |
| Info `#38BDF8` / superficie | 8.13 | AAA | Enlaces |
| **Borde `#2A3142` / base** | **1.43** | **Falla 3:1** | Solo decorativo, nunca para delimitar controles |
| **Borde `#6B7894` / base · superficie · elevado** | **4.20 · 3.93 · 3.57** | **AA (no texto)** | **Borde de inputs y controles** |
| Sombra negra / base | 1.13 | Invisible | Decorativa |

Reglas derivadas:
- El texto sobre fucsia es **siempre negro** (`--color-on-primary`). Un solo valor, sin variantes.
- Nunca texto blanco sobre rojo `#EF4444`.
- Un input se delimita con `--color-border-control`, no con `--color-border`.
- Estos ratios deben verificarse con una **prueba automatizada** (script de luminancia) y no mantenerse a mano.

### 2.4 Estados semánticos (mapa único)

| Situación | Color | Ícono sugerido | Mascota |
| :--- | :--- | :--- | :--- |
| Aprobado, entregado, en vivo | `success` | check | Aprobación |
| Vence en < 24 h | `warning` | reloj | Asustado |
| Atrasado, reprobado, error | `critical` | alerta | Negación |
| Borrador, información | `info` | info | Neutro |
| Sin conexión, nada que hacer | `textMuted` | nube tachada | Dormido |
| Verificación, permisos, seguridad | `primary` | escudo | Policía |

### 2.5 Identidad ESPE vs. identidad Pilas
- **Dentro de la app** (Moodle, herramientas, ajustes): solo tokens Pilas. El verde y dorado de ESPE **no** se usan como color de interfaz.
- **Dentro de los PDF generados** (carátula): se usan los **logos oficiales de ESPE en sus colores originales**, nunca recoloreados ni deformados. El resto del documento es texto negro sobre blanco, apto para imprimir. El fucsia de Pilas no aparece en la carátula (a lo sumo un pie discreto "Generado con Pilas!", configurable).
- La mascota **no** debe aparecer en documentos institucionales ni en carátulas.

### 2.6 Acentos elegibles por el usuario
- El acento reemplaza **un conjunto completo**: `primary`, `primaryHover`, `primaryDark`, `primaryShadow` y `onPrimary`. Cambiar solo el primario deja textos y sombras desajustados.
- `onPrimary` se **calcula** (negro o blanco, el de mayor contraste) y debe cumplir ≥ 4.5:1. Si ningún acento lo logra, se rechaza.
- Los acentos **no pueden parecerse** a los colores semánticos (verde éxito, ámbar advertencia, rojo crítico). El acento "Verde Esmeralda" de la versión anterior contradice la regla del verde y debe retirarse o desplazarse claramente de `#00FF87`.
- Logo, mascota, gradiente hero y colores semánticos **no cambian** con el acento.
- Cada acento se prueba sobre Slate y OLED.

---

## 3. Fondos, Superficies & Gradientes

| Modo | Base | Subtle |
| :--- | :--- | :--- |
| **Slate** (predeterminado) | `#101319` | `#191D28` |
| **OLED** (`data-theme="oled"`) | `#000000` | `#0A0A0A` |

Jerarquía de elevación: `base` → `surface` → `elevated` → `container`. Cada nivel sube un paso; no saltarse niveles.

```dart
static const LinearGradient heroGradient = LinearGradient(
  colors: [AppColors.primary, AppColors.primaryHover, AppColors.primaryLight],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);
static const LinearGradient successGradient = LinearGradient(
  colors: [AppColors.success, AppColors.successShadow],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);
```
Los gradientes referencian tokens; no llevan `Color(0xFF…)` sueltos.

> Modo claro: **no existe**. Si se agrega, requiere su propia paleta y su propia tabla de contraste (ver §15).

---

## 4. Tipografía

| Rol | Fuente | Peso |
| :--- | :--- | :--- |
| Títulos, marca, números grandes | **Outfit** | w700–w800 |
| Cuerpo, tablas de notas, datos | **Inter** | w400–w500 |
| Código / datos técnicos | `JetBrains Mono` | **Sin confirmar** (§15) |

- Fuentes empaquetadas en `assets/fonts/`; siempre con fuente de respaldo (`system-ui`).
- Cifras en tablas de notas: **cifras tabulares** (`FontFeature.tabularFigures()`) para que las columnas alineen.
- Tono de textos: español de Ecuador, juvenil y claro. Mensajes de error dicen **qué pasó y qué hacer**.
- **Regla de identidad estudiantil:** No referirse a los estudiantes de la ESPE como "politécnicos". La ESPE es una universidad multidisciplinaria con carreras de salud, administración, biotecnología, lenguas e ingenierías; utilizar siempre **"estudiantes de la ESPE"**, **"comunidad estudiantil ESPE"** o **"comunidad universitaria"**.
- Respetar el tamaño de fuente del sistema; probar con escala 1.3–2.0 sin desbordes.

---

## 5. Identidad Visual: Logotipo, SVGs & Mascota "Pilo" (6 estados)

**Nombre oficial de la mascota:** **Pilo** (el rayo enérgico con copete fucsia y gafas oscuras que representa la chispa de estar "¡Pilas!"). En todos los `alt`, `aria-label` y diálogos, la mascota se llama oficialmente **Pilo**.

### 5.1 Inventario de activos (`logos-app/`)

| Archivo actual | Rol | Estado |
| :--- | :--- | :--- |
| `icono_logo2.svg` | Ícono de la app (launcher, splash, avatar de sistema) | Oficial |
| `letras_estilo_fucsia.svg` | Logotipo sobre badge fucsia | Oficial |
| `letras_estilo_transparente.svg` | Logotipo 3D transparente (header, splash) | Oficial |
| `icono_var1_sin_fondo.svg` | Mascota **Neutro / Enérgico** | Oficial |
| `icono_var2_sin_fondo.svg` | Mascota **Negación** | Oficial |
| `icono_var3_sin_fondo.svg` | Mascota **Aprobación** | Oficial |
| `asostado.svg` | Mascota **Asustado** | Nuevo (renombrar) |
| `dormido.svg` | Mascota **Dormido** | Nuevo (renombrar) |
| `policia.svg` | Mascota **Policía** | Nuevo (renombrar) |

**Nombres propuestos** (consistentes y sin el error ortográfico "asostado"):
`mascota_neutro.svg`, `mascota_negacion.svg`, `mascota_aprobacion.svg`, `mascota_asustado.svg`, `mascota_dormido.svg`, `mascota_policia.svg`. Los tres nuevos son transparentes aunque no lleven el sufijo `sin_fondo`.

### 5.2 Matriz de uso de la mascota

| Estado (`MascotState`) | Apariencia | Cuándo usarla |
| :--- | :--- | :--- |
| `neutral` | Sonrisa grande, dedo arriba | Dashboard ("¡Pilas, Mateo!"), onboarding, perfil |
| `success` | Sonrisa amplia, pulgar arriba | Tarea entregada, semestre aprobado, bandeja vacía ("¡Estás al día!"), operación PDF terminada |
| `error` | Ceño fruncido, pulgar abajo | Tarea atrasada, materia reprobada, error de Moodle o de red, operación fallida |
| `scared` | Gota de sudor, boca ondulada | Tarea vence en < 24 h, archivo supera el límite, sesión por caducar, acción riesgosa antes de confirmar |
| `sleeping` | Gorro fucsia, ojos cerrados, burbuja | Sin conexión, contenido aún no descargado, estado vacío tranquilo, sincronización en segundo plano |
| `guard` | Gorra y lentes oscuros | Verificador de entrega, permisos, seguridad y cifrado PDF, firma, login QR |

Reglas:
- **Una mascota por pantalla**, tamaño proporcional al estado (hero 120–160 dp, estado vacío 96 dp, inline 48 dp).
- Nunca recolorear, deformar ni voltear. El dedo y el pulgar son parte del gesto.
- `guard` **no representa autoridad institucional**: no aparece en carátulas ni como sello de ESPE (la gorra podría confundirse con insignia militar o policial real).
- `error` y `scared` no se usan juntos; si hay un error y una advertencia, manda `error`.
- Efecto sticker opcional: borde blanco y rotación de −2° a +2.5°, solo en pantallas de bienvenida y estados vacíos.

### 5.3 Requisitos técnicos de los SVG
- Los `viewBox` **difieren**: neutro, asustado, dormido y policía miden ≈ 271×214; negación ≈ 263×239; aprobación ≈ 260×262. `AppLogo` debe dibujarlos dentro de una caja cuadrada con `BoxFit.contain` y alineación centrada, para que no salten de tamaño al cambiar de estado.
- Los seis SVG originales traen un bloque `<metadata>` (manifiesto C2PA) de varios KB. Quitarlo en la exportación (por ejemplo con `svgo`) para aligerar el paquete.
- Los SVG nuevos usan ids internos repetidos (`skin`, `skShade`, `hair`…). En Flutter no hay problema (se parsea cada archivo por separado), pero **en la web no se deben incrustar varios inline en el mismo documento** sin prefijar ids; cargarlos como `<img>`.
- Los colores internos de la ilustración (cabello, piel, gorra) son parte del arte y no pasan por el sistema de tokens.
- Cada uso lleva `Semantics(label: …)` con una descripción corta ("Pilas, contento"), o se marca como decorativo si el texto ya lo explica.

---

## 6. Bordes, Sombras & Físicas Brutalistas

### 6.1 Valores por componente

| Componente | Borde | Sombra dura (blur 0) | Radio |
| :--- | :--- | :--- | :---: |
| Botón primario | 2 px `primaryDark` | `3,3` `primaryShadow` | 12 |
| Botón secundario | 2 px `borderWhite` | `3,3` `border` | 12 |
| Botón success | 2 px `success` | `3,3` `successShadow` | 12 |
| Botón crítico | 2 px `critical` | `3,3` `criticalShadow` | 12 |
| Botón outline | 2 px `primary` | ninguna | 12 |
| Tarjeta estándar | 2 px `border` | `2,2` `border` | 14 |
| Tarjeta activa / en vivo | 2 px `success` | `2,2` `successShadow` | 14 |
| Input (reposo) | 1.5 px `borderControl` | ninguna | 12 |
| Input (foco) | 2 px `primary` | ninguna | 12 |
| Chip / badge | 1.5 px según estado | ninguna | pill |
| Modal / hoja | 2 px `borderHeavy` | `6,6` `#000` (solo modal) | 16 |
| Sticker (mascota) | hasta 4.5 px negro | ninguna | — |

### 6.2 Reglas
- **`blurRadius: 0` siempre.** Nada de sombras difuminadas ni `elevation` de Material.
- Una sombra negra sobre `#101319` casi no se ve (1.13:1). Por eso las tarjetas usan sombra `border` y **la estructura la da el borde**, no la sombra.
- Radios permitidos: 8, 12, 14, 16 y pill. No inventar otros.

---

## 7. Microinteracciones & Animaciones

1. **Pulsación mecánica:** al tocar un botón se desplaza `translate(2, 2)` y la sombra desaparece, con `HapticFeedback.lightImpact()`. Duración `100 ms` (`--duration-sink`).
2. **Hover/foco:** `150 ms` (`--duration-hover`).
3. **Entrada de pantallas:** `700 ms` con curva `cubic-bezier(.22, 1, .36, 1)`.
4. **`prefers-reduced-motion` / "Reducir animaciones":** todas las duraciones pasan a 0 y la mascota no rota ni rebota. El háptico se mantiene (se desactiva solo desde Ajustes).
5. Ninguna información debe depender de que una animación termine.

---

## 8. Botones Hápticos (`BrutalistButton`)

| Variante | Fondo | Texto | Borde | Sombra |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `primary` | `#000000` (w800) | `primaryDark` | `primaryShadow` |
| `secondary` | `bgElevated` | `textPrimary` | `borderWhite` | `border` |
| `success` | `success` | `#00210C` | `success` | `successShadow` |
| `warning` | `warning` | `#2A1C00` | `warning` | `warningShadow` |
| `critical` | `critical` | `#000000` | `critical` | `criticalShadow` |
| `outline` | transparente | `primary` | `primary` | ninguna |

### Estados (todas las variantes)
| Estado | Comportamiento |
| :--- | :--- |
| Reposo | Según tabla |
| Presionado | Fondo `primaryHover` (o equivalente `-hover`), desplazamiento 2 px, sin sombra |
| Foco con teclado | Anillo 2 px `primary` con separación 2 px |
| Deshabilitado | Fondo `bgContainer`, texto `textMuted`, sin sombra, sin háptico; se explica el motivo en texto cercano |
| Cargando | Mismo tamaño que en reposo, spinner reemplaza el texto, no responde a toques |
| Solo ícono | Requiere `Semantics(label)` y área mínima de 48 × 48 dp |

---

## 9. Formularios, Inputs & Controles

| Estado | Fondo | Borde | Otros |
| :--- | :--- | :--- | :--- |
| Reposo | `bgElevated` | 1.5 px `borderControl` | Placeholder `textMuted` |
| Foco | `bgElevated` | 2 px `primary` | Etiqueta en `primary` |
| Error | `bgElevated` | 2 px `critical` | Ícono + mensaje bajo el campo, en `critical` |
| Deshabilitado | `bgContainer` | 1.5 px `border` | Texto `textMuted` |
| Éxito | `bgElevated` | 2 px `success` | Ícono check |

- Etiqueta siempre visible (no solo placeholder).
- Switches, checks y radios usan `borderControl` en reposo y `primary` activos, con ícono interior (no solo cambio de color).
- Altura mínima 48 dp. Radio 12.

---

## 10. Tarjetas, Chips & Vistas de Estado

- **`BrutalistCard`:** fondo `surface`, ver §6.1. Pulsable: efecto de hundimiento como los botones.
- **Chips de filtro:** reposo con borde `borderControl`; seleccionado con fondo `primary`, texto negro y ícono check.
- **Badges de estado:** fondo `bgElevated`, borde y texto del color semántico, siempre con ícono y palabra (nunca solo color).
- **Estado vacío / error / sin conexión:** mascota (§5.2) + título corto + una frase + **una acción**.
- **Cargando contenido:** esqueletos con la forma del contenido final. Sin mascota (reservada para mensajes).

---

## 11. Implementación en Flutter

```dart
// Tokens nuevos que deben existir en AppColors
static const borderControl = Color(0xFF6B7894);
static const onPrimary     = Color(0xFF000000);
static const onSuccess     = Color(0xFF00210C);
static const onWarning     = Color(0xFF2A1C00);
static const onCritical    = Color(0xFF000000);
static const successHover  = Color(0xFF00D974);
static const warningHover  = Color(0xFFF5C53D);
static const warningShadow = Color(0xFF7A4B00);
static const criticalShadow= Color(0xFF7F1D1D);
static const surfaceSubtle = Color(0xFF191D28);
```

```dart
enum MascotState { neutral, success, error, scared, sleeping, guard }

// Uso
AppLogo.badge(size: 64)
AppLogo.wordmark(size: 120, transparent: true)
AppLogo.mascot(state: MascotState.scared, size: 96, semanticLabel: 'Pilas, preocupado')
```

Reglas de código:
- Fuera de `lib/core/theme/` **no** se permiten `Colors.*`, `Color(0xFF…)`, `BoxShadow(` ni `TextStyle(` sueltos. Todo sale de `AppColors`, `palette`, el tema o los componentes del sistema.
- Si falta un token, se agrega al sistema y a esta guía; no se inventa en la pantalla.
- Una prueba automatizada falla si encuentra esos patrones fuera del tema.

---

## 12. Patrones de UI — Moodle

### 12.1 Estados de tareas
| Estado Moodle | Color | Ícono | Texto del chip |
| :--- | :--- | :--- | :--- |
| Pendiente | `info` | círculo | "Pendiente" |
| Por vencer (< 24 h) | `warning` | reloj | "Vence en 5 h" (cuenta regresiva) |
| Borrador | `info` | lápiz | "Borrador" |
| Enviado para calificar | `success` | check | "Entregada" |
| Calificado ≥ 14 | `success` | estrella | nota en `Outfit` |
| Calificado < 14 | `critical` | alerta | nota en `Outfit` |
| Atrasado | `critical` | alerta | "Atrasada" |

Las listas se ordenan por urgencia, no solo por fecha.

### 12.2 Verificador de entrega (mascota `guard`)
Presentado como **lista de verificación previa a entregar**, con ✓ / ✗ por ítem:
- Peso máximo permitido vs. peso del archivo.
- Extensión o tipo MIME permitido.
- Intentos restantes.
- Rúbrica disponible.

Si el archivo no cumple, se ofrece la **acción correctiva directa** (por ejemplo "Comprimir a menos de 5 MB") ya configurada con el límite de esa tarea.

### 12.3 Flujo Tarea → Entrega
Barra de pasos persistente: **Escanear → Carátula → Comprimir → Entregar**. Cada paso muestra hecho / actual / pendiente, se puede retomar si la app se cierra, y el último paso resume cuenta, materia, archivo y peso antes de confirmar.

### 12.4 Sincronización y conexión
- Mostrar siempre "Última sincronización: hace X".
- Sin conexión: banner discreto + mascota `sleeping` en estados vacíos.
- Sincronización parcial fallida: indicar qué parte falló y ofrecer reintentar solo esa parte.
- Si falla la lectura del HTML de Moodle (cambio de plantilla): mensaje humano con mascota `error`, nunca un error técnico crudo.

### 12.5 Multi-cuenta
Chip de cuenta activa siempre visible. Antes de entregar una tarea, la confirmación repite cuenta, materia y nombre de la tarea.

### 12.6 "Con Cuánto Paso"
Resultado grande en Outfit con cifras tabulares, color `success` o `critical` más texto explícito ("Necesitas 11.5 en el último parcial"), mascota `success` / `scared` / `error` según el resultado, y la fórmula visible en un bloque plegable.

---

## 13. Patrones de UI — Herramientas PDF

### 13.1 Pantalla de resultado estándar
Todas las herramientas terminan igual: mascota `success`, nombre del archivo, tamaño, y acciones **Abrir · Compartir · Guardar · Usar en una tarea**. Si falla: mascota `error`, causa en lenguaje claro y una acción.

### 13.2 Medidor de peso (Compresor)
Barra con el límite de la tarea marcado. Verde dentro del límite, ámbar a menos del 10 % del límite, rojo por encima. Se muestra antes → después y el porcentaje reducido. Si no se logra cumplir el límite, se dice explícitamente y se sugieren alternativas.

### 13.3 Procesos largos
Barra de progreso con cancelación y sin bloquear la interfaz. Se propone un estilo de **batería** (guiño al logo, donde la "I" es una pila) como indicador de progreso de marca.

### 13.4 Escáner y recorte
- Manijas de 4 esquinas con **área táctil de 48 dp** aunque el dibujo sea menor.
- Lupa al arrastrar una esquina.
- El trazo del recorte lleva doble contorno (negro + color) para verse sobre fotos claras y oscuras.
- Siempre botón "Detectar de nuevo" y "Sin recorte".

### 13.5 Organizador
Miniaturas con número de página, modo de selección múltiple, arrastre por pulsación larga, rotación con vista previa y "Deshacer" tras eliminar. Etiqueta accesible por miniatura ("Página 3 de 12").

### 13.6 Firma
- Se llama **Firma visual** (imagen estampada), no "firma digital": no tiene validez criptográfica ni de firma electrónica. Aviso breve en la pantalla.
- Gestor de firmas guardadas, con borrar y renombrar.
- Marco de arrastre con color `primary` (nunca azul fijo), asas de 48 dp.

### 13.7 Seguridad y cifrado (mascota `guard`)
- Texto: "Cifrado AES de 256 bits" (sin "militar").
- Advertencia visible: **si pierdes la contraseña no se puede recuperar**.
- Permisos con interruptores y lenguaje llano ("Permitir imprimir").

### 13.8 Carátula ESPE
Vista previa en vivo; los datos (nombre desde Moodle, materia, docente) se recuerdan. El PDF resultante es **A4, fondo blanco, texto negro, logos oficiales en sus colores** (ver §2.5), con fuentes incrustadas que incluyan tildes y eñes.

### 13.9 Metadatos, marca de agua y foliado
Metadatos: tabla "antes / después". Marca de agua y foliado: vista previa en vivo de la página antes de aplicar.

### 13.10 Nunca sobrescribir el original
Toda operación crea un archivo nuevo. Nombre sugerido editable: `Apellido_Materia_Tarea.pdf`.

---

## 14. Reglas de Oro
1. **El primario es `#FF3FA4`.** Texto sobre él: negro.
2. **El verde es sagrado:** aprobado, entregado, en vivo.
3. **Color + ícono + texto** para todo estado.
4. **Cero blur** en componentes.
5. **Bordes de control a 3:1 como mínimo** (`borderControl`).
6. **Una mascota por pantalla**, con el estado que corresponde (§5.2); `guard` no es autoridad institucional.
7. **Sin colores, sombras ni estilos de texto sueltos** fuera del tema.
8. **Dark-mode first.** Ratios verificados por prueba automatizada.
9. **Touch targets ≥ 48 dp**, con `Semantics` en todo control de solo ícono.
10. **ESPE vive en los PDF, Pilas vive en la app.**
11. **No se sobrescriben los archivos del usuario.**

---

## 15. Decisiones pendientes
| # | Tema | Propuesta |
| :-: | :--- | :--- |
| 1 | `JetBrains Mono` no está en la guía | Confirmar o eliminar el token `--font-mono` |
| 2 | Acento "Verde Esmeralda" (7 acentos) | Retirar o alejar de `#00FF87` |
| 3 | Modo claro | Confirmar que no existe, o diseñarlo con su propia tabla de contraste |
| 4 | Pie "Generado con Pilas!" en carátulas | Opcional, desactivable |
| 5 | Mascota para "cargando" | Por ahora, esqueletos sin mascota |
| 6 | Valores `warning-hover`, `critical-shadow`, `success-hover` | Propuestos en esta versión; confirmar |
| 7 | Renombrar SVG (§5.1) | Aplicar nombres propuestos y actualizar `AppLogo` |