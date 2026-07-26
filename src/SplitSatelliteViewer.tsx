import React, { useRef, useEffect } from 'react';
import { getBandForMode, type IndexRecipe, type SatelliteMode } from './data/indices';
import SpectralCurveInspector from './SpectralCurveInspector';

interface SplitSatelliteViewerProps {
  recipe: IndexRecipe;
  satelliteMode: SatelliteMode;
}

function SimulatedIndexOverlay({ imageSrc, recipeId }: { imageSrc: string; recipeId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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

      // Transform pixels to simulate authentic false-color satellite index raster overlay
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (recipeId === 'ndbi') {
          // NDBI / Urban Heat Island: Concrete/rooftops -> glowing neon orange/blue heat grid
          const brightness = (r + g + b) / 3;
          const isBuiltUp = brightness > 100 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30;
          const isWater = (b > r && b > g) || (b > 110 && r < 100 && g < 150) || (b > 80 && r < 40);
          if (isBuiltUp) {
            data[i] = Math.min(255, brightness * 1.3);    // Vibrant orange/yellow heat
            data[i + 1] = Math.min(255, brightness * 0.8);
            data[i + 2] = 40;
          } else if (isWater) {
            // Vivid Coastal Blue (RGB 14, 116, 216) for ocean & water bodies
            data[i] = 14;
            data[i + 1] = 116;
            data[i + 2] = 216;
          } else {
            // Cool non-built land background (Navy / Blue contrast)
            data[i] = 15;
            data[i + 1] = 45;
            data[i + 2] = Math.min(255, brightness + 70);
          }
        } else if (recipeId === 'ndvi' || recipeId === 'evi' || recipeId === 'ndre') {
          // NDVI / EVI / NDRE Vegetation Index: Forest canopy -> intense emerald green, soil -> ochre, water -> coastal blue
          const vegScore = (g - r) + (g - b);
          const isWater = (b > g && b > r) || (b > 90 && r < 50);
          if (vegScore > 5 || (g > r && g > b)) {
            data[i] = 22;      // Neon vegetation green
            data[i + 1] = Math.min(255, g + 90);
            data[i + 2] = 80;
          } else if (isWater) {
            data[i] = 14;      // Vivid Coastal Blue
            data[i + 1] = 116;
            data[i + 2] = 216;
          } else {
            data[i] = 217;     // Bare soil
            data[i + 1] = 119;
            data[i + 2] = 6;
          }
        } else if (recipeId === 'ndwi' || recipeId === 'mndwi') {
          // NDWI / MNDWI Water Index: Water -> electric coastal cyan/blue, land -> dark slate/amber
          const isWater = b > r || (g > r && b > 80);
          if (isWater) {
            data[i] = 14;       // Electric Coastal Blue
            data[i + 1] = 116;
            data[i + 2] = 216;
          } else {
            data[i] = 71;      // Dark slate
            data[i + 1] = 85;
            data[i + 2] = 105;
          }
        } else if (recipeId === 'nbr') {
          // NBR Burn Severity: Scorched ground -> deep scarlet red, unburned vegetation -> lush green, water -> coastal blue
          const isScorched = (r + g + b) / 3 < 120 && r > g;
          const isWater = (b > r && b > g) || (b > 100 && r < 50);
          if (isScorched) {
            data[i] = 239;     // Red burn scar
            data[i + 1] = 68;
            data[i + 2] = 68;
          } else if (isWater) {
            data[i] = 14;      // Vivid Coastal Blue
            data[i + 1] = 116;
            data[i + 2] = 216;
          } else {
            data[i] = 34;      // Unburned green
            data[i + 1] = 197;
            data[i + 2] = 94;
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
  }, [imageSrc, recipeId]);

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

export default function SplitSatelliteViewer({ recipe }: SplitSatelliteViewerProps) {
  const meta = LOCATION_METADATA[recipe.id] || {
    location: 'Satellite Observation Zone',
    coords: '37.7749, -122.4194',
    aerialArt: recipe.cardArt
  };

  return (
    <div className="limn-dual-panel-wrapper">
      {/* Side-by-Side 50/50 Dual Satellite Views at 1:1 scale */}
      <div className="limn-side-by-side-grid">
        {/* Left View: True Color RGB Satellite Context */}
        <div className="satellite-view-card true-color-card">
          <div
            className="satellite-card-image"
            style={{ backgroundImage: `url(${meta.aerialArt})` }}
          />
          <div className="view-card-badge left-badge">
            <span>SATELLITE CONTEXT — TRUE COLOR RGB</span>
          </div>
        </div>

        {/* Right View: False Color Index Raster Overlay */}
        <div className="satellite-view-card index-raster-card">
          <SimulatedIndexOverlay imageSrc={meta.aerialArt} recipeId={recipe.id} />
          <div className="view-card-badge right-badge">
            <span>{recipe.id.toUpperCase()} RASTER OVERLAY</span>
          </div>
        </div>
      </div>

      {/* Integrated Limn Atlas Metadata HUD Banner */}
      <div className="limn-hud-card-inline">
        <div className="hud-meta-left">
          <div className="hud-header-code">{recipe.id.toUpperCase()}</div>
          <div className="hud-title">{recipe.name}</div>
          <div className="hud-location">
            {meta.location} • <span className="hud-coords">{meta.coords}</span>
          </div>
        </div>

        <div className="hud-meta-right">
          <div className="hud-formula-pill">
            <code>{recipe.formula}</code>
          </div>
          <div className="hud-bands-row">
            <span>Bands: {recipe.bands.map(b => getBand(b).bandCode).join(', ')}</span>
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

      {/* Spectral Reflectance Signature Curve Inspector */}
      <SpectralCurveInspector recipe={recipe} />
    </div>
  );
}
