// Evidencia de una rúbrica: qué parte del peso de un módulo tiene fuente, qué parte es criterio propio y qué parte
// es hipótesis. No cambia ningún puntaje: solo suma el `peso` de cada variable según su `estado` (src/core/rubrica.js).
// Sirve para que la persona vea, junto al número, cuánto de ese número está respaldado por un documento.

// Grupos que se muestran, en este orden. «Con fuente» junta verificado y fuente secundaria.
export const GRUPOS_EVIDENCIA = [
  { id: 'fuente', nombre: 'Con fuente', estados: ['verificado', 'secundario'] },
  { id: 'criterio', nombre: 'Criterio propio', estados: ['criterio propio'] },
  { id: 'hipotesis', nombre: 'Hipótesis', estados: ['no verificado'] },
];

// variables: las de un módulo (o de varios). Solo cuentan las que aplican a la finca (aplica !== false).
// Devuelve { total, partes: [{ id, nombre, peso, pct }] } con pct de 0 a 100 redondeado; los pct suman 100.
export function evidencia(variables) {
  const vars = (variables ?? []).filter((v) => v.aplica !== false);
  const total = vars.reduce((s, v) => s + (v.peso || 0), 0);
  const partes = GRUPOS_EVIDENCIA.map((g) => {
    const peso = vars.filter((v) => g.estados.includes(v.estado)).reduce((s, v) => s + (v.peso || 0), 0);
    return { id: g.id, nombre: g.nombre, peso };
  });
  const sinGrupo = vars.filter((v) => !GRUPOS_EVIDENCIA.some((g) => g.estados.includes(v.estado)));
  if (sinGrupo.length) throw new Error(`Estado de evidencia desconocido: ${sinGrupo.map((v) => v.estado).join(', ')}`);
  // Porcentajes enteros que suman 100 (método del mayor resto), para que la barra no quede corta ni pase de 100.
  const crudos = partes.map((p) => (total ? (p.peso / total) * 100 : 0));
  const pcts = crudos.map(Math.floor);
  let falta = total ? 100 - pcts.reduce((s, x) => s + x, 0) : 0;
  [...crudos.keys()].sort((a, b) => (crudos[b] - pcts[b]) - (crudos[a] - pcts[a])).forEach((i) => { if (falta > 0) { pcts[i]++; falta--; } });
  return { total, partes: partes.map((p, i) => ({ ...p, pct: pcts[i] })) };
}

// Evidencia de todos los módulos juntos, ponderando cada módulo por su peso en el índice global.
// mods: R.mods del motor; pesos: cfg.pesos. Un módulo sin peso en el índice no cuenta.
export function evidenciaGlobal(mods, pesos) {
  const acum = Object.fromEntries(GRUPOS_EVIDENCIA.map((g) => [g.id, 0]));
  let total = 0;
  for (const m of mods ?? []) {
    const w = pesos?.[m.id] ?? 0;
    const e = evidencia(m.variables);
    if (!w || !e.total) continue;
    for (const p of e.partes) acum[p.id] += w * (p.peso / e.total);
    total += w;
  }
  return evidencia(GRUPOS_EVIDENCIA.map((g) => ({ peso: total ? acum[g.id] / total * 100 : 0, estado: g.estados[0] })));
}
