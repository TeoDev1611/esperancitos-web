# 📦 Dependencias del Proyecto (DEPENDENCIES)

Snapshot de `pubspec.yaml` de **Esperancitos** con la justificación y caso de uso específico de cada paquete dentro de esta aplicación estudiantil.

---

## 1. Dependencias de Producción (`dependencies`)

| Paquete | Versión | Uso Específico en Esperancitos |
| :--- | :---: | :--- |
| **`flutter`** | `sdk: flutter` | Framework base para la construcción de la interfaz gráfica y la compilación multiplataforma. |
| **`flutter_localizations`** | `sdk: flutter` | Provee los delegados de localización para formatear fechas, calendarios y textos en español (`es`) y respetar convenciones regionales ecuatorianas. |
| **`flutter_riverpod`** | `^3.4.3` | Gestión de estado reactivo global, inyección de dependencias desacoplada y emisión de Streams observables para sincronizar Drift con la UI en tiempo real. |
| **`go_router`** | `^18.0.1` | Enrutador declarativo con `ShellRoute` para mantener el estado de la barra de navegación inferior (Hoy, Horario, Tareas, Ajustes) y controlar transiciones de pantalla. |
| **`dio`** | `^5.8.0+1` | Cliente HTTP avanzado para peticiones REST a Moodle Web Services (`server.php`), descargas binarias de archivos de materias e interceptores seguros que bloquean logs de tokens. |
| **`webview_flutter`** | `^4.10.0` | Navegador embebido para flujos SSO federados: login SAML de Banner 9 SSB con inyección de canal JavaScript, y login Moodle `launch.php` con captura del esquema `moodlemobile://`. |
| **`url_launcher`** | `^6.3.1` | Apertura de enlaces externos hacia apps nativas instaladas en el dispositivo, específicamente Microsoft Teams, Zoom, Google Meet o navegadores del sistema. |
| **`drift`** | `^2.26.0` | ORM de base de datos relacional SQLite fuertemente tipado para almacenamiento offline-first de asignaturas, tareas, notas y horario institucional con `schemaVersion = 2`. |
| **`sqlite3_flutter_libs`** | `^0.5.42` | Binarios nativos precompilados de SQLite3 para Android e iOS, garantizando soporte de transacciones y extensiones C optimizadas. |
| **`path_provider`** | `^2.1.5` | Resolución de directorios nativos del sistema de archivos del dispositivo para alojar la base de datos SQLite y la carpeta privada de descargas de documentos de estudio. |
| **`path`** | `^1.9.1` | Manipulación y unión segura de rutas de archivos en el sistema operativo (`join()`, extensiones de archivo de recursos Moodle). |
| **`flutter_secure_storage`** | `^11.2.0` | Almacenamiento cifrado por hardware en **Android KeyStore** (EncryptedSharedPreferences) e **iOS Keychain** para el token `wstoken` de Moodle, cookies de Banner y switches de alertas. |
| **`flutter_local_notifications`** | `^22.3.1` | Programación de alarmas y notificaciones locales escalonadas (7d, 3d, 1d, 3h), alertas de nuevas calificaciones publicadas y resumen matutino diario sin requerir conexión a internet. |
| **`timezone`** | `^0.11.1` | Base de datos de zonas horarias IANA para cálculos deterministas de fechas de entrega en la zona oficial de Ecuador (`America/Guayaquil`, GMT-5). |
| **`flutter_timezone`** | `^5.1.0` | Obtención de la zona horaria nativa del sistema operativo del dispositivo en tiempo de ejecución, compatible con Android Gradle Plugin 8.x / 9.x. |
| **`home_widget`** | `^0.10.0` | Canal de comunicación entre Flutter y el widget nativo de pantalla de inicio de Android para proyectar la materia, aula y hora de la próxima clase. |
| **`intl`** | `^0.20.2` | Formateo y parseo internacionalizado de fechas, horas y monedas en español (`DateFormat.yMMMMd('es')`). |
| **`cupertino_icons`** | `^1.0.8` | Glifos vectoriales estilo iOS utilizados de forma complementaria a Material Icons para consistencia visual. |
| **`html_unescape`** | `^2.0.0` | Decodificación de entidades HTML presentes en respuestas de Banner y descripciones de Moodle (convierte `&amp;` a `&`, `&Iacute;` a `Í`, `&ntilde;` a `ñ`). |
| **`share_plus`** | `^13.3.0` | Invocación de la hoja de compartir nativa del sistema operativo para exportar el horario estilizado en imagen PNG y el archivo de calendario `.ics`. |
| **`open_filex`** | `^4.7.0` | Lanzador del visor de archivos nativo de Android/iOS para abrir inmediatamente PDFs, diapositivas y documentos descargados desde Moodle. |

---

## 2. Dependencias de Desarrollo (`dev_dependencies`)

| Paquete | Versión | Uso Específico en Esperancitos |
| :--- | :---: | :--- |
| **`flutter_test`** | `sdk: flutter` | Framework oficial para escribir y ejecutar las 66 pruebas unitarias y de widgets que validan la lógica de negocio y componentes visuales. |
| **`flutter_lints`** | `^6.0.0` | Reglas de estilo y mejores prácticas recomendadas por el equipo de Flutter para garantizar un código limpio y libre de errores potenciales. |
| **`build_runner`** | `^2.4.15` | Herramienta de compilación en línea de comandos utilizada para ejecutar los generadores de código estático de Drift. |
| **`drift_dev`** | `^2.26.0` | Compilador y analizador de esquemas SQL que genera el archivo `app_database.g.dart` a partir de las clases definidas en `tables.dart`. |
