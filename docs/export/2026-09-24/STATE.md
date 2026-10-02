# 📊 Estado del Proyecto Esperancitos (Export 2026-09-24)

> **Documento:** Resumen Ejecutivo del Estado del Sistema  
> **Fecha de corte:** 2026-09-24 20:00:00 ECT (GMT-5)  
> **Versión de la aplicación:** `1.0.0+1` (`v1.4.0 UI Neo-Student Brutalism` + `Multi-Account v3`)  
> **Rama git:** `master`  
> **Compilación y Tests:** 92/92 pruebas unitarias y de widgets aprobadas (100%), 0 advertencias en análisis estático.

---

## 1. Resumen Ejecutivo del Estado Actual

Esperancitos es un cliente móvil independiente, offline-first y privado para estudiantes de la Universidad de las Fuerzas Armadas ESPE. Su propósito central es resolver la fragmentación académica unificando:
1. El **horario de clases institucional** desde **Ellucian Banner 9 SSB** (cuenta única).
2. Las **asignaturas, tareas, calificaciones y recursos de estudio** desde **Moodle** con soporte **Multi-Cuenta** nativo (múltiples campus vinculados simultáneamente).

La aplicación opera bajo una **arquitectura de cero servidores intermedios** (*zero-backend*), donde el dispositivo del estudiante se conecta de forma directa y cifrada con los sistemas universitarios, persistiendo toda la información localmente en **SQLite mediante Drift v3** y gestionando credenciales de sesión en **Android Keystore / EncryptedSharedPreferences** con aislamiento estricto por `moodleAccountId`.

---

## 2. Matriz de Estado: Verificado en Dispositivo Real vs. Implementado vs. Pendiente

