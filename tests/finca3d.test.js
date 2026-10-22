// Inicio en 3D («Vidrio de campo»): el dibujo de la finca solo usa lo que respondió el usuario y no inventa nada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const { demoFarm, emptyFarm } = await import('../src/core/state.js');
const { esquemaFinca, finca3d, leyendaFinca, descripcionFinca, tipoAgua, orbe, prisma, anioFinca } = await import('../src/ui/finca3d.js');

test('los lotes salen de los cultivos y su ancho sigue a las hectáreas', () => {
  const e = esquemaFinca(demoFarm());
  assert.deepEqual(e.lotes.map((l) => [l.nombre, l.ha]), [['Melón', 20], ['Maíz', 8]]);
  const ancho = e.lotes.map((l) => l.u1 - l.u0);
  assert.ok(Math.abs(ancho[0] / ancho[1] - 20 / 8) < 1e-9, 'Melón mide 2,5 veces Maíz, como sus hectáreas');
  assert.ok(Math.abs(ancho[0] - 20 / 45 * 0.92) < 1e-9, 'la parte de la finca que ocupa cada cultivo (45 ha en total)');
  const svg = finca3d(e);
  assert.match(svg, /Melón · 20 ha/);
  assert.match(svg, /Maíz · 8 ha/);
});

test('agua, árboles y fauna se cuentan de la finca; sin especies no se dibujan', () => {
  const e = esquemaFinca(demoFarm());
  assert.deepEqual(e.agua, { tipo: 'corriente', nombre: 'Quebrada', dist: 60 });
  assert.equal(e.especiesArbol, 2);
  assert.equal(e.especiesFauna, 2);
  const svg = finca3d(e);
  assert.equal((svg.match(/class="arbol"/g) || []).length, 2, 'un árbol por especie de árbol');
  assert.equal((svg.match(/class="abeja"/g) || []).length, 2, 'un punto por especie de fauna');
  assert.match(svg, />Quebrada</);
  assert.match(svg, />a 60 m</);
  assert.match(descripcionFinca(e), /Melón 20 ha, Maíz 8 ha; Quebrada a 60 m; 2 especies de árboles; 2 especies de fauna/);

  const solo = esquemaFinca({ ...emptyFarm(), area: 10, cultivos: [{ nombre: 'Café', ha: 4 }] });
  const s2 = finca3d(solo);
  assert.equal(solo.agua, null);
  assert.doesNotMatch(s2, /class="arbol"|class="abeja"|class="agua"/);
  assert.equal(leyendaFinca(solo), '');
});

test('la fuente de agua se dibuja según lo que se escribió, y «ninguna» no dibuja agua', () => {
  assert.equal(tipoAgua('Quebrada'), 'corriente');
  assert.equal(tipoAgua('Canal de río'), 'corriente');
  assert.equal(tipoAgua('Pozo profundo'), 'pozo');
  assert.equal(tipoAgua('Reservorio'), 'estanque');
  assert.equal(tipoAgua('Agua municipal'), 'otra');
  assert.equal(tipoAgua('Ninguna cercana'), null);
  assert.equal(tipoAgua(''), null);
  const e = esquemaFinca({ ...demoFarm(), fuenteAgua: 'Pozo', distAgua: null });
  assert.deepEqual(e.agua, { tipo: 'pozo', nombre: 'Pozo', dist: null });
  assert.doesNotMatch(finca3d(e), /a null m|undefined/);
});

test('una finca vacía no dibuja una finca inventada: pide los datos', () => {
  const e = esquemaFinca(emptyFarm());
  assert.equal(e.vacia, true);
  const h = finca3d(e);
  assert.doesNotMatch(h, /<svg/);
  assert.match(h, /data-view="wizard"/);
  assert.equal(leyendaFinca(e), '');
});

test('muchos cultivos se juntan en «Otros» sin perder hectáreas, y los nombres se escapan', () => {
  const cultivos = ['A', 'B', 'C', 'D', 'E', 'F'].map((n, i) => ({ nombre: n, ha: i + 1 }));
  const e = esquemaFinca({ ...emptyFarm(), area: 30, cultivos });
  assert.equal(e.lotes.length, 5);
  assert.deepEqual(e.lotes.at(-1), { ...e.lotes.at(-1), nombre: 'Otros 2 cultivos', ha: 11 });
  assert.ok(e.lotes.at(-1).u1 <= 0.96 + 1e-9, 'los lotes caben en la finca');
  const raro = finca3d(esquemaFinca({ ...emptyFarm(), area: 5, cultivos: [{ nombre: '<b>Chile</b>', ha: 2 }] }));
  assert.doesNotMatch(raro, /<b>Chile/);
  assert.match(raro, /&lt;b&gt;Chile/);
});

test('la esfera muestra el índice real o una raya sin datos; la columna crece con el puntaje', () => {
  assert.match(orbe(69, 'Alto', false), /aria-label="Índice ambiental 69 de 100, riesgo alto"/);
  assert.match(orbe(69, 'Alto', false), /data-contar="69">69</);
  const sin = orbe(0, 'Bajo', true);
  assert.match(sin, /Sin datos suficientes/);
  assert.doesNotMatch(sin, /data-contar/);
  const alto = (svg) => { const ys = [...svg.matchAll(/class="sup" points="([^"]+)"/g)][0][1].split(' ').map((p) => +p.split(',')[1]); return Math.min(...ys); };
  assert.ok(alto(prisma(88, 'Alto')) < alto(prisma(58, 'Medio')), 'a más puntaje, columna más alta');
  assert.match(prisma(null, 'Alto'), /base-vacia/);
  assert.match(prisma(null, 'Alto'), /nivel-sin/);
});

test('la franja del año usa las coincidencias de cada mes', () => {
  const mh = Array.from({ length: 12 }, (_, i) => (i === 1 ? ['x', 'y'] : i === 6 ? ['z'] : []));
  const svg = anioFinca(mh, 9);
  assert.equal((svg.match(/class="con/g) || []).length, 2);
  assert.match(svg, /febrero 2, marzo 0/);
  assert.match(svg, /class="sin hoy"/, 'octubre sin coincidencias, marcado como mes actual');
});

test('toda animación de styles.css corre solo sin «reducir movimiento»', async () => {
  const { readFileSync } = await import('node:fs');
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  const bloques = [];
  for (const m of css.matchAll(/@media \(prefers-reduced-motion:\s*no-preference\)\s*\{/g)) {
    let i = m.index + m[0].length, d = 1;
    while (d && i < css.length) { if (css[i] === '{') d++; else if (css[i] === '}') d--; i++; }
    bloques.push([m.index, i]);
  }
  const fuera = [...css.matchAll(/animation(-name)?\s*:/g)].filter((m) => !bloques.some(([a, b]) => m.index > a && m.index < b))
    .map((m) => css.slice(Math.max(0, m.index - 50), m.index + 30));
  assert.deepEqual(fuera, [], 'mueve estas animaciones dentro de @media (prefers-reduced-motion:no-preference)');
});
