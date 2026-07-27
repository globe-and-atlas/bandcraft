import { useRef, useEffect } from 'react';
import { getBandForMode, type IndexRecipe, type SatelliteMode } from './data/indices';
import SpectralCurveInspector from './SpectralCurveInspector';

interface SplitSatelliteViewerProps {
  recipe: IndexRecipe;
  satelliteMode: SatelliteMode;
}

function SimulatedIndexOverlay({ imageSrc, recipe }: { imageSrc: string; recipe: IndexRecipe }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width || 800;
      canvas.height = img.height || 500;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const id = recipe.id;
      const suit = recipe.suit;

      // Transform pixels to simulate authentic false-color satellite index raster overlay across all 25 indices
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;

        const isWater = (b > r && b > g) || (b > 100 && r < 70) || (b > 80 && r < 40);
        const isBright = brightness > 140;
        const isDark = brightness < 75;
        const isVeg = (g > r && g > b) || (g - r + (g - b) > 5);

        if (id === 'ndbi' || id === 'ui' || id === 'ibi' || id === 'ebbi' || suit === 'urban') {
          // Urban Infrastructure & Built-Up: Concrete/rooftops -> glowing neon orange/yellow heat grid
          const isBuiltUp = brightness > 90 && Math.abs(r - g) < 35 && Math.abs(g - b) < 35;
          if (isBuiltUp) {
            data[i] = Math.min(255, brightness * 1.3);    // Vibrant orange/yellow heat
            data[i + 1] = Math.min(255, brightness * 0.85);
            data[i + 2] = 40;
          } else if (isWater) {
            // Coastal Blue (RGB 14, 116, 216)
            data[i] = 14; data[i + 1] = 116; data[i + 2] = 216;
          } else {
            // Cool non-built land background (Navy / Slate contrast)
            data[i] = 15; data[i + 1] = 45; data[i + 2] = Math.min(255, brightness + 70);
          }
        } else if (id === 'lst' || id === 'utfvi') {
          // Land Surface Temperature / Urban Heat Island: Thermal heat map color ramp
          const normTemp = Math.min(1, Math.max(0, brightness / 255));
          if (normTemp < 0.3) {
            data[i] = 30; data[i + 1] = 58; data[i + 2] = 138;   // Deep Blue cool zone
          } else if (normTemp < 0.5) {
            data[i] = 56; data[i + 1] = 189; data[i + 2] = 248;  // Cyan moderate zone
          } else if (normTemp < 0.75) {
            data[i] = 249; data[i + 1] = 115; data[i + 2] = 22;  // Flame Orange high temp
          } else {
            data[i] = 225; data[i + 1] = 29; data[i + 2] = 72;   // Extreme UHI Crimson
          }
        } else if (id === 'ndci') {
          // NDCI Chlorophyll / Toxic Algae Bloom: Water -> Coastal Blue, Cyanobacteria -> Vibrant Lime Green
          if (isWater) {
            if (g > b || (g > 80 && r > 60)) {
              data[i] = 163; data[i + 1] = 230; data[i + 2] = 53;  // Algae Bloom Lime
            } else {
              data[i] = 14; data[i + 1] = 116; data[i + 2] = 216;  // Coastal Blue
            }
          } else {
            data[i] = 71; data[i + 1] = 85; data[i + 2] = 105;
          }
        } else if (id === 'ndti') {
          // NDTI Turbidity / River Plume: Clear Water -> Coastal Blue, Muddy Sediment -> Sandy Ochre
          if (isWater) {
            if (r > 70 || brightness > 90) {
              data[i] = 217; data[i + 1] = 119; data[i + 2] = 6;   // Ochre Sediment
            } else {
              data[i] = 14; data[i + 1] = 116; data[i + 2] = 216;  // Coastal Blue
            }
          } else {
            data[i] = 51; data[i + 1] = 65; data[i + 2] = 85;
          }
        } else if (id === 'ndwi' || id === 'mndwi' || id === 'awei' || suit === 'hydro') {
          // Hydrology Water Indices: Water -> Electric Coastal Blue, Land -> Dark Slate
          if (isWater) {
            data[i] = 14; data[i + 1] = 116; data[i + 2] = 216;
          } else {
            data[i] = 71; data[i + 1] = 85; data[i + 2] = 105;
          }
        } else if (id === 'nbr' || id === 'nbr2' || id === 'mirbi' || id === 'ndmi') {
          // NBR Burn Severity / Scorch Marks: Scorched ground -> deep scarlet red, unburned -> green, water -> blue
          const isScorched = isDark && r > g;
          if (isScorched) {
            data[i] = 239; data[i + 1] = 68; data[i + 2] = 68;   // Scarlet Red Burn Scar
          } else if (isWater) {
            data[i] = 14; data[i + 1] = 116; data[i + 2] = 216;
          } else {
            data[i] = 34; data[i + 1] = 197; data[i + 2] = 94;   // Unburned Green
          }
        } else if (id === 'ndsi') {
          // NDSI Snow & Glaciers: Snow/Ice -> Brilliant White/Cyan, Cloud/Soil -> Slate
          if (isBright && (b > r || Math.abs(r - g) < 20)) {
            data[i] = 240; data[i + 1] = 249; data[i + 2] = 255;  // Snow White
          } else {
            data[i] = 51; data[i + 1] = 65; data[i + 2] = 85;     // Dark Land
          }
        } else if (id === 'bsi') {
          // BSI Bare Soil: Exposed Soil -> Terracotta Sand, Vegetation -> Forest Green
          if (isVeg) {
            data[i] = 34; data[i + 1] = 197; data[i + 2] = 94;    // Green Canopy
          } else if (isWater) {
            data[i] = 14; data[i + 1] = 116; data[i + 2] = 216;
          } else {
            data[i] = 217; data[i + 1] = 119; data[i + 2] = 6;    // Terracotta Soil
          }
        } else if (id === 'cmi') {
          // CMI Clay Minerals: Clay Mineral Deposit -> Bright Violet / Magenta, Slate Rock -> Grey
          if (isBright && Math.abs(r - g) < 30) {
            data[i] = 192; data[i + 1] = 38; data[i + 2] = 211;   // Clay Magenta
          } else {
            data[i] = 100; data[i + 1] = 116; data[i + 2] = 139;  // Slate Rock
          }
        } else {
          // Default Flora Canopy (NDVI, EVI, GNDVI, SAVI, MSAVI, ARVI, NDRE): Forest canopy -> emerald green, soil -> ochre, water -> blue
          if (isVeg) {
            data[i] = 22; data[i + 1] = Math.min(255, g + 90); data[i + 2] = 80;
          } else if (isWater) {
            data[i] = 14; data[i + 1] = 116; data[i + 2] = 216;
          } else {
            data[i] = 217; data[i + 1] = 119; data[i + 2] = 6;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Draw subtle 10m/30m pixelated satellite raster grid effect
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 1;
      const step = 8;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };
  }, [imageSrc, recipe]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block'
      }}
    />
  );
}

