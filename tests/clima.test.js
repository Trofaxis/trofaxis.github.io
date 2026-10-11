// Pruebas del clima por ubicación (Issue #8, crítica 3): promedios por mes, llenado automático, caché y avisos.
// La respuesta de Open-Meteo se simula con datos sintéticos de resultado conocido (el servicio no se llama aquí).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  periodo, urlClima, factorViento2m, percentil, normalesDesdeDiario, unirHorario, climaDesdeRespuesta,
  mesesLluviosos, normalizarClima, llenarRiego, climaDeMeses, climaVacio,
} from '../src/clima/normales.js';
import { obtenerClima, ErrorClima } from '../src/clima/servicio.js';
import { avisosClimaTipico, revisarAplicacion } from '../src/plag/calculo.js';
import { normalizarFinca, exportarTexto } from '../src/core/storage.js';
import { emptyFarm, demoFarm } from '../src/core/state.js';
import { riegoVacio } from '../src/riego/calculo.js';
import { plagVacio } from '../src/plag/modelo.js';
import { evaluar } from '../src/core/engine.js';
import { CONFIG } from '../src/core/config.js';

const cerca = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

// Serie diaria sintética 2016-2025: cada mes m tiene valores fijos, así el promedio se conoce de antemano.
//   tmed = 20 + m/2; tmax = tmed + 6; tmin = tmed − 6; hr = 60 + m; viento a 10 m = 10 km/h;
//   ETo = 3 + m/10 (alterna ±0.5 para que el percentil 90 no sea igual a la media); radiación = 15 + m;
//   lluvia = 5 mm/día de mayo a octubre y 0.5 mm/día el resto.
function respuesta({ desde = 2016, hasta = 2025, sinMedias = false, hueco = null } = {}) {
  const d = { time: [] };
  const vars = ['temperature_2m_mean', 'temperature_2m_max', 'temperature_2m_min', 'relative_humidity_2m_mean', 'precipitation_sum',
    'wind_speed_10m_mean', 'et0_fao_evapotranspiration', 'shortwave_radiation_sum'];
  for (const v of vars) d[v] = [];
  for (let t = Date.UTC(desde, 0, 1); t <= Date.UTC(hasta, 11, 31); t += 86400000) {
    const f = new Date(t), m = f.getUTCMonth(), dia = f.getUTCDate();
    const fuera = hueco && hueco(f.getUTCFullYear(), m, dia);
    d.time.push(f.toISOString().slice(0, 10));
    const tmed = 20 + m / 2;
    const val = { temperature_2m_mean: tmed, temperature_2m_max: tmed + 6, temperature_2m_min: tmed - 6, relative_humidity_2m_mean: 60 + m,
      precipitation_sum: m >= 4 && m <= 9 ? 5 : 0.5, wind_speed_10m_mean: 10, et0_fao_evapotranspiration: 3 + m / 10 + (dia % 2 ? 0.5 : -0.5),
      shortwave_radiation_sum: 15 + m };
    for (const v of vars) d[v].push(fuera ? null : val[v]);
  }
  if (sinMedias) { delete d.temperature_2m_mean; delete d.relative_humidity_2m_mean; delete d.wind_speed_10m_mean; }
  return { latitude: 14, longitude: -87, elevation: 812, daily: d };
}

test('el periodo son los últimos años completos', () => {
  assert.deepEqual(periodo(new Date('2026-10-08T12:00:00Z'), 10), [2016, 2025]);
  assert.deepEqual(periodo(new Date('2027-01-02T12:00:00Z'), 5), [2022, 2026]);
});

test('la URL envía las coordenadas redondeadas y las variables de la documentación de Open-Meteo', () => {
  const u = new URL(urlClima(14.010834, -87.004421, [2016, 2025]));
  assert.equal(u.origin + u.pathname, 'https://archive-api.open-meteo.com/v1/archive');
  assert.equal(u.searchParams.get('latitude'), '14.01');
  assert.equal(u.searchParams.get('longitude'), '-87');
  assert.equal(u.searchParams.get('start_date'), '2016-01-01');
  assert.equal(u.searchParams.get('end_date'), '2025-12-31');
  assert.match(u.searchParams.get('daily'), /et0_fao_evapotranspiration/);
  assert.equal(u.searchParams.get('hourly'), null);
  const b = new URL(urlClima(14, -87, [2016, 2025], { basicas: true }));
  assert.doesNotMatch(b.searchParams.get('daily'), /_mean/);
  assert.equal(b.searchParams.get('hourly'), 'relative_humidity_2m,wind_speed_10m');
});

