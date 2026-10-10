# 📜 Registro de Cambios (CHANGELOG) de Esperancitos

## Versión de Pruebas: v1.4.0 (Build 240) — 2026-09-25

Historial cronológico completo de cambios implementados y verificados en el código fuente de **Esperancitos**, documentado a partir del registro del repositorio Git y de las suites de pruebas automatizadas ejecutadas (122 pruebas unitarias y de integración visual aprobadas).

---

## [Fase C] — Historial Académico Banner y Calendario Mensual Completo

**Commit:** `a316431` — _feat: Integracion completa de Multi-cuenta Moodle, Historial Academico Banner y Calendario Mensual_

- **Historial Académico Multi-Periodo de Banner 9 SSB:**
  - `lib/core/database/tables.dart` y `app_database.dart`:
    - Definición de tabla `BannerAcademicHistory` para persistir asignaturas cursadas, calificaciones oficiales, créditos, NRC y periodo académico de Banner.
  - `lib/features/ellucian/data/datasources/banner_academic_history_parser.dart`:
    - Parser seguro para respuestas JSON del endpoint `/StudentRegistrationSsb/ssb/registrationHistory/reset`.
  - `lib/features/ellucian/data/repositories/academic_history_repository_impl.dart`:
    - Implementación del repositorio con soporte offline-first y consultas reactivas por periodo.
  - `lib/features/ellucian/presentation/screens/academic_history_screen.dart`:
    - Interfaz visual con selector de periodos, promedio ponderado semestral y tarjetas detalladas por materia.
- **Calendario Mensual Unificado:**
  - `lib/features/schedule/presentation/widgets/monthly_calendar_view.dart`:
    - Integración de `table_calendar` con diseño Brutalista Dark Slate & Esmeralda.
    - Indicadores visuales de clases, tareas de Moodle y eventos por día.
    - Filtros por categoría (Todas, Clases, Tareas, Exámenes) y lista sincronizada de eventos diarios.

---

## [Fase D] — Eliminación del Native Splash Screen y Arranque Frío Instantáneo

**Objetivo:** Eliminar el retraso y la pantalla de carga con icono estático del sistema Android 12+ (`SplashScreenView`), manteniendo exclusivamente la animación de marca Flutter.

- **Configuración del Splash Nativo en Android:**
  - `android/app/src/main/res/drawable/transparent_splash.xml`:
    - Drawable transparente de 1x1 píxeles para reemplazar el icono nativo por defecto `@mipmap/ic_launcher`.
  - `android/app/src/main/res/values-v31/styles.xml`:
    - Configuración de `windowSplashScreenAnimatedIcon` con el drawable transparente.
    - Fija `windowSplashScreenAnimationDuration` a `0` para saltar cualquier retardo de transición.
    - Sincronización del color de fondo con la paleta de la aplicación (`#0B111E`).
  - `android/app/src/main/res/values/styles.xml`, `values-night/styles.xml` y `drawable/launch_background.xml`:
    - Fondo unificado a `#0B111E` sin elementos gráficos que produzcan parpadeos.
- **Mapeo en Kotlin (Android Framework):**
  - `android/app/src/main/kotlin/com/esperancitos/esperancitos/MainActivity.kt`:
    - Registro de listener `splashScreen.setOnExitAnimationListener { splashScreenView -> splashScreenView.remove() }` en `onCreate()`, forzando la remoción inmediata del splash nativo tan pronto Flutter pinta el primer frame.
- **Optimización de la Splash Screen de la Aplicación:**
  - `lib/features/auth/presentation/screens/splash_screen.dart`:
    - Reducción de tiempos de animación y verificación de credenciales a 400ms con transiciones fluidas hacia el Dashboard.

---

## [Fase E] — Simulador Interactivo "Con Cuánto Paso" (Calculadora ESPE)

**Objetivo:** Permitir a los estudiantes calcular y predecir en tiempo real la nota requerida en el Examen Final para aprobar la materia o alcanzar notas sobresalientes.

- **Lógica de Calificaciones ESPE:**
  - `lib/features/moodle/domain/utils/grade_calculator.dart`:
    - Incorporación de soporte para metas personalizadas de aprobación (`targetGrade`: 14.0 mínima, 16.0 notable, 18.0 sobresaliente).
    - Función `simulateFinal(p1, p2, simulatedFinal)` que proyecta el promedio definitivo en tiempo real:
      $$\text{Promedio} = (P_1 \times 0.35) + (P_2 \times 0.35) + (\text{Final} \times 0.30)$$
    - Detección automática del estado de Examen de Recuperación (`recoveryExamNeeded`), activada cuando el acumulado $P_1 + P_2 + \text{Final} < 14.0$ pero el estudiante cumple los requisitos reglamentarios.
    - 12 pruebas unitarias automatizadas en `test/unit/grade_calculator_test.dart`.
