// Vista: Cerebro. Grafo interactivo de todo lo que la app sabe, al estilo del de Obsidian:
// arrastrar, acercar con la rueda o con dos dedos y tocar un punto para ver el hecho y su fuente.
// Funciona sin conexión y sin IA: dibuja los hechos de src/cerebro/ en un <canvas>.
import { esc } from '../core/utils.js';
import { HECHOS, TEMAS, PENDIENTES } from '../cerebro/hechos.js';
import { buscar, resumen } from '../cerebro/consulta.js';
import { armarGrafo, posicionesIniciales, paso, vecinos } from '../cerebro/grafo.js';
import { notasObsidian, zip } from '../cerebro/obsidian.js';

const ESTADO_CLASE = { 'con fuente': 'cb-fuente', 'criterio propio': 'cb-propio', 'por validar': 'cb-validar' };
const LINEA = { tema: 'pertenece al tema', fuente: 'misma fuente', formula: 'se usan juntos en la fórmula de' };

// Estado de la vista que sobrevive a los redibujados de la app (posiciones, zoom, selección).
const G = { grafo: null, vista: null, sel: null, filtro: null, texto: '', energia: 1 };
function grafo() {
  if (!G.grafo) { G.grafo = posicionesIniciales(armarGrafo()); for (let i = 0; i < 120; i++) paso(G.grafo); }
  return G.grafo;
}
const porId = (id) => grafo().nodos.find((n) => n.id === id);

function detalle(n) {
  if (!n) return '<p class="muted">Toca un punto para ver el hecho, su fuente y con qué se relaciona.</p>';
  const vs = vecinos(grafo(), n.id).map((v) => ({ ...v, n: porId(v.id) }));
  const enlace = (v) => `<li><button type="button" class="btn sm cb-ir" data-cb-ir="${esc(v.id)}">${esc(v.n.titulo)}</button> <span class="muted small">${LINEA[v.tipo]}${v.donde ? ` <code>${esc(v.donde)}</code>` : ''}</span></li>`;
  const lista = (titulo, a) => (a.length ? `<h4>${titulo}</h4><ul class="cb-vecinos">${a.slice(0, 40).map(enlace).join('')}</ul>${a.length > 40 ? `<p class="muted small">y ${a.length - 40} más.</p>` : ''}` : '');
  if (n.tipo !== 'hecho') {
    const tipo = n.tipo === 'tema' ? 'Tema' : 'Fuente';
    return `<p class="muted small">${tipo}</p><h3>${esc(n.titulo)}</h3>${n.url ? `<p><a href="${esc(n.url)}" target="_blank" rel="noopener">Abrir la fuente</a></p>` : ''}
      ${lista(`Hechos (${vs.length})`, vs)}`;
  }
  const h = n.hecho;
  const fuente = h.fuente ? (h.fuente.url ? `<a href="${esc(h.fuente.url)}" target="_blank" rel="noopener">${esc(h.fuente.cita)}</a>` : esc(h.fuente.cita)) : `Sin fuente todavía: ${esc(h.estado)}.`;
  return `<p class="muted small">${esc(TEMAS[h.tema])}</p><h3>${esc(h.titulo)}</h3>
    <p class="cb-valor">${esc(h.valor)}${h.unidad ? ` <span class="muted">${esc(h.unidad)}</span>` : ''}</p>
    <p><span class="pill ${ESTADO_CLASE[h.estado]}">${esc(h.estado)}</span></p>
    <p class="small"><b>Fuente:</b> ${fuente}</p>${h.nota ? `<p class="small muted">${esc(h.nota)}</p>` : ''}
    <p class="small muted">Vive en <code>${esc(h.donde)}</code>.</p>
    ${lista('Se usa junto con', vs.filter((v) => v.tipo === 'formula'))}`;
}

function resultados() {
  if (!G.texto.trim()) return '';
  const r = buscar(G.texto, { max: 12 });
  if (!r.length) return '<p class="muted small">El cerebro no tiene un hecho con esas palabras. Solo busca palabras: no responde preguntas libres.</p>';
  return `<ul class="cb-vecinos">${r.map((h) => `<li><button type="button" class="btn sm cb-ir" data-cb-ir="${esc(h.id)}">${esc(h.titulo)}</button> <span class="muted small">${esc(h.valor)} ${esc(h.unidad)}</span></li>`).join('')}</ul>`;
}

