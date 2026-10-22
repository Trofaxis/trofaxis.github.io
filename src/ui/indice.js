// Escala del índice global (Inicio): el puntaje sobre una regla de 0 a 100 partida en los tres niveles de riesgo.
// Cada tramo se puede tocar para ver qué tan lejos está la finca de él. Los cortes salen de la configuración
// (cfg.niveles, que el usuario puede mover en Ajustes): aquí no se calcula ningún riesgo, solo distancias.

const NOMBRE = { Bajo: 'riesgo bajo', Medio: 'riesgo medio', Alto: 'riesgo alto' };

// Tramos [desde, hasta] de cada nivel, con los cortes de cfg.niveles.
export function tramosIndice(cfg) {
  const { medio, alto } = cfg.niveles;
  return [['Bajo', 0, medio - 1], ['Medio', medio, alto - 1], ['Alto', alto, 100]];
}

const puntos = (n) => `${n} ${n === 1 ? 'punto' : 'puntos'}`;

// Qué decir al tocar un tramo, según dónde está la finca (v, de 0 a 100).
export function notaTramo(v, [t, desde, hasta], tramos) {
  if (v >= desde && v <= hasta) {
    const abajo = tramos[tramos.findIndex((x) => x[0] === t) - 1];
    return `<b>Estás aquí:</b> ${v} de 100, ${NOMBRE[t]}.`
      + (abajo ? ` Para bajar a ${NOMBRE[abajo[0]]} te faltan <b>${puntos(v - abajo[2])}</b>.` : ' Sigue con lo que haces.');
  }
  if (hasta < v) return `<b>${NOMBRE[t][0].toUpperCase() + NOMBRE[t].slice(1)}:</b> de ${desde} a ${hasta}. Para llegar te faltan <b>${puntos(v - hasta)}</b> menos.`;
  return `<b>${NOMBRE[t][0].toUpperCase() + NOMBRE[t].slice(1)}:</b> de ${desde} a ${hasta}. Estás <b>${puntos(desde - v)}</b> por debajo.`;
}

// v: índice global; lv: su nivel; accion: frase corta del nivel («Atiéndelo primero»).
export function escalaIndice(v, lv, accion, cfg) {
  const tramos = tramosIndice(cfg);
  return `<div class="indice">`
    + `<p class="indice-num"><b data-contar="${v}">${v}</b><span>de 100</span><em>${accion}</em></p>`
    + `<div class="indice-escala">`
    + `<div class="indice-regla" aria-hidden="true">${tramos.map(([t, d, h]) => `<i class="tr-${t}" style="width:${((h - d + 1) / 101 * 100).toFixed(2)}%"></i>`).join('')}`
    + `<span class="indice-marca nivel-${lv}" style="width:${((v + 0.5) / 101 * 100).toFixed(2)}%"></span></div>`
    + `<div class="indice-tramos" role="group" aria-label="Niveles del índice: toca uno para ver qué tan lejos estás">`
    + tramos.map(([t, d, h]) => `<button type="button" class="tramo tr-${t}" data-tramo="${t}" aria-pressed="${t === lv}" style="width:${((h - d + 1) / 101 * 100).toFixed(2)}%">${t}<small>${d}–${h}</small></button>`).join('')
    + `</div></div>`
    + `<div class="indice-notas" aria-live="polite">${tramos.map((tr) => `<p data-nota="${tr[0]}"${tr[0] === lv ? '' : ' hidden'}>${notaTramo(v, tr, tramos)}</p>`).join('')}`
    + `<a class="indice-ir" href="#urgentes">Ver qué hacer primero</a></div>`
    + `</div>`;
}

// Toque o clic en un tramo: muestra su nota. Se llama después de cada dibujo (app.js).
export function montarIndice(raiz) {
  for (const el of raiz?.querySelectorAll?.('.indice') ?? []) {
    if (el.dataset.listo) continue;
    el.dataset.listo = '1';
    el.addEventListener('click', (ev) => {
      const b = ev.target.closest?.('[data-tramo]');
      if (!b) return;
      for (const x of el.querySelectorAll('[data-tramo]')) x.setAttribute('aria-pressed', String(x === b));
      for (const x of el.querySelectorAll('[data-nota]')) x.hidden = x.dataset.nota !== b.dataset.tramo;
    });
  }
}
