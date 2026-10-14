// ApiRadar: diagnóstico del problema Spathodea y abejas a partir de los datos de la finca.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiRadar, apiRadarAplica } from '../src/apiradar/diagnostico.js';
import { evaluar } from '../src/core/engine.js';
import { CONFIG } from '../src/core/config.js';
import { demoFarm, emptyFarm } from '../src/core/state.js';

const poli = (f) => evaluar(f).mods.find((m) => m.id === 'poli');
const acc = (r, id) => r.acciones.find((a) => a.id === id);

test('sin especie de riesgo no hay diagnóstico y dice qué falta', () => {
  const r = apiRadar(emptyFarm());
  assert.equal(r.aplica, false);
  assert.match(r.motivo, /riesgo para polinizadores/);
});

test('el nivel y el puntaje son los del módulo Polinizadores (no hay pesos nuevos)', () => {
  const f = demoFarm(), r = apiRadar(f);
  assert.equal(r.aplica, true);
  assert.equal(r.score, poli(f).score);
  assert.equal(r.evidencia.length, poli(f).variables.filter((v) => v.aplica !== false).length);
});

test('los puntos que aporta cada variable suman el riesgo (con redondeo)', () => {
  const r = apiRadar(demoFarm());
  const suma = r.evidencia.reduce((s, v) => s + v.puntos, 0);
  assert.ok(Math.abs(suma - r.score) <= r.evidencia.length / 2, `${suma} vs ${r.score}`);
});

test('finca demostrativa: mover las aplicaciones de la floración baja el riesgo y se mide recalculando', () => {
  const f = demoFarm(), r = apiRadar(f);
  const m = acc(r, 'mover');
  assert.ok(m && m.delta < 0);
  assert.equal(m.de, poli(f).score);
  // El mismo cambio hecho a mano da el mismo puntaje.
  const g = structuredClone(f);
  g.plaguicidas.forEach((p) => { p.meses = p.meses.filter((x) => !r.datos.length || ![0, 1, 2, 3].includes(x)); });
  assert.equal(poli(g).score, m.a);
  // La acción trae los meses y los productos que afecta.
  assert.match(m.cuando, /Feb/);
  assert.match(m.detalle, /Insecticida de amplio espectro/);
});

test('lo que baja es acumulado y el total cierra con la última cifra', () => {
  const r = apiRadar(demoFarm());
  const med = r.acciones.filter((a) => a.delta != null);
  assert.equal(med.reduce((s, a) => s + a.delta, 0), r.total.delta);
  assert.equal(r.total.de, r.score);
  assert.equal(r.total.a, med.at(-1).a);
});

test('no cambia la finca del usuario', () => {
  const f = demoFarm(), antes = JSON.stringify(f);
  apiRadar(f);
  assert.equal(JSON.stringify(f), antes);
});

test('radio de exclusión: 300-500 m con la fuente; sin Trigona es criterio propio', () => {
  const f = demoFarm();
  const conTrigona = acc(apiRadar(f), 'refugio');
  assert.equal(conTrigona.estado, 'verificado');
  assert.match(conTrigona.nota, /Barrantes-Vásquez/);
  assert.deepEqual(CONFIG.apiradar.radioExclusionM, [300, 500]);
  f.especies = f.especies.filter((e) => !/Trigona/.test(e.nombre));
  const sin = apiRadar(f);
  assert.equal(acc(sin, 'refugio').estado, 'criterio propio');
  assert.equal(sin.radio.haMin, 28); // π·300² = 28.3 ha
  assert.equal(sin.radio.haMax, 79); // π·500² = 78.5 ha
});

test('la hipótesis de otras flores no se presenta como verificada', () => {
  const f = emptyFarm();
  f.especies = [{ nombre: 'Spathodea campanulata', tipo: 'Árbol', origen: 'exótica', floracion: [9, 10], atrae: true, riesgo: true, cantidad: 2, copaD: 10, copaH: 8 }];
  const a = acc(apiRadar(f), 'alternativa');
  assert.ok(a);
  assert.equal(a.estado, 'no verificado');
  assert.match(a.cuando, /Oct, Nov/);
});

test('lo que falta: copa sin medidas, sin plaguicidas y sin fauna', () => {
  const f = emptyFarm();
  f.especies = [{ nombre: 'Spathodea campanulata', tipo: 'Árbol', origen: 'exótica', floracion: [9], atrae: true, riesgo: true, cantidad: 2 }];
  const r = apiRadar(f);
  const txt = r.faltan.join(' | ');
  assert.match(txt, /copa/);
  assert.match(txt, /plaguicidas/i);
  assert.match(txt, /Abejas nativas/);
});

