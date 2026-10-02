# 💻 Guía de Configuración del Entorno (ENV_SETUP)

Instrucciones completas y reproducibles para clonar, configurar y ejecutar el proyecto **Esperancitos** desde cero en cualquier máquina de desarrollo (Windows, macOS o Linux).

---

## 1. Requisitos Previos del Sistema

Asegúrate de contar con las siguientes herramientas instaladas y configuradas en tu `PATH`:

| Herramienta | Versión Requerida | Comprobación en Terminal |
| :--- | :--- | :--- |
| **Flutter SDK** | `>= 3.27.0` (Canal `stable`) | `flutter --version` |
| **Dart SDK** | `>= 3.3.0 < 4.0.0` (Incluido con Flutter) | `dart --version` |
| **Java JDK** | OpenJDK 17 (`JAVA_HOME` apuntando al JDK 17) | `java -version` |
| **Android SDK** | API 34 o 35 con Build-Tools `>= 34.0.0` | `flutter doctor` |
| **Git** | `>= 2.30.0` | `git --version` |

---

## 2. Pasos Manuales Iniciales (Una Sola Vez)

### 2.1. Aceptar Licencias de Android SDK
Si estás configurando una máquina nueva o un entorno recién instalado, ejecuta:
```bash
flutter doctor --android-licenses
```
*Presiona `y` para aceptar todas las licencias pendientes de Google y Android SDK.*

### 2.2. Configuración de `JAVA_HOME`
El proyecto utiliza Gradle 8.x con plugins compatibles con Java 17. Asegúrate de que tu variable de entorno `JAVA_HOME` apunte a un JDK 17:
* **Windows (PowerShell):**
  ```powershell
  $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr" # O tu ruta a JDK 17
  ```
* **macOS / Linux:**
  ```bash
  export JAVA_HOME=$(/usr/libexec/java_home -v 17) # macOS
  # o export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 # Linux
  ```

---

## 3. Puesta en Marcha Paso a Paso

### Paso 1: Clonar y Acceder al Directorio del Proyecto
```bash
git clone <url-del-repositorio> Esperancitos
cd Esperancitos
```

### Paso 2: Descargar Dependencias de Flutter y Dart
Descarga todos los paquetes declarados en `pubspec.yaml`:
```bash
flutter pub get
```

### Paso 3: Generar el Código de la Base de Datos Drift (SQLite)
Esperancitos utiliza **Drift** para el almacenamiento local fuertemente tipado. El archivo `lib/core/database/app_database.g.dart` se genera automáticamente:
```bash
dart run build_runner build --delete-conflicting-outputs
```
> **Nota:** Si vas a desarrollar y modificar tablas en `lib/core/database/tables.dart`, puedes dejar corriendo el generador en modo escucha (*watch*):
> ```bash
> dart run build_runner watch --delete-conflicting-outputs
> ```

### Paso 4: Validar Calidad y Suite de Pruebas
Verifica que el entorno esté libre de errores y que las 66 pruebas pasen correctamente:
```bash
# 1. Análisis estático (debe reportar 0 issues)
flutter analyze

# 2. Pruebas unitarias y de widgets (deben pasar 66/66)
flutter test
```

---

## 4. Ejecución en Dispositivo Físico o Emulador

### 4.1. Preparar Dispositivo Android Físico
1. En tu teléfono Android, ve a **Ajustes > Acerca del teléfono** y presiona 7 veces sobre **Número de compilación** para activar las **Opciones de desarrollador**.
2. Entra a **Opciones de desarrollador** y activa:
   - **Depuración por USB** (*USB Debugging*).
   - *(Recomendado para Android 11+)* Si usas depuración inalámbrica, activa **Depuración inalámbrica**.
3. Conecta el teléfono a la computadora mediante cable USB y acepta el mensaje de autorización de huella digital RSA en la pantalla del dispositivo.
4. Verifica que Flutter reconozca el dispositivo:
   ```bash
   flutter devices
   ```

### 4.2. Ejecutar en Modo Debug
```bash
# Si solo hay un dispositivo conectado:
flutter run

# Si hay múltiples dispositivos, especifica el ID:
flutter run -d <DEVICE_ID>
```

### 4.3. Generar Instalador APK de Producción (Release)
Para generar un binario instalable directamente en dispositivos de estudiantes sin necesidad de computadoras conectadas:
```bash
flutter build apk --release
```
El archivo compilado se ubica en:
`build/app/outputs/flutter-apk/app-release.apk`

Instalar directamente en el teléfono conectado vía ADB:
```bash
adb install -r build/app/outputs/flutter-apk/app-release.apk
```

---

## 5. Permisos y Configuraciones en Dispositivos Reales

* **Permiso de Notificaciones (Android 13+ / API 33+):**  
  En el primer arranque, la aplicación presentará la pantalla de Onboarding solicitando el permiso `POST_NOTIFICATIONS`. Este permiso es imprescindible para recibir las alertas escalonadas (7d, 3d, 1d, 3h), el resumen matutino de las 06:30 AM y los avisos de nuevas notas publicadas.
* **Permiso de Alarmas Exactas (`USE_EXACT_ALARM`):**  
  El Manifest de la app ya incluye `android.permission.USE_EXACT_ALARM` de forma nativa para que las notificaciones previas al cierre de tareas se disparen con precisión de minuto incluso si el dispositivo entra en modo Doze.
* **Ahorro de Batería en Dispositivos OEM (Xiaomi, Huawei, Samsung):**  
  Para que el widget nativo de pantalla de inicio ("Próxima Clase") se actualice de forma continua al terminar cada clase, se recomienda marcar la app como *"Sin restricciones"* en los ajustes de ahorro de batería de la aplicación en el teléfono.
