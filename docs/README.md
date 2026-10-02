# 🎓 Esperancitos

> **Cliente estudiantil independiente para la Universidad de las Fuerzas Armadas ESPE**  
> *Combina el horario institucional de Banner 9 con las tareas, notas y materiales de Moodle en una experiencia offline-first, moderna y sin fricciones.*

---

## 📌 ¿Qué es Esperancitos?

**Esperancitos** es una aplicación móvil desarrollada de forma independiente por y para estudiantes de la ESPE. Resuelve la dispersión de información académica en dos sistemas desconectados:
1. **Ellucian Banner 9:** Horario de clases, docentes y aulas (mediante autenticación federada SAML en WebView e intercepción directa del JSON nativo de Banner 9 SSB en `/registrationHistory/reset`).
2. **Moodle:** Cursos, tareas, fechas límite, materiales de estudio y calificaciones en 4 campus institucionales (mediante Web Services REST nativos, offline-first con SQLite/Drift v2).

La aplicación es de **arquitectura zero-backend**: no requiere servidores intermedios, bases de datos compartidas ni credenciales de terceros. Las peticiones se realizan de forma directa y cifrada desde el dispositivo del estudiante hacia los servidores de la universidad.

---

## ✨ Características Principales

* 🟢 **Dashboard en Vivo:** Tarjeta destacada con la clase activa en tiempo real con punto pulsante esmeralda y carrusel horizontal de tareas urgentes con contador regresivo.
* 🎓 **Malla Curricular Inteligente ("Mi Malla" - FEAT-16):** Plan de estudios completo para las 23 carreras oficiales de la ESPE 100% offline. Visualización en grilla semestral y lista continua, auto-detección de materias cursando desde el horario de Banner y Moodle, inferencia de prerrequisitos aprobados, desglose de "Materias que desbloquea", aprobación masiva por semestre, y proyección de fecha de graduación.
* 📅 **Agenda Escolar y Calendario Unificado (FEAT-15):** Vistas integradas de Día, Semana y Mes que fusionan clases de Banner 9, entregas de Moodle y elementos personales del estudiante (eventos, recordatorios puntuales y checklists con subtareas).
* 🔗 **Atajo Directo a Clase Virtual (FEAT-01):** Detección automática de enlaces a Microsoft Teams, Zoom y Google Meet en descripciones de materias con botón directo *"Unirse a clase virtual"*.
* 📱 **Widget de Android "Próxima Clase" (FEAT-02):** Widget nativo para la pantalla de inicio del teléfono que muestra la materia, aula y hora de la siguiente clase sin abrir la app.
* 🎨 **2 Esquemas de Tema Neo-Student Brutalism Oscuros:** Selector instantáneo entre **Oscuro Slate** (azul/gris espacial con acentos esmeralda) y **Deep Negro OLED** (negro puro para ahorro extremo de energía), con bordes sólidos y fuentes empaquetadas `Outfit` e `Inter`.
* 🛡️ **Control de Cursos y Privacidad:** Opción para ocultar cursos tutoriales (como el *"Manual de registro en Smowl"*) y modo de ahorro de datos celulares.
* 📝 **Tareas Offline-First:** Pestañas de Pendientes, Completadas y Atrasadas con retroalimentación háptica en swipe-to-dismiss y opción de deshacer.
* 📚 **Explorador y Descarga de Materiales (FEAT-08):** Navegación offline por las carpetas y temas de Moodle para descargar diapositivas, PDFs y guías de laboratorio al almacenamiento local con visualización vía `open_filex`.
* 📡 **Telemetría y Diagnóstico de Conexión:** Consola de registros en tiempo real (`ConnectionLogger`) con enmascaramiento seguro de tokens y visor modal (`ConnectionLogViewerModal`) para depuración y soporte.
* ⏰ **Alarma de Tareas con Pantalla Completa (FEAT-17):** Alarma sonora en bucle con vibración y pantalla interactiva `AlarmRingScreen` antes de la fecha límite de entrega, configurable (30 min a 24 horas o personalizada), con posposición de 10 minutos, navegación directa al detalle de la tarea y reprogramación idempotente.
* ⏰ **Alertas Escalonadas y Resumen Matutino (FEAT-03):** Notificaciones locales programadas a los 7 días, 3 días, 24 horas y 3 horas antes del cierre de entrega, junto con un resumen diario a las 06:30 AM con las clases y tareas del día.
* 🔔 **Alerta de Nuevas Calificaciones (FEAT-09):** Detección automática de cambios en el libro de calificaciones de Moodle para avisarte apenas un docente sube una nota.
* 🧮 **Simulador "¿Con Cuánto Paso?" (FEAT-05):** Sliders interactivos con cálculo instantáneo de la nota mínima necesaria en el examen final o predicción de notas según la fórmula institucional 35% P1, 35% P2 y 30% Final.
* 📢 **Comunidad y Directorio Estudiantil (FEAT-19):** Tablón de avisos comunitarios con caducidad automática, directorio de emprendimientos estudiantiles por campus con búsqueda en tiempo real, catálogo de enlaces institucionales útiles y verificación de nuevas versiones (.apk) sin intermediarios ni tiendas privativas, respaldado por una API estática JSON v1 ultraligera generada en build-time.
* 🔒 **Seguridad y Privacidad:** Las contraseñas nunca se guardan; los tokens y cookies se cifran en **Android Keystore** o **iOS Keychain**. Cierre de sesión seguro que vacía completamente la base de datos local SQLite.

