"""Genera los recursos de imagen del sitio: tarjeta social 1200x630 y WebP optimizados."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / 'public'
IMG = PUB / 'images'

BG = (11, 15, 20)
SURFACE = (30, 34, 48)
GREEN = (0, 255, 135)
AMBER = (255, 219, 121)
WHITE = (255, 250, 247)
MUTED = (148, 163, 184)
GRID = (26, 33, 44)

FONT_BOLD = 'C:/Windows/Fonts/segoeuib.ttf'
FONT_SEMI = 'C:/Windows/Fonts/arialbd.ttf'
FONT_REG = 'C:/Windows/Fonts/segoeui.ttf'
FONT_MONO = 'C:/Windows/Fonts/consola.ttf'


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def rounded(draw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


# ---------------------------------------------------------------------------
# 1. TARJETA SOCIAL 1200x630
# ---------------------------------------------------------------------------
def build_social_card():
    W, H = 1200, 630
    card = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(card)

    # Cuadrícula técnica sutil (misma que el fondo del sitio)
    for x in range(0, W, 48):
        d.line([(x, 0), (x, H)], fill=GRID, width=1)
    for y in range(0, H, 48):
        d.line([(0, y), (W, y)], fill=GRID, width=1)

    # Halo verde suave ALREDEDOR del teléfono (no detrás: si no, lava la captura)
    glow = Image.new('RGB', (W, H), BG)
    gd = ImageDraw.Draw(glow)
    cx, cy = 975, H // 2
    for i in range(26, 0, -1):
        r = int(330 * i / 26)
        a = int(70 * (1 - i / 26))
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(0, min(255, a * 2), int(a * 1.1)))
    card = Image.blend(card, glow, 0.22)

    d = ImageDraw.Draw(card)

    # --- Teléfono (mockup real) a la derecha -------------------------------
    phone = Image.open(IMG / 'mockup-malla.jpg').convert('RGB')
    ph_h = 540
    ph_w = int(phone.width * ph_h / phone.height)
    phone = phone.resize((ph_w, ph_h), Image.LANCZOS)

    frame_x, frame_y = 830, 45
    pad = 7
    # Marco del teléfono con borde verde
    rounded(d, [frame_x - pad, frame_y - pad, frame_x + ph_w + pad, frame_y + ph_h + pad],
            radius=30, fill=(0, 0, 0), outline=GREEN, width=3)
    card.paste(phone, (frame_x, frame_y))
    # Isla dinámica
    rounded(d, [frame_x + ph_w // 2 - 34, frame_y + 8, frame_x + ph_w // 2 + 34, frame_y + 24],
            radius=8, fill=(0, 0, 0))

    # --- Columna de texto --------------------------------------------------
    x = 78
    y = 96

    # Chip "Hecha por estudiantes"
    chip_font = font(FONT_MONO, 20)
    chip_text = 'HECHA POR ESTUDIANTES DE LA ESPE'
    tw = d.textlength(chip_text, font=chip_font)
    rounded(d, [x, y, x + tw + 32, y + 42], radius=8, fill=(20, 48, 36), outline=GREEN, width=2)
    d.text((x + 16, y + 10), chip_text, font=chip_font, fill=GREEN)
    y += 74

    # Titular en 3 líneas
    h_font = font(FONT_BOLD, 62)
    d.text((x, y), 'La App Estudiantil', font=h_font, fill=WHITE)
    y += 68
    d.text((x, y), 'Todo-en-Uno', font=h_font, fill=GREEN)
    y += 68
    d.text((x, y), 'que la ESPE merecía.', font=h_font, fill=WHITE)
    y += 96

    # Puntos clave
    body = font(FONT_REG, 25)
    for line in ['Tu malla y tu horario con aulas, sin internet',
                 'Entra a Moodle con un código QR, sin contraseña',
                 'Gratis, sin anuncios y sin registrarte']:
        d.ellipse([x + 2, y + 10, x + 12, y + 20], fill=GREEN)
        d.text((x + 28, y), line, font=body, fill=MUTED)
        y += 42

    card.save(PUB / 'images' / 'og-esperancitos.jpg', 'JPEG', quality=92, optimize=True, progressive=True)
    print('og-esperancitos.jpg', card.size)


# ---------------------------------------------------------------------------
# 2. FAVICON (PNG + ICO) a partir del logo real
# ---------------------------------------------------------------------------
def build_favicons():
    logo = Image.open(PUB / 'logo_esperancitos.jpg').convert('RGBA')

    def square(img, size, radius_ratio=0.22):
        im = img.copy()
        side = min(im.size)
        left = (im.width - side) // 2
        top = (im.height - side) // 2
        im = im.crop((left, top, left + side, top + side)).resize((size, size), Image.LANCZOS)
        mask = Image.new('L', (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=255)
        out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        out.paste(im, (0, 0), mask)
        return out

    # favicon.ico real con varios tamaños (reemplaza el residuo de Astro)
    sizes = [16, 32, 48, 64]
    base = square(logo, 256, radius_ratio=0.20)
    base.save(PUB / 'favicon.ico', format='ICO', sizes=[(s, s) for s in sizes])
    print('favicon.ico', sizes)

    # apple-touch-icon en PNG (iOS no acepta SVG ni transparencia agresiva)
    apple = square(logo, 180, radius_ratio=0.0).convert('RGB')
    apple.save(PUB / 'apple-touch-icon.png', 'PNG', optimize=True)
    print('apple-touch-icon.png 180x180')

    for s in (192, 512):
        square(logo, s).save(PUB / f'icon-{s}.png', 'PNG', optimize=True)
        print(f'icon-{s}.png')


# ---------------------------------------------------------------------------
# 3. WebP optimizados para los mockups
# ---------------------------------------------------------------------------
def build_webp():
    for name, width in (('mockup-malla', 640), ('mockup-horario', 640)):
        src = Image.open(IMG / f'{name}.jpg').convert('RGB')
        out = src.resize((width, round(src.height * width / src.width)), Image.LANCZOS)
        dest = IMG / f'{name}.webp'
        out.save(dest, 'WEBP', quality=82, method=6)
        before = (IMG / f'{name}.jpg').stat().st_size
        after = dest.stat().st_size
        print(f'{name}.webp {out.size}  {before/1024:.0f} KB -> {after/1024:.0f} KB ({100-100*after/before:.0f}% menos)')

        # Fallback JPEG para navegadores antiguos, ya redimensionado
        fb = IMG / f'{name}.jpg'
        out.save(fb, 'JPEG', quality=82, optimize=True, progressive=True)
        print(f'  fallback {name}.jpg -> {fb.stat().st_size/1024:.0f} KB')


# ---------------------------------------------------------------------------
# 4. Miniatura del QR
# ---------------------------------------------------------------------------
def build_qr_thumb():
    """Copia reducida del QR para los sitios donde se muestra a 32-130 px.

    El archivo original (1024x1024, ~845 KB) se sigue usando en la tarjeta
    grande de la sección de apoyo, donde tiene que verse nítido para escanear.
    Se guarda como PNG con paleta de 16 colores: un QR es blanco y negro, así
    que la reducción de color no le quita legibilidad y baja mucho el peso.
    """
    src = Image.open(IMG / 'qr-donacion.jpg').convert('RGB')
    thumb = src.resize((320, 320), Image.LANCZOS)
    dest = IMG / 'qr-donacion-thumb.png'
    thumb.convert('P', palette=Image.ADAPTIVE, colors=16).save(dest, 'PNG', optimize=True)
    before = (IMG / 'qr-donacion.jpg').stat().st_size
    print(f'qr-donacion-thumb.png 320x320  {before/1024:.0f} KB -> {dest.stat().st_size/1024:.0f} KB')


if __name__ == '__main__':
    build_social_card()
    build_favicons()
    build_webp()
    build_qr_thumb()
