// Mapa satelital de la finca (Issue #10). Mapa propio, sin librerías: teselas Web Mercator
// en <img> y un SVG encima para el punto y el contorno.
// La app vuelve a dibujar todo el HTML en cada cambio; por eso el estado del mapa vive en
// este módulo y `montarMapa()` se llama después de cada render.
import { esc } from '../core/utils.js';
import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { aPixel, aGrados, teselasVisibles, urlTesela, areaHa, leerCoordenadas, avisosMapa, redondear, leerArboles, sitiosFuera } from '../mapa/geo.js';
import { cargarUbicacion, guardarUbicacion, borrarUbicacion, ubicacionVacia } from '../mapa/ubicacion.js';
import { pedirClima } from './clima.js';

const C = CONFIG.mapa;
let U = cargarUbicacion();
let modo = 'ver'; // ver | punto | contorno
let msg = '';
let fallas = 0;
let zonaUtm = 16; // zona UTM con la que se leen las coordenadas de los árboles (16 N: oeste de Honduras; 17 N: este)
let textoArboles = '';

// Ubicación vigente (punto, contorno y árboles de riesgo), para el ApiRadar. Solo vive en este navegador.
export const ubicacionActual = () => U;

// Al empezar otra finca o borrar los datos, la ubicación anterior se borra también.
export function reiniciarMapa() { borrarUbicacion(); U = ubicacionVacia(); modo = 'ver'; msg = ''; S.climaUI = { estado: '', msg: '', llenos: [] }; }

const fmt = (x) => x.toFixed(5);

export function panelMapa() {
  const b = (m, t, extra = '', cls = '') => `<button type="button" class="btn sm${cls}" data-mapa="${m}" ${extra}>${t}</button>`;
  return `<div class="mapa-bloque">
    <div><h3>Mapa de la finca</h3><p class="muted small">Imagen satelital Sentinel-2 (~10 m por píxel): sirve para ubicar la finca y dibujar su contorno, no para medir con precisión. Las coordenadas se guardan solo en este navegador: no van en el archivo exportado ni en la memoria de casos.</p></div>
    ${S.demo ? '<p class="muted small"><b>Ejemplo:</b> la finca demostrativa es ficticia y no tiene ubicación. Puedes probar el mapa con cualquier punto.</p>' : ''}
    <div class="mapa" id="mapa-finca" tabindex="0" role="application" aria-label="Mapa satelital. Flechas para mover, + y − para acercar o alejar." data-modo="${modo}"></div>
    <div class="row mapa-ctrl">
      ${b('modo-punto', 'Marcar ubicación', `aria-pressed="${modo === 'punto'}"`)}
      ${b('modo-contorno', 'Dibujar contorno', `aria-pressed="${modo === 'contorno'}"`)}
      ${modo === 'contorno' ? b('deshacer', 'Deshacer punto') + b('terminar', 'Terminar') : ''}
      ${b('gps', 'Mi ubicación')}
      ${U.punto || U.contorno.length ? b('borrar', 'Borrar del mapa', '', ' danger') : ''}
    </div>
    <div class="row">
      <input id="mapa-coord" aria-label="Coordenadas en grados decimales" placeholder="Latitud, longitud (ej. 14.0108, -87.0044)" style="flex:1;min-width:200px">
      ${b('ir', 'Ir')}
    </div>
    <details class="arboles" data-keep="mapa-arboles" ${(S.abiertos['mapa-arboles'] ?? U.arboles.length > 0) ? 'open' : ''}>
      <summary>Árboles de riesgo con coordenadas (ApiRadar)${U.arboles.length ? ` · ${U.arboles.length} cargado(s)` : ''}</summary>
      <p class="muted small">Una línea por árbol: «latitud, longitud» en grados (14.0108, -87.0044) o «este norte» en UTM (501177 1547784). Con el contorno dibujado, el ApiRadar calcula qué parte de la finca queda fuera del radio de exclusión y el punto más alejado. Se guardan solo en este navegador.</p>
      <div class="f"><label for="mapa-arboles">Coordenadas de los árboles</label><textarea id="mapa-arboles" rows="4" placeholder="14.0108, -87.0044&#10;501177 1547784">${esc(textoArboles)}</textarea></div>
      <div class="row"><div class="f" style="width:150px"><label for="mapa-zona">Zona UTM (si usas UTM)</label><select id="mapa-zona"><option value="16" ${zonaUtm === 16 ? 'selected' : ''}>16 N (oeste)</option><option value="17" ${zonaUtm === 17 ? 'selected' : ''}>17 N (este)</option></select></div>
        ${b('arboles-cargar', 'Cargar árboles')}${U.arboles.length ? b('arboles-quitar', 'Quitar árboles', '', ' danger') : ''}</div>
    </details>
    <div id="mapa-info" class="small" aria-live="polite">${infoHtml()}</div>
  </div>`;
}

