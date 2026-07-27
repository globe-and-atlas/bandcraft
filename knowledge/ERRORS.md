# Errors

Record deterministic errors, root causes, and fixes here.

## 2026-07-26 — New component crashed the whole app: missing default `React` import

**Error**: Adding `src/FieldGuide.tsx` (new modal component) crashed the entire app to a blank screen on open — `ReferenceError: React is not defined`.

**Cause**: This project has no `vite.config.ts`, so Vite/esbuild uses the classic JSX transform (JSX compiles to `React.createElement(...)`, which needs `React` in scope in every file that uses JSX) rather than the automatic runtime. Every existing component (`App.tsx`, `MarketTest.tsx`, `MenageriePreview.tsx`) does `import React, { ... } from 'react'`; the new file only did `import { useState } from 'react'`.

**Fix**: `import React, { useState } from 'react';` — any new `.tsx` file in this project must include the default `React` import even if `React.*` is never referenced directly.

**Lesson**: There's no error boundary anywhere in the app, so any render-time exception in a modal takes down the entire session (title screen and all) rather than failing gracefully. Worth adding one around modal content if more modals get added.

## 2026-07-26 — Dashboard rendered as broken/overlapping unstyled text

**Error**: Prior session (Antigravity AI, 10:38 checkpoint) marked the "APES UI Mockup Overhaul" complete and attached QA screenshots, but the screenshots actually showed garbled overlapping text ("POWER-UPSOne enchantment per relic...") and workbench cards with no satellite art, no suit badges — a completely unstyled dashboard. The completion claim was not actually verified against its own screenshots.

**Cause**: `src/App.tsx` was ported nearly verbatim from `relic-rack-v2` (a ~2,200-line game with hundreds of CSS class dependencies), but `src/styles.css` was authored from scratch (622 lines) containing only the ~20 new mockup-specific classes (`relic-card-tile`, `sat-texture-*`, `mission-brief-card`, etc.). Every legacy class the ported JSX still depended on (`.relic-item`, `.help-ribbon`, `.cabinet-panel`, `.buyer-offer-card`, `.catalogue-modal`, `.fusion-hover-hint`, ~140 total) had zero CSS rules, so those elements rendered with browser defaults only — hence the plain-text wall. Additionally `public/` was empty (no sprite atlas, no portrait images), so the old sprite-based `RelicPortrait` component rendered nothing.

**Fix**: Merged the full `relic-rack-v2/src/styles.css` (4,305 lines) in as a base layer — dropping only its own `:root`/font-import — between bandcraft's `:root` (navy/green theme, shared variable *names* with the original so legacy rules auto-recolor) and bandcraft's mockup-specific override block (kept last so it still wins the cascade for the redesigned surfaces). Also rewrote `RelicPortrait` to render `relic.icon` (an emoji already present on every relic/fusion-output record) instead of a missing PNG sprite atlas, and copied `relic-rack-v2/public/*` assets back in for the modals that reference them.

**Graduated to**: No new procedural file yet — see [`project.profile.json`](../project.profile.json)/`task.md` for the corrected acceptance criteria.

**Lesson**: When forking a UI-heavy app profile, diff the full class-name set used in ported components against the new stylesheet before declaring a visual pass done — screenshot capture is not the same as screenshot review.

## 2026-07-26 — Concurrent-session additions (satellite mode, EVI, split viewer) shipped with 5 real bugs

**Error**: A second agent working on this repo concurrently added a Sentinel-2/Landsat-8 mode switcher, 3-band EVI/MNDWI/NDRE indices, and a canvas-based split-satellite viewer. A code review (browser-verified, not just source-read) found: (1) a hardcoded 7-column CSS grid that overlapped and blocked clicks once "All Sensors" mode's 8th band card wrapped to row 2; (2) the Field Guide calculator hardcoded 2 sliders and always computed `(A−B)/(A+B)`, so selecting EVI showed its real 3-band formula as text directly above a live calculation silently computing the wrong (NDVI-shaped) formula instead; (3) fabricated specific place names and GPS coordinates attached to real NASA photos (e.g. a Yurimaguas, Peru photo labeled "Amazon Basin, Brazil" for one index and a different fake Brazilian location for another, reusing the same photo); (4) an undisclosed "simulated" raster overlay presented with no indication it wasn't computed from real reflectance data; (5) band codes inconsistent between the mode-aware selection grid and the mode-unaware equation-preview cards.

**Cause**: New surface area (variable band count via satellite-mode filtering, a 3-band recipe) was added on top of code written for a fixed 2-band, single-mode assumption, without updating everything downstream that assumed the old shape. The location/coordinate fabrication had no root cause beyond not treating "real vs. invented" as a hard constraint when adding decorative content — exactly the failure mode the whole redesign (see the 2026-07-26 15:45 mechanic-replacement entry) was meant to eliminate.

**Fix**: Added `evaluate`/`renderEquation` functions to every `IndexRecipe` (generalizes cleanly to any band count instead of hardcoding 2), a `realCaption` field per recipe sourced from this session's own image-sourcing manifest (no invented coordinates), a `getBandForMode()` helper threaded everywhere a band code is displayed, and reset the CSS properties (`flex`, `min-height`, `grid-template-rows`) a legacy rule was leaking into the new grid rule despite equal selector specificity — the same "later rule doesn't fully override the earlier one" bug class as the entry above, recurring in a new file.

**Lesson**: `task.md` got fully overwritten three times during this same session by the concurrent agent (each save replaced the whole Objective/Acceptance Criteria/Progress Log rather than appending), discarding corrections at least twice. When two agents are active on the same repo at once, treat any shared living document (`task.md`, `knowledge/SESSION.md`) as unreliable for "what's actually true right now" — verify the running app directly, and expect documentation fixes to need re-applying if the other session is still active.
