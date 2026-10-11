// Vista: Ajustes. Personaliza qué módulos se evalúan y los umbrales de nivel.
import { esc } from '../core/utils.js';
import { S } from '../core/state.js';
import { MODULOS } from '../modules/index.js';

export function viewSettings() {
  const a = S.ajustes;
  const { alto, medio } = a.niveles;
  const invalido = !(medio < alto && alto <= 100);
  return `<section class="panel">
    <div><h2>Ajustes</h2><p class="muted">Elige qué temas evalúa la app y cómo se clasifica el riesgo. Los ajustes se guardan con la finca al exportarla.</p></div>
    <div class="f"><span class="label">Módulos de riesgo</span>
      <div class="list">${MODULOS.map((m) => `<label class="item" style="cursor:pointer">
        <input type="checkbox" style="width:auto" data-act="toggle-mod" data-id="${m.id}" ${a.modulosActivos.includes(m.id) ? 'checked' : ''}>
        <span class="grow"><b>${esc(m.nombre)}</b> <span class="muted">· IFA v6: ${esc(m.ifa)}</span></span></label>`).join('')}
      </div>
      <span class="hint">Desactiva los temas que no aplican a tu finca. Con menos módulos, el dashboard se enfoca en lo que importa.</span>
    </div>
    <div class="fields">
      <div class="f"><label for="s-alto">Riesgo alto desde</label><input id="s-alto" type="number" min="1" max="100" data-bind="ajustes.niveles.alto" data-rerender value="${alto}"><span class="hint">Índice 0-100</span></div>
      <div class="f"><label for="s-medio">Riesgo medio desde</label><input id="s-medio" type="number" min="0" max="99" data-bind="ajustes.niveles.medio" data-rerender value="${medio}"><span class="hint">Debe ser menor que el umbral alto</span></div>
    </div>
    ${invalido ? '<p style="color:var(--crit)">El umbral medio debe ser menor que el alto, y el alto no puede pasar de 100. Mientras tanto se usan los valores por defecto.</p>' : ''}
    <div class="row"><button class="btn" data-act="reset-ajustes">Restablecer ajustes</button><button class="btn" data-act="load-demo">Cargar finca de ejemplo</button></div>
    <p class="muted" style="font-size:13px">Tus datos se guardan en este navegador. Solo salen de él si inicias sesión en la pestaña Casos y decides guardar tu finca en la nube o compartir un caso anónimo. Para pasarlos a otro equipo sin la nube, usa Exportar finca en el dashboard.</p>
  </section>`;
}
