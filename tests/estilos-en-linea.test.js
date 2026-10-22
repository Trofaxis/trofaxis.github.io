// Estilos en línea (issue 52): el espaciado, los anchos y los colores fijos viven en src/styles.css.
// En el HTML de las vistas solo puede quedar un style="…" cuando el valor depende de un dato (ancho de una barra, opacidad).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const raiz = new URL('../', import.meta.url);
const leer = (ruta) => readFileSync(new URL(ruta, raiz), 'utf8');
const vistas = readdirSync(new URL('src/ui/', raiz)).filter((f) => f.endsWith('.js')).map((f) => `src/ui/${f}`);
const css = leer('src/styles.css');

test('ningún style="…" fijo en las vistas ni en index.html: solo los que llevan un valor calculado (${…})', () => {
  const fijos = [];
  for (const ruta of [...vistas, 'index.html']) {
    leer(ruta).split('\n').forEach((linea, i) => {
      for (const m of linea.matchAll(/style="([^"]*)"/g)) {
        if (!m[1].includes('${')) fijos.push(`${ruta}:${i + 1}  style="${m[1]}"`);
      }
    });
  }
  assert.deepEqual(fijos, [], 'pasa estos estilos a una clase de src/styles.css:\n' + fijos.join('\n'));
});

test('los estilos en línea que quedan son los de las barras y la opacidad de las celdas', () => {
  const dinamicos = [];
  for (const ruta of vistas) {
    for (const m of leer(ruta).matchAll(/style="([^"]*\$\{[^"]*)"/g)) dinamicos.push(m[1].replace(/\$\{[^}]*\}/g, '${…}'));
  }
  // Una propiedad nueva aquí casi siempre debería ser una clase. Si de verdad depende de un dato, súmala a esta lista.
  const permitidos = new Set(['width:${…}%', 'opacity:${…}']);
  const otros = dinamicos.filter((s) => !permitidos.has(s));
  assert.deepEqual(otros, [], 'estilo en línea que no es un ancho de barra ni una opacidad: ' + otros.join(' | '));
  assert.ok(dinamicos.length >= 3, 'se esperaban al menos las barras del dashboard y de fertilización');
});

test('los anchos de los campos de riego (w-N) existen en styles.css', () => {
  const riego = leer('src/ui/riego.js');
  const usados = new Set([...riego.matchAll(/class="w-(\d+)[ "]/g)].map((m) => m[1]));
  for (const m of riego.matchAll(/inp\s*=\s*\(k,\s*w\s*=\s*(\d+)/g)) usados.add(m[1]); // ancho por defecto de cada fila
  for (const m of riego.matchAll(/inp\(\s*'[^']*'\s*,\s*(\d+)/g)) usados.add(m[1]); // anchos pasados a mano
  assert.ok(usados.size >= 4, 'se esperaban los anchos 64, 70, 72, 80 y 110');
  for (const w of usados) assert.match(css, new RegExp(`\\.w-${w}\\{width:${w}px\\}`), `falta .w-${w} en styles.css`);
});

test('cada clase de utilidad que usan las vistas está definida en styles.css', () => {
  const definidas = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
  const nuevas = ['stack', 'nowrap', 'maxw-110', 'w-auto', 'mt-8', 'pl-18', 'block', 'inline', 'rel', 'pointer', 't-der', 't-centro',
    'fw-400', 'fw-700', 'fs-125', 'txt-crit', 'txt-warn', 'txt-good', 'txt-ink', 'tenue', 'sprite', 'grafico', 'grafico-centrado',
    'grafico-480', 'grafico-340', 'grafico-min480', 'leyenda', 'plan-compacto', 'notice-col', 'editando', 'lista-nota', 'campo-coord',
    'nc-criterio', 'nc-dias', 'meta-objetivo', 'minw-0', 'minw-120', 'minw-260'];
  for (const gap of [4, 10]) nuevas.push(`gap-${gap}`);
  const faltan = nuevas.filter((c) => !definidas.has(c));
  assert.deepEqual(faltan, []);
  // y cada una se usa en alguna vista (si no, sobra en styles.css)
  const codigo = [...vistas, 'index.html'].map(leer).join('\n');
  const sinUso = nuevas.filter((c) => !new RegExp(`[\\s"'](${c})[\\s"'$]`).test(codigo));
  assert.deepEqual(sinUso, [], 'clases definidas que ninguna vista usa');
});

test('el nivel del ApiRadar usa una clase de color que existe (txt-crit, txt-warn o txt-good)', () => {
  const ar = leer('src/ui/apiradar.js');
  const niveles = [...ar.matchAll(/const tono = [^;]*;/g)][0][0];
  for (const n of ['crit', 'warn', 'good']) assert.ok(niveles.includes(`'${n}'`), `tono debería poder valer ${n}`);
  for (const n of ['crit', 'warn', 'good']) assert.match(css, new RegExp(`\\.txt-${n}\\{color:var\\(--${n}\\)\\}`));
});
