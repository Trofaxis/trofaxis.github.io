import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
  assert.match(html, /<meta name="theme-color" content="#EDF2EC" media="\(prefers-color-scheme: light\)">/);
  assert.match(html, /<meta name="theme-color" content="#06110D" media="\(prefers-color-scheme: dark\)">/);
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
  for (const size of ['192x192', '512x512']) {
    const cualquier = manifiesto.icons.find((i) => i.sizes === size && i.purpose === 'any');
    const adaptable = manifiesto.icons.find((i) => i.sizes === size && i.purpose === 'maskable');
    assert.notEqual(adaptable.src, cualquier.src, `el ícono adaptable ${size} debe tener su propio archivo`);
    assert.match(adaptable.src, /trofaxis-maskable-/);
  }
});

test('el service worker administra su caché y precarga un app shell que existe en el repo', () => {
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

test('el app shell incluye todos los JavaScript, estilos y fuentes dentro de src', () => {
  const sw = leer('sw.js');
  const bloque = sw.match(/const APP_SHELL = (\[[\s\S]*?\]);/);
  assert.ok(bloque, 'falta la lista de archivos del app shell');
  const shell = new Set(JSON.parse(bloque[1]));
  const recursosFuente = [];
  const recorrer = (directorio) => {
    for (const entrada of fs.readdirSync(directorio, { withFileTypes: true })) {
      const ruta = path.join(directorio, entrada.name);
      if (entrada.isDirectory()) recorrer(ruta);
      else if (/\.(?:js|css|woff2)$/i.test(entrada.name)) {
        recursosFuente.push(`/${ruta.split(path.sep).join('/')}`);
      }
    }
  };
  recorrer('src');
  const faltantes = recursosFuente.filter((recurso) => !shell.has(recurso));
  assert.deepEqual(faltantes, [], `faltan recursos de src en APP_SHELL: ${faltantes.join(', ')}`);
});

test('la versión de caché cambia si cambia el contenido de cualquier recurso del app shell', () => {
  const sw = leer('sw.js');
  const shell = JSON.parse(sw.match(/const APP_SHELL = (\[[\s\S]*?\]);/)[1]);
  const hash = createHash('sha256');
  for (const recurso of shell) {
    const ruta = recurso === '/' ? 'index.html' : path.normalize(recurso.replace(/^\//, ''));
    const bytes = fs.readFileSync(ruta);
    const contenido = /\.(?:png|woff2)$/i.test(ruta)
      ? bytes
      : bytes.toString('utf8').replace(/\r\n?/g, '\n');
    hash.update(recurso).update('\0').update(contenido).update('\0');
  }
  const versionEsperada = `trofaxis-shell-${hash.digest('hex').slice(0, 12)}`;
  const versionActual = sw.match(/const CACHE_NAME = '([^']+)'/);
  assert.ok(versionActual, 'falta CACHE_NAME');
  assert.equal(versionActual[1], versionEsperada, `CACHE_NAME debe ser '${versionEsperada}'; actualízalo si cambió un recurso del APP_SHELL`);
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
    Request: class { constructor(url, opciones) { this.url = url; this.cache = opciones?.cache; } },
    fetch: () => Promise.reject(new Error('sin conexión')),
    caches: {
      match: (request) => Promise.resolve(request === '/' ? htmlLocal : null),
      open: () => Promise.resolve({
        addAll: (solicitudes) => { archivosPrecargados = solicitudes; return Promise.resolve(); },
        put: () => Promise.resolve(),
        match: (request) => Promise.resolve(new URL(request.url ?? request, 'https://trofaxis.github.io').pathname === '/' ? htmlLocal : undefined),
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
  const rutas = archivosPrecargados.map((solicitud) => solicitud.url);
  assert.ok(rutas.includes('/src/app.js'));
  assert.ok(rutas.includes('/manifest.webmanifest'));

  let respuesta;
  listeners.fetch({
    request: { url: 'https://trofaxis.github.io/', method: 'GET', mode: 'navigate' },
    respondWith: (promesa) => { respuesta = promesa; },
  });
  assert.equal(await respuesta, htmlLocal);
});

test('al instalar una versión revalida cada archivo con el servidor para no guardar copias HTTP viejas', async () => {
  const listeners = {};
  let precargadas = [];
  const contexto = {
    URL,
    Promise,
    Request: class { constructor(url, opciones) { this.url = url; this.cache = opciones?.cache; } },
    caches: {
      open: async () => ({ addAll: async (solicitudes) => { precargadas = solicitudes; } }),
      keys: async () => [],
      delete: async () => true,
    },
    self: {
      location: { origin: 'https://trofaxis.github.io' },
      clients: { claim: async () => {} },
      addEventListener: (tipo, callback) => { listeners[tipo] = callback; },
      skipWaiting: async () => {},
    },
  };
  const sw = leer('sw.js');
  const shell = JSON.parse(sw.match(/const APP_SHELL = (\[[\s\S]*?\]);/)[1]);
  vm.runInNewContext(sw, contexto);

  let instalacion;
  listeners.install({ waitUntil: (promesa) => { instalacion = promesa; } });
  await instalacion;
  assert.deepEqual(Array.from(precargadas, (solicitud) => solicitud.url), shell);
  assert.ok(precargadas.every((solicitud) => solicitud.cache === 'no-cache'), 'cada archivo debe pedirse con cache: no-cache');
});

test('el service worker abre cada archivo del app shell desde la caché de su versión sin esperar a la red', async () => {
  const listeners = {};
  const solicitud = { url: 'https://trofaxis.github.io/src/app.js', method: 'GET', mode: 'cors' };
  const guardada = { version: 'guardada' };
  const deLaRed = { ok: true, type: 'basic', version: 'red', clone() { return this; } };
  const cachesAbiertas = [];
  const guardados = [];
  let copia = guardada;
  let llamadasRed = 0;
  const contexto = {
    URL,
    Promise,
    fetch: async () => { llamadasRed += 1; return deLaRed; },
    caches: {
      match: async () => { throw new Error('no debe buscar en todas las cachés'); },
      open: async (nombre) => {
        cachesAbiertas.push(nombre);
        return { addAll: async () => {}, put: async (...args) => { guardados.push(args); }, match: async () => copia };
      },
      keys: async () => [],
      delete: async () => true,
    },
    self: {
      location: { origin: 'https://trofaxis.github.io' },
      clients: { claim: async () => {} },
      addEventListener: (tipo, callback) => { listeners[tipo] = callback; },
      skipWaiting: async () => {},
    },
  };
  const sw = leer('sw.js');
  const nombreCache = sw.match(/const CACHE_NAME = '([^']+)'/)[1];
  vm.runInNewContext(sw, contexto);

  let respuesta;
  listeners.fetch({ request: solicitud, respondWith: (promesa) => { respuesta = promesa; } });
  assert.equal(await respuesta, guardada, 'debe entregar la copia guardada');
  assert.equal(llamadasRed, 0, 'con copia guardada no consulta la red');
  assert.deepEqual(cachesAbiertas, [nombreCache], 'solo busca en la caché de su propia versión');

  copia = undefined;
  let sinCopia;
  listeners.fetch({ request: solicitud, respondWith: (promesa) => { sinCopia = promesa; } });
  assert.equal(await sinCopia, deLaRed, 'si falta la copia, la trae de la red');
  assert.equal(guardados.length, 1, 'y la guarda para la próxima vez');
  assert.equal(guardados[0][0], solicitud);
});

test('sin copia guardada, el service worker revalida por HTTP los recursos propios', async () => {
  const listeners = {};
  const cacheUsada = [];
  const respuesta = { ok: true, type: 'basic', clone() { return this; } };
  const contexto = {
    URL,
    Promise,
    fetch: async (request, opciones) => { cacheUsada.push(opciones?.cache); return respuesta; },
    caches: {
      match: async () => null,
      open: async () => ({ addAll: async () => {}, put: async () => {}, match: async () => undefined }),
      keys: async () => [],
      delete: async () => true,
    },
    self: {
      location: { origin: 'https://trofaxis.github.io' },
      clients: { claim: async () => {} },
      addEventListener: (tipo, callback) => { listeners[tipo] = callback; },
      skipWaiting: async () => {},
    },
  };
  vm.runInNewContext(leer('sw.js'), contexto);

  for (const solicitud of [
    { url: 'https://trofaxis.github.io/src/app.js', method: 'GET', mode: 'cors' },
    { url: 'https://trofaxis.github.io/', method: 'GET', mode: 'navigate' },
  ]) {
    let promesa;
    listeners.fetch({ request: solicitud, respondWith: (valor) => { promesa = valor; } });
    assert.equal(await promesa, respuesta);
  }
  assert.deepEqual(cacheUsada, ['no-cache', 'no-cache']);
});

test('la entrada a la app abre desde la caché aunque traiga parámetros, y las demás páginas consultan la red', async () => {
  const listeners = {};
  const paginaGuardada = { version: 'guardada' };
  const paginaPublicada = { ok: true, type: 'basic', version: 'publicada', clone() { return this; } };
  const busquedas = [];
  const pedidosRed = [];
  const contexto = {
    URL,
    Promise,
    fetch: async (request) => { pedidosRed.push(request.url); return paginaPublicada; },
    caches: {
      match: async () => paginaGuardada,
      open: async () => ({
        addAll: async () => {},
        put: async () => {},
        match: async (request, opciones) => { busquedas.push([request.url, opciones?.ignoreSearch]); return paginaGuardada; },
      }),
      keys: async () => [],
      delete: async () => true,
    },
    self: {
      location: { origin: 'https://trofaxis.github.io' },
      clients: { claim: async () => {} },
      addEventListener: (tipo, callback) => { listeners[tipo] = callback; },
      skipWaiting: async () => {},
    },
  };
  vm.runInNewContext(leer('sw.js'), contexto);
  const navegar = async (url) => {
    let respuesta;
    listeners.fetch({ request: { url, method: 'GET', mode: 'navigate' }, respondWith: (promesa) => { respuesta = promesa; } });
    return respuesta;
  };

  assert.equal(await navegar('https://trofaxis.github.io/?code=prueba'), paginaGuardada);
  assert.equal(await navegar('https://trofaxis.github.io/index.html'), paginaGuardada);
  assert.deepEqual(busquedas.map(([, ignorar]) => ignorar), [true, true], 'la entrada ignora los parámetros de la dirección');
  assert.deepEqual(pedidosRed, [], 'la entrada no espera a la red');

  assert.equal(await navegar('https://trofaxis.github.io/trofaxis-guia/'), paginaPublicada, 'otras páginas siguen yendo a la red');
  assert.deepEqual(pedidosRed, ['https://trofaxis.github.io/trofaxis-guia/']);

  contexto.fetch = async () => { throw new Error('sin conexión'); };
  assert.equal(await navegar('https://trofaxis.github.io/trofaxis-guia/'), paginaGuardada, 'sin red, otras páginas usan la copia guardada de la app');
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
      document: { visibilityState: 'visible', activeElement: null, getElementById: (id) => nodos[id], addEventListener: () => {} },
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

async function abrirPwaConRegistro({ workerEnEspera = null } = {}) {
  const eventosVentana = {};
  const eventosDocumento = {};
  const eventosRegistro = {};
  const eventosAccion = {};
  const mensajes = [];
  let tiempo = 100_000;
  let llamadasRegistro = 0;
  let llamadasUpdate = 0;
  let recargas = 0;
  const registro = {
    waiting: workerEnEspera,
    installing: null,
    addEventListener: (tipo, callback) => { eventosRegistro[tipo] = callback; },
    update: () => { llamadasUpdate += 1; return Promise.resolve(); },
  };
  if (workerEnEspera) workerEnEspera.postMessage = (mensaje) => mensajes.push(mensaje);
  const nodos = {
    'estado-pwa': { hidden: true },
    'mensaje-pwa': { textContent: '' },
    'accion-pwa': {
      hidden: true,
      textContent: '',
      dataset: {},
      addEventListener: (tipo, callback) => { eventosAccion[tipo] = callback; },
    },
  };
  const document = {
    visibilityState: 'visible',
    activeElement: null,
    getElementById: (id) => nodos[id],
    addEventListener: (tipo, callback) => { eventosDocumento[tipo] = callback; },
  };
  class FechaFalsa { static now() { return tiempo; } }
  const entorno = {
    document,
    localStorage: { getItem: () => null },
    navigator: {
      onLine: true,
      serviceWorker: {
        controller: {},
        addEventListener: (tipo, callback) => { eventosVentana[`serviceWorker:${tipo}`] = callback; },
        register: () => { llamadasRegistro += 1; return Promise.resolve(registro); },
      },
    },
    window: {
      addEventListener: (tipo, callback) => { eventosVentana[tipo] = callback; },
      location: { reload: () => { recargas += 1; } },
    },
    Date: FechaFalsa,
    Promise,
  };
  vm.runInNewContext(leer('pwa.js'), entorno);
  await Promise.resolve();
  await Promise.resolve();
  return {
    nodos, document, registro, mensajes,
    llamadasUpdate: () => llamadasUpdate,
    llamadasRegistro: () => llamadasRegistro,
    recargas: () => recargas,
    fijarTiempo: (nuevo) => { tiempo = nuevo; },
    emitirDocumento: (tipo, evento = {}) => eventosDocumento[tipo]?.(evento),
    emitirVentana: (tipo, evento = {}) => eventosVentana[tipo]?.(evento),
    emitirAccion: (tipo, evento = {}) => eventosAccion[tipo]?.(evento),
  };
}

test('busca actualizaciones al abrir y volver al frente con un máximo de una consulta por minuto', async () => {
  const pwa = await abrirPwaConRegistro();
  assert.equal(pwa.llamadasRegistro(), 1, 'al abrir, el registro del service worker comprueba la versión publicada');
  assert.equal(pwa.llamadasUpdate(), 0, 'no duplica la consulta que ya hace register() al abrir');

  pwa.document.visibilityState = 'hidden';
  pwa.emitirDocumento('visibilitychange');
  pwa.document.visibilityState = 'visible';
  pwa.fijarTiempo(130_000);
  pwa.emitirDocumento('visibilitychange');
  pwa.emitirVentana('pageshow', { persisted: true });
  assert.equal(pwa.llamadasUpdate(), 0, 'los eventos dentro del minuto se agrupan con la comprobación de apertura');

  pwa.fijarTiempo(160_000);
  pwa.emitirDocumento('visibilitychange');
  assert.equal(pwa.llamadasUpdate(), 1, 'una vez transcurrido el minuto vuelve a revisar');
  pwa.emitirVentana('pageshow', { persisted: true });
  pwa.emitirVentana('pageshow', { persisted: false });
  assert.equal(pwa.llamadasUpdate(), 1, 'pageshow repetidos no superan el límite ni fuerzan una revisión');
});

test('no recarga sin que la persona toque «Actualizar» y recarga solo una vez tras activarlo', async () => {
  const worker = {};
  const pwa = await abrirPwaConRegistro({ workerEnEspera: worker });
  assert.equal(pwa.nodos['estado-pwa'].hidden, false);
  assert.match(pwa.nodos['mensaje-pwa'].textContent, /Hay una versión nueva/);
  assert.equal(pwa.recargas(), 0, 'el aviso por sí solo no recarga');

  pwa.emitirAccion('click');
  assert.equal(pwa.mensajes.length, 1);
  assert.equal(pwa.mensajes[0].type, 'SKIP_WAITING');
  pwa.emitirVentana('serviceWorker:controllerchange');
  pwa.emitirVentana('serviceWorker:controllerchange');
  assert.equal(pwa.recargas(), 1, 'la elección de actualizar produce una sola recarga');
});

test('si se toca actualizar desde un campo activo, conserva la página hasta que la persona decida de nuevo', async () => {
  const worker = {};
  const pwa = await abrirPwaConRegistro({ workerEnEspera: worker });
  const campo = { tagName: 'INPUT', type: 'text' };
  pwa.document.activeElement = campo;
  pwa.emitirDocumento('pointerdown', { target: pwa.nodos['accion-pwa'] });
  pwa.document.activeElement = pwa.nodos['accion-pwa'];
  pwa.emitirAccion('click');

  assert.equal(pwa.recargas(), 0);
  assert.equal(pwa.mensajes.length, 0, 'no activa el worker mientras se edita');
  assert.match(pwa.nodos['mensaje-pwa'].textContent, /Termina o guarda lo que estás escribiendo/);

  pwa.emitirAccion('click');
  assert.equal(pwa.mensajes.length, 1, 'la persona puede actualizar al volver al aviso');
  assert.equal(pwa.mensajes[0].type, 'SKIP_WAITING');
});

test('también protege la edición cuando se llega al aviso con el teclado', async () => {
  const worker = {};
  const pwa = await abrirPwaConRegistro({ workerEnEspera: worker });
  const campo = { tagName: 'TEXTAREA', type: '' };
  pwa.emitirDocumento('focusout', { target: campo, relatedTarget: pwa.nodos['accion-pwa'] });
  pwa.document.activeElement = pwa.nodos['accion-pwa'];
  pwa.emitirAccion('click');
  assert.equal(pwa.mensajes.length, 0);
  assert.match(pwa.nodos['mensaje-pwa'].textContent, /Termina o guarda lo que estás escribiendo/);
});

test('si otra ventana activa la versión nueva, esta pide recargar en vez de dejar un «Actualizar» sin efecto', async () => {
  const worker = {};
  const pwa = await abrirPwaConRegistro({ workerEnEspera: worker });
  assert.match(pwa.nodos['mensaje-pwa'].textContent, /Hay una versión nueva/);
  pwa.emitirVentana('serviceWorker:controllerchange');
  assert.equal(pwa.recargas(), 0, 'no recarga sola: puede haber algo sin guardar');
  assert.match(pwa.nodos['mensaje-pwa'].textContent, /se actualizó en otra ventana/);
  assert.equal(pwa.nodos['accion-pwa'].textContent, 'Recargar');

  pwa.document.activeElement = { tagName: 'INPUT', type: 'text' };
  pwa.emitirAccion('click');
  assert.equal(pwa.recargas(), 0, 'protege lo que se está escribiendo');
  pwa.document.activeElement = pwa.nodos['accion-pwa'];
  pwa.emitirAccion('click');
  assert.equal(pwa.recargas(), 1);
  assert.equal(pwa.mensajes.length, 0, 'no envía SKIP_WAITING a un worker ya activo');
});

test('en localhost no registra el service worker salvo con ?sw, para ver el código recién editado', () => {
  const abrir = (location) => {
    let registros = 0, quitados = 0;
    const nodos = { 'estado-pwa': { hidden: true }, 'mensaje-pwa': { textContent: '' }, 'accion-pwa': { hidden: true, textContent: '', dataset: {}, addEventListener: () => {} } };
    vm.runInNewContext(leer('pwa.js'), {
      document: { visibilityState: 'visible', activeElement: null, getElementById: (id) => nodos[id], addEventListener: () => {} },
      localStorage: { getItem: () => null },
      navigator: { onLine: true, serviceWorker: { controller: null, addEventListener: () => {}, register: () => { registros += 1; return new Promise(() => {}); }, getRegistrations: () => Promise.resolve([{ unregister: () => { quitados += 1; } }]) } },
      window: { addEventListener: () => {}, location: { reload: () => {}, ...location } },
      Date, Promise,
    });
    return () => ({ registros, quitados });
  };
  assert.equal(abrir({ hostname: 'localhost', search: '' })().registros, 0);
  assert.equal(abrir({ hostname: '127.0.0.1', search: '?sw' })().registros, 1);
  assert.equal(abrir({ hostname: 'trofaxis.github.io', search: '' })().registros, 1);
});
