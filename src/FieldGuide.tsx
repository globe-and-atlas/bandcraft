import { useState } from 'react';
import { useModalA11y } from './useModalA11y';
import { TRAIT_FAMILIES, type FamilyId } from './data/suits';
import { SATELLITES, getSatellitesForSuit } from './data/fieldGuide';
import { INDEX_RECIPES, RELATED_FORMULAS, getBand, classifyIndexValue, type BandId } from './data/indices';

interface FieldGuideModalProps {
  onClose: () => void;
}

type FieldGuideTab = 'satellites' | 'index' | 'related';

const DEFAULT_SLIDER_VALUES = [75, 12, 10];

const BAND_WAVELENGTHS: Record<BandId, number> = {
  blue: 490,
  green: 560,
  red: 665,
  rededge: 705,
  nir: 842,
  swir1: 1610,
  swir2: 2190,
  thermal: 2000
};

export default function FieldGuideModal({ onClose }: FieldGuideModalProps) {
  const modalRef = useModalA11y<HTMLDivElement>(onClose);
  const [tab, setTab] = useState<FieldGuideTab>('satellites');
  const [suitFilter, setSuitFilter] = useState<FamilyId | 'all'>('all');
  const [recipeId, setRecipeId] = useState(INDEX_RECIPES[0].id);
  const [sliderValues, setSliderValues] = useState<number[]>(DEFAULT_SLIDER_VALUES.slice(0, INDEX_RECIPES[0].bands.length));

  const recipe = INDEX_RECIPES.find(r => r.id === recipeId) ?? INDEX_RECIPES[0];
  const recipeBands = recipe.bands.map(getBand);
  const result = recipe.evaluate(sliderValues);
  const resultClass = classifyIndexValue(recipe, result);
  const equationText = recipe.renderEquation(sliderValues);
  const visibleSatellites = suitFilter === 'all' ? SATELLITES : getSatellitesForSuit(suitFilter);

  // Position on scale bar (-1.0 to +1.0) mapped to 0% to 100%
  const scaleMin = recipe.scale[0]?.min ?? -1;
  const scaleMax = recipe.scale[recipe.scale.length - 1]?.max ?? 1;
  const pointerPct = Math.max(0, Math.min(100, ((result - scaleMin) / (scaleMax - scaleMin)) * 100));

  const selectRecipe = (id: string) => {
    const nextRecipe = INDEX_RECIPES.find(r => r.id === id);
    setRecipeId(id);
    setSliderValues(DEFAULT_SLIDER_VALUES.slice(0, nextRecipe?.bands.length ?? 2));
  };

  const compareToRecipe = (id: string) => {
    selectRecipe(id);
    setTab('index');
  };

  const setSliderValue = (index: number, value: number) => {
    setSliderValues(prev => prev.map((v, i) => (i === index ? value : v)));
  };

  // Build live SVG spectral curve from slider values
  const SVG_W = 540;
  const SVG_H = 140;
  const PAD_L = 35;
  const PAD_R = 20;
  const PAD_T = 15;
  const PAD_B = 25;
  const PLOT_W = SVG_W - PAD_L - PAD_R;
  const PLOT_H = SVG_H - PAD_T - PAD_B;

  const wlToX = (wl: number) => PAD_L + ((wl - 400) / 1800) * PLOT_W;
  const valToY = (val: number) => PAD_T + PLOT_H - (val / 100) * PLOT_H;

  return (
    <div className="catalogue-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        data-modal-root="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="field-guide-title"
        tabIndex={-1}
        className="catalogue-modal field-guide-modal"
        onClick={event => event.stopPropagation()}
      >
        <header className="catalogue-modal-header">
          <div>
            <span className="catalogue-modal-kicker">Reference Library</span>
            <h2 id="field-guide-title">Field Guide</h2>
          </div>
          <button className="btn-small catalogue-close" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="field-guide-tabs" role="tablist" aria-label="Field Guide sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'satellites'}
            className={`field-guide-tab ${tab === 'satellites' ? 'active' : ''}`}
            onClick={() => setTab('satellites')}
          >
            🛰️ Satellites & Bands
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'index'}
            className={`field-guide-tab ${tab === 'index' ? 'active' : ''}`}
            onClick={() => setTab('index')}
          >
            🧮 Interactive Index Sandbox
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'related'}
            className={`field-guide-tab ${tab === 'related' ? 'active' : ''}`}
            onClick={() => setTab('related')}
          >
            🔬 Related Formulas
          </button>
        </div>

        <div className="catalogue-modal-scroll">
          <div className="catalogue-modal-content field-guide-content">
            {tab === 'satellites' ? (
              <>
                <div className="field-guide-filter-row" role="group" aria-label="Filter satellites by environmental suit">
                  <button
                    type="button"
                    className={`field-guide-filter-chip ${suitFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setSuitFilter('all')}
                  >
                    All
                  </button>
                  {(Object.entries(TRAIT_FAMILIES) as [FamilyId, typeof TRAIT_FAMILIES[FamilyId]][]).map(([id, family]) => (
                    <button
                      key={id}
                      type="button"
                      className={`field-guide-filter-chip ${suitFilter === id ? 'active' : ''}`}
                      onClick={() => setSuitFilter(id)}
                    >
                      {family.glyph} {family.shortLabel}
                    </button>
                  ))}
                </div>

                <div className="field-guide-satellite-list">
                  {visibleSatellites.map(satellite => (
                    <article key={satellite.id} className="field-guide-satellite-card">
                      <div className="field-guide-satellite-header">
                        <h3>{satellite.name}</h3>
                        <div className="field-guide-satellite-meta">
                          <span>{satellite.agency}</span>
                          <span>·</span>
                          <span>Launched {satellite.launched}</span>
                        </div>
                        <div className="field-guide-suit-tags">
                          {satellite.suits.map(suit => (
                            <span key={suit} className={`field-guide-suit-tag family-${suit}`}>
                              {TRAIT_FAMILIES[suit].glyph} {TRAIT_FAMILIES[suit].shortLabel}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="field-guide-satellite-summary">{satellite.summary}</p>
                      <table className="field-guide-band-table">
                        <thead>
                          <tr>
                            <th>Band</th>
                            <th>Wavelength</th>
                            <th>Resolution</th>
                            <th>Use</th>
                          </tr>
                        </thead>
                        <tbody>
                          {satellite.bands.map(band => (
                            <tr key={band.name}>
                              <td>{band.name}</td>
                              <td>{band.wavelength}</td>
                              <td>{band.resolution}</td>
                              <td>{band.use}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </article>
                  ))}
                </div>

                <p className="field-guide-credits">
                  Card art throughout Bandcraft is NASA Earth Observatory imagery, which is public domain.
                </p>
              </>
            ) : tab === 'index' ? (
              <div className="field-guide-index-lesson">
                <div className="field-guide-filter-row" role="group" aria-label="Choose an index to explore">
                  {INDEX_RECIPES.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      className={`field-guide-filter-chip ${recipe.id === r.id ? 'active' : ''}`}
                      onClick={() => selectRecipe(r.id)}
                    >
                      {TRAIT_FAMILIES[r.suit].glyph} {r.id.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="sandbox-header-card">
                  <div className="sandbox-title-row">
                    <h3>{recipe.name}</h3>
                    <span className="sandbox-formula-pill"><code>{recipe.formula}</code></span>
                  </div>
                  <p className="field-guide-why">{recipe.meaning}</p>
                </div>

                {/* Live Interactive Spectral Reflectance Chart */}
                <div className="sandbox-chart-box">
                  <div className="sandbox-chart-title">
                    <span>📊 Live Reflectance Curve</span>
                    <span className="chart-hint">Adjust the sliders below to move the spectral reflectance points!</span>
                  </div>
                  <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="sandbox-svg">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(v => (
                      <g key={v}>
                        <line x1={PAD_L} y1={valToY(v)} x2={SVG_W - PAD_R} y2={valToY(v)} stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" />
                        <text x={PAD_L - 6} y={valToY(v) + 3} fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">{v}%</text>
                      </g>
                    ))}

                    {/* Band Marker Dots & Lines */}
                    {recipeBands.map((band, idx) => {
                      const val = sliderValues[idx] ?? 50;
                      const wl = BAND_WAVELENGTHS[band.id] ?? 600;
                      const x = wlToX(wl);
                      const y = valToY(val);
                      return (
                        <g key={band.id}>
                          <line x1={x} y1={PAD_T} x2={x} y2={PAD_T + PLOT_H} stroke={band.color} strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
                          <circle cx={x} cy={y} r="7" fill={band.color} stroke="#ffffff" strokeWidth="2" />
                          <text x={x} y={y - 12} fill={band.color} fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="monospace">{val}%</text>
                          <text x={x} y={SVG_H - 8} fill={band.color} fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">{band.bandCode}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Reflectance Sliders */}
                <div className="field-guide-calculator">
                  <div className="field-guide-calculator-title">🎛️ Adjust Band Reflectance Inputs</div>
                  {recipeBands.map((band, index) => (
                    <label key={band.id} className="field-guide-slider-row">
                      <span className="slider-band-name" style={{ color: band.color }}>
                        <strong>{band.bandCode}</strong> {band.name}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={sliderValues[index]}
                        onChange={event => setSliderValue(index, Number(event.target.value))}
                        aria-label={`${band.name} reflectance percentage`}
                      />
                      <span className="field-guide-slider-value" style={{ color: band.color }}>
                        {sliderValues[index]}%
                      </span>
                    </label>
                  ))}

                  {/* Live Result Dashboard */}
                  <div className="sandbox-live-result-panel" style={{ borderColor: resultClass.color }}>
                    <div className="live-result-left">
                      <div className="live-swatch-box" style={{ background: resultClass.color }}>
                        <span className="swatch-raster-grid" />
                      </div>
                      <div className="live-result-readout">
                        <div className="live-value-num" style={{ color: resultClass.color }}>
                          {recipe.id.toUpperCase()} = {result > 0 ? `+${result.toFixed(2)}` : result.toFixed(2)}
                        </div>
                        <div className="live-classification-tag" style={{ color: resultClass.color }}>
                          {resultClass.label}
                        </div>
                        <div className="live-equation-worked"><code>{equationText}</code></div>
                      </div>
                    </div>

                    {/* Live Continuous Scale Bar with Dynamic Needle Pin */}
                    <div className="live-scale-bar-wrapper">
                      <div className="scale-bar-header">
                        <span>Classification Scale Bar</span>
                        <span className="needle-val">{result.toFixed(2)}</span>
                      </div>
                      <div className="sandbox-scale-gradient-bar">
                        <div
                          className="scale-bar-fill"
                          style={{
                            background: `linear-gradient(to right, ${recipe.scale.map(s => s.color).join(', ')})`
                          }}
                        />
                        {/* Dynamic Needle Pin Pointer */}
                        <div className="needle-pin" style={{ left: `${pointerPct}%` }}>
                          <div className="needle-head" style={{ background: resultClass.color }} />
                          <div className="needle-line" />
                        </div>
                      </div>
                      <div className="sandbox-scale-ticks">
                        <span>{scaleMin.toFixed(1)}</span>
                        <span>0.0</span>
                        <span>+{scaleMax.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="field-guide-scale">
                  <div className="scale-legend-title">Index Classification Thresholds</div>
                  {recipe.scale.map(entry => (
                    <div key={entry.label} className="field-guide-scale-row">
                      <span className="field-guide-scale-swatch" style={{ background: entry.color }} />
                      <span className="field-guide-scale-range">{entry.min.toFixed(1)} to {entry.max.toFixed(1)}</span>
                      <span className="field-guide-scale-label">{entry.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="field-guide-related-formulas">
                <p className="field-guide-related-intro">
                  These are real, standard indices — but they aren't clickable band combinations in Bandcraft, because each one uses the exact same bands as an index already above. The mechanic here resolves "which index?" purely from which bands you select, so two formulas can't share one band pair. That's not a gap — it's the lesson: <strong>the same two numbers can answer a different question depending on the formula you apply to them.</strong>
                </p>
                {RELATED_FORMULAS.map(formula => {
                  const sharedRecipe = INDEX_RECIPES.find(r => r.id === formula.sharesBandsWith)!;
                  return (
                    <article key={formula.id} className="field-guide-related-card">
                      <div className="field-guide-related-header">
                        <h3>{formula.name}</h3>
                        <button
                          type="button"
                          className="field-guide-related-compare-btn"
                          onClick={() => compareToRecipe(formula.sharesBandsWith)}
                        >
                          Compare to {sharedRecipe.id.toUpperCase()} →
                        </button>
                      </div>
                      <div className="field-guide-formula">{formula.formula}</div>
                      <p className="field-guide-why">{formula.meaning}</p>
                      <p className="field-guide-related-shares">
                        Shares {formula.bands.map(b => getBand(b).name).join(' + ')} with <strong>{sharedRecipe.name}</strong> — same inputs, different formula, different question.
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
