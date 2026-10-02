#!/usr/bin/env node

// ============================================================================
// VALIDADOR DE CONTENIDO ESTÁTICO (COMUNIDAD ESPERANCITOS)
// ============================================================================
// Valida colecciones de avisos, negocios, enlaces y update SIN hacer build.
// Imprime errores claros: archivo, campo, motivo.
// Verifica unicidad de IDs, validez de esquemas Zod, fechas con offset,
// existencia y peso de logos WebP (<= 60 KB) y tamaño de payloads (<= 200 KB).
// ============================================================================

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAllContent, buildApiPayloads } from '../src/lib/community-payloads.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('='.repeat(78));
console.log('  🔍 VALIDACIÓN DE CONTENIDO DE COMUNIDAD (ESPERANCITOS API v1)');
console.log('='.repeat(78));
console.log(`Directorio raíz: ${rootDir}\n`);

const summary = validateAllContent({ rootDir });

console.log(`📁 Archivos analizados: ${summary.totalFiles}\n`);

let hasAnyIssue = false;

// 1. Reporte por archivo
for (const report of summary.reports) {
  if (report.valid) {
    console.log(`  ✅ [${report.collection.toUpperCase()}] ${report.file} (id: ${report.id || 'N/A'})`);
  } else {
    hasAnyIssue = true;
    console.error(`  ❌ [${report.collection.toUpperCase()}] ${report.file}`);
    for (const err of report.errors) {
      console.error(`      ↳ Motivo: ${err}`);
    }
  }
}

// 2. Errores de IDs duplicados
if (summary.duplicateIds.length > 0) {
  hasAnyIssue = true;
  console.log('\n' + '-'.repeat(78));
  console.error('❌ ERROR CRÍTICO: Se encontraron IDs duplicados:');
  for (const dup of summary.duplicateIds) {
    console.error(`  • Colección "${dup.collection}" - ID "${dup.id}":`);
    for (const f of dup.files) {
      console.error(`      ↳ ${f}`);
    }
  }
}

// 3. Errores de logos
if (summary.logoErrors.length > 0) {
  hasAnyIssue = true;
  console.log('\n' + '-'.repeat(78));
  console.error('❌ ERROR EN LOGOS DE NEGOCIOS:');
  for (const lErr of summary.logoErrors) {
    console.error(`  • Archivo: ${lErr.file}`);
    console.error(`    Logo: ${lErr.logo}`);
    console.error(`    Motivo: ${lErr.error}`);
  }
}

// 4. Errores de tamaño de JSON
if (summary.sizeErrors.length > 0) {
  hasAnyIssue = true;
  console.log('\n' + '-'.repeat(78));
  console.error('❌ ERROR DE TAMAÑO EN PAYLOADS JSON (> 200 KB):');
  for (const sErr of summary.sizeErrors) {
    console.error(`  • ${sErr.file}: ${sErr.sizeBytes} bytes (Límite: ${sErr.maxBytes} bytes)`);
  }
}

// 5. Verificación de payloads generados (modo desarrollo con ejemplos y modo producción)
console.log('\n' + '-'.repeat(78));
console.log('📊 SIMULACIÓN DE PAYLOADS:');

try {
  // Con ejemplos
  const devPayloads = buildApiPayloads({ rootDir, includeExamples: true });
  console.log('\n  [Modo desarrollo / INCLUDE_EXAMPLES=true]');
  for (const [name, raw] of Object.entries(devPayloads.rawStrings)) {
    const size = Buffer.byteLength(raw, 'utf8');
    const sha = devPayloads.parsed.manifest.files[name]?.sha256 || 'N/A';
    console.log(`    • ${name}.json : ${size} bytes (${(size / 1024).toFixed(2)} KB) | sha256: ${sha.slice(0, 12)}...`);
  }

  // Sin ejemplos (producción limpia)
  const prodPayloads = buildApiPayloads({ rootDir, includeExamples: false });
  console.log('\n  [Modo producción / por defecto (excluye ejemplo: true y caducados)]');
  for (const [name, raw] of Object.entries(prodPayloads.rawStrings)) {
    const size = Buffer.byteLength(raw, 'utf8');
    const sha = prodPayloads.parsed.manifest.files[name]?.sha256 || 'N/A';
    console.log(`    • ${name}.json : ${size} bytes (${(size / 1024).toFixed(2)} KB) | sha256: ${sha.slice(0, 12)}...`);
  }
} catch (err) {
  hasAnyIssue = true;
  console.error('  ❌ Error al generar payloads de prueba:', err.message);
}

console.log('\n' + '='.repeat(78));
if (hasAnyIssue) {
  console.error('❌ EL CONTENIDO CONTIENE ERRORES. Corrígelos antes de continuar.');
  console.log('='.repeat(78));
  process.exit(1);
} else {
  console.log('✅ TODO EL CONTENIDO ES VÁLIDO. Cumple al 100% con el CONTRATO API v1.');
  console.log('='.repeat(78));
  process.exit(0);
}