function infoHtml() {
  const ayuda = { punto: 'Toca el mapa donde está la finca.', contorno: 'Toca cada esquina de la finca en orden. Pulsa Terminar al acabar.', ver: 'Arrastra para moverte. Ctrl + rueda o los botones + y − para acercar.' }[modo];
  const a = areaHa(U.contorno);
  const avisos = avisosMapa(U, S.farm.area);
  return `<p class="muted">${ayuda}</p>
    ${msg ? `<p class="mapa-msg">${esc(msg)}</p>` : ''}
    <dl class="mapa-datos">
      <div><dt>Ubicación</dt><dd>${U.punto ? `${fmt(U.punto[0])}, ${fmt(U.punto[1])}` : 'sin marcar'}</dd></div>
      <div><dt>Área dibujada</dt><dd>${a > 0 ? `${redondear(a)} ha` : U.contorno.length ? `${U.contorno.length} punto(s), faltan ${Math.max(0, 3 - U.contorno.length)}` : 'sin contorno'}</dd></div>
      <div><dt>Área declarada</dt><dd>${S.farm.area || 0} ha</dd></div>
      <div><dt>Árboles de riesgo</dt><dd>${U.arboles.length ? `${U.arboles.length} con coordenadas` : 'sin cargar'}</dd></div>
    </dl>
    ${avisos.map((t) => `<p class="mapa-aviso">⚠ ${esc(t)}</p>`).join('')}
    ${fallas ? '<p class="mapa-aviso">No se pudo cargar parte de la imagen satelital (sin internet o el servicio no responde). Puedes seguir marcando el punto y el contorno.</p>' : ''}`;
}

// ---------- Dibujo ----------
function dibujar(el) {
  const w = el.clientWidth, h = el.clientHeight;
  if (!w || !h) return;
  const { lat, lon, zoom } = U.vista;
  const capa = el.querySelector('.mapa-teselas'), svg = el.querySelector('svg');
  const viejas = new Map([...capa.children].map((i) => [i.dataset.k, i]));
  for (const t of teselasVisibles(lat, lon, zoom, w, h)) {
    const k = `${t.z}/${t.x}/${t.y}`;
    let img = viejas.get(k);
    if (img) viejas.delete(k);
    else {
      img = new Image(256, 256); img.alt = ''; img.draggable = false; img.decoding = 'async'; img.dataset.k = k;
      img.onerror = () => { img.classList.add('falla'); if (!fallas++) actualizarInfo(); };
      img.src = urlTesela(t); capa.appendChild(img);
    }
    img.style.transform = `translate(${Math.round(t.px)}px,${Math.round(t.py)}px)`;
  }
  viejas.forEach((i) => i.remove());

  const c = aPixel(lat, lon, zoom);
  const xy = ([la, lo]) => { const p = aPixel(la, lo, zoom); return [p.x - c.x + w / 2, p.y - c.y + h / 2]; };
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const pts = U.contorno.map(xy);
  const cerrado = pts.length >= 3 && modo !== 'contorno';
  svg.innerHTML = `${pts.length >= 2 ? `<${cerrado ? 'polygon' : 'polyline'} class="mapa-contorno" points="${pts.map((p) => p.join(',')).join(' ')}"/>` : ''}
    ${modo === 'contorno' ? pts.map((p) => `<circle class="mapa-vertice" cx="${p[0]}" cy="${p[1]}" r="4"/>`).join('') : ''}
    ${arbolesSvg(xy, lat, zoom)}
    ${U.punto ? (() => { const [x, y] = xy(U.punto); return `<g class="mapa-punto" transform="translate(${x},${y})"><circle r="9"/><circle r="3.5" class="centro"/></g>`; })() : ''}`;
}

// Árboles de riesgo con su radio de exclusión (mínimo punteado, máximo continuo) y el punto más alejado de todos.
function arbolesSvg(xy, lat, zoom) {
  if (!U.arboles.length) return '';
  const [rMin, rMax] = CONFIG.apiradar.radioExclusionM;
  const mPorPx = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
  const s = sitiosFuera(U.arboles, U.contorno, [rMin, rMax]);
  return U.arboles.map((p) => { const [x, y] = xy(p);
    return `<circle class="mapa-radio max" cx="${x}" cy="${y}" r="${rMax / mPorPx}"/><circle class="mapa-radio min" cx="${x}" cy="${y}" r="${rMin / mPorPx}"/><circle class="mapa-arbol" cx="${x}" cy="${y}" r="4"><title>Árbol de riesgo</title></circle>`; }).join('')
    + (s ? (() => { const [x, y] = xy(s.mejor.punto); return `<g class="mapa-sitio" transform="translate(${x},${y})"><circle r="8"/><title>Punto más alejado de los árboles de riesgo: ${s.mejor.distanciaM} m</title></g>`; })() : '');
}

