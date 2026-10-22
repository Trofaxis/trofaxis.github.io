import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const leer = (f) => fs.readFileSync(f, 'utf8');
const css = leer('src/fonts/fuentes.css');

function archivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name);
    return e.isDirectory() ? archivos(ruta) : [ruta];
  });
}

test('la app no pide fuentes a Google ni a otro servicio de tipografías', () => {
  const sospechosos = /fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net|fonts\.bunny\.net|cdnjs\.cloudflare\.com\/ajax\/libs\/font/i;
  for (const f of ['index.html', ...archivos('src').filter((x) => /\.(js|css|html)$/.test(x))]) {
    assert.ok(!sospechosos.test(leer(f)), `${f} pide una fuente externa`);
  }
});

test('fuentes.css apunta a archivos que existen, en formato woff2', () => {
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/['"]/g, ''));
  assert.ok(urls.length >= 2);
  for (const u of urls) {
    assert.ok(u.endsWith('.woff2'), `${u} debe ser woff2`);
    assert.ok(fs.existsSync(path.join('src/fonts', u)), `falta src/fonts/${u}`);
  }
});

test('las familias declaradas son las que usa styles.css', () => {
  const declaradas = [...css.matchAll(/font-family:\s*'([^']+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual(declaradas, ['Fraunces', 'Inter', 'JetBrains Mono']);
  const estilos = leer('src/styles.css');
  for (const f of declaradas) assert.ok(estilos.includes(`'${f}'`), `styles.css ya no usa ${f}`);
});

test('cada fuente alojada trae su licencia OFL junto al archivo', () => {
  for (const f of ['OFL-Fraunces.txt', 'OFL-Inter.txt', 'OFL-JetBrainsMono.txt']) {
    const txt = leer(path.join('src/fonts', f));
    assert.match(txt, /SIL OPEN FONT LICENSE Version 1\.1/);
    assert.match(txt, /Copyright/);
  }
});

test('index.html precarga las mismas fuentes que declara fuentes.css y la hoja se carga antes que styles.css', () => {
  const html = leer('index.html');
  for (const m of css.matchAll(/url\(\.\/([^)]+)\)/g)) {
    assert.ok(html.includes(`href="src/fonts/${m[1]}"`), `index.html no precarga ${m[1]}`);
  }
  assert.ok(html.indexOf('src/fonts/fuentes.css') < html.indexOf('src/styles.css'));
  // Una fuente precargada necesita crossorigin aunque sea del mismo sitio; sin él el navegador la descarga dos veces.
  for (const l of html.match(/<link rel="preload"[^>]*>/g) ?? []) assert.match(l, /crossorigin/);
});
