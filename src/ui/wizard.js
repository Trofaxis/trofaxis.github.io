// Vista: Cuestionario inicial de la finca (asistente por pasos; se puede saltar entre pasos y editar lo ya ingresado).
import { esc, mlist } from '../core/utils.js';
import { S } from '../core/state.js';
import { months, field, select, ayuda } from './components.js';
import { conPlan } from '../fert/calculo.js';
import { bloqueUbicacion } from './clima.js';
import { mesesLluviosos, tieneClima } from '../clima/normales.js';
import { CONFIG } from '../core/config.js';
import { plagasDe } from '../especies/plagas.js';
import { grupoPresencia, textoUmbrales } from '../especies/presencia.js';
import { rapidoDeFinca } from '../core/rapido.js';
import { FUENTES } from '../core/fuentes.js';

// Secciones de especies: obligan a pensar en cada grupo por separado.
export const SECCIONES = {
  fauna: { titulo: 'Polinizadores y otra fauna', tipos: ['Fauna'], pista: 'Abejas nativas sin aguijón, abejorros, mariposas, aves, murciélagos.' },
  arboles: { titulo: 'Árboles y arbustos', tipos: ['Árbol', 'Arbusto'], pista: 'Cercas vivas, sombra, bordes y especies de riesgo como Spathodea campanulata.' },
  malezas: { titulo: 'Malezas y vegetación espontánea', tipos: ['Maleza'], pista: 'Las que florecen también alimentan a los polinizadores.' },
  cultivos: { titulo: 'Cultivos que florecen', tipos: ['Cultivo'], pista: 'Para cruzar su floración con las aplicaciones.' },
};
const PRES=[['','No sé'],['baja','Baja'],['media','Media'],['alta','Alta']];
const presTxt=(p)=>p?` · presencia ${p}`:'';

export const STEPS=['Finca','Cultivos','Especies','Prácticas','Calendarios','Certificación'];
const numOpc=(id,label,bind,val,hint)=>`<div class="f"><label for="${id}">${label}</label><input id="${id}" type="number" min="0" step="any" data-nullable data-bind="${bind}" value="${val??''}"><span class="hint">${hint}</span></div>`;

// Botones Sí / No / No sé de una pregunta rápida.
const sino=(k,extra=[])=>`<div class="choice">${[['si','Sí'],['no','No'],['','No sé'],...extra].map(([v,t])=>`<button data-act="rapido-opc" data-k="${k}" data-v="${v}" aria-pressed="${S.rapido[k]===v}">${t}</button>`).join('')}</div>`;

