// Hidráulica del sector más desfavorable y cubicación del reservorio. Funciones puras: dato → resultado.
// Fórmulas tal como las usan las hojas del Lab de Riego, Zamorano (Anner Almendárez, 2025). Ver docs/catalogo-riego.md.

import { CONFIG } from '../core/config.js';

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const pos = (x) => (num(x) !== null && x > 0 ? x : null);

// Hazen-Williams con Q en L/h y Di en mm: hf (m) = K · Q^1.852 · L / (C^1.852 · Di^4.871) · F.
// K = 3163 en las hojas del Lab; la forma del sistema internacional (10.67, Q en m³/s, D en m) da 3151.
export const K_HW = 3163;
export const M_HW = 1.852;
export const hazenWilliams = (qLh, largo, di, c, f = 1) => (K_HW * qLh ** M_HW * largo) / (c ** M_HW * di ** 4.871) * f;

// Factor de salidas múltiples de Christiansen para N salidas.
export const factorF = (n) => 1 / (M_HW + 1) + 1 / (2 * n) + Math.sqrt(M_HW - 1) / (6 * n * n);

// Velocidad (m/s) de un caudal en L/h por un diámetro interno en mm.
export const velocidad = (qLh, di) => qLh / 3.6e6 / (Math.PI * (di / 2000) ** 2);

// Pérdida en un lateral de n emisores: el primero a una distancia entre emisores del inicio (hoja Lateral, columna H).
function hfLateral(n, q, de, di, c) {
  return hazenWilliams(n * q, n * de, di, c, factorF(n));
}

// Largo máximo del lateral: el mayor número de emisores cuya pérdida no pasa de hfMax.
export function largoMaximoLateral(q, de, di, c, hfMax) {
  if (!pos(q) || !pos(de) || !pos(di) || !pos(c) || !pos(hfMax)) return null;
  let n = 1;
  if (hfLateral(1, q, de, di, c) > hfMax) return { emisores: 0, largo: 0 };
  while (n < 100000 && hfLateral(n + 1, q, de, di, c) <= hfMax) n++;
  return { emisores: n, largo: n * de };
}

// Hidráulica del sector más desfavorable: lateral, secundaria y principal, y la carga total de la bomba (CDT).
// d = datos completados; r = resultado del diseño agronómico (caudal por sector).
export function calcularHidraulica(d, r) {
  const h = d.hidraulica;
  if (!h) return null;
  const o = { faltan: [] };
  const po = pos(h.presionOperacion);
  o.hfMax = po ? po * CONFIG.riego.hfMaxFraccion : null;
  const q = d.caudalEmisor, de = d.distEmisores;

  // Lateral
  const cl = pos(h.cLateral) ?? 150;
  if (pos(h.diLateral) && pos(q) && pos(de)) {
    o.lateralMax = o.hfMax ? largoMaximoLateral(q, de, h.diLateral, cl, o.hfMax) : null;
    if (pos(h.largoLateral)) {
      const n = Math.max(1, Math.round(h.largoLateral / de));
      o.lateral = { largo: h.largoLateral, emisores: n, caudal: n * q, f: factorF(n), hf: hfLateral(n, q, de, h.diLateral, cl) };
    }
  }

  // Secundaria: las salidas son los laterales que alimenta (largo / distancia entre laterales) si no se dan.
  const s = h.secundaria || {};
  if (pos(s.caudal) && pos(s.largo) && pos(s.di)) {
    const qLh = s.caudal * 1000;
    const salidas = pos(s.salidas) ?? (pos(d.distLaterales) ? s.largo / d.distLaterales : null);
    const f = salidas ? factorF(salidas) : 1;
    o.secundaria = { caudal: s.caudal, largo: s.largo, di: s.di, salidas, f, hf: hazenWilliams(qLh, s.largo, s.di, pos(s.c) ?? 140, f), v: velocidad(qLh, s.di) };
  }

  // Principal: tramos en serie desde la bomba hasta el sector; sin caudal, el del sector.
  o.principal = (h.principal || []).map((t) => {
    const caudal = pos(t.caudal) ?? r.caudalSector ?? null;
    if (!pos(caudal) || !pos(t.largo) || !pos(t.di)) return { nombre: t.nombre, incompleto: true };
    const qLh = caudal * 1000;
    return { nombre: t.nombre, caudal, largo: t.largo, di: t.di, hf: hazenWilliams(qLh, t.largo, t.di, pos(t.c) ?? 140), v: velocidad(qLh, t.di) };
  });
  const tramos = o.principal.filter((t) => !t.incompleto);
  o.hfPrincipal = tramos.reduce((a, t) => a + t.hf, 0);

  // CDT = presión de operación + pérdidas en lateral, secundaria y principal + filtros + accesorios + desnivel
  // (componentes de la hoja "CDT por sector de riego" del Lab).
  const partes = [
    ['Presión de operación', po],
    ['Lateral', o.lateral?.hf ?? null],
    ['Secundaria', o.secundaria?.hf ?? null],
    ['Principal', tramos.length ? o.hfPrincipal : null],
    ['Filtros', num(h.filtros)],
    ['Accesorios', num(h.accesorios)],
    ['Desnivel', num(h.desnivel)],
  ];
  o.partes = partes.map(([nombre, valor]) => ({ nombre, valor }));
  o.faltan = partes.filter(([, v]) => v === null).map(([n]) => n);
  if (po && partes.slice(1, 4).some(([, v]) => v !== null)) o.cdt = partes.reduce((a, [, v]) => a + (v ?? 0), 0);
  // Potencia: P (HP) = Q (L/s) × CDT (m) / (76 × eficiencia de la bomba).
  const qBomba = tramos[0]?.caudal ?? r.caudalSector;
  if (o.cdt && pos(qBomba) && pos(h.eficienciaBomba) && h.eficienciaBomba <= 1) {
    o.potenciaHp = (qBomba / 3.6) * o.cdt / (76 * h.eficienciaBomba);
  }
  return o;
}

