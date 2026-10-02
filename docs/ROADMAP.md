# 🗺️ Roadmap de Producto e Ideas de Funcionalidades
## Versión Beta Oficial: v1.0.0-beta.1 — 2026-09-29

Este documento consolida las 19 funcionalidades analizadas para **Esperancitos**, clasificadas por impacto y esfuerzo técnico, reflejando su **estado real de implementación en la Versión Beta Oficial**.

---

## 📊 1. Matriz de Esfuerzo vs. Impacto y Estado

| Esfuerzo \ Impacto | Alto Impacto | Medio Impacto |
| :--- | :--- | :--- |
| **Bajo (Quick Win - S)** | • ✅ **FEAT-01:** Atajo directo a clase virtual (Teams/Zoom)<br>• ✅ **FEAT-02:** Widget de Android "Próxima Clase"<br>• ✅ **FEAT-03:** Resumen Matutino diario (06:30 AM)<br>• ✅ **FEAT-04:** Exportador de horario a Imagen/Wallpaper | • ✅ **FEAT-05:** Simulador de notas con sliders ("¿Con cuánto paso?")<br>• ⏳ **FEAT-06:** Estadísticas de entregas (A tiempo vs tarde)<br>• ✅ **FEAT-07:** Modo de ahorro de datos y red estricta<br>• ✅ **FEAT-18:** Consolidación de 2 temas oscuros (eliminación del tema claro) |
| **Medio (Improvement - M)** | • ✅ **FEAT-08:** Buscador y gestor offline de archivos/PDFs<br>• ✅ **FEAT-09:** Notificación de nueva calificación publicada<br>• ⏳ **FEAT-10:** Modo "Semana de Exámenes" (Quizzes + Calendario)<br>• ✅ **FEAT-17:** Alarma de tareas (audio en bucle, vibración y pantalla completa)<br>• ✅ **FEAT-19:** API Estática de Comunidad y Directorio Estudiantil v1 | • ✅ **FEAT-11:** Calendario mensual unificado (Clases + Tareas)<br>• ⏳ **FEAT-12:** Mapeo legible de bloques y aulas de campus<br>• ✅ **FEAT-13:** Soporte multi-periodo y archivo histórico |
| **Alto (Big Bet - L)** | • ✅ **FEAT-14:** Compartición P2P de checklist de tareas vía QR/Link<br>• ✅ **FEAT-15:** Calendario y Agenda Escolar Unificada (Día, Semana, Mes + Elementos Personales)<br>• ✅ **FEAT-16:** Malla Curricular Inteligente ("Mi Malla" - Auto-detección de horario, materias que desbloquea y 23 carreras ESPE) | |

> **Leyenda:**  
> ✅ **Implementado y Verificado** (En producción en Versión Beta v1.0.0-beta.1).  
> ⏳ **Pendiente de Inicio** (Planificado para próximas versiones).

---

## 💡 2. Catálogo Detallado de Funcionalidades (19 Ideas)

### 🟢 Funcionalidades Implementadas en la Versión Beta Oficial

#### [FEAT-01] Atajo directo a clase virtual (Teams, Zoom, Google Meet) — ✅ COMPLETADA
* **Problema resuelto:** Los estudiantes solían buscar apresuradamente el link de Teams o Zoom en la descripción del curso de Moodle 5 minutos antes de empezar la clase.
* **Solución técnica implementada:**
  - `VirtualMeetingDetector`: Regex avanzado sobre descripciones de cursos (`summary`) de Moodle detectando enlaces de Microsoft Teams, Zoom, Google Meet y Cisco Webex.
  - `VirtualMeetingResolver`: Asocia reuniones de horario por NRC o código de asignatura.
  - Botón *"Unirse a clase virtual"* en `NextClassPreviewCard` (Dashboard) y en las tarjetas del Horario con apertura directa vía `url_launcher`.
* **Estado:** ✅ **Completada y probada** en `test/unit/virtual_meeting_detector_test.dart` (10 tests unitarios).

