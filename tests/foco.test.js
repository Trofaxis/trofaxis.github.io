// Foco del teclado: tras redibujar la vista, el control usado vuelve a tener el foco (issue 39).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectorDeFoco, controlParaFoco } from '../src/ui/foco.js';

const boton = (dataset) => ({ tagName: 'BUTTON', id: '', dataset });

test('un botón de mes se identifica por data-month y data-path', () => {
  assert.equal(selectorDeFoco(boton({ month: '3', path: 'farm.floracionMeses' })), 'button[data-month="3"][data-path="farm.floracionMeses"]');
});

test('el simulador y las acciones de fila se identifican por sus data-*', () => {
  assert.equal(selectorDeFoco(boton({ sim: 'n' })), 'button[data-sim="n"]');
  assert.equal(selectorDeFoco(boton({ act: 'del-cult', i: '2' })), 'button[data-act="del-cult"][data-i="2"]');
  assert.equal(selectorDeFoco(boton({ act: 'gg', v: 'si' })), 'button[data-act="gg"][data-v="si"]');
});

test('un control con id se identifica por su id; sin id y sin data-* no hay selector', () => {
  assert.equal(selectorDeFoco({ tagName: 'INPUT', id: 'w-dist', dataset: {} }), '[id="w-dist"]');
  assert.equal(selectorDeFoco({ tagName: 'INPUT', id: '', dataset: {} }), null);
  assert.equal(selectorDeFoco(boton({})), null);
  assert.equal(selectorDeFoco(null), null);
});

test('los valores con comillas o barras se escapan y no rompen el selector', () => {
  assert.equal(selectorDeFoco(boton({ act: 'a"b\\c' })), 'button[data-act="a\\"b\\\\c"]');
});

test('los atributos en camelCase se escriben como data-* con guiones', () => {
  assert.equal(selectorDeFoco(boton({ plagIndex: '1' })), 'button[data-plag-index="1"]');
});

test('con más de un control igual no se adivina: no se devuelve ninguno', () => {
  const uno = { n: 1 }, dos = { n: 2 };
  const raiz = (lista) => ({ querySelectorAll: () => lista });
  assert.equal(controlParaFoco(raiz([uno]), 'x'), uno);
  assert.equal(controlParaFoco(raiz([uno, dos]), 'x'), null);
  assert.equal(controlParaFoco(raiz([]), 'x'), null);
  assert.equal(controlParaFoco(raiz([uno]), null), null);
});