- **Interfaz de Usuario del Simulador:**
  - `lib/features/moodle/presentation/screens/grade_calculator_screen.dart`:
    - Selector de materias matriculadas con chips de 1 toque que autocompletan las notas existentes de Moodle en P1 y P2.
    - Barra segmentada de progreso que visualiza el acumulado $P_1 + P_2$ frente al umbral crítico de 14.0 puntos.
    - Selector de meta de aprobación con chips rápidos: Mínima (14.0), Notable (16.0) y Sobresaliente (18.0).
    - Sliders interactivos con botones de ajuste fino ($\pm 0.1$) y entrada numérica directa para Parcial 1 y Parcial 2.
    - Slider interactivo de simulación _"¿Y si saco esto en el Final?"_ con velocímetro visual de aprobación en vivo.
    - Diagnóstico contextual: _"¡Aprobado sin examen final!"_, _"Necesitas X.XX en el Final"_, o alerta de recuperación.

---

## [Fase F] — Modo de Ahorro de Datos Móviles (Offline-First Estricto)

**Objetivo:** Proteger el consumo de megas de los estudiantes en redes celulares evitando descargas pesadas y sincronizaciones no deseadas.

- **Almacenamiento y Estado Reactivo:**
  - `lib/core/storage/secure_storage_service.dart`:
    - Métodos `setDataSaverMode(bool)` e `isDataSaverMode()` respaldados en memoria y almacenamiento seguro.
  - `lib/core/providers/data_saver_provider.dart`:
    - Provider de Riverpod 3.0 (`Notifier<bool>`) para reaccionar globalmente al cambio de estado sin recargas.
- **Control en Ajustes:**
  - `lib/features/settings/presentation/screens/settings_screen.dart`:
    - Conmutador Brutalista con icono distintivo y panel informativo verde esmeralda al activarse.
    - Priorización de la base de datos local SQLite (Drift) y supresión de precargas multimedia en segundo plano.

---

## [Fase G] — Intercambio de Tareas y Checklist Estudiantil vía Código QR

**Objetivo:** Permitir a compañeros de clase pasarse checklists de tareas, talleres y repasos directamente de teléfono a teléfono sin requerir internet ni servidores intermediarios.

- **Servicio de Codificación y Decodificación:**
  - `lib/core/services/qr_data_sharing_service.dart`:
    - Formato de carga ultra-compacto (`esp://qr?d=...`) con compresión de claves JSON (`t`: título, `s`: materia, `it`: ítems, `n`: nombre, `d`: dueDate, `p`: prioridad) y codificación Base64 URL-safe.
    - Capacidad de fallback a JSON estándar para compatibilidad con escáneres genéricos.
    - Método `importChecklistAsAssignments()` que inserta los ítems recibidos como tareas personalizadas en la base de datos Drift.
    - Pruebas unitarias completas en `test/unit/qr_data_sharing_test.dart`.
- **Componentes de Interfaz de Usuario:**
  - `lib/features/moodle/presentation/widgets/qr_share_checklist_dialog.dart`:
    - Generador de código QR de alto contraste mediante `qr_flutter` (versión 4.1.0).
    - Selección múltiple de tareas existentes o creación dinámica de listas temáticas personalizadas (ej. _"Repaso Examen 2"_).
    - Botón de copiado de datos al portapapeles y retroalimentación háptica.
  - `lib/features/moodle/presentation/widgets/qr_import_scanner_modal.dart`:
    - Escáner de cámara en vivo con `mobile_scanner`, marco delimitador Brutalista y linterna.
    - Modal de confirmación previa con previsualización de tareas a importar e inserción de 1 toque.
  - `lib/features/moodle/presentation/screens/assignments_screen.dart`:
    - Barra de herramientas superior con botones de acceso rápido _"Compartir QR"_ y _"Escanear QR"_.

---

## [Fase H] — Suite de Pruebas de Integración Visual y Responsividad

**Objetivo:** Garantizar cero errores de desbordamiento de renderizado (`RenderFlex overflow`) en pantallas estrechas (desde 288dp de ancho) y validar la estabilidad de todos los componentes nuevos.

- **Pruebas de Integración Visual:**
  - `test/visual/features_visual_integration_test.dart`:
    - **Test 1:** Renderizado, interacción con chips y actualización de notas en `GradeCalculatorScreen` sin excepciones de layout.
    - **Test 2:** Renderizado completo del diálogo generador de QR `QrShareChecklistDialog` con `QrImageView` en viewport estrecho (720x1600 @ 2.0x = 360dp y 288dp).
    - **Test 3:** Renderizado y conmutación del Modo Ahorro de Datos en `SettingsScreen`.
