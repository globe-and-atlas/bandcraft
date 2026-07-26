import { describe, expect, it } from 'vitest';
import {
  BANDS,
  INDEX_RECIPES,
  normalizedDifference,
  findRecipe,
  findRecipeForBands,
  classifyIndexValue,
  explainMismatch,
  type BandId
} from './indices';

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

  it('returns null for every pair that is not one of the 4 curated recipes', () => {
    const allBandIds = BANDS.map(b => b.id);
    const recipePairs = new Set(INDEX_RECIPES.flatMap(r => [`${r.bands[0]}:${r.bands[1]}`, `${r.bands[1]}:${r.bands[0]}`]));
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
