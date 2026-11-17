// ============================================================================
// PILAS! UNIVERSAL LINKS — Detección de Plataforma, Deep Link y QR en Cliente
// Reglas:
// - Preferir navigator.userAgentData?.platform (UA-CH) antes de fallback UA
// - iPhone/iPad: NUNCA mostrar botón APK; mostrar Web (PWA) + guía A2HS
// - Android: pilas://<route>?d=... con fallback leyendo /api/v1/update.json
// - PC/Desktop: destacar QR escaneable (canvas sin innerHTML) + copiar link
// - NUNCA loggear ?d= ni usar innerHTML
// ============================================================================

import { inspectPublicUrl, safeText } from '../lib/pilasCodec';
import { copyTextToClipboard } from '../lib/pilasLinks/clipboard';

type DevicePlatform = 'android' | 'ios' | 'desktop';

interface UpdatePayloadJson {
  latestVersion?: string;
  notes?: string[];
  downloadPage?: string;
  apkUrl?: string;
}

interface NavigatorUAData {
  platform?: string;
}

function detectPlatform(): DevicePlatform {
  const nav = navigator as Navigator & { userAgentData?: NavigatorUAData };
  const hintPlatform = nav.userAgentData?.platform?.toLowerCase() ?? '';

  if (hintPlatform.includes('android')) return 'android';
  if (hintPlatform.includes('ios') || hintPlatform.includes('iphone') || hintPlatform.includes('ipad')) {
    return 'ios';
  }
  if (
    hintPlatform.includes('win') ||
    hintPlatform.includes('mac') ||
    hintPlatform.includes('linux') ||
    hintPlatform.includes('cros')
  ) {
    // Verificar iPadOS que se anuncia como Mac con pantalla táctil
    if (nav.maxTouchPoints > 1 && /mac/i.test(hintPlatform)) {
      return 'ios';
    }
    return 'desktop';
  }

  // Fallback para navegadores sin User-Agent Client Hints (Safari / Firefox)
  const ua = navigator.userAgent ?? '';
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (nav.maxTouchPoints > 1 && /Macintosh/i.test(ua)) return 'ios';
  return 'desktop';
}

let cachedUpdateInfo: UpdatePayloadJson | null = null;

async function fetchStaticUpdateInfo(): Promise<UpdatePayloadJson | null> {
  if (cachedUpdateInfo) return cachedUpdateInfo;
  try {
    const res = await fetch('/api/v1/update.json', { cache: 'default' });
    if (!res.ok) return null;
    const data = (await res.json()) as UpdatePayloadJson;
    cachedUpdateInfo = data;
    return data;
  } catch {
    return null;
  }
}

async function renderQrCanvas(canvas: HTMLCanvasElement | null, targetUrl: string) {
  if (!canvas || !targetUrl) return;
  try {
    const QRCode = await import('qrcode');
    await QRCode.toCanvas(canvas, targetUrl, {
      width: 196,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#101319',
        light: '#FFFFFF',
      },
    });
  } catch {
    // Si falla el canvas, mantener degradado silencioso
  }
}

function populateAndroidFallback(
  box: HTMLElement,
  updateInfo: UpdatePayloadJson | null,
) {
  const versionEl = box.querySelector<HTMLElement>('[data-update-version]');
  const noteEl = box.querySelector<HTMLElement>('[data-update-note]');
  const primaryLinkEl = box.querySelector<HTMLAnchorElement>('[data-android-download-link]');

  if (versionEl) {
    versionEl.textContent = updateInfo?.latestVersion
      ? `Última versión disponible: v${safeText(updateInfo.latestVersion, 24)}`
      : 'Pilas! en Google Play';
  }

  if (noteEl) {
    const firstNote = Array.isArray(updateInfo?.notes) ? updateInfo.notes[0] : undefined;
    noteEl.textContent = firstNote
      ? safeText(firstNote, 180)
      : 'Instala Pilas! gratis desde Google Play y vuelve a abrir este enlace.';
  }

  if (primaryLinkEl) {
    const normalizeDownloadHref = (raw?: string): string | null => {
      if (!raw) return null;
      const trimmed = raw.trim();
      if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
      return inspectPublicUrl(trimmed).url;
    };

    const apkHref = normalizeDownloadHref(updateInfo?.apkUrl);
    const pageHref = normalizeDownloadHref(updateInfo?.downloadPage);

    if (apkHref) {
      primaryLinkEl.href = apkHref;
      primaryLinkEl.textContent = 'Descargar último APK Android';
      primaryLinkEl.setAttribute('download', '');
    } else if (pageHref) {
      primaryLinkEl.href = pageHref;
      primaryLinkEl.textContent = 'Instalar desde Google Play';
      primaryLinkEl.removeAttribute('download');
    } else {
      primaryLinkEl.href = 'https://play.google.com/store/apps/details?id=dev.teodev.pilas';
      primaryLinkEl.textContent = 'Instalar desde Google Play';
      primaryLinkEl.removeAttribute('download');
    }
  }

  box.hidden = false;
}

