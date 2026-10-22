// Plaguicidas: dosis de ingrediente activo por hectárea, peligro para himenópteros polinizadores y avisos.
// Método (ver docs/formulas.md):
//   g i.a./ha = producto por ha (L o kg) × concentración (g/L o g/kg)
//   HQ = g i.a./ha ÷ DL50 por contacto (µg/abeja)  (FAO, Pesticide Registration Toolkit)
// El HQ se compara con el umbral de la UE (42 hacia abajo, 85 hacia arriba o de lado). Si la finca registra
// abejas sin aguijón, el HQ se multiplica por 10 (derivado de Arena y Sgolastra 2014).
// Una mezcla toma el mayor HQ de sus ingredientes.

import { CONFIG } from '../core/config.js';
import { M, inter, uniq } from '../core/utils.js';
import { UNIDADES_DOSIS, esLiquida, plagBorrador, componenteVacio } from './modelo.js';
import { ingrediente, buscarIngrediente, normalizar } from './catalogo.js';
import { productoSag, eficacia, ENFERMEDADES, FUENTE_SAG, PRODUCTOS_SAG } from './sag.js';
import { tieneClima } from '../clima/normales.js';

export const FUENTES_PLAG = {
  fao: { cita: 'FAO, Pesticide Registration Toolkit: riesgos para abejas (HQ y umbrales de 42 y 85).', url: 'https://www.fao.org/pesticide-registration-toolkit/registration-tools/registration-criteria/environmental-risks/risks-for-bees/en/' },
  epa: { cita: 'EPA, clases de toxicidad aguda para abejas, citadas por Pesticide Stewardship.', url: 'https://pesticidestewardship.org/pollinator-protection/pesticide-toxicity-to-bees/' },
  arena: { cita: 'Arena, M. y Sgolastra, F. (2014). A meta-analysis comparing the sensitivity of bees to pesticides. Ecotoxicology 23(3): 324-334. El factor ×10 es una derivación, no una norma.', url: 'https://doi.org/10.1007/s10646-014-1190-1' },
  ppdb: { cita: 'PPDB y BPDB, Universidad de Hertfordshire.', url: 'https://sitem.herts.ac.uk/aeru/ppdb/' },
  gus: { cita: 'Índice GUS (Gustafson, 1989), con la interpretación del PPDB: mayor de 2.8, lixiviación alta.', url: 'https://sitem.herts.ac.uk/aeru/ppdb/' },
  aplicacion: { cita: 'Clase de Protección Vegetal, Zamorano: Correcta aplicación de agroquímicos.', url: '' },
  etiquetas: { cita: 'Clase de Protección Vegetal, Zamorano: Interpretación de etiquetas.', url: '' },
  muestreo: { cita: 'Clase de Protección Vegetal, Zamorano: Monitoreo en cultivos hortícolas.', url: '' },
  sag: { cita: FUENTE_SAG, url: '' },
  propio: { cita: 'Criterio propio, por validar con un especialista.', url: '' },
  clima: { cita: 'Clima típico de la ubicación: Open-Meteo, clima histórico (ERA5 / ERA5-Land), promedio de los últimos años; límites de la guía de Protección Vegetal de Zamorano: Correcta aplicación.', url: 'https://open-meteo.com/en/docs/historical-weather-api' },
};

const fmt = (x, d = 1) => (x == null || !Number.isFinite(x) ? '—' : x.toLocaleString('es-HN', { maximumFractionDigits: d }));
// HQ legible: sin decimales cuando es grande.
export const fmtHQ = (x) => fmt(x, x >= 100 ? 0 : 1);
const mesesTxt = (a) => a.map((m) => M[m]).join(', ');

// Géneros neotropicales de abejas sin aguijón (tribu Meliponini). La finca las registra en su inventario de especies.
const SIN_AGUIJON = ['melipona', 'trigona', 'plebeia', 'scaptotrigona', 'tetragonisca', 'nannotrigona', 'partamona', 'cephalotrigona',
  'frieseomelitta', 'oxytrigona', 'tetragona', 'lestrimelitta', 'trigonisca', 'geotrigona', 'paratrigona', 'scaura', 'aparatrigona'];
export function abejasSinAguijon(f) {
  return (f.especies ?? []).filter((e) => {
    const n = normalizar(e.nombre);
    return SIN_AGUIJON.includes(n.split(' ')[0]) || /sin aguijon|melipon/.test(n);
  });
}

// Clase de toxicidad de la EPA por la DL50 de contacto. Con "> valor" solo se sabe que es al menos esa clase.
export function claseEPA(dl50, mayor = false, cfg = CONFIG) {
  if (dl50 == null || !(dl50 > 0)) return null;
  const { alta, baja } = cfg.plag.epa;
  if (!mayor) return dl50 <= alta ? 'I' : dl50 < baja ? 'II' : 'III';
  return dl50 >= baja ? 'III' : dl50 >= alta ? 'II o III' : null;
}
export const CLASE_EPA = { I: 'I. Altamente tóxico', II: 'II. Tóxico', III: 'III. Relativamente no tóxico', 'II o III': 'II o III (la DL50 es un mínimo)' };

const esCobre = (a) => (a.componentes ?? []).some((c) => ingrediente(c.ia)?.cobre || /cobre|copper/i.test(c.nombre))
  || /cobre|copper/i.test(productoSag(a.sag)?.ia ?? '') || /cobre/i.test(a.producto);

// Nombre de un ingrediente para mostrar.
export const nombreComp = (c) => ingrediente(c.ia)?.nombre || c.nombre || 'Ingrediente sin nombre';

