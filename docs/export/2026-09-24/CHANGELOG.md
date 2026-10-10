# 📜 Registro de Cambios (CHANGELOG) de Esperancitos

Historial cronológico de cambios reales implementados en el código fuente de Esperancitos, documentados a partir del registro del repositorio Git (`git log --oneline`) y de la arquitectura de archivos existente.

---

## [Fase 0] — Configuración de Plataforma, Build Android y Dependencias Críticas

**Commit:** `bb7ff45` — _build: Fase 0 - Configuracion de Android Manifest, desugaring y flutter_timezone_

- **Resolución de Bloqueantes de Compilación (CRÍT-01 y CRÍT-02):**
  - `android/app/src/main/AndroidManifest.xml`:
    - Se declararon los permisos de red y alarmas: `INTERNET`, `ACCESS_NETWORK_STATE`, `POST_NOTIFICATIONS`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED` y `USE_EXACT_ALARM`.
    - Se registraron los receptores de difusión (_broadcast receivers_) de `flutter_local_notifications`: `ScheduledNotificationReceiver` y `ScheduledNotificationBootReceiver`.
    - Se configuró `android:allowBackup="false"` y `android:enableOnBackInvokedCallback="true"`.
  - `android/app/build.gradle.kts`:
    - Se activó `coreLibraryDesugaring` con `desugar_jdk_libs:2.1.4` para permitir el uso de APIs modernas de Java (Java Time / NIO) en Android 5.0+ sin errores de runtime.
    - Se configuró compatibilidad Java 17 (`sourceCompatibility` y `targetCompatibility`).
  - `pubspec.yaml`:
    - Se actualizó `flutter_timezone` a la versión `^5.1.0` compatible con Android Gradle Plugin (AGP) 9.x y Kotlin 2.x.

---

## [Fase 1] — Localización y Configuración Regional en Español

**Commit:** `397dfc3` — _fix(locale): Fase 1 - Inicializar locale 'es' y configurar flutter_localizations_

- **Soporte de Idioma y Fechas Locales:**
  - `lib/main.dart`:
    - Se inicializó el formato de fechas para español (`initializeDateFormatting('es')`) al arrancar la aplicación.
  - `lib/app.dart`:
    - Se registraron los delegados de `flutter_localizations`: `GlobalMaterialLocalizations.delegate`, `GlobalWidgetsLocalizations.delegate` y `GlobalCupertinoLocalizations.delegate`.
    - Se fijó `supportedLocales` a español (`const Locale('es')`) e inglés (`const Locale('en')`).

---

## [Fase 2] — Corrección de Flujos, UX y Calidad de Código

**Commit:** `d6949ed` — _fix(flow): Fase 2 - Resolver bugs de flujo ALTO-02, ALTO-03, MED-01, MED-04, BAJO-01 y BAJO-03_

- **Persistencia de Conmutadores de Notificación (ALTO-02):**
  - `lib/core/storage/secure_storage_service.dart`: Se añadieron métodos para almacenar y leer de forma persistente los switches de alertas (`7d`, `3d`, `1d`, `3h`).
  - `lib/features/settings/presentation/screens/settings_screen.dart`: Se conectaron los conmutadores para guardar inmediatamente el estado sin perderlo al reiniciar.
- **Flujo de Splash y Onboarding (ALTO-03):**
  - `lib/features/auth/presentation/screens/splash_screen.dart`: Se agregó la verificación de sesión y de onboarding completado; si ya existe sesión o se completó el onboarding, se navega directo a `/dashboard`.
- **Tarjeta de Fin de Jornada (MED-01):**
  - `lib/features/dashboard/presentation/screens/dashboard_screen.dart`: Al terminar las clases del día, el Dashboard oculta la tarjeta de próxima clase y muestra `TodayClassesEndCard` (_"Terminaron tus clases de hoy. ¡A descansar!"_).
- **Utilidades de Fecha y Hora (MED-04):**
  - `lib/core/utils/date_time_utils.dart`: Se centralizaron `getTodayCode()` y `parseTimeToMinutes()`, con soporte robusto para formatos `"07:00"` y `"0700"`.
- **Accesibilidad y Contraste (BAJO-01 y BAJO-03):**
  - `lib/features/schedule/presentation/screens/schedule_screen.dart`: Se ampliaron los objetivos táctiles del selector L-S a un mínimo de 48x44 dp (WCAG 2.1 AA).
  - `lib/core/theme/app_colors.dart`: Se mejoró el contraste del tono de advertencia/urgencia (`#FBBF24`).

