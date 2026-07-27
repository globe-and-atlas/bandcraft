import React, { useMemo, useState } from 'react';
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
  type SatelliteMode
} from './data/indices';

interface FormulaLabProps {
  satelliteMode: SatelliteMode;
}

function scoreTone(score: number): 'strong' | 'mixed' | 'weak' {
  if (score >= 85) return 'strong';
  if (score >= 70) return 'mixed';
  return 'weak';
}

function ScoreMeter({ label, score, note }: { label: string; score: number; note: string }) {
  return (
    <div className={`lab-score-card ${scoreTone(score)}`}>
      <div className="lab-score-heading">
        <span>{label}</span>
        <strong>{score}</strong>
      </div>
      <div className="lab-score-track" aria-hidden="true">
        <span style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
      </div>
      <p>{note}</p>
    </div>
  );
}

function classLabel(classId: string): string {
  return classId === 'soil' ? 'Bare soil' : classId.charAt(0).toUpperCase() + classId.slice(1);
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
      <div className="formula-lab-hero">
        <div>
          <span className="formula-lab-kicker">ADVANCED MODE · HYPOTHESIS → FORMULA → REFUTATION</span>
          <h2 id="formula-lab-title">Limn Signal Formula Lab</h2>
          <p>Build one explainable candidate, then test it against the surfaces most likely to fool it.</p>
        </div>
        <span className="experimental-seal">EXPERIMENTAL<br />NOT VALIDATED</span>
      </div>

      <div className="lab-step-panel">
        <div className="lab-step-marker"><span>01</span> State the environmental question</div>
        <div className="lab-target-grid" role="group" aria-label="Environmental target">
          {LAB_TARGETS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`lab-target-button ${targetId === item.id ? 'active' : ''}`}
              onClick={() => setTarget(item.id)}
            >
              <strong>{item.name}</strong>
              <span>Baseline: {item.baselineName}</span>
            </button>
          ))}
        </div>
        <p className="lab-question">{target.question}</p>
        <label className="lab-hypothesis-field">
          <span>My physical hypothesis</span>
          <textarea
            value={hypothesis}
            rows={2}
            onChange={event => { setHypothesis(event.target.value); setResult(null); }}
            placeholder="Explain why these wavelengths should respond differently."
          />
        </label>
      </div>

      <div className="lab-step-panel">
        <div className="lab-step-marker"><span>02</span> Choose a bounded formula family</div>
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
              <small>{item.roleLabels.length} bands</small>
            </button>
          ))}
        </div>
        <p className="lab-template-description">{template.description}</p>

        <div className="lab-role-grid">
          {template.roleLabels.map((role, index) => (
            <label key={role} className="lab-role-card">
              <span>{role}</span>
              <select
                value={bands[index]}
                onChange={event => setBandRole(index, event.target.value as ReflectanceBandId)}
              >
                {availableBands.map(band => (
                  <option key={band.id} value={band.id}>
                    {band.bandCode} · {band.name}
                  </option>
                ))}
              </select>
              <small>{getBandForMode(bands[index], satelliteMode).wavelength}</small>
            </label>
          ))}
        </div>

        <div className="lab-formula-readout">
          <div>
            <span>Candidate expression</span>
            <code>{formula}</code>
          </div>
          <button type="button" className="lab-run-button" onClick={runChallenge}>
            Run confuser challenge →
          </button>
        </div>
      </div>

      {result && (
        <div className="lab-results-panel" aria-live="polite">
          <div className="lab-result-heading">
            <div>
              <span className="lab-step-marker"><span>03</span> Try to break it</span>
              <h3>{result.verdict}</h3>
            </div>
            <div className={`lab-baseline-delta ${result.baselineDelta > 0 ? 'positive' : result.baselineDelta < 0 ? 'negative' : ''}`}>
              <span>vs {target.baselineName} in teaching set</span>
              <strong>{result.baselineDelta > 0 ? '+' : ''}{result.baselineDelta} pairwise score</strong>
            </div>
          </div>

          <div className="lab-score-grid">
            <ScoreMeter
              label="Teaching contrast"
              score={result.contrastScore}
              note={`Mean ${target.name.toLowerCase()} response is ${result.direction} than the confuser mean.`}
            />
            <ScoreMeter
              label="Pairwise ordering"
              score={result.robustnessScore}
              note={`Ordering across 3 hand-authored target signatures and 12 confusers. ${target.baselineName}: ${result.baselineRobustness}.`}
            />
            <ScoreMeter
              label="Heuristic clarity"
              score={result.interpretabilityScore}
              note="Rewards a stated physical hypothesis, unique band roles, and a compact formula."
            />
          </div>

          <div className={`lab-challenge-card ${result.challenge.passesExpectedOrder ? 'pass' : 'fail'}`}>
            <div>
              <span>Closest confuser</span>
              <strong>{result.challenge.targetLabel} ↔ {result.challenge.confuserLabel}</strong>
            </div>
            <div className="lab-challenge-values">
              <code>{result.challenge.targetValue.toFixed(3)}</code>
              <span>gap {result.challenge.gap.toFixed(3)}</span>
              <code>{result.challenge.confuserValue.toFixed(3)}</code>
            </div>
            <p>
              {result.challenge.passesExpectedOrder
                ? 'This closest pair still follows the candidate’s overall direction—but it is where the formula is most vulnerable.'
                : 'This pair reverses the candidate’s expected direction. The confuser breaks the rule.'}
            </p>
          </div>

          <details className="lab-reference-table">
            <summary>Inspect all 15 teaching signatures</summary>
            <div className="lab-reference-scroll">
              <table>
                <thead>
                  <tr><th>Surface</th><th>Class</th><th>Candidate value</th><th>Role</th></tr>
                </thead>
                <tbody>
                  {[...result.sampleResults]
                    .sort((a, b) => Number(b.isTarget) - Number(a.isTarget) || b.value - a.value)
                    .map(sample => (
                      <tr key={sample.id} className={sample.isTarget ? 'target' : ''}>
                        <td>{sample.label}</td>
                        <td>{classLabel(sample.classId)}</td>
                        <td><code>{sample.value.toFixed(3)}</code></td>
                        <td>{sample.isTarget ? 'Target' : 'Confuser'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </details>

          <p className="lab-validation-note">
            These scores are teaching heuristics derived from 15 hand-authored signatures—not observations, model validation, or evidence of novelty. A publishable index still requires independent measurements, geographic and temporal holdouts, uncertainty analysis, and comparison on real imagery.
          </p>
        </div>
      )}
    </section>
  );
}
