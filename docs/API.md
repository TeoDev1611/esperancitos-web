# 📡 Especificación de APIs e Integraciones Externas

Esperancitos se comunica directamente con dos sistemas institucionales independientes: **Moodle Web Services** y **Ellucian Banner 9 SSB**. A continuación se documentan los contratos de comunicación, endpoints reales, parámetros, estructuras y ejemplos de respuesta descubiertos e implementados.

---

## 1. Módulo Moodle: Web Services REST Oficiales

Las llamadas a Moodle se realizan mediante peticiones HTTP REST con formato de respuesta JSON (`moodlewsrestformat=json`).

### 1.1. Soporte Multi-Campus (4 Campus Oficiales)
La ESPE distribuye su entorno virtual en 4 plataformas Moodle independientes según la modalidad y nivel del estudiante:

| Campus | Host Oficial | Base URL |
| :--- | :--- | :--- |
| **Presencial** (Default) | `micampus.espe.edu.ec` | `https://micampus.espe.edu.ec` |
| **En Línea** | `micampusvirtual.espe.edu.ec` | `https://micampusvirtual.espe.edu.ec` |
| **Postgrado** | `micampus2.espe.edu.ec` | `https://micampus2.espe.edu.ec` |
| **Nivelación** | `micampus1.espe.edu.ec` | `https://micampus1.espe.edu.ec` |

A partir de la versión 3, Esperancitos implementa soporte **Multi-Cuenta nativo para Moodle**. El usuario puede mantener vinculadas simultáneamente cuentas de distintos campus (ej. Presencial y Postgrado) o añadir nuevas cuentas desde Ajustes > Cuentas de Moodle. Cada cuenta almacena sus credenciales y datos de forma aislada por `moodleAccountId`, sin borrados destructivos al alternar de cuenta.

---

### 1.2. Flujo de Autenticación SSO Institucional (`launch.php`)
Debido a que la ESPE utiliza federación de identidad institucional (Microsoft Azure AD / SAML), el método estándar de inicio de sesión no solicita contraseñas directamente en la aplicación. En su lugar, utiliza el mecanismo oficial de Moodle Mobile:

* **Método:** `GET` (cargado en WebView)
* **URL:** `https://<campus-base-url>/admin/tool/mobile/launch.php?service=moodle_mobile_app&passport=<random>&urlscheme=moodlemobile`
* **Flujo:**
  1. El usuario inicia sesión en la página web institucional con sus credenciales y MFA de Microsoft.
  2. Moodle valida la sesión y emite una redirección al esquema personalizado:
     ```text
     moodlemobile://token=<base64-payload>
     ```
  3. `MoodleLaunchUrlParser` intercepta la URL antes de que el WebView falle.
  4. La carga útil Base64 decodifica al formato:
     ```text
     siteid:::token
     # o siteid:::token:::privatetoken
     ```
  5. La app extrae el `token` y lo guarda cifrado en `FlutterSecureStorage` (Android Keystore / iOS Keychain).

#### Alternativa Directa (`token.php` para cuentas locales)
* **Método:** `POST`
* **URL:** `https://<campus-base-url>/login/token.php`
* **Cuerpo (Form-Data):** `username`, `password`, `service=moodle_mobile_app`
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "token": "4a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
    "privatetoken": "..."
  }
  ```

---

### 1.2.B. Login Oficial por Código QR (`tool_mobile_get_tokens_for_qr_login`)
Mecanismo oficial de Moodle Mobile para inicio de sesión sin ingresar credenciales, escaneando el código QR generado en **Preferencias > App para dispositivos móviles**.

* **Esquema del QR:** `moodlemobile://<campus-url>?qrlogin=<token_un_solo_uso>&userid=<userid>` (válido por 10 minutos).
* **Endpoint:** `POST https://<campus-base-url>/lib/ajax/service-nologin.php`
* **Fallback Endpoint:** `POST https://<campus-base-url>/lib/ajax/service-nologin.php?info=tool_mobile_get_tokens_for_qr_login` (si el endpoint estándar rechaza la llamada).
* **Header Obligatorio:** `User-Agent` conteniendo `"MoodleMobile"` (ej. `"MoodleMobile Esperancitos/1.0.0"`). Si falta, Moodle rechaza con error `apprequired`.
* **Cuerpo JSON:**
  ```json
  [
    {
      "index": 0,
      "methodname": "tool_mobile_get_tokens_for_qr_login",
      "args": {
        "qrloginkey": "8dfa2b...",
        "userid": 48215
      }
    }
  ]
  ```
