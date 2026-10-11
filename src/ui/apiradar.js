// Panel ApiRadar del dashboard: resolver un problema con los datos que el usuario ya cargó.
// El usuario elige el problema; la app cruza sus datos y muestra qué usó, por qué sale ese riesgo y qué hacer.
import { esc } from '../core/utils.js';
import { S } from '../core/state.js';
import { ESTADOS } from '../core/rubrica.js';
import { apiRadar, PROBLEMAS } from '../apiradar/diagnostico.js';
import { radar } from './charts.js';
import { pastillaPuntaje } from './components.js';
import { ubicacionActual } from './mapa.js';
import { mapaRiesgo, leyendaRiesgo } from './mapariesgo.js';
import { VEREDICTO, nombreSitio } from '../apiradar/censo.js';

const estado = (e, fuente) => `<span class="estado ${e.replace(' ', '-')}" ${fuente ? `title="${esc(fuente)}"` : ''}>${ESTADOS[e]}${fuente ? ' ⓘ' : ''}</span>`;
const delta = (a) => (a.delta == null ? '<span class="muted small">no se cuantifica</span>'
  : `<span class="delta ${a.delta < 0 ? 'down' : a.delta > 0 ? 'up' : 'zero'}">${a.delta > 0 ? '+' : ''}${a.delta}</span> <span class="muted small">(${a.de} → ${a.a})</span>`);

const nf = (x, d = 0) => x.toLocaleString('es-HN', { maximumFractionDigits: d });
const claseTxt = { alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };

// Sección «Dónde»: censo de árboles con su riesgo, mapa con radios y veredicto de cada sitio candidato.
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
    <p class="muted small">${rs.n} árbol(es) censado(s)${rs.conMedidas ? `, ${nf(rs.volumen)} m³ de copa en total: ${['alto', 'medio', 'bajo'].map((k) => `${claseTxt[k].toLowerCase()} ${rs.porClase[k].n}`).join(', ')}` : ''}. El riesgo de cada árbol es relativo al censo: tercio con más volumen de copa = alto, tercio del medio = medio, el resto = bajo (criterio propio, por validar). ${rs.conMedidas < 6 ? 'Con menos de 6 árboles medidos esa clasificación es muy gruesa: úsala con cuidado. ' : ''}El radio de exclusión se aplica a todos los árboles.</p>
    <div class="mapa-riesgo-caja">${mapaRiesgo(c, ubic.contorno, [rMin, rMax], mejor ? { punto: mejor.punto, distanciaM: mejor.distanciaM } : null)}</div>
    ${leyendaRiesgo([rMin, rMax])}
    ${ubic.contorno.length >= 3 ? '' : '<p class="muted small">Dibuja el contorno de la finca en el mapa para ver qué parte queda fuera del radio.</p>'}
    <h4>Sitios candidatos</h4>
    ${c.sitios.length ? `<div class="scroll"><table class="data"><thead><tr><th>Sitio</th><th>Árbol más cercano</th><th class="num">Distancia</th><th>Veredicto</th><th></th></tr></thead><tbody>
      ${c.sitios.map((s, i) => `<tr><td>${esc(nombreSitio(s))}</td><td>${esc(s.arbol.id)}${s.arbol.clase ? ` <span class="muted small">(riesgo ${s.arbol.clase})</span>` : ''}</td><td class="num">${s.distanciaM} m</td>
        <td><span class="pill ${VEREDICTO[s.veredicto].nivel}">${VEREDICTO[s.veredicto].texto}</span> <span class="muted small">${VEREDICTO[s.veredicto].frase}${s.enMax ? `; ${s.enMax} árbol(es) a menos de ${rMax} m` : ''}</span></td>
        <td><button class="btn sm danger" data-mapa="sitio-quitar" data-i="${i}" aria-label="Quitar ${esc(nombreSitio(s))}">Quitar</button></td></tr>`).join('')}</tbody></table></div>
      <p class="muted small">Cerca: a menos de ${rMin} m de algún árbol. Revisar: entre ${rMin} y ${rMax} m. Lejos: a ${rMax} m o más de todos. El radio es de Barrantes-Vásquez et al. (2018) para Trigona fulviventris; para otras especies es criterio propio.</p>`
      : '<p class="muted small">Aún no hay sitios. En el mapa de la finca, agrega un sitio con sus coordenadas o márcalo sobre el mapa.</p>'}
    <h4>Árboles censados</h4>
    <div class="scroll"><table class="data"><thead><tr><th>ID</th><th>Coordenadas</th><th class="num">DAP (cm)</th><th class="num">Copa Ø (m)</th><th class="num">Alto copa (m)</th><th class="num">Volumen de copa (m³)</th><th>Riesgo</th><th></th></tr></thead><tbody>
      ${orden.map((a) => `<tr><td>${esc(a.id)}</td><td class="muted small">${a.lat.toFixed(5)}, ${a.lon.toFixed(5)}</td><td class="num">${a.dap ?? '—'}</td><td class="num">${a.d ?? '—'}</td><td class="num">${a.h ?? '—'}</td><td class="num">${a.vol != null ? nf(a.vol, 1) : '—'}</td>
        <td>${a.clase ? `<span class="pill ${claseTxt[a.clase]}">${a.clase}</span>` : '<span class="muted small">sin medidas</span>'}</td>
        <td><button class="btn sm danger" data-mapa="arbol-quitar" data-id="${esc(a.id)}" aria-label="Quitar el árbol ${esc(a.id)}">Quitar</button></td></tr>`).join('')}</tbody></table></div>
    <p class="muted small">Volumen de copa = 4/3 · π · (D/2)² · (H/2) (Osorio 2025, Ec. 3), con D el diámetro y H la altura de copa. Las coordenadas se guardan solo en este navegador. Para agregar o corregir árboles y sitios, usa «Censo de árboles y sitios» bajo el mapa de la finca.</p>`;
}

export function panelApiRadar(f, cfg, X) {
  const abierto = S.problema && PROBLEMAS[S.problema];
  const ubic = ubicacionActual();
  const R = apiRadar(f, cfg, X, abierto ? S.problema : 'spathodea', ubic);
  const sugerido = R.aplica;
  const cabecera = `<div class="row between"><div><h2>Resolver un problema</h2>
    <p class="muted">Elige el problema que quieres atender. La app cruza los datos que ya cargaste y te da el ApiRadar: nivel de riesgo, por qué, qué hacer y qué falta.</p></div></div>
    <div class="row"><div class="f minw-260"><label for="problema">Problema</label>
      <select id="problema" data-bind="problema" data-rerender><option value="">Elige un problema…</option>
        ${Object.values(PROBLEMAS).map((p) => `<option value="${p.id}" ${S.problema === p.id ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}</select></div>
      ${abierto ? '' : `<button class="btn primary" data-act="apiradar" data-p="spathodea">Generar ApiRadar</button>`}</div>
    ${!abierto && sugerido ? `<p class="muted small">Tu finca tiene una especie de riesgo para polinizadores (${esc(f.especies.filter((e) => e.riesgo).map((e) => e.nombre).join(', '))}): este problema aplica.</p>` : ''}`;
  if (!abierto) return `<section class="panel" id="apiradar">${cabecera}</section>`;
  if (!R.aplica) return `<section class="panel" id="apiradar">${cabecera}<div class="notice"><span>${esc(R.motivo)}</span></div></section>`;
  const nivelC = R.nivel === 'Alto' ? 'crit' : R.nivel === 'Medio' ? 'warn' : 'good';
  return `<section class="panel" id="apiradar">${cabecera}
    <div class="hero ar">
      <div class="stack gap-8">
        <p class="label">ApiRadar · ${esc(R.problema.nombre)}</p>
        <h3 class="txt-${nivelC}">Riesgo ${R.nivel.toLowerCase()} para las abejas: ${R.score} de 100</h3>
        <p>${esc(R.resumen)}</p>
        <p class="muted small">Confianza de los datos: ${Math.round(R.conf * 100)} %. Es el riesgo del módulo Polinizadores; el ApiRadar solo lo ordena como diagnóstico y no agrega pesos nuevos.</p>
      </div>
      <div>${R.radar.length >= 3 ? radar(R.radar) : '<p class="muted small">Faltan datos para dibujar el radar.</p>'}</div>
    </div>
    <h3>1. Qué datos usó</h3>
    <div class="scroll"><table class="data"><thead><tr><th>Dato</th><th>Valor en tu finca</th><th>De dónde sale</th></tr></thead><tbody>
      ${R.datos.map((d) => `<tr><td>${esc(d.dato)}</td><td>${esc(d.valor)}</td><td class="muted">${esc(d.de)}</td></tr>`).join('')}
    </tbody></table></div>
    <h3>2. Por qué sale este riesgo</h3>
    <div class="scroll"><table class="data rubrica"><thead><tr><th>Variable</th><th>Valor</th><th class="num">Puntaje</th><th class="num">Peso</th><th class="num">Puntos que aporta</th></tr></thead><tbody>
      ${[...R.evidencia].sort((a, b) => b.puntos - a.puntos).map((v) => `<tr><td>${esc(v.nombre)}<div>${estado(v.estado, v.fuente)}</div></td><td>${esc(v.valor)}</td><td class="num">${pastillaPuntaje(v.puntaje, cfg)}</td><td class="num">${v.peso}</td><td class="num">${v.puntos}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="muted small">Puntos que aporta = peso × puntaje ÷ suma de pesos con dato; suman el riesgo. Pasa el cursor sobre ⓘ para ver la fuente. Pesos y cortes son criterio propio, por calibrar, salvo donde diga «Verificado».</p>
    <h3>3. Dónde están los árboles de riesgo</h3>
    ${seccionMapa(R, ubic, cfg)}
    <h3>4. Qué hacer</h3>
    <p class="muted small">Los cambios se aplican en este orden y se recalcula tu finca después de cada uno: lo que baja es acumulado, y el orden importa.</p>
    <ol class="plan apiradar-acciones">${R.acciones.map((a) => `<li>
      <div class="row between"><b>${esc(a.titulo)}</b><span>${delta(a)}</span></div>
      <p class="small"><span class="tag">Cuándo: ${esc(a.cuando)}</span> ${esc(a.detalle)}</p>
      <div class="small">${estado(a.estado)}${a.nota ? ` <span class="muted">${esc(a.nota)}</span>` : ''}</div></li>`).join('')}</ol>
    <p>Con los cambios medibles, el riesgo bajaría de <b>${R.total.de}</b> a <b>${R.total.a}</b> (<span class="delta ${R.total.delta < 0 ? 'down' : 'zero'}">${R.total.delta > 0 ? '+' : ''}${R.total.delta}</span>). No es una predicción: es lo que da la rúbrica con tus datos, por validar.</p>
    ${R.faltan.length ? `<h3>5. Qué falta para afinar</h3><ul>${R.faltan.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    <h3>${R.faltan.length ? '6' : '5'}. Cómo saber si funcionó</h3>
    <ul>${R.comprobar.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <div><button class="btn sm" data-act="apiradar-cerrar">Cerrar el ApiRadar</button></div>
  </section>`;
}