export function viewCerebro() {
  const r = resumen(HECHOS);
  const sel = G.sel ? porId(G.sel) : null;
  return `<section class="card cerebro">
    <div><h2>Cerebro de Trofaxis</h2>
      <p class="muted">Todo lo que la app sabe, con su fuente. Cada punto es un hecho, un tema o una fuente; las líneas son relaciones reales: el tema al que pertenece, la fuente de donde sale y las fórmulas que usan dos valores juntos. Funciona sin conexión y sin inteligencia artificial.</p></div>
    <div class="row">
      <span class="pill">${r.total} hechos</span><span class="pill cb-fuente">${r['con fuente']} con fuente</span>
      <span class="pill cb-propio">${r['criterio propio']} criterio propio</span><span class="pill cb-validar">${r['por validar']} por validar</span>
    </div>
    <div class="row cb-controles">
      <div class="f cb-buscar"><label for="cb-buscar">Buscar en el cerebro</label><input id="cb-buscar" type="search" placeholder="imidacloprid, kc maíz, viento…" value="${esc(G.texto)}" autocomplete="off"></div>
      <button type="button" class="btn sm" id="cb-centrar">Centrar</button>
      <button type="button" class="btn sm" id="cb-obsidian">Descargar para Obsidian (.zip)</button>
    </div>
    <div id="cb-resultados">${resultados()}</div>
    <div class="row small cb-leyenda" aria-hidden="true">
      <span><i class="cb-punto cb-tema"></i>Tema</span><span><i class="cb-punto cb-fte"></i>Fuente</span>
      <span><i class="cb-punto cb-fuente"></i>Hecho con fuente</span><span><i class="cb-punto cb-propio"></i>Criterio propio</span><span><i class="cb-punto cb-validar"></i>Por validar</span>
    </div>
    <div class="cb-cuerpo">
      <div class="cb-lienzo"><canvas id="cb-canvas" role="img" aria-label="Grafo del cerebro: ${r.total} hechos unidos por tema, fuente y fórmula. Usa la búsqueda para recorrerlo con el teclado."></canvas></div>
      <aside id="cb-detalle" class="cb-detalle" aria-live="polite">${detalle(sel)}</aside>
    </div>
    <details><summary>Lo que el cerebro todavía no sabe</summary><ul>${PENDIENTES.map((p) => `<li><b>${esc(p.fuente)}:</b> ${esc(p.falta)}</li>`).join('')}</ul>
      <p class="muted small">Sin IA, el cerebro no responde preguntas libres, no razona sobre casos sin regla escrita y no lee documentos por sí solo: cada dato entra a mano con su fuente.</p></details>
  </section>`;
}

