// Memoria de casos: k vecinos más cercanos (k-NN), en el navegador y explicable.
// "Tu finca se parece a estas. Esto es lo que hicieron y cómo les fue."
//
// Distancia de cada rasgo, en 0-1:
//   - categoría (cultivo, riego): 0 si es igual, 1 si es distinta
//   - número ya escalado (pendiente, distancia al agua, nativas, meses, puntajes): |a − b|
// Distancia total = Σ peso·distancia / Σ peso, solo con los rasgos que ambas fincas tienen.
// Similitud = 1 − distancia. Cobertura = peso usado / peso total: un dato faltante
// no cuenta como parecido, solo baja la cobertura (igual que la confianza del motor).
// Los pesos están en CONFIG.casos y son criterio propio, por calibrar en la Etapa 3.

import { CONFIG } from '../core/config.js';
import { MODULOS } from '../modules/index.js';
import { perfil } from './perfil.js';

const RIEGO = { gravedad: 'riego por gravedad', aspersion: 'riego por aspersión', goteo: 'riego por goteo', ninguno: 'sin riego' };
const nombreModulo = (id) => MODULOS.find((m) => m.id === id)?.nombre ?? id;

// Lista de rasgos comparados entre dos perfiles, con su peso y su distancia (null si falta en alguno).
export function comparar(a, b, cfg = CONFIG) {
  const w = cfg.casos.pesos;
  const cat = (x, y) => (x == null || y == null ? null : x === y ? 0 : 1);
  const numd = (x, y) => (x == null || y == null ? null : Math.abs(x - y));
  const rasgos = [
    { clave: 'cultivo', etiqueta: `cultivo (${a.cultivoNombre?.toLowerCase() ?? 'sin dato'})`, peso: w.cultivo, d: cat(a.cultivo, b.cultivo) },
    { clave: 'riego', etiqueta: RIEGO[a.riego] ?? 'riego', peso: w.riego, d: cat(a.riego, b.riego) },
    { clave: 'pendiente', etiqueta: 'pendiente', peso: w.pendiente, d: numd(a.pendiente, b.pendiente) },
    { clave: 'distAgua', etiqueta: 'distancia al agua', peso: w.distAgua, d: numd(a.distAgua, b.distAgua) },
    { clave: 'propNativas', etiqueta: 'proporción de especies nativas', peso: w.propNativas, d: numd(a.propNativas, b.propNativas) },
    { clave: 'mesesCoincidencia', etiqueta: 'meses con coincidencias de riesgo', peso: w.mesesCoincidencia, d: numd(a.mesesCoincidencia, b.mesesCoincidencia) },
  ];
  // El peso de los puntajes se reparte entre los módulos activos.
  const ids = Object.keys(a.scores);
  ids.forEach((id) => rasgos.push({
    clave: `score:${id}`, etiqueta: `riesgo de ${nombreModulo(id).toLowerCase()}`, peso: w.scores / Math.max(1, ids.length),
    d: numd(a.scores[id], b.scores?.[id]),
  }));
  return rasgos;
}

export function similitud(a, b, cfg = CONFIG) {
  const rasgos = comparar(a, b, cfg);
  const total = rasgos.reduce((s, r) => s + r.peso, 0);
  const usados = rasgos.filter((r) => r.d != null);
  const peso = usados.reduce((s, r) => s + r.peso, 0);
  const dist = peso ? usados.reduce((s, r) => s + r.peso * r.d, 0) / peso : 1;
  const u = cfg.casos.umbralParecido;
  return {
    sim: 1 - dist,
    cobertura: total ? peso / total : 0,
    // Para explicar el resultado: en qué se parecen y en qué difieren más (ordenado por peso).
    parecidos: usados.filter((r) => r.d <= u).sort((x, y) => y.peso - x.peso).map((r) => r.etiqueta),
    diferencias: usados.filter((r) => r.d > u).sort((x, y) => y.peso * y.d - x.peso * x.d).map((r) => r.etiqueta),
    rasgos,
  };
}

// Devuelve los k casos más parecidos a la finca, del más al menos parecido.
// Los casos con poca cobertura quedan fuera: compararían casi nada.
export function vecinos(finca, casos, cfg = CONFIG, k = cfg.casos.k) {
  const objetivo = perfil(finca, cfg);
  return casos
    .map((c) => {
      const p = c.perfil ?? perfil(c.finca, cfg); // los casos de la nube traen solo el perfil anonimizado
      return { caso: c, perfil: p, ...similitud(objetivo, p, cfg) };
    })
    .filter((v) => v.cobertura >= cfg.casos.coberturaMinima)
    .sort((x, y) => y.sim - x.sim || x.caso.id.localeCompare(y.caso.id))
    .slice(0, k);
}

// Acciones y resultado de un caso: los de la nube los traen sueltos; los demás, dentro de la finca.
export const accionesDe = (c) => c.acciones ?? c.finca.acciones;
export const resultadoDe = (c) => c.resultado ?? c.finca.resultado;

// Cambio logrado por las acciones del caso, en texto corto. Sin dato: lo dice.
export function resumenResultado(r) {
  const par = (a, b, fmt) => (a == null || b == null ? null : `${fmt(a)} → ${fmt(b)}`);
  const nc = par(r?.ncAntes, r?.ncDespues, (x) => x);
  const lam = par(r?.laminaAntes, r?.laminaDespues, (x) => x.toFixed(2));
  const partes = [];
  if (nc) partes.push(`No conformidades GLOBALG.A.P.: ${nc}`);
  if (lam) partes.push(`Lámina aplicada/requerida: ${lam}`);
  return partes.length ? partes : ['Sin resultado registrado todavía'];
}