---

## [Fase 3] — Integración con Ellucian Banner 9 SSB

**Commit:** `8c26170` — _feat(banner): Fase 3 - Login SAML, extraccion interna por fetch en WebView y parser Banner 9 SSB JSON_

- **Autenticación SAML Federada y Extracción JSON:**
  - `lib/features/auth/presentation/screens/sso_webview_screen.dart`:
    - Implementación de WebView con restricción de navegación a dominios autorizados (`espe.edu.ec`, `elluciancloud.com`, `microsoftonline.com`).
    - Canal de comunicación JavaScript bidireccional `BannerDataChannel`.
    - Extracción mediante inyección de `fetch()` con `credentials: 'same-origin'` apuntando al endpoint REST nativo `/StudentRegistrationSsb/ssb/registrationHistory/reset?term=$term`.
    - Detección automática de expiración de sesión y timeout de 30 segundos con opción de reintento.
- **Parser de Horario de Banner 9 SSB:**
  - `lib/features/ellucian/data/datasources/banner_schedule_parser.dart`:
    - Parser completo de la estructura JSON de `registrations` y `meetingTimes`.
    - Separación de días booleanos en reuniones independientes por día.
    - Ajuste del desfase de 59 minutos (`0859` $\rightarrow$ `09:00`).
    - Decodificación de entidades HTML con `html_unescape` y formateo a Title Case de profesores.
    - Mapeo determinista de fechas de meses en inglés (`28-Oct-2024`).
    - Deduplicación por `CRN + Día + HoraInicio`.
- **Persistencia y Repositorio de Horario:**
  - `lib/core/database/tables.dart` y `app_database.dart`: Actualización a `schemaVersion = 2` para incluir `room`, `buildingDescription`, `startDate`, `endDate`, `termDescription` y `grade`.
  - `lib/features/ellucian/data/repositories/ellucian_local_repository_impl.dart`: Upsert en lote de las reuniones procesadas.

---

## [Fase 4] — Soporte Multi-Campus Moodle y Flujo SSO launch.php

**Commits:** `db79b08` y `dd1ec00` — _feat(moodle): Fase 4 - Moodle multi-campus, SSO launch.php, moodlemobile scheme interception y estados Moodle sin conectar_

- **Soporte para 4 Campus Institucionales:**
  - `lib/features/moodle/domain/entities/campus.dart`: Definición de los 4 campus (`presencial`, `enLinea`, `postgrado`, `nivelacion`) con sus respectivos hosts oficiales y display names.
  - `lib/features/moodle/presentation/providers/moodle_providers.dart`: Notifier `ActiveCampusNotifier` que ejecuta una transacción de aislamiento: borra las tablas de Moodle de Drift y el token local, preservando intacta la sesión de Banner.
- **Flujo SSO con Protocolo `moodlemobile://`:**
  - `lib/features/moodle/domain/utils/moodle_launch_parser.dart`: Utilidad para validar el esquema `moodlemobile://`, decodificar la carga útil en Base64 (`siteid:::token`) y detectar mensajes de servicio deshabilitado (`tool_mobile`).
  - `lib/features/moodle/presentation/screens/moodle_login_screen.dart`:
    - Pantalla interactiva que permite seleccionar el campus y lanzar el flujo SSO mediante `{baseUrl}/admin/tool/mobile/launch.php`.
    - Intercepción de la redirección al protocolo `moodlemobile://` en el WebView para capturar el token sin solicitar contraseñas.
    - Vista dedicada `_buildServiceDisabledView()` para cuando el campus tiene el servicio móvil inactivo.

---

## [Fase 5] — Optimizaciones de Rendimiento Mobile (PERF-01 a PERF-06)

