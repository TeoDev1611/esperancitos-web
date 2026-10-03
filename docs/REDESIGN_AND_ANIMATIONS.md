# 🎨 Rediseño Bento Grid y Sistema de Micro-Animaciones

**Fecha de Implementación:** Octubre 2026  
**Versión:** v1.0.0-beta.2  
**Framework:** Astro + Vanilla CSS  

---

## 1. Motivación y Objetivos del Rediseño

La sección original de características de la web contenía bloques de texto densos, cajas de especificaciones sobredimensionadas y acordeones `<details>` que generaban fatiga visual y ocultaban los puntos más atractivos de la app.

### Metas Logradas
1. **Eliminación del Ruido Visual:** Supresión total del banner de texto gigante y acordeones anidados en favor de una cuadrícula Bento simétrica, espaciosa y jerárquica.
2. **Mockups Vectoriales Nativos (Pure SVG):** En lugar de imágenes pesadas o emojis genéricos, cada funcionalidad clave cuenta con un componente interactivo vectorial diseñado a medida.
3. **Anonimización Estricta:** Reemplazo de cualquier nombre propio real ("Mateo H.", "Sebas", etc.) por títulos académicos neutros ("ESTUDIANTE ESPE", "ING. MECÁNICA", "Tu Horario", "Compañero de Clase").
4. **Micro-Animaciones Táctiles Globales:** Sensación fluida estilo Apple / Neo-Brutalist a lo largo de toda la web, con respeto total a usuarios con `prefers-reduced-motion`.

---

## 2. Las 8 Tarjetas Bento de Características (`Features.astro`)

| # | Característica | Mockup Visual Implementado | Micro-Animación |
|---|---|---|---|
| **01** | **Carnet Digital de Biblioteca** | Credencial estudiantil con silueta vectorizada, código de barras con anchos variables (`rect`), código QR SVG auténtico y mención de carrera ("ING. MECÁNICA"). | Elevación de tarjeta (`translateY(-6px)`), barrido holográfico diagonal (`holographic-sweep`) y brillo perimetral verde neón. |
| **02** | **Ruta Crítica de la Malla** | Grafo curricular con nodos de materias ("Cálculo I", "EDO", "Mecánica"), flechas conectoras y etiqueta de advertencia. | Pulso de alerta ámbar en el nodo de prerrequisito crítico. |
| **03** | **Horario en Pantalla de Bloqueo** | Marco de smartphone con isla dinámica, reloj LED digital (11:42), clase activa y aula de bloque. | Reloj digital con parpadeo de dos puntos LED (`led-colon-blink`) y respiración de luz de fondo. |
| **04** | **Alarma Sonora Despertadora** | Tarjeta de reproductor con barras de espectro ecualizador (5 barras SVG) y alerta sonora en bucle. | Barras del ecualizador oscilando en bucle con keyframes independientes (`eq-bounce-1..5`). |
| **05** | **Alertas Escalonadas con Anticipación** | Pista de control deslizante (*slider track*) con escala de tiempo (30m, 1h, 3h, 24h) y pulgar de arrastre táctil. | Expansión elástica del pulgar al pasar el cursor y resplandor esmeralda. |
| **06** | **Comparador de Horarios P2P** | Bloques de horario en paralelo con cuadrícula horaria y badges "Tu Horario" (T) vs "Compañero de Clase" (C), resaltando huecos compartidos. | Pulso de sincronización P2P en el badge de horas libres comunes. |
| **07** | **HomeWidget Nativo de Android** | Widget de escritorio Android con chasis translúcido, hora, aula, docente y barra de progreso. | Flotación suave y brillo de contorno verde esmeralda. |
| **08** | **Cálculo de Graduación y Promedio** | Indicador circular SVG con trazo porcentual (`stroke-dasharray`), velocímetro de avance y proyección estimada. | Rotación suave y destello de medidor al interactuar. |

---

## 3. Catálogo de Micro-Animaciones en Otras Secciones

### A. Botones Globales (`global.css`)
- **Pop de Iconos (`.btn-app:hover svg`):** Escala elástica (`scale(1.1)`) con curva *spring* al pasar el puntero sobre cualquier botón.

