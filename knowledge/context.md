# Project Context

## Identity

- Name: `bandcraft`
- Profile: `frontend-app`
- Deploy: `vercel`
- Runtime: `node`

## Purpose

A browser game for AP Environmental Science students that teaches real remote-sensing band math: combine two real spectral bands, get a real named index (NDVI, NDWI, NDBI, NBR) when the pair is a genuine formula, get an honest explanation when it isn't. See `knowledge/DECISIONS.md` (2026-07-26) for why the original relic-rack-v2-derived trading-game mechanic was removed rather than incrementally patched.

## Constraints

- Every craftable output must be a real, verifiable formula (`src/data/indices.ts`) — no designer-invented "plausible" results, ever, even for flavor.
- Card art must be real, properly licensed imagery (NASA public domain, or ESA/Copernicus with the required attribution) — see the Field Guide credits line and `src/data/indices.ts`'s recipe `cardArt` fields for what's actually in use.
- Target audience is AP Environmental Science specifically, not undergrad — real formulas and units are fine, but not multi-band-per-domain nuance (e.g. only one SAR mission, one DEM mission in the Field Guide) or physics beyond what APES covers (e.g. no radar frequency/GHz numbers, no interferometry jargon).

## Out of Scope

- Terrain (DEM/slope) and Radar (SAR backscatter) suits are reference-only in the Field Guide — they don't reduce to a two-band ratio index the way NDVI-style math does, so they're deliberately not craftable rather than forced into a fake recipe.
- No gold/economy/night-structure/resource-limiting mechanic — removed 2026-07-26 as complexity unrelated to the teaching goal.
