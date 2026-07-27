import type { FamilyId } from './suits';

export type BandId = 'blue' | 'green' | 'red' | 'rededge' | 'nir' | 'swir1' | 'swir2' | 'thermal';

export type SatelliteMode = 'all' | 'sentinel2' | 'landsat8';

export interface Band {
  id: BandId;
  bandCode: string;
  sentinelCode?: string;
  landsatCode?: string;
  name: string;
  wavelength: string;
  resolution: string;
  sensorTag: string;
  color: string;
  satellites: Array<'sentinel2' | 'landsat8'>;
  bandwidth: string;
  physicsRole: string;
  primaryUse: string;
}

export const BANDS: Band[] = [
  {
    id: 'blue',
    bandCode: 'B02',
    sentinelCode: 'B02',
    landsatCode: 'B02',
    name: 'Blue (VIS)',
    wavelength: '490 nm',
    resolution: '10m',
    sensorTag: 'Sentinel-2 / Landsat-8',
    color: '#3b82f6',
    satellites: ['sentinel2', 'landsat8'],
    bandwidth: '458 – 523 nm',
    physicsRole: 'Absorbed strongly by leaf chlorophyll-a for photosynthesis. Scatters in clear atmosphere and coastal water.',
    primaryUse: 'Atmospheric aerosol correction, EVI formula, coastal water clarity, soil vs vegetation discrimination.'
  },
  {
    id: 'green',
    bandCode: 'B03',
    sentinelCode: 'B03',
    landsatCode: 'B03',
    name: 'Green (VIS)',
    wavelength: '560 nm',
    resolution: '10m',
    sensorTag: 'Sentinel-2 / Landsat-8',
    color: '#10b981',
    satellites: ['sentinel2', 'landsat8'],
    bandwidth: '543 – 578 nm',
    physicsRole: 'Reflected by plant leaf chlorophyll pigments, giving healthy vegetation its green visual color.',
    primaryUse: 'Peak visual vegetation reflection, NDWI water body detection, shallow aquatic mapping.'
  },
  {
    id: 'red',
    bandCode: 'B04',
    sentinelCode: 'B04',
    landsatCode: 'B04',
    name: 'Red (VIS)',
    wavelength: '665 nm',
    resolution: '10m',
    sensorTag: 'Sentinel-2 / Landsat-8',
    color: '#ef4444',
    satellites: ['sentinel2', 'landsat8'],
    bandwidth: '650 – 680 nm',
    physicsRole: 'Absorbed heavily by chlorophyll-a and b. Low red reflectance indicates healthy active plant growth.',
    primaryUse: 'NDVI vegetation denominator, crop health assessment, soil cover differentiation.'
  },
  {
    id: 'rededge',
    bandCode: 'B05',
    sentinelCode: 'B05',
    name: 'Red Edge (VRE)',
    wavelength: '705 nm',
    resolution: '20m',
    sensorTag: 'Sentinel-2 MSI Only',
    color: '#f43f5e',
    satellites: ['sentinel2'],
    bandwidth: '698 – 713 nm',
    physicsRole: 'Sentinel-2 exclusive! Lies directly on the steep spectral boundary between Red absorption and NIR reflection.',
    primaryUse: 'Early detection of crop nitrogen stress, leaf chlorophyll variations, forest canopy decline.'
  },
  {
    id: 'nir',
    bandCode: 'B08',
    sentinelCode: 'B08',
    landsatCode: 'B05',
    name: 'Near-Infrared (NIR)',
    wavelength: '842 nm',
    resolution: '10m',
    sensorTag: 'Sentinel-2 / Landsat-8',
    color: '#a855f7',
    satellites: ['sentinel2', 'landsat8'],
    bandwidth: '785 – 899 nm',
    physicsRole: 'Reflected strongly by internal leaf mesophyll structure; absorbed almost 100% by liquid surface water.',
    primaryUse: 'Vegetation canopy density (NDVI/EVI), open water body extraction (NDWI), biomass estimation.'
  },
  {
    id: 'swir1',
    bandCode: 'B11',
    sentinelCode: 'B11',
    landsatCode: 'B06',
    name: 'SWIR-1',
    wavelength: '1610 nm',
    resolution: '20m',
    sensorTag: 'Sentinel-2 / Landsat-8',
    color: '#f59e0b',
    satellites: ['sentinel2', 'landsat8'],
    bandwidth: '1565 – 1655 nm',
    physicsRole: 'Sensitive to plant canopy moisture content and rooftop/concrete reflectivity. Penetrates atmospheric haze.',
    primaryUse: 'Urban built-up index (NDBI), leaf moisture stress, MNDWI urban water extraction, cloud vs snow.'
  },
  {
    id: 'swir2',
    bandCode: 'B12',
    sentinelCode: 'B12',
    landsatCode: 'B07',
    name: 'SWIR-2',
    wavelength: '2190 nm',
    resolution: '20m',
    sensorTag: 'Sentinel-2 / Landsat-8',
    color: '#ea580c',
    satellites: ['sentinel2', 'landsat8'],
    bandwidth: '2100 – 2280 nm',
    physicsRole: 'Sensitive to soil mineral composition and burned, charred ground ash.',
    primaryUse: 'Normalized Burn Ratio (NBR), wildfire burn severity mapping, mineral & rock geological mapping.'
  },
  {
    id: 'thermal',
    bandCode: 'T10',
    landsatCode: 'T10',
    name: 'Thermal IR (TIRS)',
    wavelength: '10.9 µm',
    resolution: '100m',
    sensorTag: 'Landsat-8 TIRS Only',
    color: '#ec4899',
    satellites: ['landsat8'],
    bandwidth: '10.60 – 11.19 µm',
    physicsRole: 'Landsat-8 TIRS exclusive! Measures longwave thermal infrared energy emitted directly from Earth’s surface.',
    primaryUse: 'Land surface temperature (LST), urban heat island intensity, drought monitoring, volcanic hotspots.'
  }
];

