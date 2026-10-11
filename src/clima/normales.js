// Clima de la finca por ubicación (Issue #8, crítica 3). Funciones puras: respuesta del servicio → promedios por mes.
// Fuente: API de clima histórico de Open-Meteo (reanálisis ERA5 / ERA5-Land de Copernicus), licencia CC BY 4.0.
//   https://open-meteo.com/en/docs/historical-weather-api · https://open-meteo.com/en/licence
// Lo que sale es el PROMEDIO de los últimos años completos (no una normal climática de 30 años de la OMM)
// para la celda del modelo (~11 km), no la medición de una estación en la finca.
import { CONFIG } from '../core/config.js';

// Variables por mes. lluvia en mm/mes; las demás, promedio diario del mes.
export const VARIABLES = {
  tmed: { nombre: 'Temperatura media', unidad: '°C', dec: 1, max: 60 },
  tmax: { nombre: 'Temperatura máxima', unidad: '°C', dec: 1, max: 60 },
  tmin: { nombre: 'Temperatura mínima', unidad: '°C', dec: 1, max: 60 },
  hr: { nombre: 'Humedad relativa', unidad: '%', dec: 0, max: 100 },
  lluvia: { nombre: 'Lluvia', unidad: 'mm/mes', dec: 0, max: 3000 },
  viento2: { nombre: 'Viento a 2 m', unidad: 'km/h', dec: 1, max: 200 },
  eto: { nombre: 'ETo media', unidad: 'mm/día', dec: 2, max: 20 },
  etoP90: { nombre: 'ETo de un día exigente (percentil 90)', unidad: 'mm/día', dec: 2, max: 20 },
  rad: { nombre: 'Radiación solar', unidad: 'MJ/m²/día', dec: 1, max: 50 },
};
export const CLAVES = Object.keys(VARIABLES);

// Variables diarias que se piden a Open-Meteo y a qué clave van. Los nombres son los de su documentación.
export const DIARIAS = {
  temperature_2m_mean: 'tmed', temperature_2m_max: 'tmax', temperature_2m_min: 'tmin',
  relative_humidity_2m_mean: 'hr', precipitation_sum: 'lluvia', wind_speed_10m_mean: 'viento10',
  et0_fao_evapotranspiration: 'eto', shortwave_radiation_sum: 'rad',
};
// Respaldo si el servicio no reconoce las medias diarias: la humedad y el viento se piden por hora y se promedian por día.
export const DIARIAS_BASICAS = ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'et0_fao_evapotranspiration', 'shortwave_radiation_sum'];
export const HORARIAS_RESPALDO = { relative_humidity_2m: 'hr', wind_speed_10m: 'viento10' };

export const mesVacio = () => Object.fromEntries(CLAVES.map((k) => [k, null]));
export const climaVacio = () => ({ fuente: '', periodo: null, obtenido: '', elevacion: null, meses: Array.from({ length: 12 }, mesVacio), manual: [] });

// Años completos más recientes: con 10 años y hoy en 2026 → 2016-2025.
export function periodo(hoy = new Date(), anios = CONFIG.clima.anios) {
  const fin = hoy.getFullYear() - 1;
  return [fin - anios + 1, fin];
}

// Coordenadas que se envían: redondeadas (2 decimales ≈ 1 km), más finas que la celda del modelo no aportan.
export const redondearCoord = (x, dec = CONFIG.clima.decimalesCoord) => Number(x.toFixed(dec));

export function urlClima(lat, lon, [desde, hasta], { basicas = false } = {}, cfg = CONFIG.clima) {
  const q = new URLSearchParams({
    latitude: String(redondearCoord(lat, cfg.decimalesCoord)), longitude: String(redondearCoord(lon, cfg.decimalesCoord)),
    start_date: `${desde}-01-01`, end_date: `${hasta}-12-31`,
    daily: (basicas ? DIARIAS_BASICAS : Object.keys(DIARIAS)).join(','),
    timezone: 'auto',
  });
  if (basicas) q.set('hourly', Object.keys(HORARIAS_RESPALDO).join(','));
  return `${cfg.url}?${q}`;
}

// FAO-56, ecuación 47: viento a 2 m a partir del medido a z m. u2 = uz · 4.87 / ln(67.8 z − 5.42).
export const factorViento2m = (z) => 4.87 / Math.log(67.8 * z - 5.42);

// Percentil con interpolación lineal (el mismo método que PERCENTIL.INC de Excel).
export function percentil(valores, p) {
  const v = valores.filter(Number.isFinite).sort((a, b) => a - b);
  if (!v.length) return null;
  const h = (v.length - 1) * p, i = Math.floor(h);
  return i + 1 < v.length ? v[i] + (h - i) * (v[i + 1] - v[i]) : v[i];
}