test('con coordenadas de los árboles y el contorno, el ApiRadar da el punto del refugio', () => {
  const f = demoFarm();
  const lat0 = 14, lon0 = -87, dLat = 500 / 110574, dLon = 500 / (111319.5 * Math.cos((lat0 * Math.PI) / 180));
  const contorno = [[lat0 - dLat, lon0 - dLon], [lat0 - dLat, lon0 + dLon], [lat0 + dLat, lon0 + dLon], [lat0 + dLat, lon0 - dLon]];
  const r = apiRadar(f, CONFIG, {}, 'spathodea', { arboles: [{ id: '1', lat: lat0, lon: lon0 }], contorno });
  assert.ok(r.radio.sitio);
  assert.equal(r.radio.coordenadas, 1);
  const a = acc(r, 'refugio');
  assert.match(a.detalle, /72 %/); // 71.7 % de la finca queda a 300 m o más
  assert.match(a.detalle, /punto más alejado/);
  // Sin contorno pide dibujarlo; sin árboles pide cargarlos.
  assert.match(acc(apiRadar(f, CONFIG, {}, 'spathodea', { arboles: [{ id: '1', lat: lat0, lon: lon0 }], contorno: [] }), 'refugio').detalle, /dibuja el contorno/);
  assert.match(acc(apiRadar(f), 'refugio').detalle, /carga las coordenadas/);
});

test('sitios candidatos guardados sin ningún árbol censado no rompen el diagnóstico', () => {
  const f = demoFarm();
  const sitios = [{ id: 'S1', lat: 14.0, lon: -87.2 }, { id: 'S2', lat: 14.001, lon: -87.2 }];
  const r = apiRadar(f, CONFIG, {}, 'spathodea', { arboles: [], contorno: [], sitios });
  assert.equal(r.aplica, true);
  assert.deepEqual(r.censo.sitios, []);
  assert.doesNotMatch(acc(r, 'refugio').detalle, /Sitios que propusiste/);
});

test('con árboles censados los sitios candidatos sí entran al diagnóstico', () => {
  const f = demoFarm();
  const r = apiRadar(f, CONFIG, {}, 'spathodea', { arboles: [{ id: '1', lat: 14.0, lon: -87.2 }], contorno: [], sitios: [{ id: 'S1', lat: 14.0, lon: -87.2 }] });
  assert.equal(r.censo.sitios.length, 1);
  assert.match(acc(r, 'refugio').detalle, /Sitios que propusiste: Sitio S1: cerca/);
});

// Issue 55: con el panel cerrado solo se calcula si el problema aplica, y debe dar lo mismo que el diagnóstico completo.
test('apiRadarAplica coincide con apiRadar(...).aplica en todos los casos', () => {
  const conRiesgo = demoFarm();
  const sinRiesgo = demoFarm(); sinRiesgo.especies = sinRiesgo.especies.map((e) => ({ ...e, riesgo: false }));
  const sinCultivosConPropositoRiego = { ...demoFarm(), tieneCultivos: false, proposito: ['riego'] };
  const sinCultivosConPropositoPoli = { ...demoFarm(), tieneCultivos: false, proposito: ['polinizadores'] };
  const fincas = { conRiesgo, sinRiesgo, vacia: emptyFarm(), sinCultivosConPropositoRiego, sinCultivosConPropositoPoli };
  const configs = {
    normal: CONFIG,
    sinPoli: { ...CONFIG, modulosActivos: CONFIG.modulosActivos.filter((id) => id !== 'poli') },
  };
  for (const [nf, f] of Object.entries(fincas)) for (const [nc, cfg] of Object.entries(configs)) {
    assert.equal(apiRadarAplica(f, cfg), apiRadar(f, cfg).aplica, `${nf} con config ${nc}`);
  }
  assert.equal(apiRadarAplica(conRiesgo, CONFIG), true);
  assert.equal(apiRadarAplica(sinRiesgo, CONFIG), false);
  assert.equal(apiRadarAplica(conRiesgo, configs.sinPoli), false);
});

test('el panel cerrado no arma el diagnóstico: apiRadar solo se llama al abrirlo', async () => {
  const { readFileSync } = await import('node:fs');
  const ui = readFileSync(new URL('../src/ui/apiradar.js', import.meta.url), 'utf8');
  const cerrado = ui.indexOf('if (!abierto)'), llamada = ui.indexOf('const R = apiRadar(');
  assert.ok(cerrado > 0 && llamada > cerrado, 'el panel cerrado debe volver antes de llamar a apiRadar');
  assert.match(ui.slice(cerrado, llamada), /apiRadarAplica\(f, cfg\)/);
  assert.doesNotMatch(ui, /apiRadar\([^)]*'spathodea'/);
});
