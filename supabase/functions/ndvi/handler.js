// Función «ndvi»: NDVI de un lote con imágenes Sentinel-2 L2A, por la Statistical API de Copernicus Data Space (CDSE).
// La app la llama solo cuando la persona pulsa «Ver NDVI del lote» y tiene la sesión iniciada.
// El contorno del lote llega aquí y se envía a Copernicus para calcular el promedio; esta función no lo guarda ni lo registra.
// Credenciales: secretos CDSE_CLIENT_ID y CDSE_CLIENT_SECRET de Supabase (cliente OAuth de la cuenta de Copernicus).
// Documentación: https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Statistical.html
//                https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Overview/Authentication.html
// Sin dependencias: se prueba en Node con un fetch falso (tests/ndvi-edge.test.js).

const ORIGENES = new Set([
  'https://trofaxis.github.io',
  'https://localhost',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

export const URL_TOKEN = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
export const URL_ESTADISTICAS = 'https://sh.dataspace.copernicus.eu/api/v1/statistics';

// Límites para cuidar la cuota gratuita de Copernicus (criterio propio, no son umbrales agronómicos).
const MAX_PUNTOS = 200;
const MAX_HA = 1000;
const DIAS = { min: 10, max: 120, defecto: 60 };
// Clases de la capa SCL de Sentinel-2 L2A que se descartan si la app no manda otras: sin dato (0), saturado (1),
// sombra de nube (3), nube media (8), nube alta (9), cirro (10) y nieve (11). Elección propia; la app la manda desde config.js.
const SCL_DEFECTO = [0, 1, 3, 8, 9, 10, 11];

const valorEnv = (env, nombre) => (typeof env?.get === 'function' ? env.get(nombre) : env?.[nombre]);
const json = (status, cuerpo, cabeceras) => new Response(JSON.stringify(cuerpo), { status, headers: { ...cabeceras, 'Content-Type': 'application/json; charset=utf-8' } });
const error = (status, mensaje, cabeceras) => json(status, { error: mensaje }, cabeceras);

// ---------- Grados → UTM (WGS84). Serie de Krüger (Karney 2011), la misma que usa src/mapa/geo.js al revés. ----------
const R_ECU = 6378137, F = 1 / 298.257223563, K0 = 0.9996;
export function zonaUtm(lon) { return Math.min(60, Math.max(1, Math.floor((lon + 180) / 6) + 1)); }
export function aUtm(lat, lon, zona = zonaUtm(lon)) {
  const n = F / (2 - F), n2 = n * n, n3 = n2 * n, n4 = n3 * n;
  const A = (R_ECU / (1 + n)) * (1 + n2 / 4 + n4 / 64);
  const a = [n / 2 - (2 * n2) / 3 + (5 * n3) / 16 + (41 * n4) / 180, (13 * n2) / 48 - (3 * n3) / 5 + (557 * n4) / 1440, (61 * n3) / 240 - (103 * n4) / 140];
  const rad = Math.PI / 180, phi = lat * rad, lam = (lon - (zona * 6 - 183)) * rad;
  const e = 2 * Math.sqrt(n) / (1 + n);
  const t = Math.sinh(Math.atanh(Math.sin(phi)) - e * Math.atanh(e * Math.sin(phi)));
  const xi0 = Math.atan2(t, Math.cos(lam)), eta0 = Math.atanh(Math.sin(lam) / Math.sqrt(1 + t * t));
  let xi = xi0, eta = eta0;
  a.forEach((aj, i) => { const j = 2 * (i + 1); xi += aj * Math.sin(j * xi0) * Math.cosh(j * eta0); eta += aj * Math.cos(j * xi0) * Math.sinh(j * eta0); });
  const este = 500000 + K0 * A * eta;
  const norte = K0 * A * xi + (lat < 0 ? 10000000 : 0);
  return { este, norte, zona, sur: lat < 0 };
}

const areaPlano = (pts) => Math.abs(pts.reduce((s, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + x * y2 - x2 * y; }, 0)) / 2;

// Valida el cuerpo y devuelve { contorno, dias, scl } o un mensaje de error.
export function leerPedido(cuerpo) {
  const c = cuerpo?.contorno;
  if (!Array.isArray(c) || c.length < 3 || c.length > MAX_PUNTOS) return { error: `El lote necesita entre 3 y ${MAX_PUNTOS} puntos.` };
  const contorno = c.map((p) => (Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === 'number' && Number.isFinite(x)) && Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180 ? [p[0], p[1]] : null));
  if (contorno.some((p) => !p)) return { error: 'El contorno del lote trae puntos inválidos.' };
  const dias = Number.isInteger(cuerpo.dias) ? Math.min(DIAS.max, Math.max(DIAS.min, cuerpo.dias)) : DIAS.defecto;
  const scl = Array.isArray(cuerpo.scl) && cuerpo.scl.length <= 12 && cuerpo.scl.every((x) => Number.isInteger(x) && x >= 0 && x <= 11) ? [...new Set(cuerpo.scl)] : SCL_DEFECTO;
  return { contorno, dias, scl };
}

// El contorno [[lat, lon], …] en UTM, cerrado, con su área en hectáreas.
export function geometriaUtm(contorno) {
  const lonMedia = contorno.reduce((s, p) => s + p[1], 0) / contorno.length;
  const latMedia = contorno.reduce((s, p) => s + p[0], 0) / contorno.length;
  const zona = zonaUtm(lonMedia);
  const xy = contorno.map(([la, lo]) => { const u = aUtm(la, lo, zona); return [Math.round(u.este * 100) / 100, Math.round(u.norte * 100) / 100]; });
  const anillo = [...xy, xy[0]];
  return {
    ha: areaPlano(xy) / 10000,
    crs: `http://www.opengis.net/def/crs/EPSG/0/${latMedia < 0 ? 327 : 326}${String(zona).padStart(2, '0')}`,
    geometry: { type: 'Polygon', coordinates: [anillo] },
  };
}

// NDVI = (B08 − B04) / (B08 + B04) (Rouse et al. 1974). Un píxel cuenta solo si tiene dato y su clase SCL no está descartada.
export function evalscript(scl) {
  return `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "SCL", "dataMask"] }],
    output: [{ id: "ndvi", bands: 1, sampleType: "FLOAT32" }, { id: "dataMask", bands: 1 }]
  };
}
const EXCLUIR = [${scl.join(', ')}];
function evaluatePixel(s) {
  const suma = s.B08 + s.B04;
  const ndvi = suma > 0 ? (s.B08 - s.B04) / suma : 0;
  const valido = s.dataMask === 1 && suma > 0 && EXCLUIR.indexOf(s.SCL) === -1 ? 1 : 0;
  return { ndvi: [ndvi], dataMask: [valido] };
}`;
}

export function pedidoEstadisticas(geo, { dias, scl }, hoy = new Date()) {
  const hasta = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() + 1));
  const desde = new Date(hasta.getTime() - dias * 86400000);
  return {
    input: {
      bounds: { geometry: geo.geometry, properties: { crs: geo.crs } },
      data: [{ type: 'sentinel-2-l2a', dataFilter: { mosaickingOrder: 'leastCC' } }],
    },
    aggregation: {
      timeRange: { from: desde.toISOString().slice(0, 19) + 'Z', to: hasta.toISOString().slice(0, 19) + 'Z' },
      aggregationInterval: { of: 'P1D' },
      lastIntervalBehavior: 'SHORTEN',
      evalscript: evalscript(scl),
      resx: 10,
      resy: 10,
    },
  };
}