// Producto aplicado por hectárea (L o kg) a partir de la dosis por tanque o por hectárea.
export function productoPorHa(a, cfg = CONFIG) {
  const U = UNIDADES_DOSIS[a.dosisUnidad];
  const P = cfg.plag;
  if (a.dosis == null || !(a.dosis > 0)) return { motivo: 'Falta la dosis.' };
  const liq = esLiquida(a.formulacion);
  if (U.medida === 'copas' && liq === false) return { motivo: 'Las copas miden volumen: en un polvo o un granulado no se pueden pasar a gramos. Escribe la dosis en gramos por bomba o por barril.' };
  if (liq != null && U.volumen !== liq) return { motivo: `La dosis está en ${U.volumen ? 'volumen' : 'peso'} y la formulación ${a.formulacion} es ${liq ? 'líquida' : 'sólida'}: revisa la unidad.` };
  if (!U.tanque) return { valor: a.dosis, medida: U.volumen ? 'L' : 'kg' };
  if (a.volumen == null || !(a.volumen > 0)) return { motivo: 'Falta el volumen de agua por hectárea para pasar la dosis por tanque a dosis por hectárea.' };
  const tanque = U.tanque === 'barril' ? P.barrilL : P.bombaL;
  const porTanque = U.medida === 'copas' ? a.dosis * P.copaMl : a.dosis; // ml o g por tanque
  return { valor: (porTanque / 1000) * (a.volumen / tanque), medida: U.volumen ? 'L' : 'kg' };
}

// ¿La dosis aplicada pasa la de referencia (etiqueta o cuadro SAG)? Compara las dos en producto por hectárea;
// si no se puede (por ejemplo, falta el agua por hectárea), las compara tal cual cuando están en la misma unidad.
// Devuelve { veces } si la pasa, false si no, y null si no se pueden comparar.
export function sobreDosis(a, ref, cfg = CONFIG) {
  if (!(ref?.dosis > 0) || !(a.dosis > 0)) return null;
  const x = productoPorHa(a, cfg), y = productoPorHa({ ...a, ...ref }, cfg);
  const [v, r] = x.valor != null && y.valor != null && x.medida === y.medida ? [x.valor, y.valor] : ref.dosisUnidad === a.dosisUnidad ? [a.dosis, ref.dosis] : [];
  if (v == null) return null;
  return v > r * (1 + 1e-9) ? { veces: v / r } : false;
}

// Dosis de cada ingrediente en g/ha y su HQ. Devuelve el detalle por ingrediente y el resultado del producto.
export function peligroAbejas(a, f, cfg = CONFIG) {
  const P = cfg.plag;
  const umbral = P.umbralHQ[a.direccion] ?? P.umbralHQ.abajo;
  const nativas = abejasSinAguijon(f ?? {});
  const factor = nativas.length ? P.factorSinAguijon : 1;
  const base = { umbral, factor, nativas, comps: [], calculable: false, supera: null, hq: null, hqEf: null, cota: false, motivo: '' };
  const comps = a.componentes ?? [];
  if (!comps.length) return { ...base, motivo: 'Falta el ingrediente activo.' };
  const ph = productoPorHa(a, cfg);
  const detalle = comps.map((c) => {
    const cat = ingrediente(c.ia);
    const dl50 = cat ? cat.dl50 : c.dl50;
    const mayor = cat ? cat.mayor : c.mayor;
    const conc = c.conc == null ? null : a.concUnidad === 'pct' ? c.conc * 10 : c.conc; // g/L o g/kg
    const gHa = ph.valor != null && conc != null ? ph.valor * conc : null;
    const motivo = ph.valor == null ? ph.motivo : conc == null ? `Falta la concentración de ${nombreComp(c)}.`
      : dl50 == null ? `Falta la DL50 por contacto de ${nombreComp(c)}: búscala en la hoja de seguridad o en el PPDB.` : '';
    const hq = gHa != null && dl50 > 0 ? gHa / dl50 : null;
    const hqEf = hq == null ? null : hq * factor;
    // Con "> DL50" el HQ es un máximo: si aun así queda bajo el umbral, no lo supera; si no, no se sabe.
    const supera = hqEf == null ? null : mayor ? (hqEf > umbral ? null : false) : hqEf > umbral;
    return { nombre: nombreComp(c), ia: c.ia, cat, conc, gHa, dl50, mayor, clase: claseEPA(dl50, mayor, cfg), hq, hqEf, supera, motivo, gus: cat?.gus ?? null };
  });
  const con = detalle.filter((d) => d.hq != null);
  if (!con.length) return { ...base, comps: detalle, producto: ph, motivo: detalle.find((d) => d.motivo)?.motivo || 'Faltan datos.' };
  // Ingrediente que manda: el que supera; si ninguno, el de mayor HQ.
  const peor = [...con].sort((x, y) => (y.supera === true) - (x.supera === true) || y.hqEf - x.hqEf)[0];
  const supera = con.some((d) => d.supera === true) ? true
    : con.some((d) => d.supera === null) || con.length < detalle.length ? null : false;
  const motivo = con.length < detalle.length ? detalle.find((d) => d.motivo)?.motivo ?? '' : '';
  return { ...base, comps: detalle, producto: ph, calculable: true, supera, hq: peor.hq, hqEf: peor.hqEf, cota: peor.mayor, peor, motivo };
}

// ¿La aplicación cuenta como exposición de los polinizadores? Lo no biológico cuenta como antes; lo biológico cuenta
// si su HQ supera el umbral o si la etiqueta advierte por abejas (el spinosad es de origen biológico y es clase I).
export function cuentaParaAbejas(p, f, cfg = CONFIG) {
  if (p.clase !== 'biologico' || p.etiquetaAbejas || p.noFloracion) return true;
  return peligroAbejas(p, f, cfg).supera === true;
}

