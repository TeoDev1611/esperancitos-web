# 📌 Lista de Tareas y Pendientes (TODO) de Esperancitos

Estado de tareas pendientes, bloqueantes externos, funcionalidades no iniciadas y deuda técnica al **2026-09-25**.

---

## ⚡ 0. PRIORIDAD MÁXIMA INMEDIATA

* [x] **[PRIO-01] Sincronización del Horario Banner 9 vía `getRegistrationEvents` y Soporte de Array JSON:**
  * **Estado:** ✅ **COMPLETADO Y VERIFICADO**
  * **Implementación:**
    1. **Soporte de Array Directo (`List<dynamic>`):** `BannerScheduleParser.parseFromJson` y `parseFromList` admiten tanto el payload tradicional (`{"data": {"registrations": [...]}}`) como la lista plana retornada por `getRegistrationEvents`.
    2. **Endpoint Oficial Verificado:** Se configuró el cliente HTTP `EllucianApiClient` para apuntar al endpoint real de periodo ordinario `https://registrop.espe.edu.ec/StudentRegistrationSsb/ssb/registrationHistory/reset?term=202651` y extraer todas las materias inscritas.
    3. **Manejo Preciso de Horas y Zonas Horarias:** Extracción de componentes locales `HH:mm` a partir de cadenas ISO-8601 evitando desfases de conversión a UTC, redondeo automático de horas terminadas en `:59` a la hora en punto siguiente (`07:59` -> `08:00`), y mapeo de `weekday` a códigos de día (`LUN`, `MAR`, `MIE`, `JUE`, `VIE`, `SAB`, `DOM`).
    4. **Deduplicación y Ubicación:** Clave única `${crn}-${dayOfWeek}-${startTime}` y asignación de `fallbackLocation` a partir de `meetingTypeDescription` (ej. *"Otros Componentes Practicos"*).
    5. **Pruebas:** 12 tests unitarios en `test/unit/banner_parser_test.dart` aprobados al 100% con los datos JSON reales del periodo `202651`.

---

## 🐛 2. Bugs Conocidos y Limitaciones Técnicas

* [x] **[BUG-01] Detección de enlaces virtuales dependiente de descripción de Moodle:**  
  * **Estado:** ✅ **COMPLETADO**
  * **Solución Implementada:**  
    * Se desarrolló `VirtualMeetingResolver` y `VirtualMeetingNotifier` respaldados en almacenamiento seguro (`SecureStorageService`).
    * Se integró la interfaz de vinculación manual de enlaces (`_showCustomLinkDialog`) tanto en `ScheduleScreen` como en `DashboardScreen` (`_showRoomDetails`), permitiendo al estudiante añadir, modificar o desvincular enlaces de Teams, Zoom o Google Meet para cualquier materia de forma directa y permanente.

* [x] **[BUG-02] Restricciones agresivas de batería en Android (MIUI / HyperOS / EMUI):**  
  * **Estado:** ✅ **COMPLETADO**
  * **Solución Implementada:**  
    * Se añadió una tarjeta interactiva en `SettingsScreen` (dentro de *Sincronización Universitaria*) que despliega un diálogo explicativo (`_showBatteryOptimizationDialog`).
    * Guía al estudiante con instrucciones específicas para Xiaomi, Huawei y Samsung: activación de *Inicio Automático*, configuración de *Ahorro de Batería sin restricciones* y *Bloqueo con candado en la vista de aplicaciones recientes*.

* [x] **[BUG-03] Calificaciones cualitativas en Moodle:**  
  * **Estado:** ✅ **MITIGADO Y RESUELTO**
  * **Manejo Actual:**  
    * `GradeCalculator` y `GradeCalculatorScreen` filtran y aíslan de forma segura asignaturas evaluadas cualitativamente (como Prácticas o Suficiencia con `gradeRaw == null`). La pantalla informa de manera clara que la materia no cuenta con notas cuantitativas y permite al estudiante simular calificaciones manualmente sin provocar excepciones numéricas.

---

## 🚀 3. Funcionalidades del ROADMAP.md

* [ ] **[FEAT-05] Simulador interactivo de notas con sliders ("¿Con cuánto paso?"):**  
  * *Descripción:* Interfaz interactiva en `GradeCalculatorScreen` con barras deslizantes (*sliders*) para mover los puntajes de Parcial 1 y Parcial 2 y observar cómo varía la nota mínima necesaria en el Examen Final en tiempo real.
  * *Esfuerzo:* `S` (1 día) | *Prioridad:* Media.