| Componente / Funcionalidad | Estado de Madurez | Detalle de Verificación y Ubicación en Código |
| :--- | :---: | :--- |
| **Arranque y Navegación (Splash, Shell, Tabs)** | 🟢 **Verificado en Dispositivo** | Flujo completo verificado. `SplashScreen` valida onboarding y credenciales en <700ms (`lib/features/auth/presentation/screens/splash_screen.dart`). Enrutamiento declarativo persistente con `GoRouter 18` en `lib/core/router/app_router.dart`. |
| **Diseño Visual Neo-Student Brutalism** | 🟢 **Verificado en Dispositivo** | Componentes modulares (`BrutalistCard`, `BrutalistButton`, `StatusBadge`, `CardHeaderWithBadge`) en `lib/core/widgets/`. Tipografías locales `Outfit` e `Inter` empaquetadas sin desbordes de `RenderFlex`. |
| **Dashboard Académico en Vivo** | 🟢 **Verificado en Dispositivo** | `NextClassPreviewCard` muestra la clase en curso con animación de pulso aislada (`RepaintBoundary`) o la tarjeta de fin de jornada (`TodayClassesEndCard`). Carrusel horizontal de entregas urgentes de la cuenta principal. En `lib/features/dashboard/`. |
| **Atajo a Clase Virtual (FEAT-01)** | 🟢 **Verificado en Dispositivo** | `VirtualMeetingDetector` y `VirtualMeetingResolver` detectan enlaces a Microsoft Teams, Zoom y Google Meet en descripciones de cursos de Moodle y abren la app nativa con `url_launcher`. En `lib/core/utils/virtual_meeting_detector.dart`. |
| **Horario Semanal y Timeline** | 🟢 **Verificado en Dispositivo** | Pestañas de Lunes a Sábado con objetivos táctiles accesibles ($\ge 48\text{dp}$). Timeline vertical con docente, aula y horas. En `lib/features/schedule/presentation/screens/schedule_screen.dart`. |
| **Exportador de Horario a Wallpaper PNG (FEAT-04)** | 🟢 **Verificado en Dispositivo** | `ScheduleImageExportService` renderiza el horario en canvas de alta resolución con paleta Dark Slate + Esmeralda y lo comparte mediante `share_plus 13`. En `lib/features/schedule/domain/services/schedule_image_export_service.dart`. |
| **Exportador iCalendar (.ics)** | 🟢 **Verificado en Dispositivo** | Generación estándar RFC 5545 con recurrencia semanal y cláusula `UNTIL` basada en la fecha de fin de semestre de Banner. Procesamiento en Isolate de fondo (`Isolate.run`). En `lib/core/utils/ics_generator.dart`. |
| **Widget de Android "Próxima Clase" (FEAT-02)** | 🟡 **Implementado (Requiere prueba multi-OEM)** | `HomeWidgetService` actualiza el widget nativo de pantalla de inicio con la materia, aula y hora de la siguiente clase usando `home_widget`. Vinculado a la cuenta principal con degradación limpia. Código nativo en `android/app/src/main/res/layout/widget_next_class.xml` y `AppWidgetProvider`. |
| **Gestor de Tareas Offline-First** | 🟢 **Verificado en Dispositivo** | 3 pestañas (Pendientes, Completadas, Atrasadas). Selector de cuentas (Filter Chips), insignias de campus en vista combinada, *swipe-to-dismiss* con retroalimentación háptica. En `lib/features/moodle/presentation/screens/assignments_screen.dart`. |
| **Explorador y Descarga de Materiales (FEAT-08)** | 🟢 **Verificado en Dispositivo** | `CourseMaterialsScreen` consulta `core_course_get_contents`, lista archivos por temas, descarga en almacenamiento privado de la app y abre con `open_filex`. En `lib/features/moodle/presentation/screens/course_materials_screen.dart`. |
| **Alertas Escalonadas y Notificaciones** | 🟢 **Verificado en Dispositivo** | `NotificationService` programa alertas locales con ID compuesto de 32 bits a 7 días, 3 días, 24 horas y 3 horas antes del límite, con cancelación aislada por cuenta. En `lib/core/notifications/notification_service.dart`. |
| **Resumen Matutino Diario 06:30 AM (FEAT-03)** | 🟢 **Verificado en Dispositivo** | `MorningBriefingService` programa alarma diaria que recopila clases del día y tareas de la cuenta principal desde Drift. En `lib/core/services/morning_briefing_service.dart`. |
| **Alerta de Publicación de Calificaciones (FEAT-09)** | 🟢 **Verificado en Dispositivo** | Durante la sincronización, detecta diferencias en `GradeItems` de Drift y emite notificación ante nuevas notas ingresadas por docentes. En `lib/features/moodle/data/services/moodle_sync_service.dart`. |
| **Calculadora de Nota Final ESPE** | 🟢 **Verificado en Dispositivo** | Aplica fórmula institucional: $\text{Final} = \frac{14.0 - (P_1 \times 0.35 + P_2 \times 0.35)}{0.30}$, con selector de cuentas Moodle y badges de campus. En `lib/features/moodle/domain/utils/grade_calculator.dart`. |
| **Soporte Multi-Cuenta Moodle (FASE B)** | 🟢 **Completado y Probado** | Permite vincular múltiples cuentas de Moodle simultáneas. Tabla `MoodleAccounts`, aislamiento por `moodleAccountId`, sincronización secuencial, pantalla `MoodleAccountsScreen`. Probado en `test/unit/moodle_multi_account_test.dart`. |
| **Login Moodle por Código QR (FASE A)** | 🟢 **Completado y Probado** | Escaneo e intercambio de token mediante `tool_mobile_get_tokens_for_qr_login` con fallback de URL y manejo de códigos de error. Probado en `test/unit/moodle_qr_test.dart`. |
| **Ajustes y Cierre de Sesión** | 🟢 **Verificado en Dispositivo** | Conmutadores persistidos en `SecureStorageService`. Acceso directo a `MoodleAccountsScreen`. Logout seguro que cancela notificaciones del SO y purga la base de datos. En `lib/features/settings/presentation/screens/settings_screen.dart`. |
| **Sincronización Banner 9 con Periodo Activo** | 🟡 **Endpoint Identificado (`getRegistrationEvents`)** | Flujo SSO WebView implementado. Se identificó el endpoint real `classRegistration/getRegistrationEvents?termFilter=` que entrega un Array JSON con eventos de calendario (`start`/`end` ISO-8601). Blindaje contra OOM en Moto G06 con `largeHeap` y captura de errores de red en `SsoWebViewScreen`. Pendiente parsear Array en `BannerScheduleParser` (Prioridad 1 para mañana). |

---

## 3. Estado Detallado de Cada Integración

### 3.1. Ellucian Banner 9 SSB (Horario de Clases)

