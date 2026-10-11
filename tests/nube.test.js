// Etapa 2: anonimización, cliente de la nube (con fetch simulado) y casos de la comunidad en la memoria.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/core/config.js';
import { demoFarm } from '../src/core/state.js';
import { CASOS_EJEMPLO } from '../src/casos/ejemplos.js';
import { vecinos, accionesDe, resultadoDe } from '../src/casos/memoria.js';
import { casoAnonimo, limpiarTexto, perfilDeNube, casoDeNube, CLAVES_PERFIL, CLAVES_RESULTADO } from '../src/casos/anonimo.js';
import { crearCliente, nubeConfigurada, sesionDeHash, ErrorNube } from '../src/nube/cliente.js';

const fincaConDatosPersonales = () => ({
  ...demoFarm(), nombre: 'Finca Don Pedro Ramírez', depto: 'Olancho', fuenteAgua: 'Quebrada La Esperanza',
  acciones: ['Franja de 30 m en la quebrada', 'Contactar a pedro@correo.hn o al +504 9999-1234', 'Ver 14.0873, -87.2011 en el mapa', 'https://maps.example/finca-pedro'],
  resultado: { ncAntes: 4, ncDespues: 1, laminaAntes: null, laminaDespues: null },
});

test('el caso anónimo nunca trae nombre, lugar, especies ni coordenadas', () => {
  const a = casoAnonimo(fincaConDatosPersonales());
  const texto = JSON.stringify(a);
  for (const prohibido of ['Pedro', 'Ramírez', 'Olancho', 'Esperanza', 'Spathodea', 'Trigona', 'pedro@', '9999', '14.0873', '-87.2011', 'https://', 'nombre', 'depto', 'fuenteAgua', 'especies']) {
    assert.ok(!texto.includes(prohibido), `se coló: ${prohibido}`);
  }
  assert.deepEqual(Object.keys(a).sort(), ['acciones', 'perfil', 'resultado']);
});

test('el caso anónimo solo usa las claves que la base permite', () => {
  const a = casoAnonimo(fincaConDatosPersonales());
  assert.ok(Object.keys(a.perfil).every((k) => CLAVES_PERFIL.includes(k)), Object.keys(a.perfil).join());
  assert.ok(Object.keys(a.resultado).every((k) => CLAVES_RESULTADO.includes(k)));
  assert.ok(a.acciones.length <= 30);
  assert.equal(a.resultado.laminaAntes, null); // sin dato queda null, nunca 0
});

test('limpiarTexto quita coordenadas, correos, teléfonos y enlaces, pero deja el contenido útil', () => {
  assert.equal(limpiarTexto('Franja de 30 m en la quebrada'), 'Franja de 30 m en la quebrada');
  assert.ok(!/\d{2}\.\d{3}/.test(limpiarTexto('Punto 14.0873 y -87.2011')));
  assert.ok(!limpiarTexto('escribe a a@b.co').includes('@'));
  assert.ok(!limpiarTexto('llama al 2234 5678').includes('2234'));
  assert.ok(!limpiarTexto('mira www.sitio.hn/finca').includes('sitio'));
  assert.ok(!limpiarTexto('15° 30\' N').includes('15°'));
  assert.ok(limpiarTexto('x'.repeat(500)).length <= 200);
});

test('un perfil que baja de la nube se valida: lo raro se descarta, nunca se confía', () => {
  assert.equal(perfilDeNube(null), null);
  assert.equal(perfilDeNube({ cultivo: 'cafe', scores: {} }), null); // sin riesgo por módulo no se puede comparar
  const p = perfilDeNube({ cultivo: 'c'.repeat(100), riego: 'laser', pendiente: 7, distAgua: 0.5, scores: { agua: 0.4, inventado: 0.9, suelo: 'x' }, overall: 500 });
  assert.equal(p.cultivo.length, 40);
  assert.equal(p.riego, null);
  assert.equal(p.pendiente, null);
  assert.equal(p.distAgua, 0.5);
  assert.deepEqual(Object.keys(p.scores), ['agua']);
  assert.equal(p.overall, 100);
});

