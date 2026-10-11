import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TPL, S, tiposPlantilla } from '../src/core/state.js';
import { normalizarTpl, importarTexto, exportarTexto } from '../src/core/storage.js';
import { viewTemplates } from '../src/ui/templates.js';
import { demoFarm } from '../src/core/state.js';
import { CONFIG } from '../src/core/config.js';

const base = { tipo: 'mec', objetivo: 0, rows: [], paste: '' };

test('Plantillas solo ofrece tipos sin pestaña propia', () => {
  assert.deepEqual(tiposPlantilla(), ['mec', 'custom']);
  assert.equal(TPL.riego.pestana, 'riego');
  assert.equal(TPL.fert.pestana, 'fertilizacion');
});

test('la vista de Plantillas no lista Riego ni Fertilización y enlaza a sus pestañas', () => {
  const html = viewTemplates();
  const opciones = [...html.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(opciones, ['mec', 'custom']);
  assert.match(html, /data-view="riego"/);
  assert.match(html, /data-view="fertilizacion"/);
});

test('el estado inicial de Plantillas usa un tipo vigente', () => {
  assert.ok(tiposPlantilla().includes(S.tpl.tipo));
});

test('registros antiguos de fertilización o riego se descartan al cargar', () => {
  for (const tipo of ['fert', 'riego']) {
    const r = normalizarTpl({ tipo, objetivo: 150, rows: [{ fecha: '2026-01-10', lote: 'L1', valor: 40 }] }, base);
    assert.deepEqual(r, base);
  }
  const ok = normalizarTpl({ tipo: 'custom', objetivo: 5, rows: [{ fecha: '2026-01-10', lote: 'L1', valor: 4 }] }, base);
  assert.equal(ok.tipo, 'custom');
  assert.equal(ok.rows.length, 1);
});

test('un respaldo antiguo con plantilla de riego no rompe la importación', () => {
  const txt = exportarTexto(demoFarm(), { modulosActivos: [...CONFIG.modulosActivos], niveles: { ...CONFIG.niveles } }, { tipo: 'riego', objetivo: 9, rows: [{ fecha: 'a', lote: 'b', valor: 1 }], paste: '' });
  const r = importarTexto(txt);
  assert.ok(tiposPlantilla().includes(r.tpl.tipo));
  assert.deepEqual(r.tpl.rows, []);
});
