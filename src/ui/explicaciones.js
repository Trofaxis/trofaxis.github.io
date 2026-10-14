// Textos de las secciones «+» del dashboard: un resumen corto, en palabras del usuario, de lo que muestra cada tarjeta.
// Funciones puras: reciben la evaluación de la finca (evaluar) y devuelven HTML. No calculan nada nuevo.
import { M, MFULL, esc } from '../core/utils.js';
import { CONFIG } from '../core/config.js';
import { FUENTES } from '../core/fuentes.js';

const pct = (x) => `${Math.round(x * 100)} %`;
const faltantes = (m) => m.variables.filter((v) => v.aplica !== false && v.puntaje == null);
const lista = (items) => (items.length ? `<ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>` : '');
const ir = (vista, texto) => `<button type="button" class="btn sm" data-view="${vista}">${texto}</button>`;

export function masMayorRiesgo(R, cfg = CONFIG) {
  const con = R.mods.filter((m) => m.suficiente).sort((a, b) => b.score - a.score);
  if (!con.length) return `<p>Todavía ningún módulo tiene datos suficientes para calificarse.</p>${ir('wizard', 'Responder el cuestionario')}`;
  const top = con[0];
  const causas = top.variables.filter((v) => v.puntaje > 0).sort((a, b) => b.peso * b.puntaje - a.peso * a.puntaje).slice(0, 3);
  return `<p><b>${esc(top.nombre)}</b> es el módulo con más riesgo: ${top.score} de 100 (${top.level.toLowerCase()}). Un puntaje de ${cfg.niveles.alto} o más es alto; de ${cfg.niveles.medio} a ${cfg.niveles.alto - 1}, medio.</p>
    ${causas.length ? `<p>Lo que más lo sube:</p>${lista(causas.map((v) => `${esc(v.nombre)}: ${esc(String(v.valor))}`))}` : ''}
    <p class="muted small">Atender estas causas es lo que más baja el índice global. El detalle está en «Riesgo por módulo».</p>`;
}

export function masModulosAlto(R) {
  const grupo = (lv) => R.mods.filter((m) => m.suficiente && m.level === lv);
  const sin = R.mods.filter((m) => !m.suficiente);
  const fila = (lv, ms) => (ms.length ? `<li><b>${lv}:</b> ${ms.map((m) => `${esc(m.nombre)} (${m.score})`).join(', ')}</li>` : '');
  const altos = grupo('Alto');
  return `<p>${altos.length ? `${altos.length === 1 ? 'Un módulo está' : `${altos.length} módulos están`} en riesgo alto. Empieza por ${altos.length === 1 ? 'él' : 'ellos'}.` : 'Ningún módulo está en riesgo alto.'}</p>
    <ul>${fila('Alto', altos)}${fila('Medio', grupo('Medio'))}${fila('Bajo', grupo('Bajo'))}${sin.length ? `<li><b>Sin datos:</b> ${sin.map((m) => esc(m.nombre)).join(', ')}</li>` : ''}</ul>
    ${altos.length ? `<p class="muted small">Causa principal: ${altos.map((m) => `${esc(m.nombre)}, ${esc(m.driver.toLowerCase())}`).join('; ')}.</p>` : ''}`;
}

export function masMesCargado(R) {
  const orden = R.mh.map((a, i) => [i, a]).filter(([, a]) => a.length).sort((a, b) => b[1].length - a[1].length);
  if (!orden.length) return '<p>No hay meses en los que coincidan dos riesgos (por ejemplo, aplicar plaguicidas cuando hay flores visitadas).</p>';
  const [i, a] = orden[0];
  return `<p>En <b>${MFULL[i]}</b> se juntan ${a.length} riesgo(s) a la vez:</p>${lista(a.map(esc))}
    <p class="muted small">Es el mes en el que conviene revisar primero el calendario: mover una de esas labores a otro mes baja la presión.</p>`;
}

export function masCoincidencias(R) {
  const meses = R.mh.map((a, i) => [i, a]).filter(([, a]) => a.length);
  if (!meses.length) return '<p>Ningún mes tiene coincidencias de riesgo.</p>';
  return `<p>Una coincidencia es un mes en el que dos cosas que juntas dañan el ambiente pasan a la vez. Tu finca tiene ${meses.length} mes(es) así:</p>
    ${lista(meses.map(([i, a]) => `<b>${M[i]}:</b> ${a.map(esc).join(' · ')}`))}
    <p class="muted small">El calendario completo está en «Cruce de calendarios».</p>`;
}

// Ejemplo del pedido: con 93 % de datos, decir en qué módulo y qué dato falta.
export function masDatos(R) {
  const incompletos = R.mods.filter((m) => m.conf < 1);
  if (!incompletos.length) return '<p>Respondiste todo lo que la app usa para calcular el riesgo. El resultado es tan firme como tus respuestas.</p>';
  return `<p>Promedio de lo que respondiste en cada módulo: ${pct(R.conf)}. Te falta información en:</p>
    <ul>${incompletos.map((m) => `<li><b>${esc(m.nombre)}</b> (${pct(m.conf)}): ${faltantes(m).map((v) => esc(v.nombre.toLowerCase())).join('; ') || 'datos opcionales'}.</li>`).join('')}</ul>
    <p class="muted small">Un dato que falta no cuenta como riesgo cero: baja la confianza del módulo. Con menos de ${pct(CONFIG.confianzaMinima)} el módulo no se califica.</p>
    ${ir('wizard', 'Completar en el cuestionario')}`;
}

