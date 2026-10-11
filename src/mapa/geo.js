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

// ---------- Árboles de riesgo y sitios fuera de su radio (ApiRadar) ----------
// UTM (WGS84, hemisferio norte) → grados. Series de Krüger (Karney 2011, "Transverse Mercator with an accuracy of a few nanometers").
// Error de milímetros con tres términos. La zona 16 N cubre el oeste de Honduras (meridiano central 87° O) y la 17 N, el este.
const F_WGS84 = 1 / 298.257223563, K0 = 0.9996;
export function utmALatLon(este, norte, zona = 16) {
  const n = F_WGS84 / (2 - F_WGS84), n2 = n * n, n3 = n2 * n, n4 = n3 * n;
  const A = (R / (1 + n)) * (1 + n2 / 4 + n4 / 64);
  const b = [n / 2 - (2 * n2) / 3 + (37 * n3) / 96 - n4 / 360, n2 / 48 + n3 / 15 - (437 * n4) / 1440, (17 * n3) / 480 - (37 * n4) / 840];
  const d = [2 * n - (2 * n2) / 3 - 2 * n3, (7 * n2) / 3 - (8 * n3) / 5, (56 * n3) / 15];
  const xi = norte / (K0 * A), eta = (este - 500000) / (K0 * A);
  let xp = xi, ep = eta;
  b.forEach((bj, i) => { const j = 2 * (i + 1); xp -= bj * Math.sin(j * xi) * Math.cosh(j * eta); ep -= bj * Math.cos(j * xi) * Math.sinh(j * eta); });
  const chi = Math.asin(Math.sin(xp) / Math.cosh(ep));
  let lat = chi;
  d.forEach((dj, i) => { lat += dj * Math.sin(2 * (i + 1) * chi); });
  const lon0 = (zona * 6 - 183) * (Math.PI / 180);
  return { lat: grad(lat), lon: grad(lon0 + Math.atan2(Math.sinh(ep), Math.cos(xp))) };
}

// Un punto escrito como "latitud, longitud" (grados decimales) o "este norte" (UTM en metros, zona indicada).
// Distingue por el tamaño del número. Devuelve [lat, lon] o null.
export function puntoDe(a, b, zona = 16) {
  if (![a, b].every(Number.isFinite)) return null;
  let p = null;
  if (Math.abs(a) <= 90 && Math.abs(b) <= 180) p = [a, b];
  else if (a >= 100000 && a <= 900000 && b > 0 && b < 10000000) { const g = utmALatLon(a, b, zona); p = [g.lat, g.lon]; }
  return p && [+p[0].toFixed(6), +p[1].toFixed(6)];
}

const MAX_TXT = 20;
const medida = (t) => (t === undefined || t === '' ? null : Number(t));

// Una línea del censo: "ID, este, norte, DAP, diámetro de copa, altura de copa". Solo ID y coordenadas son obligatorios; con
// solo dos números se toman como coordenadas y el ID se pone solo. Separadores: tabulador (pegado desde Excel; los campos
// vacíos cuentan), coma, punto y coma o espacio. Se pide punto decimal. Devuelve { arbol } o { error }.
export function leerLineaCenso(linea, zona = 16, n = 1) {
  const l = String(linea).trim();
  const t = l.includes('\t') ? l.split('\t').map((x) => x.trim()) : l.split(/[;, ]+/).filter(Boolean);
  const fmt = 'escribe ID, este, norte, DAP, diámetro de copa y altura de copa (ej. 27 501227 1547802 89.4 18.7 19.2), o solo las coordenadas.';
  if (t.length < 2 || t.length > 6) return { error: `${fmt}` };
  const sinId = t.length === 2;
  const [id, x, y, ...medidas] = sinId ? [String(n), t[0], t[1]] : t;
  const [dap, d, h] = medidas.map(medida);
  const p = puntoDe(Number(x), Number(y), zona);
  if (!p || !x || !y) return { error: `no reconozco las coordenadas (${x} ${y}). Usa grados (14.0108, -87.0044) o UTM (501177 1547784).` };
  if (![dap, d, h].every((v) => v == null || (Number.isFinite(v) && v >= 0))) return { error: 'DAP, diámetro y altura de copa deben ser números positivos (con punto decimal).' };
  if (String(id).length > MAX_TXT) return { error: `el ID es muy largo (máximo ${MAX_TXT} caracteres).` };
  return { arbol: { id: String(id), lat: p[0], lon: p[1], dap: dap || null, d: d || null, h: h || null } };
}