// Calor latente de vaporización (MJ/kg) según la temperatura (FAO-56, ec. 3-1 del anexo 3).
export const calorLatente = (t) => 2.501 - 0.002361 * t;

// Reservorio: demanda del ciclo + evaporación del espejo; profundidad con paredes verticales o con talud.
// d = datos completados; ciclo = calcularCiclo(d).
export function calcularReservorio(d, ciclo) {
  const res = d.reservorio;
  if (!res || !ciclo || !pos(d.areaLote)) return null;
  // Sin ningún dato del reservorio no se calcula: evita avisos en diseños que no lo usan.
  if (num(res.aporteFuente) === null && !pos(res.largo) && !pos(res.ancho) && !(res.radiacion || []).some((x) => pos(x))) return null;
  const o = {};
  const aporte = num(res.aporteFuente) ?? 0;
  const ef = pos(d.eficiencia) ?? 1;
  o.aporteFuente = aporte;
  o.deficitMm = ciclo.etcCiclo * (1 - aporte);
  o.laminaBrutaMm = o.deficitMm / ef;
  o.demanda = o.laminaBrutaMm * 10 * d.areaLote; // m³

  // Evaporación: radiación (MJ/m²/día) × fracción / λ = mm/día, por cada día del ciclo en ese mes.
  const L = pos(res.largo), W = pos(res.ancho);
  o.areaEspejo = L && W ? L * W : null; // m²
  const rad = Array.isArray(res.radiacion) ? res.radiacion : [];
  const temp = Array.isArray(res.temperatura) ? res.temperatura : [];
  const frac = pos(res.fraccionEvaporacion) ?? CONFIG.riego.fraccionEvaporacion;
  o.mesesSinRadiacion = [];
  o.evaporacionMm = 0;
  ciclo.diasPorMes.forEach((dias, mes) => {
    if (!dias) return;
    if (!pos(rad[mes])) { o.mesesSinRadiacion.push(mes); return; }
    o.evaporacionMm += dias * rad[mes] * frac / calorLatente(num(temp[mes]) ?? 20);
  });
  o.evaporacion = o.areaEspejo ? (o.evaporacionMm / 1000) * o.areaEspejo : null; // m³
  o.volumen = o.demanda + (o.evaporacion ?? 0);

  // Profundidad: con talud z (horizontal:vertical) hacia adentro desde el borde, V(h) = h·[L·W − z·h·(L+W) + 4/3·z²·h²].
  if (o.areaEspejo) {
    const z = num(res.talud) ?? 0;
    const vol = (hh) => hh * (L * W - z * hh * (L + W) + (4 / 3) * z * z * hh * hh);
    const hMax = z > 0 ? Math.min(L, W) / (2 * z) : Infinity; // el fondo se cierra
    if (z <= 0) o.profundidad = o.volumen / (L * W);
    else if (vol(hMax) >= o.volumen) {
      let a = 0, b = hMax;
      for (let i = 0; i < 100; i++) { const m = (a + b) / 2; if (vol(m) < o.volumen) a = m; else b = m; }
      o.profundidad = (a + b) / 2;
    } else o.noCabe = true;
    const borde = num(res.bordeLibre) ?? CONFIG.riego.bordeLibre;
    if (o.profundidad) o.profundidadTotal = o.profundidad * (1 + borde);
  }
  return o;
}