// Preguntas rápidas: lo mínimo para ver un primer resultado. Una pregunta por pantalla, con su avance arriba y los botones
// abajo (como Duolingo o Airbnb): se lee una cosa a la vez. Lo que explica va detrás del «?». Lo demás, en el cuestionario completo.
export const N_RAPIDAS=7;
export function viewRapido(){
  const f=S.farm;
  if(!S.rapido||S.rapidoDe!==f){S.rapido=rapidoDeFinca(f);S.rapidoDe=f;}
  const r=S.rapido,detalladas=f.plaguicidas.filter(p=>p.producto&&p.producto!=='Insecticida sin detallar');
  const K=FUENTES.kuniyoshi,flor=K.datos.find(d=>d.id==='floracion');
  const i=Math.max(0,Math.min(N_RAPIDAS-1,S.preg||0));
  const P=[
    ['¿Cómo se llama y cuánto mide?',`<div class="fields">${field('r-nombre','Nombre de la finca','farm.nombre',f.nombre)}${field('r-area','Área total','farm.area',f.area||'','number','Hectáreas')}</div>`],
    ['¿Dónde está?',bloqueUbicacion(),'Con la ubicación, la app llena sola el clima, la altitud y los meses de lluvia.'],
    ['¿Qué cultivas?',`<div class="fields">${field('r-cult','Cultivo principal','rapido.cultivo',r.cultivo)}${numOpc('r-ha','Área del cultivo','rapido.ha',r.ha,'Hectáreas, opcional')}</div>
      <div class="f"><span class="label">Meses de cosecha</span>${months('rapido.cosecha',r.cosecha)}</div>`,f.cultivos.length>1?`Tienes ${f.cultivos.length} cultivos: aquí cambias el primero; los demás siguen igual.`:''],
    ['¿Hay abejas nativas sin aguijón en tu finca o cerca?',sino('abejas'),'Si las hay, la app es más estricta con los insecticidas.'],
    ['¿Hay árboles de tulipán africano (<i>Spathodea campanulata</i>)?',sino('spathodea')+(r.spathodea==='si'?`<div class="fields">${numOpc('r-span','¿Cuántos árboles?','rapido.spaN',r.spaN,'Opcional')}</div>
      <div class="f"><span class="label">Meses en que florecen</span>${months('rapido.spaFlor',r.spaFlor)}</div>`:''),
      `Sus flores matan abejas nativas. Es el problema que resuelve el ApiRadar.${flor?` Referencia: en el campus de Zamorano florecieron de ${esc(flor.valor)} (${esc(K.corta)}).`:''}`],
    ['¿Aplicas insecticidas?',detalladas.length
      ?`<p>Ya tienes ${detalladas.length} aplicación(es) registradas en Plaguicidas. <button class="btn sm" data-view="plaguicidas">Ver plaguicidas</button></p>`
      :sino('insect')+(r.insect==='si'?`<div class="f"><span class="label">¿En qué meses?</span>${months('rapido.insectMeses',r.insectMeses)}</div>
      <div class="choice">${[['amplio','Amplio espectro'],['selectivo','Selectivos'],['biologico','Biológicos']].map(([v,t])=>`<button data-act="rapido-opc" data-k="insectClase" data-v="${v}" aria-pressed="${r.insectClase===v}">${t}</button>`).join('')}</div>`:''),
      'Amplio espectro: matan casi todo, también a los insectos que ayudan. Para el peligro real para las abejas hace falta el producto y la dosis: los detallas después en Plaguicidas.'],
    ['¿Cómo riegas?',`<div class="choice choice-grande">${[['gravedad','Gravedad'],['aspersion','Aspersión'],['goteo','Goteo'],['ninguno','Sin riego']].map(([v,t])=>`<button data-act="riego-tipo" data-v="${v}" aria-pressed="${f.riego===v}">${t}</button>`).join('')}</div>`],
  ];
  const [t,cuerpo,pista='']=P[i];
  return `<section class="panel paso">
    <div class="paso-top"><p class="label">Lo básico de tu finca</p><button class="enlace" data-act="wiz-modo" data-v="completo">Cuestionario completo</button></div>
    <div class="progreso" role="progressbar" aria-valuemin="1" aria-valuemax="${N_RAPIDAS}" aria-valuenow="${i+1}" aria-label="Pregunta ${i+1} de ${N_RAPIDAS}"><span style="width:${(i+1)/N_RAPIDAS*100}%"></span></div>
    <p class="paso-n">${i+1} de ${N_RAPIDAS}</p>
    <div class="cabeza-titulo"><h2 class="paso-pregunta">${t}</h2>${pista?ayuda(`rapido-${i}`,pista):''}</div>
    <div class="paso-cuerpo">${cuerpo}</div>
    <div class="paso-nav"><button class="btn" data-act="rapido-ir" data-i="${i-1}" ${i===0?'disabled':''}>Atrás</button>
      ${i<N_RAPIDAS-1?`<button class="btn primary" data-act="rapido-ir" data-i="${i+1}">Siguiente</button>`:'<button class="btn primary" data-act="rapido-listo">Ver mi resultado</button>'}</div>
  </section>`;
}

