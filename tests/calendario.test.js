// El calendario no distingue las filas solo por color: cada celda marcada lleva símbolo y texto accesible (issue 41).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calRow, leyendaCal, SIMBOLO_CAL } from '../src/ui/charts.js';

const celdas = (html) => html.match(/<td [\s\S]*?<\/td>/g);

test('cada celda marcada tiene símbolo visible, texto para lector de pantalla y mes', () => {
  const td = celdas(calRow('Floración visitada por polinizadores', [2], 'on-flor'));
  assert.equal(td.length, 12);
  assert.match(td[2], /<span aria-hidden="true">●<\/span>/);
  assert.match(td[2], /<span class="sr-only">Floración visitada por polinizadores en marzo<\/span>/);
});

test('las celdas sin marca quedan vacías', () => {
  const td = celdas(calRow('Siembra', [0], 'on-cult'));
  assert.doesNotMatch(td[1], /sr-only|aria-hidden/);
  assert.match(td[0], /■/);
});

test('una coincidencia de riesgo se marca con «!» y lo dice en el texto accesible', () => {
  const td = celdas(calRow('Aplicación de plaguicidas', [1, 2], 'on-apl', [1]));
  assert.match(td[1], /<span aria-hidden="true">!<\/span>/);
  assert.match(td[1], /Aplicación de plaguicidas en febrero \(coincidencia de riesgo\)/);
  assert.match(td[2], /▲/); // la otra celda de la fila no es coincidencia
});

test('cada tipo de fila tiene un símbolo distinto, y la leyenda muestra los mismos', () => {
  const simbolos = Object.values(SIMBOLO_CAL);
  assert.equal(new Set(simbolos).size, simbolos.length);
  const ley = leyendaCal();
  for (const s of simbolos) assert.ok(ley.includes(`>${s}</i>`), `la leyenda no muestra ${s}`);
  assert.match(ley, /<i class="sw hit" aria-hidden="true">!<\/i>Coincidencia de riesgo/);
});
