// Si una vista lanza una excepción al dibujarse, la pantalla no debe quedar vacía ni congelada en la pestaña anterior
// sin decir nada: se muestra qué pestaña falló y el mensaje técnico, para poder reportarlo.
import { esc } from '../core/utils.js';

export function htmlErrorVista(nombre, error) {
  const detalle = String(error?.stack || error?.message || error || 'sin detalle').split('\n').slice(0, 4).join('\n');
  return `<section class="panel" role="alert"><h1>No se pudo dibujar «${esc(nombre)}»</h1>
    <p class="muted">Tus datos siguen guardados. Recarga la página; si se repite, copia el texto de abajo y envíalo a quien mantiene la app.</p>
    <pre class="muted">${esc(detalle)}</pre></section>`;
}
