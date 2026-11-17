# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Estudiantes universitarios en Ecuador (ESPE, UCE, EPN, UTA, UNACH y cualquier institución con plataforma Moodle habilitada) que necesitan gestionar su día a día académico: horarios con aulas exactas, tareas y notificaciones de Moodle, notas, carnet digital y herramientas de estudio offline sin publicidad ni trackers. Usan Android o iPhone.

## Product Purpose
Pilas! junta todo lo de la U en un solo lugar: horario, tareas, notas, Moodle y herramientas, y avisa antes de que se pase algo. Es rápida, offline-first y privada, y elimina la fricción de consultar portales universitarios lentos o caídos. Este sitio web es la puerta de entrada: explica la app, lleva a instalarla en Android o iPhone y aloja herramientas web complementarias.

## Positioning
La app estudiantil independiente para universitarios del Ecuador, conectada directamente a Moodle y hecha por estudiantes para la comunidad. Funciona sin conexión, no depende de apps institucionales obsoletas, es gratis y respeta la privacidad de forma absoluta: sin anuncios, sin analítica y sin cuentas de Pilas; los datos viven en el teléfono.

## Operating Context
Estudiantes en campus físicos con señal celular intermitente, consultando el teléfono entre clases para saber el aula, el profesor o las tareas pendientes. Llegan al sitio desde enlaces compartidos (WhatsApp, redes, enlaces universales de Pilas) casi siempre en el móvil.

## Capabilities and Constraints
- Distribución:
  - Android: ficha pública en Google Play (https://play.google.com/store/apps/details?id=dev.teodev.pilas). Android 8.0 en adelante.
  - iPhone: app web instalada desde Safari en https://pilas-pwa.vercel.app ("Agregar a pantalla de inicio"). No está en el App Store.
  - Sin descargas directas de APK ni sistemas de actualización paralelos a la Play Store.
- Conexión: Moodle API / Mobile Web Services habilitados por cada institución educativa.
- Alcance por universidad: Moodle y las herramientas funcionan en cualquier universidad con Moodle. El horario e historial desde Banner y el login miESPE son exclusivos de la ESPE; en otras universidades el horario se agrega a mano o lo comparte un amigo.
- Diferencias iPhone vs Android: en iPhone no hay alarma ni avisos con la app cerrada (se exportan entregas al Calendario de iPhone), ni OCR, ni widgets propios. Todo contenido que muestre esas funciones debe decir "en Android".
- Herramientas complementarias en la web: calculadora de notas y compresor de PDF para Moodle.
- Fuente de verdad sobre funciones disponibles y lo que no se debe prometer: `docs/marketing/CATALOGO_FUNCIONES_APP_MARKETING.md`.

## Brand Commitments
- Nombre oficial: Pilas!
- Mascota y tono: "Pilas!", cercano, dinámico, jerga universitaria ecuatoriana respetuosa y motivadora ("ñaño/a", "mijin", "ponte pilas"), directo al grano. Habla como un pana que te salva el semestre; nunca suplica.
- Identidad visual: Neo-brutalismo lúdico, badges temáticos y estética pop-comic.
- Paleta obligatoria (fijada por el usuario, 2026-11-16): la web usa siempre la paleta de la app para ser coherente con sus capturas: fondo casi negro (`#080b11`), rosa Pilas `#ff3385` como color principal (coral `#ff4766` en modo Multi-U), cyan `#00f0ff`, verde `#00ff87`, ámbar `#ffbe3b`, texto blanco y gris azulado. Ningún rediseño puede cambiarla; el contraste de bordes negros del neo-brutalismo se traduce a bordes y sombras en estos colores sobre el fondo oscuro.
- Autonomía: Proyecto independiente desarrollado por estudiantes, no afiliado institucionalmente a ninguna universidad. Nunca decir "app oficial de la ESPE" ni usar logos institucionales como marca de Pilas!.

## Evidence on Hand
- Ficha pública en Google Play: https://play.google.com/store/apps/details?id=dev.teodev.pilas (publicada por Atelier EC).
- App de iPhone en vivo: https://pilas-pwa.vercel.app
- Canal de WhatsApp de novedades: https://www.whatsapp.com/channel/0029VbDorHS4SpkCdv49bM3g
- Sin cifras medidas de usuarios o descargas: no publicar números (usuarios, descargas, tamaños de compresión) que no estén medidos.

## Product Principles
1. Estudiante primero y privacidad absoluta: Sin anuncios, sin analítica, sin cuentas, sin venta de datos personales, sin permisos invasivos.
2. Resiliencia offline: Los datos esenciales (horario, aulas, notas guardadas) deben estar disponibles al instante aunque se caiga el internet del campus.
3. Honestidad en lo que se promete: Decir con claridad qué funciona en Android, qué en iPhone y qué solo en la ESPE; nada que no esté disponible y comprobado.
4. Universalidad universitaria ecuatoriana: Adaptabilidad para cualquier universidad que utilice Moodle estándar en el país.

## Accessibility & Inclusion
Contraste alto, legibilidad óptima bajo luz solar directa, áreas táctiles mínimas de 44x44px y diseño responsivo fluido que no se desborde ni se recorte en pantallas de cualquier tamaño.
