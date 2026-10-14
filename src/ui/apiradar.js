// Panel ApiRadar del dashboard: resolver el problema de Spathodea y las abejas nativas con los datos que el usuario ya cargó.
// Se lee como una ruta: cuánto riesgo hay hoy y cuánto queda con el plan, qué pasos faltan, qué hacer y dónde, y cómo se calculó.
import { esc } from '../core/utils.js';
import { S } from '../core/state.js';
import { apiRadar, apiRadarAplica, PROBLEMAS } from '../apiradar/diagnostico.js';
import { radar } from './charts.js';
import { pastillaPuntaje, estadoFuente, mas } from './components.js';
import { ubicacionActual } from './mapa.js';
import { mapaRiesgo, leyendaRiesgo } from './mapariesgo.js';
import { VEREDICTO, nombreSitio } from '../apiradar/censo.js';
import { masApiRadar } from './explicaciones.js';

const estado = (e, fuente, clave) => estadoFuente(e, fuente, `fuente-ar-${clave}`, S.abiertos[`fuente-ar-${clave}`]);
const nf = (x, d = 0) => x.toLocaleString('es-HN', { maximumFractionDigits: d });
const coord = (p) => `${p[0].toFixed(5)}, ${p[1].toFixed(5)}`;
const claseTxt = { alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };
const tono = (lv) => (lv === 'Alto' ? 'crit' : lv === 'Medio' ? 'warn' : 'good');
export const claveHecha = (id) => `ar|${id}`;

// Pasos que muestra la animación de análisis al generar el ApiRadar (referencia de diseño: pantallas de carga de Astra AI).
export const PASOS_ANALISIS = ['Leyendo tu finca', 'Ubicando los árboles de riesgo', 'Cruzando floración y aplicaciones', 'Midiendo cuánto baja cada cambio', 'Armando tu plan'];

// Esfera de puntos animada (solo CSS; con «reducir movimiento» queda quieta).
export const esfera = () => `<svg class="esfera" viewBox="-60 -60 120 120" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map((i) => `<g class="meridiano m${i}">${Array.from({ length: 24 }, (_, k) => { const a = (k * 15) * Math.PI / 180; return `<circle cx="${(50 * Math.cos(a)).toFixed(1)}" cy="${(50 * Math.sin(a)).toFixed(1)}" r="1.8"/>`; }).join('')}</g>`).join('')}</svg>`;

function analizando() {
  return `<div class="ar-cargando" role="status" aria-live="polite">
    ${esfera()}
    <p class="ar-cargando-t">Preparando tu ApiRadar…</p>
    <ul class="ar-pasos-carga">${PASOS_ANALISIS.map((p) => `<li><span class="tick" aria-hidden="true"></span>${p}</li>`).join('')}</ul>
  </div>`;
}

// Hoy y con el plan, en grande, con una barra que muestra cuánto baja.
function resultado(R, cfg) {
  const conPlan = R.total.a, baja = R.total.de - conPlan;
  const lvPlan = conPlan >= cfg.niveles.alto ? 'Alto' : conPlan >= cfg.niveles.medio ? 'Medio' : 'Bajo';
  return `<div class="ar-resultado">
    <div class="ar-num"><span class="label">Riesgo hoy</span><b class="txt-${tono(R.nivel)}">${R.score}</b><span class="pill ${R.nivel}">${R.nivel}</span></div>
    <div class="ar-flecha" aria-hidden="true">→</div>
    <div class="ar-num"><span class="label">Con tu plan</span><b class="txt-${tono(lvPlan)}">${conPlan}</b><span class="pill ${lvPlan}">${lvPlan}</span></div>
    <div class="ar-barra" role="img" aria-label="El riesgo pasa de ${R.score} a ${conPlan} de 100">
      <span class="hoy" style="width:${R.score}%"></span><span class="plan" style="width:${conPlan}%"></span>
    </div>
    <p class="ar-frase">${baja > 0 ? `Tu plan baja el riesgo para las abejas <b>${baja} puntos</b>.` : 'Con las acciones elegidas, el puntaje no baja. Revisa tu plan más abajo.'} ${esc(R.resumen)}</p>
  </div>`;
}

