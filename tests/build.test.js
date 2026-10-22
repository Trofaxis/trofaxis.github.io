import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  importsDiferidos, entradasDiferidas, reescribirIndex, leerAppShell, appShellPublicado, versionCache, reescribirSw,
} from '../scripts/build.mjs';

// Estas pruebas no necesitan esbuild: revisan las piezas del build que deciden qué se publica.
// El build completo corre en GitHub Actions (npm run build) y falla si algo de esto no se cumple.

test('el build encuentra cada vista diferida de src y todas existen', () => {
  const entradas = entradasDiferidas();
  for (const vista of ['ui/riego.js', 'ui/fertilizacion.js', 'ui/plaguicidas.js', 'riego/xlsx.js', 'riego/csv.js', 'riego/extraer.js', 'fert/extraer.js']) {
    assert.ok(entradas.includes(vista), `falta ${vista}`);
  }
  for (const entrada of entradas) assert.ok(fs.existsSync(path.join('src', entrada)), `no existe src/${entrada}`);
});

test('el build rechaza un import() que no sabría empaquetar', () => {
  assert.deepEqual(importsDiferidos("const v = (i) => import(conIntento('./ui/x.js', i));", 'a.js'), ['./ui/x.js']);
  assert.deepEqual(importsDiferidos("import('./ui/x.js'); // un import() comentado", 'a.js'), []);
  assert.throws(() => importsDiferidos('const v = (ruta) => import(ruta);', 'a.js'), /import\(conIntento/);
  assert.throws(() => importsDiferidos('import(`./ui/${nombre}.js`);', 'a.js'), /import\(conIntento/);
});

test('index.html publicado carga app/app.js y precarga sus archivos comunes', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const publicado = reescribirIndex(html, ['app/comun/chunk-A.js']);
  assert.ok(!publicado.includes('src="src/app.js"'));
  assert.match(publicado, /<link rel="modulepreload" href="app\/comun\/chunk-A\.js">\s*<script type="module" src="app\/app\.js"><\/script>/);
  assert.match(publicado, /<script type="module" src="pwa\.js"><\/script>/, 'conserva el control PWA');
  assert.match(publicado, /href="src\/styles\.css"/, 'los estilos siguen en src');
  assert.throws(() => reescribirIndex('<html></html>'), /una sola vez/);
});

test('el app shell publicado cambia los módulos de src por los de app y deja estilos, fuentes e íconos', () => {
  const shellFuente = leerAppShell(fs.readFileSync('sw.js', 'utf8'));
  const shell = appShellPublicado(shellFuente, ['app/app.js', 'app/app.js.map', 'app/ui/riego.js', 'app/comun/chunk-A.js']);
  assert.ok(!shell.some((r) => r.startsWith('/src/') && r.endsWith('.js')), 'sin módulos de src');
  assert.ok(!shell.some((r) => r.endsWith('.map')), 'sin mapas de fuente');
  for (const r of ['/', '/index.html', '/pwa.js', '/manifest.webmanifest', '/src/styles.css', '/src/fonts/inter-latin-wght-normal.woff2', '/icons/trofaxis-192.png', '/app/app.js', '/app/ui/riego.js', '/app/comun/chunk-A.js']) {
    assert.ok(shell.includes(r), `falta ${r}`);
  }
});

test('el sw.js publicado lleva su propio app shell y versión, con la misma lógica', () => {
  const sw = fs.readFileSync('sw.js', 'utf8');
  const shell = ['/', '/app/app.js'];
  const publicado = reescribirSw(sw, shell, 'trofaxis-shell-000000000000');
  assert.deepEqual(leerAppShell(publicado), shell);
  assert.match(publicado, /const CACHE_NAME = 'trofaxis-shell-000000000000';/);
  assert.equal(publicado.replace(/const APP_SHELL = \[[\s\S]*?\];/, '').replace(/const CACHE_NAME = '[^']+';/, ''),
    sw.replace(/const APP_SHELL = \[[\s\S]*?\];/, '').replace(/const CACHE_NAME = '[^']+';/, ''), 'solo cambian la lista y la versión');
});

test('la versión de caché del build usa la misma regla que la prueba del service worker', () => {
  const sw = fs.readFileSync('sw.js', 'utf8');
  const nombre = sw.match(/const CACHE_NAME = '([^']+)'/)[1];
  assert.equal(versionCache('.', leerAppShell(sw)), nombre);
});
