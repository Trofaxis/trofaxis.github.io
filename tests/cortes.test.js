// Bordes de los cortes de Agua, Suelo, Cadenas tróficas y Fertilización (issue 54).
// Cada tabla trae el valor justo en el corte y a cada lado, con el puntaje esperado escrito a mano (0, 50 o 100).
// Si cambias un corte en src/core/config.js, la primera prueba de cada tabla falla: actualiza la tabla para que
// siga cubriendo ambos lados de cada borde. Un cambio de ≤ a < en porCortes lo detectan las demás.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluar } from '../src/core/engine.js';
import { emptyFarm, demoFarm } from '../src/core/state.js';
import { normalizarFinca } from '../src/core/storage.js';
import { CONFIG } from '../src/core/config.js';
import { puntuar } from '../src/core/rubrica.js';

const finca = (o) => normalizarFinca({ ...emptyFarm(), ...o });
const modulo = (f, id, extra) => evaluar(f, CONFIG, extra).mods.find((m) => m.id === id);
const puntaje = (f, mod, id) => modulo(f, mod, undefined).variables.find((v) => v.id === id).puntaje;

// ---------- Constructores de fincas ----------
const MESES4 = [0, 1, 2, 3];
const aplic = (mes, dosis, o = {}) => ({ mes, producto: 'otro', n: 10, p: 0, k: 0, dosis, metodo: 'incorporado', ...o });
// dosis = kg de N × 10 con un producto de 10 % de N: así 1 unidad de la tabla = 1 kg de N exacto, sin decimales.
const planDeN = (partes, mesInicial = 0) => partes.map((n, i) => aplic(mesInicial + i, n * 10));
const especie = (i, origen, tipo = 'Árbol') => ({ nombre: `Especie ${i}`, tipo, origen, floracion: [], atrae: false, riesgo: false, cantidad: 1 });

