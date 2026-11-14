// Mi finca › Lotes: el mapa satelital con los lotes dibujados, el clima de ahora y una tarjeta por lote (src/ui/mapa.js).
// El riesgo que se muestra es el índice de la finca, el mismo número de Inicio: Trofaxis todavía no calcula riesgo por lote.
import { S } from '../core/state.js';
import { evaluar, nivel } from '../core/engine.js';
import { configEfectiva, normalizarAjustes } from '../core/storage.js';
import { conPlan } from '../fert/calculo.js';
import { extraRiego } from './dashboard.js';
import { panelLotesMapa } from './mapa.js';

export function viewLotes() {
  const cfg = configEfectiva(normalizarAjustes(S.ajustes));
  const R = evaluar(conPlan(S.farm), cfg, extraRiego());
  const riesgo = R.sinDatos ? { texto: 'faltan datos para calificarlo' } : { texto: `${nivel(R.overall, cfg).toLowerCase()}, ${R.overall} de 100` };
  return `<section class="panel"><h2>Lotes de la finca</h2>
    <p class="muted">Dibuja cada lote sobre la imagen satelital. Toca un lote para ver su cultivo, lo que toca este mes y el clima de ahora en ese punto.</p>
    ${panelLotesMapa({ riesgo })}
  </section>`;
}
