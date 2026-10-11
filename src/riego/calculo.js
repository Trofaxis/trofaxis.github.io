// Cálculo del diseño agronómico de riego por goteo. Funciones puras: dato → resultado.
// Fórmulas documentadas en docs/catalogo-riego.md.

import { buscarCultivo, buscarTextura } from './referencias.js';
import { calcularHidraulica, calcularReservorio } from './hidraulica.js';

// Datos de entrada vacíos. null = el usuario no lo dio (se usa la referencia si existe).
export function riegoVacio() {
  return {
    cultivo: '', kcIni: null, kcMed: null, kcFin: null, etapas: [null, null, null, null],
    p: null, profRaiz: null, alturaPlanta: null,
    distPlantas: null, distSurcos: null, hileras: 1,
    caudalEmisor: null, distEmisores: null, distLaterales: null, eficiencia: null,
    eto: null, areaLote: null, horasLaborales: null, frecuenciaDias: 1,
    // Ciclo: fecha de siembra (AAAA-MM-DD) y ETo media diaria de cada mes (enero = 0).
    siembra: '', etoMensual: Array(12).fill(null), mes30: false,
    suelo: [],
    hidraulica: hidraulicaVacia(),
    reservorio: reservorioVacio(),
  };
}

// Sector más desfavorable: presiones en mca, diámetros internos en mm, caudales en m³/h, largos en m.
export function hidraulicaVacia() {
  return {
    presionOperacion: null, diLateral: null, cLateral: 150, largoLateral: null,
    secundaria: { caudal: null, largo: null, di: null, c: 140, salidas: null },
    principal: [],
    filtros: null, accesorios: null, desnivel: null, eficienciaBomba: null,
  };
}

// Reservorio: radiación media diaria por mes en MJ/m²/día, temperatura media por mes en °C, medidas en m.
export function reservorioVacio() {
  return { aporteFuente: null, radiacion: Array(12).fill(null), temperatura: Array(12).fill(null), largo: null, ancho: null, talud: 0, bordeLibre: null };
}

// Caso de ejemplo: diseño agronómico del Lab de Riego, Zamorano (Anner Almendárez, 2025),
// publicado con autorización del autor. Valores tal como están en la hoja original.
export function casoEjemplo() {
  return {
    cultivo: 'Maíz', kcIni: 0.35, kcMed: 1.2, kcFin: 0.35, etapas: [20, 35, 40, 30],
    p: 0.55, profRaiz: 0.6, alturaPlanta: 250,
    distPlantas: 0.3, distSurcos: 0.8, hileras: 1,
    caudalEmisor: 1.2, distEmisores: 0.3, distLaterales: 0.8, eficiencia: 0.9,
    eto: 6.84, areaLote: 12.43, horasLaborales: 11, frecuenciaDias: 1,
    // Siembra y ETo media diaria por mes (2024): hoja ETC de la cubicación del reservorio, mismo autor.
    // Mayo es el promedio de los 4 días del ciclo que caen en mayo.
    siembra: '2024-01-01', etoMensual: [3.55, 4.568, 4.79, 5.036, 4.32, null, null, null, null, null, null, null], mes30: false,
    suelo: [
      { nombre: 'Parte 1', area: 4.989, textura: 'Far', da: 1.35, cc: 27, pmp: 13, pedregosidad: 4, infiltracion: 7 },
      { nombre: 'Parte 2', area: 4.88, textura: 'F', da: 1.42, cc: 22, pmp: 10, pedregosidad: 30, infiltracion: 10 },
      { nombre: 'Parte 3', area: 2.566, textura: 'FA', da: 1.5, cc: 14, pmp: 6, pedregosidad: 25, infiltracion: 20 },
    ],
    // Sector 1 de la hoja "Diseño Hidráulico Lab de riego 2025": lateral de 137.1 m (el que toma la hoja CDT),
    // secundaria 1 (PVC 4", Di 107.3 mm) y los tramos principales que llevan agua al sector (PVC 6", Di 155.3 mm).
    // Filtros, accesorios y desnivel están vacíos en la hoja.
    hidraulica: {
      presionOperacion: 10.2, diLateral: 16.1, cLateral: 150, largoLateral: 137.1,
      secundaria: { caudal: 52.80694, largo: 74.72, di: 107.3, c: 140, salidas: null },
      principal: [['101', 314.47], ['102', 84.73], ['104', 136.77], ['106', 21.61], ['108', 128.41], ['110', 6.8], ['111', 75]]
        .map(([nombre, largo]) => ({ nombre, caudal: 100.76754, largo, di: 155.3, c: 140 })),
      filtros: null, accesorios: null, desnivel: null, eficienciaBomba: null,
    },
    // Cubicación del reservorio (mismo autor): fuente que cubre 15 %, radiación y temperatura de 2024, 110 × 110 m.
    reservorio: {
      aporteFuente: 0.15,
      radiacion: [15.0751, 18.9097, 20.1569, 20.1339, 18.0983, null, null, null, null, null, null, null],
      temperatura: [22, 23, 24, 25, 25, null, null, null, null, null, null, null],
      largo: 110, ancho: 110, talud: 0, bordeLibre: 0.1,
    },
  };
}