test('un caso de la nube se marca "nube", nunca como ejemplo ni como propio', () => {
  const a = casoAnonimo(fincaConDatosPersonales());
  const c = casoDeNube({ id: '1234-abcd', ...a });
  assert.equal(c.origen, 'nube');
  assert.equal(c.finca, undefined);
  assert.equal(casoDeNube({ id: 5, perfil: a.perfil }), null);
  assert.equal(casoDeNube({ id: 'x', perfil: 'texto' }), null);
  assert.deepEqual(resultadoDe(c), a.resultado);
});

test('los casos de la comunidad entran al k-NN junto a los de ejemplo', () => {
  const comunidad = CASOS_EJEMPLO.slice(0, 3).map((c, i) => casoDeNube({ id: `r${i}`, ...casoAnonimo(c.finca) }));
  const v = vecinos(CASOS_EJEMPLO[3].finca, [...CASOS_EJEMPLO.slice(4), ...comunidad]);
  assert.equal(v.length, CONFIG.casos.k);
  const delaNube = vecinos(CASOS_EJEMPLO[0].finca, comunidad)[0];
  assert.equal(delaNube.caso.origen, 'nube');
  assert.ok(delaNube.sim > 0.99); // es el mismo perfil, sin nombres
  assert.deepEqual(accionesDe(delaNube.caso), casoAnonimo(CASOS_EJEMPLO[0].finca).acciones);
  assert.deepEqual(accionesDe(CASOS_EJEMPLO[0]), CASOS_EJEMPLO[0].finca.acciones);
});

// ── Cliente de la nube ─────────────────────────────────────────────────────
const cfgOk = { ...CONFIG, nube: { url: 'https://x.supabase.co', clavePublicable: 'sb_publishable_prueba', maxCasos: 50 } };
const respuesta = (cuerpo, estado = 200) => ({ ok: estado < 400, status: estado, text: async () => (cuerpo === undefined ? '' : JSON.stringify(cuerpo)) });
const simulador = (...resp) => { const llamadas = []; const fn = async (url, op) => { llamadas.push({ url, ...op }); const r = resp.shift(); if (r instanceof Error) throw r; return r ?? respuesta(null); }; return { fn, llamadas }; };

test('sin url o clave la nube está apagada y nunca llama a la red', async () => {
  for (const nube of [undefined, {}, { url: '', clavePublicable: '' }, { url: 'https://x', clavePublicable: '' }]) {
    const cfg = { ...CONFIG, nube };
    assert.equal(nubeConfigurada(cfg), false);
    const s = simulador();
    const c = crearCliente({ cfg, fetchFn: s.fn });
    assert.equal(c.activo, false);
    await assert.rejects(() => c.casosComunidad(), ErrorNube);
    await assert.rejects(() => c.guardarFinca(demoFarm(), { token: 't', uid: 'u' }), /no está configurada/);
    assert.equal(s.llamadas.length, 0);
  }
});

test('sin conexión, el cliente da un error entendible y no rompe', async () => {
  const c = crearCliente({ cfg: cfgOk, fetchFn: simulador(new Error('red caída')).fn });
  await assert.rejects(() => c.casosComunidad(), /Sin conexión/);
});

test('la lectura de casos es pública: manda la clave publicable y no manda Authorization', async () => {
  const a = casoAnonimo(demoFarm());
  const s = simulador(respuesta([{ id: 'abc', ...a }, { id: 'malo', perfil: 'x' }]));
  const casos = await crearCliente({ cfg: cfgOk, fetchFn: s.fn }).casosComunidad();
  assert.equal(casos.length, 1); // el mal formado se descarta
  assert.equal(s.llamadas[0].headers.apikey, 'sb_publishable_prueba');
  assert.equal(s.llamadas[0].headers.Authorization, undefined);
  assert.match(s.llamadas[0].url, /\/rest\/v1\/casos\?select=id,perfil,acciones,resultado&order=creado\.desc&limit=50$/);
  assert.ok(!s.llamadas[0].url.includes('user_id')); // esa columna ni se pide ni se puede leer
});