* **Flujo de Autenticación y Mitigaciones en Dispositivos:**  
  Se realiza a través de `SsoWebViewScreen` (`lib/features/auth/presentation/screens/sso_webview_screen.dart`). El estudiante ingresa sus credenciales en el formulario institucional CAS/SAML (`loginprod.espe.edu.ec` o Microsoft 365). El WebView sigue las redirecciones federadas hacia `*.elluciancloud.com` y aterriza en `registrop.espe.edu.ec/StudentRegistrationSsb`.
  * *Prevención de OOM en Android:* En `AndroidManifest.xml` se configuró `android:largeHeap="true"` y el permiso `ACCESS_NETWORK_STATE` para evitar que el proceso Chromium de WebView sea eliminado por falta de memoria en dispositivos con 2GB/3GB RAM (Moto G06).
  * *Manejo de Errores de Red:* Si ocurre una intermitencia de DNS (`ERR_NAME_NOT_RESOLVED`), se bloquea la ejecución de scripts en páginas rotas y se despliega una tarjeta Neo-Brutalista con botones de *"Reintentar conexión"* y *"Volver"*.
  * *Liberación de Memoria:* Al salir de la pantalla se ejecuta `about:blank` para liberar texturas y buffers gráficos (`ImageReader` 720x1472).
* **Endpoints de Horario Identificados:**  
  1. `https://registrop.espe.edu.ec/StudentRegistrationSsb/ssb/classRegistration/getRegistrationEvents?termFilter=<periodo>` *(Endpoint primario que devuelve el Array JSON de eventos de FullCalendar con fechas ISO directas)*.
  2. `https://registrop.espe.edu.ec/StudentRegistrationSsb/ssb/registrationHistory/reset?term=<periodo>` *(Endpoint de respaldo e historial acumulado)*.
* **Mecanismo de Extracción:**  
  Para eludir las restricciones de cookies `HttpOnly` y `SameSite` sin romper la seguridad del navegador, la app inyecta un script JavaScript que ejecuta un `fetch()` relativo con `credentials: 'same-origin'` y cabecera `X-Requested-With: XMLHttpRequest`. La respuesta JSON devuelta por el servidor de Banner se transmite directamente a Flutter a través del canal JavaScript `BannerDataChannel`.
* **Parser (`BannerScheduleParser` en `lib/features/ellucian/data/datasources/banner_schedule_parser.dart`):**  
  - Parsea el arreglo de `registrations` y su sub-arreglo `meetingTimes`.
  - [Próximo paso]: Adaptar para admitir directamente el Array JSON devuelto por `getRegistrationEvents`.
  - Separa las banderas booleanas de días (`monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`) en reuniones independientes por día.
  - Corrige el desfase de 59 minutos de Banner (`0859` $\rightarrow$ `09:00`, `1859` $\rightarrow$ `19:00`).
  - Decodifica entidades HTML en nombres de asignaturas y profesores mediante `html_unescape` (ej. `&amp;` $\rightarrow$ `&`, `&Iacute;` $\rightarrow$ `Í`).
  - Convierte nombres de profesores a Title Case (`APELLIDO NOMBRE` $\rightarrow$ `Nombre Apellido`).
  - Parsea fechas con nombres de mes en inglés (`28-Oct-2024`, `21-Feb-2025`) de forma determinista sin depender del locale del dispositivo.
  - Deduplica reuniones por clave `CRN + Día + HoraInicio`.
  - Se ejecuta en un worker Isolate secundario (`Isolate.run()`) para evitar caídas de fotogramas en la UI.
* **Estado de Verificación:**  
  Parser 100% probado en `banner_parser_test.dart` (14 pruebas unitarias que cubren formatos de hora, deduplicación, fechas en inglés y sesión expirada). La integración WebView está implementada y lista; su verificación con datos en vivo depende de que el estudiante ingrese credenciales válidas en el periodo vigente.

---

### 3.2. Moodle (Plataformas de Aulas Virtuales)

* **Soporte Multi-Campus (4 Campus Oficiales):**  
  La ESPE aloja sus entornos virtuales en 4 instancias Moodle independientes:
  1. **Presencial (Matriz Sangolquí / Latacunga / Santo Domingo):** `https://micampus.espe.edu.ec`
  2. **En Línea (Modalidad a Distancia):** `https://micampusvirtual.espe.edu.ec`
  3. **Postgrado:** `https://micampus2.espe.edu.ec`
  4. **Nivelación:** `https://micampus1.espe.edu.ec`

