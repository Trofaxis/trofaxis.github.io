// Motor con rúbrica aditiva: puntajes de referencia, confianza, pesos y simulador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluar } from '../src/core/engine.js';
import { CONFIG } from '../src/core/config.js';
import { demoFarm, emptyFarm } from '../src/core/state.js';

import { porCortes, puntuar } from '../src/core/rubrica.js';

const resumen = (f, cfg, extra) => evaluar(f, cfg, extra).mods.map((m) => [m.id, m.score, m.level, +m.conf.toFixed(2)]);

// Valores de referencia de la rúbrica v1 (criterio propio). Si cambian pesos o cortes, se actualizan aquí a propósito.
test('finca demostrativa: puntajes de referencia de la rúbrica', () => {
  assert.deepEqual(resumen(demoFarm()), EXPECT_DEMO);
});

test('finca vacía: sin datos no hay riesgo inventado y la confianza es baja', () => {
  assert.deepEqual(resumen(emptyFarm()), EXPECT_EMPTY);
});

test('cortes: normales, inversos y sin dato', () => {
  assert.deepEqual([0, 1, 2].map((x) => porCortes(x, { cortes: [0, 1] })), [0, 50, 100]);
  assert.deepEqual([150, 60, 10].map((x) => porCortes(x, { cortes: [100, 30], inverso: true })), [0, 50, 100]);
  assert.equal(porCortes(null, { cortes: [0, 1] }), null);
});

test('rúbrica: promedio ponderado solo con las variables que tienen dato', () => {
  const r = puntuar([{ nombre: 'a', peso: 60, puntaje: 100 }, { nombre: 'b', peso: 20, puntaje: 0 }, { nombre: 'c', peso: 20, puntaje: null }]);
  assert.equal(r.score, 75); // (60·100 + 20·0) / 80
  assert.equal(r.conf, 0.8);
  assert.equal(r.driver, 'a');
});

test('los pesos de cada módulo suman 100', () => {
  for (const [id, vars] of Object.entries(CONFIG.rubrica)) {
    assert.equal(Object.values(vars).reduce((s, v) => s + (v.peso ?? 0), 0), 100, id);
  }
});

test('el diseño de riego cargado entra al módulo Agua', () => {
  const f = demoFarm();
  const sin = evaluar(f).mods.find((m) => m.id === 'agua');
  const conError = evaluar(f, CONFIG, { riego: [{ nivel: 'error' }] }).mods.find((m) => m.id === 'agua');
  const bien = evaluar(f, CONFIG, { riego: [{ nivel: 'ok' }] }).mods.find((m) => m.id === 'agua');
  assert.ok(conError.score > sin.score && bien.score < sin.score);
  assert.equal(conError.conf, 1);
  assert.ok(sin.conf < 1); // sin diseño cargado, falta un dato
  // Riego abierto en blanco (sin hallazgos) no cuenta como "diseño correcto".
  const vacio = evaluar(f, CONFIG, { riego: [] }).mods.find((m) => m.id === 'agua');
  assert.equal(vacio.score, sin.score);
});

test('desactivar un módulo lo quita del resultado', () => {
  const cfg = { ...CONFIG, modulosActivos: ['poli', 'agua'] };
  assert.deepEqual(evaluar(demoFarm(), cfg).mods.map((m) => m.id), ['poli', 'agua']);
});

test('cada variable tiene puntaje 0, 50, 100 o sin dato, y dice su estado de evidencia', () => {
  for (const m of evaluar(demoFarm()).mods) {
    for (const v of m.variables) {
      assert.ok([0, 50, 100, null].includes(v.puntaje), `${m.id}.${v.id}`);
      assert.ok(['verificado', 'secundario', 'no verificado', 'criterio propio'].includes(v.estado), `${m.id}.${v.id}`);
    }
  }
});

const EXPECT_DEMO = [["poli",88,"Alto",1],["fert",60,"Medio",1],["agua",71,"Alto",0.67],["suelo",63,"Medio",1],["troficas",58,"Medio",1]];
const EXPECT_EMPTY = [["poli",0,"Bajo",0],["fert",0,"Bajo",0],["agua",0,"Bajo",0],["suelo",0,"Bajo",0],["troficas",0,"Bajo",0]];

import { simular } from '../src/core/engine.js';

test('índice global: promedio ponderado de los módulos activos', () => {
  const R = evaluar(demoFarm());
  const esperado = Math.round(R.mods.reduce((s, m) => s + m.score * CONFIG.pesos[m.id], 0));
  assert.equal(R.overall, esperado);
  const solo = evaluar(demoFarm(), { ...CONFIG, modulosActivos: ['poli'] });
  assert.equal(solo.overall, R.mods.find((m) => m.id === 'poli').score); // con un solo módulo, el índice es ese módulo
});

test('presión por mes: febrero y marzo acumulan coincidencias en la finca demo', () => {
  const R = evaluar(demoFarm());
  assert.ok(R.mh[1].includes('Aplicación durante floración visitada'));
  assert.ok(R.mh[2].includes('Aplicación en mes de cosecha'));
  assert.equal(R.mh[3].length, 0);
});

