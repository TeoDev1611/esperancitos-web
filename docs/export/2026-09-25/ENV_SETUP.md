# ⚙️ Guía de Configuración del Entorno (ENV_SETUP)
## Versión de Pruebas: v1.4.0 (Build 240) — 2026-09-25

Instrucciones para compilar, generar artefactos y ejecutar la suite completa de pruebas de **Esperancitos**.

---

## 1. Prerrequisitos de Desarrollo

* **Flutter SDK:** $\ge 3.29.0$ (canal `stable`).
* **Dart SDK:** $\ge 3.7.0$.
* **Android Studio / SDK:**
  - Android SDK Platform 35.
  - Android SDK Build-Tools 35.0.0+.
  - JDK 17 (configurado como `JAVA_HOME`).
* **Dispositivo Físico o Emulador:** Android con depuración USB habilitada (probado en Motorola `ZY32MD8HSM` Android 14).

---

## 2. Comandos de Preparación y Compilación

```bash
# 1. Obtener dependencias
flutter pub get

# 2. Generar código de Drift SQLite y Riverpod
dart run build_runner build --delete-conflicting-outputs

# 3. Ejecutar análisis estático (debe retornar 0 issues)
flutter analyze

# 4. Ejecutar la suite completa de pruebas (122 pruebas)
flutter test

# 5. Ejecutar exclusivamente las pruebas de integración visual
flutter test test/visual/features_visual_integration_test.dart

# 6. Compilar APK para pruebas internas
flutter build apk --debug
```

---

## 3. Parámetros de Plataforma Android y Solución de Problemas

* **Splash Screen de Android 12+:**
  - El archivo `android/app/src/main/res/values-v31/styles.xml` tiene fijada la duración de la animación en `0` y el icono en `@drawable/transparent_splash`. No modificar estos parámetros para evitar que reaparezca la pantalla gris o el retardo nativo previo al arranque de Flutter.
* **Almacenamiento Seguro (Mocking en Tests):**
  - Para pruebas de widgets que involucran `SecureStorageService`, invocar `FlutterSecureStorage.setMockInitialValues({})` en el `setUp()` del archivo de test.
