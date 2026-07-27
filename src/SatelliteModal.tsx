
import { useModalA11y } from './useModalA11y';

export type SatelliteModalId = 'sentinel2' | 'landsat8';

interface SatelliteModalProps {
  satelliteId: SatelliteModalId;
  onClose: () => void;
}

export default function SatelliteModal({ satelliteId, onClose }: SatelliteModalProps) {
  const modalRef = useModalA11y<HTMLDivElement>(onClose);
  const isSentinel = satelliteId === 'sentinel2';

  return (
    <div className="catalogue-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        data-modal-root="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="satellite-modal-title"
        tabIndex={-1}
        className="catalogue-modal satellite-spec-modal"
        onClick={e => e.stopPropagation()}
      >
        <header className="catalogue-modal-header" style={{ borderColor: isSentinel ? '#38bdf8' : '#f59e0b' }}>
          <div>
            <span className="catalogue-modal-kicker" style={{ color: isSentinel ? '#38bdf8' : '#f59e0b' }}>
              {isSentinel ? '🇪🇺 ESA Copernicus Programme' : '🇺🇸 NASA / USGS Earth Observation'}
            </span>
            <h2 id="satellite-modal-title">
              {isSentinel ? 'Sentinel-2 MSI Satellite Constellation' : 'Landsat 8 & 9 OLI / TIRS Mission'}
            </h2>
          </div>
          <button className="btn-small catalogue-close" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="catalogue-modal-scroll">
          <div className="catalogue-modal-content satellite-spec-content">
            {/* Mission Identity Cards */}
            <div className="spec-identity-grid">
              <div className="spec-identity-card">
                <span className="spec-card-label">Operating Agency</span>
                <strong className="spec-card-val">{isSentinel ? 'European Space Agency (ESA)' : 'NASA & USGS'}</strong>
              </div>
              <div className="spec-identity-card">
                <span className="spec-card-label">Launch Dates</span>
                <strong className="spec-card-val">{isSentinel ? '2015 (2A) • 2017 (2B)' : '2013 (L8) • 2021 (L9)'}</strong>
              </div>
              <div className="spec-identity-card">
                <span className="spec-card-label">Orbital Revisit Rate</span>
                <strong className="spec-card-val" style={{ color: isSentinel ? '#38bdf8' : '#f59e0b' }}>
                  {isSentinel ? '5 Days (Constellation)' : '8 Days (L8 + L9 Pair)'}
                </strong>
              </div>
              <div className="spec-identity-card">
                <span className="spec-card-label">Orbital Altitude</span>
                <strong className="spec-card-val">{isSentinel ? '786 km (Sun-Synchronous)' : '705 km (Sun-Synchronous)'}</strong>
              </div>
            </div>

            {/* Mission Purpose Box */}
            <div
              className="satellite-purpose-box"
              style={{
                borderColor: isSentinel ? '#38bdf8' : '#f59e0b',
                background: isSentinel ? 'rgba(56, 189, 248, 0.08)' : 'rgba(245, 158, 11, 0.08)'
              }}
            >
              <h3>🎯 Mission Purpose</h3>
              <p>
                {isSentinel
                  ? 'Sentinel-2 delivers high-resolution optical imagery for global land monitoring. It tracks agricultural crop health, coastal water quality, forest canopy loss, and natural disaster impacts with an unprecedented 5-day global revisit.'
                  : 'Landsat represents the longest unbroken satellite record of Earth’s land surface (since 1972). Landsat 8/9 tracks 50+ years of global deforestation, land surface temperature, urban sprawl, and water reservoir depletion.'}
              </p>
            </div>

            {/* Sensor Payload Breakdown */}
            <div className="satellite-sensor-section">
              <h3>📡 Sensor Payload Breakdown</h3>
              {isSentinel ? (
                <div className="sensor-detail-card">
                  <h4>MSI — MultiSpectral Instrument</h4>
                  <p>A high-performance push-broom imager capturing 13 spectral bands across visible, red-edge, near-infrared, and short-wave infrared wavelengths.</p>
                  <div className="resolution-chips">
                    <span className="chip-res res-10m">10m: Visible RGB (B02, B03, B04) & NIR (B08)</span>
                    <span className="chip-res res-20m">20m: Red Edge (B05, B06, B07) & SWIR (B11, B12)</span>
                    <span className="chip-res res-60m">60m: Atmospheric Aerosol (B01), Water Vapor (B09), Cirrus (B10)</span>
                  </div>
                </div>
              ) : (
                <div className="sensor-detail-grid">
                  <div className="sensor-detail-card">
                    <h4>OLI — Operational Land Imager</h4>
                    <p>Captures 9 optical spectral bands from visible light through short-wave infrared, plus a 15m panchromatic band.</p>
                    <div className="resolution-chips">
                      <span className="chip-res res-15m">15m: Panchromatic (Band 8)</span>
                      <span className="chip-res res-30m">30m: Optical Bands 1–7 (Coastal, RGB, NIR, SWIR-1, SWIR-2)</span>
                    </div>
                  </div>
                  <div className="sensor-detail-card">
                    <h4>TIRS — Thermal Infrared Sensor</h4>
                    <p>Measures longwave thermal infrared radiation emitted directly from Earth’s surface to compute land surface temperature.</p>
                    <div className="resolution-chips">
                      <span className="chip-res res-100m">100m (resampled to 30m): TIRS-1 (Band 10) & TIRS-2 (Band 11)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Key APES Educational Benefits */}
            <div className="satellite-apes-benefits">
              <h3>🌱 Key APES & Classroom Learning Benefits</h3>
              <ul>
                {isSentinel ? (
                  <>
                    <li><strong>Red-Edge Chlorophyll Detection:</strong> Sentinel-2 features exclusive 705nm Red Edge bands (B05) that detect crop nitrogen deficiency before leaves visually turn yellow.</li>
                    <li><strong>High-Resolution 10m Pixels:</strong> 10-meter spatial resolution allows students to resolve individual agricultural fields, river channels, and city blocks.</li>
                    <li><strong>5-Day Revisit Cadence:</strong> Rapid revisit frequency lets students track seasonal crop growth and flood response in real time.</li>
                  </>
                ) : (
                  <>
                    <li><strong>Thermal Heat Island Mapping:</strong> Landsat’s TIRS Band 10 (10.9µm) allows students to measure Land Surface Temperature (LST) and map urban heat islands vs forested microclimates.</li>
                    <li><strong>50+ Year Historical Baseline:</strong> Landsat’s continuous record since 1972 lets students analyze multi-decade environmental trends like Amazon deforestation and Lake Mead shrinkage.</li>
                    <li><strong>SWIR-2 Wildfire Ash Detection:</strong> SWIR-2 Band 7 (2.19µm) allows students to compute Normalized Burn Ratio (NBR) and map wildfire severity scars.</li>
                  </>
                )}
              </ul>
            </div>

            {/* Spectral Band Table */}
            <div className="satellite-band-table-section">
              <h3>📊 Spectral Band Table</h3>
              <table className="field-guide-band-table">
                <thead>
                  <tr>
                    <th>Band</th>
                    <th>Wavelength Range</th>
                    <th>Resolution</th>
                    <th>Primary Application</th>
                  </tr>
                </thead>
                <tbody>
                  {isSentinel ? (
                    <>
                      <tr><td>B02 — Blue</td><td>458 – 523 nm</td><td>10 m</td><td>Atmospheric aerosol correction, coastal water clarity</td></tr>
                      <tr><td>B03 — Green</td><td>543 – 578 nm</td><td>10 m</td><td>Peak vegetation reflection, NDWI water body extraction</td></tr>
                      <tr><td>B04 — Red</td><td>650 – 680 nm</td><td>10 m</td><td>Chlorophyll-a absorption, NDVI denominator</td></tr>
                      <tr><td>B05 — Red Edge 1</td><td>698 – 713 nm</td><td>20 m</td><td>Early crop nitrogen stress, chlorophyll variations</td></tr>
                      <tr><td>B08 — NIR</td><td>785 – 899 nm</td><td>10 m</td><td>Leaf mesophyll reflection, canopy density (NDVI/EVI)</td></tr>
                      <tr><td>B11 — SWIR 1</td><td>1565 – 1655 nm</td><td>20 m</td><td>Built-up urban index (NDBI), leaf moisture stress</td></tr>
                      <tr><td>B12 — SWIR 2</td><td>2100 – 2280 nm</td><td>20 m</td><td>Normalized Burn Ratio (NBR), soil mineral mapping</td></tr>
                    </>
                  ) : (
                    <>
                      <tr><td>Band 2 — Blue</td><td>450 – 510 nm</td><td>30 m</td><td>Coastal water depth, bathymetry, aerosol correction</td></tr>
                      <tr><td>Band 3 — Green</td><td>530 – 590 nm</td><td>30 m</td><td>Peak green vegetation reflection, NDWI water index</td></tr>
                      <tr><td>Band 4 — Red</td><td>640 – 670 nm</td><td>30 m</td><td>Chlorophyll absorption, NDVI vegetation math</td></tr>
                      <tr><td>Band 5 — NIR</td><td>850 – 880 nm</td><td>30 m</td><td>Vegetation vigor, water body boundary extraction</td></tr>
                      <tr><td>Band 6 — SWIR 1</td><td>1570 – 1650 nm</td><td>30 m</td><td>Vegetation & soil moisture, NDBI built-up index</td></tr>
                      <tr><td>Band 7 — SWIR 2</td><td>2110 – 2290 nm</td><td>30 m</td><td>Wildfire burn severity (NBR), geological mapping</td></tr>
                      <tr><td>Band 10 — Thermal (TIRS 1)</td><td>10.60 – 11.19 µm</td><td>100 m</td><td>Land Surface Temperature (LST), urban heat island mapping</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
