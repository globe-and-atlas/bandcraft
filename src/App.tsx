import React, { useState } from 'react';
import {
  BANDS,
  INDEX_RECIPES,
  getBand,
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

const SAVE_KEY = 'bandcraft-discovered-indices-v1';

type CombineResult =
  | { kind: 'match'; recipe: IndexRecipe; isNew: boolean }
  | { kind: 'mismatch'; selected: BandId[]; reason: string };

function EquationBandCard({ bandId }: { bandId: BandId }) {
  const band = getBand(bandId);
  return (
    <div className="equation-card" style={{ borderColor: band.color }}>
      <div className={`relic-card-art band-swatch-${bandId}`} style={{ height: '90px', display: 'grid', placeItems: 'center', position: 'relative' }}>
        <div className="spectral-wave-overlay" />
        <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-mono, monospace)', color: '#ffffff', zIndex: 1 }}>{band.bandCode}</span>
      </div>
      <div className="card-bottom-plate" style={{ fontSize: '0.7rem' }}>
        <div style={{ color: band.color, fontSize: '0.6rem', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>{band.sensorTag}</div>
        <div>{band.name}</div>
      </div>
    </div>
  );
}

function loadDiscoveredIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const validIds = new Set(INDEX_RECIPES.map(recipe => recipe.id));
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id)));
  } catch {
    return new Set();
  }
}

