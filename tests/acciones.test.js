// Acciones de mayor riesgo de src/app.js: reset-yes, io-load, add-plag y caso-guardar (issue 53).
// Se importa app.js de verdad con un document simulado (tests/dom-falso.js) y se le disparan clics, como en el navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instalarDOM } from './dom-falso.js';

const dom = instalarDOM();
const { S, demoFarm, emptyFarm } = await import('../src/core/state.js');
const { exportarTexto, configBase } = await import('../src/core/storage.js');
const { guardado } = await import('../src/core/aviso-guardado.js');
const { plagBorrador } = await import('../src/plag/modelo.js');
const { riegoVacio } = await import('../src/riego/calculo.js');
const { viewCasos } = await import('../src/ui/casos.js');
await import('../src/app.js');

const CLAVE_LOCAL = 'biogap:v1';
const CLAVE_CASOS = 'biogap:casos:v1';
const CLAVE_MAPA = 'biogap:mapa:v1';

function preparar({ demo = true } = {}) {
  dom.almacen.clear();
  globalThis.__sinAlmacen = false;
  guardado.fallo = false; guardado.descartado = false;
  S.farm = demo ? demoFarm() : emptyFarm();
  S.demo = demo;
  S.view = 'dashboard'; S.step = 0; S.msg = ''; S.io = ''; S.ioMsg = ''; S.confirmReset = false; S.done = {};
  S.tpl.rows = []; S.casos = [];
  S.draftPlag = plagBorrador(); S.plagEdit = null; S.plagNotas = []; S.plagMsg = null;
}

// ---------- reset-yes (Borrar mis datos) ----------
test('Borrar mis datos pide confirmar: «reset» solo marca y «reset-no» cancela sin borrar nada', () => {
  preparar();
  const antes = structuredClone(S.farm);
  dom.clic('reset');
  assert.equal(S.confirmReset, true);
  assert.deepEqual(S.farm, antes);
  dom.clic('reset-no');
  assert.equal(S.confirmReset, false);
  assert.deepEqual(S.farm, antes);
  assert.equal(S.demo, true);
});

test('reset-yes borra la finca, las plantillas, lo marcado, el riego propio y la ubicación, y vuelve al cuestionario', () => {
  preparar();
  S.tpl.rows = [{ fecha: '2026-01-02', lote: 'A', valor: 3 }];
  S.done = { 'finca-1': true };
  S.riego = { datos: riegoVacio(), fuente: 'archivo', archivo: 'mi-riego.xlsx', origen: {}, declarados: {}, faltan: [], omitidas: [] };
  S.confirmReset = true; S.view = 'ajustes'; S.step = 4;
  dom.almacen.set(CLAVE_MAPA, JSON.stringify({ punto: [14.1, -87.2] })); // la ubicación vive en el navegador

  dom.clic('reset-yes');
  dom.cerrarPagina(); // fuerza el guardado pendiente, si la app guarda con espera

  assert.deepEqual(S.farm, emptyFarm());
  assert.equal(S.demo, false);
  assert.deepEqual(S.done, {});
  assert.deepEqual(S.tpl.rows, []);
  assert.equal(S.riego.fuente, 'ejemplo', 'el riego propio se descarta y vuelve el ejemplo marcado como tal');
  assert.equal(S.riego.archivo, '');
  assert.equal(S.confirmReset, false);
  assert.equal(S.view, 'wizard');
  assert.equal(S.step, 0);
  assert.equal(S.ioMsg, 'Datos borrados.');
  assert.equal(dom.almacen.has(CLAVE_MAPA), false, 'la ubicación anterior se borra también');
  const guardada = JSON.parse(dom.almacen.get(CLAVE_LOCAL));
  assert.equal(guardada.farm.nombre, '', 'lo que queda guardado en el navegador ya es la finca vacía');
  assert.equal(guardada.demo, false);
  assert.match(dom.pantalla(), /Lo básico de tu finca/, 'la pantalla pasó a las preguntas rápidas del cuestionario');
});

// ---------- io-load (Cargar respaldo) ----------
test('io-load carga un respaldo exportado: finca, plantillas y vuelve a marcar la finca como propia', () => {
  preparar();
  S.farm.nombre = 'Finca del respaldo';
  S.farm.area = 12;
  S.tpl.rows = [{ fecha: '2026-02-03', lote: 'B', valor: 7 }];
  const texto = exportarTexto(S.farm, S.ajustes, S.tpl);

  S.farm = emptyFarm(); S.demo = true; S.done = { 'x': true }; S.tpl.rows = [];
  S.io = texto;
  dom.clic('io-load');

  assert.equal(S.farm.nombre, 'Finca del respaldo');
  assert.equal(S.farm.area, 12);
  assert.deepEqual(S.tpl.rows, [{ fecha: '2026-02-03', lote: 'B', valor: 7 }]);
  assert.equal(S.demo, false, 'una finca cargada ya no es la demostrativa');
  assert.deepEqual(S.done, {});
  assert.equal(S.io, '', 'el cuadro de texto se vacía al cargar');
  assert.equal(S.ioMsg, 'Respaldo cargado.');
});

