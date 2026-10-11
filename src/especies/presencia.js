// Nivel de presencia (baja / media / alta) a partir de una medida de campo, por grupo.
// Los cortes están en CONFIG.presencia y son criterio propio, por validar (issue #13).
import { CONFIG } from '../core/config.js';

// Grupo de umbrales de una especie según su tipo. Los cultivos no tienen umbral de presencia.
const POR_TIPO = { Fauna: 'polinizadores', Árbol: 'arboles', Arbusto: 'arboles', Maleza: 'malezas' };
export const grupoPresencia = (tipo) => POR_TIPO[tipo] || null;

// Nivel para un valor medido; null si no hay grupo o el valor no es un número válido.
export function nivelPresencia(grupo, valor, cfg = CONFIG) {
  const g = cfg.presencia[grupo];
  const v = Number(valor);
  if (!g || valor == null || valor === '' || !Number.isFinite(v) || v < 0) return null;
  const [a, b] = g.cortes;
  return v < a ? 'baja' : v < b ? 'media' : 'alta';
}

// Texto corto con los umbrales del grupo, para mostrar junto al selector.
export function textoUmbrales(grupo, cfg = CONFIG) {
  const g = cfg.presencia[grupo];
  if (!g) return 'Este grupo no tiene umbrales de presencia.';
  const [a, b] = g.cortes;
  return `${g.medida}. Baja: menos de ${a}; media: de ${a} a menos de ${b}; alta: ${b} o más (${g.unidad}). Umbrales de criterio propio, por validar.`;
}
