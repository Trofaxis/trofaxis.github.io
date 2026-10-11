// Relación entre módulos: un gráfico de dispersión por cada par de módulos (A con B, A con C, B con C).
// Con n módulos hay n(n−1)/2 pares; no se cuenta A con B y B con A por separado.
//
// Cada punto es una finca: los casos de la memoria (ejemplo, propios y de la comunidad) y la finca actual.
// Una sola finca no forma una nube: la relación solo se ve con muchas fincas.
// La r de Pearson mide asociación lineal. NO demuestra que el riesgo de un módulo cause el del otro:
// las dos pueden subir por una causa común (manejo intensivo, pendiente, lluvia) o porque comparten datos de entrada
// (CONFIG.relaciones.compartidos). Nada de esto cambia los puntajes de la rúbrica.

import { CONFIG } from '../core/config.js';
import { MODULOS } from '../modules/index.js';
import { perfil } from './perfil.js';

const nombreModulo = (id) => MODULOS.find((m) => m.id === id)?.nombre ?? id;

// Pares únicos de una lista: [a,b,c] → [[a,b],[a,c],[b,c]].
export function pares(ids) {
  const out = [];
  ids.forEach((a, i) => ids.slice(i + 1).forEach((b) => out.push([a, b])));
  return out;
}

// r de Pearson. null si hay menos de 3 puntos o si una de las dos variables no varía (la r no está definida).
export function pearson(xs, ys) {
  const n = xs.length;
  if (n < 3 || ys.length !== n) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

export function fuerza(r, cfg = CONFIG) {
  if (r == null) return null;
  const a = Math.abs(r), c = (cfg.relaciones ?? CONFIG.relaciones).cortes;
  return a >= c.fuerte ? 'fuerte' : a >= c.moderada ? 'moderada' : 'débil o nula';
}

// Puntos de la nube: cada finca con su riesgo (0-100) en los módulos pedidos. Las fincas que no tienen
// alguno de esos módulos (desactivado o finca sin ese propósito) quedan fuera.
export function puntos(casos, finca, ids, cfg = CONFIG) {
  const fila = (id, etiqueta, origen, p) => {
    const v = Object.fromEntries(ids.map((m) => [m, p.scores?.[m] == null ? null : Math.round(p.scores[m] * 100)]));
    return Object.values(v).every((x) => x != null) ? { id, etiqueta, origen, v } : null;
  };
  const lista = casos.map((c) => fila(c.id, c.etiqueta, c.origen, c.perfil ?? perfil(c.finca, cfg)));
  if (finca) lista.push(fila('actual', finca.nombre || 'Tu finca', 'actual', perfil(finca, cfg)));
  return lista.filter(Boolean);
}

// Resumen de cada par: puntos, r, fuerza, avisos. Los avisos dicen por qué la r puede engañar.
export function relaciones(casos, finca, cfg = CONFIG) {
  const R = cfg.relaciones ?? CONFIG.relaciones;
  const activos = new Set(cfg.modulosActivos ?? CONFIG.modulosActivos);
  const ids = R.modulos.filter((id) => activos.has(id));
  const pts = puntos(casos, finca, ids, cfg);
  const soloEjemplo = pts.length > 0 && pts.every((p) => p.origen === 'ejemplo' || p.origen === 'actual');
  // Avisos que valen para todos los gráficos (se muestran una vez) y, por par, los datos que comparten sus módulos.
  const avisos = [];
  if (pts.length < R.minPuntos) avisos.push(`Solo ${pts.length} fincas: con menos de ${R.minPuntos} la r cambia mucho al agregar o quitar una.`);
  if (soloEjemplo) avisos.push('Todos los puntos son fincas de ejemplo (ficticias) o la tuya: las r muestran cómo funciona el método, no lo que pasa en campo.');
  return {
    ids, puntos: pts, soloEjemplo, avisos,
    pares: pares(ids).map(([a, b]) => {
      const r = pearson(pts.map((p) => p.v[a]), pts.map((p) => p.v[b]));
      const comp = R.compartidos?.[`${a}|${b}`] ?? R.compartidos?.[`${b}|${a}`] ?? [];
      const aviso = comp.length ? `Los dos módulos usan ${comp.join(' y ')}: parte de la asociación sale de la fórmula, no de la finca.` : null;
      return { a, b, nombreA: nombreModulo(a), nombreB: nombreModulo(b), n: pts.length, r, fuerza: fuerza(r, cfg), compartidos: comp, aviso };
    }),
  };
}

// Frase que describe la asociación sin hablar de causa.
export function frase(par) {
  if (par.r == null) return `No se puede calcular la relación entre ${par.nombreA.toLowerCase()} y ${par.nombreB.toLowerCase()}: hacen falta al menos 3 fincas y que ambos riesgos varíen.`;
  const sentido = par.r > 0 ? 'las fincas con más riesgo en uno tienden a tener más riesgo en el otro' : 'las fincas con más riesgo en uno tienden a tener menos riesgo en el otro';
  const r = par.r.toFixed(2).replace('.', ',');
  return par.fuerza === 'débil o nula'
    ? `Asociación débil o nula (r = ${r}, ${par.n} fincas): no se ve un patrón claro.`
    : `Asociación ${par.fuerza} ${par.r > 0 ? 'positiva' : 'negativa'} (r = ${r}, ${par.n} fincas): ${sentido}. Es asociación, no prueba que uno cause el otro.`;
}
