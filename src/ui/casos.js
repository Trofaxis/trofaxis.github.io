// Vista: Memoria de casos. "Cada finca es un caso": muestra las fincas más parecidas a la tuya,
// qué hicieron y cómo les fue, y permite guardar tu finca (con sus acciones y su resultado) como caso.
import { esc } from '../core/utils.js';
import { S } from '../core/state.js';
import { configEfectiva, normalizarAjustes, normalizarFinca } from '../core/storage.js';
import { nivel } from '../core/engine.js';
import { CASOS_EJEMPLO } from '../casos/ejemplos.js';
import { vecinos, resumenResultado, accionesDe, resultadoDe } from '../casos/memoria.js';
import { casoAnonimo } from '../casos/anonimo.js';
import { nubeConfigurada } from '../nube/cliente.js';
import { perfil } from '../casos/perfil.js';

const ORIGEN = { ejemplo: 'Ejemplo', propio: 'Tu caso', nube: 'Comunidad' };

// Todos los casos disponibles, sin la finca que se está evaluando (no se compara consigo misma).
export function memoria() {
  const actual = JSON.stringify(normalizarFinca(S.farm));
  // Los casos de la nube no traen finca (solo el perfil anonimizado), así que no hay nada que comparar por igualdad.
  return [...CASOS_EJEMPLO, ...S.casos, ...S.nube.comunidad].filter((c) => !c.finca || JSON.stringify(normalizarFinca(c.finca)) !== actual);
}

export function vecinosActuales() {
  const cfg = configEfectiva(normalizarAjustes(S.ajustes));
  return { cfg, lista: vecinos(S.farm, memoria(), cfg) };
}

