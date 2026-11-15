// Página de presentación (/conoce/). La página vende, pero no puede decir nada que la app no respalde:
// sus números salen del motor, sus citas del cerebro y su rueda es la misma de la app. Estas pruebas también
// cuidan la política de contenido, el peso de los videos, el respeto a «reducir movimiento» y la instalación.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { instalarDOM } from './dom-falso.js';

instalarDOM();
const raiz = new URL('../', import.meta.url);
const leer = (ruta) => readFileSync(new URL(ruta, raiz), 'utf8');
const existe = (ruta) => existsSync(new URL(ruta, raiz));
const html = leer('conoce/index.html');
const css = leer('conoce/conoce.css');
const guiones = ['conoce.js', 'instalar.js', 'rueda-demo.js', 'datos-demo.js'].map((f) => [f, leer(`conoce/${f}`)]);
const texto = (trozo) => trozo.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const { DEMO } = await import('../conoce/datos-demo.js');
const { archivoDemo } = await import('../scripts/conoce-datos.mjs');
const { demoFarm, S } = await import('../src/core/state.js');
const { evaluar } = await import('../src/core/engine.js');
const { configEfectiva, normalizarAjustes } = await import('../src/core/storage.js');
const { conPlan } = await import('../src/fert/calculo.js');
const { mesesRueda, ruedaAnio } = await import('../src/ui/rueda.js');
const { TESIS } = await import('../src/cerebro/tesis.js');
const rueda = await import('../conoce/rueda-demo.js');
const { detectarNavegador, pasosDe, NAVEGADORES, montarInstalar } = await import('../conoce/instalar.js');

// La evaluación tal como la hace el inicio de la app con la finca demostrativa.
const finca = conPlan(demoFarm());
const R = evaluar(finca, configEfectiva(normalizarAjustes(S.ajustes)), {});

// ---------- Datos: nada escrito a mano ----------

test('conoce/datos-demo.js está al día con el motor, los catálogos y el cerebro', () => {
  assert.equal(leer('conoce/datos-demo.js'), archivoDemo(), 'corre: node scripts/conoce-datos.mjs');
});

test('el índice, los temas y los meses son los que muestra la app con la finca demostrativa', () => {
  assert.equal(DEMO.indice.v, R.overall);
  assert.deepEqual(DEMO.temas.map((t) => [t.id, t.v, t.nivel]), R.mods.map((m) => [m.id, Math.round(m.score), m.level]));
  assert.deepEqual(DEMO.meses, mesesRueda(R, finca));
  assert.equal(DEMO.finca.nombre, 'Finca demostrativa', 'la página solo muestra la finca ficticia');
});

function valorDe(ruta) {
  const [grupo, clave] = ruta.split('.');
  if (grupo === 'temas') return DEMO.temas.find((t) => t.id === clave)?.v;
  return DEMO[grupo]?.[clave];
}

test('cada número del HTML (data-dato) es el del archivo generado, también sin JavaScript', () => {
  const datos = [...html.matchAll(/data-dato="([^"]+)"[^>]*>([^<]*)</g)];
  assert.ok(datos.length >= 18, `se esperaban al menos 18 datos y hay ${datos.length}`);
  for (const [, ruta, escrito] of datos) {
    assert.notEqual(valorDe(ruta), undefined, `data-dato="${ruta}" no existe en DEMO`);
    assert.equal(escrito.trim(), String(valorDe(ruta)), `data-dato="${ruta}"`);
  }
  // Las seis cifras de «Evidencia» están todas y ninguna se repite con otro valor.
  for (const clave of Object.keys(DEMO.cifras)) assert.match(html, new RegExp(`data-dato="cifras\\.${clave}"`), `falta cifras.${clave}`);
});

