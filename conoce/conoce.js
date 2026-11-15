// Página de presentación de Trofaxis (/conoce/): pantalla de carga, videos, temas, rueda del año, cifras e instalación.
// Todo lo que se muestra con números sale de datos-demo.js (generado por scripts/conoce-datos.mjs con el motor de la app).
// Sin JavaScript la página se lee completa; con «reducir movimiento» o ahorro de datos no se reproduce ningún video.
import { DEMO } from './datos-demo.js';
import {
  MESES, MESES_LARGOS, R_TXT, COINC, piezasMes, hechosMes, etiquetaMes, anguloMedio, punto, mesMasCargado, mesesConCoincidencias,
} from './rueda-demo.js';
import { montarInstalar } from './instalar.js';

const raiz = document.documentElement;
const $ = (sel, base = document) => base.querySelector(sel);
const $$ = (sel, base = document) => [...base.querySelectorAll(sel)];
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const conexion = navigator.connection;
const ahorro = conexion?.saveData === true;
const redLenta = /(^|-)2g$/.test(conexion?.effectiveType ?? '');
const conVideo = !sinMovimiento && !ahorro;
const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const nivelCls = (nivel) => `n-${String(nivel).toLowerCase()}`;
let detenido = false; // «Pausar movimiento»

raiz.classList.add('js');

// ---------- Datos de la finca demostrativa ----------
function valorDe(ruta) {
  const [grupo, clave] = ruta.split('.');
  if (grupo === 'temas') return DEMO.temas.find((t) => t.id === clave)?.v;
  return DEMO[grupo]?.[clave];
}

function pintarDatos() {
  for (const el of $$('[data-dato]')) {
    const v = valorDe(el.dataset.dato);
    if (v != null) el.textContent = String(v);
  }
  const { v, nivel, cortes } = DEMO.indice;
  const texto = $('[data-nivel-texto]');
  if (texto) { texto.textContent = `riesgo ${nivel.toLowerCase()}`; texto.classList.add(nivelCls(nivel)); }
  const escala = $('[data-escala]');
  if (escala) {
    escala.style.setProperty('--c1', `${cortes.medio}fr`);
    escala.style.setProperty('--c2', `${cortes.alto - cortes.medio}fr`);
    escala.style.setProperty('--c3', `${100 - cortes.alto}fr`);
    escala.style.setProperty('--v', v);
    escala.classList.add('con-marca');
  }
  // Temas del tablero, del más alto al más bajo.
  const lista = $('[data-temas]');
  if (lista) {
    const filas = $$('[data-tema]', lista).map((li) => ({ li, tema: DEMO.temas.find((t) => t.id === li.dataset.tema) })).filter((f) => f.tema);
    filas.sort((a, b) => b.tema.v - a.tema.v);
    for (const { li, tema } of filas) { li.classList.add(nivelCls(tema.nivel)); lista.append(li); }
  }
}

function llenarBarras() {
  for (const li of $$('[data-tema]')) {
    const tema = DEMO.temas.find((t) => t.id === li.dataset.tema);
    if (tema) $('.barrita i', li)?.style.setProperty('--v', tema.v);
  }
}

