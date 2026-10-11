// Controles de formulario reutilizables.
import { M, esc } from '../core/utils.js';
import { nivel } from '../core/engine.js';
import { CONFIG } from '../core/config.js';

export function months(path,arr){return `<div class="months" role="group" aria-label="Meses">${M.map((m,i)=>`<button type="button" data-month="${i}" data-path="${path}" aria-pressed="${arr.includes(i)}">${m}</button>`).join('')}</div>`;}
export function field(id,label,bind,val,type='text',hint=''){return `<div class="f"><label for="${id}">${label}</label><input id="${id}" type="${type}" ${type==='number'?'min="0"':''} data-bind="${bind}" value="${esc(val)}">${hint?`<span class="hint">${hint}</span>`:''}</div>`;}
export function select(id,label,bind,val,opts){return `<div class="f"><label for="${id}">${label}</label><select id="${id}" data-bind="${bind}">${opts.map(([v,t])=>`<option value="${v}" ${v===val?'selected':''}>${t}</option>`).join('')}</select></div>`;}

// Pastilla de un puntaje 0-100. El nivel sale de los umbrales vigentes (Ajustes), los mismos del motor.
export const pastillaPuntaje=(p,cfg=CONFIG)=>p==null?'<span class="muted">sin dato</span>':`<span class="pill ${nivel(p,cfg)}">${p}</span>`;
