// Pruebas de guardar y cargar fincas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportarTexto, importarTexto, normalizarFinca, normalizarAjustes, configBase, guardarLocal, guardarCasos, cargarLocal } from '../src/core/storage.js';
import { demoFarm, emptyFarm } from '../src/core/state.js';

test('exportar e importar devuelve la misma finca', () => {
  const ajustes = { modulosActivos: ['poli', 'suelo'], niveles: { alto: 70, medio: 40 } };
  const r = importarTexto(exportarTexto(demoFarm(), ajustes));
  assert.deepEqual(r.farm, demoFarm());
  assert.deepEqual(r.ajustes, ajustes);
});

test('rechaza archivos que no son de Trofaxis', () => {
  assert.throws(() => importarTexto('no es json'), /JSON válido/);
  assert.throws(() => importarTexto('{"hola":1}'), /no es una finca/);
  assert.throws(() => importarTexto('{"formato":"biogap-finca","version":99}'), /más nueva/);
});

test('un archivo incompleto se completa con valores por defecto', () => {
  const f = normalizarFinca({ nombre: 'Lote norte', area: 12 });
  assert.equal(f.nombre, 'Lote norte');
  assert.equal(f.area, 12);
  assert.deepEqual({ ...f, nombre: '', area: 0 }, emptyFarm());
});

test('descarta valores inválidos (meses fuera de rango, negativos, opciones desconocidas)', () => {
  const f = normalizarFinca({
    area: -5, pendiente: 'vertical', fertMeses: [3, 3, 14, -1, 'x', 0],
    especies: [{ nombre: 'Gliricidia sepium', tipo: 'Dragón', floracion: [12, 1] }, null],
  });
  assert.equal(f.area, 0);
  assert.equal(f.pendiente, null);
  assert.deepEqual(f.fertMeses, [0, 3]);
  assert.equal(f.especies.length, 1);
  assert.equal(f.especies[0].tipo, 'Árbol');
  assert.deepEqual(f.especies[0].floracion, [1]);
});

test('ajustes inválidos vuelven a los valores por defecto', () => {
  assert.deepEqual(normalizarAjustes({ niveles: { alto: 30, medio: 50 } }).niveles, configBase().niveles);
  assert.deepEqual(normalizarAjustes({ modulosActivos: ['agua', 'inventado', 'poli'] }).modulosActivos, ['poli', 'agua']);
});

import { normalizarTpl } from '../src/core/storage.js';

test('las plantillas viajan en el respaldo y se validan', () => {
  const tpl = { tipo: 'mec', objetivo: 150, rows: [{ fecha: '2026-01-10', lote: 'L1', valor: 40 }], paste: 'x' };
  const r = importarTexto(exportarTexto(demoFarm(), configBase(), tpl));
  assert.deepEqual(r.tpl, { ...tpl, paste: '' });
  const malo = normalizarTpl({ tipo: 'inventado', objetivo: -3, rows: [{ valor: 'x' }, null, { fecha: 1, lote: 2, valor: 5 }] }, { tipo: 'mec', objetivo: 0, rows: [], paste: '' });
  assert.equal(malo.tipo, 'mec');
  assert.equal(malo.objetivo, 0);
  assert.deepEqual(malo.rows, [{ fecha: '', lote: '', valor: 5 }]);
});

// ---- Aviso cuando el navegador no deja guardar ----
import { guardado } from '../src/core/aviso-guardado.js';

const TPL = { tipo: 'mec', objetivo: 0, rows: [], paste: '' };
test('guardarLocal avisa cuando el navegador no deja guardar y se recupera cuando vuelve a poder', () => {
  const previo = globalThis.localStorage;
  const estado = { farm: emptyFarm(), ajustes: configBase(), demo: false, tpl: TPL, done: {}, theme: 'light' };
  try {
    globalThis.localStorage = { getItem: () => null, setItem: () => { throw new DOMException('lleno', 'QuotaExceededError'); }, removeItem() {} };
    assert.equal(guardarLocal(estado), false);
    assert.equal(guardado.fallo, true);
    globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
    assert.equal(guardarLocal(estado), true);
    assert.equal(guardado.fallo, false);
  } finally { globalThis.localStorage = previo; }
});

