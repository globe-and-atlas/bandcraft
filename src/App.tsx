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
import ModalShell from './ModalShell';
import SatelliteModal, { type SatelliteModalId } from './SatelliteModal';

type CombineResult =
  | { kind: 'match'; recipe: IndexRecipe }
  | { kind: 'mismatch'; selected: BandId[]; reason: string };

function EquationBandCard({ bandId, satelliteMode }: { bandId: BandId; satelliteMode: SatelliteMode }) {
  const band = getBandForMode(bandId, satelliteMode);
  return (
    <div className="equation-card" style={{ borderColor: band.color }}>
      <div className={`relic-card-art band-swatch-${bandId}`} style={{ height: '90px', display: 'grid', placeItems: 'center', position: 'relative' }}>
        <div className="spectral-wave-overlay" />
        <span className="band-code-symbol" style={{ color: '#ffffff' }}>{band.bandCode}</span>
        <span className="band-wavelength-badge">{band.wavelength}</span>
      </div>
      <div className="card-bottom-plate compact">
        <strong>{band.name}</strong>
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
  const [activeSatelliteModal, setActiveSatelliteModal] = useState<SatelliteModalId | null>(null);
  const [indexSearchQuery, setIndexSearchQuery] = useState('');
  const [indexCategory, setIndexCategory] = useState<'all' | 'flora' | 'hydro' | 'thermal' | 'urban' | 'terrain'>('all');
  const [indexInfoModal, setIndexInfoModal] = useState<IndexRecipe | null>(null);

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

  // Starting points offered in the empty state. Routed through the normal
  // evaluate path rather than setting the result directly, so a student sees
  // the same computation they would get by clicking the bands themselves.
  const starterRecipes = ['ndvi', 'ndwi', 'nbr']
    .map(id => INDEX_RECIPES.find(r => r.id === id))
    .filter((r): r is IndexRecipe => Boolean(r));

  const applyStarter = (recipe: IndexRecipe) => {
    setSatelliteMode('all');
    setSelectedBandIds(recipe.bands);
    evaluateCombination(recipe.bands);
  };

  if (!hasEnteredGame) {
    return (
      <main className="relic-title-screen">
        <div className="title-screen-art" aria-hidden="true" />
        <div className="title-screen-glow" aria-hidden="true" />
        <div className="title-screen-copy">
          <span className="title-screen-overline">A GLOBE & ATLAS GAME OF SPECTRAL BANDCRAFT</span>
          <h1>LIMN<br /><em>SIGNAL</em></h1>
          <p><strong>Multispectral Remote Sensing & Index Workbench.</strong> Explore twenty-five proven scientific satellite indices (NDVI, EVI, NDWI, MNDWI, NDRE, NDBI, NBR, AWEI, BSI, IBI, LST, and 14 more) across 5 environmental domains through sensor-aware band roles, documented formulas, and illustrative teaching scenes.</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
            <span className="sensor-chip" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>SENTINEL-2 MSI · 10–20m</span>
            <span className="sensor-chip" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>LANDSAT 8 OLI/TIRS · 30–100m</span>
            <span className="sensor-chip" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>25 PROVEN SATELLITE INDICES</span>
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
      {activeSatelliteModal && <SatelliteModal satelliteId={activeSatelliteModal} onClose={() => setActiveSatelliteModal(null)} />}

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
              <strong>25 SATELLITE INDICES AVAILABLE</strong>
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
                className={`formula-lab-switch ${workspaceMode === 'formula-lab' ? 'active' : ''}`}
                onClick={() => setWorkspaceMode('formula-lab')}
                aria-label="Open optional Formula Lab"
                title="Optional advanced sandbox for testing formula hypotheses"
              >
                <span>Formula Lab</span>
                <small>optional</small>
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
                      style={satelliteMode === 'sentinel2' ? { background: '#0284c7', color: '#fff', fontWeight: 800, borderTopRightRadius: 0, borderBottomRightRadius: 0 } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    >
                      🇪🇺 Sentinel-2 MSI Mode
                    </button>
                    <button
                      type="button"
                      className="btn-small sat-spec-info-btn"
                      onClick={() => setActiveSatelliteModal('sentinel2')}
                      title="Learn about Sentinel-2 Satellite Mission Specs (ⓘ)"
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: '1px solid rgba(255,255,255,0.2)', background: 'rgba(56,189,248,0.2)', color: '#38bdf8', fontWeight: 800, padding: '0 8px', fontSize: '0.9rem' }}
                    >
                      ⓘ
                    </button>
                  </div>

                  <div className="toolbar-satellite-group" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <button
                      type="button"
                      className={`btn-small ${satelliteMode === 'landsat8' ? 'active-mode' : ''}`}
                      onClick={() => { setSatelliteMode('landsat8'); setSelectedBandIds([]); setResult(null); }}
                      style={satelliteMode === 'landsat8' ? { background: '#0284c7', color: '#fff', fontWeight: 800, borderTopRightRadius: 0, borderBottomRightRadius: 0 } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    >
                      🇺🇸 Landsat-8 OLI/TIRS Mode
                    </button>
                    <button
                      type="button"
                      className="btn-small sat-spec-info-btn"
                      onClick={() => setActiveSatelliteModal('landsat8')}
                      title="Learn about Landsat-8 Satellite Mission Specs (ⓘ)"
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: '1px solid rgba(255,255,255,0.2)', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontWeight: 800, padding: '0 8px', fontSize: '0.9rem' }}
                    >
                      ⓘ
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

            {/* The result of the core interaction. aria-live so selecting bands
                announces the computed index (or the mismatch explanation)
                instead of changing silently, matching the Formula Lab. */}
            <div className="active-selection-preview-panel" aria-live="polite">
              <div className="preview-title">Active Spectral Computation</div>
              {selectedBandIds.length === 0 && (
                <div className="computation-empty-state">
                  <span className="empty-state-glyph" aria-hidden="true">🛰️</span>
                  <p className="empty-state-lead">Select 2 or 3 bands above to compute an index.</p>
                  <p className="empty-state-sub">
                    Most indices contrast a visible band against an infrared one — that gap is what reveals
                    vegetation, water, or burn scars. Or start from a known pair:
                  </p>
                  <div className="empty-state-starters">
                    {starterRecipes.map(recipe => (
                      <button
                        key={recipe.id}
                        type="button"
                        className="empty-state-starter"
                        onClick={() => applyStarter(recipe)}
                      >
                        <span className="starter-bands">
                          {recipe.bands.map(b => getBand(b).name.replace(/\s*\(.*\)$/, '')).join(' + ')}
                        </span>
                        <span className="starter-arrow" aria-hidden="true">→</span>
                        <span className="starter-index">{recipe.id.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
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
                <div className="discovery-log-title-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
                  <div className="discovery-log-title" style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                    Scientific Index Library (25)
                  </div>

                  {/* Real-Time Search Bar */}
                  <div className="index-search-box">
                    <input
                      type="search"
                      className="index-search-input"
                      placeholder="🔍 Search indices…"
                      value={indexSearchQuery}
                      onChange={e => setIndexSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#f8fafc',
                        fontSize: '0.75rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Category Filter Badges */}
                  <div className="index-category-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                    <button
                      type="button"
                      className={`btn-small chip-filter ${indexCategory === 'all' ? 'active-cat' : ''}`}
                      onClick={() => setIndexCategory('all')}
                      style={indexCategory === 'all' ? { background: '#0284c7', color: '#fff', fontWeight: 800, padding: '2px 6px', fontSize: '0.65rem' } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 6px', fontSize: '0.65rem' }}
                    >
                      🌐 All (25)
                    </button>
                    <button
                      type="button"
                      className={`btn-small chip-filter ${indexCategory === 'flora' ? 'active-cat' : ''}`}
                      onClick={() => setIndexCategory('flora')}
                      style={indexCategory === 'flora' ? { background: '#0284c7', color: '#fff', fontWeight: 800, padding: '2px 6px', fontSize: '0.65rem' } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 6px', fontSize: '0.65rem' }}
                    >
                      🌿 Flora (7)
                    </button>
                    <button
                      type="button"
                      className={`btn-small chip-filter ${indexCategory === 'hydro' ? 'active-cat' : ''}`}
                      onClick={() => setIndexCategory('hydro')}
                      style={indexCategory === 'hydro' ? { background: '#0284c7', color: '#fff', fontWeight: 800, padding: '2px 6px', fontSize: '0.65rem' } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 6px', fontSize: '0.65rem' }}
                    >
                      💧 Hydro (5)
                    </button>
                    <button
                      type="button"
                      className={`btn-small chip-filter ${indexCategory === 'thermal' ? 'active-cat' : ''}`}
                      onClick={() => setIndexCategory('thermal')}
                      style={indexCategory === 'thermal' ? { background: '#0284c7', color: '#fff', fontWeight: 800, padding: '2px 6px', fontSize: '0.65rem' } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 6px', fontSize: '0.65rem' }}
                    >
                      🔥 Fire (6)
                    </button>
                    <button
                      type="button"
                      className={`btn-small chip-filter ${indexCategory === 'urban' ? 'active-cat' : ''}`}
                      onClick={() => setIndexCategory('urban')}
                      style={indexCategory === 'urban' ? { background: '#0284c7', color: '#fff', fontWeight: 800, padding: '2px 6px', fontSize: '0.65rem' } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 6px', fontSize: '0.65rem' }}
                    >
                      🏗️ Urban (4)
                    </button>
                    <button
                      type="button"
                      className={`btn-small chip-filter ${indexCategory === 'terrain' ? 'active-cat' : ''}`}
                      onClick={() => setIndexCategory('terrain')}
                      style={indexCategory === 'terrain' ? { background: '#0284c7', color: '#fff', fontWeight: 800, padding: '2px 6px', fontSize: '0.65rem' } : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 6px', fontSize: '0.65rem' }}
                    >
                      🏜️ Soils (3)
                    </button>
                  </div>
                </div>

                <div className="discovery-log-category-sections" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { id: 'flora', label: '🌿 Flora & Agriculture', count: 7 },
                    { id: 'hydro', label: '💧 Hydrology & Water Quality', count: 5 },
                    { id: 'thermal', label: '🔥 Wildfires & Burn Severity', count: 6 },
                    { id: 'urban', label: '🏗️ Urban Infrastructure', count: 4 },
                    { id: 'terrain', label: '🏜️ Soils, Geology & Snow', count: 3 }
                  ].filter(cat => indexCategory === 'all' || indexCategory === cat.id).map(cat => {
                    const recipesInCat = INDEX_RECIPES.filter(recipe => {
                      if (recipe.suit !== cat.id) return false;
                      const q = indexSearchQuery.toLowerCase().trim();
                      return !q || recipe.id.toLowerCase().includes(q) || recipe.name.toLowerCase().includes(q) || recipe.formula.toLowerCase().includes(q) || recipe.meaning.toLowerCase().includes(q);
                    });

                    if (recipesInCat.length === 0) return null;

                    return (
                      <div key={cat.id} className="category-section">
                        <div className="category-header" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '3px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {cat.label} ({recipesInCat.length})
                        </div>
                        <div className="discovery-log-grid">
                          {recipesInCat.map(recipe => {
                            const isActive = result?.kind === 'match' && result.recipe.id === recipe.id;
                            return (
                              <div
                                key={recipe.id}
                                className={`discovery-log-slot unlocked ${isActive ? 'active-index' : ''}`}
                                role="button"
                                tabIndex={0}
                                title={recipe.name}
                                aria-label={`Select ${recipe.id.toUpperCase()} index — ${recipe.name}`}
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
                                  style={{ backgroundImage: `url(${recipe.cardArt})`, position: 'relative' }}
                                >
                                  <span className={`index-suit-chip family-${recipe.suit}`}>
                                    {TRAIT_FAMILIES[recipe.suit].glyph}
                                  </span>
                                  <button
                                    type="button"
                                    className="index-card-info-btn"
                                    title={`View full scientific details for ${recipe.name}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIndexInfoModal(recipe);
                                    }}
                                    style={{
                                      position: 'absolute',
                                      top: '4px',
                                      right: '4px',
                                      width: '18px',
                                      height: '18px',
                                      borderRadius: '50%',
                                      background: 'rgba(15, 23, 42, 0.9)',
                                      border: '1px solid rgba(56, 189, 248, 0.6)',
                                      color: '#38bdf8',
                                      fontSize: '0.65rem',
                                      fontWeight: 800,
                                      display: 'grid',
                                      placeItems: 'center',
                                      cursor: 'pointer',
                                      zIndex: 10,
                                      boxShadow: '0 0 8px rgba(56, 189, 248, 0.4)'
                                    }}
                                  >
                                    ⓘ
                                  </button>
                                </div>
                                <div className="discovery-log-info" style={{ padding: '6px 8px' }}>
                                  <div className="discovery-log-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>{recipe.id.toUpperCase()}</span>
                                    <span
                                      className={`band-count-tag count-${recipe.bands.length}`}
                                      title={`Formula uses ${recipe.bands.length} spectral bands: ${recipe.bands.map(b => getBand(b).name).join(', ')}`}
                                    >
                                      {recipe.bands.length === 1 ? '1 BAND' : `${recipe.bands.length} BANDS`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="discovery-log-hint">
                  Search or click an index to inspect its proven formula. 25 satellite indices are fully documented across all 6 environmental categories.
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
                  <span>8 spectral & thermal bands (25 indices)</span>
                  <span>Teaching model · no discovery claim</span>
                </div>
                <p>Automated spectral-index discovery is established research; this lab teaches a small, hypothesis-first workflow. Thermal T10 is excluded because it measures emitted rather than reflected energy.</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {indexInfoModal && (
        <ModalShell onClose={() => setIndexInfoModal(null)} labelledBy="index-info-title" className="modal-card">
            <button
              type="button"
              className="btn-close"
              onClick={() => setIndexInfoModal(null)}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94a3b8', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'grid', placeItems: 'center' }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span className={`index-suit-chip family-${indexInfoModal.suit}`} style={{ fontSize: '0.85rem', position: 'static' }}>
                {TRAIT_FAMILIES[indexInfoModal.suit].glyph}
              </span>
              <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                {indexInfoModal.categoryName}
              </span>
              <span className={`band-count-tag count-${indexInfoModal.bands.length}`} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '12px' }}>
                {indexInfoModal.bands.length === 1 ? '1-BAND FORMULA' : `${indexInfoModal.bands.length}-BAND FORMULA`}
              </span>
              {indexInfoModal.satelliteTag && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  {indexInfoModal.satelliteTag}
                </span>
              )}
            </div>

            <h3 id="index-info-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 12px 0', lineHeight: 1.3 }}>
              {indexInfoModal.name}
            </h3>

            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.04em' }}>Formula Equation</div>
              <code style={{ fontSize: '0.9rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>{indexInfoModal.formula}</code>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '8px' }}>
                <strong style={{ color: '#94a3b8' }}>Required Spectral Bands:</strong> {indexInfoModal.bands.map(b => getBand(b).name).join(' + ')}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.04em' }}>APES Environmental Physics & Role</div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>
                {indexInfoModal.meaning}
              </p>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>Index Value Scale & Range</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(15, 23, 42, 0.5)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {indexInfoModal.scale.map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#e2e8f0' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'monospace', width: '85px', color: '#94a3b8', fontWeight: 600 }}>[{s.min} to {s.max}]</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIndexInfoModal(null)}
                style={{ padding: '7px 16px', fontSize: '0.8rem' }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  selectDiscoveredIndex(indexInfoModal);
                  setIndexInfoModal(null);
                }}
                style={{ padding: '7px 16px', fontSize: '0.8rem', background: '#0284c7', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                ⚡ Evaluate in Workbench
              </button>
            </div>
        </ModalShell>
      )}
    </React.Fragment>
  );
}
