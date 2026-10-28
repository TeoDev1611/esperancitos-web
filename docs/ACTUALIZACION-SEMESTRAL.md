# Guía de Actualización Semestral de Datos Académicos

> **Proyecto:** Pilas! Software Estudiantil (Web & Móvil)  
> **Periodicidad:** Semestral (Inicio de Semestre A en Marzo/Abril, Inicio de Semestre B en Octubre/Noviembre)  
> **Responsable:** Administrador del repositorio / Desarrollador a cargo  

---

## 1. Visión General y Compromiso de Precisión

Pilas! ofrece a los estudiantes información crítica para su supervivencia académica:
- Decodificación de aulas crípticas de Banner a bloques, pisos y accesos reales.
- Árbol interactivo de 23 mallas curriculares con prerrequisitos oficiales.
- Simulador de la regla de 42/60 puntos para evitar el examen supletorio.

Publicar datos desactualizados o códigos de aulas antiguos puede hacer que un estudiante llegue tarde a un examen o planifique mal su matrícula. Por ello, al inicio de cada semestre se debe ejecutar rigurosamente este protocolo.

---

## 2. Calendario de Actualización

| Hito Semestral | Fechas Aproximadas (Ecuador) | Acciones Clave |
|---|---|---|
| **Pre-Matrículas** | Febrero / Septiembre | Revisión de reformas a mallas curriculares aprobadas en Consejo Académico. |
| **Inicio de Clases** | Marzo / Octubre | Auditoría de reasignación de bloques y laboratorios en campus Sangolquí y sedes. |
| **Cierre de Ajustes** | Segunda semana de clases | Congelamiento de datos, actualización de fecha visible y release de versión. |

---

## 3. Protocolo de Actualización Paso a Paso

### Paso 1: Actualizar las 23 Mallas Curriculares
1. Obtener los planes de estudio vigentes emitidos por el Vicerrectorado de Docencia (archivos PDF oficiales de mallas).
2. Verificar cambios en códigos de materias, créditos, correquisitos y prerrequisitos en cadena.
3. Actualizar los archivos JSON de mallas en la aplicación móvil y en el repositorio web (`src/content/enlaces/` y estructuras compartidas).
4. Ejecutar el validador de contenido:
   ```bash
   npm run validate:content
   ```

### Paso 2: Actualizar el Mapeo de Aulas y Bloques
1. Solicitar o recopilar la distribución de espacios físicos de:
   - **Campus Matriz Sangolquí:** Bloques A, B, C, D, E, F, G, H, Laboratorios de Mecánica, Auditorios.
   - **Sedes:** Latacunga (Campus Centro y Villa Flora), Santo Domingo (Hda. Zoila Luz), San Roque.
2. Identificar nuevas nomenclaturas o reasignaciones de laboratorios (ej. cambio de laboratorios de software o nuevas garitas).
3. Actualizar la tabla de decodificación en `src/lib/banner-parser.ts` (o módulo de aulas respectivo).

### Paso 3: Revisión de Reglas de Calificación
1. Validar el Estatuto y Reglamento de Régimen Académico vigente de la ESPE:
   - ¿Se mantiene la regla de 3 parciales sobre 20 (total 60 puntos) con aprobación en 42 puntos?
   - ¿Existe alguna nota piso obligatoria en el Parcial 3 (ej. mínimo 10.00/20)? *(Pendiente con dueño: `TODO(owner)`)*.
   - Si hubo alguna reforma, actualizar la lógica pura en `src/lib/grades.ts` y sus pruebas en `tests/grades.test.ts`.

### Paso 4: Actualizar Constantes Centrales en la Web
Modificar `src/config/site.ts`:
```typescript
/** Fecha de corte de mallas curriculares, distribución de aulas y reglas semestrales */
academicDataLastUpdated: "20 de marzo de 2026", // <--- Actualizar a fecha real de corte
currentSemester: "2026-A",                      // <--- Actualizar a 2026-B, 2027-A, etc.
```

### Paso 5: Ejecutar la Batería de Pruebas y Validación
Antes de desplegar a producción en Vercel, ejecutar en local:
```bash
# 1. Validar integridad de release y APKs
npm run validate:release

# 2. Comprobar tipado estricto Astro y TypeScript
npm run typecheck

# 3. Ejecutar pruebas unitarias de cálculo de notas, compresor y release
npm run test

# 4. Probar compilación estática completa
npm run build
```

### Paso 6: Commit y Despliegue
Realizar commit convencional:
```bash
git add .
git commit -m "chore: actualizar mallas, aulas y fecha de corte a semestre 2026-B"
git push origin master
```
El pipeline de GitHub Actions (`.github/workflows/ci.yml`) validará automáticamente typecheck, lint, test y build.

---

## 4. Contactos y Fuentes Oficiales para Auditoría
- **Portal de Mallas ESPE:** `https://espe.edu.ec`
- **Banner Student:** `https://miespe.espe.edu.ec`
- **Moodle ESPE:** `https://micampus.espe.edu.ec`
- **Contacto de Soporte Pilas!:** `teo.hurtado.16@gmail.com`