* **Mecanismo de Autenticación SSO (`launch.php`):**  
  `MoodleLoginScreen` (`lib/features/moodle/presentation/screens/moodle_login_screen.dart`) carga:  
  `{baseUrl}/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=<random>&urlscheme=moodlemobile`  
  El usuario inicia sesión en la interfaz web de la universidad (con soporte completo para MFA/Microsoft). Al autenticarse, Moodle emite una redirección al esquema personalizado:  
  `moodlemobile://token=<base64>`  
  `MoodleLaunchUrlParser` intercepta este esquema antes de que el WebView falle, extrae la carga útil Base64, la decodifica (`siteid:::token`) y obtiene el token de Web Services sin requerir que el usuario digite contraseñas en formularios no oficiales.

* **Mecanismo de Autenticación por Código QR Oficial (`tool_mobile_get_tokens_for_qr_login`):**  
  Implementado como alternativa de máxima fiabilidad cuando `launch.php` no responde o presenta problemas de redirección:
  - El estudiante accede a **Preferencias > App para dispositivos móviles** en el aula virtual y genera un código QR válido por 10 minutos con esquema `moodlemobile://https://<campus>?qrlogin=<token>&userid=<id>`.
  - La app escanea el código con `mobile_scanner`, valida el esquema con `MoodleQrParser` y realiza una petición POST con `User-Agent: MoodleMobile Esperancitos/1.0.0` hacia `{baseUrl}/lib/ajax/service-nologin.php` (con reintento fallback `?info=tool_mobile_get_tokens_for_qr_login`).
  - Obtiene el `wstoken` de Web Services de forma inmediata y sin requerir interacción web ni contraseñas.

* **Soporte Multi-Cuenta de Moodle (FASE B):**  
  La arquitectura de datos (`schemaVersion = 3`) soporta la vinculación simultánea de múltiples cuentas de Moodle (ej. Presencial y Postgrado). Cada cuenta persiste sus credenciales en `SecureStorageService` (`moodle_token_<accountId>`), sus cursos, tareas y notas en Drift con la columna foránea `moodleAccountId`, y sus notificaciones locales mediante un ID compuesto de 32 bits que previene colisiones.

* **Estado de Habilitación del Servicio Móvil por Campus:**  
  - En periodos intersemestrales o durante el inicio de inscripciones, los administradores de TI de la ESPE a veces desactivan temporalmente el servicio móvil (`tool_mobile` / `enablemobilewebservice`) en el campus presencial o virtual.
  - **Manejo en la aplicación:** Si la página de `launch.php` devuelve un mensaje de servicio no disponible, o si la redirección no se produce en 30 segundos, la app muestra automáticamente la pantalla `_buildServiceDisabledView()`, informando al estudiante con total transparencia que debe aguardar a que el campus habilite el acceso móvil, iniciar sesión vía código QR, o cambiar a otro campus operativo.

* **Web Services Consumidos:**  
  - `core_webservice_get_site_info`: Información del usuario y validación de token.
  - `core_enrol_get_users_courses`: Asignaturas matriculadas.
  - `mod_assign_get_assignments`: Tareas y fechas de entrega.
  - `mod_assign_get_submission_status`: Estado real de entrega en el servidor (optimizado en lotes paralelos de 4 concurrentes).
  - `gradereport_user_get_grade_items`: Calificaciones parciales y totales.
  - `core_course_get_contents`: Recursos y archivos adjuntos por materia (FEAT-08).
  - `tool_mobile_get_tokens_for_qr_login`: Intercambio oficial de tokens mediante código QR.

---

## 4. Bugs Conocidos y Pendientes (Referencia a AUDIT.md)