// Puntaje 0/50/100 del peligro de una aplicación en floración, para el módulo Polinizadores.
// Con HQ manda el HQ; con aviso en la etiqueta, 100; sin datos, la clase elegida por el usuario.
export function puntajePeligro(p, f, cfg = CONFIG) {
  const C = cfg.categorias.clasePlaguicida;
  if (p.etiquetaAbejas || p.noFloracion) return { puntaje: 100, por: 'etiqueta' };
  const r = peligroAbejas(p, f, cfg);
  if (r.calculable && r.supera === true) return { puntaje: 100, por: 'hq', r };
  if (r.calculable && r.supera === false) return { puntaje: 0, por: 'hq', r };
  if (r.calculable && r.supera === null && !r.motivo) return { puntaje: 50, por: 'hq', r }; // DL50 "> valor": indeterminado
  return { puntaje: C[p.clase] ?? 100, por: 'clase', r };
}

// Grupos de modo de acción (FRAC o IRAC) de un texto como "11 + 3" o "FRAC M03".
export function grupos(s) {
  return uniq0(String(s ?? '').toUpperCase().replace(/\b(FRAC|IRAC|HRAC)\b/g, ' ').split(/[+,;/]| Y /)
    .map((x) => x.trim().replace(/^([MP])\s*0*(\d)/, '$1$2')).filter((x) => x && !/^(NC|\?+|UN[BEFM]?|NO SÉ)$/.test(x)));
  // UN, UNB, UNE, UNF, UNM: modo de acción desconocido (IRAC); no hay grupo con qué rotar.
}
const uniq0 = (a) => [...new Set(a)];

// Familia para comparar grupos: un 28 de FRAC (propamocarb) no es un 28 de IRAC (diamidas).
// IRAC clasifica insecticidas, acaricidas y nematicidas; FRAC, fungicidas y bactericidas; HRAC, herbicidas.
const FAMILIA = { insecticida: 'IRAC', acaricida: 'IRAC', nematicida: 'IRAC', fungicida: 'FRAC', bactericida: 'FRAC', herbicida: 'HRAC' };
function familia(a) {
  if (a.uso) return FAMILIA[a.uso] ?? '';
  if (a.sag != null) return 'FRAC';
  const fams = uniq0((a.componentes ?? []).map((c) => FAMILIA[ingrediente(c.ia)?.uso]).filter(Boolean));
  return fams.length === 1 ? fams[0] : '';
}
export const gruposDe = (a) => grupos(a.grupo || (a.componentes ?? []).map((c) => ingrediente(c.ia)?.grupo).filter(Boolean).join(' + '));

// Rotación: aplicaciones seguidas (por mes) del mismo grupo de modo de acción, dentro de la misma familia.
export function rotacion(lista) {
  // Fosetil aluminio: el cuadro SAG lo marca FRAC 33 y su ficha del PPDB, P07; se comparan como un mismo grupo.
  const orden = lista.map((a, i) => {
    const fam = familia(a);
    return { a, i, m: a.meses.length ? Math.min(...a.meses) : 12, fam, g: gruposDe(a).map((x) => (fam === 'FRAC' && x === 'P7' ? '33' : x)) };
  }).filter((x) => x.fam && x.g.length).sort((x, y) => x.m - y.m || x.i - y.i);
  const rachas = [];
  for (const fam of uniq0(orden.map((x) => x.fam))) {
    const sec = orden.filter((x) => x.fam === fam);
    for (const g of uniq0(sec.flatMap((x) => x.g))) {
      let run = [];
      const cierra = () => { if (run.length > 1) rachas.push({ fam, g, items: run }); run = []; };
      sec.forEach((x) => (x.g.includes(g) ? run.push(x) : cierra()));
      cierra();
    }
  }
  // Une rachas con las mismas aplicaciones (una mezcla "11 + 3" seguida de otra "11 + 3" es una sola racha).
  const unidas = [];
  for (const r of rachas) {
    const k = r.items.map((x) => x.i).join(',');
    const u = unidas.find((x) => x.k === k);
    if (u) u.grupos.push(r.g); else unidas.push({ k, fam: r.fam, grupos: [r.g], items: r.items });
  }
  return unidas.map((u) => ({ familia: u.fam, grupos: u.grupos, indices: u.items.map((x) => x.i), productos: u.items.map((x) => x.a.producto || 'Sin nombre') }));
}

const aviso = (nivel, titulo, detalle, fuente) => ({ nivel, titulo, detalle, fuente: fuente ? FUENTES_PLAG[fuente] ?? fuente : null });
const horaNum = (h) => { const [x, y] = h.split(':').map(Number); return x + y / 60; };
const FUENTE_SUPERFICIAL = /quebrada|r[ií]o|reservorio|laguna|lago|estanque|canal|represa|poza/i;
const USOS_MONITOREO = ['insecticida', 'fungicida', 'acaricida', 'nematicida', 'bactericida'];

