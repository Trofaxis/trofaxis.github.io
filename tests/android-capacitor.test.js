import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { copiarWeb } from '../android-app/scripts/copiar-web.mjs';
import { crearPuenteCapacitor, sesionDeURLProfunda, urlRetornoAuth } from '../src/core/capacitor-auth.js';

test('el copiado para Android incluye la web necesaria y deja fuera docs, pruebas, Supabase y referencias', () => {
  const temporal = fs.mkdtempSync(path.join(os.tmpdir(), 'trofaxis-capacitor-'));
  const raizRepo = path.join(temporal, 'repo');
  const destino = path.join(temporal, 'android-app', 'www');
  for (const archivo of [
    'index.html', 'manifest.webmanifest', 'pwa.js', 'pwa.css', 'sw.js',
    'src/app.js', 'icons/trofaxis-192.png', 'privacidad/index.html',
    'docs/interior.md', 'tests/interior.test.js', 'supabase/functions/funcion.js',
    'capturas/referencia.png',
  ]) {
    const ruta = path.join(raizRepo, archivo);
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
    fs.writeFileSync(ruta, archivo === 'index.html' ? '<script type="module" src="pwa.js"></script><script type="module" src="src/app.js"></script>' : archivo);
  }

  try {
    copiarWeb({ raizRepo, destino });
    for (const archivo of [
      'index.html', 'manifest.webmanifest', 'pwa.js', 'pwa.css', 'sw.js',
      'src/app.js', 'icons/trofaxis-192.png', 'privacidad/index.html',
    ]) assert.equal(fs.existsSync(path.join(destino, archivo)), true, `no se copió ${archivo}`);
    for (const carpeta of ['docs', 'tests', 'supabase', 'capturas']) {
      assert.equal(fs.existsSync(path.join(destino, carpeta)), false, `se copió ${carpeta}`);
    }
    assert.doesNotMatch(fs.readFileSync(path.join(destino, 'index.html'), 'utf8'), /src="pwa\.js"/,
      'la copia nativa no debe arrancar el service worker web');
  } finally {
    const absoluto = path.resolve(temporal);
    assert.ok(absoluto.startsWith(path.resolve(os.tmpdir())), 'el temporal debe estar dentro de tmp');
    fs.rmSync(absoluto, { recursive: true, force: true });
  }
});

test('el puente registra Browser y App solo en Capacitor nativo y cierra Browser al volver', async () => {
  let registros = 0;
  let abrir = null;
  let callback = null;
  let cerrados = 0;
  const capacitorWeb = { isNativePlatform: () => false, registerPlugin: () => { throw new Error('no debe registrarse'); } };
  assert.equal(crearPuenteCapacitor(capacitorWeb), null);

  const capacitorNativo = {
    isNativePlatform: () => true,
    registerPlugin(nombre) {
      registros += 1;
      if (nombre === 'App') return {
        addListener: async (evento, fn) => { assert.equal(evento, 'appUrlOpen'); callback = fn; return { remove() {} }; },
        getLaunchUrl: async () => null,
      };
      assert.equal(nombre, 'Browser');
      return { open: async (opciones) => { abrir = opciones.url; }, close: async () => { cerrados += 1; } };
    },
  };
  const puente = crearPuenteCapacitor(capacitorNativo);
  assert.ok(puente);
  await puente.preparar((url) => { assert.equal(url, 'io.github.trofaxis.app://login#access_token=x'); });
  await puente.abrirLogin('https://login.example');
  await callback({ url: 'io.github.trofaxis.app://login#access_token=x' });
  assert.equal(abrir, 'https://login.example');
  assert.equal(cerrados, 1);
  assert.equal(registros, 2);
});

test('el inicio normal conserva su retorno web y Android usa el esquema profundo de Trofaxis', () => {
  const location = { origin: 'https://trofaxis.github.io', pathname: '/index.html' };
  assert.equal(urlRetornoAuth({ isNativePlatform: () => false }, location), 'https://trofaxis.github.io/index.html');
  assert.equal(urlRetornoAuth({ isNativePlatform: () => true }, location), 'io.github.trofaxis.app://login');
});

