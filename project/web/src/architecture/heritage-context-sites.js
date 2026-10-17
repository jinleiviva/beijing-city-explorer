import {PEOPLES_HEROES_SITE} from './peoples-heroes-layout.js';
import{BEIHAI_GALLERY_SITE}from'./beihai-gallery-layout.js';
import{AGRICULTURE_SIDE_SITES}from'./agriculture-side-layout.js';
import{LAMA_FALUN_SITE}from'./lama-falun-hall.js';
import{BEIHAI_HALL_SITES}from'./heritage-hall-layout.js';
/** Additional exact historical components. These never inflate LANDMARK_IDS. */
export const HERITAGE_CONTEXT_SITES={peoples_heroes_monument:PEOPLES_HEROES_SITE,lama_falun_hall:{...LAMA_FALUN_SITE,drapeTerrain:false},...BEIHAI_HALL_SITES,beihai_north_gallery:BEIHAI_GALLERY_SITE,...AGRICULTURE_SIDE_SITES};