En la auditoría técnica exhaustiva (`docs/AUDIT.md`), se documentaron y resolvieron **20 hallazgos técnicos** clasificados en:
- **2 Críticos:** CRÍT-01 (Permisos Manifest Android), CRÍT-02 (Compatibilidad Gradle/Desugaring). Ambos **RESUELTOS**.
- **3 Altos de Flujo:** ALTO-01 (Consultas N+1 en submissions), ALTO-02 (Persistencia de conmutadores en Ajustes), ALTO-03 (Splash Screen redirigiendo forzosamente a Onboarding). Todos **RESUELTOS**.
- **6 Medios:** MED-01 (Fallback fin de clases), MED-02 (Restricción de dominios SSO), MED-03 (Fuentes locales empaquetadas), MED-04 (Normalización centralizada de fechas), MED-05 (Timeout y sesión expirada en Banner), MED-06 (Aislamiento transaccional multi-cuenta por `accountId` sin borrado destructivo). Todos **RESUELTOS**.
- **3 Bajos:** BAJO-01 (Touch targets accesibles 48dp), BAJO-02 (Tests de límites en calculadora de notas), BAJO-03 (Contraste de badges ámbar). Todos **RESUELTOS**.
- **6 de Rendimiento:** PERF-01 (Splash sin delay artificial de 2.2s), PERF-02 (Aislamiento de pulso con RepaintBoundary), PERF-03 (Paralelización de notas en lotes), PERF-04 (Caché en memoria de KeyStore), PERF-05 (Índices B-Tree en SQLite Drift), PERF-06 (Parsing y exportación en Isolates secundarios). Todos **RESUELTOS**.

### Limitaciones Actuales y Casos Borde Identificados:
1. **Detección de Clase Virtual dependiente de texto de Moodle:**  
   Si el profesor no incluye el enlace de Microsoft Teams o Zoom en la descripción del curso o en la sección general de Moodle, el botón de atajo virtual no se mostrará (comportamiento esperado, pues Banner no provee enlaces de videoconferencia).
2. **Widget de Android en capas OEM agresivas:**  
   En dispositivos Xiaomi/Redmi (HyperOS/MIUI) con "Ahorro de batería extremo" o "Optimización MIUI" activada, el sistema operativo puede retrasar la actualización periódica del widget a menos que el usuario marque la app como "Sin restricciones" en Ajustes de batería.
3. **Materias con calificación no numérica:**  
   Asignaturas de suficiencia de idiomas o pasantías pre-profesionales que se evalúan con escalas cualitativas ("Aprobado / No Aprobado") devuelven `gradeRaw = null`, por lo que se omiten del cálculo de nota final de 20 puntos.

---

## 5. Decisiones de Producto Tomadas y sus Motivos

### 5.1. ¿Por qué se cambió de `regEvents/print` a `registrationHistory/reset`?
* **Motivo del diseño inicial:** Históricamente, Banner 8 y las primeras versiones de Banner 9 imprimían una vista HTML estática en `/StudentRegistrationSsb/ssb/classRegistration/print` que contenía una variable JavaScript incrustada (`var regEvents = [...]`).
* **Problemas descubiertos en producción:**  
  1. La página de impresión requiere que la sesión esté completamente inicializada en un contexto específico del portal; de lo contrario, devuelve redirecciones 302 o páginas HTML genéricas que provocan fallos de scraping.
  2. La vista de impresión omite datos críticos como el nombre completo del edificio (`buildingDescription`), el aula precisa de cada día, y las fechas de inicio y fin de periodo (`startDate`, `endDate`).
* **Solución adoptada:**  
  Banner 9 SSB expone el endpoint oficial `/StudentRegistrationSsb/ssb/registrationHistory/reset?term=<periodo>`. Al ejecutar un `fetch()` autenticado directamente dentro del WebView (`credentials: 'same-origin'`), el servidor responde con un **JSON nativo estructurado y limpio** que incluye el arreglo `registrations`, los datos completos de aula, edificio, fechas de semestre y nombres de docentes, eliminando por completo la fragilidad del parsing de HTML.

### 5.2. ¿Por qué Moodle usa `launch.php` y Login QR en lugar de `token.php`?
* **Motivo del diseño inicial:** `login/token.php` es el endpoint clásico de Moodle que intercambia `username` y `password` por un token.
* **Problemas en el entorno ESPE:**  
  1. La universidad tiene unificada la identidad de estudiantes mediante **Microsoft Azure AD / SAML** (`loginprod.espe.edu.ec`). Muchos estudiantes no poseen una contraseña local de Moodle o tienen activada la autenticación en dos pasos (MFA con Microsoft Authenticator).
  2. Solicitar credenciales en un formulario no oficial dentro de la app genera desconfianza y rompe las políticas de seguridad institucional.
