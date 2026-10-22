// Inicio en 3D: la finca isométrica, la esfera del índice, las columnas por tema y la franja del año.
// Todo se dibuja solo con lo que el usuario respondió: un lote por cultivo, ancho según sus hectáreas; la fuente de agua
// con su distancia; un árbol por especie de árbol y un punto por especie de fauna. Las posiciones son un esquema
// (lleva la nota «Esquema, no a escala»), no un mapa. Si no hay área ni cultivos, no se dibuja nada.
import { esc, MFULL, M } from '../core/utils.js';

const MAX_LOTES = 5, MAX_ARBOLES = 7, MAX_FAUNA = 4;
const pos = (x) => (Number.isFinite(+x) && +x > 0 ? +x : 0);
const ha = (x) => Math.round(x * 10) / 10;
const especies = (n) => `${n} ${n === 1 ? 'especie' : 'especies'}`;

// Cómo dibujar la fuente de agua según lo que escribió el usuario (es texto libre).
export function tipoAgua(txt) {
  const t = String(txt ?? '').trim();
  if (!t || /ningun|no hay|sin fuente/i.test(t)) return null;
  if (/pozo/i.test(t)) return 'pozo';
  if (/reservorio|laguna|lago|estanque|represa|poza|pila/i.test(t)) return 'estanque';
  if (/quebrada|r[ií]o|canal|nacimiento|arroyo|riachuelo/i.test(t)) return 'corriente';
  return 'otra';
}

// Datos del esquema, sin dibujo (se prueban aparte). u0/u1: tramo del lote a lo largo de la finca, de 0 a 1.
export function esquemaFinca(f) {
  const cultivos = (f?.cultivos ?? []).filter((c) => String(c?.nombre ?? '').trim());
  const area = pos(f?.area);
  const nArboles = (f?.especies ?? []).filter((e) => e?.tipo === 'Árbol').length;
  const nFauna = (f?.especies ?? []).filter((e) => e?.tipo === 'Fauna').length;
  const tipo = tipoAgua(f?.fuenteAgua);
  const agua = tipo ? { tipo, nombre: String(f.fuenteAgua).trim(), dist: Number.isFinite(f?.distAgua) ? f.distAgua : null } : null;
  let lista = cultivos.map((c) => ({ nombre: String(c.nombre).trim(), ha: pos(c.ha) }));
  if (lista.length > MAX_LOTES) {
    const resto = lista.slice(MAX_LOTES - 1);
    lista = [...lista.slice(0, MAX_LOTES - 1), { nombre: `Otros ${resto.length} cultivos`, ha: resto.reduce((s, c) => s + c.ha, 0) }];
  }
  const sumaHa = lista.reduce((s, c) => s + c.ha, 0);
  const total = Math.max(area, sumaHa);
  // Ancho en el esquema: la parte del área de cada cultivo (mínimo visible 7 %); sin hectáreas, partes iguales.
  const ANCHO = 0.92, MIN = 0.07;
  let partes = lista.map((c) => (sumaHa > 0 ? c.ha / total : 1 / lista.length) * ANCHO);
  partes = partes.map((p) => Math.max(p, MIN));
  const suma = partes.reduce((s, p) => s + p, 0);
  if (suma > ANCHO) partes = partes.map((p) => p * ANCHO / suma);
  let u = 0.04;
  const lotes = lista.map((c, i) => { const l = { ...c, u0: u, u1: u + partes[i] }; u += partes[i]; return l; });
  return {
    vacia: !lotes.length && !area, area, lotes, agua,
    arboles: Math.min(nArboles, MAX_ARBOLES), especiesArbol: nArboles,
    fauna: Math.min(nFauna, MAX_FAUNA), especiesFauna: nFauna,
  };
}

// Proyección isométrica: u a lo largo de la finca, v a lo ancho, z hacia arriba (en píxeles del dibujo).
const VB_W = 560, VB_H = 330, OX = 230, OY = 46, AU = 250, BU = 125, AV = 170, BV = 85, GROSOR = 18;
const P = (u, v, z = 0) => [OX + u * AU - v * AV, OY + u * BU + v * BV - z];
const pts = (...ps) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const poli = (cls, ...ps) => `<polygon class="${cls}" points="${pts(...ps)}"/>`;
const bajar = ([x, y], d = GROSOR) => [x, y + d];
const V0 = 0.06, V1 = 0.6, ALTO_LOTE = 7;