// Avisos de una aplicación. Cada aviso dice qué pasa, por qué importa y su fuente.
export function revisarAplicacion(a, f, cfg = CONFIG, ctx = {}) {
  const P = cfg.plag;
  const out = [];
  const atraeFlor = ctx.atraeFlor ?? uniq(f.especies.filter((e) => e.atrae).flatMap((e) => e.floracion));
  const cosechaM = ctx.cosechaM ?? uniq(f.cultivos.flatMap((c) => c.cosecha));
  const enFlor = inter(a.meses, atraeFlor);
  const r = ctx.peligro ?? peligroAbejas(a, f, cfg);
  const extra = r.factor > 1 ? ` con el margen ×${r.factor} por las abejas sin aguijón de tu finca` : '';

  // 1. Peligro para abejas (HQ).
  if (!r.calculable) out.push(aviso('criterio', 'Falta un dato para calcular el peligro para abejas', r.motivo, null));
  else {
    const hq = `HQ ${r.cota ? 'de hasta ' : ''}${fmtHQ(r.hqEf)}${extra}`;
    const quien = r.comps.length > 1 ? ` (${r.peor.nombre})` : '';
    if (r.supera === true && enFlor.length) out.push(aviso('error', 'Peligro alto para abejas en floración',
      `${hq}${quien} supera el umbral de ${r.umbral} en ${mesesTxt(enFlor)}, meses con floración visitada. Hace falta una medida: otro producto de menor peligro, aplicar fuera de la floración o no aplicar sobre las flores visitadas.`, 'fao'));
    else if (r.supera === true) out.push(aviso('advertencia', 'Supera el umbral de peligro para abejas',
      `${hq}${quien} supera el umbral de ${r.umbral}. No coincide con la floración que registraste, pero las malezas en flor y los cultivos vecinos también atraen abejas: revisa antes de aplicar.`, 'fao'));
    else if (r.supera === null) out.push(aviso('criterio', 'Peligro para abejas sin resolver',
      r.motivo || `La DL50 de ${r.peor.nombre} es "mayor que ${fmt(r.peor.dl50, 4)}" µg/abeja: el ${hq} es un máximo y queda sobre el umbral de ${r.umbral}, así que no se sabe si lo supera.`, 'fao'));
    else out.push(aviso('ok', 'Bajo el umbral de peligro para abejas', `${hq}${quien}, umbral ${r.umbral}.`, 'fao'));
    if (r.supera === true && a.clase === 'biologico') out.push(aviso('advertencia', 'Marcado como biológico, pero es tóxico para abejas',
      `El origen biológico no lo hace seguro: ${r.peor.nombre} tiene una DL50 de ${fmt(r.peor.dl50, 4)} µg/abeja (clase ${r.peor.clase ?? '—'} de la EPA).`, 'epa'));
  }
  // 2. La etiqueta.
  if ((a.etiquetaAbejas || a.noFloracion) && enFlor.length) out.push(aviso('error', 'La etiqueta advierte por las abejas y aplicas en floración',
    `La etiqueta trae ${a.noFloracion ? '"no aplicar en floración"' : 'el pictograma "tóxico para abejas"'} y aplicas en ${mesesTxt(enFlor)}, meses con floración visitada.`, 'etiquetas'));
  // La dosis frente a la etiqueta (manda) o, si no se anotó, frente al cuadro SAG (referencia).
  const unidad = UNIDADES_DOSIS[a.dosisUnidad]?.nombre ?? '';
  const masPct = (x) => `${fmt((x.veces - 1) * 100, 0)} % más`;
  const sobreEtq = sobreDosis(a, { dosis: a.dosisEtiqueta, dosisUnidad: a.dosisUnidad }, cfg);
  const prodSag = a.dosisEtiqueta == null && a.sag != null ? productoSag(a.sag) : null;
  const refSag = prodSag ? dosisSag(prodSag, a.formulacion) : null;
  const sobreSag = refSag ? sobreDosis(a, refSag, cfg) : null;
  if (sobreEtq) out.push(aviso('error', 'Dosis mayor que la de la etiqueta',
    `Aplicas ${fmt(a.dosis)} ${unidad} y la etiqueta indica hasta ${fmt(a.dosisEtiqueta)} (${masPct(sobreEtq)}). La etiqueta manda: aplicar más de lo que indica no está autorizado y sube el peligro para abejas.`, 'etiquetas'));
  else if (sobreSag) out.push(aviso('advertencia', 'Dosis mayor que la del cuadro SAG',
    `Aplicas ${fmt(a.dosis)} ${unidad} y el cuadro SAG da ${fmt(refSag.dosis)} ${UNIDADES_DOSIS[refSag.dosisUnidad]?.nombre ?? ''} (${masPct(sobreSag)}). El cuadro es de referencia: confirma la dosis máxima en la etiqueta y anótala en «Lo que dice la etiqueta».`, 'sag'));
  // 3. Hora y condiciones del día (clase: Correcta aplicación).
  if (a.hora) {
    const h = horaNum(a.hora);
    if (!P.horario.some(([i, j]) => h >= i && h <= j)) out.push(aviso('advertencia', 'Fuera del horario de aplicación',
      `Aplicas a las ${a.hora}; la guía de Zamorano indica aplicar entre 5:00 y 9:30 o entre 15:30 y 18:00.`, 'aplicacion'));
    if (enFlor.length && h >= 5 && h <= 18) out.push(aviso('advertencia', 'Con polinizadores, aplicar de noche',
      `Hay floración visitada en ${mesesTxt(enFlor)}: en cultivos con polinizadores la guía de Zamorano indica aplicar de noche.`, 'aplicacion'));
  }
  if (a.viento != null && a.viento > P.vientoMax) out.push(aviso('advertencia', 'Viento fuerte', `${fmt(a.viento)} km/h; la guía de Zamorano pide no aplicar con más de ${P.vientoMax} km/h.`, 'aplicacion'));
  if (a.temp != null && (a.temp < P.temp[0] || a.temp > P.temp[1])) out.push(aviso('advertencia', 'Temperatura fuera de rango', `${fmt(a.temp)} °C; la guía de Zamorano indica entre ${P.temp[0]} y ${P.temp[1]} °C.`, 'aplicacion'));
  if (a.hr != null && a.hr < P.hrMin) out.push(aviso('advertencia', 'Humedad relativa baja', `${fmt(a.hr, 0)} %; la guía de Zamorano indica más de ${P.hrMin} %.`, 'aplicacion'));
  if (a.lluviaH != null && a.lluviaH < P.lluviaMinH) out.push(aviso('advertencia', 'Lluvia muy pronto', `Llovió ${fmt(a.lluviaH)} h después de aplicar; la guía de Zamorano pide al menos ${P.lluviaMinH} h sin lluvia.`, 'aplicacion'));
  // Sin condiciones del día: el clima típico de los meses de aplicación en la ubicación de la finca (Issue #8).
  // Es un promedio diario, no la hora de aplicación: sirve para planear, no reemplaza medir el día.
  if (a.viento == null && a.temp == null && a.hr == null) out.push(...avisosClimaTipico(a.meses, f.clima, cfg));
  if (a.ph != null) {
    const etiqueta = a.phMin != null && a.phMax != null && a.phMin <= a.phMax;
    const cobre = esCobre(a);
    const [lo, hi] = etiqueta ? [a.phMin, a.phMax] : cobre ? P.phCobre : P.ph;
    const quien = etiqueta ? 'la etiqueta indica' : cobre ? 'para cobres, la tabla SAG indica' : 'la guía de Zamorano indica (la tabla SAG dice 5-6)';
    if (a.ph < lo || a.ph > hi) out.push(aviso('advertencia', 'pH del agua fuera de rango', `pH ${fmt(a.ph)}; ${quien} ${lo}-${hi}.`, etiqueta ? 'etiquetas' : cobre ? 'sag' : 'aplicacion'));
  }
  // 4. ¿Sirve para la enfermedad? (cuadro SAG).
  if (a.enfermedad != null && ENFERMEDADES[a.enfermedad]) {
    const e = ENFERMEDADES[a.enfermedad];
    const prod = productoSag(a.sag);
    if (prod) {
      const ef = eficacia(prod, e.id);
      if (ef == null) out.push(aviso('error', 'El producto no sirve para esa enfermedad',
        `En el cuadro SAG, ${prod.nombre} no tiene eficacia marcada contra ${e.nombre}. La guía de Zamorano señala este error como el más común: revisa el producto.`, 'sag'));
      else if (ef <= 2) out.push(aviso('advertencia', 'Eficacia baja', `${ef} de 5 contra ${e.nombre} en el cuadro SAG (5 excelente, 1 poco o nada).`, 'sag'));
      else out.push(aviso('ok', 'Sirve para la enfermedad', `Eficacia ${ef} de 5 contra ${e.nombre} en el cuadro SAG.`, 'sag'));
    } else if (!a.uso || a.uso === 'fungicida') out.push(aviso('criterio', 'Elige el producto en el cuadro SAG', `Así la app comprueba si sirve contra ${e.nombre}.`, 'sag'));
  }
  // 5. Cosecha, número de aplicaciones y franja al agua (etiqueta).
  const enCosecha = inter(a.meses, cosechaM);
  if (enCosecha.length) out.push(a.diasCosecha != null
    ? aviso('advertencia', 'Aplicación en mes de cosecha', `Aplicas en ${mesesTxt(enCosecha)}: deja al menos ${fmt(a.diasCosecha, 0)} día(s) entre la aplicación y la cosecha.`, 'etiquetas')
    : aviso('criterio', 'Aplicación en mes de cosecha', `Aplicas en ${mesesTxt(enCosecha)}. Anota los días a cosecha de la etiqueta para revisar el intervalo de seguridad.`, 'etiquetas'));
  if (a.aplicMax != null && a.meses.length > a.aplicMax) out.push(aviso('advertencia', 'Más aplicaciones que las que permite la etiqueta',
    `Aplicas en ${a.meses.length} meses y la etiqueta permite ${a.aplicMax} aplicación(es) por ciclo.`, 'etiquetas'));
  if (a.franja != null && f.distAgua != null && f.distAgua < a.franja) out.push(aviso('error', 'Muy cerca del agua',
    `El cuerpo de agua está a ${fmt(f.distAgua, 0)} m y la etiqueta pide una franja de ${fmt(a.franja, 0)} m sin aplicar.`, 'etiquetas'));
  // 6. Monitoreo previo (clase: Monitoreo en cultivos hortícolas).
  if (USOS_MONITOREO.includes(a.uso) && !a.monitoreo) out.push(aviso('criterio', 'Sin monitoreo previo registrado',
    'Marca si un monitoreo mostró la plaga o la enfermedad antes de aplicar: el monitoreo sirve para decidir cuándo aplicar y ahorrar las aplicaciones que no hacen falta.', 'muestreo'));
  // 7. Vínculos con riego y fertilización.
  const movil = r.comps.filter((c) => c.gus != null && c.gus > P.gusAlto);
  if (movil.length && (a.metodo === 'suelo' || a.metodo === 'riego')) {
    const lluvia = inter(a.meses, f.lluviaMeses).length > 0;
    out.push(aviso('advertencia', 'Producto móvil aplicado al suelo',
      `${movil.map((c) => `${c.nombre} (GUS ${fmt(c.gus, 2)})`).join(' y ')} tiene lixiviación alta y lo aplicas ${a.metodo === 'riego' ? 'por el riego' : 'al suelo'}${lluvia ? ' en meses de lluvia fuerte' : ''}: un riego excesivo o la lluvia lo pueden llevar al agua subterránea. Revisa la lámina en la pestaña Riego. El umbral de lámina no está verificado.`, 'gus'));
  }
  if (f.riego === 'aspersion' && a.metodo === 'foliar') out.push(aviso('criterio', 'Riego por aspersión después de aplicar',
    'No riegues por aspersión en las 4 horas siguientes. Es una inferencia, no verificada: la guía de Zamorano pide 4 horas sin lluvia y la aspersión moja el follaje igual.', 'aplicacion'));
  if (a.metodo === 'riego') out.push(aviso('criterio', 'Aplicación por el sistema de riego',
    'Usa una válvula antirretorno para que la mezcla no regrese a la fuente de agua. Recomendación común de diseño, sin fuente verificada todavía.', null));
  const foliar = inter(a.meses, (f.fertPlan ?? []).filter((x) => x.metodo === 'foliar').map((x) => x.mes));
  if (foliar.length) out.push(aviso('criterio', 'Fertilización foliar en los mismos meses',
    `Si lo mezclas con el foliar de ${mesesTxt(foliar)}, haz antes una prueba en un envase pequeño y respeta el orden de mezcla: WP y WG primero, luego EC, SC y SL.`, 'aplicacion'));
  return out;
}

