import React, { useState } from 'react';
import {
  INDEX_RECIPES,
  getBand,
  getBandForMode,
  getBandsForMode,
  findRecipeForBands,
  explainMismatchForBands,
  type BandId,
  type IndexRecipe,
  type SatelliteMode
} from './data/indices';
import { TRAIT_FAMILIES } from './data/suits';
import FieldGuideModal from './FieldGuide';
import SplitSatelliteViewer from './SplitSatelliteViewer';
import FlippableBandCard from './FlippableBandCard';
import FormulaLab from './FormulaLab';

type CombineResult =
  | { kind: 'match'; recipe: IndexRecipe }
  | { kind: 'mismatch'; selected: BandId[]; reason: string };

// Reads the band via the active satellite mode so the code shown here (e.g. NIR's
// B05 in Landsat-8 mode) matches what the selection grid just showed — getBand()
// alone always returns the Sentinel-numbered default regardless of mode.
function EquationBandCard({ bandId, satelliteMode }: { bandId: BandId; satelliteMode: SatelliteMode }) {
  const band = getBandForMode(bandId, satelliteMode);
  return (
    <div className="equation-card" style={{ borderColor: band.color }}>
      <div className={`relic-card-art band-swatch-${bandId}`} style={{ height: '90px', display: 'grid', placeItems: 'center', position: 'relative' }}>
        <div className="spectral-wave-overlay" />
        <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-mono, monospace)', color: '#ffffff', zIndex: 1 }}>{band.bandCode}</span>
      </div>
      <div className="card-bottom-plate compact">
        <div style={{ color: band.color, fontSize: '0.6rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>{band.sensorTag}</div>
        <div>{band.name}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [hasEnteredGame, setHasEnteredGame] = useState(false);
  const [satelliteMode, setSatelliteMode] = useState<SatelliteMode>('all');
  const [selectedBandIds, setSelectedBandIds] = useState<BandId[]>([]);
  const [result, setResult] = useState<CombineResult | null>(null);
  const [isFieldGuideOpen, setIsFieldGuideOpen] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<'guided' | 'formula-lab'>('guided');

  const activeBands = getBandsForMode(satelliteMode);

  const evaluateCombination = (bands: BandId[]) => {
    if (bands.length < 2) {
      setResult(null);
      return;
    }
    const recipe = findRecipeForBands(bands);
    if (!recipe) {
      setResult({ kind: 'mismatch', selected: bands, reason: explainMismatchForBands(bands) });
      return;
    }

    setResult({ kind: 'match', recipe });
  };

  const handleBandClick = (bandId: BandId) => {
    let next: BandId[];
    if (selectedBandIds.includes(bandId)) {
      next = selectedBandIds.filter(id => id !== bandId);
    } else {
      if (selectedBandIds.length >= 3) {
        next = [bandId];
      } else {
        next = [...selectedBandIds, bandId];
      }
    }
    setSelectedBandIds(next);
    evaluateCombination(next);
  };

  const resetProgress = () => {
    setResult(null);
    setSelectedBandIds([]);
  };

  // Re-selecting a discovered index doesn't need to re-derive anything —
  // we already know the recipe. Force "all sensors" mode first so every
  // recipe's bands are guaranteed present in the grid (e.g. NDRE's Red Edge
  // band doesn't exist in Landsat-8 mode).
  const selectDiscoveredIndex = (recipe: IndexRecipe) => {
    setSatelliteMode('all');
    setSelectedBandIds(recipe.bands);
    setResult({ kind: 'match', recipe });
  };

  if (!hasEnteredGame) {
    return (
      <main className="relic-title-screen">
        <div className="title-screen-art" aria-hidden="true" />
        <div className="title-screen-glow" aria-hidden="true" />
        <div className="title-screen-copy">
          <span className="title-screen-overline">A GLOBE & ATLAS GAME OF SPECTRAL BANDCRAFT</span>
          <h1>LIMN<br /><em>SIGNAL</em></h1>
          <p><strong>Multispectral Remote Sensing & Index Workbench.</strong> Explore seven established spectral indices (NDVI, EVI, NDWI, MNDWI, NDRE, NDBI, NBR) through sensor-aware band roles, documented formulas, and illustrative teaching scenes.</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
            <span className="sensor-chip" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>SENTINEL-2 MSI · 10–20m</span>
            <span className="sensor-chip" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>LANDSAT 8 OLI/TIRS · 30–100m</span>
            <span className="sensor-chip" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>7 DOCUMENTED INDICES</span>
          </div>
          <div className="title-screen-actions">
            <button className="title-primary-action" type="button" onClick={() => setHasEnteredGame(true)}>
              Initialize Satellite Workbench →
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <React.Fragment>
      {isFieldGuideOpen && <FieldGuideModal onClose={() => setIsFieldGuideOpen(false)} />}

      <div className="game-layout">
        <header className="game-header flex items-center justify-between">
          <div className="header-brand-group flex items-center">
            <div className="header-title">
              <span className="header-kicker">GLOBE & ATLAS | BANDCRAFT SPECTRAL LAB</span>
              <h1>Multispectral Remote Sensing Workstation</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="discovery-counter-chip">
              <strong>7 SATELLITE INDICES AVAILABLE</strong>
            </div>
            <div className="workspace-switcher" role="group" aria-label="Choose workspace">
              <button
                type="button"
                className={workspaceMode === 'guided' ? 'active' : ''}
                onClick={() => setWorkspaceMode('guided')}
              >
                Index Deck
              </button>
              <button
                type="button"
                className={workspaceMode === 'formula-lab' ? 'active' : ''}
                onClick={() => setWorkspaceMode('formula-lab')}
              >
                Formula Lab
              </button>
            </div>
            <button className="btn-small" type="button" onClick={() => setIsFieldGuideOpen(true)}>
              Field Guide & Specs
            </button>
            <button className="btn-small header-reset-btn" type="button" onClick={resetProgress}>
              Reset Session
            </button>
          </div>
        </header>

        <main className="dashboard-grid">
          <section className="center-shell">
            {workspaceMode === 'guided' ? (
              <React.Fragment>
            <div className="fusion-workbench">
              <div className="fusion-workbench-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
                <div>
                  <span className="fusion-workbench-kicker">SPECTRAL BAND SELECTION</span>
                  <strong>Select 2 or 3 multispectral bands to compute a spectral index.</strong>
                  <span>Supports 2-band ratio pairs (NDVI, NDWI) and 3-band atmospheric formulas (EVI).</span>
                </div>
                <div className="satellite-mode-toolbar" style={{ display: 'flex', gap: '0.4rem', width: '100%', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`btn-small ${satelliteMode === 'all' ? 'active-mode' : ''}`}
                    onClick={() => { setSatelliteMode('all'); setSelectedBandIds([]); setResult(null); }}
                    style={satelliteMode === 'all' ? { background: '#0284c7', color: '#fff', fontWeight: 800 } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                  >
                    🌐 All Sensors (8 Bands)
                  </button>

                  <div className="toolbar-satellite-group" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <button
                      type="button"
                      className={`btn-small ${satelliteMode === 'sentinel2' ? 'active-mode' : ''}`}
                      onClick={() => { setSatelliteMode('sentinel2'); setSelectedBandIds([]); setResult(null); }}
                      style={satelliteMode === 'sentinel2' ? { background: '#0284c7', color: '#fff', fontWeight: 800 } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                    >
                      🇪🇺 Sentinel-2 MSI Mode
                    </button>
                  </div>

                  <div className="toolbar-satellite-group" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <button
                      type="button"
                      className={`btn-small ${satelliteMode === 'landsat8' ? 'active-mode' : ''}`}
                      onClick={() => { setSatelliteMode('landsat8'); setSelectedBandIds([]); setResult(null); }}
                      style={satelliteMode === 'landsat8' ? { background: '#0284c7', color: '#fff', fontWeight: 800 } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                    >
                      🇺🇸 Landsat-8 OLI/TIRS Mode
                    </button>
                  </div>
                </div>
              </div>
              <div className="workbench-card-grid" aria-label="Spectral bands">
                {activeBands.map(band => (
                  <FlippableBandCard
                    key={band.id}
                    band={band}
                    isSelected={selectedBandIds.includes(band.id)}
                    onSelect={handleBandClick}
                  />
                ))}
              </div>
            </div>

            <div className="active-selection-preview-panel">
              <div className="preview-title">Active Spectral Computation</div>
              {selectedBandIds.length === 0 && (
                  <div style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', padding: '0.35rem' }}>
                  Select 2 or 3 spectral bands above to evaluate their index formula (e.g., select NIR + Red + Blue for EVI!).
                </div>
              )}
              {selectedBandIds.length === 1 && (
                  <div style={{ color: '#38bdf8', fontSize: '0.82rem', textAlign: 'center', padding: '0.35rem' }}>
                  Selected {getBand(selectedBandIds[0]).name}. Select 1 or 2 more bands to compute a spectral index.
                </div>
              )}
              {result && result.kind === 'match' && (
                <React.Fragment>
                  <div className="equation-row">
                  {result.recipe.bands.map((bId, idx) => (
                    <React.Fragment key={bId}>
                      {idx > 0 && <div className="equation-symbol">+</div>}
                      <EquationBandCard bandId={bId} satelliteMode={satelliteMode} />
                    </React.Fragment>
                  ))}
                  <div className="equation-symbol">=</div>
                  <div className="index-result-card">
                    <div className="index-card-header">
                      <span className={`index-suit-badge family-${result.recipe.suit}`}>
                        {TRAIT_FAMILIES[result.recipe.suit].shortLabel.toUpperCase()}
                      </span>
                      {result.recipe.satelliteTag && <span className="sensor-chip" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>{result.recipe.satelliteTag}</span>}
                    </div>
                    <div className="index-card-name">{result.recipe.name}</div>
                    <div className="index-formula-badge">
                      <code>{result.recipe.formula}</code>
                    </div>
                    <div className="index-scale-bar-container">
                      <div className="index-scale-bar">
                        {result.recipe.scale.map((step, idx) => (
                          <div
                            key={idx}
                            className="scale-bar-segment"
                            style={{ background: step.color }}
                            title={`${step.min} to ${step.max}: ${step.label}`}
                          />
                        ))}
                      </div>
                      <div className="scale-bar-labels">
                        <span>-1.0</span>
                        <span>0.0</span>
                        <span>+1.0</span>
                      </div>
                    </div>
                    <div className="index-meaning-text">{result.recipe.meaning}</div>
                  </div>
                </div>
                <SplitSatelliteViewer recipe={result.recipe} satelliteMode={satelliteMode} />
              </React.Fragment>
              )}
              {result && result.kind === 'mismatch' && (
                <div className="equation-row">
                  {result.selected.map((bId, idx) => (
                    <React.Fragment key={bId}>
                      {idx > 0 && <div className="equation-symbol">+</div>}
                      <EquationBandCard bandId={bId} satelliteMode={satelliteMode} />
                    </React.Fragment>
                  ))}
                  <div className="equation-symbol">=</div>
                  <div className="combination-explanation mismatch">
                    <strong>Not a standard index</strong>
                    <span>{result.reason}</span>
                  </div>
                </div>
              )}
            </div>
              </React.Fragment>
            ) : (
              <FormulaLab satelliteMode={satelliteMode} />
            )}
          </section>

          <section className="side-panel right sidebar-panel">
            {workspaceMode === 'guided' ? (
              <div className="discovery-log-panel">
                <div className="discovery-log-title">Index Reference Library</div>
                <div className="discovery-log-grid">
                  {INDEX_RECIPES.map(recipe => {
                    const isActive = result?.kind === 'match' && result.recipe.id === recipe.id;
                    return (
                      <div
                        key={recipe.id}
                        className={`discovery-log-slot unlocked ${isActive ? 'active-index' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${recipe.id.toUpperCase()} index`}
                        onClick={() => selectDiscoveredIndex(recipe)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectDiscoveredIndex(recipe);
                          }
                        }}
                      >
                        <div
                          className="discovery-log-art"
                          style={{ backgroundImage: `url(${recipe.cardArt})` }}
                        >
                          <span className={`index-suit-chip family-${recipe.suit}`}>
                            {TRAIT_FAMILIES[recipe.suit].glyph}
                          </span>
                        </div>
                        <div className="discovery-log-info">
                          <div className="discovery-log-name">{recipe.id.toUpperCase()}</div>
                          <div className="discovery-log-formula"><code>{recipe.formula}</code></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="discovery-log-hint">
                  Click an index to load its documented formula and inspect an illustrative scene. The overlay is a teaching visualization, not a calculation from the photo.
                </p>
              </div>
            ) : (
              <div className="lab-protocol-panel">
                <span className="lab-protocol-number">LAB PROTOCOL 01</span>
                <h2>Signal before search.</h2>
                <ol>
                  <li><strong>Name the target.</strong><span>One formula cannot be “useful” in general.</span></li>
                  <li><strong>Explain the physics.</strong><span>Choose bands for a reason before seeing a score.</span></li>
                  <li><strong>Challenge confusers.</strong><span>Water, soil, burns, vegetation, and built surfaces can overlap.</span></li>
                  <li><strong>Beat a baseline.</strong><span>Compare with NDVI, NDWI, NBR, or NDBI.</span></li>
                  <li><strong>Keep the claim small.</strong><span>A classroom reference set cannot validate a new index.</span></li>
                </ol>
                <div className="lab-protocol-boundary">
                  <strong>Bounded by design</strong>
                  <span>6 formula families</span>
                  <span>2–4 band roles</span>
                  <span>7 reflectance bands</span>
                  <span>Teaching model · no discovery claim</span>
                </div>
                <p>Automated spectral-index discovery is established research; this lab teaches a small, hypothesis-first workflow. Thermal T10 is excluded because it measures emitted rather than reflected energy.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </React.Fragment>
  );
}
