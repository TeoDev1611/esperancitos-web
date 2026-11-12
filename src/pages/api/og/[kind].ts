import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';
import { decodePilasParam, type PayloadKind } from '../../../lib/pilasCodec';
import { buildPublicOgMeta, sanitizeOgRenderFields } from '../../../lib/pilasLinks/og-meta';
import { extractRawDFromUrl } from '../../../lib/pilasLinks/ssr-helpers';

export const prerender = false;

const ALLOWED_KINDS = new Set<PayloadKind>([
  'amigo',
  'tarea',
  'tareas',
  'materiales',
  'curso',
  'junta',
]);

function normalizeKindParam(param: string | undefined): PayloadKind | null {
  if (!param) return null;
  const clean = param.replace(/\.png$/i, '').toLowerCase();
  if (clean === 'a') return 'amigo';
  return ALLOWED_KINDS.has(clean as PayloadKind) ? (clean as PayloadKind) : null;
}

function createOgVNode(meta: ReturnType<typeof sanitizeOgRenderFields>) {
  const statPills = meta.stats.map((stat, idx) => ({
    type: 'div',
    key: String(idx),
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1E2230',
        border: '2px solid #6B7894',
        borderRadius: '12px',
        padding: '10px 18px',
        fontSize: '20px',
        color: '#FAF7F7',
        marginRight: idx < meta.stats.length - 1 ? '12px' : '0px',
      },
      children: stat,
    },
  }));

  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#101319',
        color: '#FAF7F7',
        padding: '44px 54px',
        fontFamily: 'sans-serif',
        borderTop: `8px solid ${meta.accentHex}`,
      },
      children: [
        // Barra superior: marca Pilas! + etiqueta de ruta
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: '#FF3FA4',
                          border: '2px solid #7A0A45',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '14px',
                        },
                        children: {
                          type: 'svg',
                          props: {
                            width: 26,
                            height: 26,
                            viewBox: '0 0 24 24',
                            fill: '#000000',
                            children: [
                              {
                                type: 'path',
                                props: {
                                  d: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
                                },
                              },
                            ],
                          },
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '30px',
                                color: '#FAF7F7',
                                lineHeight: 1.05,
                              },
                              children: 'Pilas!',
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '16px',
                                color: '#8F9CAE',
                                marginTop: '2px',
                              },
                              children: 'Enlace Universal Zero-Backend · Atelier EC',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#1E2230',
                    border: `2px solid ${meta.accentHex}`,
                    borderRadius: '9999px',
                    padding: '10px 20px',
                    fontSize: '18px',
                    color: meta.accentHex,
                  },
                  children: meta.badge,
                },
              },
            ],
          },
        },
        // Tarjeta central brutalista con acento izquierdo
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#161A23',
              border: '2px solid #2A3142',
              borderLeft: `10px solid ${meta.accentHex}`,
              borderRadius: '18px',
              padding: '38px 42px',
              width: '100%',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: meta.title.length > 52 ? '38px' : '46px',
                    lineHeight: 1.15,
                    color: '#FAF7F7',
                    marginBottom: '18px',
                  },
                  children: meta.title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: meta.description.length > 120 ? '22px' : '25px',
                    lineHeight: 1.4,
                    color: '#E1E2EB',
                  },
                  children: meta.description,
                },
              },
            ],
          },
        },
        // Fila inferior: píldoras de metadatos públicos + pie
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    flexShrink: 1,
                    rowGap: '8px',
                  },
                  children: statPills,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    marginLeft: '16px',
                    fontSize: '19px',
                    color: '#8F9CAE',
                  },
                  children: meta.footerNote,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

export const GET: APIRoute = async ({ params, url }) => {
  const kind = normalizeKindParam(params.kind);
  if (!kind) {
    return new Response('Ruta Open Graph no válida.', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // REGLA DE PRIVACIDAD: NUNCA registrar ni persistir ?d= en logs del servidor.
  const rawD = extractRawDFromUrl(url);
  const origin = url.origin || 'https://pilas-ec.vercel.app';

  const decoded = rawD ? await decodePilasParam(rawD, kind) : null;
  const publicMeta = buildPublicOgMeta(kind, decoded, origin, rawD);
  const safeMeta = sanitizeOgRenderFields(publicMeta);

  const cacheHeader =
    !rawD || decoded?.ok
      ? 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
      : 'public, max-age=300, s-maxage=300';

  try {
    return new ImageResponse(createOgVNode(safeMeta) as any, {
      width: 1200,
      height: 630,
      headers: {
        'content-type': 'image/png',
        'cache-control': cacheHeader,
        'referrer-policy': 'no-referrer',
        'x-content-type-options': 'nosniff',
        'cross-origin-resource-policy': 'cross-origin',
      },
    });
  } catch {
    const fallbackMeta = sanitizeOgRenderFields(
      buildPublicOgMeta(kind, null, origin),
    );
    return new ImageResponse(createOgVNode(fallbackMeta) as any, {
      width: 1200,
      height: 630,
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=60',
        'referrer-policy': 'no-referrer',
        'x-content-type-options': 'nosniff',
        'cross-origin-resource-policy': 'cross-origin',
      },
    });
  }
};