test('compartir un caso envía solo el caso anónimo y la fecha del consentimiento', async () => {
  const s = simulador(respuesta(null, 201));
  const sesion = { token: 'jwt-de-prueba', uid: 'u1', email: 'a@b.co', expira: 9e9 };
  await crearCliente({ cfg: cfgOk, fetchFn: s.fn }).compartirCaso(casoAnonimo(fincaConDatosPersonales()), sesion);
  const l = s.llamadas[0];
  assert.equal(l.method, 'POST');
  assert.equal(l.headers.Authorization, 'Bearer jwt-de-prueba');
  const cuerpo = JSON.parse(l.body);
  assert.deepEqual(Object.keys(cuerpo).sort(), ['acciones', 'consentimiento', 'perfil', 'resultado', 'version']);
  assert.ok(!Number.isNaN(Date.parse(cuerpo.consentimiento)));
  assert.ok(!l.body.includes('Pedro') && !l.body.includes('Olancho'));
});

test('guardar la finca crea la primera copia y luego actualiza la misma', async () => {
  const sesion = { token: 't', uid: 'u1', email: '', expira: 9e9 };
  const s1 = simulador(respuesta([]), respuesta(null, 201));
  await crearCliente({ cfg: cfgOk, fetchFn: s1.fn }).guardarFinca(demoFarm(), sesion);
  assert.deepEqual(s1.llamadas.map((l) => l.method), ['GET', 'POST']);
  const s2 = simulador(respuesta([{ id: 'f-1' }]), respuesta(null, 204));
  await crearCliente({ cfg: cfgOk, fetchFn: s2.fn }).guardarFinca(demoFarm(), sesion);
  assert.deepEqual(s2.llamadas.map((l) => l.method), ['GET', 'PATCH']);
  assert.match(s2.llamadas[1].url, /fincas\?id=eq\.f-1$/);
});

test('cargar la finca valida lo que baja y una sesión vencida pide volver a entrar', async () => {
  const sesion = { token: 't', uid: 'u1', email: '', expira: 9e9 };
  const s = simulador(respuesta([{ datos: { nombre: 'Mi finca', area: 'mucho', pendiente: 'vertical' } }]));
  const f = await crearCliente({ cfg: cfgOk, fetchFn: s.fn }).cargarFinca(sesion);
  assert.equal(f.nombre, 'Mi finca');
  assert.equal(f.area, 0);
  assert.equal(f.pendiente, 'plana');
  const vencida = simulador(respuesta({ msg: 'jwt expired' }, 401));
  await assert.rejects(() => crearCliente({ cfg: cfgOk, fetchFn: vencida.fn }).cargarFinca(sesion), (e) => e instanceof ErrorNube && e.estado === 401);
  const vacia = simulador(respuesta([]));
  assert.equal(await crearCliente({ cfg: cfgOk, fetchFn: vacia.fn }).cargarFinca(sesion), null);
});

test('retirar mis casos no filtra por user_id (esa columna no se puede leer)', async () => {
  const s = simulador(respuesta(null, 204));
  await crearCliente({ cfg: cfgOk, fetchFn: s.fn }).retirarMisCasos({ token: 't', uid: 'u1', email: '', expira: 9e9 });
  assert.equal(s.llamadas[0].method, 'DELETE');
  assert.ok(!s.llamadas[0].url.includes('user_id'));
});

test('la sesión se lee del hash del enlace del correo y solo si es válida', () => {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const jwt = (carga) => `${b64({ alg: 'HS256' })}.${b64(carga)}.firma`;
  const ahora = Date.UTC(2026, 9, 6);
  const ok = sesionDeHash(`#access_token=${jwt({ sub: 'u1', email: 'a@b.co', exp: ahora / 1000 + 3600 })}&expires_in=3600&token_type=bearer`, ahora);
  assert.equal(ok.uid, 'u1');
  assert.equal(ok.email, 'a@b.co');
  assert.equal(ok.expira, ahora / 1000 + 3600);
  assert.equal(sesionDeHash('', ahora), null);
  assert.equal(sesionDeHash('#access_token=basura', ahora), null);
  assert.equal(sesionDeHash(`#access_token=${jwt({ email: 'sin-sub@b.co' })}&expires_in=3600`, ahora), null);
  assert.equal(sesionDeHash(`#access_token=${jwt({ sub: 'u1', exp: 1 })}`, ahora), null); // ya venció
});

// ── Renovación de la sesión ────────────────────────────────────────────────
import { necesitaRenovar, cargarSesion } from '../src/nube/cliente.js';
const conAlmacen = (valor, fn) => {
  const antes = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => (valor === undefined ? null : JSON.stringify(valor)), setItem() {}, removeItem() {} };
  try { return fn(); } finally { if (antes === undefined) delete globalThis.localStorage; else globalThis.localStorage = antes; }
};

