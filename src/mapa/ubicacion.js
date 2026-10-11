// Ubicación de la finca: punto, contorno y vista del mapa.
// Se guarda SOLO en este navegador, con una clave aparte de la finca. Así las coordenadas
// nunca viajan en el archivo exportado ni entran a la memoria de casos.
import { CONFIG } from '../core/config.js';

const CLAVE = 'biogap:mapa:v1';
const coord = (p) => Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === 'number' && Number.isFinite(x))
  && Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180 ? [p[0], p[1]] : null;

export const ubicacionVacia = () => ({ punto: null, contorno: [], vista: { ...CONFIG.mapa.inicio } });

export function normalizarUbicacion(o) {
  const v = ubicacionVacia();
  if (!o || typeof o !== 'object') return v;
  const z = Number.isInteger(o.vista?.zoom) ? Math.max(CONFIG.mapa.zoomMin, Math.min(CONFIG.mapa.zoomMax, o.vista.zoom)) : v.vista.zoom;
  const c = coord([o.vista?.lat, o.vista?.lon]);
  return {
    punto: coord(o.punto),
    contorno: Array.isArray(o.contorno) ? o.contorno.slice(0, 200).map(coord).filter(Boolean) : [],
    vista: c ? { lat: c[0], lon: c[1], zoom: z } : v.vista,
  };
}

export function cargarUbicacion() {
  try { return normalizarUbicacion(JSON.parse(localStorage.getItem(CLAVE) || 'null')); } catch { return ubicacionVacia(); }
}
export function guardarUbicacion(u) {
  try { localStorage.setItem(CLAVE, JSON.stringify(u)); return true; } catch { return false; }
}
export function borrarUbicacion() {
  try { localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ }
}
