import { describe, expect, it } from 'vitest';
import { getSatellitesForSuit, SATELLITES } from './fieldGuide';

describe('satellite reference lookup', () => {
  it('finds at least one real mission for every environmental suit, including terrain and radar', () => {
    const suits: Array<Parameters<typeof getSatellitesForSuit>[0]> = ['flora', 'hydro', 'thermal', 'terrain', 'urban', 'radar'];
    for (const suit of suits) {
      expect(getSatellitesForSuit(suit).length).toBeGreaterThan(0);
    }
  });

  it('gives every satellite at least one band entry', () => {
    for (const satellite of SATELLITES) {
      expect(satellite.bands.length).toBeGreaterThan(0);
    }
  });
});
