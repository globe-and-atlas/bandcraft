# Decisions

## Initial Decision

- Template profile: `frontend-app`
- Deploy target: `vercel`
- Runtime: `node`

## 2026-07-26 — Replaced lore-fusion economy with real band-combination mechanic

**Decision**: Removed the entire `relic-rack-v2`-derived trading-game economy (gold, 7-night structure, drone-battery resource limit, Pilgrim/mission-brief buyer, Equipment Depot market, Cabinet power-ups, Grimoire/Catalogue) and its fusion mechanic (two lore cards combine into a designer-written output via an authored lookup table). Replaced with: 7 real spectral band cards (always available, non-depleting) that combine into exactly 4 curated real index recipes (NDVI, NDWI, NDBI, NBR), each a genuine `(A − B) / (A + B)` formula. Non-recipe combinations get an honest, specific explanation instead of a fabricated result. Terrain and Radar suits were dropped from the craftable set (kept as Field Guide reference only) since DEM slope analysis and SAR backscatter aren't two-band ratio indices — forcing a fake index for them would have recreated the exact problem being fixed.

**Alternatives considered**: (1) Keep the fusion mechanic but only patch the correspondence table with "more accurate" lore — rejected, since the core problem was designer-invented outputs masquerading as science, not merely under-researched ones. (2) Keep the full economy wrapper and only change the recipe table — rejected per explicit user direction that "the whole loop" (not just fusion) was the complexity problem. (3) Find real formulas for Terrain/Radar too (e.g. Radar Vegetation Index, terrain ruggedness index) — rejected for v1 as added complexity at the exact moment the goal was simplification; left as a possible fast-follow.

**Reason**: An educational tool whose central mechanic doesn't teach the thing it claims to teach (real remote-sensing band math) undermines its own purpose, however polished the surrounding game economy is. The original fork carried forward relic-rack-v2's full mechanic wholesale, not just its visual theme — see `task.md`'s Progress Log for the session history.

**How to apply**: Any new feature must route through real formulas/real data (see `src/data/indices.ts`), never an invented "plausible" output. If a future suit/domain doesn't reduce to real band math the game already supports, it stays reference-only in the Field Guide rather than getting a fabricated craftable recipe.

## 2026-07-26 — Keep formula discovery bounded and separate from known indices

**Decision**: Added a separate Formula Lab with six curated formula archetypes and two-to-four ordered band roles. The player must choose a target and state a physical hypothesis before running a 15-signature confuser challenge. Candidate formulas receive contrast, pairwise robustness, and interpretability scores plus comparison with an established target-specific baseline.

**Boundary**: The teaching signatures are hand-authored plausible reflectance values, not measured observations, training labels, or validation data. Results are always marked experimental, never unlock or name a known index, and cannot support scientific novelty or performance claims. Thermal T10 is excluded because the lab currently models reflected-light relationships.

**Reason**: Exhaustive permutation would produce search noise and encourage correlation hunting. A bounded hypothesis → formula → refutation loop teaches the role of formula structure while making failure and confounding surfaces visible.

**How to apply**: New formula families require a plain-language physical interpretation, safe denominator behavior, deterministic tests, and a clear complexity cost. Any future real-data mode must use versioned independent labels, geographic and temporal holdouts, uncertainty reporting, and established-index baselines.

## 2026-07-27 — Adopt tsc as a checker-only gate alongside Vite's esbuild build

**Decision**: Added a `tsconfig.json` (strict, `noEmit`, `noUnusedLocals`/`noUnusedParameters`) plus a `typecheck` npm script wired into CI ahead of the unit tests.

**Reason**: The project had no `tsconfig.json` at all. Vite builds through esbuild, which strips TypeScript types without checking them, and CI ran only `test:unit` + `build` — so nothing in the repo, locally or in CI, ever typechecked. Type errors could ship silently. Enabling it immediately surfaced a genuine (if runtime-benign) narrowing error in `SpectralCurveInspector.tsx` and independently confirmed a cluster of dead state in `App.tsx`.

**Alternatives considered**: Folding `tsc -b` into the `build` script — rejected because it slows the dev/deploy path for a check that belongs in CI, and Vite still owns emit either way. `noEmit: true` keeps the roles unambiguous: esbuild builds, tsc only judges.

**How to apply**: `npm run typecheck` must pass before any commit. Treat `noUnusedLocals` findings as real signal rather than noise — in this codebase the first run found actual dead code, not false positives.

