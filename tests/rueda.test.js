// Rueda del año (Inicio): cada anillo y cada coincidencia salen de la evaluación de la finca; la rueda no calcula nada nuevo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const { demoFarm, emptyFarm, S } = await import('../src/core/state.js');
const { evaluar } = await import('../src/core/engine.js');
const { configEfectiva, normalizarAjustes } = await import('../src/core/storage.js');
const { conPlan } = await import('../src/fert/calculo.js');
const { mesesRueda, ruedaAnio } = await import('../src/ui/rueda.js');

const evaluacion = (f) => evaluar(conPlan(f), configEfectiva(normalizarAjustes(S.ajustes)), {});

test('cada mes refleja los meses de la evaluación y de la finca, sin inventar ninguno', () => {
  const f = demoFarm(), R = evaluacion(f), meses = mesesRueda(R, f);
  assert.equal(meses.length, 12);
  meses.forEach((d, i) => {
    assert.equal(d.lluvia, f.lluviaMeses.includes(i));
    assert.equal(d.flor, R.atraeFlor.includes(i));
    assert.equal(d.florRiesgo, R.riesgoFlor.includes(i));
    assert.equal(d.aplic, R.aplic.includes(i));
    assert.equal(d.cosecha, R.cosechaM.includes(i));
    assert.equal(d.siembra, R.siembraM.includes(i));
    assert.deepEqual(d.coinc, R.mh[i]);
  });
});

test('la rueda dibuja 12 meses; solo el mes actual queda marcado y su detalle se ve', () => {
  const f = demoFarm(), R = evaluacion(f), h = ruedaAnio(R, f, 1, { v: 69, nivel: 'Alto', sinDatos: false });
  assert.equal((h.match(/class="r-mes /g) || []).length, 12);
  assert.equal((h.match(/class="r-mes m\d+ actual"/g) || []).length, 1);
  assert.match(h, /class="r-mes m1 actual"/);
  assert.equal((h.match(/class="r-det" data-detalle="\d+">/g) || []).length, 1, 'un solo detalle visible');
  assert.match(h, /data-detalle="1">/);
  assert.equal((h.match(/tabindex="0"/g) || []).length, 1, 'la rueda es una sola parada de Tab');
  for (const c of R.mh[1]) assert.ok(h.includes(c), `falta la coincidencia «${c}» en febrero`);
});

test('el centro muestra el índice; sin datos suficientes, una raya y no un número', () => {
  const f = demoFarm(), R = evaluacion(f);
  assert.match(ruedaAnio(R, f, 0, { v: 69, nivel: 'Alto', sinDatos: false }), /data-contar="69">69</);
  const sin = ruedaAnio(evaluacion(emptyFarm()), emptyFarm(), 0, { v: 0, nivel: 'Bajo', sinDatos: true });
  assert.match(sin, /r-centro nivel-sin/);
  assert.doesNotMatch(sin, /r-num"[^>]*data-contar/);
});

test('cada mes se anuncia con palabras, no solo con color', () => {
  const f = demoFarm(), R = evaluacion(f), h = ruedaAnio(R, f, 9, { v: 69, nivel: 'Alto', sinDatos: false });
  assert.match(h, /aria-label="Octubre, este mes: [^"]+"/);
  const feb = h.match(/data-mes="1"[^>]*aria-label="([^"]+)"/)[1];
  assert.match(feb, /coincidencias? de riesgo/);
});