// Tarjetas de fincas parecidas. Se usan en el dashboard y en la vista de casos.
export function tarjetasVecinos(lista, cfg) {
  if (!lista.length) return '<p class="muted">Todavía no hay casos comparables. Activa más módulos o agrega casos.</p>';
  return `<div class="cards">${lista.map((v) => {
    const lv = nivel(v.perfil.overall, cfg);
    return `<article class="card caso">
      <div class="top"><span class="badge ${v.caso.origen}">${ORIGEN[v.caso.origen]}</span><span class="sim" title="Similitud con tu finca">${Math.round(v.sim * 100)} %</span></div>
      <h3>${esc(v.caso.etiqueta)}</h3>
      <p class="small"><span class="pill ${lv}">Índice ${v.perfil.overall}</span></p>
      ${v.parecidos.length ? `<p class="small"><b>Se parece en:</b> ${esc(v.parecidos.slice(0, 4).join(', '))}.</p>` : ''}
      ${v.diferencias.length ? `<p class="small muted"><b>Difiere en:</b> ${esc(v.diferencias.slice(0, 3).join(', '))}.</p>` : ''}
      <div class="small"><b>Qué hizo:</b>${accionesDe(v.caso).length ? `<ul class="acc">${accionesDe(v.caso).map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ' <span class="muted">sin acciones registradas</span>'}</div>
      <div class="small resultado"><b>Cómo le fue:</b> ${resumenResultado(resultadoDe(v.caso)).map(esc).join(' · ')}</div>
      ${v.cobertura < 1 ? `<p class="muted small">Comparado con el ${Math.round(v.cobertura * 100)} % de los rasgos (faltan datos).</p>` : ''}
    </article>`;
  }).join('')}</div>`;
}

const notaEjemplos = '<p class="muted small">Los casos marcados <b>Ejemplo</b> son fincas ficticias: demuestran el método (perfil, similitud y vecinos), no qué funciona en campo. Con casos reales, las mismas fórmulas dan recomendaciones respaldadas.</p>';

export function panelVecinosDashboard() {
  const { cfg, lista } = vecinosActuales();
  return `<section class="panel">
    <div class="row between"><div><h2>Fincas parecidas</h2><p class="muted">Memoria de casos: las ${cfg.casos.k} fincas más parecidas a la tuya, qué hicieron y cómo les fue.</p></div><button class="btn sm" data-view="casos">Ver memoria de casos</button></div>
    ${tarjetasVecinos(lista, cfg)}
    ${notaEjemplos}
  </section>`;
}

const numCampo = (id, label, path, val, step, hint) => `<div class="f"><label for="${id}">${label}</label><input id="${id}" type="number" min="0" step="${step}" data-nullable data-bind="${path}" value="${val ?? ''}"><span class="hint">${hint}</span></div>`;

// Qué sale de tu finca si compartes un caso. Se muestra tal cual se enviaría.
function vistaPreviaCaso() {
  const a = casoAnonimo(S.farm, configEfectiva(normalizarAjustes(S.ajustes)));
  return JSON.stringify(a, null, 2);
}

function panelNube() {
  const n = S.nube;
  if (!nubeConfigurada()) {
    return `<section class="panel"><div><h2>Nube</h2><p class="muted">La nube no está configurada en esta copia de la app: todo funciona solo en este navegador.</p></div></section>`;
  }
  const dis = n.ocupado ? 'disabled' : '';
  const cuenta = n.sesion
    ? `<p class="small">Sesión iniciada como <b>${esc(n.sesion.email || 'tu correo')}</b>.</p>
       <div class="row">
         <button class="btn sm" data-act="nube-guardar" ${dis}>Guardar mi finca en la nube</button>
         <button class="btn sm" data-act="nube-cargar" ${dis}>Cargar mi finca desde la nube</button>
         <button class="btn sm" data-act="nube-salir" ${dis}>Cerrar sesión</button>
       </div>
       <p class="muted small">Tu finca completa (con nombre y todos sus datos) queda <b>privada</b>: solo tú la ves, con tu sesión. Guardar reemplaza la copia anterior de la nube.</p>`
    : `<div class="f"><label for="n-email">Correo para iniciar sesión</label><input id="n-email" type="email" autocomplete="email" data-bind="nube.email" value="${esc(n.email)}" placeholder="tucorreo@ejemplo.com"><span class="hint">Te enviamos un enlace de un solo uso. No hay contraseñas.</span></div>
       <div class="row"><button class="btn primary" data-act="nube-enlace" ${dis}>Enviarme el enlace</button></div>`;
  const compartir = n.sesion ? `
    <div class="f"><label class="item" style="cursor:pointer"><input type="checkbox" style="width:auto" data-bind="nube.consentimiento" data-rerender ${n.consentimiento ? 'checked' : ''}>
      <span class="grow">Acepto compartir de forma anónima el caso de abajo con la comunidad de BioG.A.P.</span></label>
      <span class="hint">Se comparte: cultivo principal, tipo de riego, pendiente, distancia al agua, proporción de especies nativas, meses de coincidencia, riesgo por módulo, las acciones que escribiste y el resultado. <b>No se comparte</b>: nombre de la finca ni de personas, departamento, fuente de agua, especies, ubicación ni coordenadas. Las acciones son texto libre: <b>no escribas nombres ni lugares en ellas</b> (se quitan coordenadas, correos, teléfonos y enlaces, pero revisa el texto).</span></div>
    <details><summary>Ver exactamente qué se enviaría</summary><pre class="formula">${esc(vistaPreviaCaso())}</pre></details>
    <div class="row">
      <button class="btn primary" data-act="nube-compartir" ${n.consentimiento && !n.ocupado && !S.demo ? '' : 'disabled'}>Compartir mi caso anónimo</button>
      <button class="btn sm danger" data-act="nube-retirar" ${dis}>Retirar todos mis casos compartidos</button>
    </div>
    ${S.demo ? '<p class="muted small">La finca demostrativa es ficticia y no se comparte. Carga o escribe tu finca para compartirla.</p>' : ''}` : '';
  return `<section class="panel">
    <div><h2>Nube y comunidad</h2><p class="muted">Opcional. Sin iniciar sesión, la app funciona igual que siempre en este navegador y verás los casos de la comunidad (lectura pública y anónima).</p></div>
    ${cuenta}
    ${compartir}
    <div class="row"><button class="btn sm" data-act="nube-comunidad" ${dis}>Actualizar casos de la comunidad</button><span class="muted small">${S.nube.comunidad.length} caso(s) descargados.</span></div>
  </section>`;
}

export function viewCasos() {
  const { cfg, lista } = vecinosActuales();
  const f = S.farm, r = f.resultado;
  const todos = [...CASOS_EJEMPLO, ...S.casos];
  const propios = S.casos.length;
  return `
  ${S.msg ? `<div class="notice" role="status"><span>${esc(S.msg)}</span></div>` : ''}
  <section class="panel">
    <div><p class="label">Memoria de casos · Etapa 2</p><h1>Cada finca es un caso</h1>
    <p class="muted">Cada finca evaluada guarda su situación, lo que hizo y cómo le fue. La app busca las más parecidas a la tuya con k vecinos más cercanos (k-NN), en tu navegador y sin servicios de pago. Mientras más casos reales se acumulan, mejores son las comparaciones: <b>un competidor puede copiar las fórmulas, pero no los casos acumulados.</b></p></div>
    <div class="stats">
      <div><div class="k">Casos en memoria</div><div class="v">${todos.length}</div></div>
      <div><div class="k">De ejemplo</div><div class="v">${CASOS_EJEMPLO.length}</div></div>
      <div><div class="k">Guardados por ti</div><div class="v">${propios}</div></div>
      <div><div class="k">De la comunidad</div><div class="v">${S.nube.comunidad.length}</div></div>
      <div><div class="k">Vecinos mostrados</div><div class="v">${cfg.casos.k}</div></div>
    </div>
  </section>
  <section class="panel">
    <div><h2>Las fincas más parecidas a «${esc(f.nombre || 'tu finca')}»</h2><p class="muted">Ordenadas por similitud. Cada tarjeta dice en qué se parecen, qué hicieron y cómo les fue.</p></div>
    ${tarjetasVecinos(lista, cfg)}
    ${notaEjemplos}
    <details><summary>¿Cómo se calcula la similitud?</summary><div class="formula">Perfil de cada finca: cultivo principal, tipo de riego, pendiente, distancia al agua (tope ${cfg.casos.topeDistAgua} m), proporción de especies nativas, meses con coincidencias de riesgo y el riesgo de cada módulo.
