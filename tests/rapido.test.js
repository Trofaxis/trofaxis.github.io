// Preguntas rápidas del cuestionario (src/core/rapido.js): pasan a la finca sin borrar lo que ya había.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const { demoFarm, emptyFarm } = await import('../src/core/state.js');
const { aplicarRapido, rapidoDeFinca, rapidoVacio, NOMBRE_ABEJAS, NOMBRE_SPATHODEA, NOMBRE_INSECTICIDA } = await import('../src/core/rapido.js');
const { abejasSinAguijon } = await import('../src/plag/calculo.js');
const { evaluar } = await import('../src/core/engine.js');
const { CONFIG } = await import('../src/core/config.js');

const r = (x) => ({ ...rapidoVacio(), ...x });

test('todo en «No sé» no cambia la finca', () => {
  for (const f of [emptyFarm(), demoFarm()]) assert.deepEqual(aplicarRapido(f, rapidoVacio()), f);
});

test('las respuestas rápidas crean el cultivo, las abejas, la Spathodea y el insecticida', () => {
  const f = aplicarRapido(emptyFarm(), r({ cultivo: 'Tomate', ha: 2, cosecha: [5, 6], abejas: 'si', spathodea: 'si', spaN: 4, spaFlor: [9, 10], insect: 'si', insectClase: 'amplio', insectMeses: [9] }));
  assert.equal(f.tieneCultivos, true);
  assert.deepEqual(f.cultivos, [{ nombre: 'Tomate', ha: 2, siembra: [], cosecha: [5, 6] }]);
  assert.equal(abejasSinAguijon(f).length, 1, 'las abejas se reconocen como sin aguijón (margen ×10)');
  const sp = f.especies.find((e) => e.nombre === NOMBRE_SPATHODEA);
  assert.deepEqual([sp.riesgo, sp.cantidad, sp.floracion], [true, 4, [9, 10]]);
  assert.deepEqual([f.plaguicidas.length, f.plaguicidas[0].producto, f.plaguicidas[0].meses], [1, NOMBRE_INSECTICIDA, [9]]);
  const R = evaluar(f, CONFIG, {});
  assert.ok(R.ov1.includes(9), 'el insecticida en floración de Spathodea cuenta como coincidencia');
});

test('no borra lo del cuestionario completo: cultivos extra, especies y plaguicidas detallados', () => {
  const f0 = demoFarm();
  const f = aplicarRapido(f0, r({ cultivo: 'Café', abejas: 'si', insect: 'si', insectMeses: [1] }));
  assert.equal(f.cultivos.length, f0.cultivos.length);
  assert.equal(f.cultivos[0].nombre, 'Café');
  assert.deepEqual(f.cultivos[1], f0.cultivos[1]);
  assert.deepEqual(f.plaguicidas, f0.plaguicidas, 'con aplicaciones detalladas no se agrega la genérica');
  assert.equal(f.especies.filter((e) => e.nombre === NOMBRE_ABEJAS).length, abejasSinAguijon(f0).length ? 0 : 1);
});

test('«No» quita lo que corresponde y la finca original no cambia', () => {
  const f0 = aplicarRapido(emptyFarm(), r({ abejas: 'si', spathodea: 'si', insect: 'si' }));
  const copia = structuredClone(f0);
  const f = aplicarRapido(f0, r({ abejas: 'no', spathodea: 'no', insect: 'no' }));
  assert.deepEqual([f.especies.length, f.plaguicidas.length], [0, 0]);
  assert.deepEqual(f0, copia);
});

test('al volver a abrir, las respuestas salen de la finca', () => {
  const f = aplicarRapido(emptyFarm(), r({ cultivo: 'Maíz', ha: 3, cosecha: [8], abejas: 'si', spathodea: 'si', spaN: 2, spaFlor: [0], insect: 'si', insectClase: 'selectivo', insectMeses: [4] }));
  assert.deepEqual(rapidoDeFinca(f), r({ cultivo: 'Maíz', ha: 3, cosecha: [8], abejas: 'si', spathodea: 'si', spaN: 2, spaFlor: [0], insect: 'si', insectClase: 'selectivo', insectMeses: [4] }));
  assert.deepEqual(aplicarRapido(f, rapidoDeFinca(f)), f, 'abrir y confirmar sin cambios no cambia nada');
});

test('con la finca de ejemplo, abrir y confirmar las preguntas rápidas no cambia nada', () => {
  const f = demoFarm();
  assert.deepEqual(aplicarRapido(f, rapidoDeFinca(f)), f);
});