**Commits:** `4fdfa2d`, `f038439`, `63f9a88`, `2cb4692` — _perf: Optimizaciones integrales de rendimiento_

- **PERF-01 (Boot Instantáneo):** Sustitución del temporizador artificial de 2.2s en `SplashScreen` por lecturas concurrentes con `Future.wait()`, reduciendo el arranque a <700ms.
- **PERF-02 (Aislamiento de Renderizado):** `NextClassPreviewCard` detiene el `AnimationController` del punto pulsante cuando no hay clase activa en curso y utiliza `RepaintBoundary` para aislar los repintados del resto del Dashboard.
- **PERF-03 (Lotes Concurrentes en Sincronización):** `MoodleSyncService` procesa verificaciones de tareas y calificaciones en bloques de 4 con `Future.wait()`, reduciendo el tiempo de sincronización en más de 65%.
- **PERF-04 (Caché en Memoria de KeyStore):** `SecureStorageService` implementó `_memoryCache` para evitar sobrecarga IPC y cuellos de botella criptográficos en lecturas frecuentes.
- **PERF-05 (Índices B-Tree en Drift SQLite):** Se añadieron índices en `app_database.dart` para `assignments(is_submitted, due_date)`, `assignments(course_id)`, `grade_items(course_id)` y `ellucian_schedule_cache(day_of_week, start_time)`.
- **PERF-06 (Concurrencia con Isolates):** Se trasladó el parseo de Banner (`parseFromJsonAsync`) y la generación de iCalendar (`generateAsync`) a workers Isolates secundarios con `Isolate.run()`.
- **Fuentes Locales Empaquetadas:** Inclusión de `Outfit-Variable.ttf` e `Inter-Variable.ttf` en `assets/fonts/`, eliminando la dependencia en red de `google_fonts`.

---

## [Fase 6] — Rediseño Integral Neo-Student Brutalism y Pulido de Layout

**Commits:** `c438562`, `4896f27`, `910b6b0`, `0d316f8`, `68d9ff6` — _feat(ui): implement complete Neo-Student Brutalism redesign across all core screens_

- **Sistema de Diseño Neo-Brutalista:**
  - Creación de componentes reutilizables en `lib/core/widgets/`:
    - `BrutalistCard`: Tarjetas de alto contraste con bordes duros de 2px, sombras sólidas sin difuminar (sombras esmeralda y oscuras).
    - `BrutalistButton`: Botones táctiles con variantes primaria, secundaria, peligro y contorno, con soporte `flexible` para prevenir desbordes de texto.
    - `StatusBadge`: Píldoras indicadoras de estado (Activo, Urgente, Completado, Offline).
    - `CardHeaderWithBadge` y `AppHeader`: Encabezados estilizados con identidad institucional ESPE.
- **Corrección de Desbordes RenderFlex:**
  - Corrección de desbordes de 20px en `SettingsScreen`, `ProfileScreen`, `AssignmentsScreen` y `MoodleLoginScreen`.
  - Ajuste de padding, `MainAxisSize.min` y uso de `Flexible`/`Expanded` en textos largos.
  - Solución de inconsistencia en el código del día miércoles (`MIÉ` vs `MIE`) en el Horario.

---

## [Fase 7] — Funcionalidades Prioritarias del Roadmap (FEAT-01 a FEAT-09)

**Commits:** `ffff5d0`, `f470b31`, `b770e87`, `3f203df`, `19083b2` — _feat: Roadmap Top Features_

- **FEAT-01 — Atajo a Clase Virtual (Commit `ffff5d0`):**
  - `lib/core/utils/virtual_meeting_detector.dart`: Detección mediante expresiones regulares de enlaces a Microsoft Teams, Zoom, Google Meet y Webex embebidos en texto plano o HTML de cursos de Moodle.
  - `lib/features/schedule/domain/services/virtual_meeting_resolver.dart`: Resolución de links vinculados a cada reunión de clase por coincidencia de NRC o código de asignatura.
  - Botón directo _"Unirse a clase virtual"_ en `NextClassPreviewCard` y en las tarjetas del Horario.
