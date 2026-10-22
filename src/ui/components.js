// Controles de formulario reutilizables.
import { M, esc } from '../core/utils.js';
import { nivel } from '../core/engine.js';
import { CONFIG } from '../core/config.js';
import { ESTADOS } from '../core/rubrica.js';

export function months(path,arr){return `<div class="months" role="group" aria-label="Meses">${M.map((m,i)=>`<button type="button" data-month="${i}" data-path="${path}" aria-pressed="${arr.includes(i)}">${m}</button>`).join('')}</div>`;}
export function field(id,label,bind,val,type='text',hint='',nullable=false){return `<div class="f"><label for="${id}">${label}</label><input id="${id}" type="${type}" ${type==='number'?'min="0"':''} ${nullable?'data-nullable':''} data-bind="${bind}" value="${esc(val)}">${hint?`<span class="hint">${hint}</span>`:''}</div>`;}
// Con val nulo (sin responder) agrega una opción vacía seleccionada: el estado queda en null hasta que el usuario elija.
export function select(id,label,bind,val,opts){const vacia=val==null?'<option value="" selected>Sin responder</option>':'';return `<div class="f"><label for="${id}">${label}</label><select id="${id}" data-nullable data-bind="${bind}">${vacia}${opts.map(([v,t])=>`<option value="${v}" ${v===val?'selected':''}>${t}</option>`).join('')}</select></div>`;}

// Pastilla de un puntaje 0-100. El nivel sale de los umbrales vigentes (Ajustes), los mismos del motor.
export const pastillaPuntaje=(p,cfg=CONFIG)=>p==null?'<span class="muted">sin dato</span>':`<span class="pill ${nivel(p,cfg)}">${p}</span>`;

// Estado de evidencia de una variable («criterio propio», «verificado»…). Con fuente, esta se lee tocando o con el teclado
// (<details>), no solo al pasar el cursor por un title (issue 42). `abierto` viene de S.abiertos[clave].
export function estadoFuente(estado,fuente,clave,abierto=false){
  const clase=`estado ${estado.replace(' ','-')}`;
  if(!fuente)return `<span class="${clase}">${ESTADOS[estado]}</span>`;
  return `<details class="${clase}" data-keep="${esc(clave)}" ${abierto?'open':''}><summary aria-label="${esc(ESTADOS[estado])}: ver la fuente">${ESTADOS[estado]} <span aria-hidden="true">ⓘ</span></summary><p class="fuente">${esc(fuente)}</p></details>`;
}

// Patrón de pantalla (rediseño «menos palabras», 2026-10-22). Toda vista sigue lo mismo: cabeza con un estado corto y una
// acción principal; lo que explica va detrás de un «?»; lo secundario va en secciones plegadas que dicen cuánto traen.

// «?» que abre la explicación. Reemplaza los párrafos grises debajo de cada título.
export function ayuda(clave,texto,abierto=false){
  return `<details class="ayuda" data-keep="ayuda-${esc(clave)}" ${abierto?'open':''}><summary aria-label="¿Qué es esto?" title="¿Qué es esto?"><span aria-hidden="true">?</span></summary><div class="ayuda-caja">${texto}</div></details>`;
}

// Cabeza de una vista: módulo, título, estado en una línea, acciones y, si hace falta, su «?».
export function cabeza({modulo='',titulo,estado='',acciones='',ayudaClave='',ayudaTexto=''}){
  return `<header class="cabeza">
    <div class="cabeza-txt">${modulo?`<p class="label">${modulo}</p>`:''}<div class="cabeza-titulo"><h1>${titulo}</h1>${ayudaTexto?ayuda(ayudaClave,ayudaTexto):''}</div>${estado?`<p class="cabeza-estado">${estado}</p>`:''}</div>
    ${acciones?`<div class="cabeza-acc">${acciones}</div>`:''}
  </header>`;
}