export function masGlobalgap(f) {
  const allowed = Math.floor(Math.max(0, f.minorAplicables) * CONFIG.globalgap.margenMinorMusts);
  const estado = f.gg === 'si' ? 'Dijiste que la finca está certificada.' : f.gg === 'quiero' ? 'Dijiste que la finca busca certificarse.' : 'Dijiste que la finca no busca GLOBALG.A.P.: el panel de certificación se oculta.';
  return `<p>${estado} Es lo que declaraste, no una verificación.</p>
    ${f.gg !== 'no' ? `<p>Para mantener la certificación de IFA v6 hay que cumplir el 100 % de los Major Musts y al menos el 95 % de los Minor Musts. Con ${f.minorAplicables} Minor Musts aplicables puedes fallar ${allowed}; llevas ${f.minorFallas}. Tienes ${f.nc.length} no conformidad(es) abierta(s).</p>
    <p class="muted small">Cada módulo de riesgo se relaciona con secciones de IFA v6 en el «Panel GLOBALG.A.P.». No reemplaza la auditoría.</p>` : ''}`;
}

// Perfil de riesgo: explicación más extensa del radar.
export function masPerfil(R, cfg = CONFIG) {
  const con = R.mods.filter((m) => m.suficiente).sort((a, b) => b.score - a.score);
  const sin = R.mods.filter((m) => !m.suficiente);
  return `<p><b>Cómo leerlo.</b> Cada punta es un módulo de riesgo ambiental. El centro es 0 (sin riesgo) y el borde es 100. Mientras más grande y más estirada hacia una punta sea la figura, más riesgo hay en ese tema. El anillo marcado con 50 es la mitad de la escala.</p>
    <p><b>Qué dice de tu finca.</b> ${con.length ? `De más a menos riesgo: ${con.map((m) => `${esc(m.nombre)} ${m.score} (${m.level.toLowerCase()})`).join(', ')}.` : 'Aún no hay módulos con datos suficientes.'}${sin.length ? ` Sin datos suficientes: ${sin.map((m) => esc(m.nombre)).join(', ')} (no se dibujan).` : ''}</p>
    ${lista(con.map((m) => `<b>${esc(m.nombre)}:</b> ${esc(m.driver)}`))}
    <p><b>Los colores.</b> Rojo: ${cfg.niveles.alto} o más (alto). Naranja: de ${cfg.niveles.medio} a ${cfg.niveles.alto - 1} (medio). Verde: menos de ${cfg.niveles.medio} (bajo).</p>
    <p><b>Qué hacer con esto.</b> Empieza por la punta más larga. El «Plan de acción» y «¿Qué pasa si cambias algo?», más abajo, muestran qué cambio la acorta y cuánto.</p>
    <p class="muted small">Cada módulo suma variables con peso y fuente (ver la rúbrica en «Riesgo por módulo»). Los pesos son una propuesta por calibrar con especialistas.</p>`;
}

// ApiRadar: qué es, por qué existe y qué resuelve. Es un caso concreto de Zamorano.
export function masApiRadar(cfg = CONFIG) {
  const [rMin, rMax] = cfg.apiradar.radioExclusionM;
  return `<p><b>Qué es.</b> El ApiRadar es una herramienta para resolver un problema ambiental concreto: abejas nativas que mueren en las flores de <i>Spathodea campanulata</i> (tulipán africano), un árbol introducido muy usado como ornamental.</p>
    <p><b>De dónde nace.</b> Es un caso real del campus de Zamorano, estudiado en dos trabajos de graduación: Osorio (2025) censó los árboles de Spathodea del campus y midió su copa; Kuniyoshi (2025) siguió su floración y registró abejas muertas en sus flores. Trofaxis usa ese caso como primer problema resuelto de punta a punta.</p>
    <p><b>Qué resuelve.</b> Te dice, con tus propios datos:</p>
    <ul><li>qué tan en riesgo están las abejas de tu finca y por qué;</li>
      <li>dónde están los árboles que más pesan (los de más copa);</li>
      <li>dónde poner meliponarios u hoteles de insectos: a ${rMin}-${rMax} m o más de los árboles de riesgo;</li>
      <li>qué cambiar primero y cuánto baja el riesgo con cada cambio.</li></ul>
    <p><b>Cómo usarlo.</b> Sigue la ruta de pasos: ubica los árboles, marca dónde pondrías las colonias, elige las acciones de tu plan y descárgalo para llevarlo al campo.</p>
    <p class="muted small">Fuentes: ${esc(FUENTES.osorio.cita)} ${esc(FUENTES.kuniyoshi.cita)} El radio de ${rMin}-${rMax} m viene de ${esc(FUENTES.barrantes.corta)} para Trigona fulviventris; para otras abejas es una referencia (criterio propio). Las cifras de riesgo son una propuesta por validar.</p>`;
}