// --- Dibujo e interacción (se monta después de cada render de la vista) ----------------------------------------
let corriendo = false;
export function montarCerebro(raiz = document) {
  const canvas = raiz.querySelector('#cb-canvas');
  if (!canvas || canvas.dataset.montado) return;
  canvas.dataset.montado = '1';
  const g = grafo(), ctx = canvas.getContext('2d');
  const css = getComputedStyle(document.documentElement), col = (v) => css.getPropertyValue(v).trim();
  const C = { tema: col('--accent'), fte: col('--cb-fte'), 'con fuente': col('--good'), 'criterio propio': col('--warn'), 'por validar': col('--muted'), linea: col('--muted'), ink: col('--ink'), fondo: col('--surface') };
  const detalleEl = raiz.querySelector('#cb-detalle');
  let w = 0, h = 0;
  function medir() {
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    w = r.width; h = r.height; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  // Encuadre: todo el grafo visible, centrado.
  function encuadrar() {
    const xs = g.nodos.map((n) => n.x), ys = g.nodos.map((n) => n.y);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    G.vista = { x: -(x0 + x1) / 2, y: -(y0 + y1) / 2, k: Math.min(2, 0.9 * Math.min(w / (x1 - x0 || 1), h / (y1 - y0 || 1))) };
  }
  const aPantalla = (n) => [w / 2 + (n.x + G.vista.x) * G.vista.k, h / 2 + (n.y + G.vista.y) * G.vista.k];
  const aMundo = (px, py) => [(px - w / 2) / G.vista.k - G.vista.x, (py - h / 2) / G.vista.k - G.vista.y];
  const radio = (n) => (n.tipo === 'tema' ? 9 : n.tipo === 'fuente' ? 2.5 + Math.sqrt(n.grado) * 0.9 : 2.5 + Math.sqrt(n.grado) * 0.7);
  const color = (n) => (n.tipo === 'tema' ? C.tema : n.tipo === 'fuente' ? C.fte : C[n.estado]);

  function dibujar() {
    ctx.clearRect(0, 0, w, h);
    const resaltar = new Set();
    if (G.sel) { resaltar.add(G.sel); vecinos(g, G.sel).forEach((v) => resaltar.add(v.id)); }
    const tenue = (id) => (G.filtro && !G.filtro.has(id)) || (G.sel && !resaltar.has(id));
    const idx = new Map(g.nodos.map((n) => [n.id, n]));
    ctx.lineWidth = 1;
    for (const e of g.aristas) {
      const a = idx.get(e.a), b = idx.get(e.b), activa = G.sel && (e.a === G.sel || e.b === G.sel);
      ctx.globalAlpha = activa ? 0.9 : tenue(e.a) || tenue(e.b) ? 0.05 : 0.22;
      ctx.strokeStyle = activa ? C.ink : C.linea;
      ctx.setLineDash(e.tipo === 'formula' ? [4, 3] : []);
      const [x1, y1] = aPantalla(a), [x2, y2] = aPantalla(b);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const n of g.nodos) {
      const [x, y] = aPantalla(n), r = radio(n) * Math.min(1.6, Math.max(0.7, Math.sqrt(G.vista.k)));
      ctx.globalAlpha = tenue(n.id) ? 0.15 : 1;
      ctx.fillStyle = color(n); ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
      if (n.id === G.sel) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1; }
      const etiqueta = n.tipo === 'tema' || resaltar.has(n.id) || (G.filtro?.has(n.id)) || G.vista.k > 2.2;
      if (etiqueta && !tenue(n.id)) {
        ctx.fillStyle = C.ink; ctx.font = `${n.tipo === 'tema' ? 600 : 400} ${n.tipo === 'tema' ? 13 : 11}px Inter, system-ui, sans-serif`;
        const t = n.titulo.length > 48 ? n.titulo.slice(0, 46) + '…' : n.titulo;
        ctx.fillText(t, x + r + 4, y + 4);
      }
    }
    ctx.globalAlpha = 1;
  }

  function animar() {
    if (!canvas.isConnected) { corriendo = false; return; }
    if (G.energia > 0.02 || arrastre?.nodo) G.energia = paso(g, { fijo: arrastre?.nodo?.id ?? null });
    dibujar();
    if (G.energia > 0.02 || arrastre) requestAnimationFrame(animar); else corriendo = false;
  }
  const despertar = (e = 0.5) => { G.energia = Math.max(G.energia, e); if (!corriendo) { corriendo = true; requestAnimationFrame(animar); } };

  function nodoEn(px, py) {
    let mejor = null, dmin = Infinity;
    for (const n of g.nodos) {
      const [x, y] = aPantalla(n), d = Math.hypot(x - px, y - py);
      if (d < radio(n) + 8 && d < dmin) { dmin = d; mejor = n; }
    }
    return mejor;
  }
  function seleccionar(id, centrar = false) {
    G.sel = id; detalleEl.innerHTML = detalle(id ? porId(id) : null);
    if (centrar && id) { const n = porId(id); G.vista.x = -n.x; G.vista.y = -n.y; G.vista.k = Math.max(G.vista.k, 1.6); }
    dibujar();
  }

  // Punteros: un dedo o el ratón arrastran un punto o mueven el grafo; dos dedos acercan.
  const punteros = new Map();
  let arrastre = null, pellizco = null;
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId); punteros.set(e.pointerId, pos(e));
    if (punteros.size === 2) {
      const [a, b] = [...punteros.values()]; pellizco = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: G.vista.k }; arrastre = null; return;
    }
    const [px, py] = pos(e), n = nodoEn(px, py);
    arrastre = { nodo: n, x: px, y: py, vx: G.vista.x, vy: G.vista.y, movio: false };
    if (n) despertar(0.3);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!punteros.has(e.pointerId)) return;
    punteros.set(e.pointerId, pos(e));
    if (pellizco && punteros.size === 2) {
      const [a, b] = [...punteros.values()];
      G.vista.k = Math.min(6, Math.max(0.2, pellizco.k * Math.hypot(a[0] - b[0], a[1] - b[1]) / pellizco.d)); dibujar(); return;
    }
    if (!arrastre) return;
    const [px, py] = pos(e);
    if (Math.hypot(px - arrastre.x, py - arrastre.y) > 4) arrastre.movio = true;
    if (arrastre.nodo) { [arrastre.nodo.x, arrastre.nodo.y] = aMundo(px, py); despertar(0.3); }
    else { G.vista.x = arrastre.vx + (px - arrastre.x) / G.vista.k; G.vista.y = arrastre.vy + (py - arrastre.y) / G.vista.k; dibujar(); }
  });
  const soltar = (e) => {
    punteros.delete(e.pointerId);
    if (punteros.size < 2) pellizco = null;
    if (arrastre && !arrastre.movio) seleccionar(arrastre.nodo ? arrastre.nodo.id : null);
    arrastre = null;
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const [px, py] = pos(e), [mx, my] = aMundo(px, py);
    G.vista.k = Math.min(6, Math.max(0.2, G.vista.k * Math.exp(-e.deltaY * 0.0015)));
    const [nx, ny] = aMundo(px, py); G.vista.x += nx - mx; G.vista.y += ny - my; dibujar();
  }, { passive: false });

  // Controles fuera del lienzo.
  const entrada = raiz.querySelector('#cb-buscar'), res = raiz.querySelector('#cb-resultados');
  entrada?.addEventListener('input', () => {
    G.texto = entrada.value;
    const r = G.texto.trim() ? buscar(G.texto, { max: 500 }) : [];
    G.filtro = G.texto.trim() ? new Set(r.map((x) => x.id)) : null;
    res.innerHTML = resultados(); dibujar();
  });
  raiz.querySelector('.cerebro')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cb-ir]'); if (b) seleccionar(b.dataset.cbIr, true);
  });
  raiz.querySelector('#cb-centrar')?.addEventListener('click', () => { encuadrar(); seleccionar(null); });
  raiz.querySelector('#cb-obsidian')?.addEventListener('click', () => {
    const blob = new Blob([zip(notasObsidian(g))], { type: 'application/zip' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'trofaxis-cerebro.zip'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  new ResizeObserver(() => { medir(); dibujar(); }).observe(canvas);
  medir(); if (!G.vista) encuadrar(); despertar(0.5);
}