// ---------- Las tablas ----------
// cortes/inverso: lo que debe decir config.js. casos: [valor, puntaje esperado]. null = sin dato.
const TABLAS = [
  // AGUA
  { mod: 'agua', id: 'distancia', cortes: [100, 30], inverso: true, finca: (x) => ({ distAgua: x }),
    casos: [[null, null], [101, 0], [100, 0], [99, 50], [31, 50], [30, 50], [29, 100], [0, 100]] },
  { mod: 'agua', id: 'proporcionProductiva', cortes: [0.5, 0.8], finca: (x) => ({ area: 100, areaProd: x }), // x = ha productivas de 100
    casos: [[0, null], [49, 0], [50, 0], [51, 50], [79, 50], [80, 50], [81, 100], [100, 100], [150, 100]] },
  // SUELO
  { mod: 'suelo', id: 'sueloDesnudoLluvia', cortes: [0, 1], // x = meses con suelo desnudo y lluvia a la vez
    finca: (x) => ({ lluviaMeses: [5, 6, 7, 8], sueloDesnudoMeses: [5, 6, 7, 8].slice(0, x) }),
    casos: [[0, 0], [1, 50], [2, 100], [3, 100]] },
  { mod: 'suelo', id: 'fertSueloDesnudo', cortes: [0, 0.25], // x = % del N + P₂O₅ aplicado sobre suelo desnudo en lluvias
    finca: (x) => ({ lluviaMeses: [5, 6], sueloDesnudoMeses: [5], fertPlan: x ? [aplic(5, x * 10), aplic(0, (100 - x) * 10)] : [aplic(0, 1000)] }),
    casos: [[0, 0], [1, 50], [24, 50], [25, 50], [26, 100], [100, 100]] },
  // CADENAS TRÓFICAS
  { mod: 'troficas', id: 'amplioEspectro', cortes: [0, 0.5], // x = productos de amplio espectro de 4
    finca: (x) => ({ plaguicidas: MESES4.map((i) => ({ producto: `P${i}`, clase: i < x ? 'amplio' : 'selectivo', meses: [i] })) }),
    casos: [[0, 0], [1, 50], [2, 50], [3, 100], [4, 100]] },
  { mod: 'troficas', id: 'amplioEnPlaga', cortes: [0, 0.5], // x = meses de amplio espectro con plaga, de 4
    finca: (x) => ({ plaguicidas: [{ producto: 'A', clase: 'amplio', meses: MESES4 }], plagas: [{ nombre: 'Plaga', meses: x ? MESES4.slice(0, x) : [8], severidad: 'media' }] }),
    casos: [[0, 0], [1, 50], [2, 50], [3, 100], [4, 100]] },
  { mod: 'troficas', id: 'nativas', cortes: [0.6, 0.3], inverso: true, // x = especies nativas de 10 silvestres
    finca: (x) => ({ especies: Array.from({ length: 10 }, (_, i) => especie(i, i < x ? 'nativa' : 'exótica')) }),
    casos: [[10, 0], [7, 0], [6, 0], [5, 50], [4, 50], [3, 50], [2, 100], [0, 100]] },
  { mod: 'troficas', id: 'aplicacionCosecha', cortes: [0, 0], // x = meses con aplicación en cosecha. Con [0, 0] el 50 no existe.
    finca: (x) => ({ cultivos: [{ nombre: 'Tomate', ha: 1, siembra: [0], cosecha: [2, 3, 4, 5] }],
      plaguicidas: [{ producto: 'P', clase: 'selectivo', meses: x ? [2, 3, 4, 5].slice(0, x) : [8] }] }),
    casos: [[0, 0], [1, 100], [2, 100], [4, 100]] },
  // FERTILIZACIÓN
  { mod: 'fert', id: 'dosis', cortes: [1, 1.2], finca: (x) => ({ nAplicado: x, nObjetivo: 100 }), // x = kg N aplicados de 100 de objetivo
    casos: [[99, 0], [100, 0], [101, 50], [120, 50], [121, 100], [0, 0]] },
  { mod: 'fert', id: 'lluvia', cortes: [0, 0.5], // sin plan; x = meses de fertilización con lluvia fuerte, de 4
    finca: (x) => ({ fertMeses: MESES4, lluviaMeses: x ? MESES4.slice(0, x) : [8] }),
    casos: [[0, 0], [1, 50], [2, 50], [3, 100], [4, 100]] },
  { mod: 'fert', id: 'lluvia', nombre: 'lluvia con plan', cortes: [0, 0.5], // x = aplicaciones iguales en lluvia, de 4
    finca: (x) => ({ fertPlan: planDeN([10, 10, 10, 10]), lluviaMeses: x ? MESES4.slice(0, x) : [8] }),
    casos: [[0, 0], [1, 50], [2, 50], [3, 100], [4, 100]] },
  { mod: 'fert', id: 'fraccionamiento', cortes: [0.5, 0.75], finca: (partes) => ({ fertPlan: planDeN(partes) }), // x = kg de N por mes
    casos: [[[1, 1, 1, 1], 0], [[49, 26, 25], 0], [[1, 1], 0], [[51, 49], 50], [[3, 1], 50], [[75, 25], 50], [[76, 24], 100], [[1], 100]] },
  { mod: 'fert', id: 'metodo', cortes: [0, 0.5], // x = aplicaciones de urea al voleo, de 4 iguales
    finca: (x) => ({ fertPlan: MESES4.map((i) => aplic(i, 100, { producto: 'urea', n: 46, metodo: i < x ? 'voleo' : 'incorporado' })) }),
    casos: [[0, 0], [1, 50], [2, 50], [3, 100], [4, 100]] },
  { mod: 'fert', id: 'fosforo', cortes: [1, 1.2], // x = kg de P₂O₅ aplicados de 100 de objetivo
    finca: (x) => ({ pObjetivo: 100, fertPlan: [aplic(0, x * 10, { n: 0, p: 10 })] }),
    casos: [[99, 0], [100, 0], [101, 50], [120, 50], [121, 100]] },
  { mod: 'fert', id: 'distancia', cortes: [100, 30], inverso: true, finca: (x) => ({ distAgua: x }),
    casos: [[null, null], [101, 0], [100, 0], [99, 50], [31, 50], [30, 50], [29, 100]] },
];

