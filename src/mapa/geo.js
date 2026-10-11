// Cálculos geográficos del mapa de la finca (funciones puras, sin DOM).
// Proyección Web Mercator con teselas de 256 px (esquema "slippy map" de OpenStreetMap:
// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames).
import { CONFIG } from '../core/config.js';

export const TESELA = 256;
const R = 6378137; // m, semieje mayor WGS84 (el mismo radio que usa Web Mercator)
const LAT_MAX = 85.05112878; // límite de Web Mercator
const rad = (g) => (g * Math.PI) / 180;
const grad = (r) => (r * 180) / Math.PI;

// Grados → píxel global en el zoom z.
export function aPixel(lat, lon, z) {
  const n = TESELA * 2 ** z;
  const la = rad(Math.max(-LAT_MAX, Math.min(LAT_MAX, lat)));
  return { x: ((lon + 180) / 360) * n, y: ((1 - Math.log(Math.tan(la) + 1 / Math.cos(la)) / Math.PI) / 2) * n };
}

// Píxel global → grados.
export function aGrados(x, y, z) {
  const n = TESELA * 2 ** z;
  return { lat: grad(Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)))), lon: (x / n) * 360 - 180 };
}

// Teselas que cubren una ventana de ancho×alto centrada en (lat, lon).
// Devuelve [{ x, y, z, px, py }] con px/py = posición de la tesela dentro de la ventana.
export function teselasVisibles(lat, lon, z, ancho, alto) {
  const c = aPixel(lat, lon, z), n = 2 ** z;
  const x0 = c.x - ancho / 2, y0 = c.y - alto / 2;
  const out = [];
  for (let ty = Math.floor(y0 / TESELA); ty <= Math.floor((y0 + alto) / TESELA); ty++) {
    if (ty < 0 || ty >= n) continue;
    for (let tx = Math.floor(x0 / TESELA); tx <= Math.floor((x0 + ancho) / TESELA); tx++) {
      out.push({ x: ((tx % n) + n) % n, y: ty, z, px: tx * TESELA - x0, py: ty * TESELA - y0 });
    }
  }
  return out;
}

export const urlTesela = (t, plantilla = CONFIG.mapa.capa.url) =>
  plantilla.replace('{z}', t.z).replace('{x}', t.x).replace('{y}', t.y);

// Área de un polígono sobre la esfera, en hectáreas.
// Chamberlain y Duquette (2007), "Some algorithms for polygons on a sphere", JPL Publication 07-03.
// Puntos: [[lat, lon], ...] sin repetir el primero al final.
export function areaHa(puntos) {
  if (!Array.isArray(puntos) || puntos.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < puntos.length; i++) {
    const [la1, lo1] = puntos[i], [la2, lo2] = puntos[(i + 1) % puntos.length];
    s += rad(lo2 - lo1) * (2 + Math.sin(rad(la1)) + Math.sin(rad(la2)));
  }
  return Math.abs((s * R * R) / 2) / 10000;
}

// Lee "14.0123, -87.0045" (también con espacio o punto y coma). Devuelve { lat, lon } o un error.
export function leerCoordenadas(texto) {
  const m = String(texto ?? '').trim().match(/^(-?\d+(?:\.\d+)?)\s*[,; ]\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return { error: 'Escribe latitud y longitud en grados decimales, por ejemplo: 14.0108, -87.0044' };
  const lat = +m[1], lon = +m[2];
  if (Math.abs(lat) > 90) return { error: 'La latitud debe estar entre -90 y 90.' };
  if (Math.abs(lon) > 180) return { error: 'La longitud debe estar entre -180 y 180.' };
  return { lat, lon };
}

// ¿Cae dentro del rectángulo aproximado de Honduras? (solo para avisar de un posible error).
export function enHonduras(lat, lon, h = CONFIG.mapa.honduras) {
  return lat >= h.latMin && lat <= h.latMax && lon >= h.lonMin && lon <= h.lonMax;
}

// Avisos de datos posiblemente erróneos al comparar el mapa con las respuestas del cuestionario.
export function avisosMapa(ubic, areaDeclarada, tol = CONFIG.mapa.toleranciaArea) {
  const avisos = [];
  if (ubic?.punto) {
    const [lat, lon] = ubic.punto;
    if (!enHonduras(lat, lon)) {
      avisos.push(lon > 0 && enHonduras(lat, -lon)
        ? 'La ubicación está fuera de Honduras. ¿Falta el signo menos en la longitud? En Honduras la longitud es negativa (oeste).'
        : 'La ubicación está fuera de Honduras. Revisa las coordenadas.');
    }
  }
  const dib = areaHa(ubic?.contorno);
  if (dib > 0 && areaDeclarada > 0) {
    const dif = (dib - areaDeclarada) / areaDeclarada;
    if (Math.abs(dif) > tol) avisos.push(`El contorno dibujado mide ${redondear(dib)} ha y en el cuestionario declaraste ${areaDeclarada} ha (${dif > 0 ? '+' : ''}${Math.round(dif * 100)} %). Revisa cuál es correcto.`);
  }
  return avisos;
}

export const redondear = (ha) => (ha >= 100 ? Math.round(ha) : ha >= 10 ? Math.round(ha * 10) / 10 : Math.round(ha * 100) / 100);
