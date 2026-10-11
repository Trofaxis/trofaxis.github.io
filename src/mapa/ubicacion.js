// Ubicación de la finca: punto, contorno y vista del mapa.
// Se guarda SOLO en este navegador, con una clave aparte de la finca. Así las coordenadas
// nunca viajan en el archivo exportado ni entran a la memoria de casos.
import { CONFIG } from '../core/config.js';

const CLAVE = 'biogap:mapa:v1';
const coord = (p) => Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === 'number' && Number.isFinite(x))
  && Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180 ? [p[0], p[1]] : null;

// arboles: censo de árboles de riesgo para polinizadores (ApiRadar), { id, lat, lon, dap, d, h } (DAP en cm, diámetro y altura de
// copa en m). sitios: puntos candidatos para colonias o refugios, { id, lat, lon }. ejemplo: los datos son ficticios.
// Todo esto también vive solo en este navegador.
export const ubicacionVacia = () => ({ punto: null, contorno: [], arboles: [], sitios: [], ejemplo: false, ejemploContorno: false, vista: { ...CONFIG.mapa.inicio } });

const num = (x) => (typeof x === 'number' && Number.isFinite(x) && x > 0 ? x : null);
const idDe = (o, i) => (typeof o?.id === 'string' || typeof o?.id === 'number' ? String(o.id).slice(0, 20) : String(i + 1));
// Acepta también el formato anterior, un par [lat, lon].
const arbol = (o, i) => { const c = Array.isArray(o) ? coord(o) : coord([o?.lat, o?.lon]); return c && { id: idDe(Array.isArray(o) ? null : o, i), lat: c[0], lon: c[1], dap: num(o?.dap), d: num(o?.d), h: num(o?.h) }; };
const sitio = (o, i) => { const c = coord([o?.lat, o?.lon]); return c && { id: idDe(o, i), lat: c[0], lon: c[1] }; };

export function normalizarUbicacion(o) {
  const v = ubicacionVacia();
  if (!o || typeof o !== 'object') return v;
  const z = Number.isInteger(o.vista?.zoom) ? Math.max(CONFIG.mapa.zoomMin, Math.min(CONFIG.mapa.zoomMax, o.vista.zoom)) : v.vista.zoom;
  const c = coord([o.vista?.lat, o.vista?.lon]);
  return {
    punto: coord(o.punto),
    contorno: Array.isArray(o.contorno) ? o.contorno.slice(0, 200).map(coord).filter(Boolean) : [],
    arboles: Array.isArray(o.arboles) ? o.arboles.slice(0, 500).map(arbol).filter(Boolean) : [],
    sitios: Array.isArray(o.sitios) ? o.sitios.slice(0, 50).map(sitio).filter(Boolean) : [],
    ejemplo: o.ejemplo === true,
    ejemploContorno: o.ejemplo === true && o.ejemploContorno === true,
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
