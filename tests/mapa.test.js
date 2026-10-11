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

// ---------- Árboles de riesgo (ApiRadar) ----------
import { utmALatLon, leerCenso, leerLineaCenso, puntoDe, sitiosFuera, distanciaM } from '../src/mapa/geo.js';

// Longitud del arco de meridiano (WGS84) por integración numérica: sobre el meridiano central, N = k0 · arco(φ).
function arcoMeridiano(latGrados) {
  const a = 6378137, e2 = 0.00669437999014, fi = (latGrados * Math.PI) / 180, n = 20000;
  let s = 0;
  for (let i = 0; i < n; i++) { const p = ((i + 0.5) / n) * fi; s += (a * (1 - e2)) / (1 - e2 * Math.sin(p) ** 2) ** 1.5; }
  return (s * fi) / n;
}

test('UTM → grados: sobre el meridiano central el norte coincide con el arco de meridiano', () => {
  for (const lat of [14, 15.2, 13.1]) {
    const g = utmALatLon(500000, 0.9996 * arcoMeridiano(lat), 16);
    cerca(g.lat, lat, 1e-7); cerca(g.lon, -87, 1e-9);
  }
  assert.equal(utmALatLon(500000, 1547400, 17).lon, -81); // la zona 17 N tiene el meridiano central en 81° O
});

test('UTM: 1 km al este en la latitud 14° son ~0.00927° de longitud', () => {
  const a = utmALatLon(500000, 1547400, 16), b = utmALatLon(501000, 1547400, 16);
  cerca(distanciaM([a.lat, a.lon], [b.lat, b.lon]), 1000, 2.5); // la escala de UTM (k0 = 0.9996 en el centro) deja ~0.4 m por km de diferencia
});

test('censo: títulos, ID, UTM, grados, medidas opcionales, comentarios y errores', () => {
  const r = leerCenso('ID Este Norte DAP Copa Alto\n27 501227 1547802 89.4 18.7 19.2\n23, 501178, 1547785, 83, 18.35, 14.4\n# comentario\n\nA7 14.0108 -87.0044\nhola\n999, 999, 5\n27 501300 1547900');
  assert.equal(r.arboles.length, 3);
  assert.equal(r.arboles[0].id, '27');
  assert.deepEqual([r.arboles[0].dap, r.arboles[0].d, r.arboles[0].h], [89.4, 18.7, 19.2]);
  cerca(r.arboles[0].lat, 14.0007, 0.0005); cerca(r.arboles[0].lon, -86.9887, 0.0005);
  assert.deepEqual([r.arboles[2].lat, r.arboles[2].lon, r.arboles[2].d], [14.0108, -87.0044, null]);
  assert.equal(r.errores.length, 3); // «hola», «999, 999, 5» y el ID 27 repetido
  assert.match(r.errores.join(' '), /ID 27 ya está/);
});

test('censo: solo coordenadas (el ID se pone solo), pegado de Excel con campos vacíos y zona 17', () => {
  const r = leerCenso('14.0108, -87.0044\n501177 1547784');
  assert.deepEqual(r.arboles.map((a) => a.id), ['1', '2']);
  const t = leerLineaCenso('5\t501177\t1547784\t\t12.5\t9', 16);
  assert.deepEqual([t.arbol.dap, t.arbol.d, t.arbol.h], [null, 12.5, 9]);
  assert.equal(leerLineaCenso('1 501177 1547784', 17).arbol.lon > -81, true);
  assert.match(leerLineaCenso('1 501177 1547784 -3').error, /positivos/);
  assert.equal(puntoDe(20, 500), null);
});

test('sitios fuera del radio: un árbol al centro de un cuadrado de 1 km', () => {
  // Cuadrado de ~1 km de lado centrado en el árbol. Fuera de 300 m: 1 − π·300²/1e6 = 71.7 %; fuera de 500 m: 1 − π·500²/1e6 = 21.5 %.
  const lat0 = 14, lon0 = -87, dLat = 500 / 110574, dLon = 500 / (111319.5 * Math.cos((lat0 * Math.PI) / 180));
  const cont = [[lat0 - dLat, lon0 - dLon], [lat0 - dLat, lon0 + dLon], [lat0 + dLat, lon0 + dLon], [lat0 + dLat, lon0 - dLon]];
  const r = sitiosFuera([[lat0, lon0]], cont, [300, 500]);
  cerca(r.fraccionMin, 0.717, 0.02); cerca(r.fraccionMax, 0.215, 0.02);
  cerca(r.areaHa, 100, 2);
  cerca(r.mejor.distanciaM, 707, 20); // la esquina: 500·√2
  assert.equal(sitiosFuera([], cont, [300, 500]), null);
  assert.equal(sitiosFuera([[lat0, lon0]], cont.slice(0, 2), [300, 500]), null);
});