- **FEAT-04 — Exportador de Horario a Wallpaper PNG (Commit `f470b31`):**
  - `lib/features/schedule/domain/services/schedule_image_export_service.dart`: Renderizado programático en canvas de alta resolución con paleta Dark Slate, división de días y métricas de clases.
  - `lib/features/schedule/presentation/widgets/schedule_export_dialog.dart`: Diálogo interactivo que permite guardar y compartir el horario como fondo de pantalla usando `share_plus`.
- **FEAT-02 — Widget Nativo de Android "Próxima Clase" (Commit `b770e87`):**
  - `lib/core/services/home_widget_service.dart`: Servicio que envía los datos de la siguiente clase (materia, aula, hora) a `home_widget`.
  - `android/app/src/main/res/layout/widget_next_class.xml` y `NextClassWidgetReceiver.kt`: Interfaz nativa del widget para la pantalla de inicio de Android.
- **FEAT-08 — Explorador y Descargador Offline de Materiales de Moodle (Commit `3f203df`):**
  - `lib/features/moodle/data/models/moodle_content_dtos.dart`: Modelos para secciones, módulos y archivos de `core_course_get_contents`.
  - `lib/features/moodle/presentation/screens/course_materials_screen.dart`: Vista tipo explorador de archivos con filtrado por carpetas, extensiones y búsqueda de PDFs y diapositivas.
  - `lib/features/moodle/domain/services/moodle_file_download_service.dart`: Descarga de archivos a almacenamiento interno de la app con visualización inmediata mediante `open_filex`.
- **FEAT-03 — Resumen Matutino Diario 06:30 AM (Commit `19083b2`):**
  - `lib/core/services/morning_briefing_service.dart`: Genera un resumen automático consolidado cada mañana: _"Hoy tienes X clases (inicias a las HH:mm en Aula Y) y vencen Z tareas"_.
  - Integración con `NotificationService` respetando el switch de configuración en Ajustes.
- **FEAT-09 — Alerta de Publicación de Calificaciones (Commit `19083b2`):**
  - `lib/features/moodle/data/services/moodle_sync_service.dart`: Comparador de diferencias de notas (_diffing_) al sincronizar contra la tabla `grade_items` de Drift. Emite notificación instantánea cuando un docente publica o modifica una calificación.
  - `android/app/src/main/AndroidManifest.xml`: Declaración de `<queries>` para paquetes de Microsoft Teams, Zoom y Google Meet para soportar `canLaunchUrl` en Android 11+ (API 30+).

---

## [Mantenimiento] — Migración de Dependencias Mayores

**Commits:** `ffed1c8` y `8ae68fa` — _feat(deps): migrate to Riverpod 3, GoRouter 18, Local Notifications 22, Secure Storage 11 and Share Plus 13_

- Actualización a versiones mayores compatibles con Flutter 3.27+ y Dart 3.6+:
  - `flutter_riverpod` $\rightarrow$ `^3.4.3`
  - `go_router` $\rightarrow$ `^18.0.1`
  - `flutter_local_notifications` $\rightarrow$ `^22.3.1`
  - `flutter_secure_storage` $\rightarrow$ `^11.2.0`
  - `share_plus` $\rightarrow$ `^13.3.0`
  - `open_filex` $\rightarrow$ `^4.7.0`
  - `drift` y `drift_dev` $\rightarrow$ `^2.26.0`

---

## [Fase A] — Login de Moodle por Código QR Oficial (`tool_mobile_get_tokens_for_qr_login`)

