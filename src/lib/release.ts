import releaseData from "../data/release.json";

export interface ArchitectureInfo {
  name: string;
  description: string;
  file: string;
  sizeBytes: number;
  sha256: string;
  url: string;
  isPrimary?: boolean;
}

export interface ReleaseConfig {
  version: string;
  build: number;
  apkVersion: string;
  releaseDate: string;
  minAndroid: string;
  versionDiscrepancyNote: string;
  downloads: {
    showDownloadCount: boolean;
    count: number;
    label: string;
  };
  architectures: {
    "arm64-v8a": ArchitectureInfo;
    "armeabi-v7a": ArchitectureInfo;
    universal: ArchitectureInfo;
    x86_64: ArchitectureInfo;
    [key: string]: ArchitectureInfo;
  };
}

export const RELEASE: ReleaseConfig = releaseData as ReleaseConfig;

/**
 * Formatea bytes a megabytes legibles (ej: 38999344 -> "37.2 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/** Arquitectura recomendada por defecto (ARM64-v8a) */
export const PRIMARY_ARCH: ArchitectureInfo =
  Object.values(RELEASE.architectures).find((a) => a.isPrimary) ||
  RELEASE.architectures["arm64-v8a"];

/** Tamaño formateado del APK principal */
export const PRIMARY_APK_SIZE = formatBytes(PRIMARY_ARCH.sizeBytes);

/** Lista ordenada de todas las arquitecturas disponibles */
export const ARCHITECTURES_LIST: (ArchitectureInfo & {
  id: string;
  formattedSize: string;
})[] = Object.entries(RELEASE.architectures).map(([id, arch]) => ({
  id,
  ...arch,
  formattedSize: formatBytes(arch.sizeBytes),
}));

/** Mapa de checksums por nombre de archivo APK */
export const APK_CHECKSUMS: Record<string, string> = Object.values(
  RELEASE.architectures,
).reduce(
  (acc, arch) => {
    acc[arch.file] = arch.sha256;
    return acc;
  },
  {} as Record<string, string>,
);

/** Cifra formateada de descargas si está habilitada */
export const DOWNLOAD_STATS = {
  show: RELEASE.downloads.showDownloadCount,
  count: RELEASE.downloads.count,
  formatted: `+${RELEASE.downloads.count}`,
  label: RELEASE.downloads.label,
  fullText: `+${RELEASE.downloads.count} ${RELEASE.downloads.label}`,
};
