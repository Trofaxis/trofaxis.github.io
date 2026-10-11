// Gráficos SVG: índice global (gauge), radar, presión por mes, calendario, plantillas y diferencias del simulador.
import { M, MFULL, esc } from '../core/utils.js';
import { TPL } from '../core/state.js';

export function gauge(v,level){
  const col=level==='Alto'?'var(--crit)':level==='Medio'?'var(--warn)':'var(--good)';
  return `<div class="gauge"><svg viewBox="0 0 200 118" role="img" aria-label="Índice ambiental ${v} de 100, riesgo ${level.toLowerCase()}">
    <path d="M20 100 A80 80 0 0 1 180 100" pathLength="100" fill="none" stroke="var(--chip)" stroke-width="16" stroke-linecap="round"/>
    <path d="M20 100 A80 80 0 0 1 180 100" pathLength="100" fill="none" stroke="${col}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${Math.max(v,1)} 100"/>
    <text x="100" y="88" text-anchor="middle" font-size="38" font-weight="600" fill="var(--ink)" font-family="JetBrains Mono, monospace">${v}</text>
    <text x="20" y="116" text-anchor="middle" font-size="11" fill="var(--muted)">0</text>
    <text x="180" y="116" text-anchor="middle" font-size="11" fill="var(--muted)">100</text></svg>
    <span class="pill ${level}">Riesgo ${level.toLowerCase()}</span></div>`;
}
export function radar(mods){
  const cx=240,cy=165,R=105,n=mods.length;
  const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+r*Math.cos(a),cy+r*Math.sin(a)]};
  let g='';[25,50,75,100].forEach(v=>{g+=`<polygon points="${mods.map((_,i)=>pt(i,R*v/100).join(',')).join(' ')}" fill="none" stroke="var(--line)" stroke-width="1"/>`;});
  mods.forEach((m,i)=>{const[x,y]=pt(i,R);g+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)"/>`;
    const[lx,ly]=pt(i,R+20);const anchor=Math.abs(lx-cx)<8?'middle':lx>cx?'start':'end';
    g+=`<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="12.5" fill="var(--muted)">${m.nombre}</text><text x="${lx}" y="${ly+15}" text-anchor="${anchor}" font-size="13" font-weight="600" fill="var(--ink)">${m.score}</text>`;});
  g+=`<text x="${cx+4}" y="${cy-R*.5+4}" font-size="10" fill="var(--muted)">50</text>`;
  const poly=mods.map((m,i)=>pt(i,R*m.score/100).join(',')).join(' ');
  g+=`<polygon points="${poly}" fill="var(--accent)" fill-opacity=".22" stroke="var(--accent)" stroke-width="2"/>`;
  mods.forEach((m,i)=>{const[x,y]=pt(i,R*m.score/100);const c=m.level==='Alto'?'var(--crit)':m.level==='Medio'?'var(--warn)':'var(--good)';
    g+=`<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="var(--surface)" stroke-width="1.5"><title>${m.nombre}: ${m.score} (${m.level})</title></circle>`;});
  return `<svg viewBox="0 0 480 320" role="img" aria-label="Perfil de riesgo ambiental por módulo" style="width:100%;max-width:480px;height:auto;display:block;margin:0 auto">${g}</svg>`;
}
export function pressureChart(mh){
  const W=640,H=190,L=30,T=22,B=30,iw=W-L-8,ih=H-T-B;const mx=Math.max(3,...mh.map(a=>a.length));
  const y=v=>T+ih-(v/mx)*ih;const bw=iw/12*.6;let g='';
  for(let v=0;v<=mx;v++)g+=`<line x1="${L}" x2="${W-8}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${v}</text>`;
  mh.forEach((a,i)=>{const cx=L+iw*(i+.5)/12;const n=a.length;const col=n>=2?'var(--crit)':'var(--warn)';
    if(n)g+=`<rect x="${cx-bw/2}" y="${y(n)}" width="${bw}" height="${T+ih-y(n)}" rx="3" fill="${col}"><title>${MFULL[i]}: ${a.join('; ')}</title></rect><text x="${cx}" y="${y(n)-5}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">${n}</text>`;
    else g+=`<rect x="${cx-bw/2}" y="${T+ih-3}" width="${bw}" height="3" rx="1.5" fill="var(--good)"><title>${MFULL[i]}: sin coincidencias</title></rect>`;
    g+=`<text x="${cx}" y="${H-10}" text-anchor="middle" font-size="12" fill="var(--muted)">${M[i]}</text>`;});
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Coincidencias de riesgo por mes" style="width:100%;min-width:480px;height:auto">${g}</svg>`;
}
export function calRow(name,months,cls,hits){
  return `<tr><th class="rowh" scope="row">${name}</th>${M.map((m,i)=>{const h=hits&&hits.includes(i);return `<td class="${months.includes(i)?cls:''}${h?' hit':''}" title="${name}: ${m}">${h?'!':''}</td>`}).join('')}</tr>`;
}
// Módulo dueño de cada coincidencia de riesgo (según el módulo que la puntúa: polinizadores.js, fertilizacion.js, suelo.js, troficas.js).
const MOD_COINC={'Aplicación durante floración visitada':'Polinizadores','Fertilización con lluvia fuerte':'Fertilización','Suelo desnudo con lluvia':'Suelo','Amplio espectro con plaga presente':'Cadenas tróficas','Aplicación en mes de cosecha':'Cadenas tróficas'};
// Intensidad por mes a partir de R.mh: [{mes, n, mods:{módulo:n}, items:[texto]}].
export function intensidadMeses(mh){
  return mh.map((a,i)=>{const mods={};a.forEach(t=>{const m=MOD_COINC[t]||'Otro';mods[m]=(mods[m]||0)+1;});return {mes:i,n:a.length,mods,items:a};});
}
export function leyendaCal(mh){
  const sw=(c,t)=>`<span class="lg"><i class="sw ${c}"></i>${t}</span>`;
  const inten=intensidadMeses(mh);
  return `<div class="legend" role="list" aria-label="Leyenda del calendario">
    ${sw('on-flor','Floración visitada por polinizadores')}${sw('on-riesgo','Floración de especies de riesgo')}${sw('on-apl','Aplicación de plaguicidas')}${sw('on-cult','Siembra / cosecha')}${sw('on-gen','Fertilización, lluvia, suelo desnudo, plagas')}${sw('hit','! Coincidencia de riesgo')}
  </div>
  <div class="scroll"><table class="inten"><caption class="muted small">Intensidad por mes: número de coincidencias de riesgo y módulo que las puntúa</caption><thead><tr>${M.map(m=>`<th scope="col">${m}</th>`).join('')}</tr></thead><tbody><tr>${inten.map(x=>`<td class="i${Math.min(x.n,3)}" title="${M[x.mes]}: ${x.n?x.items.join('; '):'sin coincidencias'}"><b>${x.n}</b>${Object.entries(x.mods).map(([k,v])=>`<span>${k}${v>1?' ×'+v:''}</span>`).join('')}</td>`).join('')}</tr></tbody></table></div>`;
}
export function dlt(a,b){const d=b-a;return `<span class="delta ${d<0?'down':d>0?'up':'zero'}">${d>0?'+':''}${d}</span>`;}
export function tplChart(t){
  const def=TPL[t.tipo];const rows=t.rows;let acc=0;
  const vals=rows.map(r=>def.acum?(acc+=Number(r.valor)||0):(Number(r.valor)||0));
  const maxV=Math.max(t.objetivo||0,...vals,1)*1.15;
  const W=640,H=240,L=48,B=32,T=16,Rr=16,iw=W-L-Rr,ih=H-T-B,bw=rows.length?Math.min(48,iw/rows.length*0.6):0;
  const y=v=>T+ih-(v/maxV)*ih;
  let g='';[0,.25,.5,.75,1].forEach(k=>{const v=maxV*k;g+=`<line x1="${L}" x2="${W-Rr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${Math.round(v)}</text>`;});
  rows.forEach((r,i)=>{const cx=L+iw*(i+.5)/rows.length;const v=vals[i];const over=t.objetivo>0&&v>t.objetivo;
    g+=`<rect x="${cx-bw/2}" y="${y(v)}" width="${bw}" height="${T+ih-y(v)}" rx="3" fill="${over?'var(--crit)':'var(--accent)'}" fill-opacity="${over?.85:.75}"><title>${esc(r.fecha)} · ${esc(r.lote)}: ${v} ${def.unidad}</title></rect>
    <text x="${cx}" y="${H-12}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(String(r.fecha).slice(5))}</text>
    <text x="${cx}" y="${y(v)-6}" text-anchor="middle" font-size="11" fill="var(--ink)">${Math.round(v)}</text>`;});
  if(t.objetivo>0)g+=`<line x1="${L}" x2="${W-Rr}" y1="${y(t.objetivo)}" y2="${y(t.objetivo)}" stroke="var(--pollen)" stroke-width="2" stroke-dasharray="6 4"/><text x="${W-Rr}" y="${y(t.objetivo)-6}" text-anchor="end" font-size="11" fill="var(--pollen)">Objetivo ${t.objetivo}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Registros frente al objetivo" style="width:100%;min-width:480px;height:auto">${g}</svg>`;
}
