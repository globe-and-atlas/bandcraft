import { useMemo, useState } from 'react';
import {
  FORMULA_TEMPLATES,
  LAB_TARGETS,
  evaluateFormulaCandidate,
  formatFormula,
  getFormulaTemplate,
  getLabTarget,
  type FormulaLabResult,
  type FormulaTemplateId,
  type LabTargetId,
  type ReflectanceBandId
} from './data/formulaLab';
import {
  getBandForMode,
  getBandsForMode,
  type SatelliteMode,
  type BandId
} from './data/indices';

interface FormulaLabProps {
  satelliteMode: SatelliteMode;
}

const CANONICAL_PRESETS: Array<{
  name: string;
  glyph: string;
  targetId: LabTargetId;
  templateId: FormulaTemplateId;
  bands: ReflectanceBandId[];
  desc: string;
}> = [
  {
    name: 'Start with NDVI',
    glyph: '🌿',
    targetId: 'vegetation',
    templateId: 'normalized-difference',
    bands: ['nir', 'red'],
    desc: 'Standard Vegetation Index (NIR vs Red)'
  },
  {
    name: 'Start with NDWI',
    glyph: '💧',
    targetId: 'water',
    templateId: 'normalized-difference',
    bands: ['green', 'nir'],
    desc: 'Water Body Index (Green vs NIR)'
  },
  {
    name: 'Start with NBR',
    glyph: '🔥',
    targetId: 'burn',
    templateId: 'normalized-difference',
    bands: ['nir', 'swir2'],
    desc: 'Wildfire Burn Severity (NIR vs SWIR2)'
  },
  {
    name: 'Start with NDBI',
    glyph: '🏗️',
    targetId: 'built',
    templateId: 'normalized-difference',
    bands: ['swir1', 'nir'],
    desc: 'Urban Built-Up Index (SWIR1 vs NIR)'
  }
];

const BAND_COLORS: Record<BandId, string> = {
  blue: '#3b82f6',
  green: '#10b981',
  red: '#ef4444',
  rededge: '#f43f5e',
  nir: '#a855f7',
  swir1: '#f59e0b',
  swir2: '#ea580c',
  thermal: '#ec4899'
};

function classLabel(classId: string): string {
  return classId === 'soil' ? 'Bare Soil' : classId.charAt(0).toUpperCase() + classId.slice(1);
}

function scoreTone(score: number): 'low' | 'mixed' | 'strong' {
  if (score >= 75) return 'strong';
  if (score >= 50) return 'mixed';
  return 'low';
}