// Lo que la hoja de ejemplo trae ya calculado, para que el validador lo compare (ver docs/catalogo-riego.md).
export function declaradosEjemplo() {
  return {
    laa: [99.792, 65.604, 49.5],
    numerosFijos: [
      { celda: 'Diseño Agronomico!E24', formula: '=12.43/E23', numero: '12.43', coincide: 'el área del lote' },
      { celda: 'Diseño Agronomico!E26', formula: '=4896.45136111111*12', numero: '4896.45136111111', etiqueta: 'Volumen requerido por ciclo (m3)', coincide: 'la ETc del ciclo en m³/ha (489.6 mm) copiada de otra hoja, como la cubicación del reservorio' },
      { celda: 'Diseño Agronomico!E26', formula: '=4896.45136111111*12', numero: '12', etiqueta: 'Volumen requerido por ciclo (m3)', coincide: 'casi el área del lote (12.43 ha)' },
    ],
    volumenCiclo: 58757.42,
    etoEsMaximo: true,
  };
}

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const pos = (x) => (num(x) !== null && x > 0 ? x : null);

// Completa los datos que faltan con valores de referencia y anota cuáles se completaron.
export function completar(d) {
  const ref = buscarCultivo(d.cultivo);
  const usados = [];
  const tomar = (campo, valor, refValor, etiqueta) => {
    if (num(valor) !== null) return valor;
    if (refValor !== undefined && refValor !== null) { usados.push(etiqueta); return refValor; }
    return null;
  };
  const r = { ...d };
  r.kcIni = tomar('kcIni', d.kcIni, ref?.kc.ini.valor, 'Kc inicial');
  r.kcMed = tomar('kcMed', d.kcMed, ref?.kc.med.valor, 'Kc medio');
  r.kcFin = tomar('kcFin', d.kcFin, ref?.kc.fin.valor, 'Kc final');
  r.p = tomar('p', d.p, ref?.p.valor, 'Fracción p');
  r.etapas = (d.etapas || []).map((x, i) => tomar('etapa', x, ref?.etapas.valor[i], `Etapa ${i + 1}`));
  r.distEmisores = num(d.distEmisores) ?? num(d.distPlantas);
  r.distLaterales = num(d.distLaterales) ?? num(d.distSurcos);
  r.hileras = pos(d.hileras) ?? 1;
  r.frecuenciaDias = pos(d.frecuenciaDias) ?? 1;
  r.suelo = (d.suelo || []).map((s) => {
    const t = buscarTextura(s.textura);
    const out = { ...s };
    for (const k of ['da', 'cc', 'pmp', 'infiltracion']) {
      if (num(s[k]) === null && t && t[k] !== null) { out[k] = t[k]; usados.push(`${k.toUpperCase()} de ${s.nombre || 'suelo'} (textura ${t.codigo})`); }
    }
    out.pedregosidad = num(s.pedregosidad) ?? 0;
    return out;
  });
  return { datos: r, referencia: ref, usados };
}

