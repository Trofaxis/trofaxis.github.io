import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { crearCargador, conIntento } from '../src/core/carga-diferida.js';

const esperar = () => new Promise((r) => setImmediate(r));

test('pedir descarga la vista una sola vez y avisa cuando llega', async () => {
  let llamadas = 0;
  const avisos = [];
  const vista = () => '<p>riego</p>';
  const c = crearCargador({ riego: () => { llamadas++; return Promise.resolve(vista); } }, { alCambiar: (n) => avisos.push(n) });
  assert.equal(c.vista('riego'), null);
  c.pedir('riego'); c.pedir('riego');
  await esperar();
  assert.equal(llamadas, 1);
  assert.equal(c.vista('riego'), vista);
  assert.deepEqual(avisos, ['riego']);
  c.pedir('riego'); // ya está lista: no vuelve a descargar ni a avisar
  await esperar();
  assert.equal(llamadas, 1);
  assert.deepEqual(avisos, ['riego']);
});

test('incluye distingue las vistas diferidas de las que vienen con la página', () => {
  const c = crearCargador({ riego: () => Promise.resolve(() => '') });
  assert.equal(c.incluye('riego'), true);
  assert.equal(c.incluye('dashboard'), false);
  assert.equal(c.incluye('toString'), false); // no hereda del prototipo
  c.pedir('dashboard'); // un nombre desconocido no hace nada ni lanza
  assert.equal(c.vista('dashboard'), null);
});

test('si la descarga falla queda marcada, no reintenta sola y reintentar lo vuelve a probar', async () => {
  let llamadas = 0;
  let sinRed = true;
  const avisos = [];
  const vista = () => 'ok';
  const c = crearCargador({
    fert: () => { llamadas++; return sinRed ? Promise.reject(new Error('sin red')) : Promise.resolve(vista); },
  }, { alCambiar: (n) => avisos.push(n) });
  c.pedir('fert');
  await esperar();
  assert.equal(c.fallo('fert'), true);
  assert.equal(c.vista('fert'), null);
  c.pedir('fert'); // volver a dibujar no debe provocar un bucle de descargas
  await esperar();
  assert.equal(llamadas, 1);
  sinRed = false;
  c.reintentar('fert');
  assert.equal(c.fallo('fert'), false);
  await esperar();
  assert.equal(llamadas, 2);
  assert.equal(c.vista('fert'), vista);
  assert.deepEqual(avisos, ['fert', 'fert']);
});

test('cada reintento pide otra dirección, porque el navegador recuerda el import() que falló', async () => {
  const pedidas = [];
  const c = crearCargador({ riego: (intento) => { pedidas.push(conIntento('./ui/riego.js', intento)); return intento < 2 ? Promise.reject(new Error('sin red')) : Promise.resolve(() => ''); } });
  c.pedir('riego'); await esperar();
  c.reintentar('riego'); await esperar();
  c.reintentar('riego'); await esperar();
  assert.deepEqual(pedidas, ['./ui/riego.js', './ui/riego.js?r=1', './ui/riego.js?r=2']);
  assert.equal(c.fallo('riego'), false);
  assert.equal(typeof c.vista('riego'), 'function');
});

test('conIntento deja la ruta igual en el primer intento', () => {
  assert.equal(conIntento('./a.js', 0), './a.js');
  assert.equal(conIntento('./a.js', undefined), './a.js');
  assert.equal(conIntento('./a.js', 3), './a.js?r=3');
});

test('un cargador que lanza de forma síncrona también cuenta como fallo', async () => {
  const c = crearCargador({ plag: () => { throw new Error('módulo inexistente'); } });
  c.pedir('plag');
  await esperar();
  assert.equal(c.fallo('plag'), true);
});

// Guarda del arranque: las pestañas pesadas y los lectores de archivos no deben volver a importarse de forma estática.
const re = /(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]|import\s*['"](\.[^'"]+)['"]/g;
const hijos = (f) => [...fs.readFileSync(f, 'utf8').matchAll(re)].map((m) => path.normalize(path.join(path.dirname(f), m[1] ?? m[2])));
function alcance(raiz) {
  const visto = new Set();
  const pila = [raiz];
  while (pila.length) {
    const f = pila.pop();
    if (visto.has(f)) continue;
    visto.add(f);
    pila.push(...hijos(f));
  }
  return visto;
}

test('el arranque no importa de forma estática las pestañas pesadas ni los lectores de archivos', () => {
  const arranque = alcance(path.normalize('src/app.js'));
  for (const m of ['src/ui/riego.js', 'src/ui/plaguicidas.js', 'src/ui/fertilizacion.js',
    'src/riego/xlsx.js', 'src/riego/csv.js', 'src/riego/extraer.js', 'src/fert/extraer.js']) {
    assert.equal(arranque.has(path.normalize(m)), false, `${m} debe cargarse bajo demanda, no al abrir la página`);
  }
});
