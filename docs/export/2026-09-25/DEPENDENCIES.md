# 📦 Dependencias y Entorno (DEPENDENCIES)

## Versión de Pruebas: v1.4.0 (Build 240) — 2026-09-25

Detalle de dependencias utilizadas en `pubspec.yaml`, versiones fijadas y compatibilidad de entorno.

---

## 1. Dependencias de Producción (`dependencies`)

| Paquete                       | Versión    | Propósito Técnico                                                |
| :---------------------------- | :--------- | :--------------------------------------------------------------- |
| `flutter`                     | SDK        | Framework de interfaz y renderizado                              |
| `flutter_localizations`       | SDK        | Soporte para fechas y textos en español (`es`)                   |
| `flutter_riverpod`            | `^2.6.1`   | Gestión reactiva de estado e inyección de dependencias           |
| `riverpod_annotation`         | `^2.6.1`   | Anotaciones para generador de proveedores                        |
| `go_router`                   | `^14.8.1`  | Enrutamiento declarativo y navegación anidada (`ShellRoute`)     |
| `drift`                       | `^2.24.0`  | ORM SQLite reactivo con soporte transaccional y migraciones      |
| `sqlite3_flutter_libs`        | `^0.5.28`  | Binarios SQLite nativos para Android/iOS                         |
| `path_provider`               | `^2.1.5`   | Rutas a directorios de documentos privados y caché               |
| `path`                        | `^1.9.1`   | Manipulación multiplataforma de rutas de archivos                |
| `flutter_secure_storage`      | `^9.2.4`   | Cifrado de credenciales (Keystore en Android, Keychain en iOS)   |
| `dio`                         | `^5.8.0+1` | Cliente HTTP con soporte de cookies y control de timeouts        |
| `http`                        | `^1.3.0`   | Cliente HTTP ligero auxiliar                                     |
| `webview_flutter`             | `^4.10.0`  | WebView para login SSO SAML de Banner 9 SSB                      |
| `intl`                        | `^0.20.2`  | Formateo regional de fechas, horas y monedas en español          |
| `flutter_local_notifications` | `^18.0.1`  | Notificaciones locales exactas y programadas                     |
| `timezone`                    | `^0.10.0`  | Cálculos horarios alineados a la zona horaria de Ecuador (GMT-5) |
| `flutter_timezone`            | `^5.1.0`   | Detección de la zona horaria nativa del dispositivo              |
| `home_widget`                 | `^0.7.1`   | Puente para widget nativo en la pantalla de inicio de Android    |
| `share_plus`                  | `^10.1.4`  | Compartición de imágenes de horario con apps externas            |
| `open_filex`                  | `^4.7.0`   | Apertura de archivos descargados (PDFs, PPTXs) con apps nativas  |
| `mobile_scanner`              | `^6.0.7`   | Lector de cámara en vivo para QR de login y checklist            |
| `qr_flutter`                  | `^4.1.0`   | Renderizado vectorial de códigos QR de alto contraste            |
| `table_calendar`              | `^3.1.3`   | Calendario mensual unificado con marcadores por categoría        |
| `url_launcher`                | `^6.3.1`   | Apertura de enlaces directos a Microsoft Teams, Zoom y Meet      |

---

## 2. Dependencias de Desarrollo y Generación (`dev_dependencies`)

| Paquete              | Versión   | Propósito Técnico                                       |
| :------------------- | :-------- | :------------------------------------------------------ |
| `flutter_test`       | SDK       | Framework de pruebas unitarias y de widgets             |
| `flutter_lints`      | `^5.0.0`  | Reglas recomendadas de estilo y calidad de código       |
| `drift_dev`          | `^2.24.0` | Generador de código para tablas, DAO y queries de Drift |
| `build_runner`       | `^2.4.15` | Ejecutor de tareas de generación de código              |
| `riverpod_generator` | `^2.6.3`  | Generador de proveedores de Riverpod                    |

---

## 3. Requisitos de Plataforma Android

- **SDK Mínimo (`minSdkVersion`):** 21 (Android 5.0 Lollipop).
- **SDK de Compilación (`compileSdk`):** 35 (Android 15).
- **Compatibilidad Java / Kotlin:** Java 17, `desugar_jdk_libs:2.1.4` para compatibilidad de APIs `java.time`.
