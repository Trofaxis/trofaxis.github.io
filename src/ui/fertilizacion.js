// Vista: Fertilización. Plan por aplicación (producto, dosis, mes, método) o plantilla cargada;
// nutrientes frente al objetivo, N por mes frente a la lluvia y hallazgos de sostenibilidad.
import { esc, M, MFULL } from '../core/utils.js';
import { S } from '../core/state.js';
import { configEfectiva, normalizarAjustes } from '../core/storage.js';
import { PRODUCTOS, METODOS, UNIDADES, UNIDADES_UI, producto } from '../fert/catalogo.js';
import { resumen } from '../fert/calculo.js';
import { field, select } from './components.js';

const NIVEL = { error: 'Error', advertencia: 'Revisar', criterio: 'Criterio', ok: 'Bien' };
const fmt = (x, d = 1) => (x == null || !Number.isFinite(x) ? '—' : x.toLocaleString('es-HN', { maximumFractionDigits: d }));
const NUT = [['n', 'N', 'nObjetivo'], ['p', 'P₂O₅', 'pObjetivo'], ['k', 'K₂O', 'kObjetivo']];

export function viewFertilizacion() {
  const f = S.farm, d = S.draftFert, U = UNIDADES[S.fertUnidad];
  const r = resumen(f, configEfectiva(normalizarAjustes(S.ajustes)));
  const otro = d.producto === 'otro';
  const g = producto(d.producto);
  const lluvia = new Set(f.lluviaMeses);
  const maxMes = Math.max(...r.nMes, 1);
  return `
  ${S.msg ? `<div class="notice" role="status"><span>${esc(S.msg)}</span></div>` : ''}
  <section class="panel">
    <div><h2>Plan de fertilización</h2>
    <p class="muted">Registra cada aplicación: producto, dosis, mes y método. La app calcula cuánto N, P₂O₅ y K₂O aplicas, lo compara con tu objetivo y revisa cuándo y cómo cae frente a la lluvia, el suelo desnudo y el agua: <b>qué tan sostenible es tu fertilización con el ecosistema</b>. ${f.fertPlan.length ? 'El dashboard usa este plan en lugar del N total del cuestionario.' : ''}</p></div>
    <div class="row">
      <span class="label">Unidad de dosis</span>
      ${UNIDADES_UI.map((k) => [k, UNIDADES[k]]).map(([k, u]) => `<button class="btn sm ${S.fertUnidad === k ? 'primary' : ''}" data-act="fert-unidad" data-u="${k}">${u.nombre}</button>`).join('')}
      <span class="muted small basis-100">1 qq/mz ≈ ${fmt(UNIDADES.qqmz.aKgHa)} kg/ha (quintal de 100 lb; manzana de 10 000 varas²)</span>
    </div>
    <div class="row"><button class="btn primary" data-act="fert-import">Cargar Excel o CSV</button><button class="btn" data-act="fert-plantilla">Descargar plantilla</button>
      <span class="muted small">Columnas: Mes (o fecha), Producto (nombre o fórmula 15-15-15), Dosis, Unidad (kg/ha, qq/mz, qq/ha, kg/mz, lb/acre) y Método. El archivo no sale de tu navegador.</span></div>
    ${S.fertImport ? `<div class="subform"><p class="small"><b>Último archivo:</b> ${esc(S.fertImport.archivo)} (hoja "${esc(S.fertImport.hoja)}").</p>
      ${S.fertImport.avisos.map((a) => `<p class="warnmsg small">${esc(a)}</p>`).join('')}
      ${S.fertImport.omitidas.length ? `<details><summary>${S.fertImport.omitidas.length} fila(s) no leídas</summary><ul class="small">${S.fertImport.omitidas.map((o) => `<li>Fila ${o.fila}: ${esc(o.motivo)}</li>`).join('')}</ul></details>` : ''}</div>` : ''}
  </section>

  <section class="panel">
    <div><h2>Objetivos por nutriente</h2>
    <p class="muted">Cuánto necesita tu cultivo, en kg por hectárea. <b>Sale de tu análisis de suelo o de la recomendación de tu agrónomo</b>; la app no lo inventa. Sin objetivo, la app no puede decir si te sobra o te falta.</p></div>
    <div class="fields">
      ${NUT.map(([x, nom, key]) => `<div class="f"><label for="obj-${x}">Objetivo de ${nom}</label><input id="obj-${x}" type="number" min="0" data-bind="farm.${key}" data-rerender value="${f[key] || ''}"><span class="hint">kg ${nom}/ha por ciclo</span></div>`).join('')}
    </div>
  </section>

  <section class="panel">
    <h2>Aplicaciones</h2>
    <div class="scroll"><table class="data"><thead><tr><th>Mes</th><th>Producto</th><th class="num">Dosis (${U.nombre})</th><th>Método</th><th class="num">N</th><th class="num">P₂O₅</th><th class="num">K₂O</th><th></th></tr></thead><tbody>
      ${r.filas.map((a, i) => `<tr><td>${M[a.mes]}${lluvia.has(a.mes) ? ' <span title="Mes de lluvia fuerte">🌧</span>' : ''}</td><td>${esc(a.nombre)}<div class="muted small">${a.n}-${a.p}-${a.k}</div></td><td class="num">${fmt(a.dosis / U.aKgHa)}</td><td class="small">${esc(METODOS[a.metodo])}</td><td class="num">${fmt(a.kgN)}</td><td class="num">${fmt(a.kgP)}</td><td class="num">${fmt(a.kgK)}</td>
        <td class="row gap-4 nowrap"><button class="btn sm" data-act="edit-fert" data-i="${i}">Editar</button><button class="btn sm" data-act="rm-fert" data-i="${i}">Quitar</button></td></tr>`).join('') || '<tr><td colspan="8" class="muted">Sin aplicaciones. Agrégalas abajo o carga tu plantilla.</td></tr>'}
      ${r.filas.length ? `<tr><td colspan="4"><b>Total por hectárea</b></td><td class="num"><b>${fmt(r.tot.n)}</b></td><td class="num"><b>${fmt(r.tot.p)}</b></td><td class="num"><b>${fmt(r.tot.k)}</b></td><td></td></tr>` : ''}
    </tbody></table></div>
    <div class="subform"><h3>Agregar aplicación</h3>
      <div class="fields">
        ${select('fe-mes', 'Mes', 'draftFert.mes', String(d.mes), MFULL.map((m, i) => [String(i), m[0].toUpperCase() + m.slice(1)]))}
        ${select('fe-prod', 'Producto', 'draftFert.producto', d.producto, PRODUCTOS.map((p) => [p.id, p.id === 'otro' ? p.nombre : `${p.nombre} (${p.n}-${p.p}-${p.k})`]))}
        ${field('fe-dosis', `Dosis (${U.nombre} de producto)`, 'draftFert.dosis', d.dosis, 'number')}
        ${select('fe-met', 'Método', 'draftFert.metodo', d.metodo, Object.entries(METODOS))}
      </div>
      ${otro ? `<div class="fields">${['n', 'p', 'k'].map((x, j) => field(`fe-${x}`, `${['N', 'P₂O₅', 'K₂O'][j]} (%)`, `draftFert.${x}`, d[x], 'number', 'Según la etiqueta')).join('')}</div>` : `<p class="muted small">Grado: ${g.n}-${g.p}-${g.k} (N-P₂O₅-K₂O, % en peso, según la etiqueta del producto).</p>`}
      <div><button class="btn" data-act="add-fert">Agregar aplicación</button></div>
    </div>
  </section>

  ${r.filas.length ? `<div class="grid2">
    <section class="panel">
      <div><h2>Hallazgos</h2><p class="muted">Qué está bien, qué revisar y por qué.</p></div>
      <ul class="alertas">${r.hallazgos.map((a) => `<li class="alerta ${a.nivel}">
        <div class="row gap-8"><span class="pill ${a.nivel}">${NIVEL[a.nivel]}</span><b>${esc(a.titulo)}</b></div>
        <p>${esc(a.detalle)}</p>${a.fuente ? `<p class="muted fs-125">Fuente: ${esc(a.fuente.cita)}</p>` : ''}
      </li>`).join('')}</ul>
    </section>
    <section class="panel">
      <h2>Nutrientes frente al objetivo</h2>
      ${NUT.map(([x, nom, key]) => { const q = r.ratio[x]; const w = q == null ? 0 : Math.min(q, 1.5) / 1.5 * 100; const lv = q == null ? '' : q > 1.2 ? 'Alto' : q > 1 || q < 0.8 ? 'Medio' : 'Bajo';
        return `<div><div class="row between small"><b>${nom}</b><span>${fmt(r.tot[x])} de ${f[key] || '—'} kg/ha${q == null ? '' : ` · ${Math.round(q * 100)} %`}</span></div>
        <div class="bar-track rel"><span class="fill-${lv || 'Bajo'}${q == null ? ' tenue' : ''}" style="width:${w}%"></span><i class="meta-objetivo" title="Objetivo"></i></div></div>`; }).join('')}
      <p class="muted small">La línea vertical marca el 100 % del objetivo.</p>
      <h3>Nitrógeno por mes</h3>
      <div class="scroll"><table class="cal"><thead><tr>${M.map((m, i) => `<th scope="col">${m}${lluvia.has(i) ? ' 🌧' : ''}</th>`).join('')}</tr></thead><tbody><tr>
        ${r.nMes.map((x, i) => `<td class="${x ? (lluvia.has(i) ? 'hit' : 'on-gen') : ''}" title="${fmt(x)} kg N/ha"${x ? ` style="opacity:${0.45 + 0.55 * x / maxMes}"` : ''}>${x ? fmt(x, 0) : ''}</td>`).join('')}
      </tr></tbody></table></div>
      <p class="muted small">kg N/ha por mes. En rojo: N aplicado en un mes de lluvia fuerte.</p>
    </section>
  </div>` : ''}`;
}