* [ ] **[FEAT-06] Estadísticas personales de hábitos de entrega:**  
  * *Descripción:* Tarjeta analítica en la pestaña de Tareas con gráficos de pastel (*pie chart*) de entregas a tiempo vs entregas con retraso, y distribución de carga de trabajo semanal.
  * *Esfuerzo:* `S` (2 días) | *Prioridad:* Media.

* [ ] **[FEAT-07] Modo de Ahorro de Datos y Red Estricta:**  
  * *Descripción:* Opción en Ajustes para desactivar la sincronización en segundo plano y descargas de materiales cuando el teléfono esté conectado a datos móviles (red celular), operando exclusivamente con la base de datos local Drift.
  * *Esfuerzo:* `S` (1 día) | *Prioridad:* Baja.

* [ ] **[FEAT-10] Modo "Semana de Exámenes" / Tracker de Quizzes y Evaluaciones:**  
  * *Descripción:* Integrar `mod_quiz_get_quizzes_by_courses` y `core_calendar_get_calendar_events` para listar cuestionarios, evaluaciones y lecciones con temporizador regresivo dedicado.
  * *Esfuerzo:* `M` (3-4 días) | *Prioridad:* Alta.

* [x] **[FEAT-11] Calendario Mensual Unificado:**  
  * **Estado:** ✅ **COMPLETADO**
  * *Implementación:* Pantalla y widget interactivo `MonthlyCalendarView` integrado en `ScheduleScreen` utilizando `table_calendar`, con selector de filtros por categoría (Todas, Clases, Tareas, Exámenes), puntos visuales en el calendario mensual y listado de eventos diarios.

* [ ] **[FEAT-12] Mapeo legible de bloques y aulas del campus:**  
  * *Descripción:* Diccionario local que traduce siglas de Banner (ej. `EDIF-CENT-204`, `BLOQ-G-LAB3`) a nombres claros como *"Edificio Central, Aula 204"* o *"Bloque G, Laboratorio 3"*.
  * *Esfuerzo:* `M` (2 días) | *Prioridad:* Media.

* [x] **[FEAT-13] Soporte Multi-Periodo y Archivo Histórico:**  
  * **Estado:** ✅ **COMPLETADO**
  * *Implementación:* Soporte multi-periodo en base de datos local Drift (`BannerAcademicHistory`), parser `BannerAcademicHistoryParser`, repositorio `AcademicHistoryRepositoryImpl`, sincronización `AcademicHistorySyncService` y pantalla visual `AcademicHistoryScreen` accesible desde Ajustes y Rutas.

* [ ] **[FEAT-14] Compartición P2P de Checklist de Tareas vía QR / Enlace:**  
  * *Descripción:* Permitir a un estudiante crear una tarea personalizada local y compartirla con sus compañeros mediante un código QR o URL corta Base64, para importarla directamente sin pasar por ningún servidor.
  * *Esfuerzo:* `L` (1-2 semanas) | *Prioridad:* Alta.

---

## 🧹 4. Deuda Técnica y Mantenimiento

* [x] **[TECH-01] Selector visual dinámico del periodo académico de Banner en Ajustes:**  
  * **Estado:** ✅ **COMPLETADO**
  * *Implementación:* En `SettingsScreen`, se agregó el selector de Periodo Banner respaldado en `SecureStorageService.saveAcademicTerm()`. Incluye periodos comunes (`202651`, `202552`, `202550`) y la opción de ingresar cualquier periodo manual con sincronización inmediata de horario.

* [ ] **[TECH-02] Pruebas de integración visual (Golden Tests o Widget Tests de pantalla completa):**  
  * Ampliar los tests de widgets para `CourseMaterialsScreen` y `ScheduleExportDialog` simulando interacciones táctiles y descarga de archivos con mocks de `Dio`.

* [ ] **[TECH-03] Política de purga de caché de archivos descargados:**  
  * En `MoodleFileDownloadService`, implementar un botón en Ajustes para *"Borrar materiales descargados"* y liberar espacio de almacenamiento en el dispositivo cuando los archivos superen cierta cuota (ej. 200 MB).

* [ ] **[TECH-04] Soporte para iOS en exportador y home widget:**  
  * El widget actual está implementado nativamente para Android (`AppWidgetProvider`). Para dar soporte pleno a iOS, se requerirá configurar un Widget Extension en Swift mediante WidgetKit y Xcode.
