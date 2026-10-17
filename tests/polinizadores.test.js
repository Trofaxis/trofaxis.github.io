// Polinizadores: variables basadas en Kuniyoshi (2026) y Osorio (2025).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluar } from '../src/core/engine.js';
import { emptyFarm } from '../src/core/state.js';
import { volumenCopa } from '../src/modules/polinizadores.js';

const poli = (f) => evaluar(f).mods.find((m) => m.id === 'poli');
const v = (f, id) => poli(f).variables.find((x) => x.id === id);
const esp = (o) => ({ nombre: 'x', tipo: 'Árbol', origen: 'nativa', floracion: [], atrae: false, riesgo: false, ...o });
const spath = (o = {}) => esp({ nombre: 'Spathodea campanulata', origen: 'exótica', floracion: [9, 10], atrae: true, riesgo: true, ...o });
const base = (o = {}) => ({ ...emptyFarm(), lluviaMeses: [5, 6, 8, 9], ...o });

test('volumen de copa: Osorio (2025), Ec. 3', () => {
  // V = 4/3 · π · (D/2)² · (H/2); D = 12 m, H = 9 m → 678.6 m³
  assert.ok(Math.abs(volumenCopa(12, 9) - 678.584) < 0.01);
});

test('abundancia: volumen de copa, o número de árboles si no hay medidas', () => {
  assert.equal(v(base({ especies: [spath({ cantidad: 1, copaD: 10, copaH: 8 })] }), 'abundanciaRiesgo').puntaje, 50); // 419 m³
  assert.equal(v(base({ especies: [spath({ cantidad: 3, copaD: 12, copaH: 9 })] }), 'abundanciaRiesgo').puntaje, 100); // 2 036 m³
  assert.equal(v(base({ especies: [spath({ cantidad: 1 })] }), 'abundanciaRiesgo').puntaje, 50);
  assert.equal(v(base({ especies: [spath()] }), 'abundanciaRiesgo').puntaje, null); // falta el número de árboles
  assert.equal(v(base({ especies: [esp({})] }), 'abundanciaRiesgo').puntaje, 0); // sin especies de riesgo
  assert.equal(v(base(), 'abundanciaRiesgo').puntaje, null); // sin especies: sin dato
});

test('otras flores disponibles cuando florece la especie de riesgo', () => {
  const sola = base({ especies: [spath()] });
  const conAlt = base({ especies: [spath(), esp({ nombre: 'Gliricidia sepium', floracion: [9, 10], atrae: true })] });
  assert.equal(v(sola, 'alternativas').puntaje, 100);
  assert.equal(v(conAlt, 'alternativas').puntaje, 0);
  assert.ok(poli(conAlt).score < poli(sola).score);
  assert.equal(v(sola, 'alternativas').estado, 'no verificado'); // hipótesis, no medida por Kuniyoshi
});

test('floración de riesgo en meses secos', () => {
  assert.equal(v(base({ especies: [spath({ floracion: [9] })] }), 'aguaSeca').puntaje, 0); // septiembre llueve
  assert.equal(v(base({ especies: [spath({ floracion: [0, 1] })] }), 'aguaSeca').puntaje, 100);
  assert.equal(v(base({ lluviaMeses: [], especies: [spath()] }), 'aguaSeca').puntaje, null);
  assert.equal(v(base({ especies: [esp({ atrae: true, floracion: [1] })] }), 'aguaSeca').aplica, false); // sin especies de riesgo
});

test('vínculo Fertilización → Polinizadores: foliar en floración visitada', () => {
  const ap = (mes, metodo) => ({ mes, producto: 'urea', n: 46, p: 0, k: 0, dosis: 10, metodo });
  const f = (plan) => base({ especies: [esp({ atrae: true, floracion: [2] })], fertPlan: plan });
  assert.equal(v(f([ap(2, 'foliar')]), 'foliarEnFloracion').puntaje, 100);
  assert.equal(v(f([ap(7, 'foliar')]), 'foliarEnFloracion').puntaje, 0);
  assert.equal(v(f([]), 'foliarEnFloracion').aplica, false);
});

test('cada variable de polinizadores cita su fuente o se marca como criterio propio', () => {
  const f = base({ especies: [spath({ cantidad: 2 })], plaguicidas: [{ producto: 'x', clase: 'amplio', meses: [9] }] });
  for (const x of poli(f).variables) assert.ok(x.estado === 'criterio propio' || x.fuente.length > 0, x.id);
  assert.match(v(f, 'abundanciaRiesgo').fuente, /R² = 0.21/);
});
