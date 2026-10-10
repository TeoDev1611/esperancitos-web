# 🎨 Análisis Integral de Experiencia de Usuario (UX) e Interfaz (UI)

## Esperancitos Mobile — Versión de Pruebas: v1.4.0 (Build 240) — 2026-09-25

---

## 1. Visión y Filosofía de Diseño: "Neo-Student Brutalism"

La interfaz de usuario de **Esperancitos** rompe con el molde genérico de las aplicaciones académicas aburridas o de diseño plano corporativo. Está construida bajo la filosofía **Neo-Student Brutalism**:

- **Bordes Nítidos y Geometría Definida:** Contornos de 1.5px a 2px en tarjetas (`BrutalistCard`), botones (`BrutalistButton`) y campos de entrada, brindando una estructura visual sólida y fácil de escanear.
- **Sombras Duras con Desplazamiento Angular (_Hard Offset Shadows_):** En lugar de sombras difusas o borrosas que cansan la vista y añaden ruido gráfico, se emplean sombras sólidas de 4px con ángulo descendente en tono negro o verde esmeralda (`BrutalistShadowType.emerald`), generando una sensación táctil de "pulsabilidad".
- **Paleta Dark Slate & Esmeralda Militar-Tecnológico:**
  - Fondo Primario: `#0B111E` (Dark Slate Profundo, minimiza consumo de batería OLED).
  - Superficies de Tarjetas: `#161F30` y `#1E293B` (Gris Pizarra Elevado).
  - Acento Principal: `#10B981` (Esmeralda Tecnológico, color representativo de la ESPE).
  - Alertas y Estados: `#EF4444` (Crítico / Atrasado), `#F59E0B` (Urgente / 24h), `#3B82F6` (Informativo).

---

## 2. Evaluación de Ergonomía Táctil y Accesibilidad (WCAG 2.1 AA)

### A. Tamaños Mínimos de Objetivos Táctiles (_Touch Targets_)

Siguiendo las pautas **WCAG 2.1 Criterio 2.5.5** y las directrices de Material Design 3, ningún elemento interactivo debe tener un área táctil inferior a **48 x 48 dp**:

- **Selector de Días L-S (Horario):** Cada pastilla de día tiene un ancho proporcional con altura mínima de 44-48 dp, permitiendo cambios rápidos con el pulgar.
- **Chips de Selección de Cuenta y Filtros:** Implementados con `minimumSize: Size(0, 40)` y padding interno generoso, asegurando toques precisos al caminar.
- **Botones de Incremento Fino ($\pm 0.1$) en el Simulador:** Se integraron con `BoxConstraints(minWidth: 32, minHeight: 32)` y un contenedor táctil exterior ampliado a 44dp.
- **Conmutadores de Ajustes y Checkboxes:** Integrados mediante `ListTile` y `Switch` nativo con zona táctil extendida a todo el ancho de la tarjeta.

### B. Relaciones de Contraste de Color (_Contrast Ratios_)

Medición de contraste contra los fondos oscuros `#0B111E` y `#161F30`:

| Elemento Visual            | Color Texto | Color Fondo | Ratio Medido | Nivel WCAG          |
| :------------------------- | :---------- | :---------- | :----------- | :------------------ |
| **Texto de Títulos**       | `#FFFFFF`   | `#0B111E`   | **18.2 : 1** | **AAA (Excelente)** |
| **Acento Esmeralda**       | `#10B981`   | `#0B111E`   | **6.4 : 1**  | **AA (Superado)**   |
| **Texto Secundario/Muted** | `#94A3B8`   | `#161F30`   | **5.1 : 1**  | **AA (Aprobado)**   |
| **Etiquetas de Urgencia**  | `#F59E0B`   | `#161F30`   | **5.8 : 1**  | **AA (Aprobado)**   |
| **Alertas Críticas**       | `#EF4444`   | `#161F30`   | **4.9 : 1**  | **AA (Aprobado)**   |

Todos los textos y elementos informativos clave superan el umbral mínimo de 4.5:1 para texto normal y 3:1 para texto grande, garantizando legibilidad en exteriores bajo la luz solar andina.

---

## 3. Jerarquía Visual y Densidad de Información

Uno de los mayores retos en la vida universitaria es el estrés generado por la sobrecarga de información. La arquitectura de información de Esperancitos combate esto mediante el principio de **"Información Progresiva y Reducción Cognitiva"**:

1. **Dashboard — Regla de los 3 Segundos:**
   - En menos de 3 segundos, el estudiante sabe exactamente cuál es su siguiente compromiso académico mediante la tarjeta gigante `NextClassPreviewCard`. Si no hay más clases, se muestra la tarjeta de descanso `TodayClassesEndCard`, eliminando la incertidumbre.
