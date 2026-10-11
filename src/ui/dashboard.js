// Vista: Dashboard de riesgo. Lectura de arriba abajo: índice global, perfil por módulo,
// presión por mes, calendario, simulador, plan de acción, GLOBALG.A.P. y respaldo de datos.
import { M, MFULL, esc, inter } from '../core/utils.js';
import { S } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { evaluar, simular, nivel } from '../core/engine.js';
import { configEfectiva, normalizarAjustes } from '../core/storage.js';
import { gauge, gaugeSinDatos, radar, pressureChart, calRow, dlt, leyendaCal, filaIntensidad } from './charts.js';
import { panelVecinosDashboard, panelRelaciones } from './casos.js';
import { conPlan } from '../fert/calculo.js';
import { ESTADOS } from '../core/rubrica.js';
import { calcular } from '../riego/calculo.js';
import { validar } from '../riego/reglas.js';
import { panelMapa } from './mapa.js';
import { pastillaPuntaje } from './components.js';
import { panelClima } from './clima.js';
import { panelApiRadar } from './apiradar.js';

// Hallazgos del módulo Riego, solo si el usuario cargó o escribió sus propios datos (no el caso de ejemplo).
export function extraRiego(){
  if(S.riego.fuente==='ejemplo')return {};
  try{return {riego:validar(calcular(S.riego.datos),S.riego.declarados||{})};}catch{return {};}
}

// Tabla de la rúbrica de un módulo: qué variable, con qué valor, qué puntaje, cuánto pesa y de dónde sale.
function tablaRubrica(m,cfg){
  return `<div class="scroll"><table class="data rubrica"><thead><tr><th>Variable</th><th>Valor</th><th class="num">Puntaje</th><th class="num">Peso</th></tr></thead><tbody>
    ${m.variables.filter(v=>v.aplica!==false).map(v=>`<tr><td>${esc(v.nombre)}<div class="estado ${v.estado.replace(' ','-')}" title="${esc(v.fuente)}">${ESTADOS[v.estado]}${v.fuente?' ⓘ':''}</div></td><td>${esc(v.valor)}</td><td class="num">${pastillaPuntaje(v.puntaje,cfg)}</td><td class="num">${v.peso}</td></tr>`).join('')}
  </tbody></table></div>
  <p class="muted small">Riesgo = Σ peso × puntaje ÷ Σ peso, solo con las variables que tienen dato. Pesos y cortes: criterio propio, por validar.</p>`;
}

