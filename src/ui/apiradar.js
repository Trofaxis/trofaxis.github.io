// Panel ApiRadar del dashboard: resolver un problema con los datos que el usuario ya cargó.
// El usuario elige el problema; la app cruza sus datos y muestra qué usó, por qué sale ese riesgo y qué hacer.
import { esc } from '../core/utils.js';
import { S } from '../core/state.js';
import { ESTADOS } from '../core/rubrica.js';
import { apiRadar, PROBLEMAS } from '../apiradar/diagnostico.js';
import { radar } from './charts.js';

const pill = (p) => (p == null ? '<span class="muted">sin dato</span>' : `<span class="pill ${p >= 67 ? 'Alto' : p >= 34 ? 'Medio' : 'Bajo'}">${p}</span>`);
const estado = (e, fuente) => `<span class="estado ${e.replace(' ', '-')}" ${fuente ? `title="${esc(fuente)}"` : ''}>${ESTADOS[e]}${fuente ? ' ⓘ' : ''}</span>`;
const delta = (a) => (a.delta == null ? '<span class="muted small">no se cuantifica</span>'
  : `<span class="delta ${a.delta < 0 ? 'down' : a.delta > 0 ? 'up' : 'zero'}">${a.delta > 0 ? '+' : ''}${a.delta}</span> <span class="muted small">(${a.de} → ${a.a})</span>`);

export function panelApiRadar(f, cfg, X) {
  const abierto = S.problema && PROBLEMAS[S.problema];
  const R = apiRadar(f, cfg, X, abierto ? S.problema : 'spathodea');
  const sugerido = R.aplica;
  const cabecera = `<div class="row between"><div><h2>Resolver un problema</h2>
    <p class="muted">Elige el problema que quieres atender. La app cruza los datos que ya cargaste y te da el ApiRadar: nivel de riesgo, por qué, qué hacer y qué falta.</p></div></div>
    <div class="row"><div class="f" style="min-width:260px"><label for="problema">Problema</label>
      <select id="problema" data-bind="problema" data-rerender><option value="">Elige un problema…</option>
        ${Object.values(PROBLEMAS).map((p) => `<option value="${p.id}" ${S.problema === p.id ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('')}</select></div>
      ${abierto ? '' : `<button class="btn primary" data-act="apiradar" data-p="spathodea">Generar ApiRadar</button>`}</div>
    ${!abierto && sugerido ? `<p class="muted small">Tu finca tiene una especie de riesgo para polinizadores (${esc(f.especies.filter((e) => e.riesgo).map((e) => e.nombre).join(', '))}): este problema aplica.</p>` : ''}`;
  if (!abierto) return `<section class="panel" id="apiradar">${cabecera}</section>`;
  if (!R.aplica) return `<section class="panel" id="apiradar">${cabecera}<div class="notice"><span>${esc(R.motivo)}</span></div></section>`;
  const nivelC = R.nivel === 'Alto' ? 'crit' : R.nivel === 'Medio' ? 'warn' : 'good';
  return `<section class="panel" id="apiradar">${cabecera}
    <div class="hero ar">
      <div style="display:flex;flex-direction:column;gap:8px">
        <p class="label">ApiRadar · ${esc(R.problema.nombre)}</p>
        <h3 style="color:var(--${nivelC})">Riesgo ${R.nivel.toLowerCase()} para las abejas: ${R.score} de 100</h3>
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
      ${[...R.evidencia].sort((a, b) => b.puntos - a.puntos).map((v) => `<tr><td>${esc(v.nombre)}<div>${estado(v.estado, v.fuente)}</div></td><td>${esc(v.valor)}</td><td class="num">${pill(v.puntaje)}</td><td class="num">${v.peso}</td><td class="num">${v.puntos}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="muted small">Puntos que aporta = peso × puntaje ÷ suma de pesos con dato; suman el riesgo. Pasa el cursor sobre ⓘ para ver la fuente. Pesos y cortes son criterio propio, por calibrar, salvo donde diga «Verificado».</p>
    <h3>3. Qué hacer</h3>
    <p class="muted small">Los cambios se aplican en este orden y se recalcula tu finca después de cada uno: lo que baja es acumulado, y el orden importa.</p>
    <ol class="plan apiradar-acciones">${R.acciones.map((a) => `<li style="flex-direction:column;align-items:stretch;gap:6px">
      <div class="row between"><b>${esc(a.titulo)}</b><span>${delta(a)}</span></div>
      <p class="small"><span class="tag">Cuándo: ${esc(a.cuando)}</span> ${esc(a.detalle)}</p>
      <div class="small">${estado(a.estado)}${a.nota ? ` <span class="muted">${esc(a.nota)}</span>` : ''}</div></li>`).join('')}</ol>
    <p>Con los cambios medibles, el riesgo bajaría de <b>${R.total.de}</b> a <b>${R.total.a}</b> (<span class="delta ${R.total.delta < 0 ? 'down' : 'zero'}">${R.total.delta > 0 ? '+' : ''}${R.total.delta}</span>). No es una predicción: es lo que da la rúbrica con tus datos, por validar.</p>
    ${R.faltan.length ? `<h3>4. Qué falta para afinar</h3><ul>${R.faltan.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    <h3>${R.faltan.length ? '5' : '4'}. Cómo saber si funcionó</h3>
    <ul>${R.comprobar.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <div><button class="btn sm" data-act="apiradar-cerrar">Cerrar el ApiRadar</button></div>
  </section>`;
}