test('el regreso de Android analiza el fragmento con el mismo lector de sesión que la web', () => {
  const jwt = `x.${Buffer.from(JSON.stringify({ sub: 'usuario-ficticio', email: 'ficticio@example.test', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.y`;
  const sesion = sesionDeURLProfunda(`io.github.trofaxis.app://login#access_token=${jwt}&expires_in=3600&refresh_token=renovacion-ficticia`);
  assert.equal(sesion.uid, 'usuario-ficticio');
  assert.equal(sesion.email, 'ficticio@example.test');
  assert.equal(sesionDeURLProfunda('https://otro-sitio.example/#access_token=x'), null);
});

test('la preparación Android no añade dependencias ni comandos al package.json raíz', () => {
  const paquete = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(Object.hasOwn(paquete, 'dependencies'), false);
  assert.equal(Object.hasOwn(paquete, 'devDependencies'), false);
  assert.deepEqual(paquete.scripts, { test: 'node --test tests/*.test.js' });
});

test('gitignore excluye activos generados, compilaciones Android, llaves y paquetes', () => {
  const ignorar = fs.readFileSync('.gitignore', 'utf8');
  for (const patron of [
    'android-app/www/', 'android-app/node_modules/', 'android-app/android/.gradle/',
    'android-app/android/local.properties', 'android-app/android/**/build/',
    '*.apk', '*.aab', '*.jks', '*.keystore', 'google-services.json',
  ]) assert.ok(ignorar.split(/\r?\n/).includes(patron), `falta ignorar ${patron}`);
});

test('src/app.js mantiene el retorno web y enruta el login nativo por Browser', () => {
  const app = fs.readFileSync('src/app.js', 'utf8');
  assert.match(app, /urlRetornoAuth\(window\.Capacitor,location\)/);
  assert.match(app, /puenteCapacitor\.abrirLogin\(/);
  assert.match(app, /sesionDeURLProfunda\(url\)/);
});

test('la configuración Capacitor fija nombre, id y origen HTTPS local', () => {
  const config = JSON.parse(fs.readFileSync('android-app/capacitor.config.json', 'utf8'));
  assert.equal(config.appId, 'io.github.trofaxis.app');
  assert.equal(config.appName, 'Trofaxis');
  assert.equal(config.server.androidScheme, 'https');
  assert.equal(config.server.hostname, 'localhost');
  assert.equal(config.webDir, 'www');
});

test('Android captura el enlace de login y usa el ícono maskable ya existente', () => {
  const manifiesto = fs.readFileSync('android-app/android/app/src/main/AndroidManifest.xml', 'utf8');
  assert.match(manifiesto, /android:scheme="io\.github\.trofaxis\.app" android:host="login"/);
  assert.match(manifiesto, /android:launchMode="singleTask"/);
  for (const recurso of ['ic_launcher.xml', 'ic_launcher_round.xml']) {
    const xml = fs.readFileSync(`android-app/android/app/src/main/res/mipmap-anydpi-v26/${recurso}`, 'utf8');
    assert.match(xml, /@drawable\/trofaxis_maskable/);
  }
  assert.deepEqual(
    fs.readFileSync('android-app/android/app/src/main/res/drawable-nodpi/trofaxis_maskable.png'),
    fs.readFileSync('icons/trofaxis-maskable-512.png'),
    'el ícono nativo se deriva sin cambios del ícono maskable existente',
  );
});

test('las dependencias Capacitor usan versiones exactas estables en android-app', () => {
  const paquete = JSON.parse(fs.readFileSync('android-app/package.json', 'utf8'));
  assert.deepEqual(paquete.dependencies, {
    '@capacitor/android': '8.5.3',
    '@capacitor/app': '8.1.2',
    '@capacitor/browser': '8.0.5',
    '@capacitor/core': '8.5.3',
  });
  assert.deepEqual(paquete.devDependencies, { '@capacitor/cli': '8.5.3' });
  assert.deepEqual(paquete.overrides, { xcode: { uuid: '11.1.1' } });
});