const diasDelMes = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const prom = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const red = (x, d) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 10 ** d) / 10 ** d);
const valido = (x) => typeof x === 'number' && Number.isFinite(x);

// Promedia por día los datos horarios del respaldo y los agrega al bloque diario.
export function unirHorario(daily, hourly) {
  if (!hourly?.time?.length) return daily;
  const out = { ...daily };
  for (const [var_, k] of Object.entries(HORARIAS_RESPALDO)) {
    const serie = hourly[var_];
    if (!Array.isArray(serie)) continue;
    const porDia = new Map();
    hourly.time.forEach((t, i) => {
      if (!valido(serie[i])) return;
      const d = String(t).slice(0, 10);
      (porDia.get(d) ?? porDia.set(d, []).get(d)).push(serie[i]);
    });
    const nombre = Object.keys(DIARIAS).find((x) => DIARIAS[x] === k);
    out[nombre] = daily.time.map((d) => prom(porDia.get(d) ?? []));
  }
  return out;
}

// Respuesta diaria → promedios por mes.
// Un mes de un año cuenta solo si tiene al menos minDias de sus días con dato; un mes del promedio necesita minAnios.
// La lluvia de un mes = promedio diario × días del mes (así un día faltante no la baja).
export function normalesDesdeDiario(daily, cfg = CONFIG.clima) {
  const t = Array.isArray(daily?.time) ? daily.time : [];
  const series = {};
  for (const [var_, k] of Object.entries(DIARIAS)) if (Array.isArray(daily[var_])) series[k] = daily[var_];
  // Sin media diaria de temperatura: (máxima + mínima) / 2.
  if (!series.tmed && series.tmax && series.tmin) series.tmed = series.tmax.map((x, i) => (valido(x) && valido(series.tmin[i]) ? (x + series.tmin[i]) / 2 : null));
  const grupos = new Map(); // 'y-m' → { y, m, k: [valores] }
  const etoDias = Array.from({ length: 12 }, () => []);
  t.forEach((d, i) => {
    const mt = /^(\d{4})-(\d{2})-\d{2}/.exec(String(d));
    if (!mt) return;
    const y = +mt[1], m = +mt[2] - 1, key = `${y}-${m}`;
    const g = grupos.get(key) ?? grupos.set(key, { y, m, v: {} }).get(key);
    for (const [k, s] of Object.entries(series)) if (valido(s[i])) (g.v[k] ??= []).push(s[i]);
    if (series.eto && valido(series.eto[i])) etoDias[m].push(series.eto[i]);
  });
  const porMes = Array.from({ length: 12 }, () => ({}));
  const anios = new Set();
  for (const g of grupos.values()) {
    const dm = diasDelMes(g.y, g.m);
    for (const [k, vals] of Object.entries(g.v)) {
      if (vals.length < cfg.minDias * dm) continue;
      const media = prom(vals);
      (porMes[g.m][k] ??= []).push(k === 'lluvia' ? media * dm : media);
      anios.add(g.y);
    }
  }
  const fv = factorViento2m(cfg.alturaViento);
  const meses = porMes.map((pm, m) => {
    const x = (k) => ((pm[k]?.length ?? 0) >= cfg.minAnios ? prom(pm[k]) : null);
    const v10 = x('viento10');
    const o = {
      tmed: x('tmed'), tmax: x('tmax'), tmin: x('tmin'), hr: x('hr'), lluvia: x('lluvia'),
      viento2: v10 == null ? null : v10 * fv, eto: x('eto'),
      etoP90: etoDias[m].length >= cfg.minAnios * 20 ? percentil(etoDias[m], cfg.percentilEtoDiseno) : null,
      rad: x('rad'),
    };
    return Object.fromEntries(CLAVES.map((k) => [k, red(o[k], VARIABLES[k].dec)]));
  });
  const a = [...anios].sort((p, q) => p - q);
  return { meses, periodo: a.length ? [a[0], a[a.length - 1]] : null, completos: meses.every((mm) => CLAVES.every((k) => mm[k] != null)) };
}

