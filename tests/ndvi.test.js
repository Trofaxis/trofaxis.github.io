// NDVI por lote: función «ndvi» de Supabase (Copernicus Statistical API), cliente de la app, caché y tarjeta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const E = await import('../supabase/functions/ndvi/handler.js');
const { utmALatLon, areaHa } = await import('../src/mapa/geo.js');
const { CONFIG } = await import('../src/core/config.js');
const { pedirNdvi, resumenNdvi, leerNdviCache, guardarNdviCache, huellaContorno } = await import('../src/nube/ndvi.js');
const { bloqueNdvi, tarjetaLote } = await import('../src/ui/lotes.js');
const { resumenLote } = await import('../src/mapa/lotes.js');

const lote1ha = [[14.01, -87.01], [14.01, -87.009], [14.009, -87.009], [14.009, -87.01]];
const env = new Map([
  ['SUPABASE_URL', 'https://proyecto-ficticio.supabase.co'],
  ['SUPABASE_ANON_KEY', 'clave-publica-ficticia'],
  ['CDSE_CLIENT_ID', 'cliente-ficticio'],
  ['CDSE_CLIENT_SECRET', 'secreto-ficticio'],
]);
const pedido = (cuerpo, { origen = 'https://trofaxis.github.io', token = 'jwt-ficticio' } = {}) => new Request('https://proyecto-ficticio.supabase.co/functions/v1/ndvi', {
  method: 'POST',
  headers: { Origin: origen, ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
  body: JSON.stringify(cuerpo),
});
const stats = (from, mean, sampleCount, noDataCount) => ({ interval: { from: `${from}T00:00:00Z`, to: `${from}T23:59:59Z` }, outputs: { ndvi: { bands: { B0: { stats: { min: mean - 0.2, max: mean + 0.1, mean, stDev: 0.05, sampleCount, noDataCount } } } } } });
const respCdse = { status: 'OK', data: [stats('2026-10-20', 0.55, 130, 10), stats('2026-10-25', 0.2, 130, 100), stats('2026-11-04', 0.63, 130, 12)] };

// fetch falso que imita Supabase Auth, el token de Copernicus y la Statistical API.
function falso({ auth = 200, token = 200, cdse = 200, cuerpoCdse = respCdse } = {}) {
  const llamadas = [];
  const fetchFn = async (url, op = {}) => {
    llamadas.push({ url, op });
    if (url.endsWith('/auth/v1/user')) return new Response(JSON.stringify({ id: 'usuario-ficticio' }), { status: auth });
    if (url === E.URL_TOKEN) return new Response(JSON.stringify({ access_token: 'token-cdse', expires_in: 600 }), { status: token });
    if (url === E.URL_ESTADISTICAS) return new Response(JSON.stringify(cuerpoCdse), { status: cdse });
    throw new Error(`URL inesperada ${url}`);
  };
  return { fetchFn, llamadas };
}

test('grados → UTM coincide con la conversión inversa de la app (error menor a 1 cm)', () => {
  for (const [la, lo] of [[14.01, -87.003], [13.2, -85.9], [15.5, -88.9], [12.1, -86.3]]) {
    const u = E.aUtm(la, lo);
    assert.equal(u.zona, lo < -84 ? 16 : 17);
    const g = utmALatLon(u.este, u.norte, u.zona);
    assert.ok(Math.abs(g.lat - la) < 1e-7 && Math.abs(g.lon - lo) < 1e-7, `${la},${lo} → ${g.lat},${g.lon}`);
  }
  const geo = E.geometriaUtm(lote1ha);
  assert.equal(geo.crs, 'http://www.opengis.net/def/crs/EPSG/0/32616');
  assert.ok(Math.abs(geo.ha - areaHa(lote1ha)) / geo.ha < 0.01, 'el área en UTM coincide con la del mapa');
  const anillo = geo.geometry.coordinates[0];
  assert.deepEqual(anillo[0], anillo.at(-1), 'el anillo va cerrado');
});

test('el pedido a Copernicus: Sentinel-2 L2A, 10 m, un intervalo por día y nubes fuera según la configuración', () => {
  const p = E.leerPedido({ contorno: lote1ha, dias: 60, scl: CONFIG.ndvi.scl });
  const c = E.pedidoEstadisticas(E.geometriaUtm(p.contorno), p, new Date('2026-11-14T17:00:00Z'));
  assert.equal(c.input.data[0].type, 'sentinel-2-l2a');
  assert.equal(c.aggregation.aggregationInterval.of, 'P1D');
  assert.equal(c.aggregation.resx, 10);
  assert.deepEqual(c.aggregation.timeRange, { from: '2026-09-16T00:00:00Z', to: '2026-11-15T00:00:00Z' });
  assert.match(c.aggregation.evalscript, /\(s\.B08 - s\.B04\) \/ suma/);
  assert.match(c.aggregation.evalscript, /const EXCLUIR = \[0, 1, 3, 8, 9, 10, 11\];/);
  assert.match(c.aggregation.evalscript, /id: "dataMask"/, 'la Statistical API exige la salida dataMask');
  // Límites del pedido: días acotados, clases SCL solo enteros 0–11, puntos válidos.
  assert.equal(E.leerPedido({ contorno: lote1ha, dias: 999 }).dias, 120);
  assert.deepEqual(E.leerPedido({ contorno: lote1ha, scl: ['3); fetch("x'] }).scl, [0, 1, 3, 8, 9, 10, 11], 'no se puede inyectar código en el evalscript');
  assert.match(E.leerPedido({ contorno: [[1, 2], [3, 4]] }).error, /entre 3 y 200/);
  assert.match(E.leerPedido({ contorno: [[1, 2], [3, 4], [95, 0]] }).error, /inválidos/);
});

test('la respuesta de Copernicus se vuelve una serie por fecha con la fracción del lote sin nubes', () => {
  const s = E.serieDesde({ data: [...respCdse.data, { interval: { from: '2026-11-01T00:00:00Z' }, error: { type: 'EXECUTION_ERROR' } }] }, 1.2);
  assert.deepEqual(s.map((x) => x.fecha), ['2026-10-20', '2026-10-25', '2026-11-04']);
  assert.equal(s[0].validos, 1, '120 píxeles con dato de 120 que caben en 1,2 ha');
  assert.equal(s[1].validos, 0.25);
  assert.equal(s[2].media, 0.63);
  assert.deepEqual(E.serieDesde({}, 1), []);
});

test('la función exige origen permitido y sesión, verifica la sesión y no responde con el contorno', async () => {
  E.olvidarToken();
  assert.equal((await E.handleNdvi(new Request('https://x/functions/v1/ndvi', { method: 'OPTIONS', headers: { Origin: 'https://localhost' } }), { env, fetchFn: async () => { throw new Error('sin red'); } })).status, 204);
  assert.equal((await E.handleNdvi(pedido({ contorno: lote1ha }, { origen: 'https://otro.sitio' }), { env, ...falso() })).status, 403);
  assert.equal((await E.handleNdvi(pedido({ contorno: lote1ha }, { token: '' }), { env, ...falso() })).status, 401);
  assert.equal((await E.handleNdvi(pedido({ contorno: lote1ha }), { env, ...falso({ auth: 401 }) })).status, 401);
  assert.equal((await E.handleNdvi(pedido({ contorno: lote1ha }), { env: new Map([['SUPABASE_URL', 'x']]), ...falso() })).status, 503, 'sin secretos de Copernicus');
  const grande = [[14, -87.2], [14, -86.8], [14.4, -86.8], [14.4, -87.2]];
  assert.match(await (await E.handleNdvi(pedido({ contorno: grande }), { env, ...falso() })).text(), /más de 1000 ha/);

  const f = falso();
  const r = await E.handleNdvi(pedido({ contorno: lote1ha, dias: 60, scl: CONFIG.ndvi.scl }), { env, fetchFn: f.fetchFn, ahora: () => Date.parse('2026-11-14T17:00:00Z') });
  assert.equal(r.status, 200);
  const o = await r.json();
  assert.equal(o.serie.length, 3);
  assert.equal(o.desde, '2026-09-16');
  assert.doesNotMatch(JSON.stringify(o), /14\.01|87\.0|coordinates/, 'la respuesta no devuelve el contorno');
  assert.deepEqual(f.llamadas.map((x) => x.url), ['https://proyecto-ficticio.supabase.co/auth/v1/user', E.URL_TOKEN, E.URL_ESTADISTICAS]);
  assert.match(f.llamadas[1].op.body, /grant_type=client_credentials/);
  assert.equal(f.llamadas[2].op.headers.Authorization, 'Bearer token-cdse');

  // El token de Copernicus se reutiliza mientras no venza.
  const f2 = falso();
  await E.handleNdvi(pedido({ contorno: lote1ha }), { env, fetchFn: f2.fetchFn, ahora: () => Date.parse('2026-11-14T17:01:00Z') });
  assert.equal(f2.llamadas.some((x) => x.url === E.URL_TOKEN), false);
  E.olvidarToken();
  assert.equal((await E.handleNdvi(pedido({ contorno: lote1ha }), { env, ...falso({ token: 401 }) })).status, 502);
  E.olvidarToken();
  assert.equal((await E.handleNdvi(pedido({ contorno: lote1ha }), { env, ...falso({ cdse: 429 }) })).status, 429);
});

test('el cliente llama a la función con la sesión y traduce los errores', async () => {
  let visto;
  const ok = await pedirNdvi(lote1ha, { token: 't' }, { fetchFn: async (url, op) => { visto = { url, op }; return new Response(JSON.stringify({ desde: 'a', hasta: 'b', serie: [] }), { status: 200 }); } });
  assert.deepEqual(ok.serie, []);
  assert.equal(visto.url, `${CONFIG.nube.url}/functions/v1/ndvi`);
  assert.equal(visto.op.headers.Authorization, 'Bearer t');
  assert.deepEqual(JSON.parse(visto.op.body).scl, CONFIG.ndvi.scl);
  await assert.rejects(pedirNdvi(lote1ha, null), /Inicia sesión/);
  await assert.rejects(pedirNdvi(lote1ha, { token: 't' }, { fetchFn: async () => new Response('{}', { status: 404 }) }), /todavía no está activado/);
  await assert.rejects(pedirNdvi(lote1ha, { token: 't' }, { fetchFn: async () => new Response(JSON.stringify({ error: 'El lote mide más de 1000 ha.' }), { status: 400 }) }), /1000 ha/);
  await assert.rejects(pedirNdvi(lote1ha, { token: 't' }, { fetchFn: async () => { throw new TypeError('x'); } }), /Sin conexión/);
});

test('resumen: la última fecha despejada, la anterior y si sube, baja o se mantiene', () => {
  const serie = E.serieDesde(respCdse, 1.2);
  const r = resumenNdvi(serie);
  assert.equal(r.utiles.length, 2, 'la fecha con 25 % del lote visible no cuenta');
  assert.equal(r.ultima.fecha, '2026-11-04');
  assert.equal(r.previa.fecha, '2026-10-20');
  assert.equal(r.cambio, 0.08);
  assert.equal(r.tendencia, 'sube');
  assert.equal(resumenNdvi([{ fecha: '2026-11-01', media: 0.5, validos: 1 }, { fecha: '2026-11-06', media: 0.52, validos: 1 }]).tendencia, 'estable');
  assert.equal(resumenNdvi([]).ultima, null);
});

test('la caché guarda el NDVI por lote (no el contorno) y vence a las 24 h', () => {
  const m = new Map(), almacen = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
  const lote = { id: 'L1', contorno: lote1ha };
  const t0 = new Date('2026-11-14T17:00:00Z');
  guardarNdviCache(lote, { desde: 'a', hasta: 'b', serie: [{ fecha: '2026-11-04', media: 0.6, validos: 1 }] }, t0, almacen);
  assert.ok(leerNdviCache(lote, new Date(t0.getTime() + 3600000), almacen));
  assert.equal(leerNdviCache(lote, new Date(t0.getTime() + 25 * 3600000), almacen), null);
  assert.equal(leerNdviCache({ id: 'L1', contorno: [...lote1ha, [14.0095, -87.0101]] }, t0, almacen), null, 'otro contorno con el mismo id no reutiliza el NDVI');
  assert.doesNotMatch([...m.values()].join(), /14\.01|87\.0/);
  assert.notEqual(huellaContorno(lote1ha), huellaContorno([...lote1ha].reverse()));
});

test('el bloque del NDVI en la tarjeta: pide permiso con un botón, avisa qué sale y explica el valor', () => {
  assert.match(bloqueNdvi({ estado: 'sin-sesion' }), /Inicia sesión/);
  const inicial = bloqueNdvi({ estado: 'inicial' });
  assert.match(inicial, /data-mapa="ndvi"/);
  assert.match(inicial, /se envía el contorno de este lote a Copernicus/);
  assert.match(bloqueNdvi({ estado: 'error', msg: '<b>x</b>' }), /&lt;b&gt;.*Reintentar/s);
  const listo = bloqueNdvi({ estado: 'listo', datos: { desde: '2026-09-16', hasta: '2026-11-15', serie: E.serieDesde(respCdse, 1.2) } });
  assert.match(listo, /<b class="lc-ndvi">0.63<\/b> el 4 de noviembre/);
  assert.match(listo, /sube \+0.08<\/span> desde el 20 de octubre/);
  assert.match(listo, /2 de 3 imagen\(es\) con el lote despejado/);
  assert.match(listo, /<svg class="lc-linea"/);
  assert.match(listo, /No dice por sí solo la causa/);
  assert.match(bloqueNdvi({ estado: 'listo', datos: { desde: '2026-09-16', hasta: '2026-11-15', serie: [] } }), /No hubo imágenes con el lote despejado/);
  const lote = { id: 'L1', nombre: 'A', cultivo: '', contorno: lote1ha };
  assert.match(tarjetaLote(lote, resumenLote(lote, { cultivos: [] }, 10), { mes: 10, ndvi: { estado: 'inicial' } }), /NDVI del lote/);
});

test('la política de privacidad y la documentación explican el NDVI y Copernicus', () => {
  const pol = fs.readFileSync('privacidad/index.html', 'utf8');
  assert.match(pol, /Copernicus Data Space/);
  assert.match(pol, /contorno del lote/);
  const doc = fs.readFileSync('docs/lotes.md', 'utf8');
  assert.match(doc, /CDSE_CLIENT_ID/);
  assert.match(doc, /supabase functions deploy ndvi/);
});