// Ruta de pasos: dónde está el usuario y qué sigue.
function ruta(R) {
  const c = R.censo, propios = c.arboles.length && !c.ejemplo;
  const lejos = c.sitios.filter((s) => s.veredicto === 'lejos');
  const hechas = R.acciones.filter((a) => S.done[claveHecha(a.id)]).length;
  const mes = R.acciones.find((a) => a.id === 'refugio')?.cuando ?? '';
  const pasos = [
    { t: 'Mira tu riesgo', hecho: true, d: `${R.score} de 100 hoy.` },
    { t: 'Ubica los árboles de riesgo', hecho: !!propios, d: propios ? `${c.arboles.length} árbol(es) en el mapa.` : c.ejemplo ? 'Estás viendo un ejemplo.' : 'Carga sus coordenadas y copa.',
      b: propios ? '' : '<button class="btn sm primary" data-act="apiradar-censo">Cargar mi censo</button>' },
    { t: 'Marca dónde pondrías las colonias', hecho: lejos.length > 0, d: lejos.length ? `${lejos.map(nombreSitio).join(', ')} sirve${lejos.length > 1 ? 'n' : ''}.` : c.sitios.length ? 'Ningún sitio queda lejos todavía.' : 'Toca el mapa donde irían.',
      b: '<button class="btn sm" data-act="apiradar-sitio">Marcar en el mapa</button>' },
    { t: 'Haz los cambios de tu plan', hecho: R.acciones.length > 0 && hechas === R.acciones.length, d: `${hechas} de ${R.acciones.length} hechos.` },
    { t: 'Comprueba en la floración', hecho: false, d: `Cuenta abejas muertas en flores ${mes ? mes.replace('antes de', 'desde') : 'en la floración'}.` },
  ];
  return `<ol class="ar-ruta">${pasos.map((p, i) => `<li class="${p.hecho ? 'hecho' : ''}"><span class="n" aria-hidden="true">${p.hecho ? '✓' : i + 1}</span><div><b>${p.t}</b><span class="muted small">${p.d}</span>${p.b ?? ''}</div><span class="sr-only">${p.hecho ? 'Hecho' : 'Pendiente'}</span></li>`).join('')}</ol>`;
}

const chipDelta = (a) => (a.incluida === false ? '<span class="chip-delta fuera">Fuera de tu plan</span>'
  : a.delta == null ? '<span class="chip-delta nulo">No se mide</span>'
    : `<span class="chip-delta ${a.delta < 0 ? 'down' : a.delta > 0 ? 'up' : 'zero'}">${a.delta > 0 ? '+' : ''}${a.delta} puntos</span>`);

function donde(a) {
  if (a.donde?.punto) {
    return `<p class="ar-donde"><span class="label">Dónde</span> ${esc(a.donde.nombre)}: <b class="mono">${coord(a.donde.punto)}</b> <span class="muted small">(a ${a.donde.distanciaM} m del árbol de riesgo más cercano)</span>
      <button class="btn sm" data-act="apiradar-ir" data-lat="${a.donde.punto[0]}" data-lon="${a.donde.punto[1]}">Ver en el mapa</button></p>`;
  }
  if (a.donde?.arboles) return `<p class="ar-donde"><span class="label">Dónde</span> <span>árboles ${a.donde.arboles.map((x) => `<b>${esc(x.id)}</b> <span class="muted small mono">(${coord(x.punto)})</span>`).join(', ')}</span></p>`;
  if (a.id === 'refugio') return '<p class="ar-donde"><span class="label">Dónde</span> <span class="muted">Carga los árboles y dibuja el contorno de la finca para que la app calcule el punto.</span></p>';
  return '';
}

