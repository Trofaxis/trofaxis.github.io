// La certificación GLOBALG.A.P. es una respuesta del usuario: la app no la verifica y no debe mostrarla como estado validado (issue 47).
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document ??= { getElementById: () => null, querySelectorAll: () => [], dispatchEvent() {}, addEventListener() {}, createElement: () => ({}), documentElement: {} };
globalThis.location ??= { hash: '', pathname: '/', search: '', origin: '' };

const { S } = await import('../src/core/state.js');
const { viewDashboard } = await import('../src/ui/dashboard.js');
const { viewWizard } = await import('../src/ui/wizard.js');

// El KPI está en la vista técnica del dashboard.
const kpi = () => { const v = S.vistaTecnica; S.vistaTecnica = true; try { return viewDashboard(); } finally { S.vistaTecnica = v; } };
const kpiTexto = () => kpi().match(/<div class="k">GLOBALG\.A\.P\.<\/div><div class="v">([^<]*)<\/div>/);

test('el KPI dice que la certificación es declarada, no verificada', () => {
  const previo = S.farm.gg;
  try {
    S.farm.gg = 'si';
    assert.equal(kpiTexto()[1], 'Declarado: certificado');
    S.farm.gg = 'quiero';
    assert.equal(kpiTexto()[1], 'Declarado: en camino');
    S.farm.gg = 'no';
    assert.equal(kpiTexto()[1], 'No aplica');
  } finally { S.farm.gg = previo; }
});

test('el cuestionario avisa que la app no verifica la certificación', () => {
  const pasoPrevio = S.step;
  try {
    S.step = 5; S.wizModo = 'completo';
    assert.match(viewWizard(), /no verifica ninguna certificación/);
  } finally { S.step = pasoPrevio; S.wizModo = 'rapido'; }
});
