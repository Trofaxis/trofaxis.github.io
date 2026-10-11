// Pruebas de guardar y cargar fincas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportarTexto, importarTexto, normalizarFinca, normalizarAjustes, configBase } from '../src/core/storage.js';
import { demoFarm, emptyFarm } from '../src/core/state.js';

test('exportar e importar devuelve la misma finca', () => {
  const ajustes = { modulosActivos: ['poli', 'suelo'], niveles: { alto: 70, medio: 40 } };
  const r = importarTexto(exportarTexto(demoFarm(), ajustes));
  assert.deepEqual(r.farm, demoFarm());
  assert.deepEqual(r.ajustes, ajustes);
});

test('rechaza archivos que no son de BioG.A.P.', () => {
  assert.throws(() => importarTexto('no es json'), /JSON válido/);
  assert.throws(() => importarTexto('{"hola":1}'), /no es una finca/);
  assert.throws(() => importarTexto('{"formato":"biogap-finca","version":99}'), /más nueva/);
});

test('un archivo incompleto se completa con valores por defecto', () => {
  const f = normalizarFinca({ nombre: 'Lote norte', area: 12 });
  assert.equal(f.nombre, 'Lote norte');
  assert.equal(f.area, 12);
  assert.deepEqual({ ...f, nombre: '', area: 0 }, emptyFarm());
});

test('descarta valores inválidos (meses fuera de rango, negativos, opciones desconocidas)', () => {
  const f = normalizarFinca({
    area: -5, pendiente: 'vertical', fertMeses: [3, 3, 14, -1, 'x', 0],
    especies: [{ nombre: 'Gliricidia sepium', tipo: 'Dragón', floracion: [12, 1] }, null],
  });
  assert.equal(f.area, 0);
  assert.equal(f.pendiente, 'plana');
  assert.deepEqual(f.fertMeses, [0, 3]);
  assert.equal(f.especies.length, 1);
  assert.equal(f.especies[0].tipo, 'Árbol');
  assert.deepEqual(f.especies[0].floracion, [1]);
});

test('ajustes inválidos vuelven a los valores por defecto', () => {
  assert.deepEqual(normalizarAjustes({ niveles: { alto: 30, medio: 50 } }).niveles, configBase().niveles);
  assert.deepEqual(normalizarAjustes({ modulosActivos: ['agua', 'inventado', 'poli'] }).modulosActivos, ['poli', 'agua']);
});

import { normalizarTpl } from '../src/core/storage.js';

test('las plantillas viajan en el respaldo y se validan', () => {
  const tpl = { tipo: 'mec', objetivo: 150, rows: [{ fecha: '2026-01-10', lote: 'L1', valor: 40 }], paste: 'x' };
  const r = importarTexto(exportarTexto(demoFarm(), configBase(), tpl));
  assert.deepEqual(r.tpl, { ...tpl, paste: '' });
  const malo = normalizarTpl({ tipo: 'inventado', objetivo: -3, rows: [{ valor: 'x' }, null, { fecha: 1, lote: 2, valor: 5 }] }, { tipo: 'mec', objetivo: 0, rows: [], paste: '' });
  assert.equal(malo.tipo, 'mec');
  assert.equal(malo.objetivo, 0);
  assert.deepEqual(malo.rows, [{ fecha: '', lote: '', valor: 5 }]);
});
