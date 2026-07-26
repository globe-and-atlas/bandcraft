import React, { useState } from 'react';
import { TRAIT_FAMILIES, type FamilyId } from './data/suits';
import { SATELLITES, getSatellitesForSuit } from './data/fieldGuide';
import { INDEX_RECIPES, getBand, classifyIndexValue } from './data/indices';

interface FieldGuideModalProps {
  onClose: () => void;
}

type FieldGuideTab = 'satellites' | 'index';

// Default slider starting points, one per band in a recipe (2 or 3 bands) — the
// first band starts high, the rest start low, so the default view already reads
// as a plausible "vegetated" example rather than a flat 0/0.
const DEFAULT_SLIDER_VALUES = [70, 15, 10];

export default function FieldGuideModal({ onClose }: FieldGuideModalProps) {
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

  const selectRecipe = (id: string) => {
    const nextRecipe = INDEX_RECIPES.find(r => r.id === id);
    setRecipeId(id);
    setSliderValues(DEFAULT_SLIDER_VALUES.slice(0, nextRecipe?.bands.length ?? 2));
  };

  const setSliderValue = (index: number, value: number) => {
    setSliderValues(prev => prev.map((v, i) => (i === index ? value : v)));
  };

  return (
    <div className="catalogue-modal-overlay" onClick={onClose}>
      <div
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
            🧮 Build an Index
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
            ) : (
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

                <h3>{recipe.name}</h3>
                <div className="field-guide-formula">{recipe.formula}</div>

                <div className="field-guide-bands-used">
                  {recipeBands.map(band => (
                    <div key={band.id} className="field-guide-band-role">
                      <strong>{band.name}</strong>
                      <span>Wavelength: {band.wavelength}</span>
                    </div>
                  ))}
                </div>

                <p className="field-guide-why">{recipe.meaning}</p>

                <div className="field-guide-calculator">
                  <div className="field-guide-calculator-title">Try it: reflectance → {recipe.id.toUpperCase()}</div>
                  {recipeBands.map((band, index) => (
                    <label key={band.id} className="field-guide-slider-row">
                      <span>{band.name} reflectance</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={sliderValues[index]}
                        onChange={event => setSliderValue(index, Number(event.target.value))}
                        aria-label={`${band.name} reflectance percentage`}
                      />
                      <span className="field-guide-slider-value">{sliderValues[index]}%</span>
                    </label>
                  ))}

                  <div className="field-guide-calculator-result" style={{ borderColor: resultClass.color }}>
                    <div className="field-guide-calculator-equation">
                      {equationText}
                    </div>
                    <div className="field-guide-calculator-label" style={{ color: resultClass.color }}>
                      {resultClass.label}
                    </div>
                  </div>
                </div>

                <div className="field-guide-scale">
                  {recipe.scale.map(entry => (
                    <div key={entry.label} className="field-guide-scale-row">
                      <span className="field-guide-scale-swatch" style={{ background: entry.color }} />
                      <span className="field-guide-scale-range">{entry.min.toFixed(1)} to {entry.max.toFixed(1)}</span>
                      <span className="field-guide-scale-label">{entry.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