function losa() {
  const a = P(0, 0), b = P(1, 0), c = P(1, 1), d = P(0, 1);
  return `<ellipse class="f3d-sombra" cx="${(c[0] + 10).toFixed(1)}" cy="${(c[1] + 22).toFixed(1)}" rx="250" ry="38"/>`
    + poli('losa-izq', d, c, bajar(c), bajar(d)) + poli('losa-der', c, b, bajar(b), bajar(c)) + poli('losa-sup', a, b, c, d);
}

function lote(l, i) {
  const u0 = l.u0 + 0.005, u1 = l.u1 - 0.005, h = ALTO_LOTE;
  let surcos = '';
  for (let k = 1; k < 6; k++) {
    const v = V0 + (V1 - V0) * k / 6, [x1, y1] = P(u0 + 0.01, v, h), [x2, y2] = P(u1 - 0.01, v, h);
    surcos += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }
  return `<g class="lote lote-${i % 5}">`
    + poli('cara-izq', P(u0, V1, h), P(u1, V1, h), P(u1, V1), P(u0, V1))
    + poli('cara-der', P(u1, V0, h), P(u1, V1, h), P(u1, V1), P(u1, V0))
    + poli('cara-sup', P(u0, V0, h), P(u1, V0, h), P(u1, V1, h), P(u0, V1, h))
    + `<g class="surcos">${surcos}</g></g>`;
}
// Nombre y hectáreas sobre cada lote; se dibujan después de todos los lotes para que ninguno tape el texto del anterior.
// En lotes vecinos el texto alterna de fila para no encimarse.
function textoLote(l, i) {
  const [tx, ty] = P((l.u0 + l.u1) / 2, i % 2 ? 0.44 : 0.22, ALTO_LOTE);
  return `<text class="lote-txt" x="${tx.toFixed(1)}" y="${(ty + 4).toFixed(1)}" text-anchor="middle">${esc(l.nombre)}${l.ha ? ` · ${ha(l.ha)} ha` : ''}</text>`;
}

// Círculo en el suelo visto en isométrico (estanque, pozo).
const circuloIso = (cu, cv, r, z = 0, lados = 18) => Array.from({ length: lados }, (_, k) => {
  const a = k / lados * Math.PI * 2; return P(cu + Math.cos(a) * r, cv + Math.sin(a) * r, z);
});

// Dibujo del agua y el punto donde se ancla su etiqueta.
function agua(a) {
  if (a.tipo === 'corriente') {
    const ps = Array.from({ length: 9 }, (_, k) => P(k / 8, 0.66 + (k % 2 ? 0.035 : -0.015), 0.5));
    const linea = pts(...ps);
    return { svg: `<g class="agua"><polyline class="agua-cauce" points="${linea}"/><polyline class="agua-luz" points="${linea}"/><polyline class="agua-flujo" points="${linea}"/></g>`, ancla: ps[3] };
  }
  if (a.tipo === 'estanque') return { svg: `<g class="agua">${poli('agua-espejo', ...circuloIso(0.86, 0.82, 0.075, 0.5))}</g>`, ancla: P(0.86, 0.82) };
  if (a.tipo === 'pozo') {
    return { svg: `<g class="agua">${poli('pozo-borde', ...circuloIso(0.88, 0.8, 0.032, 8))}${poli('agua-espejo', ...circuloIso(0.88, 0.8, 0.022, 8))}</g>`, ancla: P(0.88, 0.8, 8) };
  }
  const [x, y] = P(0.88, 0.8, 2);
  return { svg: `<g class="agua"><circle class="agua-punto" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/></g>`, ancla: [x, y] };
}

