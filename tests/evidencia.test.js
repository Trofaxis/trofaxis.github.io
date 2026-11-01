// Evidencia del puntaje (demo para especialistas, 2026-11-01): cada rúbrica dice qué parte de su peso tiene fuente,
// qué parte es criterio propio y qué parte es hipótesis. No cambia ningún puntaje.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const { evidencia, evidenciaGlobal } = await import('../src/core/evidencia.js');
const { S, demoFarm } = await import('../src/core/state.js');
const { evaluar } = await import('../src/core/engine.js');
const { CONFIG } = await import('../src/core/config.js');
const { conPlan } = await import('../src/fert/calculo.js');
const { viewDashboard } = await import('../src/ui/dashboard.js');

const v = (peso, estado, aplica) => ({ peso, estado, aplica });
const pct = (e) => Object.fromEntries(e.partes.map((p) => [p.id, p.pct]));

test('suma el peso por estado; verificado y fuente secundaria cuentan como «con fuente»', () => {
  const e = evidencia([v(10, 'verificado'), v(5, 'secundario'), v(25, 'criterio propio'), v(10, 'no verificado')]);
  assert.equal(e.total, 50);
  assert.deepEqual(pct(e), { fuente: 30, criterio: 50, hipotesis: 20 });
});

test('las variables que no aplican no cuentan y los porcentajes siempre suman 100', () => {
  const e = evidencia([v(1, 'verificado'), v(1, 'criterio propio'), v(1, 'no verificado'), v(99, 'verificado', false)]);
  assert.equal(e.total, 3);
  assert.equal(e.partes.reduce((s, p) => s + p.pct, 0), 100);
  assert.equal(evidencia([]).total, 0);
});

test('un estado desconocido es un error, no se esconde', () => {
  assert.throws(() => evidencia([v(10, 'probado')]), /desconocido/);
});

test('no cambia la evaluación: mismos puntajes con o sin calcular la evidencia', () => {
  const f = conPlan(demoFarm());
  const antes = evaluar(f).mods.map((m) => m.score);
  for (const m of evaluar(f).mods) evidencia(m.variables);
  assert.deepEqual(evaluar(f).mods.map((m) => m.score), antes);
});

test('cada módulo de la finca demo tiene su evidencia y Fertilización hoy es solo criterio propio', () => {
  const R = evaluar(conPlan(demoFarm()));
  const fert = R.mods.find((m) => m.id === 'fert');
  assert.deepEqual(pct(evidencia(fert.variables)), { fuente: 0, criterio: 100, hipotesis: 0 },
    'si una variable de Fertilización gana fuente, actualiza esta prueba y la guía del demo');
  const g = evidenciaGlobal(R.mods, CONFIG.pesos);
  assert.equal(g.partes.reduce((s, p) => s + p.pct, 0), 100);
  assert.ok(g.partes[0].pct < 50, 'hoy menos de la mitad del índice tiene fuente; la pantalla no debe decir otra cosa');
});

test('el dashboard muestra la evidencia en la rúbrica y el KPI «Puntaje con fuente» en la vista técnica', () => {
  const p = { farm: S.farm, demo: S.demo, vt: S.vistaTecnica };
  try {
    S.farm = demoFarm(); S.demo = true;
    S.vistaTecnica = false;
    assert.match(viewDashboard(), /Evidencia del puntaje:/);
    S.vistaTecnica = true;
    const h = viewDashboard();
    assert.match(h, /Puntaje con fuente/);
    assert.match(h, /class="ev-barra"/);
  } finally { S.farm = p.farm; S.demo = p.demo; S.vistaTecnica = p.vt; }
});
