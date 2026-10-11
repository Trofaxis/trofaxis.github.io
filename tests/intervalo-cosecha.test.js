// «Aplicaciones en meses de cosecha» (Cadenas tróficas): usa el intervalo de seguridad en días cuando se conoce (issue 46).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluar } from '../src/core/engine.js';
import { emptyFarm } from '../src/core/state.js';
import { normalizarFinca } from '../src/core/storage.js';

// Tomate con cosecha en marzo y abril (meses 2 y 3, desde 0 = enero).
const finca = (plaguicidas) => normalizarFinca({
  ...emptyFarm(),
  cultivos: [{ nombre: 'Tomate', ha: 2, siembra: [0], cosecha: [2, 3] }],
  plaguicidas: plaguicidas.map((p) => ({ producto: 'Producto', clase: 'selectivo', ...p })),
});
const variable = (f) => evaluar(f).mods.find((m) => m.id === 'troficas').variables.find((v) => v.id === 'aplicacionCosecha');
const marcaCalendario = (f, mes) => evaluar(f).mh[mes].includes('Aplicación en mes de cosecha');

test('sin intervalo anotado, una aplicación en mes de cosecha cuenta (como siempre)', () => {
  const f = finca([{ meses: [2] }]);
  assert.equal(variable(f).puntaje, 100);
  assert.match(variable(f).valor, /^Mar/);
  assert.equal(marcaCalendario(f, 2), true);
});

test('con intervalo de 0 días el mes no cuenta, y la pantalla dice por qué', () => {
  const f = finca([{ meses: [2], diasCosecha: 0 }]);
  assert.equal(variable(f).puntaje, 0);
  assert.equal(variable(f).valor, 'Ninguna (Mar: intervalo de 0 días)');
  assert.equal(marcaCalendario(f, 2), false); // el calendario y la rúbrica dicen lo mismo
});

test('con 1 día o más el mes sigue contando: con meses no se sabe si fue antes o después', () => {
  for (const dias of [1, 7, 30]) assert.equal(variable(finca([{ meses: [2], diasCosecha: dias }])).puntaje, 100, `${dias} días`);
});

test('el mes solo se descarta si todos sus productos tienen intervalo de 0 días', () => {
  assert.equal(variable(finca([{ meses: [2], diasCosecha: 0 }, { meses: [2], diasCosecha: 0 }])).puntaje, 0);
  assert.equal(variable(finca([{ meses: [2], diasCosecha: 0 }, { meses: [2] }])).puntaje, 100); // uno sin dato
  assert.equal(variable(finca([{ meses: [2], diasCosecha: 0 }, { meses: [2], diasCosecha: 7 }])).puntaje, 100);
});

test('cada mes se juzga por separado', () => {
  const f = finca([{ meses: [2], diasCosecha: 0 }, { meses: [3], diasCosecha: 7 }]);
  assert.equal(variable(f).puntaje, 100);
  assert.equal(variable(f).valor, 'Abr (se compara por mes, no por día)');
  assert.equal(marcaCalendario(f, 2), false);
  assert.equal(marcaCalendario(f, 3), true);
});

test('los meses sin cosecha no cambian con el intervalo', () => {
  assert.equal(variable(finca([{ meses: [5], diasCosecha: 0 }])).puntaje, 0);
  assert.equal(variable(finca([{ meses: [5], diasCosecha: 0 }])).valor, 'Ninguna');
});

test('la variable sigue como «criterio propio» y dice su límite junto a la variable', () => {
  const v = variable(finca([{ meses: [2], diasCosecha: 7 }]));
  assert.equal(v.estado, 'criterio propio');
  assert.match(v.fuente, /meses, no días/);
  assert.match(v.fuente, /0 días/);
  const recs = evaluar(finca([{ meses: [2], diasCosecha: 7 }])).mods.find((m) => m.id === 'troficas').recs.join(' ');
  assert.match(recs, /compara meses, no días/);
});

test('lo biológico que no cuenta para las abejas sigue sin contar (igual que antes)', () => {
  assert.equal(variable(finca([{ meses: [2], clase: 'biologico' }])).puntaje, 0);
});
