// Vista de lotes (fase A): lotes como polígonos en este dispositivo, clima de ahora de Open-Meteo y la tarjeta de cada lote.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const { CONFIG } = await import('../src/core/config.js');
const { normalizarUbicacion, ubicacionVacia, hayDatosPropios, importarUbicacion, exportarUbicacion } = await import('../src/mapa/ubicacion.js');
const { centroide, puntoEnPoligono, loteEn, siguienteIdLote, puntoClima, lugarClima, resumenLote } = await import('../src/mapa/lotes.js');
const { urlAhora, climaAhoraDesde, describirTiempo, rumbo, obtenerAhora, leerAhoraCache, VARIABLES_AHORA } = await import('../src/clima/ahora.js');
const { tarjetaClima, tarjetaLote, listaLotes } = await import('../src/ui/lotes.js');
const { S, demoFarm, emptyFarm } = await import('../src/core/state.js');
const { viewLotes } = await import('../src/ui/vista-lotes.js');
const { GRUPOS } = await import('../src/ui/grupos.js');

// Un cuadrado de ~1 ha cerca de Zamorano y otro más pequeño dentro.
const grande = [[14.01, -87.01], [14.01, -87.009], [14.009, -87.009], [14.009, -87.01]];
const chico = [[14.0097, -87.0097], [14.0097, -87.0093], [14.0093, -87.0093], [14.0093, -87.0097]];
const memoria = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), m }; };
const respuesta = (cuerpo, ok = true, status = 200) => ({ ok, status, json: async () => cuerpo });
const OM = {
  current: { time: '2026-11-14T10:45', temperature_2m: 27.4, relative_humidity_2m: 71, precipitation: 0, cloud_cover: 40, wind_speed_10m: 9.5, wind_direction_10m: 85, weather_code: 2 },
  current_units: { wind_speed_10m: 'km/h' },
  daily: { time: ['2026-11-14'], precipitation_sum: [3.2] },
};

test('los lotes se normalizan: 3 puntos mínimo, nombre por defecto, sin ids repetidos y con tope', () => {
  const u = normalizarUbicacion({ lotes: [
    { id: 'L1', nombre: '  Lote norte  ', cultivo: 'Café', contorno: grande },
    { id: 'L2', contorno: [[14, -87], [14.1, -87]] }, // 2 puntos: se descarta
    { id: 'L1', nombre: 'repetido', contorno: chico }, // id repetido: se descarta
    { id: 'L3', nombre: 'x'.repeat(80), contorno: [...chico, [999, 0]] }, // punto inválido fuera, quedan 4
    { contorno: chico },
  ] });
  assert.deepEqual(u.lotes.map((l) => l.id), ['L1', 'L3', '5']);
  assert.equal(u.lotes[0].nombre, 'Lote norte');
  assert.equal(u.lotes[1].nombre.length, 40);
  assert.equal(u.lotes[1].contorno.length, 4);
  assert.equal(u.lotes[2].nombre, 'Lote 5');
  const muchos = Array.from({ length: CONFIG.mapa.maxLotes + 5 }, (_, i) => ({ id: `L${i + 1}`, contorno: chico }));
  assert.equal(normalizarUbicacion({ lotes: muchos }).lotes.length, CONFIG.mapa.maxLotes);
  assert.deepEqual(normalizarUbicacion({ punto: [14, -87] }).lotes, [], 'un mapa guardado antes de los lotes sigue cargando');
  assert.deepEqual(ubicacionVacia().lotes, []);
});

test('un respaldo con solo lotes cuenta como datos propios y se puede importar', () => {
  const u = { ...ubicacionVacia(), lotes: [{ id: 'L1', nombre: 'A', cultivo: '', contorno: grande }] };
  assert.ok(hayDatosPropios(u));
  assert.ok(hayDatosPropios({ ...u, ejemplo: true }), 'los lotes dibujados sobre el ejemplo son de la persona');
  assert.equal(hayDatosPropios(ubicacionVacia()), false);
  assert.deepEqual(importarUbicacion(exportarUbicacion(u)).lotes, u.lotes);
});

test('geometría de lotes: centro, punto dentro, el lote más pequeño y el siguiente id', () => {
  const [la, lo] = centroide(grande);
  assert.ok(Math.abs(la - 14.0095) < 1e-9 && Math.abs(lo + 87.0095) < 1e-9);
  assert.equal(centroide([]), null);
  assert.ok(puntoEnPoligono([14.0095, -87.0095], grande));
  assert.equal(puntoEnPoligono([14.02, -87.0095], grande), false);
  const lotes = [{ id: 'G', contorno: grande }, { id: 'C', contorno: chico }];
  assert.equal(loteEn([14.0095, -87.0095], lotes).id, 'C', 'dentro de los dos: gana el de adentro');
  assert.equal(loteEn([14.0099, -87.0099], lotes).id, 'G');
  assert.equal(loteEn([15, -86], lotes), null);
  assert.equal(siguienteIdLote([]), 'L1');
  assert.equal(siguienteIdLote([{ id: 'L2' }]), 'L3');
  assert.equal(siguienteIdLote([{ id: 'L1' }, { id: 'L3' }]), 'L4', 'no repite un id aunque se haya borrado uno');
});

