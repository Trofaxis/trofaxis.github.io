// Vista: Riego por goteo. Calculadora + validador sobre las mismas fórmulas.
// Flujo: cargar archivo (o escribir datos) → revisar datos detectados → leer alertas.
import { esc } from '../core/utils.js';
import { S } from '../core/state.js';
import { calcular, NOMBRES_MES, hidraulicaVacia, reservorioVacio } from '../riego/calculo.js';
import { CONFIG } from '../core/config.js';
import { validar } from '../riego/reglas.js';
import { tieneClima } from '../clima/normales.js';
import { estadoClima } from './clima.js';
import { cabeza, cifras, ayuda, secAbre, SEC_CIERRA, metodo, listaAlertas } from './components.js';

const fmt = (x, d = 1) => (typeof x === 'number' && Number.isFinite(x) ? x.toLocaleString('es-HN', { maximumFractionDigits: d }) : '—');

function campo(id, label, path, valor, unidad, origen, ref) {
  const hint = [unidad, origen ? `de ${origen.celda}` : '', valor === null && ref !== undefined && ref !== null ? `vacío: se usa ${ref}` : ''].filter(Boolean).join(' · ');
  return `<div class="f"><label for="${id}">${label}</label><input id="${id}" type="number" step="any" inputmode="decimal" data-bind="${path}" data-nullable data-rerender value="${valor ?? ''}" placeholder="${ref ?? ''}">${hint ? `<span class="hint">${esc(hint)}</span>` : ''}</div>`;
}

