# 🌳 Estructura del Proyecto (PROJECT_TREE)

Árbol de directorios de `lib/` y `test/` de Esperancitos con la descripción funcional de cada carpeta principal y el estado de compleción de cada módulo.

---

## 1. Árbol de Directorios y Descripción por Carpeta

```text
Esperancitos/
├── lib/                                  # Código fuente principal de la aplicación Flutter
│   ├── app.dart                          # Configuración raíz de MaterialApp, temas, rutas y localización 'es'
│   ├── main.dart                         # Punto de entrada, inicialización de timezone y locales
│   │
│   ├── core/                             # Módulos transversales y utilidades de infraestructura
│   │   ├── database/                     # Esquema SQLite tipado con Drift v3, migración multi-cuenta e índices B-Tree
│   │   ├── error/                        # Tipo sellado Result<T> y jerarquía de fallos AppFailure
│   │   ├── network/                      # Cliente HTTP Dio con timeouts seguros y exclusión de logs confidenciales
│   │   ├── notifications/                # Orquestador de notificaciones locales con IDs compuestos de 32 bits
│   │   ├── router/                       # Navegación declarativa GoRouter (/moodle-accounts) con ShellRoute persistente
│   │   ├── services/                     # Servicios nativos del sistema (Home Widget Android, Resumen Matutino)
│   │   ├── storage/                      # Almacenamiento seguro cifrado (Android KeyStore / iOS Keychain) con caché
│   │   ├── theme/                        # Paleta Dark Slate + Esmeralda, tipografías locales Outfit/Inter y temas
│   │   ├── utils/                        # Utilidades puras (Timezone GMT-5, DateTime, ICS RFC 5545, Detector Virtual)
│   │   └── widgets/                      # Sistema de componentes Neo-Student Brutalism (Cards, Buttons, Badges, Headers)
│   │
│   └── features/                         # Módulos de funcionalidad de negocio (Feature-First Clean Architecture)
│       ├── auth/                         # Autenticación, Splash Screen rápido, Onboarding y WebView SSO SAML
│       ├── dashboard/                    # Pantalla de inicio con clase en vivo, atajos a Teams y carrusel de tareas
│       ├── ellucian/                     # Integración Banner 9 SSB (Parser JSON en Isolate, Repositorio y Sincronizador)
│       ├── moodle/                       # Integración Moodle 4 campus (Multi-cuenta, QR Login, Tareas, Notas, Materiales)
│       ├── profile/                      # Perfil de usuario institucional y resumen académico
│       ├── schedule/                     # Horario semanal L-S, exportador a Wallpaper PNG y exportador .ics
│       └── settings/                     # Configuración de alertas, gestor de cuentas Moodle y borrado atómico
│
└── test/                                 # Suite automatizada de pruebas (92 tests en total)
    ├── widget_test.dart                  # Pruebas de widgets, smoke test de UI y prevención de RenderFlex overflow
    └── unit/                             # Pruebas unitarias de parsers, base de datos, sincronización y negocio
        ├── banner_parser_test.dart       # Parseo de JSON de Banner 9 SSB, fechas en inglés y deduplicación
        ├── campus_test.dart              # Aislamiento multi-campus y decodificación de URLs moodlemobile://
        ├── course_materials_test.dart    # Deserialización de contenidos y recursos de Moodle (FEAT-08)
        ├── database_test.dart            # Persistencia Drift SQLite, claves únicas y borrado transaccional
        ├── date_formatting_test.dart     # Formateo de fechas y tiempos restantes en español
        ├── date_time_utils_test.dart     # Detección de días de la semana y cálculo de minutos
        ├── grade_calculator_test.dart    # Fórmula de calificación 35/35/30 y casos límite institucionales
        ├── home_widget_service_test.dart # Serialización de datos de próxima clase para widget nativo (FEAT-02)
        ├── ics_generator_test.dart       # Generación de eventos RFC 5545 iCalendar con regla UNTIL
        ├── moodle_multi_account_test.dart # Migración v2->v3, aislamiento de cuentas, reasignación y degradación de widgets
        ├── moodle_qr_test.dart           # Intercambio de tokens por QR login, fallback con ?info= y error codes
        ├── moodle_sync_test.dart         # Sincronización en lotes de Moodle con mock remoto
        ├── morning_briefing_test.dart    # Lógica y plantilla del resumen matutino diario 06:30 AM (FEAT-03)
        ├── schedule_image_export_test.dart # Renderizado y compartición de fondos de pantalla PNG (FEAT-04)
        ├── timezone_test.dart            # Conversión UNIX a GMT-5 y control del desfase de medianoche
        └── virtual_meeting_detector_test.dart # Detección de enlaces Teams, Zoom, Meet y Webex (FEAT-01)
```

---

## 2. Estado de Compleción por Módulo en `lib/features/`

| Característica (`features/`) | Estado de Compleción | Descripción Funcional                                                                                                                                                                                                                                                                                                                               |
| :--------------------------- | :------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`auth`**                   |   🟢 **COMPLETA**    | Flujo completo de autenticación: `SplashScreen` de inicio rápido (<700ms), `OnboardingScreen` con solicitud de permisos y `SsoWebViewScreen` con intercepción y canal JS para Banner 9.                                                                                                                                                             |
| **`dashboard`**              |   🟢 **COMPLETA**    | `DashboardScreen` con visualización en vivo de la clase activa (`NextClassPreviewCard`), atajo dinámico a clase virtual (Teams/Zoom/Meet), tarjeta de fin de clases y carrusel de tareas urgentes (cuenta principal).                                                                                                                               |
| **`ellucian`**               |   🟢 **COMPLETA**    | `BannerScheduleParser` con soporte completo para la estructura JSON nativa de Banner 9 SSB (`/ssb/registrationHistory/reset`), Isolate worker secundario, caché SQLite Drift y repositorio local (cuenta única).                                                                                                                                    |
| **`moodle`**                 |   🟢 **COMPLETA**    | Soporte Multi-Cuenta para los 4 campus (`micampus`, `micampusvirtual`, `micampus2`, `micampus1`), SSO vía `launch.php`, Login por Código QR oficial (`tool_mobile_get_tokens_for_qr_login`), gestión de cuentas (`MoodleAccountsScreen`), tareas con _swipe-to-dismiss_, calculadora de notas y explorador de materiales (`CourseMaterialsScreen`). |
| **`profile`**                |   🟢 **COMPLETA**    | `ProfileScreen` con diseño Neo-Brutalista que muestra la identidad institucional del estudiante, campus activo y métricas académicas básicas.                                                                                                                                                                                                       |
| **`schedule`**               |   🟢 **COMPLETA**    | `ScheduleScreen` con pestañas interactivas de Lunes a Sábado, timeline vertical, resolución de enlaces de videoconferencia, exportador de imagen PNG para fondos de pantalla (`ScheduleExportDialog`) y exportador `.ics`.                                                                                                                          |
| **`settings`**               |   🟢 **COMPLETA**    | `SettingsScreen` con conmutadores persistentes de alertas, acceso al gestor Multi-Cuenta Moodle, exportación de calendario y cierre de sesión seguro que limpia SQLite y cancela alarmas del SO.                                                                                                                                                    |
