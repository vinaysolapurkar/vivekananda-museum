# UI/UX Redesign — Viveka Smaraka Museum App

**Date:** 2026-07-23 · **Approved by:** Vinay (chat)

## Goal

Make the whole app feel like a world-class museum experience. Keep the
orange/saffron identity. No backend, DB, or feature changes — visual and
layout only.

## Decisions (from brainstorming)

- **Platforms:** big landscape touch kiosk **and** visitors' phones (responsive).
- **Look:** refined dark — warm charcoal-brown base, saffron/gold accents, ivory text.
- **Scope:** all visitor pages, both Cesium maps, and admin.
- **Depth:** shared design system everywhere; weak pages (quiz, slideshow, admin)
  get rebuilt layouts; maps get visual polish only (features unchanged).

## Design system

- **Type:** Cormorant Garamond for headings (display scale), DM Sans for body/UI.
  Defined once in `globals.css` with CSS variables.
- **Palette (CSS vars in `globals.css`):** deep charcoal-brown background
  (`#171310` range, less red mud), surface cards `rgba` ivory glass, accents
  saffron `#E07B2E` and gold `#D4A34F`, text ivory `#F5EDE0` / muted `#A99880`.
- **Components:** consistent card (rounded-2xl, hairline gold border, soft
  shadow), button styles (primary saffron, ghost), chip/badge, min 48px touch
  targets, subtle press/hover motion.
- **Icons:** inline SVG line icons (single shared component), replacing emoji.

## Pages

- **Home:** full-height hero — portrait treated intentionally (side panel or
  duotone block, not a faint watermark), title, one rotating quote, then a
  balanced module grid (3×2 on kiosk, 1-col on phone) that fills the viewport.
- **Guide:** sticky zone filter bar, cleaner station cards with clearer
  hierarchy (zone → number → title), refined language picker, install banner
  restyled to match theme.
- **Quiz:** list page becomes an inviting start screen — hero card per quiz
  with description, question count, duration, pass mark, certificate teaser,
  big Start CTA. In-quiz screens restyled (progress, options as large touch
  cards, result/certificate).
- **Slideshow:** topic cards show a real cover image (first slide image where
  available, fallback gradient), cleaner viewer chrome.
- **Chat:** restyle to system (it's a secondary page; home links externally).
- **Admin:** same tokens applied to nav, tables, forms, modals. Function
  untouched.

## Maps (both static Cesium apps)

- Refined pins: glowing dots with halo on travels map; declutter the stacked
  billboard pins on centres map (smaller markers, cluster or scale by zoom).
- Panels, headers, timeline, chips restyled to match the design system.
- No data or interaction-model changes.

## Non-goals

- No new features, routes, or API changes.
- No light theme.
- No changes to map data files.

## Verification

Playwright screenshots at 1280×800 (kiosk) and 390×844 (phone) for every
visitor page + both maps + admin, reviewed visually. `npm run lint` passes.
