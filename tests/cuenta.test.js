// Pantalla de entrada y menú de cuenta (2026-10-16).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarCuenta, mostrarEntrada, inicial } from '../src/core/cuenta.js';
import { sesionDeHash } from '../src/nube/cliente.js';
import { S } from '../src/core/state.js';
import { viewEntrar, htmlCuenta } from '../src/ui/entrar.js';

const jwt = (carga) => `x.${Buffer.from(JSON.stringify(carga)).toString('base64url')}.y`;

test('la cuenta recordada solo guarda correo, proveedor y la elección sin cuenta', () => {
  assert.deepEqual(normalizarCuenta({ email: 'a@b.co', proveedor: 'google', token: 'secreto' }), { email: 'a@b.co', proveedor: 'google', sinCuenta: false });
  assert.deepEqual(normalizarCuenta({ email: 'no-es-correo' }), { email: '', proveedor: '', sinCuenta: false });
  assert.equal(inicial('diego@x.co'), 'D');
});

test('la entrada sale sin sesión, salvo en la bienvenida o si eligió seguir sin cuenta', () => {
  const base = { nubeActiva: true, sesion: null, vista: 'dashboard', cuenta: normalizarCuenta(null) };
  assert.equal(mostrarEntrada(base), true);
  assert.equal(mostrarEntrada({ ...base, sesion: { token: 't' } }), false);
  assert.equal(mostrarEntrada({ ...base, vista: 'bienvenida' }), false);
  assert.equal(mostrarEntrada({ ...base, nubeActiva: false }), false);
  assert.equal(mostrarEntrada({ ...base, cuenta: normalizarCuenta({ sinCuenta: true }) }), false);
});

test('la sesión que vuelve de Google dice que el proveedor es google', () => {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const s = sesionDeHash(`#access_token=${jwt({ sub: 'u1', email: 'a@b.co', exp, app_metadata: { provider: 'google' } })}&expires_in=3600&refresh_token=r`);
  assert.equal(s.proveedor, 'google');
  const c = sesionDeHash(`#access_token=${jwt({ sub: 'u1', email: 'a@b.co', exp })}&expires_in=3600`);
  assert.equal(c.proveedor, 'email');
});

test('entrada con cuenta recordada y menú con confirmación para cerrar sesión', () => {
  S.cuenta = { email: 'diego@x.co', proveedor: 'google', sinCuenta: false };
  const h = viewEntrar();
  assert.match(h, /Te damos la bienvenida de nuevo/);
  assert.match(h, /data-act="entrar-cuenta"/);
  assert.match(h, /data-act="entrar-sin-cuenta"/);
  S.nube.sesion = { email: 'diego@x.co' }; S.cuentaMenu = true; S.confirmarSalir = true;
  const m = htmlCuenta();
  assert.match(m, /data-act="cuenta-salir"/);
  assert.match(m, /¿Cerrar sesión en Trofaxis\?/);
  assert.match(m, /data-act="salir-confirmar"/);
  S.nube.sesion = null; S.cuentaMenu = false; S.confirmarSalir = false;
  S.cuenta = { email: '<b>@x.co', proveedor: 'email', sinCuenta: false };
  assert.ok(!viewEntrar().includes('<b>@x.co'));
});