#### [FEAT-02] Widget de pantalla de inicio para Android ("Próxima Clase") — ✅ COMPLETADA
* **Problema resuelto:** Tener que abrir la app completa para ver qué clase toca y en qué aula se dicta mientras se camina por los pasillos de la universidad.
* **Solución técnica implementada:**
  - Integración de `home_widget` y servicio `HomeWidgetService`.
  - Layout nativo XML en `android/app/src/main/res/layout/widget_next_class.xml` con diseño adaptativo.
  - Actualización periódica en segundo plano y tras cada sincronización de horario.
* **Estado:** ✅ **Completada y probada** en `test/unit/home_widget_service_test.dart`.

#### [FEAT-03] Resumen matutino automático (Notificación 06:30 AM) — ✅ COMPLETADA
* **Problema resuelto:** Empezar el día sin claridad de cuántas clases hay programadas ni cuáles tareas vencen hoy.
* **Solución técnica implementada:**
  - `MorningBriefingService`: Consulta Drift cada mañana para consolidar clases del día y tareas pendientes.
  - Programa una notificación local recurrente a las 06:30 AM (*"Hoy tienes X clases... y vencen Y tareas"*).
  - Conmutador en `SettingsScreen` con persistencia en `SecureStorageService`.
* **Estado:** ✅ **Completada y probada** en `test/unit/morning_briefing_test.dart`.

#### [FEAT-04] Exportador de horario a Imagen / Fondo de Pantalla (PNG estilizado) — ✅ COMPLETADA
* **Problema resuelto:** Estudiantes que colocan su horario como fondo de pantalla de bloqueo o lo comparten en historias de WhatsApp/Instagram con compañeros.
* **Solución técnica implementada:**
  - `ScheduleImageExportService`: Renderizado programático en canvas de alta resolución con paleta Dark Slate + Esmeralda.
  - `ScheduleExportDialog`: Modal con vista previa y botón de compartir nativo vía `share_plus`.
* **Estado:** ✅ **Completada y probada** en `test/unit/schedule_image_export_test.dart`.

#### [FEAT-05] Simulador interactivo de notas ("¿Con cuánto paso?") — ✅ COMPLETADA
* **Problema resuelto:** Los estudiantes necesitan simular escenarios con sliders para saber qué nota necesitan en el examen final o qué pasaría con cierta calificación.
* **Solución técnica implementada:**
  - Sliders interactivos en `GradeCalculatorScreen` con barra segmentada de progreso hacia 14.0 pts y slider en tiempo real "¿Y si saco X en el Final?".
  - Selector de metas (14.0, 16.0, 18.0) y cálculo de examen de recuperación en `grade_calculator.dart`.
* **Estado:** ✅ **Completada y probada** en `test/unit/grade_calculator_test.dart` (12 tests) y `features_visual_integration_test.dart`.

#### [FEAT-07] Modo de Ahorro de Datos y Red Estricta — ✅ COMPLETADA
* **Problema resuelto:** Ahorrar megas en el campus evitando transferencias y descargas pesadas bajo datos celulares.
* **Solución técnica implementada:**
  - Conmutador en Ajustes conectado a `dataSaverProvider` y `SecureStorageService`.
  - Prioriza la caché local SQLite Drift y suspende precargas multimedia.
* **Estado:** ✅ **Completada y probada** en `features_visual_integration_test.dart`.

#### [FEAT-08] Buscador y gestor local de archivos y diapositivas de Moodle — ✅ COMPLETADA
* **Problema resuelto:** Navegar por las carpetas y temas de Moodle en la web móvil para descargar PDFs o guías es lento y engorroso.
* **Solución técnica implementada:**
  - Consumo del endpoint `core_course_get_contents` en `MoodleRemoteDataSource`.
  - `CourseMaterialsScreen`: Vista categorizada por temas y módulos, con filtrado rápido y búsqueda de archivos.
  - `MoodleFileDownloadService`: Descarga en almacenamiento privado de la app y apertura instantánea mediante `open_filex`.
