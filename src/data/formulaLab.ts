import type { BandId } from './indices';

export type ReflectanceBandId = Exclude<BandId, 'thermal'>;
export type FormulaTemplateId =
  | 'difference'
  | 'ratio'
  | 'normalized-difference'
  | 'corrected-contrast'
  | 'four-band-balance'
  | 'double-normalized-difference';
export type LabTargetId = 'vegetation' | 'water' | 'burn' | 'built';

export interface FormulaTemplate {
  id: FormulaTemplateId;
  name: string;
  shortFormula: string;
  roleLabels: string[];
  description: string;
  evaluate: (values: number[]) => number;
}

export interface LabTarget {
  id: LabTargetId;
  name: string;
  question: string;
  defaultHypothesis: string;
  seedBands: ReflectanceBandId[];
  baselineName: string;
  baselineBands: [ReflectanceBandId, ReflectanceBandId];
}

interface ReferenceSignature {
  id: string;
  label: string;
  classId: LabTargetId | 'soil';
  values: Record<ReflectanceBandId, number>;
}

export interface FormulaChallenge {
  targetLabel: string;
  targetValue: number;
  confuserLabel: string;
  confuserValue: number;
  gap: number;
  passesExpectedOrder: boolean;
}

export interface FormulaLabResult {
  contrastScore: number;
  robustnessScore: number;
  interpretabilityScore: number;
  baselineRobustness: number;
  baselineDelta: number;
  direction: 'higher' | 'lower';
  verdict: string;
  challenge: FormulaChallenge;
  duplicateBands: boolean;
  sampleResults: Array<{
    id: string;
    label: string;
    classId: ReferenceSignature['classId'];
    value: number;
    isTarget: boolean;
  }>;
}

function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function normalizedDifference(a: number, b: number): number {
  return safeDivide(a - b, a + b);
}

export const FORMULA_TEMPLATES: FormulaTemplate[] = [
  {
    id: 'difference',
    name: 'Difference',
    shortFormula: 'A − B',
    roleLabels: ['A: signal band', 'B: comparison band'],
    description: 'Preserves the size of the reflectance gap, but remains sensitive to overall brightness.',
    evaluate: ([a, b]) => a - b
  },
  {
    id: 'ratio',
    name: 'Simple ratio',
    shortFormula: 'A / B',
    roleLabels: ['A: numerator', 'B: denominator'],
    description: 'Measures proportional contrast. A dark denominator can make the result unstable.',
    evaluate: ([a, b]) => safeDivide(a, b)
  },
  {
    id: 'normalized-difference',
    name: 'Normalized difference',
    shortFormula: '(A − B) / (A + B)',
    roleLabels: ['A: positive response', 'B: negative response'],
    description: 'Scales a two-band contrast to −1…+1 and reduces simple brightness effects.',
    evaluate: ([a, b]) => normalizedDifference(a, b)
  },
  {
    id: 'corrected-contrast',
    name: 'Three-band correction',
    shortFormula: '(A − B) / (A + B + C)',
    roleLabels: ['A: positive response', 'B: negative response', 'C: correction band'],
    description: 'Adds a third band to damp a suspected confuser. This is an experimental archetype, not EVI.',
    evaluate: ([a, b, c]) => safeDivide(a - b, a + b + c)
  },
  {
    id: 'four-band-balance',
    name: 'Four-band balance',
    shortFormula: '(A + B − C − D) / (A + B + C + D)',
    roleLabels: ['A: positive 1', 'B: positive 2', 'C: negative 1', 'D: negative 2'],
    description: 'Compares two paired signals while normalizing by their combined brightness.',
    evaluate: ([a, b, c, d]) => safeDivide(a + b - c - d, a + b + c + d)
  },
  {
    id: 'double-normalized-difference',
    name: 'Difference of contrasts',
    shortFormula: 'ND(A,B) − ND(C,D)',
    roleLabels: ['A: contrast 1 positive', 'B: contrast 1 negative', 'C: contrast 2 positive', 'D: contrast 2 negative'],
    description: 'Tests whether one normalized spectral contrast exceeds another. Easy to overfit, so challenge scenes matter.',
    evaluate: ([a, b, c, d]) => normalizedDifference(a, b) - normalizedDifference(c, d)
  }
];

