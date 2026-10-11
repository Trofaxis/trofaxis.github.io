// Módulo: Fertilización. Con plan detallado (pestaña Fertilización) evalúa N, P, fraccionamiento,
// método y lluvia por kg de N; sin plan, usa el N total y los meses del cuestionario.
import { inter } from '../core/utils.js';
import { variable, porCortes } from '../core/rubrica.js';
import { resumen } from '../fert/calculo.js';

const pct = (x) => `${Math.round(x * 100)} %`;

export default {
  id: 'fert',
  nombre: 'Fertilización',
  ifa: '29 Fertilizantes',
  evaluar(f, ctx, { cfg }) {
    const R = cfg.rubrica.fert;
    const plan = f.fertPlan?.length ? resumen(f, cfg) : null;
    const ratio = f.nObjetivo > 0 ? f.nAplicado / f.nObjetivo : null;
    const ovr = inter(f.fertMeses, f.lluviaMeses).length;
    const fracLluvia = plan ? plan.fracLluviaN : f.fertMeses.length && f.lluviaMeses.length ? ovr / f.fertMeses.length : null;
    const sinPlan = 'Detalla tu plan en la pestaña Fertilización';
    const variables = [
      variable('dosis', 'Dosis de N frente al objetivo', R.dosis.peso, porCortes(ratio, R.dosis),
        ratio == null ? (f.nAplicado > 0 ? 'Sin objetivo definido' : 'Sin dato') : `${f.nAplicado} de ${f.nObjetivo} kg N/ha (${pct(ratio)})`),
      variable('lluvia', plan ? 'N aplicado en meses de lluvia fuerte' : 'Fertilización en meses de lluvia fuerte', R.lluvia.peso, porCortes(fracLluvia, R.lluvia),
        fracLluvia == null ? 'Sin dato' : plan ? `${pct(fracLluvia)} del N` : `${ovr} de ${f.fertMeses.length} mes(es)`),
      variable('fraccionamiento', 'N concentrado en un solo mes', R.fraccionamiento.peso, plan ? porCortes(plan.fracMaxN, R.fraccionamiento) : null,
        plan ? `${pct(plan.fracMaxN)} del N; ${plan.partesN} mes(es) con N` : sinPlan),
      variable('metodo', 'Urea al voleo sin incorporar', R.metodo.peso, plan ? porCortes(plan.fracUreaVoleo, R.metodo) : null,
        plan ? `${pct(plan.fracUreaVoleo)} del N` : sinPlan),
      variable('fosforo', 'Dosis de P₂O₅ frente al objetivo', R.fosforo.peso, plan ? porCortes(plan.ratio.p, R.fosforo) : null,
        !plan ? sinPlan : plan.ratio.p == null ? 'Sin objetivo de P₂O₅' : `${Math.round(plan.tot.p)} de ${f.pObjetivo} kg/ha (${pct(plan.ratio.p)})`),
      variable('pendiente', 'Pendiente (arrastre por escorrentía)', R.pendiente.peso, cfg.categorias.pendiente[f.pendiente] ?? null, f.pendiente ?? 'Sin responder'),
      variable('distancia', 'Distancia al cuerpo de agua', R.distancia.peso, porCortes(f.distAgua, R.distancia), f.distAgua == null ? 'Sin responder' : `${f.distAgua} m`),
    ];
    const recs = [];
    if (ratio > 1) recs.push(`La dosis supera el objetivo de la finca en ${Math.round((ratio - 1) * 100)} %. Ajustar hacia ${f.nObjetivo} kg N/ha.`);
    if (fracLluvia > 0) recs.push('Evitar fertilizar en meses de lluvia fuerte para reducir la escorrentía.');
    if (plan?.fracMaxN > R.fraccionamiento.cortes[0]) recs.push('Fraccionar el nitrógeno en más aplicaciones, según la demanda del cultivo.');
    if (plan?.fracUreaVoleo > 0) recs.push('Incorporar la urea o aplicarla antes de un riego ligero para reducir la pérdida por volatilización.');
    if (f.nAplicado > 0 && !f.nObjetivo) recs.push('Definir un objetivo de nitrógeno con tu agrónomo para poder comparar la dosis.');
    if (!plan && f.nAplicado > 0) recs.push('Detallar productos, dosis y meses en la pestaña Fertilización para un análisis completo.');
    return { variables, recs };
  },
};
