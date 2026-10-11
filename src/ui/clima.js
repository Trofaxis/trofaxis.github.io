// Clima de la finca por ubicación (Issue #8, crítica 3): panel, descarga y llenado automático.
// Con la ubicación del mapa la app descarga el clima por mes y llena sola lo que el usuario dejó vacío:
// meses de lluvia fuerte, altitud, ETo de riego y clima del reservorio. Todo se puede corregir a mano.
import { esc, M, mlist } from '../core/utils.js';
import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { VARIABLES, CLAVES, climaVacio, tieneClima, mesesLluviosos, llenarRiego } from '../clima/normales.js';
import { obtenerClima } from '../clima/servicio.js';
import { cargarUbicacion } from '../mapa/ubicacion.js';

const C = CONFIG.clima;
const pedirRender = () => document.dispatchEvent(new Event('biogap:render'));
const fmt = (x, d = 1) => (x == null || !Number.isFinite(x) ? '—' : x.toLocaleString('es-HN', { maximumFractionDigits: d }));
const igual = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

// Llena lo vacío de la finca y de riego con el clima. Devuelve la lista de lo que se llenó.
export function aplicarClima(clima, { forzarRiego = false } = {}) {
  const f = S.farm;
  f.clima = clima;
  const llenos = [];
  const lluvia = mesesLluviosos(clima);
  if (!f.lluviaMeses.length && lluvia.length) { f.lluviaMeses = lluvia; llenos.push(`meses de lluvia fuerte (${mlist(lluvia)})`); }
  if (!f.altitud && clima.elevacion > 0) { f.altitud = clima.elevacion; llenos.push(`altitud (${clima.elevacion} m)`); }
  // El caso de ejemplo de riego es de otra finca: no se le mezcla el clima de esta ubicación.
  if (S.riego.fuente !== 'ejemplo' || forzarRiego) llenos.push(...llenarRiego(S.riego.datos, clima, { forzar: forzarRiego }));
  return llenos;
}

let pidiendo = 0;
// Descarga el clima del punto y lo aplica. Se llama al marcar la ubicación en el mapa o en el cuestionario.
export async function pedirClima(lat, lon, { forzar = false } = {}) {
  const n = ++pidiendo;
  S.climaUI = { estado: 'cargando', msg: 'Buscando el clima de tu ubicación…', llenos: [] };
  pedirRender();
  try {
    const r = await obtenerClima(lat, lon, { forzar });
    if (n !== pidiendo) return; // llegó otra ubicación mientras tanto
    const llenos = aplicarClima(r.clima);
    S.climaUI = { estado: 'ok', msg: r.aviso ?? (r.deCache ? 'Clima de tu ubicación (descarga guardada en este navegador).' : 'Clima de tu ubicación listo.'), llenos };
  } catch (e) {
    if (n !== pidiendo) return;
    S.climaUI = { estado: 'error', msg: `${e.message} Puedes escribir los valores a mano en "Clima de la finca" o volver a intentarlo.`, llenos: [] };
  }
  pedirRender();
}

// Un dato de clima escrito a mano queda marcado como tal (y la tabla lo muestra).
export function marcarManual(bind) {
  const m = /^farm\.clima\.meses\.(\d+)\.(\w+)$/.exec(bind);
  const c = S.farm.clima;
  if (!m || !c) return;
  const k = `${m[1]}.${m[2]}`;
  if (!c.manual.includes(k)) c.manual.push(k);
}

// Línea corta del estado de la descarga (cuestionario, riego y plaguicidas).
export function estadoClima() {
  const u = S.climaUI;
  if (!u.estado) return '';
  const cls = u.estado === 'error' ? 'warnmsg' : u.estado === 'ok' ? 'okmsg' : 'muted';
  return `<p class="${cls} small" role="status">${esc(u.msg)}${u.llenos.length ? ` Se llenó solo: ${esc(u.llenos.join('; '))}.` : ''}</p>`;
}

const fuenteTxt = (c) => (c.fuente === 'open-meteo'
  ? `Promedio ${c.periodo ? `${c.periodo[0]}-${c.periodo[1]}` : ''} de la celda del modelo (~11 km), descargado el ${c.obtenido}${c.elevacion != null ? ` · elevación de la celda: ${c.elevacion} m` : ''}.`
  : 'Escrito a mano.');

// Resumen de una línea, para mostrar el clima donde se usa.
export function resumenClima(c = S.farm.clima) {
  if (!tieneClima(c)) return '';
  const tm = c.meses.map((m) => m.tmed).filter((x) => x != null), ll = c.meses.map((m) => m.lluvia).filter((x) => x != null);
  const rango = (a) => (a.length ? `${fmt(Math.min(...a))}-${fmt(Math.max(...a))}` : '—');
  return `Temperatura media ${rango(tm)} °C · lluvia ${ll.length ? fmt(ll.reduce((s, x) => s + x, 0), 0) : '—'} mm al año · lluvia fuerte en ${mlist(mesesLluviosos(c))}`;
}