- **Correcciones de Layout en Pantallas Angostas:**
  - `grade_calculator_screen.dart`:
    - Contenedor de acumulado P1+P2 protegido con `Expanded` y `TextOverflow.ellipsis`.
    - Fila del simulador del Examen Final protegida con `Expanded` en icono y textos.
    - Slider interactivo de notas rediseñado con `Expanded` en la columna descriptiva para evitar colisión con los botones $\pm$.
  - `qr_share_checklist_dialog.dart`:
    - Cabecera y subtítulo adaptados con `Expanded` dentro de filas horizontales.
    - Fila de conteo de tareas y botón de alternancia ajustados para no exceder los márgenes en pantallas de 288dp.
  - `settings_screen.dart`:
    - Etiqueta de _"Periodo Académico Banner"_ envuelta en `Expanded` para prevenir desbordamientos con insignias largas.

---

## [Fase J] — Humanización y Usabilidad de Textos (Microcopy Directo y Sin Tecnicismos)

**Objetivo:** Eliminar lenguaje rebuscado, pomposo o hiper-técnico (ej. _"experiencia politécnica"_, _"ritmo militar y tecnológico"_, _"caché SQLite"_, _"Banner 9 ERP"_, _"tokens cifrados"_, _"payloads"_) y reemplazarlo por descripciones sencillas, claras y al grano pensadas para el uso diario de los estudiantes.

- **Pantalla de Tareas (`assignments_screen.dart`):**
  - Subtítulo dinámico: Reemplazado _"Mantén el ritmo al día"_ por _"¡Todo al día! No tienes tareas urgentes por ahora."_
  - Encabezados y filtros: _"Entregas"_ $\rightarrow$ _"Tareas"_, _"activas"_ $\rightarrow$ _"por hacer"_, _"Completadas"_ $\rightarrow$ _"Listas"_.
  - Métrica de avance: _"PROGRESO: X% AL DÍA"_ $\rightarrow$ _"TU AVANCE: X%"_.
- **Pantalla de Perfil (`profile_screen.dart`):**
  - Título y badges: _"PERFIL ESTUDIANTE"_ $\rightarrow$ _"MI PERFIL"_, _"ESTUDIANTE REGULAR ACTIVO"_ $\rightarrow$ _"ESTUDIANTE ACTIVO"_.
  - Secciones: _"RENDIMIENTO ACADÉMICO"_ $\rightarrow$ _"TUS CLASES Y TAREAS"_, _"SINCRONIZACIÓN INSTITUCIONAL"_ $\rightarrow$ _"ESTADO DE TUS CUENTAS"_, _"GESTIÓN RÁPIDA"_ $\rightarrow$ _"ATAJOS"_.
  - Exportar calendario: Mensaje con explicaciones técnicas de formato iCalendar y KB reemplazado por aviso directo de copiado para la app de calendario.
- **Ajustes y Configuración (`settings_screen.dart`):**
  - Diálogo de cerrar sesión: Eliminada mención a _"tokens cifrados y cookies de Banner"_; reemplazado por _"Al cerrar sesión se borrarán de tu teléfono los datos de tu horario, tareas y notas guardadas para proteger tu privacidad."_
  - Almacenamiento: _"Caché de documentos y guías"_ $\rightarrow$ _"Archivos y documentos"_, _"Limpiar caché local"_ $\rightarrow$ _"Liberar espacio temporal"_.
  - Modo Ahorro de Datos: Explicación de base de datos SQLite cambiada a _"Modo Ahorro activo: Solo usa lo guardado en tu teléfono y no descarga archivos pesados con tus datos."_
  - Lema del footer: _"Diseñado para el ritmo militar y tecnológico"_ $\rightarrow$ _"Tu vida universitaria al día y sin complicaciones"_.
- **Inicio de Sesión y Dashboard (`moodle_login_screen.dart`, `dashboard_screen.dart`, `app_header.dart`):**
  - Mensaje de bienvenida: _"Horario Banner 9 y Moodle sincronizados"_ $\rightarrow$ _"Clases, tareas y notas siempre al día."_
  - Créditos del footer: _"Desarrollado con orgullo por y para estudiantes ESPE"_ $\rightarrow$ _"Hecho por y para estudiantes de la ESPE"_.
  - Notificaciones de estado: Mensajes de error y datos guardados adaptados para que cualquier usuario los comprenda inmediatamente sin términos de redes o bases de datos.

---

## [Fase K] — Resumen de Calidad y Cobertura

- **Tests Automatizados:** **122 pruebas pasando al 100%** (119 unitarias y de integración + 3 visuales de pantalla completa).
- **Análisis Estático de Código (`flutter analyze`):** **0 errores, 0 advertencias, 0 lints**.
- **Estado de Plataforma:** Compatible con Android 5.0 (API 21) hasta Android 15 (API 35), Java 17 con desugaring activado.