function contar(el, dura = 1300) {
  const fin = Number(el.textContent);
  if (sinMovimiento || !Number.isFinite(fin) || el.dataset.contado) return;
  el.dataset.contado = '1';
  const t0 = performance.now();
  const paso = (t) => {
    const p = limitar((t - t0) / dura, 0, 1);
    el.textContent = String(Math.round(fin * (1 - (1 - p) ** 3)));
    if (p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

// Aviso del tablero: recorre los meses con coincidencias de riesgo.
function montarAviso() {
  const aviso = $('[data-aviso-mes]');
  const meses = mesesConCoincidencias(DEMO.meses);
  if (!aviso || !meses.length) return;
  const titulo = document.createElement('b');
  const detalle = document.createElement('span');
  aviso.append(titulo, detalle);
  const pintar = ({ i, coinc }) => {
    titulo.textContent = `${MESES_LARGOS[i]}: ${coinc.length} ${coinc.length === 1 ? 'coincidencia' : 'coincidencias'} de riesgo`;
    detalle.textContent = coinc.length > 1 ? `${coinc[0]} y ${coinc.length - 1} más` : coinc[0];
  };
  let n = sinMovimiento ? meses.findIndex((m) => m.i === mesMasCargado(DEMO.meses)) : 0;
  pintar(meses[n]);
  aviso.hidden = false;
  if (sinMovimiento || meses.length < 2) return;
  setInterval(() => {
    if (detenido || document.hidden) return;
    aviso.classList.add('cambia');
    setTimeout(() => { n = (n + 1) % meses.length; pintar(meses[n]); aviso.classList.remove('cambia'); }, 300);
  }, 3600);
}

// ---------- Pantalla de carga ----------
function montarCarga(alCerrar) {
  const carga = $('#carga');
  const escena = $('[data-carga-escena]', carga);
  const mes = $('[data-carga-mes]', carga);
  const texto = $('[data-carga-texto]', carga);
  const saltar = $('[data-carga-saltar]', carga);
  const barrido = $('.c-barrido', carga);
  let cerrada = false;
  let apuntando = false;
  let cuadro = 0;

  // El mes que va marcando el barrido mientras la rueda se arma.
  const seguir = () => {
    if (cerrada) return;
    if (!apuntando) {
      const resto = Number.parseFloat(getComputedStyle(barrido).strokeDashoffset) || 0;
      mes.textContent = MESES[limitar(Math.floor((1 - resto / 100) * 12), 0, 11)];
    }
    cuadro = requestAnimationFrame(seguir);
  };

  // Interacción: la rueda se inclina hacia el cursor (o el dedo) y marca el mes al que apuntas.
  const apuntar = (ev) => {
    const r = escena.getBoundingClientRect();
    const x = ev.clientX - (r.left + r.width / 2);
    const y = ev.clientY - (r.top + r.height / 2);
    if (!sinMovimiento) {
      escena.style.setProperty('--ry', `${(limitar(x / r.width, -1, 1) * 16).toFixed(1)}deg`);
      escena.style.setProperty('--rx', `${(limitar(-y / r.height, -1, 1) * 16).toFixed(1)}deg`);
    }
    apuntando = Math.hypot(x, y) < r.width * 0.66;
    carga.classList.toggle('apunta', apuntando);
    if (apuntando) {
      const m = Math.floor(((Math.atan2(y, x) * 180) / Math.PI + 450) % 360 / 30);
      carga.style.setProperty('--mes', m);
      mes.textContent = MESES[m];
    }
  };
  carga.addEventListener('pointermove', apuntar);
  carga.addEventListener('pointerdown', apuntar);

  const cerrar = () => {
    if (cerrada) return;
    cerrada = true;
    cancelAnimationFrame(cuadro);
    carga.classList.add('lista');
    raiz.classList.add('entra');
    setTimeout(() => { carga.hidden = true; carga.classList.remove('lista', 'apunta'); }, sinMovimiento ? 0 : 700);
    setTimeout(() => raiz.classList.add('asentada'), 1800);
    try { sessionStorage.setItem('trofaxis:conoce:vista', '1'); } catch { /* sin almacenamiento */ }
    alCerrar();
  };

  // Antes de salir hacia la app se muestra la misma pantalla.
  const abrirApp = (url) => {
    if (sinMovimiento) { location.href = url; return; }
    $('dialog[open]')?.close();
    texto.textContent = 'Abriendo Trofaxis';
    mes.textContent = '';
    saltar.hidden = true;
    carga.classList.remove('lista', 'apunta');
    carga.classList.add('saliendo');
    carga.hidden = false;
    setTimeout(() => { location.href = url; }, 780);
  };
  // Al volver con el botón «atrás» la página sale de la memoria del navegador con la pantalla puesta: se quita.
  addEventListener('pageshow', (ev) => {
    if (!ev.persisted) return;
    carga.hidden = true;
    carga.classList.remove('saliendo');
  });

  saltar.addEventListener('click', cerrar);
  if (getComputedStyle(carga).visibility === 'hidden') { cerrar(); return { abrirApp }; } // el JavaScript llegó tarde
  seguir();

  let yaVista = false;
  try { yaVista = sessionStorage.getItem('trofaxis:conoce:vista') === '1'; } catch { /* sin almacenamiento */ }
  const minimo = sinMovimiento ? 0 : yaVista ? 900 : 2150;
  const espera = (ms) => new Promise((ok) => { setTimeout(ok, ms); });
  const portada = $('.portada-img');
  const listo = Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    portada?.complete ? Promise.resolve() : new Promise((ok) => { portada?.addEventListener('load', ok, { once: true }); portada?.addEventListener('error', ok, { once: true }); }),
  ]);
  setTimeout(() => { if (!cerrada) saltar.hidden = false; }, 1500);
  Promise.all([espera(minimo), Promise.race([listo, espera(4200)])]).then(cerrar);
  return { abrirApp };
}

// ---------- Barra superior ----------
function montarBarra() {
  const barra = $('#barra');
  const menu = $('#menu');
  const boton = $('#menu-btn');
  const portada = $('.portada');
  let pedido = 0;
  const ajustar = () => {
    pedido = 0;
    barra.classList.toggle('solida', scrollY > portada.offsetHeight - 96 || menu.classList.contains('abierto'));
    const total = raiz.scrollHeight - innerHeight;
    barra.style.setProperty('--p', total > 0 ? limitar(scrollY / total, 0, 1).toFixed(4) : '0');
  };
  addEventListener('scroll', () => { if (!pedido) pedido = requestAnimationFrame(ajustar); }, { passive: true });
  const abrir = (si) => {
    menu.classList.toggle('abierto', si);
    boton.setAttribute('aria-expanded', String(si));
    boton.setAttribute('aria-label', si ? 'Cerrar el menú' : 'Abrir el menú');
    $('use', boton).setAttribute('href', si ? '#i-x' : '#i-menu');
    ajustar();
  };
  boton.addEventListener('click', () => abrir(!menu.classList.contains('abierto')));
  menu.addEventListener('click', (ev) => { if (ev.target.closest('a')) abrir(false); });
  addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && menu.classList.contains('abierto')) { abrir(false); boton.focus(); } });
  matchMedia('(min-width: 1041px)').addEventListener('change', (ev) => { if (ev.matches) abrir(false); });
  ajustar();
}