export function getBandsForMode(mode: SatelliteMode): Band[] {
  if (mode === 'all') return BANDS;
  return BANDS.filter(b => b.satellites.includes(mode)).map(b => ({
    ...b,
    bandCode: mode === 'landsat8' && b.landsatCode ? b.landsatCode : (b.sentinelCode || b.bandCode),
    sensorTag: mode === 'sentinel2' ? 'Sentinel-2A MSI' : 'Landsat-8 OLI/TIRS'
  }));
}

export function getBand(id: BandId): Band {
  const band = BANDS.find(b => b.id === id);
  if (!band) throw new Error(`Unknown band: ${id}`);
  return band;
}

export function getBandForMode(id: BandId, mode: SatelliteMode): Band {
  return getBandsForMode(mode).find(b => b.id === id) ?? getBand(id);
}

export interface IndexScaleEntry {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface IndexRecipe {
  id: string;
  name: string;
  formula: string;
  bands: BandId[];
  suit: FamilyId;
  meaning: string;
  cardArt: string;
  realCaption: string;
  scale: IndexScaleEntry[];
  satelliteTag?: string;
  categoryName: string;
  evaluate: (values: number[]) => number;
  renderEquation: (values: number[]) => string;
}

export function normalizedDifference(a: number, b: number): number {
  const denominator = a + b;
  if (denominator === 0) return 0;
  return (a - b) / denominator;
}

function normalizedDifferenceRecipe(): { evaluate: (values: number[]) => number; renderEquation: (values: number[]) => string } {
  return {
    evaluate: ([a, b]) => normalizedDifference(a, b),
    renderEquation: ([a, b]) => `(${a} − ${b}) / (${a} + ${b}) = ${normalizedDifference(a, b).toFixed(2)}`
  };
}

function calculateEVI(nir: number, red: number, blue: number): number {
  const denominator = nir + 6 * red - 7.5 * blue + 1;
  if (denominator === 0) return 0;
  return (2.5 * (nir - red)) / denominator;
}

export const INDEX_RECIPES: IndexRecipe[] = [
  // 1. PRIMARY CANONICAL CRAFTABLE RECIPES (7) — Placed first for band-pair resolution
  {
    id: 'ndvi',
    name: 'NDVI — Normalized Difference Vegetation Index',
    formula: '(NIR − Red) / (NIR + Red)',
    bands: ['nir', 'red'],
    suit: 'flora',
    categoryName: 'Flora & Agriculture',
    meaning: 'Reveals how much healthy, dense vegetation is present. Leaves reflect NIR strongly and absorb Red for photosynthesis, so a big NIR-Red gap means healthy plant cover.',
    cardArt: '/cards/green-tree-map.jpg',
    realCaption: 'Amazon rainforest canopy near Yurimaguas, Peru — Landsat 7, NASA Earth Observatory.',
    scale: [
      { min: -1, max: -0.1, label: 'Water (and often clouds) — strongly absorbs NIR', color: '#1e3a8a' },
      { min: -0.1, max: 0.1, label: 'Bare soil, rock, sand, or snow', color: '#d97706' },
      { min: 0.1, max: 0.4, label: 'Shrub and grassland (moderate vegetation)', color: '#a3e635' },
      { min: 0.4, max: 1, label: 'Dense forest or peak-season crops', color: '#15803d' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'evi',
    name: 'EVI — Enhanced Vegetation Index',
    formula: '2.5 × (NIR − Red) / (NIR + 6×Red − 7.5×Blue + 1)',
    bands: ['nir', 'red', 'blue'],
    suit: 'flora',
    categoryName: 'Flora & Agriculture',
    meaning: 'Advanced 3-band index! EVI incorporates the Blue band to correct for atmospheric aerosols and soil background noise, preventing signal saturation over high-density rainforest canopy.',
    cardArt: '/cards/green-tree-map.jpg',
    realCaption: 'Amazon rainforest canopy near Yurimaguas, Peru — Landsat 7, NASA Earth Observatory.',
    satelliteTag: '3-Band Atmospheric',
    scale: [
      { min: -1, max: 0, label: 'Snow, water, or cloud cover', color: '#1e3a8a' },
      { min: 0, max: 0.2, label: 'Bare soil or sparse vegetation', color: '#d97706' },
      { min: 0.2, max: 0.5, label: 'Moderate canopy vegetation', color: '#a3e635' },
      { min: 0.5, max: 1, label: 'Dense rainforest or heavy crop canopy', color: '#15803d' }
    ],
    evaluate: ([nir, red, blue]) => calculateEVI(nir, red, blue),
    renderEquation: ([nir, red, blue]) =>
      `2.5 × (${nir} − ${red}) / (${nir} + 6×${red} − 7.5×${blue} + 1) = ${calculateEVI(nir, red, blue).toFixed(2)}`
  },
  {
    id: 'ndwi',
    name: 'NDWI — Normalized Difference Water Index',
    formula: '(Green − NIR) / (Green + NIR)',
    bands: ['green', 'nir'],
    suit: 'hydro',
    categoryName: 'Hydrology & Water Quality',
    meaning: 'Reveals open water. Water absorbs NIR strongly but still reflects some Green light, the opposite of vegetation — so water shows up as the high end of this index.',
    cardArt: '/cards/water-scanner.jpg',
    realCaption: 'Lake Mead, Nevada/Arizona — Landsat 8, NASA Earth Observatory.',
    scale: [
      { min: -1, max: -0.3, label: 'Built-up or very dry surfaces', color: '#475569' },
      { min: -0.3, max: 0, label: 'Dry-to-moderate vegetation', color: '#d97706' },
      { min: 0, max: 0.3, label: 'Moist soil or wet vegetation', color: '#38bdf8' },
      { min: 0.3, max: 1, label: 'Open water', color: '#1d4ed8' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'mndwi',
    name: 'MNDWI — Modified Normalized Difference Water Index',
    formula: '(Green − SWIR1) / (Green + SWIR1)',
    bands: ['green', 'swir1'],
    suit: 'hydro',
    categoryName: 'Hydrology & Water Quality',
    meaning: 'Replaces NIR with SWIR1 to eliminate urban built-up noise when extracting water bodies in rivers and coastal cities.',
    cardArt: '/cards/water-scanner.jpg',
    realCaption: 'Lake Mead, Nevada/Arizona — Landsat 8, NASA Earth Observatory.',
    satelliteTag: 'Urban Water Extraction',
    scale: [
      { min: -1, max: -0.2, label: 'Built-up land and soil', color: '#475569' },
      { min: -0.2, max: 0, label: 'Vegetation cover', color: '#d97706' },
      { min: 0, max: 0.3, label: 'Turbid or shallow water', color: '#38bdf8' },
      { min: 0.3, max: 1, label: 'Deep clear water', color: '#1d4ed8' }
    ],
    evaluate: ([green, swir1]) => normalizedDifference(green, swir1),
    renderEquation: ([green, swir1]) => `(${green} − ${swir1}) / (${green} + ${swir1}) = ${normalizedDifference(green, swir1).toFixed(2)}`
  },
  {
    id: 'ndre',
    name: 'NDRE — Normalized Difference Red Edge',
    formula: '(NIR − RedEdge) / (NIR + RedEdge)',
    bands: ['nir', 'rededge'],
    suit: 'flora',
    categoryName: 'Flora & Agriculture',
    meaning: 'Sentinel-2 exclusive! Uses the specialized 705nm Red Edge band to detect early crop stress and leaf chlorophyll variations before damage is visible in NIR or Red.',
    cardArt: '/cards/crop-health-scanner.jpg',
    realCaption: 'Center-pivot irrigated cropland, Kansas — ASTER aboard Terra, NASA Earth Observatory.',
    satelliteTag: 'Sentinel-2 Exclusive',
    scale: [
      { min: -1, max: 0.1, label: 'Bare soil or dead vegetation', color: '#d97706' },
      { min: 0.1, max: 0.3, label: 'Stressed crops or low chlorophyll', color: '#f59e0b' },
      { min: 0.3, max: 0.6, label: 'Healthy crop canopy', color: '#a3e635' },
      { min: 0.6, max: 1, label: 'Peak nitrogen / high chlorophyll canopy', color: '#15803d' }
    ],
    evaluate: ([nir, rededge]) => normalizedDifference(nir, rededge),
    renderEquation: ([nir, rededge]) => `(${nir} − ${rededge}) / (${nir} + ${rededge}) = ${normalizedDifference(nir, rededge).toFixed(2)}`
  },
  {
    id: 'ndbi',
    name: 'NDBI — Normalized Difference Built-up Index',
    formula: '(SWIR1 − NIR) / (SWIR1 + NIR)',
    bands: ['swir1', 'nir'],
    suit: 'urban',
    categoryName: 'Urban Infrastructure',
    meaning: 'Reveals built-up surfaces. Concrete, asphalt, and rooftops reflect short-wave infrared more than they reflect NIR — the opposite of vegetation and water.',
    cardArt: '/cards/urban-sprawl-map.jpg',
    realCaption: 'Palm Jumeirah and World Islands, Dubai — ISS astronaut photograph, NASA Earth Observatory.',
    scale: [
      { min: -1, max: -0.1, label: 'Water and vegetation (low built-up)', color: '#1e3a8a' },
      { min: -0.1, max: 0.1, label: 'Bare soil or sparse structures', color: '#3b82f6' },
      { min: 0.1, max: 0.3, label: 'Moderate built-up development', color: '#f97316' },
      { min: 0.3, max: 1, label: 'Dense urban core / heat island', color: '#fbbf24' }
    ],
    evaluate: ([swir1, nir]) => normalizedDifference(swir1, nir),
    renderEquation: ([swir1, nir]) => `(${swir1} − ${nir}) / (${swir1} + ${nir}) = ${normalizedDifference(swir1, nir).toFixed(2)}`
  },
  {
    id: 'nbr',
    name: 'NBR — Normalized Burn Ratio',
    formula: '(NIR − SWIR2) / (NIR + SWIR2)',
    bands: ['nir', 'swir2'],
    suit: 'thermal',
    categoryName: 'Wildfires & Burn Severity',
    meaning: 'Reveals fire and burn severity. Healthy vegetation reflects NIR strongly; burned, charred ground reflects far more SWIR2 and far less NIR, so recently burned areas drop sharply on this index.',
    cardArt: '/cards/thermal-fire-map.jpg',
    realCaption: '2021 California wildfires — Landsat 8, NASA Earth Observatory.',
    scale: [
      { min: -1, max: -0.1, label: 'Recently burned area / bare, charred ground', color: '#dc2626' },
      { min: -0.1, max: 0.1, label: 'Bare soil or sparse vegetation', color: '#f59e0b' },
      { min: 0.1, max: 0.4, label: 'Moderate vegetation', color: '#a3e635' },
      { min: 0.4, max: 1, label: 'Dense, healthy, unburned vegetation', color: '#15803d' }
    ],
    ...normalizedDifferenceRecipe()
  },

  // 2. ADDITIONAL PROVEN SCIENTIFIC SATELLITE RECIPES (18)
  {
    id: 'savi',
    name: 'SAVI — Soil-Adjusted Vegetation Index',
    formula: '(NIR − Red) / (NIR + Red + 0.5) × 1.5',
    bands: ['nir', 'red'],
    suit: 'flora',
    categoryName: 'Flora & Agriculture',
    meaning: 'Corrects NDVI for bare soil brightness using an adjustment factor (L=0.5). Reliable over deserts and early-season crops.',
    cardArt: '/cards/crop-health-scanner.jpg',
    realCaption: 'Irrigated cropland, Kansas — NASA Earth Observatory.',
    satelliteTag: 'Soil Corrected',
    scale: [
      { min: -1, max: 0, label: 'Bare soil or rock', color: '#d97706' },
      { min: 0, max: 0.3, label: 'Sparse vegetation', color: '#f59e0b' },
      { min: 0.3, max: 0.6, label: 'Moderate canopy cover', color: '#a3e635' },
      { min: 0.6, max: 1, label: 'Dense agricultural canopy', color: '#15803d' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'gndvi',
    name: 'GNDVI — Green Vegetation Index',
    formula: '(NIR − Green) / (NIR + Green)',
    bands: ['green', 'nir'],
    suit: 'flora',
    categoryName: 'Flora & Agriculture',
    meaning: 'Swaps Red for Green to measure nitrogen content and canopy chlorophyll concentration in mature crops.',
    cardArt: '/cards/green-tree-map.jpg',
    realCaption: 'Forest and agricultural canopy — Landsat 8, NASA Earth Observatory.',
    scale: [
      { min: -1, max: 0, label: 'Water and bare ground', color: '#1e3a8a' },
      { min: 0, max: 0.3, label: 'Low chlorophyll crops', color: '#f59e0b' },
      { min: 0.3, max: 0.7, label: 'Healthy green canopy', color: '#a3e635' },
      { min: 0.7, max: 1, label: 'Peak nitrogen crop canopy', color: '#15803d' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'msavi',
    name: 'MSAVI — Modified Soil-Adjusted Vegetation Index',
    formula: '(NIR − Red) / (NIR + Red)',
    bands: ['nir', 'red'],
    suit: 'flora',
    categoryName: 'Flora & Agriculture',
    meaning: 'Eliminates soil noise during early crop seedling growth before green canopy closes.',
    cardArt: '/cards/crop-health-scanner.jpg',
    realCaption: 'Early-season crop fields — NASA Earth Observatory.',
    satelliteTag: 'Seedling Growth',
    scale: [
      { min: -1, max: 0, label: 'Bare soil', color: '#d97706' },
      { min: 0, max: 0.3, label: 'Emerging seedlings', color: '#f59e0b' },
      { min: 0.3, max: 0.7, label: 'Developing crop canopy', color: '#a3e635' },
      { min: 0.7, max: 1, label: 'Closed green canopy', color: '#15803d' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'arvi',
    name: 'ARVI — Atmospherically Resistant Vegetation Index',
    formula: '(NIR − Red) / (NIR + Red)',
    bands: ['nir', 'red', 'blue'],
    suit: 'flora',
    categoryName: 'Flora & Agriculture',
    meaning: 'Uses the Blue band to correct for atmospheric haze, smoke, and aerosols downwind of wildfires.',
    cardArt: '/cards/green-tree-map.jpg',
    realCaption: 'Smoke-affected forest canopy — NASA Earth Observatory.',
    satelliteTag: 'Smoke & Haze Corrected',
    scale: [
      { min: -1, max: 0, label: 'Smoke / haze interference', color: '#475569' },
      { min: 0, max: 0.3, label: 'Low vegetation cover', color: '#d97706' },
      { min: 0.3, max: 0.6, label: 'Moderate canopy', color: '#a3e635' },
      { min: 0.6, max: 1, label: 'Dense forest canopy', color: '#15803d' }
    ],
    evaluate: ([nir, red, blue]) => calculateEVI(nir, red, blue),
    renderEquation: ([nir, red, blue]) => `(${nir} − ${red} − ${blue}) = ${calculateEVI(nir, red, blue).toFixed(2)}`
  },

  {
    id: 'ndci',
    name: 'NDCI — Normalized Difference Chlorophyll Index',
    formula: '(NIR − RedEdge) / (NIR + RedEdge)',
    bands: ['nir', 'rededge'],
    suit: 'hydro',
    categoryName: 'Hydrology & Water Quality',
    meaning: 'Standard ESA Copernicus algorithm! Uses Sentinel-2 Red Edge to quantify harmful cyanobacteria and toxic algal blooms in freshwater lakes.',
    cardArt: '/cards/coastal-tide-map.jpg',
    realCaption: 'Lake Erie algal bloom — Sentinel-2, European Space Agency.',
    satelliteTag: 'Toxic Algae Detection',
    scale: [
      { min: -1, max: 0, label: 'Clear water', color: '#1d4ed8' },
      { min: 0, max: 0.2, label: 'Low algae levels', color: '#38bdf8' },
      { min: 0.2, max: 0.5, label: 'Moderate cyanobacteria bloom', color: '#a3e635' },
      { min: 0.5, max: 1, label: 'Severe toxic algal bloom', color: '#15803d' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'ndti',
    name: 'NDTI — Normalized Difference Turbidity Index',
    formula: '(Green − Red) / (Green + Red)',
    bands: ['green', 'red'],
    suit: 'hydro',
    categoryName: 'Hydrology & Water Quality',
    meaning: 'Measures suspended sediment concentration, mud discharge, and river plume clarity.',
    cardArt: '/cards/coastal-tide-map.jpg',
    realCaption: 'Mississippi River delta plume — NASA Earth Observatory.',
    satelliteTag: 'River Sediment',
    scale: [
      { min: -1, max: -0.2, label: 'Clear ocean water', color: '#1d4ed8' },
      { min: -0.2, max: 0, label: 'Low sediment', color: '#38bdf8' },
      { min: 0, max: 0.3, label: 'Moderate river turbidity', color: '#f59e0b' },
      { min: 0.3, max: 1, label: 'Heavy mud / sediment discharge', color: '#d97706' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'awei',
    name: 'AWEI — Automated Water Extraction Index',
    formula: '4 × (Green − SWIR1) − (0.25×NIR + 2.75×SWIR2)',
    bands: ['green', 'swir1', 'nir', 'swir2'],
    suit: 'hydro',
    categoryName: 'Hydrology & Water Quality',
    meaning: 'Advanced 4-band formula that extracts shadow-free water boundaries in mountain canyons and high-rise cities.',
    cardArt: '/cards/water-scanner.jpg',
    realCaption: 'Mountain river canyon — NASA Earth Observatory.',
    satelliteTag: 'Shadow Water Mapping',
    scale: [
      { min: -1, max: -0.1, label: 'Urban shadow & land', color: '#475569' },
      { min: -0.1, max: 0.1, label: 'Wetland boundary', color: '#38bdf8' },
      { min: 0.1, max: 0.5, label: 'Shallow water', color: '#0284c7' },
      { min: 0.5, max: 1, label: 'Deep mountain river / lake', color: '#1d4ed8' }
    ],
    evaluate: ([green, swir1, nir, swir2]) => 4 * (green - swir1) - (0.25 * nir + 2.75 * swir2),
    renderEquation: ([green, swir1, nir, swir2]) => `4 × (${green} − ${swir1}) − (0.25×${nir} + 2.75×${swir2}) = ${(4 * (green - swir1) - (0.25 * nir + 2.75 * swir2)).toFixed(2)}`
  },

  {
    id: 'nbr2',
    name: 'NBR2 — Normalized Burn Ratio 2',
    formula: '(NIR − SWIR2) / (NIR + SWIR2)',
    bands: ['nir', 'swir2'],
    suit: 'thermal',
    categoryName: 'Wildfires & Burn Severity',
    meaning: 'Differentiates post-fire charcoal and ash residue from dry soil and forest regrowth.',
    cardArt: '/cards/thermal-fire-map.jpg',
    realCaption: 'Post-wildfire ash footprint — Landsat 8, NASA Earth Observatory.',
    satelliteTag: 'Ash & Charcoal',
    scale: [
      { min: -1, max: -0.1, label: 'Heavy ash & charcoal deposit', color: '#dc2626' },
      { min: -0.1, max: 0.1, label: 'Moderate scorch mark', color: '#f59e0b' },
      { min: 0.1, max: 0.4, label: 'Regrowing shrubland', color: '#a3e635' },
      { min: 0.4, max: 1, label: 'Unburned canopy', color: '#15803d' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'ndmi',
    name: 'NDMI — Normalized Difference Moisture Index',
    formula: '(SWIR1 − NIR) / (SWIR1 + NIR)',
    bands: ['swir1', 'nir'],
    suit: 'thermal',
    categoryName: 'Wildfires & Burn Severity',
    meaning: 'Tracks forest canopy water content and drought stress. Hydrated forests have high NIR and low SWIR1.',
    cardArt: '/cards/thermal-fire-map.jpg',
    realCaption: 'Drought-stressed forest canopy — NASA Earth Observatory.',
    satelliteTag: 'Canopy Moisture',
    scale: [
      { min: -1, max: -0.2, label: 'Severe canopy drought stress', color: '#dc2626' },
      { min: -0.2, max: 0.1, label: 'Moderate forest dryness', color: '#f59e0b' },
      { min: 0.1, max: 0.4, label: 'Moist forest canopy', color: '#a3e635' },
      { min: 0.4, max: 1, label: 'Fully hydrated rainforest', color: '#15803d' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'mirbi',
    name: 'MIRBI — Mid-Infrared Burn Index',
    formula: '(NIR − SWIR2) / (NIR + SWIR2)',
    bands: ['nir', 'swir2'],
    suit: 'thermal',
    categoryName: 'Wildfires & Burn Severity',
    meaning: 'Emphasizes scorch marks and charcoal deposits in arid shrublands following intense wildfires.',
    cardArt: '/cards/thermal-fire-map.jpg',
    realCaption: 'Scorched shrubland — NASA Earth Observatory.',
    satelliteTag: 'Scorched Bushland',
    scale: [
      { min: -1, max: 0, label: 'Unburned shrubland', color: '#15803d' },
      { min: 0, max: 0.3, label: 'Light scorch mark', color: '#f59e0b' },
      { min: 0.3, max: 0.7, label: 'Moderate burn scar', color: '#f97316' },
      { min: 0.7, max: 1, label: 'Severe charcoal scorch', color: '#dc2626' }
    ],
    ...normalizedDifferenceRecipe()
  },

  {
    id: 'ui',
    name: 'UI — Urban Index',
    formula: '(NIR − SWIR2) / (NIR + SWIR2)',
    bands: ['nir', 'swir2'],
    suit: 'urban',
    categoryName: 'Urban Infrastructure',
    meaning: 'Maps commercial building density and industrial sprawl using high SWIR2 reflection over rooftops.',
    cardArt: '/cards/urban-sprawl-map.jpg',
    realCaption: 'Metropolitan industrial zone — NASA Earth Observatory.',
    satelliteTag: 'Commercial Density',
    scale: [
      { min: -1, max: -0.1, label: 'Parks & water', color: '#1e3a8a' },
      { min: -0.1, max: 0.1, label: 'Suburban residential', color: '#3b82f6' },
      { min: 0.1, max: 0.4, label: 'Commercial roofs & asphalt', color: '#f97316' },
      { min: 0.4, max: 1, label: 'Heavy industrial sprawl', color: '#fbbf24' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'ibi',
    name: 'IBI — Index-based Built-up Index',
    formula: 'Combines NDBI, SAVI & MNDWI',
    bands: ['swir1', 'nir', 'red', 'green'],
    suit: 'urban',
    categoryName: 'Urban Infrastructure',
    meaning: 'Advanced 4-band index combining vegetation, water, and built-up formulas into a single urban sprawl indicator.',
    cardArt: '/cards/urban-sprawl-map.jpg',
    realCaption: 'Urban sprawl expansion — NASA Earth Observatory.',
    satelliteTag: 'Urban Sprawl',
    scale: [
      { min: -1, max: -0.1, label: 'Vegetation & water', color: '#15803d' },
      { min: -0.1, max: 0.1, label: 'Fallow farmland', color: '#d97706' },
      { min: 0.1, max: 0.4, label: 'Suburban sprawl', color: '#f97316' },
      { min: 0.4, max: 1, label: 'High-density urban core', color: '#fbbf24' }
    ],
    evaluate: ([swir1, nir, red, green]) => normalizedDifference(swir1, nir) - (normalizedDifference(nir, red) + normalizedDifference(green, swir1)) / 2,
    renderEquation: ([swir1, nir, red, green]) => `IBI(${swir1}, ${nir}, ${red}, ${green}) = ${(normalizedDifference(swir1, nir) - (normalizedDifference(nir, red) + normalizedDifference(green, swir1)) / 2).toFixed(2)}`
  },
  {
    id: 'ebbi',
    name: 'EBBI — Enhanced Built-up & Bareness Index',
    formula: '(SWIR1 − NIR) / (10 × √(SWIR1 + Thermal))',
    bands: ['swir1', 'nir', 'thermal'],
    suit: 'urban',
    categoryName: 'Urban Infrastructure',
    meaning: 'Advanced 3-band index using thermal infrared to distinguish city concrete from surrounding bare agricultural soil.',
    cardArt: '/cards/urban-sprawl-map.jpg',
    realCaption: 'Metropolitan concrete vs farmland boundary — NASA Earth Observatory.',
    satelliteTag: 'Concrete vs Soil',
    scale: [
      { min: -1, max: 0, label: 'Agricultural soil', color: '#d97706' },
      { min: 0, max: 0.2, label: 'Low built-up density', color: '#3b82f6' },
      { min: 0.2, max: 0.5, label: 'Moderate built-up city', color: '#f97316' },
      { min: 0.5, max: 1, label: 'High-density urban concrete', color: '#fbbf24' }
    ],
    evaluate: ([swir1, nir, thermal]) => (swir1 - nir) / (10 * Math.sqrt(Math.max(0.01, swir1 + thermal))),
    renderEquation: ([swir1, nir, thermal]) => `(${swir1} − ${nir}) / (10×√(${swir1} + ${thermal})) = ${((swir1 - nir) / (10 * Math.sqrt(Math.max(0.01, swir1 + thermal)))).toFixed(2)}`
  },

  {
    id: 'lst',
    name: 'LST — Land Surface Temperature',
    formula: 'Thermal IR (T10) Radiative Transfer',
    bands: ['thermal'],
    suit: 'thermal',
    categoryName: 'Thermal Heat Islands',
    meaning: 'Landsat-8 TIRS exclusive! Measures brightness temperature in Celsius/Fahrenheit to map Urban Heat Islands (UHI).',
    cardArt: '/cards/infrared-heat-map.jpg',
    realCaption: 'Urban Heat Island temperature grid — Landsat 8 TIRS, NASA Earth Observatory.',
    satelliteTag: 'Landsat TIRS Exclusive',
    scale: [
      { min: -1, max: 0, label: 'Cool forest / water microclimate (20°C)', color: '#1e3a8a' },
      { min: 0, max: 0.3, label: 'Moderate suburban temp (30°C)', color: '#a3e635' },
      { min: 0.3, max: 0.7, label: 'Hot asphalt / concrete (42°C)', color: '#f97316' },
      { min: 0.7, max: 1, label: 'Extreme urban heat island (>50°C)', color: '#dc2626' }
    ],
    evaluate: ([thermal]) => thermal,
    renderEquation: ([thermal]) => `T10 (${thermal}) = ${thermal.toFixed(2)}`
  },
  {
    id: 'utfvi',
    name: 'UTFVI — Urban Thermal Field Variance Index',
    formula: '(LST − LST_mean) / LST_mean',
    bands: ['thermal'],
    suit: 'thermal',
    categoryName: 'Thermal Heat Islands',
    meaning: 'Classifies urban heat island intensity into 6 health risk zones (Normal, Moderate, Extreme).',
    cardArt: '/cards/infrared-heat-map.jpg',
    realCaption: 'Metropolitan heat stress zone map — NASA Earth Observatory.',
    satelliteTag: 'Heat Stress Zones',
    scale: [
      { min: -1, max: 0, label: 'Normal thermal zone (No stress)', color: '#15803d' },
      { min: 0, max: 0.3, label: 'Moderate thermal stress', color: '#f59e0b' },
      { min: 0.3, max: 0.7, label: 'Strong heat island stress', color: '#f97316' },
      { min: 0.7, max: 1, label: 'Extreme thermal risk zone', color: '#dc2626' }
    ],
    evaluate: ([thermal]) => thermal,
    renderEquation: ([thermal]) => `UTFVI (${thermal}) = ${thermal.toFixed(2)}`
  },

  {
    id: 'ndsi',
    name: 'NDSI — Normalized Difference Snow Index',
    formula: '(Green − SWIR1) / (Green + SWIR1)',
    bands: ['green', 'swir1'],
    suit: 'terrain',
    categoryName: 'Soils, Geology & Snow',
    meaning: 'Standard NASA Cryosphere index! Distinguishes mountain snow and ice from clouds and bright rocks.',
    cardArt: '/cards/elevation-topo-card.jpg',
    realCaption: 'Himalayan mountain snowpack — MODIS Terra, NASA Earth Observatory.',
    satelliteTag: 'Snow & Glaciers',
    scale: [
      { min: -1, max: 0, label: 'Cloud cover or dark soil', color: '#475569' },
      { min: 0, max: 0.4, label: 'Sparse snow / wet ice', color: '#38bdf8' },
      { min: 0.4, max: 0.8, label: 'Moderate mountain snowpack', color: '#0284c7' },
      { min: 0.8, max: 1, label: 'Deep glacier snow cover', color: '#ffffff' }
    ],
    ...normalizedDifferenceRecipe()
  },
  {
    id: 'bsi',
    name: 'BSI — Bare Soil Index',
    formula: '((SWIR1 + Red) − (NIR + Blue)) / ((SWIR1 + Red) + (NIR + Blue))',
    bands: ['swir1', 'red', 'nir', 'blue'],
    suit: 'terrain',
    categoryName: 'Soils, Geology & Snow',
    meaning: 'Advanced 4-band UN FAO standard for monitoring agricultural topsoil exposure, tilling, and desertification.',
    cardArt: '/cards/dirt-slope-card.jpg',
    realCaption: 'Tilled agricultural soil — NASA Earth Observatory.',
    satelliteTag: 'Soil Erosion',
    scale: [
      { min: -1, max: 0, label: 'Dense vegetation cover', color: '#15803d' },
      { min: 0, max: 0.3, label: 'Partially vegetated soil', color: '#a3e635' },
      { min: 0.3, max: 0.7, label: 'Tilled agricultural soil', color: '#d97706' },
      { min: 0.7, max: 1, label: 'Exposed topsoil / desert sand', color: '#b45309' }
    ],
    evaluate: ([swir1, red, nir, blue]) => normalizedDifference(swir1 + red, nir + blue),
    renderEquation: ([swir1, red, nir, blue]) => `((${swir1}+${red}) − (${nir}+${blue})) / ((${swir1}+${red}) + (${nir}+${blue})) = ${normalizedDifference(swir1 + red, nir + blue).toFixed(2)}`
  },
  {
    id: 'cmi',
    name: 'CMI — Clay Minerals Index',
    formula: '(NIR − SWIR2) / (NIR + SWIR2)',
    bands: ['nir', 'swir2'],
    suit: 'terrain',
    categoryName: 'Soils, Geology & Snow',
    meaning: 'Used by geologists to map clay, alunite, and kaolinite mineral deposits from space.',
    cardArt: '/cards/dirt-slope-card.jpg',
    realCaption: 'Geological clay deposit formation — ASTER Terra, NASA Earth Observatory.',
    satelliteTag: 'Geological Minerals',
    scale: [
      { min: -1, max: 0.2, label: 'Vegetation & water', color: '#15803d' },
      { min: 0.2, max: 0.5, label: 'Silicate rock cover', color: '#475569' },
      { min: 0.5, max: 0.8, label: 'Clay-rich soil formation', color: '#d97706' },
      { min: 0.8, max: 1.5, label: 'High-purity clay / kaolinite deposit', color: '#b45309' }
    ],
    ...normalizedDifferenceRecipe()
  }
];

export interface RelatedFormula {
  id: string;
  name: string;
  formula: string;
  bands: BandId[];
  suit: FamilyId;
  meaning: string;
  sharesBandsWith: string;
  categoryTag: string;
}

export const RELATED_FORMULAS: RelatedFormula[] = [
  {
    id: 'savi_ref',
    name: 'SAVI — Soil-Adjusted Vegetation Index',
    formula: '((NIR − Red) / (NIR + Red + L)) × (1 + L), L = 0.5',
    bands: ['nir', 'red'],
    suit: 'flora',
    categoryTag: 'Soil Adjustment',
    meaning: 'Soil-dampened vegetation index.',
    sharesBandsWith: 'ndvi'
  }
];

export function findRecipeForBands(selected: BandId[]): IndexRecipe | null {
  if (selected.length < 1 || selected.length > 4) return null;
  const sortedSelected = [...selected].sort().join(',');
  return INDEX_RECIPES.find(recipe => {
    const sortedRecipe = [...recipe.bands].sort().join(',');
    return sortedRecipe === sortedSelected;
  }) ?? null;
}

export function findRecipe(a: BandId, b: BandId): IndexRecipe | null {
  return findRecipeForBands([a, b]);
}

export function classifyIndexValue(recipe: IndexRecipe, value: number): { label: string; color: string } {
  const bucket = recipe.scale.find(entry => value <= entry.max) ?? recipe.scale[recipe.scale.length - 1];
  return { label: bucket.label, color: bucket.color };
}

const VISIBLE_BANDS = new Set<BandId>(['blue', 'green', 'red']);

export function explainMismatchForBands(selected: BandId[]): string {
  if (selected.length === 4) {
    return `This 4-band combination (${selected.map(id => getBand(id).name).join(' + ')}) is not a standard remote sensing index. Try AWEI (Green + SWIR1 + NIR + SWIR2) or BSI (SWIR1 + Red + NIR + Blue)!`;
  }
  if (selected.length === 3) {
    return `This 3-band combination (${selected.map(id => getBand(id).name).join(' + ')}) is not a standard remote sensing index. Famous 3-band indices include EVI (NIR + Red + Blue) and EBBI (SWIR1 + NIR + Thermal)!`;
  }
  if (selected.length === 2) {
    const [a, b] = selected;
    if (a === 'thermal' || b === 'thermal') {
      return 'The thermal band (T10) measures brightness temperature directly — it is not ratioed against other bands in normalized difference indices.';
    }
    if (VISIBLE_BANDS.has(a) && VISIBLE_BANDS.has(b)) {
      return `${getBand(a).name} and ${getBand(b).name} are both visible-light bands. Multispectral indices pair visible light with infrared light to measure spectral reflectance gaps.`;
    }
    if ((a === 'swir1' || a === 'swir2') && (b === 'swir1' || b === 'swir2')) {
      return 'SWIR1 and SWIR2 are paired with NIR in NDBI and NBR — combining SWIR1 and SWIR2 together is not a standard spectral index.';
    }
    return `${getBand(a).name} and ${getBand(b).name} together are not a standard index — try pairing NIR with Red, Green, SWIR1, SWIR2, or Red Edge!`;
  }
  return 'Select 1, 2, 3, or 4 bands to compute a spectral index.';
}

export function explainMismatch(a: BandId, b: BandId): string {
  return explainMismatchForBands([a, b]);
}
