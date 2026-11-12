/**
 * Copia texto al portapapeles con fallback para WebViews embebidos
 * (WhatsApp/Telegram in-app browsers) donde navigator.clipboard puede
 * no existir o rechazar permisos sin interacción nativa completa.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continuar al fallback textarea/execCommand
    }
  }

  if (typeof document === 'undefined') return false;

  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  ta.style.left = '-9999px';
  ta.style.opacity = '0';

  const activeBefore = document.activeElement as HTMLElement | null;
  document.body.appendChild(ta);

  try {
    ta.focus({ preventScroll: true });
    ta.select();
    ta.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    ta.remove();
    activeBefore?.focus?.({ preventScroll: true });
  }
}