test('viento a 2 m con FAO-56 ec. 47: a 10 m el factor es 0.748', () => {
  cerca(factorViento2m(10), 0.748, 0.0005);
  cerca(factorViento2m(2), 1, 0.001);
});

test('percentil con interpolación lineal (como PERCENTIL.INC de Excel)', () => {
  cerca(percentil([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.9), 9.1);
  cerca(percentil([10, 1, 5], 0.5), 5);
  assert.equal(percentil([], 0.9), null);
});

test('promedios por mes de una serie de resultado conocido', () => {
  const n = normalesDesdeDiario(respuesta().daily);
  assert.deepEqual(n.periodo, [2016, 2025]);
  assert.ok(n.completos);
  const ene = n.meses[0], may = n.meses[4], jun = n.meses[5], dic = n.meses[11];
  assert.equal(ene.tmed, 20); assert.equal(ene.tmax, 26); assert.equal(ene.tmin, 14); assert.equal(ene.hr, 60);
  assert.equal(may.tmed, 22); assert.equal(dic.hr, 71);
  assert.equal(may.lluvia, 155); // 5 mm × 31 días
  assert.equal(jun.lluvia, 150); // 5 mm × 30 días
  assert.equal(ene.lluvia, 16); // 0.5 × 31 = 15.5 → 16
  // Febrero: 28 o 29 días según el año → promedio de 2016-2025 (3 bisiestos): 0.5 × 28.3 = 14.15 → 14
  assert.equal(n.meses[1].lluvia, 14);
  assert.equal(ene.viento2, 7.5); // 10 km/h × 0.748
  assert.equal(ene.eto, 3.02); // 16 días impares a 3.5 y 15 pares a 2.5: 93.5 / 31 = 3.016
  assert.equal(ene.etoP90, 3.5);
  assert.equal(dic.rad, 26);
});

test('meses de lluvia fuerte: 100 mm o más (criterio propio en config)', () => {
  const c = { meses: normalesDesdeDiario(respuesta().daily).meses };
  assert.deepEqual(mesesLluviosos(c), [4, 5, 6, 7, 8, 9]);
  assert.deepEqual(mesesLluviosos(c, 200), []);
  assert.deepEqual(mesesLluviosos(null), []);
  assert.equal(CONFIG.clima.lluviaFuerteMm, 100);
});

test('un mes con menos del 80 % de días no cuenta, y con menos de 5 años válidos queda sin dato', () => {
  // Marzo sin datos del día 10 en adelante en 2016-2021 (6 años) → solo 4 años válidos → sin dato.
  const n = normalesDesdeDiario(respuesta({ hueco: (y, m, d) => m === 2 && y <= 2021 && d >= 10 }).daily);
  assert.equal(n.meses[2].tmed, null);
  assert.equal(n.meses[2].lluvia, null);
  assert.equal(n.meses[3].tmed, 21.5);
  // Un solo día faltante por mes no baja la lluvia: se usa el promedio diario × días del mes.
  const m = normalesDesdeDiario(respuesta({ hueco: (y, mm, d) => d === 15 }).daily);
  assert.equal(m.meses[4].lluvia, 155);
});

test('sin las medias diarias: temperatura de (máx + mín) / 2 y humedad y viento desde los datos por hora', () => {
  const r = respuesta({ desde: 2020, hasta: 2024, sinMedias: true });
  const hourly = { time: [], relative_humidity_2m: [], wind_speed_10m: [] };
  for (const d of r.daily.time) for (let h = 0; h < 24; h++) {
    hourly.time.push(`${d}T${String(h).padStart(2, '0')}:00`);
    hourly.relative_humidity_2m.push(h < 12 ? 90 : 50); // media diaria 70
    hourly.wind_speed_10m.push(h % 2 ? 8 : 12); // media diaria 10
  }
  const c = climaDesdeRespuesta({ ...r, hourly }, new Date('2025-06-01'));
  assert.equal(c.meses[0].tmed, 20);
  assert.equal(c.meses[0].hr, 70);
  assert.equal(c.meses[0].viento2, 7.5);
  assert.deepEqual(unirHorario(r.daily, null), r.daily);
});

test('la respuesta completa da el clima de la finca con su elevación y fecha', () => {
  const c = climaDesdeRespuesta(respuesta(), new Date('2026-10-08T00:00:00Z'));
  assert.equal(c.fuente, 'open-meteo');
  assert.deepEqual(c.periodo, [2016, 2025]);
  assert.equal(c.obtenido, '2026-10-08');
  assert.equal(c.elevacion, 812);
  assert.throws(() => climaDesdeRespuesta({}), /datos diarios/);
  assert.throws(() => climaDesdeRespuesta({ daily: { time: [] } }), /suficientes/);
});

test('el clima se guarda en la finca, sin coordenadas, y un archivo dañado no rompe la app', () => {
  const c = climaDesdeRespuesta(respuesta(), new Date('2026-10-08'));
  const f = normalizarFinca({ ...emptyFarm(), clima: c });
  assert.deepEqual(f.clima, c);
  const txt = exportarTexto(f, {}, null);
  assert.doesNotMatch(txt, /latitud|longitud|latitude|longitude|"punto"/);
  // Valores fuera de rango o basura → null; sin ningún dato → sin clima.
  const malo = normalizarClima({ fuente: 'x', meses: [{ tmed: 'caliente', hr: 140, lluvia: -3, eto: 4 }], manual: ['0.eto', 'rm -rf'] });
  assert.equal(malo.fuente, 'manual');
  assert.equal(malo.meses[0].tmed, null); assert.equal(malo.meses[0].hr, null); assert.equal(malo.meses[0].lluvia, null);
  assert.equal(malo.meses[0].eto, 4);
  assert.deepEqual(malo.manual, ['0.eto']);
  assert.equal(normalizarClima({ meses: [] }), null);
  assert.equal(normalizarClima('hola'), null);
  assert.equal(normalizarFinca({}).clima, null);
  assert.equal(demoFarm().clima, null); // la finca de ejemplo es ficticia: no tiene ubicación ni clima
});

test('llena el riego vacío con el clima y no pisa lo que escribió el usuario', () => {
  const c = climaDesdeRespuesta(respuesta(), new Date('2026-10-08'));
  const d = riegoVacio();
  d.etoMensual[0] = 9.9; d.reservorio.temperatura[1] = 30;
  const llenos = llenarRiego(d, c);
  assert.equal(d.etoMensual[0], 9.9);
  assert.equal(d.etoMensual[11], 4.12); // diciembre: (16 × 4.6 + 15 × 3.6) / 31 = 4.116
  assert.equal(d.reservorio.temperatura[1], 30);
  assert.equal(d.reservorio.temperatura[0], 20);
  assert.equal(d.reservorio.radiacion[5], 20);
  assert.equal(d.eto, 4.6); // ETo de diseño: mayor percentil 90 (diciembre: 4.1 + 0.5)
  assert.deepEqual(llenos, ['ETo de cada mes (11 meses)', 'temperatura del reservorio (11 meses)', 'radiación del reservorio (12 meses)', 'ETo de diseño']);
  llenarRiego(d, c, { forzar: true });
  assert.equal(d.etoMensual[0], 3.02);
  assert.deepEqual(llenarRiego(riegoVacio(), null), []);
});

test('promedio del clima de varios meses', () => {
  const c = climaDesdeRespuesta(respuesta(), new Date('2026-10-08'));
  const x = climaDeMeses(c, [0, 1]);
  assert.equal(x.tmed, 20.3); // (20 + 20.5) / 2 = 20.25 → 20.3
  assert.equal(climaDeMeses(c, []), null);
  assert.equal(climaDeMeses(null, [1]), null);
});

// ——— Descarga con caché (fetch y localStorage simulados) ———
const almacen = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
const resp = (estado, json) => ({ ok: estado >= 200 && estado < 300, status: estado, json: async () => json });
const HOY = new Date('2026-10-08T12:00:00Z');

test('descarga, guarda en caché y la reutiliza sin volver a llamar al servicio', async () => {
  const urls = [];
  const fetchFn = async (u) => { urls.push(u); return resp(200, respuesta()); };
  const al = almacen();
  const a = await obtenerClima(14.0108, -87.0044, { fetchFn, hoy: HOY, almacen: al });
  assert.equal(a.deCache, false);
  assert.equal(a.clima.meses[4].lluvia, 155);
  const b = await obtenerClima(14.0111, -87.0039, { fetchFn, hoy: HOY, almacen: al }); // mismo punto redondeado
  assert.equal(b.deCache, true);
  assert.equal(urls.length, 1);
  await obtenerClima(14.5, -87, { fetchFn, hoy: HOY, almacen: al }); // otro punto: descarga
  assert.equal(urls.length, 2);
});

test('si el servicio no reconoce las medias diarias (400), reintenta con las básicas y los datos por hora', async () => {
  const urls = [];
  const fetchFn = async (u) => {
    urls.push(u);
    if (!new URL(u).searchParams.get('hourly')) return resp(400, { error: true, reason: 'Cannot initialize WeatherVariable from invalid String value relative_humidity_2m_mean' });
    const r = respuesta({ desde: 2016, hasta: 2025, sinMedias: true });
    const hourly = { time: [], relative_humidity_2m: [], wind_speed_10m: [] };
    for (const d of r.daily.time) for (let h = 0; h < 24; h += 6) { hourly.time.push(`${d}T${String(h).padStart(2, '0')}:00`); hourly.relative_humidity_2m.push(65); hourly.wind_speed_10m.push(10); }
    return resp(200, { ...r, hourly });
  };
  const r = await obtenerClima(14, -87, { fetchFn, hoy: HOY, almacen: almacen() });
  assert.equal(urls.length, 2);
  assert.equal(r.clima.meses[0].hr, 65);
  assert.equal(r.clima.meses[0].tmed, 20);
});

test('sin internet: usa la última descarga si la hay; si no, error claro para escribir a mano', async () => {
  const al = almacen();
  await obtenerClima(14, -87, { fetchFn: async () => resp(200, respuesta()), hoy: new Date('2026-01-01'), almacen: al });
  const caido = async () => { throw new TypeError('Failed to fetch'); };
  // Caché vencida (más de 180 días): intenta descargar, falla y devuelve la vieja con aviso.
  const r = await obtenerClima(14, -87, { fetchFn: caido, hoy: HOY, almacen: al });
  assert.equal(r.deCache, true);
  assert.match(r.aviso, /Sin conexión.*última descarga \(2026-01-01\)/);
  await assert.rejects(obtenerClima(15, -88, { fetchFn: caido, hoy: HOY, almacen: almacen() }), (e) => e instanceof ErrorClima && /Sin conexión/.test(e.message));
  await assert.rejects(obtenerClima(15, -88, { fetchFn: async () => resp(429, { reason: 'Daily API request limit exceeded' }), hoy: HOY, almacen: almacen() }), /limit exceeded/);
});

// ——— Plaguicidas y polinizadores ———
function climaCon(mes, valores) {
  const c = climaVacio();
  c.fuente = 'manual';
  c.meses = c.meses.map(() => ({ ...c.meses[0], tmed: 22, tmax: 24, tmin: 16, hr: 70, lluvia: 20, viento2: 5 }));
  Object.assign(c.meses[mes], valores);
  return c;
}

test('plaguicidas: el clima típico de los meses avisa calor, aire seco, viento y lluvia', () => {
  const c = climaCon(2, { tmax: 32, hr: 42, viento2: 14, lluvia: 180 });
  const [a] = avisosClimaTipico([2], c);
  assert.equal(a.nivel, 'criterio');
  assert.match(a.detalle, /^En Mar la máxima típica llega a 32 °C, sobre los 25 °C/);
  assert.match(a.detalle, /humedad media típica baja a 42 %/);
  assert.match(a.detalle, /viento medio típico es de 14 km\/h/);
  assert.match(a.detalle, /Mar es un mes lluvioso \(180 mm\)/);
  assert.equal(avisosClimaTipico([5], c)[0].nivel, 'ok');
  assert.deepEqual(avisosClimaTipico([2], null), []);
});

test('plaguicidas: el clima típico solo aparece si no se anotaron las condiciones del día', () => {
  const f = { ...emptyFarm(), clima: climaCon(2, { tmax: 32 }) };
  const sinDia = revisarAplicacion({ ...plagVacio(), producto: 'X', meses: [2] }, f);
  assert.ok(sinDia.some((x) => x.titulo === 'Clima típico de los meses de aplicación'));
  const conDia = revisarAplicacion({ ...plagVacio(), producto: 'X', meses: [2], temp: 22 }, f);
  assert.ok(!conDia.some((x) => /Clima típico|clima típico/.test(x.titulo)));
});

test('polinizadores: el clima de la floración de riesgo se muestra pero no cambia el riesgo', () => {
  const base = demoFarm();
  const sin = evaluar(base).mods.find((m) => m.id === 'poli');
  const con = evaluar({ ...base, clima: climaCon(0, { tmed: 21, tmax: 29, hr: 55, lluvia: 10 }) }).mods.find((m) => m.id === 'poli');
  assert.equal(con.score, sin.score);
  assert.equal(con.conf, sin.conf);
  const v = con.variables.find((x) => x.id === 'climaFloracion');
  assert.equal(v.peso, 0);
  assert.equal(v.estado, 'no verificado');
  assert.match(v.valor, /^Ene, Feb, Mar, Abr: /);
  assert.equal(sin.variables.find((x) => x.id === 'climaFloracion').valor, 'Falta la ubicación de la finca');
});
