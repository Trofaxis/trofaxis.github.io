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

test('los datos de Osorio y Kuniyoshi entran con su página o sección; Tejeda no se cita', () => {
  const tesis = HECHOS.filter((h) => /osorio|kuniyoshi/i.test(h.fuente?.cita ?? ''));
  assert.ok(tesis.length >= 10, 'datos de las dos tesis cargados');
  for (const h of tesis) assert.ok(h.pagina?.trim(), `${h.id}: falta la página o la sección`);
  assert.ok(tesis.some((h) => /2026/.test(h.fuente.cita) && /Kuniyoshi/.test(h.fuente.cita)), 'Kuniyoshi es de 2026 (portada: agosto de 2026)');
  for (const h of HECHOS) assert.ok(!/tejeda/i.test(h.fuente?.cita ?? ''), h.id);
  assert.ok(PENDIENTES.some((p) => /Tejeda/.test(p.fuente)));
  assert.ok(!PENDIENTES.some((p) => /Osorio|Kuniyoshi/.test(p.fuente)));
});

test('ningún dato de las tesis trae coordenadas', () => {
  for (const h of HECHOS.filter((x) => x.id.startsWith('poli.osorio.') || x.id.startsWith('poli.kuniyoshi.'))) {
    assert.ok(!/\b\d{6,7}\b|\b1[34]\.\d{3,}|-8[67]\.\d{3,}/.test(`${h.valor} ${h.nota}`), h.id);
  }
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