## 2026-07-27 — Modal keyboard behaviour lives in a shared hook, not per-modal

**Decision**: Added `src/useModalA11y.ts` providing Escape-to-close, a Tab focus trap, focus restore to the triggering element, and background scroll lock. Applied to the Field Guide modal.

**Reason**: The Field Guide had correct static ARIA (`role="dialog"`, `aria-modal`, `aria-labelledby`) but no keyboard behaviour — a keyboard user could not close it with Escape, and Tab walked straight out into the page behind. Static ARIA without keyboard handling reads as accessible while failing the users it claims to serve.

**How to apply**: Any new modal attaches `useModalA11y`'s ref to its `role="dialog"` element rather than reimplementing key handling. The hook stores `onClose` in a ref so callers can keep passing inline arrow functions without reinstalling listeners each render.

## 2026-07-27 — Removed the inherited occult artwork from the work surface and modals

**Decision**: Deleted `public/hero.png` (an alchemist's table) and `public/card_bg.png` (an occult sigil plate with pentagrams, ravens, ouroboros and zodiac glyphs), both inherited from the relic-rack-v2 fork. `.center-shell` now uses a faint cyan graticule over flat navy; `.catalogue-modal` uses a flat dark panel. Also dropped the dead `.relic-item` rule that referenced the same art.

**Reason**: `hero.png` backed the entire main work surface and was fully visible whenever no index was computed — which is the first thing a student sees. `card_bg.png` sat behind the Field Guide and satellite spec modals. Occult iconography behind a classroom AP Environmental Science reference is the wrong signal on its own terms, and it directly undercuts the scientific-honesty posture the rest of the project has been built around. A photographic backdrop also competed with the band cards and equation for legibility.

**How to apply**: Backdrops on working surfaces stay flat and instrument-like. Any decorative asset carried over from the fork should be looked at rendered, not just checked for whether it is referenced — `hero.png` survived an earlier dead-asset sweep precisely because the check was "is it referenced" rather than "what is it".

## 2026-07-27 — Empty state teaches instead of waiting

**Decision**: Replaced the single dim hint line in the computation panel with a proper empty state: a lead line, one sentence of physical reasoning, and three one-click starter recipes (NDVI, NDWI, NBR) that route through the normal `evaluateCombination` path.

**Reason**: The panel occupied a large share of the work surface and said only "Select 2 or 3 spectral bands above". A student who does not yet know which bands pair up had no way in. Routing the starters through the real evaluate path (rather than setting the result directly) means the computation they see is identical to the one they would get by clicking the bands themselves.

**How to apply**: Give the panel a `min-height` floor so the layout does not lurch when a result replaces the empty state.

## 2026-07-27 — All modals route through one shell

**Decision**: Added `src/ModalShell.tsx` (backdrop + dialog wrapper that applies `useModalA11y`) and wired the index-info modal through it. `SatelliteModal` got the hook plus the `tabIndex={-1}` it needs for focus to land on the dialog.

**Reason**: The ARIA and the keyboard behaviour had drifted apart across three modals. `FieldGuide` had both. `SatelliteModal`, added later, had correct `role="dialog"`/`aria-modal`/`aria-labelledby` but no Escape, focus trap, focus restore, or scroll lock. The index-info modal was a bare `div` with inline styles — no dialog role at all, invisible to assistive tech as a dialog, and no way out via the keyboard. Building a reusable hook was not enough on its own; a new modal still shipped with half the behaviour.

**How to apply**: New modals use `ModalShell` rather than composing a backdrop by hand. A dialog root needs `tabIndex={-1}` or `.focus()` silently does nothing on a div — verify focus actually lands on the dialog, don't assume the hook did it.

## 2026-07-27 — Formula shapes wrap instead of truncating

**Decision**: `.lab-template-button code` now wraps (`white-space: normal; overflow-wrap: anywhere`) instead of ellipsizing. Removed the hardcoded `max-width: 105px` on `.back-band-name` in favour of flex sizing.

**Reason**: In the Formula Lab's 6-column layout the four-band shapes were cut to `(A + B − C − D) / (A + …`, and the formula is the only thing those cards exist to communicate. Similarly the flip-card back clipped "Near-Infrared (NIR)" against a 105px cap on cards roughly three times that wide.

**How to apply**: Truncation is acceptable for labels and secondary metadata, not for the formula itself. Prefer flex sizing over fixed pixel caps — the cap was invisible until measured in the browser.