// Sección plegada: título, lo que trae (por ejemplo «3 avisos») y su contenido. Recuerda si el usuario la abrió.
export function seccion(clave,titulo,resumen,cuerpo,abrir=false,abiertos={}){
  const open=(abiertos[clave]??abrir)?'open':'';
  return `<details class="sec panel" data-keep="${esc(clave)}" ${open}><summary><span class="sec-t">${titulo}</span>${resumen?`<span class="sec-r">${resumen}</span>`:''}<span class="sec-flecha" aria-hidden="true"></span></summary><div class="sec-cuerpo">${cuerpo}</div></details>`;
}

// Lo mismo en dos partes, para envolver secciones largas ya escritas: secAbre(…) + contenido + SEC_CIERRA.
export const secAbre=(clave,titulo,resumen,abrir,abiertos={},alerta=false)=>`<details class="sec panel" data-keep="${esc(clave)}" ${(abiertos[clave]??abrir)?'open':''}><summary><span class="sec-t">${titulo}</span>${resumen?`<span class="sec-r${alerta?' alerta-r':''}">${resumen}</span>`:''}<span class="sec-flecha" aria-hidden="true"></span></summary><div class="sec-cuerpo">`;
export const SEC_CIERRA='</div></details>';
// «Cómo se calcula» con su «?»: la fórmula queda a un toque, sin ocupar la pantalla.
export const metodo=(clave,texto)=>`<div class="metodo"><span>Cómo se calcula</span>${ayuda(clave,texto)}</div>`;

// Avisos como las notificaciones del teléfono: una fila con el nivel y el título; el porqué y la fuente se abren al tocarla.
// Errores y «revisar» van a la vista; criterios y aciertos quedan juntos en una fila «Ver N más».
const NIVEL_ALERTA={error:'Error',advertencia:'Revisar',criterio:'Criterio',ok:'Bien'};
const fuenteAlerta=(f)=>!f?'':`<p class="muted fs-125">Fuente: ${f.url?`<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.cita)}</a>`:esc(f.cita)}</p>`;
export const filaAlerta=(a)=>`<li><details class="alerta ${a.nivel}"><summary><span class="pill ${a.nivel}">${NIVEL_ALERTA[a.nivel]}</span><b>${esc(a.titulo)}</b></summary><div class="alerta-cuerpo"><p>${esc(a.detalle)}</p>${fuenteAlerta(a.fuente)}</div></details></li>`;
export function listaAlertas(alertas,vacio='Sin avisos.'){
  if(!alertas.length)return `<p class="muted small">${vacio}</p>`;
  const graves=alertas.filter(a=>a.nivel==='error'||a.nivel==='advertencia'),otras=alertas.filter(a=>!graves.includes(a));
  return `${graves.length?`<ul class="alertas">${graves.map(filaAlerta).join('')}</ul>`:''}${otras.length?`<details class="alertas-mas"><summary>Ver ${otras.length} ${otras.length===1?'criterio o acierto':'criterios y aciertos'}</summary><ul class="alertas">${otras.map(filaAlerta).join('')}</ul></details>`:''}`;
}

// Cifras grandes del estado de una vista (máximo 4). pares: [[etiqueta, valor, nivel?], …]
export function cifras(pares){
  return `<div class="cifras">${pares.map(([k,v,lv])=>`<div class="cifra${lv?` nivel-${lv}`:''}"><span class="cifra-v">${v}</span><span class="cifra-k">${k}</span></div>`).join('')}</div>`;
}

// Botón «+» de una tarjeta o sección: abre un resumen corto de lo que se está viendo. Es un <details> (funciona con el teclado
// y sin JavaScript) y recuerda si quedó abierto (data-keep). `abierto` viene de S.abiertos[`mas-${clave}`].
export function mas(clave,titulo,cuerpo,abierto=false){
  return `<details class="mas" data-keep="mas-${esc(clave)}" ${abierto?'open':''}><summary aria-label="Más sobre ${esc(titulo)}" title="Más sobre ${esc(titulo)}"><span aria-hidden="true">+</span></summary><div class="mas-caja">${cuerpo}</div></details>`;
}
