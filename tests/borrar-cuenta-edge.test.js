import { test } from 'node:test';
import assert from 'node:assert/strict';

const { handleBorrarCuenta } = await import('../supabase/functions/borrar-cuenta/handler.js').catch(() => ({}));
const env = new Map([
  ['SUPABASE_URL', 'https://proyecto-ficticio.supabase.co'],
  ['SUPABASE_ANON_KEY', 'clave-publica-ficticia'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'clave-service-role-ficticia'],
]);

const solicitud = () => new Request('https://proyecto-ficticio.supabase.co/functions/v1/borrar-cuenta', {
  method: 'POST',
  headers: { Origin: 'https://trofaxis.github.io', Authorization: 'Bearer jwt-ficticio', 'Content-Type': 'application/json' },
  body: JSON.stringify({ confirmacion: 'BORRAR' }),
});

test('CORS permite la solicitud nativa desde el origen HTTPS local de Capacitor', async () => {
  const respuesta = await handleBorrarCuenta(new Request('https://proyecto-ficticio.supabase.co/functions/v1/borrar-cuenta', {
    method: 'OPTIONS', headers: { Origin: 'https://localhost' },
  }), { env, fetchFn: async () => { throw new Error('el preflight no debe tocar red'); } });

  assert.equal(respuesta.status, 204);
  assert.equal(respuesta.headers.get('Access-Control-Allow-Origin'), 'https://localhost');
  assert.match(respuesta.headers.get('Access-Control-Allow-Methods'), /POST/);
});

test('la función verifica la sesión y borra casos, finca y Auth en ese orden', async () => {
  assert.equal(typeof handleBorrarCuenta, 'function', 'la función Edge debe exportar su manejador para probarlo sin red');
  const llamadas = [];
  const fetchFn = async (url, opciones = {}) => {
    const u = new URL(url);
    llamadas.push({ url: `${u.origin}${u.pathname}${u.search}`, ...opciones });
    if (u.pathname === '/auth/v1/user') return new Response(JSON.stringify({ id: 'usuario-ficticio' }), { status: 200 });
    return new Response(null, { status: 204 });
  };

  const respuesta = await handleBorrarCuenta(solicitud(), { env, fetchFn });

  assert.equal(respuesta.status, 200);
  assert.deepEqual(llamadas.map((x) => new URL(x.url).pathname), [
    '/auth/v1/user', '/rest/v1/casos', '/rest/v1/fincas', '/auth/v1/admin/users/usuario-ficticio',
  ]);
  assert.match(llamadas[1].url, /casos\?user_id=eq\.usuario-ficticio$/);
  assert.match(llamadas[2].url, /fincas\?user_id=eq\.usuario-ficticio$/);
  assert.equal(llamadas[0].headers.Authorization, 'Bearer jwt-ficticio');
  assert.equal(llamadas[0].headers.apikey, 'clave-publica-ficticia');
  for (const llamada of llamadas.slice(1)) {
    assert.equal(llamada.headers.apikey, 'clave-service-role-ficticia');
    assert.equal(llamada.headers.Authorization, 'Bearer clave-service-role-ficticia');
  }
});

test('si no se valida el JWT, no revoca sesiones ni borra filas o cuenta', async () => {
  assert.equal(typeof handleBorrarCuenta, 'function', 'la función Edge debe exportar su manejador para probarlo sin red');
  const llamadas = [];
  const fetchFn = async (url) => { llamadas.push(String(url)); return new Response('{}', { status: 401 }); };

  const respuesta = await handleBorrarCuenta(solicitud(), { env, fetchFn });

  assert.equal(respuesta.status, 401);
  assert.equal(llamadas.length, 1);
  assert.match(llamadas[0], /\/auth\/v1\/user$/);
});

test('si falla borrar los casos, no se intenta borrar la finca ni Auth', async () => {
  assert.equal(typeof handleBorrarCuenta, 'function', 'la función Edge debe exportar su manejador para probarlo sin red');
  const rutas = [];
  const fetchFn = async (url) => {
    const u = new URL(url); rutas.push(u.pathname);
    if (u.pathname === '/auth/v1/user') return new Response(JSON.stringify({ id: 'usuario-ficticio' }), { status: 200 });
    if (u.pathname === '/rest/v1/casos') return new Response('{}', { status: 500 });
    return new Response(null, { status: 204 });
  };

  const respuesta = await handleBorrarCuenta(solicitud(), { env, fetchFn });

  assert.equal(respuesta.ok, false);
  assert.deepEqual(rutas, ['/auth/v1/user', '/rest/v1/casos']);
});