// ---------- Videos ----------
function cargarVideo(v) {
  if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
  if (v.getAttribute('src')) return;
  const chico = v.dataset.srcChico && (matchMedia('(max-width: 720px)').matches || redLenta);
  v.muted = true;
  v.addEventListener('playing', () => v.classList.add('rodando'), { once: true });
  v.src = chico ? v.dataset.srcChico : v.dataset.src;
}
const reproducir = (v) => { if (!conVideo || detenido) return; cargarVideo(v); v.play().catch(() => {}); };

function montarVideos() {
  const videos = $$('video[data-video]');
  // Las carátulas llegan cuando el video se acerca a la pantalla, también si no se va a reproducir.
  const cerca = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      const v = e.target;
      if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
      cerca.unobserve(v);
    }
  }, { rootMargin: '700px 0px' });
  $$('video[data-poster]').forEach((v) => cerca.observe(v));
  if (!conVideo) return;
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      e.target.dataset.visible = e.isIntersecting ? '1' : '';
      if (e.isIntersecting) reproducir(e.target); else e.target.pause();
    }
  }, { rootMargin: '160px 0px' });
  videos.forEach((v) => io.observe(v));
}

function montarPausa() {
  const boton = $('[data-pausa]');
  if (!boton || !conVideo) return;
  boton.hidden = false;
  boton.addEventListener('click', () => {
    detenido = !detenido;
    raiz.toggleAttribute('data-quieto', detenido);
    boton.setAttribute('aria-pressed', String(detenido));
    $('[data-pausa-texto]', boton).textContent = detenido ? 'Reanudar movimiento' : 'Pausar movimiento';
    $('use', boton).setAttribute('href', detenido ? '#i-play' : '#i-pausa');
    for (const v of $$('video')) {
      if (detenido) v.pause();
      else if (v.dataset.visible === '1' || v.classList.contains('activo')) reproducir(v);
    }
  });
}

// ---------- Cinta de fuentes ----------
function montarCinta() {
  const cinta = $('[data-cinta]');
  const lista = $('.cinta-lista', cinta);
  if (!cinta || !lista || sinMovimiento) return;
  const pista = document.createElement('div');
  pista.className = 'cinta-pista';
  const copia = lista.cloneNode(true);
  copia.setAttribute('aria-hidden', 'true');
  lista.replaceWith(pista);
  pista.append(lista, copia);
  cinta.classList.add('corre');
}

