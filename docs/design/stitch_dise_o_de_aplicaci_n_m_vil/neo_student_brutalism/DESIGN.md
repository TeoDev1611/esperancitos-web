---
name: Neo-Student Brutalism
colors:
  surface: '#101319'
  surface-dim: '#101319'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#b9cbb9'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#849585'
  outline-variant: '#3b4b3d'
  surface-tint: '#00e478'
  primary: '#f1ffef'
  on-primary: '#003919'
  primary-container: '#00ff87'
  on-primary-container: '#007138'
  inverse-primary: '#006d36'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#fffaf7'
  on-tertiary: '#3d2f00'
  tertiary-container: '#ffdb79'
  on-tertiary-container: '#795f01'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#60ff98'
  primary-fixed-dim: '#00e478'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005227'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffe08d'
  tertiary-fixed-dim: '#e5c364'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#101319'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
  surface-dark: '#161a23'
  surface-elevated: '#1e2230'
  border-dark: '#2a3142'
  text-muted: '#8f9cae'
  accent-emerald-dark: '#059669'
typography:
  display-xl:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-xl-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Outfit
    fontSize: 17px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Outfit
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Outfit
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Outfit
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies a punchy, youth-centric, modern clean neo-brutalism tailored specifically for ESPE university students. Moving past sterile corporate LMS portals and abrasive terminal styles, it delivers a high-impact, direct, and unpretentious mobile companion that feels energetic, street-smart, and accessible to non-technical users.

Key identity pillars:
- **Clean Soft Neo-Brutalism:** Thick high-contrast boundaries, punchy flat surfaces, and disciplined solid offsets paired with inviting rounded contours (12px–16px) that eliminate visual fatigue.
- **Immediate Clarity:** Ultra-clear action terminology ("Cargar archivo", "Ver aula", "Guardar") with zero cognitive ambiguity. 
- **High-Velocity Ergonomics:** Engineered around four core university rhythms via a bottom navigation bar: **HOME**, **HORARIO**, **TAREAS**, and **NOTAS**.
- **Youthful Confidence:** Deep dark mode canvas punctuated with sharp neon emerald accents, creating an electric yet highly legible environment for day and night study sessions.

## Colors

The palette adheres to a strict, ultra-focused three-color hierarchy optimized for dark-mode battery conservation and readability under harsh classroom lighting:

- **Primary (`#00ff87` - Electric Emerald):** The hero accent. Directs all primary user actions, current progress meters, active navigation tabs, grade honors, and affirmative micro-interactions. Complemented by `#059669` for pressed states and high-contrast borders.
- **Secondary (`#ffffff` - Pure Crisp White):** Primary text, major container borders, active icons, and high-emphasis information modules.
- **Neutral Canvas (`#0e1117` - Deep Charcoal Black):** The primary app backdrop. Sub-layers progress through `#161a23` (card surfaces) and `#1e2230` (elevated sheets and input containers).
- **Structural Lines (`#2a3142` & `#ffffff`):** Outlines provide physical form without adding visual noise, keeping the interface distinctly brutalist yet tidy.

## Typography

The design system exclusively adopts **Outfit**, a friendly, modern, geometric sans-serif font. Its rounded geometric curves soften the heavy line weights of brutalism, making the interface approachable and easy to scan on mobile screens.

- **Headlines & Display:** Set in heavy weights (`700` and `800`) with tight letter spacing for high punch and clear orientation. Used for big numerical grades (e.g., "19.5/20"), class titles, and student greeting banners.
- **Body:** Set in `400` and `500` weights for fluid reading of homework prompts, professor remarks, and classroom directions.
- **Labels & Navigation:** Bold uppercase and title-case badges (`700` weight) anchor the bottom tabs (HOME, HORARIO, TAREAS, NOTAS) and immediate action buttons.

## Layout & Spacing

Designed mobile-first around rapid single-thumb navigation, the system deploys a fluid 4-column layout on handheld devices and expands to an 8-column layout on tablets.

