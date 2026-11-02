// Menú «Más» abierto: su bloque pasa al frente para que la caja no quede detrás de la tarjeta siguiente
// (la animación de entrada deja una capa por bloque; pasó con la tarjeta «6 de 8 hechos», 2026-11-02).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('el bloque con un menú «Más» abierto sube al frente en inicio, vistas y secciones', () => {
  const regla = css.split('\n').find((l) => l.includes('.menu-mas[open]') && l.includes('z-index'));
  assert.ok(regla, 'falta la regla que sube el bloque con el menú «Más» abierto');
  for (const contenedor of ['#app>', '.inicio>', '.sec-cuerpo>']) {
    assert.ok(regla.includes(`${contenedor}:has(`) && regla.split(`${contenedor}:has(`)[1].split(')')[0].includes('.menu-mas[open]'), `falta ${contenedor}`);
  }
});
