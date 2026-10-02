import type { APIRoute } from 'astro';
import { buildApiPayloads } from '../../../lib/community-payloads.ts';

export const prerender = true;

/**
 * Endpoint estático /api/v1/update.json
 * Informa sobre la última versión disponible, build mínima soportada,
 * notas de versión y página oficial de descarga (sin enlace directo de APK).
 */
export const GET: APIRoute = async () => {
  const payloads = buildApiPayloads();
  return new Response(payloads.rawStrings.update, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
    },
  });
};
