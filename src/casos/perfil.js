// Perfil de una finca para la memoria de casos (Etapa 1 del plan de ML).
// El perfil son los rasgos acordados, cada uno llevado a una escala comparable (0-1 o categoría):
// cultivo principal, pendiente, tipo de riego, distancia al agua, proporción de especies nativas,
// meses con coincidencias de riesgo y el puntaje de cada módulo.
// Se calcula siempre desde la finca completa, así un caso guardado nunca queda desactualizado
// si cambian las fórmulas o los módulos activos.

import { CONFIG } from '../core/config.js';
import { evaluar } from '../core/engine.js';

export const normNombre = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

// Cultivo con más hectáreas, con el nombre tal como se escribió. Sin cultivos: null (dato faltante).
export function nombreCultivoPrincipal(f) {
  const c = f.cultivos.filter((x) => normNombre(x.nombre)).sort((a, b) => b.ha - a.ha)[0];
  return c ? c.nombre.trim() : null;
}
// Versión normalizada (sin tildes ni mayúsculas) para comparar: "Maíz" y "maiz" son el mismo cultivo.
export function cultivoPrincipal(f) {
  const n = nombreCultivoPrincipal(f);
  return n ? normNombre(n) : null;
}

const PENDIENTE = { plana: 0, ondulada: 0.5, fuerte: 1 };

export function perfil(f, cfg = CONFIG) {
  const R = evaluar(f, cfg);
  const tope = cfg.casos.topeDistAgua;
  // Nativas entre las especies silvestres con origen conocido (los cultivos no cuentan).
  const silvestres = f.especies.filter((e) => e.tipo !== 'Cultivo' && e.origen !== 'desconocido');
  return {
    cultivo: cultivoPrincipal(f),
    cultivoNombre: nombreCultivoPrincipal(f),
    pendiente: PENDIENTE[f.pendiente] ?? null,
    riego: f.riego ?? null,
    distAgua: f.distAgua == null ? null : Math.min(f.distAgua, tope) / tope,
    propNativas: silvestres.length ? silvestres.filter((e) => e.origen === 'nativa').length / silvestres.length : null,
    mesesCoincidencia: R.mh.filter((a) => a.length).length / 12,
    scores: Object.fromEntries(R.mods.filter((m) => m.suficiente).map((m) => [m.id, m.score / 100])), // un módulo sin datos no es riesgo 0
    overall: R.overall,
  };
}
