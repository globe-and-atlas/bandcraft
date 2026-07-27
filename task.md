# Task: Bandcraft (APES Edition)

## Objective

Create a standalone web fork of `relic-rack-v2` tuned specifically for High School / AP Environmental Science (APES) education — replacing occult lore with satellite spectral bands, GIS indices, field officers, and environmental mission milestones.

## Context

- Deploy target: `web / free educational release`
- Runtime: `React 19 + TypeScript + Vite`
- Workspace path: `/Users/danielbally/Git/bandcraft`
- App Launcher Port: `4257`

## Acceptance Criteria

- [x] Base repository `relic-rack-v2` is forked to `/Users/danielbally/Git/bandcraft`
- [x] Relics are re-skinned into 12 satellite spectral band cards (Green Tree Map, Infrared Heat Map, Water Scanner, Radar Scan, etc.)
- [x] Card Suits / Hands are re-skinned into 6 GIS environmental families (Flora Canopy, Thermal Surface, Hydro Surface, Terrain Elevation, Urban Infrastructure, Radar Backscatter)
- [x] Pilgrims are re-skinned into 6 Field Officers & Mission Directors (Park Ranger Pete, Disaster Relief Sam, Coast Guard Kai, etc.)
- [x] Votive Feast Pledges are re-skinned into Environmental Mission Milestones (Wildfire Safety, Regional Ecosystem)
- [x] UI upgraded to a professional GIS multispectral sensing workstation aesthetic (removing youth/cartoonish elements)
- [x] Implemented Satellite Mode Switcher (`All Sensors`, `Sentinel-2 MSI Mode`, `Landsat-8 OLI/TIRS Mode`)
- [x] Implemented 3-band spectral index support (EVI - Enhanced Vegetation Index, NDRE, MNDWI)
- [x] Implemented Simulated False-Color Index Raster Overlay Engine (`SimulatedIndexOverlay` canvas component transforming the exact same aerial geometry into an authentic simulated index raster overlay)
- [x] Implemented clean 50/50 side-by-side dual satellite comparison panel view at 1:1 scale (Left: True Color RGB Satellite Context, Right: False Color Index Raster Overlay)
- [x] Integrated Limn Atlas metadata HUD banner below the dual satellite panel
- [x] Implemented Spectral Reflectance Signature Curve Inspector (`SpectralCurveInspector`) with continuous reflectance graph (400nm – 2200nm), Band Wavelength Markers (`B02` through `B12`), active band percentage chips, and APES spectral physics tips adapted from ExploreReflectance
- [x] Enhanced "Build an Index" into a live real-time physics sandbox: moving reflectivity sliders dynamically updates: 1) live spectral curve band dots, 2) live numerical worked equation, 3) live scale bar needle pin, and 4) live surface raster pixel swatch color
- [x] Implemented 3D Flippable Band Cards (`FlippableBandCard`): each card features a glowing ⓘ info icon on top-right that smoothly flips the card in 3D (`rotateY(180deg)`) to reveal scientific specs (center wavelength, bandwidth, spatial resolution, and APES Environmental Physics role)
- [x] Unlocked all 7 satellite indices by default for open educational exploration: replaced mystery question-mark lock boxes with an open **Index Reference Library** displaying formula chips, suit badges, real NASA card art, and instant load/evaluate triggers
- [x] All 37 Vitest unit tests pass cleanly
- [x] Vite production bundle builds without errors
- [x] App is registered in `app-studio/apps.json` on port 4257

## Progress Log

### 2026-07-26 18:13 — All 7 Satellite Indices Unlocked by Default
- Removed lock-wall mechanism (`? Locked`) so all 7 satellite indices (NDVI, EVI, NDWI, MNDWI, NDRE, NDBI, NBR) are instantly accessible for open educational reference
- Transformed right sidebar into **Index Reference Library** with NASA thumbnails, suit glyphs, mathematical formulas, and active index glowing badges
- Updated header badge to `7 SATELLITE INDICES AVAILABLE`
- Verified all 37 unit tests pass and Vite production bundle compiles cleanly (0 errors)
