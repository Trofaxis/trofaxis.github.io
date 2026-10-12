// Memoria de casos (Etapa 1): perfil, similitud, k-NN y formato del caso.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/core/config.js';
import { evaluar, nivel } from '../src/core/engine.js';
import { demoFarm, emptyFarm } from '../src/core/state.js';
import { normalizarFinca, normalizarResultado, normalizarCaso, exportarTexto, importarTexto, configBase } from '../src/core/storage.js';
import { perfil, cultivoPrincipal, normNombre } from '../src/casos/perfil.js';
import { similitud, vecinos, resumenResultado } from '../src/casos/memoria.js';
import { CASOS_EJEMPLO } from '../src/casos/ejemplos.js';

const caso = (id) => CASOS_EJEMPLO.find((c) => c.id === id);

test('los pesos del perfil suman 1', () => {
  const s = Object.values(CONFIG.casos.pesos).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(s - 1) < 1e-9);
});

test('las tres fincas protagonistas tienen riesgo bajo, medio y alto', () => {
  assert.equal(nivel(evaluar(caso('ej-a').finca).overall), 'Bajo');
  assert.equal(nivel(evaluar(caso('ej-b').finca).overall), 'Medio');
  assert.equal(nivel(evaluar(caso('ej-c').finca).overall), 'Alto');
});

test('todos los casos incluidos están marcados como ejemplo y traen resultado', () => {
  for (const c of CASOS_EJEMPLO) {
    assert.equal(c.origen, 'ejemplo', c.id);
    assert.match(c.finca.nombre, /ejemplo/i, c.id);
    assert.ok(c.finca.acciones.length > 0, c.id);
    assert.notEqual(c.finca.resultado.ncAntes, null, c.id);
  }
  assert.equal(new Set(CASOS_EJEMPLO.map((c) => c.id)).size, CASOS_EJEMPLO.length);
});

test('el nombre del cultivo se compara sin tildes ni mayúsculas', () => {
  assert.equal(normNombre(' Maíz '), 'maiz');
  const f = { ...emptyFarm(), cultivos: [{ nombre: 'Frijol', ha: 2, siembra: [], cosecha: [] }, { nombre: 'Maíz', ha: 5, siembra: [], cosecha: [] }] };
  assert.equal(cultivoPrincipal(f), 'maiz');
  assert.equal(cultivoPrincipal(emptyFarm()), null);
});

test('una finca es 100 % parecida a sí misma y la similitud es simétrica', () => {
  const a = perfil(caso('ej-a').finca), b = perfil(caso('ej-c').finca);
  assert.equal(similitud(a, a).sim, 1);
  assert.ok(Math.abs(similitud(a, b).sim - similitud(b, a).sim) < 1e-9);
  assert.ok(similitud(a, b).sim >= 0 && similitud(a, b).sim <= 1);
});

test('un dato faltante baja la cobertura, no cuenta como parecido', () => {
  const a = perfil(caso('ej-b').finca);
  const b = { ...a, propNativas: null };
  const r = similitud(a, b);
  assert.equal(r.sim, 1); // todo lo comparable es igual
  assert.ok(Math.abs(r.cobertura - (1 - CONFIG.casos.pesos.propNativas)) < 1e-9);
});

test('k-NN devuelve k casos ordenados y explica en qué se parecen', () => {
  const otros = CASOS_EJEMPLO.filter((c) => c.id !== 'ej-b');
  const v = vecinos(caso('ej-b').finca, otros);
  assert.equal(v.length, CONFIG.casos.k);
  for (let i = 1; i < v.length; i++) assert.ok(v[i - 1].sim >= v[i].sim);
  // Finca B (maíz) encuentra primero a la otra finca de maíz.
  assert.equal(v[0].caso.id, 'ej-d');
  assert.ok(v[0].parecidos.some((t) => t.startsWith('cultivo')));
});

test('la finca más parecida cambia según la finca evaluada', () => {
  const top = (id) => vecinos(caso(id).finca, CASOS_EJEMPLO.filter((c) => c.id !== id))[0].caso.id;
  assert.notEqual(top('ej-a'), top('ej-c'));
});