function arboles(n) {
  const lista = Array.from({ length: n }, (_, k) => ({ u: 0.1 + (k + 0.5) * 0.8 / n, v: 0.82 + (k % 2 ? 0.07 : -0.02) }))
    .sort((a, b) => a.u + a.v - (b.u + b.v));
  const svg = lista.map(({ u, v }) => {
    const [x, y] = P(u, v), [, yc] = P(u, v, 19);
    return `<g class="arbol"><ellipse class="arbol-sombra" cx="${(x + 4).toFixed(1)}" cy="${(y + 1).toFixed(1)}" rx="11" ry="5"/>`
      + `<line class="tronco" x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(yc + 6).toFixed(1)}"/>`
      + `<circle class="copa" cx="${x.toFixed(1)}" cy="${yc.toFixed(1)}" r="10.5"/><circle class="copa-luz" cx="${(x - 3.5).toFixed(1)}" cy="${(yc - 3.5).toFixed(1)}" r="3.5"/></g>`;
  }).join('');
  const medio = lista[Math.floor((lista.length - 1) / 2)];
  return { svg, ancla: medio ? P(medio.u, medio.v, 19) : null };
}

function fauna(n) {
  const lista = Array.from({ length: n }, (_, k) => P(0.18 + k * 0.2, 0.28 + (k % 2) * 0.12, 44 + (k % 2) * 10));
  return {
    svg: `<g class="fauna">${lista.map(([x, y]) => `<circle class="abeja" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2"/>`).join('')}</g>`,
    ancla: lista[0] ?? null,
  };
}

// Etiqueta con línea guía: título y subtítulo en una cápsula de vidrio.
function etiqueta([ax, ay], [cx, cy], titulo, sub) {
  const w = Math.round(Math.max(titulo.length * 7.4, sub.length * 6.4) + 22), h = sub ? 38 : 26;
  const x = Math.min(Math.max(cx - w / 2, 4), VB_W - w - 4), y = Math.min(Math.max(cy - h / 2, 4), VB_H - h - 4);
  const bx = Math.min(Math.max(ax, x), x + w), by = ay < y ? y : y + h;
  return `<g class="etq"><line class="etq-guia" x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}"/>`
    + `<circle class="etq-punto" cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3"/>`
    + `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="11"/>`
    + `<text class="etq-t" x="${(x + 11).toFixed(1)}" y="${(y + 17).toFixed(1)}">${esc(titulo)}</text>`
    + (sub ? `<text class="etq-s" x="${(x + 11).toFixed(1)}" y="${(y + 31).toFixed(1)}">${esc(sub)}</text>` : '') + '</g>';
}

// Texto que lee un lector de pantalla en lugar del dibujo.
export function descripcionFinca(e) {
  const partes = [];
  if (e.lotes.length) partes.push(e.lotes.map((l) => `${l.nombre}${l.ha ? ` ${ha(l.ha)} ha` : ''}`).join(', '));
  if (e.agua) partes.push(`${e.agua.nombre}${e.agua.dist != null ? ` a ${e.agua.dist} m` : ''}`);
  if (e.especiesArbol) partes.push(`${especies(e.especiesArbol)} de árboles`);
  if (e.especiesFauna) partes.push(`${especies(e.especiesFauna)} de fauna`);
  return `Esquema de la finca${e.area ? ` de ${ha(e.area)} ha` : ''}${partes.length ? `: ${partes.join('; ')}` : ''}.`;
}

export function finca3d(e) {
  if (e.vacia) {
    return `<div class="escena-vacia"><p>Cuando escribas el área y tus cultivos, aquí aparece tu finca en 3D.</p><button class="btn" data-view="wizard">Llenar Mi finca</button></div>`;
  }
  const ag = e.agua ? agua(e.agua) : null, ar = arboles(e.arboles), fa = fauna(e.fauna);
  const etiquetas = [
    ag && etiqueta(ag.ancla, [96, 248], e.agua.nombre, e.agua.dist != null ? `a ${e.agua.dist} m` : ''),
    ar.ancla && etiqueta(ar.ancla, [452, 268], 'Árboles', especies(e.especiesArbol)),
    fa.ancla && etiqueta(fa.ancla, [70, 44], 'Fauna', especies(e.especiesFauna)),
  ].filter(Boolean).join('');
  return `<svg class="finca3d" viewBox="0 0 ${VB_W} ${VB_H}" role="img" aria-label="${esc(descripcionFinca(e))}">`
    + losa() + e.lotes.map(lote).join('') + (ag ? ag.svg : '') + ar.svg + fa.svg + e.lotes.map(textoLote).join('') + etiquetas + '</svg>';
}