test('io-load rechaza un texto de más de 2 MB sin tocar la finca (issue 60)', () => {
  preparar();
  S.farm.nombre = 'No me toques';
  S.io = 'x'.repeat(2_000_001);
  dom.clic('io-load');
  assert.equal(S.farm.nombre, 'No me toques');
  assert.match(S.ioMsg, /No se pudo cargar: El respaldo es demasiado grande \(máximo 2 MB\)/);
  assert.equal(S.io.length, 2_000_001, 'el texto pegado se conserva para que se pueda recortar');
});

test('io-load con un texto que no sirve dice por qué y no toca nada', () => {
  const valido = JSON.parse(exportarTexto(demoFarm(), configBase(), S.tpl));
  const casos = {
    vacío: '',
    'no es JSON': 'esto no es un respaldo',
    'JSON de otra cosa': '{"formato":"otra-app","version":1}',
    'versión más nueva': JSON.stringify({ ...valido, version: valido.version + 100 }),
  };
  for (const [nombre, texto] of Object.entries(casos)) {
    preparar();
    S.farm.nombre = 'Mi finca de antes';
    S.io = texto;
    dom.clic('io-load');
    assert.match(S.ioMsg, /^No se pudo cargar: /, nombre);
    assert.equal(S.farm.nombre, 'Mi finca de antes', `${nombre}: la finca no cambia`);
    assert.equal(S.demo, true, `${nombre}: sigue siendo la demostrativa`);
    assert.equal(S.io, texto, `${nombre}: el texto queda para que la persona lo corrija`);
  }
});