export function viewWizard(){
  if(S.wizModo!=='completo')return viewRapido();
  const f=S.farm,s=S.step;let body='';
  const ed=(l,i)=>`<button class="btn sm" data-act="edit" data-list="${l}" data-i="${i}">Editar</button><button class="btn sm" data-act="rm" data-list="${l}" data-i="${i}">Quitar</button>`;
  if(s===0)body=`<h2>Cuéntanos de tu finca</h2><div class="fields">
    ${field('w-nombre','Nombre de la finca','farm.nombre',f.nombre)}
    ${field('w-depto','Departamento','farm.depto',f.depto)}
    ${field('w-area','Área total','farm.area',f.area,'number','Hectáreas')}
    ${field('w-areap','Área productiva','farm.areaProd',f.areaProd,'number','Hectáreas')}
    ${field('w-alt','Altitud','farm.altitud',f.altitud,'number','Metros sobre el nivel del mar')}
    ${select('w-pend','Pendiente predominante','farm.pendiente',f.pendiente,[['plana','Plana'],['ondulada','Ondulada'],['fuerte','Fuerte']])}
    ${field('w-fuente','Fuente de agua principal','farm.fuenteAgua',f.fuenteAgua,'text','Pozo, quebrada, río, reservorio')}
    ${field('w-dist','Distancia al cuerpo de agua más cercano','farm.distAgua',f.distAgua,'number','Metros',true)}
  </div>${f.areaProd>f.area&&f.area>0?'<p class="warnmsg">El área productiva no puede ser mayor que el área total.</p>':''}
  ${bloqueUbicacion()}`;
  if(s===1)body=`<h2>¿Tienes cultivos?</h2>
    <div class="choice"><button data-act="cult-yes" aria-pressed="${f.tieneCultivos}">Sí, tengo cultivos</button><button data-act="cult-no" aria-pressed="${!f.tieneCultivos}">No, es con fines académicos</button></div>
    ${f.tieneCultivos?`<div class="list">${f.cultivos.map((c,i)=>`<div class="item"><span class="grow"><b>${esc(c.nombre)}</b> · ${c.ha} ha · siembra ${mlist(c.siembra)} · cosecha ${mlist(c.cosecha)}</span>${ed('cultivos',i)}</div>`).join('')||'<p class="muted">Aún no hay cultivos.</p>'}</div>
    <div class="subform"><h3>Agregar cultivo</h3><div class="fields">${field('c-nom','Cultivo','draftCult.nombre',S.draftCult.nombre)}${field('c-ha','Área','draftCult.ha',S.draftCult.ha||'','number','Hectáreas')}</div>
    <div class="f"><span class="label">Meses de siembra</span>${months('draftCult.siembra',S.draftCult.siembra)}</div>
    <div class="f"><span class="label">Meses de cosecha</span>${months('draftCult.cosecha',S.draftCult.cosecha)}</div>
    <div><button class="btn" data-act="add-cult">Agregar cultivo</button></div></div>
    <div class="cabeza-titulo"><h3>Cultivos aledaños</h3>${ayuda('aledanos','Cultivos de fincas vecinas: sus aplicaciones y floración también llegan a tu finca.')}</div>
    <div class="list">${f.cultivosAledanos.map((c,i)=>`<div class="item"><span class="grow"><b>${esc(c.nombre)}</b>${c.distancia!=null?` · a ${c.distancia} m`:''}</span>${ed('cultivosAledanos',i)}</div>`).join('')||'<p class="muted">Sin cultivos aledaños registrados.</p>'}</div>
    <div class="subform"><div class="fields">${field('v-nom','Cultivo vecino','draftVecino.nombre',S.draftVecino.nombre)}${numOpc('v-dist','Distancia aproximada','draftVecino.distancia',S.draftVecino.distancia,'Metros, opcional')}</div><div><button class="btn" data-act="add-vecino">Agregar cultivo aledaño</button></div></div>`
    :`<div class="cabeza-titulo"><h3>¿Para qué quieres usar la app en esta finca?</h3>${ayuda('proposito','Elige uno o varios propósitos. El dashboard se enfocará en los módulos de cada uno. Esta lista crecerá con nuevos módulos.')}</div>
    <div class="choice">${CONFIG.propositos.map(p=>`<button data-act="proposito" data-id="${p.id}" aria-pressed="${f.proposito.includes(p.id)}">${esc(p.nombre)}<span class="muted small block fw-400">${esc(p.detalle)}</span></button>`).join('')}</div>
    `}`;
  if(s===2){
    const formEsp=(sec)=>`<div class="subform"><h3>Agregar en ${SECCIONES[sec].titulo.toLowerCase()}</h3><div class="fields">
      ${field('e-nom','Nombre científico o común','draftEsp.nombre',S.draftEsp.nombre)}
      ${SECCIONES[sec].tipos.length>1?select('e-tipo','Tipo','draftEsp.tipo',S.draftEsp.tipo,SECCIONES[sec].tipos.map(t=>[t,t])):''}
      ${select('e-orig','Origen','draftEsp.origen',S.draftEsp.origen,[['nativa','Nativa'],['exótica','Exótica'],['desconocido','No sé']])}
      ${select('e-pres','Nivel de presencia (opcional)','draftEsp.presencia',S.draftEsp.presencia,PRES)}
    </div>${grupoPresencia(S.draftEsp.tipo)?`<p class="muted small">Nivel de presencia: ${esc(textoUmbrales(grupoPresencia(S.draftEsp.tipo)))}</p>`:''}
    ${sec==='fauna'?'':`<div class="f"><span class="label">Calendario de floración</span>${months('draftEsp.floracion',S.draftEsp.floracion)}</div>
    <div class="row"><label class="check"><input id="e-atrae" type="checkbox" data-bind="draftEsp.atrae" ${S.draftEsp.atrae?'checked':''}> Atrae polinizadores</label>
    <label class="check"><input id="e-riesgo" type="checkbox" data-bind="draftEsp.riesgo" data-rerender ${S.draftEsp.riesgo?'checked':''}> Es un riesgo para polinizadores</label></div>
    ${S.draftEsp.riesgo?`<div class="fields">
      ${numOpc('e-cant','Número de individuos','draftEsp.cantidad',S.draftEsp.cantidad,'En la finca o su borde')}
      ${numOpc('e-cd','Diámetro de copa (m)','draftEsp.copaD',S.draftEsp.copaD,'Opcional: promedio de dos medidas')}
      ${numOpc('e-ch','Altura de copa (m)','draftEsp.copaH',S.draftEsp.copaH,'Opcional')}
    </div><p class="muted small">Con estas medidas la app estima el volumen de copa (Osorio 2025, Ec. 3).</p>`:''}`}
    <div class="row"><button class="btn" data-act="add-esp">Agregar</button><button class="btn" data-act="esp-seccion" data-sec="">Cancelar</button></div></div>`;
    const seccion=(sec)=>{const X=SECCIONES[sec];const items=f.especies.map((e,i)=>[e,i]).filter(([e])=>X.tipos.includes(e.tipo));
      return `<div class="f"><div class="cabeza-titulo"><h3>${X.titulo}</h3>${ayuda(`sec-${sec}`,X.pista)}</div>
      <div class="list">${items.map(([e,i])=>`<div class="item"><span class="grow"><b><i>${esc(e.nombre)}</i></b> · ${e.tipo} · ${e.origen}${e.floracion.length?` · florece ${mlist(e.floracion)}`:''}${e.cantidad?` · ${e.cantidad} ind.`:''}${e.copaD&&e.copaH?` · copa ${e.copaD}×${e.copaH} m`:''}${presTxt(e.presencia)}</span>${e.atrae?'<span class="chip">Atrae polinizadores</span>':''}${e.riesgo?'<span class="chip r">Riesgo para polinizadores</span>':''}${ed('especies',i)}</div>`).join('')||'<p class="muted">Ninguna registrada.</p>'}</div>
      ${S.espSeccion===sec?formEsp(sec):`<div><button class="btn sm" data-act="esp-seccion" data-sec="${sec}">Agregar en esta sección</button></div>`}</div>`;};
    const unicos=[...new Map(f.cultivos.map(c=>[c.nombre.trim().toLowerCase(),c])).values()];
    const sug=f.tieneCultivos?unicos.map(c=>{const ya=new Set(f.plagas.map(p=>p.nombre));const l=plagasDe(c.nombre).filter(n=>!ya.has(n));
      return l.length?`<p>Tu cultivo es <b>${esc(c.nombre)}</b>: ¿cuáles de estas plagas o enfermedades presentas?</p><div class="row">${l.map(n=>`<button class="btn sm" data-act="plaga-sug" data-n="${esc(n)}" data-c="${esc(c.nombre)}">+ ${esc(n)}</button>`).join('')}</div>`
        :plagasDe(c.nombre).length?'':`<p class="muted small">Para <b>${esc(c.nombre)}</b> no hay lista sugerida: agrega sus plagas abajo.</p>`;}).join(''):'';
    body=`<h2>¿Qué especies hay en tu finca?</h2>
    <div class="f"><h3>Plagas y enfermedades${f.tieneCultivos?' de tus cultivos':''}</h3>${sug}
      ${sug?'<p class="muted small">Lista sugerida, por validar con un especialista. Toca una para agregarla y luego edita sus meses y severidad.</p>':''}
      <div class="list">${f.plagas.map((p,i)=>`<div class="item"><span class="grow"><b>${esc(p.nombre)}</b>${p.cultivo?` · en ${esc(p.cultivo)}`:''} · severidad ${p.severidad} · ${p.meses.length?mlist(p.meses):'<span class="warnmsg inline">sin meses</span>'}${presTxt(p.presencia)}</span>${ed('plagas',i)}</div>`).join('')||'<p class="muted">Sin plagas registradas.</p>'}</div>
      <div class="subform"><div class="fields">${field('g-nom','Plaga o enfermedad','draftPlaga.nombre',S.draftPlaga.nombre)}
        ${f.cultivos.length?select('g-cult','Cultivo','draftPlaga.cultivo',S.draftPlaga.cultivo,[['','General'],...f.cultivos.map(c=>[c.nombre,c.nombre])]):''}
        ${select('g-sev','Severidad','draftPlaga.severidad',S.draftPlaga.severidad,[['baja','Baja'],['media','Media'],['alta','Alta']])}
        ${select('g-pres','Nivel de presencia (opcional)','draftPlaga.presencia',S.draftPlaga.presencia,PRES)}</div>
      <p class="muted small">Nivel de presencia: ${esc(textoUmbrales('plagas'))}</p>
      <div class="f"><span class="label">Meses en que aparece</span>${months('draftPlaga.meses',S.draftPlaga.meses)}</div><div><button class="btn" data-act="add-plaga">Agregar plaga</button></div></div></div>
    ${Object.keys(SECCIONES).filter(k=>k!=='cultivos'||f.tieneCultivos).map(seccion).join('')}`;
  }
  const plan=f.fertPlan.length>0;
  const plag=f.plaguicidas;
  if(s===3)body=`<h2>¿Qué prácticas agrícolas usas?</h2><div class="fields">
    ${select('p-riego','Sistema de riego','farm.riego',f.riego,[['gravedad','Gravedad'],['aspersion','Aspersión'],['goteo','Goteo'],['ninguno','Sin riego']])}
    ${select('p-lab','Labranza','farm.labranza',f.labranza,[['convencional','Convencional'],['minima','Mínima'],['cero','Cero labranza']])}
    ${plan?'':field('p-n','Nitrógeno aplicado por año','farm.nAplicado',f.nAplicado,'number','kg N/ha')}
    ${field('p-nobj','Objetivo de nitrógeno de la finca','farm.nObjetivo',f.nObjetivo,'number','kg N/ha por ciclo: de tu análisis de suelo o tu agrónomo')}
  </div>${!plan&&f.nAplicado>0&&!f.nObjetivo?'<p class="warnmsg">Sin objetivo de nitrógeno no se puede saber si la dosis es alta.</p>':''}
  ${plan?`<p class="notice"><span>Tu fertilización sale del plan detallado: <b>${conPlan(f).nAplicado} kg N/ha</b> en ${mlist(conPlan(f).fertMeses)}.</span><button class="btn sm" data-view="fertilizacion">Ver plan</button></p>`
    :`<div class="f"><span class="label">Meses de fertilización</span>${months('farm.fertMeses',f.fertMeses)}</div>
  <p class="muted small">¿Quieres un análisis completo (N, P, K, método y efectos en suelo y agua)? <button class="btn sm" data-view="fertilizacion">Detallar en Fertilización</button></p>`}
  <h3>Plaguicidas</h3>
  <p class="notice"><span>${plag.length?`Tienes <b>${plag.length} aplicación(es)</b> registradas: ${plag.slice(0,4).map(p=>`${esc(p.producto||'Sin nombre')} (${mlist(p.meses)})`).join('; ')}${plag.length>4?` y ${plag.length-4} más`:''}.`
    :'Los plaguicidas tienen su propia pestaña: ahí registras cada producto con su ingrediente activo, dosis y meses, y la app calcula el peligro para abejas y otros himenópteros polinizadores.'}</span>
  <button class="btn sm" data-view="plaguicidas">${plag.length?'Ver plaguicidas':'Registrar plaguicidas'}</button></p>`;
  if(s===4)body=`<h2>Calendarios e historial</h2>
    <div class="f"><span class="label">Meses de lluvia fuerte</span>${months('farm.lluviaMeses',f.lluviaMeses)}
    ${tieneClima(f.clima)?(()=>{const sug=mesesLluviosos(f.clima);return sug.join()===f.lluviaMeses.join()?`<span class="hint">Coinciden con el clima de tu ubicación (${CONFIG.clima.lluviaFuerteMm} mm o más al mes).</span>`:`<span class="hint">Según el clima de tu ubicación: ${mlist(sug)} (${CONFIG.clima.lluviaFuerteMm} mm o más al mes). <button class="btn sm" data-clima="lluvia">Usar los del clima</button></span>`;})():'<span class="hint">Pon la ubicación en el paso Finca y la app los sugiere con el clima.</span>'}</div>
    <div class="f"><span class="label">Meses con suelo desnudo</span>${months('farm.sueloDesnudoMeses',f.sueloDesnudoMeses)}</div>
    <p class="muted small">Las plagas se registran en el paso 3, Especies.</p>`;
  if(s===5)body=`<div class="cabeza-titulo"><h2>¿Eres o quieres ser certificado por GLOBALG.A.P.?</h2>${ayuda('gg','Tu respuesta no cambia el cálculo de riesgo. Solo agrega la guía de requisitos de IFA v6 en la pestaña Auditoría. La app no verifica ninguna certificación: muestra lo que tú declaras.')}</div>
    <div class="choice">
      <button data-act="gg" data-v="si" aria-pressed="${f.gg==='si'}">Sí, ya estoy certificado</button>
      <button data-act="gg" data-v="quiero" aria-pressed="${f.gg==='quiero'}">Quiero certificarme</button>
      <button data-act="gg" data-v="no" aria-pressed="${f.gg==='no'}">No por ahora</button>
    </div>`;
  return `<section class="panel paso">
    <div class="paso-top"><p class="label">Cuestionario completo</p><button class="enlace" data-act="wiz-modo" data-v="rapido">Volver a lo básico</button></div>
    <div class="progreso" role="progressbar" aria-valuemin="1" aria-valuemax="${STEPS.length}" aria-valuenow="${s+1}" aria-label="Paso ${s+1} de ${STEPS.length}"><span style="width:${(s+1)/STEPS.length*100}%"></span></div>
    <div class="steps" role="group" aria-label="Pasos">${STEPS.map((t,i)=>`<button type="button" data-step="${i}" class="${i===s?'now':i<s?'done':''}" ${i===s?'aria-current="step"':''}>${i+1}. ${t}</button>`).join('')}</div>
    ${body}
    <div class="paso-nav"><button class="btn" data-act="prev" ${s===0?'disabled':''}>Atrás</button>
    ${s<STEPS.length-1?`<button class="btn primary" data-act="next">Siguiente</button>`:`<button class="btn primary" data-act="finish">Ver mi dashboard</button>`}</div>
  </section>`;
}
