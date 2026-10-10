# 📋 Plan de Implementación de Esperancitos

Plan maestro desarrollado para guiar la construcción, arquitectura e integración del cliente estudiantil para la ESPE, actualizado con el estado de avance al **2026-09-29**.

---

## 🎯 Objetivo del Proyecto

Construir un cliente móvil independiente, offline-first y privado para estudiantes de la Universidad de las Fuerzas Armadas ESPE que unifique:

1. **Ellucian Banner 9 SSB:** Horario de clases y aulas vía autenticación SAML en WebView + fetch interno con cookies de sesión sobre `/StudentRegistrationSsb/ssb/registrationHistory/reset` procesando el JSON nativo en Isolate secundario.
2. **Moodle:** Cursos, tareas, exámenes, calificaciones y materiales de estudio en 4 campus vía Web Services nativos (`wstoken`) y SSO `launch.php`, con almacenamiento local en SQLite (Drift v2).

---

## 🏗️ Desglose de Fases de Construcción

### FASE 1 — Setup, Clean Architecture y UI/UX Neo-Brutalista — [✅ COMPLETADA]

- Paquete independiente: `com.esperancitos.esperancitos`.
- Tema visual Dark Slate (`#0B1120`) con Acento Esmeralda (`#10B981`) y fuentes locales `Outfit` / `Inter`.
- Componentes de diseño Neo-Student Brutalism (`BrutalistCard`, `BrutalistButton`, `StatusBadge`).
- Navegación declarativa con `GoRouter 18` y `ShellRoute` (4 pestañas persistentes).
- Jerarquía sellada `Result<T>` y `AppFailure`.
- Pantalla de onboarding con solicitud interactiva de permisos de notificación.

### FASE 2 — Capa de Datos (Offline-First con Drift SQLite v2) — [✅ COMPLETADA]

- Base de datos local tipada en `lib/core/database/` con `schemaVersion = 2`.
- Tablas: `MoodleCourses`, `Assignments`, `GradeItems`, `EllucianScheduleCache`.
- Clave única `moodleId` con estrategia `insertOnConflictUpdate`.
- Índices secundarios B-Tree para optimización de consultas de horario y tareas.
- Repositorios locales desacoplados inyectados con Riverpod.

### FASE 3 — Moodle Nativo Multi-Campus (Web Services REST) — [✅ COMPLETADA]

- Soporte para 4 campus institucionales (`micampus`, `micampusvirtual`, `micampus2`, `micampus1`).
- Flujo SSO oficial con `/admin/tool/mobile/launch.php` e intercepción del protocolo `moodlemobile://token=<base64>`.
- Normalización estricta de zonas horarias a `America/Guayaquil` (GMT-5) con `TimezoneUtils`.
- Consumo de funciones de Web Services: `core_webservice_get_site_info`, `core_enrol_get_users_courses`, `mod_assign_get_assignments`, `mod_assign_get_submission_status` (en lotes de 4), `gradereport_user_get_grade_items` y `core_course_get_contents`.

### FASE 4 — Ellucian Banner 9 SSB (SAML WebView + In-Session Fetch) — [✅ COMPLETADA Y ESTABILIZADA]

- WebView visible exclusivamente para el login SAML federado institucional.
- Detección de llegada a `/StudentRegistrationSsb`.
- Extracción directa de materias y horarios en sesión autenticada mediante `/StudentRegistrationSsb/ssb/registrationHistory/reset?term=$term`.
- Parseo con `BannerScheduleParser` en worker Isolate: soporte dual para Array JSON de eventos (`getRegistrationEvents`) y árbol de registros (`registrations` con `meetingTimes`), ajuste de 59 minutos, decodificación HTML y deduplicación.
- Blindaje en Android (Moto G06): `android:largeHeap="true"`, `ACCESS_NETWORK_STATE`, control de errores DNS/red en UI y liberación de buffers con `about:blank`.
- Manejo de estados `SyncStatus.sessionExpired` vs `SyncStatus.networkError`.

### FASE 5 — Dashboard y Horario Reactivos con Atajos Virtuales — [✅ COMPLETADA]

- `NextClassPreviewCard` en el Dashboard con indicador de clase activa (pulso animado aislado) o tarjeta de fin de jornada.
- Detección y atajo directo a clases virtuales en Teams, Zoom y Meet (FEAT-01).
- Carrusel horizontal de entregas urgentes de Moodle.
- Pantalla de Horario con selector L-S (touch targets $\ge 48\text{dp}$) y timeline por horas.
- Exportador de horario a Wallpaper PNG estilizado (FEAT-04) y generador iCalendar `.ics` (RFC 5545).
- Widget nativo de Android "Próxima Clase" para la pantalla de inicio (FEAT-02).