export function viewDashboard(){
  const cfg=configEfectiva(normalizarAjustes(S.ajustes));
  const f=conPlan(S.farm),X=extraRiego(),R=evaluar(f,cfg,X),mods=R.mods;
  if(!mods.length)return `<section class="panel"><h2>No hay módulos activos</h2><p class="muted">Activa al menos uno en Ajustes.</p></section>`;
  const conDatos=mods.filter(m=>m.suficiente);
  const top=[...conDatos].sort((a,b)=>b.score-a.score)[0];
  const hotM=R.mh.map((a,i)=>[i,a.length]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
  const recs=mods.flatMap(m=>m.recs.map(r=>({k:m.id+'|'+r,m:m.nombre,lv:m.suficiente?m.level:'Sin datos',r}))).sort((a,b)=>({Alto:0,Medio:1,Bajo:2,'Sin datos':3}[a.lv]-{Alto:0,Medio:1,Bajo:2,'Sin datos':3}[b.lv]));
  const doneN=recs.filter(x=>S.done[x.k]).length;
  const gg=f.gg!=='no';
  const allowed=Math.floor(Math.max(0,f.minorAplicables)*CONFIG.globalgap.margenMinorMusts);const remaining=allowed-f.minorFallas;
  const anySim=Object.values(S.sim).some(Boolean);const RS=anySim?simular(f,S.sim,cfg,X):R;
  const lvO=nivel(R.overall,cfg);
  const pesoTotal=mods.reduce((s,m)=>s+(cfg.pesos[m.id]??0),0);
  const pesosTxt=mods.map(m=>`${m.nombre.toLowerCase()} ${Math.round((cfg.pesos[m.id]??0)/pesoTotal*100)} %`).join(', ');
  const simOpts=[['n','Ajustar el nitrógeno al objetivo',f.nObjetivo>0&&f.nAplicado>f.nObjetivo?`De ${f.nAplicado} a ${f.nObjetivo} kg N/ha; el fósforo y el potasio no cambian`:'La dosis ya está en el objetivo',!(f.nObjetivo>0&&f.nAplicado>f.nObjetivo)],
    ['pol','Aplicar fuera de la floración','Quita las aplicaciones de los meses con polinizadores',!R.ov1.length],
    ['selec','Cambiar amplio espectro por selectivo','Reduce la presión sobre enemigos naturales',!f.plaguicidas.some(p=>p.clase==='amplio')],
    ['riego','Pasar a riego por goteo','Desde gravedad o aspersión',!(f.riego==='gravedad'||f.riego==='aspersion')],
    ['suelo','Cubrir el suelo en lluvias','Cobertura y labranza mínima',!(f.sueloDesnudoMeses.length||f.labranza==='convencional')]];
  return `
  ${S.msg?`<div class="notice" role="status"><span>${esc(S.msg)}</span></div>`:''}
  ${S.demo?`<div class="notice"><span><b>Datos de ejemplo.</b> Esta finca es ficticia: los meses, dosis y especies sirven para mostrar cómo funciona la app, no son mediciones.</span><button class="btn sm" data-act="start-empty">Empezar con mi finca</button></div>`:''}
  <section class="panel">
    <div class="row between">
      <div style="min-width:0"><p class="label">Finca</p><h1>${esc(f.nombre||'Finca sin nombre')}</h1><p class="muted">${esc(f.depto||'Sin departamento')} · ${f.area||0} ha · ${f.altitud||0} msnm · pendiente ${f.pendiente||'sin responder'}${!f.tieneCultivos&&f.proposito.length?` · propósito: ${CONFIG.propositos.filter(p=>f.proposito.includes(p.id)).map(p=>p.nombre.toLowerCase()).join(', ')}`:''}</p></div>
      <div class="row"><button class="btn" data-view="wizard">Editar respuestas</button><button class="btn" data-act="export">Exportar finca</button><button class="btn" data-act="import">Importar finca</button></div>
    </div>
    <div class="hero">
      <div class="stats">
        <div><div class="k">Mayor riesgo</div><div class="v">${top?`${top.nombre} · ${top.score}`:'Sin datos suficientes'}</div></div>
        <div><div class="k">Módulos en alto</div><div class="v">${conDatos.filter(m=>m.level==='Alto').length} de ${conDatos.length}</div></div>
        <div><div class="k">Mes más cargado</div><div class="v">${hotM.length?`${MFULL[hotM[0][0]][0].toUpperCase()+MFULL[hotM[0][0]].slice(1)} (${hotM[0][1]})`:'Ninguno'}</div></div>
        <div><div class="k">Meses con coincidencias</div><div class="v">${hotM.length} de 12</div></div>
        <div><div class="k">Datos completos</div><div class="v">${Math.round(R.conf*100)} %</div></div>
        <div><div class="k">GLOBALG.A.P.</div><div class="v">${f.gg==='si'?'Certificado':f.gg==='quiero'?'En camino':'No aplica'}</div></div>
      </div>
      <div><p class="label" style="text-align:center">Índice ambiental global</p>${R.sinDatos?gaugeSinDatos():gauge(R.overall,lvO)}</div>
    </div>
    <p class="muted small">El índice promedia los módulos con datos suficientes (confianza de al menos ${Math.round((cfg.confianzaMinima??0)*100)} %); cada módulo es una rúbrica de variables con peso y fuente. Pesos por calibrar: ${pesosTxt}.${R.sinDatos?' Todavía ningún módulo tiene datos suficientes: responde el cuestionario para ver el índice.':R.parcial?` Hoy usa ${conDatos.length} de ${mods.length} módulos; faltan datos en ${mods.filter(m=>!m.suficiente).map(m=>m.nombre.toLowerCase()).join(', ')}.`:''}</p>
  </section>
  <div class="grid2">
    <section class="panel"><div><h2>Perfil de riesgo ambiental</h2><p class="muted">Índice de 0 a 100 por módulo. Más lejos del centro, más riesgo.</p></div>${conDatos.length>=3?radar(conDatos):'<p class="muted small">El perfil se dibuja cuando al menos 3 módulos tienen datos suficientes.</p>'}${panelMapa()}${panelClima()}</section>
    <section class="panel"><h2>Riesgo por módulo</h2><div class="cards">
      ${mods.map(m=>`<article class="card">
        <div class="top"><h3>${m.nombre}</h3>${m.suficiente?`<span class="pill ${m.level}">${m.level}</span>`:'<span class="pill sin-datos" title="Sin datos suficientes">Sin datos</span>'}</div>
        <div class="score">${m.suficiente?m.score:'—'}</div>
        <div class="bar-track" aria-hidden="true">${m.suficiente?`<span class="fill-${m.level}" style="width:${m.score}%"></span>`:''}</div>
        <p class="muted small">${m.suficiente?`Causa principal: ${m.driver}`:'Faltan datos para calificar este módulo; no entra al índice global.'}</p>
        <div><div class="row between small muted"><span>Confianza de datos</span><span>${Math.round(m.conf*100)} %</span></div><div class="conf"><span style="width:${m.conf*100}%"></span></div></div>
        <details><summary>Ver rúbrica (${m.variables.filter(v=>v.aplica!==false).length} variables)</summary>${tablaRubrica(m,cfg)}</details>
      </article>`).join('')}
    </div></section>
  </div>
  ${panelApiRadar(f,cfg,X)}
  <section class="panel">
    <div><h2>Presión por mes</h2><p class="muted">Cuántas coincidencias de riesgo caen en cada mes. Pasa el cursor sobre una barra para ver cuáles son.</p></div>
    <div class="scroll">${pressureChart(R.mh)}</div>
    ${hotM.length?`<ul class="plan" style="gap:4px">${hotM.slice(0,3).map(([i])=>`<li style="border:none;padding:0"><span class="tag">${M[i]}</span><span class="txt small">${R.mh[i].join(' · ')}</span></li>`).join('')}</ul>`:'<p class="muted small">No hay coincidencias de riesgo en ningún mes.</p>'}
  </section>
  <section class="panel">
    <div><h2>Cruce de calendarios</h2><p class="muted">Los meses marcados con ! son coincidencias de riesgo.</p></div>
    <div class="scroll"><table class="cal"><thead><tr><th></th>${M.map(m=>`<th scope="col">${m}</th>`).join('')}</tr></thead><tbody>
      ${calRow('Floración visitada por polinizadores',R.atraeFlor,'on-flor')}
      ${calRow('Floración de especies de riesgo',R.riesgoFlor,'on-riesgo')}
      ${calRow('Aplicación de plaguicidas',R.aplic,'on-apl',R.ov1)}
      ${calRow('Siembra',R.siembraM,'on-cult')}
      ${calRow('Cosecha',R.cosechaM,'on-cult',inter(R.aplic,R.cosechaM))}
      ${calRow('Fertilización',f.fertMeses,'on-gen',inter(f.fertMeses,f.lluviaMeses))}
      ${calRow('Lluvia fuerte',f.lluviaMeses,'on-gen')}
      ${calRow('Suelo desnudo',f.sueloDesnudoMeses,'on-gen',inter(f.sueloDesnudoMeses,f.lluviaMeses))}
      ${calRow('Plagas',R.plagaM,'on-gen',inter(R.amplio,R.plagaM))}
    </tbody><tfoot>${filaIntensidad(R.mh)}</tfoot></table></div>
    ${leyendaCal()}
  </section>
  <section class="panel">
    <div><h2>¿Qué pasa si cambias algo?</h2><p class="muted">Activa uno o varios cambios y mira cómo se mueve el riesgo. No modifica tus respuestas.</p></div>
    <div class="sim">${simOpts.map(o=>`<button type="button" data-sim="${o[0]}" aria-pressed="${S.sim[o[0]]}" ${o[4]?'disabled':''}>${o[1]}<span>${o[2]}</span></button>`).join('')}</div>
    <div class="scroll"><table class="data"><thead><tr><th>Módulo</th><th class="num">Ahora</th><th class="num">Con cambios</th><th class="num">Diferencia</th></tr></thead><tbody>
      ${mods.map((m,i)=>`<tr><td>${m.nombre}</td><td class="num">${m.score}</td><td class="num">${RS.mods[i].score}</td><td class="num">${dlt(m.score,RS.mods[i].score)}</td></tr>`).join('')}
      <tr><td><b>Índice global</b></td><td class="num"><b>${R.sinDatos?'—':R.overall}</b></td><td class="num"><b>${RS.sinDatos?'—':RS.overall}</b></td><td class="num">${R.sinDatos||RS.sinDatos?'':dlt(R.overall,RS.overall)}</td></tr>
    </tbody></table></div>
    ${anySim?`<div><button class="btn sm" data-act="sim-reset">Quitar todos los cambios</button></div>`:''}
  </section>
  <section class="panel"><div class="row between"><div><h2>Plan de acción</h2><p class="muted">Ordenado por riesgo del módulo. Marca lo que ya hiciste.</p></div>${recs.length?`<span class="pill Bajo" style="color:var(--ink)">${doneN} de ${recs.length} hechas</span>`:''}</div>
    ${recs.length?`<ul class="plan">${recs.map((x,i)=>`<li class="${S.done[x.k]?'done':''}"><input type="checkbox" id="rec-${i}" data-done="${esc(x.k)}" ${S.done[x.k]?'checked':''} aria-label="Marcar como hecha"><span class="tag">${x.m} · ${x.lv}</span><label class="txt" for="rec-${i}">${esc(x.r)}</label></li>`).join('')}</ul>`:'<p class="muted">No hay recomendaciones con los datos actuales.</p>'}
  </section>
  ${panelVecinosDashboard()}
  ${panelRelaciones()}
  ${gg?`<section class="panel">
    <div><h2>Panel GLOBALG.A.P. IFA v6</h2><p class="muted">Guía de referencia. No reemplaza la auditoría ni garantiza el resultado.</p></div>
    <div class="grid2">
      <div style="display:flex;flex-direction:column;gap:12px;min-width:0">
        <h3>Margen de Minor Musts</h3>
        <div class="row">
          <div class="f" style="width:150px"><label for="mm-apl">Aplicables</label><input id="mm-apl" type="number" min="0" data-bind="farm.minorAplicables" data-rerender value="${f.minorAplicables}"></div>
          <div class="f" style="width:150px"><label for="mm-fal">Incumplidos</label><input id="mm-fal" type="number" min="0" data-bind="farm.minorFallas" data-rerender value="${f.minorFallas}"></div>
        </div>
        <p>Se permiten <b>${allowed}</b> incumplimientos (${Math.round(CONFIG.globalgap.margenMinorMusts*100)} % redondeado hacia abajo). ${remaining>=0?`Quedan <b>${remaining}</b>.`:`<b style="color:var(--crit)">Se superó el margen por ${-remaining}: no se cumple la regla del 95 %.</b>`}</p>
        <div class="meter" aria-label="Margen de Minor Musts">${Array.from({length:Math.max(allowed,f.minorFallas)},(_,i)=>`<i class="${i<f.minorFallas?'used':'free'}" title="${i<f.minorFallas?'Usado':'Disponible'}"></i>`).join('')||'<span class="muted">Sin margen con este número de criterios.</span>'}</div>
        <p class="muted small">Los Major Musts deben cumplirse al 100 %; uno solo incumplido impide la certificación.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;min-width:0">
        <h3>No conformidades abiertas</h3>
        <div class="scroll"><table class="data"><thead><tr><th>Criterio</th><th class="num">Días abiertos</th><th class="num">Quedan</th><th></th></tr></thead><tbody>
          ${f.nc.map((n,i)=>{const q=CONFIG.globalgap.diasCierreNC-n.dias;return`<tr><td>${esc(n.criterio)}</td><td class="num">${n.dias}</td><td class="num" style="color:${q<=7?'var(--crit)':'var(--ink)'}">${q>0?q+' días':'Vencida'}</td><td><button class="btn sm" data-act="rm-nc" data-i="${i}">Cerrar</button></td></tr>`}).join('')||'<tr><td colspan="4" class="muted">Ninguna.</td></tr>'}
        </tbody></table></div>
        <div class="row">
          <input id="nc-crit" aria-label="Criterio o hallazgo" placeholder="Criterio o hallazgo" data-bind="draftNC.criterio" value="${esc(S.draftNC.criterio)}" style="flex:2;min-width:160px">
          <input id="nc-dias" aria-label="Días abiertos" type="number" min="0" placeholder="Días" data-bind="draftNC.dias" value="${S.draftNC.dias||''}" style="flex:1;min-width:80px">
          <button class="btn sm" data-act="add-nc">Agregar</button>
        </div>
        <p class="muted small">Plazo máximo de ${CONFIG.globalgap.diasCierreNC} días para cerrar una no conformidad antes de la suspensión.</p>
      </div>
    </div>
    <div class="scroll"><table class="data"><thead><tr><th>Módulo</th><th>Secciones de IFA v6 frutas y verduras (Smart)</th><th class="num">Riesgo</th></tr></thead><tbody>
      ${mods.map(m=>`<tr><td>${m.nombre}</td><td>${m.ifa}</td><td class="num">${m.suficiente?`<span class="pill ${m.level}">${m.score}</span>`:'<span class="pill sin-datos">sin datos</span>'}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="muted small">Secciones por verificar con el checklist oficial de IFA v6.</p>
  </section>`:''}
  <section class="panel flat">
    <div><h3>Tus datos</h3><p class="muted small">Se guardan en este navegador (la nube es opcional, en la pestaña Casos). Para llevarlos a otro equipo, exporta un archivo o copia el respaldo en texto; para cargarlos, importa el archivo o pega el texto.</p></div>
    <div class="f"><label for="io-box">Respaldo en texto (JSON)</label><textarea id="io-box" data-bind="io" placeholder="Pega aquí un respaldo y pulsa Cargar">${esc(S.io)}</textarea></div>
    <div class="row">
      <button class="btn sm" data-act="io-copy">Copiar respaldo</button>
      <button class="btn sm" data-act="io-load">Cargar respaldo</button>
      <button class="btn sm" data-act="load-demo">Ver finca de ejemplo</button>
      ${S.confirmReset?`<button class="btn sm danger" data-act="reset-yes">Confirmar: borrar todo</button><button class="btn sm" data-act="reset-no">Cancelar</button>`:`<button class="btn sm danger" data-act="reset">Borrar mis datos</button>`}
      <span class="muted small" id="io-msg">${esc(S.ioMsg)}</span>
    </div>
  </section>`;
}
