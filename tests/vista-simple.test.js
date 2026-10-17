// Vista simple del dashboard (facilidad de uso): semáforo por tema, 3 acciones urgentes y el mes actual,
// con el detalle técnico detrás de «¿Por qué?». La vista técnica conserva todo lo de antes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const { S, demoFarm, emptyFarm } = await import('../src/core/state.js');
const { viewDashboard, TEXTO_NIVEL } = await import('../src/ui/dashboard.js');
const { evaluar } = await import('../src/core/engine.js');
const { configEfectiva, normalizarAjustes, guardarLocal, cargarLocal } = await import('../src/core/storage.js');
const { conPlan } = await import('../src/fert/calculo.js');
const { MFULL } = await import('../src/core/utils.js');

const conFinca = (farm, fn) => { const p = { farm: S.farm, demo: S.demo, done: S.done, vt: S.vistaTecnica };
  try { S.farm = farm; S.demo = false; S.done = {}; S.vistaTecnica = false; return fn(); }
  finally { S.farm = p.farm; S.demo = p.demo; S.done = p.done; S.vistaTecnica = p.vt; } };
const evaluacion = () => evaluar(conPlan(S.farm), configEfectiva(normalizarAjustes(S.ajustes)), {});

test('la vista simple es la de entrada y deja fuera los bloques técnicos', () => {
  assert.equal(S.vistaTecnica, false);
  conFinca(demoFarm(), () => {
    const h = viewDashboard();
    assert.match(h, /¿Cómo está tu finca\?/);
    assert.match(h, /Lo más urgente/);
    assert.match(h, /data-act="vista-tecnica" aria-pressed="false"/);
    for (const t of ['Cruce de calendarios', 'Presión por mes', '¿Qué pasa si cambias algo?', 'Perfil de riesgo ambiental']) assert.doesNotMatch(h, new RegExp(t.replace(/[?¿]/g, '.')), `la vista simple no debe traer «${t}»`);
  });
});

test('la vista técnica conserva todos los bloques de antes', () => {
  conFinca(demoFarm(), () => {
    S.vistaTecnica = true;
    const h = viewDashboard();
    for (const t of ['Cruce de calendarios', 'Presión por mes', 'Plan de acción', 'Perfil de riesgo ambiental', 'Riesgo por módulo']) assert.match(h, new RegExp(t), `falta «${t}»`);
    assert.match(h, /aria-pressed="true">Ver vista simple/);
  });
});

test('el semáforo trae un tema por módulo activo, con su nivel en palabras y su «¿Por qué?» con la rúbrica', () => {
  conFinca(demoFarm(), () => {
    const R = evaluacion(), h = viewDashboard();
    const sem = h.match(/<ul class="semaforo">([\s\S]*?)<\/ul><\/div>/)[1];
    assert.equal((sem.match(/<li>/g) || []).length, R.mods.length);
    for (const m of R.mods) {
      assert.match(sem, new RegExp(`<b>${m.nombre}</b>`));
      if (m.suficiente) assert.match(sem, new RegExp(TEXTO_NIVEL[m.level]));
    }
    assert.match(sem, /¿Por qué\?/);
    assert.match(sem, /table class="data rubrica"/, 'el detalle técnico (rúbrica) debe seguir a un toque');
  });
});

test('«Lo más urgente» muestra a lo sumo 3 acciones pendientes y salta las ya hechas', () => {
  conFinca(demoFarm(), () => {
    const urg = () => (viewDashboard().match(/<ul class="plan urgentes">([\s\S]*?)<\/ul>/) || ['', ''])[1];
    const claves = () => [...urg().matchAll(/data-done="([^"]*)"/g)].map((m) => m[1]);
    const antes = claves();
    assert.ok(antes.length > 0 && antes.length <= 3);
    S.done[antes[0].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')] = true;
    assert.ok(!claves().includes(antes[0]), 'una acción hecha no vuelve a «Lo más urgente»');
  });
});

test('el mes actual lista sus coincidencias o dice que no hay', () => {
  const mes = new Date().getMonth();
  conFinca(demoFarm(), () => {
    const R = evaluacion(), h = viewDashboard();
    assert.match(h, new RegExp(`Este mes: ${MFULL[mes]}`));
    if (R.mh[mes].length) for (const c of R.mh[mes]) assert.ok(h.includes(c));
    else assert.match(h, /No hay coincidencias de riesgo/);
  });
  conFinca(emptyFarm(), () => { assert.match(viewDashboard(), /No hay coincidencias de riesgo|coinciden en tu finca/); });
});

test('la elección de vista se guarda en este navegador', () => {
  const p = S.vistaTecnica;
  try {
    S.vistaTecnica = true; guardarLocal(S);
    assert.equal(cargarLocal(S.tpl).vistaTecnica, true);
    S.vistaTecnica = false; guardarLocal(S);
    assert.equal(cargarLocal(S.tpl).vistaTecnica, false);
  } finally { S.vistaTecnica = p; }
});

test('la vista simple dice qué parte de los datos usa y ofrece mejorar el resultado', () => {
  conFinca(emptyFarm(), () => {
    const R = evaluacion(), h = viewDashboard();
    assert.match(h, new RegExp(`${Math.round(R.conf * 100)} % de los datos</b>`));
    assert.match(h, /data-act="wiz-modo" data-v="completo">Mejora tu resultado/);
  });
});