// Clima típico de los meses de aplicación contra los límites de la clase (temperatura, humedad, viento, lluvia).
export function avisosClimaTipico(meses, clima, cfg = CONFIG) {
  if (!tieneClima(clima) || !meses?.length) return [];
  const P = cfg.plag, C = cfg.clima;
  const de = (k, fn) => meses.filter((m) => clima.meses[m]?.[k] != null && fn(clima.meses[m][k]));
  const val = (k, ms, red = Math.max) => fmt(red(...ms.map((m) => clima.meses[m][k])), k === 'hr' || k === 'lluvia' ? 0 : 1);
  const partes = [];
  const calor = de('tmax', (x) => x > P.temp[1]);
  if (calor.length) partes.push(`en ${mesesTxt(calor)} la máxima típica llega a ${val('tmax', calor)} °C, sobre los ${P.temp[1]} °C de la guía de Zamorano: aplica temprano (5:00-9:30) o al final de la tarde (15:30-18:00)`);
  const seco = de('hr', (x) => x < P.hrMin);
  if (seco.length) partes.push(`en ${mesesTxt(seco)} la humedad media típica baja a ${val('hr', seco, Math.min)} %, bajo el ${P.hrMin} % de la guía de Zamorano: el producto se evapora y deriva más; aplica en las horas más húmedas`);
  const viento = de('viento2', (x) => x > P.vientoMax);
  if (viento.length) partes.push(`en ${mesesTxt(viento)} el viento medio típico es de ${val('viento2', viento)} km/h, sobre los ${P.vientoMax} km/h de la guía de Zamorano: busca las horas de calma`);
  const lluvia = de('lluvia', (x) => x >= C.lluviaFuerteMm);
  if (lluvia.length) partes.push(`${mesesTxt(lluvia)} ${lluvia.length > 1 ? 'son meses lluviosos' : 'es un mes lluvioso'} (${val('lluvia', lluvia)} mm): revisa el pronóstico, la guía de Zamorano pide ${P.lluviaMinH} h sin lluvia después de aplicar`);
  if (!partes.length) return [aviso('ok', 'El clima típico de esos meses está dentro de lo que pide la guía de Zamorano', 'Temperatura máxima, humedad, viento y lluvia típicos de tu ubicación están en rango. Igual revisa las condiciones del día.', 'clima')];
  return [aviso('criterio', 'Clima típico de los meses de aplicación', `${partes.join('; ')}. Es el promedio de tu ubicación: anota las condiciones del día en "Condiciones el día de la aplicación".`.replace(/^./, (x) => x.toUpperCase()), 'clima')];
}

