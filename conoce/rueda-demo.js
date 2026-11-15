// Rueda del año de la página de presentación (/conoce/). Usa la misma geometría y los mismos anillos que la rueda
// de la app (src/ui/rueda.js) y la dibuja con los datos de conoce/datos-demo.js (finca demostrativa, ficticia).
// Aquí solo hay funciones puras, que se prueban sin navegador; el DOM se arma en conoce.js.
export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const MESES_LARGOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const R_TXT = 194;
const GAP = 1.2;
// De afuera hacia adentro, igual que en la app.
export const ANILLOS = [
  { id: 'lluvia', r0: 150, r1: 172 },
  { id: 'flor', r0: 126, r1: 148 },
  { id: 'aplic', r0: 102, r1: 124 },
  { id: 'ciclo', r0: 78, r1: 100 },
];
export const COINC = { r0: 56, r1: 74 };

const rad = (g) => (g * Math.PI) / 180;
// Mismo formato que la app (un decimal): así los trazos de las dos ruedas son idénticos y una prueba lo comprueba.
const pt = (r, g) => `${(r * Math.cos(rad(g))).toFixed(1)},${(r * Math.sin(rad(g))).toFixed(1)}`;
export const punto = (r, g) => pt(r, g).split(',');

// Sector de anillo entre los ángulos a0 y a1 (grados; 0 = a la derecha, enero empieza arriba).
export function sector(r0, r1, a0, a1) {
  return `M${pt(r1, a0)}A${r1},${r1} 0 0 1 ${pt(r1, a1)}L${pt(r0, a1)}A${r0},${r0} 0 0 0 ${pt(r0, a0)}Z`;
}
export const angulos = (i) => [-90 + i * 30 + GAP, -90 + (i + 1) * 30 - GAP];
export const anguloMedio = (i) => -90 + i * 30 + 15;

// Piezas que se dibujan en un mes: cada una con su clase y su trazo.
export function piezasMes(d, i) {
  const [a0, a1] = angulos(i);
  const activo = { lluvia: d.lluvia, flor: d.flor, aplic: d.aplic, ciclo: d.siembra || d.cosecha };
  const piezas = ANILLOS.map((a) => {
    let cls = activo[a.id] ? `r-on r-${a.id}` : 'r-off';
    if (a.id === 'ciclo' && activo.ciclo) cls += d.cosecha ? ' r-cosecha' : ' r-siembra';
    if (a.id === 'flor' && d.florRiesgo) cls += ' r-flor-riesgo';
    return { cls, d: sector(a.r0, a.r1, a0, a1) };
  });
  piezas.push({ cls: `r-coinc c${Math.min(d.coinc.length, 2)}`, d: sector(COINC.r0, COINC.r1, a0, a1) });
  return { toque: sector(COINC.r0, 176, a0 - GAP, a1 + GAP), piezas };
}

// Lo que pasa en el mes, con las frases de la app. La de aplicaciones va en impersonal («Se aplican»): la finca de
// esta rueda es la demostrativa, no la de quien visita la página.
export function hechosMes(d) {
  const h = [];
  if (d.lluvia) h.push(['lluvia', 'Lluvia fuerte']);
  if (d.flor) h.push(['flor', 'Florecen plantas que visitan los polinizadores']);
  if (d.florRiesgo) h.push(['flor-riesgo', 'Florece una especie de riesgo para las abejas']);
  if (d.aplic) h.push(['aplic', 'Se aplican plaguicidas que exponen a los polinizadores']);
  if (d.siembra) h.push(['siembra', 'Siembra']);
  if (d.cosecha) h.push(['cosecha', 'Cosecha']);
  return h;
}

export function etiquetaMes(d, i) {
  const partes = hechosMes(d).map(([, t]) => t.toLowerCase());
  const c = d.coinc.length;
  return `${MESES_LARGOS[i]}: ${partes.length ? partes.join(', ') : 'sin actividad registrada'}; `
    + `${c ? `${c} ${c === 1 ? 'coincidencia' : 'coincidencias'} de riesgo` : 'sin coincidencias de riesgo'}.`;
}

// Mes con más coincidencias (el primero si hay empate): el que se muestra cuando no hay animación.
export function mesMasCargado(meses) {
  let mejor = 0;
  meses.forEach((d, i) => { if (d.coinc.length > meses[mejor].coinc.length) mejor = i; });
  return mejor;
}

// Meses con al menos una coincidencia, en orden: los recorre el aviso de la portada.
export const mesesConCoincidencias = (meses) => meses.map((d, i) => ({ i, coinc: d.coinc })).filter((m) => m.coinc.length);
