// Vista: Plaguicidas. Cada aplicación con su producto, ingrediente activo, dosis y meses; la app calcula el peligro
// para abejas y otros himenópteros polinizadores (HQ), revisa la etiqueta y las condiciones de aplicación, y lo cruza
// con la floración, la cosecha, el riego y la fertilización de la finca.
import { tieneClima, climaDeMeses } from '../clima/normales.js';
import { esc, M, inter, uniq } from '../core/utils.js';
import { S } from '../core/state.js';
import { configEfectiva, normalizarAjustes } from '../core/storage.js';
import { months } from './components.js';
import { calRow } from './charts.js';
import { USOS, CLASES, REGISTROS, FORMULACIONES, UNIDADES_DOSIS, METODOS, DIRECCIONES, normalizarPlag } from '../plag/modelo.js';
import { INGREDIENTES, ingrediente, CONSULTA_PPDB } from '../plag/catalogo.js';
import { PRODUCTOS_SAG, ENFERMEDADES, productoSag } from '../plag/sag.js';
import { resumenPlag, peligroAbejas, productoPorHa, claseEPA, CLASE_EPA, FUENTES_PLAG, fmtHQ, nombreComp } from '../plag/calculo.js';

const NIVEL = { error: 'Error', advertencia: 'Revisar', criterio: 'Criterio', ok: 'Bien' };
const fmt = (x, d = 1) => (x == null || !Number.isFinite(x) ? '—' : x.toLocaleString('es-HN', { maximumFractionDigits: d }));
const mlist = (a) => (a.length ? a.map((m) => M[m]).join(', ') : 'sin meses');
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
// Sección plegable que recuerda si el usuario la abrió o la cerró; si no la ha tocado, se abre cuando tiene datos.
const plegable = (clave, abrir) => `data-keep="${clave}" ${(S.abiertos[clave] ?? abrir) ? 'open' : ''}`;
const opts = (pares, val) => pares.map(([v, t]) => `<option value="${esc(v)}" ${String(v) === String(val ?? '') ? 'selected' : ''}>${esc(t)}</option>`).join('');
const sel = (id, label, bind, val, pares, hint = '') => `<div class="f"><label for="${id}">${label}</label><select id="${id}" data-bind="${bind}">${opts(pares, val)}</select>${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
const numero = (id, label, bind, val, hint = '', extra = '') => `<div class="f"><label for="${id}">${label}</label><input id="${id}" type="number" min="0" step="any" inputmode="decimal" data-bind="${bind}" data-nullable data-rerender value="${val ?? ''}" ${extra}>${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
const texto = (id, label, bind, val, hint = '', extra = '') => `<div class="f"><label for="${id}">${label}</label><input id="${id}" type="text" data-bind="${bind}" value="${esc(val)}" ${extra}>${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
const casilla = (id, bind, val, label) => `<label class="check"><input id="${id}" type="checkbox" data-bind="${bind}" data-rerender ${val ? 'checked' : ''}> ${label}</label>`;
const fuenteTxt = (f) => (!f ? '' : f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.cita)}</a>` : esc(f.cita));
const alerta = (a) => `<li class="alerta ${a.nivel}"><div class="row" style="gap:8px"><span class="pill ${a.nivel}">${NIVEL[a.nivel]}</span><b>${esc(a.titulo)}</b></div>
  <p>${esc(a.detalle)}</p>${a.fuente ? `<p class="muted" style="font-size:12.5px">Fuente: ${fuenteTxt(a.fuente)}</p>` : ''}</li>`;

// Píldora del peligro para abejas de una aplicación.
function pildora(r) {
  if (!r.calculable) return '<span class="muted small">Sin dato</span>';
  const cls = r.supera === true ? 'Alto' : r.supera === false ? 'Bajo' : 'Medio';
  const txt = r.supera === true ? 'Supera' : r.supera === false ? 'Bajo el umbral' : 'Sin resolver';
  return `<span class="pill ${cls}" title="Umbral ${r.umbral}">${txt}</span><div class="small">HQ ${r.cota ? '≤ ' : ''}${fmtHQ(r.hqEf)}${r.factor > 1 ? ` (×${r.factor})` : ''}</div>`;
}