for (const t of TABLAS) {
  const nombre = `${t.mod}.${t.nombre ?? t.id}`;
  const real = CONFIG.rubrica[t.mod][t.id];

  test(`${nombre}: la tabla usa los cortes de config.js`, () => {
    assert.deepEqual(real.cortes, t.cortes, 'cambiaron los cortes en config.js: actualiza esta tabla');
    assert.equal(!!real.inverso, !!t.inverso, 'cambió el sentido (inverso) en config.js: actualiza esta tabla');
  });

  test(`${nombre}: valor justo en cada corte y a cada lado`, () => {
    for (const [valor, esperado] of t.casos) {
      assert.equal(puntaje(finca(t.finca(valor)), t.mod, t.id), esperado, `${nombre} con ${JSON.stringify(valor)}`);
    }
  });
}

test('aplicacionCosecha: sin plaguicidas o sin cultivos no hay dato (no es riesgo cero)', () => {
  assert.equal(puntaje(finca({ cultivos: [{ nombre: 'T', ha: 1, siembra: [0], cosecha: [2] }] }), 'troficas', 'aplicacionCosecha'), null);
  assert.equal(puntaje(finca({ plaguicidas: [{ producto: 'P', clase: 'selectivo', meses: [2] }] }), 'troficas', 'aplicacionCosecha'), null);
});

test('nativas: las especies de origen desconocido y los cultivos no cuentan', () => {
  const base = Array.from({ length: 4 }, (_, i) => especie(i, 'exótica'));
  const f = finca({ especies: [...base, especie(9, 'desconocido'), especie(10, 'nativa', 'Cultivo'), especie(11, 'nativa', 'Cultivo')] });
  assert.equal(puntaje(f, 'troficas', 'nativas'), 100); // 0 nativas de 4 silvestres
  assert.equal(puntaje(finca({ especies: [especie(1, 'desconocido')] }), 'troficas', 'nativas'), null);
});

// Categorías (sin cortes): cada respuesta da su puntaje, y sin respuesta no hay dato.
const CATEGORIAS = [
  { mod: 'suelo', id: 'labranza', campo: 'labranza', casos: [['cero', 0], ['minima', 50], ['convencional', 100], [null, null]] },
  { mod: 'suelo', id: 'pendiente', campo: 'pendiente', casos: [['plana', 0], ['ondulada', 50], ['fuerte', 100], [null, null]] },
  { mod: 'fert', id: 'pendiente', campo: 'pendiente', casos: [['plana', 0], ['ondulada', 50], ['fuerte', 100], [null, null]] },
  { mod: 'agua', id: 'sistema', campo: 'riego', casos: [['goteo', 0], ['aspersion', 50], ['gravedad', 100], ['ninguno', 0], [null, null]] },
];
for (const c of CATEGORIAS) {
  test(`${c.mod}.${c.id}: puntaje de cada respuesta`, () => {
    for (const [valor, esperado] of c.casos) assert.equal(puntaje(finca({ [c.campo]: valor }), c.mod, c.id), esperado, `${c.id} = ${valor}`);
  });
}

// ---------- Variables que no aplican ----------
test('puntuar: una variable con aplica: false no cuenta para el riesgo ni para la confianza', () => {
  const v = (id, peso, puntaje, aplica) => ({ id, peso, puntaje, ...(aplica === undefined ? {} : { aplica }) });
  const base = [v('a', 50, 0), v('b', 50, 100)];
  const sin = puntuar(base);
  assert.deepEqual([sin.score, sin.conf], [50, 1]);
  const con = puntuar([...base, v('x', 1000, 100, false)]);
  assert.deepEqual([con.score, con.conf], [50, 1], 'con dato y peso enorme, aplica: false no mueve nada');
  const sinDato = puntuar([...base, v('x', 1000, null, false)]);
  assert.deepEqual([sinDato.score, sinDato.conf], [50, 1], 'sin dato, aplica: false no baja la confianza');
  const aplicaSinDato = puntuar([...base, v('x', 100, null)]);
  assert.equal(aplicaSinDato.conf, 100 / 200, 'la misma variable sin aplica: false sí baja la confianza');
});

