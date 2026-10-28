/**
 * src/lib/analytics.ts
 * Capa de analítica agregada respetuosa de la privacidad:
 * - Cero cookies
 * - Cero rastreo entre sitios (no fingerprinting)
 * - Cero datos personales o direcciones IP almacenadas
 *
 * TODO(owner): Configurar el dominio o endpoint del servidor de analítica autoalojada
 * (ej. Plausible o Umami) en las variables de entorno PUBLIC_ANALYTICS_DOMAIN / URL.
 */

export type AnalyticsEvent =
  | 'intro_mostrada'
  | 'intro_saltada'
  | 'intro_completada'
  | 'descarga_click'
  | 'cambio_campus'
  | 'calculadora_uso'
  | 'faq_visita';

export interface EventProperties {
  arch?: string;
  campus?: string;
  source?: string;
  [key: string]: any;
}

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
    umami?: { track: (event: string, data?: Record<string, any>) => void };
  }
}

/**
 * Registra un evento de medición agregada si existe un proveedor configurado
 * o lo emite como CustomEvent en el navegador para depuración local.
 */
export function trackEvent(event: AnalyticsEvent, props?: EventProperties): void {
  if (typeof window === 'undefined') return;

  // 1. Proveedor Plausible
  if (typeof window.plausible === 'function') {
    window.plausible(event, props ? { props } : undefined);
    return;
  }

  // 2. Proveedor Umami
  if (typeof window.umami?.track === 'function') {
    window.umami.track(event, props);
    return;
  }

  // 3. Fallback en desarrollo: emisión como evento personalizado en el DOM
  try {
    const customEvt = new CustomEvent('pilas:analytics', {
      detail: { event, props, timestamp: Date.now() },
    });
    window.dispatchEvent(customEvt);
  } catch {}
}
