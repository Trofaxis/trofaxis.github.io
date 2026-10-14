// ApiRadar: diagnóstico del problema "Spathodea campanulata y abejas nativas" a partir de los datos que el usuario ya cargó.
// No es otra rúbrica: lee la del módulo Polinizadores, la ordena como resolución de problemas (qué pasa, por qué, qué hacer,
// cuánto baja el riesgo, qué falta) y recalcula la finca con cada cambio para medir cuánto baja. Cada cifra trae su estado de evidencia.
import { CONFIG } from '../core/config.js';
import { FUENTES } from '../core/fuentes.js';
import { evaluar, nivel, modulosDe } from '../core/engine.js';
import { conPlan } from '../fert/calculo.js';
import { cuentaParaAbejas, puntajePeligro, fmtHQ, abejasSinAguijon } from '../plag/calculo.js';
import { volumenCopa } from '../modules/polinizadores.js';
import { M, mlist, uniq, inter } from '../core/utils.js';
import { sitiosFuera } from '../mapa/geo.js';
import { clasificarArboles, resumenCenso, evaluarSitios, nombreSitio, VEREDICTO } from './censo.js';

export const PROBLEMAS = {
  spathodea: { id: 'spathodea', nombre: 'Spathodea campanulata y las abejas nativas', modulo: 'poli' },
};

// Nombre corto de cada variable de Polinizadores para el radar (la tabla usa el nombre completo).
const CORTO = {
  coincidencia: 'Aplicaciones', claseEnFloracion: 'Peligro producto', especiesRiesgo: 'Meses riesgo', abundanciaRiesgo: 'Abundancia',
  alternativas: 'Sin otras flores', aguaSeca: 'Meses secos', foliarEnFloracion: 'Foliares', abejasNativas: 'Abejas nativas',
};

// Primer mes de la floración de riesgo, contando el cambio de año (sep-ene empieza en septiembre).
const inicio = (meses) => meses.find((m) => !meses.includes((m + 11) % 12)) ?? meses[0];

const polin = (f, cfg, extra) => evaluar(f, cfg, extra).mods.find((m) => m.id === 'poli');

// Cambios que el usuario puede hacer y que el motor sabe medir. Cada uno recibe una copia de la finca y devuelve la finca cambiada.
const CAMBIOS = {
  mover(g, f, cfg, ctx) {
    g.plaguicidas.forEach((p) => { if (cuentaParaAbejas(p, f, cfg)) p.meses = p.meses.filter((m) => !ctx.atraeFlor.includes(m)); });
  },
  alternativa(g, f, cfg, ctx) {
    g.especies.push({ nombre: 'Floración alternativa (propuesta)', tipo: 'Árbol', origen: 'nativa', floracion: [...ctx.sinAlt], atrae: true, riesgo: false });
  },
  foliar(g, f, cfg, ctx) {
    (g.fertPlan ?? []).forEach((a) => { if (a.metodo === 'foliar' && ctx.atraeFlor.includes(a.mes)) a.metodo = 'incorporado'; });
  },
};

// ubic: ubicación guardada en el navegador ({ contorno, arboles: censo, sitios }); no forma parte de la finca ni se exporta.
// ¿Aplica el problema? Es lo único que el panel cerrado necesita: no hace falta evaluar la finca ni armar el diagnóstico.
// Debe coincidir siempre con apiRadar(...).aplica (lo vigila tests/apiradar.test.js).
export function apiRadarAplica(f0, cfg = CONFIG) {
  return modulosDe(f0, cfg).includes('poli') && f0.especies.some((e) => e.riesgo);
}

