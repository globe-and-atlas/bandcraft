import React, { useState } from 'react';
import type { Band } from './data/indices';

interface FlippableBandCardProps {
  band: Band;
  isSelected: boolean;
  onSelect: (bandId: Band['id']) => void;
}

export default function FlippableBandCard({ band, isSelected, onSelect }: FlippableBandCardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(prev => !prev);
  };

  const handleCardClick = () => {
    if (isFlipped) {
      setIsFlipped(false);
    } else {
      onSelect(band.id);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div className={`card-flip-container ${isFlipped ? 'flipped' : ''}`}>
      <div className="card-flip-inner">
        {/* Front Face of Card. A <div role="button"> rather than a native <button> —
            it needs to contain the nested info-button below, and a <button> inside
            a <button> is invalid HTML (React warns, and click/focus behavior across
            browsers becomes unpredictable). */}
        <div
          role="button"
          tabIndex={0}
          className={`relic-card-tile card-front ${isSelected ? 'selected' : ''}`}
          style={isSelected ? { borderColor: band.color, boxShadow: `0 0 0 3px ${band.color}66, 0 10px 32px rgba(0,0,0,0.7)` } : undefined}
          onClick={handleCardClick}
          onKeyDown={handleCardKeyDown}
          aria-pressed={isSelected}
          aria-label={`${band.name} band, wavelength ${band.wavelength}`}
        >
          <button
            type="button"
            className="card-info-btn"
            onClick={handleInfoClick}
            title="View Scientific Specs & Physics (ⓘ)"
            aria-label={`Scientific specs for ${band.name}`}
          >
            ⓘ
          </button>

          <div
            className={`relic-card-art band-swatch-${band.id}`}
            style={{ flexDirection: 'column', justifyContent: 'center', gap: '0.4rem', position: 'relative' }}
          >
            <div className="spectral-wave-overlay" />
            <span className="band-code-symbol" style={{ color: '#ffffff' }}>
              {band.bandCode}
            </span>
            <span className="band-wavelength-badge">
              {band.wavelength} • {band.resolution}
            </span>
          </div>

          <div className="card-bottom-plate">
            <div className="card-band-title-group">
              <span className="sensor-chip">{band.sensorTag}</span>
              <strong>{band.name}</strong>
            </div>
          </div>
        </div>

        {/* Back Face of Card (Scientific Specs & Physics) */}
        <div className="relic-card-tile card-back" style={{ borderColor: band.color }} onClick={handleCardClick}>
          <div className="card-back-header" style={{ borderColor: `${band.color}44` }}>
            <div className="back-title-group">
              <span className="back-band-code" style={{ background: `${band.color}33`, color: band.color, borderColor: `${band.color}66` }}>
                {band.bandCode}
              </span>
              <span className="back-band-name">{band.name}</span>
            </div>
            <button
              type="button"
              className="card-flip-back-btn"
              onClick={handleInfoClick}
              title="Return to Selection (↺)"
            >
              ↺ Back
            </button>
          </div>

          <div className="card-back-body">
            <div className="back-spec-grid">
              <div className="spec-item">
                <span className="spec-label">Wavelength</span>
                <span className="spec-val" style={{ color: band.color }}>{band.wavelength}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Resolution</span>
                <span className="spec-val">{band.resolution}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Bandwidth</span>
                <span className="spec-val">{band.bandwidth}</span>
              </div>
            </div>

            <div className="back-physics-box" style={{ background: `${band.color}18`, borderColor: `${band.color}44` }}>
              <div className="physics-title" style={{ color: band.color }}>
                🔬 APES Spectral Physics
              </div>
              <p className="physics-desc">{band.physicsRole}</p>
            </div>

            <div className="back-primary-use">
              <span className="use-label" style={{ color: band.color }}>🎯 Application:</span> {band.primaryUse}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
