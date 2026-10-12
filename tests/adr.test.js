import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const DIR = 'docs/adr';
const adrs = fs.readdirSync(DIR).filter((f) => /^\d{4}-.+\.md$/.test(f)).sort();

test('los ADR están numerados sin saltos y con el título que dice su número (issue 58)', () => {
  assert.ok(adrs.length >= 6);
  adrs.forEach((f, i) => {
    assert.equal(Number(f.slice(0, 4)), i + 1, `${f} rompe la numeración`);
    assert.match(fs.readFileSync(`${DIR}/${f}`, 'utf8'), new RegExp(`^# ADR-${f.slice(0, 4)}: `), `${f} debe empezar con su número`);
  });
});

test('cada ADR dice su estado, el contexto, la decisión, las alternativas y las consecuencias', () => {
  for (const f of adrs) {
    const t = fs.readFileSync(`${DIR}/${f}`, 'utf8');
    assert.match(t, /\*\*Estado:\*\*/, `${f}: falta el estado`);
    assert.match(t, /^## Contexto/m, `${f}: falta el contexto`);
    assert.match(t, /^## Decisi[oó]n/m, `${f}: falta la decisión`);
    assert.match(t, /^## (Alternativas|Opciones consideradas)/m, `${f}: faltan las alternativas`);
    assert.match(t, /^## Consecuencias/m, `${f}: faltan las consecuencias`);
  }
});

test('los ADR 3 a 6 dicen qué haría cambiar la decisión y solo citan archivos que existen', () => {
  for (const f of adrs.slice(2)) {
    const t = fs.readFileSync(`${DIR}/${f}`, 'utf8');
    assert.match(t, /Cambiaría esta decisión si/, `${f}: falta qué la cambiaría`);
    for (const m of t.matchAll(/`((?:src|docs|tests)\/[\w./-]+?)`/g)) {
      const ruta = m[1].replace(/[.,;]$/, '');
      assert.ok(fs.existsSync(ruta), `${f} cita ${ruta}, que no existe`);
    }
  }
});
