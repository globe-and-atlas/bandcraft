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
}

export const BANDS: Band[] = [
  { id: 'blue', bandCode: 'B02', sentinelCode: 'B02', landsatCode: 'B02', name: 'Blue (VIS)', wavelength: '490 nm', resolution: '10m', sensorTag: 'Sentinel-2 / Landsat-8', color: '#3b82f6', satellites: ['sentinel2', 'landsat8'] },
  { id: 'green', bandCode: 'B03', sentinelCode: 'B03', landsatCode: 'B03', name: 'Green (VIS)', wavelength: '560 nm', resolution: '10m', sensorTag: 'Sentinel-2 / Landsat-8', color: '#10b981', satellites: ['sentinel2', 'landsat8'] },
  { id: 'red', bandCode: 'B04', sentinelCode: 'B04', landsatCode: 'B04', name: 'Red (VIS)', wavelength: '665 nm', resolution: '10m', sensorTag: 'Sentinel-2 / Landsat-8', color: '#ef4444', satellites: ['sentinel2', 'landsat8'] },
  { id: 'rededge', bandCode: 'B05', sentinelCode: 'B05', name: 'Red Edge (VRE)', wavelength: '705 nm', resolution: '20m', sensorTag: 'Sentinel-2 MSI Only', color: '#f43f5e', satellites: ['sentinel2'] },
  { id: 'nir', bandCode: 'B08', sentinelCode: 'B08', landsatCode: 'B05', name: 'Near-Infrared (NIR)', wavelength: '842 nm', resolution: '10m', sensorTag: 'Sentinel-2 / Landsat-8', color: '#a855f7', satellites: ['sentinel2', 'landsat8'] },
  { id: 'swir1', bandCode: 'B11', sentinelCode: 'B11', landsatCode: 'B06', name: 'SWIR-1', wavelength: '1610 nm', resolution: '20m', sensorTag: 'Sentinel-2 / Landsat-8', color: '#f59e0b', satellites: ['sentinel2', 'landsat8'] },
  { id: 'swir2', bandCode: 'B12', sentinelCode: 'B12', landsatCode: 'B07', name: 'SWIR-2', wavelength: '2190 nm', resolution: '20m', sensorTag: 'Sentinel-2 / Landsat-8', color: '#ea580c', satellites: ['sentinel2', 'landsat8'] },
  { id: 'thermal', bandCode: 'T10', landsatCode: 'T10', name: 'Thermal IR (TIRS)', wavelength: '10.9 µm', resolution: '100m', sensorTag: 'Landsat-8 TIRS Only', color: '#ec4899', satellites: ['landsat8'] }
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

/** Same as getBand, but returns the satellite-specific bandCode/sensorTag when a
 * specific mode is active — keeps the code shown for a band consistent everywhere
 * it appears (selection grid, equation cards, split viewer), not just where the
 * mode filter itself is applied. */
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
  bands: BandId[]; // Supports 2-band and 3-band formulas.
  suit: FamilyId;
  meaning: string;
  cardArt: string;
  /** The real caption/source for cardArt — no invented place names or coordinates. */
  realCaption: string;
  scale: IndexScaleEntry[];
  satelliteTag?: string;
  /** Computes the index value from reflectance inputs, one per entry in `bands`, in order. */
  evaluate: (values: number[]) => number;
  /** Renders a worked "plugged-in" equation string ending in the computed value,
   * for the Field Guide calculator — kept per-recipe since EVI's formula shape
   * differs structurally from the shared (A-B)/(A+B) recipes. */
  renderEquation: (values: number[]) => string;
}

/** (A - B) / (A + B). Guards the degenerate 0/0 case. Inputs are 0-100 (%) reflectance. */
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

/** EVI = 2.5 × (NIR − Red) / (NIR + 6×Red − 7.5×Blue + 1). Guards the degenerate
 * 0-denominator case the same way normalizedDifference does. */