const r3 = (x) => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null);

// Respuesta de Copernicus → serie por fecha. `validos` = píxeles con dato ÷ píxeles de 10 m que caben en el lote.
export function serieDesde(respuesta, ha) {
  const esperados = Math.max(1, Math.round(ha * 100));
  return (Array.isArray(respuesta?.data) ? respuesta.data : [])
    .filter((d) => !d?.error && d?.outputs?.ndvi?.bands?.B0?.stats)
    .map((d) => {
      const s = d.outputs.ndvi.bands.B0.stats;
      const conDato = Math.max(0, (Number(s.sampleCount) || 0) - (Number(s.noDataCount) || 0));
      return { fecha: String(d.interval?.from ?? '').slice(0, 10), media: r3(s.mean), min: r3(s.min), max: r3(s.max), desv: r3(s.stDev), validos: Math.min(1, r3(conDato / esperados)) };
    })
    .filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.fecha))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// Token de Copernicus en memoria mientras la función siga viva; se pide de nuevo un minuto antes de vencer.
const tokenGuardado = { valor: '', vence: 0 };
export function olvidarToken() { tokenGuardado.valor = ''; tokenGuardado.vence = 0; }
async function tokenCdse(id, secreto, fetchFn, ahora) {
  if (tokenGuardado.valor && ahora < tokenGuardado.vence) return tokenGuardado.valor;
  const r = await fetchFn(URL_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secreto }).toString(),
  });
  if (!r.ok) throw Object.assign(new Error('token'), { status: r.status });
  const o = await r.json();
  if (typeof o?.access_token !== 'string' || !o.access_token) throw Object.assign(new Error('token'), { status: 502 });
  const seg = Number(o.expires_in) > 0 ? Number(o.expires_in) : 300;
  tokenGuardado.valor = o.access_token; tokenGuardado.vence = ahora + Math.max(0, seg - 60) * 1000;
  return o.access_token;
}