test('io-load con datos dañados dentro de un respaldo válido limpia lo dañado y la pantalla no se rompe', () => {
  preparar();
  const valido = JSON.parse(exportarTexto(demoFarm(), configBase(), S.tpl));
  valido.finca = { nombre: 12345, area: 'mucho', especies: 'no es lista', plaguicidas: [null, 5, { meses: 'x' }], cultivos: [{ nombre: null, cosecha: [99, -1, 'a'] }], lluviaMeses: [3, 3, 40] };
  S.io = JSON.stringify(valido);
  dom.clic('io-load');
  assert.equal(S.ioMsg, 'Respaldo cargado.');
  assert.ok(Number.isFinite(S.farm.area));
  assert.ok(Array.isArray(S.farm.especies) && Array.isArray(S.farm.plaguicidas));
  assert.doesNotMatch(dom.pantalla(), /undefined|NaN|\[object/);
});

// ---------- add-plag (Agregar una aplicación de plaguicida) ----------
test('add-plag sin nombre de producto avisa y no guarda nada', () => {
  preparar();
  const antes = S.farm.plaguicidas.length;
  S.draftPlag.producto = '   '; S.draftPlag.meses = [1];
  dom.clic('add-plag');
  assert.deepEqual(S.plagMsg, { nivel: 'error', texto: 'Escribe el nombre del producto.' });
  assert.equal(S.farm.plaguicidas.length, antes);
  assert.deepEqual(S.draftPlag.meses, [1], 'lo escrito queda en el formulario');
});

test('add-plag sin meses avisa y no guarda nada', () => {
  preparar();
  const antes = S.farm.plaguicidas.length;
  S.draftPlag.producto = 'Mancozeb'; S.draftPlag.meses = [];
  dom.clic('add-plag');
  assert.deepEqual(S.plagMsg, { nivel: 'error', texto: 'Marca al menos un mes de aplicación.' });
  assert.equal(S.farm.plaguicidas.length, antes);
  assert.equal(S.draftPlag.producto, 'Mancozeb');
});

test('add-plag con producto y meses agrega la aplicación y limpia el formulario', () => {
  preparar();
  const antes = S.farm.plaguicidas.length;
  S.draftPlag.producto = 'Clorotalonil'; S.draftPlag.meses = [4, 2, 2];
  dom.clic('add-plag');
  assert.equal(S.farm.plaguicidas.length, antes + 1);
  const x = S.farm.plaguicidas.at(-1);
  assert.equal(x.producto, 'Clorotalonil');
  assert.deepEqual(x.meses, [2, 4], 'los meses quedan ordenados y sin repetir');
  assert.equal(S.plagMsg.nivel, 'ok');
  assert.match(S.plagMsg.texto, /^Se agregó Clorotalonil\./);
  assert.equal(S.draftPlag.producto, '');
  assert.deepEqual(S.draftPlag.meses, []);
  assert.equal(S.plagEdit, null);
});

test('add-plag al editar reemplaza la aplicación elegida y no agrega otra', () => {
  preparar();
  const n = S.farm.plaguicidas.length;
  assert.ok(n >= 2, 'la finca demo trae aplicaciones');
  const otra = structuredClone(S.farm.plaguicidas[1]);
  dom.clic('plag-edit', { i: '0' });
  assert.equal(S.plagEdit, 0);
  assert.equal(S.draftPlag.producto, S.farm.plaguicidas[0].producto);
  S.draftPlag.producto = 'Producto corregido';
  dom.clic('add-plag');
  assert.equal(S.farm.plaguicidas.length, n);
  assert.equal(S.farm.plaguicidas[0].producto, 'Producto corregido');
  assert.deepEqual(S.farm.plaguicidas[1], otra, 'las demás no cambian');
  assert.match(S.plagMsg.texto, /^Se guardaron los cambios de Producto corregido\./);
  assert.equal(S.plagEdit, null);
});

test('add-plag con un índice de edición que ya no existe agrega una nueva en vez de fallar', () => {
  preparar();
  const n = S.farm.plaguicidas.length;
  S.draftPlag.producto = 'Nueva'; S.draftPlag.meses = [0];
  S.plagEdit = n + 10;
  dom.clic('add-plag');
  assert.equal(S.farm.plaguicidas.length, n + 1);
  assert.equal(S.farm.plaguicidas.at(-1).producto, 'Nueva');
});

// ---------- caso-guardar (Guardar mi finca como caso) ----------
test('caso-guardar con la finca demostrativa queda marcado como Ejemplo y se guarda en el navegador', () => {
  preparar({ demo: true });
  dom.irA('casos');
  dom.clic('caso-guardar');
  assert.equal(S.casos.length, 1);
  const c = S.casos[0];
  assert.equal(c.origen, 'ejemplo', 'una finca ficticia nunca se guarda como caso propio');
  assert.match(c.id, /^propio-/);
  assert.match(c.etiqueta, /^Finca demostrativa/);
  assert.ok(!Number.isNaN(Date.parse(c.guardado)));
  // render() muestra el aviso una vez y lo borra de S.msg: lo que cuenta es lo que ve la persona.
  assert.match(dom.pantalla(), /<span>Caso guardado\. La memoria tiene 1 caso\(s\) tuyos\.<\/span>/);
  const guardados = JSON.parse(dom.almacen.get(CLAVE_CASOS));
  assert.equal(guardados.length, 1);
  assert.equal(guardados[0].id, c.id);
  assert.match(viewCasos(), /badge ejemplo[^>]*>Ejemplo</, 'la vista lo muestra como Ejemplo');
});

test('caso-guardar con una finca real queda como caso propio, con nombre y cultivo en la etiqueta', () => {
  preparar({ demo: false });
  S.farm.nombre = 'Finca La Esperanza';
  S.farm.cultivos = [{ nombre: 'Tomate', ha: 2, siembra: [0], cosecha: [3] }, { nombre: 'Chile', ha: 5, siembra: [0], cosecha: [4] }];
  dom.clic('caso-guardar');
  assert.equal(S.casos[0].origen, 'propio');
  assert.equal(S.casos[0].etiqueta, 'Finca La Esperanza · Chile', 'el cultivo principal es el de más hectáreas');
  assert.match(viewCasos(), /badge propio[^>]*>Tu caso</);
  preparar({ demo: false });
  dom.clic('caso-guardar');
  assert.equal(S.casos[0].etiqueta, 'Finca sin nombre');
});

test('caso-guardar guarda una copia: cambiar la finca después no cambia el caso, y no lleva coordenadas', () => {
  preparar({ demo: false });
  S.farm.nombre = 'Antes';
  dom.clic('caso-guardar');
  S.farm.nombre = 'Después'; S.farm.area = 999;
  assert.equal(S.casos[0].finca.nombre, 'Antes');
  assert.notEqual(S.casos[0].finca.area, 999);
  assert.doesNotMatch(JSON.stringify(S.casos[0]), /"(lat|lon|lng|latitud|longitud|coordenadas)"/i);
});

test('caso-guardar con el almacenamiento lleno avisa que el caso solo quedó en la sesión', () => {
  preparar({ demo: false });
  dom.irA('casos');
  globalThis.__sinAlmacen = true;
  try {
    dom.clic('caso-guardar');
    dom.cerrarPagina(); // si la app guarda con espera, el intento de guardar la finca ocurre aquí, con el almacenamiento lleno
  } finally { globalThis.__sinAlmacen = false; }
  assert.equal(S.casos.length, 1, 'el caso queda en la sesión');
  assert.match(dom.pantalla(), /<span>El caso quedó en esta sesión, pero el navegador no permitió guardarlo\.<\/span>/);
  assert.equal(guardado.fallo, true, 'el aviso de que no se guarda aparece');
  assert.equal(dom.almacen.has(CLAVE_CASOS), false);
});
