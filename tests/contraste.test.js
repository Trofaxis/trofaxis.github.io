import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contraste } from '../scripts/contraste.mjs';

test('contraste: negro sobre blanco es 21:1 y el orden no importa', () => {
  assert.equal(contraste('#000000', '#FFFFFF').toFixed(2), '21.00');
  assert.equal(contraste('#fff', '#000'), contraste('#000', '#fff'));
});

test('contraste: mismo color es 1:1 y el gris #767676 sobre blanco pasa AA justo', () => {
  assert.equal(contraste('#0F2A1E', '#0F2A1E'), 1);
  assert.equal(contraste('#767676', '#FFFFFF').toFixed(2), '4.54');
});

test('contraste: rechaza colores no válidos', () => {
  assert.throws(() => contraste('verde', '#fff'), /Color no válido/);
});
