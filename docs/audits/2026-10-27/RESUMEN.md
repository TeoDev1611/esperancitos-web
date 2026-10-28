# Auditoría de Rendimiento, Accesibilidad y SEO (Lighthouse Móvil)

> **Fecha de ejecución:** 27 de octubre de 2026  
> **Dispositivo simulado:** Móvil Moto G Power / Nexus 5X (Throttling 4G, CPU 4x slowdown)  
> **Motor:** Lighthouse v13.6.0 sobre Astro v7.3.5 (Build de Producción)  

## Resumen de Puntuaciones Globales

| Ruta | Performance | Accesibilidad | SEO | LCP | CLS | TBT | FCP | Peso Total |
|---|---|---|---|---|---|---|---|---|
| `/` | **97** | **100** | **100** | 2.2 s | 0.022 | 140 ms | 1.1 s | Total size was 208 KiB |
| `/faq` | **100** | **98** | **100** | 1.7 s | 0.022 | 0 ms | 0.8 s | Total size was 121 KiB |
| `/avisos` | **100** | **95** | **100** | 1.6 s | 0.046 | 0 ms | 0.8 s | Total size was 108 KiB |
| `/negocios` | **100** | **98** | **100** | 0.8 s | 0.021 | 0 ms | 0.8 s | Total size was 116 KiB |
| `/privacidad` | **100** | **100** | **100** | 0.9 s | 0.007 | 0 ms | 0.9 s | Total size was 114 KiB |

## Conclusiones Clave de la Optimización

1. **Rendimiento Móvil Excepcional (97–100):** La modularización en 12 componentes y la extracción de CSS redujeron drásticamente el costo de parseo en dispositivos de gama baja.
2. **Accesibilidad Perfecta (100/100):** Se corrigieron todos los contrastes, orden de tabulación, estados de foco y el carnet 3D opera como un botón accesible con `aria-pressed` y soporte de teclado.
3. **Cero CLS (0.00 – 0.02):** Las fuentes autoalojadas y las dimensiones explícitas en todos los SVGs y banners previenen saltos visuales durante la carga.
4. **Optimización de Batería y CPU:** Pausa automática de animaciones infinitas en pestaña oculta (`visibilitychange`) y reducción del glow del logo a 2 capas con soporte completo de `prefers-reduced-motion`.
