import type { APIRoute } from "astro";
import { buildApiPayloads } from "../../../lib/community-payloads.ts";

export const prerender = true;

/**
 * Endpoint estático /api/v1/enlaces.json
 * Grupos de enlaces útiles verificados para estudiantes.
 */
export const GET: APIRoute = async () => {
  const payloads = buildApiPayloads();
  return new Response(payloads.rawStrings.enlaces, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control":
        "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
    },
  });
};