// Bloque de ubicación del cuestionario (paso Finca): escribir coordenadas o usar el GPS. Reusa los botones del mapa.
export function bloqueUbicacion() {
  const p = cargarUbicacion().punto;
  const c = S.farm.clima;
  return `<div class="subform"><h3>Ubicación y clima</h3>
    <p class="muted small">Con la ubicación, la app trae sola el clima de tu finca (temperatura, humedad, lluvia, viento, radiación y ETo de cada mes) y llena lo que dejes vacío. No tienes que escribirlo.</p>
    <div class="row">
      <input id="mapa-coord" aria-label="Coordenadas en grados decimales" placeholder="Latitud, longitud (ej. 14.0108, -87.0044)" style="flex:1;min-width:200px">
      <button type="button" class="btn sm" data-mapa="ir">Usar estas coordenadas</button>
      <button type="button" class="btn sm" data-mapa="gps">Mi ubicación (GPS)</button>
    </div>
    <p class="small">${p ? `Ubicación: ${p[0].toFixed(4)}, ${p[1].toFixed(4)}` : 'Sin ubicación todavía. También puedes marcarla en el mapa del dashboard.'}</p>
    ${estadoClima()}
    ${tieneClima(c) ? `<p class="small"><b>Clima:</b> ${esc(resumenClima(c))}. <button class="btn sm" data-clima="ver">Ver por mes</button></p>` : ''}
    <p class="muted small">Para el clima se envían las coordenadas redondeadas (~1 km) a Open-Meteo. Las coordenadas no se guardan en el archivo de la finca.</p>
  </div>`;
}

// Panel completo (dashboard, debajo del mapa): tabla por mes editable y su fuente.
export function panelClima() {
  const f = S.farm, c = f.clima;
  const p = cargarUbicacion().punto;
  const b = (acc, t, cls = '') => `<button type="button" class="btn sm${cls}" data-clima="${acc}">${t}</button>`;
  const sug = mesesLluviosos(c);
  const manual = new Set(c?.manual ?? []);
  return `<div class="clima-bloque" id="clima-finca">
    <div><h3>Clima de la finca</h3><p class="muted small">Promedio por mes de los últimos ${C.anios} años completos en tu ubicación. Alimenta riego (ETo y reservorio), los meses de lluvia fuerte (suelo, fertilización y polinizadores) y los avisos de aplicación de plaguicidas.</p></div>
    <div class="row">
      ${p ? b(tieneClima(c) && c.fuente === 'open-meteo' ? 'actualizar' : 'obtener', tieneClima(c) && c.fuente === 'open-meteo' ? 'Volver a descargar' : 'Obtener clima de la ubicación', ' primary') : '<span class="muted small">Marca la ubicación en el mapa (o usa "Mi ubicación") y el clima se descarga solo.</span>'}
      ${tieneClima(c) ? '' : b('manual', 'Escribirlo a mano')}
      ${tieneClima(c) ? b('riego', 'Llenar riego con este clima') : ''}
      ${tieneClima(c) ? b('quitar', 'Quitar clima', ' danger') : ''}
    </div>
    ${estadoClima()}
    ${c ? `<p class="muted small">${esc(fuenteTxt(c))}${manual.size ? ` ${manual.size} dato(s) corregido(s) a mano (en negrita).` : ''}</p>
    <div class="scroll"><table class="data small clima-tabla"><thead><tr><th></th>${M.map((m) => `<th class="num">${m}</th>`).join('')}</tr></thead><tbody>
      ${CLAVES.map((k) => `<tr><td>${VARIABLES[k].nombre} <span class="muted">(${VARIABLES[k].unidad})</span></td>${c.meses.map((m, i) => `<td><input aria-label="${VARIABLES[k].nombre} de ${M[i]}" type="number" step="any" inputmode="decimal" style="width:66px;text-align:right${manual.has(`${i}.${k}`) ? ';font-weight:700' : ''}" data-bind="farm.clima.meses.${i}.${k}" data-nullable data-rerender value="${m[k] ?? ''}"></td>`).join('')}</tr>`).join('')}
    </tbody></table></div>
    ${sug.length && !igual(sug, f.lluviaMeses) ? `<p class="notice small"><span>Según el clima, los meses de lluvia fuerte (${C.lluviaFuerteMm} mm o más, criterio propio) son <b>${mlist(sug)}</b>; en el cuestionario tienes ${mlist(f.lluviaMeses)}.</span>${b('lluvia', 'Usar los del clima')}</p>` : ''}
    <p class="muted small">Es el clima de una celda de ~11 km, no el de una estación en tu finca: en montaña puede diferir. Si tienes estación, corrige los valores. El viento se pasa de 10 m a 2 m con FAO-56 (ec. 47). La ETo es FAO-56 Penman-Monteith calculada por Open-Meteo. <a href="${C.enlace}" target="_blank" rel="noopener">${esc(C.atribucion)}</a>.</p>` : ''}
  </div>`;
}

// Botones del bloque (delegado una sola vez en el documento).
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-clima]');
  if (!b) return;
  const a = b.dataset.clima, f = S.farm;
  const p = cargarUbicacion().punto;
  if (a === 'obtener' || a === 'actualizar') { if (p) pedirClima(p[0], p[1], { forzar: a === 'actualizar' }); return; }
  if (a === 'manual') { f.clima = { ...climaVacio(), fuente: 'manual' }; S.climaUI = { estado: '', msg: '', llenos: [] }; }
  else if (a === 'quitar') { f.clima = null; S.climaUI = { estado: '', msg: '', llenos: [] }; }
  else if (a === 'lluvia') { f.lluviaMeses = mesesLluviosos(f.clima); S.demo = false; }
  else if (a === 'riego') {
    // Solo llena lo vacío; el caso de ejemplo (de otra finca) sí se reemplaza y pasa a ser tus datos.
    const ejemplo = S.riego.fuente === 'ejemplo';
    const llenos = llenarRiego(S.riego.datos, f.clima, { forzar: ejemplo });
    if (ejemplo) S.riego.fuente = 'manual';
    S.climaUI = { estado: 'ok', msg: llenos.length ? 'Riego actualizado con el clima de tu ubicación.' : 'Riego ya tenía esos datos: borra los que quieras reemplazar y vuelve a pulsar.', llenos };
  } else if (a === 'ver') { S.view = 'dashboard'; pedirRender(); queueMicrotask(() => document.getElementById('clima-finca')?.scrollIntoView({ block: 'start' })); return; }
  pedirRender();
});
