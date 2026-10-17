import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { VARIABLES, VINCULOS, validarVinculo, enConflicto, resumenVinculos, pesoDe } from '../src/cerebro/vinculos.js';
import { armarGrafo, vecinos, posicionesIniciales, paso } from '../src/cerebro/grafo.js';
import { HECHOS } from '../src/cerebro/hechos.js';
import { notasObsidian } from '../src/cerebro/obsidian.js';
import { viewCerebro } from '../src/admin/cerebro.js';

test('cada vínculo tiene mecanismo, estado y, si dice «con fuente», una fuente a favor', () => {
  for (const v of VINCULOS) assert.deepEqual(validarVinculo(v), [], v.id);
  assert.equal(new Set(VINCULOS.map((v) => v.id)).size, VINCULOS.length, 'ids únicos');
});

test('validarVinculo rechaza un vínculo sin fundamento', () => {
  const malo = { id: 'x', de: ['finca.pendiente'], a: 'riesgo.agua', sentido: '+', mecanismo: '', estado: 'con fuente', evidencia: [], usadoEn: { archivo: 'src/modules/agua.js' } };
  const e = validarVinculo(malo).join(' | ');
  assert.match(e, /falta el mecanismo/);
  assert.match(e, /ninguna fuente lo respalda/);
  assert.match(validarVinculo({ ...malo, de: ['no.existe'] }).join(' '), /variable desconocida/);
  assert.match(validarVinculo({ ...malo, estado: 'por validar', mecanismo: 'm', evidencia: [{ cita: 'c', postura: 'a favor' }] }).join(' '), /debería decir/);
});

test('cada vínculo apunta a código que existe: la variable de la rúbrica está en su archivo', () => {
  for (const v of VINCULOS) {
    const src = fs.readFileSync(v.usadoEn.archivo, 'utf8');
    if (v.usadoEn.modulo) assert.ok(src.includes(`variable('${v.usadoEn.variable}'`), `${v.id}: ${v.usadoEn.variable} en ${v.usadoEn.archivo}`);
    else assert.ok(src.includes(v.usadoEn.aviso), `${v.id}: aviso «${v.usadoEn.aviso}»`);
  }
});