* **Estado:** ✅ **Completada y probada** en `test/unit/course_materials_test.dart`.

#### [FEAT-09] Notificación de nueva calificación publicada (Diff de notas) — ✅ COMPLETADA
* **Problema resuelto:** Ansiedad de los estudiantes al revisar Moodle repetidamente al final del semestre para ver si el docente subió la nota del parcial.
* **Solución técnica implementada:**
  - Comparador de diferencias de notas (*diffing*) en `MoodleSyncService` contra la tabla `grade_items` de Drift.
  - Si un item pasa de `null` a tener nota o su valor cambia, emite una notificación local:  
    *"¡Nueva nota publicada! [Materia]: [Nombre Item] = 18.5/20"*.
* **Estado:** ✅ **Completada e integrada** en el pipeline de sincronización de Moodle.

#### [FEAT-11] Calendario mensual unificado — ✅ COMPLETADA
* **Problema resuelto:** La vista semanal no permitía visualizar fechas de entregas a fin de mes o distribución temporal amplia.
* **Solución técnica implementada:**
  - Vista `MonthlyCalendarView` con `table_calendar` integrada en `ScheduleScreen`.
  - Marcadores de clases y tareas con filtros por categoría.
* **Estado:** ✅ **Completada e integrada**.

#### [FEAT-13] Soporte multi-periodo y archivo histórico — ✅ COMPLETADA
* **Problema resuelto:** Al cambiar de semestre se perdía el acceso al historial de periodos previos de Banner.
* **Solución técnica implementada:**
  - Tabla `BannerAcademicHistory` en Drift v3, parser `BannerAcademicHistoryParser` y pantalla visual `AcademicHistoryScreen`.
* **Estado:** ✅ **Completada e integrada**.

#### [FEAT-14] Compartición P2P de checklist de tareas vía QR / Enlace — ✅ COMPLETADA
* **Problema resuelto:** Compartir tareas o listas de repaso con compañeros rápidamente y sin requerir internet.
* **Solución técnica implementada:**
  - Servicio `QrDataSharingService` con compresión Base64 URL-safe (`esp://qr?d=...`).
  - Generador visual `QrShareChecklistDialog` (`qr_flutter`) y escáner de cámara `QrImportScannerModal` (`mobile_scanner`).
  - Importación automática de ítems como tareas en la base de datos Drift local.
* **Estado:** ✅ **Completada y probada** en `test/unit/qr_data_sharing_test.dart` y `features_visual_integration_test.dart`.

#### [FEAT-15] Calendario y Agenda Escolar Unificada (Día, Semana, Mes + Elementos Personales) — ✅ COMPLETADA
* **Problema resuelto:** Dispersión de información entre clases de Banner, entregas de Moodle y compromisos personales/recordatorios/listas de estudio, sin una vista consolidada ni soporte para eventos propios del estudiante.
* **Solución técnica implementada:**
  - **Vistas 3-en-1:** Segmented control superior `[ DÍA | SEMANA | MES ]` con persistencia de fecha seleccionada:
    - *Vista Día:* Timeline vertical fusionada (clases + tareas + eventos + recordatorios + checklists).
    - *Vista Semana:* 7 columnas de días con scroll horizontal, bloques de color y botón de adición rápida.
    - *Vista Mes:* Grid mensual con puntos de densidad multi-color por categoría (Esmeralda, Azul, Morado, Ámbar, Coral) y leyenda descriptiva.
  - **Elementos Personales del Estudiante:**
    - *Eventos personales:* Título, descripción, fechas/horas inicio-fin, ubicación, color, opción todo el día, recurrencia (diario/semanal) y selección múltiple de recordatorios.
    - *Recordatorios:* Título, fecha y hora puntual, repetición y checkbox de completado inmediato.
    - *Checklists propias:* Título, descripción, fecha límite opcional y lista de subtareas con barra de progreso ("3/5 completadas").
  - **Drift SQLite v5:** Nuevas tablas `PersonalEvents`, `PersonalReminders`, `UserChecklists`, `UserChecklistItems` con índices secundarios B-Tree y migración automática no destructiva `_migrateSchemaV4ToV5`.
  - **Modelo Unificado:** Clase sellada `CalendarItem` (`ClassMeetingItem`, `AssignmentItem`, `PersonalEventItem`, `ReminderItem`, `ChecklistItem`) en Clean Architecture y agregador reactivo en streaming `AgendaRepositoryImpl`.
  - **Notificaciones y Alarmas Exactas:** Integración en `NotificationService` con soporte para Android 12+ (`SCHEDULE_EXACT_ALARM`), fallback automático a alarmas inexactas ante denegación de permisos, y cancelación automática al editar o eliminar ítems.
  - **UI Neo-Student Brutalism:** FAB contextual `+` con selector de tipo, formularios estilizados con pickers consistentes y bottom sheet interactivo para ver detalles o marcar ítems como completados.