export const LAB_TARGETS: LabTarget[] = [
  {
    id: 'vegetation',
    name: 'Living vegetation',
    question: 'Can the formula separate living vegetation from water, soil, burn scars, and built surfaces?',
    defaultHypothesis: 'Healthy leaves should produce a stronger infrared-to-visible contrast than common non-vegetated surfaces.',
    seedBands: ['nir', 'red', 'blue', 'swir1'],
    baselineName: 'NDVI',
    baselineBands: ['nir', 'red']
  },
  {
    id: 'water',
    name: 'Open water',
    question: 'Can the formula separate open water from dark land surfaces and vegetation?',
    defaultHypothesis: 'Open water should remain bright enough in visible wavelengths while strongly absorbing infrared energy.',
    seedBands: ['green', 'nir', 'swir1', 'blue'],
    baselineName: 'NDWI',
    baselineBands: ['green', 'nir']
  },
  {
    id: 'burn',
    name: 'Burned surface',
    question: 'Can the formula separate burned surfaces from dry soil and built materials?',
    defaultHypothesis: 'Fresh burn scars should lose the vegetation NIR response while becoming relatively bright in SWIR2.',
    seedBands: ['nir', 'swir2', 'swir1', 'red'],
    baselineName: 'NBR',
    baselineBands: ['nir', 'swir2']
  },
  {
    id: 'built',
    name: 'Built surface',
    question: 'Can the formula separate built materials from vegetation, water, and bright bare soil?',
    defaultHypothesis: 'Many built materials should reflect more SWIR1 than NIR, unlike healthy vegetation and open water.',
    seedBands: ['swir1', 'nir', 'red', 'green'],
    baselineName: 'NDBI',
    baselineBands: ['swir1', 'nir']
  }
];

// Deliberately small, hand-authored reference signatures for teaching formula
// behavior. They are plausible reflectance percentages, not observations, labels,
// training data, or scientific validation.
const REFERENCE_SIGNATURES: ReferenceSignature[] = [
  { id: 'veg-dense', label: 'Dense green canopy', classId: 'vegetation', values: { blue: 5, green: 10, red: 5, rededge: 25, nir: 50, swir1: 20, swir2: 10 } },
  { id: 'veg-grass', label: 'Grassland', classId: 'vegetation', values: { blue: 6, green: 12, red: 9, rededge: 24, nir: 38, swir1: 24, swir2: 17 } },
  { id: 'veg-stressed', label: 'Stressed vegetation', classId: 'vegetation', values: { blue: 8, green: 15, red: 15, rededge: 25, nir: 30, swir1: 28, swir2: 22 } },
  { id: 'water-clear', label: 'Clear deep water', classId: 'water', values: { blue: 5, green: 4, red: 3, rededge: 2, nir: 1, swir1: 0.5, swir2: 0.3 } },
  { id: 'water-turbid', label: 'Turbid water', classId: 'water', values: { blue: 12, green: 14, red: 10, rededge: 6, nir: 4, swir1: 2, swir2: 1 } },
  { id: 'water-shallow', label: 'Shallow water', classId: 'water', values: { blue: 8, green: 10, red: 7, rededge: 8, nir: 6, swir1: 4, swir2: 3 } },
  { id: 'burn-fresh', label: 'Fresh burn scar', classId: 'burn', values: { blue: 8, green: 10, red: 12, rededge: 15, nir: 18, swir1: 30, swir2: 40 } },
  { id: 'burn-ash', label: 'Ash-rich burn', classId: 'burn', values: { blue: 10, green: 12, red: 16, rededge: 18, nir: 20, swir1: 32, swir2: 36 } },
  { id: 'burn-old', label: 'Older burn scar', classId: 'burn', values: { blue: 7, green: 10, red: 11, rededge: 18, nir: 24, swir1: 30, swir2: 32 } },
  { id: 'built-concrete', label: 'Concrete district', classId: 'built', values: { blue: 20, green: 24, red: 28, rededge: 30, nir: 32, swir1: 42, swir2: 36 } },
  { id: 'built-asphalt', label: 'Dark asphalt', classId: 'built', values: { blue: 8, green: 10, red: 12, rededge: 14, nir: 16, swir1: 22, swir2: 20 } },
  { id: 'built-roof', label: 'Mixed roofing', classId: 'built', values: { blue: 15, green: 18, red: 20, rededge: 23, nir: 25, swir1: 35, swir2: 30 } },
  { id: 'soil-sand', label: 'Bright sand', classId: 'soil', values: { blue: 25, green: 30, red: 35, rededge: 38, nir: 40, swir1: 42, swir2: 38 } },
  { id: 'soil-dry', label: 'Dry bare soil', classId: 'soil', values: { blue: 12, green: 18, red: 25, rededge: 28, nir: 32, swir1: 38, swir2: 34 } },
  { id: 'soil-moist', label: 'Moist bare soil', classId: 'soil', values: { blue: 8, green: 12, red: 16, rededge: 20, nir: 24, swir1: 26, swir2: 22 } }
];

export function getFormulaTemplate(id: FormulaTemplateId): FormulaTemplate {
  const template = FORMULA_TEMPLATES.find(item => item.id === id);
  if (!template) throw new Error(`Unknown formula template: ${id}`);
  return template;
}

export function getLabTarget(id: LabTargetId): LabTarget {
  const target = LAB_TARGETS.find(item => item.id === id);
  if (!target) throw new Error(`Unknown lab target: ${id}`);
  return target;
}