* **Respuesta Exitosa (200 OK):**
  ```json
  [
    {
      "error": false,
      "data": {
        "token": "3a8c1f9e2d...",
        "privatetoken": "..."
      }
    }
  ]
  ```
* **Errores Controlados:** `invalidkey` (clave expirada o ya utilizada), `qrcodedisabled` (QR deshabilitado por el campus), `servicenotavailable` (servicio móvil no activo).

---

### 1.3. Información del Sitio y del Usuario (`core_webservice_get_site_info`)
**Obligatorio ejecutar como primera llamada tras autenticarse.** Devuelve el `userid` numérico del estudiante necesario para filtrar las materias y notas, además de validar que el token siga activo.

* **Método:** `POST` / `GET`
* **URL:** `https://<campus-base-url>/webservice/rest/server.php`
* **Parámetros:**
  * `wstoken`: `{token}`
  * `wsfunction`: `core_webservice_get_site_info`
  * `moodlewsrestformat`: `json`
* **Respuesta Ejemplo:**
  ```json
  {
    "sitename": "Campus Virtual ESPE",
    "username": "estudiante_demo",
    "firstname": "Estudiante",
    "lastname": "Politécnico",
    "fullname": "Estudiante Politécnico",
    "userid": 48215,
    "userpictureurl": "https://micampus.espe.edu.ec/pluginfile.php/...",
    "functions": [
      { "name": "core_enrol_get_users_courses", "version": "2022112800" },
      { "name": "mod_assign_get_assignments", "version": "2022112800" },
      { "name": "core_course_get_contents", "version": "2022112800" }
    ]
  }
  ```

---

### 1.4. Cursos Matriculados (`core_enrol_get_users_courses`)
Retorna los cursos en los cuales el estudiante está matriculado en el periodo lectivo activo.

* **Método:** `GET`
* **Parámetros:**
  * `wstoken`: `{token}`
  * `wsfunction`: `core_enrol_get_users_courses`
  * `userid`: `48215`
  * `moodlewsrestformat`: `json`
* **Respuesta Ejemplo:**
  ```json
  [
    {
      "id": 14205,
      "shortname": "ESTRUCTURA_DATOS_8412",
      "fullname": "Estructura de Datos y Algoritmos (NRC 8412)",
      "summary": "Clases virtuales en https://teams.microsoft.com/l/meetup-join/demo-link-reunion",
      "startdate": 1778562000
    },
    {
      "id": 14210,
      "shortname": "FISICA_CLASICA_5201",
      "fullname": "Física Clásica (NRC 5201)",
      "summary": "<p>Enlace de Zoom: https://cedia.zoom.us/j/123456789</p>",
      "startdate": 1778562000
    }
  ]
  ```

---

### 1.5. Tareas por Curso (`mod_assign_get_assignments`)
Lista las asignaciones y deberes configurados por los docentes para los cursos matriculados.

* **Método:** `GET`
* **Parámetros:**
  * `wstoken`: `{token}`
  * `wsfunction`: `mod_assign_get_assignments`
  * `courseids[0]`: `14205`
  * `courseids[1]`: `14210`
  * `moodlewsrestformat`: `json`
* **Respuesta Ejemplo:**
  ```json
  {
    "courses": [
      {
        "id": 14205,
        "fullname": "Estructura de Datos y Algoritmos",
        "assignments": [
          {
            "id": 89412,
            "cmid": 156203,
            "name": "Informe de Laboratorio: Árboles B+",
            "intro": "<p>Subir en formato PDF antes de la medianoche.</p>",
            "duedate": 1789966799
          }
        ]
      }
    ]
  }
  ```
  > **Nota de Zona Horaria:** El valor `duedate` es un entero UNIX en segundos. La aplicación lo normaliza explícitamente a hora local de Ecuador (`America/Guayaquil` GMT-5) con `TimezoneUtils` antes de persistirlo en Drift.

---

