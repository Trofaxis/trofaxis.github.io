// Escala del índice (Inicio): los tramos salen de los cortes de nivel y las notas solo dicen distancias, sin calcular riesgo.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const { tramosIndice, notaTramo, escalaIndice } = await import('../src/ui/indice.js');
const cfg = { niveles: { alto: 67, medio: 34 } };

test('los tramos siguen los cortes de nivel y cubren de 0 a 100 sin huecos', () => {
  assert.deepEqual(tramosIndice(cfg), [['Bajo', 0, 33], ['Medio', 34, 66], ['Alto', 67, 100]]);
  assert.deepEqual(tramosIndice({ niveles: { alto: 80, medio: 50 } })[1], ['Medio', 50, 79], 'si el usuario mueve los cortes en Ajustes, la escala los sigue');
});

test('la nota de cada tramo dice cuántos puntos faltan', () => {
  const t = tramosIndice(cfg);
  assert.match(notaTramo(69, t[2], t), /Estás aquí:<\/b> 69 de 100, riesgo alto\. Para bajar a riesgo medio te faltan <b>3 puntos<\/b>/);
  assert.match(notaTramo(69, t[0], t), /de 0 a 33\. Para llegar te faltan <b>36 puntos<\/b> menos/);
  assert.match(notaTramo(20, t[2], t), /Estás <b>47 puntos<\/b> por debajo/);
  assert.match(notaTramo(20, t[0], t), /Sigue con lo que haces/);
  assert.match(notaTramo(34, t[1], t), /te faltan <b>1 punto<\/b>/);
});

test('solo se ve la nota del nivel actual y el número cuenta desde cero', () => {
  const h = escalaIndice(69, 'Alto', 'Atiéndelo primero', cfg);
  assert.match(h, /data-contar="69">69</);
  assert.match(h, /data-tramo="Alto" aria-pressed="true"/);
  assert.equal((h.match(/aria-pressed="true"/g) || []).length, 1);
  assert.equal((h.match(/<p data-nota="[^"]+">/g) || []).length, 1, 'una sola nota visible');
  assert.match(h, /href="#urgentes"/);
});