// excluir: { [idAccion]: true } con las acciones medibles que el usuario sacó de su plan (no se aplican al recalcular).
export function apiRadar(f0, cfg = CONFIG, extra = {}, problema = 'spathodea', ubic = null, excluir = {}) {
  const f = conPlan(f0);
  const base = evaluar(f, cfg, extra);
  const mod = base.mods.find((m) => m.id === 'poli');
  const ctx = base;
  const riesgo = f.especies.filter((e) => e.riesgo);
  if (!mod || !riesgo.length) {
    return { aplica: false, problema: PROBLEMAS[problema], motivo: !mod ? 'El módulo Polinizadores está desactivado en Ajustes.' : 'No hay especies marcadas como riesgo para polinizadores. En Especies, marca Spathodea campanulata (u otra) como riesgo.' };
  }

  // 1. Qué pasa: los datos de la finca que entran al diagnóstico.
  const conMedidas = riesgo.filter((e) => e.copaD > 0 && e.copaH > 0);
  const arboles = riesgo.reduce((s, e) => s + (e.cantidad || 0), 0);
  const vol = conMedidas.reduce((s, e) => s + (e.cantidad || 1) * volumenCopa(e.copaD, e.copaH), 0);
  const seguras = new Set(f.especies.filter((e) => e.atrae && !e.riesgo).flatMap((e) => e.floracion));
  const sinAlt = ctx.riesgoFlor.filter((m) => !seguras.has(m));
  const sinAguijon = abejasSinAguijon(f);
  const enFlor = f.plaguicidas.filter((p) => cuentaParaAbejas(p, f, cfg) && p.meses.some((m) => ctx.atraeFlor.includes(m)))
    .map((p) => ({ p, ...puntajePeligro(p, f, cfg) })).sort((a, b) => b.puntaje - a.puntaje);
  const censoArb = clasificarArboles(ubic?.arboles ?? []);
  const rc = resumenCenso(censoArb);
  const datos = [
    { dato: 'Especies de riesgo', valor: riesgo.map((e) => e.nombre).join(', '), de: 'Cuestionario, Especies' },
    { dato: 'Árboles y copa', valor: arboles ? `${arboles} árbol(es)${conMedidas.length ? `, ${Math.round(vol).toLocaleString('es-HN')} m³ de copa` : ', sin medidas de copa'}` : 'Sin número de árboles', de: 'Cuestionario, Especies' },
    ...(rc.n ? [{ dato: 'Censo de árboles de riesgo', valor: `${rc.n} con coordenadas${rc.conMedidas ? `, ${Math.round(rc.volumen).toLocaleString('es-HN')} m³ de copa (alto ${rc.porClase.alto.n}, medio ${rc.porClase.medio.n}, bajo ${rc.porClase.bajo.n})` : ', ninguno con medidas de copa'}`, de: 'Mapa de la finca (solo en este navegador)' }] : []),
    { dato: 'Floración de riesgo', valor: mlist(ctx.riesgoFlor), de: 'Cuestionario, Especies' },
    { dato: 'Floración que visitan los polinizadores', valor: mlist(ctx.atraeFlor), de: 'Cuestionario, Especies' },
    { dato: 'Aplicaciones de plaguicidas', valor: f.plaguicidas.length ? `${f.plaguicidas.length} aplicación(es); ${enFlor.length} en floración visitada` : 'Ninguna registrada', de: 'Pestaña Plaguicidas' },
    { dato: 'Abejas nativas registradas', valor: f.especies.filter((e) => e.tipo === 'Fauna').map((e) => e.nombre).join(', ') || 'Ninguna', de: 'Cuestionario, Especies' },
    { dato: 'Meses de lluvia fuerte', valor: f.lluviaMeses.length ? mlist(f.lluviaMeses) : 'Sin dato', de: 'Clima por ubicación o a mano' },
  ];

  // 2. Por qué: las variables de Polinizadores, de la que más aporta a la que menos.
  const evidencia = mod.variables.filter((v) => v.aplica !== false).map((v) => ({
    id: v.id, nombre: v.nombre, corto: CORTO[v.id] ?? v.nombre, valor: v.valor, puntaje: v.puntaje, peso: v.peso, aporte: v.puntaje == null ? 0 : v.peso * v.puntaje,
    estado: v.estado, fuente: v.fuente,
  }));
  const pesoConDato = evidencia.filter((v) => v.puntaje != null).reduce((s, v) => s + v.peso, 0);
  evidencia.forEach((v) => { v.puntos = pesoConDato ? Math.round(v.aporte / pesoConDato) : 0; }); // puntos del riesgo que aporta cada variable
  const causas = evidencia.filter((v) => v.puntos > 0).sort((a, b) => b.puntos - a.puntos);

  // 3. Qué hacer: cada cambio se mide recalculando la finca. Se aplican en orden, así «baja» es acumulado y el orden importa:
  // sembrar flores alternativas sin mover antes las aplicaciones sube la coincidencia (más flor visitada en meses con producto).
  const acciones = [];
  let g = structuredClone(f), previo = mod.score;
  const medir = (clave) => {
    if (excluir[clave]) return { de: null, a: null, delta: null, incluida: false };
    CAMBIOS[clave](g, f, cfg, { ...ctx, sinAlt });
    const despues = polin(g, cfg, extra).score;
    const r = { de: previo, a: despues, delta: despues - previo, incluida: true };
    previo = despues;
    return r;
  };
  if (ctx.ov1.length) {
    const lista = enFlor.filter((x) => x.p.meses.some((m) => ctx.atraeFlor.includes(m)));
    acciones.push({
      id: 'mover', titulo: 'Sacar las aplicaciones de la floración visitada', cuando: ctx.ov1.map((m) => M[m]).join(', '),
      detalle: `Evita aplicar ${lista.map((x) => `${x.p.producto || 'producto sin nombre'} (${x.por === 'hq' && x.r?.calculable ? `HQ ${x.r.cota ? 'hasta ' : ''}${fmtHQ(x.r.hqEf)}` : x.por === 'etiqueta' ? 'la etiqueta advierte por abejas' : 'clase elegida'})`).join(', ')} en ${ctx.ov1.map((m) => M[m]).join(', ')}. Antes de elegir el mes nuevo, revisa que no coincida con la cosecha ni deje la plaga sin control. Si no hay otra salida, la guía de Protección Vegetal de Zamorano indica aplicar de noche cuando hay polinizadores.`,
      estado: lista.some((x) => x.por !== 'clase') ? 'verificado' : 'criterio propio', ...medir('mover'),
    });
  }
  if (sinAlt.length) {
    acciones.push({
      id: 'alternativa', titulo: 'Tener otras flores cuando florece la especie de riesgo', cuando: sinAlt.map((m) => M[m]).join(', '),
      detalle: `En ${sinAlt.map((m) => M[m]).join(', ')} no hay otra floración registrada. Sembrar o conservar nativas que florezcan en esos meses y estén lejos de los árboles de riesgo. Confirma en tu zona en qué meses florece la especie que elijas.`,
      estado: 'no verificado', nota: 'Hipótesis: Kuniyoshi (2025) cita la disponibilidad de otras especies en floración como factor no medido, no como causa probada.', ...medir('alternativa'),
    });
  }
  const foliar = (f.fertPlan ?? []).filter((a) => a.metodo === 'foliar' && ctx.atraeFlor.includes(a.mes));
  if (foliar.length) {
    acciones.push({
      id: 'foliar', titulo: 'Pasar los fertilizantes foliares fuera de la floración', cuando: uniq(foliar.map((a) => a.mes)).map((m) => M[m]).join(', '),
      detalle: 'Aplica la fertilización al suelo en esos meses o muévela a un mes sin floración visitada.', estado: 'no verificado',
      nota: 'Hipótesis: la exposición a agroquímicos es un factor no medido por Kuniyoshi (2025).', ...medir('foliar'),
    });
  }
  // Ubicación del refugio: sin coordenadas de cada árbol, la app no puede decir el punto exacto. Da el radio y lo que implica.
  const [rMin, rMax] = cfg.apiradar.radioExclusionM;
  const haCirculo = (r) => (Math.PI * r * r) / 10000;
  const nCoord = rc.n;
  const sitio = sitiosFuera(censoArb.map((a) => [a.lat, a.lon]), ubic?.contorno, [rMin, rMax]);
  // Un sitio candidato sin ningún árbol censado no se puede juzgar (veredicto null): se queda en el mapa pero no entra al diagnóstico.
  const sitios = evaluarSitios(censoArb, ubic?.sitios, [rMin, rMax]).filter((s) => s.veredicto);
  const radio = {
    min: rMin, max: rMax, haMin: Math.round(haCirculo(rMin)), haMax: Math.round(haCirculo(rMax)),
    fuente: FUENTES.barrantes.corta, hayTrigona: sinAguijon.some((e) => /trigona/i.test(e.nombre)),
    finca: f.area > 0 ? f.area : null, porArbol: arboles || null, coordenadas: nCoord, sitio, sitios,
  };
  const ha = (x) => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10).toLocaleString('es-HN');
  const pct = (x) => `${Math.round(x * 100)} %`;
  let detalleRefugio;
  if (sitio) {
    detalleRefugio = `Con las coordenadas de tus ${nCoord} árboles de riesgo y el contorno de tu finca (${ha(sitio.areaHa)} ha): a ${rMin} m o más de todos ellos queda ${pct(sitio.fraccionMin)} de la finca (${ha(sitio.haMin)} ha); a ${rMax} m o más, ${pct(sitio.fraccionMax)} (${ha(sitio.haMax)} ha). `
      + (sitio.fraccionMin > 0
        ? `El punto más alejado está en ${sitio.mejor.punto.join(', ')}, a ${sitio.mejor.distanciaM} m del árbol de riesgo más cercano${sitio.mejor.distanciaM >= rMax ? '' : sitio.mejor.distanciaM >= rMin ? ` (cumple ${rMin} m, no ${rMax} m)` : ''}. Está marcado en verde en el mapa. Cualquier punto a más de ${rMin} m sirve: elige el que tenga floración alternativa cerca.`
        : `Ningún punto de tu finca queda a ${rMin} m de un árbol de riesgo (el más alejado está a ${sitio.mejor.distanciaM} m, en ${sitio.mejor.punto.join(', ')}). Ubicar el refugio no basta: el control de los árboles pesa más.`);
  } else {
    detalleRefugio = `Mantén los refugios y las colonias a ${rMin}-${rMax} m o más de cualquier árbol de riesgo y cerca de la floración alternativa. Cada árbol deja sin uso un círculo de ${radio.haMin} a ${radio.haMax} ha${f.area > 0 ? `; tu finca tiene ${f.area} ha, así que ${f.area <= radio.haMax ? 'es probable que el radio cubra buena parte de ella: si el refugio no cabe fuera, el control del árbol pesa más que la ubicación' : 'hay espacio para ubicar fuera del radio si los árboles no están todos juntos'}` : ''}. `
      + (nCoord ? 'Ya cargaste los árboles: dibuja el contorno de la finca en el mapa para calcular el punto exacto.' : 'Para calcular el punto exacto, carga las coordenadas de los árboles de riesgo y dibuja el contorno de la finca en el mapa.');
  }
  if (sitios.length) {
    const lista = sitios.map((x) => `${nombreSitio(x)}: ${VEREDICTO[x.veredicto].texto.toLowerCase()}, a ${x.distanciaM} m del árbol ${x.arbol.id}`).join('; ');
    const lejos = sitios.filter((x) => x.veredicto === 'lejos');
    detalleRefugio = `Sitios que propusiste: ${lista}. ${lejos.length ? `Sirve${lejos.length > 1 ? 'n' : ''} ${lejos.map(nombreSitio).join(' y ')} (fuera de ${rMax} m); confirma que tenga${lejos.length > 1 ? 'n' : ''} floración alternativa cerca.` : `Ninguno queda fuera de ${rMax} m: prueba otro punto o reduce los árboles de riesgo.`} ${detalleRefugio}`;
  }
  // Dónde actuar: el sitio propuesto que queda más lejos (si alguno sirve) o, si no, el punto más alejado dentro de la finca.
  const lejosOrden = sitios.filter((x) => x.veredicto === 'lejos').sort((a, b) => b.distanciaM - a.distanciaM);
  const donde = lejosOrden.length ? { punto: [lejosOrden[0].lat, lejosOrden[0].lon], distanciaM: lejosOrden[0].distanciaM, nombre: nombreSitio(lejosOrden[0]), cumple: true }
    : sitio && sitio.fraccionMin > 0 ? { punto: sitio.mejor.punto, distanciaM: sitio.mejor.distanciaM, nombre: 'Punto más alejado', cumple: sitio.mejor.distanciaM >= rMin } : null;
  acciones.push({
    id: 'refugio', titulo: 'Poner meliponarios u hoteles de insectos lejos de los árboles de riesgo', cuando: ctx.riesgoFlor.length ? `antes de ${M[inicio(ctx.riesgoFlor)]}` : 'antes de la próxima floración',
    detalle: detalleRefugio,
    estado: radio.hayTrigona ? 'verificado' : 'criterio propio',
    nota: `Radio: ${FUENTES.barrantes.corta} (rango de vuelo de Trigona fulviventris en Guanacaste, Costa Rica; cifra tomada del resumen del artículo). ${radio.hayTrigona ? '' : 'No registraste Trigona fulviventris: el radio es una referencia. '}Para Plebeia melanica no hay una cifra publicada en las fuentes revisadas; se usa el mismo radio como referencia (criterio propio). La app no sabe dónde hay floración alternativa: eso lo decides tú.${nCoord && arboles && nCoord !== arboles ? ` Ojo: registraste ${arboles} árbol(es) en Especies y ${nCoord} con coordenadas.` : ''} Las coordenadas se guardan solo en este navegador.`,
    delta: null, donde,
  });
  const prioritarios = censoArb.filter((a) => a.clase === 'alto').sort((a, b) => b.vol - a.vol).slice(0, 6);
  if (riesgo.length) {
    acciones.push({
      id: 'arbol', titulo: 'Reducir la flor disponible de la especie de riesgo', donde: prioritarios.length ? { arboles: prioritarios.map((a) => ({ id: a.id, punto: [a.lat, a.lon] })) } : null, cuando: ctx.riesgoFlor.length ? `antes de ${M[inicio(ctx.riesgoFlor)]}` : 'antes de la floración',
      detalle: `No sembrar más individuos de ${riesgo[0].nombre}; podar o controlar rebrotes reduce las flores disponibles.${prioritarios.length ? ` Empieza por los árboles ${prioritarios.map((a) => a.id).join(', ')}: son ${prioritarios.length === 1 ? 'el de' : 'los de'} más volumen de copa del censo (${Math.round((prioritarios.reduce((t, a) => t + a.vol, 0) / rc.volumen) * 100)} % del volumen total).` : ''}`,
      estado: 'criterio propio', nota: 'La rúbrica mide la abundancia con el volumen de copa; no mide cuánto baja el riesgo por una poda parcial, por eso no se da una cifra.', delta: null,
    });
  }
  const total = { de: mod.score, a: previo, delta: previo - mod.score };

  // 4. Qué falta para que el diagnóstico sea más firme.
  const faltan = [];
  if (!arboles) faltan.push('Número de árboles de la especie de riesgo.');
  if (arboles && !conMedidas.length) faltan.push('Diámetro y altura de copa de los árboles de riesgo (para el volumen de copa).');
  if (rc.sinMedidas) faltan.push(`${rc.sinMedidas} árbol(es) del censo sin diámetro o altura de copa: no se clasifican por riesgo.`);
  if (!rc.n) faltan.push('Censo de árboles de riesgo con coordenadas (en el mapa de la finca): permite clasificar cada árbol, dibujar el mapa de riesgo y juzgar sitios candidatos.');
  else if (!sitios.length) faltan.push('Sitios candidatos para colonias o refugios (en el mapa de la finca): la app dice si cada uno queda dentro o fuera del radio.');
  if (!ctx.riesgoFlor.length) faltan.push('Meses de floración de la especie de riesgo.');
  if (!f.plaguicidas.length) faltan.push('Aplicaciones de plaguicidas (pestaña Plaguicidas): sin ellas, no se evalúa la coincidencia con la floración.');
  if (!f.especies.some((e) => e.tipo === 'Fauna')) faltan.push('Abejas nativas que observas en la finca.');
  if (!f.lluviaMeses.length) faltan.push('Meses de lluvia fuerte (se llenan solos al ubicar la finca en el mapa).');
  if (!f.especies.some((e) => e.atrae && !e.riesgo)) faltan.push('Otras especies que florecen y visitan las abejas.');

  // 5. Cómo saber si funcionó.
  const comprobar = [
    `Repite el recuento de abejas muertas en flores (método de ${FUENTES.kuniyoshi.corta}) en los meses de floración de riesgo, antes y después de los cambios.`,
    'Si puedes, anota si la abeja muerta tiene aguijón o no (morfotipo), para saber a qué grupo afecta. Es criterio propio por validar.',
    'Vuelve a cargar tus datos tras cada cambio y compara el riesgo de Polinizadores.',
  ];

  return {
    aplica: true, problema: PROBLEMAS[problema], score: mod.score, nivel: nivel(mod.score, cfg), conf: mod.conf, driver: mod.driver,
    datos, evidencia, causas, acciones, total, faltan, comprobar, radio,
    censo: { arboles: censoArb, resumen: rc, sitios, prioritarios, ejemplo: !!ubic?.ejemplo },
    resumen: `Riesgo ${nivel(mod.score, cfg).toLowerCase()} para las abejas (${mod.score} de 100)${causas.length ? `, sobre todo por: ${causas.slice(0, 2).map((c) => c.nombre.toLowerCase()).join(' y ')}` : ''}.`,
    radar: evidencia.filter((v) => v.puntaje != null).map((v) => ({ nombre: v.corto, score: v.puntaje, level: nivel(v.puntaje, cfg) })),
  };
}
