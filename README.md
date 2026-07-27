# Limn Signal

*A Globe & Atlas game of spectral bandcraft.*

Limn Signal is an interactive remote-sensing lab for AP Environmental Science (APES). Students combine sensor band roles, evaluate documented spectral-index formulas, compare Sentinel-2 MSI and Landsat-8 OLI/TIRS band numbering, and inspect the physical reasoning behind each result.

It is a standalone educational project in the Globe & Atlas / Limn-Atlas ecosystem.

## What is included

- Real 2-band and 3-band index recipes, including NDVI, NDWI, NDBI, NBR, EVI, NDRE, and MNDWI.
- Sensor-aware band cards for Sentinel-2 and Landsat-8.
- A Field Guide covering the missions, sensors, and environmental applications.
- Simulated true-color and false-color index views.
- A spectral reflectance curve inspector with active-band markers.
- A satellite-pass landing screen using the generated artwork in `public/satellite-pass.png`.

Unmatched band pairs receive an honest explanation instead of being presented as a fabricated scientific result.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Verify

```bash
npm run test:unit
npm run build
```

## Project structure

- `src/data/` — band definitions, index formulas, mission data, and unit tests
- `src/App.tsx` — the main workbench and landing screen
- `src/FieldGuide.tsx` — mission and sensor reference material
- `src/SplitSatelliteViewer.tsx` — true-color / simulated-index comparison view
- `src/SpectralCurveInspector.tsx` — reflectance signature visualization
- `public/cards/` — card artwork used by the index recipes

## Imagery

The index-card imagery is credited in the in-app Field Guide. The landing-screen satellite artwork is included as presentation art for this prototype.

## Status

Limn Signal is an actively developed educational prototype and free web release. Its Formula Lab uses hand-authored teaching signatures to demonstrate hypothesis testing and confuser analysis; it does not claim automated index discovery or scientific validation. The current app is intentionally focused on inspectable band math rather than an economy or resource-limiting game loop.