// Lee el censo de árboles de riesgo, una línea por árbol. Salta la fila de títulos y las líneas con # o //.
// Devuelve { arboles: [{ id, lat, lon, dap, d, h }], errores: [texto] }.
export function leerCenso(texto, zona = 16, max = 500) {
  const arboles = [], errores = [], ids = new Set();
  String(texto ?? '').split(/\r?\n/).forEach((linea, i) => {
    const l = linea.trim();
    if (!l || /^[#/]/.test(l)) return;
    if (!arboles.length && !errores.length && /^[A-Za-zÁÉÍÓÚáéíóúñ]/.test(l) && !/\d{3,}/.test(l) && l.split(/[\t;, ]+/).length >= 3) return; // fila de títulos
    const r = leerLineaCenso(linea, zona, arboles.length + 1);
    if (r.error) { errores.push(`Línea ${i + 1}: ${r.error}`); return; }
    if (ids.has(r.arbol.id)) { errores.push(`Línea ${i + 1}: el ID ${r.arbol.id} ya está en la lista; se omitió.`); return; }
    ids.add(r.arbol.id); arboles.push(r.arbol);
  });
  if (arboles.length > max) { errores.push(`Se cargaron los primeros ${max} árboles.`); arboles.length = max; }
  return { arboles, errores };
}

// Plano local en metros alrededor de una referencia (aproximación equirectangular: sobra para decenas de km).
export const planoDe = (ref) => { const k = Math.cos(rad(ref[0])) * (Math.PI / 180) * R, h = (Math.PI / 180) * R; return { aM: ([la, lo]) => [(lo - ref[1]) * k, (la - ref[0]) * h], aG: ([x, y]) => [ref[0] + y / h, ref[1] + x / k] }; };

export function distanciaM(a, b) {
  const { aM } = planoDe(a), [x, y] = aM(b);
  return Math.hypot(x, y);
}

const dentro = (p, poly) => {
  let in_ = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) in_ = !in_;
  }
  return in_;
};

// Qué parte de la finca queda fuera del radio de los árboles de riesgo, y el punto más alejado de todos ellos.
// Rejilla sobre el contorno (hasta 90×90 puntos). radios = [mínimo, máximo] en metros.
// Devuelve null sin contorno de 3 puntos o sin árboles.
export function sitiosFuera(arboles, contorno, radios) {
  if (!Array.isArray(arboles) || !arboles.length || !Array.isArray(contorno) || contorno.length < 3) return null;
  const { aM, aG } = planoDe(contorno[0]);
  const poly = contorno.map(aM), tr = arboles.map(aM);
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const paso = Math.max(5, Math.max(x1 - x0, y1 - y0) / 90);
  let total = 0, fMin = 0, fMax = 0, mejor = null;
  for (let x = x0 + paso / 2; x < x1; x += paso) {
    for (let y = y0 + paso / 2; y < y1; y += paso) {
      if (!dentro([x, y], poly)) continue;
      let d = Infinity;
      for (const t of tr) { const e = Math.hypot(x - t[0], y - t[1]); if (e < d) d = e; }
      total++;
      if (d >= radios[0]) fMin++;
      if (d >= radios[1]) fMax++;
      if (!mejor || d > mejor.d) mejor = { d, x, y };
    }
  }
  if (!total) return null;
  const ha = areaHa(contorno);
  return {
    fraccionMin: fMin / total, fraccionMax: fMax / total, haMin: ha * (fMin / total), haMax: ha * (fMax / total), areaHa: ha,
    mejor: { distanciaM: Math.round(mejor.d), punto: aG([mejor.x, mejor.y]).map((v) => +v.toFixed(6)) },
  };
}