### FASE 6 — Tareas, Notificaciones, Materiales y Calculadora — [✅ COMPLETADA]

- Pestaña de Tareas con filtrado en 3 estados (Pendientes, Completadas, Atrasadas).
- Deslizamiento lateral con feedback háptico para marcar entregas localmente y opción "Deshacer".
- Explorador y descargador offline de archivos y diapositivas de Moodle (FEAT-08).
- Programación de notificaciones escalonadas (7d, 3d, 24h, 3h antes de la entrega).
- Resumen matutino diario a las 06:30 AM (FEAT-03) y alerta de notas nuevas (FEAT-09).
- Calculadora de nota final para la regla institucional de la ESPE (35/35/30 con umbral 14.0/20.0).

### FASE 7 — Ajustes, Rendimiento y Seguridad — [✅ COMPLETADA]

- Vista de perfil con ID de estudiante.
- Conmutadores individuales para cada nivel de alerta con persistencia en `SecureStorageService`.
- Conmutador de campus con borrado atómico de datos de Moodle.
- Proceso de cierre de sesión seguro: borrado de credenciales cifradas, cancelación de alarmas y vaciado atómico de SQLite.
- Optimizaciones de rendimiento mobile PERF-01 a PERF-06.

### FASE 8 — Agenda Escolar Unificada y Elementos Personales (v1.5.0) — [✅ COMPLETADA]

- Vistas 3-en-1: Día, Semana y Mes integradas en `ScheduleScreen`.
- Elementos personales del estudiante: Eventos, recordatorios y checklists propias con subtareas.
- Integración con Drift SQLite v5 y alarmas exactas (`SCHEDULE_EXACT_ALARM`) con fallback seguro.

### FASE 9 — Malla Curricular Interactiva ("Mi Malla" - 23 Carreras ESPE) — [✅ COMPLETADA]

- Catálogo dinámico de 23 carreras oficiales de la ESPE (`assets/mallas/*.json`) 100% offline.
- Motor de cálculo puro (`CurriculumCalculator`): desbloqueo por semestre $N-1$, hitos de titulación y proyección de graduación.
- Mapeo de 12 áreas de conocimiento y persistencia en Drift SQLite v6.
- Vistas duales (Grilla por semestres y Lista continua) con filtros por estado y buscador en tiempo real.

### FASE 10 — Sistema de Temas Neo-Brutalistas, Ocultar Smowl, Auditoría UX/UI y Rendimiento 60/120 FPS — [✅ COMPLETADA]

- Selector de 2 temas oscuros: Oscuro Slate y Deep Negro OLED.
- Opción en Ajustes y Onboarding para ocultar la materia tutorial de Smowl.
- Adaptación dinámica de Date/Time Pickers y motor háptico.
- Optimización de rendimiento: paralelismo I/O con `Future.wait()`, caché en memoria $O(1)$, aislamiento con `RepaintBoundary` y claves `ValueKey`.

### FASE 11 — Versión Beta: Detección Curricular Automática, Materiales Moodle Offline, Diagnóstico de Red y Optimización R8/ProGuard — [✅ COMPLETADA]

- Auto-detección de materias cursando en Mi Malla desde el horario de Banner y cursos Moodle (`CurriculumCalculator.detectFromHorario`).
- Inferencia de materias previas que deben estar aprobadas y diálogo interactivo de confirmación.
- Visualización de materias que desbloquea (consecuentes) y toggle masivo de semestres aprobados.
- Modo pantalla completa de malla (Maximizar / Minimizar cabecera de progreso).
- Explorador y gestor de descargas offline de materiales Moodle (`CourseMaterialsScreen`) con visualización nativa.
- Módulo de diagnóstico de red y visor de registros en tiempo real (`ConnectionLogger` y `ConnectionLogViewerModal`) con enmascaramiento seguro de tokens.
- Configuración de reglas R8/ProGuard (`android/app/proguard-rules.pro`) y ofuscación/shrink seguro para producción.
- Sitio web oficial de presentación y distribución en Astro (`web/`).

### FASE 12 — Alarma de Tareas (Task Alarm: Audio en bucle, vibración y pantalla completa) — [✅ COMPLETADA]

