import{PEOPLES_DAILY_MATERIALS}from'./peoples-daily.js';
import {GALAXY_MATERIALS} from './galaxy-soho.js';
import {NCPA_MATERIALS} from './ncpa.js';
import {CAPITAL_MUSEUM_MATERIALS} from './capital-museum.js';
/** Warm, restrained Beijing architectural materials. Original procedural assets. */
export const MATERIALS = Object.freeze({
  ...PEOPLES_DAILY_MATERIALS,...NCPA_MATERIALS,...CAPITAL_MUSEUM_MATERIALS,...GALAXY_MATERIALS,
  btvGlass:{color:'#8ca8b4',roughness:.48,metalness:.13},
  btvStone:{color:'#d2d5d2',roughness:.83,metalness:.01},
  tvccMetal:{color:'#a3afb4',roughness:.62,metalness:.19},
  tvccGlass:{color:'#526975',roughness:.43,metalness:.12},
  scienceGlass:{color:'#65988c',roughness:.45,metalness:.13},
  roofPeacock:{color:'#387b82',roughness:.60,metalness:.05},
  roofPurple:{color:'#64506b',roughness:.65,metalness:.05},
  pinkGranite: {color:'#d1bfc0',roughness:.95,metalness:0},
  apmStone: {color:'#c9ad9e',roughness:.90,metalness:0},
  zunGlass: {color:'#b1cadb',roughness:.50,metalness:.08},
  zunDark: {color:'#445867',roughness:.7,metalness:.08},
  silverFacade: {color:'#d7dfdf',roughness:.48,metalness:.18},
  cctvGlass: {color:'#9aaeb7',roughness:.57,metalness:.08},
  cctvSteel: {color:'#65727a',roughness:.65,metalness:.16},
  glassMullion: {color:'#adbfc6',roughness:.62,metalness:.12},
  glass: { color: '#668994', roughness: 0.27, metalness: 0.42 },
  glassBlue: { color: '#4e7182', roughness: 0.26, metalness: 0.46 },
  glassPale: { color: '#91aeb0', roughness: 0.3, metalness: 0.28 },
  glassDark: { color: '#344c53', roughness: 0.32, metalness: 0.3 },
  glassEnvelope: { color: '#98b5b3', roughness: 0.24, metalness: 0.18, transparent: true, opacity: 0.24, depthWrite: false, side: 2 },
  etfeMembrane: { color: '#d6ddd5', roughness: 0.52, metalness: 0.03, transparent: true, opacity: 0.65, depthWrite: false, side: 2 },
  window: { color: '#405358', roughness: 0.43, metalness: 0.13 },
  windowWarm: { color: '#ae9f78', roughness: 0.5, metalness: 0.06 },
  metal: { color: '#bcc1b8', roughness: 0.48, metalness: 0.55 },
  metalDark: { color: '#555e5d', roughness: 0.58, metalness: 0.44 },
  titanium: { color: '#b9b8a9', roughness: 0.38, metalness: 0.62 },
  stone: { color: '#cabda2', roughness: 0.86, metalness: 0.01 },
  stoneLight: { color: '#ded4bc', roughness: 0.86, metalness: 0.0 },
  stoneDark: { color: '#a69d88', roughness: 0.89, metalness: 0.0 },
  concrete: { color: '#bdbbad', roughness: 0.91, metalness: 0.0 },
  stucco: { color: '#d6c5a2', roughness: 0.9, metalness: 0.0 },
  stuccoPale: { color: '#dfd3b7', roughness: 0.92, metalness: 0.0 },
  stuccoRose: { color: '#c5a38e', roughness: 0.92, metalness: 0.0 },
  brick: { color: '#a08068', roughness: 0.96, metalness: 0.0 },
  greyBrick: { color: '#878b80', roughness: 0.96, metalness: 0.0 },
  greyBrickDark: { color: '#686f69', roughness: 0.98, metalness: 0.0 },
  roofGrey: { color: '#555f5c', roughness: 0.92, metalness: 0.02 },
  roofGreyLight: { color: '#6e7770', roughness: 0.9, metalness: 0.02 },
  roofGreyRidge: { color: '#92948a', roughness: 0.95, metalness: 0.0 },
  roofGold: { color: '#cf9a3e', roughness: 0.61, metalness: 0.08 },
  roofGoldLight: { color: '#e0b45c', roughness: 0.65, metalness: 0.04 },
  roofBlue: { color: '#254f70', roughness: 0.58, metalness: 0.12 },
  roofBlueLight: { color: '#3c6b89', roughness: 0.62, metalness: 0.08 },
  roofGreen: { color: '#42745a', roughness: 0.66, metalness: 0.06 },
  vermilion: { color: '#9c4737', roughness: 0.88, metalness: 0.0 },
  vermilionDark: { color: '#763d31', roughness: 0.89, metalness: 0.0 },
  timber: { color: '#6e5740', roughness: 0.93, metalness: 0.0 },
  paintedWood: { color: '#493c31', roughness: 0.88, metalness: 0.0 },
  shopGlass: { color: '#35443e', roughness: 0.36, metalness: 0.12 },
  signDark: { color: '#39352b', roughness: 0.84, metalness: 0.0 },
  greenBeam: { color: '#355e52', roughness: 0.85, metalness: 0.0 },
  marble: { color: '#dedccd', roughness: 0.83, metalness: 0.02 },
  bronze: { color: '#8c7950', roughness: 0.71, metalness: 0.35 },
  paving: { color: '#aaa797', roughness: 0.98, metalness: 0.0 },
  grass: { color: '#768b50', roughness: 1.0, metalness: 0.0 },
  foliage: { color: '#5c7748', roughness: 1.0, metalness: 0.0 },
  awning: { color: '#9e6049', roughness: 0.92, metalness: 0.0 },
  sign: { color: '#dccda6', roughness: 0.85, metalness: 0.0 },
  solar: { color: '#3e5967', roughness: 0.38, metalness: 0.48 },
  water: { color: '#769d9b', roughness: 0.21, metalness: 0.2 },
});

export function makeMaterials(THREE, overrides = {}) {
  return Object.fromEntries(Object.entries(MATERIALS).map(([name, params]) => {
    const material = new THREE.MeshStandardMaterial({ ...params, ...overrides[name] });
    material.name = `Beijing_${name}`;
    return [name, material];
  }));
}