- **Base Rhythm:** Strict 4px/8px modular spacing increments.
- **Mobile Margins & Safe Areas:** Screen edges observe a steady `1rem` (16px) margin, guaranteeing interactive buttons and classroom cards remain comfortably clear of hardware edges and gesture bars.
- **Component Breathing Room:** Card padding uses `space-md` (16px) for content breathing room, while micro elements like tags and badges use `space-xs` and `space-sm`.
- **Navigation Bar:** Fixed persistent bottom navigation housing the 4 primary destinations (HOME, HORARIO, TAREAS, NOTAS) with a touch target height of at least 64px.

## Elevation & Depth

Depth is established through modern neo-brutalist solid offset shadows rather than soft blurred skeuomorphism. This keeps performance snappy on all mobile hardware:

- **Surface Tiers:**
  - Base: `#0e1117`
  - Cards & Containers: `#161a23` with a crisp `2px solid #2a3142` or `2px solid #ffffff`
  - Interactive Panels: `#1e2230`
- **Brutalist Offset Shadows:**
  - **Resting Action / Card:** `3px 3px 0px #00ff87` or `3px 3px 0px #ffffff`.
  - **Hover / Focus:** Expanded offset of `4px 4px 0px #00ff87` with `-1px -1px` transform.
  - **Pressed / Active:** `0px 0px 0px` offset with a `+3px +3px` translation, delivering a physical tactile click feel.

## Shapes

The design system implements balanced rounded corners (`roundedness: 2`, corresponding to 12px–16px radiuses) to tame the harshness of classic brutalism:

- **Cards and Panels:** Set to `14px` or `16px` (`rounded-lg`), producing a friendly gadget-like look.
- **Buttons & Input Fields:** Set to `12px` (`rounded-md`) for quick touch feedback and smooth perimeter outlines.
- **Pills & Badges:** Use full pill rounding (`9999px`) for contextual status tags like "ENTREGADO", "PENDIENTE", or classroom indicators.

## Components

### Buttons
- **Primary ("Cargar archivo", "Guardar"):** `#00ff87` solid fill, `#0e1117` bold typography, `2px solid #00ff87`, rounded `12px`. Features a hard `3px 3px 0px #ffffff` drop-shadow.
- **Secondary ("Ver aula"):** `#1e2230` surface fill, `#ffffff` bold text, `2px solid #ffffff`, rounded `12px`, with `3px 3px 0px #00ff87` shadow.
- **Ghost / Simple:** Transparent fill, `#00ff87` outline or underline, no offset shadow.

### Cards & Class Blocks
- `#161a23` container, rounded `16px`, bordered with `2px solid #2a3142`.
- Active or current class cards leverage a `2px solid #00ff87` border and a `3px 3px 0px #00ff87` accent shadow.
- Header row includes subject title in bold `headline-md` and quick action buttons along the base.

### Bottom Navigation (HOME, HORARIO, TAREAS, NOTAS)
- Anchored bottom bar floating over `#0e1117` with a `#161a23` fill and `2px solid #2a3142` top border.
- Active tab displays a solid `#00ff87` icon with a glowing rounded indicator and high-contrast `#ffffff` label.
- Inactive tabs rest at `#8f9cae` with instant touch reactivity.

### Input Fields & Upload Zones
- **Input Fields:** `#161a23` surface, `2px solid #2a3142`, `12px` radius. Focus shifts border to `#00ff87` with an immediate `2px 2px 0px #00ff87` ring.
- **File Upload ("Cargar archivo"):** Dashed `2px solid #00ff87` container with `#161a23` fill, centered upload glyph, and prominent instructional text.

### Chips & Badges
- High-contrast pills with `2px solid #00ff87` or `#ffffff`.
- Overdue tasks: `#ffffff` text on `#161a23` with a solid white outline.
- Approved / Complete: `#00ff87` background with `#0e1117` bold text.

### Selection Controls
- **Checkboxes & Radios:** `2px solid #ffffff` on `#161a23` background with `6px` rounded corners. Checked state fills with `#00ff87` and presents a thick `#0e1117` checkmark.