* **Estado:** ✅ **Completada y probada** en `test/unit/agenda_repository_test.dart`, `test/unit/agenda_migration_test.dart` y `test/unit/agenda_notification_test.dart` (140/140 tests totales pasando en el proyecto).

#### [FEAT-16] Malla Curricular Interactiva ("Mi Malla" - SchoIA+ Replicada 100% Offline) — ✅ COMPLETADA
* **Problema resuelto:** Los estudiantes de la ESPE debían depender de la web externa de SchoIA+ o de PDFs largos para conocer qué materias cursar, cuáles están bloqueadas por prerrequisitos, su avance curricular y la fecha estimada de graduación, sin ninguna integración en su app de uso diario.
* **Solución técnica implementada:**
  - **Catálogo de 23 Carreras Dinámico y Escalable:** Almacenado como archivos JSON independientes en `assets/mallas/` (generados a partir de los reportes fuente de SchoIA+) más `mallas_todas.json`. El catálogo se descubre automáticamente por lectura de assets (`AssetManifest`) sin requerir enums ni modificar código Dart para futuras carreras.
  - **Cálculo de Desbloqueo y Disponibilidad Local:**
    - Motor de cálculo puro `CurriculumCalculator`: Una materia de semestre $N$ está `DISPONIBLE` si todas las materias regulares del semestre $N-1$ están aprobadas (o si es semestre 1).
    - Regla especial de Hitos de Titulación / Prácticas (`PRAC.LABORA`, `MIC-PROFESIONALIZANTE`, "Examen Complexivo", "Titulación Pry Técnico"): Solo se desbloquean cuando el 100% de los semestres regulares previos están completados.
    - Soporte nativo para el campo `prerrequisitos` para mallas con grafo explícito en el futuro.
  - **Mapeo de Áreas de Conocimiento por Prefijo de Código:** Archivo de configuración `AreaConocimientoMapping` con 12 áreas institucionales (Ciencias Exactas, Computación, Vida/Medicina, Humanas, Seguridad/Defensa, Económicas, Tierra/Construcción, Eléctrica/Energía, etc.) y asignación automática con fallback seguro a "Sin clasificar" (gris neutro) para prefijos desconocidos sin fallar.
  - **Vistas Duales y Filtros Interactivos:**
    - *Vista Grid:* Scroll horizontal con columnas rígidas por semestre y tarjetas con tintes por área de conocimiento, créditos y badges de estado.
    - *Vista Lista:* Agrupación vertical colapsable por semestres.
    - *Filtros:* Toggle "Solo disponibles", toggle "Ruta crítica" (materias cuello de botella prioritarias para desbloquear semestres posteriores) y buscador en tiempo real.
    - *Leyenda:* Desplegable interactivo con código de colores de áreas y estados (aprobada, disponible, bloqueada, hito, ruta crítica).
  - **Persistencia Drift SQLite v6:**
    - Tablas `CarreraSeleccionada` (carrera activa del estudiante) y `MateriaAprobada` (códigos aprobados y fecha).
    - Migración no destructiva `_migrateSchemaV5ToV6` con DAOs reactivos en streaming.
  - **Tolerancia a Datos Corruptos y Reportes Vacíos:** Manejo de carreras sin materias registradas (ej. `SchoIA_Reporte_economia`) con pantalla amigable de "Malla en preparación / no disponible aún" sin errores en la UI.
  - **Alineación Visual Neo-Student Brutalism:** Bordes gruesos de 2px, sombras sólidas, esquinas redondeadas pero marcadas, acento verde esmeralda y navegación nativa desde la barra inferior (pestaña Malla) y Ajustes.
