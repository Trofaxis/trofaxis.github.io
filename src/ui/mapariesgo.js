// Mapa de riesgo del ApiRadar: SVG propio en metros (sin imagen satelital, funciona sin internet).
// Dibuja el contorno de la finca, cada árbol del censo (color por riesgo, ID), su radio de exclusión y los sitios candidatos
// (rombo con el color de su veredicto). Norte arriba. Todo se calcula en un plano local alrededor del primer árbol.
import { esc } from '../core/utils.js';
import { planoDe } from '../mapa/geo.js';
import { nombreSitio, VEREDICTO } from '../apiradar/censo.js';

const PASOS = [10, 20, 50, 100, 200, 500, 1000, 2000];
const fm = (n) => Math.round(n * 10) / 10;

// censo: R.censo del ApiRadar ({ arboles (con clase y vol), sitios, resumen }); contorno: [[lat, lon]]; radios: [mínimo, conservador] en m;
// mejor: punto más alejado ({ punto, distanciaM }) o null.
export function mapaRiesgo({ arboles, sitios }, contorno, radios, mejor) {
  if (!arboles.length) return '';
  const [rMin, rMax] = radios;
  const { aM } = planoDe([arboles[0].lat, arboles[0].lon]);
  const pa = arboles.map((a) => ({ ...a, p: aM([a.lat, a.lon]) }));
  const ps = sitios.map((s) => ({ ...s, p: aM([s.lat, s.lon]) }));
  const pc = (contorno.length >= 3 ? contorno : []).map(aM);
  const mj = mejor ? aM(mejor.punto) : null;
  const todos = [...pa.map((a) => a.p), ...ps.map((s) => s.p), ...pc, ...(mj ? [mj] : [])];
  // Margen: al menos el radio mínimo completo a la vista; el conservador sale del cuadro si hace falta.
  const x0 = Math.min(...todos.map((p) => p[0])) - rMin * 1.05, x1 = Math.max(...todos.map((p) => p[0])) + rMin * 1.05;
  const y0 = Math.min(...todos.map((p) => p[1])) - rMin * 1.05, y1 = Math.max(...todos.map((p) => p[1])) + rMin * 1.05;
  // Relación 16:10 como mínimo de ancho, para que el mapa no quede muy alto en pantallas anchas.
  let w = x1 - x0, h = y1 - y0;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  if (w < h * 1.4) w = h * 1.4; else if (h < w / 2.2) h = w / 2.2;
  const vx = cx - w / 2, vy = cy - h / 2;
  const u = w / 820; // metros por píxel aproximado de pantalla: da tamaño fijo a marcadores y letras
  const Y = (y) => fm(vy + h - (y - vy)); // el norte va arriba
  const X = (x) => fm(x);
  const paso = PASOS.find((s) => w / s <= 9) ?? PASOS.at(-1);
  const lineas = [];
  for (let x = Math.ceil(vx / paso) * paso; x <= vx + w; x += paso) lineas.push(`<line x1="${X(x)}" y1="${fm(vy)}" x2="${X(x)}" y2="${fm(vy + h)}"/>`);
  for (let y = Math.ceil(vy / paso) * paso; y <= vy + h; y += paso) lineas.push(`<line x1="${fm(vx)}" y1="${Y(y)}" x2="${fm(vx + w)}" y2="${Y(y)}"/>`);
  const volMax = Math.max(1, ...pa.map((a) => a.vol ?? 0));
  const rad = (a) => (4 + 6 * Math.sqrt((a.vol ?? 0) / volMax)) * u;
  const luz = (c) => (c === 'alto' ? 'alto' : c === 'medio' ? 'medio' : c === 'bajo' ? 'bajo' : 'sin');
  return `<svg class="mapa-riesgo" viewBox="${fm(vx)} ${fm(vy)} ${fm(w)} ${fm(h)}" role="img" aria-label="Mapa de riesgo: ${arboles.length} árbol(es) del censo con su radio de exclusión y ${sitios.length} sitio(s) candidato(s)">
    <g class="mr-rejilla" stroke-width="${fm(u)}">${lineas.join('')}</g>
    ${pc.length ? `<polygon class="mr-finca" stroke-width="${fm(u * 2)}" points="${pc.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ')}"><title>Contorno de la finca</title></polygon>` : ''}
    <g class="mr-radios" stroke-width="${fm(u * 1.5)}">${pa.map((a) => `<circle class="max" cx="${X(a.p[0])}" cy="${Y(a.p[1])}" r="${rMax}" stroke-dasharray="${fm(u * 6)} ${fm(u * 4)}"/><circle class="min" cx="${X(a.p[0])}" cy="${Y(a.p[1])}" r="${rMin}"/>`).join('')}</g>
    ${mj ? `<g class="mr-mejor" transform="translate(${X(mj[0])},${Y(mj[1])})"><circle r="${fm(u * 8)}" stroke-width="${fm(u * 2)}"/><title>Punto más alejado de los árboles del censo: ${mejor.distanciaM} m</title></g>` : ''}
    <g class="mr-arboles">${pa.map((a) => `<g transform="translate(${X(a.p[0])},${Y(a.p[1])})"><circle class="${luz(a.clase)}" r="${fm(rad(a))}" stroke-width="${fm(u * 1.5)}"><title>Árbol ${esc(a.id)}${a.clase ? `: riesgo ${a.clase}, ${Math.round(a.vol).toLocaleString('es-HN')} m³ de copa` : ': sin medidas de copa'}</title></circle><text x="${fm(rad(a) + u * 3)}" y="${fm(u * 4)}" font-size="${fm(u * 11)}">${esc(a.id)}</text></g>`).join('')}</g>
    <g class="mr-sitios">${ps.map((s) => { const v = VEREDICTO[s.veredicto]; const r = u * 9; return `<g transform="translate(${X(s.p[0])},${Y(s.p[1])})"><path class="${s.veredicto}" stroke-width="${fm(u * 2)}" d="M0 ${-r}L${r} 0L0 ${r}L${-r} 0Z"><title>${esc(nombreSitio(s))}: ${v ? `${v.texto.toLowerCase()}, a ${s.distanciaM} m del árbol ${esc(s.arbol.id)}` : 'sin árboles para comparar'}</title></path><text x="${fm(r + u * 4)}" y="${fm(u * 4)}" font-size="${fm(u * 12)}" font-weight="700">${esc(nombreSitio(s))}${v ? ` (${v.texto.toLowerCase()})` : ''}</text></g>`; }).join('')}</g>
    <g class="mr-norte" transform="translate(${fm(vx + w - u * 40)},${fm(vy + u * 26)})"><text font-size="${fm(u * 13)}" font-weight="700">N ↑</text></g>
    <text class="mr-escala" x="${fm(vx + u * 10)}" y="${fm(vy + h - u * 8)}" font-size="${fm(u * 11)}">Rejilla cada ${paso} m</text>
  </svg>`;
}

export const leyendaRiesgo = (radios) => `<div class="legend mr-leyenda">
  <span><i class="sw alto"></i>Riesgo alto</span><span><i class="sw medio"></i>Riesgo medio</span><span><i class="sw bajo"></i>Riesgo bajo</span><span><i class="sw sin"></i>Sin medidas</span>
  <span>Rombo: sitio candidato, con el color de su veredicto</span>
  <span>Anillo continuo: radio mínimo (${radios[0]} m) · punteado: radio conservador (${radios[1]} m)</span>
  <span>Tamaño del punto: volumen de copa</span></div>`;