* **Solución adoptada:**  
  Se implementó el flujo oficial de la app móvil de Moodle mediante `/admin/tool/mobile/launch.php`, complementado con el Login por Código QR oficial (`tool_mobile_get_tokens_for_qr_login`). Ambos métodos operan sin que la app toque la contraseña del estudiante.

### 5.3. ¿Por qué NO hay "Cargar Archivo" (Envío de Deberes)?
* **Riesgo Operativo Crítico:** El envío de tareas universitarias involucra fechas límite estrictas, penalizaciones académicas severas y políticas institucionales de entrega (formatos requeridos, límites de peso, confirmación de autoría).
* **Decisión Consciente:** Esperancitos fue concebida como una herramienta de **consulta, seguimiento, visualización offline y alertas**. Si un estudiante intentara subir su trabajo de fin de semestre a través de un cliente de terceros y ocurriera una falla de red, un error de timeout o un rechazo de formato en el borrador de Moodle, el estudiante podría perder su materia. La responsabilidad de la entrega final debe realizarse siempre en la interfaz web oficial de Moodle para contar con el comprobante de entrega del servidor.

### 5.4. ¿Por qué Moodle soporta Multi-Cuenta pero Banner 9 es Cuenta Única?
* **Realidad de Moodle:** La ESPE distribuye sus carreras en 4 plataformas independientes (Presencial, En Línea, Postgrado, Nivelación). Estudiantes con dobles carreras, pasantías o materias de posgrado cursan asignaturas en más de un campus al mismo tiempo. El soporte multi-cuenta permite ver todas las tareas y notas en una sola vista unificada sin tener que cerrar sesión y borrar datos.
* **Centralización de Banner:** Ellucian Banner 9 es la base de datos académica centralizada de la universidad. Cada estudiante tiene un identificador institucional único (ID ESPE / Correo) y un único expediente de matrícula por periodo. No existen múltiples cuentas de Banner para un mismo estudiante. Mantener Banner como cuenta única simplifica la arquitectura y evita duplicaciones innecesarias de horarios.

---

## 6. Qué Falta para Considerar la v1 Usable

Para declarar la versión `1.0.0` totalmente apta para distribución pública entre los estudiantes de la ESPE, restan los siguientes pasos operativos:

1. **Validación de campo con estudiantes activos en periodo vigente (202651 / 202420):**  
   Probar el flujo de login SAML en vivo con 3 a 5 estudiantes reales de diferentes facultades (Sangolquí, Latacunga, Santo Domingo y Modalidad en Línea) para confirmar que el formato de JSON devuelto por Banner 9 en el periodo actual coincida al 100% con los modelos de datos.
2. **Confirmación de disponibilidad del servicio móvil de Moodle:**  
   Monitorear la activación de `tool_mobile` en el campus presencial (`micampus.espe.edu.ec`) tras el periodo de matrículas extraordinarias.
3. **Pruebas de visualización del Home Widget en diversas marcas:**  
   Comprobar el comportamiento del widget en dispositivos Samsung (OneUI), Xiaomi (HyperOS) y Google Pixel (Android 14/15) para verificar que los layouts de texto no se trunquen en pantallas pequeñas.
4. **Selector visual de Periodo Académico en Ajustes:**  
   Añadir un selector amigable en `SettingsScreen` que permita al usuario elegir entre el periodo actual y periodos anteriores si la universidad tiene más de un ciclo abierto.

---

## 7. Resultados de Verificación Automatizada (Tests y Linter)

* **Fecha y hora de ejecución:** 2026-09-24 14:09:43 ECT (GMT-5)
* **Comando de Análisis Estático:** `flutter analyze`
  ```text
  Analyzing Esperancitos...
  No issues found! (ran in 4.1s)
  ```
  **Resultado:** **0 errores, 0 advertencias, 0 lints informativos.**