// Opciones del catálogo agrupadas por uso.
function opcionesIngrediente(val) {
  const grupos = [['insecticida', 'Insecticidas y acaricidas'], ['nematicida', 'Nematicidas'], ['fungicida', 'Fungicidas'], ['herbicida', 'Herbicidas']];
  return `<option value="" ${!val ? 'selected' : ''}>Elige un ingrediente</option>
    ${grupos.map(([u, t]) => `<optgroup label="${t}">${INGREDIENTES.filter((x) => x.uso === u).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .map((x) => `<option value="${x.id}" ${val === x.id ? 'selected' : ''}>${esc(x.nombre)} (${x.grupo})</option>`).join('')}</optgroup>`).join('')}
    <option value="otro" ${val === 'otro' ? 'selected' : ''}>Otro: escribir el nombre y su DL50</option>`;
}

function filaIngrediente(c, i, d, n) {
  const cat = ingrediente(c.ia);
  const unidad = d.concUnidad === 'pct' ? '%' : 'g/L o g/kg';
  const clase = cat ? claseEPA(cat.dl50, cat.mayor) : null;
  return `<div class="subform" style="gap:10px">
    <div class="fields">
      <div class="f"><label for="pq-ia-${i}">Ingrediente activo${n > 1 ? ` ${i + 1}` : ''}</label><select id="pq-ia-${i}" data-bind="draftPlag.componentes.${i}.ia">${opcionesIngrediente(c.ia)}</select></div>
      ${c.ia === 'otro' ? texto(`pq-ian-${i}`, 'Nombre del ingrediente', `draftPlag.componentes.${i}.nombre`, c.nombre, 'Como aparece en la etiqueta') : ''}
      ${numero(`pq-conc-${i}`, `Concentración (${unidad})`, `draftPlag.componentes.${i}.conc`, c.conc, 'De la etiqueta: por ejemplo 350 g/L o 80 %')}
      ${c.ia === 'otro' ? numero(`pq-dl-${i}`, 'DL50 por contacto (µg/abeja)', `draftPlag.componentes.${i}.dl50`, c.dl50, 'Hoja de seguridad o PPDB; vacía si no la tienes') : ''}
    </div>
    ${c.ia === 'otro' ? casilla(`pq-may-${i}`, `draftPlag.componentes.${i}.mayor`, c.mayor, 'La DL50 viene como "mayor que" (> valor)') : ''}
    ${cat ? `<p class="muted small">DL50 por contacto ${cat.mayor ? '> ' : ''}${fmt(cat.dl50, 4)} µg/abeja · ${esc(CLASE_EPA[clase] ?? 'clase EPA sin resolver')} · grupo ${esc(cat.grupo)}${cat.gus != null ? ` · GUS ${fmt(cat.gus, 2)}` : ''} · <a href="${cat.url}" target="_blank" rel="noopener">ficha del PPDB</a> (actualizada ${cat.actualizado})${cat.nota ? `. ${esc(cat.nota)}` : ''}</p>` : ''}
    ${n > 1 ? `<div><button class="btn sm" data-act="plag-rm-comp" data-i="${i}">Quitar este ingrediente</button></div>` : ''}
  </div>`;
}

