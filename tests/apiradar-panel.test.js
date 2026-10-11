// Panel ApiRadar: la acción prioritaria va justo bajo el resultado, sin jerga en el primer nivel (issue 45).
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document ??= { getElementById: () => null, querySelectorAll: () => [], dispatchEvent() {}, addEventListener() {}, createElement: () => ({}), documentElement: { setAttribute() {}, removeAttribute() {} } };
globalThis.location ??= { hash: '', pathname: '/', search: '', origin: '' };

const { S, demoFarm } = await import('../src/core/state.js');
const { viewDashboard } = await import('../src/ui/dashboard.js');
const { PROBLEMAS } = await import('../src/apiradar/diagnostico.js');

const JERGA = /percentil|\bHQ\b|rúbrica|rubrica|\bpesos?\b/i;
const sinEtiquetas = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

function panel({ abierto = true } = {}) {
  const previo = { farm: S.farm, problema: S.problema };
  try {
    S.farm = demoFarm();
    S.problema = abierto ? 'spathodea' : '';
    const m = viewDashboard().match(/<section class="panel" id="apiradar">[\s\S]*?<\/section>/);
    assert.ok(m, 'el tablero no trae el panel ApiRadar');
    return m[0];
  } finally { Object.assign(S, previo); }
}

test('«Qué hacer primero» va justo bajo el resultado y antes de las tablas de evidencia', () => {
  const h = panel();
  const resultado = h.indexOf('para las abejas:');
  const primero = h.indexOf('Qué hacer primero');
  const datos = h.indexOf('1. Qué datos usó');
  assert.ok(resultado >= 0 && primero > resultado && datos > primero, `orden: resultado ${resultado}, primero ${primero}, datos ${datos}`);
  for (const t of ['1. Qué datos usó', '2. Por qué sale este riesgo', '3. Dónde están los árboles de riesgo', '4. Qué hacer', 'Cómo saber si funcionó']) {
    assert.ok(h.includes(t), `la sección «${t}» debe seguir en el panel`);
  }
});

test('el bloque trae la primera acción de la lista completa y cuánto baja el riesgo', () => {
  const h = panel();
  const bloque = h.slice(h.indexOf('id="apiradar-primero"'), h.indexOf('1. Qué datos usó'));
  const lista = h.slice(h.indexOf('class="plan apiradar-acciones"'));
  const titulo = lista.match(/<b>([^<]+)<\/b>/)[1];
  assert.ok(bloque.includes(`<b>${titulo}</b>`), `el bloque debe nombrar «${titulo}»`);
  const [, de, a] = bloque.match(/baja de <b>(\d+)<\/b> a <b>(\d+)<\/b>/);
  assert.ok(lista.includes(`(${de} → ${a})`), 'el bloque y la lista deben decir lo mismo');
  assert.ok(Number(a) < Number(de));
});

test('el primer nivel (encabezado, resultado y primer paso) no usa jerga', () => {
  const h = panel();
  const primerNivel = sinEtiquetas(h.slice(0, h.indexOf('1. Qué datos usó')));
  assert.ok(primerNivel.length > 200);
  assert.doesNotMatch(primerNivel, JERGA);
  // La explicación técnica no se perdió: pasó al detalle de «Por qué sale este riesgo».
  const detalle = sinEtiquetas(h.slice(h.indexOf('2. Por qué sale este riesgo'), h.indexOf('3. Dónde están')));
  assert.match(detalle, /no agrega pesos nuevos/);
});

test('con un solo problema no hay selector: se nombra el problema y basta el botón', () => {
  assert.equal(Object.keys(PROBLEMAS).length, 1);
  const cerrado = panel({ abierto: false });
  assert.doesNotMatch(cerrado, /<select id="problema"/);
  assert.match(cerrado, /<b>Problema:<\/b> Spathodea campanulata y las abejas nativas/);
  assert.match(cerrado, /data-act="apiradar" data-p="spathodea">Generar ApiRadar</);
  assert.doesNotMatch(sinEtiquetas(cerrado), /Elige el problema/);
  assert.doesNotMatch(panel(), /<select id="problema"/);
});

test('si hubiera más de un problema, vuelve el selector', () => {
  PROBLEMAS.otro = { id: 'otro', nombre: 'Otro problema de prueba', modulo: 'poli' };
  try {
    const h = panel({ abierto: false });
    assert.match(h, /<select id="problema"/);
    assert.match(h, /Otro problema de prueba/);
    assert.match(sinEtiquetas(h), /Elige el problema/);
  } finally { delete PROBLEMAS.otro; }
});
