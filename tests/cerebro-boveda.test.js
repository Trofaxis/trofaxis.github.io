// Bóveda de Obsidian (cerebro/) como fuente de verdad del estado y la evidencia de los vínculos (2026-11-01).
// Lo que se edita en Obsidian entra a la app solo a través de src/cerebro/boveda.js, generado por scripts/cerebro.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { construir, cargarCodigo, escribir, leerEvidencia, pendientes, RAIZ, POR_COMPLETAR } from '../scripts/cerebro.mjs';
import { VINCULOS } from '../src/cerebro/vinculos.js';
import { evaluar } from '../src/core/engine.js';
import { demoFarm } from '../src/core/state.js';
import { conPlan } from '../src/fert/calculo.js';

const codigo = await cargarCodigo();

test('la bóveda está al día: src/cerebro/boveda.js y las partes del código en las notas coinciden con cerebro/', () => {
  const r = construir(codigo);
  assert.deepEqual(r.errores, []);
  const distintos = Object.entries(r.archivos).filter(([ruta, c]) => {
    const p = path.join(RAIZ, ruta);
    return !fs.existsSync(p) || fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n') !== c;
  }).map(([ruta]) => ruta);
  assert.deepEqual(distintos, [], 'corre «node scripts/cerebro.mjs» y vuelve a probar');
});

test('cada vínculo tiene estado y evidencia salidos de la bóveda', () => {
  for (const v of VINCULOS) {
    assert.ok(['con fuente', 'criterio propio', 'por validar'].includes(v.estado), `${v.id} sin estado`);
    for (const e of v.evidencia) assert.ok(e.cita && e.fuente && e.donde, `${v.id}: evidencia incompleta`);
  }
});

test('el estado del vínculo y el de la variable que se ve en la app no se contradicen', () => {
  const R = evaluar(conPlan(demoFarm()));
  const equivale = { 'con fuente': ['verificado', 'secundario'], 'criterio propio': ['criterio propio'], 'por validar': ['no verificado'] };
  for (const v of VINCULOS.filter((x) => x.usadoEn.modulo)) {
    const x = R.mods.find((m) => m.id === v.usadoEn.modulo)?.variables.find((y) => y.id === v.usadoEn.variable);
    assert.ok(x, `${v.id}: la rúbrica no trae ${v.usadoEn.variable}`);
    assert.ok(equivale[v.estado].includes(x.estado), `${v.id}: la bóveda dice «${v.estado}» y la app muestra «${x.estado}»`);
  }
});

test('la línea de evidencia exige una postura conocida y un enlace a la fuente', () => {
  const r = leerEvidencia('- a favor | [[osorio]] | pág. 27 | nota\n- aprueba | [[osorio]] | x\n- a favor | Osorio 2025 | pág. 3\n- menciona | [[kuniyoshi|Kuniyoshi]]');
  assert.deepEqual(r.evidencia.map((e) => [e.fuente, e.postura, e.donde]), [['osorio', 'a favor', 'pág. 27'], ['kuniyoshi', 'menciona', POR_COMPLETAR]]);
  assert.equal(r.errores.length, 2);
});

// Bóveda falsa en una carpeta temporal, para probar las reglas sin tocar la real.
function bovedaFalsa(editar) {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'trofaxis-boveda-'));
  escribir(construir(codigo).archivos, raiz);
  editar(path.join(raiz, 'cerebro'));
  return construir({ ...codigo, raiz });
}
const cambiar = (archivo, de, a) => fs.writeFileSync(archivo, fs.readFileSync(archivo, 'utf8').replace(de, a));

test('«con fuente» sin evidencia «a favor» con página es un error', () => {
  const r = bovedaFalsa((d) => cambiar(path.join(d, 'Vínculos', 'fert-lluvia.md'), 'estado: criterio propio', 'estado: con fuente'));
  assert.ok(r.errores.some((e) => e.includes('fert-lluvia') && e.includes('con fuente')));
});

test('una cita a una fuente que no existe es un error: no se inventan citas', () => {
  const r = bovedaFalsa((d) => cambiar(path.join(d, 'Vínculos', 'fert-lluvia.md'), '\n## Del código', '- a favor | [[brown-2024]] | pág. 4 | inventada\n\n## Del código'));
  assert.ok(r.errores.some((e) => e.includes('[[brown-2024]] no existe')));
});

test('una fuente nueva desde Obsidian necesita cita y acceso; con ellas, sube el vínculo a «con fuente»', () => {
  const malo = bovedaFalsa((d) => fs.writeFileSync(path.join(d, 'Fuentes', 'nueva.md'), '---\nclave: nueva\norigen: bóveda\ncita: ""\nacceso: ""\n---\n'));
  assert.ok(malo.errores.some((e) => e.includes('nueva.md: falta la cita')));
  const bueno = bovedaFalsa((d) => {
    fs.writeFileSync(path.join(d, 'Fuentes', 'nueva.md'), '---\nclave: nueva\norigen: bóveda\ncita: "Autor (2020). Título."\nacceso: "https://ejemplo.org/doc"\n---\n');
    const f = path.join(d, 'Vínculos', 'fert-lluvia.md');
    cambiar(f, 'estado: criterio propio', 'estado: con fuente');
    cambiar(f, '\n## Del código', '- a favor | [[nueva]] | Tabla 2 | prueba\n\n## Del código');
  });
  assert.deepEqual(bueno.errores, []);
  assert.equal(bueno.boveda.vinculos['fert-lluvia'].estado, 'con fuente');
  assert.equal(bueno.boveda.vinculos['fert-lluvia'].evidencia[0].cita, 'Autor (2020). Título.');
});

test('«por validar» con evidencia «a favor» es un error', () => {
  const r = bovedaFalsa((d) => cambiar(path.join(d, 'Vínculos', 'poli-foliar.md'), '- menciona | [[kuniyoshi]]', '- a favor | [[kuniyoshi]]'));
  assert.ok(r.errores.some((e) => e.includes('poli-foliar') && e.includes('por validar')));
});

test('los pendientes listan las evidencias «a favor» sin página', () => {
  const p = pendientes(construir(codigo).boveda);
  assert.ok(p.every((x) => typeof x === 'string'));
  assert.ok(p.some((x) => x.startsWith('poli-hq')));
});
