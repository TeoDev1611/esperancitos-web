---
name: responsive-app-shell
description: Corrige y diseña layouts responsive tipo "app shell" (header fijo, contenido flexible con scroll interno, footer siempre visible) para presentaciones, wizards y apps móviles. Usar cuando haya contenido recortado, espacios vacíos, overflow, alturas fijas, o elementos que salen de pantalla en distintos tamaños.
---

# Responsive App Shell

## Cuándo usar
- Tarjetas o diapositivas con contenido cortado o sin scroll.
- Controles (progreso, navegación) que quedan fuera de pantalla.
- Espacio vacío al final en viewports altos.
- Diferencias entre móvil, tablet, escritorio y landscape.

## Diagnóstico (hacer primero)
1. Buscar `height`, `max-height`, `min-height` en px o `vh` en contenedores principales.
2. Buscar `overflow: hidden` en ancestros de la zona de contenido.
3. Verificar si la cadena flex está completa desde `html` hasta el contenedor con scroll.
4. Revisar uso de `100vh` (falla en móvil por la barra del navegador).

## Patrón correcto
```css
html, body { height: 100%; margin: 0; }

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;          /* fallback */
  height: 100dvh;
  max-width: 480px;
  margin-inline: auto;
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.app-header { flex: 0 0 auto; }

.app-main {
  flex: 1 1 auto;
  min-height: 0;          /* CRÍTICO: permite que el hijo haga scroll */
  display: flex;
  flex-direction: column;
}

.slide-card {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.app-footer { flex: 0 0 auto; }
```

## Escalado fluido
- Texto: `font-size: clamp(0.85rem, 0.8rem + 0.6vw, 1.1rem)`.
- Espaciado: `padding: clamp(8px, 2.5vw, 20px)`; `gap: clamp(6px, 1.5vh, 16px)`.
- Preferir `rem`, `%`, `dvh`; evitar px fijos para alturas.

## Viewports cortos
```css
@media (max-height: 700px) {
  .presenter-text { -webkit-line-clamp: 2; display: -webkit-box;
                    -webkit-box-orient: vertical; overflow: hidden; }
  .presenter-avatar { width: 48px; }
  .slide-card { padding: 10px; }
}
@media (max-height: 450px) and (orientation: landscape) {
  /* layout en 2 columnas: diapositiva | presentador+controles */
}
```

## Indicador de scroll
Añadir gradiente al borde inferior del área con scroll (mask-image o pseudo-elemento sticky) para señalar que hay más contenido.

## Checklist de verificación
Probar y reportar: 320x568, 360x640, 390x844, 412x915, 768x1024, 1440x900, 844x390 (landscape).
- [ ] Sin scroll en el body
- [ ] Header y footer siempre visibles
- [ ] Todo el contenido de la tarjeta es alcanzable por scroll
- [ ] Sin espacio vacío inútil
- [ ] Sin texto cortado ni overflow horizontal
- [ ] Safe-area respetada

## Reglas
- No modificar estilo visual (colores, sombras, bordes, fuentes) salvo que se pida.
- Entregar diffs mínimos y explicar la causa raíz.
- No usar `!important` ni parches con `position: absolute` para compensar.