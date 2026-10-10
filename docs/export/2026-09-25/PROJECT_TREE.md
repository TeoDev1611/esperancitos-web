# 🌳 Estructura del Proyecto (PROJECT_TREE)

## Versión de Pruebas: v1.4.0 (Build 240) — 2026-09-25

Árbol de directorios de `lib/`, `test/` y `android/` de **Esperancitos** con la descripción de los módulos principales y el estado de la aplicación.

---

## 1. Árbol de Directorios y Descripción

```text
Esperancitos/
├── android/                                  # Plataforma nativa Android
│   ├── app/src/main/
│   │   ├── kotlin/.../MainActivity.kt        # Listener instantáneo para remover el Splash nativo
│   │   └── res/
│   │       ├── drawable/transparent_splash.xml # 1x1 drawable transparente para suprimir icono estático
│   │       ├── values/styles.xml             # Estilos de ventana unificados con #0B111E
│   │       ├── values-night/styles.xml       # Modo oscuro nativo
│   │       └── values-v31/styles.xml         # Desactivación de SplashScreen de Android 12+ (duration=0)
│   │
├── lib/                                      # Código fuente principal de la aplicación Flutter
│   ├── app.dart                              # Configuración raíz de MaterialApp, temas, rutas y localización 'es'
│   ├── main.dart                             # Punto de entrada, inicialización de timezone y locales
│   │
│   ├── core/                                 # Módulos transversales y utilidades de infraestructura
│   │   ├── database/                         # Esquema SQLite tipado con Drift v3 (6 tablas relacionales)
│   │   ├── error/                            # Tipo sellado Result<T> y jerarquía de fallos AppFailure
│   │   ├── network/                          # Cliente HTTP Dio con timeouts seguros
│   │   ├── notifications/                    # Notificaciones locales con IDs compuestos de 32 bits
│   │   ├── providers/                        # Providers globales (dataSaverProvider, etc.)
│   │   ├── router/                           # Navegación GoRouter declarativa con ShellRoute
│   │   ├── services/                         # Home Widget, Morning Briefing y QR Data Sharing
│   │   │   ├── home_widget_service.dart
│   │   │   ├── morning_briefing_service.dart
│   │   │   └── qr_data_sharing_service.dart  # Codificación y decodificación Base64 P2P
│   │   ├── storage/                          # SecureStorageService con memoria caché O(1)
│   │   ├── theme/                            # Paleta Neo-Brutalist Slate/Emerald y tipografías
│   │   ├── utils/                            # Timezone GMT-5, DateTime, ICS RFC 5545, Detector Virtual
│   │   └── widgets/                          # Sistema Neo-Student Brutalism (Cards, Buttons, Badges)
│   │
│   └── features/                             # Módulos de funcionalidad (Feature-First Clean Architecture)
│       ├── auth/                             # Splash Screen optimizado (400ms), Onboarding y WebView SSO
│       ├── dashboard/                        # Inicio con próxima clase, atajo a Teams y fin de jornada
│       ├── ellucian/                         # Banner 9 SSB (Horario actual e Historial Académico multi-periodo)
│       ├── moodle/                           # Moodle (Multi-cuenta, QR Login, Tareas, Notas, Materiales)
│       │   ├── domain/utils/
│       │   │   ├── grade_calculator.dart     # Fórmula oficial 35/35/30, metas 14/16/18 y simulador final
│       │   │   └── moodle_qr_parser.dart     # Parser oficial de tokens QR de Moodle
│       │   └── presentation/
│       │       ├── screens/
│       │       │   ├── assignments_screen.dart # Tareas con filtros y botones QR
│       │       │   └── grade_calculator_screen.dart # Simulador "Con Cuánto Paso" con sliders interactivos
│       │       └── widgets/
│       │           ├── qr_share_checklist_dialog.dart # Generador QR con selección de tareas y temas
│       │           └── qr_import_scanner_modal.dart   # Escáner de cámara para importar checklist P2P
│       ├── profile/                          # Perfil de usuario y resumen académico
│       ├── schedule/                         # Horario semanal L-S, vista mensual y exportador a PNG
│       └── settings/                         # Ajustes, Modo Ahorro de Datos, selector Banner y multi-cuenta
│
└── test/                                     # Suite automatizada de pruebas (122 tests en total)
    ├── widget_test.dart                      # Smoke test de UI
    ├── visual/                               # Pruebas de integración visual y responsividad
    │   └── features_visual_integration_test.dart # 3 tests de pantalla completa sin RenderFlex overflow
    └── unit/                                 # 119 pruebas unitarias
        ├── grade_calculator_test.dart        # 12 tests del simulador interactivo y recuperación
        ├── qr_data_sharing_test.dart         # 2 tests de codificación/decodificación P2P
        ├── schedule_image_export_test.dart   # 15 tests de exportación de imagen de horario
        ├── moodle_multi_account_test.dart    # 6 tests de migración y aislamiento multi-cuenta
        ├── virtual_meeting_detector_test.dart # 10 tests de detección de clases virtuales
        └── ...                               # Tests de Banner, sincronización, base de datos y utilidades
```

---

## 2. Estado de Compleción por Módulo

| Módulo                 | Estado  | Métricas de Prueba                                                           |
| :--------------------- | :------ | :--------------------------------------------------------------------------- |
| `auth`                 | ✅ 100% | Splash Screen optimizado sin retrasos nativos de Android 12+                 |
| `dashboard`            | ✅ 100% | Próxima clase, fin de jornada, atajo virtual y widget nativo                 |
| `ellucian` (Banner 9)  | ✅ 100% | Horario actual + Historial académico multi-periodo (`AcademicHistoryScreen`) |
| `moodle` (Aulas)       | ✅ 100% | Multi-cuenta oficial, QR login, descarga offline de PDFs                     |
| `moodle` (Tareas & QR) | ✅ 100% | Tareas con estados + Compartición P2P de checklist vía código QR             |
| `moodle` (Simulador)   | ✅ 100% | Simulador interactivo "Con Cuánto Paso" con sliders y metas 14/16/18         |
| `schedule` (Horario)   | ✅ 100% | Horario semanal + Calendario mensual unificado + Exportador a PNG            |
| `settings`             | ✅ 100% | Modo Ahorro de Datos, gestión multi-cuenta, alertas y periodo Banner         |