- **Implementación del mecanismo oficial `qrlogin` de Moodle:**
  - `lib/features/moodle/domain/utils/moodle_qr_parser.dart`:
    - Parser seguro para códigos QR con formato `moodlemobile://https://micampus.espe.edu.ec?qrlogin=<token>&userid=<id>`.
    - Extracción validada de `baseUrl`, `qrloginkey` y `userid`.
  - `lib/features/moodle/data/datasources/moodle_remote_data_source.dart`:
    - Implementación del intercambio HTTP POST a `{baseUrl}/lib/ajax/service-nologin.php`.
    - Requisito de cabecera `User-Agent: MoodleMobile Esperancitos/1.0.0` (evita rechazo con `apprequired`).
    - Reintento automático con fallback a `?info=tool_mobile_get_tokens_for_qr_login` si la ruta directa falla.
    - Mapeo tipado de errores de Moodle: `invalidkey` (QR expirado o reutilizado), `qrcodedisabled`, `servicenotavailable`.
  - `lib/features/moodle/presentation/screens/moodle_login_screen.dart`:
    - Integración de escáner QR en vivo mediante `mobile_scanner`.
    - Detección de permisos de cámara y manejo de errores visuales.
  - `test/unit/moodle_qr_test.dart`:
    - 5 pruebas unitarias automatizadas cubriendo la variante directa, el fallback con `?info=` y los códigos de error institucionales.

---

## [Fase B] — Soporte Multi-Cuenta de Moodle (Banner sigue como cuenta única)

- **Persistencia y Esquema de Base de Datos (Drift v3):**
  - `lib/core/database/tables.dart` y `app_database.dart`:
    - Elevación de `schemaVersion` de 2 a 3.
    - Nueva tabla `MoodleAccounts` (`id`, `campus`, `displayName`, `connectedAt`, `lastSyncAt`, `isPrimary`).
    - Incorporación de columnas `moodleAccountId` (nullable) como foreign key en `MoodleCourses`, `Assignments` y `GradeItems`.
    - Creación de índices secundarios B-Tree: `idx_assignments_account`, `idx_grade_items_account`, `idx_moodle_courses_account`.
    - Script y handler de migración transaccional que agrupa registros preexistentes sin pérdida.
- **Aislamiento en Almacenamiento Seguro:**
  - `lib/core/storage/secure_storage_service.dart`:
    - Claves acotadas por ID de cuenta: `moodle_token_<accountId>`, `moodle_userid_<accountId>`, `moodle_campus_<accountId>`, etc.
    - Sincronización continua de claves legadas para la cuenta principal activa (`isPrimary`).
- **Sincronización Secuencial y Eliminación Segura:**
  - `lib/features/moodle/data/services/moodle_sync_service.dart`:
    - `syncAccount(int accountId)`: Sincronización exclusiva de una cuenta específica.
    - `syncAllAccounts()`: Sincronización en secuencia estricta de todas las cuentas conectadas.
    - `deleteAccount(int accountId)`: Cancelación de notificaciones de la cuenta, eliminación de registros asociados en Drift y borrado de credenciales seguras sin alterar otras cuentas ni a Banner.
- **Prevención de Colisión en Notificaciones:**
  - `lib/core/notifications/notification_service.dart`:
    - Algoritmo de ID compuesto de 32 bits: `(accountId * 1000000) + (taskMoodleId * 10) + subAlertIndex`.
    - Cancelación aislada de alertas por cuenta (`cancelAllAlertsForAccount`).
- **Regla de Home Widget y Morning Briefing:**
  - `lib/features/moodle/presentation/providers/moodle_providers.dart`:
    - `moodlePrimaryAssignmentsStreamProvider`: Observa únicamente las tareas de la cuenta principal.
    - Degradación limpia ante 0 cuentas de Moodle mostrando únicamente el horario de Banner.
- **Interfaz de Usuario Multi-Cuenta:**
  - `lib/features/moodle/presentation/screens/moodle_accounts_screen.dart`:
    - Pantalla de administración de cuentas de Moodle con selector de cuenta principal, renombrado en línea y eliminación con diálogo de reasignación.
  - `lib/features/moodle/presentation/screens/assignments_screen.dart` y `grade_calculator_screen.dart`:
    - Selector de cuentas (Filter Chips) en cabecera (se oculta automáticamente si hay $\le 1$ cuenta).
    - Insignias con el campus de origen en tarjetas de tareas y asignaturas durante la vista combinada.
- **Pruebas Automatizadas:**
  - `test/unit/moodle_multi_account_test.dart`:
    - 6 pruebas unitarias completas con datos simulados que verifican migración, aislamiento, eliminación, reasignación de cuenta principal, prevención de colisiones de notificaciones y degradación de widgets.
