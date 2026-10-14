// Bienvenida de primera vez: sale solo la primera vez, sus pasos se dibujan, y al terminar
// lleva al cuestionario (con finca vacía) o al dashboard con la finca de ejemplo, sin borrar datos propios.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

const dom = instalarDOM();
const { S, demoFarm } = await import('../src/core/state.js');
const { viewBienvenida, PASOS_BV } = await import('../src/ui/bienvenida.js');
const bvCore = await import('../src/core/bienvenida.js');
const { FUENTES_BV, USOS_BV, mostrarBienvenida, leerBienvenida, normalizarBienvenida } = bvCore;
await import('../src/app.js');

const CLAVE = 'biogap:bienvenida:v1';

test('con el navegador vacío, la app arranca en la bienvenida', () => {
  assert.equal(S.view, 'bienvenida');
  assert.match(dom.pantalla(), /Bienvenido a/);
});

test('se muestra solo si nunca se vio y no había datos guardados de antes', () => {
  dom.almacen.clear();
  assert.equal(mostrarBienvenida(false), true);
  assert.equal(mostrarBienvenida(true), false, 'quien ya usaba la app no la ve');
  dom.almacen.set(CLAVE, JSON.stringify({ vista: true }));
  assert.equal(mostrarBienvenida(false), false);
});

test('cada paso se dibuja sin «undefined» ni «NaN» y con sus puntos de avance', () => {
  for (let p = 0; p < PASOS_BV.length; p++) {
    S.bv = { paso: p, fuente: '', usos: [] };
    const html = viewBienvenida();
    assert.doesNotMatch(html, /undefined|NaN|\[object/);
    assert.match(html, new RegExp(`${p + 1} de ${PASOS_BV.length}`));
    assert.equal((html.match(/<span class="(on|hecho|)"><\/span>/g) || []).length, PASOS_BV.length);
  }
});

test('preguntas: cómo conociste (una) y para qué la usarás (varias)', () => {
  dom.almacen.clear(); S.bv = { paso: 2, fuente: '', usos: [] };
  assert.equal((viewBienvenida().match(/data-act="bv-fuente"/g) || []).length, FUENTES_BV.length);
  dom.clic('bv-fuente', { id: 'zamorano' }); dom.clic('bv-fuente', { id: 'colega' });
  assert.equal(S.bv.fuente, 'colega');
  dom.clic('bv-siguiente');
  assert.equal(S.bv.paso, 3);
  assert.equal((viewBienvenida().match(/data-act="bv-uso"/g) || []).length, USOS_BV.length);
  dom.clic('bv-uso', { id: 'abejas' }); dom.clic('bv-uso', { id: 'certificacion' }); dom.clic('bv-uso', { id: 'certificacion' });
  assert.deepEqual(S.bv.usos, ['abejas']);
  dom.clic('bv-siguiente');
  assert.match(viewBienvenida(), /ApiRadar/, 'si eligió abejas, el último paso le dice dónde anotar los árboles de riesgo');
});

test('«Saltar» lleva al último paso, que siempre ofrece el cuestionario o saltarlo', () => {
  S.bv = { paso: 0, fuente: '', usos: [] };
  dom.clic('bv-saltar');
  assert.equal(S.bv.paso, PASOS_BV.length - 1);
  const html = viewBienvenida();
  assert.match(html, /data-act="bv-cuestionario"/);
  assert.match(html, /data-act="bv-saltar-cuestionario"/);
  dom.clic('bv-atras');
  assert.equal(S.bv.paso, PASOS_BV.length - 2);
});

test('«Llenar el cuestionario» con la finca de ejemplo: finca vacía, paso 1 del cuestionario y bienvenida marcada', () => {
  dom.almacen.clear(); S.farm = demoFarm(); S.demo = true; S.view = 'bienvenida';
  S.bv = { paso: PASOS_BV.length - 1, fuente: 'evento', usos: ['riesgo'] };
  dom.clic('bv-cuestionario');
  assert.equal(S.view, 'wizard'); assert.equal(S.step, 0); assert.equal(S.demo, false);
  assert.equal(S.farm.nombre, '');
  assert.deepEqual(leerBienvenida(), { vista: true, fuente: 'evento', usos: ['riesgo'] });
});

test('«Saltar por ahora» deja la finca de ejemplo en el dashboard y no la vuelve a mostrar', () => {
  dom.almacen.clear(); S.farm = demoFarm(); S.demo = true; S.view = 'bienvenida'; S.bv = { paso: 4, fuente: '', usos: [] };
  dom.clic('bv-saltar-cuestionario');
  assert.equal(S.view, 'dashboard'); assert.equal(S.demo, true);
  assert.equal(mostrarBienvenida(false), false);
});

test('verla otra vez desde Ajustes nunca borra una finca propia', () => {
  S.farm = { ...demoFarm(), nombre: 'Mi finca' }; S.demo = false; S.view = 'ajustes';
  dom.clic('bv-ver');
  assert.equal(S.view, 'bienvenida'); assert.equal(S.bv.paso, 0);
  S.bv.paso = PASOS_BV.length - 1;
  dom.clic('bv-cuestionario');
  assert.equal(S.farm.nombre, 'Mi finca');
  assert.equal(S.view, 'wizard');
});

test('lo guardado se valida: opciones desconocidas se descartan', () => {
  assert.deepEqual(normalizarBienvenida({ vista: 'si', fuente: 'tele', usos: ['abejas', 'x', 3] }), { vista: false, fuente: '', usos: ['abejas'] });
  assert.deepEqual(normalizarBienvenida(null), { vista: false, fuente: '', usos: [] });
});
