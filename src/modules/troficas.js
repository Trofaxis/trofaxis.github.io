// Módulo: Cadenas tróficas (plaguicidas de amplio espectro y enemigos naturales).
import { M, inter } from '../core/utils.js';
import { variable, porCortes } from '../core/rubrica.js';

// Limitación de la regla de cosecha, para que se vea junto a la variable (docs/formulas.md, Cadenas tróficas).
const LIMITE_COSECHA = 'Criterio propio. La finca guarda meses, no días: un mes de cosecha con aplicación cuenta salvo que todos sus productos tengan intervalo de seguridad de 0 días (etiqueta o cuadro SAG). Con 1 día o más no se sabe si la aplicación fue antes o después de la cosecha, y un intervalo largo también afecta al mes siguiente, que no se revisa. Verifica el intervalo de la etiqueta.';

export default {
  id: 'troficas',
  nombre: 'Cadenas tróficas',
  ifa: '22 Biodiversidad · 31 MIP',
  evaluar(f, ctx, { cfg }) {
    const R = cfg.rubrica.troficas;
    const { amplio, plagaM, aplicCosecha, cosechaSinEspera } = ctx;
    const tot = f.plaguicidas.length;
    const fracAmplio = tot ? f.plaguicidas.filter((p) => p.clase === 'amplio').length / tot : null;
    const fracPlaga = !tot ? null : amplio.length ? inter(amplio, plagaM).length / amplio.length : 0;
    const silv = f.especies.filter((e) => e.tipo !== 'Cultivo' && e.origen !== 'desconocido');
    const nat = silv.length ? silv.filter((e) => e.origen === 'nativa').length / silv.length : null;
    const pre = aplicCosecha;
    const meses = (l) => l.map((m) => M[m]).join(', ');
    const valorCosecha = pre.length ? `${meses(pre)} (se compara por mes, no por día)`
      : cosechaSinEspera.length ? `Ninguna (${meses(cosechaSinEspera)}: intervalo de 0 días)` : 'Ninguna';
    const variables = [
      variable('amplioEspectro', 'Productos de amplio espectro', R.amplioEspectro.peso, porCortes(fracAmplio, R.amplioEspectro),
        fracAmplio == null ? 'Sin plaguicidas registrados' : `${Math.round(fracAmplio * 100)} % de los productos`),
      variable('amplioEnPlaga', 'Amplio espectro en meses de plaga', R.amplioEnPlaga.peso, porCortes(fracPlaga, R.amplioEnPlaga),
        fracPlaga == null ? 'Sin dato' : `${Math.round(fracPlaga * 100)} % de sus meses`),
      variable('nativas', 'Proporción de especies nativas', R.nativas.peso, porCortes(nat, R.nativas),
        nat == null ? 'Sin especies silvestres registradas' : `${Math.round(nat * 100)} %`),
      variable('aplicacionCosecha', 'Aplicaciones en meses de cosecha', R.aplicacionCosecha.peso,
        tot && f.cultivos.length ? porCortes(pre.length, R.aplicacionCosecha) : null,
        tot && f.cultivos.length ? valorCosecha : 'Sin dato', 'criterio propio', LIMITE_COSECHA),
    ];
    const recs = [];
    if (fracAmplio > 0 && fracPlaga > 0) recs.push('Preferir productos selectivos o biológicos en los meses de plaga para proteger a los enemigos naturales.');
    if (nat != null && nat < 0.5) recs.push('Aumentar la proporción de especies nativas en cercas y bordes.');
    if (pre.length) recs.push(`Hay aplicaciones en meses de cosecha (${meses(pre)}). Verificar el intervalo de seguridad de cada producto: la app compara meses, no días.`);
    return { variables, recs };
  },
};
