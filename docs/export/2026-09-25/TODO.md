# 📋 Lista de Tareas y Estado de Implementación (TODO)

## Versión de Pruebas: v1.4.0 (Build 240) — 2026-09-25

Documento de seguimiento del estado operativo de las funcionalidades y tareas técnicas de **Esperancitos**.

---

## 🟢 1. Funcionalidades Completadas y Validadas (v1.4.0)

| Código       | Funcionalidad                                | Descripción                                                                                                                        | Pruebas                                                 |
| :----------- | :------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| **FEAT-01**  | **Atajo a Clases Virtuales**                 | Detección automática por Regex de enlaces de Teams, Zoom, Meet y Webex desde Moodle con botón directo de unirse.                   | `virtual_meeting_detector_test.dart` (10 tests)         |
| **FEAT-02**  | **Widget de Pantalla de Inicio Android**     | Widget nativo de Android ("Próxima Clase") con aula, materia y horario en vivo.                                                    | `home_widget_service_test.dart` (4 tests)               |
| **FEAT-03**  | **Resumen Matutino Diario**                  | Notificación local a las 06:30 AM con las clases y tareas que vencen en el día.                                                    | `morning_briefing_test.dart` (5 tests)                  |
| **FEAT-04**  | **Exportador de Horario a Imagen**           | Renderizado del horario semanal en canvas de alta resolución con estilo Brutalista para compartir como fondo de pantalla.          | `schedule_image_export_test.dart` (15 tests)            |
| **FEAT-05**  | **Simulador "Con Cuánto Paso"**              | Calculadora interactiva con sliders en tiempo real, umbral de 14.0 pts, selector de metas (14/16/18) y simulador de examen final.  | `grade_calculator_test.dart` (12 tests) + Test Visual 1 |
| **FEAT-07**  | **Modo de Ahorro de Datos**                  | Conmutador en Ajustes que prioriza la base local SQLite Drift y suspende transferencias pesadas en redes móviles.                  | Test Visual 3                                           |
| **FEAT-08**  | **Buscador y Descarga de Archivos Moodle**   | Explorador offline de diapositivas, PDFs y recursos categorizados por temas y unidades.                                            | `course_materials_test.dart` (8 tests)                  |
| **FEAT-09**  | **Notificación de Nueva Calificación**       | Detección de cambios de notas en el ciclo de sincronización y emisión de alerta local inmediata al estudiante.                     | Integrado en `moodle_sync_test.dart`                    |
| **FEAT-11**  | **Calendario Mensual Unificado**             | Vista de calendario mensual (`table_calendar`) en Horario con filtros por categoría y eventos detallados por día.                  | Integrado en `schedule_screen.dart`                     |
| **FEAT-13**  | **Historial Académico Banner Multi-Periodo** | Persistencia en Drift, parser y pantalla `AcademicHistoryScreen` para consultar materias pasadas y promedios por semestre.         | Integrado en `academic_history_screen.dart`             |
| **FEAT-14**  | **Checklist P2P vía Código QR**              | Generador (`qr_flutter`) y lector (`mobile_scanner`) para pasarse listas de tareas comprimidas en formato `esp://qr?d=...`.        | `qr_data_sharing_test.dart` (2 tests) + Test Visual 2   |
| **MULTI-01** | **Multi-Cuenta Moodle Oficial**              | Soporte de múltiples cuentas de Moodle (Matriz, Sedes, Pregrado, Posgrado), sincronización secuencial y aislamiento de claves.     | `moodle_multi_account_test.dart` (6 tests)              |
| **PERF-01**  | **Splash Nativo Instantáneo**                | Eliminación del splash estático con icono de Android 12+ mediante drawable transparente y listener inmediato en `MainActivity.kt`. | Verificado en arranque físico                           |

---

## 🟡 2. Funcionalidades Planificadas para Próximas Versiones (Backlog)

- [ ] **[FEAT-06] Estadísticas personales de hábitos de entrega:**
  - _Descripción:_ Gráfico de pastel en Tareas comparando entregas a tiempo vs. retrasadas, con indicador de carga semanal por día.
  - _Esfuerzo:_ `S` (2 días) | _Prioridad:_ Media.

- [ ] **[FEAT-10] Modo "Semana de Exámenes" / Tracker de Quizzes y Evaluaciones:**
  - _Descripción:_ Integrar `mod_quiz_get_quizzes_by_courses` y `core_calendar_get_calendar_events` para listar cuestionarios con cuenta regresiva.
  - _Esfuerzo:_ `M` (3-4 días) | _Prioridad:_ Alta.

- [ ] **[FEAT-12] Mapeo legible de bloques y aulas del campus:**
  - _Descripción:_ Diccionario local que traduce códigos de Banner (ej. `EDIF-CENT-204`, `BLOQ-G-LAB3`) a descripciones amigables: _"Edificio Central, Aula 204"_.
  - _Esfuerzo:_ `M` (2 días) | _Prioridad:_ Media.

---

## 🧹 3. Deuda Técnica y Mantenimiento

- [x] **[TECH-01] Selector dinámico del periodo académico Banner en Ajustes:**
  - ✅ Implementado con soporte para periodos automáticos y manuales.
- [x] **[TECH-02] Pruebas de integración visual y layouts responsive:**
  - ✅ Implementado en `test/visual/features_visual_integration_test.dart` (3 tests completos sin RenderFlex overflows).
- [ ] **[TECH-03] Política de purga de caché de archivos descargados:**
  - Botón en Ajustes para limpiar PDFs temporales cuando excedan 200 MB en disco.
- [ ] **[TECH-04] Soporte nativo para iOS en exportador y home widget:**
  - Implementación de Widget Extension en Swift mediante WidgetKit para iOS 16+.
