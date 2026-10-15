import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HECHOS, TEMAS, PENDIENTES, validarHecho } from '../src/cerebro/hechos.js';
import { buscar, resumen } from '../src/cerebro/consulta.js';
import { CONFIG } from '../src/core/config.js';
import { INGREDIENTES } from '../src/plag/catalogo.js';

test('cada hecho del cerebro tiene fuente o dice que es criterio propio o por validar', () => {
  for (const h of HECHOS) assert.deepEqual(validarHecho(h), [], `${h.id}: ${validarHecho(h).join('; ')}`);
});

test('los id de los hechos no se repiten', () => {
  const ids = HECHOS.map((h) => h.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('validarHecho detecta un hecho sin fuente que dice tenerla', () => {
  const malo = { id: 'x', titulo: 'x', valor: 1, tema: 'clima', estado: 'con fuente', fuente: null };
  assert.ok(validarHecho(malo).length > 0);
  assert.ok(validarHecho({ ...malo, estado: 'inventado' }).length > 0);
});

test('el cerebro lee los mismos valores que usan las fórmulas (sin copiar cifras)', () => {
  const h = (id) => HECHOS.find((x) => x.id === id);
  assert.equal(h('plag.viento').valor, CONFIG.plag.vientoMax);
  assert.equal(h('plag.hr').valor, CONFIG.plag.hrMin);
  assert.equal(h('poli.radioExclusion').valor, CONFIG.apiradar.radioExclusionM.join(' a '));
  assert.equal(HECHOS.filter((x) => x.id.startsWith('plag.dl50.')).length, INGREDIENTES.length);
});

test('ningún hecho cita a Osorio, Kuniyoshi o Tejeda mientras sus datos no estén cargados', () => {
  for (const h of HECHOS) assert.ok(!/osorio|kuniyoshi|tejeda/i.test(h.fuente?.cita ?? ''), h.id);
  assert.ok(PENDIENTES.some((p) => /Tejeda/.test(p.fuente)));
});

test('cada tema tiene hechos y el resumen cuadra con el total', () => {
  for (const t of Object.keys(TEMAS)) assert.ok(HECHOS.some((h) => h.tema === t), t);
  const r = resumen();
  assert.equal(r['con fuente'] + r['criterio propio'] + r['por validar'], r.total);
});

test('buscar encuentra por palabras, sin tildes ni mayúsculas', () => {
  assert.ok(buscar('IMIDACLOPRID').some((h) => h.id === 'plag.dl50.imidacloprid'));
  assert.ok(buscar('kc maiz').every((h) => h.id.startsWith('riego.kc.maiz')));
  assert.ok(buscar('chlorpyrifos').some((h) => h.id === 'plag.dl50.clorpirifos'), 'por sinónimo');
  assert.ok(buscar('¿cuál es el viento máximo?').some((h) => h.id === 'plag.viento'));
  assert.deepEqual(buscar(''), []);
  assert.deepEqual(buscar('zzzz'), []);
  assert.ok(buscar('ph', { tema: 'plaguicidas' }).every((h) => h.tema === 'plaguicidas'));
});

test('el cerebro no llama a la red ni a ninguna IA', () => {
  for (const f of fs.readdirSync('src/cerebro')) {
    const t = fs.readFileSync(`src/cerebro/${f}`, 'utf8');
    assert.ok(!/fetch\(|XMLHttpRequest|import\(\s*['"]https?:|anthropic|openai/i.test(t), f);
  }
});