function plan(R) {
  return `<ol class="ar-plan">${R.acciones.map((a, i) => {
    const hecha = !!S.done[claveHecha(a.id)], medible = 'incluida' in a;
    return `<li class="ar-accion${hecha ? ' hecha' : ''}${a.incluida === false ? ' fuera' : ''}">
      <div class="ar-accion-top"><span class="n">${i + 1}</span><b>${esc(a.titulo)}</b>${chipDelta(a)}</div>
      <p class="small"><span class="tag">Cuándo: ${esc(a.cuando)}</span></p>
      ${donde(a)}
      <div class="row ar-accion-ctrl">
        <label class="check"><input type="checkbox" data-done="${claveHecha(a.id)}" ${hecha ? 'checked' : ''}> Ya lo hice</label>
        ${medible ? `<button type="button" class="btn sm" data-arplan="${a.id}" aria-pressed="${a.incluida !== false}">${a.incluida === false ? 'Agregar a mi plan' : 'Quitar de mi plan'}</button>` : ''}
      </div>
      <details data-keep="ar-como-${a.id}" ${S.abiertos[`ar-como-${a.id}`] ? 'open' : ''}><summary>Cómo hacerlo</summary>
        <p class="small">${esc(a.detalle)}</p><div class="small">${estado(a.estado)}${a.nota ? ` <span class="muted">${esc(a.nota)}</span>` : ''}</div></details>
    </li>`;
  }).join('')}</ol>
  <p class="muted small">Cada cambio que se puede medir se aplica en este orden y se recalcula tu finca después de cada uno: lo que baja es acumulado, y el orden importa. No es una predicción: es lo que da el cálculo con tus datos, por validar en campo.</p>`;
}

// Sección «Dónde»: mapa de riesgo, sitios candidatos y censo.
function seccionMapa(R, ubic, cfg) {
  const c = R.censo;
  if (!c.arboles.length) {
    return `<p class="muted">Aún no cargaste el censo de árboles. Con las coordenadas, el diámetro y la altura de copa de cada árbol, el ApiRadar clasifica el riesgo de cada uno, dibuja el mapa y dice si un sitio para colonias o refugios queda dentro o fuera del radio de exclusión.</p>
      <div class="row"><button class="btn primary" data-act="apiradar-censo">Cargar mi censo</button><button class="btn" data-mapa="ejemplo">Ver con datos de ejemplo</button></div>`;
  }
  const [rMin, rMax] = cfg.apiradar.radioExclusionM;
  const rs = c.resumen, orden = [...c.arboles].sort((a, b) => (b.vol ?? -1) - (a.vol ?? -1));
  const mejor = R.radio.sitio?.fraccionMin > 0 ? R.radio.sitio.mejor : null;
  return `${c.ejemplo ? '<div class="notice"><span><b>Ejemplo:</b> datos ficticios para ver cómo funciona. Las coordenadas no son de ninguna finca.</span><button class="btn sm" data-mapa="arboles-quitar">Quitar el ejemplo</button></div>' : ''}
    <div class="mapa-riesgo-caja">${mapaRiesgo(c, ubic.contorno, [rMin, rMax], mejor ? { punto: mejor.punto, distanciaM: mejor.distanciaM } : null)}</div>
    ${leyendaRiesgo([rMin, rMax])}
    ${ubic.contorno.length >= 3 ? '' : '<p class="muted small">Dibuja el contorno de la finca en el mapa para ver qué parte queda fuera del radio.</p>'}
    <h4>Sitios para colonias o refugios</h4>
    ${c.sitios.length ? `<div class="scroll"><table class="data"><thead><tr><th>Sitio</th><th>Coordenadas</th><th>Árbol más cercano</th><th class="num">Distancia</th><th>Veredicto</th><th></th></tr></thead><tbody>
      ${c.sitios.map((s, i) => `<tr><td>${esc(nombreSitio(s))}</td><td class="muted small mono">${coord([s.lat, s.lon])}</td><td>${esc(s.arbol.id)}${s.arbol.clase ? ` <span class="muted small">(riesgo ${s.arbol.clase})</span>` : ''}</td><td class="num">${s.distanciaM} m</td>
        <td><span class="pill ${VEREDICTO[s.veredicto].nivel}">${VEREDICTO[s.veredicto].texto}</span> <span class="muted small">${VEREDICTO[s.veredicto].frase}${s.enMax ? `; ${s.enMax} árbol(es) a menos de ${rMax} m` : ''}</span></td>
        <td><button class="btn sm danger" data-mapa="sitio-quitar" data-i="${i}" aria-label="Quitar ${esc(nombreSitio(s))}">Quitar</button></td></tr>`).join('')}</tbody></table></div>
      <p class="muted small">Cerca: a menos de ${rMin} m de algún árbol. Revisar: entre ${rMin} y ${rMax} m. Lejos: a ${rMax} m o más de todos. El radio es de Barrantes-Vásquez et al. (2018) para Trigona fulviventris; para otras especies es criterio propio.</p>`
      : '<p class="muted small">Aún no hay sitios. Pulsa «Marcar en el mapa» y toca el lugar donde pondrías un meliponario o un hotel de insectos.</p>'}
    <details data-keep="ar-censo" ${S.abiertos['ar-censo'] ? 'open' : ''}><summary>Árboles censados (${rs.n})</summary>
    <p class="muted small">${rs.n} árbol(es)${rs.conMedidas ? `, ${nf(rs.volumen)} m³ de copa en total: ${['alto', 'medio', 'bajo'].map((k) => `${claseTxt[k].toLowerCase()} ${rs.porClase[k].n}`).join(', ')}` : ''}. El riesgo de cada árbol es relativo al censo: tercio con más volumen de copa = alto, tercio del medio = medio, el resto = bajo (criterio propio, por validar). ${rs.conMedidas < 6 ? 'Con menos de 6 árboles medidos esa clasificación es muy gruesa: úsala con cuidado. ' : ''}El radio de exclusión se aplica a todos los árboles.</p>
    <div class="scroll"><table class="data"><thead><tr><th>ID</th><th>Coordenadas</th><th class="num">DAP (cm)</th><th class="num">Copa Ø (m)</th><th class="num">Alto copa (m)</th><th class="num">Volumen de copa (m³)</th><th>Riesgo</th><th></th></tr></thead><tbody>
      ${orden.map((a) => `<tr><td>${esc(a.id)}</td><td class="muted small">${a.lat.toFixed(5)}, ${a.lon.toFixed(5)}</td><td class="num">${a.dap ?? '—'}</td><td class="num">${a.d ?? '—'}</td><td class="num">${a.h ?? '—'}</td><td class="num">${a.vol != null ? nf(a.vol, 1) : '—'}</td>
        <td>${a.clase ? `<span class="pill ${claseTxt[a.clase]}">${a.clase}</span>` : '<span class="muted small">sin medidas</span>'}</td>
        <td><button class="btn sm danger" data-mapa="arbol-quitar" data-id="${esc(a.id)}" aria-label="Quitar el árbol ${esc(a.id)}">Quitar</button></td></tr>`).join('')}</tbody></table></div>
    <p class="muted small">Volumen de copa = 4/3 · π · (D/2)² · (H/2) (Osorio 2025, Ec. 3), con D el diámetro y H la altura de copa. Para agregar o corregir árboles y sitios, usa «Censo de árboles y sitios» bajo el mapa de la finca.</p></details>`;
}

