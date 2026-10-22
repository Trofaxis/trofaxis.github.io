import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

const dom = instalarDOM();
const { S } = await import('../src/core/state.js');
const { htmlCuenta } = await import('../src/ui/entrar.js');
await import('../src/app.js');

const sesion = { token: 'jwt-ficticio', uid: 'usuario-ficticio', email: 'prueba@trofaxis.example', expira: 9e9 };
const CLAVE_FARMA = 'biogap:v1';
const CLAVE_MAPA = 'biogap:mapa:v1';
const CLAVE_SESION = 'biogap:sesion:v1';
const CLAVE_CUENTA = 'biogap:cuenta:v1';

function prepararBorrado() {
  dom.almacen.clear();
  const fincaLocal = JSON.stringify({ farm: { nombre: 'Finca local ficticia' } });
  const mapaLocal = JSON.stringify({ punto: [14.1, -87.2], sitios: [{ id: 'S1' }] });
  dom.almacen.set(CLAVE_FARMA, fincaLocal);
  dom.almacen.set(CLAVE_MAPA, mapaLocal);
  dom.almacen.set(CLAVE_SESION, JSON.stringify(sesion));
  dom.almacen.set(CLAVE_CUENTA, JSON.stringify({ email: sesion.email, proveedor: 'email' }));
  S.farm.nombre = 'Finca local ficticia'; S.demo = false; S.view = 'dashboard'; S.msg = '';
  S.nube = { ...S.nube, sesion, ocupado: false, listo: false, conflicto: false, ultima: '', estado: '', borrandoCuenta: false };
  S.cuenta = { email: sesion.email, proveedor: 'email', sinCuenta: false };
  S.cuentaMenu = true; S.confirmarSalir = false;
  S.borrarCuentaUI = { abierto: false, texto: '', error: '', ocupado: false };
  return { fincaLocal, mapaLocal, finca: structuredClone(S.farm) };
}

const proximoTurno = () => new Promise((resolve) => setImmediate(resolve));
// Espera a que se cumpla una condición (el aviso sale con un retraso de 50 ms desde el redibujado; en CI lento no basta un tiempo fijo).
const hasta = async (cond, ms = 2000) => { const fin = Date.now() + ms; while (!cond() && Date.now() < fin) await new Promise((r) => setTimeout(r, 10)); };

test('«Borrar cuenta» es una opción nueva que solo aparece con sesión', () => {
  S.cuentaMenu = true;
  S.nube.sesion = null;
  assert.doesNotMatch(htmlCuenta(), /data-act="cuenta-borrar"/);

  S.nube.sesion = sesion;
  assert.match(htmlCuenta(), /data-act="cuenta-borrar"[^>]*>Borrar cuenta/);
});

test('la confirmación ofrece exportar finca y mapa antes de escribir BORRAR', () => {
  S.nube.sesion = sesion;
  S.cuentaMenu = true;
  assert.ok(S.nube.sesion);
  dom.clic('cuenta-borrar');
  assert.equal(S.borrarCuentaUI.abierto, true);

  const html = htmlCuenta();
  assert.match(html, /Borrar tu cuenta/);
  assert.match(html, /prueba@trofaxis\.example/);
  assert.match(html, /Exportar finca/);
  assert.match(html, /Guardar mapa y censo/);
  assert.match(html, /escribe BORRAR/);
  assert.match(html, /cuenta-borrar-confirmar/);
});

test('no llama al servicio hasta que se escribe exactamente BORRAR y envía la sesión', async () => {
  prepararBorrado();
  const previo = globalThis.fetch;
  const llamadas = [];
  globalThis.fetch = async (url, opciones) => { llamadas.push({ url: String(url), opciones }); return new Response('{"ok":true}', { status: 200 }); };
  try {
    dom.clic('cuenta-borrar');
    dom.escribir('cuenta-borrar-confirmacion', 'BORRAR ');
    dom.clic('cuenta-borrar-confirmar');
    assert.equal(llamadas.length, 0);
    dom.escribir('cuenta-borrar-confirmacion', 'BORRAR');
    dom.clic('cuenta-borrar-confirmar');
    await proximoTurno();
    assert.equal(llamadas.length, 1);
    assert.match(llamadas[0].url, /\/functions\/v1\/borrar-cuenta$/);
    assert.equal(llamadas[0].opciones.headers.Authorization, 'Bearer jwt-ficticio');
    assert.equal(JSON.parse(llamadas[0].opciones.body).confirmacion, 'BORRAR');
  } finally { globalThis.fetch = previo; }
});

test('si el servidor confirma el borrado, limpia sesión y cuenta recordada y conserva finca y mapa locales', async () => {
  const antes = prepararBorrado();
  const previo = globalThis.fetch;
  globalThis.fetch = async () => new Response('{"ok":true}', { status: 200 });
  try {
    dom.clic('cuenta-borrar'); dom.escribir('cuenta-borrar-confirmacion', 'BORRAR'); dom.clic('cuenta-borrar-confirmar');
    await proximoTurno();
    await hasta(() => /La cuenta se borró/.test(dom.avisos.textContent));
    assert.equal(S.nube.sesion, null);
    assert.equal(S.borrarCuentaUI.abierto, false);
    assert.equal(dom.almacen.has(CLAVE_SESION), false);
    assert.equal(dom.almacen.has(CLAVE_CUENTA), false);
    assert.deepEqual(S.farm, antes.finca);
    assert.equal(dom.almacen.get(CLAVE_FARMA), antes.fincaLocal);
    assert.equal(dom.almacen.get(CLAVE_MAPA), antes.mapaLocal);
    assert.match(dom.avisos.textContent, /La cuenta se borró/);
  } finally { globalThis.fetch = previo; }
});

test('si falla el servidor, deja sesión, cuenta, finca y mapa locales intactos y muestra el error', async () => {
  const antes = prepararBorrado();
  const previo = globalThis.fetch;
  globalThis.fetch = async () => new Response('{"error":"No se pudo borrar tu finca de la nube."}', { status: 502 });
  try {
    dom.clic('cuenta-borrar'); dom.escribir('cuenta-borrar-confirmacion', 'BORRAR'); dom.clic('cuenta-borrar-confirmar');
    await proximoTurno();
    assert.equal(S.nube.sesion, sesion);
    assert.equal(dom.almacen.get(CLAVE_SESION), JSON.stringify(sesion));
    assert.equal(dom.almacen.get(CLAVE_CUENTA), JSON.stringify({ email: sesion.email, proveedor: 'email' }));
    assert.equal(dom.almacen.get(CLAVE_FARMA), antes.fincaLocal);
    assert.equal(dom.almacen.get(CLAVE_MAPA), antes.mapaLocal);
    assert.deepEqual(S.farm, antes.finca);
    assert.match(S.borrarCuentaUI.error, /No se pudo borrar tu finca de la nube/);
    assert.equal(S.borrarCuentaUI.abierto, true);
  } finally { globalThis.fetch = previo; }
});

test('«Borrar mis datos» sigue siendo local y no cierra sesión ni borra la cuenta recordada', () => {
  prepararBorrado();
  S.confirmReset = true;
  dom.clic('reset-yes');
  assert.equal(S.nube.sesion, sesion);
  assert.equal(dom.almacen.has(CLAVE_SESION), true);
  assert.equal(dom.almacen.has(CLAVE_CUENTA), true);
  assert.equal(dom.almacen.has(CLAVE_MAPA), false);
  assert.equal(S.farm.nombre, '');
});
