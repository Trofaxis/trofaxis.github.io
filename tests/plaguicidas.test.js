// Plaguicidas: dosis por hectárea, peligro para himenópteros polinizadores (HQ), avisos y cuadro SAG.
// Casos 1 a 13 del documento de diseño de la sección. Las dosis son entradas de prueba, no recomendaciones.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluar } from '../src/core/engine.js';
import { emptyFarm, demoFarm } from '../src/core/state.js';
import { normalizarFinca, exportarTexto, importarTexto } from '../src/core/storage.js';
import { plagVacio, plagBorrador, normalizarPlag } from '../src/plag/modelo.js';
import { INGREDIENTES, buscarIngrediente, ingrediente } from '../src/plag/catalogo.js';
import { PRODUCTOS_SAG, ENFERMEDADES, productoSag, eficacia } from '../src/plag/sag.js';
import {
  peligroAbejas, productoPorHa, claseEPA, cuentaParaAbejas, puntajePeligro, abejasSinAguijon, grupos, rotacion,
  revisarAplicacion, revisarFinca, resumenPlag, fraccion, compararCopas, componentesDe, desdeSag, alElegirIngrediente,
  alElegirFormulacion,
} from '../src/plag/calculo.js';

const cerca = (a, b, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} no es ${b}`);
const app = (o = {}) => ({ ...plagVacio(), producto: 'Prueba', meses: [1], ...o });
// Una aplicación con un solo ingrediente y la dosis de i.a. que se pide: 1 L/ha de un producto con gHa g/L.
const conDosis = (ia, gHa, o = {}) => app({
  componentes: [{ ia, nombre: '', conc: gHa, dl50: null, mayor: false }], concUnidad: 'g', formulacion: 'SC', dosis: 1, dosisUnidad: 'Lha', ...o,
});
const esp = (o) => ({ nombre: 'x', tipo: 'Árbol', origen: 'nativa', floracion: [], atrae: false, riesgo: false, ...o });
const finca = (o = {}) => ({ ...emptyFarm(), ...o });
const conNativas = (o = {}) => finca({ especies: [esp({ nombre: 'Trigona fulviventris', tipo: 'Fauna' })], ...o });
const enFlor = (meses, o = {}) => finca({ especies: [esp({ nombre: 'Gliricidia sepium', floracion: meses, atrae: true })], ...o });
const titulos = (avisos) => avisos.map((a) => a.titulo);

test('caso 1: imidacloprid, 100 g/ha, supera el umbral; con abejas sin aguijón, ×10', () => {
  const r = peligroAbejas(conDosis('imidacloprid', 100), finca());
  cerca(r.hq, 1234.6);
  assert.equal(r.umbral, 42);
  assert.equal(r.supera, true);
  const n = peligroAbejas(conDosis('imidacloprid', 100), conNativas());
  assert.equal(n.factor, 10);
  cerca(n.hqEf, 12345.7);
});

test('caso 2: lambda-cihalotrina, 15 g/ha', () => {
  const r = peligroAbejas(conDosis('lambda-cihalotrina', 15), finca());
  cerca(r.hq, 394.7);
  assert.equal(r.supera, true);
});

test('caso 3: el spinosad marcado como biológico cuenta como peligro alto (antes daba 0)', () => {
  const p = conDosis('spinosad', 96, { clase: 'biologico' });
  const r = peligroAbejas(p, finca());
  cerca(r.hq, 26666.7);
  assert.equal(r.supera, true);
  assert.equal(cuentaParaAbejas(p, finca()), true);
  assert.equal(puntajePeligro(p, finca()).puntaje, 100);
  assert.ok(titulos(revisarAplicacion(p, finca())).includes('Marcado como biológico, pero es tóxico para abejas'));
  // Un biológico sin ingrediente sigue como antes: no cuenta.
  assert.equal(cuentaParaAbejas(app({ clase: 'biologico' }), finca()), false);
  // En el módulo Polinizadores, con floración en el mes de aplicación.
  const f = enFlor([1], { plaguicidas: [p] });
  const v = evaluar(f).mods.find((m) => m.id === 'poli').variables.find((x) => x.id === 'claseEnFloracion');
  assert.equal(v.puntaje, 100);
  assert.equal(v.estado, 'verificado');
  assert.match(v.valor, /HQ/);
});

test('caso 4: mancozeb, DL50 "mayor que": no supera para Apis; con abejas sin aguijón queda indeterminado', () => {
  const p = conDosis('mancozeb', 1600);
  const r = peligroAbejas(p, finca());
  assert.equal(r.cota, true);
  cerca(r.hq, 18.76);
  assert.equal(r.supera, false);
  assert.equal(puntajePeligro(p, finca()).puntaje, 0);
  const n = peligroAbejas(p, conNativas());
  cerca(n.hqEf, 187.6, 0.1);
  assert.equal(n.supera, null);
  assert.equal(puntajePeligro(p, conNativas()).puntaje, 50);
});

test('caso 5: 0.3 L/ha de un producto con 350 g/L de imidacloprid son 105 g/ha', () => {
  const p = conDosis('imidacloprid', 350, { dosis: 0.3 });
  const r = peligroAbejas(p, finca());
  cerca(r.comps[0].gHa, 105, 1e-9);
  cerca(r.hq, 1296.3);
});

test('caso 6: un archivo viejo { producto, clase, meses } se carga y da los mismos puntajes que main', () => {
  // Puntajes calculados con el código de main (commit 392413a) para esta misma finca.
  const vieja = {
    ...emptyFarm(), lluviaMeses: [5, 6, 8, 9],
    cultivos: [{ nombre: 'Tomate', ha: 2, siembra: [0], cosecha: [3, 4] }],
    especies: [esp({ nombre: 'Gliricidia sepium', floracion: [1, 2], atrae: true }),
      esp({ nombre: 'Spathodea campanulata', origen: 'exótica', floracion: [9, 10], atrae: true, riesgo: true, cantidad: 2 })],
    plagas: [{ nombre: 'Mosca blanca', meses: [1, 2, 3], severidad: 'alta' }],
    plaguicidas: [{ producto: 'Insecticida', clase: 'amplio', meses: [1, 2] }, { producto: 'Fungicida', clase: 'selectivo', meses: [9] },
      { producto: 'Beauveria', clase: 'biologico', meses: [10, 4] }],
  };
  const f = normalizarFinca(JSON.parse(JSON.stringify(vieja)));
  assert.deepEqual(f.plaguicidas[0], { ...plagVacio(), producto: 'Insecticida', clase: 'amplio', meses: [1, 2] });
  const r = evaluar(f);
  const mod = (id) => r.mods.find((m) => m.id === id);
  const pts = (id) => Object.fromEntries(mod(id).variables.map((v) => [v.id, v.puntaje]));
  assert.equal(mod('poli').score, 89);
  assert.deepEqual(pts('poli'), { coincidencia: 100, claseEnFloracion: 100, especiesRiesgo: 50, abundanciaRiesgo: 100, alternativas: 100, aguaSeca: 50, foliarEnFloracion: 0, climaFloracion: null, abejasNativas: null }); // climaFloracion: peso 0, solo informa
  assert.equal(mod('troficas').score, 55);
  assert.deepEqual(pts('troficas'), { amplioEspectro: 50, amplioEnPlaga: 100, nativas: 50, aplicacionCosecha: 0 });
});

test('caso 7: tres aplicaciones seguidas del grupo 4A dan el aviso de resistencia', () => {
  const ins = (ia, mes) => conDosis(ia, 50, { producto: ia, uso: 'insecticida', meses: [mes] });
  const f = finca({ plaguicidas: [ins('imidacloprid', 1), ins('tiametoxam', 2), ins('acetamiprid', 3)] });
  const r = rotacion(f.plaguicidas);
  assert.equal(r.length, 1);
  assert.deepEqual(r[0].grupos, ['4A']);
  assert.deepEqual(r[0].indices, [0, 1, 2]);
  assert.ok(titulos(revisarFinca(f)).includes('Mismo grupo IRAC seguido'));
  // Con otro grupo en medio, la racha se corta.
  const g = finca({ plaguicidas: [ins('imidacloprid', 1), ins('spinosad', 2), ins('acetamiprid', 3)] });
  assert.equal(rotacion(g.plaguicidas).length, 0);
});

test('casos 8 y 9: etiqueta de abamectina 50 g/L EC; el volumen por hectárea cambia la dosis', () => {
  const abam = (ml, litros) => app({ meses: [1], componentes: [{ ia: 'abamectina', nombre: '', conc: 50, dl50: null, mayor: false }],
    formulacion: 'EC', dosis: ml, dosisUnidad: 'mlBarril', volumen: litros, etiquetaAbejas: true });
  const a8 = abam(75, 600);
  cerca(productoPorHa(a8).valor, 0.225, 1e-9);
  const r8 = peligroAbejas(a8, finca());
  cerca(r8.comps[0].gHa, 11.25, 1e-9);
  cerca(r8.hq, 11250, 0.5);
  assert.ok(titulos(revisarAplicacion(a8, enFlor([1]))).includes('La etiqueta advierte por las abejas y aplicas en floración'));
  const a9 = abam(50, 100);
  cerca(productoPorHa(a9).valor, 0.025, 1e-9);
  cerca(peligroAbejas(a9, finca()).hq, 1250, 0.5);
  assert.equal(peligroAbejas(a9, finca()).supera, true);
  // Sin volumen no se puede pasar la dosis por tanque a hectárea.
  assert.match(productoPorHa({ ...a9, volumen: null }).motivo, /volumen de agua/);
});

test('caso 10: el producto que no sirve para la enfermedad da aviso rojo (cuadro SAG)', () => {
  const aviso = (sag, enfermedad) => revisarAplicacion(app({ sag, enfermedad }), finca()).find((a) => a.fuente?.cita?.includes('SAG') && /Sirve|no sirve|Eficacia/.test(a.titulo));
  const kumulus = 12, revus = 77, peronospora = 2, pseudoperonospora = 6, erysiphe = 10;
  assert.equal(productoSag(kumulus).nombre, 'Kumulus 80 WG');
  assert.equal(productoSag(revus).nombre, 'Revus 25 SC');
  assert.equal(aviso(kumulus, peronospora).nivel, 'error');
  assert.equal(aviso(revus, erysiphe).nivel, 'error');
  assert.equal(eficacia(productoSag(kumulus), erysiphe), 3);
  assert.equal(aviso(kumulus, erysiphe).nivel, 'ok');
  assert.equal(eficacia(productoSag(revus), peronospora), 5);
  assert.equal(eficacia(productoSag(revus), pseudoperonospora), 5);
  assert.equal(aviso(revus, pseudoperonospora).nivel, 'ok');
});

test('caso 11: Flint (11) seguido de Cabrio (11) o de Nativo (11 + 3) da aviso; de Score (3), no', () => {
  const sag = (id, mes) => ({ ...desdeSag(plagBorrador(), id).borrador, meses: [mes] });
  const flint = 127, cabrio = 107, score = 31, nativo = 128;
  assert.equal(rotacion([sag(flint, 1), sag(cabrio, 2)]).length, 1);
  assert.deepEqual(rotacion([sag(flint, 1), sag(nativo, 2)])[0].grupos, ['11']);
  assert.equal(rotacion([sag(flint, 1), sag(score, 2)]).length, 0);
  assert.ok(titulos(revisarFinca(finca({ plaguicidas: [sag(flint, 1), sag(cabrio, 2)] }))).includes('Mismo grupo FRAC seguido'));
});

test('caso 12: copas por bomba contra dosis por barril (Bankit cuadra; Manzate es polvo y no se convierte)', () => {
  const b = compararCopas(productoSag(5));
  assert.equal(b.copas, 0.5);
  cerca(b.deCopas, 138.9);
  assert.equal(b.tabla, 130);
  cerca(b.dif, -0.064, 0.001);
  assert.equal(b.cuadra, true);
  assert.equal(compararCopas(productoSag(76)), null);
  // Una dosis en copas de un polvo no se convierte a gramos.
  assert.match(productoPorHa(app({ formulacion: 'WP', dosis: 6, dosisUnidad: 'copas', volumen: 300 })).motivo, /copas miden volumen/);
});

test('caso 13: condiciones de aplicación fuera de rango y pH para cobres', () => {
  const a = app({ hora: '11:00', viento: 12, temp: 28, hr: 45, lluviaH: 2, ph: 7.5,
    componentes: [{ ia: 'hidroxido-cobre', nombre: '', conc: 77, dl50: null, mayor: false }] });
  const t = titulos(revisarAplicacion(a, finca()));
  for (const x of ['Fuera del horario de aplicación', 'Viento fuerte', 'Temperatura fuera de rango', 'Humedad relativa baja', 'Lluvia muy pronto']) assert.ok(t.includes(x), x);
  const ph = revisarAplicacion(a, finca()).find((x) => x.titulo === 'pH del agua fuera de rango');
  assert.match(ph.detalle, /cobres.*6\.5-7/);
  // Dentro de rango no hay avisos de condiciones.
  const bien = revisarAplicacion(app({ hora: '07:00', viento: 5, temp: 22, hr: 70, lluviaH: 6, ph: 6 }), finca());
  assert.equal(bien.filter((x) => x.fuente?.cita?.includes('Correcta aplicación') && x.nivel === 'advertencia').length, 0);
  // Con floración visitada, la clase pide aplicar de noche.
  assert.ok(titulos(revisarAplicacion(app({ hora: '07:00' }), enFlor([1]))).includes('Con polinizadores, aplicar de noche'));
});

test('clases de la EPA y umbral según la dirección de la aspersión', () => {
  assert.equal(claseEPA(0.081), 'I');
  assert.equal(claseEPA(8.09), 'II');
  assert.equal(claseEPA(74), 'III');
  assert.equal(claseEPA(100, true), 'III');
  assert.equal(claseEPA(4, true), 'II o III');
  assert.equal(claseEPA(null), null);
  // 2.5 g/ha de imidacloprid: HQ 30.9, bajo 42; hacia arriba el umbral es 85.
  assert.equal(peligroAbejas(conDosis('imidacloprid', 2.5), finca()).supera, false);
  assert.equal(peligroAbejas(conDosis('imidacloprid', 5, { direccion: 'arriba' }), finca()).umbral, 85);
  assert.equal(peligroAbejas(conDosis('imidacloprid', 5, { direccion: 'arriba' }), finca()).supera, false); // 61.7 < 85
  assert.equal(peligroAbejas(conDosis('imidacloprid', 5), finca()).supera, true); // 61.7 > 42
});

test('mezclas: manda el ingrediente que supera; sin DL50 de uno, el resultado no se da por bueno', () => {
  const mezcla = app({ formulacion: 'SC', dosis: 1, dosisUnidad: 'Lha', concUnidad: 'g', componentes: [
    { ia: 'azoxistrobina', nombre: '', conc: 200, dl50: null, mayor: false },
    { ia: 'lambda-cihalotrina', nombre: '', conc: 15, dl50: null, mayor: false }] });
  const r = peligroAbejas(mezcla, finca());
  assert.equal(r.supera, true);
  assert.equal(r.peor.ia, 'lambda-cihalotrina');
  const sinDato = app({ formulacion: 'SC', dosis: 1, dosisUnidad: 'Lha', componentes: [
    { ia: 'azoxistrobina', nombre: '', conc: 200, dl50: null, mayor: false },
    { ia: 'otro', nombre: 'Ingrediente nuevo', conc: 10, dl50: null, mayor: false }] });
  const s = peligroAbejas(sinDato, finca());
  assert.equal(s.supera, null);
  assert.match(s.motivo, /DL50 por contacto de Ingrediente nuevo/);
  // Con la DL50 escrita por el usuario, se calcula.
  sinDato.componentes[1].dl50 = 0.01;
  assert.equal(peligroAbejas(sinDato, finca()).supera, true);
});

test('concentración en % y dosis por tanque: 80 % WP, 1 kg por barril a 300 L/ha', () => {
  const a = app({ componentes: [{ ia: 'mancozeb', nombre: '', conc: 80, dl50: null, mayor: false }], concUnidad: 'pct',
    formulacion: 'WP', dosis: 1000, dosisUnidad: 'gBarril', volumen: 300 });
  cerca(productoPorHa(a).valor, 1.5, 1e-9); // kg/ha
  cerca(peligroAbejas(a, finca()).comps[0].gHa, 1200, 1e-9);
  // Unidad que no corresponde a la formulación.
  assert.match(productoPorHa({ ...a, dosisUnidad: 'mlBarril' }).motivo, /revisa la unidad/);
  // Bomba de 18 L.
  cerca(productoPorHa(app({ formulacion: 'EC', dosis: 25, dosisUnidad: 'mlBomba', volumen: 180 })).valor, 0.25, 1e-9);
});

test('abejas sin aguijón: se detectan por el género en el inventario de la finca', () => {
  const f = finca({ especies: [esp({ nombre: 'Trigona fulviventris', tipo: 'Fauna' }), esp({ nombre: 'Plebeia sp.', tipo: 'Fauna' }),
    esp({ nombre: 'Apis mellifera', tipo: 'Fauna' }), esp({ nombre: 'Abeja sin aguijón (jicote)', tipo: 'Fauna' }), esp({ nombre: 'Gliricidia sepium' })] });
  assert.deepEqual(abejasSinAguijon(f).map((e) => e.nombre), ['Trigona fulviventris', 'Plebeia sp.', 'Abeja sin aguijón (jicote)']);
  assert.ok(titulos(revisarFinca({ ...f, plaguicidas: [] })).includes('Abejas sin aguijón en tu finca'));
  assert.equal(abejasSinAguijon(finca()).length, 0);
});

test('grupos de modo de acción y familias para la rotación', () => {
  assert.deepEqual(grupos('FRAC M03'), ['M3']);
  assert.deepEqual(grupos('11 + 3'), ['11', '3']);
  assert.deepEqual(grupos('P07'), ['P7']);
  assert.deepEqual(grupos('NC'), []);
  assert.deepEqual(grupos('UNF'), []);
  // Un 28 de FRAC (propamocarb) no es un 28 de IRAC (clorantraniliprol).
  const fung = conDosis('propamocarb', 100, { meses: [1] });
  const ins = conDosis('clorantraniliprol', 100, { meses: [2] });
  assert.equal(rotacion([fung, ins]).length, 0);
  assert.equal(rotacion([fung, { ...fung, meses: [2] }])[0].familia, 'FRAC');
  // Herbicidas: HRAC.
  const herb = (mes) => conDosis('glifosato', 1000, { meses: [mes] });
  assert.ok(titulos(revisarFinca(finca({ plaguicidas: [herb(1), herb(2)] }))).includes('Mismo grupo HRAC seguido'));
  // Fosetil: 33 en el cuadro SAG, P07 en el PPDB; es el mismo grupo.
  const aliette = { ...desdeSag(plagBorrador(), 62).borrador, meses: [1] };
  const fosetil = conDosis('fosetil-al', 100, { meses: [2], grupo: '' });
  assert.equal(rotacion([aliette, fosetil]).length, 1);
});

test('avisos que conectan con riego y fertilización', () => {
  // Imidacloprid tiene GUS 3.69 (lixiviación alta): al suelo, aviso; al follaje, no.
  const suelo = conDosis('imidacloprid', 50, { metodo: 'suelo' });
  assert.ok(titulos(revisarAplicacion(suelo, finca())).includes('Producto móvil aplicado al suelo'));
  assert.ok(!titulos(revisarAplicacion(conDosis('imidacloprid', 50), finca())).includes('Producto móvil aplicado al suelo'));
  // Riego por aspersión después de una aplicación foliar.
  assert.ok(titulos(revisarAplicacion(app(), finca({ riego: 'aspersion' }))).includes('Riego por aspersión después de aplicar'));
  // Por el riego: válvula antirretorno.
  assert.ok(titulos(revisarAplicacion(app({ metodo: 'riego' }), finca())).includes('Aplicación por el sistema de riego'));
  // Foliar del plan de fertilización en el mismo mes.
  const fert = finca({ fertPlan: [{ mes: 1, producto: 'urea', n: 46, p: 0, k: 0, dosis: 5, metodo: 'foliar' }] });
  assert.ok(titulos(revisarAplicacion(app(), fert)).includes('Fertilización foliar en los mismos meses'));
});

test('etiqueta: cosecha, número de aplicaciones y franja al agua', () => {
  const f = finca({ cultivos: [{ nombre: 'Tomate', ha: 1, siembra: [0], cosecha: [1] }], distAgua: 10 });
  const t = revisarAplicacion(app({ meses: [1, 2, 3], diasCosecha: 7, aplicMax: 2, franja: 30 }), f);
  assert.ok(titulos(t).includes('Aplicación en mes de cosecha'));
  assert.ok(titulos(t).includes('Más aplicaciones que las que permite la etiqueta'));
  assert.equal(t.find((x) => x.titulo === 'Muy cerca del agua').nivel, 'error');
});

test('cuadro SAG: 132 productos, 41 enfermedades y eficacia de 1 a 5', () => {
  assert.equal(PRODUCTOS_SAG.length, 132);
  assert.equal(ENFERMEDADES.length, 41);
  for (const p of PRODUCTOS_SAG) assert.match(p.ef, /^[1-5-]{41}$/, p.nombre);
  // Celdas dañadas de la tabla, corregidas con una nota.
  assert.equal(productoSag(122).copas, '1/2'); // Domark: Excel lo había vuelto "2-Jan"
  assert.equal(productoSag(123).barril, ''); // Mertec: "}"
  assert.ok(productoSag(33).nota); // Bolco: 240 h de reingreso, dudoso
});

test('cuadro SAG sin formulación en el nombre: al elegirla se llena la dosis', () => {
  // "330" por barril sin unidad: puede ser ml o g. La app no lo adivina y pide la formulación.
  const zampro = PRODUCTOS_SAG.find((p) => p.nombre === 'Zampro');
  const { borrador: b, notas } = desdeSag(plagBorrador(), zampro.id);
  assert.equal(b.formulacion, '');
  assert.equal(b.dosis, null);
  assert.ok(notas.some((n) => /Elige la formulación de la etiqueta/.test(n)));
  // Líquida: 330 ml por barril, comparada con 1 1/3 copas por bomba.
  const sc = alElegirFormulacion({ ...b, formulacion: 'SC' });
  assert.equal(sc.borrador.dosis, 330);
  assert.equal(sc.borrador.dosisUnidad, 'mlBarril');
  assert.ok(sc.notas.some((n) => /copa\(s\) por bomba equivalen a 370\.4 ml/.test(n)));
  assert.ok(!sc.notas.some((n) => /Elige la formulación/.test(n)));
  // Si se corrige a polvo, la dosis de la tabla cambia de unidad; con "No sé" se vacía otra vez.
  const wg = alElegirFormulacion({ ...sc.borrador, formulacion: 'WG' });
  assert.equal(wg.borrador.dosis, 330);
  assert.equal(wg.borrador.dosisUnidad, 'gBarril');
  assert.equal(alElegirFormulacion({ ...wg.borrador, formulacion: '' }).borrador.dosis, null);
  // Una dosis escrita por el usuario no se toca, y fuera del cuadro SAG no hace nada.
  assert.equal(alElegirFormulacion({ ...sc.borrador, dosis: 300, dosisDeTabla: false, formulacion: 'WG' }), null);
  assert.equal(alElegirFormulacion({ ...plagBorrador(), formulacion: 'SC' }), null);
  // Con la formulación en el nombre, la dosis sale de una vez.
  assert.equal(desdeSag(plagBorrador(), 5).borrador.dosisDeTabla, true);
});

test('llenar el formulario desde el cuadro SAG', () => {
  const { borrador: b, notas } = desdeSag(plagBorrador(), 5); // Bankit 25 SC
  assert.equal(b.producto, 'Bankit 25 SC');
  assert.equal(b.uso, 'fungicida');
  assert.equal(b.grupo, '11');
  assert.equal(b.formulacion, 'SC');
  assert.equal(b.concUnidad, 'pct');
  assert.deepEqual(b.componentes.map((c) => [c.ia, c.conc]), [['azoxistrobina', 25]]);
  assert.equal(b.dosis, 130);
  assert.equal(b.dosisUnidad, 'mlBarril');
  assert.equal(b.reingreso, 4);
  assert.equal(b.diasCosecha, 0);
  assert.ok(notas.some((n) => /138\.9 ml por barril/.test(n)));
  // Reingreso "S": no se convierte en horas.
  const k = desdeSag(plagBorrador(), 12); // Kumulus
  assert.equal(k.borrador.reingreso, null);
  assert.ok(k.notas.some((n) => /Reingreso "S".*hasta que seque.*criterio propio/.test(n)));
  // Sin producto, se limpia la elección.
  assert.equal(desdeSag({ ...b }, null).borrador.sag, null);
  // Ingredientes nuevos del catálogo.
  assert.deepEqual(componentesDe('Metalaxil-M 4% + Mancozeb 64%').map((c) => [c.ia, c.conc]), [['metalaxil-m', 4], ['mancozeb', 64]]);
  assert.deepEqual(componentesDe('Pyraclostrobin 6.7% + Dimethomorph 12.0%').map((c) => c.ia), ['piraclostrobina', 'dimetomorf']);
  assert.equal(componentesDe('Metalaxil 8%')[0].ia, 'otro'); // el metalaxil no es el metalaxil-M
});

test('cantidades de la tabla y búsqueda de ingredientes', () => {
  assert.equal(fraccion('6'), 6);
  cerca(fraccion('1 1/3'), 1.333, 0.001);
  assert.equal(fraccion('1/2'), 0.5);
  assert.equal(fraccion('2-Jan'), null);
  assert.equal(buscarIngrediente('Lambda cyhalothrin').id, 'lambda-cihalotrina');
  assert.equal(buscarIngrediente('alfa-cipermetrina'), null);
  assert.equal(buscarIngrediente('Clorpirifós').id, 'clorpirifos');
  // Al elegir un ingrediente se llenan el grupo y el uso vacíos.
  const d = alElegirIngrediente({ ...plagBorrador(), componentes: [{ ia: 'spinosad', nombre: '', conc: null, dl50: null, mayor: false }] });
  assert.equal(d.grupo, '5A');
  assert.equal(d.uso, 'insecticida');
  // Si cambia de ingrediente, el grupo y el uso llenados por la app cambian con él; lo escrito por el usuario se queda.
  const e = alElegirIngrediente({ ...d, componentes: [{ ia: 'mancozeb', nombre: '', conc: null, dl50: null, mayor: false }] });
  assert.equal(e.grupo, 'M3');
  assert.equal(e.uso, 'fungicida');
  const m = alElegirIngrediente({ ...d, grupo: 'IRAC 5', grupoAuto: false, componentes: [{ ia: 'mancozeb', nombre: '', conc: null, dl50: null, mayor: false }] });
  assert.equal(m.grupo, 'IRAC 5');
  // Del cuadro SAG, el grupo de la tabla no se reemplaza.
  const sag = desdeSag(plagBorrador(), 5).borrador;
  assert.equal(alElegirIngrediente({ ...sag, componentes: [{ ia: 'mancozeb', nombre: '', conc: null, dl50: null, mayor: false }] }).grupo, '11');
});

test('catálogo: cada ingrediente tiene DL50, grupo y ficha del PPDB o BPDB', () => {
  const ids = new Set();
  for (const x of INGREDIENTES) {
    assert.ok(!ids.has(x.id), `repetido: ${x.id}`);
    ids.add(x.id);
    assert.ok(x.dl50 > 0, x.id);
    assert.ok(x.grupo, x.id);
    assert.match(x.url, /^https:\/\/sitem\.herts\.ac\.uk\/aeru\/(ppdb\/en|bpdb)\/Reports\/\d+\.htm$/, x.id);
    assert.match(x.actualizado, /^\d{4}-\d{2}-\d{2}$/, x.id);
    assert.ok(['insecticida', 'nematicida', 'fungicida', 'herbicida'].includes(x.uso), x.id);
  }
  assert.equal(ingrediente('spinosad').dl50, 0.0036);
});

test('normalizar una aplicación descarta lo inválido', () => {
  const a = normalizarPlag({ producto: 'X', clase: 'raro', meses: [1, 1, 13, -2], dosis: -3, hora: '25:00', viento: 'mucho',
    dosisUnidad: 'galones', componentes: [{ ia: 'imidacloprid', conc: '350' }, { ia: '', nombre: '' }, null], ph: 20, monitoreo: 'sí' });
  assert.equal(a.clase, 'amplio');
  assert.deepEqual(a.meses, [1]);
  assert.equal(a.dosis, null);
  assert.equal(a.hora, '');
  assert.equal(a.viento, null);
  assert.equal(a.dosisUnidad, 'mlBarril');
  assert.deepEqual(a.componentes, [{ ia: 'imidacloprid', nombre: '', conc: 350, dl50: null, mayor: false }]);
  assert.equal(a.ph, null);
  assert.equal(a.monitoreo, false);
  assert.equal(normalizarPlag(null), null);
});

test('las aplicaciones completas viajan en el respaldo', () => {
  const f = demoFarm();
  const r = importarTexto(exportarTexto(f, {}));
  assert.deepEqual(r.farm.plaguicidas, f.plaguicidas);
  assert.equal(r.farm.plaguicidas[0].componentes[0].ia, 'imidacloprid');
});

test('resumen de la pestaña con la finca de ejemplo', () => {
  const R = resumenPlag(demoFarm());
  assert.equal(R.filas.length, 2);
  assert.equal(R.filas[0].peligro.supera, true); // imidacloprid 105 g/ha
  assert.ok(R.sinAguijon.length > 0); // la finca de ejemplo registra abejas sin aguijón
  assert.equal(R.peor.i, 0);
  assert.ok(R.errores >= 1);
});