export function initPlatformActions() {
  const roots = document.querySelectorAll<HTMLElement>('[data-platform-actions]');
  if (roots.length === 0) return;

  const platform = detectPlatform();

  roots.forEach((root) => {
    const deepPath = root.dataset.deepPath || 'friend';
    const routePath = root.dataset.routePath || '/amigo';
    let currentRawD = root.dataset.rawD || '';

    const getShareUrl = () => {
      if (currentRawD) {
        const u = new URL(routePath, window.location.origin);
        u.searchParams.set('d', currentRawD);
        return u.toString();
      }
      return window.location.href;
    };

    const getDeepSchemeUrl = () =>
      currentRawD
        ? `pilas://${deepPath}?d=${encodeURIComponent(currentRawD)}`
        : `pilas://${deepPath}`;

    const androidBlock = root.querySelector<HTMLElement>('[data-block-android]');
    const iosBlock = root.querySelector<HTMLElement>('[data-block-ios]');
    const desktopBadge = root.querySelector<HTMLElement>('[data-desktop-badge]');
    const androidBadge = root.querySelector<HTMLElement>('[data-android-badge]');
    const iosBadge = root.querySelector<HTMLElement>('[data-ios-badge]');
    const openBtn = root.querySelector<HTMLButtonElement>('[data-open-app-btn]');
    const toggleFallbackBtn = root.querySelector<HTMLButtonElement>(
      '[data-toggle-android-fallback]',
    );
    const androidFallbackBox = root.querySelector<HTMLElement>(
      '[data-android-fallback]',
    );
    const openStatus = root.querySelector<HTMLElement>('[data-open-status]');
    const pwaOpenBtn = root.querySelector<HTMLButtonElement>('[data-pwa-open-btn]');
    const iosGuideBox = root.querySelector<HTMLElement>('[data-ios-pwa-guide]');
    const qrPanel = root.querySelector<HTMLElement>('[data-qr-section]');
    const qrCanvas = root.querySelector<HTMLCanvasElement>('[data-qr-canvas]');
    const copyBtn = root.querySelector<HTMLButtonElement>('[data-copy-link-btn]');
    const copyStatus = root.querySelector<HTMLElement>('[data-copy-status]');

    // Mostrar bloque exacto según plataforma (iOS nunca ve botón de APK)
    if (platform === 'ios') {
      if (androidBlock) androidBlock.hidden = true;
      if (iosBlock) iosBlock.hidden = false;
      if (iosBadge) iosBadge.hidden = false;
    } else if (platform === 'android') {
      if (androidBlock) androidBlock.hidden = false;
      if (iosBlock) iosBlock.hidden = true;
      if (androidBadge) androidBadge.hidden = false;
      // Precargar /api/v1/update.json para que el fallback Android responda sin latencia extra
      void fetchStaticUpdateInfo();
    } else {
      // Desktop: destacar QR antes de las acciones móviles para mantener orden visual y Tab consistente
      if (androidBlock) androidBlock.hidden = false;
      if (iosBlock) iosBlock.hidden = true;
      if (desktopBadge) desktopBadge.hidden = false;
      if (qrPanel) {
        qrPanel.dataset.highlighted = 'true';
        if (androidBlock && androidBlock.parentElement === qrPanel.parentElement) {
          androidBlock.parentElement?.insertBefore(qrPanel, androidBlock);
        }
      }
    }

    // Dibujar QR inicial
    void renderQrCanvas(qrCanvas, getShareUrl());

    // Actualizar dinámicamente si la vista carga un ejemplo cliente
    window.addEventListener('pilas:link-updated', (ev) => {
      const custom = ev as CustomEvent<{ rawD?: string }>;
      if (typeof custom.detail?.rawD === 'string') {
        currentRawD = custom.detail.rawD;
        root.dataset.rawD = currentRawD;
        void renderQrCanvas(qrCanvas, getShareUrl());
      }
    });

    // Abrir pilas://... en Android con fallback leyendo /api/v1/update.json
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        const schemeUrl = getDeepSchemeUrl();
        if (!schemeUrl.startsWith('pilas://')) return;

        if (openStatus) {
          openStatus.textContent = 'Intentando abrir Pilas! en tu dispositivo…';
        }

        window.location.href = schemeUrl;

        if (platform === 'android' && androidFallbackBox) {
          window.setTimeout(async () => {
            if (document.visibilityState === 'visible') {
              if (openStatus) {
                openStatus.textContent =
                  'Si no tienes la app instalada todavía, aquí tienes la descarga oficial para Android:';
              }
              const updateInfo = await fetchStaticUpdateInfo();
              populateAndroidFallback(androidFallbackBox, updateInfo);
            }
          }, 1350);
        } else if (platform === 'desktop' && openStatus) {
          openStatus.textContent =
            '¿Estás en computadora? Escanea el código QR de abajo con la cámara dentro de Pilas! en tu celular.';
        }
      });
    }

    if (toggleFallbackBtn && androidFallbackBox) {
      toggleFallbackBtn.addEventListener('click', async () => {
        if (!androidFallbackBox.hidden) {
          androidFallbackBox.hidden = true;
          toggleFallbackBtn.setAttribute('aria-expanded', 'false');
          return;
        }
        const updateInfo = await fetchStaticUpdateInfo();
        populateAndroidFallback(androidFallbackBox, updateInfo);
        toggleFallbackBtn.setAttribute('aria-expanded', 'true');
      });
    }

    // iPhone / iPad: iOS no abre la PWA instalada desde un enlace. Se copia el
    // enlace y se pega dentro de Pilas (escáner QR → Pegar enlace).
    if (pwaOpenBtn) {
      const pwaStatus = root.querySelector<HTMLElement>('[data-pwa-copy-status]');
      pwaOpenBtn.addEventListener('click', async () => {
        const ok = await copyTextToClipboard(getShareUrl());
        if (pwaStatus) {
          pwaStatus.textContent = ok
            ? 'Copiado. Abre Pilas! y toca el escáner QR → Pegar enlace.'
            : 'No se pudo copiar: mantén presionada la dirección de arriba y cópiala.';
        }
        iosGuideBox?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    // Copiar enlace actual para WhatsApp
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const ok = await copyTextToClipboard(getShareUrl());
        if (copyStatus) {
          copyStatus.textContent = ok
            ? 'Enlace copiado al portapapeles para WhatsApp.'
            : 'No se pudo copiar automáticamente; copia la dirección desde la barra del navegador.';
        }
      });
    }
  });
}

initPlatformActions();