test('el simulador baja el riesgo y no modifica la finca original', () => {
  const f = demoFarm();
  const antes = JSON.stringify(f);
  const R = evaluar(f);
  const RS = simular(f, { n: true, pol: true, riego: true, suelo: true, selec: true });
  assert.equal(JSON.stringify(f), antes);
  assert.ok(RS.overall < R.overall);
  assert.equal(RS.mods.find((m) => m.id === 'poli').score < R.mods.find((m) => m.id === 'poli').score, true);
});

import { intensidadMeses } from '../src/ui/charts.js';
test('intensidadMeses agrupa por módulo sin alterar mh', () => {
  const mh = Array.from({ length: 12 }, () => []);
  mh[3] = ['Aplicación durante floración visitada', 'Aplicación en mes de cosecha', 'Amplio espectro con plaga presente'];
  const r = intensidadMeses(mh);
  assert.equal(r[3].n, 3);
  assert.deepEqual(r[3].mods, { Polinizadores: 1, 'Cadenas tróficas': 2 });
  assert.equal(r[0].n, 0);
});
test('toda coincidencia de evaluar() tiene módulo asignado', () => {
  const R = evaluar(demoFarm());
  intensidadMeses(R.mh).forEach((x) => assert.ok(!('Otro' in x.mods)));
});

import { filaIntensidad } from '../src/ui/charts.js';
test('la fila de intensidad tiene una celda por mes, igual que el calendario (issue #14)', () => {
  const mh = Array.from({ length: 12 }, () => []);
  mh[2] = ['Aplicación durante floración visitada', 'Suelo desnudo con lluvia'];
  const html = filaIntensidad(mh);
  assert.equal((html.match(/<td /g) || []).length, 12);
  assert.equal((html.match(/<th /g) || []).length, 1);
  assert.match(html, /<b>2<\/b><span>Pol<\/span><span>Sue<\/span>/);
});

test('una pregunta sin responder no cuenta como dato: la finca vacía tiene confianza 0 en todos los módulos', () => {
  const f = emptyFarm();
  assert.deepEqual([f.pendiente, f.distAgua, f.riego, f.labranza], [null, null, null, null]);
  evaluar(f).mods.forEach((m) => assert.equal(m.conf, 0, `${m.id} no debería tener confianza sin respuestas`));
});

test('responder una pregunta sí cuenta: «Sin riego» y «plana» son respuestas', () => {
  const R = evaluar({ ...emptyFarm(), riego: 'ninguno', pendiente: 'plana', distAgua: 500, labranza: 'cero' });
  const conf = Object.fromEntries(R.mods.map((m) => [m.id, m.conf]));
  assert.ok(conf.agua > 0 && conf.suelo > 0 && conf.fert > 0);
});

test('sin responder, las recomendaciones no inventan problemas (distancia al agua y riego)', () => {
  const R = evaluar(emptyFarm());
  const recs = R.mods.flatMap((m) => m.recs).join(' | ');
  assert.ok(!/franja de amortiguamiento/.test(recs));
  assert.ok(!/diseño de riego/.test(recs));
});

// ---- Un módulo sin datos no es riesgo cero ----
import { perfil } from '../src/casos/perfil.js';

test('finca sin respuestas: ningún módulo tiene datos suficientes y el índice lo dice', () => {
  const R = evaluar(emptyFarm());
  assert.ok(R.mods.every((m) => m.suficiente === false));
  assert.equal(R.sinDatos, true);
  assert.equal(R.parcial, false);
});

test('la finca demostrativa tiene datos suficientes en todos los módulos y su índice no cambia', () => {
  const R = evaluar(demoFarm());
  assert.ok(R.mods.every((m) => m.suficiente));
  assert.equal(R.sinDatos, false);
  assert.equal(R.parcial, false);
});

test('un módulo sin datos no diluye el índice global', () => {
  // Solo Agua tiene respuestas: riego por gravedad y cuerpo de agua a 10 m (ambas de riesgo máximo).
  const R = evaluar({ ...emptyFarm(), riego: 'gravedad', distAgua: 10 });
  const agua = R.mods.find((m) => m.id === 'agua');
  assert.equal(agua.suficiente, true);
  assert.equal(R.parcial, true);
  assert.equal(R.overall, agua.score); // antes el 0 de los otros cuatro módulos lo bajaba a ~20
});

test('el umbral de confianza mínima sale de la configuración', () => {
  const f = { ...emptyFarm(), pendiente: 'fuerte' }; // Suelo: 25 de 100 puntos de peso con dato
  assert.equal(evaluar(f).mods.find((m) => m.id === 'suelo').suficiente, true);
  assert.equal(evaluar(f, { ...CONFIG, confianzaMinima: 0.5 }).mods.find((m) => m.id === 'suelo').suficiente, false);
});

test('el perfil de la memoria de casos no guarda como riesgo 0 a un módulo sin datos', () => {
  assert.deepEqual(perfil(emptyFarm()).scores, {});
  assert.deepEqual(Object.keys(perfil(demoFarm()).scores).sort(), ['agua', 'fert', 'poli', 'suelo', 'troficas']);
});