test('guardar casos también registra el fallo', () => {
  const previo = globalThis.localStorage;
  try {
    globalThis.localStorage = { getItem: () => null, setItem: () => { throw new Error('bloqueado'); }, removeItem() {} };
    assert.equal(guardarCasos([]), false);
    assert.equal(guardado.fallo, true);
  } finally { globalThis.localStorage = previo; guardado.fallo = false; }
});

// ---- Datos de riego en el autoguardado (issue: se perdían al recargar) ----
import { casoEjemplo, declaradosEjemplo, calcular } from '../src/riego/calculo.js';
import { validar } from '../src/riego/reglas.js';
import { riegoInicial } from '../src/riego/guardado.js';

function conAlmacen(fn) {
  const previo = globalThis.localStorage, m = new Map();
  globalThis.localStorage = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
  try { return fn(m); } finally { globalThis.localStorage = previo; }
}
const estado = (riego) => ({ farm: emptyFarm(), ajustes: configBase(), demo: false, tpl: TPL, done: {}, theme: 'light', riego });

test('los datos de riego cargados por el usuario sobreviven a recargar la página', () => conAlmacen(() => {
  const datos = { ...casoEjemplo(), cultivo: 'Tomate', eto: 5.5 };
  const antes = { datos, fuente: 'archivo', archivo: 'mi-riego.xlsx', origen: { eto: { nombre: 'ETo', valor: 5.5, celda: 'A!B2', etiqueta: 'eto' } },
    declarados: declaradosEjemplo(), faltan: ['Kc final'], omitidas: [{ nombre: 'Hoja 2', motivo: 'sin etiquetas' }] };
  guardarLocal(estado(antes));
  const despues = cargarLocal(TPL).riego;
  assert.deepEqual(despues.datos, datos);
  assert.equal(despues.fuente, 'archivo');
  assert.equal(despues.archivo, 'mi-riego.xlsx');
  assert.deepEqual(despues.origen, antes.origen);
  assert.deepEqual(despues.faltan, antes.faltan);
  assert.deepEqual(despues.omitidas, antes.omitidas);
  // El validador da lo mismo con lo recuperado (los valores declarados del archivo se conservan).
  assert.deepEqual(validar(calcular(despues.datos), despues.declarados), validar(calcular(datos), antes.declarados));
}));

test('el caso de ejemplo de riego no se guarda como si fuera del usuario', () => conAlmacen((m) => {
  guardarLocal(estado(riegoInicial()));
  assert.equal(JSON.parse(m.get('biogap:v1')).riego, null);
  assert.equal(cargarLocal(TPL).riego, undefined); // la app se queda con el ejemplo de fábrica
}));

test('datos de riego dañados se descartan campo por campo y no rompen la app', () => conAlmacen((m) => {
  guardarLocal(estado(null));
  const o = JSON.parse(m.get('biogap:v1'));
  o.riego = { fuente: 'manual', archivo: 7, datos: { eto: '7', etapas: 'x', etoMensual: [1, 'a'], suelo: [null, 5, { area: 'z', nombre: 3 }],
    hidraulica: { principal: [{ di: Infinity, c: 'a' }], secundaria: 4 }, reservorio: [] },
    origen: { a: 5, b: { celda: 'X1' } }, declarados: { laa: 'no', numerosFijos: [1, null], volumenCiclo: '9' }, faltan: [1, 'Kc'], omitidas: [1, { nombre: 7 }] };
  m.set('biogap:v1', JSON.stringify(o));
  const r = cargarLocal(TPL).riego;
  assert.equal(r.datos.eto, null);
  assert.equal(r.datos.etapas.length, 4);
  assert.equal(r.datos.etoMensual.length, 12);
  assert.equal(r.datos.suelo.length, 1);
  assert.equal(r.datos.suelo[0].area, null);
  assert.equal(r.datos.hidraulica.principal[0].di, null);
  assert.equal(r.datos.hidraulica.principal[0].c, 140);
  assert.deepEqual(r.faltan, ['Kc']);
  assert.deepEqual(r.omitidas, [{ nombre: '', motivo: '' }]);
  assert.doesNotThrow(() => validar(calcular(r.datos), r.declarados));
}));