test('el clima se pide en el lote elegido, si no en la finca, su contorno o el primer lote', () => {
  const lotes = [{ id: 'L1', contorno: grande }, { id: 'L2', contorno: chico }];
  assert.deepEqual(puntoClima({ punto: [14.5, -86.5], contorno: [], lotes }, 'L2'), centroide(chico));
  assert.deepEqual(puntoClima({ punto: [14.5, -86.5], contorno: [], lotes }, null), [14.5, -86.5]);
  assert.deepEqual(puntoClima({ punto: null, contorno: grande, lotes }, null), centroide(grande));
  assert.deepEqual(puntoClima({ punto: null, contorno: [], lotes }, 'no-existe'), centroide(grande));
  assert.equal(puntoClima(ubicacionVacia(), null), null);
  const nombrados = [{ id: 'L1', nombre: 'Norte', contorno: grande }, { id: 'L2', nombre: 'Río', contorno: chico }];
  assert.equal(lugarClima({ punto: [14.5, -86.5], contorno: [], lotes: nombrados }, 'L2'), 'Río');
  assert.equal(lugarClima({ punto: [14.5, -86.5], contorno: [], lotes: nombrados }, null), 'la finca');
  assert.equal(lugarClima({ punto: null, contorno: [], lotes: nombrados }, null), 'Norte');
});

test('la tarjeta del lote junta lo que la app sabe: cultivo del lote y actividades de la finca, por separado', () => {
  const finca = { cultivos: [{ nombre: 'Café', siembra: [5], cosecha: [10, 11] }], plaguicidas: [{ producto: 'Imidacloprid', meses: [10] }, { producto: '', meses: [10] }, { producto: 'Otro', meses: [3] }], fertMeses: [10] };
  const r = resumenLote({ cultivo: 'cafe', contorno: grande }, finca, 10);
  assert.equal(r.cultivo.nombre, 'Café', 'sin importar tildes ni mayúsculas');
  assert.deepEqual(r.delLote, ['Cosecha de Café']);
  assert.deepEqual(r.deFinca, ['2 aplicación(es) de plaguicida: Imidacloprid, sin nombre', 'Fertilización']);
  assert.ok(r.area > 1 && r.area < 1.3, `área ${r.area}`);
  const otro = resumenLote({ cultivo: 'Cacao', contorno: grande }, finca, 3);
  assert.equal(otro.cultivoSinRegistro, true);
  assert.deepEqual(otro.delLote, []);
  assert.equal(resumenLote({ cultivo: '', contorno: grande }, finca, 0).cultivoSinRegistro, false);
});

test('la URL del clima de ahora va al pronóstico de Open-Meteo con las coordenadas redondeadas a 2 decimales', () => {
  const u = new URL(urlAhora(14.012345, -87.006789));
  assert.equal(u.origin + u.pathname, 'https://api.open-meteo.com/v1/forecast');
  assert.equal(u.searchParams.get('latitude'), '14.01');
  assert.equal(u.searchParams.get('longitude'), '-87.01');
  assert.deepEqual(u.searchParams.get('current').split(','), VARIABLES_AHORA);
  assert.equal(u.searchParams.get('daily'), 'precipitation_sum');
  assert.doesNotMatch(u.href, /012345|006789/, 'nunca la coordenada exacta');
});

test('la respuesta de Open-Meteo se lee y se describe en español', () => {
  const d = climaAhoraDesde(OM, new Date('2026-11-14T16:50:00Z'));
  assert.equal(d.hora, '10:45');
  assert.equal(d.temp, 27.4);
  assert.equal(d.lluviaHoy, 3.2);
  assert.equal(d.vientoUnidad, 'km/h');
  assert.throws(() => climaAhoraDesde({}), /no devolvió el clima de ahora/);
  assert.equal(describirTiempo(2), 'Parcialmente nublado');
  assert.equal(describirTiempo(95), 'Tormenta');
  assert.equal(describirTiempo(1234), 'Sin descripción');
  assert.equal(rumbo(0), 'norte');
  assert.equal(rumbo(85), 'este');
  assert.equal(rumbo(225), 'suroeste');
  assert.equal(rumbo(350), 'norte');
  assert.equal(rumbo(-90), 'oeste');
  assert.equal(rumbo(null), '');
});

