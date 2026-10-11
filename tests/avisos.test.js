// Región de avisos: solo ella se anuncia a los lectores de pantalla; la vista entera no (issue 40).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { anunciar } from '../src/ui/avisos.js';

test('anunciar vacía la región y luego escribe el aviso, para que uno repetido se lea de nuevo', () => {
  const region = { textContent: 'aviso anterior' };
  const pendientes = [];
  anunciar('Se importó la finca.', region, (fn) => pendientes.push(fn));
  assert.equal(region.textContent, '');
  pendientes.forEach((fn) => fn());
  assert.equal(region.textContent, 'Se importó la finca.');
});

test('sin texto la región queda vacía y sin región no pasa nada', () => {
  const region = { textContent: 'viejo' };
  const pendientes = [];
  anunciar('', region, (fn) => pendientes.push(fn));
  assert.equal(region.textContent, '');
  assert.equal(pendientes.length, 0);
  assert.doesNotThrow(() => anunciar('x', null));
});

test('index.html: la vista (#app) no es región viva y hay una región de avisos aparte', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<main[^>]*id="app"[^>]*>/);
  assert.doesNotMatch(html.match(/<main[^>]*id="app"[^>]*>/)[0], /aria-live/);
  assert.match(html, /<div id="avisos"[^>]*aria-live="polite"/);
});