// Avisos de la finca completa: rotación, agua para la mezcla y abejas sin aguijón.
export function revisarFinca(f, cfg = CONFIG) {
  const out = [];
  const lista = f.plaguicidas ?? [];
  for (const r of rotacion(lista)) {
    const frac = r.familia === 'FRAC';
    out.push(aviso('advertencia', `Mismo grupo ${r.familia} seguido`,
      `${r.productos.length} aplicaciones seguidas del grupo ${r.grupos.join(' y ')}: ${r.productos.join(' → ')}. Rota con otro grupo para retrasar la resistencia.${frac ? '' : ` La regla de la tabla SAG es para FRAC; con ${r.familia} se aplica el mismo principio (criterio propio).`}`,
      frac ? 'sag' : 'propio'));
  }
  if (lista.length && FUENTE_SUPERFICIAL.test(f.fuenteAgua ?? '')) out.push(aviso('criterio', 'Agua de fuente superficial para la mezcla',
    `Tu fuente es "${f.fuenteAgua}": puede traer tierra, inóculo de enfermedades y un pH fuera de rango. La guía de Zamorano indica clorar el agua (25 ml de cloro por barril de 200 L, 30 minutos) y medir el pH antes de mezclar.`, 'aplicacion'));
  const nat = abejasSinAguijon(f);
  if (nat.length) out.push(aviso('criterio', 'Abejas sin aguijón en tu finca',
    `Registraste ${nat.map((e) => e.nombre).join(', ')}. Casi toda la toxicidad publicada es de Apis mellifera, así que la app multiplica el HQ por ${cfg.plag.factorSinAguijon}.`, 'arena'));
  return out;
}

// Resumen para la pestaña: cada aplicación con su dosis, su peligro y sus avisos, más los avisos de la finca.
export function resumenPlag(f, cfg = CONFIG) {
  const atraeFlor = uniq(f.especies.filter((e) => e.atrae).flatMap((e) => e.floracion));
  const cosechaM = uniq(f.cultivos.flatMap((c) => c.cosecha));
  const filas = (f.plaguicidas ?? []).map((a, i) => {
    const peligro = peligroAbejas(a, f, cfg);
    return { a, i, peligro, avisos: revisarAplicacion(a, f, cfg, { atraeFlor, cosechaM, peligro }) };
  });
  const generales = revisarFinca(f, cfg);
  const todos = [...filas.flatMap((x) => x.avisos), ...generales];
  const cuenta = (n) => todos.filter((x) => x.nivel === n).length;
  const altos = filas.filter((x) => x.peligro.supera === true);
  return {
    filas, generales, atraeFlor, cosechaM,
    mesesAplic: uniq(filas.flatMap((x) => x.a.meses)),
    mesesPeligro: uniq(altos.flatMap((x) => x.a.meses)),
    enFlor: uniq(filas.filter((x) => cuentaParaAbejas(x.a, f, cfg)).flatMap((x) => inter(x.a.meses, atraeFlor))),
    peor: [...filas].filter((x) => x.peligro.calculable).sort((x, y) => y.peligro.hqEf - x.peligro.hqEf)[0] ?? null,
    errores: cuenta('error'), revisar: cuenta('advertencia'),
    sinAguijon: abejasSinAguijon(f),
  };
}