test('con un solo módulo activo, el perfil solo compara ese módulo', () => {
  const cfg = { ...CONFIG, modulosActivos: ['agua'] };
  const p = perfil(demoFarm(), cfg);
  assert.deepEqual(Object.keys(p.scores), ['agua']);
  assert.equal(vecinos(demoFarm(), CASOS_EJEMPLO, cfg).length, CONFIG.casos.k);
});

test('resultado: valores inválidos quedan como "sin dato", nunca como 0', () => {
  assert.deepEqual(normalizarResultado({ ncAntes: 3, ncDespues: -1, laminaAntes: 'x', laminaDespues: 1.1 }),
    { ncAntes: 3, ncDespues: null, laminaAntes: null, laminaDespues: 1.1 });
  assert.deepEqual(resumenResultado(normalizarResultado(null)), ['Sin resultado registrado todavía']);
  assert.deepEqual(resumenResultado({ ncAntes: 4, ncDespues: 2, laminaAntes: 1.4, laminaDespues: 1.15 }),
    ['No conformidades GLOBALG.A.P.: 4 → 2', 'Lámina aplicada/requerida: 1.40 → 1.15']);
});

test('acciones y resultado viajan en el archivo .json de la finca', () => {
  const f = { ...demoFarm(), acciones: ['Franja de 30 m', '  ', 'Aplicar fuera de floración'], resultado: { ncAntes: 5, ncDespues: 2, laminaAntes: null, laminaDespues: null } };
  const r = importarTexto(exportarTexto(f, configBase(), null));
  assert.deepEqual(r.farm.acciones, ['Franja de 30 m', 'Aplicar fuera de floración']);
  assert.deepEqual(r.farm.resultado, { ncAntes: 5, ncDespues: 2, laminaAntes: null, laminaDespues: null });
  // Un archivo viejo, sin estos campos, se sigue cargando.
  const viejo = normalizarFinca({ nombre: 'Vieja' });
  assert.deepEqual(viejo.acciones, []);
  assert.equal(viejo.resultado.ncAntes, null);
});

test('un caso guardado mal formado se descarta o se corrige', () => {
  assert.equal(normalizarCaso(null), null);
  assert.equal(normalizarCaso({ etiqueta: 'sin id' }), null);
  const c = normalizarCaso({ id: 'x', origen: 'real', finca: { nombre: 'Y' } });
  assert.equal(c.origen, 'propio'); // nadie puede marcar un caso como real desde el navegador
  assert.equal(c.finca.nombre, 'Y');
});

// Issue 60: el mismo límite de tamaño para el respaldo pegado y para el archivo.
test('importarTexto rechaza un respaldo de más de 2 MB con el mismo mensaje que el archivo', async () => {
  const { MENSAJE_RESPALDO_GRANDE, respaldoDemasiadoGrande } = await import('../src/core/storage.js');
  const { LIMITE_RESPALDO_BYTES } = await import('../src/core/config.js');
  assert.equal(LIMITE_RESPALDO_BYTES, 2_000_000);
  assert.throws(() => importarTexto('x'.repeat(LIMITE_RESPALDO_BYTES + 1)), { message: MENSAJE_RESPALDO_GRANDE });
  assert.match(MENSAJE_RESPALDO_GRANDE, /2 MB/);
  assert.equal(respaldoDemasiadoGrande(LIMITE_RESPALDO_BYTES), false);
  assert.equal(respaldoDemasiadoGrande(LIMITE_RESPALDO_BYTES + 1), true);
});

test('importarTexto mide bytes, no caracteres: 1 100 000 letras con tilde (2 bytes cada una) pasan de 2 MB', () => {
  assert.throws(() => importarTexto('á'.repeat(1_100_000)), /demasiado grande/);
});

test('un respaldo normal sigue cargando y un texto no válido sigue dando su mensaje', () => {
  const f = normalizarFinca({});
  assert.equal(importarTexto(exportarTexto(f, configBase(), null)).farm.nombre, f.nombre);
  assert.throws(() => importarTexto('no es json'), /no es un JSON válido/);
  assert.throws(() => importarTexto(undefined), /no es un JSON válido/);
});

test('app.js usa el mismo límite y mensaje en el archivo (sin número fijo)', async () => {
  const { readFileSync } = await import('node:fs');
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /respaldoDemasiadoGrande\(file\.size\)/);
  assert.doesNotMatch(app, /2_000_000/);
});