export function viewRiego() {
  const R = S.riego;
  const d = R.datos;
  // Datos guardados antes de que existiera el ciclo.
  if (!Array.isArray(d.etoMensual)) d.etoMensual = Array(12).fill(null);
  if (typeof d.siembra !== 'string') d.siembra = '';
  if (!d.hidraulica) d.hidraulica = hidraulicaVacia();
  if (!d.reservorio) d.reservorio = reservorioVacio();
  const r = calcular(d);
  const c = r.ciclo;
  const hd = d.hidraulica, h = r.hidraulica, rv = d.reservorio, res = r.reservorio;
  const mes3 = (m) => m[0].toUpperCase() + m.slice(1, 3);
  const alertas = validar(r, R.declarados || {});
  const o = R.origen || {};
  const ref = r.referencia;
  const cuenta = (n) => alertas.filter((a) => a.nivel === n).length;
  // Clima de la ubicación (Issue #8): llena la ETo de cada mes, la ETo de diseño y el clima del reservorio.
  const clima = S.farm.clima;
  const lineaClima = tieneClima(clima)
    ? `<p class="small"><b>Clima de tu ubicación:</b> ${R.fuente === 'ejemplo' ? 'el caso de ejemplo usa los datos de su propia finca; pulsa el botón para usar los tuyos.' : 'llena solo los meses vacíos.'} <button class="btn sm" data-clima="riego">Llenar con el clima de mi finca</button></p>${estadoClima()}`
    : '<p class="muted small">¿No tienes la ETo, la temperatura o la radiación? Pon la ubicación de la finca (cuestionario, paso Finca, o el mapa del dashboard) y se llenan solas con el clima de los últimos años.</p>';

  const aviso = R.fuente === 'ejemplo'
    ? `<b>Caso de referencia, datos reales.</b> Diseño agronómico de maíz por goteo del Lab de Riego, Zamorano (Anner Almendárez, 2025), publicado con autorización del autor. No es tu finca ni la finca de ejemplo: está en Memoria de casos, «Casos de referencia».`
    : R.fuente === 'archivo'
      ? `<b>Datos leídos de ${esc(R.archivo)}.</b> Revisa abajo qué se detectó y de qué celda salió; corrige lo que haga falta.`
      : `<b>Datos ingresados a mano.</b> Los campos vacíos usan valores de referencia cuando existen.`;

  return `
  ${S.msg ? `<div class="notice"><span>${esc(S.msg)}</span></div>` : ''}
  ${cabeza({ modulo: 'Riego por goteo', titulo: `${esc(d.cultivo || 'Diseño sin cultivo')}${d.areaLote ? ` · ${fmt(d.areaLote, 2)} ha` : ''}`,
    estado: cuenta('error') + cuenta('advertencia') ? `<b>${cuenta('error')} errores</b> · ${cuenta('advertencia')} por revisar` : alertas.length ? '<b>Tu diseño está bien</b>' : 'Carga tus datos para revisarlos',
    acciones: `<button class="btn primary" data-act="riego-import">Cargar Excel o CSV</button><details class="menu-mas" data-keep="menu-riego"><summary class="btn">Más</summary><div class="menu-mas-caja"><button class="btn" data-act="riego-ejemplo">Caso real del Lab de Riego</button><button class="btn" data-act="riego-blanco">En blanco</button></div></details>`,
    ayudaClave: 'riego', ayudaTexto: 'Sube tu Excel o CSV, o escribe tus datos. La app recalcula el diseño y revisa cada valor contra referencias con fuente.' })}
  <div class="notice notice-corto"><span>${R.fuente === 'ejemplo' ? '<b>Caso de referencia, datos reales.</b>' : R.fuente === 'archivo' ? `<b>Datos de ${esc(R.archivo)}.</b>` : '<b>Datos ingresados a mano.</b>'}</span>${ayuda('riego-fuente', aviso)}</div>
  ${cifras([['Horas de riego por sector', `${fmt(r.tiempoRiego, 2)} h`], ['Días máximo sin regar', r.intervaloMax !== undefined ? r.intervaloMax : '—'], ['Sectores', fmt(r.sectores, 0)], ['ETc pico, mm/día', fmt(r.etc, 2)]])}

  ${secAbre('rg-alertas', 'Alertas', `${cuenta('error')} errores · ${cuenta('advertencia')} por revisar`, cuenta('error') + cuenta('advertencia') > 0, S.abiertos, cuenta('error') > 0)}
      <p class="muted small">${cuenta('error')} errores · ${cuenta('advertencia')} por revisar · ${cuenta('criterio')} criterios · ${cuenta('ok')} bien</p>
      ${listaAlertas(alertas, 'Ingresa datos para ver alertas.')}
  ${SEC_CIERRA}

  ${secAbre('rg-datos', 'Datos del diseño', 'Cultivo, emisor y operación', false, S.abiertos)}
      <h3>Cultivo</h3>
      <div class="fields">
        <div class="f"><label for="rg-cultivo">Cultivo</label><input id="rg-cultivo" data-bind="riego.datos.cultivo" data-rerender value="${esc(d.cultivo)}"><span class="hint">${ref ? `Referencia: ${esc(ref.nombre)}` : 'Sin referencia: no se comparan Kc ni etapas'}</span></div>
        ${campo('rg-kci', 'Kc inicial', 'riego.datos.kcIni', d.kcIni, '', o.kcIni, ref?.kc.ini.valor)}
        ${campo('rg-kcm', 'Kc medio', 'riego.datos.kcMed', d.kcMed, '', o.kcMed, ref?.kc.med.valor)}
        ${campo('rg-kcf', 'Kc final', 'riego.datos.kcFin', d.kcFin, '', o.kcFin, ref?.kc.fin.valor)}
        ${campo('rg-p', 'Fracción p', 'riego.datos.p', d.p, 'fracción', o.p, ref?.p.valor)}
        ${campo('rg-raiz', 'Profundidad radicular', 'riego.datos.profRaiz', d.profRaiz, 'm', o.profRaiz)}
        ${campo('rg-alt', 'Altura de la planta', 'riego.datos.alturaPlanta', d.alturaPlanta, 'm', o.alturaPlanta)}
        ${['Inicial', 'Desarrollo', 'Media', 'Final'].map((n, i) => campo(`rg-et${i}`, `Etapa ${n.toLowerCase()}`, `riego.datos.etapas.${i}`, d.etapas[i], 'días', o[`etapa${i}`], ref?.etapas.valor[i])).join('')}
      </div>
      <h3>Siembra y emisor</h3>
      <div class="fields">
        ${campo('rg-dp', 'Distancia entre plantas', 'riego.datos.distPlantas', d.distPlantas, 'm', o.distPlantas)}
        ${campo('rg-ds', 'Distancia entre surcos', 'riego.datos.distSurcos', d.distSurcos, 'm', o.distSurcos)}
        ${campo('rg-hil', 'Hileras por cama', 'riego.datos.hileras', d.hileras, '', o.hileras, 1)}
        ${campo('rg-q', 'Caudal del emisor', 'riego.datos.caudalEmisor', d.caudalEmisor, 'L/h', o.caudalEmisor)}
        ${campo('rg-de', 'Distancia entre emisores', 'riego.datos.distEmisores', d.distEmisores, 'm', o.distEmisores, d.distPlantas)}
        ${campo('rg-dl', 'Distancia entre laterales', 'riego.datos.distLaterales', d.distLaterales, 'm', o.distLaterales, d.distSurcos)}
      </div>
      <h3>Operación</h3>
      <div class="fields">
        ${campo('rg-eto', 'ETo de diseño', 'riego.datos.eto', d.eto, tieneClima(clima) ? `mm/día · el clima da ${Math.max(...clima.meses.map((m) => m.etoP90 ?? 0)) || '—'} (día exigente, percentil 90)` : 'mm/día', o.eto)}
        ${campo('rg-ef', 'Eficiencia de riego', 'riego.datos.eficiencia', d.eficiencia, 'fracción', o.eficiencia)}
        ${campo('rg-area', 'Área del lote', 'riego.datos.areaLote', d.areaLote, 'ha', o.areaLote)}
        ${campo('rg-horas', 'Horas laborales', 'riego.datos.horasLaborales', d.horasLaborales, 'h/día', o.horasLaborales)}
        ${campo('rg-frec', 'Riego cada', 'riego.datos.frecuenciaDias', d.frecuenciaDias, 'días', null, 1)}
      </div>
  ${SEC_CIERRA}

  ${secAbre('rg-suelo', 'Suelo por sección', `${d.suelo.length} ${d.suelo.length === 1 ? 'sección' : 'secciones'}`, false, S.abiertos)}
    ${metodo('rg-suelo', `La lámina aprovechable se calcula en la zona radicular, con la fracción p ajustada por ETc${r.pAjustada !== null ? ` (p = ${fmt(r.pAjustada, 2)})` : ''}. Si dejas vacíos Da, CC, PMP o infiltración, se toman de la textura.`)}
    <div class="scroll"><table class="data"><thead><tr>
      <th>Sección</th><th class="num">Área (ha)</th><th>Textura</th><th class="num">Da (g/cm³)</th><th class="num">CC (%W)</th><th class="num">PMP (%W)</th><th class="num">Piedras (%)</th><th class="num">Infiltración (mm/h)</th><th class="num">Lámina aprovechable (mm)</th><th></th>
    </tr></thead><tbody>
      ${d.suelo.map((s, i) => {
        const c = r.suelo[i] || {};
        const inp = (k, w = 72) => `<input aria-label="${k} de ${esc(s.nombre)}" type="number" step="any" inputmode="decimal" class="w-${w} t-der" data-bind="riego.datos.suelo.${i}.${k}" data-nullable data-rerender value="${s[k] ?? ''}" placeholder="${r.datos.suelo[i]?.[k] ?? ''}">`;
        return `<tr><td><input aria-label="Nombre de la sección" class="w-110" data-bind="riego.datos.suelo.${i}.nombre" data-rerender value="${esc(s.nombre)}"></td>
          <td class="num">${inp('area')}</td>
          <td><input aria-label="Textura de ${esc(s.nombre)}" class="w-64" data-bind="riego.datos.suelo.${i}.textura" data-rerender value="${esc(s.textura)}" placeholder="F, FA…"></td>
          <td class="num">${inp('da')}</td><td class="num">${inp('cc')}</td><td class="num">${inp('pmp')}</td><td class="num">${inp('pedregosidad')}</td><td class="num">${inp('infiltracion')}</td>
          <td class="num"><b>${fmt(c.laa)}</b></td>
          <td><button class="btn small" data-act="riego-rm-suelo" data-i="${i}">Quitar</button></td></tr>`;
      }).join('') || '<tr><td colspan="10" class="muted">Sin secciones de suelo: no se puede revisar la frecuencia de riego.</td></tr>'}
    </tbody></table></div>
    <div><button class="btn small" data-act="riego-add-suelo">Agregar sección</button></div>
    <p class="muted small">Texturas: A arenoso · FA franco arenoso · F franco · Far franco arcilloso · ArA arcillo arenoso · Ar arcilloso (tabla CIMMYT 2012 del Lab de Riego).</p>
    ${r.suelo.some((x) => x.laaPorMetro !== undefined) ? `<h3>Por qué hay tres láminas</h3>
    <p class="muted">Las tres usan agua disponible × p × (1 − piedras) × 10. Cambia la profundidad y la p:</p>
    <div class="scroll"><table class="data"><thead><tr><th>Sección</th>
      <th class="num">Por metro de suelo, p = ${fmt(d.p, 2)} (como muchas hojas de Excel)</th>
      <th class="num">En ${fmt(d.profRaiz, 2)} m de raíces, p = ${fmt(d.p, 2)}</th>
      <th class="num">En raíces, p ajustada = ${fmt(r.pAjustada, 2)} (la que usa la app)</th>
    </tr></thead><tbody>
      ${r.suelo.map((x) => `<tr><td>${esc(x.nombre)}</td><td class="num">${fmt(x.laaPorMetro)} mm</td><td class="num">${fmt(x.laaSinAjuste)} mm</td><td class="num"><b>${fmt(x.laa)} mm</b></td></tr>`).join('')}
    </tbody></table></div>
    <p class="muted small">La primera ignora que las raíces solo llegan a ${fmt(d.profRaiz, 2)} m. La segunda es la fórmula del cálculo manual habitual. La tercera además baja p porque con ETc alta la planta se estresa antes (FAO-56, Tabla 22); la app la usa para el intervalo entre riegos porque es la más segura.</p>` : ''}
  ${SEC_CIERRA}

  ${secAbre('rg-ciclo', 'Consumo del ciclo', c ? `${fmt(c.etcCiclo)} mm` : 'Faltan datos', false, S.abiertos)}
    ${metodo('rg-ciclo', 'ETc de cada etapa = Kc promedio de la etapa × suma de la ETo de sus días. Ingresa la fecha de siembra y la ETo media diaria de cada mes; los meses vacíos usan la ETo pico.')}
    ${lineaClima}
    <div class="fields">
      <div class="f"><label for="rg-siembra">Fecha de siembra</label><input id="rg-siembra" type="date" data-bind="riego.datos.siembra" data-rerender value="${esc(d.siembra)}"></div>
      <div class="f"><label class="check"><input type="checkbox" class="w-auto" data-bind="riego.datos.mes30" data-rerender ${d.mes30 ? 'checked' : ''}> Meses de 30 días (cálculo manual)</label></div>
    </div>
    <div class="fields">
      ${NOMBRES_MES.map((m, i) => `<div class="f maxw-110"><label for="rg-eto-${i}">${m[0].toUpperCase() + m.slice(1, 3)}</label><input id="rg-eto-${i}" type="number" step="any" inputmode="decimal" data-bind="riego.datos.etoMensual.${i}" data-nullable data-rerender value="${d.etoMensual[i] ?? ''}"><span class="hint">mm/día</span></div>`).join('')}
    </div>
    ${c ? `<div class="scroll"><table class="data"><thead><tr><th>Etapa</th><th class="num">Días</th><th>Meses</th><th class="num">Kc promedio</th><th class="num">Σ ETo (mm)</th><th class="num">ETc (mm)</th></tr></thead><tbody>
      ${c.etapas.map((e) => `<tr><td>${e.nombre}</td><td class="num">${e.dias}</td><td>${c.fuenteEto === 'mensual' ? esc(e.meses.join(', ')) : 'ETo pico'}</td><td class="num">${fmt(e.kc, 3)}</td><td class="num">${fmt(e.etoSum)}</td><td class="num">${fmt(e.etc)}</td></tr>`).join('')}
      <tr><td><b>Ciclo</b></td><td class="num"><b>${r.cicloDias}</b></td><td></td><td></td><td></td><td class="num"><b>${fmt(c.etcCiclo)}</b></td></tr>
    </tbody></table></div>
    <div class="summary">
      <div><div class="k">ETc del ciclo</div><div class="v">${fmt(c.etcCiclo)} mm</div></div>
      <div><div class="k">Volumen neto</div><div class="v">${fmt(c.volumenNeto, 0)} m³</div></div>
      <div><div class="k">Volumen bruto (÷ eficiencia)</div><div class="v">${fmt(c.volumenBruto, 0)} m³</div></div>
    </div>
    <p class="muted small">1 mm en 1 ha = 10 m³. El bruto es el agua que hay que tener disponible. No descuenta lluvia efectiva.</p>`
    : '<p class="muted">Faltan Kc, duración de etapas o ETo para calcular el ciclo.</p>'}
  ${SEC_CIERRA}

  ${secAbre('rg-hidraulica', 'Hidráulica', h?.cdt ? `Bomba: ${fmt(h.cdt, 1)} m` : `${fmt(r.caudalSector)} m³/h por sector`, false, S.abiertos)}
    ${metodo('rg-hidraulica', `Sector más desfavorable: el más lejos o más alto de la bomba. Pérdidas por Hazen-Williams (K = 3163, caudal en L/h, diámetro interno en mm) con factor F de Christiansen. Límite de pérdida: ${Math.round(CONFIG.riego.hfMaxFraccion * 100)} % de la presión de operación. Caudal por sector: ${fmt(r.caudalSector)} m³/h.`)}
    <h3>Lateral (cinta o manguera)</h3>
    <div class="fields">
      ${campo('rg-po', 'Presión de operación', 'riego.datos.hidraulica.presionOperacion', hd.presionOperacion, 'mca (1 bar = 10.2 mca)')}
      ${campo('rg-dil', 'Diámetro interno del lateral', 'riego.datos.hidraulica.diLateral', hd.diLateral, 'mm')}
      ${campo('rg-cl', 'Coeficiente C del lateral', 'riego.datos.hidraulica.cLateral', hd.cLateral, 'PE: 150', null, 150)}
      ${campo('rg-ll', 'Largo del lateral', 'riego.datos.hidraulica.largoLateral', hd.largoLateral, 'm')}
    </div>
    ${h?.lateralMax || h?.lateral ? `<p>${h.lateral ? `Pérdida en ${fmt(h.lateral.largo)} m: <b>${fmt(h.lateral.hf, 2)} m</b> de ${fmt(h.hfMax, 2)} m permitidos. ` : ''}${h.lateralMax ? `Largo máximo: <b>${fmt(h.lateralMax.largo)} m</b> (${h.lateralMax.emisores} emisores).` : ''}</p>` : ''}
    <h3>Secundaria</h3>
    <div class="fields">
      ${campo('rg-sq', 'Caudal', 'riego.datos.hidraulica.secundaria.caudal', hd.secundaria.caudal, 'm³/h')}
      ${campo('rg-sl', 'Largo', 'riego.datos.hidraulica.secundaria.largo', hd.secundaria.largo, 'm')}
      ${campo('rg-sd', 'Diámetro interno', 'riego.datos.hidraulica.secundaria.di', hd.secundaria.di, 'mm (PVC 4" SDR 32.5: 107.3)')}
      ${campo('rg-sc', 'Coeficiente C', 'riego.datos.hidraulica.secundaria.c', hd.secundaria.c, 'PVC: 140', null, 140)}
      ${campo('rg-ss', 'Salidas (laterales que alimenta)', 'riego.datos.hidraulica.secundaria.salidas', hd.secundaria.salidas, 'vacío: largo ÷ distancia entre laterales')}
    </div>
    ${h?.secundaria ? `<p>Pérdida: <b>${fmt(h.secundaria.hf, 2)} m</b> (F = ${fmt(h.secundaria.f, 3)}) · velocidad ${fmt(h.secundaria.v, 2)} m/s</p>` : ''}
    <h3>Principal (tramos en serie desde la bomba)</h3>
    <div class="scroll"><table class="data"><thead><tr><th>Tramo</th><th class="num">Caudal (m³/h)</th><th class="num">Largo (m)</th><th class="num">Di (mm)</th><th class="num">C</th><th class="num">Velocidad (m/s)</th><th class="num">Pérdida (m)</th><th></th></tr></thead><tbody>
      ${hd.principal.map((t, i) => {
        const o = h?.principal[i] || {};
        const inp = (k, w = 80, ph = '') => `<input aria-label="${k} del tramo ${esc(t.nombre)}" type="number" step="any" inputmode="decimal" class="w-${w} t-der" data-bind="riego.datos.hidraulica.principal.${i}.${k}" data-nullable data-rerender value="${t[k] ?? ''}" placeholder="${ph}">`;
        return `<tr><td><input aria-label="Nombre del tramo" class="w-70" data-bind="riego.datos.hidraulica.principal.${i}.nombre" data-rerender value="${esc(t.nombre)}"></td>
          <td class="num">${inp('caudal', 110, r.caudalSector ? fmt(r.caudalSector) : '')}</td><td class="num">${inp('largo')}</td><td class="num">${inp('di')}</td><td class="num">${inp('c', 70, '140')}</td>
          <td class="num">${fmt(o.v, 2)}</td><td class="num">${fmt(o.hf, 2)}</td>
          <td><button class="btn small" data-act="riego-rm-tramo" data-i="${i}">Quitar</button></td></tr>`;
      }).join('') || '<tr><td colspan="8" class="muted">Sin tramos. Un caudal vacío usa el caudal del sector.</td></tr>'}
      ${h?.principal.length ? `<tr><td><b>Total</b></td><td></td><td class="num">${fmt(hd.principal.reduce((a, t) => a + (t.largo || 0), 0))}</td><td></td><td></td><td></td><td class="num"><b>${fmt(h.hfPrincipal, 2)}</b></td><td></td></tr>` : ''}
    </tbody></table></div>
    <div><button class="btn small" data-act="riego-add-tramo">Agregar tramo</button></div>
    <h3>Carga total de la bomba (CDT)</h3>
    <div class="fields">
      ${campo('rg-fil', 'Pérdida en filtros', 'riego.datos.hidraulica.filtros', hd.filtros, 'm (dato del fabricante)')}
      ${campo('rg-acc', 'Pérdida en accesorios', 'riego.datos.hidraulica.accesorios', hd.accesorios, 'm (válvulas, codos, cabezal)')}
      ${campo('rg-des', 'Desnivel bomba → sector', 'riego.datos.hidraulica.desnivel', hd.desnivel, 'm (negativo si baja)')}
      ${campo('rg-efb', 'Eficiencia de la bomba', 'riego.datos.hidraulica.eficienciaBomba', hd.eficienciaBomba, 'fracción (para la potencia)')}
    </div>
    ${h?.cdt ? `<div class="scroll"><table class="data"><tbody>
      ${h.partes.map((x) => `<tr><td>${x.nombre}</td><td class="num">${x.valor === null ? '<span class="muted">sin dato</span>' : `${fmt(x.valor, 2)} m`}</td></tr>`).join('')}
      <tr><td><b>CDT</b></td><td class="num"><b>${fmt(h.cdt, 1)} m</b></td></tr>
      ${h.potenciaHp ? `<tr><td>Potencia = Q (L/s) × CDT / (76 × eficiencia)</td><td class="num"><b>${fmt(h.potenciaHp, 1)} HP</b></td></tr>` : ''}
    </tbody></table></div>` : '<p class="muted">Ingresa la presión de operación para sumar la carga de la bomba.</p>'}
  ${SEC_CIERRA}

  ${secAbre('rg-reservorio', 'Reservorio', res ? `${fmt(res.volumen, 0)} m³` : 'Faltan datos', false, S.abiertos)}
    ${metodo('rg-reservorio', `Volumen = demanda del ciclo (ETc × (1 − aporte de la fuente) ÷ eficiencia × 10 × área) + evaporación del espejo. Evaporación diaria (mm) = radiación (MJ/m²/día) × ${CONFIG.riego.fraccionEvaporacion} ÷ calor latente (2.501 − 0.002361 × temperatura), en los días del ciclo. Necesita la fecha de siembra de "Consumo del ciclo".`)}
    ${tieneClima(clima) ? '' : lineaClima}
    <div class="fields">
      ${campo('rg-ap', 'Aporte de la fuente', 'riego.datos.reservorio.aporteFuente', rv.aporteFuente, 'fracción de la ETc (0 si no aporta)')}
      ${campo('rg-rl', 'Largo del reservorio', 'riego.datos.reservorio.largo', rv.largo, 'm, en el borde')}
      ${campo('rg-ra', 'Ancho del reservorio', 'riego.datos.reservorio.ancho', rv.ancho, 'm, en el borde')}
      ${campo('rg-rt', 'Talud', 'riego.datos.reservorio.talud', rv.talud, 'horizontal por 1 vertical (0 = pared vertical)', null, 0)}
      ${campo('rg-rb', 'Borde libre', 'riego.datos.reservorio.bordeLibre', rv.bordeLibre, 'fracción de la profundidad', null, CONFIG.riego.bordeLibre)}
    </div>
    <div class="scroll"><table class="data"><thead><tr><th></th>${NOMBRES_MES.map((m) => `<th class="num">${mes3(m)}</th>`).join('')}</tr></thead><tbody>
      <tr><td>Radiación (MJ/m²/día)</td>${NOMBRES_MES.map((m, i) => `<td><input aria-label="Radiación de ${m}" type="number" step="any" inputmode="decimal" class="w-80 t-der" data-bind="riego.datos.reservorio.radiacion.${i}" data-nullable data-rerender value="${rv.radiacion[i] ?? ''}"></td>`).join('')}</tr>
      <tr><td>Temperatura (°C)</td>${NOMBRES_MES.map((m, i) => `<td><input aria-label="Temperatura de ${m}" type="number" step="any" inputmode="decimal" class="w-64 t-der" data-bind="riego.datos.reservorio.temperatura.${i}" data-nullable data-rerender value="${rv.temperatura[i] ?? ''}" placeholder="20"></td>`).join('')}</tr>
      ${c?.conFecha ? `<tr><td class="muted">Días del ciclo</td>${c.diasPorMes.map((x) => `<td class="num muted">${x || ''}</td>`).join('')}</tr>` : ''}
    </tbody></table></div>
    <p class="muted small">W/m² medio del día × 0.0864 = MJ/m²/día.</p>
    ${res ? `<div class="summary">
      <div><div class="k">Demanda del ciclo</div><div class="v">${fmt(res.demanda, 0)} m³</div></div>
      <div><div class="k">Evaporación</div><div class="v">${fmt(res.evaporacionMm)} mm · ${fmt(res.evaporacion, 0)} m³</div></div>
      <div><div class="k">Volumen total</div><div class="v">${fmt(res.volumen, 0)} m³</div></div>
      <div><div class="k">Profundidad</div><div class="v">${res.profundidad ? `${fmt(res.profundidad, 2)} m · con borde ${fmt(res.profundidadTotal, 2)} m` : '—'}</div></div>
    </div>` : '<p class="muted">Falta el consumo del ciclo o el área del lote.</p>'}
  ${SEC_CIERRA}

  ${R.fuente === 'archivo' ? `${secAbre('rg-archivo', 'Qué se leyó del archivo', `${Object.keys(o).length} datos`, false, S.abiertos)}
    <p class="muted small">Cada dato con la celda de donde salió. Si algo quedó mal, corrígelo arriba.</p>
    <div class="scroll"><table class="data"><thead><tr><th>Dato</th><th>Etiqueta en el archivo</th><th class="num">Valor</th><th>Celda</th></tr></thead><tbody>
      ${Object.values(o).map((x) => `<tr><td>${esc(x.nombre)}</td><td>${esc(x.etiqueta)}</td><td class="num">${esc(String(x.valor))}</td><td>${esc(x.celda)}</td></tr>`).join('')}
    </tbody></table></div>
    ${R.faltan?.length ? `<p><b>No se encontraron:</b> ${esc(R.faltan.join(', '))}. Complétalos arriba o se usará la referencia cuando exista.</p>` : '<p>Se encontraron todos los datos de entrada.</p>'}
    ${R.omitidas?.length ? `<p class="muted">Hojas no analizadas: ${R.omitidas.map((h) => `${esc(h.nombre.trim())} (${esc(h.motivo)})`).join('; ')}.</p>` : ''}
  ${SEC_CIERRA}` : ''}`;
}