### 1.6. Estado de Entrega en Servidor (`mod_assign_get_submission_status`)
Verifica si el estudiante ya realizó la entrega de una tarea.
* **Optimización de Rendimiento (ALTO-01):** Estas consultas se ejecutan en **lotes paralelos de 4 tareas concurrentes** (`_chunkSize = 4` con `Future.wait`) para evitar sobrecargar la conexión móvil o el servidor de Moodle.

* **Método:** `GET`
* **Parámetros:**
  * `wstoken`: `{token}`
  * `wsfunction`: `mod_assign_get_submission_status`
  * `assignid`: `89412`
  * `moodlewsrestformat`: `json`
* **Respuesta Ejemplo:**
  ```json
  {
    "lastattempt": {
      "submission": {
        "id": 99214,
        "userid": 48215,
        "status": "submitted"
      }
    }
  }
  ```

---

### 1.7. Calificaciones de Usuario (`gradereport_user_get_grade_items`)
Obtiene las notas parciales registradas en el libro de calificaciones del curso para alimentar la Calculadora de Aprobación y el sistema de alertas de nuevas notas (FEAT-09).

* **Método:** `GET`
* **Parámetros:**
  * `wstoken`: `{token}`
  * `wsfunction`: `gradereport_user_get_grade_items`
  * `courseid`: `14205`
  * `userid`: `48215`
  * `moodlewsrestformat`: `json`
* **Respuesta Ejemplo:**
  ```json
  {
    "usergrades": [
      {
        "courseid": 14205,
        "gradeitems": [
          {
            "id": 105,
            "itemname": "Primer Parcial",
            "itemtype": "category",
            "gradeformatted": "16.50",
            "graderaw": 16.5,
            "grademax": 20.0,
            "percentageformatted": "82.50 %"
          }
        ]
      }
    ]
  }
  ```

---

### 1.8. Contenidos y Materiales de Curso (`core_course_get_contents` — FEAT-08)
Permite listar las secciones, recursos y archivos adjuntos (PDFs, presentaciones, diapositivas) subidos por los profesores al aula virtual.

* **Método:** `GET`
* **Parámetros:**
  * `wstoken`: `{token}`
  * `wsfunction`: `core_course_get_contents`
  * `courseid`: `14205`
  * `moodlewsrestformat`: `json`
* **Respuesta Ejemplo:**
  ```json
  [
    {
      "id": 7820,
      "name": "Unidad 1: Estructuras de Datos Avanzadas",
      "modules": [
        {
          "id": 45102,
          "name": "Guía de Estudio - Árboles B+.pdf",
          "modname": "resource",
          "contents": [
            {
              "type": "file",
              "filename": "Guia_Arboles_Bplus.pdf",
              "filesize": 2048576,
              "fileurl": "https://micampus.espe.edu.ec/webservice/pluginfile.php/123/mod_resource/content/1/Guia_Arboles_Bplus.pdf",
              "mimetype": "application/pdf"
            }
          ]
        }
      ]
    }
  ]
  ```

---

## 2. Módulo Ellucian Banner 9 SSB (Horario de Clases)

El módulo de horario interactúa con el sistema de autoservicio de Banner 9 SSB mediante autenticación federada SAML y extracción directa de datos en JSON estructurado.

### 2.1. Host y Flujo de Navegación
* **Host Oficial:** `registrop.espe.edu.ec`
* **Flujo de Autenticación:**  
  1. Inicio en portal central: `https://loginprod.espe.edu.ec/cas/login`
  2. Redirección y federación SAML vía `https://*.elluciancloud.com`
  3. Establecimiento de sesión en `https://registrop.espe.edu.ec/StudentRegistrationSsb`

### 2.2. Endpoints Reales de Banner 9 SSB

#### 2.2.1. Listado de Periodos Académicos
* **Método:** `GET` (mediante `fetch()` en JavaScript interno del WebView)
* **URL:** `https://registrop.espe.edu.ec/StudentRegistrationSsb/ssb/classRegistration/getTerms?offset=1&max=20`  
  *(Con alias espejo: `/ssb/classSearch/getTerms?offset=1&max=20`).*
* **Respuesta:** Arreglo JSON de periodos:
  ```json
  [
    { "code": "202651", "description": "ABRIL 2026 - AGOSTO 2026" },
    { "code": "202510", "description": "OCTUBRE 2025 - FEBRERO 2026" },
    { "code": "202420", "description": "OCTUBRE 2024 - FEBRERO 2025" }
  ]
  ```

