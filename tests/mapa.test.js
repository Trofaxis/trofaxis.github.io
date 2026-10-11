// Pruebas del mapa de la finca: proyección, teselas, área, coordenadas y privacidad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aPixel, aGrados, teselasVisibles, urlTesela, areaHa, leerCoordenadas, enHonduras, avisosMapa } from '../src/mapa/geo.js';
import { normalizarUbicacion, ubicacionVacia } from '../src/mapa/ubicacion.js';
import { normalizarFinca, normalizarCaso, exportarTexto } from '../src/core/storage.js';
import { demoFarm } from '../src/core/state.js';
import { CONFIG } from '../src/core/config.js';

const cerca = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} vs ${b}`);

test('grados → píxel → grados vuelve al mismo punto', () => {
  for (const [lat, lon, z] of [[14.0108, -87.0044, 15], [0, 0, 3], [-33.4, 151.2, 10]]) {
    const p = aPixel(lat, lon, z), g = aGrados(p.x, p.y, z);
    cerca(g.lat, lat, 1e-9); cerca(g.lon, lon, 1e-9);
  }
});

test('la tesela de Zamorano en zoom 10 coincide con el esquema slippy map', () => {
  // x = floor((lon+180)/360·2^z); y = floor((1 − ln(tan φ + sec φ)/π)/2 · 2^z)
  const p = aPixel(14.0108, -87.0044, 10);
  assert.equal(Math.floor(p.x / 256), 264);
  assert.equal(Math.floor(p.y / 256), 471);
  assert.equal(urlTesela({ z: 10, x: 264, y: 471 }, 'u/{z}/{y}/{x}.jpg'), 'u/10/471/264.jpg');
});

test('las teselas visibles cubren toda la ventana', () => {
  const t = teselasVisibles(14.0108, -87.0044, 12, 600, 320);
  const minX = Math.min(...t.map((a) => a.px)), minY = Math.min(...t.map((a) => a.py));
  const maxX = Math.max(...t.map((a) => a.px + 256)), maxY = Math.max(...t.map((a) => a.py + 256));
  assert.ok(minX <= 0 && minY <= 0 && maxX >= 600 && maxY >= 320);
  assert.ok(t.every((a) => a.x >= 0 && a.x < 4096 && a.y >= 0 && a.y < 4096));
});

test('área de un rectángulo de 0.01° coincide con la fórmula exacta de la esfera', () => {
  // Área exacta de un rectángulo lat-lon sobre la esfera: R²·Δλ·(sen φ2 − sen φ1)
  const R = 6378137, r = (g) => (g * Math.PI) / 180;
  for (const lat0 of [0, 14]) {
    const exacta = (R * R * r(0.01) * (Math.sin(r(lat0 + 0.01)) - Math.sin(r(lat0)))) / 1e4;
    const a = areaHa([[lat0, -87], [lat0, -86.99], [lat0 + 0.01, -86.99], [lat0 + 0.01, -87]]);
    cerca(a, exacta, exacta * 1e-9);
  }
  assert.equal(areaHa([[14, -87], [14.1, -87]]), 0); // menos de 3 puntos
});

test('el sentido del contorno no cambia el área', () => {
  const p = [[14, -87], [14, -86.995], [14.004, -86.996], [14.005, -87.001]];
  cerca(areaHa(p), areaHa([...p].reverse()), 1e-9);
});

test('lee coordenadas en grados decimales y rechaza las inválidas', () => {
  assert.deepEqual(leerCoordenadas('14.0108, -87.0044'), { lat: 14.0108, lon: -87.0044 });
  assert.deepEqual(leerCoordenadas(' 14.0108 -87.0044 '), { lat: 14.0108, lon: -87.0044 });
  assert.deepEqual(leerCoordenadas('14.0108;-87.0044'), { lat: 14.0108, lon: -87.0044 });
  assert.match(leerCoordenadas('14°00\'39"N').error, /grados decimales/);
  assert.match(leerCoordenadas('95, -87').error, /latitud/);
  assert.match(leerCoordenadas('14, -187').error, /longitud/);
});

test('avisa si la ubicación cae fuera de Honduras o falta el signo menos', () => {
  assert.ok(enHonduras(14.0108, -87.0044));
  assert.deepEqual(avisosMapa({ punto: [14.0108, -87.0044], contorno: [] }, 0), []);
  assert.match(avisosMapa({ punto: [14.0108, 87.0044], contorno: [] }, 0)[0], /signo menos/);
  assert.match(avisosMapa({ punto: [40.4, -3.7], contorno: [] }, 0)[0], /fuera de Honduras/);
});

test('avisa si el área dibujada difiere de la declarada más que la tolerancia', () => {
  const c = [[14, -87], [14, -86.99], [14.01, -86.99], [14.01, -87]]; // ≈ 119.5 ha
  const a = areaHa(c);
  assert.deepEqual(avisosMapa({ punto: null, contorno: c }, a * (1 + CONFIG.mapa.toleranciaArea / 2)), []);
  assert.match(avisosMapa({ punto: null, contorno: c }, 45)[0], /declaraste 45 ha/);
});

test('la ubicación guardada se valida al cargarla', () => {
  assert.deepEqual(normalizarUbicacion(null), ubicacionVacia());
  const u = normalizarUbicacion({ punto: [14, -87], contorno: [[14, -87], ['x', 1], [99, 0]], vista: { lat: 14, lon: -87, zoom: 40 } });
  assert.deepEqual(u.punto, [14, -87]);
  assert.deepEqual(u.contorno, [[14, -87]]);
  assert.equal(u.vista.zoom, CONFIG.mapa.zoomMax);
});

test('las coordenadas nunca entran a la finca exportada ni a la memoria de casos', () => {
  const f = { ...demoFarm(), punto: [14, -87], contorno: [[14, -87]], lat: 14, lon: -87 };
  const limpia = normalizarFinca(f);
  for (const k of ['punto', 'contorno', 'lat', 'lon']) assert.ok(!(k in limpia), k);
  const caso = normalizarCaso({ id: 'x', origen: 'propio', etiqueta: 'A', finca: f, punto: [14, -87] });
  assert.ok(!('punto' in caso) && !('punto' in caso.finca));
  assert.doesNotMatch(exportarTexto(limpia, {}), /"(punto|contorno)"/);
});