// Ajuste de p por ETc (FAO-56, Tabla 22): p = p_tabla + 0.04 (5 − ETc), entre 0.1 y 0.8.
export const pAjustada = (p, etc) => Math.min(0.8, Math.max(0.1, p + 0.04 * (5 - etc)));

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const NOMBRES_MES = MESES;
const ETAPAS = ['Inicial', 'Desarrollo', 'Media', 'Final'];

// Consumo del ciclo por etapa, como en la clase: ETc de la etapa = Kc promedio de la etapa × suma de la ETo
// de sus días. Kc promedio: inicial; (inicial + medio)/2; medio; (medio + final)/2 (FAO-56, curva de 4 etapas).
// La ETo de cada día es la media del mes en que cae. Sin fecha de siembra ni ETo mensual se usa la ETo pico
// todos los días (sobreestima). mes30: meses de 30 días, la convención de la clase.
export function calcularCiclo(d) {
  const kc = [d.kcIni, d.kcMed, d.kcFin];
  if (kc.some((x) => num(x) === null) || !Array.isArray(d.etapas) || d.etapas.some((x) => !pos(x))) return null;
  const kcProm = [d.kcIni, (d.kcIni + d.kcMed) / 2, d.kcMed, (d.kcMed + d.kcFin) / 2];
  const mensual = Array.isArray(d.etoMensual) ? d.etoMensual : [];
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.siembra || '');
  const conMeses = m && mensual.some((x) => pos(x));
  if (!conMeses && !pos(d.eto)) return null;
  const [y, mo, dd] = m ? [+m[1], +m[2] - 1, +m[3]] : [0, 0, 1];
  const mesDelDia = (i) => (d.mes30 ? (mo + Math.floor((dd - 1 + i) / 30)) % 12 : new Date(Date.UTC(y, mo, dd + i)).getUTCMonth());
  const faltan = new Set();
  const diasPorMes = Array(12).fill(0);
  let dia = 0;
  const etapas = d.etapas.map((dias, k) => {
    let etoSum = 0;
    const meses = new Set();
    for (let i = 0; i < dias; i++, dia++) {
      let eto = d.eto;
      if (m) diasPorMes[mesDelDia(dia)]++;
      if (conMeses) {
        const mes = mesDelDia(dia);
        meses.add(mes);
        if (pos(mensual[mes])) eto = mensual[mes];
        else faltan.add(mes);
      }
      etoSum += pos(eto) ? eto : 0;
    }
    return { nombre: ETAPAS[k], dias, kc: kcProm[k], etoSum, etc: kcProm[k] * etoSum, meses: [...meses].map((x) => MESES[x]) };
  });
  const c = { etapas, fuenteEto: conMeses ? 'mensual' : 'pico', mesesSinEto: [...faltan].map((x) => MESES[x]), diasPorMes, conFecha: !!m };
  // Un mes sin dato usa la ETo pico; si tampoco hay, el cálculo queda incompleto.
  if (c.mesesSinEto.length && !pos(d.eto)) c.incompleto = true;
  c.etcCiclo = etapas.reduce((a, e) => a + e.etc, 0);
  if (pos(d.areaLote)) {
    c.volumenNeto = c.etcCiclo * 10 * d.areaLote; // m³ (1 mm en 1 ha = 10 m³)
    if (pos(d.eficiencia)) c.volumenBruto = c.volumenNeto / d.eficiencia;
  }
  return c;
}