#### 2.2.2. Extracción de Materias por Periodo (Historial Académico y Horario)
* **Método:** `GET`
* **Endpoint Primario:** `https://registrop.espe.edu.ec/StudentRegistrationSsb/ssb/registrationHistory/reset?term=<periodo>`
* **Endpoint Alternativo (Eventos de Calendario):** `https://registrop.espe.edu.ec/StudentRegistrationSsb/ssb/registration/getRegistrationEvents?term=<periodo>`
* **Cabeceras HTTP Anti-Caché Obligatorias:**
  Para evitar que proxies institucionales, el WebView o la capa HTTP de Dio devuelvan horarios obsoletos tras cambios de aula o matrícula, toda petición remota a Banner incluye:
  ```http
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0
  ```
* **Cálculo y Resolución Dinámica de Periodo (`term`):**
  La aplicación no utiliza un código de periodo hardcodeado. Al autenticarse y al sincronizar, consulta dinámicamente `/ssb/classSearch/getTerms`, ordena los códigos numéricamente de forma descendente y selecciona el periodo activo más reciente. Si el usuario selecciona manualmente un periodo en Ajustes, se persiste en `SecureStorageService` (`banner_term_code`) y se valida contra la lista del servidor antes de su uso.
* **Comportamiento:** Devuelve **únicamente** las asignaturas registradas en ese periodo específico, no el acumulado.
* **Mecanismo de Extracción Multi-Periodo en WebView:**
  Dado que las cookies de sesión son `HttpOnly` y están asociadas al contexto del navegador, la app inyecta una función JavaScript interna en el WebView que ejecuta:
  ```javascript
  (async function() {
    try {
      const res = await fetch('https://registrop.espe.edu.ec/StudentRegistrationSsb/ssb/registrationHistory/reset?term=' + term, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const text = await res.text();
      BannerDataChannel.postMessage(JSON.stringify({
        status: res.status,
        contentType: res.headers.get('content-type') || '',
        body: text
      }));
    } catch (err) {
      BannerDataChannel.postMessage(JSON.stringify({
        status: 0,
        contentType: 'error',
        body: String(err)
      }));
    }
  })();
  ```

---

### 2.3. Estructura Real del JSON de Banner 9
El endpoint responde con un objeto raíz que contiene el arreglo `registrations`:
```json
{
  "registrations": [
    {
      "courseReferenceNumber": "8412",
      "subject": "ITEC",
      "courseNumber": "3020",
      "courseTitle": "ESTRUCTURA DE DATOS Y ALGORITMOS &amp; LABORATORIO",
      "termDescription": "OCTUBRE 2024 - FEBRERO 2025",
      "grade": "Matriculado",
      "meetingTimes": [
        {
          "monday": true,
          "tuesday": false,
          "wednesday": true,
          "thursday": false,
          "friday": false,
          "saturday": false,
          "sunday": false,
          "beginTime": "0700",
          "endTime": "0859",
          "buildingDescription": "Edificio Central de Ingenier&iacute;a",
          "room": "Lab-304",
          "startDate": "28-Oct-2024",
          "endDate": "21-Feb-2025",
          "instructors": [
            {
              "firstName": "VALENCIA",
              "lastName": "MARCO",
              "primary": true
            }
          ]
        }
      ]
    }
  ]
}
```

