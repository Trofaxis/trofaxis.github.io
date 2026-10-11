// La fuente de cada variable se lee tocando o con teclado, no solo con el cursor (issue 42).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoFuente } from '../src/ui/components.js';

test('con fuente es un <details> con resumen enfocable y la fuente impresa dentro', () => {
  const h = estadoFuente('criterio propio', 'Rúbrica v1, criterio propio', 'fuente-poli-flor');
  assert.match(h, /^<details class="estado criterio-propio" data-keep="fuente-poli-flor" >/);
  assert.match(h, /<summary aria-label="[^"]*: ver la fuente">/);
  assert.match(h, /<p class="fuente">Rúbrica v1, criterio propio<\/p>/);
  assert.doesNotMatch(h, /title=/); // ya no depende de un tooltip
});

test('el estado abierto se conserva al redibujar', () => {
  assert.match(estadoFuente('verificado', 'FAO-56', 'k', true), /<details [^>]*\bopen>/);
  assert.doesNotMatch(estadoFuente('verificado', 'FAO-56', 'k', false), /\bopen>/);
});

test('sin fuente es solo la etiqueta, sin control que abrir', () => {
  const h = estadoFuente('no verificado', '', 'k');
  assert.match(h, /^<span class="estado no-verificado">/);
  assert.doesNotMatch(h, /details|summary/);
});

test('el texto de la fuente se escapa', () => {
  const h = estadoFuente('secundario', 'Tabla <b>8</b> "FAO"', 'k');
  assert.match(h, /Tabla &lt;b&gt;8&lt;\/b&gt; &quot;FAO&quot;/);
  assert.doesNotMatch(h, /<b>8<\/b>/);
});
