// Registro rápido de plaguicidas (facilidad de uso, punto 4) y aviso de dosis mayor que la de la etiqueta.
// Las dosis son entradas de prueba, no recomendaciones.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const { S, emptyFarm } = await import('../src/core/state.js');
const { plagVacio, plagBorrador, normalizarPlag } = await import('../src/plag/modelo.js');
const { PRODUCTOS_SAG } = await import('../src/plag/sag.js');
const { desdeBusqueda, sobreDosis, revisarAplicacion, desdeSag } = await import('../src/plag/calculo.js');
const { viewPlaguicidas } = await import('../src/ui/plaguicidas.js');

const app = (o = {}) => ({ ...plagVacio(), producto: 'Prueba', meses: [1], formulacion: 'SC', ...o });
const titulos = (a) => revisarAplicacion(a, emptyFarm()).map((x) => `${x.nivel}: ${x.titulo}`);
const domark = PRODUCTOS_SAG.find((p) => p.nombre === 'Domark 210 ME');

test('buscar un fungicida del cuadro SAG llena el borrador como el selector del formulario completo', () => {
  const r = desdeBusqueda(plagBorrador(), 'domark 210 me', 4);
  const esperado = desdeSag(plagBorrador(), domark.id).borrador;
  assert.equal(r.borrador.sag, domark.id);
  assert.equal(r.borrador.producto, 'Domark 210 ME');
  assert.equal(r.borrador.dosis, esperado.dosis);
  assert.equal(r.borrador.dosisUnidad, esperado.dosisUnidad);
  assert.deepEqual(r.borrador.meses, [4], 'marca el mes actual si no había ninguno');
  assert.equal('buscar' in r.borrador, false);
});

test('buscar un ingrediente del catálogo lo pone como ingrediente y pide la concentración', () => {
  const r = desdeBusqueda(plagBorrador(), 'Imidacloprid', 0);
  assert.equal(r.borrador.sag, null);
  assert.equal(r.borrador.producto, 'Imidacloprid');
  assert.equal(r.borrador.componentes.length, 1);
  assert.equal(r.borrador.componentes[0].ia, 'imidacloprid');
  assert.equal(r.borrador.uso, 'insecticida');
  assert.match(r.notas.join(' '), /concentración/);
});

test('un nombre desconocido se guarda tal cual y no deja el producto SAG anterior', () => {
  const antes = desdeBusqueda(plagBorrador(), 'Domark 210 ME', 4).borrador;
  const r = desdeBusqueda({ ...antes, meses: [2, 3] }, 'Mi mezcla casera', 9);
  assert.equal(r.borrador.producto, 'Mi mezcla casera');
  assert.equal(r.borrador.sag, null);
  assert.deepEqual(r.borrador.meses, [2, 3], 'no cambia los meses ya marcados');
  assert.match(r.notas.join(' '), /formulario completo/);
  assert.deepEqual(desdeBusqueda(plagBorrador(), '   ', 1).borrador.meses, []);
});

test('sobreDosis compara en producto por hectárea, o tal cual si la unidad es la misma', () => {
  assert.deepEqual(sobreDosis(app({ dosis: 2, dosisUnidad: 'Lha' }), { dosis: 1, dosisUnidad: 'Lha' }), { veces: 2 });
  assert.equal(sobreDosis(app({ dosis: 1, dosisUnidad: 'Lha' }), { dosis: 1, dosisUnidad: 'Lha' }), false);
  assert.equal(sobreDosis(app({ dosis: 1, dosisUnidad: 'Lha' }), { dosis: null, dosisUnidad: 'Lha' }), null);
  // 250 ml por barril de 200 L con 400 L/ha = 0.5 L/ha, más que 0.4 L/ha.
  const x = sobreDosis(app({ dosis: 250, dosisUnidad: 'mlBarril', volumen: 400 }), { dosis: 0.4, dosisUnidad: 'Lha' });
  assert.ok(x && Math.abs(x.veces - 1.25) < 1e-9);
  // Sin agua por hectárea no se puede pasar a L/ha: misma unidad sí se compara, distinta no.
  assert.deepEqual(sobreDosis(app({ dosis: 300, dosisUnidad: 'mlBarril' }), { dosis: 150, dosisUnidad: 'mlBarril' }), { veces: 2 });
  assert.equal(sobreDosis(app({ dosis: 300, dosisUnidad: 'mlBarril' }), { dosis: 0.4, dosisUnidad: 'Lha' }), null);
});

test('aviso rojo si la dosis pasa la máxima de la etiqueta; nada si está dentro', () => {
  assert.ok(titulos(app({ dosis: 1.5, dosisUnidad: 'Lha', dosisEtiqueta: 1 })).includes('error: Dosis mayor que la de la etiqueta'));
  const t = titulos(app({ dosis: 1, dosisUnidad: 'Lha', dosisEtiqueta: 1 }));
  assert.ok(!t.some((x) => /Dosis mayor/.test(x)));
});

test('con un producto SAG sin dosis de etiqueta se compara con el cuadro, como aviso por revisar', () => {
  const b = desdeSag(plagVacio(), domark.id).borrador;
  const a = normalizarPlag({ ...b, meses: [1], dosis: b.dosis * 2 });
  assert.ok(titulos(a).includes('advertencia: Dosis mayor que la del cuadro SAG'));
  assert.ok(!titulos({ ...a, dosis: b.dosis }).some((x) => /Dosis mayor/.test(x)));
  const conEtq = titulos({ ...a, dosisEtiqueta: b.dosis * 3 });
  assert.ok(!conEtq.some((x) => /Dosis mayor/.test(x)), 'la etiqueta manda sobre el cuadro');
});

test('la dosis de la etiqueta se guarda y un archivo viejo la carga vacía', () => {
  assert.equal(normalizarPlag({ producto: 'X', meses: [1], dosisEtiqueta: 2.5 }).dosisEtiqueta, 2.5);
  assert.equal(normalizarPlag({ producto: 'X', clase: 'amplio', meses: [1] }).dosisEtiqueta, null);
});

test('la pestaña muestra el registro rápido, salvo cuando se edita una aplicación', () => {
  const prev = { farm: S.farm, d: S.draftPlag, e: S.plagEdit, demo: S.demo };
  try {
    S.farm = emptyFarm(); S.demo = false; S.plagEdit = null; S.draftPlag = plagBorrador();
    let h = viewPlaguicidas();
    assert.match(h, /<h2>Registro rápido<\/h2>/);
    assert.match(h, /<datalist id="pq-lista">/);
    assert.match(h, /value="Domark 210 ME"/);
    assert.match(h, /value="Imidacloprid"/);
    assert.match(h, /data-act="add-plag">3\. Guardar/);
    assert.doesNotMatch(h, /pqr-conc/);
    S.draftPlag = desdeBusqueda(plagBorrador(), 'Imidacloprid', 0).borrador;
    assert.match(viewPlaguicidas(), /id="pqr-conc"/, 'pide la concentración del ingrediente');
    S.farm = { ...emptyFarm(), plaguicidas: [normalizarPlag(app())] }; S.plagEdit = 0;
    h = viewPlaguicidas();
    assert.doesNotMatch(h, /Registro rápido/);
    assert.match(h, /id="pq-etq"/);
  } finally { S.farm = prev.farm; S.draftPlag = prev.d; S.plagEdit = prev.e; S.demo = prev.demo; }
});