// Resultado en vivo del formulario: dosis por hectárea y peligro para abejas.
function vistaPrevia(d, f, cfg) {
  const a = normalizarPlag(d);
  const ph = productoPorHa(a, cfg);
  const r = peligroAbejas(a, f, cfg);
  const lineas = [];
  if (ph.valor != null) lineas.push(`Producto: <b>${fmt(ph.valor, 3)} ${ph.medida}/ha</b>`);
  r.comps.forEach((c) => {
    if (c.gHa != null) lineas.push(`${esc(c.nombre)}: <b>${fmt(c.gHa, 2)} g i.a./ha</b>${c.hq != null ? ` · DL50 ${c.mayor ? '> ' : ''}${fmt(c.dl50, 4)} µg/abeja · HQ ${c.mayor ? '≤ ' : ''}${fmtHQ(c.hq)}${r.factor > 1 ? ` (×${r.factor}: ${fmtHQ(c.hqEf)})` : ''}` : ''}`);
  });
  const tocado = d.producto || d.componentes.some((c) => c.ia) || d.dosis != null;
  const veredicto = !r.calculable && !tocado ? '<span class="muted">Elige el ingrediente activo y escribe su concentración y la dosis: aquí verás los gramos por hectárea y el peligro para abejas.</span>'
    : !r.calculable ? `<span class="warnmsg">${esc(r.motivo)}</span>`
    : r.supera === true ? `<b style="color:var(--crit)">Supera el umbral de ${r.umbral}: peligro alto para abejas.</b>`
      : r.supera === false ? `<b style="color:var(--good)">Bajo el umbral de ${r.umbral}.</b>`
        : `<b style="color:var(--warn)">Sin resolver: ${esc(r.motivo || 'la DL50 es un mínimo y el HQ máximo queda sobre el umbral')}.</b>`;
  return `<div class="notice" style="flex-direction:column;align-items:flex-start;gap:4px" aria-live="polite"><span class="label">Cálculo de esta aplicación</span>
    ${lineas.map((l) => `<span class="small">${l}</span>`).join('')}<span>${veredicto}</span>
    <span class="muted small">HQ = g de ingrediente activo por ha ÷ DL50 por contacto. Umbral de la UE: 42 hacia abajo, 85 hacia arriba o de lado (FAO).${r.factor > 1 ? ` Con abejas sin aguijón en la finca se multiplica por ${r.factor}.` : ''}</span></div>`;
}

// Clima típico de los meses elegidos en la ubicación de la finca (Issue #8): para planear la aplicación.
function climaMeses(meses) {
  const c = S.farm.clima;
  if (!tieneClima(c)) return '<p class="muted small">Pon la ubicación de la finca (cuestionario, paso Finca) y aquí verás el clima típico de los meses de aplicación.</p>';
  if (!meses.length) return '';
  const x = climaDeMeses(c, meses);
  const v = (k, u, d = 1) => (x[k] == null ? '—' : `${fmt(x[k], d)} ${u}`);
  return `<p class="small"><b>Clima típico de ${mlist(meses)} en tu finca:</b> máxima ${v('tmax', '°C')}, mínima ${v('tmin', '°C')}, humedad ${v('hr', '%', 0)}, viento ${v('viento2', 'km/h')} a 2 m, lluvia ${v('lluvia', 'mm/mes', 0)}. Es el promedio de los últimos años: sirve para planear; el día de la aplicación, anota las condiciones reales.</p>`;
}