export default function FormulaLab({ satelliteMode }: FormulaLabProps) {
  const [targetId, setTargetId] = useState<LabTargetId>('vegetation');
  const [templateId, setTemplateId] = useState<FormulaTemplateId>('normalized-difference');
  const [bands, setBands] = useState<ReflectanceBandId[]>(['nir', 'red']);
  const [hypothesis, setHypothesis] = useState(getLabTarget('vegetation').defaultHypothesis);
  const [result, setResult] = useState<FormulaLabResult | null>(null);

  const template = getFormulaTemplate(templateId);
  const target = getLabTarget(targetId);
  const availableBands = useMemo(
    () => getBandsForMode(satelliteMode).filter((band): band is typeof band & { id: ReflectanceBandId } => band.id !== 'thermal'),
    [satelliteMode]
  );

  const applyPreset = (preset: typeof CANONICAL_PRESETS[0]) => {
    setTargetId(preset.targetId);
    setTemplateId(preset.templateId);
    setBands(preset.bands);
    const targetObj = getLabTarget(preset.targetId);
    setHypothesis(targetObj.defaultHypothesis);
    setResult(evaluateFormulaCandidate(preset.templateId, preset.bands, preset.targetId, targetObj.defaultHypothesis));
  };

  const setTarget = (nextTargetId: LabTargetId) => {
    const nextTarget = getLabTarget(nextTargetId);
    setTargetId(nextTargetId);
    setHypothesis(nextTarget.defaultHypothesis);
    setBands(nextTarget.seedBands.slice(0, template.roleLabels.length));
    setResult(null);
  };

  const setTemplate = (nextTemplateId: FormulaTemplateId) => {
    const nextTemplate = getFormulaTemplate(nextTemplateId);
    setTemplateId(nextTemplateId);
    setBands(target.seedBands.slice(0, nextTemplate.roleLabels.length));
    setResult(null);
  };

  const setBandRole = (index: number, bandId: ReflectanceBandId) => {
    setBands(current => current.map((currentBand, currentIndex) => currentIndex === index ? bandId : currentBand));
    setResult(null);
  };

  const formula = formatFormula(
    templateId,
    bands,
    bandId => getBandForMode(bandId, satelliteMode).bandCode
  );

  const runChallenge = () => {
    setResult(evaluateFormulaCandidate(templateId, bands, targetId, hypothesis));
  };

  return (
    <section className="formula-lab" aria-labelledby="formula-lab-title">
      {/* Hero Header */}
      <div className="formula-lab-hero">
        <div className="formula-lab-hero-copy">
          <span className="formula-lab-kicker">OPTIONAL EXPLORATION · HYPOTHESIS SANDBOX</span>
          <h2 id="formula-lab-title">Formula Lab: Find the confuser</h2>
          <p>
            Start with a known index or change one band, then see whether the signal still separates your target from the surfaces most likely to fool it. This is a teaching comparison, not a detector-discovery or validation tool.
          </p>
          <div className="lab-purpose-line">
            <span>THE POINT</span>
            <strong>Can this contrast answer one narrow question without confusing the target with something else?</strong>
          </div>
          <div className="lab-intent-grid" aria-label="Formula Lab scope">
            <div>
              <span>USE THIS LAB TO</span>
              <strong>Compare a known formula or one-band change.</strong>
            </div>
            <div>
              <span>NOT FOR</span>
              <strong>Discovering or validating a new detector.</strong>
            </div>
          </div>
        </div>
        <div className="lab-preset-bar" role="group" aria-label="Quick preset recipes">
          <span className="preset-bar-title">Start from a known baseline</span>
          <small className="preset-bar-help">Pick one, then change one band at a time.</small>
          <div className="preset-button-row">
            {CANONICAL_PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                className="lab-preset-chip"
                title={preset.desc}
                onClick={() => applyPreset(preset)}
              >
                <span>{preset.glyph}</span> {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Target Selection */}
      <div className="lab-step-panel">
        <div className="lab-step-marker">
          <span>01</span>
          <div className="lab-step-copy">
            <strong>Choose the target</strong>
            <small>What surface are you trying to separate?</small>
          </div>
        </div>
        <div className="lab-target-grid" role="group" aria-label="Environmental target">
          {LAB_TARGETS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`lab-target-button ${targetId === item.id ? 'active' : ''}`}
              onClick={() => setTarget(item.id)}
            >
              <strong>{item.name}</strong>
              <span>Industry Standard: {item.baselineName}</span>
            </button>
          ))}
        </div>
        <p className="lab-question">{target.question}</p>
        <label className="lab-hypothesis-field">
          <span>Your reason, in plain language</span>
          <textarea
            value={hypothesis}
            rows={2}
            onChange={event => { setHypothesis(event.target.value); setResult(null); }}
            placeholder="Explain why these wavelength bands should respond differently over this target surface..."
          />
        </label>
      </div>

      {/* Step 2: Formula Building & Band Selection */}
      <div className="lab-step-panel">
        <div className="lab-step-marker">
          <span>02</span>
          <div className="lab-step-copy">
            <strong>Choose the contrast</strong>
            <small>Keep the target fixed; change one band at a time.</small>
          </div>
        </div>
        <div className="lab-template-grid" role="group" aria-label="Formula family">
          {FORMULA_TEMPLATES.map(item => (
            <button
              key={item.id}
              type="button"
              className={`lab-template-button ${templateId === item.id ? 'active' : ''}`}
              onClick={() => setTemplate(item.id)}
            >
              <strong>{item.name}</strong>
              <code>{item.shortFormula}</code>
              <small>{item.roleLabels.length} BANDS</small>
            </button>
          ))}
        </div>
        <p className="lab-template-description"><strong>What changes?</strong> {template.description}</p>

        {/* Band Role Dropdowns */}
        <div className="lab-role-grid">
          {template.roleLabels.map((role, index) => {
            const currentBandId = bands[index];
            const bandColor = BAND_COLORS[currentBandId] || '#38bdf8';
            return (
              <label key={role} className="lab-role-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: bandColor, boxShadow: `0 0 6px ${bandColor}` }} />
                  <span>{role}</span>
                </div>
                <select
                  value={currentBandId}
                  onChange={event => setBandRole(index, event.target.value as ReflectanceBandId)}
                >
                  {availableBands.map(band => (
                    <option key={band.id} value={band.id}>
                      {band.bandCode} · {band.name} ({band.wavelength})
                    </option>
                  ))}
                </select>
                <small>Wavelength: {getBandForMode(currentBandId, satelliteMode).wavelength}</small>
              </label>
            );
          })}
        </div>

        {/* Live Mathematical Formula Readout Banner */}
        <div className="lab-formula-readout">
          <div>
            <span>READY TO COMPARE · 15 TEACHING SURFACES</span>
            <code>{formula}</code>
          </div>
          <button type="button" className="lab-run-button" onClick={runChallenge} aria-label="Compare the target with 15 teaching surfaces">
            Compare target vs confusers →
          </button>
        </div>
      </div>

      {/* Step 3: Interactive Stress-Test Results */}
      {result && (
        <div className="lab-results-panel" aria-live="polite">
          <div className="lab-result-heading">
            <div>
              <div className="lab-step-marker">
                <span>03</span>
                <div className="lab-step-copy">
                  <strong>Decide what to keep</strong>
                  <small>Compare the candidate with its known baseline.</small>
                </div>
              </div>
              <h3 style={{ color: result.contrastScore >= 75 ? '#4ade80' : result.contrastScore >= 50 ? '#fbbf24' : '#f87171' }}>
                {result.contrastScore >= 75 ? '🏆 ' : result.contrastScore >= 50 ? '⚠️ ' : '❌ '}
                {result.verdict}
              </h3>
            </div>
            <div className={`lab-baseline-delta ${result.baselineDelta >= 0 ? 'positive' : 'negative'}`}>
              <span>vs established {target.baselineName}</span>
              <strong>{result.baselineDelta >= 0 ? '+' : ''}{result.baselineDelta} Pairwise Points</strong>
            </div>
          </div>

          {/* Scores Overview Grid */}
          <div className="lab-score-grid">
            <div className={`lab-score-card ${scoreTone(result.contrastScore)}`}>
              <div className="lab-score-heading"><span>Separation gap</span><strong>{result.contrastScore}%</strong></div>
              <div className="lab-score-track" role="img" aria-label={`Separation gap ${result.contrastScore} percent`}><span style={{ width: `${result.contrastScore}%` }} /></div>
              <p>How far the target’s average response sits from the other reference classes.</p>
            </div>

            <div className={`lab-score-card ${scoreTone(result.robustnessScore)}`}>
              <div className="lab-score-heading"><span>Consistency</span><strong>{result.robustnessScore}%</strong></div>
              <div className="lab-score-track" role="img" aria-label={`Consistency ${result.robustnessScore} percent`}><span style={{ width: `${result.robustnessScore}%` }} /></div>
              <p>How often the target keeps the expected ordering against 12 confuser signatures.</p>
            </div>

            <div className={`lab-score-card ${scoreTone(result.interpretabilityScore)}`}>
              <div className="lab-score-heading"><span>Setup quality</span><strong>{result.interpretabilityScore}%</strong></div>
              <div className="lab-score-track" role="img" aria-label={`Setup quality ${result.interpretabilityScore} percent`}><span style={{ width: `${result.interpretabilityScore}%` }} /></div>
              <p>Credits a written reason, distinct bands, and a compact formula.</p>
            </div>
          </div>

          <div className={`lab-result-takeaway ${result.challenge.passesExpectedOrder ? 'pass' : 'fail'}`}>
            <span>WHAT TO DO NEXT</span>
            <strong>
              {result.challenge.passesExpectedOrder
                ? `Keep testing: ${target.name.toLowerCase()} stays ${result.direction} than its closest confuser in this reference set.`
                : `Stop and revise: the closest confuser outranks the ${target.name.toLowerCase()} target in this reference set.`}
            </strong>
            <p>
              Use this to decide whether to keep the established {target.baselineName}, change one band, or compare another target. It is evidence for a classroom hypothesis—not proof that a new index works on satellite imagery.
            </p>
          </div>

          {/* Toughest Confuser Challenge Matchup */}
          <div className={`lab-challenge-card ${result.challenge.passesExpectedOrder ? 'pass' : 'fail'}`}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: '#94a3b8' }}>Closest confuser · where the formula is most likely to fail</span>
              <strong style={{ fontSize: '0.9rem', display: 'block', color: '#f8fafc' }}>
                {result.challenge.targetLabel} ↔ {result.challenge.confuserLabel}
              </strong>
            </div>
            <div className="lab-challenge-values">
              <span style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#4ade80', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                Target: {result.challenge.targetValue.toFixed(3)}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>vs</span>
              <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                Confuser: {result.challenge.confuserValue.toFixed(3)}
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#cbd5e1', margin: '6px 0 0 0' }}>
              {result.challenge.passesExpectedOrder
                ? `The target keeps the expected ${result.direction} ordering against this closest confuser.`
                : 'The confuser reverses the expected ordering. That overlap is the useful lesson here.'}
            </p>
          </div>

          <div className="lab-evidence-note">
            <strong>Reference boundary</strong>
            <span>These 15 values are hand-authored teaching signatures: plausible reflectance patterns, not observations, training data, or scientific validation.</span>
          </div>

          {/* Visual 15 Surface Response Bar Breakdown */}
          <details className="lab-reference-table" style={{ marginTop: '12px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#38bdf8', padding: '8px 0' }}>
              Show all 15 reference surfaces
            </summary>
            <div className="lab-reference-scroll" style={{ overflowX: 'auto', marginTop: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '6px' }}>Surface Name</th>
                    <th style={{ padding: '6px' }}>Surface Class</th>
                    <th style={{ padding: '6px' }}>Computed Index Value</th>
                    <th style={{ padding: '6px' }}>Visual Signal Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {[...result.sampleResults]
                    .sort((a, b) => Number(b.isTarget) - Number(a.isTarget) || b.value - a.value)
                    .map(sample => {
                      const normalizedVal = Math.max(-1, Math.min(1, sample.value));
                      const barPct = Math.max(2, ((normalizedVal + 1) / 2) * 100);
                      const barColor = sample.isTarget ? '#10b981' : '#64748b';
                      return (
                        <tr key={sample.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: sample.isTarget ? 'rgba(16, 185, 129, 0.08)' : 'transparent' }}>
                          <td style={{ padding: '6px', fontWeight: sample.isTarget ? 800 : 500, color: sample.isTarget ? '#4ade80' : '#e2e8f0' }}>
                            {sample.isTarget ? '🎯 ' : ''}{sample.label}
                          </td>
                          <td style={{ padding: '6px', color: '#94a3b8' }}>{classLabel(sample.classId)}</td>
                          <td style={{ padding: '6px' }}>
                            <code style={{ color: sample.isTarget ? '#4ade80' : '#94a3b8', fontFamily: 'monospace' }}>
                              {sample.value.toFixed(3)}
                            </code>
                          </td>
                          <td style={{ padding: '6px', width: '35%' }}>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${barPct}%`, height: '100%', background: barColor, borderRadius: '4px' }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
