// Cuestionario: propósito sin cultivos, plagas sugeridas por cultivo, cultivos aledaños y presencia.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluar, modulosDe } from '../src/core/engine.js';
import { CONFIG } from '../src/core/config.js';
import { emptyFarm, demoFarm } from '../src/core/state.js';
import { normalizarFinca } from '../src/core/storage.js';
import { plagasDe } from '../src/especies/plagas.js';

test('sin cultivos, el propósito enfoca los módulos; con cultivos no cambia nada', () => {
  const f = { ...emptyFarm(), tieneCultivos: false, proposito: ['polinizadores'] };
  assert.deepEqual(modulosDe(f), ['poli', 'troficas']);
  assert.deepEqual(evaluar({ ...f, proposito: ['polinizadores', 'riego'] }).mods.map((m) => m.id), ['poli', 'agua', 'troficas']);
  assert.deepEqual(modulosDe({ ...f, proposito: [] }), CONFIG.modulosActivos);
  assert.deepEqual(modulosDe({ ...f, tieneCultivos: true }), CONFIG.modulosActivos);
});

test('cada propósito apunta a módulos que existen', () => {
  for (const p of CONFIG.propositos) for (const m of p.modulos) assert.ok(CONFIG.modulosActivos.includes(m), `${p.id} → ${m}`);
});

test('plagas sugeridas según el cultivo escrito por el usuario', () => {
  assert.ok(plagasDe('Maíz').some((p) => p.startsWith('Gusano cogollero')));
  assert.ok(plagasDe('maiz amarillo').length > 0);
  assert.ok(plagasDe('Caña').length > 0);
  assert.deepEqual(plagasDe('Pitahaya'), []);
});

test('campos nuevos se validan al cargar una finca', () => {
  const f = normalizarFinca({
    tieneCultivos: false, proposito: ['riego', 'inventado'],
    cultivosAledanos: [{ nombre: ' Café ', distancia: 200 }, { nombre: '' }, { nombre: 'Maíz', distancia: -3 }],
    especies: [{ nombre: 'a', presencia: 'alta' }, { nombre: 'b', presencia: 'muchísima' }],
    plagas: [{ nombre: 'x', cultivo: 'Maíz', presencia: 'baja' }],
  });
  assert.deepEqual(f.proposito, ['riego']);
  assert.deepEqual(f.cultivosAledanos, [{ nombre: 'Café', distancia: 200 }, { nombre: 'Maíz', distancia: null }]);
  assert.equal(f.especies[0].presencia, 'alta');
  assert.equal('presencia' in f.especies[1], false);
  assert.equal(f.plagas[0].cultivo, 'Maíz');
  assert.deepEqual(normalizarFinca(demoFarm()).cultivosAledanos, demoFarm().cultivosAledanos);
});

import { grupoPresencia, nivelPresencia, textoUmbrales } from '../src/especies/presencia.js';
import { filasValidacion, csvValidacion, ESTADO_TABLA_PLAGAS } from '../src/especies/plagas.js';
import { readFileSync } from 'node:fs';

test('umbrales de presencia por grupo (issue #13): bordes de cada corte', () => {
  for (const g of ['polinizadores', 'arboles', 'malezas', 'plagas']) {
    const [a, b] = CONFIG.presencia[g].cortes;
    assert.ok(a < b, g);
    assert.equal(nivelPresencia(g, 0), 'baja');
    assert.equal(nivelPresencia(g, a), 'media');
    assert.equal(nivelPresencia(g, b - 0.01), 'media');
    assert.equal(nivelPresencia(g, b), 'alta');
  }
  assert.equal(nivelPresencia('plagas', ''), null);
  assert.equal(nivelPresencia('plagas', -1), null);
  assert.equal(nivelPresencia('cultivos', 3), null);
  assert.equal(grupoPresencia('Arbusto'), 'arboles');
  assert.equal(grupoPresencia('Cultivo'), null);
  assert.match(textoUmbrales('malezas'), /por validar/);
});

test('tabla de plagas (issue #11): columnas pedidas y nada inventado', () => {
  assert.equal(ESTADO_TABLA_PLAGAS, 'no validado');
  const filas = filasValidacion();
  assert.ok(filas.length > 30);
  for (const f of filas) {
    for (const c of ['cultivo', 'plaga', 'cientifico', 'tipo', 'zona', 'mesesPresion', 'factores', 'fuente', 'estado']) assert.ok(c in f, c);
    assert.equal(f.estado, 'por validar');
    assert.equal(f.zona, null); assert.equal(f.mesesPresion, null); assert.equal(f.factores, null);
  }
  assert.ok(filas.filter((f) => f.cultivo === 'Chile').every((f) => /Protección Vegetal/.test(f.fuente)));
});

test('docs/validacion-plagas.csv está al día con src/especies/plagas.js', () => {
  assert.equal(readFileSync(new URL('../docs/validacion-plagas.csv', import.meta.url), 'utf8'), csvValidacion());
});
