// Panel de administración: Cerebro. Grafo interactivo de todo lo que la app sabe, al estilo del de Obsidian:
// arrastrar, acercar con la rueda o con dos dedos y tocar un punto para ver el hecho y su fuente.
// Funciona sin conexión y sin IA: dibuja los hechos y la matriz de vínculos de src/cerebro/ en un <canvas>.
import { esc } from '../core/utils.js';
import { HECHOS, TEMAS, PENDIENTES } from '../cerebro/hechos.js';
import { CONSULTA_PPDB } from '../plag/catalogo.js';
import { buscar, resumen } from '../cerebro/consulta.js';
import { armarGrafo, posicionesIniciales, paso, vecinos } from '../cerebro/grafo.js';
import { notasObsidian, zip } from '../cerebro/obsidian.js';
import { VARIABLES, VINCULOS, SENTIDOS, pesoDe, resumenVinculos } from '../cerebro/vinculos.js';
import { normalizar } from '../riego/referencias.js';

const ESTADO_CLASE = { 'con fuente': 'cb-fuente', 'criterio propio': 'cb-propio', 'por validar': 'cb-validar' };
const LINEA = { tema: 'pertenece al tema', fuente: 'misma fuente', formula: 'se usan juntos en la fórmula de', mecanismo: 'vínculo' };

// Estado de la vista que sobrevive a los redibujados de la app (posiciones, zoom, selección).
// `agrupar` falso: solo relaciones (fórmulas y vínculos); los temas y las fuentes son agrupaciones y se piden aparte.
const G = { grafo: null, vista: null, sel: null, filtro: null, texto: '', tipo: 'todo', estado: null, energia: 1, agrupar: false };
function grafo() {
  if (!G.grafo) { G.grafo = posicionesIniciales(armarGrafo(HECHOS, { agrupar: G.agrupar })); for (let i = 0; i < 120; i++) paso(G.grafo); }
  return G.grafo;
}
const porId = (id) => grafo().nodos.find((n) => n.id === id);
const pill = (estado) => `<span class="pill ${ESTADO_CLASE[estado]}">${esc(estado)}</span>`;
// En los vínculos, «por validar» se lee «hipótesis».
const pillV = (estado) => `<span class="pill ${ESTADO_CLASE[estado]}">${esc(estado === 'por validar' ? 'hipótesis' : estado)}</span>`;
const irVariable = (id) => `<button type="button" class="btn sm cb-ir" data-cb-ir="${esc(id)}">${esc(VARIABLES[id].nombre)}</button>`;
const nombreVinculo = (v) => `${v.de.map((x) => VARIABLES[x].nombre).join(' + ')} → ${VARIABLES[v.a].nombre}`;