export function viewPlaguicidas() {
  const f = S.farm, d = S.draftPlag;
  const cfg = configEfectiva(normalizarAjustes(S.ajustes));
  const R = resumenPlag(f, cfg);
  const U = UNIDADES_DOSIS[d.dosisUnidad] ?? UNIDADES_DOSIS.mlBarril;
  const editando = S.plagEdit != null;
  const prodSag = productoSag(d.sag == null || d.sag === '' ? null : Number(d.sag));
  const riesgoFlor = uniq(f.especies.filter((e) => e.riesgo).flatMap((e) => e.floracion));
  const foliar = uniq((f.fertPlan ?? []).filter((x) => x.metodo === 'foliar').map((x) => x.mes));
  const plagaM = uniq(f.plagas.flatMap((p) => p.meses));
  const amplio = f.plaguicidas.filter((p) => p.clase === 'amplio').length;
  const sagOrden = [...PRODUCTOS_SAG].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const gruposEnf = [...new Set(ENFERMEDADES.map((e) => e.grupo))];

  return `
  ${S.msg ? `<div class="notice" role="status"><span>${esc(S.msg)}</span></div>` : ''}
  <section class="panel">
    <div><p class="label">Plaguicidas</p><h1>Aplicaciones y peligro para polinizadores</h1>
    <p class="muted">Registra cada aplicación: producto, ingrediente activo, dosis y meses. La app calcula el peligro para abejas y otros himenópteros polinizadores, revisa lo que dice la etiqueta y las condiciones de aplicación, y lo cruza con la floración, la cosecha, el riego y la fertilización de tu finca. Solo el producto y los meses son obligatorios: con más datos, la app calcula más.</p></div>
    ${S.demo ? '<div class="notice"><span><b>Datos de ejemplo.</b> Las aplicaciones de la finca demostrativa son ficticias: sus dosis no son recomendaciones.</span></div>' : ''}
    <div class="stats">
      <div><div class="k">Aplicaciones</div><div class="v">${f.plaguicidas.length}</div></div>
      <div><div class="k">Meses en floración</div><div class="v">${R.enFlor.length ? mlist(R.enFlor) : 'Ninguno'}</div></div>
      <div><div class="k">Mayor peligro</div><div class="v">${R.peor ? `${esc(R.peor.a.producto || 'Sin nombre')} · HQ ${R.peor.peligro.cota ? '≤ ' : ''}${fmtHQ(R.peor.peligro.hqEf)}` : 'Sin dato'}</div></div>
      <div><div class="k">Avisos</div><div class="v">${plural(R.errores, 'rojo', 'rojos')} · ${R.revisar} por revisar</div></div>
    </div>
  </section>

  <section class="panel">
    <h2>Aplicaciones registradas</h2>
    <div class="list">
      ${R.filas.map(({ a, i, peligro: r, avisos }) => {
        const n = (x) => avisos.filter((v) => v.nivel === x).length;
        const dosis = r.comps.filter((c) => c.gHa != null).map((c) => `${fmt(c.gHa, 1)} g`).join(' + ');
        return `<div class="item" ${S.plagEdit === i ? 'style="outline:2px solid var(--pollen)"' : ''}>
          <span class="grow"><b>${esc(a.producto || 'Sin nombre')}</b>
            <span class="muted small" style="display:block">${a.componentes.length ? esc(a.componentes.map(nombreComp).join(' + ')) : 'Sin ingrediente'}${a.grupo ? ` · grupo ${esc(a.grupo)}` : ''}${a.uso ? ` · ${esc(a.uso)}` : ''}</span>
            <span class="small" style="display:block">${mlist(a.meses)}${dosis ? ` · ${dosis} de i.a. por ha` : ''}</span></span>
          <span style="min-width:120px">${pildora(r)}</span>
          <span class="small">${n('error') ? `<span class="pill error">${plural(n('error'), 'rojo', 'rojos')}</span> ` : ''}${n('advertencia') ? `<span class="pill advertencia">${n('advertencia')} por revisar</span>` : ''}${!n('error') && !n('advertencia') ? '<span class="muted">Sin avisos rojos</span>' : ''}</span>
          <span class="row" style="gap:4px"><button class="btn sm" data-act="plag-edit" data-i="${i}">Editar</button><button class="btn sm" data-act="plag-dup" data-i="${i}" title="Copiar para registrar otra aplicación parecida">Duplicar</button><button class="btn sm" data-act="plag-rm" data-i="${i}">Quitar</button></span>
        </div>`;
      }).join('') || '<p class="muted">Sin aplicaciones. Agrégalas en el formulario de abajo.</p>'}
    </div>
  </section>

  <section class="panel" id="plag-form">
    <div class="row between"><h2>${editando ? 'Editar aplicación' : 'Agregar aplicación'}</h2>${editando ? '<span class="pill Medio">Editando</span>' : ''}</div>
    <div class="f"><label for="pq-sag">¿Es un fungicida del cuadro de la SAG? Elígelo y la app llena lo que trae la tabla</label>
      <select id="pq-sag" data-bind="draftPlag.sag"><option value="">No, lo escribo yo</option>${sagOrden.map((p) => `<option value="${p.id}" ${prodSag && prodSag.id === p.id ? 'selected' : ''}>${esc(p.nombre)} · ${esc(p.ia)}</option>`).join('')}</select>
      <span class="hint">Cuadro de referencia de fungicidas de la SAG (2021). Siempre manda la etiqueta.</span></div>
    ${S.plagNotas.length ? `<ul class="small" style="margin:0;padding-left:18px">${S.plagNotas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    <div class="fields">
      ${texto('pq-prod', 'Producto comercial *', 'draftPlag.producto', d.producto, 'El nombre de la etiqueta')}
      ${sel('pq-uso', 'Uso', 'draftPlag.uso', d.uso, USOS)}
      ${sel('pq-clase', 'Espectro', 'draftPlag.clase', d.clase, CLASES, 'Sobre otros insectos y enemigos naturales')}
      ${sel('pq-reg', 'Registro en la etiqueta', 'draftPlag.registro', d.registro, REGISTROS)}
    </div>
    <div class="f"><span class="label">Meses de aplicación *</span>${months('draftPlag.meses', d.meses)}</div>

    <h3>Ingrediente activo y dosis</h3>
    <p class="muted small">Con el ingrediente, su concentración y la dosis, la app calcula cuántos gramos de ingrediente caen por hectárea y el peligro para abejas.</p>
    ${d.componentes.map((c, i) => filaIngrediente(c, i, d, d.componentes.length)).join('')}
    ${d.componentes.length < 3 ? '<div><button class="btn sm" data-act="plag-add-comp">Agregar otro ingrediente (mezcla)</button></div>' : ''}
    <div class="fields">
      ${sel('pq-cu', 'La concentración está en', 'draftPlag.concUnidad', d.concUnidad, [['g', 'g/L (líquidos) o g/kg (sólidos)'], ['pct', '% (p/v en líquidos, p/p en sólidos)']])}
      ${sel('pq-form', 'Formulación', 'draftPlag.formulacion', d.formulacion, [['', 'No sé'], ...FORMULACIONES.map((x) => [x[0], x[1]])])}
      ${texto('pq-grupo', 'Grupo de modo de acción', 'draftPlag.grupo', d.grupo, 'IRAC o FRAC, de la etiqueta. Mezcla: 11 + 3', 'data-rerender')}
    </div>
    <div class="fields">
      ${numero('pq-dosis', 'Dosis', 'draftPlag.dosis', d.dosis)}
      ${sel('pq-du', 'Unidad de la dosis', 'draftPlag.dosisUnidad', d.dosisUnidad, Object.entries(UNIDADES_DOSIS).map(([k, u]) => [k, u.nombre]))}
      ${U.tanque ? numero('pq-vol', 'Agua por hectárea (L/ha)', 'draftPlag.volumen', d.volumen, 'Para pasar la dosis por tanque a dosis por hectárea') : ''}
    </div>
    ${U.tanque ? `<div class="row small"><span class="muted">Volumen de la clase según los días después del trasplante:</span>${cfg.plag.volumenClase.map((v) => `<button class="btn sm ${Number(d.volumen) === v.litros ? 'primary' : ''}" data-act="plag-vol" data-v="${v.litros}">${v.litros} L/ha a ${v.ddt} DDT</button>`).join('')}</div>` : ''}
    <div class="fields">
      ${sel('pq-met', 'Cómo se aplica', 'draftPlag.metodo', d.metodo, METODOS)}
      ${sel('pq-dir', 'Dirección de la aspersión', 'draftPlag.direccion', d.direccion, DIRECCIONES, 'Cambia el umbral: 42 hacia abajo, 85 hacia arriba o de lado')}
    </div>
    ${vistaPrevia(d, f, cfg)}

    <details ${plegable('pq-etiqueta', d.etiquetaAbejas || d.noFloracion || d.diasCosecha != null || d.reingreso != null || d.aplicMax != null || d.franja != null)}><summary>Lo que dice la etiqueta</summary>
      <div class="subform" style="margin-top:8px">
        <div class="row">${casilla('pq-abejas', 'draftPlag.etiquetaAbejas', d.etiquetaAbejas, 'Trae el pictograma "tóxico para abejas"')}${casilla('pq-noflor', 'draftPlag.noFloracion', d.noFloracion, 'Dice "no aplicar en floración"')}</div>
        <div class="fields">
          ${numero('pq-cos', 'Días a cosecha', 'draftPlag.diasCosecha', d.diasCosecha, 'Intervalo de seguridad para tu cultivo')}
          ${numero('pq-rei', 'Horas de reingreso', 'draftPlag.reingreso', d.reingreso, 'Antes de volver a entrar al lote')}
          ${numero('pq-max', 'Aplicaciones por ciclo', 'draftPlag.aplicMax', d.aplicMax, 'Máximo que permite la etiqueta')}
          ${numero('pq-fr', 'Franja sin aplicar hacia el agua (m)', 'draftPlag.franja', d.franja, `Tu cuerpo de agua está a ${fmt(f.distAgua, 0)} m`)}
          ${numero('pq-phmin', 'pH mínimo del agua', 'draftPlag.phMin', d.phMin, 'Si la etiqueta lo indica', 'max="14"')}
          ${numero('pq-phmax', 'pH máximo del agua', 'draftPlag.phMax', d.phMax, '', 'max="14"')}
        </div>
      </div></details>
    <details ${plegable('pq-plaga', d.objetivo || d.enfermedad != null || d.monitoreo)}><summary>Plaga o enfermedad y monitoreo</summary>
      <div class="subform" style="margin-top:8px">
        <div class="fields">
          ${texto('pq-obj', 'Plaga o enfermedad que controlas', 'draftPlag.objetivo', d.objetivo, 'Por ejemplo: mosca blanca, mildiu lanoso')}
          <div class="f"><label for="pq-enf">Enfermedad del cuadro SAG</label><select id="pq-enf" data-bind="draftPlag.enfermedad"><option value="">Ninguna o no está</option>
            ${gruposEnf.map((g) => `<optgroup label="${esc(g)}">${ENFERMEDADES.filter((e) => e.grupo === g).map((e) => `<option value="${e.id}" ${d.enfermedad != null && Number(d.enfermedad) === e.id ? 'selected' : ''}>${esc(e.nombre)}</option>`).join('')}</optgroup>`).join('')}</select>
            <span class="hint">Con el producto del cuadro, la app revisa si sirve para esa enfermedad</span></div>
        </div>
        ${casilla('pq-mon', 'draftPlag.monitoreo', d.monitoreo, 'Un monitoreo mostró la plaga o la enfermedad antes de aplicar')}
      </div></details>
    ${climaMeses(d.meses)}
    <details ${plegable('pq-condiciones', d.hora || d.viento != null || d.temp != null || d.hr != null || d.lluviaH != null || d.ph != null)}><summary>Condiciones el día de la aplicación</summary>
      <div class="subform" style="margin-top:8px">
        <div class="fields">
          <div class="f"><label for="pq-hora">Hora</label><input id="pq-hora" type="time" data-bind="draftPlag.hora" data-rerender value="${esc(d.hora)}"><span class="hint">La clase indica 5:00-9:30 o 15:30-18:00</span></div>
          ${numero('pq-vien', 'Viento (km/h)', 'draftPlag.viento', d.viento, `Máximo ${cfg.plag.vientoMax} km/h`)}
          ${numero('pq-temp', 'Temperatura (°C)', 'draftPlag.temp', d.temp, `Entre ${cfg.plag.temp[0]} y ${cfg.plag.temp[1]} °C`)}
          ${numero('pq-hr', 'Humedad relativa (%)', 'draftPlag.hr', d.hr, `Más de ${cfg.plag.hrMin} %`, 'max="100"')}
          ${numero('pq-llu', 'Horas hasta la lluvia', 'draftPlag.lluviaH', d.lluviaH, `Al menos ${cfg.plag.lluviaMinH} h sin lluvia`)}
          ${numero('pq-ph', 'pH del agua de la mezcla', 'draftPlag.ph', d.ph, `${cfg.plag.ph[0]}-${cfg.plag.ph[1]}; cobres ${cfg.plag.phCobre[0]}-${cfg.plag.phCobre[1]}`, 'max="14"')}
        </div>
      </div></details>
    <div class="row"><button class="btn primary" data-act="add-plag">${editando ? 'Guardar cambios' : 'Agregar aplicación'}</button>
      <button class="btn" data-act="plag-cancel">${editando ? 'Cancelar' : 'Limpiar el formulario'}</button></div>
    ${S.plagMsg ? `<p class="${S.plagMsg.nivel === 'error' ? 'warnmsg' : 'okmsg'}" role="${S.plagMsg.nivel === 'error' ? 'alert' : 'status'}">${esc(S.plagMsg.texto)}</p>` : ''}
  </section>

  ${f.plaguicidas.length ? `<section class="panel">
    <div><h2>Avisos</h2><p class="muted">Qué está bien, qué revisar y por qué. Cada aviso trae su fuente.</p></div>
    ${R.generales.length ? `<h3>Para toda la finca</h3><ul class="alertas">${R.generales.map(alerta).join('')}</ul>` : ''}
    ${R.filas.map(({ a, i, avisos }) => `<details ${plegable(`pq-avisos-${i}`, avisos.some((x) => x.nivel === 'error' || x.nivel === 'advertencia'))}><summary><b>${esc(a.producto || 'Sin nombre')}</b> · ${mlist(a.meses)} · ${avisos.length} aviso(s)</summary>
      <ul class="alertas" style="margin-top:8px">${avisos.map(alerta).join('') || '<li class="muted small">Sin avisos.</li>'}</ul></details>`).join('')}
  </section>` : ''}

  <section class="panel">
    <div><h2>Cómo se cruza con tu finca</h2><p class="muted">Los meses marcados con ! son coincidencias de riesgo.</p></div>
    <div class="scroll"><table class="cal"><thead><tr><th></th>${M.map((m) => `<th scope="col">${m}</th>`).join('')}</tr></thead><tbody>
      ${calRow('Floración visitada por polinizadores', R.atraeFlor, 'on-flor')}
      ${calRow('Floración de especies de riesgo', riesgoFlor, 'on-riesgo')}
      ${calRow('Aplicaciones de plaguicidas', R.mesesAplic, 'on-apl', R.enFlor)}
      ${calRow('Peligro alto para abejas (HQ)', R.mesesPeligro, 'on-apl', inter(R.mesesPeligro, R.atraeFlor))}
      ${calRow('Cosecha', R.cosechaM, 'on-cult', inter(R.mesesAplic, R.cosechaM))}
      ${calRow('Plagas', plagaM, 'on-gen')}
      ${calRow('Lluvia fuerte', f.lluviaMeses, 'on-gen')}
      ${calRow('Fertilización foliar', foliar, 'on-gen', inter(foliar, R.mesesAplic))}
    </tbody></table></div>
    <ul class="small" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px">
      <li><b>Polinizadores:</b> el peligro de lo que aplicas en floración entra al módulo Polinizadores del dashboard (variable "Peligro del producto aplicado en floración"). Sin ingrediente ni dosis, usa el espectro que elegiste.</li>
      <li><b>Abejas sin aguijón:</b> ${R.sinAguijon.length ? `registraste ${esc(R.sinAguijon.map((e) => e.nombre).join(', '))}; el HQ se multiplica por ${cfg.plag.factorSinAguijon}.` : `no registraste ninguna. Si las hay en tu finca, agrégalas en el paso Especies del cuestionario (tipo Fauna, con su nombre científico) y la app aplicará un margen ×${cfg.plag.factorSinAguijon}.`}</li>
      <li><b>Riego:</b> ${f.riego === 'aspersion' ? 'riegas por aspersión: no riegues en las 4 horas siguientes a una aplicación foliar.' : f.riego === 'ninguno' ? 'sin riego registrado.' : `riego por ${esc(f.riego)}.`} Si aplicas al suelo o por el riego un producto móvil (GUS alto), revisa la lámina en la pestaña <button class="btn sm" data-view="riego">Riego</button>.</li>
      <li><b>Fertilización:</b> ${foliar.length ? `tienes foliares en ${mlist(foliar)}; si los mezclas con un plaguicida, haz antes una prueba de mezcla.` : 'sin foliares en el plan.'} <button class="btn sm" data-view="fertilizacion">Fertilización</button></li>
      <li><b>Enemigos naturales:</b> ${amplio} de ${f.plaguicidas.length} producto(s) de amplio espectro; esto alimenta el módulo Cadenas tróficas.</li>
    </ul>
  </section>

  <section class="panel flat">
    <div><h3>Fuentes</h3><p class="muted small">Ninguna dosis de esta pestaña es una recomendación: la que manda es la de la etiqueta del producto.</p></div>
    <ul class="small" style="margin:0;padding-left:18px">${['fao', 'epa', 'arena', 'ppdb', 'gus', 'sag', 'etiquetas', 'aplicacion', 'muestreo', 'clima'].map((k) => `<li>${fuenteTxt(FUENTES_PLAG[k])}</li>`).join('')}</ul>
    <details><summary>Catálogo de ingredientes activos (${INGREDIENTES.length}), con su ficha del PPDB</summary>
      <div class="scroll"><table class="data small"><thead><tr><th>Ingrediente</th><th>Uso</th><th>Grupo</th><th class="num">DL50 contacto (µg/abeja)</th><th>Clase EPA</th><th class="num">GUS</th></tr></thead><tbody>
        ${[...INGREDIENTES].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')).map((x) => `<tr><td><a href="${x.url}" target="_blank" rel="noopener">${esc(x.nombre)}</a></td><td>${x.uso}</td><td>${esc(x.grupo)}</td><td class="num">${x.mayor ? '> ' : ''}${fmt(x.dl50, 4)}</td><td>${esc(CLASE_EPA[claseEPA(x.dl50, x.mayor)] ?? 'Sin resolver')}</td><td class="num">${x.gus == null ? '—' : fmt(x.gus, 2)}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="muted small">Fichas consultadas el ${CONSULTA_PPDB}. Si tu ingrediente no está, elige "Otro" y escribe la DL50 de la hoja de seguridad.</p>
    </details>
    <details><summary>Notas sobre el cuadro de fungicidas de la SAG</summary>
      <ul class="small" style="padding-left:18px">
        <li>La columna de reingreso trae "S" en ${PRODUCTOS_SAG.filter((p) => p.reingreso === 'S').length} productos y la leyenda no la define. La app no la convierte en horas.</li>
        ${PRODUCTOS_SAG.filter((p) => p.nota).map((p) => `<li><b>${esc(p.nombre)}:</b> ${esc(p.nota)}</li>`).join('')}
      </ul>
    </details>
  </section>`;
}
