// Panel ApiRadar: se lee como una ruta guiada (riesgo hoy y con el plan, pasos, plan, dónde) y lo técnico va plegado al final.
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

function panel({ abierto = true, excluir = {}, cargando = false } = {}) {
  const previo = { farm: S.farm, problema: S.problema, arExcluir: S.arExcluir, arCargando: S.arCargando };
  try {
    S.farm = demoFarm();
    S.problema = abierto ? 'spathodea' : '';
    S.arExcluir = excluir; S.arCargando = cargando;
    const m = viewDashboard().match(/<section class="panel ar-panel[^"]*" id="apiradar">[\s\S]*?<\/section>/);
    assert.ok(m, 'el tablero no trae el panel ApiRadar');
    return m[0];
  } finally { Object.assign(S, previo); }
}

test('el panel se lee en orden: riesgo hoy y con el plan, ruta, plan, dónde, descarga y al final cómo se calculó', () => {
  const h = panel();
  const orden = ['Riesgo hoy', 'Con tu plan', '<h3>Tu ruta', '<h3>Tu plan', '<h3>Dónde actuar', 'Descargar plan (imagen)', 'Cómo se calculó', 'Qué datos usó', 'Por qué sale este riesgo', 'Cómo saber si funcionó'];
  const pos = orden.map((t) => h.indexOf(t));
  pos.forEach((p, i) => assert.ok(p >= 0, `falta «${orden[i]}»`));
  for (let i = 1; i < pos.length; i++) assert.ok(pos[i] > pos[i - 1], `«${orden[i]}» debe ir después de «${orden[i - 1]}»`);
  // Lo técnico va plegado.
  assert.match(h, /<details class="ar-calculo"[^>]*><summary>Cómo se calculó/);
});

test('«con tu plan» es el total de las acciones medibles y baja el riesgo en la finca de ejemplo', () => {
  const h = panel();
  const hoy = +h.match(/Riesgo hoy<\/span><b[^>]*>(\d+)/)[1];
  const plan = +h.match(/Con tu plan<\/span><b[^>]*>(\d+)/)[1];
  assert.ok(plan < hoy, `${plan} < ${hoy}`);
  assert.match(h, new RegExp(`Tu plan baja el riesgo para las abejas <b>${hoy - plan} puntos</b>`));
});

test('quitar una acción del plan la deja fuera del cálculo y sube el riesgo con el plan', () => {
  const con = panel(), sin = panel({ excluir: { mover: true } });
  const plan = (h) => +h.match(/Con tu plan<\/span><b[^>]*>(\d+)/)[1];
  assert.ok(plan(sin) > plan(con));
  assert.match(sin, /Fuera de tu plan/);
  assert.match(sin, /data-arplan="mover" aria-pressed="false">Agregar a mi plan/);
});

test('cada acción trae «Ya lo hice» y la de colonias dice dónde, con coordenadas, cuando hay censo', () => {
  const h = panel();
  assert.match(h, /data-done="ar\|refugio"/);
  assert.match(h, /Poner meliponarios u hoteles de insectos lejos de los árboles de riesgo/);
});

test('la ruta marca los pasos y ofrece cargar el censo cuando falta', () => {
  const h = panel();
  assert.match(h, /<ol class="ar-ruta">/);
  assert.match(h, /Ubica los árboles de riesgo[\s\S]*data-act="apiradar-censo"/);
  assert.match(h, /data-act="apiradar-sitio"/);
});

test('el primer nivel (encabezado, resultado, ruta y plan) no usa jerga', () => {
  const h = panel();
  const primerNivel = sinEtiquetas(h.slice(0, h.indexOf('Dónde actuar'))).replace(/Cómo hacerlo.*?(?=\d+ ?\.|$)/g, '');
  assert.ok(primerNivel.length > 200);
  assert.doesNotMatch(sinEtiquetas(h.slice(0, h.indexOf('Tu ruta'))), JERGA);
  const detalle = sinEtiquetas(h.slice(h.indexOf('Cómo se calculó')));
  assert.match(detalle, /no agrega pesos nuevos/);
});

test('el «+» explica qué es el ApiRadar, qué resuelve y que es un caso de Zamorano', () => {
  for (const h of [panel(), panel({ abierto: false })]) {
    const caja = h.slice(h.indexOf('class="mas"'), h.indexOf('</details>', h.indexOf('class="mas"')));
    assert.match(caja, /Qué es/); assert.match(caja, /Qué resuelve/); assert.match(caja, /Zamorano/);
  }
});

test('mientras analiza, muestra los pasos del análisis y no el resultado', () => {
  const h = panel({ cargando: true });
  assert.match(h, /Preparando tu ApiRadar/);
  assert.match(h, /Armando tu plan/);
  assert.doesNotMatch(h, /Riesgo hoy/);
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