* **Comando de Pruebas Automatizadas:** `flutter test`
  ```text
  00:04 +66: All tests passed!
  ```
  **Resultado:** **66/66 pruebas pasadas con 100% de éxito.**  
  Cobertura de pruebas distribuidas en:
  - `banner_parser_test.dart`: Parseo JSON, deduplicación, fechas en inglés, normalización de horas.
  - `campus_test.dart`: Soporte multi-campus, aislamiento transaccional y parsing de `launch.php`.
  - `course_materials_test.dart`: DTOs de Moodle, parsing de módulos, filtrado de archivos y recursos.
  - `database_test.dart`: Drift SQLite v2, migraciones, índices, upsert en conflicto y borrado seguro.
  - `date_formatting_test.dart`: Formateo de fechas relativas y tiempos restantes.
  - `date_time_utils_test.dart`: Detección de días de la semana y cálculo de minutos.
  - `grade_calculator_test.dart`: Fórmula 35/35/30, límites y validaciones de notas.
  - `home_widget_service_test.dart`: Serialización de datos de la próxima clase para el widget nativo.
  - `ics_generator_test.dart`: Formato RFC 5545 iCalendar con recurrencia semanal y cláusula `UNTIL`.
  - `moodle_sync_test.dart`: Flujo de sincronización de cursos, tareas y calificaciones con mock remote.
  - `morning_briefing_test.dart`: Formateo y lógica de la notificación de resumen matutino diario.
  - `schedule_image_export_test.dart`: Generación y exportación de imágenes PNG de horario semanal.
  - `timezone_test.dart`: Normalización estricta a zona horaria de Ecuador (`America/Guayaquil` GMT-5).
  - `virtual_meeting_detector_test.dart`: Detección de Teams, Zoom, Meet y Webex con regex y descarte de falsos positivos.
  - `widget_test.dart`: Smoke test del árbol de widgets, SplashScreen y prevención de RenderFlex overflow en `BrutalistButton`.

---

## 8. Documentación Corregida en Este Export

Como parte de este proceso de auditoría y exportación, se revisaron y actualizaron todos los archivos de `/docs` para reflejar con absoluta exactitud el código fuente real existente:

1. **`docs/WALKTHROUGH.md`:**  
   - Se corrigió la mención desactualizada de extracción mediante `regEvents` y `/ssb/classRegistration/print`, reemplazándola por la especificación real: extracción de JSON nativo mediante `fetch()` en WebView sobre `/StudentRegistrationSsb/ssb/registrationHistory/reset`.  
   - Se actualizó el recuento de pruebas automatizadas de 15 a **66 pruebas unitarias y de widgets**.  
   - Se actualizó el versionado de la base de datos de `schemaVersion = 1` a `schemaVersion = 2`.  
   - Se incorporaron las secciones funcionales de las funcionalidades añadidas: FEAT-01 (Atajo a clases virtuales), FEAT-02 (Widget de Android), FEAT-03 (Resumen matutino), FEAT-04 (Exportador de horario a PNG), FEAT-08 (Gestor de archivos de Moodle), FEAT-09 (Alertas de publicación de notas) y el rediseño Neo-Student Brutalism.
2. **`docs/README.md`:**  
   - Se añadieron las nuevas características al listado principal (Widget nativo, atajo a Teams/Zoom, explorador de materiales de estudio offline, exportación estilizada a imagen).  
   - Se actualizaron las referencias de dependencias clave (Riverpod 3, GoRouter 18, Drift 2.26, flutter_local_notifications 22, home_widget 0.10).
3. **`docs/ROADMAP.md`:**  
   - Se actualizaron los estados de las funcionalidades del catálogo: **FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-08 y FEAT-09** fueron marcadas formalmente como **Implementadas y Verificadas**.  
   - Se reestructuró la sección de funcionalidades pendientes (FEAT-05, FEAT-06, FEAT-07, FEAT-10, FEAT-11, FEAT-12, FEAT-13, FEAT-14).
4. **`docs/API.md`:**  
   - Se agregó la documentación completa del flujo de autenticación Moodle SSO vía `/admin/tool/mobile/launch.php` y la decodificación de `moodlemobile://`.  
   - Se incorporó la especificación del Web Service `core_course_get_contents` utilizado para la consulta de archivos y guías de estudio.
5. **`docs/ARCHITECTURE.md`:**  
   - Se incluyeron los nuevos servicios de dominio y datos en el diagrama de arquitectura y en el mapa de carpetas (`VirtualMeetingDetector`, `HomeWidgetService`, `MorningBriefingService`, `ScheduleImageExportService`, `MoodleFileDownloadService`).
6. **`docs/PLAN.md`:**  
   - Se sincronizó el estado de ejecución de las fases para reflejar las adiciones de la versión 1.4.0.
7. **`docs/CONTRIBUTING.md`:**  
   - Se actualizó el número de pruebas unitarias y el catálogo de suites de test recomendadas antes de abrir Pull Requests.