test('Agua: el fertirriego que escurre no suma al riesgo ni a la confianza si la finca no usa fertirriego', () => {
  const f = finca({ riego: 'goteo', distAgua: 200, area: 100, areaProd: 90 });
  const alertas = [{ id: 'escorrentia', nivel: 'error' }];
  const m = modulo(f, 'agua', { riego: alertas });
  const v = m.variables.find((x) => x.id === 'fertirriegoEscorrentia');
  assert.equal(v.aplica, false);
  assert.equal(v.puntaje, 100, 'la variable sí tiene dato: por eso la prueba es útil');
  // (sistema 0·25 + distancia 0·20 + proporción 100·15 + diseño 100·30) / 90 = 50; si contara: 5500 / 100 = 55.
  assert.equal(m.score, 50);
  // Sin diseño de riego cargado, la confianza es 60 de 90 de peso con dato (no 60 de 100).
  const sinDiseno = modulo(f, 'agua', undefined);
  assert.equal(sinDiseno.variables.find((x) => x.id === 'fertirriegoEscorrentia').aplica, false);
  assert.equal(Math.round(sinDiseno.conf * 1000) / 1000, Math.round((60 / 90) * 1000) / 1000);
});

test('Suelo: sin plan de fertilización, el fertilizante sobre suelo desnudo no baja la confianza', () => {
  const f = finca({ labranza: 'cero', pendiente: 'plana', lluviaMeses: [5, 6] });
  const m = modulo(f, 'suelo', undefined);
  assert.equal(m.variables.find((v) => v.id === 'fertSueloDesnudo').aplica, false);
  assert.equal(m.conf, 1);
  assert.equal(m.score, 0);
  // Con plan sí aplica y entra a los dos cálculos.
  const conPlan = modulo(finca({ labranza: 'cero', pendiente: 'plana', lluviaMeses: [5, 6], sueloDesnudoMeses: [5], fertPlan: [aplic(5, 1000)] }), 'suelo', undefined);
  assert.equal(conPlan.variables.find((v) => v.id === 'fertSueloDesnudo').aplica, true);
  // labranza 0·25 + pendiente 0·25 + suelo desnudo con lluvia (1 mes → 50)·35 + fertilizante sobre suelo desnudo (100 %) → 100·15
  assert.equal(conPlan.score, Math.round((50 * 35 + 100 * 15) / 100));
  assert.equal(conPlan.conf, 1);
});

// Barrido: para cualquier variable que no aplica, no importa qué peso y puntaje tenga; el módulo da lo mismo.
test('en todos los módulos, lo que valga una variable con aplica: false no cambia el puntaje ni la confianza', () => {
  const sinPlan = demoFarm(); sinPlan.fertPlan = [];
  const fincas = [emptyFarm(), demoFarm(), sinPlan, finca({ riego: 'goteo', especies: [{ ...especie(1, 'exótica'), riesgo: true, floracion: [9] }] })];
  let revisadas = 0;
  for (const f of fincas) {
    for (const m of evaluar(f, CONFIG, { riego: [{ id: 'escorrentia', nivel: 'error' }] }).mods) {
      const original = puntuar(m.variables);
      for (const v of m.variables.filter((x) => x.aplica === false)) {
        for (const alterada of [{ peso: 1000, puntaje: 100 }, { peso: 1000, puntaje: 0 }, { peso: 1000, puntaje: null }]) {
          const otras = m.variables.map((x) => (x === v ? { ...x, ...alterada } : x));
          const r = puntuar(otras);
          assert.deepEqual([r.score, r.conf], [original.score, original.conf], `${m.id}.${v.id} con ${JSON.stringify(alterada)}`);
        }
        revisadas++;
      }
    }
  }
  assert.ok(revisadas >= 8, `se revisaron ${revisadas} variables con aplica: false; debería haber varias (la prueba no debe quedar vacía)`);
});