test('toda variable de una rúbrica marcada como «Vínculo» tiene su fila en la matriz', () => {
  const usadas = new Set(VINCULOS.filter((v) => v.usadoEn.modulo).map((v) => `${v.usadoEn.archivo}:${v.usadoEn.variable}`));
  let n = 0;
  for (const f of fs.readdirSync('src/modules').filter((x) => x.endsWith('.js'))) {
    const src = fs.readFileSync(`src/modules/${f}`, 'utf8');
    for (const m of src.matchAll(/variable\('(\w+)'(?:(?!variable\(')[\s\S])*?Vínculo/g)) {
      n++;
      assert.ok(usadas.has(`src/modules/${f}:${m[1]}`), `${f}: ${m[1]} no está en src/cerebro/vinculos.js`);
    }
  }
  assert.ok(n >= 3, 'se encontraron los vínculos marcados en las rúbricas');
});

test('una hipótesis de la matriz no se muestra como «verificado» en su rúbrica', () => {
  for (const v of VINCULOS.filter((x) => x.usadoEn.modulo && x.estado === 'por validar')) {
    const src = fs.readFileSync(v.usadoEn.archivo, 'utf8');
    const m = src.match(new RegExp(`variable\\('${v.usadoEn.variable}'[\\s\\S]*?'(no verificado|verificado|criterio propio)'`));
    assert.ok(m, v.id);
    assert.notEqual(m[1], 'verificado', `${v.id}: la rúbrica dice «verificado» pero el vínculo es hipótesis`);
  }
});

test('una variable no choca con el id de un hecho y cada dato que usa existe', () => {
  const ids = new Set(HECHOS.map((h) => h.id));
  for (const [id, v] of Object.entries(VARIABLES)) {
    assert.ok(!ids.has(id), id);
    for (const h of v.hechos ?? []) assert.ok(ids.has(h), `${id} usa ${h}`);
  }
});

test('las hipótesis que ya suman al puntaje se cuentan para validarlas primero', () => {
  const r = resumenVinculos();
  assert.equal(r.total, VINCULOS.length);
  assert.equal(r['con fuente'] + r['criterio propio'] + r['por validar'], r.total);
  const hip = VINCULOS.filter((v) => v.estado === 'por validar' && pesoDe(v) > 0).map((v) => v.id);
  assert.equal(r.hipotesisQuePuntuan, hip.length);
  assert.ok(hip.includes('poli-agua-seca'));
  assert.equal(pesoDe(VINCULOS.find((v) => v.id === 'poli-clima')), 0, 'el clima en floración solo informa');
});

test('una fuente en contra junto a una a favor marca el vínculo en conflicto', () => {
  const v = { ...VINCULOS[0], evidencia: [{ cita: 'A', postura: 'a favor' }, { cita: 'B', postura: 'en contra' }] };
  assert.deepEqual(enConflicto([v, VINCULOS[1]]).map((x) => x.id), [v.id]);
  assert.equal(enConflicto().length, 0);
});

test('sin agrupar, el grafo solo tiene relaciones: fórmulas, vínculos y los datos que usan', () => {
  const g = armarGrafo(HECHOS, { agrupar: false });
  assert.ok(g.aristas.every((e) => ['formula', 'mecanismo', 'dato'].includes(e.tipo)));
  assert.ok(!g.nodos.some((n) => n.tipo === 'tema' || n.tipo === 'fuente'));
  assert.ok(g.nodos.every((n) => n.grado > 0), 'ningún punto suelto');
  assert.ok(g.nodos.length < armarGrafo().nodos.length);
  // La lluvia fuerte llega a Fertilización y a Suelo, y el umbral de lluvia está unido a la variable.
  const sale = vecinos(g, 'clima.mesesLluvia').filter((v) => v.tipo === 'mecanismo' && v.sale).map((v) => v.id);
  assert.ok(sale.includes('riesgo.fert') && sale.includes('riesgo.suelo'));
  assert.ok(vecinos(g, 'clima.lluviaFuerte').some((v) => v.tipo === 'dato' && v.id === 'clima.mesesLluvia'));
  // Dos vínculos de la lluvia al suelo comparten una sola línea.
  const e = g.aristas.find((x) => x.tipo === 'mecanismo' && x.a === 'clima.mesesLluvia' && x.b === 'riesgo.suelo');
  assert.deepEqual(e.vinculos.sort(), ['suelo-desnudo-lluvia', 'suelo-fert-desnudo']);
  // Sin vínculo no hay línea: la pendiente no toca a los polinizadores.
  assert.ok(!vecinos(g, 'finca.pendiente').some((v) => v.id === 'riesgo.poli'));
  const s = posicionesIniciales(g);
  let en = 0; for (let i = 0; i < 300; i++) en = paso(s);
  assert.ok(Number.isFinite(en) && en < 1, `energía final ${en}`);
});

test('las notas de Obsidian de las variables describen sus vínculos', () => {
  const notas = notasObsidian(armarGrafo());
  const lluvia = notas.find((n) => n.ruta.endsWith('/Variables/Meses de lluvia fuerte.md'));
  assert.ok(lluvia, 'nota de la variable');
  assert.match(lluvia.contenido, /## Afecta a/);
  assert.match(lluvia.contenido, /\[\[Riesgo de Fertilización\]\]/);
});

test('el panel muestra la matriz: conteo, casilla de agrupaciones y vínculos por validar', () => {
  const html = viewCerebro();
  assert.match(html, new RegExp(`${VINCULOS.length} vínculos`));
  assert.match(html, /id="cb-agrupar"/);
  assert.match(html, /Vínculos sin validar por un especialista/);
  assert.match(html, /hipótesis ya suman al puntaje/);
});
