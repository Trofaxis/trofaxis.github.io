// Secciones «+» del dashboard: cada tarjeta resume lo que muestra, con datos de la finca (PDF «Mejoras de biogap»).
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document ??= { getElementById: () => null, querySelectorAll: () => [], dispatchEvent() {}, addEventListener() {}, createElement: () => ({}), documentElement: { setAttribute() {}, removeAttribute() {} } };
globalThis.location ??= { hash: '', pathname: '/', search: '', origin: '' };

const { S, demoFarm } = await import('../src/core/state.js');
const { viewDashboard } = await import('../src/ui/dashboard.js');
const { evaluar } = await import('../src/core/engine.js');
const { CONFIG } = await import('../src/core/config.js');
const { masDatos, masMesCargado, masPerfil } = await import('../src/ui/explicaciones.js');
const { encuadre, partir } = await import('../src/ui/plan-imagen.js');

test('las seis tarjetas del resumen y el perfil de riesgo traen su «+»', () => {
  const previo = S.farm;
  try {
    S.farm = demoFarm();
    const h = viewDashboard();
    for (const k of ['mayor', 'alto', 'mes', 'coinc', 'datos', 'gg', 'perfil']) assert.match(h, new RegExp(`data-keep="mas-${k}"`), `falta el «+» de ${k}`);
  } finally { S.farm = previo; }
});

test('«Datos completos» dice en qué módulo falta información y qué dato', () => {
  const R = evaluar(demoFarm(), CONFIG);
  const incompleto = R.mods.find((m) => m.conf < 1);
  assert.ok(incompleto, 'la finca de ejemplo tiene algún módulo incompleto');
  const h = masDatos(R);
  assert.match(h, new RegExp(incompleto.nombre));
  const falta = incompleto.variables.find((v) => v.aplica !== false && v.puntaje == null);
  assert.ok(h.toLowerCase().includes(falta.nombre.toLowerCase().replace(/[()]/g, (c) => c)), `debe nombrar «${falta.nombre}»`);
});

test('«Mes más cargado» lista las coincidencias de ese mes y el perfil explica cómo leerlo', () => {
  const R = evaluar(demoFarm(), CONFIG);
  const mes = R.mh.map((a, i) => [i, a.length]).sort((a, b) => b[1] - a[1])[0][0];
  for (const c of R.mh[mes]) assert.ok(masMesCargado(R).includes(c));
  assert.match(masPerfil(R), /Cómo leerlo/);
});

test('la imagen del plan encuadra todos los puntos y parte el texto en líneas', () => {
  const v = encuadre([[14, -87], [14.01, -87.01]], 500);
  assert.ok(v.z >= 3 && v.z <= CONFIG.mapa.zoomMax);
  assert.ok(Math.abs(v.lat - 14.005) < 1e-6 && Math.abs(v.lon + 87.005) < 1e-6);
  assert.equal(encuadre([], 500), null);
  const ctx = { measureText: (t) => ({ width: t.length * 10 }) };
  assert.deepEqual(partir(ctx, 'uno dos tres cuatro', 80), ['uno dos', 'tres', 'cuatro']);
});
