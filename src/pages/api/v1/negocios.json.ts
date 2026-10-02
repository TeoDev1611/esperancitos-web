import type { APIRoute } from 'astro';
import { buildApiPayloads } from '../../../lib/community-payloads.ts';

export const prerender = true;

/**
 * Endpoint estático /api/v1/negocios.json
 * Directorio de negocios y servicios estudiantiles vigentes.
 * Orden determinista: por categoría y nombre alfabético.
 * Excluye negocios con validUntil en el pasado en el momento del build.
 * No publica datos internos (consentimiento, contacto del dueño, notas).
 */
export const GET: APIRoute = async () => {
  const payloads = buildApiPayloads();
  return new Response(payloads.rawStrings.negocios, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
    },
  });
};
