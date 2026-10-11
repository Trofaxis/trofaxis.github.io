// ApiRadar: diagnóstico del problema Spathodea y abejas a partir de los datos de la finca.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiRadar } from '../src/apiradar/diagnostico.js';
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
