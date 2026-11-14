// Clima de ahora para la vista de lotes: pronóstico de Open-Meteo (https://open-meteo.com/en/docs).
// Se envían la latitud y la longitud redondeadas (CONFIG.clima.decimalesCoord, ~1 km), igual que el clima histórico.
// Es un modelo por coordenada, no una estación en el lote. Se guarda un rato en este navegador para no pedirlo en cada vista.
import { CONFIG } from '../core/config.js';
import { redondearCoord } from './normales.js';

const CLAVE = 'biogap:clima-ahora:v1';
export const VARIABLES_AHORA = ['temperature_2m', 'relative_humidity_2m', 'precipitation', 'cloud_cover', 'wind_speed_10m', 'wind_direction_10m', 'weather_code'];

export function urlAhora(lat, lon, cfg = CONFIG.clima) {
  const q = new URLSearchParams({
    latitude: String(redondearCoord(lat, cfg.decimalesCoord)), longitude: String(redondearCoord(lon, cfg.decimalesCoord)),
    current: VARIABLES_AHORA.join(','), daily: 'precipitation_sum', forecast_days: '1', timezone: 'auto',
  });
  return `${cfg.urlAhora}?${q}`;
}

// Códigos WMO de estado del tiempo, según la tabla de la documentación de Open-Meteo.
const CODIGOS = [
  [[0], 'Despejado'], [[1], 'Mayormente despejado'], [[2], 'Parcialmente nublado'], [[3], 'Nublado'],
  [[45, 48], 'Niebla'], [[51, 53, 55], 'Llovizna'], [[56, 57], 'Llovizna helada'], [[61, 63, 65], 'Lluvia'],
  [[66, 67], 'Lluvia helada'], [[71, 73, 75, 77], 'Nieve'], [[80, 81, 82], 'Chubascos'], [[85, 86], 'Chubascos de nieve'],
  [[95], 'Tormenta'], [[96, 99], 'Tormenta con granizo'],
];
export const describirTiempo = (codigo) => CODIGOS.find(([cs]) => cs.includes(codigo))?.[1] ?? 'Sin descripción';

// De dónde viene el viento, en 8 rumbos.
const RUMBOS = ['norte', 'noreste', 'este', 'sureste', 'sur', 'suroeste', 'oeste', 'noroeste'];
export const rumbo = (grados) => (Number.isFinite(grados) ? RUMBOS[Math.round((((grados % 360) + 360) % 360) / 45) % 8] : '');

const n = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

// Respuesta del servicio → datos que muestra la tarjeta. Lanza un Error si no trae lo mínimo.
export function climaAhoraDesde(json, obtenido = new Date()) {
  const c = json?.current;
  if (!c || n(c.temperature_2m) == null) throw new Error('El servicio de clima no devolvió el clima de ahora.');
  const u = json.current_units ?? {};
  return {
    hora: typeof c.time === 'string' ? c.time.slice(11, 16) : '',
    temp: n(c.temperature_2m), humedad: n(c.relative_humidity_2m), lluvia: n(c.precipitation), nubes: n(c.cloud_cover),
    viento: n(c.wind_speed_10m), vientoUnidad: typeof u.wind_speed_10m === 'string' ? u.wind_speed_10m : 'km/h', vientoDir: n(c.wind_direction_10m),
    codigo: n(c.weather_code), lluviaHoy: n(json.daily?.precipitation_sum?.[0]),
    obtenido: obtenido.toISOString(),
  };
}

const claveDe = (lat, lon) => `${redondearCoord(lat)},${redondearCoord(lon)}`;

export function leerAhoraCache(lat, lon, ahora = new Date(), almacen = globalThis.localStorage, cfg = CONFIG.clima) {
  try {
    const o = JSON.parse(almacen?.getItem(CLAVE) || 'null');
    if (!o || o.clave !== claveDe(lat, lon) || !o.datos?.obtenido) return null;
    const min = (ahora - new Date(o.datos.obtenido)) / 60000;
    return { datos: o.datos, vencida: !(min >= 0 && min <= cfg.ahoraVigenciaMin) };
  } catch { return null; }
}

// Devuelve { datos, deCache, aviso? } o lanza un Error con un mensaje para la persona.
export async function obtenerAhora(lat, lon, { fetchFn = globalThis.fetch, ahora = new Date(), almacen = globalThis.localStorage, cfg = CONFIG.clima } = {}) {
  const cache = leerAhoraCache(lat, lon, ahora, almacen, cfg);
  if (cache && !cache.vencida) return { datos: cache.datos, deCache: true };
  const conCache = (msg) => { if (cache) return { datos: cache.datos, deCache: true, aviso: `${msg} Se muestra el de las ${cache.datos.hora}.` }; throw new Error(msg); };
  if (typeof fetchFn !== 'function') return conCache('Este navegador no puede descargar datos.');
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const t = ctl ? setTimeout(() => ctl.abort(), cfg.ahoraEsperaMs) : null;
  try {
    const r = await fetchFn(urlAhora(lat, lon, cfg), ctl ? { signal: ctl.signal } : {});
    if (!r.ok) return conCache(`El servicio de clima respondió con el error ${r.status}.`);
    const datos = climaAhoraDesde(await r.json(), ahora);
    try { almacen?.setItem(CLAVE, JSON.stringify({ clave: claveDe(lat, lon), datos })); } catch { /* sin almacenamiento */ }
    return { datos, deCache: false };
  } catch (e) {
    if (e?.name === 'AbortError') return conCache('El servicio de clima tardó demasiado en responder.');
    return conCache(e instanceof TypeError ? 'Sin conexión con el servicio de clima.' : e.message);
  } finally { if (t) clearTimeout(t); }
}