test('los textos fijos que repiten un dato coinciden con él', () => {
  assert.match(html, new RegExp(`índice ambiental de ${DEMO.indice.v} sobre 100`), 'texto alternativo de la captura');
  assert.match(html, new RegExp(`data-nivel-texto>riesgo ${DEMO.indice.nivel.toLowerCase()}<`));
  // El tablero ordena los temas de mayor a menor riesgo.
  const orden = [...html.matchAll(/<li data-tema="(\w+)">/g)].map((m) => m[1]);
  const esperado = [...DEMO.temas].sort((a, b) => b.v - a.v).map((t) => t.id);
  assert.deepEqual(orden, esperado);
  // Los títulos que cuentan temas dicen «cinco» y hay cinco.
  assert.equal(DEMO.cifras.temas, 5);
  assert.equal([...html.matchAll(/data-pestana="/g)].length, DEMO.cifras.temas);
});

test('la finca del tablero se presenta como ejemplo con datos ficticios', () => {
  const tablero = html.slice(html.indexOf('data-tablero'), html.indexOf('</aside>'));
  assert.match(tablero, />Ejemplo</);
  assert.match(tablero, /Datos ficticios/);
  assert.match(html, /Los datos de la finca demostrativa son ficticios/);
});

// ---------- Citas: solo frases verificadas en el cerebro ----------

test('cada cita es una frase verificada del cerebro, con su tesis y su página', () => {
  const figuras = [...html.matchAll(/<blockquote data-cita="([^"]+)">([\s\S]*?)<\/blockquote>\s*<figcaption>([\s\S]*?)<\/figcaption>/g)];
  assert.equal(figuras.length, DEMO.citas.length, 'una figura por cita');
  for (const [, clave, cuerpo, pie] of figuras) {
    const c = DEMO.citas.find((x) => x.clave === clave);
    assert.ok(c, `la cita ${clave} no está en datos-demo.js`);
    const tesis = TESIS.tesis.find((t) => t.clave === clave);
    assert.ok(tesis.items.some((i) => i.cita === c.frase && String(i.pagina) === c.pagina), `${clave}: la frase no está en el cerebro`);
    // «[…]» marca que la frase empieza a mitad de oración; el resto es la frase, sin tocar una palabra.
    assert.equal(texto(cuerpo).replace(/^\[…\] /, ''), c.frase, `${clave}: la frase no es idéntica`);
    assert.ok(texto(pie).endsWith(`Página ${c.pagina}.`), `${clave}: falta la página`);
    // El pie es la referencia de la tesis. Los asesores, si la referencia los lista, no se muestran.
    const referencia = c.fuente.replace(/ Asesores:.*$/, '');
    assert.ok(texto(pie).startsWith(referencia), `${clave}: la referencia no coincide con la del cerebro`);
  }
});

// ---------- Rueda del año: la misma de la app ----------

test('la rueda de la página dibuja los mismos trazos que la rueda de la app', () => {
  const app = ruedaAnio(R, finca, 0, { v: R.overall, nivel: DEMO.indice.nivel, sinDatos: false });
  DEMO.meses.forEach((d, i) => {
    const { toque, piezas } = rueda.piezasMes(d, i);
    assert.ok(app.includes(`<path class="r-toque" d="${toque}"/>`), `mes ${i}: zona de toque`);
    for (const p of piezas) assert.ok(app.includes(`<path class="${p.cls}" d="${p.d}"/>`), `mes ${i}: ${p.cls}`);
    const [x, y] = rueda.punto(rueda.R_TXT, rueda.anguloMedio(i));
    assert.ok(app.includes(`x="${x}" y="${y}" dy=".35em" text-anchor="middle">${rueda.MESES[i]}</text>`), `mes ${i}: rótulo`);
  });
});

test('el detalle de cada mes cuenta lo mismo que la app', () => {
  // Marzo es el mes más cargado de la finca demostrativa: cuatro hechos y tres coincidencias.
  const marzo = rueda.mesMasCargado(DEMO.meses);
  assert.equal(marzo, DEMO.meses.reduce((m, d, i) => (d.coinc.length > DEMO.meses[m].coinc.length ? i : m), 0));
  assert.deepEqual(rueda.mesesConCoincidencias(DEMO.meses).map((m) => m.i), DEMO.meses.flatMap((d, i) => (d.coinc.length ? [i] : [])));
  const app = ruedaAnio(R, finca, -1, { v: R.overall, nivel: DEMO.indice.nivel, sinDatos: false });
  DEMO.meses.forEach((d, i) => {
    // La frase de aplicaciones va en impersonal en la página; las demás son las de la app, palabra por palabra.
    const etiqueta = rueda.etiquetaMes(d, i).replace('se aplican plaguicidas', 'aplicas plaguicidas');
    assert.ok(app.includes(`aria-label="${etiqueta}"`), `mes ${i}: ${etiqueta}`);
  });
  assert.equal(rueda.etiquetaMes({ lluvia: false, flor: false, florRiesgo: false, aplic: false, siembra: false, cosecha: false, coinc: [] }, 11),
    'Diciembre: sin actividad registrada; sin coincidencias de riesgo.');
});

test('la rueda de la pantalla de carga enciende los meses de la finca demostrativa', () => {
  // Cada anillo es un círculo de 120 unidades (10 por mes): mes encendido = trazo de 9.2 y hueco de 0.8.
  const patron = (encendidos) => {
    const piezas = []; // alterna trazo, hueco, trazo…
    encendidos.forEach((si) => {
      if (si) { if (piezas.length % 2) piezas.push(0); piezas.push(92, 8); } else if (piezas.length % 2) piezas.push(100); else if (piezas.length) piezas[piezas.length - 1] += 100; else piezas.push(0, 100);
    });
    return piezas.map((n) => String(n / 10).replace(/^0\./, '.')).join(' ');
  };
  const anillos = {
    'c-lluvia': DEMO.meses.map((d) => d.lluvia),
    'c-flor': DEMO.meses.map((d) => d.flor),
    'c-aplic': DEMO.meses.map((d) => d.aplic),
    'c-ciclo': DEMO.meses.map((d) => d.siembra || d.cosecha),
    'c-coinc': DEMO.meses.map((d) => d.coinc.length > 0),
  };
  for (const [clase, encendidos] of Object.entries(anillos)) {
    const regla = css.match(new RegExp(`\\.${clase}\\{[^}]*stroke-dasharray:([^!;}]+)`));
    assert.ok(regla, `falta la regla .${clase}`);
    assert.equal(regla[1].trim(), patron(encendidos), `.${clase} no coincide con la finca demostrativa`);
  }
});

// ---------- Seguridad: nada en línea, nada de fuera ----------

test('la página declara su política de contenido antes de cargar nada y no la afloja', () => {
  const meta = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/);
  assert.ok(meta, 'falta la Content-Security-Policy');
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<link'), 'la política va antes de los <link>');
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script'), 'la política va antes de los <script>');
  const reglas = Object.fromEntries(meta[1].split(';').map((r) => r.trim().split(/\s+/)).map(([k, ...v]) => [k, v.join(' ')]));
  for (const k of ['default-src', 'script-src', 'style-src', 'img-src', 'media-src', 'font-src', 'connect-src']) assert.equal(reglas[k], "'self'", k);
  assert.equal(reglas['object-src'], "'none'");
  assert.doesNotMatch(meta[1], /unsafe|https?:|\*|data:/);
});

test('ni guiones ni estilos en línea: todo vive en archivos de la carpeta', () => {
  assert.deepEqual([...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]), ['<script type="module" src="conoce.js">']);
  assert.doesNotMatch(html, /<style\b/);
  assert.doesNotMatch(html, /\sstyle\s*=/);
  assert.doesNotMatch(html, /\son[a-z]+\s*=/, 'ningún manejador en línea (onclick…)');
  for (const [nombre, js] of guiones) {
    assert.doesNotMatch(js, /style\s*=\s*["'`]|setAttribute\(\s*['"]style|\.cssText|innerHTML|insertAdjacentHTML|document\.write|\beval\(/, nombre);
  }
});

test('la página no envía nada a ningún servidor ni guarda datos de quien la visita', () => {
  for (const [nombre, js] of guiones) {
    assert.doesNotMatch(js, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|document\.cookie/, nombre);
    const urls = [...js.matchAll(/https?:\/\/[^\s'"`)]+/g)].map((m) => m[0]);
    assert.deepEqual(urls.filter((u) => u !== 'http://www.w3.org/2000/svg'), [], `${nombre}: direcciones externas`);
  }
});

// Direcciones que usa el HTML, sin las metaetiquetas (canónica y vista previa al compartir, que deben ser absolutas).
function referencias() {
  const cuerpo = html.replace(/<meta\b[^>]*>/g, '').replace(/<link rel="canonical"[^>]*>/, '');
  const refs = [];
  for (const m of cuerpo.matchAll(/\s(src|href|poster|data-src|data-src-chico|data-poster)="([^"]+)"/g)) refs.push(m[2]);
  for (const m of cuerpo.matchAll(/\ssrcset="([^"]+)"/g)) for (const parte of m[1].split(',')) refs.push(parte.trim().split(/\s+/)[0]);
  return refs;
}
const aArchivo = (ref) => {
  const limpia = ref.split(/[?#]/)[0];
  const ruta = limpia.startsWith('/') ? limpia.slice(1) : `conoce/${limpia}`;
  return ruta === '' || ruta.endsWith('/') ? `${ruta}index.html` : ruta;
};

test('todo lo que la página carga es local y existe', () => {
  const refs = referencias();
  assert.ok(refs.length > 60);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const ref of refs) {
    if (ref.startsWith('mailto:')) { assert.match(ref, /^mailto:support\.trofaxis@gmail\.com(\?|$)/); continue; }
    assert.doesNotMatch(ref, /^(https?:)?\/\//, `recurso externo: ${ref}`);
    if (ref.startsWith('#')) { assert.ok(ids.has(ref.slice(1)), `no existe el ancla ${ref}`); continue; }
    assert.ok(existe(aArchivo(ref)), `no existe ${ref} (${aArchivo(ref)})`);
  }
  for (const m of css.matchAll(/url\(([^)]+)\)/g)) assert.ok(existe(aArchivo(m[1].replace(/["']/g, ''))), `no existe ${m[1]} (conoce.css)`);
  // La imagen para compartir sí va con dirección completa: así la leen WhatsApp y las redes.
  assert.match(html, /<meta property="og:image" content="https:\/\/trofaxis\.github\.io\/conoce\/media\/compartir\.jpg">/);
  assert.ok(existe('conoce/media/compartir.jpg'));
});

test('ningún archivo de conoce/media queda sin usar', () => {
  const usados = new Set([...referencias().map(aArchivo), 'conoce/media/compartir.jpg']);
  const sobran = readdirSync(new URL('conoce/media/', raiz)).filter((f) => !usados.has(`conoce/media/${f}`));
  assert.deepEqual(sobran, []);
});

// ---------- Movimiento y peso ----------

test('los videos no pesan en la carga inicial: mudos, sin descarga previa y con imagen fija', () => {
  const videos = [...html.matchAll(/<video\b[^>]*>/g)].map((m) => m[0]);
  assert.equal(videos.length, 7);
  for (const v of videos) {
    for (const atributo of [' muted', ' playsinline', ' loop', ' preload="none"', ' data-src="media/']) assert.ok(v.includes(atributo), `${atributo.trim()}: ${v}`);
    assert.doesNotMatch(v, /\ssrc=|autoplay/, `el video se carga desde conoce.js, cuando entra en pantalla: ${v}`);
    assert.doesNotMatch(v, /controls/);
  }
  // El de la portada tiene detrás una imagen normal; los demás, su cartel.
  assert.match(html, /<img class="portada-img" src="media\/portada\.webp"/);
  for (const v of videos.slice(1)) assert.match(v, /\s(data-)?poster="media\/[\w-]+\.webp"/);
});

test('conoce.js no carga videos con «reducir movimiento» ni con ahorro de datos, y deja pausar', () => {
  const js = leer('conoce/conoce.js');
  assert.match(js, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(js, /saveData/);
  assert.match(js, /IntersectionObserver/);
  assert.match(html, /<button[^>]*data-pausa[^>]*>[\s\S]*?Pausar movimiento/);
  assert.match(css, /html\[data-quieto\][^{]*\{animation-play-state:paused!important\}/);
});

test('el peso de los videos e imágenes se mantiene dentro del presupuesto', () => {
  const MB = 1024 * 1024;
  const archivos = readdirSync(new URL('conoce/media/', raiz)).map((f) => [f, statSync(new URL(`conoce/media/${f}`, raiz)).size]);
  const total = archivos.reduce((s, [, n]) => s + n, 0);
  assert.ok(total <= 12 * MB, `conoce/media pesa ${(total / MB).toFixed(1)} MB (máximo 12)`);
  for (const [f, n] of archivos) {
    if (f.endsWith('.mp4')) assert.ok(n <= 4 * MB, `${f} pesa ${(n / MB).toFixed(1)} MB (máximo 4)`);
    else assert.ok(n <= 200 * 1024, `${f} pesa ${Math.round(n / 1024)} KB (máximo 200)`);
  }
  // En teléfono la portada usa el video chico.
  const peso = (f) => archivos.find(([n]) => n === f)[1];
  assert.ok(peso('portada-480.mp4') < peso('portada-720.mp4') / 2);
});

test('todo el movimiento respeta «reducir movimiento»', () => {
  // Se recorre el CSS por bloques de primer nivel: fuera de @media (prefers-reduced-motion:no-preference)
  // no puede haber animaciones ni transiciones.
  const limpio = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const fuera = [];
  let nivel = 0, inicio = 0;
  for (let i = 0; i < limpio.length; i++) {
    if (limpio[i] === '{') nivel++;
    else if (limpio[i] === '}' && --nivel === 0) {
      const bloque = limpio.slice(inicio, i + 1).trim();
      inicio = i + 1;
      if (!bloque.startsWith('@media (prefers-reduced-motion:no-preference)')) fuera.push(bloque);
    }
  }
  assert.equal(nivel, 0, 'llaves sin cerrar en conoce.css');
  const movimiento = fuera.flatMap((b) => [...b.matchAll(/(animation|transition)[\w-]*:[^;}]+/g)].map((m) => m[0]));
  // Única excepción: el seguro de la pantalla de carga, que dura 0 s (no es movimiento) y la quita si el JavaScript no llega.
  assert.deepEqual(movimiento, ['animation:carga-salir 0s linear 7s forwards', 'animation:none']);
  assert.doesNotMatch(fuera.join('\n'), /scroll-behavior:\s*smooth/);
  assert.match(css, /@keyframes carga-salir\{to\{opacity:0;visibility:hidden\}\}/);
  assert.match(leer('conoce/sin-js.css'), /\.carga\{display:none\}/);
  assert.match(html, /<noscript><link rel="stylesheet" href="sin-js\.css"><\/noscript>/);
});

// ---------- Instalar Trofaxis ----------

test('la página usa el manifiesto de la app: lo que se instala es Trofaxis, no la página', () => {
  assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest">/);
  const manifiesto = JSON.parse(leer('manifest.webmanifest'));
  assert.equal(manifiesto.start_url, '/');
  assert.equal(manifiesto.scope, '/', 'el alcance «/» incluye /conoce/: el navegador ofrece instalar desde aquí');
  assert.equal(manifiesto.display, 'standalone');
  const botones = [...html.matchAll(/<(\w+)[^>]*\sdata-instalar[^>]*>/g)];
  assert.ok(botones.length >= 5, 'barra, portada, sección Instalar, planes y cierre');
  for (const [etiqueta, nombre] of botones) assert.equal(nombre, 'button', etiqueta);
  assert.equal([...html.matchAll(/<span data-rotulo>Instalar Trofaxis<\/span>/g)].length, botones.length);
});

test('se reconoce el navegador para dar los pasos correctos', () => {
  const casos = [
    ['chrome', { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', plataforma: 'Win32' }],
    ['edge', { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0', plataforma: 'Win32' }],
    ['firefox', { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0', plataforma: 'Win32' }],
    ['safari-mac', { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15', plataforma: 'MacIntel', toques: 0 }],
    ['chrome', { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', plataforma: 'MacIntel', toques: 0 }],
    ['ios', { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1', plataforma: 'iPhone', toques: 5 }],
    // iPadOS se presenta como Mac; se distingue por la pantalla táctil.
    ['ios', { ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15', plataforma: 'MacIntel', toques: 5 }],
    // Chrome en iPhone no puede instalar por su cuenta: se dan los pasos de iOS.
    ['ios', { ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.0.0 Mobile/15E148 Safari/604.1', plataforma: 'iPhone', toques: 5 }],
    ['android', { ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36', plataforma: 'Linux armv81', toques: 5 }],
    ['firefox-android', { ua: 'Mozilla/5.0 (Android 14; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0', plataforma: 'Linux armv81', toques: 5 }],
    ['otro', { ua: '', plataforma: '' }],
  ];
  for (const [esperado, datos] of casos) assert.equal(detectarNavegador(datos), esperado, datos.ua || '(vacío)');
  assert.equal(detectarNavegador(), 'otro');
});

test('cada navegador tiene tres pasos y no se promete instalar donde no se puede', () => {
  for (const [id, info] of Object.entries(NAVEGADORES)) {
    assert.equal(info.pasos.length, 3, id);
    assert.equal(typeof info.instala, 'boolean', id);
  }
  assert.equal(NAVEGADORES.firefox.instala, false, 'Firefox para computadora no instala aplicaciones web');
  assert.match(NAVEGADORES.firefox.pasos.join(' '), /Chrome o en Edge/);
  assert.equal(pasosDe('no-existe'), NAVEGADORES.otro);
  // Los botones del cuadro de pasos apuntan a navegadores que existen.
  const elegibles = [...html.matchAll(/data-navegador="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(elegibles.length >= 6);
  for (const id of elegibles) assert.ok(NAVEGADORES[id], `data-navegador="${id}"`);
  assert.match(html, /Firefox para computadora no instala aplicaciones web/, 'también lo dicen las preguntas frecuentes');
});

// Lo mínimo del navegador para probar el botón «Instalar Trofaxis» sin abrir uno.
function entornoInstalar({ ua, enApp = false, host = 'trofaxis.github.io' } = {}) {
  const nodo = (extra = {}) => ({
    textContent: '', hidden: false, dataset: {}, hijos: [], atributos: {}, escuchas: {},
    addEventListener(tipo, fn) { (this.escuchas[tipo] ??= []).push(fn); },
    setAttribute(k, v) { this.atributos[k] = v; },
    replaceChildren(...h) { this.hijos = h; },
    querySelector: () => null, querySelectorAll: () => [],
    ...extra,
  });
  const partes = (mapa) => ({ querySelector: (sel) => mapa[sel] ?? null });
  const botones = [0, 1].map(() => { const rotulo = nodo(); return nodo({ rotulo, querySelector: (sel) => (sel === '[data-rotulo]' ? rotulo : null) }); });
  const navegadores = ['chrome', 'ios'].map((id) => nodo({ dataset: { navegador: id } }));
  const dlg = { titulo: nodo(), lista: nodo(), nota: nodo() };
  const dialogo = nodo({
    abierto: false, ...partes({ '[data-pasos-titulo]': dlg.titulo, '[data-pasos]': dlg.lista, '[data-pasos-nota]': dlg.nota }),
    querySelectorAll: (sel) => (sel === '[data-navegador]' ? navegadores : []),
    showModal() { this.abierto = true; }, close() { this.abierto = false; },
  });
  const aviso = nodo({ hidden: true });
  const enLinea = { titulo: nodo(), lista: nodo() };
  const pasos = nodo(partes({ '[data-pasos-titulo]': enLinea.titulo, '[data-pasos]': enLinea.lista }));
  const clases = new Set();
  const doc = {
    documentElement: { classList: { toggle: (c, si) => (si ? clases.add(c) : clases.delete(c)) } },
    getElementById: (id) => ({ 'dlg-instalar': dialogo, 'instalar-aviso': aviso, 'instalar-pasos': pasos })[id] ?? null,
    querySelectorAll: (sel) => (sel === '[data-instalar]' ? botones : []),
    createElement: () => nodo(),
  };
  const escuchas = {};
  const registros = [];
  const ventana = {
    navigator: { userAgent: ua, platform: 'Win32', maxTouchPoints: 0, serviceWorker: { register: (...a) => { registros.push(a); return Promise.resolve(); } } },
    location: { hostname: host, href: '' },
    matchMedia: () => ({ matches: enApp }),
    addEventListener: (tipo, fn) => { (escuchas[tipo] ??= []).push(fn); },
  };
  const visitas = [];
  const estado = montarInstalar({ ventana, doc, alNavegar: (url) => visitas.push(url) });
  return {
    estado, botones, dialogo, dlg, aviso, enLinea, clases, registros, visitas, navegadores,
    emitir: (tipo, ev = {}) => (escuchas[tipo] ?? []).forEach((fn) => fn(ev)),
    pulsar: (b) => Promise.all(b.escuchas.click.map((fn) => fn({ target: b }))),
  };
}
const UA_CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const UA_FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0';

test('con la oferta del navegador, «Instalar Trofaxis» abre el cuadro de instalación de verdad', async () => {
  const e = entornoInstalar({ ua: UA_CHROME });
  let prevenido = 0, ofrecido = 0;
  const oferta = { preventDefault: () => { prevenido++; }, prompt: async () => { ofrecido++; }, userChoice: Promise.resolve({ outcome: 'accepted' }) };
  e.emitir('beforeinstallprompt', oferta);
  assert.equal(prevenido, 1, 'la oferta se guarda para el clic');
  assert.equal(e.estado.hayOferta(), true);
  assert.ok(e.clases.has('instalable'));
  await e.pulsar(e.botones[0]);
  assert.equal(ofrecido, 1, 'se llamó a prompt() del navegador');
  assert.equal(e.dialogo.abierto, false, 'no hacen falta instrucciones');
  assert.equal(e.aviso.textContent, 'Instalando Trofaxis…');
  assert.deepEqual(e.registros, [['/sw.js', { scope: '/' }]], 'se deja lista la app para abrir sin conexión');
  // Cada oferta sirve una sola vez: un segundo clic muestra los pasos en vez de fallar en silencio.
  await e.pulsar(e.botones[1]);
  assert.equal(ofrecido, 1);
  assert.equal(e.dialogo.abierto, true);
  // Cuando el navegador confirma la instalación, los botones pasan a abrir la app.
  e.emitir('appinstalled');
  assert.equal(e.estado.estaInstalada(), true);
  assert.deepEqual(e.botones.map((b) => b.rotulo.textContent), ['Abrir Trofaxis', 'Abrir Trofaxis']);
  assert.equal(e.dialogo.abierto, false);
  await e.pulsar(e.botones[0]);
  assert.deepEqual(e.visitas, ['/']);
});

test('si la persona cancela, se le dice y puede volver a intentarlo', async () => {
  const e = entornoInstalar({ ua: UA_CHROME });
  e.emitir('beforeinstallprompt', { preventDefault() {}, prompt: async () => {}, userChoice: Promise.resolve({ outcome: 'dismissed' }) });
  await e.pulsar(e.botones[0]);
  assert.match(e.aviso.textContent, /No se instaló/);
  assert.equal(e.aviso.hidden, false);
  assert.deepEqual(e.registros, []);
  assert.equal(e.estado.estaInstalada(), false);
});

test('sin oferta del navegador, el botón muestra los pasos de ese navegador', async () => {
  const e = entornoInstalar({ ua: UA_FIREFOX });
  assert.equal(e.estado.navegador, 'firefox');
  assert.deepEqual(e.botones.map((b) => b.rotulo.textContent), ['Instalar Trofaxis', 'Instalar Trofaxis']);
  assert.deepEqual(e.enLinea.lista.hijos.map((li) => li.textContent), NAVEGADORES.firefox.pasos, 'los pasos también están a la vista en la sección');
  await e.pulsar(e.botones[0]);
  assert.equal(e.dialogo.abierto, true);
  assert.equal(e.dlg.titulo.textContent, 'Firefox (computadora)', 'no dice «Instalar en Firefox»: ahí no se puede');
  assert.deepEqual(e.dlg.lista.hijos.map((li) => li.textContent), NAVEGADORES.firefox.pasos);
  // Desde el cuadro se pueden ver los pasos de otro navegador.
  e.navegadores[1].escuchas.click[0]();
  assert.equal(e.dlg.titulo.textContent, 'Instalar en iPhone o iPad');
  assert.equal(e.navegadores[1].atributos['aria-pressed'], 'true');
  assert.equal(e.navegadores[0].atributos['aria-pressed'], 'false');
});

test('dentro de la app instalada el botón abre Trofaxis, y en local no se registra el service worker', async () => {
  const e = entornoInstalar({ ua: UA_CHROME, enApp: true });
  assert.deepEqual(e.botones.map((b) => b.rotulo.textContent), ['Abrir Trofaxis', 'Abrir Trofaxis']);
  await e.pulsar(e.botones[0]);
  assert.deepEqual(e.visitas, ['/']);
  const local = entornoInstalar({ ua: UA_CHROME, host: 'localhost' });
  local.emitir('appinstalled');
  assert.deepEqual(local.registros, []);
});

test('la página no se guarda en el app shell: los videos no ocupan el almacenamiento de la app', () => {
  const sw = leer('sw.js');
  const shell = sw.slice(sw.indexOf('const APP_SHELL'), sw.indexOf('];', sw.indexOf('const APP_SHELL')));
  assert.doesNotMatch(shell, /conoce/);
});

// ---------- Iniciar sesión y crear cuenta ----------

test('«Iniciar sesión» y «Crear cuenta» abren la pantalla de entrada de la app', () => {
  const enlaces = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({ attrs: m[1], rotulo: texto(m[2]) }));
  const entrar = enlaces.filter((a) => /^(Iniciar sesión|Inicia sesión|Crear cuenta)$/.test(a.rotulo));
  assert.ok(entrar.filter((a) => a.rotulo !== 'Crear cuenta').length >= 4, 'barra, menú, portada, cierre y pie');
  assert.ok(entrar.filter((a) => a.rotulo === 'Crear cuenta').length >= 4, 'menú, portada, planes y cierre');
  for (const a of entrar) assert.match(a.attrs, /href="\/\?entrar"/, a.rotulo);
  // La barra tiene «Iniciar sesión» siempre a la vista, fuera del menú.
  assert.match(html, /<a class="enlace-barra" href="\/\?entrar" data-abrir-app>Iniciar sesión<\/a>/);
  // La finca de ejemplo abre la app sin pedir cuenta.
  assert.match(html, /<a href="\/" data-abrir-app>Abre la finca de ejemplo<\/a>/);
  // No se promete una contraseña que la app no usa.
  assert.doesNotMatch(html, /type="password"|<form\b/i);
  assert.match(html, /No hay contraseñas\./);
});

// ---------- Lo que la página no puede decir ----------

test('sin precios, clientes ni avales inventados', () => {
  const visible = texto(html.slice(html.indexOf('<body')));
  assert.doesNotMatch(visible, /[$€]|USD|lempiras?|\bL\.?\s?\d/i, 'ningún precio: los planes de pago no están definidos');
  assert.match(html, /<p class="plan-precio">Sin costo <span>durante el piloto<\/span><\/p>/);
  assert.match(html, /<p class="plan-precio">Por definir<\/p>/);
  assert.doesNotMatch(html, /Rajuanse|Anner|Almend[aá]rez/i, 'ningún usuario real se nombra sin permiso');
  assert.doesNotMatch(html + css + guiones.map(([, js]) => js).join(''), /kaax/i);
  assert.doesNotMatch(visible, /testimonio|nuestros clientes|confían en|certificad[oa] por|avalad[oa] por (?!GLOBALG)|aprobad[oa] por/i);
  // GLOBALG.A.P. se nombra para decir a qué norma se alinea la app, y se aclara que no hay relación.
  assert.ok((html.match(/Trofaxis no está afiliada ni avalada por GLOBALG\.A\.P\./g) ?? []).length >= 2, 'en las preguntas y en el pie');
  assert.match(html, /¿Trofaxis reemplaza la auditoría de GLOBALG\.A\.P\.\?<\/summary>\s*<p>No\./);
  // El índice se presenta como lo que es.
  assert.match(html, /Es un prototipo\./);
  assert.match(html, /criterio propio/);
  // Sin coordenadas de ninguna finca.
  assert.doesNotMatch(visible, /-?\d{1,3}\.\d{4,}/);
});

test('los créditos y las licencias de los videos están documentados', () => {
  assert.match(html, /Videos de Mixkit y Pixabay\./);
  const doc = leer('docs/conoce.md');
  for (const f of readdirSync(new URL('conoce/media/', raiz)).filter((n) => n.endsWith('.mp4'))) assert.ok(doc.includes(f), `docs/conoce.md no dice de dónde sale ${f}`);
  assert.match(doc, /mixkit\.co\/license/);
  assert.match(doc, /pixabay\.com\/service\/license-summary/);
  assert.match(leer('docs/licencias.md'), /conoce\.md/);
});
