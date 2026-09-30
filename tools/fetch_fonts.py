"""Descarga las fuentes de Google y las deja listas para servirse en local.

Genera public/fonts/*.woff2 y src/styles/fonts.css con las reglas @font-face.
Asi el sitio no depende de fonts.googleapis.com: no bloquea el renderizado,
no hace conexiones externas y respeta la promesa de privacidad.
"""
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / 'public' / 'fonts'
CSS_OUT = ROOT / 'src' / 'styles' / 'fonts.css'

# UA moderno para que Google sirva woff2 (el formato mas ligero)
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0 Safari/537.36')

CSS_URL = ('https://fonts.googleapis.com/css2'
           '?family=Outfit:wght@400;600;700;800;900'
           '&family=JetBrains+Mono:wght@700;800'
           '&display=swap')

# Subconjuntos que realmente necesitamos (contenido en espanol)
KEEP_SUBSETS = {'latin', 'latin-ext'}


def fetch(url: str, attempts: int = 5) -> bytes:
    """Descarga con reintentos: la conexión a Google Fonts se corta con frecuencia."""
    import time
    last_error = None
    for attempt in range(1, attempts + 1):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.read()
        except Exception as exc:  # noqa: BLE001 - queremos reintentar cualquier fallo de red
            last_error = exc
            if attempt < attempts:
                wait = 2 * attempt
                print(f'    intento {attempt} falló ({exc.__class__.__name__}), reintento en {wait}s...')
                time.sleep(wait)
    raise SystemExit(f'No se pudo descargar {url}: {last_error}')


def main():
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    print('Descargando CSS de Google Fonts...')
    css = fetch(CSS_URL).decode('utf-8')

    # El CSS viene con bloques precedidos de un comentario /* subset */
    blocks = re.findall(r'/\*\s*([a-z0-9-]+)\s*\*/\s*(@font-face\s*\{[^}]+\})', css)
    if not blocks:
        raise SystemExit('No se pudieron leer los bloques @font-face')

    out_rules = [
        '/* ==========================================================================',
        '   FUENTES AUTOALOJADAS (generado por tools/fetch_fonts.py)',
        '   ==========================================================================',
        '   Outfit y JetBrains Mono se sirven desde este mismo dominio: sin conexiones',
        '   a Google, sin bloqueo de renderizado y sin filtrar la visita del usuario.',
        '   Para regenerarlo: python tools/fetch_fonts.py',
        '   ========================================================================== */',
        '',
    ]

    downloaded = 0
    total_bytes = 0

    for subset, block in blocks:
        if subset not in KEEP_SUBSETS:
            continue

        family = re.search(r"font-family:\s*'([^']+)'", block).group(1)
        weight = re.search(r'font-weight:\s*(\d+)', block).group(1)
        url = re.search(r'url\((https://[^)]+\.woff2)\)', block).group(1)
        # Rango unicode del bloque, tal cual lo declara Google
        unicode_range = re.search(r'unicode-range:\s*([^;]+);', block)
        unicode_range = unicode_range.group(1).strip() if unicode_range else ''

        slug = family.lower().replace(' ', '-')
        filename = f'{slug}-{weight}-{subset}.woff2'
        target = FONT_DIR / filename

        if not target.exists():
            data = fetch(url)
            target.write_bytes(data)
            downloaded += 1
        size = target.stat().st_size
        total_bytes += size
        print(f'  {filename:44} {size/1024:6.1f} KB')

        out_rules.append('@font-face {')
        out_rules.append(f"  font-family: '{family}';")
        out_rules.append('  font-style: normal;')
        out_rules.append(f'  font-weight: {weight};')
        out_rules.append('  font-display: swap;')
        out_rules.append(f"  src: url('/fonts/{filename}') format('woff2');")
        if unicode_range:
            out_rules.append(f'  unicode-range: {unicode_range};')
        out_rules.append('}')
        out_rules.append('')

    CSS_OUT.write_text('\n'.join(out_rules), encoding='utf-8')
    print(f'\n{downloaded} archivos nuevos, {total_bytes/1024:.1f} KB en total')
    print(f'CSS generado en {CSS_OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