export function calcular(entrada) {
  const { datos: d, referencia, usados } = completar(entrada);
  const r = { referencia, usados, datos: d };

  const kcMax = Math.max(...[d.kcIni, d.kcMed, d.kcFin].filter((x) => num(x) !== null));
  r.kcDesarrollo = num(d.kcIni) !== null && num(d.kcMed) !== null ? (d.kcIni + d.kcMed) / 2 : null;
  r.cicloDias = d.etapas.every((x) => num(x) !== null) ? d.etapas.reduce((a, b) => a + b, 0) : null;
  r.etc = num(d.eto) !== null && Number.isFinite(kcMax) ? d.eto * kcMax : null;

  if (pos(d.distPlantas) && pos(d.distSurcos)) r.densidadSiembra = (10000 / (d.distPlantas * d.distSurcos)) * d.hileras;

  // Marco por emisor: el área que moja cada gotero.
  if (pos(d.distLaterales) && pos(d.distEmisores)) {
    r.marco = (d.distLaterales * d.distEmisores) / d.hileras;
    r.densidadEmisores = 10000 / r.marco; // las hileras ya están dentro del marco
  }
  if (r.marco && pos(d.caudalEmisor)) {
    r.pp = d.caudalEmisor / r.marco; // mm/h
    r.caudalHa = (r.densidadEmisores * d.caudalEmisor) / 1000; // m³/h/ha
  }
  if (r.etc !== null && r.pp && pos(d.eficiencia)) r.tiempoRiego = r.etc / (r.pp * d.eficiencia);
  if (r.tiempoRiego && pos(d.horasLaborales)) {
    r.sectoresTeoricos = d.horasLaborales / r.tiempoRiego;
    r.sectores = Math.max(1, Math.floor(r.sectoresTeoricos));
    r.horasUsadas = r.sectores * r.tiempoRiego;
  }
  if (r.sectores && pos(d.areaLote)) {
    r.areaSector = d.areaLote / r.sectores;
    if (r.caudalHa) r.caudalSector = r.caudalHa * r.areaSector;
  }
  if (r.etc !== null && pos(d.areaLote)) {
    r.volumenPicoNeto = r.etc * 10 * d.areaLote; // m³/día
    if (pos(d.eficiencia)) r.volumenPicoBruto = r.volumenPicoNeto / d.eficiencia;
  }

  // Suelo, por sección. Todas las láminas en la zona radicular (× profundidad).
  r.pAjustada = r.etc !== null && num(d.p) !== null ? pAjustada(d.p, r.etc) : null;
  r.suelo = d.suelo.map((s) => {
    const o = { nombre: s.nombre, area: s.area, infiltracion: s.infiltracion };
    if (num(s.cc) !== null && num(s.pmp) !== null && pos(s.da)) {
      o.disponibleCmM = (s.cc - s.pmp) * s.da; // cm de agua por m de suelo
      const piedra = 1 - s.pedregosidad / 100;
      if (pos(d.profRaiz)) {
        o.lad = o.disponibleCmM * 10 * d.profRaiz; // mm en la zona radicular
        if (num(d.p) !== null) o.laaSinAjuste = o.disponibleCmM * d.p * piedra * 10 * d.profRaiz;
        if (r.pAjustada !== null) o.laa = o.disponibleCmM * r.pAjustada * piedra * 10 * d.profRaiz;
      }
      if (num(d.p) !== null) o.laaPorMetro = o.disponibleCmM * d.p * piedra * 10; // como lo calcula la hoja original
    }
    return o;
  });
  const laas = r.suelo.map((s) => s.laa).filter((x) => num(x) !== null);
  if (laas.length && r.etc) {
    r.laaLimitante = Math.min(...laas);
    r.seccionLimitante = r.suelo.find((s) => s.laa === r.laaLimitante)?.nombre;
    r.intervaloMax = Math.floor(r.laaLimitante / r.etc);
  }
  r.ciclo = calcularCiclo(d);
  r.hidraulica = calcularHidraulica(d, r);
  r.reservorio = calcularReservorio(d, r.ciclo);
  const infil = r.suelo.map((s) => s.infiltracion).filter((x) => pos(x));
  if (infil.length) r.infiltracionMin = Math.min(...infil);
  return r;
}