test('el clima de ahora se guarda 30 min; sin conexión se muestra el último con aviso', async () => {
  const almacen = memoria();
  let llamadas = 0;
  const bien = async (url) => { llamadas++; assert.match(url, /latitude=14\.01/); return respuesta(OM); };
  const t0 = new Date('2026-11-14T16:50:00Z');
  const a = await obtenerAhora(14.0101, -87.0101, { fetchFn: bien, ahora: t0, almacen });
  assert.equal(a.deCache, false);
  const b = await obtenerAhora(14.0102, -87.0102, { fetchFn: bien, ahora: new Date(t0.getTime() + 10 * 60000), almacen });
  assert.equal(b.deCache, true, 'mismo punto redondeado y dentro de 30 min: no se vuelve a pedir');
  assert.equal(llamadas, 1);
  const tarde = new Date(t0.getTime() + 45 * 60000);
  assert.equal(leerAhoraCache(14.01, -87.01, tarde, almacen).vencida, true);
  const sinRed = async () => { throw new TypeError('Failed to fetch'); };
  const c = await obtenerAhora(14.01, -87.01, { fetchFn: sinRed, ahora: tarde, almacen });
  assert.equal(c.deCache, true);
  assert.match(c.aviso, /Sin conexión.*las 10:45/);
  await assert.rejects(obtenerAhora(15, -86, { fetchFn: sinRed, ahora: tarde, almacen }), /Sin conexión con el servicio de clima/);
  await assert.rejects(obtenerAhora(15, -86, { fetchFn: async () => respuesta({}, false, 429), ahora: tarde, almacen }), /error 429/);
  await assert.rejects(obtenerAhora(15, -86, { fetchFn: async () => respuesta({ error: true }), ahora: tarde, almacen }), /no devolvió/);
  assert.doesNotMatch([...almacen.m.values()].join(), /14\.0101/, 'la caché tampoco guarda la coordenada exacta');
});

test('las tarjetas escapan el texto, no muestran coordenadas y dicen de dónde sale cada dato', () => {
  const clima = tarjetaClima({ estado: 'listo', lugar: 'Lote <1>', datos: { ...climaAhoraDesde(OM), lluviaHoy: null } });
  assert.match(clima, /27°C/);
  assert.match(clima, /Ahora en Lote &lt;1&gt; · 10:45/);
  assert.match(clima, /Lluvia hoy<\/dt><dd>—<\/dd>/, 'sin dato: una raya, sin unidad');
  assert.match(clima, /no una estación en el lote/);
  assert.match(tarjetaClima({ estado: 'error', msg: '<b>x</b>' }), /&lt;b&gt;x&lt;\/b&gt;.*data-mapa="clima-ahora"/s);
  assert.match(tarjetaClima({ estado: 'sin-punto' }), /Marca la ubicación/);
  const lote = { id: 'L1', nombre: '<img src=x onerror=alert(1)>', cultivo: 'Café', contorno: grande };
  const r = resumenLote(lote, { cultivos: [{ nombre: 'Café', siembra: [], cosecha: [10] }], plaguicidas: [{ producto: 'X', meses: [10] }], fertMeses: [] }, 10);
  const html = tarjetaLote(lote, r, { mes: 10, cultivos: ['Café', 'Cacao'], riesgo: { texto: 'medio, 52 de 100' } });
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /En noviembre/);
  assert.match(html, /Cosecha de Café/);
  assert.match(html, /se registran por finca, no por lote/);
  assert.match(html, /Riesgo de la finca: <b>medio, 52 de 100<\/b>.*se calcula por finca/s);
  assert.match(html, /<option selected>Café<\/option>/);
  assert.doesNotMatch(html, /14\.0|87\.0/, 'la tarjeta no muestra coordenadas');
  assert.match(listaLotes([], null), /Todavía no hay lotes/);
  assert.match(listaLotes([lote], 'L1'), /aria-pressed="true".*&lt;img/s);
});

test('Lotes está en «Mi finca» y la vista se dibuja con el mapa, el clima y el índice de la finca', () => {
  assert.ok(GRUPOS.find((g) => g.id === 'finca').vistas.some(([id]) => id === 'lotes'));
  const antes = { farm: S.farm, demo: S.demo };
  try {
    S.farm = demoFarm(); S.demo = true;
    const html = viewLotes();
    assert.match(html, /id="mapa-finca"/);
    assert.match(html, /id="lotes-clima"/);
    assert.match(html, /data-mapa="modo-lote"/);
    assert.match(html, /<b>Ejemplo:<\/b>/);
    assert.match(html, /no se suben a la nube/);
    S.farm = emptyFarm(); S.demo = false;
    assert.doesNotMatch(viewLotes(), /<b>Ejemplo:<\/b>/);
  } finally { S.farm = antes.farm; S.demo = antes.demo; }
});
