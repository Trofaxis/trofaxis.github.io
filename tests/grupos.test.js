// Menú de 4 tareas (facilidad de uso, punto 3): las 8 pestañas quedan agrupadas en Inicio, Mi finca,
// Registrar y Auditoría. Ninguna pantalla se pierde y Ajustes sigue en el menú de la cuenta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { instalarDOM } from './dom-falso.js';

const dom = instalarDOM();
const { S, demoFarm, emptyFarm } = await import('../src/core/state.js');
const { GRUPOS, grupoDe, subMenu } = await import('../src/ui/grupos.js');
const { viewDashboard, viewAuditoria } = await import('../src/ui/dashboard.js');
const { htmlCuenta } = await import('../src/ui/entrar.js');
const { pasosFinca } = await import('../src/core/completitud.js');
await import('../src/app.js');

const html = fs.readFileSync('index.html', 'utf8');
const nav = html.slice(html.indexOf('<nav class="tabs"'), html.indexOf('</nav>'));
const conFinca = (farm, fn) => { const p = { farm: S.farm, demo: S.demo, vt: S.vistaTecnica };
  try { S.farm = farm; S.demo = false; S.vistaTecnica = false; return fn(); }
  finally { S.farm = p.farm; S.demo = p.demo; S.vistaTecnica = p.vt; } };

test('el menú lateral tiene 4 grupos, en el mismo orden que GRUPOS', () => {
  const grupos = [...nav.matchAll(/data-grupo="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(grupos, GRUPOS.map((g) => g.id));
  for (const g of GRUPOS) assert.match(nav, new RegExp(`data-view="${g.vistas[0][0]}" data-grupo="${g.id}"`), `${g.titulo} abre su primera pantalla`);
  assert.doesNotMatch(nav, /data-view="ajustes"/);
});

test('las 8 pantallas de antes siguen alcanzables: 7 en los grupos y Ajustes en el menú de la cuenta', () => {
  const enGrupos = GRUPOS.flatMap((g) => g.vistas.map(([id]) => id));
  for (const v of ['dashboard', 'wizard', 'plantillas', 'riego', 'fertilizacion', 'plaguicidas', 'casos']) assert.ok(enGrupos.includes(v), `${v} está en un grupo`);
  assert.equal(new Set(enGrupos).size, enGrupos.length, 'ninguna pantalla está en dos grupos');
  const m = S.cuentaMenu; S.cuentaMenu = true;
  try { assert.match(htmlCuenta(), /data-view="ajustes"/); } finally { S.cuentaMenu = m; }
});

test('cada paso de «Te faltan X de 8 pasos» lleva a una pantalla que está en un grupo', () => {
  for (const p of pasosFinca(emptyFarm())) assert.ok(grupoDe(p.vista ?? 'wizard'), `el paso ${p.id} no queda huérfano`);
});

test('el submenú aparece solo en grupos con varias pantallas y marca la actual', () => {
  const h = subMenu('fertilizacion');
  assert.match(h, /<nav class="subtabs" aria-label="Registrar">/);
  assert.equal((h.match(/data-view=/g) ?? []).length, 3);
  assert.match(h, /data-view="fertilizacion" aria-current="page"/);
  assert.match(h, /data-view="plaguicidas" aria-current="false"/);
  assert.match(subMenu('casos'), /Fincas parecidas/);
  for (const v of ['dashboard', 'auditoria', 'ajustes', 'bienvenida']) assert.equal(subMenu(v), '', `sin submenú en ${v}`);
});

test('la app dibuja el submenú arriba de la pantalla al navegar', () => {
  dom.irA('riego');
  assert.equal(S.view, 'riego');
  assert.ok(dom.pantalla().startsWith('<nav class="subtabs" aria-label="Mi finca">'));
  dom.irA('dashboard');
  assert.doesNotMatch(dom.pantalla(), /class="subtabs"/);
});

test('Auditoría trae el panel GLOBALG.A.P. y el plan de acción; la vista técnica solo enlaza', () => {
  conFinca(demoFarm(), () => {
    const a = viewAuditoria();
    assert.match(a, /Margen de Minor Musts/);
    assert.match(a, /No conformidades abiertas/);
    assert.match(a, /Plan de acción/);
    assert.match(a, /No reemplaza la auditoría/);
    S.vistaTecnica = true;
    const t = viewDashboard();
    assert.doesNotMatch(t, /Margen de Minor Musts/);
    assert.match(t, /data-view="auditoria">Ir a Auditoría/);
  });
});

test('Auditoría sin GLOBALG.A.P. lo dice y deja cambiar la respuesta ahí mismo', () => {
  conFinca({ ...demoFarm(), gg: 'no' }, () => {
    const a = viewAuditoria();
    assert.doesNotMatch(a, /Margen de Minor Musts/);
    assert.match(a, /no busca GLOBALG\.A\.P\./);
    assert.match(a, /data-act="gg" data-v="quiero"/);
    assert.match(a, /Plan de acción/);
    S.vistaTecnica = true;
    assert.doesNotMatch(viewDashboard(), /Ir a Auditoría/);
  });
});