export async function handleNdvi(request, { env = globalThis.Deno?.env, fetchFn = globalThis.fetch, ahora = () => Date.now() } = {}) {
  const origen = request.headers.get('Origin') || '';
  const permitido = ORIGENES.has(origen);
  const cors = {
    'Access-Control-Allow-Origin': permitido ? origen : 'https://trofaxis.github.io',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (!permitido) return error(403, 'No se pudo verificar el origen de la solicitud.', cors);
  if (request.method !== 'POST') return error(405, 'Usa una solicitud válida.', cors);

  const token = (request.headers.get('Authorization') || '').match(/^Bearer\s+([^\s]+)$/i)?.[1];
  if (!token) return error(401, 'Inicia sesión para ver el NDVI del lote.', cors);

  let cuerpo;
  try { cuerpo = await request.json(); } catch { return error(400, 'La solicitud no trae el contorno del lote.', cors); }
  const pedido = leerPedido(cuerpo);
  if (pedido.error) return error(400, pedido.error, cors);
  const geo = geometriaUtm(pedido.contorno);
  if (!(geo.ha > 0.01)) return error(400, 'El lote es demasiado pequeño para una imagen de 10 m.', cors);
  if (geo.ha > MAX_HA) return error(400, `El lote mide más de ${MAX_HA} ha. Divide el área en lotes más pequeños.`, cors);

  const url = String(valorEnv(env, 'SUPABASE_URL') || '').replace(/\/$/, '');
  const clavePublica = valorEnv(env, 'SUPABASE_ANON_KEY') || valorEnv(env, 'SUPABASE_PUBLISHABLE_KEY');
  const id = valorEnv(env, 'CDSE_CLIENT_ID'), secreto = valorEnv(env, 'CDSE_CLIENT_SECRET');
  if (!url || !clavePublica || !id || !secreto) return error(503, 'El NDVI todavía no está configurado en el servidor.', cors);

  // Solo personas con sesión: la cuota de Copernicus es de la cuenta de Trofaxis.
  try {
    const v = await fetchFn(`${url}/auth/v1/user`, { headers: { apikey: clavePublica, Authorization: `Bearer ${token}` } });
    if (!v.ok) return [400, 401, 403].includes(v.status) ? error(401, 'Tu sesión venció. Inicia sesión de nuevo.', cors) : error(503, 'No se pudo verificar tu sesión. Inténtalo más tarde.', cors);
    const u = await v.json();
    if (typeof u?.id !== 'string' || !u.id) return error(401, 'No se pudo verificar tu sesión.', cors);
  } catch {
    return error(503, 'No se pudo verificar tu sesión. Inténtalo más tarde.', cors);
  }

  const cuerpoCdse = pedidoEstadisticas(geo, pedido, new Date(ahora()));
  try {
    let acceso = await tokenCdse(id, secreto, fetchFn, ahora());
    const pedir = (t) => fetchFn(URL_ESTADISTICAS, { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(cuerpoCdse) });
    let r = await pedir(acceso);
    if (r.status === 401) { olvidarToken(); acceso = await tokenCdse(id, secreto, fetchFn, ahora()); r = await pedir(acceso); }
    if (r.status === 429) return error(429, 'Copernicus está recibiendo muchas solicitudes. Inténtalo en un minuto.', cors);
    if (!r.ok) return error(502, `Copernicus respondió con el error ${r.status}.`, cors);
    const serie = serieDesde(await r.json(), geo.ha);
    return json(200, { desde: cuerpoCdse.aggregation.timeRange.from.slice(0, 10), hasta: cuerpoCdse.aggregation.timeRange.to.slice(0, 10), ha: Math.round(geo.ha * 100) / 100, serie }, cors);
  } catch (e) {
    if (e?.message === 'token') return error(502, 'No se pudo entrar a Copernicus. Revisa el cliente OAuth en los secretos de Supabase.', cors);
    return error(502, 'No se pudo consultar Copernicus. Inténtalo más tarde.', cors);
  }
}
