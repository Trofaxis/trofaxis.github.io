// NDVI de un lote: llama a la función «ndvi» de Supabase (supabase/functions/ndvi) y resume la serie para la tarjeta.
// Solo se llama cuando la persona pulsa «Ver NDVI del lote» con la sesión iniciada: el contorno del lote sale del
// dispositivo hacia esa función y Copernicus. Lo que se guarda aquí (caché) son los valores de NDVI, no el contorno.
import { CONFIG } from '../core/config.js';

const CLAVE = 'biogap:ndvi:v1';

export class ErrorNdvi extends Error {
  constructor(mensaje, estado = 0) { super(mensaje); this.estado = estado; }
}

// Huella corta del contorno: si el lote se redibuja con el mismo id, no se reutiliza el NDVI del contorno anterior.
export function huellaContorno(contorno) {
  let h = 5381;
  for (const ch of JSON.stringify(contorno)) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
  return h.toString(36);
}
const claveLote = (lote) => `${lote.id}:${huellaContorno(lote.contorno)}`;

export function leerNdviCache(lote, ahora = new Date(), almacen = globalThis.localStorage, cfg = CONFIG.ndvi) {
  try {
    const o = JSON.parse(almacen?.getItem(CLAVE) || '{}')?.[claveLote(lote)];
    if (!o?.obtenido || !Array.isArray(o.datos?.serie)) return null;
    const horas = (ahora - new Date(o.obtenido)) / 3600000;
    return horas >= 0 && horas <= cfg.cacheHoras ? o : null;
  } catch { return null; }
}

export function guardarNdviCache(lote, datos, ahora = new Date(), almacen = globalThis.localStorage, cfg = CONFIG.ndvi) {
  try {
    const todo = JSON.parse(almacen?.getItem(CLAVE) || '{}') || {};
    // Se quedan solo las entradas vigentes, para que la caché no crezca.
    const vigentes = Object.fromEntries(Object.entries(todo).filter(([, o]) => o?.obtenido && (ahora - new Date(o.obtenido)) / 3600000 <= cfg.cacheHoras));
    vigentes[claveLote(lote)] = { obtenido: ahora.toISOString(), datos };
    almacen?.setItem(CLAVE, JSON.stringify(vigentes));
  } catch { /* sin almacenamiento: se vuelve a pedir la próxima vez */ }
}

// Devuelve { desde, hasta, ha, serie: [{ fecha, media, min, max, desv, validos }] } o lanza ErrorNdvi.
export async function pedirNdvi(contorno, sesion, { cfg = CONFIG, fetchFn = globalThis.fetch } = {}) {
  const { url, clavePublicable } = cfg.nube ?? {};
  if (!url || !clavePublicable) throw new ErrorNdvi('No se pudo conectar con el servidor de Trofaxis.');
  if (!sesion?.token) throw new ErrorNdvi('Inicia sesión para ver el NDVI del lote.', 401);
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const t = ctl ? setTimeout(() => ctl.abort(), cfg.ndvi.esperaMs) : null;
  let r;
  try {
    r = await fetchFn(`${url}/functions/v1/${cfg.ndvi.funcion}`, {
      method: 'POST',
      headers: { apikey: clavePublicable, Authorization: `Bearer ${sesion.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contorno, dias: cfg.ndvi.dias, scl: cfg.ndvi.scl }),
      ...(ctl ? { signal: ctl.signal } : {}),
    });
  } catch (e) {
    throw new ErrorNdvi(e?.name === 'AbortError' ? 'Copernicus tardó demasiado en responder. Inténtalo de nuevo.' : 'Sin conexión con el servidor de Trofaxis.');
  } finally { if (t) clearTimeout(t); }
  let cuerpo = null;
  try { cuerpo = await r.json(); } catch { /* sin JSON */ }
  if (!r.ok) {
    if (r.status === 401) throw new ErrorNdvi('Tu sesión venció. Inicia sesión de nuevo.', 401);
    if (r.status === 404) throw new ErrorNdvi('El NDVI todavía no está activado en el servidor.', 404);
    throw new ErrorNdvi(typeof cuerpo?.error === 'string' ? cuerpo.error : `El servidor respondió con el error ${r.status}.`, r.status);
  }
  if (!Array.isArray(cuerpo?.serie)) throw new ErrorNdvi('El servidor no devolvió el NDVI.');
  return cuerpo;
}

// Serie → lo que muestra la tarjeta: la última fecha con el lote despejado y su cambio respecto a la anterior.
export function resumenNdvi(serie, cfg = CONFIG.ndvi) {
  const utiles = (serie ?? []).filter((x) => typeof x?.media === 'number' && Number.isFinite(x.media) && x.validos >= cfg.minValidos)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (!utiles.length) return { utiles, ultima: null, previa: null, cambio: null, tendencia: '' };
  const ultima = utiles.at(-1), previa = utiles.length > 1 ? utiles.at(-2) : null;
  const cambio = previa ? Math.round((ultima.media - previa.media) * 1000) / 1000 : null;
  const tendencia = cambio == null ? '' : Math.abs(cambio) < cfg.cambioMin ? 'estable' : cambio > 0 ? 'sube' : 'baja';
  return { utiles, ultima, previa, cambio, tendencia };
}
