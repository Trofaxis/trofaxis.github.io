// Relación entre módulos: pares únicos, r de Pearson, puntos y avisos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/core/config.js';
import { demoFarm } from '../src/core/state.js';
import { CASOS_EJEMPLO } from '../src/casos/ejemplos.js';
import { pares, pearson, fuerza, puntos, relaciones, frase } from '../src/casos/relaciones.js';
import { dispersion } from '../src/ui/charts.js';

test('n módulos dan n(n−1)/2 pares, sin repetir A-B y B-A', () => {
  assert.deepEqual(pares(['a', 'b', 'c']), [['a', 'b'], ['a', 'c'], ['b', 'c']]);
  for (const n of [2, 3, 4, 5]) assert.equal(pares([...'abcde'].slice(0, n)).length, (n * (n - 1)) / 2);
});

test('la r de Pearson da 1, −1 y null cuando no está definida', () => {
  assert.equal(pearson([1, 2, 3, 4], [2, 4, 6, 8]), 1);
  assert.equal(pearson([1, 2, 3, 4], [8, 6, 4, 2]), -1);
  assert.equal(pearson([1, 2], [1, 2]), null, 'menos de 3 puntos');
  assert.equal(pearson([1, 2, 3], [5, 5, 5]), null, 'una variable sin variación');
  // Valor conocido: x = 1..5, y = [2, 4, 5, 4, 5] → r = 0,7746
  assert.ok(Math.abs(pearson([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]) - 0.7746) < 1e-4);
});

test('fuerza usa los cortes de CONFIG', () => {
  assert.equal(fuerza(0.1), 'débil o nula');
  assert.equal(fuerza(-0.5), 'moderada');
  assert.equal(fuerza(0.75), 'fuerte');
  assert.equal(fuerza(null), null);
});

test('por defecto son 5 módulos y 10 gráficos, con un punto por finca', () => {
  const rel = relaciones(CASOS_EJEMPLO, demoFarm(), CONFIG);
  assert.equal(rel.ids.length, 5);
  assert.equal(rel.pares.length, 10);
  assert.equal(rel.puntos.length, CASOS_EJEMPLO.length + 1);
  assert.equal(rel.puntos.filter((p) => p.origen === 'actual').length, 1);
  for (const p of rel.puntos) for (const id of rel.ids) assert.ok(p.v[id] >= 0 && p.v[id] <= 100);
});

test('con solo fincas de ejemplo y pocas fincas, el panel lo avisa', () => {
  const rel = relaciones(CASOS_EJEMPLO, demoFarm(), CONFIG);
  assert.ok(rel.soloEjemplo);
  assert.ok(rel.avisos.some((a) => /ejemplo/.test(a)));
  assert.ok(rel.avisos.some((a) => /Solo \d+ fincas/.test(a)));
  const muchos = Array.from({ length: 25 }, (_, i) => ({ id: `p${i}`, origen: 'propio', etiqueta: 'x', perfil: { scores: { poli: i / 25, fert: 0.5, agua: 0.2, suelo: 0.1, troficas: (i % 3) / 3 } } }));
  assert.deepEqual(relaciones(muchos, null, CONFIG).avisos, []);
});

test('los datos compartidos solo avisan en los pares que los tienen', () => {
  const rel = relaciones(CASOS_EJEMPLO, null, CONFIG);
  const par = (a, b) => rel.pares.find((p) => p.a === a && p.b === b);
  assert.match(par('fert', 'agua').aviso, /distancia al cuerpo de agua/);
  assert.deepEqual(par('fert', 'troficas').compartidos, []);
  assert.equal(par('fert', 'troficas').aviso, null);
  for (const k of Object.keys(CONFIG.relaciones.compartidos)) {
    const [a, b] = k.split('|');
    assert.ok(par(a, b), `la clave ${k} no corresponde a ningún par`);
  }
});

test('un módulo desactivado sale de los gráficos', () => {
  const cfg = { ...CONFIG, modulosActivos: CONFIG.modulosActivos.filter((m) => m !== 'agua') };
  const rel = relaciones(CASOS_EJEMPLO, null, cfg);
  assert.ok(!rel.ids.includes('agua'));
  assert.equal(rel.pares.length, 6);
});

test('la frase nunca dice que un riesgo cause el otro', () => {
  const base = { nombreA: 'Polinizadores', nombreB: 'Fertilización', n: 12 };
  assert.match(frase({ ...base, r: 0.8, fuerza: 'fuerte' }), /no prueba que uno cause/);
  assert.match(frase({ ...base, r: 0.1, fuerza: 'débil o nula' }), /débil o nula/);
  assert.match(frase({ ...base, r: null, fuerza: null }), /No se puede calcular/);
  for (const r of [0.8, -0.8, 0.5]) assert.doesNotMatch(frase({ ...base, r, fuerza: fuerza(r) }), /(provoca|aumenta el riesgo de|causa que)/);
});

test('los casos de la nube (solo perfil) también son puntos', () => {
  const nube = [{ id: 'nube-1', origen: 'nube', etiqueta: 'Caso de la comunidad', perfil: { scores: { poli: 0.5, fert: 0.2, agua: 0.9 } } }];
  const pts = puntos(nube, null, ['poli', 'fert', 'agua'], CONFIG);
  assert.deepEqual(pts[0].v, { poli: 50, fert: 20, agua: 90 });
});

test('el gráfico dibuja un punto por finca y el rombo de la finca actual', () => {
  const rel = relaciones(CASOS_EJEMPLO, demoFarm(), CONFIG);
  const svg = dispersion(rel.pares[0], rel.puntos);
  assert.equal((svg.match(/<circle /g) || []).length, CASOS_EJEMPLO.length);
  assert.equal((svg.match(/<path d="M/g) || []).length, 1);
});

test('con pocas fincas no califica la fuerza y muestra cuánto cambia la r al quitar una', () => {
  const rel = relaciones(CASOS_EJEMPLO, demoFarm(), CONFIG);
  const p = rel.pares.find((x) => x.a === 'agua' && x.b === 'suelo');
  assert.equal(p.suficiente, false);
  assert.ok(p.rango[0] <= p.r && p.r <= p.rango[1]);
  const t = frase(p);
  assert.match(t, /pocas para calificar/);
  assert.match(t, /Quitando una finca a la vez/);
  assert.doesNotMatch(t, /fuerte|moderada/);
});

test('la r coincide con un cálculo hecho a mano sobre los puntos del gráfico', () => {
  const rel = relaciones(CASOS_EJEMPLO, demoFarm(), CONFIG);
  for (const p of rel.pares) {
    const x = rel.puntos.map((q) => q.v[p.a]), y = rel.puntos.map((q) => q.v[p.b]);
    const mx = x.reduce((s, v) => s + v) / x.length, my = y.reduce((s, v) => s + v) / y.length;
    const cov = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0);
    const sx = Math.sqrt(x.reduce((s, v) => s + (v - mx) ** 2, 0)), sy = Math.sqrt(y.reduce((s, v) => s + (v - my) ** 2, 0));
    assert.ok(Math.abs(p.r - cov / (sx * sy)) < 1e-12, `${p.a}-${p.b}`);
  }
});
