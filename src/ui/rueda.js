// Rueda del año: los 12 meses de la finca en anillos, de afuera hacia adentro: lluvia fuerte, floración que visitan los
// polinizadores, aplicaciones de plaguicidas, siembra o cosecha y, al centro, las coincidencias de riesgo del mes.
// Solo lee la evaluación (engine.js) y lo que respondió el usuario: no calcula nada nuevo ni cambia ningún puntaje.
// Cada mes se puede tocar (o elegir con teclado) para ver su detalle debajo; el mes actual va marcado.
// Teclado: la rueda es una sola parada de Tab y las flechas pasan de un mes a otro.
import { esc, M, MFULL } from '../core/utils.js';

const R_TXT = 194, GAP = 1.2;
const ANILLOS = [
  { id: 'lluvia', r0: 150, r1: 172, nombre: 'Lluvia fuerte' },
  { id: 'flor', r0: 126, r1: 148, nombre: 'Florecen plantas que visitan los polinizadores' },
  { id: 'aplic', r0: 102, r1: 124, nombre: 'Aplicas plaguicidas' },
  { id: 'ciclo', r0: 78, r1: 100, nombre: 'Siembra o cosecha' },
];
const COINC = { r0: 56, r1: 74 };

// Mes elegido por el usuario mientras la página siga abierta (al recargar vuelve al mes actual).
let elegido = null;

const rad = (g) => (g * Math.PI) / 180;
const pt = (r, g) => `${(r * Math.cos(rad(g))).toFixed(1)},${(r * Math.sin(rad(g))).toFixed(1)}`;
// Sector de anillo entre los ángulos a0 y a1 (grados; 0 = a la derecha, enero empieza arriba).
function sector(r0, r1, a0, a1) {
  return `M${pt(r1, a0)}A${r1},${r1} 0 0 1 ${pt(r1, a1)}L${pt(r0, a1)}A${r0},${r0} 0 0 0 ${pt(r0, a0)}Z`;
}
const angulos = (i) => [-90 + i * 30 + GAP, -90 + (i + 1) * 30 - GAP];

// Qué pasa en cada mes, a partir de la evaluación y de la finca. Lo usan el dibujo y el detalle.
export function mesesRueda(R, f) {
  const tiene = (lista, i) => (lista ?? []).includes(i);
  return Array.from({ length: 12 }, (_, i) => ({
    lluvia: tiene(f?.lluviaMeses, i),
    flor: tiene(R.atraeFlor, i),
    florRiesgo: tiene(R.riesgoFlor, i),
    aplic: tiene(R.aplic, i),
    siembra: tiene(R.siembraM, i),
    cosecha: tiene(R.cosechaM, i),
    coinc: R.mh?.[i] ?? [],
  }));
}

function hechos(d) {
  const h = [];
  if (d.lluvia) h.push(['lluvia', 'Lluvia fuerte']);
  if (d.flor) h.push(['flor', 'Florecen plantas que visitan los polinizadores']);
  if (d.florRiesgo) h.push(['flor-riesgo', 'Florece una especie de riesgo para las abejas']);
  if (d.aplic) h.push(['aplic', 'Aplicas plaguicidas que exponen a los polinizadores']);
  if (d.siembra) h.push(['siembra', 'Siembra']);
  if (d.cosecha) h.push(['cosecha', 'Cosecha']);
  return h;
}

const nombreMes = (i) => MFULL[i][0].toUpperCase() + MFULL[i].slice(1);

function etiquetaMes(d, i, mesActual) {
  const partes = hechos(d).map(([, t]) => t.toLowerCase());
  const c = d.coinc.length;
  return `${nombreMes(i)}${i === mesActual ? ', este mes' : ''}: ${partes.length ? partes.join(', ') : 'sin actividad registrada'}; `
    + `${c ? `${c} ${c === 1 ? 'coincidencia' : 'coincidencias'} de riesgo` : 'sin coincidencias de riesgo'}.`;
}