- [x] Integración del plugin `alarm: ^5.13.2` y registro del asset `assets/audio/alarm.mp3`.
- [x] Permisos en `AndroidManifest.xml` (`SCHEDULE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT`, `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `WAKE_LOCK`, `RECEIVE_BOOT_COMPLETED`) y reglas keep en `proguard-rules.pro`.
- [x] Entidad de dominio pura `TaskAlarmSettings` (con validación mínima de 5 min y serialización JSON).
- [x] Persistencia segura de configuración con `SecureStorageService` (`task_alarm_enabled`, `task_alarm_lead_minutes`).
- [x] `TaskAlarmScheduler` desacoplado tras interfaz `AlarmApiClient` para mockeo y testing unitario exhaustivo.
- [x] Cálculo determinista de `fireAt = dueDate - leadTime` con zona horaria ecuatoriana (`TimezoneUtils`).
- [x] Derivación determinista de ID int32 positivo estable a partir de `moodleId`.
- [x] Límite protector de las ~20 tareas pendientes más próximas para no saturar `AlarmManager`.
- [x] Reprogramación idempotente (`rescheduleAll()`): sincronización de Moodle, cambios de ajustes y swipe/marcado de tareas.
- [x] Cancelación atómica (`stopAll()`): cierre de sesión y cambio de campus.
- [x] Componente UI Neo-Brutalista `TaskAlarmSettingTile` en Onboarding y Ajustes con selector de anticipación (30m, 1h, 3h, 6h, 12h, 24h, personalizada) y diálogo para Android 14+ / optimización de batería / aviso iOS.
- [x] Pantalla completa interactiva `AlarmRingScreen` con botones: Detener, Posponer 10 min y Ver tarea (GoRouter a `/assignments`).
- [x] 15 pruebas dedicadas (9 unitarias + 6 de widgets) con 100% en verde.

### FASE 13 — Eliminación del Modo Claro y Consolidación de Temas Oscuros Neo-Brutalistas — [✅ COMPLETADA]

- [x] Eliminación total del tema claro ("Claro Blanco"): borrado de `AppThemePalette.light`, eliminación de `AppThemeMode.light` y `AppThemeMode.system`.
- [x] Consolidación en 2 temas visuales: **Oscuro Slate** (`#101319`, acentos esmeralda) y **Deep Negro OLED** (`#000000`, máximo ahorro de batería).
- [x] Migración transparente de preferencias: usuarios con `light` o `system` migran de forma segura a `dark` sin crash ni interrupción.
- [x] `MaterialApp` configurado en `ThemeMode.dark` con `theme` y `darkTheme` idénticos y reactivos.
- [x] Simplificación de Date/Time pickers a `ColorScheme.dark()` sin branching de brillo claro.
- [x] Adaptación completa de tests visuales y unitarios (`test/unit/theme_test.dart`, `test/visual/features_visual_integration_test.dart`, `test/unit/task_alarm_widget_test.dart`).

### FASE 14 — Auditoría y Corrección Integral de la Sincronización (Banner + Moodle) — [✅ COMPLETADA]

- [x] Diagnóstico de causa raíz con tests de reproducción (`test/unit/sync_failure_reproduction_test.dart`).
- [x] Detección explícita de sesión caducada en Banner (`SessionExpiredFailure`) sin enmascaramiento con datos viejos ni borrado de base local.
- [x] Protección anti-vaciado (`forceClearIfEmpty: false`) en `AppDatabase.saveSchedule` ante respuestas vacías o erróneas.
- [x] Reemplazo atómico transaccional en Drift para cursos, tareas y calificaciones (`atomicReplaceCourses`, `atomicReplaceAssignments`, `atomicReplaceGradeItems`) eliminando elementos cancelados y duplicación de notas.
- [x] Corrección de igualdad `operator ==` y `hashCode` en `ClassMeetingEntity` para reflejar cambios de aula, docente y ubicación en la UI.
- [x] Desambiguación de claves de timeline en `AgendaRepositoryImpl` incluyendo `meeting.startTime`.
- [x] Corrección de parsing para horas matutinas de 3 dígitos (`"700"` $\rightarrow$ `"07:00"`) con `padLeft(4, '0')`.
- [x] Forzado de cabeceras HTTP anti-caché (`Cache-Control: no-cache, no-store, must-revalidate`, `Pragma: no-cache`, `Expires: 0`) en peticiones a Banner.
- [x] Creación del orquestador central `SyncOrchestrator` (`lib/core/sync/sync_orchestrator.dart`) con mutex de concurrencia `_isSyncing` y reporte tipado `SyncReport`.
- [x] Encadenamiento de 7 post-sync hooks independientes con aislamiento de fallos: recordatorios de clases, alertas escalonadas de tareas, reprogramación de alarmas de tareas (`TaskAlarmScheduler.rescheduleAll()`), actualización de HomeWidget nativo de Android, sincronización curricular con Mi Malla, actualización de resumen matutino y recarga de enlaces de clases virtuales.
- [x] Invalidación masiva de providers dependientes en Riverpod forzando rebuild reactivo de la UI.
- [x] Actualización de pantallas (Dashboard, Settings, SSO WebView) para consumir `SyncOrchestrator` con feedback específico por fuente y timestamps reactivos.
- [x] Reglas ProGuard/R8 complementarias para `flutter_local_notifications` y `home_widget`.
- [x] 8 pruebas unitarias adicionales (`sync_failure_reproduction_test.dart` y `sync_orchestrator_test.dart`) alcanzando 234 tests con 100% de éxito.

### FASE 15 — Rediseño Web: Bento Grid de Funcionalidades, Mockups Vectoriales y Micro-Animaciones — [✅ COMPLETADA]

- [x] Eliminación completa de banners gigantes de texto y bloques `<details>` colapsados en la sección de características de la web.
- [x] Reestructuración estética en cuadrícula Bento de 8 tarjetas de alto impacto visual y equilibrio simétrico.
- [x] Mockups vectoriales SVG interactivos y auténticos: Carnet estudiantil digital con código de barras variable y QR, reloj LED digital de cuenta regresiva, ecualizador de audio con ondas dinámicas, slider track de anticipación, comparador de horarios P2P, HomeWidget nativo Android con efecto glassmorphism y marco de smartphone.
- [x] Anonimización rigurosa de toda la interfaz: eliminación total de nombres personales reales ("Mateo H.", "Sebas", etc.) en favor de denominaciones académicas universales ("ESTUDIANTE ESPE", "ING. MECÁNICA", "Tu Horario", "Compañero de Clase").
- [x] Sistema integral de micro-animaciones táctiles y fluidas a través de toda la web:
  - Hero: Feature chips con elevación y rotación de icono, flecha de descarga con deslizamiento dinámico, progreso de clase con destello _specular shimmer beam_.
  - Vistas: Segmented tab controls con micro-escala de icono, tarjetas de beneficios con elevación y rotación de check.
  - Descargas: Elevación de tarjetas APK con rotación de logo, rebote acelerado en hover de flecha, rotación elástica en círculos de pasos de instalación.
  - Apoyo: Elevación de metas y tarjetas de Deuna y QR con realces de acento.
  - Guías y FAQ: Elevación de cajas, deslizamiento de pasos con escala de píldoras y apertura animada.
  - Comunidad (Avisos y Negocios): Elevación de chips de filtro y tarjetas comerciales con pop de logo.
  - Global y Footer: Micro-escala elástica en iconos de botones (`.btn-app:hover svg`), deslizamiento de enlaces y elevación en botón volver arriba.
- [x] Respeto estricto de accesibilidad (`@media (prefers-reduced-motion: reduce)`) con desactivación elegante de todas las animaciones.

---

## 🧪 Estrategia y Cobertura de Pruebas Automatizadas

1. **Total de Pruebas Automatizadas:** 361 pruebas unitarias y de widgets aprobadas al 100% en 57 archivos de prueba (`flutter test`).
2. **Entorno de Calidad:**
   - **Versión de la App:** v1.0.0-beta.2.
   - **Base de Datos Local:** Drift SQLite v7 con soporte multi-cuenta y recurrencia por ocurrencia.
   - **Funcionalidades Mayores:** 20 features consolidadas (Malla 23 carreras, Horario y aulas, Moodle offline, Alarmas de tareas, Widgets nativos, Compartición P2P, Calculadora de notas, etc.).
3. **Áreas Cubiertas:**
   - Dominio y lógica pura (Banner parser, Moodle sync, Grade calculator, Curriculum calculator, Detección de horario y materias cursando, Area conocimiento, Timezone, ICS, Task Alarm scheduler y settings).
   - Orquestación y concurrencia de sincronización (`SyncOrchestrator`, detección de sesiones caducadas, protección anti-vaciado y post-sync hooks).
   - Persistencia y migraciones Drift (SQLite v1 a v7, reemplazo atómico transaccional, índices B-Tree, transacciones y cascadas).
   - Diagnóstico y telemetría de red con enmascaramiento de credenciales (`ConnectionLogger`).
   - Integración visual y anti-desbordamiento (`test/visual/features_visual_integration_test.dart`, `test/unit/task_alarm_widget_test.dart` y `test/widget_test.dart`).
   - Caching, concurrencia I/O de mallas, explorador de materiales y compartición P2P de datos vía QR.
4. **Análisis Estático:** 0 errores y 0 advertencias con `flutter analyze`.
