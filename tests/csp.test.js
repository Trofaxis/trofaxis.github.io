import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CONFIG } from '../src/core/config.js';

const html = fs.readFileSync('index.html', 'utf8');
const meta = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/);
const directivas = Object.fromEntries(
  (meta?.[1] ?? '').split(';').map((d) => d.trim().split(/\s+/)).filter((d) => d[0]).map(([n, ...v]) => [n, v]),
);
const origen = (url) => new URL(url.replace(/\{[a-z]\}/g, '0')).origin;

test('index.html declara una Content-Security-Policy antes de cargar nada (issue 61)', () => {
  assert.ok(meta, 'falta el <meta http-equiv="Content-Security-Policy">');
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<link'), 'la política debe ir antes de los <link>');
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script'), 'la política debe ir antes de los <script>');
});

test('los scripts solo salen del propio sitio: sin unsafe-inline ni unsafe-eval', () => {
  assert.deepEqual(directivas['script-src'], ["'self'"]);
  assert.ok(!/unsafe-eval/.test(meta[1]));
  assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html), 'index.html no debe tener scripts en línea');
  assert.ok(!/\son[a-z]+=/i.test(html), 'index.html no debe tener manejadores on…= en línea');
  assert.ok(!/<style/i.test(html), 'index.html no debe tener <style> en línea');
});

test('connect-src e img-src nombran solo los servicios que usa la app, tomados de config.js', () => {
  assert.ok(directivas['connect-src'].includes(origen(CONFIG.clima.url)), 'falta Open-Meteo');
  assert.ok(directivas['connect-src'].includes(origen(CONFIG.nube.url)), 'falta Supabase');
  assert.ok(directivas['img-src'].includes(origen(CONFIG.mapa.capa.url)), 'faltan las teselas del mapa');
  const permitidos = new Set(["'self'", origen(CONFIG.clima.url), origen(CONFIG.nube.url), origen(CONFIG.mapa.capa.url)]);
  for (const d of ['connect-src', 'img-src', 'font-src', 'script-src']) {
    for (const v of directivas[d]) assert.ok(permitidos.has(v), `${d}: origen no previsto ${v}`);
  }
});

test('la política no nombra servicios de tipografías (las fuentes son propias)', () => {
  assert.ok(!/googleapis|gstatic|typekit|bunny/i.test(meta[1]));
  assert.deepEqual(directivas['font-src'], ["'self'"]);
});

test('sin plugins ni <base> ajenos, y los estilos en línea se limitan a atributos', () => {
  assert.deepEqual(directivas['object-src'], ["'none'"]);
  assert.deepEqual(directivas['base-uri'], ["'self'"]);
  assert.deepEqual(directivas['style-src'], ["'self'"]);
  assert.deepEqual(directivas['style-src-attr'], ["'unsafe-inline'"]);
});
