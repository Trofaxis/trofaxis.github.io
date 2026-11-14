// Auditoría de integridad del cerebro y diccionario único de variables (src/cerebro/auditoria.js, diccionario.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import { auditar, validarFicha, UNIONES_CLAVE } from '../src/cerebro/auditoria.js';
import { FICHAS, POR_REVISAR, CAPAS } from '../src/cerebro/diccionario.js';
import { TESIS } from '../src/cerebro/tesis.js';
import { VARIABLES } from '../src/cerebro/vinculos.js';
import { viewAuditoria } from '../src/admin/cerebro.js';

test('el cerebro pasa la auditoría sin errores: toda variable usada tiene ficha válida y no sobran fichas', () => {
  const a = auditar();
  assert.deepEqual(a.errores, []);
  for (const id of Object.keys(VARIABLES)) assert.ok(FICHAS[id], `${id} sin ficha`);
  for (const c of TESIS.candidatas) assert.ok(FICHAS[c.id], `${c.id} sin ficha`);
  assert.equal(a.resumen.conFicha, a.resumen.variables);
});

test('una tesis con una variable sin ficha hace fallar la auditoría', () => {
  const tesis = { ...TESIS, tesis: [...TESIS.tesis, { clave: 'x', cultivo: '', items: [{ seccion: 'Relaciones', de: 'suelo.pH', a: 'suelo.inventada', sentido: '+', base: 'medido', coincidencia: 'exacta' }] }] };
  const a = auditar({ tesis });
  assert.ok(a.errores.some((e) => e.includes('suelo.inventada')));
  const sobra = auditar({ fichas: { ...FICHAS, 'suelo.sinUso': FICHAS['suelo.pH'] } });
  assert.ok(sobra.errores.some((e) => e.includes('suelo.sinUso')));
});

test('validarFicha exige unidad, tipo, capa, escala, origen del dato y motivo del rango', () => {
  assert.deepEqual(validarFicha('suelo.pH', FICHAS['suelo.pH']), []);
  const e = validarFicha('suelo.x', { unidad: '', tipo: 'otro', capa: 'luna', escala: 'galaxia', dato: 'adivinar', rango: [5, 1] });
  assert.equal(e.length, 7);
  assert.ok(validarFicha('suelo.x', { ...FICHAS['suelo.pH'], rangoFuente: undefined }).includes('un rango necesita decir por qué (rangoFuente)'));
  assert.ok(validarFicha('suelo.x', { ...FICHAS['riesgo.poli'] }).some((x) => x.includes('riesgo')));
});

test('los rangos son solo límites físicos o de definición, nunca valores normales sin fuente', () => {
  for (const [id, x] of Object.entries(FICHAS)) if (x.rango) assert.match(x.rangoFuente, /^límite/, id);
});

test('las contradicciones se buscan solo entre líneas medidas y llevan el cultivo de cada lado', () => {
  const linea = (sentido, base = 'medido') => ({ seccion: 'Relaciones', de: 'riego.lamina', a: 'cultivo.rendimiento', sentido, base, coincidencia: 'exacta' });
  const tesis = { tesis: [
    { clave: 'a', cultivo: 'arroz', items: [linea('+')] },
    { clave: 'b', cultivo: 'caña', items: [linea('−')] },
    { clave: 'c', cultivo: 'lechuga', items: [linea('0', 'citado')] },
  ], relaciones: [], candidatas: [] };
  const a = auditar({ tesis, vinculos: [] });
  assert.equal(a.contradicciones.length, 1);
  const c = a.contradicciones[0];
  assert.equal(c.opuesto, true);
  assert.deepEqual(c.sube, [{ tesis: 'a', cultivo: 'arroz' }]);
  assert.deepEqual(c.sinEfecto, [], 'una línea citada no cuenta como medida');
});

test('la revisión humana se cuenta desde revisado_por de la nota', () => {
  const a = auditar();
  assert.equal(a.sinRevisar.length + a.resumen.revisadas, TESIS.tesis.length);
  const una = { ...TESIS, tesis: TESIS.tesis.map((t, i) => (i ? t : { ...t, revisado: { por: 'X', fecha: '2026-11-14' } })) };
  assert.equal(auditar({ tesis: una }).resumen.revisadas, a.resumen.revisadas + 1);
});

test('las líneas por OCR quedan listadas para revisar a mano', () => {
  const a = auditar();
  const total = TESIS.tesis.reduce((s, t) => s + t.items.filter((it) => !String(it.coincidencia).startsWith('exacta')).length, 0);
  assert.equal(a.ocr.length, total);
  assert.equal(a.resumen.exactas + a.resumen.ocr, a.resumen.lineas);
});

test('los posibles duplicados solo nombran variables con ficha y no se unen solos', () => {
  for (const p of POR_REVISAR) { assert.ok(p.ids.length >= 2); assert.ok(p.motivo); for (const id of p.ids) assert.ok(FICHAS[id], id); }
});

test('la matriz de capas cuenta relaciones de tesis y vínculos entre capas distintas', () => {
  const a = auditar();
  assert.equal(a.capas.uniones.length, UNIONES_CLAVE.length);
  for (const [x, y] of UNIONES_CLAVE) { assert.ok(CAPAS[x], x); assert.ok(CAPAS[y], y); }
  const u = (x, y) => a.capas.uniones.find((z) => z.a === x && z.b === y);
  assert.ok(u('fertilizacion', 'suelo').tesis > 0);
  assert.ok(u('plaguicidas', 'polinizadores').vinculos > 0, 'poli-coincidencia une plaguicidas y polinizadores');
  const sinRel = auditar({ tesis: { tesis: [], relaciones: [], candidatas: [] }, vinculos: [], fichas: Object.fromEntries(Object.entries(FICHAS).filter(([id]) => VARIABLES[id])) });
  assert.equal(sinRel.resumen.huecos, UNIONES_CLAVE.length);
});

test('el panel muestra la auditoría sin inventar cifras y escapa el texto', () => {
  const html = viewAuditoria();
  const a = auditar();
  assert.match(html, /Auditoría de integridad/);
  assert.ok(html.includes(`${a.resumen.revisadas}/${a.resumen.tesis}`));
  assert.ok(html.includes(`${a.resumen.conFicha}/${a.resumen.variables}`));
  const falsa = { ...a, errores: ['<b>x</b>'], resumen: { ...a.resumen } };
  assert.ok(viewAuditoria(falsa).includes('&lt;b&gt;x&lt;/b&gt;'));
});