Distancia por rasgo (0 a 1): categoría igual = 0, distinta = 1; números = diferencia absoluta.
Similitud = 1 − Σ peso·distancia / Σ peso (solo rasgos que ambas fincas tienen).
Pesos: ${Object.entries(cfg.casos.pesos).map(([k, w]) => `${k} ${w}`).join(', ')}.
Pesos y umbrales: criterio propio, por calibrar con casos reales (Etapa 3).</div></details>
  </section>
  <section class="panel">
    <div><h2>Tu finca como caso</h2><p class="muted">Registra lo que hiciste y cómo te fue. Esto es lo que otras fincas verán cuando se parezcan a la tuya.</p></div>
    <div class="f"><label for="c-acc">Acciones tomadas (una por línea)</label><textarea id="c-acc" data-bind="farm.acciones" data-lines placeholder="Ej.: Franja de protección de 30 m en la quebrada">${esc(f.acciones.join('\n'))}</textarea></div>
    <div class="fields">
      ${numCampo('c-nca', 'No conformidades antes', 'farm.resultado.ncAntes', r.ncAntes, 1, 'GLOBALG.A.P., n.º')}
      ${numCampo('c-ncd', 'No conformidades después', 'farm.resultado.ncDespues', r.ncDespues, 1, 'GLOBALG.A.P., n.º')}
      ${numCampo('c-la', 'Lámina antes', 'farm.resultado.laminaAntes', r.laminaAntes, 0.01, 'Aplicada / requerida; ideal 0.9-1.2')}
      ${numCampo('c-ld', 'Lámina después', 'farm.resultado.laminaDespues', r.laminaDespues, 0.01, 'Aplicada / requerida; ideal 0.9-1.2')}
    </div>
    <div class="row"><button class="btn primary" data-act="caso-guardar">Guardar mi finca como caso</button><span class="muted small">Se guarda en este navegador${S.demo ? ' y queda marcado como Ejemplo, porque la finca actual es la demostrativa' : ''}. Para compartirlo con otras fincas, usa el panel de la nube de abajo (con tu consentimiento y anonimizado).</span></div>
  </section>
  ${panelNube()}
  <section class="panel">
    <h2>Todos los casos</h2>
    <div class="scroll"><table class="data"><thead><tr><th>Caso</th><th>Origen</th><th>Cultivo</th><th class="num">Índice</th><th>Resultado</th><th></th></tr></thead><tbody>
      ${todos.map((c) => { const p = perfil(c.finca, cfg); return `<tr><td>${esc(c.etiqueta)}</td><td><span class="badge ${c.origen}">${ORIGEN[c.origen]}</span></td><td>${esc(p.cultivoNombre || 'Sin dato')}</td><td class="num"><span class="pill ${nivel(p.overall, cfg)}">${p.overall}</span></td><td class="small">${resumenResultado(c.finca.resultado).map(esc).join('<br>')}</td><td>${S.casos.includes(c) ? `<button class="btn sm danger" data-act="caso-rm" data-id="${esc(c.id)}">Quitar</button>` : ''}</td></tr>`; }).join('')}
    </tbody></table></div>
  </section>`;
}
