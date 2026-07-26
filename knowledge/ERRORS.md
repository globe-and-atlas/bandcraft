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
