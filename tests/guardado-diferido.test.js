// Guardado con espera: dos cambios seguidos dan un solo guardado y un cierre inmediato no pierde el último (issue 49).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearGuardado } from '../src/core/guardado-diferido.js';

// Reloj simulado: guarda las llamadas programadas y las dispara a mano.
function reloj() {
  let siguiente = 1; const activos = new Map();
  return {
    programar: (fn, ms) => { const id = siguiente++; activos.set(id, { fn, ms }); return id; },
    cancelar: (id) => { activos.delete(id); },
    disparar() { const todos = [...activos.entries()]; activos.clear(); todos.forEach(([, t]) => t.fn()); },
    pendientes: () => activos.size,
  };
}

test('dos cambios seguidos producen un solo guardado, tras la espera', () => {
  const r = reloj(); let n = 0;
  const g = crearGuardado(() => { n++; }, { programar: r.programar, cancelar: r.cancelar });
  g.pedir(); g.pedir(); g.pedir();
  assert.equal(n, 0); // todavía no guardó
  assert.equal(r.pendientes(), 1); // los temporizadores anteriores se cancelaron
  r.disparar();
  assert.equal(n, 1);
});

test('la espera por defecto es de 500 ms', () => {
  let ms; const g = crearGuardado(() => {}, { programar: (fn, t) => { ms = t; return 1; }, cancelar() {} });
  g.pedir();
  assert.equal(ms, 500);
});

test('un cierre inmediato (ahora) guarda lo pendiente y cancela el temporizador', () => {
  const r = reloj(); let n = 0;
  const g = crearGuardado(() => { n++; }, { programar: r.programar, cancelar: r.cancelar });
  g.pedir();
  assert.equal(g.ahora(), true);
  assert.equal(n, 1);
  assert.equal(r.pendientes(), 0);
  r.disparar();
  assert.equal(n, 1); // el temporizador cancelado no guarda de nuevo
});

test('ahora sin nada pendiente no guarda', () => {
  const r = reloj(); let n = 0;
  const g = crearGuardado(() => { n++; }, { programar: r.programar, cancelar: r.cancelar });
  assert.equal(g.ahora(), false);
  g.pedir(); r.disparar(); // guarda una vez
  assert.equal(g.ahora(), false); // y ya no queda nada
  assert.equal(n, 1);
});

test('guarda de nuevo si hay un cambio después del guardado', () => {
  const r = reloj(); let n = 0;
  const g = crearGuardado(() => { n++; }, { programar: r.programar, cancelar: r.cancelar });
  g.pedir(); r.disparar();
  g.pedir(); r.disparar();
  assert.equal(n, 2);
});
