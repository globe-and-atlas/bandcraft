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
- [x] Unlocked all satellite indices by default for open educational exploration: replaced mystery question-mark lock boxes with an open **Index Reference Library** displaying formula chips, suit badges, real NASA card art, and instant load/evaluate triggers
- [x] Restored the preferred satellite orbital imagery (`satellite-pass.png`) on the loading/title screen background
- [x] Implemented Interactive Satellite Mission Spec Sheet Modals (`SatelliteModal.tsx`) for Sentinel-2 MSI and Landsat-8 OLI/TIRS: detailing operating agency (ESA vs NASA/USGS), launch dates, orbital revisit rates (5 vs 16/8 days), altitude, sensor payload resolutions (10m vs 30m vs 100m), APES learning benefits (Red Edge 705nm vs Thermal Band 10 LST heat islands), and full spectral band tables
- [x] Refined Flippable Band Card UI: 1) fixed ⓘ info button positioning to sit 100% inside the card frame at top-right (`top: 6px; right: 6px`), and 2) moved the satellite sensor tag chip (`Sentinel-2 B02`, `Landsat-8 Band 2`) into the bottom card band name section to prevent top overlapping
- [x] Simplified Satellite Toolbar Info Buttons: removed text `"Mission Specs"` while retaining the glowing colored info icons (`ⓘ`) attached to Sentinel-2 and Landsat-8 toolbar buttons
- [x] Upgraded top-left index card suit icons (`.index-suit-chip`) to vibrant color-coded glowing badges (Emerald Green for Flora, Ocean Blue for Hydro, Crimson/Flame Orange for Fire, Violet for Urban, Amber for Soils)
- [x] Fixed sidebar container scrolling (`max-height: calc(100vh - 130px)` + `overflow-y: auto`) so all 25 index buttons across all 5 categories (`Flora 7`, `Hydro 5`, `Fire 6`, `Urban 4`, `Soils 3`) are 100% visible and smoothly scrollable
- [x] Placed the Band Count Tag (`1 BAND`, `2 BANDS`, `3 BANDS`, `4 BANDS`) inline on the exact same row as the index acronym title on the text plate below the image
- [x] Updated all loading screen copy, subtitle headers, and toolbar chips from 7 indices to **25 PROVEN SATELLITE INDICES**
- [x] Upgraded `SimulatedIndexOverlay` in `src/SplitSatelliteViewer.tsx` so all 25 indices feature authentic false-color simulated raster overlays (thermal ramps for LST/UTFVI, lime bloom for NDCI, sediment amber for NDTI, terracotta for BSI, magenta for CMI, neon heat grid for NDBI/UI/IBI/EBBI)
- [x] Overhauled **Formula Lab** UI/UX into an intuitive **Custom Index Laboratory & Stress-Test Challenge**: added 4 1-click Preset Chips (*⚡ Load NDVI*, *💧 Load NDWI*, *🔥 Load NBR*, *🏗️ Load NDBI*), visual band color dots, live mathematical formula expression banner, Toughest Confuser Matchup card, and a visual 15-surface spectral response bar chart!
- [x] All 41 Vitest unit tests pass cleanly
- [x] Vite production bundle builds without errors
- [x] App is registered in `app-studio/apps.json` on port 4257

## Progress Log

### 2026-07-27 08:59 — Formula Lab UI/UX Overhaul Completed
- Transformed Formula Lab in `src/FormulaLab.tsx` into an intuitive Custom Index Laboratory
- Added 4 1-click Preset Chips (*Load NDVI*, *Load NDWI*, *Load NBR*, *Load NDBI*)
- Added glowing band color dots & wavelength badges to role selectors
- Added Toughest Confuser Matchup card and visual 15-surface spectral response bar chart
- Verified all 41 unit tests pass and Vite production bundle compiles cleanly (0 errors)
