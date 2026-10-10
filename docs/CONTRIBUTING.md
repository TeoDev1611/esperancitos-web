# 🤝 Guía de Contribución para Esperancitos

¡Gracias por tu interés en contribuir a **Esperancitos**! Este proyecto es desarrollado de forma comunitaria por y para estudiantes de la ESPE. Para mantener la calidad del código, la seguridad y la estabilidad, te pedimos seguir las siguientes directrices.

---

## 1. Reglas de Oro del Proyecto

1. **Privacidad y Seguridad Estricta:**
   - **NUNCA** persistas ni loguees contraseñas, tokens o cookies en `print()`, analytics ni registros de crash reporting.
   - Toda credencial o token debe almacenarse exclusivamente a través de `SecureStorageService` (Keychain / Keystore).
2. **Manejo de Errores Tipado con `Result<T>`:**
   - No lances excepciones no controladas en capas de dominio o datos. Todas las operaciones asíncronas deben retornar `Result<T>` (`Success<T>` o `Failure<T>` con un `AppFailure`).
3. **Offline-First Real:**
   - La UI nunca debe bloquearse esperando respuestas de red. Si una consulta falla o no hay conexión, se debe mostrar el dato cacheado en SQLite (Drift v6) acompañado de un `SyncStatusBanner`.
4. **Normalización de Zonas Horarias:**
   - Todo timestamp UNIX devuelto por Moodle debe convertirse a hora de Ecuador (`America/Guayaquil`) mediante `TimezoneUtils.parseUnixEpochToLocal()` antes de entrar a Drift.
5. **Aislamiento en Hilos Secundarios (Isolates):**
   - Cualquier procesamiento intensivo de JSON grande o renderizado de archivos (ej. `BannerScheduleParser`, generador `.ics`, exportador de imágenes) debe delegarse a `Isolate.run()` para proteger la fluidez de la interfaz.

---

## 2. Convenciones de Código y Estilo

- Seguir las guías oficiales de [Effective Dart](https://dart.dev/guides/language/effective-dart).
- **Nombres de archivos:** `snake_case.dart` (ej. `banner_schedule_parser.dart`).
- **Clases:** `UpperCamelCase` (ej. `MoodleSyncService`).
- **Imports:** Preferir package imports absolutos (`package:esperancitos/...`) para evitar discrepancias de rutas relativas.
- **Separación de capas (Feature-First Clean Architecture):**
  - `domain/`: Solo entidades y contratos de repositorio (Dart puro, sin dependencias de Flutter o plugins).
  - `data/`: Modelos DTOs, implementaciones de repositorio, clientes Dio y Drift.
  - `presentation/`: Widgets brutalistas, pantallas y Riverpod providers / notifiers.

---

## 3. Flujo de Trabajo y Comandos Esenciales

### Generación de Código (Drift / Build Runner)

Cada vez que agregues o modifiques tablas en `lib/core/database/tables.dart`, debes regenerar el archivo `app_database.g.dart`:

```bash
dart run build_runner build --delete-conflicting-outputs
```

### Análisis Estático (Linter)

Antes de enviar cualquier cambio, asegúrate de que el linter no reporte advertencias:

```bash
flutter analyze
```

> **Nota:** El proyecto exige **0 errores y 0 advertencias**.

### Ejecución de Pruebas Automatizadas

Todas las pruebas unitarias y de widgets deben pasar al 100%:

```bash
flutter test
```

> **Nota:** Actualmente la suite cuenta con **234 pruebas automatizadas** en 34 archivos de test.

### Validación de Contenido de Comunidad (Web / Astro)

Si agregas o modificas avisos, negocios o enlaces en el portal web (`src/content/`), valida los esquemas Zod y límites de tamaño con:

```bash
npm run validate:content
```

---

## 4. Checklist para Pull Requests (PR)

Antes de abrir un PR, verifica:

- [ ] `flutter analyze` pasa con 0 advertencias.
- [ ] `flutter test` pasa con todas las pruebas en verde (234/234).
- [ ] No hay credenciales, tokens ni URLs de prueba reales hardcodeadas.
- [ ] Todo registro de red se realiza con `ConnectionLogger` asegurando el enmascaramiento de datos sensibles.
- [ ] Se incluyeron pruebas unitarias para cualquier nueva función de negocio o parseo en `test/unit/`.
- [ ] Se actualizaron los documentos en `/docs` si se introdujo un nuevo endpoint, modelo de datos o funcionalidad del roadmap.
