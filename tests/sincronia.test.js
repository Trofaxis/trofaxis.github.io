// Guardado automático en la nube con sesión (2026-10-16) y entrada con Google.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { demoFarm, emptyFarm } from '../src/core/state.js';
import { decidirAlEntrar, debeSubir, fincaConDatos, huella } from '../src/nube/sincronia.js';
import { crearCliente } from '../src/nube/cliente.js';

const mia = () => ({ ...emptyFarm(), nombre: 'Mi finca', depto: 'Choluteca', area: 4 });

test('una finca vacía o la de ejemplo nunca pisan la nube', () => {
  assert.equal(fincaConDatos(emptyFarm()), false);
  assert.equal(decidirAlEntrar({ local: emptyFarm(), demo: false, enNube: mia() }), 'cargar');
  assert.equal(decidirAlEntrar({ local: demoFarm(), demo: true, enNube: mia() }), 'cargar');
  assert.equal(decidirAlEntrar({ local: demoFarm(), demo: true, enNube: null }), 'nada');
  assert.equal(debeSubir({ sesion: {}, listo: true, local: emptyFarm(), demo: false, conflicto: false, ultima: '' }), false);
  assert.equal(debeSubir({ sesion: {}, listo: true, local: demoFarm(), demo: true, conflicto: false, ultima: '' }), false);
});

test('al entrar: sube si la nube está vacía, nada si son iguales, conflicto si difieren', () => {
  assert.equal(decidirAlEntrar({ local: mia(), demo: false, enNube: null }), 'subir');
  assert.equal(decidirAlEntrar({ local: mia(), demo: false, enNube: mia() }), 'nada');
  assert.equal(decidirAlEntrar({ local: mia(), demo: false, enNube: { ...mia(), area: 9 } }), 'conflicto');
});

test('solo sube con sesión, ya comparada, sin conflicto y si cambió', () => {
  const base = { sesion: { token: 't' }, listo: true, local: mia(), demo: false, conflicto: false, ultima: '' };
  assert.equal(debeSubir(base), true);
  assert.equal(debeSubir({ ...base, sesion: null }), false);
  assert.equal(debeSubir({ ...base, listo: false }), false);
  assert.equal(debeSubir({ ...base, conflicto: true }), false);
  assert.equal(debeSubir({ ...base, ultima: huella(mia()) }), false);
});

test('Continuar con Google: va a Supabase y vuelve a la app', () => {
  const c = crearCliente({ cfg: { nube: { url: 'https://x.supabase.co', clavePublicable: 'sb_publishable_x' } }, fetchFn: () => {} });
  assert.equal(c.urlGoogle('https://trofaxis.github.io/'), 'https://x.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Ftrofaxis.github.io%2F');
  const t = readFileSync(new URL('../src/ui/casos.js', import.meta.url), 'utf8');
  assert.match(t, /data-act="nube-google"/);
  assert.match(t, /se guarda sola en la nube/);
});
