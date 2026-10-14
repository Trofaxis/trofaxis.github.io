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

// Botón «+» de una tarjeta o sección: abre un resumen corto de lo que se está viendo. Es un <details> (funciona con el teclado
// y sin JavaScript) y recuerda si quedó abierto (data-keep). `abierto` viene de S.abiertos[`mas-${clave}`].
export function mas(clave,titulo,cuerpo,abierto=false){
  return `<details class="mas" data-keep="mas-${esc(clave)}" ${abierto?'open':''}><summary aria-label="Más sobre ${esc(titulo)}" title="Más sobre ${esc(titulo)}"><span aria-hidden="true">+</span></summary><div class="mas-caja">${cuerpo}</div></details>`;
}