// Cómo se calculó: lo técnico, plegado.
function calculo(R, cfg) {
  return `<details class="ar-calculo" data-keep="ar-calculo" ${S.abiertos['ar-calculo'] ? 'open' : ''}><summary>Cómo se calculó</summary>
    <div class="hero ar">
      <p class="muted small">Cada punta del radar es un factor de riesgo para las abejas, de 0 (centro) a 100 (borde). Confianza de los datos: ${Math.round(R.conf * 100)} %.</p>
      <div>${R.radar.length >= 3 ? radar(R.radar) : '<p class="muted small">Faltan datos para dibujar el radar.</p>'}</div>
    </div>
    <h4>Qué datos usó</h4>
    <div class="scroll"><table class="data"><thead><tr><th>Dato</th><th>Valor en tu finca</th><th>De dónde sale</th></tr></thead><tbody>
      ${R.datos.map((d) => `<tr><td>${esc(d.dato)}</td><td>${esc(d.valor)}</td><td class="muted">${esc(d.de)}</td></tr>`).join('')}
    </tbody></table></div>
    <h4>Por qué sale este riesgo</h4>
    <div class="scroll"><table class="data rubrica"><thead><tr><th>Variable</th><th>Valor</th><th class="num">Puntaje</th><th class="num">Peso</th><th class="num">Puntos que aporta</th></tr></thead><tbody>
      ${[...R.evidencia].sort((a, b) => b.puntos - a.puntos).map((v) => `<tr><td>${esc(v.nombre)}<div>${estado(v.estado, v.fuente, v.id ?? v.nombre)}</div></td><td>${esc(v.valor)}</td><td class="num">${pastillaPuntaje(v.puntaje, cfg)}</td><td class="num">${v.peso}</td><td class="num">${v.puntos}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="muted small">Es el mismo riesgo del módulo Polinizadores, ordenado como diagnóstico: el ApiRadar no agrega pesos nuevos. Puntos que aporta = peso × puntaje ÷ suma de pesos con dato; suman el riesgo. Pesos y cortes son criterio propio, por calibrar, salvo donde diga «Verificado».</p>
    ${R.faltan.length ? `<h4>Qué falta para afinar</h4><ul>${R.faltan.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    <h4>Cómo saber si funcionó</h4>
    <ul>${R.comprobar.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  </details>`;
}

export function panelApiRadar(f, cfg, X) {
  const abierto = S.problema && PROBLEMAS[S.problema];
  const lista = Object.values(PROBLEMAS);
  const masAr = mas('apiradar', 'el ApiRadar', masApiRadar(cfg), S.abiertos['mas-apiradar']);
  const titulo = `<div class="con-mas"><div><p class="label">ApiRadar · caso Zamorano</p><h2>Abejas nativas y Spathodea</h2></div>${masAr}</div>`;
  if (!abierto) {
    const sugerido = apiRadarAplica(f, cfg);
    const control = lista.length === 1 ? `<p><b>Problema:</b> ${esc(lista[0].nombre)}</p>`
      : `<div class="f minw-260"><label for="problema">Problema</label>
        <select id="problema" data-bind="problema" data-rerender><option value="">Elige un problema…</option>
          ${lista.map((p) => `<option value="${p.id}" ${S.problema === p.id ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}</select></div>`;
    return `<section class="panel ar-panel" id="apiradar">${titulo}
      <p>${lista.length === 1 ? '' : 'Elige el problema que quieres atender. '}Con los datos que ya cargaste, el ApiRadar te dice cuánto riesgo corren las abejas, dónde poner sus colonias y qué cambiar primero para bajarlo.</p>
      <div class="row">${control}<button class="btn primary" data-act="apiradar" data-p="${lista[0].id}">Generar ApiRadar</button></div>
      ${sugerido ? `<p class="muted small">Tu finca tiene una especie de riesgo para polinizadores (${esc(f.especies.filter((e) => e.riesgo).map((e) => e.nombre).join(', '))}): este problema aplica.</p>` : ''}
    </section>`;
  }
  if (S.arCargando) return `<section class="panel ar-panel" id="apiradar">${titulo}${analizando()}</section>`;
  const ubic = ubicacionActual();
  const R = apiRadar(f, cfg, X, S.problema, ubic, S.arExcluir);
  if (!R.aplica) return `<section class="panel ar-panel" id="apiradar">${titulo}<div class="notice"><span>${esc(R.motivo)}</span></div><div><button class="btn sm" data-act="apiradar-cerrar">Cerrar el ApiRadar</button></div></section>`;
  return `<section class="panel ar-panel abierto" id="apiradar">${titulo}
    ${resultado(R, cfg)}
    <h3>Tu ruta</h3>
    ${ruta(R)}
    <h3>Tu plan</h3>
    ${plan(R)}
    <h3>Dónde actuar</h3>
    ${seccionMapa(R, ubic, cfg)}
    <div class="ar-descargas">
      <div><h3>Llévalo al campo</h3><p class="muted small">Descarga una imagen con el mapa${ubic.contorno.length >= 3 || R.censo.arboles.length ? ' satelital (si hay conexión)' : ''}, las coordenadas y los pasos, o guárdalo en PDF. Lleva coordenadas de tu finca: compártelo con cuidado.</p></div>
      <div class="row"><button class="btn primary" data-act="apiradar-imagen">Descargar plan (imagen)</button><button class="btn" data-act="apiradar-imprimir">Imprimir o guardar PDF</button></div>
    </div>
    ${calculo(R, cfg)}
    <div><button class="btn sm" data-act="apiradar-cerrar">Cerrar el ApiRadar</button></div>
  </section>`;
}
