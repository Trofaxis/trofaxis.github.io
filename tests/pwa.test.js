import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const leer = (ruta) => fs.readFileSync(ruta, 'utf8');
const html = leer('index.html');

test('el panel conserva los cuatro archivos públicos que importa desde GitHub Pages', () => {
  for (const ruta of ['src/nube/cliente.js', 'src/admin/cerebro.js', 'src/styles.css', 'src/admin/cerebro.css']) {
    assert.ok(fs.existsSync(ruta), `falta la ruta pública ${ruta}`);
  }
});

test('index.html enlaza el manifiesto y el control PWA sin ampliar la CSP', () => {
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(html, /<link rel="stylesheet" href="pwa\.css">/);
  assert.match(html, /<script type="module" src="pwa\.js"><\/script>/);
  assert.match(html, /<meta name="theme-color" content="#2C5F4E">/);
  assert.match(html, /<meta http-equiv="Content-Security-Policy" content="default-src 'self';/);
});

test('el manifiesto declara Trofaxis como app en español, de alcance raíz y con íconos instalables', () => {
  const manifiesto = JSON.parse(leer('manifest.webmanifest'));
  assert.equal(manifiesto.name, 'Trofaxis');
  assert.equal(manifiesto.short_name, 'Trofaxis');
  assert.equal(manifiesto.lang, 'es');
  assert.equal(manifiesto.display, 'standalone');
  assert.equal(manifiesto.start_url, '/');
  assert.equal(manifiesto.scope, '/');
  assert.ok(manifiesto.theme_color);
  for (const [size, purpose] of [['192x192', 'any'], ['512x512', 'any'], ['192x192', 'maskable'], ['512x512', 'maskable']]) {
    const icono = manifiesto.icons.find((i) => i.sizes === size && i.purpose.split(' ').includes(purpose));
    assert.ok(icono, `falta ícono ${size} (${purpose})`);
    const png = fs.readFileSync(icono.src.replace(/^\//, ''));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${icono.src} no es PNG`);
    assert.equal(png.readUInt32BE(16), Number.parseInt(size.split('x')[0]), `tamaño incorrecto: ${icono.src}`);
    assert.equal(png.readUInt32BE(20), Number.parseInt(size.split('x')[1]), `tamaño incorrecto: ${icono.src}`);
  }
});

test('el service worker versiona y precarga un app shell que existe en el repo', () => {
  const sw = leer('sw.js');
  const bloque = sw.match(/const APP_SHELL = (\[[\s\S]*?\]);/);
  assert.ok(bloque, 'falta la lista de archivos del app shell');
  const shell = JSON.parse(bloque[1]);
  assert.ok(shell.includes('/'));
  assert.match(sw, /const CACHE_NAME = 'trofaxis-shell-[^']+';/);
  for (const url of shell) {
    const ruta = url === '/' ? 'index.html' : path.normalize(url.replace(/^\//, ''));
    assert.ok(fs.existsSync(ruta), `el app shell apunta a un archivo inexistente: ${url}`);
  }
});

test('el service worker nunca maneja ni almacena respuestas externas', () => {
  const sw = leer('sw.js');
  assert.match(sw, /url\.origin !== self\.location\.origin/);
  assert.match(sw, /request\.method !== 'GET'/);
  assert.match(sw, /request\.mode === 'navigate'/);
  assert.match(sw, /cache\.put\(request, respuesta\.clone\(\)\)/);
  assert.ok(!/kfybqlknlkxrqphwopfx\.supabase\.co|archive-api\.open-meteo\.com/.test(sw));
});

test('el service worker deja fuera Supabase y Open-Meteo en tiempo de ejecución', () => {
  const listeners = {};
  let llamadasRed = 0;
  const contexto = {
    URL,
    Promise,
    fetch: () => { llamadasRed += 1; return Promise.resolve({ ok: true, type: 'basic' }); },
    caches: {
      match: () => Promise.resolve(null),
      open: () => Promise.resolve({ addAll: () => Promise.resolve(), put: () => Promise.resolve() }),
      keys: () => Promise.resolve([]),
      delete: () => Promise.resolve(true),
    },
    self: {
      location: { origin: 'https://trofaxis.github.io' },
      clients: { claim: () => Promise.resolve() },
      addEventListener: (tipo, callback) => { listeners[tipo] = callback; },
      skipWaiting: () => Promise.resolve(),
    },
  };
  vm.runInNewContext(leer('sw.js'), contexto);

  for (const url of [
    'https://kfybqlknlkxrqphwopfx.supabase.co/rest/v1/fincas',
    'https://archive-api.open-meteo.com/v1/archive?latitude=14&longitude=-87',
  ]) {
    let interceptada = false;
    listeners.fetch({ request: { url, method: 'GET', mode: 'cors' }, respondWith: () => { interceptada = true; } });
    assert.equal(interceptada, false, `no debe interceptarse ${new URL(url).hostname}`);
  }
  assert.equal(llamadasRed, 0, 'el service worker no debe reenviar ni cachear esas solicitudes');
});

test('el service worker precarga el app shell y sirve la página guardada sin red', async () => {
  const listeners = {};
  let archivosPrecargados = [];
  const htmlLocal = { origen: 'app shell guardado' };
  const contexto = {
    URL,
    Promise,
    fetch: () => Promise.reject(new Error('sin conexión')),
    caches: {
      match: (request) => Promise.resolve(request === '/' ? htmlLocal : null),
      open: () => Promise.resolve({
        addAll: (rutas) => { archivosPrecargados = rutas; return Promise.resolve(); },
        put: () => Promise.resolve(),
      }),
      keys: () => Promise.resolve([]),
      delete: () => Promise.resolve(true),
    },
    self: {
      location: { origin: 'https://trofaxis.github.io' },
      clients: { claim: () => Promise.resolve() },
      addEventListener: (tipo, callback) => { listeners[tipo] = callback; },
      skipWaiting: () => Promise.resolve(),
    },
  };
  vm.runInNewContext(leer('sw.js'), contexto);

  let instalacion;
  listeners.install({ waitUntil: (promesa) => { instalacion = promesa; } });
  await instalacion;
  assert.ok(archivosPrecargados.includes('/src/app.js'));
  assert.ok(archivosPrecargados.includes('/manifest.webmanifest'));

  let respuesta;
  listeners.fetch({
    request: { url: 'https://trofaxis.github.io/', method: 'GET', mode: 'navigate' },
    respondWith: (promesa) => { respuesta = promesa; },
  });
  assert.equal(await respuesta, htmlLocal);
});

test('el control PWA explica el uso sin conexión según haya una sesión y permite actualizar', () => {
  const pwa = leer('pwa.js');
  assert.match(pwa, /Sin conexión: tus cambios se guardan en este equipo y se suben al volver\./);
  assert.match(pwa, /Sin conexión: tus cambios se guardan en este equipo\./);
  assert.match(pwa, /Hay una versión nueva/);
  assert.match(pwa, /beforeinstallprompt/);
  assert.match(pwa, /SKIP_WAITING/);
});

test('sin red anuncia la finca local y el texto correspondiente a la sesión', () => {
  function abrirPwa(valores) {
    const eventos = {};
    const nodos = {
      'estado-pwa': { hidden: true },
      'mensaje-pwa': { textContent: '' },
      'accion-pwa': { hidden: true, textContent: '', dataset: {}, addEventListener: () => {} },
    };
    const registro = { waiting: null, installing: null, addEventListener: () => {}, update: () => Promise.resolve() };
    const entorno = {
      document: { getElementById: (id) => nodos[id] },
      localStorage: { getItem: (clave) => valores[clave] ?? null },
      navigator: { onLine: false, serviceWorker: { controller: null, addEventListener: () => {}, register: () => Promise.resolve(registro) } },
      window: { addEventListener: (tipo, callback) => { eventos[tipo] = callback; }, location: { reload: () => {} } },
      Promise,
    };
    vm.runInNewContext(leer('pwa.js'), entorno);
    return { nodos, eventos };
  }

  const finca = JSON.stringify({ farm: { nombre: 'Nombre que no se debe mostrar' } });
  const sinSesion = abrirPwa({ 'biogap:v1': finca });
  assert.equal(sinSesion.nodos['estado-pwa'].hidden, false);
  assert.match(sinSesion.nodos['mensaje-pwa'].textContent, /Se abrió la última finca guardada en este equipo/);
  assert.match(sinSesion.nodos['mensaje-pwa'].textContent, /Sin conexión: tus cambios se guardan en este equipo\./);
  assert.ok(!sinSesion.nodos['mensaje-pwa'].textContent.includes('Nombre que no se debe mostrar'));

  const conSesion = abrirPwa({ 'biogap:v1': finca, 'biogap:sesion:v1': JSON.stringify({ token: 'token-prueba' }) });
  assert.match(conSesion.nodos['mensaje-pwa'].textContent, /Sin conexión: tus cambios se guardan en este equipo y se suben al volver\./);
});

test('al recuperar la conexión la sesión compara o sube los cambios locales', () => {
  const app = leer('src/app.js');
  assert.match(app, /addEventListener\('online'/);
  assert.match(app, /if\(S\.nube\.listo\)subidor\.pedir\(\);else sincronizarAlEntrar\(\)/);
});
