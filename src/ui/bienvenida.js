// Vista: Bienvenida de primera vez. Presenta la app, pregunta cómo la conoció y para qué la usará,
// y lleva al cuestionario de la finca (que se puede saltar). Flujo inspirado en la referencia de Figma que eligió Diego.
import { esc } from '../core/utils.js';
import { S } from '../core/state.js';
import { STEPS } from './wizard.js';
import { esfera } from './apiradar.js';
import { FUENTES_BV, USOS_BV } from '../core/bienvenida.js';

export const PASOS_BV = ['inicio', 'que-hace', 'fuente', 'uso', 'finca'];

const ic = (id) => `<span class="bv-ic" aria-hidden="true"><svg class="ic"><use href="#${id}"/></svg></span>`;

const QUE_HACE = [
  ['i-dash', 'Riesgo por tema', 'Agua, suelo, fertilización, polinizadores y cadenas tróficas, cada uno de 0 a 100 y con lo que más lo sube.'],
  ['i-calendario', 'Meses que se cruzan', 'Te avisa cuando dos cosas que juntas dañan el ambiente pasan el mismo mes, como aplicar insecticida en plena floración.'],
  ['i-lista', 'Qué hacer primero', 'Un plan de acción ordenado por lo que más baja el riesgo, y el ApiRadar para proteger a las abejas.'],
  ['i-escudo', 'Alineado a GLOBALG.A.P.', 'Cada riesgo se relaciona con las secciones de IFA v6 que toca. No reemplaza la auditoría.'],
];

function puntos(p) {
  return `<div class="bv-puntos" aria-hidden="true">${PASOS_BV.map((_, i) => `<span class="${i === p ? 'on' : i < p ? 'hecho' : ''}"></span>`).join('')}</div>`;
}

function cuerpo(p, bv) {
  if (p === 0) return `<div class="bv-hero">${esfera()}<span class="logo bv-logo" aria-hidden="true"><svg class="ic"><use href="#i-hoja"/></svg></span></div>
    <p class="label">Bienvenido a</p><h1 id="bv-titulo">Trofaxis</h1>
    <p class="bv-sub">El riesgo ambiental de tu finca, claro y a tiempo.</p>
    <p class="muted">Respondes unas preguntas sobre tu finca y Trofaxis te muestra qué tan expuesta está, en qué meses se juntan los problemas y qué hacer primero.</p>`;
  if (p === 1) return `<p class="label">Qué vas a ver</p><h1 id="bv-titulo">Todo tu riesgo en un solo tablero</h1>
    <ul class="bv-lista">${QUE_HACE.map(([i, t, d]) => `<li>${ic(i)}<div><b>${t}</b><p class="muted small">${d}</p></div></li>`).join('')}</ul>`;
  if (p === 2) return `<p class="label">Una pregunta rápida</p><h1 id="bv-titulo">¿Cómo conociste Trofaxis?</h1>
    <div class="bv-opciones" role="group" aria-labelledby="bv-titulo">${FUENTES_BV.map(([id, t]) => `<button type="button" data-act="bv-fuente" data-id="${id}" aria-pressed="${bv.fuente === id}">${esc(t)}</button>`).join('')}</div>`;
  if (p === 3) return `<p class="label">Elige las que quieras</p><h1 id="bv-titulo">¿Para qué usarás Trofaxis?</h1>
    <div class="bv-opciones" role="group" aria-labelledby="bv-titulo">${USOS_BV.map(([id, t, d]) => `<button type="button" data-act="bv-uso" data-id="${id}" aria-pressed="${bv.usos.includes(id)}"><span>${esc(t)}</span><span class="muted small block fw-400">${esc(d)}</span></button>`).join('')}</div>`;
  const abejas = bv.usos.includes('abejas');
  const gg = bv.usos.includes('certificacion');
  return `<p class="label">Último paso</p><h1 id="bv-titulo">Ahora, tu finca</h1>
    <p class="muted">El cuestionario tiene ${STEPS.length} partes: ${STEPS.map((s) => s.toLowerCase()).join(', ')}. Puedes dejarlo a medias y volver cuando quieras.</p>
    ${abejas || gg ? `<p class="bv-nota">${abejas ? 'En la parte de especies anota los árboles de riesgo, como Spathodea, para que el ApiRadar te diga dónde actuar.' : 'En la parte de certificación anota tus Minor Musts y no conformidades para ver tu margen en IFA v6.'}</p>` : ''}
    <p class="muted small">Si lo saltas, verás una finca de ejemplo para recorrer la app. Tus datos los llenas después en la pestaña Cuestionario.</p>`;
}

export function viewBienvenida() {
  const bv = S.bv, p = Math.max(0, Math.min(PASOS_BV.length - 1, bv.paso)), ultimo = p === PASOS_BV.length - 1;
  const principal = ultimo ? '<button class="btn primary bv-btn" data-act="bv-cuestionario">Llenar el cuestionario</button>'
    : `<button class="btn primary bv-btn" data-act="bv-siguiente">${p === 0 ? 'Empezar' : 'Siguiente'}</button>`;
  const secundario = ultimo ? '<button class="btn bv-btn bv-fantasma" data-act="bv-saltar-cuestionario">Saltar por ahora y ver el ejemplo</button>' : '';
  return `<section class="bv" aria-labelledby="bv-titulo">
    <div class="bv-arriba">${p > 0 ? '<button class="btn sm bv-fantasma" data-act="bv-atras">Atrás</button>' : '<span></span>'}
      <span class="muted small">${p + 1} de ${PASOS_BV.length}</span>
      ${ultimo ? '<span></span>' : '<button class="btn sm bv-fantasma" data-act="bv-saltar">Saltar</button>'}</div>
    <div class="bv-paso" data-paso="${PASOS_BV[p]}">${cuerpo(p, bv)}</div>
    <div class="bv-abajo">${puntos(p)}${principal}${secundario}
      <p class="muted small t-centro">Esta bienvenida sale solo la primera vez. Tus respuestas se envían sin tu nombre ni ubicación, solo para mejorar Trofaxis.</p></div>
  </section>`;
}