---

## 🛠️ Requisitos del Sistema

* **Flutter SDK:** `>= 3.27.0` (Canal Stable).
* **Dart SDK:** `>= 3.3.0 < 4.0.0`.
* **Android:** Android 5.0 (API nivel 21) o superior. Recomendado Android 13+ (API 33+).
* **Java:** JDK 17 (configurado en `JAVA_HOME`).
* **iOS (Opcional):** iOS 13+ (requiere macOS y Xcode para compilación).

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar o acceder al repositorio
```bash
cd Esperancitos
```

### 2. Instalar dependencias
```bash
flutter pub get
```

### 3. Generar código de Drift (Base de datos SQLite)
Drift requiere generar el archivo `app_database.g.dart`:
```bash
dart run build_runner build --delete-conflicting-outputs
```

### 4. Ejecutar pruebas automatizadas
```bash
flutter test
# 234/234 tests aprobados con 100% de éxito en 34 suites de prueba
```

### 5. Correr en dispositivo físico o emulador
```bash
# Ver dispositivos conectados
flutter devices

# Ejecutar en modo debug
flutter run
```

---

## 📱 Distribución e Instalación en Dispositivos

Al ser un cliente estudiantil no oficial que interactúa con la infraestructura de la universidad mediante Web Services y parseo de sesiones web, **no está destinado a ser publicado en Google Play Store ni Apple App Store** (por políticas de marca institucional y términos de uso de Banner).

### Distribución en Android (Recomendada)
1. Generar el archivo instalador APK:
   ```bash
   flutter build apk --release
   ```
2. El archivo `.apk` generado se encuentra en:  
   `build/app/outputs/flutter-apk/app-release.apk`
3. Instalar directamente en tu teléfono mediante cable USB (`adb install`) o compartiendo el archivo a compañeros vía GitHub Releases o mensajería privada activando "Instalar apps de fuentes desconocidas".

---

## 📂 Documentación Técnica en `/docs`

Para profundizar en la arquitectura, integración de APIs, auditoría técnica y roadmap, consulta los documentos técnicos:

* [ARCHITECTURE.md](ARCHITECTURE.md): Arquitectura Clean Architecture, diagrama Mermaid y flujo de datos.
* [API.md](API.md): Documentación de endpoints de Moodle Web Services (4 campus, launch.php) y estructura JSON de Banner 9 SSB.
* [COMMUNITY_API.md](COMMUNITY_API.md): Especificación del contrato API v1 de comunidad (avisos, negocios, enlaces, update), flujo editorial y políticas de privacidad.
* [AUDIT.md](AUDIT.md): Auditoría completa de código, seguridad, rendimiento y compilación.
* [ROADMAP.md](ROADMAP.md): Catálogo de 14 funcionalidades propuestas y estado de implementación.
* [PLAN.md](PLAN.md): Plan de implementación original y desglose de fases.
* [WALKTHROUGH.md](WALKTHROUGH.md): Bitácora técnica y resumen funcional de las fases implementadas.
* [CONTRIBUTING.md](CONTRIBUTING.md): Guía de contribución, estilo de código y ejecución de tests.
* [Export de Estado Actual](export/2026-09-24/): Snapshot completo de estado, changelog, TODOs, árbol de dependencias y configuración.

