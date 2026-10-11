// Una vista que falla al dibujarse muestra un aviso con el mensaje técnico, escapado, y no deja la pantalla vacía.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlErrorVista } from '../src/ui/error-vista.js';

test('nombra la pestaña y muestra el mensaje técnico', () => {
  const h = htmlErrorVista('dashboard', new TypeError('x is not a function'));
  assert.match(h, /No se pudo dibujar «dashboard»/);
  assert.match(h, /x is not a function/);
  assert.match(h, /role="alert"/);
});

test('escapa HTML del mensaje y de la pestaña', () => {
  const h = htmlErrorVista('<b>', new Error('<img src=x onerror=alert(1)>'));
  assert.ok(!h.includes('<img') && !h.includes('<b>'));
  assert.match(h, /&lt;img/);
});

test('acepta un valor que no es Error', () => {
  assert.match(htmlErrorVista('riego', 'texto'), /texto/);
  assert.match(htmlErrorVista('riego', undefined), /sin detalle/);
});

test('app.js usa htmlErrorVista alrededor del dibujo de la vista', async () => {
  const { readFileSync } = await import('node:fs');
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /try\{html=vista\?vista\(\)[^\n]*catch\(e\)\{console\.error\(e\);html=htmlErrorVista\(S\.view,e\);\}/);
});
