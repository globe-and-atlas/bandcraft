import { describe, expect, it } from 'vitest';
import {
  FORMULA_TEMPLATES,
  evaluateFormulaCandidate,
  formatFormula,
  getFormulaTemplate
} from './formulaLab';

describe('formula lab templates', () => {
  it('keeps the bounded lab to six curated formula families using two to four bands', () => {
    expect(FORMULA_TEMPLATES).toHaveLength(6);
    for (const template of FORMULA_TEMPLATES) {
      expect(template.roleLabels.length).toBeGreaterThanOrEqual(2);
      expect(template.roleLabels.length).toBeLessThanOrEqual(4);
    }
  });

  it('guards ratios and normalized formulas against zero denominators', () => {
    expect(getFormulaTemplate('ratio').evaluate([10, 0])).toBe(0);
    expect(getFormulaTemplate('normalized-difference').evaluate([0, 0])).toBe(0);
    expect(getFormulaTemplate('four-band-balance').evaluate([0, 0, 0, 0])).toBe(0);
  });

  it('formats selected band roles in their meaningful order', () => {
    const formula = formatFormula('normalized-difference', ['nir', 'red'], id => id.toUpperCase());
    expect(formula).toBe('(NIR − RED) / (NIR + RED)');
  });
});

describe('formula candidate challenge', () => {
  it('recognizes NDVI as a strong vegetation separator on the teaching reference set', () => {
    const result = evaluateFormulaCandidate(
      'normalized-difference',
      ['nir', 'red'],
      'vegetation',
      'Healthy vegetation should reflect NIR and absorb red light.'
    );
    expect(result.robustnessScore).toBeGreaterThanOrEqual(85);
    expect(result.baselineDelta).toBe(0);
    expect(result.verdict).toMatch(/Strong/);
  });

  it('penalizes repeated bands instead of presenting a degenerate formula as notable', () => {
    const result = evaluateFormulaCandidate(
      'normalized-difference',
      ['nir', 'nir'],
      'vegetation',
      'This intentionally repeats a band to test the guardrail.'
    );
    expect(result.duplicateBands).toBe(true);
    expect(result.interpretabilityScore).toBeLessThan(70);
    expect(result.verdict).toMatch(/repeated/i);
  });

  it('returns the closest target/confuser pair so the player can try to break the candidate', () => {
    const result = evaluateFormulaCandidate(
      'four-band-balance',
      ['nir', 'green', 'red', 'swir1'],
      'vegetation',
      'Vegetation should retain a balanced visible and infrared contrast.'
    );
    expect(result.challenge.targetLabel).toBeTruthy();
    expect(result.challenge.confuserLabel).toBeTruthy();
    expect(result.challenge.gap).toBeGreaterThanOrEqual(0);
    expect(result.sampleResults).toHaveLength(15);
  });
});