function actualizarInfo() {
  const i = document.getElementById('mapa-info');
  if (i) i.innerHTML = infoHtml();
}
function guardar() { guardarUbicacion(U); }

function mover(el, dx, dy) {
  const { lat, lon, zoom } = U.vista;
  const c = aPixel(lat, lon, zoom), g = aGrados(c.x - dx, c.y - dy, zoom);
  U.vista = { lat: Math.max(-85, Math.min(85, g.lat)), lon: ((g.lon + 540) % 360) - 180, zoom };
  dibujar(el);
}

// Cambia el zoom manteniendo fijo el punto (ox, oy) de la ventana.
function zoomEn(el, dz, ox = el.clientWidth / 2, oy = el.clientHeight / 2) {
  const { lat, lon, zoom } = U.vista;
  const z = Math.max(C.zoomMin, Math.min(C.zoomMax, zoom + dz));
  if (z === zoom) return;
  const w = el.clientWidth, h = el.clientHeight, c = aPixel(lat, lon, zoom);
  const bajo = aGrados(c.x + ox - w / 2, c.y + oy - h / 2, zoom);
  const p = aPixel(bajo.lat, bajo.lon, z), g = aGrados(p.x - ox + w / 2, p.y - oy + h / 2, z);
  U.vista = { lat: g.lat, lon: g.lon, zoom: z };
  dibujar(el); guardar();
}

function tocar(el, ox, oy) {
  if (modo === 'ver') return;
  const { lat, lon, zoom } = U.vista, c = aPixel(lat, lon, zoom);
  const g = aGrados(c.x + ox - el.clientWidth / 2, c.y + oy - el.clientHeight / 2, zoom);
  const p = [+g.lat.toFixed(6), +g.lon.toFixed(6)];
  msg = '';
  if (modo === 'punto') { U.punto = p; modo = 'ver'; guardar(); rerender(); pedirClima(p[0], p[1]); }
  else { U.contorno.push(p); dibujar(el); actualizarInfo(); }
  guardar();
}

// Re-dibuja solo el bloque del mapa (botones incluidos) sin tocar el resto del dashboard.
function rerender() {
  const b = document.querySelector('.mapa-bloque');
  if (!b) return;
  const tmp = document.createElement('div'); tmp.innerHTML = panelMapa();
  b.replaceWith(tmp.firstElementChild);
  montarMapa();
}

// ---------- Montaje y eventos ----------
let observador = null;
export function montarMapa() {
  const el = document.getElementById('mapa-finca');
  if (observador) { observador.disconnect(); observador = null; }
  if (!el) return;
  el.innerHTML = `<div class="mapa-teselas"></div><svg aria-hidden="true"></svg>
    <div class="mapa-zoom"><button type="button" data-z="1" aria-label="Acercar">+</button><button type="button" data-z="-1" aria-label="Alejar">−</button></div>
    <a class="mapa-atrib" href="${C.capa.enlace}" target="_blank" rel="noopener">${esc(C.capa.atribucion)}</a>`;
  fallas = 0;
  dibujar(el);
  if (typeof ResizeObserver === 'function') { observador = new ResizeObserver(() => dibujar(el)); observador.observe(el); }

  let ini = null;
  el.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button,a') || e.button > 0) return;
    ini = { x: e.clientX, y: e.clientY, ux: e.clientX, uy: e.clientY, movido: false };
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!ini) return;
    if (!ini.movido && Math.hypot(e.clientX - ini.x, e.clientY - ini.y) > 5) { ini.movido = true; el.classList.add('arrastrando'); }
    if (ini.movido) { mover(el, e.clientX - ini.ux, e.clientY - ini.uy); ini.ux = e.clientX; ini.uy = e.clientY; }
  });
  const soltar = (e) => {
    if (!ini) return;
    const r = el.getBoundingClientRect();
    if (!ini.movido && e.type === 'pointerup') tocar(el, e.clientX - r.left, e.clientY - r.top);
    else guardar();
    ini = null; el.classList.remove('arrastrando');
  };
  el.addEventListener('pointerup', soltar);
  el.addEventListener('pointercancel', soltar);
  el.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return; // sin Ctrl, la rueda sigue bajando la página
    e.preventDefault();
    const r = el.getBoundingClientRect();
    zoomEn(el, e.deltaY < 0 ? 1 : -1, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  el.addEventListener('dblclick', (e) => { if (modo !== 'ver') return; const r = el.getBoundingClientRect(); zoomEn(el, 1, e.clientX - r.left, e.clientY - r.top); });
  el.addEventListener('click', (e) => { const z = e.target.closest('[data-z]'); if (z) zoomEn(el, +z.dataset.z); });
  el.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: [80, 0], ArrowRight: [-80, 0], ArrowUp: [0, 80], ArrowDown: [0, -80] }[e.key];
    if (d) { e.preventDefault(); mover(el, ...d); guardar(); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomEn(el, 1); }
    else if (e.key === '-') { e.preventDefault(); zoomEn(el, -1); }
  });
}

