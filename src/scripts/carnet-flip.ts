/**
 * Controlador de interactividad para el Carnet Estudiantil 3D y Generador de Pase de Tester Holográfico (Overdrive).
 * Permite cambiar de universidad en vivo, voltear 3D a la credencial Moodle y reflejo holográfico a 60fps.
 */
import { setCampusMode } from './campus-mode';

interface UniData {
  crest: string;
  title: string;
  sub: string;
  aulas: string;
  mallas: string;
  regla: string;
  barcode: string;
  badge: string;
  avatar: string;
  color: string;
  ctaText: string;
  waText: string;
}

const UNIVERSITIES: Record<string, UniData> = {
  espe: {
    crest: 'ESPE DIGITAL',
    title: 'Universidad de las Fuerzas Armadas ESPE',
    sub: 'SEDE MATRIZ SANGOLQUÍ · PREGRADO',
    aulas: 'Bloques A al H',
    mallas: '23 carreras',
    regla: '42 / 60 pts',
    barcode: 'ID BANNER · L00412890',
    badge: 'TESTER AUTORIZADO',
    avatar: '/logos/mascota_neutro.svg',
    color: '#ff3fa4',
    ctaText: 'Pedir Acceso ESPE con mi @gmail.com',
    waText: 'Hola! Quiero acceso a la prueba cerrada de Pilas! en Google Play Store para la ESPE con mi correo @gmail.com',
  },
  uta: {
    crest: 'MODO UTA AMBATO',
    title: 'Universidad Técnica de Ambato',
    sub: 'CAMPUS HUACHI E INGAHURCO',
    aulas: 'Facultades A - F',
    mallas: 'Moodle UTA',
    regla: 'Escala 10 / 10',
    barcode: 'MATRÍCULA UTA · VERIFICADO',
    badge: 'TESTER CONFIRMADO',
    avatar: '/logos/universidades/uta.png',
    color: '#d97706',
    ctaText: 'Pedir Acceso UTA con mi @gmail.com',
    waText: 'Hola! Quiero acceso a la prueba cerrada de Pilas! para la Universidad Técnica de Ambato (UTA) con mi correo @gmail.com',
  },
  uce: {
    crest: 'MODO CENTRAL QUITO',
    title: 'Universidad Central del Ecuador',
    sub: 'SEDE CENTRAL QUITO · CAMPUS UNIVERSITARIO',
    aulas: 'Facultades Centralinas',
    mallas: 'Moodle UCE',
    regla: 'Escala 20 / 20',
    barcode: 'MATRÍCULA UCE · VERIFICADO',
    badge: 'TESTER CONFIRMADO',
    avatar: '/logos/universidades/uce.png',
    color: '#38bdf8',
    ctaText: 'Pedir Acceso UCE con mi @gmail.com',
    waText: 'Hola! Quiero acceso a la prueba cerrada de Pilas! para la Universidad Central del Ecuador (UCE) con mi correo @gmail.com',
  },
  epn: {
    crest: 'MODO POLI QUITO',
    title: 'Escuela Politécnica Nacional',
    sub: 'CAMPUS POLITÉCNICO J.R. · QUITO',
    aulas: 'Edificios y Aulas EPN',
    mallas: 'Moodle EPN',
    regla: 'Escala 20 / 20',
    barcode: 'MATRÍCULA EPN · VERIFICADO',
    badge: 'TESTER CONFIRMADO',
    avatar: '/logos/universidades/epn.png',
    color: '#00ff87',
    ctaText: 'Pedir Acceso EPN con mi @gmail.com',
    waText: 'Hola! Quiero acceso a la prueba cerrada de Pilas! para la Escuela Politécnica Nacional (EPN) con mi correo @gmail.com',
  },
  unach: {
    crest: 'MODO UNACH RIOBAMBA',
    title: 'Universidad Nacional de Chimborazo',
    sub: 'CAMPUS LA DOLOROSA Y NORTE',
    aulas: 'Campus Riobamba',
    mallas: 'Moodle UNACH',
    regla: 'Escala 10 / 10',
    barcode: 'MATRÍCULA UNACH · VERIFICADO',
    badge: 'TESTER CONFIRMADO',
    avatar: '/logos/universidades/unach.png',
    color: '#f43f5e',
    ctaText: 'Pedir Acceso UNACH con mi @gmail.com',
    waText: 'Hola! Quiero acceso a la prueba cerrada de Pilas! para la UNACH con mi correo @gmail.com',
  },
};

const WA_TESTERS_GROUP = 'https://chat.whatsapp.com/FAwkWyYVK2x3sEtGuoLVzc';

