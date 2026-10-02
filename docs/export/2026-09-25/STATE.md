# 🏛️ Estado Arquitectónico y Técnico de Esperancitos
## Versión de Pruebas: v1.4.0 (Build 240) — 2026-09-25

Documento de referencia exhaustivo que describe la arquitectura, proveedores de estado, esquema de base de datos local SQLite (Drift v3), persistencia segura, servicios en segundo plano y métricas de calidad de **Esperancitos**.

---

## 1. Resumen Ejecutivo de la Aplicación

**Esperancitos** es un cliente móvil integral y offline-first desarrollado en **Flutter 3.x** para la comunidad universitaria de la **Universidad de las Fuerzas Armadas ESPE** (Ecuador). La aplicación resuelve la fragmentación existente entre los sistemas institucionales:
1. **Ellucian Banner 9 Student Self-Service (SSB):** Horario oficial de clases, NRCs, aulas físicas, docentes y registro histórico de calificaciones por periodo.
2. **Moodle Virtual Classrooms:** Cursos virtuales, tareas con fechas límite, estados de entrega, calificaciones parciales y repositorio de archivos/diapositivas.

Toda la información institucional se replica localmente en una base de datos SQLite cifrada en reposo mediante **Drift**, garantizando que el estudiante pueda consultar su horario, aulas, tareas pendientes y notas incluso en sótanos, laboratorios sin señal celular o en modo avión.

---

## 2. Pila Tecnológica y Dependencias Principales

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework** | Flutter 3.29.0 / Dart 3.7.0 | UI reactiva multiplataforma (enfocada en Android) |
| **Arquitectura** | Clean Architecture + Feature-First | Separación estricta de Dominio, Datos y Presentación |
| **Estado** | Flutter Riverpod 2.6 / 3.0 Notifiers | Inyección de dependencias y reactividad sin boilerplate |
| **Base de Datos** | Drift 2.24.0 (SQLite nativo) | Persistencia relacional local con streams reactivos y migraciones |
| **Almacenamiento Seguro**| `flutter_secure_storage` 9.2.4 | Almacenamiento cifrado de tokens, cookies y ajustes |
| **Red & HTTP** | `dio` 5.8.0 + `http` | Cliente HTTP con timeouts y manejo de errores tipados |
| **Notificaciones** | `flutter_local_notifications` 18.0.1 | Notificaciones locales exactas y resumen matutino (06:30 AM) |
| **Widgets de Android** | `home_widget` 0.7.1 | Widget nativo de pantalla de inicio ("Próxima Clase") |
| **Escaneo & QR** | `mobile_scanner` 6.0.7 / `qr_flutter` 4.1.0 | Lectura y generación de códigos QR de alta velocidad |
| **Calendario** | `table_calendar` 3.1.3 | Vista de calendario mensual unificado con marcadores |
| **Archivos & Compartir**| `path_provider`, `open_filex`, `share_plus`| Manejo seguro de descargas de Moodle y exportación de imágenes |

---

## 3. Esquema de Base de Datos Local (Drift Schema Version 3)

El esquema de base de datos se administra de forma declarativa y transaccional en `lib/core/database/tables.dart` y `app_database.dart`:

### Tablas Existentes:
1. **`MoodleAccounts`** (Nueva en Fase B):
   - `id` (Int, AutoIncrement, PK)
   - `campus` (Text, ej. `'matriz'`, `'latacunga'`, `'posgrado'`)
   - `displayName` (Text, nombre amigable de la cuenta)
   - `connectedAt` (DateTime)
   - `lastSyncAt` (DateTime, Nullable)
   - `isPrimary` (Bool, true si es la cuenta activa por defecto)
2. **`MoodleCourses`**:
   - `id` (Int, Moodle course ID)
   - `moodleAccountId` (Int, Foreign Key opcional a `MoodleAccounts`)
   - `fullname`, `shortname`, `summary`
   - `enrolledAt` (DateTime)
   - Índices: `idx_moodle_courses_account`
3. **`Assignments`**:
   - `id` (Int, Moodle assignment ID)
   - `moodleAccountId` (Int, Foreign Key opcional)
   - `courseId` (Int, FK a `MoodleCourses`)
   - `name`, `intro`, `dueDate`, `cutoffDate`
   - `isSubmitted` (Bool), `submissionStatus` (Text)
   - Índices: `idx_assignments_account`
4. **`GradeItems`**:
   - `id` (Int, Moodle grade item ID)
   - `moodleAccountId` (Int, Foreign Key opcional)
   - `courseId` (Int)
   - `itemName`, `gradeFormatted`, `percentageFormatted`, `weight`
   - Índices: `idx_grade_items_account`