// En el celular las etiquetas del dibujo quedan muy chicas: se ocultan y esta lista dice lo mismo debajo.
export function leyendaFinca(e) {
  if (e.vacia) return '';
  const items = [
    e.agua && `<li><i class="ley-agua"></i>${esc(e.agua.nombre)}${e.agua.dist != null ? ` · a ${e.agua.dist} m` : ''}</li>`,
    e.especiesArbol && `<li><i class="ley-arbol"></i>Árboles · ${especies(e.especiesArbol)}</li>`,
    e.especiesFauna && `<li><i class="ley-fauna"></i>Fauna · ${especies(e.especiesFauna)}</li>`,
  ].filter(Boolean);
  return items.length ? `<ul class="escena-leyenda" aria-hidden="true">${items.join('')}</ul>` : '';
}

// Esfera del índice global. Sin datos suficientes muestra una raya, no un número que parezca resultado.
export function orbe(v, nivel, sinDatos) {
  if (sinDatos) {
    return `<div class="orbe sin-datos" role="img" aria-label="Índice ambiental sin datos suficientes"><div class="orbe-esfera"><span class="orbe-num">—</span></div><p class="orbe-nivel">Sin datos suficientes</p></div>`;
  }
  return `<div class="orbe nivel-${nivel}" role="img" aria-label="Índice ambiental ${v} de 100, riesgo ${nivel.toLowerCase()}"><div class="orbe-esfera"><span class="orbe-num" data-contar="${v}">${v}</span></div>`
    + `<p class="orbe-nivel">Riesgo ${nivel.toLowerCase()}</p><p class="orbe-sub">Índice global · de 100</p></div>`;
}

// Columna 3D de un tema: la altura es el puntaje (0 a 100); el rombo punteado marca el 100.
export function prisma(puntaje, nivel) {
  const s = Number.isFinite(puntaje) ? Math.max(0, Math.min(100, puntaje)) : null;
  const cx = 60, base = 124, a = 28, b = 14, alto = (x) => 6 + x * 0.94;
  const rombo = (ct) => [[cx - a, ct], [cx, ct - b], [cx + a, ct], [cx, ct + b]];
  const techo = pts(...rombo(base - alto(100)));
  let cuerpo = '';
  if (s != null) {
    const ct = base - alto(s);
    const izq = [[cx - a, ct], [cx, ct + b], [cx, base + b], [cx - a, base]], der = [[cx, ct + b], [cx + a, ct], [cx + a, base], [cx, base + b]];
    cuerpo = `<g class="cuerpo">${poli('izq', ...izq)}${poli('der', ...der)}${poli('luz', ...izq)}${poli('luz', ...der)}${poli('sup', ...rombo(ct))}</g>`;
  } else cuerpo = `<polygon class="base-vacia" points="${pts(...rombo(base))}"/>`;
  return `<svg class="prisma nivel-${s == null ? 'sin' : nivel}" viewBox="0 0 120 150" aria-hidden="true">`
    + `<ellipse class="brillo" cx="${cx}" cy="${base + 6}" rx="46" ry="14"/><polygon class="techo" points="${techo}"/>${cuerpo}</svg>`;
}

// Degradado que comparten las columnas (un solo <svg> oculto por página).
export const defsPrisma = '<svg width="0" height="0" class="sprite" aria-hidden="true"><defs><linearGradient id="pr-luz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient></defs></svg>';

// Franja del año: cuántas coincidencias de riesgo hay cada mes (las mismas de «Este mes»).
export function anioFinca(mh, mesActual) {
  const c = mh.map((x) => x.length), max = Math.max(1, ...c);
  const barras = c.map((n, i) => {
    const h = 6 + n / max * 44, x = 6 + i * 24;
    return `<rect class="${n ? 'con' : 'sin'}${i === mesActual ? ' hoy' : ''}" x="${x}" y="${(56 - h).toFixed(1)}" width="16" height="${h.toFixed(1)}" rx="5"/>`
      + `<text x="${x + 8}" y="72" text-anchor="middle"${i === mesActual ? ' class="hoy"' : ''}>${M[i][0]}</text>`;
  }).join('');
  const etq = c.map((n, i) => `${MFULL[i]} ${n}`).join(', ');
  return `<svg class="anio" viewBox="0 0 294 78" role="img" aria-label="Coincidencias de riesgo por mes: ${etq}">${barras}</svg>`;
}