// ---------- Los cinco temas ----------
function montarHistorias() {
  const cont = $('[data-historias]');
  if (!cont) return;
  const tira = $('.pestanas', cont);
  const pestanas = $$('[data-pestana]', cont);
  const ids = pestanas.map((p) => p.dataset.pestana);
  let actual = 0;
  let visible = false;
  let auto = !sinMovimiento;

  const activar = (i, { foco = false } = {}) => {
    actual = (i + ids.length) % ids.length;
    pestanas.forEach((p, j) => { p.setAttribute('aria-selected', String(j === actual)); p.tabIndex = j === actual ? 0 : -1; });
    for (const h of $$('[data-historia]', cont)) h.hidden = h.dataset.historia !== ids[actual];
    for (const v of $$('[data-historia-video]', cont)) {
      const activo = v.dataset.historiaVideo === ids[actual];
      v.classList.toggle('activo', activo);
      if (activo) {
        if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
        if (visible) { if (v.getAttribute('src')) v.currentTime = 0; reproducir(v); }
      } else v.pause();
    }
    const p = pestanas[actual];
    if (tira.scrollWidth > tira.clientWidth) tira.scrollTo({ left: p.offsetLeft - 18, behavior: sinMovimiento ? 'auto' : 'smooth' });
    if (foco) p.focus();
    if (auto) { cont.classList.remove('auto'); void cont.offsetWidth; cont.classList.add('auto'); } // reinicia la barra de avance
  };
  const elegir = (i, opciones) => { auto = false; cont.classList.remove('auto'); activar(i, opciones); };

  cont.addEventListener('animationend', (ev) => { if (ev.animationName === 'llenar' && auto) activar(actual + 1); });
  pestanas.forEach((p, j) => p.addEventListener('click', () => elegir(j)));
  tira.addEventListener('keydown', (ev) => {
    const destino = { ArrowRight: actual + 1, ArrowLeft: actual - 1, Home: 0, End: ids.length - 1 }[ev.key];
    if (destino === undefined) return;
    ev.preventDefault();
    elegir(destino, { foco: true });
  });

  new IntersectionObserver(([e]) => {
    const antes = visible;
    visible = e.isIntersecting;
    cont.classList.toggle('fuera', !visible);
    const v = $('video.activo', cont);
    if (visible && !antes) { if (auto && !cont.classList.contains('auto')) cont.classList.add('auto'); if (v) reproducir(v); } else if (!visible) v?.pause();
  }, { threshold: 0.3 }).observe(cont);

  $('[data-historia-video]', cont)?.classList.add('activo');
}