export default function App() {
  const [hasEnteredGame, setHasEnteredGame] = useState(false);
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(() => loadDiscoveredIds());
  const [satelliteMode, setSatelliteMode] = useState<SatelliteMode>('all');
  const [selectedBandIds, setSelectedBandIds] = useState<BandId[]>([]);
  const [draggedBandId, setDraggedBandId] = useState<BandId | null>(null);
  const [result, setResult] = useState<CombineResult | null>(null);
  const [isFieldGuideOpen, setIsFieldGuideOpen] = useState(false);

  const activeBands = getBandsForMode(satelliteMode);

  const persistDiscovered = (next: Set<string>) => {
    setDiscoveredIds(next);
    localStorage.setItem(SAVE_KEY, JSON.stringify(Array.from(next)));
  };

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

    const isNew = !discoveredIds.has(recipe.id);
    setResult({ kind: 'match', recipe, isNew });
    if (isNew) {
      const next = new Set(discoveredIds);
      next.add(recipe.id);
      persistDiscovered(next);
    }
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
    persistDiscovered(new Set());
    setResult(null);
    setSelectedBandIds([]);
  };

  if (!hasEnteredGame) {
    return (
      <main className="relic-title-screen">
        <div className="title-screen-glow" aria-hidden="true" />
        <div className="title-screen-copy">
          <span className="title-screen-overline">GLOBE & ATLAS | MULTISPECTRAL SENSING LAB</span>
          <h1>BAND<br /><em>CRAFT</em></h1>
          <p><strong>Multispectral Remote Sensing & Index Workbench.</strong> Compute 2-band and 3-band spectral indices directly from Sentinel-2 MSI and Landsat-8 TIRS satellite data. Compare band numbering, spatial resolutions, and atmospheric correction physics across satellites.</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
            <span className="sensor-chip" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>SENTINEL-2A MSI (10m)</span>
            <span className="sensor-chip" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>LANDSAT-8 TIRS (30m)</span>
            <span className="sensor-chip" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>3-BAND MULTISPECTRAL MATH</span>
          </div>
          <div className="title-screen-actions">
            <button className="title-primary-action" type="button" onClick={() => setHasEnteredGame(true)}>
              Initialize Satellite Workbench →
            </button>
          </div>
          <span className="title-screen-note">Calibrated spectral formulas. Real satellite remote sensing.</span>
        </div>
        <div className="title-screen-art" aria-hidden="true" />
      </main>
    );
  }

  return (
    <React.Fragment>
      {isFieldGuideOpen && <FieldGuideModal onClose={() => setIsFieldGuideOpen(false)} />}

      <div className="app-screen-container">
        <header className="header-bar">
          <div>
            <h1 style={{ letterSpacing: '0.05em' }}>GLOBE & ATLAS | BANDCRAFT SPECTRAL LAB</h1>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>Multispectral Remote Sensing Workstation</div>
          </div>
          <div className="header-controls">
            <div className="stat-pill gold" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
              <span>{discoveredIds.size}/{INDEX_RECIPES.length} INDICES COMPUTED</span>
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
            <div className="fusion-workbench">
              <div className="fusion-workbench-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div>
                  <span className="fusion-workbench-kicker">SPECTRAL BAND SELECTION</span>
                  <strong>Select 2 or 3 multispectral bands to compute a spectral index.</strong>
                  <span>Supports 2-band ratio pairs (NDVI, NDWI) and 3-band atmospheric formulas (EVI).</span>
                </div>
                <div className="satellite-mode-toolbar" style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                  <button
                    type="button"
                    className={`btn-small ${satelliteMode === 'all' ? 'active-mode' : ''}`}
                    onClick={() => { setSatelliteMode('all'); setSelectedBandIds([]); setResult(null); }}
                    style={satelliteMode === 'all' ? { background: '#0284c7', color: '#fff', fontWeight: 800 } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                  >
                    🌐 All Sensors (8 Bands)
                  </button>
                  <button
                    type="button"
                    className={`btn-small ${satelliteMode === 'sentinel2' ? 'active-mode' : ''}`}
                    onClick={() => { setSatelliteMode('sentinel2'); setSelectedBandIds([]); setResult(null); }}
                    style={satelliteMode === 'sentinel2' ? { background: '#0284c7', color: '#fff', fontWeight: 800 } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                  >
                    🇪🇺 Sentinel-2 MSI Mode
                  </button>
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
              <div className="workbench-card-grid" aria-label="Spectral bands">
                {activeBands.map(band => {
                  const isSelected = selectedBandIds.includes(band.id);
                  return (
                    <button
                      key={band.id}
                      type="button"
                      className={`relic-card-tile ${isSelected ? 'selected' : ''}`}
                      style={isSelected ? { borderColor: band.color, boxShadow: `0 0 0 3px ${band.color}66, 0 8px 30px rgba(0,0,0,0.6)` } : undefined}
                      onClick={() => handleBandClick(band.id)}
                      aria-pressed={isSelected}
                      aria-label={`${band.name} band, wavelength ${band.wavelength}`}
                    >
                      <div className="card-top-sensor-tag">
                        <span className="sensor-chip">{band.sensorTag}</span>
                      </div>
                      <div className={`relic-card-art band-swatch-${band.id}`} style={{ flexDirection: 'column', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem 0', position: 'relative' }}>
                        <div className="spectral-wave-overlay" />
                        <span style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-mono, monospace)', color: '#ffffff', zIndex: 1 }}>{band.bandCode}</span>
                        <span className="band-wavelength" style={{ zIndex: 1, fontFamily: 'var(--font-mono, monospace)' }}>{band.wavelength} ({band.resolution})</span>
                      </div>
                      <div className="card-bottom-plate">
                        <strong>{band.name}</strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="active-selection-preview-panel">
              <div className="preview-title">Active Spectral Computation</div>
              {selectedBandIds.length === 0 && (
                <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '0.75rem' }}>
                  Select 2 or 3 spectral bands above to evaluate their index formula (e.g., select NIR + Red + Blue for EVI!).
                </div>
              )}
              {selectedBandIds.length === 1 && (
                <div style={{ color: '#38bdf8', fontSize: '0.85rem', textAlign: 'center', padding: '0.75rem' }}>
                  Selected {getBand(selectedBandIds[0]).name}. Select 1 or 2 more bands to compute a spectral index.
                </div>
              )}
              {result && result.kind === 'match' && (
                <React.Fragment>
                  <div className="equation-row">
                  {result.recipe.bands.map((bId, idx) => (
                    <React.Fragment key={bId}>
                      {idx > 0 && <div className="equation-symbol">+</div>}
                      <EquationBandCard bandId={bId} />
                    </React.Fragment>
                  ))}
                  <div className="equation-symbol">=</div>
                  <div className="index-result-card">
                    <div className="index-card-header">
                      <span className={`index-suit-badge family-${result.recipe.suit}`}>
                        {TRAIT_FAMILIES[result.recipe.suit].shortLabel.toUpperCase()}
                      </span>
                      {result.recipe.satelliteTag && <span className="sensor-chip" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>{result.recipe.satelliteTag}</span>}
                      {result.isNew && <span className="new-discovery-chip">New Index</span>}
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
                <SplitSatelliteViewer recipe={result.recipe} />
              </React.Fragment>
              )}
              {result && result.kind === 'mismatch' && (
                <div className="equation-row">
                  {result.selected.map((bId, idx) => (
                    <React.Fragment key={bId}>
                      {idx > 0 && <div className="equation-symbol">+</div>}
                      <EquationBandCard bandId={bId} />
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
          </section>

          <section className="side-panel right sidebar-panel">
            <div className="discovery-log-panel">
              <div className="discovery-log-title">Discovered Indices</div>
              <div className="discovery-log-grid">
                {INDEX_RECIPES.map(recipe => {
                  const unlocked = discoveredIds.has(recipe.id);
                  return (
                    <div key={recipe.id} className={`discovery-log-slot ${unlocked ? 'unlocked' : 'locked'}`}>
                      <div
                        className="discovery-log-art"
                        style={unlocked ? { backgroundImage: `url(${recipe.cardArt})` } : undefined}
                      >
                        {!unlocked && <span aria-hidden="true">?</span>}
                      </div>
                      <div className="discovery-log-name">{unlocked ? recipe.id.toUpperCase() : 'Locked'}</div>
                    </div>
                  );
                })}
              </div>
              <p className="discovery-log-hint">
                Every real index here shares the same shape: (A − B) / (A + B). And every one of them uses NIR — it's the single most useful band in remote sensing, because vegetation, water, and built surfaces each interact with it in a distinctive way.
              </p>
            </div>
          </section>
        </main>
      </div>
    </React.Fragment>
  );
}