// ——— Llenado del formulario desde el cuadro SAG y el catálogo ———

// "1 1/3" → 1.333; "2/3" → 0.667; "6" → 6. Lo que no es una cantidad simple → null.
export function fraccion(s) {
  const t = String(s ?? '').trim();
  let m = t.match(/^(\d+(?:\.\d+)?)$/);
  if (m) return Number(m[1]);
  m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = t.match(/^(\d+)\/(\d+)$/);
  return m ? Number(m[1]) / Number(m[2]) : null;
}
const FORM = ['EC', 'SC', 'SL', 'EW', 'ME', 'OD', 'SE', 'CS', 'OL', 'WP', 'WG', 'DF', 'SP', 'SG', 'DP', 'GR'];
export const formulacionDe = (nombre) => String(nombre ?? '').toUpperCase().split(/[^A-Z]+/).find((x) => FORM.includes(x)) ?? '';

// Dosis por barril de la tabla: "170 ml", "67 g", "1 Kg", "2.3 Lt", "1,560", "330".
function dosisBarril(s, liq) {
  const t = String(s ?? '').trim().replace(/(\d),(\d{3})\b/g, '$1$2');
  const m = t.match(/^(\d+(?:\.\d+)?)\s*(ml|g|kg|lt|l)?$/i);
  if (!m) return null;
  const v = Number(m[1]), u = (m[2] ?? '').toLowerCase();
  if (u === 'ml') return { dosis: v, dosisUnidad: 'mlBarril' };
  if (u === 'lt' || u === 'l') return { dosis: v * 1000, dosisUnidad: 'mlBarril' };
  if (u === 'g') return { dosis: v, dosisUnidad: 'gBarril' };
  if (u === 'kg') return { dosis: v * 1000, dosisUnidad: 'gBarril' };
  return liq == null ? null : { dosis: v, dosisUnidad: liq ? 'mlBarril' : 'gBarril' };
}
// Dosis por hectárea escrita en la columna de copas: "0.3 Lts/Ha", "4. Kg/Ha", "250. g/Ha".
function dosisHa(s) {
  const m = String(s ?? '').trim().match(/^(\d+(?:\.\d+)?)\.?\s*(lts?|l|kg|g)\s*\/\s*ha$/i);
  if (!m) return null;
  const v = Number(m[1]), u = m[2].toLowerCase();
  return u === 'kg' ? { dosis: v, dosisUnidad: 'kgha' } : u === 'g' ? { dosis: v / 1000, dosisUnidad: 'kgha' } : { dosis: v, dosisUnidad: 'Lha' };
}

// Copas por bomba contra dosis por barril de la tabla SAG (solo líquidos: una copa mide volumen).
export function compararCopas(prod, cfg = CONFIG, formulacion = formulacionDe(prod.nombre)) {
  const P = cfg.plag;
  const liq = esLiquida(formulacion);
  const copas = fraccion(prod.copas);
  const barril = dosisBarril(prod.barril, liq);
  if (liq !== true || copas == null || !barril || barril.dosisUnidad !== 'mlBarril') return null;
  const deCopas = (copas * P.copaMl * P.barrilL) / P.bombaL;
  const dif = (barril.dosis - deCopas) / deCopas;
  return { copas, deCopas, tabla: barril.dosis, dif, cuadra: Math.abs(dif) <= P.toleranciaCopas };
}

// Ingredientes de un texto de la tabla: "Azoxystrobin 20% + Cyproconazol 8%".
export function componentesDe(texto) {
  return String(texto ?? '').split('+').map((p) => {
    const pct = p.match(/(\d+(?:[.,]\d+)?)\s*%/);
    const nombre = p.replace(/\d+(?:[.,]\d+)?\s*%?/g, ' ').replace(/[.:_]/g, ' ').replace(/\s+/g, ' ').trim();
    const cat = buscarIngrediente(nombre);
    return { ia: cat?.id ?? (nombre ? 'otro' : ''), nombre: cat ? '' : nombre, conc: pct ? Number(pct[1].replace(',', '.')) : null, dl50: null, mayor: false };
  }).filter((c) => c.ia);
}

// Dosis de un producto del cuadro SAG según la formulación: por hectárea, por barril o en copas (solo líquidos).
// Un número por barril sin unidad solo se usa si se sabe la formulación (ml si es líquida, g si es polvo).
function dosisSag(prod, formulacion) {
  const liq = esLiquida(formulacion);
  const dosis = dosisHa(prod.copas) ?? dosisBarril(prod.barril, liq);
  if (!dosis && liq === true && fraccion(prod.copas) != null) return { dosis: fraccion(prod.copas), dosisUnidad: 'copas' };
  return dosis;
}