test('la sesión del hash conserva el token de renovación', () => {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const ahora = Date.UTC(2026, 9, 6);
  const jwt = `${b64({ alg: 'HS256' })}.${b64({ sub: 'u1', email: 'a@b.co' })}.f`;
  const s = sesionDeHash(`#access_token=${jwt}&refresh_token=abc123&expires_in=3600`, ahora);
  assert.equal(s.refresh, 'abc123');
});

test('una sesión vencida se conserva si trae token de renovación, y si no, se descarta', () => {
  const ahora = Date.UTC(2026, 9, 6);
  const vencida = { token: 't', uid: 'u1', email: 'a@b.co', expira: ahora / 1000 - 10 };
  assert.equal(conAlmacen({ ...vencida, refresh: 'r1' }, () => cargarSesion(ahora)).refresh, 'r1');
  assert.equal(conAlmacen(vencida, () => cargarSesion(ahora)), null);
  assert.equal(conAlmacen({ token: 't', uid: 'u1', expira: 'x', refresh: 'r' }, () => cargarSesion(ahora)), null);
  assert.equal(conAlmacen(undefined, () => cargarSesion(ahora)), null);
});

test('se renueva cuando faltan menos de 60 s para que venza', () => {
  const ahora = Date.UTC(2026, 9, 6), seg = ahora / 1000;
  assert.equal(necesitaRenovar({ expira: seg + 3000 }, ahora), false);
  assert.equal(necesitaRenovar({ expira: seg + 30 }, ahora), true);
  assert.equal(necesitaRenovar({ expira: seg - 5 }, ahora), true);
  assert.equal(necesitaRenovar(null, ahora), false);
});

test('renovar cambia el token de renovación por una sesión nueva (y el viejo ya no sirve)', async () => {
  const ahora = Date.UTC(2026, 9, 6);
  const s = simulador(respuesta({ access_token: 'nuevo', refresh_token: 'r2', expires_in: 3600, user: { id: 'u1', email: 'a@b.co' } }));
  const nueva = await crearCliente({ cfg: cfgOk, fetchFn: s.fn }).renovarSesion({ token: 'viejo', refresh: 'r1', uid: 'u1', email: '', expira: 0 }, ahora);
  assert.deepEqual(nueva, { token: 'nuevo', refresh: 'r2', uid: 'u1', email: 'a@b.co', expira: ahora / 1000 + 3600 });
  assert.match(s.llamadas[0].url, /\/auth\/v1\/token\?grant_type=refresh_token$/);
  assert.deepEqual(JSON.parse(s.llamadas[0].body), { refresh_token: 'r1' });
  assert.equal(s.llamadas[0].headers.Authorization, undefined);
});

test('si Supabase rechaza la renovación se pide volver a entrar; sin conexión no se pierde la sesión', async () => {
  const sesion = { token: 't', refresh: 'r1', uid: 'u1', email: '', expira: 0 };
  for (const estado of [400, 401, 403]) {
    const c = crearCliente({ cfg: cfgOk, fetchFn: simulador(respuesta({ error: 'invalid_grant' }, estado)).fn });
    await assert.rejects(() => c.renovarSesion(sesion), (e) => e instanceof ErrorNube && e.estado === 401 && /vuelve a iniciar/.test(e.message));
  }
  await assert.rejects(() => crearCliente({ cfg: cfgOk, fetchFn: simulador(respuesta({ x: 1 })).fn }).renovarSesion(sesion), (e) => e.estado === 401); // respuesta incompleta
  await assert.rejects(() => crearCliente({ cfg: cfgOk, fetchFn: simulador().fn }).renovarSesion({ ...sesion, refresh: '' }), (e) => e.estado === 401); // sin token de renovación
  await assert.rejects(() => crearCliente({ cfg: cfgOk, fetchFn: simulador(new Error('red')).fn }).renovarSesion(sesion), (e) => e instanceof ErrorNube && e.estado === 0); // no es 401: la app no borra la sesión
  await assert.rejects(() => crearCliente({ cfg: cfgOk, fetchFn: simulador(respuesta({}, 500)).fn }).renovarSesion(sesion), (e) => e.estado === 500);
});
