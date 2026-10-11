// Módulo: Suelo (labranza, pendiente y suelo desnudo en lluvias).
import { inter } from '../core/utils.js';
import { variable, porCortes } from '../core/rubrica.js';
import { resumen } from '../fert/calculo.js';

export default {
  id: 'suelo',
  nombre: 'Suelo',
  ifa: '28 Suelo',
  evaluar(f, ctx, { cfg }) {
    const R = cfg.rubrica.suelo, K = cfg.categorias;
    const ovs = inter(f.sueloDesnudoMeses, f.lluviaMeses).length;
    const plan = f.fertPlan?.length ? resumen(f, cfg) : null;
    const variables = [
      variable('sueloDesnudoLluvia', 'Suelo desnudo en meses de lluvia', R.sueloDesnudoLluvia.peso,
        f.lluviaMeses.length ? porCortes(ovs, R.sueloDesnudoLluvia) : null, f.lluviaMeses.length ? `${ovs} mes(es)` : 'Sin meses de lluvia'),
      variable('labranza', 'Tipo de labranza', R.labranza.peso, K.labranza[f.labranza] ?? null, f.labranza ?? 'Sin responder'),
      variable('pendiente', 'Pendiente', R.pendiente.peso, K.pendiente[f.pendiente] ?? null, f.pendiente ?? 'Sin responder'),
      { ...variable('fertSueloDesnudo', 'Fertilizante sobre suelo desnudo en lluvias', R.fertSueloDesnudo.peso,
        plan && f.lluviaMeses.length ? porCortes(plan.fracSueloDesnudo, R.fertSueloDesnudo) : null,
        !plan ? '' : !f.lluviaMeses.length ? 'Sin meses de lluvia' : `${Math.round(plan.fracSueloDesnudo * 100)} % del N y P₂O₅`,
        'criterio propio', 'Mecanismo: sin cobertura, la lluvia erosiona el suelo y arrastra el fertilizante recién aplicado. Vínculo Fertilización → Suelo y Agua.'),
        aplica: !!plan },
    ];
    const recs = [];
    if (ovs) recs.push('Cubrir el suelo en los meses de lluvia en que queda desnudo.');
    if (plan?.fracSueloDesnudo > 0) recs.push('No fertilizar sobre suelo desnudo en meses de lluvia: cubrir antes o mover la aplicación.');
    if (f.labranza === 'convencional') recs.push('Evaluar labranza mínima en lotes con pendiente.');
    return { variables, recs };
  },
};
