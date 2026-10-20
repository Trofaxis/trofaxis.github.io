import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { debeSubir } from '../src/nube/sincronia.js';

// Hallazgo A (Trofaxis Next): el código guarda solo en la nube mientras hay sesión. README, docs/nube.md
// y la política de privacidad tienen que decir lo mismo; si alguien cambia el comportamiento, esta prueba lo obliga a revisar los textos.
const leer = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('el código sube solo con sesión y nunca la finca de ejemplo', () => {
  const base = { sesion: { token: 't' }, listo: true, local: { nombre: 'Finca ficticia' }, demo: false, conflicto: false, ultima: '' };
  assert.equal(debeSubir(base), true);
  assert.equal(debeSubir({ ...base, sesion: null }), false);
  assert.equal(debeSubir({ ...base, demo: true }), false);
  assert.equal(debeSubir({ ...base, conflicto: true }), false);
});

test('README, docs/nube.md y privacidad describen el guardado automático', () => {
  for (const p of ['README.md', 'docs/nube.md', 'privacidad/index.html']) {
    assert.match(leer(p), /se guarda \*{0,2}sola|se sube sola|Guardado automático/i, p);
  }
  assert.doesNotMatch(leer('README.md'), /solo si inicias sesión \(enlace al correo, sin contraseñas\) y pulsas/);
  assert.match(leer('docs/nube.md'), /mixto/);
});
