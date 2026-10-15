import { test } from 'node:test';
import assert from 'node:assert/strict';
import { armarGrafo, posicionesIniciales, paso, vecinos } from '../src/cerebro/grafo.js';
import { notasObsidian, zip, crc32 } from '../src/cerebro/obsidian.js';
import fs from 'node:fs';
import { viewCerebro } from '../src/admin/cerebro.js';
import { HECHOS } from '../src/cerebro/hechos.js';

const g = armarGrafo();

test('cada línea del grafo une dos nodos que existen y dice de qué clase es', () => {
  const ids = new Set(g.nodos.map((n) => n.id));
  for (const e of g.aristas) {
    assert.ok(ids.has(e.a) && ids.has(e.b), `${e.a} — ${e.b}`);
    assert.ok(['tema', 'fuente', 'formula'].includes(e.tipo));
    if (e.tipo === 'formula') assert.match(e.donde, /^src\//, 'una línea de fórmula nombra el archivo de la fórmula');
  }
});

test('cada hecho está unido a su tema, y a una fuente solo si la tiene', () => {
  for (const h of HECHOS) {
    const vs = vecinos(g, h.id);
    assert.ok(vs.some((v) => v.tipo === 'tema' && v.id === 'tema:' + h.tema), h.id);
    assert.equal(vs.some((v) => v.tipo === 'fuente'), h.estado === 'con fuente', h.id);
  }
});

test('las relaciones de fórmula son las que la app calcula de verdad', () => {
  const une = (a, b) => g.aristas.some((e) => e.tipo === 'formula' && ((e.a === a && e.b === b) || (e.a === b && e.b === a)));
  assert.ok(une('plag.dl50.imidacloprid', 'plag.umbralHQ'), 'HQ = dosis ÷ DL50');
  assert.ok(une('plag.gus.imidacloprid', 'plag.gusAlto'));
  assert.ok(une('riego.kc.maiz.med', 'clima.etoDiseno'), 'ETc = Kc · ETo');
  assert.ok(une('riego.textura.F', 'riego.p.maiz'), 'lámina = (CC − PMP) · Da · p · raíz');
  assert.ok(!une('plag.viento', 'riego.kc.maiz.med'), 'sin vínculos inventados');
});

test('la simulación de fuerzas se calma (no explota con nodos muy conectados)', () => {
  const s = posicionesIniciales(armarGrafo());
  let e = 0;
  for (let i = 0; i < 300; i++) e = paso(s);
  assert.ok(Number.isFinite(e) && e < 1, `energía final ${e}`);
  assert.ok(s.nodos.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y)));
});

test('la bóveda de Obsidian tiene una nota por nodo y cada [[enlace]] apunta a una nota', () => {
  const notas = notasObsidian(g);
  assert.equal(notas.length, g.nodos.length + 1); // + Léeme
  const nombres = new Set(notas.map((n) => n.ruta.split('/').pop().replace(/\.md$/, '')));
  assert.equal(new Set(notas.map((n) => n.ruta.toLowerCase())).size, notas.length, 'rutas únicas');
  for (const n of notas) for (const m of n.contenido.matchAll(/\[\[([^\]]+)\]\]/g)) assert.ok(nombres.has(m[1]), `${n.ruta} → [[${m[1]}]]`);
});

test('el .zip es válido: firmas, número de archivos y CRC32', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926); // valor de control del CRC-32
  const archivos = [{ ruta: 'a/ñ.md', contenido: 'hola' }, { ruta: 'b.md', contenido: '' }];
  const z = zip(archivos), dv = new DataView(z.buffer);
  assert.equal(dv.getUint32(0, true), 0x04034b50);
  const fin = z.length - 22;
  assert.equal(dv.getUint32(fin, true), 0x06054b50);
  assert.equal(dv.getUint16(fin + 10, true), 2);
  assert.equal(dv.getUint32(14, true), crc32(new TextEncoder().encode('hola')));
});

test('el panel de administración muestra el resumen, la búsqueda, la descarga y los pendientes', () => {
  const html = viewCerebro();
  assert.match(html, new RegExp(`${HECHOS.length} hechos`));
  assert.match(html, /id="cb-canvas"/);
  assert.match(html, /Descargar para Obsidian/);
  assert.match(html, /sin inteligencia artificial/);
  assert.match(html, /Pendientes del administrador/);
});

test('el cerebro no está en la app: vive aparte en admin/, sin indexar y sin servicios externos', () => {
  const app = fs.readFileSync('index.html', 'utf8') + fs.readFileSync('src/app.js', 'utf8');
  assert.ok(!/cerebro/i.test(app), 'la app no debe enlazar ni cargar el cerebro');
  // admin/ quedó como aviso de mudanza al panel aparte: sin scripts y sin indexar.
  // src/admin/cerebro.js y cerebro.css siguen aquí porque el panel los importa desde la app publicada.
  const admin = fs.readFileSync('admin/index.html', 'utf8');
  assert.match(admin, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(admin, /default-src 'none';/);
  assert.ok(!/<script/i.test(admin), 'el aviso de mudanza no carga scripts');
  assert.match(admin, /trofaxis-admin\//);
});
