// La certificación GLOBALG.A.P. es una respuesta del usuario: la app no la verifica y no debe mostrarla como estado validado (issue 47).
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document ??= { getElementById: () => null, querySelectorAll: () => [], dispatchEvent() {}, addEventListener() {}, createElement: () => ({}), documentElement: {} };
globalThis.location ??= { hash: '', pathname: '/', search: '', origin: '' };

const { S } = await import('../src/core/state.js');
const { viewDashboard } = await import('../src/ui/dashboard.js');
const { viewWizard } = await import('../src/ui/wizard.js');

const kpi = () => viewDashboard().match(/<div class="k">GLOBALG\.A\.P\.<\/div><div class="v">([^<]*)<\/div>/)[1];

test('el KPI dice que la certificación es declarada, no verificada', () => {
  const previo = S.farm.gg;
  try {
    S.farm.gg = 'si';
    assert.equal(kpi(), 'Declarado: certificado');
    S.farm.gg = 'quiero';
    assert.equal(kpi(), 'Declarado: en camino');
    S.farm.gg = 'no';
    assert.equal(kpi(), 'No aplica');
  } finally { S.farm.gg = previo; }
});

test('el cuestionario avisa que la app no verifica la certificación', () => {
  const pasoPrevio = S.step;
  try {
    S.step = 5;
    assert.match(viewWizard(), /no verifica ninguna certificación/);
  } finally { S.step = pasoPrevio; }
});