export default function SplitSatelliteViewer({ recipe, satelliteMode }: SplitSatelliteViewerProps) {
  return (
    <div className="limn-dual-panel-wrapper">
      {/* Side-by-Side 50/50 Dual Satellite Views at 1:1 scale */}
      <div className="limn-side-by-side-grid">
        {/* Left View: True Color RGB Satellite Context */}
        <div className="satellite-view-card true-color-card">
          <div
            className="satellite-card-image"
            style={{ backgroundImage: `url(${recipe.cardArt})` }}
          />
          <div className="view-card-badge left-badge">
            <span>SATELLITE CONTEXT — TRUE COLOR RGB</span>
          </div>
        </div>

        {/* Right View: False Color Index Raster Overlay */}
        <div className="satellite-view-card index-raster-card">
          <SimulatedIndexOverlay imageSrc={recipe.cardArt} recipe={recipe} />
          <div className="view-card-badge right-badge">
            <span>SIMULATED {recipe.id.toUpperCase()} OVERLAY</span>
          </div>
        </div>
      </div>

      {/* Integrated Limn Atlas Metadata HUD Banner */}
      <div className="limn-hud-card-inline">
        <div className="hud-meta-left">
          <div className="hud-header-code">{recipe.id.toUpperCase()}</div>
          <div className="hud-title">{recipe.name}</div>
          <div className="hud-location">{recipe.realCaption}</div>
        </div>

        <div className="hud-meta-right">
          <div className="hud-formula-pill">
            <code>{recipe.formula}</code>
          </div>
          <div className="hud-bands-row">
            <span>Bands: {recipe.bands.map(b => getBandForMode(b, satelliteMode).bandCode).join(', ')}</span>
          </div>
          <div className="hud-scale-bar-wrapper">
            <div
              className="hud-scale-gradient"
              style={{
                background: `linear-gradient(to right, ${recipe.scale.map(s => s.color).join(', ')})`
              }}
            />
            <div className="hud-scale-labels">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      <p className="split-viewer-disclaimer">
        The overlay on the right is a stylized illustration, not the actual {recipe.id.toUpperCase()} formula computed from this photo — a regular photo has no infrared channel to compute it from. The photo itself is real: {recipe.realCaption}
      </p>

      {/* Spectral Reflectance Signature Curve Inspector */}
      <SpectralCurveInspector recipe={recipe} />
    </div>
  );
}