// Explorador: buscar o listar variables, vínculos (con sus hipótesis), fuentes y hechos, todo con el mismo filtro.
// No es una IA: compara palabras sin tildes ni mayúsculas. «hipótesis» encuentra los vínculos por validar.
export const TIPOS = { todo: 'Todo', variable: 'Variables', vinculo: 'Vínculos', fuente: 'Fuentes', hecho: 'Hechos' };
const ESTADO_VINCULO = { 'por validar': 'hipótesis' };
const palabras = (t) => normalizar(t).split(/\s+/).filter((p) => p.length > 1);
const coincide = (ps, ...textos) => { const t = normalizar(textos.join(' ')); return ps.every((p) => t.includes(p)); };
const claveCita = (c) => c.replace(/\s*\(actualizada.*$/, '');

// Fuentes distintas, con los hechos y los vínculos que las citan.
function todasLasFuentes() {
  const m = new Map();
  const de = (cita, url = '') => { const k = claveCita(cita); if (!m.has(k)) m.set(k, { cita: k, url, hechos: [], vinculos: [] }); return m.get(k); };
  for (const h of HECHOS) if (h.fuente?.cita) de(h.fuente.cita, h.fuente.url).hechos.push(h);
  for (const v of VINCULOS) for (const ev of v.evidencia) { const f = de(ev.cita); if (!f.vinculos.includes(v)) f.vinculos.push(v); }
  return [...m.values()].sort((a, b) => (b.hechos.length + b.vinculos.length) - (a.hechos.length + a.vinculos.length));
}
const FUENTES_TODAS = todasLasFuentes();

export function explorar({ texto = '', tipo = 'todo', estado = null } = {}) {
  const ps = palabras(texto), quiere = (t) => tipo === 'todo' || tipo === t;
  const variables = !quiere('variable') || estado ? [] : Object.keys(VARIABLES).filter((id) => coincide(ps, VARIABLES[id].nombre, id));
  const vinculos = !quiere('vinculo') ? [] : VINCULOS.filter((v) => (!estado || v.estado === estado)
    && coincide(ps, nombreVinculo(v), v.mecanismo, v.estado, ESTADO_VINCULO[v.estado] ?? '', v.contexto ?? '', v.nota ?? '', ...v.evidencia.map((e) => `${e.cita} ${e.nota ?? ''}`)));
  const fuentes = !quiere('fuente') || estado ? [] : FUENTES_TODAS.filter((f) => coincide(ps, f.cita));
  const hechos = !quiere('hecho') ? [] : (ps.length ? buscar(texto, { max: 500 }) : HECHOS).filter((h) => !estado || h.estado === estado);
  return { variables, vinculos, fuentes, hechos };
}
const activo = () => G.texto.trim() || G.tipo !== 'todo' || G.estado;

// Ids de puntos del grafo que corresponden a lo que se está mostrando (para atenuar el resto).
function idsEnGrafo(r) {
  return new Set([...r.variables, ...r.vinculos.flatMap((v) => [...v.de, v.a]), ...r.hechos.map((h) => h.id), ...r.fuentes.flatMap((f) => f.hechos.map((h) => h.id))]);
}

// Ficha de un vínculo: causa → efecto, mecanismo, estado, evidencia y dónde actúa en la app.
function fichaVinculo(v) {
  const peso = pesoDe(v);
  const uso = v.usadoEn.modulo
    ? `Rúbrica <code>${esc(v.usadoEn.modulo)}.${esc(v.usadoEn.variable)}</code>, peso ${peso}${peso ? '' : ' (solo informa)'}`
    : `Aviso «${esc(v.usadoEn.aviso)}»; no suma al puntaje`;
  const evidencia = v.evidencia.length
    ? `<ul class="cb-evidencia small">${v.evidencia.map((ev) => `<li><b>${esc(ev.postura)}:</b> ${esc(ev.cita)}${ev.nota ? ` <span class="muted">${esc(ev.nota)}</span>` : ''}</li>`).join('')}</ul>`
    : '<p class="small muted">Sin fuente todavía.</p>';
  return `<li class="cb-vinculo">
    <p>${v.de.map(irVariable).join(' + ')} → ${irVariable(v.a)} <span class="muted small">(${esc(SENTIDOS[v.sentido])})</span></p>
    <p class="small">${esc(v.mecanismo)}</p>
    <p>${pillV(v.estado)} <span class="muted small">${v.validado ? `validado por ${esc(v.validado.por)} (${esc(v.validado.fecha)})` : 'sin validar por un especialista'}</span></p>
    ${evidencia}${v.contexto ? `<p class="small muted">Contexto: ${esc(v.contexto)}.</p>` : ''}${v.nota ? `<p class="small muted">${esc(v.nota)}</p>` : ''}
    <p class="small muted">${uso} · <code>${esc(v.usadoEn.archivo)}</code></p></li>`;
}

function detalle(n) {
  if (!n) return '<p class="muted">Toca un punto para ver el hecho o la variable, su fuente y con qué se relaciona.</p>';
  const vs = vecinos(grafo(), n.id).map((v) => ({ ...v, n: porId(v.id) }));
  const texto = (v) => (v.tipo === 'dato' ? (v.sale ? 'valor que usa' : 'usa este valor') : LINEA[v.tipo]);
  const enlace = (v) => `<li><button type="button" class="btn sm cb-ir" data-cb-ir="${esc(v.id)}">${esc(v.n.titulo)}</button> <span class="muted small">${texto(v)}${v.donde ? ` <code>${esc(v.donde)}</code>` : ''}</span></li>`;
  const lista = (titulo, a) => (a.length ? `<h4>${titulo}</h4><ul class="cb-vecinos">${a.slice(0, 40).map(enlace).join('')}</ul>${a.length > 40 ? `<p class="muted small">y ${a.length - 40} más.</p>` : ''}` : '');
  if (n.tipo === 'variable') {
    const sale = VINCULOS.filter((v) => v.de.includes(n.id)), entra = VINCULOS.filter((v) => v.a === n.id);
    const fichas = (titulo, a) => (a.length ? `<h4>${titulo} (${a.length})</h4><ul class="cb-vecinos">${a.map(fichaVinculo).join('')}</ul>` : '');
    return `<p class="muted small">${n.efecto ? 'Riesgo que recibe el efecto' : 'Variable de la finca'}</p><h3>${esc(n.titulo)}</h3>
      ${lista('Usa los valores', vs.filter((v) => v.tipo === 'dato'))}${fichas('Afecta a', sale)}${fichas('Lo afectan', entra)}`;
  }
  if (n.tipo !== 'hecho') {
    const tipo = n.tipo === 'tema' ? 'Tema' : 'Fuente';
    return `<p class="muted small">${tipo}</p><h3>${esc(n.titulo)}</h3>${n.url ? `<p><a href="${esc(n.url)}" target="_blank" rel="noopener">Abrir la fuente</a></p>` : ''}
      ${lista(`Hechos (${vs.length})`, vs)}`;
  }
  const h = n.hecho;
  const fuente = h.fuente ? (h.fuente.url ? `<a href="${esc(h.fuente.url)}" target="_blank" rel="noopener">${esc(h.fuente.cita)}</a>` : esc(h.fuente.cita)) : `Sin fuente todavía: ${esc(h.estado)}.`;
  return `<p class="muted small">${esc(TEMAS[h.tema])}</p><h3>${esc(h.titulo)}</h3>
    <p class="cb-valor">${esc(h.valor)}${h.unidad ? ` <span class="muted">${esc(h.unidad)}</span>` : ''}</p>
    <p>${pill(h.estado)}</p>
    <p class="small"><b>Fuente:</b> ${fuente}</p>${h.nota ? `<p class="small muted">${esc(h.nota)}</p>` : ''}
    <p class="small muted">Vive en <code>${esc(h.donde)}</code>.</p>
    ${lista('Se usa junto con', vs.filter((v) => v.tipo === 'formula'))}${lista('Lo usan estas variables', vs.filter((v) => v.tipo === 'dato'))}`;
}

// Botones de conteo y de tipo: cada uno abre su lista en el explorador.
const filtroBtn = (tipo, estado, texto, clase = '') => {
  const on = G.tipo === tipo && G.estado === estado;
  return `<button type="button" class="pill cb-filtro ${clase}" data-cb-tipo="${tipo}" data-cb-estado="${esc(estado ?? '')}" aria-pressed="${on}">${texto}</button>`;
};
function filtros() {
  const r = resumen(HECHOS), rv = resumenVinculos(), todo = explorar();
  return `<div class="row">
      ${filtroBtn('hecho', null, `${r.total} hechos`)}${filtroBtn('hecho', 'con fuente', `${r['con fuente']} con fuente`, 'cb-fuente')}
      ${filtroBtn('hecho', 'criterio propio', `${r['criterio propio']} criterio propio`, 'cb-propio')}${filtroBtn('hecho', 'por validar', `${r['por validar']} por validar`, 'cb-validar')}
    </div>
    <div class="row">
      ${filtroBtn('vinculo', null, `${rv.total} vínculos`)}${filtroBtn('vinculo', 'con fuente', `${rv['con fuente']} con fuente`, 'cb-fuente')}
      ${filtroBtn('vinculo', 'criterio propio', `${rv['criterio propio']} criterio propio`, 'cb-propio')}${filtroBtn('vinculo', 'por validar', `${rv['por validar']} hipótesis`, 'cb-validar')}
      ${rv.conflicto ? `<span class="pill cb-conflicto">${rv.conflicto} en conflicto</span>` : ''}
    </div>
    <div class="row cb-tipos" role="group" aria-label="Qué buscar">
      ${Object.entries(TIPOS).map(([t, n]) => filtroBtn(t, null, t === 'todo' ? n : `${n} (${todo[t === 'vinculo' ? 'vinculos' : t === 'variable' ? 'variables' : t === 'fuente' ? 'fuentes' : 'hechos'].length})`, 'cb-tipo')).join('')}
    </div>`;
}

const MAX = 80;
const recorta = (a, f) => `${a.slice(0, MAX).map(f).join('')}${a.length > MAX ? `<li class="muted small">y ${a.length - MAX} más: escribe para acotar.</li>` : ''}`;
function resultados() {
  if (!activo()) return '<p class="muted small">Toca un conteo o un tipo para ver la lista, o escribe para buscar. Toca cualquier resultado para verlo en el grafo.</p>';
  const r = explorar({ texto: G.texto, tipo: G.tipo, estado: G.estado });
  const n = r.variables.length + r.vinculos.length + r.fuentes.length + r.hechos.length;
  const que = [G.tipo !== 'todo' ? TIPOS[G.tipo].toLowerCase() : '', G.estado ? `«${ESTADO_VINCULO[G.estado] && G.tipo === 'vinculo' ? ESTADO_VINCULO[G.estado] : G.estado}»` : '', G.texto.trim() ? `con «${G.texto.trim()}»` : ''].filter(Boolean).join(' ');
  const cab = `<div class="row between cb-res-cab"><p class="small"><b>${n} resultado${n === 1 ? '' : 's'}</b>${que ? ` · ${esc(que)}` : ''}</p><button type="button" class="btn sm" data-cb-limpiar>Limpiar</button></div>`;
  if (!n) return `${cab}<p class="muted small">Nada coincide. El cerebro solo busca palabras: no responde preguntas libres.</p>`;
  const grupo = (titulo, a, f) => (a.length ? `<h4>${titulo} (${a.length})</h4><ul class="cb-lista">${recorta(a, f)}</ul>` : '');
  return `${cab}<div class="cb-res-grupos">
    ${grupo('Vínculos', r.vinculos, (v) => `<li><button type="button" class="cb-item" data-cb-vinculo="${esc(v.id)}"><span>${esc(nombreVinculo(v))}</span><span class="small muted">${esc(v.mecanismo)}</span></button>${pillV(v.estado)}${pesoDe(v) ? ` <span class="small muted">peso ${pesoDe(v)}</span>` : ''}</li>`)}
    ${grupo('Variables', r.variables, (id) => `<li><button type="button" class="cb-item" data-cb-ir="${esc(id)}"><span>${esc(VARIABLES[id].nombre)}</span><span class="small muted">${VINCULOS.filter((v) => v.de.includes(id) || v.a === id).length} vínculos</span></button></li>`)}
    ${grupo('Fuentes', r.fuentes, (f) => `<li><button type="button" class="cb-item" data-cb-fuente="${esc(f.cita)}"><span>${esc(f.cita)}</span><span class="small muted">${f.hechos.length} hechos · ${f.vinculos.length} vínculos</span></button></li>`)}
    ${grupo('Hechos', r.hechos, (h) => `<li><button type="button" class="cb-item" data-cb-ir="${esc(h.id)}"><span>${esc(h.titulo)}</span><span class="small muted">${esc(String(h.valor))} ${esc(h.unidad ?? '')}</span></button>${pill(h.estado)}</li>`)}
  </div>`;
}

// Detalle de una fuente: lo que se apoya en ella.
function detalleFuente(f) {
  return `<p class="muted small">Fuente</p><h3>${esc(f.cita)}</h3>${f.url ? `<p><a href="${esc(f.url)}" target="_blank" rel="noopener">Abrir la fuente</a></p>` : ''}
    ${f.vinculos.length ? `<h4>Vínculos que la citan (${f.vinculos.length})</h4><ul class="cb-vecinos">${f.vinculos.map(fichaVinculo).join('')}</ul>` : ''}
    ${f.hechos.length ? `<h4>Hechos (${f.hechos.length})</h4><ul class="cb-vecinos">${f.hechos.slice(0, 60).map((h) => `<li><button type="button" class="btn sm cb-ir" data-cb-ir="${esc(h.id)}">${esc(h.titulo)}</button></li>`).join('')}</ul>` : ''}`;
}
const detalleVinculo = (v) => `<p class="muted small">Vínculo</p><h3>${esc(nombreVinculo(v))}</h3><ul class="cb-vecinos">${fichaVinculo(v)}</ul>`;

// Lista de trabajo del administrador: lo que falta validar, agrupado por tema.
function pendientes(hoy = new Date()) {
  const grupo = (estado) => Object.entries(TEMAS).map(([t, nombre]) => {
    const hs = HECHOS.filter((h) => h.tema === t && h.estado === estado);
    return hs.length ? `<li><b>${esc(nombre)}</b> (${hs.length}): ${hs.map((h) => `<button type="button" class="btn sm cb-ir" data-cb-ir="${esc(h.id)}">${esc(h.titulo)}</button>`).join(' ')}</li>` : '';
  }).join('');
  const dias = Math.floor((hoy - new Date(CONSULTA_PPDB)) / 86400000);
  const rv = resumenVinculos();
  const sinValidar = VINCULOS.filter((v) => !v.validado);
  const hipotesis = VINCULOS.filter((v) => v.estado === 'por validar' && pesoDe(v) > 0);
  return `<section class="card cb-pendientes"><h2>Pendientes del administrador</h2>
    <p class="muted small">Revisión sugerida una vez al mes. Los valores se cambian en el repo, con un PR, no aquí.</p>
    <p class="small"><b>Fichas PPDB/BPDB:</b> consultadas el ${esc(CONSULTA_PPDB)} (hace ${dias} días).</p>
    <details><summary>Por validar con un especialista (${HECHOS.filter((h) => h.estado === 'por validar').length})</summary><ul class="cb-grupos">${grupo('por validar')}</ul></details>
    <details><summary>Criterio propio por calibrar (${HECHOS.filter((h) => h.estado === 'criterio propio').length})</summary><ul class="cb-grupos">${grupo('criterio propio')}</ul></details>
    <details><summary>Vínculos sin validar por un especialista (${rv.sinValidar} de ${rv.total})</summary>
      ${hipotesis.length ? `<p class="small"><b>${hipotesis.length} hipótesis ya suman al puntaje:</b> Conviene validarlas primero.</p><ul class="cb-grupos">${hipotesis.map((v) => `<li><button type="button" class="btn sm cb-ir" data-cb-vinculo="${esc(v.id)}">${esc(nombreVinculo(v))}</button> <span class="small muted">peso ${pesoDe(v)}</span></li>`).join('')}</ul>` : ''}
      <ul class="cb-grupos">${sinValidar.map((v) => `<li><button type="button" class="btn sm cb-ir" data-cb-vinculo="${esc(v.id)}">${esc(nombreVinculo(v))}</button> ${pillV(v.estado)}</li>`).join('')}</ul></details>
    ${rv.conflicto ? `<p class="small"><b>Vínculos en conflicto (${rv.conflicto}):</b> tienen fuentes a favor y en contra.</p>` : ''}
  </section>`;
}

export function viewCerebro() {
  const r = resumen(HECHOS), rv = resumenVinculos();
  const sel = G.sel ? porId(G.sel) : null;
  return `<header class="admin-cab"><b>Trofaxis</b> · Administración <a class="btn sm" href="../">Ir a la app</a></header>
  <section class="card cerebro">
    <div><h2>Cerebro de Trofaxis</h2>
      <p class="muted">Todo lo que la app sabe, con su fuente. Cada punto es un hecho o una variable de la finca. Las líneas son solo relaciones reales: las fórmulas que usan dos valores juntos (punteadas) y los vínculos entre variables (con flecha), cada uno con su mecanismo y su fuente o su estado. El tema y la fuente son agrupaciones, no relaciones: se ven al marcar «Ver también temas y fuentes». Funciona sin conexión y sin inteligencia artificial.</p></div>
    <div class="cb-explorar">
      <div id="cb-filtros">${filtros()}</div>
      <div class="row cb-controles">
        <div class="f cb-buscar"><label for="cb-buscar">Buscar una variable, hipótesis, fuente o hecho</label><input id="cb-buscar" type="search" placeholder="hipótesis, Kuniyoshi, pendiente, imidacloprid…" value="${esc(G.texto)}" autocomplete="off"></div>
        <label class="cb-agrupar small"><input type="checkbox" id="cb-agrupar"${G.agrupar ? ' checked' : ''}> Ver también temas y fuentes</label>
        <button type="button" class="btn sm" id="cb-centrar">Centrar</button>
        <button type="button" class="btn sm" id="cb-obsidian">Descargar para Obsidian (.zip)</button>
      </div>
      <div id="cb-resultados" class="cb-resultados" aria-live="polite">${resultados()}</div>
    </div>
    <div class="row small cb-leyenda" aria-hidden="true">
      <span><i class="cb-punto cb-var"></i>Variable de la finca</span><span><i class="cb-punto cb-tema"></i>Tema</span><span><i class="cb-punto cb-fte"></i>Fuente</span>
      <span><i class="cb-punto cb-fuente"></i>Hecho con fuente</span><span><i class="cb-punto cb-propio"></i>Criterio propio</span><span><i class="cb-punto cb-validar"></i>Por validar</span>
      <span>Flecha: vínculo · Punteada: fórmula</span>
    </div>
    <div class="cb-cuerpo">
      <div class="cb-lienzo"><canvas id="cb-canvas" role="img" aria-label="Grafo del cerebro: ${r.total} hechos y ${rv.total} vínculos entre variables de la finca. Usa la búsqueda para recorrerlo con el teclado."></canvas></div>
      <aside id="cb-detalle" class="cb-detalle" aria-live="polite">${detalle(sel)}</aside>
    </div>
    <details><summary>Lo que el cerebro todavía no sabe</summary><ul>${PENDIENTES.map((p) => `<li><b>${esc(p.fuente)}:</b> ${esc(p.falta)}</li>`).join('')}</ul>
      <p class="muted small">Sin IA, el cerebro no responde preguntas libres, no razona sobre casos sin regla escrita y no lee documentos por sí solo: cada dato entra a mano con su fuente.</p></details>
  </section>
  ${pendientes()}`;
}

// --- Dibujo e interacción (se monta después de cada render de la vista) ----------------------------------------
let corriendo = false;
export function montarCerebro(raiz = document) {
  const canvas = raiz.querySelector('#cb-canvas');
  if (!canvas || canvas.dataset.montado) return;
  canvas.dataset.montado = '1';
  let g = grafo();
  const ctx = canvas.getContext('2d');
  const css = getComputedStyle(document.documentElement), col = (v) => css.getPropertyValue(v).trim();
  const C = { tema: col('--accent'), fte: col('--cb-fte'), var: col('--cb-var'), 'con fuente': col('--good'), 'criterio propio': col('--warn'), 'por validar': col('--muted'), linea: col('--muted'), ink: col('--ink'), fondo: col('--surface') };
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
  const radio = (n) => (n.tipo === 'tema' || n.efecto ? 9 : n.tipo === 'variable' ? 3.5 + Math.sqrt(n.grado) * 0.8 : n.tipo === 'fuente' ? 2.5 + Math.sqrt(n.grado) * 0.9 : 2.5 + Math.sqrt(n.grado) * 0.7);
  const color = (n) => (n.tipo === 'tema' ? C.tema : n.tipo === 'fuente' ? C.fte : n.tipo === 'variable' ? C.var : C[n.estado]);
  const escala = () => Math.min(1.6, Math.max(0.7, Math.sqrt(G.vista.k)));

  function dibujar() {
    ctx.clearRect(0, 0, w, h);
    const resaltar = new Set();
    if (G.sel) { resaltar.add(G.sel); vecinos(g, G.sel).forEach((v) => resaltar.add(v.id)); }
    const tenue = (id) => (G.filtro && !G.filtro.has(id)) || (G.sel && !resaltar.has(id));
    const idx = new Map(g.nodos.map((n) => [n.id, n]));
    ctx.lineWidth = 1;
    for (const e of g.aristas) {
      const a = idx.get(e.a), b = idx.get(e.b), activa = G.sel && (e.a === G.sel || e.b === G.sel), mec = e.tipo === 'mecanismo';
      ctx.globalAlpha = activa ? 0.9 : tenue(e.a) || tenue(e.b) ? 0.05 : mec ? 0.6 : 0.22;
      ctx.strokeStyle = activa ? C.ink : mec ? C.var : C.linea;
      ctx.lineWidth = mec ? 1.5 : 1;
      ctx.setLineDash(e.tipo === 'formula' ? [4, 3] : []);
      const [x1, y1] = aPantalla(a), [x2, y2] = aPantalla(b);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      if (mec) { // punta de flecha en el borde del efecto: causa → efecto
        const d = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / d, uy = (y2 - y1) / d, r = radio(b) * escala() + 2;
        const px = x2 - ux * r, py = y2 - uy * r;
        ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(px, py);
        ctx.lineTo(px - ux * 7 - uy * 3.5, py - uy * 7 + ux * 3.5); ctx.lineTo(px - ux * 7 + uy * 3.5, py - uy * 7 - ux * 3.5); ctx.fill();
      }
    }
    ctx.setLineDash([]); ctx.lineWidth = 1;
    for (const n of g.nodos) {
      const [x, y] = aPantalla(n), r = radio(n) * escala();
      ctx.globalAlpha = tenue(n.id) ? 0.15 : 1;
      ctx.fillStyle = color(n); ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
      if (n.id === G.sel) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1; }
      const fuerte = n.tipo === 'tema' || n.efecto;
      const etiqueta = fuerte || resaltar.has(n.id) || (G.filtro?.has(n.id)) || G.vista.k > 2.2;
      if (etiqueta && !tenue(n.id)) {
        ctx.fillStyle = C.ink; ctx.font = `${fuerte ? 600 : 400} ${fuerte ? 13 : 11}px Inter, system-ui, sans-serif`;
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
  // Con o sin temas y fuentes: se arma otro grafo y se vuelve a encuadrar.
  function cambiarAgrupar(si) {
    G.agrupar = si; G.grafo = null; g = grafo();
    const casilla = raiz.querySelector('#cb-agrupar'); if (casilla) casilla.checked = si;
    if (G.sel && !porId(G.sel)) G.sel = null;
    encuadrar(); seleccionar(G.sel); despertar(0.5);
  }
  function seleccionar(id, centrar = false) {
    if (id && !porId(id) && !G.agrupar) cambiarAgrupar(true); // un hecho sin relaciones solo está en la vista completa
    if (id && !porId(id)) id = null;
    G.sel = id; detalleEl.innerHTML = detalle(id ? porId(id) : null);
    if (centrar && id) { const n = porId(id); G.vista.x = -n.x; G.vista.y = -n.y; G.vista.k = Math.max(G.vista.k, 1.6); canvas.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
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
  const filtrosEl = raiz.querySelector('#cb-filtros');
  function refrescar() {
    const r = explorar({ texto: G.texto, tipo: G.tipo, estado: G.estado });
    G.filtro = activo() ? idsEnGrafo(r) : null;
    if (filtrosEl) filtrosEl.innerHTML = filtros();
    res.innerHTML = resultados(); dibujar();
  }
  entrada?.addEventListener('input', () => { G.texto = entrada.value; refrescar(); });
  (raiz.querySelector('#app') ?? raiz.querySelector('.cerebro')?.parentElement)?.addEventListener('click', (e) => {
    const t = e.target.closest('[data-cb-tipo]');
    if (t) {
      const tipo = t.dataset.cbTipo, estado = t.dataset.cbEstado || null, ya = G.tipo === tipo && G.estado === estado;
      G.tipo = ya ? 'todo' : tipo; G.estado = ya ? null : estado; refrescar(); return;
    }
    if (e.target.closest('[data-cb-limpiar]')) { G.texto = ''; G.tipo = 'todo'; G.estado = null; if (entrada) entrada.value = ''; refrescar(); return; }
    const v = e.target.closest('[data-cb-vinculo]');
    if (v) { const x = VINCULOS.find((y) => y.id === v.dataset.cbVinculo); seleccionar(x.de[0], true); detalleEl.innerHTML = detalleVinculo(x); return; }
    const f = e.target.closest('[data-cb-fuente]');
    if (f) { const x = FUENTES_TODAS.find((y) => y.cita === f.dataset.cbFuente); seleccionar(null); detalleEl.innerHTML = detalleFuente(x); detalleEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
    const b = e.target.closest('[data-cb-ir]'); if (b) seleccionar(b.dataset.cbIr, true);
  });
  raiz.querySelector('#cb-centrar')?.addEventListener('click', () => { encuadrar(); seleccionar(null); });
  raiz.querySelector('#cb-agrupar')?.addEventListener('change', (e) => cambiarAgrupar(e.target.checked));
  raiz.querySelector('#cb-obsidian')?.addEventListener('click', () => {
    const blob = new Blob([zip(notasObsidian(armarGrafo()))], { type: 'application/zip' }); // la bóveda lleva todo, con temas y fuentes
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'trofaxis-cerebro.zip'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  new ResizeObserver(() => { medir(); dibujar(); }).observe(canvas);
  medir(); if (!G.vista) encuadrar(); despertar(0.5);
}