export function initCarnetFlip(): void {
  const carnetEl = document.getElementById('hub-carnet');
  const tiltBox = document.getElementById('pass-tilt-box');
  const container = document.getElementById('pass-interactive-wrap');
  if (!carnetEl || !container) return;

  const html = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Elementos dinámicos del carnet
  const crestSub = document.getElementById('pass-crest-sub');
  const uniTitle = document.getElementById('pass-uni-title');
  const uniSub = document.getElementById('pass-uni-sub');
  const badgeStatus = document.getElementById('pass-badge-status');
  const dataAulas = document.getElementById('pass-data-aulas');
  const dataMallas = document.getElementById('pass-data-mallas');
  const dataRegla = document.getElementById('pass-data-regla');
  const barcodeText = document.getElementById('pass-barcode-text');
  const avatarImg = document.getElementById('pass-avatar-img') as HTMLImageElement | null;
  const headerBox = document.getElementById('pass-header-box');
  const avatarBox = document.getElementById('pass-avatar-box');
  const avatarTag = document.getElementById('pass-avatar-tag');
  const holoText = document.getElementById('pass-holo-text');
  const ctaBtn = document.getElementById('pass-whatsapp-btn') as HTMLAnchorElement | null;
  const btnText = document.getElementById('pass-btn-text');

  let currentUni = 'espe';

  function applyUniversity(uniKey: string): void {
    const data = UNIVERSITIES[uniKey] || UNIVERSITIES.espe;
    currentUni = uniKey;

    if (crestSub) crestSub.textContent = data.crest;
    if (uniTitle) uniTitle.textContent = data.title;
    if (uniSub) uniSub.textContent = data.sub;
    if (badgeStatus) {
      badgeStatus.textContent = data.badge;
      badgeStatus.style.color = data.color;
      badgeStatus.style.borderColor = data.color;
    }
    if (dataAulas) dataAulas.textContent = data.aulas;
    if (dataMallas) dataMallas.textContent = data.mallas;
    if (dataRegla) dataRegla.textContent = data.regla;
    if (barcodeText) barcodeText.textContent = data.barcode;
    if (avatarImg) {
      avatarImg.src = data.avatar;
      avatarImg.alt = data.title;
    }
    if (headerBox) {
      headerBox.style.background = data.color;
    }
    if (avatarBox) {
      avatarBox.style.borderColor = data.color;
    }
    if (avatarTag) {
      avatarTag.style.background = data.color;
      avatarTag.textContent = uniKey.toUpperCase();
    }
    if (holoText) {
      holoText.textContent = `${uniKey.toUpperCase()} · PLAY STORE VERIFIED`;
    }
    if (btnText) {
      btnText.textContent = data.ctaText;
    }
    if (ctaBtn) {
      ctaBtn.href = WA_TESTERS_GROUP;
    }

    // Actualizar tabs activas
    container.querySelectorAll('.pass-tab-btn').forEach((btn: Element) => {
      const b = btn as HTMLButtonElement;
      const isSelected = b.dataset.passUni === uniKey;
      b.classList.toggle('is-active', isSelected);
      b.setAttribute('aria-selected', String(isSelected));
      if (isSelected && uniKey !== 'espe') {
        b.style.background = data.color;
        b.style.color = '#000';
      } else if (!isSelected) {
        b.style.background = '';
        b.style.color = '';
      }
    });

    // Si elige una universidad distinta a ESPE, asegurar que el modo general acompañe
    if (uniKey !== 'espe' && html.dataset.mode !== 'multi') {
      setCampusMode('multi');
    } else if (uniKey === 'espe' && html.dataset.mode !== 'espe') {
      setCampusMode('espe');
    }
  }

  // Escuchar clics en los tabs de universidad
  container.querySelectorAll('.pass-tab-btn').forEach((btn: Element) => {
    btn.addEventListener('click', () => {
      const uni = (btn as HTMLElement).dataset.passUni;
      if (uni && UNIVERSITIES[uni]) {
        applyUniversity(uni);
      }
    });
  });

  function updateCarnetAria(): void {
    if (!carnetEl) return;
    const isMulti = html.dataset.mode === 'multi';
    carnetEl.setAttribute('aria-pressed', String(isMulti));
    carnetEl.setAttribute(
      'aria-label',
      `Carnet estudiantil 3D interactivo. Cara visible: ${
        isMulti ? 'Pasaporte Multi-Universidad QR' : 'Pase Estudiantil ' + currentUni.toUpperCase()
      }. Toca o presiona Enter para voltear.`
    );
  }

  updateCarnetAria();

  const observer = new MutationObserver(() => updateCarnetAria());
  observer.observe(html, { attributes: true, attributeFilter: ['data-mode'] });

  // Voltear carnet al hacer clic
  carnetEl.addEventListener('click', () => {
    const nextMode = html.dataset.mode === 'multi' ? 'espe' : 'multi';
    setCampusMode(nextMode);
  });

  // Soporte de accesibilidad con teclado (Enter y Espacio)
  carnetEl.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const nextMode = html.dataset.mode === 'multi' ? 'espe' : 'multi';
      setCampusMode(nextMode);
    }
  });

  // Efecto Holográfico y Tilt 3D suave (60fps)
  if (!reduce && tiltBox) {
    const passIn = carnetEl.querySelector('.pass-in') as HTMLElement | null;
    const overlays = carnetEl.querySelectorAll('.holo-foil-overlay') as NodeListOf<HTMLElement>;
    let ticking = false;

    function handlePointer(clientX: number, clientY: number): void {
      if (!tiltBox) return;
      const rect = tiltBox.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const px = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const py = Math.max(0, Math.min(100, (y / rect.height) * 100));

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      const isMulti = html.dataset.mode === 'multi';
      const baseFlip = isMulti ? 180 : 0;

      if (passIn) {
        passIn.style.transition = 'none';
        passIn.style.transform = `rotateY(${baseFlip + rotateY}deg) rotateX(${rotateX}deg)`;
      }

      overlays.forEach((o) => {
        o.style.setProperty('--mx', `${px.toFixed(1)}%`);
        o.style.setProperty('--my', `${py.toFixed(1)}%`);
      });
    }

    tiltBox.addEventListener('mousemove', (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handlePointer(e.clientX, e.clientY);
          ticking = false;
        });
        ticking = true;
      }
    });

    tiltBox.addEventListener('mouseleave', () => {
      if (passIn) {
        passIn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        passIn.style.removeProperty('transform');
      }
      overlays.forEach((o) => {
        o.style.setProperty('--mx', '50%');
        o.style.setProperty('--my', '50%');
      });
    });
  }
}
