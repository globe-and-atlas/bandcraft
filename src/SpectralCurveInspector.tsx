import React from 'react';
import { BANDS, getBand, type BandId, type IndexRecipe } from './data/indices';

interface SpectralCurveInspectorProps {
  recipe: IndexRecipe;
}

interface CurvePoint {
  wl: number; // nm
  val: number; // 0 - 100 %
}

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

const SPECTRAL_PROFILES: Record<string, { title: string; curve: CurvePoint[]; points: Record<BandId, number>; insight: string }> = {
  ndvi: {
    title: 'Healthy Vegetation Spectral Signature',
    curve: [
      { wl: 400, val: 5 },
      { wl: 490, val: 8 },
      { wl: 560, val: 14 },
      { wl: 665, val: 5 },
      { wl: 705, val: 45 },
      { wl: 842, val: 82 },
      { wl: 1000, val: 80 },
      { wl: 1610, val: 24 },
      { wl: 2190, val: 12 }
    ],
    points: { blue: 8, green: 14, red: 5, rededge: 45, nir: 82, swir1: 24, swir2: 12, thermal: 10 },
    insight: 'Leaves absorb B04 Red (5%) for photosynthesis but reflect B08 NIR (82%) from leaf mesophyll cells — creating the signature vegetation gap!'
  },
  evi: {
    title: 'High-Density Forest Canopy Signature',
    curve: [
      { wl: 400, val: 4 },
      { wl: 490, val: 6 },
      { wl: 560, val: 12 },
      { wl: 665, val: 4 },
      { wl: 705, val: 40 },
      { wl: 842, val: 85 },
      { wl: 1000, val: 83 },
      { wl: 1610, val: 22 },
      { wl: 2190, val: 10 }
    ],
    points: { blue: 6, green: 12, red: 4, rededge: 40, nir: 85, swir1: 22, swir2: 10, thermal: 10 },
    insight: 'EVI incorporates B02 Blue (6%) to correct for atmospheric aerosols and soil noise over dense rainforests.'
  },
  ndwi: {
    title: 'Open Surface Water Spectral Signature',
    curve: [
      { wl: 400, val: 22 },
      { wl: 490, val: 28 },
      { wl: 560, val: 32 },
      { wl: 665, val: 12 },
      { wl: 705, val: 4 },
      { wl: 842, val: 1 },
      { wl: 1000, val: 0 },
      { wl: 1610, val: 0 },
      { wl: 2190, val: 0 }
    ],
    points: { blue: 28, green: 32, red: 12, rededge: 4, nir: 1, swir1: 0, swir2: 0, thermal: 15 },
    insight: 'Water absorbs almost 100% of B08 NIR (842nm) while reflecting B03 Green (32%), making NIR absorption the primary water indicator.'
  },
  mndwi: {
    title: 'Urban Water & Coastal Hydrology Signature',
    curve: [
      { wl: 400, val: 20 },
      { wl: 490, val: 26 },
      { wl: 560, val: 30 },
      { wl: 665, val: 14 },
      { wl: 705, val: 5 },
      { wl: 842, val: 2 },
      { wl: 1000, val: 0 },
      { wl: 1610, val: 0 },
      { wl: 2190, val: 0 }
    ],
    points: { blue: 26, green: 30, red: 14, rededge: 5, nir: 2, swir1: 0, swir2: 0, thermal: 15 },
    insight: 'MNDWI replaces NIR with B11 SWIR-1 (0%) to eliminate building noise and cleanly extract shallow rivers and coastal water.'
  },
  ndre: {
    title: 'Crop Chlorophyll & Red Edge Signature',
    curve: [
      { wl: 400, val: 6 },
      { wl: 490, val: 9 },
      { wl: 560, val: 16 },
      { wl: 665, val: 7 },
      { wl: 705, val: 38 },
      { wl: 842, val: 78 },
      { wl: 1000, val: 76 },
      { wl: 1610, val: 26 },
      { wl: 2190, val: 14 }
    ],
    points: { blue: 9, green: 16, red: 7, rededge: 38, nir: 78, swir1: 26, swir2: 14, thermal: 10 },
    insight: 'B05 Red Edge (705nm) lies directly on the steep reflectance slope, catching early nitrogen stress before visible leaf yellowing.'
  },
  ndbi: {
    title: 'Urban Built-Up & Concrete Signature',
    curve: [
      { wl: 400, val: 12 },
      { wl: 490, val: 15 },
      { wl: 560, val: 18 },
      { wl: 665, val: 22 },
      { wl: 705, val: 24 },
      { wl: 842, val: 28 },
      { wl: 1000, val: 38 },
      { wl: 1610, val: 62 },
      { wl: 2190, val: 54 }
    ],
    points: { blue: 15, green: 18, red: 22, rededge: 24, nir: 28, swir1: 62, swir2: 54, thermal: 40 },
    insight: 'Concrete and rooftops reflect B11 SWIR-1 (62%) far more than B08 NIR (28%), creating the built-up urban heat signal.'
  },
  nbr: {
    title: 'Wildfire Burn Scar & Ash Signature',
    curve: [
      { wl: 400, val: 4 },
      { wl: 490, val: 6 },
      { wl: 560, val: 8 },
      { wl: 665, val: 12 },
      { wl: 705, val: 14 },
      { wl: 842, val: 18 },
      { wl: 1000, val: 30 },
      { wl: 1610, val: 45 },
      { wl: 2190, val: 68 }
    ],
    points: { blue: 6, green: 8, red: 12, rededge: 14, nir: 18, swir1: 45, swir2: 68, thermal: 50 },
    insight: 'Burned ground loses its NIR reflection (18%) while charred ash reflects heavily in B12 SWIR-2 (68%), mapping burn severity.'
  }
};

