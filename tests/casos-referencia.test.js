// Casos de referencia: datos reales con fuente, separados de la finca demostrativa y de los casos de ejemplo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CASOS_REFERENCIA } from '../src/casos/referencia.js';
import { FUENTES } from '../src/core/fuentes.js';
import { casoEjemplo } from '../src/riego/calculo.js';
import { demoFarm } from '../src/core/state.js';
import { CASOS_EJEMPLO } from '../src/casos/ejemplos.js';
import { memoria, panelReferencia } from '../src/ui/casos.js';

test('cada dato de un caso de referencia trae valor, fuente y página o sección', () => {
  assert.ok(CASOS_REFERENCIA.length >= 2);
  for (const c of CASOS_REFERENCIA) {
    assert.equal(c.origen, 'referencia', c.id);
    assert.ok(c.citas.length && c.datos.length, c.id);
    for (const d of c.datos) {
      for (const k of ['titulo', 'fuente', 'donde']) assert.ok(String(d[k] ?? '').trim(), `${c.id}: ${d.titulo} sin ${k}`);
      assert.ok(d.valor !== null && d.valor !== undefined && d.valor !== '', `${c.id}: ${d.titulo} sin valor`);
    }
  }
});

test('el caso Zamorano lee todos los datos de las tesis sin copiarlos', () => {
  const z = CASOS_REFERENCIA.find((c) => c.id === 'ref-zamorano-spathodea');
  const tesis = [...FUENTES.osorio.datos, ...FUENTES.kuniyoshi.datos];
  assert.equal(z.datos.length, tesis.length);
  for (const t of tesis) assert.ok(z.datos.some((d) => d.valor === t.valor && d.donde === t.donde), t.id);
});

test('ningún caso de referencia trae coordenadas', () => {
  for (const c of CASOS_REFERENCIA) {
    assert.ok(!/\b0?4\d{5}\b|\b15\d{5}\b|\b1[34]\.\d{3,}|-8[67]\.\d{3,}/.test(JSON.stringify(c)), c.id);
    assert.ok(!('finca' in c) && !('lat' in c) && !('lon' in c), c.id);
  }
});

test('los casos de referencia no entran a la búsqueda de fincas parecidas', () => {
  assert.ok(memoria().every((c) => c.origen !== 'referencia'));
});

test('la finca demostrativa y los casos de ejemplo no usan datos reales', () => {
  const demo = JSON.stringify([demoFarm(), CASOS_EJEMPLO]);
  for (const t of [...FUENTES.osorio.datos, ...FUENTES.kuniyoshi.datos]) assert.ok(!demo.includes(t.valor), t.id);
  const r = casoEjemplo();
  for (const n of [r.areaLote, r.eto]) assert.ok(!demo.includes(String(n)), `valor del Lab de Riego en la demo: ${n}`);
  for (const f of ['src/core/state.js', 'src/casos/ejemplos.js']) {
    const src = fs.readFileSync(f, 'utf8');
    assert.ok(!/^import .*\/(fuentes|referencia)\.js'/m.test(src), `${f} importa datos reales`);
  }
});

test('el panel muestra cada caso de referencia con su marca de datos reales', () => {
  const html = panelReferencia();
  assert.match(html, /Datos reales/);
  for (const c of CASOS_REFERENCIA) {
    assert.ok(html.includes(c.etiqueta), c.id);
    for (const d of c.datos) assert.ok(html.includes(d.titulo.replace(/&/g, '&amp;')), d.titulo);
  }
});