function dibujoMes(d, i, mesActual, sel) {
  const [a0, a1] = angulos(i);
  const on = { lluvia: d.lluvia, flor: d.flor, aplic: d.aplic, ciclo: d.siembra || d.cosecha };
  const anillos = ANILLOS.map((a) => {
    let cls = on[a.id] ? `r-on r-${a.id}` : 'r-off';
    if (a.id === 'ciclo' && on.ciclo) cls += d.cosecha ? ' r-cosecha' : ' r-siembra';
    if (a.id === 'flor' && d.florRiesgo) cls += ' r-flor-riesgo';
    return `<path class="${cls}" d="${sector(a.r0, a.r1, a0, a1)}"/>`;
  }).join('');
  const c = d.coinc.length;
  const nucleo = `<path class="r-coinc c${Math.min(c, 2)}" d="${sector(COINC.r0, COINC.r1, a0, a1)}"/>`;
  const am = -90 + i * 30 + 15;
  const [tx, ty] = pt(R_TXT, am).split(',');
  const [cx, cy] = pt((COINC.r0 + COINC.r1) / 2, am).split(',');
  // El mes actual lleva su nombre sobre una pastilla de tinta: se ve de lejos y no depende solo del color.
  const marca = i === mesActual ? `<rect class="r-hoy" x="${(+tx - 23).toFixed(1)}" y="${(+ty - 12).toFixed(1)}" width="46" height="24" rx="12"/>` : '';
  return `<g class="r-mes m${i}${i === mesActual ? ' actual' : ''}" data-mes="${i}" tabindex="${i === sel ? 0 : -1}" role="button" aria-pressed="${i === sel}" aria-label="${esc(etiquetaMes(d, i, mesActual))}">`
    + `<path class="r-toque" d="${sector(COINC.r0, 176, a0 - GAP, a1 + GAP)}"/>${anillos}${nucleo}`
    + (c ? `<text class="r-cuenta" x="${cx}" y="${cy}" dy=".35em" text-anchor="middle">${c}</text>` : '')
    + `${marca}<text class="r-txt" x="${tx}" y="${ty}" dy=".35em" text-anchor="middle">${M[i]}</text></g>`;
}

// Centro: el índice global. Sin datos suficientes muestra una raya, no un número que parezca resultado.
function centro(ind) {
  if (!ind || ind.sinDatos) return `<g class="r-centro nivel-sin" aria-hidden="true"><circle r="50"/><text class="r-num" dy=".32em" text-anchor="middle">—</text></g>`;
  return `<g class="r-centro nivel-${ind.nivel}" aria-hidden="true"><circle r="50"/>`
    + `<text class="r-num" y="-4" dy=".32em" text-anchor="middle" data-contar="${ind.v}">${ind.v}</text>`
    + `<text class="r-de" y="24" text-anchor="middle">de 100</text></g>`;
}

function detalle(d, i, mesActual, sel) {
  const h = hechos(d);
  const items = h.map(([cls, t]) => `<li><i class="sw ${cls}" aria-hidden="true"></i>${t}</li>`)
    .concat(d.coinc.map((c) => `<li class="r-alerta"><i class="sw coinc" aria-hidden="true"></i><b>${esc(c)}</b></li>`));
  return `<div class="r-det" data-detalle="${i}"${i === sel ? '' : ' hidden'}>`
    + `<p class="r-det-mes">${nombreMes(i)}${i === mesActual ? ' <span>· este mes</span>' : ''}</p>`
    + (items.length ? `<ul>${items.join('')}</ul>` : '<p class="muted small">Sin actividad registrada con lo que respondiste.</p>')
    + '</div>';
}

const LEYENDA = [['lluvia', 'Lluvia fuerte'], ['flor', 'Floración visitada'], ['aplic', 'Plaguicidas'], ['siembra', 'Siembra'], ['cosecha', 'Cosecha'], ['coinc', 'Riesgo']];

// ind: { v, nivel, sinDatos } del índice global.
export function ruedaAnio(R, f, mesActual, ind) {
  const meses = mesesRueda(R, f);
  const sel = elegido ?? mesActual;
  return `<div class="rueda">`
    + `<svg class="rueda-svg" viewBox="-212 -212 424 424" role="group" aria-label="Rueda del año de tu finca: elige un mes para ver qué pasa en él">`
    + meses.map((d, i) => dibujoMes(d, i, mesActual, sel)).join('') + centro(ind) + '</svg>'
    + `<div class="rueda-detalle" aria-live="polite">${meses.map((d, i) => detalle(d, i, mesActual, sel)).join('')}</div>`
    + `<ul class="rueda-leyenda" aria-hidden="true">${LEYENDA.map(([c, t]) => `<li><i class="sw ${c}"></i>${t}</li>`).join('')}</ul>`
    + '</div>';
}

// Toque, clic o teclado sobre un mes: muestra su detalle. Se llama después de cada dibujo (app.js).
export function montarRueda(raiz) {
  for (const r of raiz?.querySelectorAll?.('.rueda') ?? []) {
    if (r.dataset.listo) continue;
    r.dataset.listo = '1';
    const elegir = (g) => {
      if (!g) return;
      elegido = Number(g.dataset.mes);
      for (const x of r.querySelectorAll('[data-mes]')) { x.setAttribute('aria-pressed', String(x === g)); x.tabIndex = x === g ? 0 : -1; }
      for (const x of r.querySelectorAll('[data-detalle]')) x.hidden = x.dataset.detalle !== g.dataset.mes;
    };
    r.addEventListener('click', (ev) => elegir(ev.target.closest?.('[data-mes]')));
    r.addEventListener('keydown', (ev) => {
      const g = ev.target.closest?.('[data-mes]');
      if (!g) return;
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); elegir(g); return; }
      const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[ev.key];
      if (!paso) return;
      ev.preventDefault();
      const sig = r.querySelector(`[data-mes="${(Number(g.dataset.mes) + paso + 12) % 12}"]`);
      sig?.focus(); elegir(sig);
    });
  }
}