### 2.4. Reglas de Normalización del Parser (`BannerScheduleParser`)
1. **Días Booleanos:** Cada entrada en `meetingTimes` con múltiples banderas de días en `true` genera una reunión individual por cada día activo. Entradas sin días activos son descartadas del horario principal.
2. **Formato de Horas y Relleno de 3 Dígitos:** Banner serializa horas matutinas tempranas sin cero a la izquierda (ej. `"700"` en vez de `"0700"`). El parser normaliza con `raw.padLeft(4, '0')` asegurando que `"700"` $\rightarrow$ `"07:00"` sin descartar clases matutinas.
3. **Corrección de Fin de Hora:** Banner almacena la hora de fin con un minuto de desfase (ej. `0859` o `1859`). El parser incrementa automáticamente un minuto (`0859` $\rightarrow$ `09:00`, `1859` $\rightarrow$ `19:00`).
4. **Decodificación de Entidades HTML:** Los títulos de materias y nombres de docentes con acentos o caracteres especiales (ej. `&Iacute;`, `&Ntilde;`, `&amp;`) son decodificados mediante `html_unescape`.
5. **Normalización a Title Case:** Los nombres de docentes en mayúsculas sostenidas se transforman a formato amigable (ej. `VALENCIA MARCO` $\rightarrow$ `Marco Valencia`).
6. **Fechas con Meses en Inglés:** Las fechas `startDate` y `endDate` vienen con nombres de mes en inglés (`28-Oct-2024`, `21-Feb-2025`); el parser resuelve los meses mediante un mapeo directo de cadenas a enteros sin depender del locale del sistema.
7. **Deduplicación:** Se genera una clave compuesta `CRN + Día + HoraInicio` para prevenir duplicaciones en inscripciones mixtas.
8. **Detección Estricta de Sesión Expirada:** Si el servidor responde con HTML de login, redirección HTTP o contiene `<form action="...login">`, se emite `Failure(SessionExpiredFailure())`. Crucialmente:
   - **No se borra la caché existente:** Los datos locales en SQLite (`EllucianScheduleCache`) permanecen intactos.
   - **No se enmascara como éxito:** No devuelve `Success` falso con lista vacía ni datos viejos; emite `SessionExpiredFailure` para que el `SyncOrchestrator` reporte advertencia accionable ("Sesión caducada en Banner") y muestre el botón de reconexión.
9. **Protección Anti-Vaciado (`forceClearIfEmpty`):** Si un endpoint responde con una lista vacía de clases de forma inesperada o por fallo parcial, `AppDatabase.saveSchedule` no ejecuta `delete(ellucianScheduleCache)` a menos que se indique explícitamente `forceClearIfEmpty: true`, protegiendo el horario del estudiante ante fallos transitorios.
10. **Procesamiento en Isolate:** La deserialización y normalización se delega a `Isolate.run()` (`parseFromJsonAsync`), garantizando que la UI mantenga 60/90 fps en dispositivos de gama media y baja.

---

## 3. Claves de Almacenamiento Seguro (`FlutterSecureStorage`)

Las credenciales, tokens de acceso y preferencias críticas se almacenan cifradas en el hardware seguro del dispositivo (Android Keystore / iOS Keychain con caché en memoria `_memoryCache`):

### 3.1. Claves Multi-Cuenta de Moodle (v3)
Cada cuenta vinculada posee su propio juego de claves acotado por `accountId`:
* `moodle_token_<accountId>`: Token de Web Services REST asignado por Moodle para la cuenta.
* `moodle_userid_<accountId>`: Identificador numérico de usuario en ese campus (`userid`).
* `moodle_fullname_<accountId>`: Nombre completo reportado por Moodle para esa cuenta.
* `moodle_campus_<accountId>`: Clave de campus institucional (`presencial`, `enLinea`, `postgrado`, `nivelacion`).
* `moodle_baseurl_<accountId>`: URL base específica del campus (`https://micampus...`).

### 3.2. Claves de Compatibilidad / Cuenta Principal
Se mantienen sincronizadas con la cuenta designada como `isPrimary = true` para garantizar compatibilidad hacia atrás con componentes legados:
* `moodle_token`: Token de la cuenta principal activa.
* `moodle_userid`: User ID de la cuenta principal.
* `moodle_fullname`: Nombre de usuario de la cuenta principal.
* `moodle_active_campus`: Campus activo principal.
* `moodle_base_url`: URL base principal.

### 3.3. Claves de Banner 9 (Ellucian)
* `banner_session_cookies`: Encabezados `Cookie` de sesión federada SAML capturados por el WebView.
* `banner_student_name`: Nombre oficial del estudiante extraído del portal de registro.
* `banner_term_code`: Periodo académico activo seleccionado (ej. `202420`).

