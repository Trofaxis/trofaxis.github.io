// Las acciones de los botones (data-act) viven en un mapa acción → función en src/app.js (issue 56).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { instalarDOM } from './dom-falso.js';

const app = fs.readFileSync('src/app.js', 'utf8');
const dom = instalarDOM();
const { S, demoFarm } = await import('../src/core/state.js');
await import('../src/app.js');

function archivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name);
    return e.isDirectory() ? archivos(ruta) : [ruta];
  });
}
// Claves del mapa: las líneas «  'accion': (…) =>» dentro de los objetos acciones*.
const claves = [...app.matchAll(/^ {2}'([a-z0-9-]+)': \(/gm)].map((m) => m[1]);

test('el manejador de clics ya no es una cadena de else if sobre act', () => {
  assert.ok(!/else if\(act===(?!'nube-)/.test(app), 'quedó una rama else if(act===…) fuera de la nube');
  assert.ok(claves.length >= 60, `se esperaban al menos 60 acciones en el mapa, hay ${claves.length}`);
  assert.equal(new Set(claves).size, claves.length, 'hay una acción repetida en el mapa');
});

test('cada data-act que dibujan las vistas tiene su función en el mapa (o es de la nube)', () => {
  const usados = new Set();
  for (const f of archivos('src/ui').filter((x) => x.endsWith('.js'))) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/data-act="([a-z0-9-]+)"/g)) usados.add(m[1]);
  }
  assert.ok(usados.size > 40);
  const faltan = [...usados].filter((a) => !claves.includes(a) && !a.startsWith('nube-'));
  assert.deepEqual(faltan, [], `data-act sin función en src/app.js: ${faltan.join(', ')}`);
});

test('toda acción del mapa se usa en alguna vista (sin funciones muertas)', () => {
  const html = ['index.html', ...archivos('src').filter((x) => x.endsWith('.js'))].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const sobran = claves.filter((c) => !html.includes(`data-act="${c}"`));
  assert.deepEqual(sobran, [], `acciones que ninguna vista usa: ${sobran.join(', ')}`);
});

test('una acción desconocida solo vuelve a dibujar y no toca los datos', () => {
  S.farm = demoFarm(); S.view = 'dashboard';
  const antes = JSON.stringify(S.farm);
  dom.app.innerHTML = '';
  dom.clic('constructor');
  dom.clic('accion-que-no-existe');
  assert.equal(JSON.stringify(S.farm), antes);
  assert.ok(dom.pantalla().length > 100, 'debe haber dibujado la pantalla');
});

test('las acciones que suben al inicio de la página siguen siendo las mismas', () => {
  const m = app.match(/ACCIONES_QUE_SUBEN = new Set\(\[([^\]]+)\]\)/);
  assert.ok(m);
  assert.deepEqual([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]).sort(), ['bv-atras', 'bv-cuestionario', 'bv-saltar', 'bv-saltar-cuestionario', 'bv-siguiente', 'bv-ver',
    'finish', 'load-demo', 'next', 'prev', 'rapido-listo', 'reset-yes', 'start-empty', 'wiz-modo', 'wiz-paso']);
});
