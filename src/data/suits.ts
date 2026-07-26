// Environmental suits: the 6 real-world remote-sensing domains used to theme and
// filter content across the app (card badges, Field Guide satellite filters).
// Only 4 of these (flora, hydro, urban, thermal) have a craftable index recipe in
// indices.ts — terrain and radar stay here as reference-only categories, since DEM
// slope analysis and SAR backscatter aren't two-band ratio indices the way NDVI-style
// math is (see indices.ts for why that distinction matters).

export type FamilyId = 'flora' | 'hydro' | 'thermal' | 'terrain' | 'radar' | 'urban';

export const TRAIT_FAMILIES: Record<FamilyId, { label: string; shortLabel: string; glyph: string }> = {
  flora: { label: 'Flora & Forest', shortLabel: 'Flora', glyph: '🌲' },
  hydro: { label: 'Hydrology & Water', shortLabel: 'Hydro', glyph: '💧' },
  thermal: { label: 'Thermal & Heat', shortLabel: 'Thermal', glyph: '🔥' },
  terrain: { label: 'Terrain & Soil', shortLabel: 'Terrain', glyph: '🏔️' },
  radar: { label: 'Radar & Structure', shortLabel: 'Radar', glyph: '📡' },
  urban: { label: 'Urban & Infrastructure', shortLabel: 'Urban', glyph: '🏙️' }
};