// Notas para el usuario sobre lo que la tabla dice y lo que hay que confirmar con la etiqueta.
function notasSag(prod, formulacion, dosis, cfg) {
  const notas = [];
  if (!dosis && !formulacion && (dosisSag(prod, 'SC') || dosisSag(prod, 'WP'))) {
    const tabla = [prod.copas && `copas por bomba: ${prod.copas}`, prod.barril && `por barril: ${prod.barril}`].filter(Boolean).join('; ');
    notas.push(`El nombre no dice la formulación y la tabla no da la unidad (${tabla}), así que no se sabe si son ml o g. Elige la formulación de la etiqueta y la dosis se llena sola.`);
  } else if (!dosis) notas.push(`La tabla da la dosis como "${prod.copas || prod.barril || 'sin dato'}": escríbela con la etiqueta.`);
  const cmp = compararCopas(prod, cfg, formulacion);
  if (cmp) notas.push(`${fmt(cmp.copas, 2)} copa(s) por bomba equivalen a ${fmt(cmp.deCopas)} ml por barril; la tabla dice ${fmt(cmp.tabla)} ml (${cmp.dif >= 0 ? '+' : ''}${fmt(cmp.dif * 100, 0)} %)${cmp.cuadra ? '.' : ': las dos columnas no cuadran, usa la etiqueta.'}`);
  if (componentesDe(prod.ia).some((c) => c.conc != null)) notas.push('La concentración sale del nombre en la tabla (%): confírmala con la etiqueta.');
  if (prod.nota) notas.push(`Ojo con la tabla: ${prod.nota}`);
  if (prod.reingreso === 'S') notas.push('Reingreso "S": la leyenda no lo define; probablemente es "hasta que seque la aspersión" (criterio propio, sin confirmar con el SAG). Entra cuando el follaje esté seco y, si la etiqueta da horas, usa las de la etiqueta.');
  return notas;
}

// Llena el borrador con un producto del cuadro SAG. Devuelve el borrador y las notas para el usuario.
// dosisDeTabla marca que la dosis vino de la tabla: sigue a la formulación hasta que el usuario la cambie.
export function desdeSag(d, id, cfg = CONFIG) {
  const prod = productoSag(id);
  if (!prod) return { borrador: { ...d, sag: null }, notas: [] };
  const formulacion = formulacionDe(prod.nombre);
  const componentes = componentesDe(prod.ia);
  const dosis = dosisSag(prod, formulacion);
  const notas = notasSag(prod, formulacion, dosis, cfg);
  const n = (s) => (/^\d+(\.\d+)?$/.test(String(s).trim()) ? Number(s) : null);
  const borrador = {
    ...d, sag: id, producto: prod.nombre, uso: 'fungicida', grupo: prod.frac === 'NC' ? '' : prod.frac, formulacion,
    grupoAuto: false, usoAuto: false, // el grupo y el uso vienen de la tabla
    componentes: componentes.length ? componentes : [componenteVacio()], concUnidad: 'pct',
    ...(dosis ?? { dosis: null }), dosisDeTabla: Boolean(dosis),
    metodo: /al riego/i.test(prod.nombre) ? 'riego' : d.metodo,
    reingreso: n(prod.reingreso), diasCosecha: n(prod.cosecha),
  };
  return { borrador, notas };
}

// Al elegir la formulación de un producto del cuadro SAG, rehace la dosis de la tabla con la unidad que corresponde
// (ml si es líquida, g si es polvo) y sus notas. No toca una dosis que escribió el usuario: entonces devuelve null.
export function alElegirFormulacion(d, cfg = CONFIG) {
  const prod = d.sag != null ? productoSag(d.sag) : null;
  if (!prod || (d.dosis != null && !d.dosisDeTabla)) return null;
  const dosis = dosisSag(prod, d.formulacion);
  return { borrador: { ...d, ...(dosis ?? { dosis: null }), dosisDeTabla: Boolean(dosis) }, notas: notasSag(prod, d.formulacion, dosis, cfg) };
}

// Al elegir un ingrediente del catálogo, llena el grupo y el uso con los del catálogo, salvo que el usuario los haya
// escrito (grupoAuto o usoAuto en false). Así, si cambia de ingrediente, el grupo no queda con el del anterior.
export function alElegirIngrediente(d) {
  const cats = d.componentes.map((c) => ingrediente(c.ia)).filter(Boolean);
  const out = { ...d };
  if (!cats.length) return out;
  if (d.grupoAuto !== false || !out.grupo) out.grupo = uniq0(cats.map((c) => c.grupo)).join(' + ');
  if (d.usoAuto !== false || !out.uso) out.uso = cats[0].uso;
  return out;
}

// Registro rápido: lo que el usuario buscó (un fungicida del cuadro SAG o un ingrediente del catálogo) llena el
// borrador como si lo hubiera elegido en el formulario completo. Si no hay mes marcado, marca el mes actual.
export function desdeBusqueda(d, texto, mes = null, cfg = CONFIG) {
  const t = String(texto ?? '').trim();
  const base = { ...d };
  delete base.buscar;
  if (!t) return { borrador: base, notas: [] };
  const n = normalizar(t);
  const prod = PRODUCTOS_SAG.find((p) => normalizar(p.nombre) === n);
  let r;
  if (prod) r = desdeSag(base, prod.id, cfg);
  else {
    const cat = buscarIngrediente(t);
    const b = { ...base, producto: t, sag: null };
    if (cat) {
      b.componentes = [{ ...componenteVacio(), ia: cat.id }];
      r = { borrador: alElegirIngrediente(b), notas: [`${cat.nombre}: la app ya conoce su peligro para abejas. Escribe la concentración que trae la etiqueta para calcularlo.`] };
    } else r = { borrador: b, notas: ['No está en el cuadro SAG ni en el catálogo: se guarda con el nombre que escribiste. Para calcular el peligro para abejas, completa el ingrediente en el formulario completo.'] };
  }
  if (!r.borrador.meses.length && Number.isInteger(mes)) r.borrador.meses = [mes];
  return r;
}

export const nuevoBorrador = plagBorrador;