export default function SpectralCurveInspector({ recipe }: SpectralCurveInspectorProps) {
  const profile = SPECTRAL_PROFILES[recipe.id] || SPECTRAL_PROFILES.ndvi;

  // SVG Chart Dimensions
  const SVG_W = 680;
  const SVG_H = 170;
  const PAD_L = 45;
  const PAD_R = 25;
  const PAD_T = 20;
  const PAD_B = 30;
  const PLOT_W = SVG_W - PAD_L - PAD_R;
  const PLOT_H = SVG_H - PAD_T - PAD_B;

  const WL_MIN = 400;
  const WL_MAX = 2200;

  const wlToX = (wl: number) => PAD_L + ((wl - WL_MIN) / (WL_MAX - WL_MIN)) * PLOT_W;
  const valToY = (val: number) => PAD_T + PLOT_H - (val / 100) * PLOT_H;

  // Build SVG path d string
  const points = profile.curve.map(pt => `${wlToX(pt.wl)},${valToY(pt.val)}`);
  const pathD = `M ${points.join(' L ')}`;

  // Active optical bands in this recipe
  const activeBandIds = recipe.bands.filter(bId => bId !== 'thermal');

  return (
    <div className="spectral-curve-inspector-card">
      <div className="inspector-header">
        <div className="inspector-title-row">
          <span className="inspector-icon">📊</span>
          <span className="inspector-title">{profile.title}</span>
          <span className="inspector-subtitle">Continuous Reflectance (%) vs Wavelength (nm)</span>
        </div>
        <div className="active-bands-badge-row">
          {recipe.bands.map(bId => {
            const b = getBand(bId);
            const val = profile.points[bId] ?? 0;
            return (
              <span key={bId} className="active-band-chip" style={{ borderColor: b.color, color: b.color }}>
                <span className="chip-code">{b.bandCode}</span> {b.name}: <strong>{val}%</strong>
              </span>
            );
          })}
        </div>
      </div>

      <div className="svg-chart-container">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="spectral-svg">
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y Axis Grid Lines */}
          {[0, 25, 50, 75, 100].map(val => (
            <g key={val}>
              <line
                x1={PAD_L}
                y1={valToY(val)}
                x2={SVG_W - PAD_R}
                y2={valToY(val)}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="2,2"
              />
              <text x={PAD_L - 8} y={valToY(val) + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                {val}%
              </text>
            </g>
          ))}

          {/* Area under curve */}
          <path
            d={`${pathD} L ${wlToX(WL_MAX)},${valToY(0)} L ${wlToX(WL_MIN)},${valToY(0)} Z`}
            fill="url(#curveGradient)"
          />

          {/* Main Curve Line */}
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Wavelength Band Markers */}
          {BANDS.filter(b => b.id !== 'thermal').map(b => {
            const wl = BAND_WAVELENGTHS[b.id];
            const isActive = activeBandIds.includes(b.id);
            const x = wlToX(wl);
            const y = valToY(profile.points[b.id]);

            return (
              <g key={b.id} className={`band-marker-group ${isActive ? 'is-active' : ''}`}>
                {/* Vertical Marker Line */}
                <line
                  x1={x}
                  y1={PAD_T}
                  x2={x}
                  y2={PAD_T + PLOT_H}
                  stroke={isActive ? b.color : 'rgba(255, 255, 255, 0.15)'}
                  strokeWidth={isActive ? 1.5 : 1}
                  strokeDasharray={isActive ? 'none' : '3,3'}
                />

                {/* Point Circle on Curve */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 6 : 3.5}
                  fill={isActive ? b.color : '#0f172a'}
                  stroke={b.color}
                  strokeWidth={isActive ? 2 : 1}
                />

                {/* Active Band Glow */}
                {isActive && (
                  <circle cx={x} cy={y} r="10" fill={b.color} opacity="0.25" className="pulse-glow" />
                )}

                {/* X Axis Wavelength Band Label */}
                <text
                  x={x}
                  y={SVG_H - 10}
                  fill={isActive ? b.color : '#94a3b8'}
                  fontSize={isActive ? '10' : '8'}
                  fontWeight={isActive ? '800' : '500'}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {b.bandCode}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="inspector-footer-insight">
        <span className="insight-badge">💡 APES Spectral Physics</span>
        <span className="insight-text">{profile.insight}</span>
      </div>
    </div>
  );
}
