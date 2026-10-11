// Descarga del clima por coordenadas (Open-Meteo, clima histórico) con caché en este navegador.
// La caché guarda las coordenadas redondeadas solo aquí, como el mapa: no viajan en el archivo de la finca.
// Sin internet: se usa la última descarga de ese punto; si no hay, el usuario escribe los valores a mano.
import { CONFIG } from '../core/config.js';
import { urlClima, periodo, climaDesdeRespuesta, redondearCoord, normalizarClima } from './normales.js';

const CLAVE = 'biogap:clima:v1';
const claveDe = (lat, lon) => `${redondearCoord(lat)},${redondearCoord(lon)}`;

export function leerCache(lat, lon, hoy = new Date(), almacen = globalThis.localStorage) {
  try {
    const o = JSON.parse(almacen?.getItem(CLAVE) || 'null');
    if (!o || o.clave !== claveDe(lat, lon)) return null;
    const c = normalizarClima(o.clima);
    if (!c) return null;
    const dias = (hoy - new Date(c.obtenido)) / 86400000;
    return { clima: c, vencida: !(dias <= CONFIG.clima.cacheDias) };
  } catch { return null; }
}
export function guardarCache(lat, lon, clima, almacen = globalThis.localStorage) {
  try { almacen?.setItem(CLAVE, JSON.stringify({ clave: claveDe(lat, lon), clima })); } catch { /* sin almacenamiento */ }
}
export function borrarCache(almacen = globalThis.localStorage) {
  try { almacen?.removeItem(CLAVE); } catch { /* sin almacenamiento */ }
}

export class ErrorClima extends Error {}

async function pedir(url, fetchFn, ms) {
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const t = ctl ? setTimeout(() => ctl.abort(), ms) : null;
  try {
    const r = await fetchFn(url, ctl ? { signal: ctl.signal } : {});
    let json = null;
    try { json = await r.json(); } catch { /* cuerpo no JSON */ }
    return { ok: r.ok, estado: r.status, json };
  } catch (e) {
    throw new ErrorClima(e?.name === 'AbortError' ? 'El servicio de clima tardó demasiado en responder.' : 'Sin conexión con el servicio de clima.');
  } finally { if (t) clearTimeout(t); }
}

// Devuelve { clima, deCache, aviso? }. Primero la caché vigente; luego el servicio; si falla, la caché vencida.
export async function obtenerClima(lat, lon, { fetchFn = globalThis.fetch, hoy = new Date(), almacen = globalThis.localStorage, forzar = false } = {}) {
  const cache = leerCache(lat, lon, hoy, almacen);
  if (cache && !cache.vencida && !forzar) return { clima: cache.clima, deCache: true };
  if (typeof fetchFn !== 'function') {
    if (cache) return { clima: cache.clima, deCache: true, aviso: 'Este navegador no puede descargar datos; se usa la última descarga.' };
    throw new ErrorClima('Este navegador no puede descargar datos.');
  }
  const per = periodo(hoy);
  const ms = CONFIG.clima.esperaMs;
  try {
    let r = await pedir(urlClima(lat, lon, per), fetchFn, ms);
    // 400: el servicio no reconoce alguna variable diaria; se reintenta con las básicas y la humedad y el viento por hora.
    if (r.estado === 400) r = await pedir(urlClima(lat, lon, per, { basicas: true }), fetchFn, ms);
    if (!r.ok) throw new ErrorClima(r.json?.reason ? `El servicio de clima respondió: ${String(r.json.reason).slice(0, 160)}` : `El servicio de clima respondió con el error ${r.estado}.`);
    let clima;
    try { clima = climaDesdeRespuesta(r.json, hoy); } catch (e) { throw new ErrorClima(e.message); }
    guardarCache(lat, lon, clima, almacen);
    return { clima, deCache: false };
  } catch (e) {
    if (cache) return { clima: cache.clima, deCache: true, aviso: `${e.message} Se usa la última descarga (${cache.clima.obtenido}).` };
    throw e instanceof ErrorClima ? e : new ErrorClima('No se pudo obtener el clima.');
  }
}