test('el censo y los sitios se guardan en la ubicación del navegador, no en la finca exportada', () => {
  const u = normalizarUbicacion({ arboles: [[14.0108, -87.0044], { id: 27, lat: 14.01, lon: -87, dap: 89.4, d: 18.7, h: -2 }, [999, 1], 'x'], sitios: [{ id: 'A', lat: 14, lon: -87 }, { lat: 200, lon: 0 }], ejemplo: true });
  assert.deepEqual(u.arboles[0], { id: '1', lat: 14.0108, lon: -87.0044, dap: null, d: null, h: null }); // formato anterior: par [lat, lon]
  assert.deepEqual(u.arboles[1], { id: '27', lat: 14.01, lon: -87, dap: 89.4, d: 18.7, h: null }); // una medida negativa se descarta
  assert.equal(u.arboles.length, 2);
  assert.deepEqual(u.sitios, [{ id: 'A', lat: 14, lon: -87 }]);
  assert.equal(u.ejemplo, true);
  assert.deepEqual([ubicacionVacia().arboles, ubicacionVacia().sitios, ubicacionVacia().ejemplo], [[], [], false]);
  // La finca no tiene campo de árboles, y si un archivo lo trae, al cargarlo se descarta.
  assert.equal('arboles' in demoFarm(), false);
  assert.equal('arboles' in normalizarFinca({ ...demoFarm(), arboles: [{ id: '1', lat: 14.0108, lon: -87.0044 }], sitios: [] }), false);
  assert.equal('sitios' in normalizarFinca({ ...demoFarm(), sitios: [] }), false);
});

// ---- Respaldo propio del mapa y el censo ----
import { exportarUbicacion, importarUbicacion, hayDatosPropios } from '../src/mapa/ubicacion.js';
import { censoEjemplo } from '../src/apiradar/censo.js';

const conDatos = () => ({ ...ubicacionVacia(), punto: [14.0108, -87.0044], contorno: [[14, -87], [14, -86.99], [14.01, -86.99]],
  arboles: [{ id: '1', lat: 14.001, lon: -87.001, dap: 40, d: 12, h: 9 }], sitios: [{ id: 'A', lat: 14.002, lon: -87.002 }] });

test('el respaldo del mapa y del censo vuelve igual al cargarlo', () => {
  const u = conDatos();
  assert.deepEqual(importarUbicacion(exportarUbicacion(u)), normalizarUbicacion(u));
});

test('el respaldo del mapa rechaza archivos ajenos, vacíos o de una versión nueva', () => {
  assert.throws(() => importarUbicacion('no es json'), /JSON válido/);
  assert.throws(() => importarUbicacion('{"formato":"biogap-finca"}'), /respaldo de mapa/);
  assert.throws(() => importarUbicacion('{"formato":"biogap-mapa","version":9}'), /más nueva/);
  assert.throws(() => importarUbicacion(exportarUbicacion(ubicacionVacia())), /no trae/);
});

test('un respaldo de mapa dañado se limpia campo por campo', () => {
  const t = JSON.stringify({ formato: 'biogap-mapa', version: 1, ubicacion: { punto: [999, 0], contorno: [[1, 2], 'x'], arboles: [{ id: 7, lat: 14, lon: -87, dap: -3 }, null], sitios: 5 } });
  const u = importarUbicacion(t);
  assert.equal(u.punto, null);
  assert.deepEqual(u.contorno, [[1, 2]]);
  assert.equal(u.arboles.length, 1);
  assert.equal(u.arboles[0].dap, null);
});

test('el ejemplo no cuenta como datos propios y las coordenadas no entran al archivo de la finca', () => {
  const e = censoEjemplo();
  assert.equal(hayDatosPropios({ ...ubicacionVacia(), arboles: e.arboles, ejemplo: true }), false);
  assert.equal(hayDatosPropios(conDatos()), true);
  const texto = exportarTexto(demoFarm(), { modulosActivos: [], niveles: { alto: 67, medio: 34 } });
  assert.ok(!texto.includes('14.0108'));
  assert.ok(!texto.includes('"arboles"'));
});