5. **`ScheduleMeetings`** (Banner 9):
   - `id` (Text, PK compuesta)
   - `nrc` (Text), `courseTitle` (Text), `courseCode` (Text)
   - `dayOfWeek` (Int: 1=Lunes ... 6=Sábado)
   - `beginTime` (Text, ej. `'0700'`), `endTime` (Text, ej. `'0900'`)
   - `building` (Text), `room` (Text), `instructor` (Text)
6. **`BannerAcademicHistory`** (Nueva en Fase C):
   - `id` (Int, AutoIncrement, PK)
   - `termCode` (Text, ej. `'202651'`), `termDescription` (Text)
   - `nrc` (Text), `subjectCode` (Text), `courseTitle` (Text)
   - `finalGrade` (Text), `creditHours` (Real), `status` (Text)

---

## 4. Persistencia Segura (`SecureStorageService`)

Gestión con memoria caché (`_memoryCache`) para accesos instantáneos $\mathcal{O}(1)$ sin latencia de I/O de disco:
* **Banner:** `banner_session_active`, `banner_cookies`, `academic_term` (ej. `'202651'`).
* **Moodle Legado & Principal:** `moodle_token`, `moodle_user_id`, `moodle_user_fullname`, `moodle_active_campus`, `moodle_base_url`.
* **Moodle Multi-Cuenta:** Claves dinámicas `moodle_token_<id>`, `moodle_user_id_<id>`, `moodle_user_fullname_<id>`, `moodle_campus_<id>`, `moodle_base_url_<id>`.
* **Notificaciones:** `notify_7days`, `notify_3days`, `notify_24hours`, `notify_3hours`, `notify_morning_briefing`, `notify_new_grades`.
* **Modo Ahorro de Datos:** `data_saver_mode` (`'true'` / `'false'`).
* **Reuniones Virtuales Detectadas:** `virtual_meetings_map` (JSON serializado con URLs de Teams/Zoom).

---

## 5. Módulos y Flujos Funcionales

### A. Dashboard Estudiantil
* Tarjeta dinámica de *"Próxima Clase"* con temporizador de inicio y aula física.
* Botón de 1 toque *"Unirse a clase virtual"* si se detectó enlace de Teams/Zoom.
* Tarjeta de *"Fin de Jornada"* al terminar las actividades del día.
* Contador de tareas urgentes con fecha de entrega en las próximas 24 horas.

### B. Horario y Calendario Mensual
* Conmutador superior entre vista semanal L-S (con tarjetas por bloque horario) y calendario mensual completo.
* Filtros interactivos en el calendario mensual: Todas, Clases, Tareas, Exámenes.
* Exportador visual de horario a imagen PNG estilizada de alta definición para fondos de pantalla.

### C. Tareas, Checklist y Compartición P2P vía QR
* Listado de asignaciones con orden cronológico y estados (Pendiente, Entregada, Atrasada).
* Generador de código QR (`QrShareChecklistDialog`) con compresión Base64 para pasar tareas o listas de repaso a compañeros sin internet.
* Escáner QR integrado (`QrImportScannerModal`) con previsualización e importación directa a SQLite.

### D. Notas y Simulador Interactivo "Con Cuánto Paso"
* Visualización de notas parciales de Moodle e historial académico de Banner.
* Simulador interactivo con sliders para P1 y P2, medidor de puntos acumulados respecto a 14.0 pts y slider en vivo de predicción del Examen Final.
* Detección automática del requerimiento de Examen de Recuperación.

### E. Ajustes y Configuración Institucional
* Selector de Campus Universitario Moodle y administración Multi-Cuenta.
* Selector de Periodo Académico Banner (predeterminados o entrada manual).
* Conmutador del **Modo Ahorro de Datos** con priorización de caché SQLite.
* Configuración granular de alertas de entrega y resumen matutino (06:30 AM).

---

## 6. Métricas de Calidad y Pruebas Automatizadas

* **Total de Pruebas Unitarias y de Integración:** **122 pruebas pasando al 100%**.
  - `grade_calculator_test.dart`: 12 tests (cálculos, metas y recuperación).
  - `qr_data_sharing_test.dart`: 2 tests (codificación, decodificación y resiliencia).
  - `features_visual_integration_test.dart`: 3 tests (simulador, QR dialog y ajustes en pantallas estrechas).
  - `virtual_meeting_detector_test.dart`: 10 tests (expresiones regulares y plataformas).
  - `schedule_image_export_test.dart`: 15 tests (layout de lienzo y renderizado).
  - `moodle_multi_account_test.dart`: 6 tests (aislamiento y migración).
  - `moodle_sync_test.dart` y `moodle_qr_test.dart`: 15 tests (API de Moodle y QR login).
* **Análisis Estático (`flutter analyze`):** 0 errores, 0 advertencias, 0 lints.
