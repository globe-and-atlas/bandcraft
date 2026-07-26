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
- [x] All 22 Vitest unit tests pass cleanly
- [x] Vite production bundle builds without errors
- [x] App is registered in `app-studio/apps.json` on port 4257

## Progress Log

### 2026-07-26 17:31 — Spectral Reflectance Signature Curve Inspector & Band Wavelength Markers Complete
- Created `SpectralCurveInspector.tsx` SVG chart component
- Rendered continuous spectral reflectance curve graphs (%) across wavelengths (400nm – 2200nm) for all 7 index families
- Plotted Band Wavelength Markers for `B02` Blue, `B03` Green, `B04` Red, `B05` RedEdge, `B08` NIR, `B11` SWIR-1, and `B12` SWIR-2
- Highlighted active recipe bands with glowing marker lines, value chips, and APES spectral physics explanations
- Verified all 22 unit tests pass and Vite production bundle compiles cleanly (0 errors)
- Captured browser QA screenshot (`ndbi_spectral_curve_1785105064845.png`) on `http://localhost:4257/`