* **Estado:** ✅ **Completada y probada** en `test/unit/area_conocimiento_mapping_test.dart`, `test/unit/curriculum_calculator_test.dart`, `test/unit/curriculum_asset_loading_test.dart` y `test/unit/curriculum_widget_test.dart` (28/28 tests pasando, 174/174 tests totales del proyecto pasando).

#### [FEAT-17] Alarma de Tareas (Task Alarm con audio en bucle, vibración y pantalla completa) — ✅ COMPLETADA
* **Problema resuelto:** Las notificaciones estándar del sistema pueden pasar desapercibidas si el teléfono está en silencio, en modo descanso o si el estudiante está ocupado o dormido antes de una entrega crítica de Moodle.
* **Solución técnica implementada:**
  - Capa adicional, opcional e independiente a las notificaciones escalonadas existentes de `flutter_local_notifications`.
  - Integración del plugin `alarm: ^5.13.2` con `assets/audio/alarm.mp3`, volumen de alarma, vibración en bucle y soporte de pantalla completa (`USE_FULL_SCREEN_INTENT`).
  - `TaskAlarmSettings`: Entidad pura con switch `enabled` (desactivado por defecto) y anticipación configurable (`leadTime`: 30m, 1h, 3h, 6h, 12h, 24h o personalizada $\ge 5$m), persistida en `SecureStorageService` (`task_alarm_enabled`, `task_alarm_lead_minutes`).
  - `TaskAlarmScheduler`: Scheduler desacoplado detrás de interfaz abstracta para testeo puro. Calcula `fireAt = dueDate - leadTime` en hora ecuatoriana (`TimezoneUtils`), deriva ID int32 positivo estable desde `moodleId`, limita a las ~20 tareas pendientes más próximas y es 100% idempotente.
  - Reprogramación automática (`rescheduleAll()`): tras sincronizaciones de Moodle, cambios de ajustes y swipe/marcado de tareas.
  - Cancelación total (`stopAll()`): integrada en el flujo atómico de cierre de sesión y cambio de campus.
  - Pantalla completa interactiva `AlarmRingScreen` con botones: Detener, Posponer 10 min y Ver tarea (GoRouter a Tareas).
  - Guía de permisos en Android 14+ para alarmas exactas e intención de pantalla completa, aviso de optimización de batería y nota de limitación en iOS.
* **Estado:** ✅ **Completada y probada** en `test/unit/task_alarm_test.dart` y `test/unit/task_alarm_widget_test.dart` (15/15 tests pasando, 226/226 tests totales del proyecto pasando).

#### [FEAT-18] Consolidación de 2 Temas Oscuros Neo-Brutalistas y Eliminación del Modo Claro — ✅ COMPLETADA
* **Problema resuelto:** El modo claro generaba inconsistencias de contraste con la identidad Neo-Brutalista de la app, aumentando la fatiga visual y consumiendo más batería en pantallas OLED/AMOLED de los estudiantes.
* **Solución técnica implementada:**
  - Reducción del enum `AppThemeMode` a 2 temas oscuros: **Oscuro Slate** (azul/gris espacial original) y **Deep Negro OLED** (negro puro `#000000`).
  - Eliminación total de `AppThemePalette.light` y purga de toda lógica de brillo claro.
  - Migración segura y silenciosa en `ThemeNotifier._loadInitialState()`: usuarios con preferencias guardadas `'light'` o `'system'` migran automáticamente a `'dark'` sin fallos ni alertas.
  - `MaterialApp` configurado de forma coherente en `ThemeMode.dark`.
  - Simplificación de selectores y modales de fecha/hora en la agenda escolar.
