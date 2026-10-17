// Pasos para completar la finca («te faltan X de Y»): el resultado es preliminar mientras falte alguno.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const { S, demoFarm, emptyFarm } = await import('../src/core/state.js');
const { pasosFinca } = await import('../src/core/completitud.js');
const { aplicarRapido, rapidoVacio } = await import('../src/core/rapido.js');
const { viewDashboard } = await import('../src/ui/dashboard.js');
const { normalizarFinca } = await import('../src/core/storage.js');

const hechos = (f) => pasosFinca(f).filter((p) => p.hecho).map((p) => p.id);

test('una finca vacía no tiene ningún paso hecho y cada paso dice dónde se llena', () => {
  const p = pasosFinca(emptyFarm());
  assert.equal(p.length, 8);
  assert.deepEqual(hechos(emptyFarm()), []);
  for (const x of p) assert.ok(Number.isInteger(x.paso) || ['fertilizacion', 'plaguicidas'].includes(x.vista), `${x.id} sin destino`);
});

test('las preguntas rápidas no completan la finca: el resultado sigue siendo preliminar', () => {
  const f = aplicarRapido(emptyFarm(), { ...rapidoVacio(), cultivo: 'Tomate', cosecha: [3], abejas: 'si', spathodea: 'si', spaFlor: [9], insect: 'si', insectMeses: [9] });
  assert.ok(pasosFinca(f).some((p) => !p.hecho));
  assert.ok(!hechos(f).includes('plag'), 'un insecticida sin producto ni dosis no cuenta como completo');
});

test('decir que no aplica plaguicidas completa ese paso, y se guarda', () => {
  const f = aplicarRapido(emptyFarm(), { ...rapidoVacio(), insect: 'no' });
  assert.equal(f.sinPlaguicidas, true);
  assert.ok(hechos(f).includes('plag'));
  assert.equal(normalizarFinca(JSON.parse(JSON.stringify(f))).sinPlaguicidas, true);
});

test('el dashboard simple muestra el aviso de resultado preliminar con los pasos que faltan', () => {
  const p = { farm: S.farm, demo: S.demo, vt: S.vistaTecnica };
  try {
    S.farm = emptyFarm(); S.demo = false; S.vistaTecnica = false;
    const h = viewDashboard();
    assert.match(h, /Te faltan 8 de 8 pasos para completar tu finca/);
    assert.match(h, /Este resultado es preliminar/);
    assert.match(h, /data-act="wiz-paso" data-step="0"/);
    assert.match(h, /data-view="plaguicidas">Completar/);
    S.farm = demoFarm(); S.demo = true;
    assert.doesNotMatch(viewDashboard(), /Te faltan/, 'la finca de ejemplo ya avisa que es ficticia');
  } finally { S.farm = p.farm; S.demo = p.demo; S.vistaTecnica = p.vt; }
});