### 3.4. Preferencias y Enlaces
* `notif_reminder_7d`: Flag booleano para alertas de tarea con 7 días de anticipación (`true`/`false`).
* `notif_reminder_3d`: Flag booleano para alertas de tarea con 3 días de anticipación (`true`/`false`).
* `notif_reminder_1d`: Flag booleano para alertas de tarea con 1 día de anticipación (`true`/`false`).
* `notif_reminder_3h`: Flag booleano para alertas de tarea con 3 horas de anticipación (`true`/`false`).
* `virtual_meeting_links`: Mapa JSON serializado con enlaces detectados a Teams, Zoom y Meet indexados por NRC y clave de materia.
* `onboarding_completed`: Flag que previene la reaparición del flujo de bienvenida en arranques subsecuentes.

---

## 4. API Estática de Comunidad y Directorio v1 (Web y App)

> **Documento maestro de especificación y esquemas:** Ver [COMMUNITY_API.md](COMMUNITY_API.md).

Esperancitos incorpora una **API estática desacoplada de alto rendimiento** para publicar avisos estudiantiles, el directorio de emprendimientos universitarios, enlaces rápidos institucionales y la verificación de versiones de la app móvil.

### 4.1. Principios de Operación
* **Base URL:** `https://esperancitos.app/api/v1/`
* **Zero-Backend:** Todos los recursos son generados como archivos JSON estáticos inmutables durante el build de la web (`src/pages/api/v1/*.json.ts` con Astro SSG).
* **Consumo Anónimo y Seguro:** Las peticiones son exclusivamente `GET` sobre HTTPS. No requieren autenticación, cookies de sesión, tokens de Moodle ni identificadores de usuario.
* **Caché Inteligente por Hash:** El cliente consulta en primer lugar `manifest.json`. Si el hash `sha256` de un recurso no ha cambiado respecto a la copia local en el dispositivo, se omite su descarga.
* **Control de Cabeceras (`vercel.json`):**
  - `Content-Type: application/json; charset=utf-8`
  - `X-Content-Type-Options: nosniff`
  - `Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=86400`
  - Sin CORS abierto innecesario para prevenir consumo abusivo de terceros.

### 4.2. Endpoints Oficiales del Contrato v1

| Endpoint | Método | Descripción | Criterio de Actualización |
| :--- | :--- | :--- | :--- |
| `/api/v1/manifest.json` | `GET` | Manifiesto de control con versión del esquema (`schemaVersion: 1`), timestamp de generación ISO 8601 y huella SHA-256 de cada sub-recurso. | Se consulta primero con cabecera `If-None-Match` (ETag). |
| `/api/v1/update.json` | `GET` | Metadatos de la última versión (.apk): `latestVersion`, `latestBuild`, `minSupportedBuild`, `apkUrl`, notas de lanzamiento y hashes. | Permite auto-actualización sin Google Play. |
| `/api/v1/avisos.json` | `GET` | Tablón de avisos comunitarios vigentes. Incluye `id`, `titulo`, `cuerpo`, `prioridad` (`alta`, `media`, `baja`), `publishedAt`, `expiresAt`, `url` y `tag`. | Filtrado automático en build: los avisos expirados (`expiresAt < now`) se descartan. |
| `/api/v1/negocios.json` | `GET` | Directorio de emprendimientos estudiantiles por campus. Incluye `nombre`, `descripcion`, `categoria`, `campus`, `contacto`, `validUntil`, `verificado`, `instagram` y `logoUrl`. | Todos los listados son 100% gratuitos para estudiantes de la ESPE. |
| `/api/v1/enlaces.json` | `GET` | Catálogo de enlaces institucionales y de utilidad estudiantil (`id`, `titulo`, `descripcion`, `url`, `categoria`, `orden`). | Agrupados por categoría y ordenados numéricamente. |

### 4.3. Modelo de Integración en el Cliente Móvil
1. **Verificación de Red:** Si el usuario tiene activo el conmutador de ahorro de datos estricto o desactiva "Contenido de Comunidad" en Ajustes, la app no realiza llamadas a `esperancitos.app`.
2. **Ciclo de Actualización en Segundo Plano:**
   - La app descarga `manifest.json`.
   - Compara los hashes `sha256` recibidos contra los guardados en almacenamiento local (`community_manifest_hashes`).
   - Solo descarga las cargas útiles que hayan cambiado.
3. **Persistencia Local y Resiliencia:** Cada payload se persiste en Drift SQLite v6 / almacenamiento local. Ante caídas de red o modo avión, el estudiante siempre tiene acceso a los avisos y al directorio de negocios descargados previamente.