export function formatFormula(
  templateId: FormulaTemplateId,
  bands: ReflectanceBandId[],
  labelForBand: (bandId: ReflectanceBandId) => string
): string {
  const labels = bands.map(labelForBand);
  const [a = 'A', b = 'B', c = 'C', d = 'D'] = labels;
  switch (templateId) {
    case 'difference': return `${a} − ${b}`;
    case 'ratio': return `${a} / ${b}`;
    case 'normalized-difference': return `(${a} − ${b}) / (${a} + ${b})`;
    case 'corrected-contrast': return `(${a} − ${b}) / (${a} + ${b} + ${c})`;
    case 'four-band-balance': return `(${a} + ${b} − ${c} − ${d}) / (${a} + ${b} + ${c} + ${d})`;
    case 'double-normalized-difference': return `ND(${a}, ${b}) − ND(${c}, ${d})`;
  }
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  const average = mean(values);
  return Math.sqrt(mean(values.map(value => (value - average) ** 2)));
}

function evaluateAcrossReferences(template: FormulaTemplate, bands: ReflectanceBandId[]) {
  return REFERENCE_SIGNATURES.map(signature => ({
    ...signature,
    value: template.evaluate(bands.map(band => signature.values[band]))
  }));
}

function pairwiseRobustness(targetValues: number[], confuserValues: number[], direction: 'higher' | 'lower'): number {
  let wins = 0;
  let comparisons = 0;
  for (const targetValue of targetValues) {
    for (const confuserValue of confuserValues) {
      comparisons += 1;
      if (targetValue === confuserValue) wins += 0.5;
      else if (direction === 'higher' ? targetValue > confuserValue : targetValue < confuserValue) wins += 1;
    }
  }
  return comparisons === 0 ? 0 : (wins / comparisons) * 100;
}

function baselineRobustness(target: LabTarget): number {
  const template = getFormulaTemplate('normalized-difference');
  const results = evaluateAcrossReferences(template, target.baselineBands);
  const targetValues = results.filter(item => item.classId === target.id).map(item => item.value);
  const confuserValues = results.filter(item => item.classId !== target.id).map(item => item.value);
  const direction = mean(targetValues) >= mean(confuserValues) ? 'higher' : 'lower';
  return pairwiseRobustness(targetValues, confuserValues, direction);
}

export function evaluateFormulaCandidate(
  templateId: FormulaTemplateId,
  bands: ReflectanceBandId[],
  targetId: LabTargetId,
  hypothesis: string
): FormulaLabResult {
  const template = getFormulaTemplate(templateId);
  if (bands.length !== template.roleLabels.length) {
    throw new Error(`${template.name} requires ${template.roleLabels.length} band roles`);
  }

  const target = getLabTarget(targetId);
  const evaluated = evaluateAcrossReferences(template, bands);
  const targetResults = evaluated.filter(item => item.classId === targetId);
  const confuserResults = evaluated.filter(item => item.classId !== targetId);
  const targetValues = targetResults.map(item => item.value);
  const confuserValues = confuserResults.map(item => item.value);
  const targetMean = mean(targetValues);
  const confuserMean = mean(confuserValues);
  const direction: 'higher' | 'lower' = targetMean >= confuserMean ? 'higher' : 'lower';
  const robustnessScore = pairwiseRobustness(targetValues, confuserValues, direction);
  const pooledSpread = standardDeviation(targetValues) + standardDeviation(confuserValues);
  const contrastScore = Math.min(100, safeDivide(Math.abs(targetMean - confuserMean), pooledSpread || 0.0001) * 50);
  const duplicateBands = new Set(bands).size !== bands.length;
  const interpretabilityScore = Math.round(
    (hypothesis.trim().length >= 24 ? 35 : hypothesis.trim().length >= 10 ? 20 : 0)
    + (duplicateBands ? 0 : 35)
    + (bands.length === 2 ? 30 : bands.length === 3 ? 24 : 18)
  );
  const knownBaselineRobustness = baselineRobustness(target);
  const baselineDelta = robustnessScore - knownBaselineRobustness;

  let challenge: FormulaChallenge | null = null;
  for (const targetResult of targetResults) {
    for (const confuserResult of confuserResults) {
      const gap = Math.abs(targetResult.value - confuserResult.value);
      if (!challenge || gap < challenge.gap) {
        challenge = {
          targetLabel: targetResult.label,
          targetValue: targetResult.value,
          confuserLabel: confuserResult.label,
          confuserValue: confuserResult.value,
          gap,
          passesExpectedOrder: direction === 'higher'
            ? targetResult.value > confuserResult.value
            : targetResult.value < confuserResult.value
        };
      }
    }
  }

  let verdict = 'Indistinct on this challenge';
  if (duplicateBands) verdict = 'Revise the repeated band roles';
  else if (robustnessScore >= 85 && baselineDelta >= 5) verdict = 'Promising in this teaching set';
  else if (robustnessScore >= 85) verdict = 'Strong teaching-set separation';
  else if (robustnessScore >= 70) verdict = 'Fragile around confusers';

  return {
    contrastScore: Math.round(contrastScore),
    robustnessScore: Math.round(robustnessScore),
    interpretabilityScore,
    baselineRobustness: Math.round(knownBaselineRobustness),
    baselineDelta: Math.round(baselineDelta),
    direction,
    verdict,
    challenge: challenge!,
    duplicateBands,
    sampleResults: evaluated.map(item => ({
      id: item.id,
      label: item.label,
      classId: item.classId,
      value: item.value,
      isTarget: item.classId === targetId
    }))
  };
}