function calculateEVI(nir: number, red: number, blue: number): number {
  const denominator = nir + 6 * red - 7.5 * blue + 1;
  if (denominator === 0) return 0;
  return (2.5 * (nir - red)) / denominator;
}

export const INDEX_RECIPES: IndexRecipe[] = [
  {
    id: 'ndvi',
    name: 'NDVI — Normalized Difference Vegetation Index',
    formula: '(NIR − Red) / (NIR + Red)',
    bands: ['nir', 'red'],
    suit: 'flora',
    meaning: 'Reveals how much healthy, dense vegetation is present. Leaves reflect NIR strongly and absorb Red for photosynthesis, so a big NIR-Red gap means healthy plant cover.',
    cardArt: '/cards/green-tree-map.jpg',
    realCaption: 'Amazon rainforest canopy and river channel near Yurimaguas, Peru — Landsat 7, NASA Earth Observatory.',
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
    name: 'EVI — Enhanced Vegetation Index (3-Band Formula)',
    formula: '2.5 × (NIR − Red) / (NIR + 6×Red − 7.5×Blue + 1)',
    bands: ['nir', 'red', 'blue'],
    suit: 'flora',
    meaning: 'Advanced 3-band index! EVI incorporates the Blue band to correct for atmospheric aerosols and soil background noise, preventing signal saturation over high-density rainforest canopy.',
    cardArt: '/cards/green-tree-map.jpg',
    realCaption: 'Amazon rainforest canopy and river channel near Yurimaguas, Peru — Landsat 7, NASA Earth Observatory (same scene as NDVI; EVI refines it with an extra band).',
    satelliteTag: 'Multi-Band Standard',
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
    meaning: 'Replaces NIR with SWIR1 to eliminate urban built-up noise when extracting water bodies in rivers and coastal cities.',
    cardArt: '/cards/water-scanner.jpg',
    realCaption: 'Lake Mead, Nevada/Arizona — Landsat 8, NASA Earth Observatory (same scene as NDWI; MNDWI swaps in SWIR1 to suppress urban noise).',
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
    meaning: 'Reveals built-up surfaces. Concrete, asphalt, and rooftops reflect short-wave infrared more than they reflect NIR — the opposite of vegetation and water.',
    cardArt: '/cards/urban-sprawl-map.jpg',
    realCaption: 'Palm Jumeirah and World Islands, Dubai — International Space Station astronaut photograph, NASA Earth Observatory.',
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
  }
];

/** Order-independent band set matching for 2-band or 3-band recipes. */
export function findRecipeForBands(selected: BandId[]): IndexRecipe | null {
  if (selected.length < 2 || selected.length > 3) return null;
  const sortedSelected = [...selected].sort().join(',');
  return INDEX_RECIPES.find(recipe => {
    const sortedRecipe = [...recipe.bands].sort().join(',');
    return sortedRecipe === sortedSelected;
  }) ?? null;
}

/** Legacy helper for 2-band pairs. */
export function findRecipe(a: BandId, b: BandId): IndexRecipe | null {
  return findRecipeForBands([a, b]);
}

export function classifyIndexValue(recipe: IndexRecipe, value: number): { label: string; color: string } {
  const bucket = recipe.scale.find(entry => value <= entry.max) ?? recipe.scale[recipe.scale.length - 1];
  return { label: bucket.label, color: bucket.color };
}

const VISIBLE_BANDS = new Set<BandId>(['blue', 'green', 'red']);

/** Diagnostic physics explanation for arbitrary combinations. */
export function explainMismatchForBands(selected: BandId[]): string {
  if (selected.length === 3) {
    return `This 3-band combination (${selected.map(id => getBand(id).name).join(' + ')}) is not a standard remote sensing index. The most famous 3-band index is EVI (NIR + Red + Blue), which uses Blue to subtract atmospheric aerosol haze!`;
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
  return 'Select 2 or 3 bands to compute a spectral index.';
}

export function explainMismatch(a: BandId, b: BandId): string {
  return explainMismatchForBands([a, b]);
}