* **Estado:** ✅ **Completada y probada** en `test/unit/theme_test.dart` y `test/visual/features_visual_integration_test.dart` (226/226 tests pasando).

#### [FEAT-19] API Estática de Comunidad y Directorio Estudiantil (v1) — ✅ COMPLETADA
* **Problema resuelto:** Los estudiantes carecían de un canal ágil y libre de rastreo para enterarse de avisos estudiantiles urgentes, encontrar emprendimientos de compañeros en su campus (comida, impresiones, tutorías) y revisar actualizaciones del APK sin depender de tiendas privativas.
* **Solución técnica implementada:**
  - Arquitectura SSG desacoplada en Astro Web: contratos Zod estrictos (`community-contract.ts`), generación en build de endpoints estáticos inmutables (`/api/v1/{manifest,update,avisos,negocios,enlaces}.json`).
  - Caché inteligente por ETag y huella criptográfica SHA-256 en `manifest.json`.
  - Páginas públicas web `/avisos` (filtrado de avisos vigentes) y `/negocios` (búsqueda y filtros interactivos por campus y categorías).
  - Reglas éticas estrictas: listados 100% gratuitos para estudiantes de la ESPE (garantía anti-comercial), fechas de expiración mandatorias y canal de reporte de comunidad.
  - Especificación formal documentada en [COMMUNITY_API.md](COMMUNITY_API.md).
* **Estado:** ✅ **Completada y probada** (validación de contenido 100% aprobada, Astro check 0 errores).

---

### ⏳ Funcionalidades Pendientes de Implementación

#### [FEAT-06] Estadísticas personales de entregas
* **Problema que resuelve:** Falta de visibilidad sobre los hábitos de estudio del estudiante.
* **Solución técnica:** Gráfico circular de entregas a tiempo vs entregas con retraso y balance de carga semanal.
* **Esfuerzo:** `S` (2 días) | **Impacto:** `Medio` | **Estado:** ⏳ Pendiente.

#### [FEAT-10] Modo "Semana de Exámenes" / Tracker de Quizzes y Evaluaciones
* **Problema que resuelve:** Los exámenes de Moodle (`mod_quiz`) y eventos de calendario a menudo no aparecen como "tareas" estándar en `mod_assign`.
* **Solución técnica:** Unificar los endpoints `mod_quiz_get_quizzes_by_courses` y `core_calendar_get_calendar_events` en una vista dedicada de evaluaciones.
* **Esfuerzo:** `M` (3-4 días) | **Impacto:** `Alto` | **Estado:** ⏳ Pendiente.

#### [FEAT-12] Mapeo legible de bloques y aulas de campus
* **Problema que resuelve:** Las siglas de Banner en las aulas (ej. `EDIF-CENT-204`, `BLOQ-G-LAB3`) resultan crípticas.
* **Solución técnica:** Diccionario local de correspondencia que traduce las siglas de Banner a descripciones legibles.
* **Esfuerzo:** `M` (2-3 días) | **Impacto:** `Medio` | **Estado:** ⏳ Pendiente.

---

## 🚀 3. Siguiente Iteración Priorizada

Con 12 de las 15 funcionalidades completamente entregadas e integradas (incluyendo la gran apuesta de Agenda Escolar Unificada v1.5.0), la siguiente fase de expansión se enfocará en:

1. **Próximo 1:** [FEAT-10] Modo Semana de Exámenes (`mod_quiz` + calendario).
2. **Próximo 2:** [FEAT-06] Estadísticas de hábitos de entrega (gráficos de pastel).
3. **Próximo 3:** [FEAT-12] Mapeo legible de bloques y aulas de campus.
