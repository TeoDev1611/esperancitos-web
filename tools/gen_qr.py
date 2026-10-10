import re
import qrcode
import qrcode.image.svg

def get_svg_data(url):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
        image_factory=qrcode.image.svg.SvgPathImage
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image()
    s = img.to_string(encoding='unicode')
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    d = re.search(r'd="([^"]+)"', s).group(1)
    return vb, d

vb_deuna, d_deuna = get_svg_data('https://pilas-ec.vercel.app/#apoyar')
vb_moodle, d_moodle = get_svg_data('https://evirtual.espe.edu.ec')

with open('src/lib/qr-data.ts', 'w', encoding='utf-8') as f:
    f.write('// Generado automáticamente - datos SVG vectoriales para códigos QR\n')
    f.write(f'export const DEUNA_QR = {{\n  viewBox: "{vb_deuna}",\n  path: "{d_deuna}"\n}};\n\n')
    f.write(f'export const MOODLE_QR = {{\n  viewBox: "{vb_moodle}",\n  path: "{d_moodle}"\n}};\n')

print('src/lib/qr-data.ts generated successfully!')
