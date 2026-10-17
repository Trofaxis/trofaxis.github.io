// Prueba de humo: las 8 vistas y los 6 pasos del cuestionario se dibujan con la finca demostrativa y con la vacía,
// sin excepciones y sin que aparezca «undefined», «NaN» o «[object» en pantalla (issue 53).
// Usa un document simulado (tests/dom-falso.js): no hace falta navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const { S, demoFarm, emptyFarm } = await import('../src/core/state.js');
const { viewDashboard } = await import('../src/ui/dashboard.js');
const { viewWizard, STEPS } = await import('../src/ui/wizard.js');
const { viewTemplates } = await import('../src/ui/templates.js');
const { viewRiego } = await import('../src/ui/riego.js');
const { viewFertilizacion } = await import('../src/ui/fertilizacion.js');
const { viewPlaguicidas } = await import('../src/ui/plaguicidas.js');
const { viewCasos } = await import('../src/ui/casos.js');
const { viewSettings } = await import('../src/ui/settings.js');
const { riegoVacio } = await import('../src/riego/calculo.js');
const { riegoInicial } = await import('../src/riego/guardado.js');
const { normalizarFinca } = await import('../src/core/storage.js');

const MALO = /undefined|NaN|\[object/;

function revisar(nombre, dibujar) {
  let html;
  try { html = dibujar(); } catch (e) { assert.fail(`${nombre}: lanzó una excepción: ${e.stack?.split('\n').slice(0, 3).join(' | ')}`); }
  assert.equal(typeof html, 'string', `${nombre}: la vista no devolvió texto`);
  assert.ok(html.length > 200, `${nombre}: la vista salió casi vacía (${html.length} caracteres)`);
  const m = MALO.exec(html);
  if (m) assert.fail(`${nombre}: aparece «${m[0]}» en …${html.slice(Math.max(0, m.index - 100), m.index + 100).replace(/\s+/g, ' ')}…`);
}

const FINCAS = {
  'finca demo': () => { S.farm = demoFarm(); S.demo = true; },
  'finca vacía': () => { S.farm = emptyFarm(); S.demo = false; },
};

// Cada vista con el estado que la deja en sus pantallas más cargadas, además de la inicial.
const VISTAS = {
  tablero: () => viewDashboard(),
  'tablero en vista técnica': () => { S.vistaTecnica = true; try { return viewDashboard(); } finally { S.vistaTecnica = false; } },
  'tablero con el ApiRadar abierto': () => { S.problema = 'spathodea'; try { return viewDashboard(); } finally { S.problema = ''; } },
  'tablero con el borrado por confirmar': () => { S.confirmReset = true; try { return viewDashboard(); } finally { S.confirmReset = false; } },
  plantillas: () => viewTemplates(),
  'riego con el ejemplo': () => { S.riego = riegoInicial(); return viewRiego(); },
  'riego en blanco': () => { S.riego = { datos: riegoVacio(), fuente: 'manual', archivo: '', origen: {}, declarados: {}, faltan: [], omitidas: [] }; return viewRiego(); },
  fertilizacion: () => viewFertilizacion(),
  plaguicidas: () => viewPlaguicidas(),
  casos: () => viewCasos(),
  'casos con un caso propio guardado': () => {
    const previos = S.casos;
    S.casos = [{ id: 'propio-1', origen: 'propio', etiqueta: 'Mi finca · Tomate', guardado: '2026-01-01T00:00:00.000Z', finca: normalizarFinca(structuredClone(S.farm)) }];
    try { return viewCasos(); } finally { S.casos = previos; }
  },
  ajustes: () => viewSettings(),
};

for (const [fincaNombre, preparar] of Object.entries(FINCAS)) {
  for (const [vistaNombre, dibujar] of Object.entries(VISTAS)) {
    test(`${vistaNombre} con ${fincaNombre}`, () => {
      preparar();
      revisar(`${vistaNombre} con ${fincaNombre}`, dibujar);
    });
  }
  test(`los ${STEPS.length} pasos del cuestionario con ${fincaNombre}`, () => {
    preparar();
    assert.equal(STEPS.length, 6);
    S.wizModo = 'completo';
    STEPS.forEach((paso, i) => {
      S.step = i;
      revisar(`cuestionario, paso ${i + 1} (${paso}) con ${fincaNombre}`, () => viewWizard());
    });
    S.step = 0; S.wizModo = 'rapido';
  });
  test(`las preguntas rápidas con ${fincaNombre}`, () => {
    preparar();
    revisar(`preguntas rápidas con ${fincaNombre}`, () => viewWizard());
    S.rapido = { ...S.rapido, spathodea: 'si', insect: 'si' };
    revisar(`preguntas rápidas abiertas con ${fincaNombre}`, () => viewWizard());
  });
}

test('la prueba de humo sí detecta un «undefined», un «NaN» y un «[object» (que no esté vacía de sentido)', () => {
  for (const malo of ['<p>undefined</p>', '<p>NaN %</p>', '<p>[object Object]</p>']) {
    assert.throws(() => revisar('trampa', () => `<div>${'x'.repeat(250)}${malo}</div>`), /aparece/);
  }
  assert.throws(() => revisar('trampa', () => { throw new Error('rota'); }), /lanzó una excepción/);
  assert.throws(() => revisar('trampa', () => '<p>corta</p>'), /casi vacía/);
});