// ---------- La rueda del año ----------
function montarRueda() {
  const lienzo = $('[data-rueda]');
  const panel = $('[data-rueda-detalle]');
  if (!lienzo || !panel) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (nombre, attrs = {}, texto) => {
    const n = document.createElementNS(NS, nombre);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (texto !== undefined) n.textContent = texto;
    return n;
  };
  const svg = el('svg', { class: 'rueda-svg', viewBox: '-212 -212 424 424', role: 'group', 'aria-label': 'Rueda del año de la finca demostrativa: elige un mes para ver qué pasa en él' });
  const grupos = DEMO.meses.map((d, i) => {
    const { toque, piezas } = piezasMes(d, i);
    const g = el('g', { class: 'r-mes', 'data-mes': i, tabindex: -1, role: 'button', 'aria-pressed': 'false', 'aria-label': etiquetaMes(d, i) });
    g.style.setProperty('--i', i);
    g.append(el('path', { class: 'r-toque', d: toque }), ...piezas.map((p) => el('path', { class: p.cls, d: p.d })));
    if (d.coinc.length) {
      const [cx, cy] = punto((COINC.r0 + COINC.r1) / 2, anguloMedio(i));
      g.append(el('text', { class: 'r-cuenta', x: cx, y: cy, dy: '.35em', 'text-anchor': 'middle' }, String(d.coinc.length)));
    }
    const [tx, ty] = punto(R_TXT, anguloMedio(i));
    g.append(el('text', { class: 'r-txt', x: tx, y: ty, dy: '.35em', 'text-anchor': 'middle' }, MESES[i]));
    svg.append(g);
    return g;
  });
  const centro = el('g', { class: `r-centro nivel-${DEMO.indice.nivel}`, 'aria-hidden': 'true' });
  centro.append(el('circle', { r: 50 }), el('text', { class: 'r-num', y: -4, dy: '.32em', 'text-anchor': 'middle' }, String(DEMO.indice.v)), el('text', { class: 'r-de', y: 24, 'text-anchor': 'middle' }, 'de 100'));
  svg.append(centro);
  lienzo.replaceChildren(svg);

  const nombre = $('[data-mes-nombre]', panel);
  const lista = $('[data-mes-lista]', panel);
  const fila = (cls, texto, alerta = false) => {
    const li = document.createElement('li');
    const sw = document.createElement('i');
    sw.className = `sw ${cls}`;
    sw.setAttribute('aria-hidden', 'true');
    li.append(sw, texto);
    if (alerta) li.className = 'alerta';
    return li;
  };
  const pintar = (i) => {
    const d = DEMO.meses[i];
    nombre.textContent = MESES_LARGOS[i];
    const filas = [...hechosMes(d).map(([cls, t]) => fila(cls, t)), ...d.coinc.map((c) => fila('coinc', c, true))];
    if (!filas.length) filas.push(Object.assign(document.createElement('li'), { className: 'vacio', textContent: 'Sin actividad registrada en este mes.' }));
    lista.replaceChildren(...filas);
  };
  let actual = -1;
  let cambio = 0;
  const elegir = (i) => {
    const m = (i + 12) % 12;
    if (m === actual) return;
    actual = m;
    grupos.forEach((g, j) => { g.setAttribute('aria-pressed', String(j === m)); g.tabIndex = j === m ? 0 : -1; });
    clearTimeout(cambio);
    if (sinMovimiento) { pintar(m); return; }
    panel.classList.add('cambia');
    cambio = setTimeout(() => { pintar(m); panel.classList.remove('cambia'); }, 170);
  };

  // Recorre el año sola hasta que alguien la toca.
  let auto = !sinMovimiento;
  let visible = false;
  const soltar = () => { if (!auto) return; auto = false; panel.setAttribute('aria-live', 'polite'); };
  const mesDe = (ev) => { const g = ev.target.closest?.('[data-mes]'); return g ? Number(g.dataset.mes) : null; };
  svg.addEventListener('click', (ev) => { const m = mesDe(ev); if (m !== null) { soltar(); elegir(m); } });
  svg.addEventListener('pointerover', (ev) => { if (ev.pointerType !== 'mouse') return; const m = mesDe(ev); if (m !== null) { soltar(); elegir(m); } });
  svg.addEventListener('keydown', (ev) => {
    const m = mesDe(ev);
    if (m === null) return;
    const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); soltar(); elegir(m); return; }
    if (!paso) return;
    ev.preventDefault();
    soltar();
    elegir(m + paso);
    grupos[actual].focus();
  });
  svg.addEventListener('focusin', soltar);

  elegir(sinMovimiento ? mesMasCargado(DEMO.meses) : 0);
  if (sinMovimiento) { svg.classList.add('visto'); return; }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) svg.classList.add('visto');
  }, { threshold: 0.35 }).observe(svg);
  setInterval(() => { if (auto && visible && !detenido && !document.hidden) elegir(actual + 1); }, 2400);
}

// ---------- Lo que aparece al llegar ----------
function montarApariciones() {
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('visto');
      for (const n of $$('[data-contar]', e.target)) contar(n);
      io.unobserve(e.target);
    }
  }, { threshold: 0.25 });
  $$('[data-ver],[data-cifras]').forEach((n) => io.observe(n));
}

// El tablero de la portada se inclina un poco hacia el cursor.
function montarInclinacion() {
  const portada = $('.portada');
  const tablero = $('[data-tablero]');
  if (!portada || !tablero || sinMovimiento || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  portada.addEventListener('pointermove', (ev) => {
    if (detenido) return;
    const r = portada.getBoundingClientRect();
    tablero.style.setProperty('--ry', `${(((ev.clientX - r.left) / r.width - 0.5) * 9).toFixed(2)}deg`);
    tablero.style.setProperty('--rx', `${(((ev.clientY - r.top) / r.height - 0.5) * -7).toFixed(2)}deg`);
  });
  portada.addEventListener('pointerleave', () => { tablero.style.setProperty('--ry', '0deg'); tablero.style.setProperty('--rx', '0deg'); });
}

// ---------- Arranque ----------
pintarDatos();
const { abrirApp } = montarCarga(() => {
  llenarBarras();
  const indice = $('.tablero [data-contar]');
  if (indice) contar(indice, 1500);
  montarAviso();
});
montarBarra();
montarVideos();
montarPausa();
montarCinta();
montarHistorias();
montarRueda();
montarApariciones();
montarInclinacion();
montarInstalar({ alNavegar: abrirApp });

// Los enlaces hacia la app pasan por la pantalla de carga («Abriendo Trofaxis»).
document.addEventListener('click', (ev) => {
  const a = ev.target.closest?.('a[data-abrir-app]');
  if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  ev.preventDefault();
  abrirApp(a.href);
});