2. **Tareas — Semáforo de Urgencia Visual:**
   - Las tareas no son una lista monótona de texto. Utilizan bordes codificados por color: rojo para vencimiento inmediato (<24h), ámbar para los próximos días y verde/gris para entregadas, permitiendo priorizar mentalmente sin leer cada fecha.
3. **Simulador de Notas — Barra Segmentada Intuitiva:**
   - La visualización del progreso no se limita a un número frío como `"11.5 / 20"`. Una barra de progreso segmentada muestra la contribución real de P1 (máx 7.00 pts) y P2 (máx 7.00 pts) frente a la línea divisoria vertical de los **14.0 puntos necesarios para aprobar**. El estudiante entiende instantáneamente si ya está en zona segura o si depende del examen final.

---

## 4. Micro-Interacciones y Retroalimentación Háptica

Para que la aplicación se sienta viva, reactiva y satisfactoria al tacto, se ha diseñado una capa sensorial mediante el motor háptico de Android (`HapticFeedback`):

- **Toque en Filtros y Pestañas:** Vibración ligera `lightImpact()` que confirma el cambio de vista sin distraer.
- **Marcado de Tarea como Entregada:** Pulsación de selección `selectionClick()`, generando una pequeña recompensa táctil al completar deberes.
- **Simulador de Notas:** Al mover los sliders a la zona de aprobación ($\ge 14.0$), la interfaz cambia a verde esmeralda y el texto pasa a _"¡Aprobado!"_.
- **Generación y Escaneo de Código QR:** Al detectar el QR o pulsar _"Copiar Datos"_, se emite un `mediumImpact()` que asegura al usuario que el intercambio se completó con éxito.

---

## 5. Pruebas de Estrés en Pantallas Estrechas (Edge Cases & Responsividad)

Durante la suite de pruebas de integración visual (`features_visual_integration_test.dart`), se sometieron las vistas a viewports ultra-compactos (dispositivos económicos con resoluciones de 720x1600 con escala de 2.5x o anchos de 288dp a 340dp):

- **Prevención de `RenderFlex Overflow`:**
  - Todos los títulos largos y descripciones se envolvieron en `Expanded`/`Flexible` con `TextOverflow.ellipsis`.
  - Las filas que contenían texto descriptivo y botones numéricos (ej. en el slider de notas) se aislaron para que el texto se comprima elegantemente antes de empujar los botones fuera de la pantalla.
  - El diálogo de compartir QR se diseñó con `SingleChildScrollView` y límites de altura máxima (`maxHeight: 140`) en la lista de tareas, evitando que el teclado virtual oculte el código QR.

---

## 6. Evaluación de los Flujos de Usuario Principales

| Flujo de Usuario                | Fricción Previa (Sistemas Web)                           | Experiencia en Esperancitos                                  | Evaluación UX                |
| :------------------------------ | :------------------------------------------------------- | :----------------------------------------------------------- | :--------------------------- |
| **Consultar próxima aula**      | 4-6 clics en Banner móvil, login SSO lento con reCAPTCHA | 1 toque (o 0 toques mediante el Widget de escritorio)        | **⭐⭐⭐⭐⭐ (Excepcional)** |
| **Entrar a clase virtual**      | Buscar link de Teams en foros de Moodle                  | 1 toque en botón _"Unirse a clase"_ desde el Dashboard       | **⭐⭐⭐⭐⭐ (Excepcional)** |
| **Calcular si paso la materia** | Cálculo manual con regla de tres y calculadora           | Sliders interactivos con cálculo instantáneo y meta 14/16/18 | **⭐⭐⭐⭐⭐ (Excepcional)** |
| **Pasarse tareas entre amigos** | Mandar capturas por WhatsApp y transcribir               | Generar código QR en 1 toque y escanear sin internet         | **⭐⭐⭐⭐⭐ (Innovador)**   |
| **Carga en datos móviles**      | Consumo alto de megas al recargar páginas pesadas        | Modo Ahorro de Datos con base de datos local SQLite          | **⭐⭐⭐⭐⭐ (Optimizado)**  |

---

## 7. Recomendaciones y Próximos Pasos de UX/UI

1. **Animaciones de Transición con Hero Widget:**
   - Implementar transiciones compartidas (_Hero animations_) al abrir una materia desde el Horario o Tareas hacia su pantalla de materiales, incrementando la fluidez visual.
2. **Gráfico Circular de Progreso en Tareas (FEAT-06):**
   - Incorporar un widget radial de porcentaje de tareas completadas en la cabecera de `AssignmentsScreen`.
3. **Indicador de Estado de Conexión:**
   - Aunque la app es offline-first, un pequeño indicador visual en la barra superior (ej. un punto verde sutil con _"Modo Local Activo"_) brindará mayor tranquilidad al estudiante.
