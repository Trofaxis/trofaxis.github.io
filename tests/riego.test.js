// Pruebas del módulo de riego: cálculo, reglas, lectura de Excel/CSV y extracción por etiquetas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcular, calcularCiclo, casoEjemplo, declaradosEjemplo, riegoVacio, pAjustada } from '../src/riego/calculo.js';
import { validar } from '../src/riego/reglas.js';
import { leerXlsx, ErrorLectura } from '../src/riego/xlsx.js';
import { leerCsv } from '../src/riego/csv.js';
import { extraerRiego } from '../src/riego/extraer.js';
import { hazenWilliams, factorF, velocidad, largoMaximoLateral, calcularReservorio, calorLatente } from '../src/riego/hidraulica.js';

const cerca = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≠ ${b}`);
const ids = (alertas, nivel) => alertas.filter((a) => !nivel || a.nivel === nivel).map((a) => a.id);

test('reproduce los resultados de la hoja del Lab de Riego', () => {
  const r = calcular(casoEjemplo());
  cerca(r.etc, 8.208);
  cerca(r.pp, 5.0);
  cerca(r.densidadEmisores, 41666.67);
  cerca(r.caudalHa, 50);
  cerca(r.tiempoRiego, 1.824);
  assert.equal(r.sectores, 6);
  cerca(r.caudalSector, 103.583);
  cerca(r.volumenPicoNeto, 1020.25);
});

test('lámina aprovechable en la zona radicular y con p ajustada (hallazgo 9)', () => {
  const r = calcular(casoEjemplo());
  cerca(r.pAjustada, 0.4217, 0.0005);
  const p3 = r.suelo[2];
  cerca(p3.laaPorMetro, 49.5);     // lo que dice la hoja
  cerca(p3.laaSinAjuste, 29.7);    // en 0.6 m de raíces
  cerca(p3.laa, 22.77);            // además con p ajustada
  assert.equal(r.intervaloMax, 2);
});

test('el caso de ejemplo dispara exactamente los hallazgos conocidos', () => {
  const r = calcular(casoEjemplo());
  const declarados = { laa: [99.792, 65.604, 49.5] };
  const a = validar(r, declarados);
  assert.deepEqual(ids(a, 'error').sort(), ['altura', 'laa-metro', 'lateral-largo']);
  assert.deepEqual(ids(a, 'advertencia').sort(), ['horas', 'p', 'velocidad']);
  assert.ok(ids(a, 'ok').includes('escorrentia'));
  assert.ok(ids(a, 'criterio').includes('raiz'));
});

test('un emisor de 2 L/h en el mismo suelo produce escorrentía', () => {
  const d = casoEjemplo();
  d.caudalEmisor = 2;
  const r = calcular(d);
  cerca(r.pp, 8.33);
  assert.ok(ids(validar(r), 'error').includes('escorrentia'));
});

test('con dos hileras por cama la densidad de emisores no se duplica dos veces', () => {
  const d = casoEjemplo();
  d.hileras = 2;
  const r = calcular(d);
  cerca(r.marco, 0.12);
  cerca(r.densidadEmisores, 83333.33); // la hoja original daría 166 667
});

test('ajuste de p de FAO-56 respeta los límites 0.1–0.8', () => {
  cerca(pAjustada(0.55, 5), 0.55);
  cerca(pAjustada(0.55, 15), 0.15);
  cerca(pAjustada(0.2, 20), 0.1);
  cerca(pAjustada(0.7, 1), 0.8);
});

test('datos vacíos no rompen el cálculo ni las reglas', () => {
  const r = calcular(riegoVacio());
  assert.equal(r.etc, null);
  assert.ok(Array.isArray(validar(r)));
});

test('datos faltantes se completan con referencia y se avisa', () => {
  const d = casoEjemplo();
  d.kcMed = null; d.suelo[0].da = null;
  const r = calcular(d);
  assert.equal(r.datos.kcMed, 1.2);
  assert.equal(r.datos.suelo[0].da, 1.35); // textura Far
  assert.ok(ids(validar(r)).includes('referencias'));
});

const buf = (ruta) => { const b = readFileSync(new URL(ruta, import.meta.url)); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };

test('lee un Excel con etiquetas propias y detecta sus errores', async () => {
  const libro = await leerXlsx(buf('./fixtures/ejemplo-riego.xlsx'));
  assert.deepEqual(libro.hojas.map((h) => h.nombre), ['Datos del cultivo', 'Emisor', 'Lote', 'Diseño']);
  const x = extraerRiego(libro);
  assert.equal(x.datos.cultivo, 'Maíz');
  assert.equal(x.datos.caudalEmisor, 1.6);         // etiqueta con error de escritura: "Cuadal"
  assert.equal(x.datos.areaLote, 8);
  assert.deepEqual(x.datos.suelo.map((s) => s.textura), ['F', 'FA']);
  assert.equal(x.origen.caudalEmisor.celda, 'Emisor!B2');
  assert.deepEqual(x.faltan, []);
  assert.ok(x.declarados.numerosFijos.some((h) => h.celda === 'Diseño!B7' && h.coincide === 'el área del lote'));
  const a = validar(calcular(x.datos), x.declarados);
  const errores = ids(a, 'error');
  assert.ok(errores.includes('escorrentia'), 'Pp 6.4 > infiltración 5');
  assert.ok(errores.includes('laa-metro'));
});

test('rechaza archivos que no son Excel sin romperse', async () => {
  await assert.rejects(leerXlsx(new TextEncoder().encode('hola').buffer), ErrorLectura);
});

test('lee CSV con punto y coma y coma decimal', () => {
  const csv = 'Cultivo;Maíz\nCaudal del emisor (L/h);1,2\nDistancia entre emisores (m);0,3\nDistancia entre laterales (m);0,8\nEspesor (mm);0.152';
  const x = extraerRiego(leerCsv(csv));
  assert.equal(x.datos.cultivo, 'Maíz');
  assert.equal(x.datos.caudalEmisor, 1.2);
  assert.equal(x.datos.distEmisores, 0.3);
  const libro = leerCsv(csv);
  assert.equal(libro.hojas[0].celdas.find((c) => c.ref === 'B5').v, 0.152);
});

test('casos límite: horas insuficientes y suelo que no alcanza ni un día', () => {
  const d = casoEjemplo();
  d.horasLaborales = 1;
  const a = validar(calcular(d));
  assert.ok(ids(a, 'error').includes('horas'));
  const d2 = casoEjemplo();
  d2.profRaiz = 0.1;
  const r2 = calcular(d2);
  assert.equal(r2.intervaloMax, 0);
  const fr = validar(r2).find((x) => x.id === 'frecuencia');
  assert.equal(fr.nivel, 'error');
  assert.match(fr.detalle, /ni con riego diario/);
});

// Ejercicio de ETc de la clase (Riego y Drenaje, Zamorano), maíz de 3 ha sembrado el 1 de enero, meses de 30 días.
// Resuelto a mano en /riego/Caso_prueba_ETc_resuelto.xlsx. Con Kc final lineal (0.6) en vez del promedio de
// los puntos de la tabla (0.6125), la etapa final da 73.8 mm en vez de 75.34.
test('consumo del ciclo: ejercicio de ETc de la clase', () => {
  const c = calcularCiclo({ kcIni: 0.1, kcMed: 1.0, kcFin: 0.2, etapas: [20, 30, 40, 30], siembra: '2017-01-01',
    etoMensual: [3.07, 3.43, 3.88, 4.1], mes30: true, areaLote: 3, eficiencia: 0.9 });
  assert.equal(c.fuenteEto, 'mensual');
  assert.deepEqual(c.etapas.map((e) => Math.round(e.etoSum * 10) / 10), [61.4, 99.3, 150.7, 123]);
  cerca(c.etapas[1].etc, 54.615);
  cerca(c.etcCiclo, 285.255);
  cerca(c.volumenNeto, 8557.65);
  cerca(c.volumenBruto, 9508.5);
});

test('consumo del ciclo: se acerca a la cubicación del reservorio del Lab (489.6 mm, ETo diaria 2024)', () => {
  const r = calcular(casoEjemplo());
  assert.equal(r.ciclo.fuenteEto, 'mensual');
  assert.deepEqual(r.ciclo.etapas.map((e) => e.dias), [20, 35, 40, 30]);
  assert.ok(Math.abs(r.ciclo.etcCiclo / 489.645 - 1) < 0.02, `${r.ciclo.etcCiclo}`);
  // Calendario real: 125 días desde el 1 de enero de 2024 (bisiesto) terminan el 3 de mayo.
  assert.deepEqual(r.ciclo.etapas[3].meses, ['abril', 'mayo']);
});

test('consumo del ciclo sin ETo mensual usa la ETo pico y lo avisa', () => {
  const d = { ...casoEjemplo(), siembra: '' };
  const r = calcular(d);
  assert.equal(r.ciclo.fuenteEto, 'pico');
  cerca(r.ciclo.etcCiclo, 720.765);
  const a = validar(r, { volumenCiclo: 58757.42 });
  assert.ok(ids(a, 'criterio').includes('ciclo-eto-pico'));
  assert.ok(!ids(a).includes('dif-volumenCiclo'), 'no compara un volumen calculado con la ETo pico');
});

test('volumen por ciclo del Lab: neto, con 12 ha y copiado de otra hoja', () => {
  const a = validar(calcular(casoEjemplo()), declaradosEjemplo());
  const adv = ids(a, 'advertencia');
  assert.ok(adv.includes('volumen-ciclo-neto'));
  assert.ok(adv.includes('fijo-Diseño Agronomico!E26-12'));
  assert.ok(ids(a, 'criterio').includes('eto-maximo'));
  const neto = a.find((x) => x.id === 'volumen-ciclo-neto');
  assert.match(neto.detalle, /66[.,]944 m³/);
});

test('distingue cálculos a mano, números pegados, área redondeada y partes no revisadas', () => {
  const celda = (ref, fila, col, v, f = null) => ({ ref, fila, col, v, f });
  const libro = { hojas: [
    { nombre: 'Diseño', celdas: [
      celda('A1', 1, 1, 'Área del lote (ha)'), celda('B1', 1, 2, 12.43),
      celda('A2', 2, 1, 'Volumen requerido por ciclo (m3)'), celda('B2', 2, 2, 58757.4, '=4896.45136111111*12'),
      celda('A3', 3, 1, 'Área del sector (m2)'), celda('B3', 3, 2, 20153.5, '=20781.393-627.885'),
    ] },
    { nombre: 'hf en secundaria', celdas: [celda('A1', 1, 1, 'Pérdida de carga Hazen-Williams')] },
  ] };
  const x = extraerRiego(libro);
  assert.deepEqual(x.declarados.calculosAMano, ['Diseño!B3']);
  assert.deepEqual(x.declarados.numerosFijos.map((h) => h.numero), ['4896.45136111111', '12']);
  assert.match(x.declarados.numerosFijos[0].coincide, /ETc del ciclo/);
  assert.equal(x.declarados.volumenCiclo, 58757.4);
  assert.equal(x.declarados.noRevisa.length, 1);
  assert.match(x.declarados.noRevisa[0], /hidráulica/);
});

// Hoja "Diseño Hidráulico Lab de riego 2025" (Anner Almendárez): valores de las celdas citadas.
test('hidráulica: reproduce la hoja del Lab (lateral, secundaria, principal)', () => {
  cerca(factorF(1), 1.00447, 1e-4);                                   // Lateral G18
  cerca(hazenWilliams(347 * 1.2, 104.1, 16.1, 150, factorF(347)), 1.0161, 1e-3); // Lateral I364
  assert.deepEqual(largoMaximoLateral(1.2, 0.3, 16.1, 150, 1.02), { emisores: 347, largo: 104.1 }); // Lateral F9
  const r = calcular(casoEjemplo());
  const h = r.hidraulica;
  cerca(h.hfMax, 1.02);
  cerca(h.lateral.hf, 2.2263, 1e-3);                                 // Lateral I474, el largo que toma la hoja CDT
  cerca(h.secundaria.f, 0.35600, 1e-4);                              // hf en secundaria L37
  cerca(h.secundaria.hf, 0.63934, 1e-3);                             // U37
  cerca(h.secundaria.v, 1.62218, 1e-3);                              // T37
  cerca(h.principal[0].hf, 4.1305, 1e-3);                            // hf en principales P34
  cerca(velocidad(100767.54, 155.3), 1.4777, 1e-3);                  // J34
  cerca(h.hfPrincipal, 10.085, 0.01);                                // sector 1: P34:P44
  cerca(h.cdt, 10.2 + 2.2263 + 0.6393 + 10.0848, 0.01);
  assert.deepEqual(h.faltan, ['Filtros', 'Accesorios', 'Desnivel']);
});

test('hidráulica: CDT completa da la potencia y el lateral corto pasa', () => {
  const d = casoEjemplo();
  Object.assign(d.hidraulica, { largoLateral: 100, filtros: 5, accesorios: 2, desnivel: 3, eficienciaBomba: 0.7 });
  const r = calcular(d);
  const a = validar(r);
  assert.equal(a.find((x) => x.id === 'lateral-largo').nivel, 'ok');
  assert.equal(a.find((x) => x.id === 'cdt').nivel, 'ok');
  const q = 100.76754 / 3.6;
  cerca(r.hidraulica.potenciaHp, q * r.hidraulica.cdt / (76 * 0.7), 1e-6);
});

// Cubicación del reservorio del Lab: ETc 489.645 mm, 12 ha, fuente 15 %, eficiencia 0.9, 110 × 110 m.
test('reservorio: reproduce la cubicación del Lab', () => {
  cerca(calorLatente(22), 2.449, 1e-3);                              // Cubicación E27
  const diasPorMes = [31, 29, 31, 30, 4, 0, 0, 0, 0, 0, 0, 0];
  const d = { areaLote: 12, eficiencia: 0.9, reservorio: casoEjemplo().reservorio };
  const res = calcularReservorio(d, { etcCiclo: 489.645, diasPorMes });
  cerca(res.laminaBrutaMm, 462.44, 0.01);                            // M7
  cerca(res.demanda, 55493, 1);                                      // L11
  // La hoja usa λ = 2.44 en marzo; con la fórmula de FAO-56 (2.4443) la evaporación sale 0.35 mm menos.
  cerca(res.evaporacionMm, 758.41, 0.5);                             // F24
  cerca(res.volumen, 64670, 10);                                     // M14
  cerca(res.profundidad, 5.345, 0.01);                               // M25
  cerca(res.profundidadTotal, 5.879, 0.01);                          // Q25
});

test('reservorio con talud necesita más profundidad y avisa si no cabe', () => {
  const base = { areaLote: 12, eficiencia: 0.9, reservorio: { ...casoEjemplo().reservorio, talud: 1 } };
  const ciclo = { etcCiclo: 489.645, diasPorMes: [31, 29, 31, 30, 4, 0, 0, 0, 0, 0, 0, 0] };
  const res = calcularReservorio(base, ciclo);
  assert.ok(res.profundidad > 5.345);
  const h = res.profundidad, L = 110, z = 1;
  cerca(h * (L * L - z * h * 2 * L + (4 / 3) * z * z * h * h), res.volumen, 1);
  const chico = calcularReservorio({ ...base, reservorio: { ...base.reservorio, largo: 20, ancho: 20 } }, ciclo);
  assert.ok(chico.noCabe);
});
