import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT_DIR = process.cwd();
const RELEASE_JSON_PATH = path.join(ROOT_DIR, "src", "data", "release.json");
const PUBLIC_DOWNLOADS_DIR = path.join(ROOT_DIR, "public", "downloads");

interface ArchData {
  name?: string;
  description?: string;
  file?: string;
  sizeBytes?: number;
  sha256?: string;
  url?: string;
  isPrimary?: boolean;
}

interface ReleaseData {
  version?: string;
  build?: number;
  apkVersion?: string;
  releaseDate?: string;
  minAndroid?: string;
  versionDiscrepancyNote?: string;
  downloads?: {
    showDownloadCount?: boolean;
    count?: number;
    label?: string;
  };
  architectures?: Record<string, ArchData>;
}

function runValidation(): void {
  console.log("🔍 Validando coherencia de release y descargas...");

  if (!fs.existsSync(RELEASE_JSON_PATH)) {
    console.error(`❌ ERROR CRÍTICO: No existe el archivo ${RELEASE_JSON_PATH}`);
    process.exit(1);
  }

  let data: ReleaseData;
  try {
    const raw = fs.readFileSync(RELEASE_JSON_PATH, "utf8");
    data = JSON.parse(raw) as ReleaseData;
  } catch (err) {
    console.error(`❌ ERROR: ${RELEASE_JSON_PATH} no contiene un JSON válido:`, err);
    process.exit(1);
  }

  const errors: string[] = [];

  // 1. Validar versión y build del producto
  if (!data.version || typeof data.version !== "string" || data.version.trim() === "") {
    errors.push("Falta 'version' o no es un string válido.");
  }
  if (!data.build || typeof data.build !== "number" || data.build <= 0) {
    errors.push("Falta 'build' o debe ser un número entero mayor a 0.");
  }

  // 2. Validar versión del APK
  if (!data.apkVersion || typeof data.apkVersion !== "string" || data.apkVersion.trim() === "") {
    errors.push("Falta 'apkVersion' o no es un string válido.");
  }

  // 3. Validar discrepancia de versiones
  if (data.version && data.apkVersion && data.version !== data.apkVersion) {
    if (
      !data.versionDiscrepancyNote ||
      typeof data.versionDiscrepancyNote !== "string" ||
      data.versionDiscrepancyNote.trim().length < 10
    ) {
      errors.push(
        `Discrepancia detectada: 'version' (${data.version}) !== 'apkVersion' (${data.apkVersion}), ` +
          "pero falta 'versionDiscrepancyNote' con una explicación explícita de al menos 10 caracteres."
      );
    }
  }

  // 4. Validar configuración de descargas
  if (!data.downloads || typeof data.downloads.showDownloadCount !== "boolean") {
    errors.push("Falta 'downloads.showDownloadCount' (debe ser boolean).");
  }
  if (!data.downloads || typeof data.downloads.count !== "number" || data.downloads.count < 0) {
    errors.push("Falta 'downloads.count' o no es un número válido.");
  }

  // 5. Validar arquitecturas requeridas
  const REQUIRED_ARCHS = ["arm64-v8a", "armeabi-v7a", "universal", "x86_64"];
  if (!data.architectures || typeof data.architectures !== "object") {
    errors.push("Falta el objeto 'architectures'.");
  } else {
    for (const archKey of REQUIRED_ARCHS) {
      const arch = data.architectures[archKey];
      if (!arch) {
        errors.push(`Falta la arquitectura requerida '${archKey}' en 'architectures'.`);
        continue;
      }

      if (!arch.file || typeof arch.file !== "string") {
        errors.push(`[${archKey}] Falta 'file' o no es string.`);
      }

      if (!arch.sizeBytes || typeof arch.sizeBytes !== "number" || arch.sizeBytes <= 0) {
        errors.push(`[${archKey}] Falta 'sizeBytes' o no es un número positivo.`);
      }

      // Validar formato de SHA-256 (exactamente 64 caracteres hex)
      if (!arch.sha256 || typeof arch.sha256 !== "string") {
        errors.push(`[${archKey}] Falta 'sha256'.`);
      } else if (!/^[a-fA-F0-9]{64}$/.test(arch.sha256)) {
        errors.push(`[${archKey}] 'sha256' inválido: debe tener exactamente 64 caracteres hexadecimales (valor: '${arch.sha256}').`);
      }

      // Verificar archivo real en disco y coincidencia de hash si el archivo existe
      if (arch.file) {
        const diskPath = path.join(PUBLIC_DOWNLOADS_DIR, arch.file);
        if (fs.existsSync(diskPath)) {
          const fileBuffer = fs.readFileSync(diskPath);
          const realHash = crypto.createHash("sha256").update(fileBuffer).digest("hex").toLowerCase();
          const expectedHash = (arch.sha256 || "").toLowerCase();

          if (realHash !== expectedHash) {
            errors.push(
              `[${archKey}] Inconsistencia criptográfica en archivo '${arch.file}':\n` +
                `   - Esperado en release.json : ${expectedHash}\n` +
                `   - Calculado en disco real  : ${realHash}`
            );
          }

          if (arch.sizeBytes && Math.abs(arch.sizeBytes - fileBuffer.length) > 0) {
            errors.push(
              `[${archKey}] Inconsistencia de tamaño en '${arch.file}':\n` +
                `   - En release.json: ${arch.sizeBytes} bytes\n` +
                `   - En disco real  : ${fileBuffer.length} bytes`
            );
          }
        }
      }
    }

    // Verificar que al menos una arquitectura esté marcada como isPrimary
    const hasPrimary = Object.values(data.architectures).some((a) => a.isPrimary);
    if (!hasPrimary) {
      errors.push("Ninguna arquitectura tiene 'isPrimary: true'. Debe haber al menos una recomendada por defecto.");
    }
  }

  if (errors.length > 0) {
    console.error("❌ FALLÓ LA VALIDACIÓN DE RELEASE:");
    for (const err of errors) {
      console.error(`   • ${err}`);
    }
    process.exit(1);
  }

  console.log("✅ Validación de release y descargas exitosa: integridad de hashes y versiones verificada.");
}

runValidation();