### B. Hero Principal (`Hero.astro`)
- **Feature Chips (`.feature-chip`):** Elevación (`translateY(-3px)`), borde verde esmeralda, sombra con blur y giro de icono (`scale(1.18) rotate(4deg)`).
- **Botón de Descarga (`.btn-hero-cta`):** Deslizamiento vertical de flecha (`translateY(3px)`).
- **Botón de Apoyo (`.btn-hero-support`):** Inclinación del icono (`scale(1.15) rotate(-6deg)`).
- **Barra de Progreso Móvil (`.class-progress-bar::after`):** Destello de luz viajero continuo (*specular shimmer beam*) cada 3.2s.
- **Selector de Vista (`.seg-btn:hover`):** Escala de icono `1.15`.

### C. Vistas de la App (`AppScreensShowcase.astro`)
- **Segmented Tab Control (`.seg-tab-btn`):** Realce con sutil elevación (`translateY(-1px)`) y escala del icono en pestañas inactivas.
- **Checklist de Beneficios (`.check-item`):** Elevación (`translateY(-3px) translateX(2px)`), resplandor perimetral y rotación del check (`scale(1.15) rotate(4deg)`).
- **Chasis Showcase (`.device-mockup-frame`):** Flotación suave y halo esmeralda en hover.

### D. Zona de Descargas (`DownloadSection.astro`)
- **Tarjeta APK Principal (`.apk-primary-showcase`):** Elevación (`translateY(-4px)`), sombra difuminada y rotación suave del logo.
- **Flecha de Descarga (`.download-bounce-icon`):** Rebote rápido alternado en hover.
- **Guía de 3 Pasos (`.step-box`):** Elevación (`translateY(-5px)`), borde verde neón y rotación del círculo numerado (`scale(1.15) rotate(-4deg)`).
- **Pastillas de Celular Antiguo (`.btn-arch-pill`):** Elevación y escala del icono de teléfono.

### E. Apoyo al Proyecto (`SupportSection.astro`)
- **Metas de Recaudación (`.goal-item`):** Desplazamiento lateral (`translateX(3px) translateY(-2px)`) con micro-rotación del check.
- **Caja de Deuna (`.deuna-box`):** Elevación (`translateY(-3px)`) con sombra esmeralda profunda y rotación del icono de Deuna.
- **Tarjeta QR (`.qr-display-card`):** Elevación con sutil rotación ámbar (`translateY(-4px) rotate(0.4deg)`).

### F. Guías y Preguntas Frecuentes (`DocsSection.astro`)
- **Cajas de Guías (`.guide-box`):** Elevación fluida sobre el fondo.
- **Pasos de Guía (`.guide-step`):** Desplazamiento horizontal (`translateX(4px)`) y aumento de escala en la píldora numerada.
- **Banner de Resultado (`.guide-result-banner`):** Elevación y rotación del icono de check verde/ámbar (`scale(1.18) rotate(6deg)`).
- **Acordeones FAQ (`.faq-accordion-item`):** Elevación sutil previa a la apertura y rotación elástica del glifo `+` a `×`.

### G. Colaboración y Sugerencias (`FeedbackSection.astro` & `CollaborationSection.astro`)
- **Tarjetas de Sugerencias y Roles:** Elevación de `-4px` con sombra dura, pop del icono (`scale(1.12) rotate(4deg)`) y flecha de enlace externo desplazada en diagonal (`translateX(3px) translateY(-3px)`).

### H. Pie de Página (`Footer.astro`)
- **Banner Pre-Footer:** Elevación ámbar hacia arriba (`translateY(-3px)`).
- **Enlaces de Navegación (`.footer-link-group a`):** Deslizamiento horizontal elegante (`translateX(4px)`).
- **Botón "↑ Arriba" (`.btn-back-top`):** Elevación con borde e iluminación verde esmeralda.

### I. Páginas de Comunidad (`avisos.astro` & `negocios.astro`)
- **Chips de Categoría:** Elevación táctil (`translateY(-2px)`).
- **Tarjetas de Negocios y Avisos:** Elevación con realce verde y rotación de logo comercial (`scale(1.08) rotate(-2deg)`).
- **Botones de Contacto:** Elevación táctil con sombra de relieve.

---

## 4. Accesibilidad y Rendimiento

Todas las micro-animaciones:
1. Emplean propiedades aceleradas por GPU (`transform`, `opacity`, `filter`).
2. Tienen una duración corta y controlada ($\le 260\text{ms}$) con curvas de salida orgánicas (`--ease-spring`, `--ease-apple`).
3. Cuentan con soporte estricto para `@media (prefers-reduced-motion: reduce)`, desactivando o reduciendo cualquier movimiento continuo o transformaciones en hover para usuarios que requieran movimiento estático.
