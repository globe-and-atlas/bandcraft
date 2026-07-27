import { describe, expect, it } from 'vitest';
import {
  BANDS,
  INDEX_RECIPES,
  RELATED_FORMULAS,
  normalizedDifference,
  findRecipe,
  findRecipeForBands,
  classifyIndexValue,
  explainMismatch,
  getBand,
  getBandForMode,
  type BandId
} from './indices';

const sortedBandSet = (bands: BandId[]) => [...bands].sort().join(',');

describe('normalizedDifference', () => {
  it('returns 0 when both bands report equal reflectance', () => {
    expect(normalizedDifference(40, 40)).toBe(0);
  });

  it('returns a high positive value when A dominates B', () => {
    const value = normalizedDifference(80, 10);
    expect(value).toBeCloseTo((80 - 10) / (80 + 10), 5);
    expect(value).toBeGreaterThan(0.5);
  });

  it('returns a negative value when B dominates A', () => {
    expect(normalizedDifference(10, 40)).toBeLessThan(0);
  });

  it('never divides by zero when both bands report no reflectance', () => {
    expect(normalizedDifference(0, 0)).toBe(0);
  });

  it('stays within -1..1 for any non-negative reflectance inputs', () => {
    for (const [a, b] of [[100, 0], [0, 100], [50, 50], [1, 99]]) {
      const value = normalizedDifference(a, b);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('findRecipe', () => {
  it('resolves all 4 curated recipes in their documented band order', () => {
    expect(findRecipe('nir', 'red')?.id).toBe('ndvi');
    expect(findRecipe('green', 'nir')?.id).toBe('ndwi');
    expect(findRecipe('swir1', 'nir')?.id).toBe('ndbi');
    expect(findRecipe('nir', 'swir2')?.id).toBe('nbr');
  });

  it('resolves 3-band recipes like EVI order-independently', () => {
    expect(findRecipeForBands(['nir', 'red', 'blue'])?.id).toBe('evi');
    expect(findRecipeForBands(['blue', 'nir', 'red'])?.id).toBe('evi');
  });

  it('resolves Sentinel-2 exclusive Red Edge index NDRE', () => {
    expect(findRecipeForBands(['nir', 'rededge'])?.id).toBe('ndre');
  });

  it('is order-independent: swapping the two bands still resolves the same recipe', () => {
    expect(findRecipe('red', 'nir')?.id).toBe('ndvi');
    expect(findRecipe('nir', 'green')?.id).toBe('ndwi');
    expect(findRecipe('nir', 'swir1')?.id).toBe('ndbi');
    expect(findRecipe('swir2', 'nir')?.id).toBe('nbr');
  });

  it('does not confuse NDBI and NBR despite both pairing a SWIR band with NIR', () => {
    expect(findRecipe('swir1', 'nir')?.id).toBe('ndbi');
    expect(findRecipe('swir2', 'nir')?.id).toBe('nbr');
    expect(findRecipe('swir1', 'nir')?.id).not.toBe(findRecipe('swir2', 'nir')?.id);
  });

  it('returns null for every pair that is not one of the curated recipes', () => {
    const allBandIds = BANDS.map(b => b.id);
    const recipePairs = new Set(INDEX_RECIPES.filter(r => r.bands.length === 2).flatMap(r => [`${r.bands[0]}:${r.bands[1]}`, `${r.bands[1]}:${r.bands[0]}`]));
    let checked = 0;
    for (const a of allBandIds) {
      for (const b of allBandIds) {
        if (a === b) continue;
        checked += 1;
        const isRecipe = recipePairs.has(`${a}:${b}`);
        const result = findRecipe(a, b);
        if (isRecipe) {
          expect(result).not.toBeNull();
        } else {
          expect(result).toBeNull();
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe('classifyIndexValue', () => {
  it('never returns undefined for any value in -1..1, for every recipe', () => {
    for (const recipe of INDEX_RECIPES) {
      for (const value of [-1, -0.5, -0.1, 0, 0.1, 0.4, 0.5, 1]) {
        const result = classifyIndexValue(recipe, value);
        expect(result.label).toBeTruthy();
        expect(result.color).toBeTruthy();
      }
    }
  });

  it('classifies dense vegetation at the top of the NDVI scale', () => {
    const ndvi = INDEX_RECIPES.find(r => r.id === 'ndvi')!;
    expect(classifyIndexValue(ndvi, 0.8).label).toMatch(/dense/i);
  });

  it('classifies open water at the top of the NDWI scale', () => {
    const ndwi = INDEX_RECIPES.find(r => r.id === 'ndwi')!;
    expect(classifyIndexValue(ndwi, 0.5).label).toMatch(/water/i);
  });

  it('classifies a burned area at the bottom of the NBR scale', () => {
    const nbr = INDEX_RECIPES.find(r => r.id === 'nbr')!;
    expect(classifyIndexValue(nbr, -0.5).label).toMatch(/burn/i);
  });
});

describe('explainMismatch', () => {
  it('gives a specific reason for two visible-light bands', () => {
    expect(explainMismatch('red', 'blue')).toMatch(/visible/i);
  });

  it('gives a specific reason whenever thermal is involved', () => {
    expect(explainMismatch('thermal', 'nir')).toMatch(/temperature/i);
    expect(explainMismatch('red', 'thermal')).toMatch(/temperature/i);
  });

  it('gives a specific reason for pairing the two SWIR bands together', () => {
    expect(explainMismatch('swir1', 'swir2')).toMatch(/SWIR/i);
  });

  it('never throws for any non-recipe band pair', () => {
    const allBandIds: BandId[] = BANDS.map(b => b.id);
    for (const a of allBandIds) {
      for (const b of allBandIds) {
        if (a === b || findRecipe(a, b)) continue;
        expect(() => explainMismatch(a, b)).not.toThrow();
        expect(explainMismatch(a, b).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('recipe.evaluate and recipe.renderEquation', () => {
  it('every 2-band recipe evaluates to the same value as normalizedDifference() on its own bands, in the documented order', () => {
    for (const recipe of INDEX_RECIPES) {
      if (recipe.bands.length !== 2) continue;
      const value = recipe.evaluate([70, 15]);
      expect(value).toBeCloseTo(normalizedDifference(70, 15), 5);
    }
  });

  it('EVI evaluates using the real 3-band formula, not the 2-band normalized-difference shape', () => {
    const evi = INDEX_RECIPES.find(r => r.id === 'evi')!;
    const [nir, red, blue] = [70, 15, 10];
    const expected = (2.5 * (nir - red)) / (nir + 6 * red - 7.5 * blue + 1);
    expect(evi.evaluate([nir, red, blue])).toBeCloseTo(expected, 5);
    // Specifically must NOT equal the NDVI-shaped 2-band formula on the same NIR/Red —
    // this is the exact bug the Field Guide calculator had before this fix.
    expect(evi.evaluate([nir, red, blue])).not.toBeCloseTo(normalizedDifference(nir, red), 2);
  });

  it('EVI never throws on the degenerate zero-denominator case', () => {
    const evi = INDEX_RECIPES.find(r => r.id === 'evi')!;
    expect(() => evi.evaluate([0, 0, 1 / 6])).not.toThrow();
  });

  it('renderEquation always ends in the same value evaluate() computes, for every recipe', () => {
    for (const recipe of INDEX_RECIPES) {
      const values = recipe.bands.map((_, i) => [70, 15, 10][i]);
      const value = recipe.evaluate(values);
      const equationText = recipe.renderEquation(values);
      expect(equationText).toContain(value.toFixed(2));
    }
  });

  it('renderEquation includes every input value plugged in, for every recipe', () => {
    for (const recipe of INDEX_RECIPES) {
      const values = recipe.bands.map((_, i) => [70, 15, 10][i]);
      const equationText = recipe.renderEquation(values);
      for (const value of values) {
        expect(equationText).toContain(String(value));
      }
    }
  });
});

describe('getBandForMode', () => {
  it('returns the Sentinel-2 band code for NIR in sentinel2 mode', () => {
    expect(getBandForMode('nir', 'sentinel2').bandCode).toBe('B08');
  });

  it('returns the Landsat-8 band code for NIR in landsat8 mode, distinct from the Sentinel code', () => {
    expect(getBandForMode('nir', 'landsat8').bandCode).toBe('B05');
    expect(getBandForMode('nir', 'landsat8').bandCode).not.toBe(getBandForMode('nir', 'sentinel2').bandCode);
  });

  it('matches plain getBand() in "all" mode, for every band', () => {
    for (const band of BANDS) {
      expect(getBandForMode(band.id, 'all').bandCode).toBe(getBand(band.id).bandCode);
    }
  });

  it('falls back to the default band if the requested mode does not include it', () => {
    // Red Edge only exists on Sentinel-2 — landsat8 mode's filtered list won't contain it.
    expect(() => getBandForMode('rededge', 'landsat8')).not.toThrow();
    expect(getBandForMode('rededge', 'landsat8').id).toBe('rededge');
  });
});

describe('RELATED_FORMULAS (reference-only, not craftable)', () => {
  it('every sharesBandsWith id points at a real INDEX_RECIPES entry', () => {
    const recipeIds = new Set(INDEX_RECIPES.map(r => r.id));
    for (const formula of RELATED_FORMULAS) {
      expect(recipeIds.has(formula.sharesBandsWith)).toBe(true);
    }
  });

  it('every RELATED_FORMULAS band set genuinely matches the recipe it claims to share bands with — this is the whole reason these are reference-only, not craftable', () => {
    for (const formula of RELATED_FORMULAS) {
      const recipe = INDEX_RECIPES.find(r => r.id === formula.sharesBandsWith)!;
      expect(sortedBandSet(formula.bands)).toBe(sortedBandSet(recipe.bands));
    }
  });

  it('no RELATED_FORMULAS entry accidentally introduces a band set that is actually free (which would mean it should be craftable instead)', () => {
    const claimedSets = new Set(INDEX_RECIPES.map(r => sortedBandSet(r.bands)));
    for (const formula of RELATED_FORMULAS) {
      expect(claimedSets.has(sortedBandSet(formula.bands))).toBe(true);
    }
  });

  it('has no duplicate ids and does not reuse an INDEX_RECIPES id', () => {
    const recipeIds = new Set(INDEX_RECIPES.map(r => r.id));
    const seen = new Set<string>();
    for (const formula of RELATED_FORMULAS) {
      expect(recipeIds.has(formula.id)).toBe(false);
      expect(seen.has(formula.id)).toBe(false);
      seen.add(formula.id);
    }
  });
});
