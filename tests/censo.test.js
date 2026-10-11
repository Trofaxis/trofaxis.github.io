// Censo de árboles de riesgo, riesgo por árbol y veredicto de los sitios candidatos (ApiRadar).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clasificarArboles, resumenCenso, evaluarSitios, censoEjemplo, nombreSitio } from '../src/apiradar/censo.js';
import { apiRadar } from '../src/apiradar/diagnostico.js';
import { volumenCopa } from '../src/modules/polinizadores.js';
import { distanciaM } from '../src/mapa/geo.js';
import { demoFarm } from '../src/core/state.js';
import { mapaRiesgo } from '../src/ui/mapariesgo.js';

const arb = (id, d, h, lat = 14, lon = -87) => ({ id, lat, lon, dap: null, d, h });

test('el volumen de copa de cada árbol es la Ec. 3 de Osorio (la misma del módulo Polinizadores)', () => {
  const [a] = clasificarArboles([arb('1', 18.7, 19.2)]);
  assert.equal(a.vol, volumenCopa(18.7, 19.2));
  assert.ok(Math.abs(a.vol - 3515.5) < 1); // el árbol 27 de la captura de Diego
});

test('riesgo por percentil: tercio con más volumen = alto, del medio = medio, resto = bajo; sin medidas no se clasifica', () => {
  const t = clasificarArboles([arb('a', 2, 2), arb('b', 4, 4), arb('c', 6, 6), arb('d', 8, 8), arb('e', 10, 10), arb('f', 12, 12), arb('x', null, 5)]);
  assert.deepEqual(t.map((a) => a.clase), ['bajo', 'bajo', 'medio', 'medio', 'alto', 'alto', null]);
  const r = resumenCenso(t);
  assert.deepEqual([r.n, r.conMedidas, r.sinMedidas], [7, 6, 1]);
  assert.deepEqual([r.porClase.alto.n, r.porClase.medio.n, r.porClase.bajo.n], [2, 2, 2]);
  assert.ok(Math.abs(r.volumen - t.reduce((s, a) => s + (a.vol ?? 0), 0)) < 1e-6);
  // Un solo árbol, o varios iguales, no son «bajo» por defecto.
  assert.equal(clasificarArboles([arb('1', 5, 5)])[0].clase, 'medio');
  assert.deepEqual(clasificarArboles([arb('1', 5, 5), arb('2', 5, 5)]).map((a) => a.clase), ['medio', 'medio']);
});

test('veredicto de sitios: cerca (< 300 m), revisar (300-500 m), lejos (≥ 500 m), contra el árbol más cercano de TODO el censo', () => {
  const lat = 14, m = 1 / 110574; // grados de latitud por metro
  const arboles = clasificarArboles([arb('1', 18, 18, lat, -87), arb('2', 5, 5, lat + 2000 * m, -87)]);
  const sitios = [{ id: 'A', lat: lat + 100 * m, lon: -87 }, { id: 'B', lat: lat + 400 * m, lon: -87 }, { id: 'C', lat: lat + 1000 * m, lon: -87 }, { id: 'sitio D', lat: lat + 1900 * m, lon: -87 }];
  const r = evaluarSitios(arboles, sitios, [300, 500]);
  assert.deepEqual(r.map((s) => s.veredicto), ['cerca', 'revisar', 'lejos', 'cerca']);
  assert.ok(Math.abs(r[0].distanciaM - 100) <= 1);
  assert.equal(r[3].arbol.id, '2'); // el árbol pequeño también excluye: no solo los de más volumen
  assert.equal(r[3].arbol.clase, 'bajo');
  assert.equal(nombreSitio(r[0]), 'Sitio A');
  assert.equal(nombreSitio(r[3]), 'sitio D');
  assert.equal(evaluarSitios([], sitios)[0].veredicto, null);
  assert.deepEqual(evaluarSitios(arboles, undefined), []);
});

test('el censo de ejemplo es ficticio y muestra los tres veredictos', () => {
  const e = censoEjemplo(), c = clasificarArboles(e.arboles);
  assert.equal(e.arboles.length, 14);
  assert.deepEqual(evaluarSitios(c, e.sitios).map((s) => s.veredicto), ['cerca', 'revisar', 'lejos']);
  assert.equal(distanciaM([e.arboles[0].lat, e.arboles[0].lon], [14, -87]) < 1, true);
});

test('ApiRadar con censo: lo trae en los datos, da veredicto por sitio, prioriza árboles y no cambia el puntaje', () => {
  const f = demoFarm(), e = censoEjemplo();
  const sin = apiRadar(f), con = apiRadar(f, undefined, {}, 'spathodea', { ...e, ejemplo: true });
  assert.equal(con.score, sin.score); // el censo no mueve la rúbrica (una variable no afecta a otra sin fundamento)
  assert.equal(con.censo.resumen.n, 14);
  assert.equal(con.censo.ejemplo, true);
  assert.match(con.datos.find((d) => d.dato === 'Censo de árboles de riesgo').valor, /14 con coordenadas.*alto 5, medio 4, bajo 5/);
  const refugio = con.acciones.find((a) => a.id === 'refugio').detalle;
  assert.match(refugio, /Sitio A: cerca/);
  assert.match(refugio, /Sitio B: revisar/);
  assert.match(refugio, /Sitio C: lejos/);
  assert.match(refugio, /Sirve Sitio C/);
  assert.match(con.acciones.find((a) => a.id === 'arbol').detalle, /Empieza por los árboles 1, 2, 4, 3, 7/);
  assert.deepEqual(con.censo.prioritarios.map((a) => a.id), ['1', '2', '4', '3', '7']);
  assert.ok(sin.faltan.some((x) => /Censo de árboles de riesgo con coordenadas/.test(x)));
  assert.equal(con.faltan.some((x) => /Sitios candidatos/.test(x)), false);
  // Con el censo pero sin sitios, pide los sitios; con árboles sin medidas, avisa.
  const solo = apiRadar(f, undefined, {}, 'spathodea', { arboles: [{ id: '1', lat: 14, lon: -87, dap: null, d: null, h: null }], sitios: [], contorno: [] });
  assert.ok(solo.faltan.some((x) => /Sitios candidatos/.test(x)));
  assert.ok(solo.faltan.some((x) => /sin diámetro o altura de copa/.test(x)));
});

test('mapa de riesgo: dibuja árboles con su ID, radios y sitios con su veredicto, y escapa los nombres', () => {
  const e = censoEjemplo(), c = clasificarArboles(e.arboles);
  const censo = { arboles: c, sitios: evaluarSitios(c, [...e.sitios, { id: '<img src=x>', lat: 14.001, lon: -87.001 }]) };
  const svg = mapaRiesgo(censo, e.contorno, [300, 500], null);
  assert.match(svg, /^<svg class="mapa-riesgo"/);
  assert.equal((svg.match(/class="alto"/g) || []).length, 5 + 0); // árboles de riesgo alto
  assert.match(svg, /Sitio A \(cerca\)/);
  assert.match(svg, /Sitio C \(lejos\)/);
  assert.equal(svg.includes('<img src=x>'), false);
  assert.match(svg, /<polygon class="mr-finca"/);
  assert.equal(mapaRiesgo({ arboles: [], sitios: [] }, [], [300, 500], null), '');
});