document.addEventListener('input', (e) => { if (e.target.id === 'mapa-arboles') textoArboles = e.target.value; });

// Botones del bloque (delegado una sola vez en el documento).
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-mapa]');
  if (!b) return;
  const el = document.getElementById('mapa-finca');
  const a = b.dataset.mapa;
  msg = '';
  if (a === 'modo-punto') modo = modo === 'punto' ? 'ver' : 'punto';
  else if (a === 'modo-contorno') { if (modo !== 'contorno') U.contorno = []; modo = modo === 'contorno' ? 'ver' : 'contorno'; }
  else if (a === 'deshacer') U.contorno.pop();
  else if (a === 'terminar') {
    if (U.contorno.length < 3) { msg = 'Un contorno necesita al menos 3 puntos.'; }
    else { modo = 'ver'; if (U.arboles.length) document.dispatchEvent(new Event('biogap:render')); }
  } else if (a === 'borrar') { U.punto = null; U.contorno = []; modo = 'ver'; }
  else if (a === 'arboles-cargar') {
    textoArboles = document.getElementById('mapa-arboles')?.value ?? textoArboles;
    zonaUtm = +(document.getElementById('mapa-zona')?.value ?? zonaUtm) === 17 ? 17 : 16;
    const r = leerArboles(textoArboles, zonaUtm);
    if (!r.arboles.length) msg = r.errores[0] ?? 'Escribe al menos un árbol.';
    else {
      U.arboles = r.arboles;
      const c = r.arboles[0];
      if (!U.contorno.length) U.vista = { lat: c[0], lon: c[1], zoom: Math.max(U.vista.zoom, 14) };
      msg = `${r.arboles.length} árbol(es) cargado(s)${r.errores.length ? `. ${r.errores.join(' ')}` : ''}${U.contorno.length >= 3 ? '' : ' Dibuja el contorno de la finca para calcular qué parte queda fuera del radio.'}`;
      S.abiertos['mapa-arboles'] = true;
    }
    guardar(); rerender(); document.dispatchEvent(new Event('biogap:render')); return;
  } else if (a === 'arboles-quitar') { U.arboles = []; textoArboles = ''; document.dispatchEvent(new Event('biogap:render')); }
  else if (a === 'ir') {
    const r = leerCoordenadas(document.getElementById('mapa-coord')?.value);
    if (r.error) msg = r.error;
    else { U.punto = [r.lat, r.lon]; U.vista = { lat: r.lat, lon: r.lon, zoom: 15 }; guardar(); pedirClima(r.lat, r.lon); }
  } else if (a === 'gps') {
    if (!navigator.geolocation) { msg = 'Este navegador no permite obtener la ubicación.'; }
    else {
      msg = 'Buscando tu ubicación…';
      navigator.geolocation.getCurrentPosition(
        (p) => { msg = `Ubicación del dispositivo (precisión ±${Math.round(p.coords.accuracy)} m).`; U.punto = [+p.coords.latitude.toFixed(6), +p.coords.longitude.toFixed(6)]; U.vista = { lat: U.punto[0], lon: U.punto[1], zoom: 15 }; guardar(); rerender(); pedirClima(U.punto[0], U.punto[1]); },
        () => { msg = 'No se pudo obtener la ubicación (permiso denegado o sin señal).'; rerender(); avisarFuera(); },
        { enableHighAccuracy: true, timeout: 15000 });
    }
  }
  guardar();
  rerender();
  avisarFuera();
  if (a === 'ir' && el) document.getElementById('mapa-finca')?.focus({ preventScroll: true });
});

// Fuera del dashboard (p. ej. el paso Finca del cuestionario) no hay bloque del mapa: el mensaje se muestra
// en el estado del clima. Solo los errores y la espera del GPS; el éxito lo informa la descarga del clima.
function avisarFuera() {
  if (document.querySelector('.mapa-bloque')) return;
  const errores = ['Escribe', 'La latitud', 'La longitud', 'No se pudo', 'Este navegador'];
  if (msg.startsWith('Buscando')) S.climaUI = { estado: 'cargando', msg, llenos: [] };
  else if (errores.some((x) => msg.startsWith(x))) S.climaUI = { estado: 'error', msg, llenos: [] };
  document.dispatchEvent(new Event('biogap:render'));
}

