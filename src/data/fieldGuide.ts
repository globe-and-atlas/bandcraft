// Real-world satellite/sensor reference content for the Field Guide panel. This is a
// pure reference library — it covers all 6 environmental suits, including terrain and
// radar, even though only 4 of those suits have a craftable index recipe in the core
// game (see indices.ts). Wavelengths and resolutions are the commonly published specs.

import type { FamilyId } from './suits';

export interface SatelliteBand {
  name: string;
  wavelength: string;
  resolution: string;
  use: string;
}

export interface Satellite {
  id: string;
  name: string;
  agency: string;
  launched: string;
  suits: FamilyId[];
  summary: string;
  bands: SatelliteBand[];
}

export const SATELLITES: Satellite[] = [
  {
    id: 'landsat-8-9',
    name: 'Landsat 8 / 9 (OLI & TIRS)',
    agency: 'NASA / USGS',
    launched: '2013 / 2021',
    suits: ['flora', 'thermal'],
    summary: 'The longest-running Earth-imaging program. OLI captures reflected sunlight across 9 optical bands; TIRS adds two thermal infrared bands for surface temperature.',
    bands: [
      { name: 'Band 4 — Red', wavelength: '640–670 nm', resolution: '30 m', use: 'Chlorophyll absorption; paired with NIR for NDVI' },
      { name: 'Band 5 — Near-Infrared (NIR)', wavelength: '850–880 nm', resolution: '30 m', use: 'Leaf structure reflectance; vegetation vigor' },
      { name: 'Band 6 — SWIR 1', wavelength: '1570–1650 nm', resolution: '30 m', use: 'Moisture content in soil and vegetation' },
      { name: 'Band 10 — Thermal Infrared 1', wavelength: '10.6–11.2 µm', resolution: '100 m', use: 'Land surface temperature; wildfire and heat-island mapping' }
    ]
  },
  {
    id: 'sentinel-2',
    name: 'Sentinel-2A / 2B (MSI)',
    agency: 'European Space Agency (Copernicus)',
    launched: '2015 / 2017',
    suits: ['flora', 'hydro', 'urban'],
    summary: 'A 13-band multispectral imager with a 5-day global revisit — the highest-resolution free optical bands widely used in classroom remote sensing.',
    bands: [
      { name: 'Band 3 — Green', wavelength: '560 nm', resolution: '10 m', use: 'Water body delineation (with NIR, for NDWI)' },
      { name: 'Band 4 — Red', wavelength: '665 nm', resolution: '10 m', use: 'Chlorophyll absorption; paired with NIR for NDVI' },
      { name: 'Band 8 — Near-Infrared (NIR)', wavelength: '842 nm', resolution: '10 m', use: 'Vegetation reflectance; vegetation and water indices' },
      { name: 'Band 11 — SWIR 1', wavelength: '1610 nm', resolution: '20 m', use: 'Built-up surfaces and moisture; paired with NIR for NDBI' }
    ]
  },
  {
    id: 'sentinel-1',
    name: 'Sentinel-1A / 1B (C-SAR)',
    agency: 'European Space Agency (Copernicus)',
    launched: '2014 / 2016',
    suits: ['radar'],
    summary: 'A radar imager, not an optical camera — it transmits its own microwave pulses, so it sees through cloud cover and darkness.',
    bands: [
      { name: 'C-band radar', wavelength: '~5.6 cm', resolution: '5–20 m', use: 'All-weather backscatter imaging; flood mapping (smooth water reflects radar away from the sensor, reading dark)' }
    ]
  },
  {
    id: 'modis',
    name: 'MODIS (Terra & Aqua)',
    agency: 'NASA',
    launched: '1999 / 2002',
    suits: ['thermal', 'flora'],
    summary: '36 spectral bands and a same-day global revisit make MODIS the workhorse for daily fire, temperature, and vegetation monitoring at coarser resolution.',
    bands: [
      { name: 'Band 1 — Red', wavelength: '620–670 nm', resolution: '250 m', use: 'Daily NDVI compositing' },
      { name: 'Band 2 — NIR', wavelength: '841–876 nm', resolution: '250 m', use: 'Daily NDVI compositing' },
      { name: 'Band 21/22 — Fire channels', wavelength: '~3.9 µm', resolution: '1 km', use: 'Active fire and thermal-anomaly detection' },
      { name: 'Band 31 — Thermal Infrared', wavelength: '10.78–11.28 µm', resolution: '1 km', use: 'Land surface temperature' }
    ]
  },
  {
    id: 'viirs',
    name: 'VIIRS (Suomi NPP / NOAA-20)',
    agency: 'NASA / NOAA',
    launched: '2011 / 2017',
    suits: ['urban'],
    summary: 'Successor to older night-lights sensors, VIIRS carries a Day/Night Band sensitive enough to image moonlight and city lights.',
    bands: [
      { name: 'Day/Night Band (DNB)', wavelength: '500–900 nm (panchromatic)', resolution: '750 m', use: 'Nighttime lights; tracking urban growth, power outages, and light pollution' }
    ]
  },
  {
    id: 'srtm',
    name: 'SRTM (Shuttle Radar Topography Mission)',
    agency: 'NASA / NGA',
    launched: '2000 (single 11-day shuttle flight)',
    suits: ['terrain'],
    summary: 'Flew two radar antennas 60 meters apart on the same shuttle. Comparing the tiny differences between what each antenna saw let scientists calculate ground elevation for nearly the whole planet in just 11 days.',
    bands: [
      { name: 'C-band radar', wavelength: '~5.6 cm', resolution: '30 m (1 arc-second)', use: 'Global digital elevation model (DEM); slope, watershed, and terrain analysis' }
    ]
  }
];

// Index recipes (NDVI, NDWI, NDBI, NBR) and their band math now live in
// ./indices.ts, since they're shared between this reference panel's "Build an
// Index" tab and the core game's band-combination mechanic.

export function getSatellitesForSuit(suit: FamilyId): Satellite[] {
  return SATELLITES.filter(satellite => satellite.suits.includes(suit));
}
