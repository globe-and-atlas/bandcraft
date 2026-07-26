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
