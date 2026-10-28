/**
 * Controlador de la Exposición Vintage (Intro en Proyector 6 diapositivas)
 * Maneja la máquina de escribir, temporizadores, animaciones accesibles y medición.
 */
import { trackEvent } from '../lib/analytics';
import { paintCampusMode } from './campus-mode';

interface Slide {
  m: string;
  cue?: string;
  html: string;
  sr: string;
  say: string;
}

const ALT: Record<string, string> = {
  scared: 'Pilas, nervioso, con una gota de sudor',
  neutral: 'Pilas, sonriendo con el dedo arriba',
  error: 'Pilas, con el ceño fruncido y el pulgar abajo',
  sleeping: 'Pilas, dormido con un gorro fucsia',
  guard: 'Pilas con gorra y lentes oscuros',
  success: 'Pilas, feliz, con el pulgar arriba',
};

export function initIntroPresentation(): void {
  const introEl = document.getElementById('intro');
  if (!introEl) return;

  const html = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MASC = JSON.parse(introEl.dataset.m || '{}');
  const VDATA = JSON.parse(introEl.dataset.v || '{}');

  let currentBranch = html.dataset.mode === 'multi' ? 'multi' : 'espe';

  const slide0: Slide = {
    m: 'scared',
    cue: '(traga saliva)',
    html: `
      <div class="sl-slide-inner">
        <div class="sl-hdr">
          <span class="sl-hdr-tag">📽️ PROYECTOR PILAS-EC // DIAPOSITIVA 01</span>
          <span class="sl-hdr-topic">EXPOSICIÓN DE PROYECTO · SEMESTRE 2026-A</span>
        </div>
        <div class="sl-intro-grid">
          <div class="sl-intro-main">
            <div class="sl-intro-brand-row">
              <div class="sl-brand-logo-pill" title="Pilas! App Estudiantil">
                <img src="/logos/letras_estilo_transparente.svg" alt="Pilas!" class="sl-brand-logo" width="180" height="48">
              </div>
              <span class="badge b-info hide-xs"><svg class="ico"><use href="#i-info"/></svg>v${VDATA.version || '1.2.0'} · Build ${VDATA.build || 8}</span>
            </div>
            <h2 class="sl-intro-title">La app creada por y para estudiantes en Ecuador</h2>
            <p class="sl-intro-desc">Horarios inteligentes, conexión Moodle instantánea, carnet digital y 13 herramientas 100% offline.</p>
          </div>
          <div class="sl-intro-cards">
            <div class="sl-mini-card">
              <span class="sl-mini-icon">⚡</span>
              <div class="sl-mini-info">
                <b>100% Offline</b>
                <p>Horarios, materias y herramientas guardadas en tu celular sin gastar megas.</p>
              </div>
            </div>
            <div class="sl-mini-card">
              <span class="sl-mini-icon">🛡️</span>
              <div class="sl-mini-info">
                <b>Cero Servidores</b>
                <p>Tus claves viajan directamente a la universidad; jamás tocan un servidor nuestro.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="sl-ftr-row">
          <span class="sl-ftr-pill">💡 Diseñado para teléfonos Android de gama media/baja con poco almacenamiento.</span>
        </div>
      </div>
    `,
    sr: 'Pilas! Presentación del proyecto estudiantil. Horarios, conexión Moodle y herramientas 100% offline.',
    say: 'B-buenos días ingenier@ y compañer@s… Hoy les presento Pilas!, la app que nos salva el semestre.',
  };

  const slidePick: Slide = {
    m: 'neutral',
    cue: '(se acomoda los lentes)',
    html: `
      <div class="sl-slide-inner">
        <div class="sl-hdr">
          <span class="sl-hdr-tag">🎯 DIAPOSITIVA 02 // PERSONALIZACIÓN DE CAMPUS</span>
          <span class="sl-hdr-topic">SELECCIÓN DE EXPERIENCIA ESTUDIANTIL</span>
        </div>
        <div class="sl-choice-headline">
          <h2>¿En qué universidad estudias tú?</h2>
          <p>Para adaptar las siguientes diapositivas a la realidad de tu campus, elige tu universidad:</p>
        </div>
        <div class="sl-choice-cards">
          <button type="button" class="choice-card espe" data-expo-pick="espe">
            <div class="choice-badge">MODO ESPE</div>
            <h3>Universidad de las Fuerzas Armadas ESPE</h3>
            <p>Aulas de Sangolquí y sedes, cálculo de 42/60 puntos y 23 mallas curriculares precargadas.</p>
            <span class="choice-action">Elegir ESPE y continuar ➔</span>
          </button>
          <button type="button" class="choice-card multi" data-expo-pick="multi">
            <div class="choice-badge coral">MULTI-UNIVERSIDAD</div>
            <h3>UCE, EPN, PUCE, ESPOL, UNACH y más</h3>
            <p>Moodle por QR en 1s, compresor de tareas PDF, notas multi-escala y carnet universal.</p>
            <span class="choice-action">Elegir Multi-U y continuar ➔</span>
          </button>
        </div>
      </div>
    `,
    sr: 'Elige tu campus: Modo ESPE para Sangolquí y sedes, o Modo Multi-Universidad para otras universidades del país.',
    say: 'Antes de continuar… ¿en qué universidad estudias? Así te muestro exactamente lo que resuelve en tu campus.',
  };

  const slidesEspe: Slide[] = [
    {
      m: 'scared',
      cue: '(hace memoria con susto)',
      html: `
        <div class="sl-slide-inner">
          <div class="sl-hdr">
            <span class="sl-hdr-tag">🏛️ DIAPOSITIVA 03 // AULAS Y MIESPE</span>
            <span class="sl-hdr-topic">EL PROBLEMA DE SANGOLQUÍ Y SEDES</span>
          </div>
          <div class="sl-trans-grid">
            <div class="sl-trans-box input">
              <span class="sl-trans-lbl">CÓDIGO OFICIAL EN BANNER / MIESPE</span>
              <div class="sl-code-sample">SN02_BLOQ-G_P02_AULA-204</div>
              <p class="sl-trans-hint">¿Alguien sabe dónde queda eso el primer día de clases?</p>
            </div>
            <div class="sl-trans-arrow">➔</div>
            <div class="sl-trans-box output">
              <span class="sl-trans-lbl ok">TRADUCCIÓN EN PILAS! (100% OFFLINE)</span>
              <div class="sl-clean-name">Bloque G · Piso 2 · Aula 204</div>
              <span class="badge b-ok">📍 Sede Sangolquí</span>
            </div>
          </div>
          <div class="sl-pain-list">
            <div class="pain-pill"><span>❌</span> Banner caído en adiciones</div>
            <div class="pain-pill"><span>❌</span> Pasillos sin señal celular</div>
            <div class="pain-pill"><span>❌</span> No saber qué materia sigue</div>
          </div>
        </div>
      `,
      sr: 'Traductor de aulas Banner a nombres claros como Bloque G, Piso 2, Aula 204.',
      say: 'Todos hemos sufrido buscando un aula como "SN02_BLOQ-G_P02" en Sangolquí sin internet en los pasillos.',
    },
    {
      m: 'sleeping',
      cue: '(bosteza con sueño)',
      html: `
        <div class="sl-slide-inner">
          <div class="sl-hdr">
            <span class="sl-hdr-tag">⚖️ DIAPOSITIVA 04 // LA REGLA DE LOS 42 PUNTOS</span>
            <span class="sl-hdr-topic">CÁLCULO EXACTO DEL 14.01 // SIN SORPRESAS</span>
          </div>
          <div class="sl-calc-hero">
            <div class="sl-calc-kpi">
              <span class="sl-kpi-num">42.00</span>
              <span class="sl-kpi-lbl">PUNTOS NECESARIOS ENTRE P1 + P2 + P3</span>
            </div>
            <div class="sl-calc-explain">
              <h3>¿Cuánto necesito sacar en el Parcial 3?</h3>
              <p>Pilas! suma tus notas reales de Banner y te dice exactamente qué nota sacar para no ir a supletorio.</p>
              <div class="sl-calc-formula">Parcial 1 + Parcial 2 + Parcial 3 ≥ 42.00 (Promedio ≥ 14.00)</div>
            </div>
          </div>
          <div class="sl-ftr-row">
            <span class="sl-ftr-pill">📚 Incluye el mapa de prerrequisitos de 23 carreras de la ESPE 100% offline.</span>
          </div>
        </div>
      `,
      sr: 'Calculadora de notas sobre 42 puntos para aprobar con 14.01.',
      say: 'La temida regla de los 42 puntos. Pilas! te dice al decimal cuánto necesitas en el P3 para pasar.',
    },
    {
      m: 'guard',
      cue: '(se pone firme como vigilante)',
      html: `
        <div class="sl-slide-inner">
          <div class="sl-hdr">
            <span class="sl-hdr-tag">🛡️ DIAPOSITIVA 05 // CERO SERVIDORES</span>
            <span class="sl-hdr-topic">PRIVACIDAD RADICAL & GARITAS</span>
          </div>
          <div class="sl-vault-showcase">
            <div class="vault-feature">
              <span class="vault-ico">🔐</span>
              <div class="vault-text">
                <b>Credenciales cifradas con AES-256</b>
                <p>Tus contraseñas viajan directo a miESPE. Jamás tocan servidores nuestros.</p>
              </div>
            </div>
            <div class="vault-feature">
              <span class="vault-ico">🪪</span>
              <div class="vault-text">
                <b>Carnet con Código de Barras</b>
                <p>Código de barras con tu ID Banner para garitas peatonales y vehiculares sin internet.</p>
              </div>
            </div>
          </div>
          <div class="sl-ftr-row">
            <span class="sl-ftr-pill">📵 Funciona en sótanos, laboratorios blindados y modo avión.</span>
          </div>
        </div>
      `,
      sr: 'Zero-backend con credenciales cifradas por hardware en Android Keystore y carnet con código de barras.',
      say: 'Tus credenciales no pasan por servidores de terceros. Cifrado por hardware en tu celular y carnet para garita.',
    },
    {
      m: 'success',
      cue: '(suspira de alivio)',
      html: `
        <div class="sl-slide-inner">
          <div class="sl-hdr">
            <span class="sl-hdr-tag ok">🎉 DIAPOSITIVA 06 // LA SUITE COMPLETA</span>
            <span class="sl-hdr-topic">13 HERRAMIENTAS OFFLINE EN TU BOLSILLO</span>
          </div>
          <div class="sl-tools-grid-6">
            <div class="tool-card"><span class="tool-ico">📄</span><b>Compresor PDF</b><small>Para el límite de Moodle</small></div>
            <div class="tool-card"><span class="tool-ico">⚖️</span><b>Calculadora 42pts</b><small>Simulador P3 exacto</small></div>
            <div class="tool-card"><span class="tool-ico">📐</span><b>Carátulas ESPE</b><small>Formatos con membrete</small></div>
            <div class="tool-card"><span class="tool-ico">📷</span><b>Escáner nítido</b><small>Filtro b/n para deberes</small></div>
            <div class="tool-card"><span class="tool-ico">✍️</span><b>Firma visual</b><small>Firma PNG en pantalla</small></div>
            <div class="tool-card"><span class="tool-ico">📚</span><b>23 Mallas ESPE</b><small>Malla interactiva offline</small></div>
          </div>
          <div class="sl-ftr-row">
            <span class="sl-ftr-pill">⚡ ¡Exposición terminada! Pulsa abajo para entrar al Hub de la ESPE:</span>
          </div>
        </div>
      `,
      sr: 'Suite completa con 13 herramientas offline gratuitas. Entra al Hub estudiantil.',
      say: '¡Terminé la exposición! Ahora entra al Hub y descarga la app para tener todo esto en tu celular.',
    },
  ];

  const slidesMulti: Slide[] = [
    {
      m: 'neutral',
      cue: '(conecta el cable con seguridad)',
      html: `
        <div class="sl-slide-inner">
          <div class="sl-hdr">
            <span class="sl-hdr-tag">⚡ DIAPOSITIVA 03 // MOODLE UNIVERSAL</span>
            <span class="sl-hdr-topic">CONEXIÓN POR CÓDIGO QR EN 1 SEGUNDO</span>
          </div>
          <div class="sl-trans-grid">
            <div class="sl-trans-box input">
              <span class="sl-trans-lbl">INICIO DE SESIÓN MOODLE</span>
              <p style="font-size:0.9rem;margin:6px 0;color:var(--body)">¿Cansado de escribir tu contraseña cada vez que la sesión caduca?</p>
              <div class="sl-code-sample">QR oficial de Moodle Mobile</div>
            </div>
            <div class="sl-trans-arrow">➔</div>
            <div class="sl-trans-box output">
              <span class="sl-trans-lbl ok">CONEXIÓN DIRECTA EN 1 SEGUNDO</span>
              <div class="sl-clean-name">¡Escaneas tu QR y listo!</div>
              <span class="badge b-ok">⚡ Cero contraseñas guardadas</span>
            </div>
          </div>
          <div class="sl-pain-list">
            <div class="pain-pill"><span>✓</span> UCE</div>
            <div class="pain-pill"><span>✓</span> EPN</div>
            <div class="pain-pill"><span>✓</span> PUCE</div>
            <div class="pain-pill"><span>✓</span> ESPOL</div>
            <div class="pain-pill"><span>✓</span> Cualquier Moodle</div>
          </div>
        </div>
      `,
      sr: 'Conexión universal a cualquier Moodle de Ecuador escaneando el código QR oficial de Moodle Mobile.',
      say: 'Escaneas el QR oficial de tu perfil de Moodle y listo: tareas, materias y calificaciones sin contraseñas.',
    },
    {
      m: 'scared',
      cue: '(mira el reloj: 23:54)',
      html: `
        <div class="sl-slide-inner">
          <div class="sl-hdr">
            <span class="sl-hdr-tag">📄 DIAPOSITIVA 04 // EL LÍMITE DE 5 MB</span>
            <span class="sl-hdr-topic">COMPRESOR PDF OFFLINE ANTI-REBOTES</span>
          </div>
          <div class="sl-calc-hero">
            <div class="sl-calc-kpi">
              <span class="sl-kpi-num" style="color:var(--critical)">24.8 MB</span>
              <span class="sl-kpi-lbl">INFORME CON FOTOS REBOTADO POR MOODLE</span>
            </div>
            <div class="sl-calc-explain">
              <h3>Moodle rechaza archivos mayores a 5 MB</h3>
              <p>Pilas! comprime tus documentos PDF en tu propio celular sin subirlos a internet ni cobrarte suscripciones.</p>
              <div class="sl-calc-formula">24.8 MB ➔ 2.1 MB (Texto nítido y listo para entregar)</div>
            </div>
          </div>
          <div class="sl-ftr-row">
            <span class="sl-ftr-pill">⏰ Alarma inteligente anti-23:55 para que nunca te venza una entrega.</span>
          </div>
        </div>
      `,
      sr: 'Compresor PDF offline para el límite de 5 MB de Moodle.',
      say: '¿Son las 23:55 y Moodle te dice "archivo supera 5 MB"? El compresor lo baja a 2 MB en 3 segundos.',
    },
    {
      m: 'sleeping',
      cue: '(bosteza con calma)',
      html: `
        <div class="sl-slide-inner">
          <div class="sl-hdr">
            <span class="sl-hdr-tag">📐 DIAPOSITIVA 05 // NOTAS MULTI-ESCALA</span>
            <span class="sl-hdr-topic">EVALUACIONES SOBRE 10, 20 O 100 PUNTOS</span>
          </div>
          <div class="sl-trans-grid">
            <div class="sl-trans-box input">
              <span class="sl-trans-lbl">SISTEMAS ACADÉMICOS VARIABLES</span>
              <p style="font-size:0.9rem;margin:6px 0;color:var(--body)">Régimen de 2 parciales, 3 parciales o quimestral con ponderaciones.</p>
            </div>
            <div class="sl-trans-arrow">➔</div>
            <div class="sl-trans-box output">
              <span class="sl-trans-lbl ok">NOTAS MULTI-ESCALA EN PILAS!</span>
              <div class="sl-clean-name">Cálculo de nota mínima al instante</div>
              <span class="badge b-ok">🎯 Configurable por materia</span>
            </div>
          </div>
          <div class="sl-ftr-row">
            <span class="sl-ftr-pill">📊 Adaptable al sistema de evaluación de cualquier universidad o instituto de Ecuador.</span>
          </div>
        </div>
      `,
      sr: 'Control académico multi-escala sobre 10, 20 o 100 puntos.',
      say: 'Zzz… perdón, me dormí. Ya sea sobre 10, 20 o 100 puntos, Pilas calcula tu promedio al instante.',
    },
    {
      m: 'success',
      cue: '(sonríe aliviado)',
      html: `
        <div class="sl-slide-inner">
          <div class="sl-hdr">
            <span class="sl-hdr-tag ok">🚀 DIAPOSITIVA 06 // CARNET UNIVERSAL & 13 HERRAMIENTAS</span>
            <span class="sl-hdr-topic">SUITE COMPLETA ESTUDIANTIL EN 37 MB</span>
          </div>
          <div class="sl-pass-hero multi">
            <div class="sl-pass-info">
              <b>🪪 Carnet Estudiantil Universal</b>
              <p>Credencial digital con tu foto, carrera y facultad sin conexión.</p>
            </div>
            <div class="sl-pass-badge" style="color:var(--primary-coral)">★ PILAS ID ★</div>
          </div>
          <div class="sl-tools-grid-6">
            <div class="tool-card"><span class="tool-ico">📄</span><b>Compresor</b><small>Reduce PDF a menos de 5MB</small></div>
            <div class="tool-card"><span class="tool-ico">📐</span><b>Carátulas</b><small>Membretes para tareas</small></div>
            <div class="tool-card"><span class="tool-ico">📷</span><b>Escáner</b><small>Filtro b/n para pizarras y hojas</small></div>
            <div class="tool-card"><span class="tool-ico">✍️</span><b>Firma Digital</b><small>Firma transparente para trámites</small></div>
            <div class="tool-card"><span class="tool-ico">📑</span><b>Unir PDF</b><small>Combina tareas en un solo PDF</small></div>
            <div class="tool-card"><span class="tool-ico">🔍</span><b>Lector OCR</b><small>Extrae texto de fotos sin internet</small></div>
          </div>
          <div class="sl-ftr-row">
            <span class="sl-ftr-pill">🎉 ¡Exposición terminada! Pulsa abajo para entrar a Pilas Multi-Universidad:</span>
          </div>
        </div>
      `,
      sr: 'Carnet digital universal y 13 herramientas listas. Entra al Hub Multi-Universidad.',
      say: '¡Lo logré! Carnet digital universal y 13 herramientas listas. ¡Bienvenido a Pilas!',
    },
  ];

  function getActiveSlides(): Slide[] {
    const branch = currentBranch === 'multi' ? slidesMulti : slidesEspe;
    return [slide0, slidePick, ...branch];
  }

  const sl = document.getElementById('sl');
  const say = document.getElementById('say');
  const mas = document.getElementById('mas') as HTMLImageElement | null;
  const meter = document.getElementById('imeter');
  const sub = document.getElementById('subt');
  const cue = document.getElementById('cue');

  if (meter) {
    meter.innerHTML = '';
    for (let k = 0; k < 10; k++) meter.appendChild(document.createElement('i'));
  }

  let idx = -1;
  let timerAnimId = 0;
  let typer: any = null;
  let masAnim: any = null;

  const fill = (p: number) => {
    if (!meter) return;
    const count = Math.round(p * 10);
    [...meter.children].forEach((c: any, k) => c.classList.toggle('on', k < count));
  };

  function show(n: number) {
    const activeSlides = getActiveSlides();
    if (n < 0 || n >= activeSlides.length) return;
    idx = n;
    const s = activeSlides[n];
    const last = n === activeSlides.length - 1;

    if (timerAnimId) cancelAnimationFrame(timerAnimId);
    clearInterval(typer);
    if (masAnim) {
      try { masAnim.cancel(); } catch {}
    }

    if (sl) {
      sl.innerHTML = s.html;
      if (!reduce) {
        try {
          sl.animate(
            [
              { opacity: 0, transform: 'translateY(10px) scale(0.98)' },
              { opacity: 1, transform: 'translateY(0) scale(1)' }
            ],
            { duration: 320, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' }
          );
        } catch {}
      }

      if (n === 1) {
        sl.querySelectorAll('[data-expo-pick]').forEach((btn: any) => {
          btn.addEventListener('click', () => {
            const picked = btn.dataset.expoPick;
            if (picked) {
              currentBranch = picked;
              paintCampusMode(picked);
              try { localStorage.pilasMode = picked; } catch {}
              show(2);
            }
          });
        });
      } else if (last) {
        const enterBtn = sl.querySelector('#btn-expo-hub');
        if (enterBtn) {
          enterBtn.addEventListener('click', () => {
            close(currentBranch);
          });
        }
      }
    }

    if (mas) {
      mas.src = MASC[s.m];
      mas.alt = ALT[s.m];
      if (!reduce) {
        try {
          if (s.m === 'scared') {
            masAnim = mas.animate(
              [
                { transform: 'translate(0, 0) rotate(0deg)' },
                { transform: 'translate(2.5px, -1px) rotate(2deg)' },
                { transform: 'translate(-2.5px, 1px) rotate(-2deg)' },
                { transform: 'translate(0, 0) rotate(0deg)' }
              ],
              { duration: 90, iterations: Infinity }
            );
          } else if (s.m === 'sleeping') {
            masAnim = mas.animate(
              [
                { transform: 'rotate(-2deg) translateY(0)' },
                { transform: 'rotate(2deg) translateY(-8px)' },
                { transform: 'rotate(-2deg) translateY(0)' }
              ],
              { duration: 1800, iterations: Infinity, easing: 'ease-in-out' }
            );
          } else if (s.m === 'success') {
            masAnim = mas.animate(
              [
                { transform: 'scale(1) translateY(0)' },
                { transform: 'scale(1.08) translateY(-10px)' },
                { transform: 'scale(1) translateY(0)' }
              ],
              { duration: 450, iterations: 3, easing: 'cubic-bezier(0.17, 0.89, 0.32, 1.28)' }
            );
          } else {
            masAnim = mas.animate(
              [
                { transform: 'translateY(12px) scale(0.94)' },
                { transform: 'translateY(0) scale(1)' }
              ],
              { duration: 420, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
            );
          }
        } catch {}
      }
    }

    const srEl = document.getElementById('sr');
    if (srEl) srEl.textContent = `${s.sr} ${s.say}`;
    const cntEl = document.getElementById('icount');
    if (cntEl) cntEl.textContent = `${n + 1} de ${activeSlides.length}`;

    const inext = document.getElementById('inext');
    const ichoice = document.getElementById('ichoice');
    const ifinish = document.getElementById('ifinish');
    const iswitch = document.getElementById('iswitch');
    
    if (inext) inext.hidden = (n === 1 || last);
    if (ichoice) ichoice.hidden = !last;
    if (last) {
      if (ifinish) {
        if (currentBranch === 'espe') {
          ifinish.textContent = '⚡ Entrar a Pilas ESPE ➔';
          ifinish.className = 'btn btn-p btn-sm btn-finish';
        } else {
          ifinish.textContent = '⭐ Entrar a Pilas Multi-U ➔';
          ifinish.className = 'btn btn-coral btn-sm btn-finish';
        }
      }
      if (iswitch) {
        if (currentBranch === 'espe') {
          iswitch.textContent = '(o ver versión Multi-Universidad)';
          iswitch.dataset.switchTo = 'multi';
        } else {
          iswitch.textContent = '(o ver versión ESPE)';
          iswitch.dataset.switchTo = 'espe';
        }
      }
    }

    fill(0);
    if (cue) cue.textContent = s.cue || '';

    if (reduce) {
      if (say) say.textContent = s.say;
      if (sub) sub.textContent = s.say;
      return;
    }

    let c = 0;
    if (say) say.innerHTML = '<span class="type-cursor" aria-hidden="true">|</span>';
    if (sub) sub.innerHTML = '<span class="type-cursor" aria-hidden="true">|</span>';
    typer = setInterval(() => {
      const slice = s.say.slice(0, ++c);
      const cursor = c < s.say.length ? '<span class="type-cursor" aria-hidden="true">|</span>' : '';
      if (say) say.innerHTML = slice + cursor;
      if (sub) sub.innerHTML = slice + cursor;
      if (c >= s.say.length) clearInterval(typer);
    }, 22);

    if (n !== 1 && !last) {
      const duration = Math.max(5000, s.say.length * 68 + 2400);
      const startTime = performance.now();
      const tick = (now: number) => {
        if (idx !== n) return;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        fill(progress);
        if (progress < 1) {
          timerAnimId = requestAnimationFrame(tick);
        } else {
          next();
        }
      };
      timerAnimId = requestAnimationFrame(tick);
    }
  }

  function next() {
    const activeSlides = getActiveSlides();
    if (idx < activeSlides.length - 1) {
      show(idx + 1);
    }
  }

  let lastFocusedElement: HTMLElement | null = null;

  function close(pickMode?: string, reason: 'skip' | 'finish' | 'close' = 'close') {
    if (timerAnimId) cancelAnimationFrame(timerAnimId);
    clearInterval(typer);
    if (masAnim) try { masAnim.cancel(); } catch {}
    try {
      sessionStorage.pilas = '1';
      localStorage.setItem('pilasIntroSeen', '1');
    } catch {}

    if (reason === 'skip') {
      trackEvent('intro_saltada');
    } else if (reason === 'finish') {
      trackEvent('intro_completada');
    }

    const targetMode = pickMode || currentBranch;
    const done = () => {
      html.classList.remove('intro-on');
      document.body.style.overflow = '';
      if (introEl) introEl.style.opacity = '';
      const site = document.getElementById('site');
      if (site) site.inert = false;
      if (targetMode) {
        paintCampusMode(targetMode);
      }
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        try {
          lastFocusedElement.focus();
        } catch {}
      }
    };

    if (reduce || !introEl) return done();

    try {
      const anim = introEl.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], { duration: 250, easing: 'ease-out' });
      anim.onfinish = done;
    } catch {
      done();
    }
  }

  function start() {
    lastFocusedElement = document.activeElement as HTMLElement;
    const site = document.getElementById('site');
    if (site) site.inert = true;
    document.body.style.overflow = 'hidden';
    currentBranch = html.dataset.mode === 'multi' ? 'multi' : 'espe';
    show(0);
    trackEvent('intro_mostrada');
    try {
      localStorage.setItem('pilasIntroSeen', '1');
    } catch {}
    const inext = document.getElementById('inext');
    if (inext) inext.focus();
  }

  // Focus trap accesible dentro de #intro
  introEl.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Tab' && html.classList.contains('intro-on')) {
      const focusables = introEl.querySelectorAll<HTMLElement>(
        'button:not([hidden]):not([disabled]), [href]:not([hidden]):not([disabled]), input:not([hidden]):not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });

  // Controles
  const cc = document.getElementById('icc');
  const ccTxt = document.getElementById('icc-txt');
  const ccIco = document.getElementById('icc-ico');
  function syncRetroUI(on: boolean) {
    if (cc) cc.setAttribute('aria-pressed', String(on));
    if (ccTxt) ccTxt.textContent = on ? 'Modo retro: Activo' : 'Modo retro: Desactivado';
    if (ccIco) ccIco.textContent = on ? '🎞️' : '⚡';
  }
  if (cc) {
    syncRetroUI(html.classList.contains('retro-on'));
    cc.addEventListener('click', () => {
      const on = html.classList.toggle('retro-on');
      syncRetroUI(on);
      try { localStorage.pilasRetro = on ? '1' : '0'; } catch {}
    });
  }

  const inext = document.getElementById('inext');
  if (inext) inext.addEventListener('click', next);

  const iskip = document.getElementById('iskip');
  if (iskip) iskip.addEventListener('click', () => close(currentBranch, 'skip'));

  const ifinish = document.getElementById('ifinish');
  if (ifinish) ifinish.addEventListener('click', () => close(currentBranch, 'finish'));

  const iswitch = document.getElementById('iswitch');
  if (iswitch) {
    iswitch.addEventListener('click', () => {
      const nextBranch = iswitch.dataset.switchTo === 'multi' ? 'multi' : 'espe';
      currentBranch = nextBranch;
      paintCampusMode(nextBranch);
      try { localStorage.pilasMode = nextBranch; } catch {}
      show(2);
    });
  }

  document.querySelectorAll<HTMLElement>('[data-pick]').forEach((b) =>
    b.addEventListener('click', () => close(b.dataset.pick, 'finish'))
  );

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!html.classList.contains('intro-on')) return;
    if (e.key === 'Escape') close(currentBranch, 'skip');
    if (e.key === 'ArrowRight') next();
  });

  // Botón para repetir la exposición desde el header
  const replayBtn = document.getElementById('replay');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      try { sessionStorage.removeItem('pilas'); } catch {}
      window.scrollTo(0, 0);
      html.classList.add('intro-on');
      start();
    });
  }

  // Arranque condicional
  if (html.classList.contains('intro-on')) {
    start();
  } else {
    const site = document.getElementById('site');
    if (site) site.inert = false;
    document.body.style.overflow = '';
  }
}