// Respuesta completa de Open-Meteo → clima de la finca.
export function climaDesdeRespuesta(json, hoy = new Date(), cfg = CONFIG.clima) {
  if (!json || typeof json !== 'object' || !json.daily) throw new Error('La respuesta del servicio de clima no trae datos diarios.');
  const daily = unirHorario(json.daily, json.hourly);
  const n = normalesDesdeDiario(daily, cfg);
  if (!n.periodo) throw new Error('El servicio de clima no devolvió datos suficientes para esa ubicación.');
  return {
    fuente: 'open-meteo', periodo: n.periodo, obtenido: hoy.toISOString().slice(0, 10),
    elevacion: valido(json.elevation) ? Math.round(json.elevation) : null, meses: n.meses, manual: [],
  };
}

// ¿Hay algún dato de clima?
export const tieneClima = (c) => Boolean(c && Array.isArray(c.meses) && c.meses.some((m) => CLAVES.some((k) => m?.[k] != null)));

// Meses de lluvia fuerte: lluvia del mes ≥ umbral (criterio propio en config).
export function mesesLluviosos(c, umbral = CONFIG.clima.lluviaFuerteMm) {
  if (!tieneClima(c)) return [];
  return c.meses.map((m, i) => (m.lluvia != null && m.lluvia >= umbral ? i : -1)).filter((i) => i >= 0);
}

// Valida el clima guardado en la finca o importado de un archivo. Lo que no se reconoce se descarta.
export function normalizarClima(o) {
  if (!o || typeof o !== 'object' || !Array.isArray(o.meses)) return null;
  const v = climaVacio();
  const meses = v.meses.map((_, i) => {
    const m = o.meses[i] && typeof o.meses[i] === 'object' ? o.meses[i] : {};
    return Object.fromEntries(CLAVES.map((k) => {
      const x = m[k];
      const minimo = ['tmed', 'tmax', 'tmin'].includes(k) ? -60 : 0;
      return [k, valido(x) && x >= minimo && x <= VARIABLES[k].max ? x : null];
    }));
  });
  const per = Array.isArray(o.periodo) && o.periodo.length === 2 && o.periodo.every((y) => Number.isInteger(y) && y > 1900 && y < 2200) ? [o.periodo[0], o.periodo[1]] : null;
  const c = {
    fuente: ['open-meteo', 'manual'].includes(o.fuente) ? o.fuente : 'manual', periodo: per,
    obtenido: typeof o.obtenido === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.obtenido) ? o.obtenido : '',
    elevacion: valido(o.elevacion) && o.elevacion > -500 && o.elevacion < 9000 ? Math.round(o.elevacion) : null,
    meses,
    manual: Array.isArray(o.manual) ? [...new Set(o.manual.filter((x) => typeof x === 'string' && /^\d{1,2}\.[a-zA-Z0-9]+$/.test(x)))].slice(0, 12 * CLAVES.length) : [],
  };
  return tieneClima(c) ? c : null;
}

// Llena los datos de riego que están vacíos con el clima de la finca. No pisa lo que el usuario escribió o
// lo que vino de su archivo, salvo con forzar. Devuelve los nombres de lo que se llenó.
//   ETo de cada mes ← ETo media del mes; temperatura y radiación del reservorio ← las del mes;
//   ETo de diseño ← el mayor percentil 90 de la ETo diaria (criterio propio: un día exigente, no el promedio).
export function llenarRiego(d, c, { forzar = false } = {}) {
  const llenos = [];
  if (!tieneClima(c) || !d) return llenos;
  const vacio = (x) => forzar || x == null;
  const serie = (arr, k, nombre) => {
    let n = 0;
    c.meses.forEach((m, i) => { if (m[k] != null && vacio(arr[i])) { arr[i] = m[k]; n++; } });
    if (n) llenos.push(`${nombre} (${n} mes${n > 1 ? 'es' : ''})`);
  };
  if (!Array.isArray(d.etoMensual)) d.etoMensual = Array(12).fill(null);
  serie(d.etoMensual, 'eto', 'ETo de cada mes');
  if (d.reservorio) {
    serie(d.reservorio.temperatura, 'tmed', 'temperatura del reservorio');
    serie(d.reservorio.radiacion, 'rad', 'radiación del reservorio');
  }
  const p90 = c.meses.map((m) => m.etoP90).filter((x) => x != null);
  if (p90.length && vacio(d.eto)) { d.eto = Math.max(...p90); llenos.push('ETo de diseño'); }
  return llenos;
}

// Resumen del clima de varios meses (promedio de los meses con dato), para avisos y textos.
export function climaDeMeses(c, meses) {
  if (!tieneClima(c) || !meses?.length) return null;
  const o = {};
  for (const k of CLAVES) {
    const v = meses.map((i) => c.meses[i]?.[k]).filter((x) => x != null);
    o[k] = v.length ? red(prom(v), VARIABLES[k].dec) : null;
  }
  return o;
}
