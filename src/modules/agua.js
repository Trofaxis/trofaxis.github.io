// Módulo: Agua (riego y cercanía a cuerpos de agua). Conecta con el módulo Riego:
// si el usuario cargó su diseño de riego, sus hallazgos (FAO-56) entran como una variable más.
import { variable, porCortes } from '../core/rubrica.js';
import { resumen } from '../fert/calculo.js';

const SIN_RESPUESTA = 'Sin responder';
const NOMBRE_RIEGO = { goteo: 'Goteo (90 %)', aspersion: 'Aspersión (75 %)', gravedad: 'Gravedad (60 %)', ninguno: 'Sin riego' };

export default {
  id: 'agua',
  nombre: 'Agua',
  ifa: '30 Agua',
  evaluar(f, ctx, { cfg }) {
    const R = cfg.rubrica.agua;
    const prop = f.area > 0 && f.areaProd > 0 ? Math.min(1, f.areaProd / f.area) : null;
    // Hallazgos del módulo Riego: un error de diseño = 100; solo advertencias = 50; todo bien = 0.
    const al = ctx.riego;
    const errores = al ? al.filter((a) => a.nivel === 'error').length : 0;
    const advert = al ? al.filter((a) => a.nivel === 'advertencia').length : 0;
    const diseno = !al?.length || f.riego === 'ninguno' ? null : errores ? 100 : advert ? 50 : 0;
    // Fertirriego: el fertilizante viaja con el agua; si el diseño escurre, el fertilizante también.
    const fertirriego = f.fertPlan?.length ? resumen(f, cfg).fertirriego : false;
    const escurre = al?.some((a) => a.id === 'escorrentia' && a.nivel === 'error');
    const variables = [
      variable('sistema', 'Sistema de riego (eficiencia de aplicación)', R.sistema.peso, cfg.categorias.sistemaRiego[f.riego] ?? null,
        NOMBRE_RIEGO[f.riego] ?? SIN_RESPUESTA, 'criterio propio', 'Eficiencias: FAO, Training Manual 4, Tabla 8 (verificado). El puntaje es criterio propio.'),
      variable('distancia', 'Distancia al cuerpo de agua', R.distancia.peso, porCortes(f.distAgua, R.distancia), f.distAgua == null ? SIN_RESPUESTA : `${f.distAgua} m`),
      variable('proporcionProductiva', 'Área productiva / área total', R.proporcionProductiva.peso, porCortes(prop, R.proporcionProductiva),
        prop == null ? 'Sin dato' : `${Math.round(prop * 100)} %`),
      variable('disenoRiego', 'Diseño de riego validado (pestaña Riego)', R.disenoRiego.peso, diseno,
        diseno == null ? (f.riego === 'ninguno' ? 'No aplica' : 'Sin cargar: usa la pestaña Riego') : `${errores} error(es), ${advert} advertencia(s)`,
        'verificado', 'Reglas del módulo Riego: FAO-56 (Tablas 12 y 22) y CIMMYT 2012.'),
      { ...variable('fertirriegoEscorrentia', 'Fertirriego con un diseño que escurre', R.fertirriegoEscorrentia.peso,
        !al?.length ? null : escurre ? 100 : 0,
        !al?.length ? 'Carga tu diseño en la pestaña Riego' : escurre ? 'Sí: el goteo aplica más de lo que el suelo infiltra' : 'No',
        'criterio propio', 'Mecanismo: en fertirriego el fertilizante va disuelto en el agua; si el agua escurre, se lo lleva. Vínculo Fertilización → Agua.'),
        aplica: fertirriego },
    ];
    const recs = [];
    if (f.riego === 'gravedad') recs.push('Evaluar riego por goteo en los lotes de mayor consumo.');
    if (f.distAgua != null && f.distAgua < 30) recs.push('Mantener una franja de amortiguamiento junto al cuerpo de agua.');
    if (fertirriego && escurre) recs.push('Corregir la escorrentía del goteo antes de fertirrigar: el fertilizante se pierde con el agua.');
    if (errores) recs.push('Corregir los errores del diseño de riego que señala la pestaña Riego.');
    if (f.riego && f.riego !== 'ninguno' && !al?.length) recs.push('Cargar tu diseño de riego en la pestaña Riego para validarlo contra FAO-56.');
    return { variables, recs };
  },
};
