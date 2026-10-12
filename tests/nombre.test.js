// La app se llama Trofaxis en lo que ve el usuario; los formatos internos conservan el nombre viejo
// para que los respaldos y los datos guardados en el navegador sigan cargando.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FORMATO, importarTexto } from '../src/core/storage.js';
import { FORMATO_MAPA } from '../src/mapa/ubicacion.js';

const html = fs.readFileSync('index.html', 'utf8');

test('la pestaña del navegador y la barra lateral dicen Trofaxis', () => {
  assert.match(html, /<title>Trofaxis<\/title>/);
  assert.match(html, /<div>Trofaxis<small>/);
  assert.doesNotMatch(html, /BioG\.A\.P\./);
});

test('los formatos de archivo no cambian con el nombre', () => {
  assert.equal(FORMATO, 'biogap-finca');
  assert.equal(FORMATO_MAPA, 'biogap-mapa');
  assert.throws(() => importarTexto('{"formato":"otra-cosa"}'), /finca de Trofaxis/);
});
