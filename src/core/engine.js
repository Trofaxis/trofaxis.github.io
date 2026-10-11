// Motor de riesgo: rúbrica aditiva por módulo.
// Cada módulo (src/modules/) describe sus variables con peso, puntaje 0/50/100, valor y fuente.
// Riesgo del módulo = Σ peso·puntaje / Σ peso (con dato). Índice global = promedio ponderado de módulos.

import { CONFIG } from './config.js';
import { uniq, inter } from './utils.js';
import { MODULOS } from '../modules/index.js';
import { puntuar } from './rubrica.js';
import { conPlan, nutrientes } from '../fert/calculo.js';
import { cuentaParaAbejas } from '../plag/calculo.js';

export const nivel = (v, cfg = CONFIG) => (v >= cfg.niveles.alto ? 'Alto' : v >= cfg.niveles.medio ? 'Medio' : 'Bajo');

// Calendarios derivados que comparten varios módulos.
// Módulos que se evalúan: los activos en Ajustes; en una finca sin cultivos con propósito
// declarado, solo los de ese propósito.
export function modulosDe(f, cfg = CONFIG) {
  if (f.tieneCultivos || !f.proposito?.length) return cfg.modulosActivos;
  const del = new Set(cfg.propositos.filter((p) => f.proposito.includes(p.id)).flatMap((p) => p.modulos));
  return cfg.modulosActivos.filter((id) => del.has(id));
}

// extra.riego: alertas del módulo Riego (validar()), si el usuario cargó sus propios datos de riego.
// aplic: meses con aplicaciones que exponen a los polinizadores. Lo biológico no cuenta, salvo que su HQ supere
// el umbral o la etiqueta advierta por abejas (src/plag/calculo.js).
export function contexto(f, extra = {}, cfg = CONFIG) {
  const atraeFlor = uniq(f.especies.filter((e) => e.atrae).flatMap((e) => e.floracion));
  const riesgoFlor = uniq(f.especies.filter((e) => e.riesgo).flatMap((e) => e.floracion));
  const aplic = uniq(f.plaguicidas.filter((p) => cuentaParaAbejas(p, f, cfg)).flatMap((p) => p.meses));
  const amplio = uniq(f.plaguicidas.filter((p) => p.clase === 'amplio').flatMap((p) => p.meses));
  const plagaM = uniq(f.plagas.flatMap((p) => p.meses));
  const nativasFauna = f.especies.some((e) => e.tipo === 'Fauna' && e.origen === 'nativa');
  const cosechaM = uniq(f.cultivos.flatMap((c) => c.cosecha));
  const siembraM = uniq(f.cultivos.flatMap((c) => c.siembra));
  const ov1 = inter(atraeFlor, aplic);
  return { atraeFlor, riesgoFlor, aplic, amplio, plagaM, cosechaM, siembraM, nativasFauna, ov1, riego: extra.riego ?? null };
}

export function evaluar(f0, cfg = CONFIG, extra = {}) {
  const f = conPlan(f0); // con plan de fertilización, el N y sus meses salen del plan
  const ctx = contexto(f, extra, cfg);
  const helpers = { cfg };
  const minConf = cfg.confianzaMinima ?? CONFIG.confianzaMinima;
  const mods = modulosDe(f, cfg)
    .map((id) => MODULOS.find((m) => m.id === id))
    .filter(Boolean)
    .map((mod) => {
      const r = mod.evaluar(f, ctx, helpers);
      const p = puntuar(r.variables);
      return { id: mod.id, nombre: mod.nombre, ifa: mod.ifa, ...r, ...p, level: nivel(p.score, cfg), suficiente: p.conf >= minConf };
    });
  // Índice global: promedio ponderado de los módulos con datos suficientes (pesos renormalizados).
  // Un módulo sin datos no es riesgo cero: no entra al promedio. sinDatos: ninguno alcanza; parcial: faltan algunos.
  const conDatos = mods.filter((m) => m.suficiente);
  const pesoTotal = conDatos.reduce((s, m) => s + (cfg.pesos?.[m.id] ?? 0), 0);
  const overall = pesoTotal ? Math.round(conDatos.reduce((s, m) => s + m.score * (cfg.pesos[m.id] ?? 0), 0) / pesoTotal) : 0;
  const conf = mods.length ? mods.reduce((s, m) => s + m.conf, 0) / mods.length : 0;

  // Coincidencias de riesgo por mes (para el gráfico de presión).
  const mh = Array.from({ length: 12 }, () => []);
  inter(ctx.atraeFlor, ctx.aplic).forEach((m) => mh[m].push('Aplicación durante floración visitada'));
  inter(f.fertMeses, f.lluviaMeses).forEach((m) => mh[m].push('Fertilización con lluvia fuerte'));
  inter(f.sueloDesnudoMeses, f.lluviaMeses).forEach((m) => mh[m].push('Suelo desnudo con lluvia'));
  inter(ctx.amplio, ctx.plagaM).forEach((m) => mh[m].push('Amplio espectro con plaga presente'));
  inter(ctx.aplic, ctx.cosechaM).forEach((m) => mh[m].push('Aplicación en mes de cosecha'));

  return { mods, overall, sinDatos: !conDatos.length, parcial: conDatos.length > 0 && conDatos.length < mods.length, conf, mh, ...ctx };
}

// Simulador: aplica cambios hipotéticos a una copia de la finca y recalcula. No toca los datos reales.
export function simular(f, sim, cfg = CONFIG, extra = {}) {
  const g = structuredClone(f);
  const base = contexto(f, {}, cfg);
  if (sim.n && g.nObjetivo > 0) {
    // Con plan: reduce en la misma proporción las aplicaciones que llevan N.
    const nPlan = g.fertPlan?.reduce((s, a) => s + nutrientes(a).n, 0) ?? 0;
    if (nPlan > g.nObjetivo) g.fertPlan.forEach((a) => { if (a.n > 0) a.dosis *= g.nObjetivo / nPlan; });
    g.nAplicado = Math.min(g.nAplicado, g.nObjetivo);
  }
  if (sim.pol) g.plaguicidas.forEach((p) => { if (cuentaParaAbejas(p, f, cfg)) p.meses = p.meses.filter((m) => !base.atraeFlor.includes(m)); });
  if (sim.riego && (g.riego === 'gravedad' || g.riego === 'aspersion')) g.riego = 'goteo';
  if (sim.suelo) { g.sueloDesnudoMeses = []; if (g.labranza === 'convencional') g.labranza = 'minima'; }
  if (sim.selec) g.plaguicidas.forEach((p) => { if (p.clase === 'amplio') p.clase = 'selectivo'; });
  return evaluar(g, cfg, extra);
}
