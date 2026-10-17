// Matriz de vínculos: qué variable de la finca afecta a qué riesgo, por qué mecanismo y con qué evidencia.
// Es la regla «una variable no afecta a otra sin fundamento» escrita como datos: un vínculo existe solo si tiene
// una fila aquí, con su mecanismo y su estado. Las agrupaciones (mismo tema, misma fuente) no son vínculos.
// No inventa nada: estas filas describen lo que las rúbricas de src/modules/ y los avisos de src/plag/ ya hacen.
//
// Cada vínculo: { id, de: [variables], a: variable, sentido, mecanismo, estado, evidencia, contexto, usadoEn, validado, nota }
//   de        → variables que, al coincidir, producen el efecto (una sola si actúa sola).
//   sentido   → '+' sube el riesgo, '−' lo baja, '?' dirección todavía desconocida.
//   estado    → 'con fuente' | 'criterio propio' | 'por validar' (hipótesis), igual que los hechos.
//   evidencia → [{ cita, postura, nota }]; postura: 'a favor', 'en contra' o 'menciona' (la fuente lo señala sin medirlo).
//   usadoEn   → dónde actúa: { modulo, variable, archivo } si entra a una rúbrica, o { aviso, archivo } si solo avisa.
//   validado  → { por, fecha } cuando un especialista lo revise; null mientras tanto.
import { CONFIG } from '../core/config.js';
import { FUENTES as FUENTES_ECO } from '../core/fuentes.js';
import { FUENTES_PLAG } from '../plag/calculo.js';
import { ESTADOS } from './hechos.js';

export const SENTIDOS = { '+': 'sube', '−': 'baja', '?': 'dirección desconocida' };
export const POSTURAS = ['a favor', 'en contra', 'menciona'];

// Grupos para ubicar las variables en el grafo. «manejo» no es un tema de hechos: son decisiones de la finca.
export const GRUPOS = { manejo: 'Manejo de la finca' };

// Diccionario de variables: un id por cada cosa que se mide o se decide en la finca, más los riesgos que reciben el efecto.
// `hechos` son los valores del cerebro que la variable usa (umbrales, cortes); unen la matriz con el resto del grafo.
export const VARIABLES = {
  'clima.mesesLluvia': { nombre: 'Meses de lluvia fuerte', tema: 'clima', hechos: ['clima.lluviaFuerte'] },
  'clima.mesesSecos': { nombre: 'Meses sin lluvia fuerte', tema: 'clima', hechos: ['clima.lluviaFuerte'] },
  'clima.floracion': { nombre: 'Temperatura, humedad y lluvia en la floración de riesgo', tema: 'clima', hechos: [] },
  'fert.meses': { nombre: 'Meses en que se fertiliza', tema: 'manejo', hechos: [] },
  'fert.foliar': { nombre: 'Fertilización foliar', tema: 'manejo', hechos: [] },
  'fert.fertirriego': { nombre: 'Fertirriego', tema: 'manejo', hechos: [] },
  'suelo.desnudoMeses': { nombre: 'Meses con suelo desnudo', tema: 'manejo', hechos: [] },
  'finca.pendiente': { nombre: 'Pendiente del terreno', tema: 'manejo', hechos: [] },
  'finca.distAgua': { nombre: 'Distancia al cuerpo de agua', tema: 'manejo', hechos: [] },
  'riego.sistema': { nombre: 'Eficiencia de aplicación del sistema de riego', tema: 'riego', hechos: ['motor.sistemaRiego'] },
  'riego.escorrentia': { nombre: 'Goteo que aplica más de lo que el suelo infiltra', tema: 'riego', hechos: [] },
  'plag.meses': { nombre: 'Meses con aplicación de plaguicidas', tema: 'plaguicidas', hechos: [] },
  'plag.hq': { nombre: 'Cociente de peligro (HQ) del producto para abejas', tema: 'plaguicidas', hechos: ['plag.umbralHQ', 'plag.sinAguijon'] },
  'plag.amplio': { nombre: 'Productos de amplio espectro', tema: 'plaguicidas', hechos: [] },
  'plag.gus': { nombre: 'Movilidad del plaguicida en el suelo (GUS)', tema: 'plaguicidas', hechos: ['plag.gusAlto'] },
  'plag.alSuelo': { nombre: 'Plaguicida aplicado al suelo o por el riego', tema: 'plaguicidas', hechos: [] },
  'plagas.meses': { nombre: 'Meses con plaga', tema: 'plagas', hechos: [] },
  'poli.floracionVisitada': { nombre: 'Floración visitada por polinizadores', tema: 'polinizadores', hechos: [] },
  'poli.floracionRiesgo': { nombre: 'Floración de la especie de riesgo', tema: 'polinizadores', hechos: [] },
  'poli.abundanciaRiesgo': { nombre: 'Abundancia de la especie de riesgo (volumen de copa)', tema: 'polinizadores', hechos: [] },
  'poli.sinOtrasFlores': { nombre: 'Meses sin otras flores disponibles', tema: 'polinizadores', hechos: [] },
  'riesgo.poli': { nombre: 'Riesgo de Polinizadores', tema: 'motor', hechos: ['motor.rubrica'], efecto: true },
  'riesgo.fert': { nombre: 'Riesgo de Fertilización', tema: 'motor', hechos: ['motor.rubrica'], efecto: true },
  'riesgo.agua': { nombre: 'Riesgo de Agua', tema: 'motor', hechos: ['motor.rubrica'], efecto: true },
  'riesgo.suelo': { nombre: 'Riesgo de Suelo', tema: 'motor', hechos: ['motor.rubrica'], efecto: true },
  'riesgo.troficas': { nombre: 'Riesgo de Cadenas tróficas', tema: 'motor', hechos: ['motor.rubrica'], efecto: true },
  'riesgo.lixiviacion': { nombre: 'Plaguicida que llega al agua subterránea', tema: 'plaguicidas', hechos: [], efecto: true },
};

const K = { cita: FUENTES_ECO.kuniyoshi.cita };
const SPATHODEA = 'Spathodea campanulata en el campus de Zamorano';
const rubrica = (modulo, variable, archivo) => ({ modulo, variable, archivo });

export const VINCULOS = [
  // Fertilización, suelo y agua: la lluvia y la pendiente mueven lo que se aplica.
  { id: 'fert-lluvia', de: ['fert.meses', 'clima.mesesLluvia'], a: 'riesgo.fert', sentido: '+',
    mecanismo: 'La lluvia fuerte arrastra por escorrentía el fertilizante recién aplicado, antes de que el cultivo lo absorba.',
    estado: 'criterio propio', evidencia: [], usadoEn: rubrica('fert', 'lluvia', 'src/modules/fertilizacion.js') },
  { id: 'suelo-desnudo-lluvia', de: ['suelo.desnudoMeses', 'clima.mesesLluvia'], a: 'riesgo.suelo', sentido: '+',
    mecanismo: 'Sin cobertura, la lluvia golpea el suelo y lo erosiona.',
    estado: 'criterio propio', evidencia: [], usadoEn: rubrica('suelo', 'sueloDesnudoLluvia', 'src/modules/suelo.js') },
  { id: 'suelo-fert-desnudo', de: ['fert.meses', 'suelo.desnudoMeses', 'clima.mesesLluvia'], a: 'riesgo.suelo', sentido: '+',
    mecanismo: 'Sin cobertura, la lluvia erosiona el suelo y arrastra el fertilizante recién aplicado.',
    estado: 'criterio propio', evidencia: [], usadoEn: rubrica('suelo', 'fertSueloDesnudo', 'src/modules/suelo.js') },
  { id: 'agua-fertirriego', de: ['fert.fertirriego', 'riego.escorrentia'], a: 'riesgo.agua', sentido: '+',
    mecanismo: 'En fertirriego el fertilizante va disuelto en el agua: si el goteo aplica más de lo que el suelo infiltra, el agua escurre y se lo lleva.',
    estado: 'criterio propio', evidencia: [], usadoEn: rubrica('agua', 'fertirriegoEscorrentia', 'src/modules/agua.js') },
  { id: 'fert-pendiente', de: ['finca.pendiente'], a: 'riesgo.fert', sentido: '+',
    mecanismo: 'Con más pendiente, el agua corre más rápido y arrastra más fertilizante.',
    estado: 'criterio propio', evidencia: [], usadoEn: rubrica('fert', 'pendiente', 'src/modules/fertilizacion.js') },
  { id: 'suelo-pendiente', de: ['finca.pendiente'], a: 'riesgo.suelo', sentido: '+',
    mecanismo: 'Con más pendiente, la escorrentía tiene más fuerza y erosiona más.',
    estado: 'criterio propio', evidencia: [], usadoEn: rubrica('suelo', 'pendiente', 'src/modules/suelo.js') },
  { id: 'fert-distancia', de: ['finca.distAgua'], a: 'riesgo.fert', sentido: '−',
    mecanismo: 'Cuanto más lejos está el cuerpo de agua, menos fertilizante arrastrado llega a él.',
    estado: 'criterio propio', evidencia: [], usadoEn: rubrica('fert', 'distancia', 'src/modules/fertilizacion.js') },
  { id: 'agua-distancia', de: ['finca.distAgua'], a: 'riesgo.agua', sentido: '−',
    mecanismo: 'Cuanto más lejos está el cuerpo de agua, menos agua de la finca, con lo que arrastra, llega a él.',
    estado: 'criterio propio', evidencia: [], usadoEn: rubrica('agua', 'distancia', 'src/modules/agua.js') },
  { id: 'agua-sistema', de: ['riego.sistema'], a: 'riesgo.agua', sentido: '−',
    mecanismo: 'Con más eficiencia de aplicación se pierde menos del agua aplicada: goteo 90 %, aspersión 75 %, superficie 60 %.',
    estado: 'con fuente', evidencia: [{ cita: 'FAO, eficiencia de aplicación (Training Manual 4, Tabla 8)', postura: 'a favor', nota: 'Pasar la eficiencia a 0, 50 y 100 puntos es criterio propio.' }],
    usadoEn: rubrica('agua', 'sistema', 'src/modules/agua.js') },
  { id: 'lixiviacion-gus', de: ['plag.gus', 'plag.alSuelo', 'clima.mesesLluvia'], a: 'riesgo.lixiviacion', sentido: '+',
    mecanismo: 'Un producto móvil aplicado al suelo o por el riego puede bajar con la lluvia o un riego excesivo hasta el agua subterránea.',
    estado: 'criterio propio', evidencia: [{ cita: FUENTES_PLAG.gus.cita, postura: 'a favor', nota: 'Solo el potencial de lixiviación del producto. La suma con la lluvia y el umbral de lámina no están verificados.' }],
    usadoEn: { aviso: 'Producto móvil aplicado al suelo', archivo: 'src/plag/calculo.js' } },

  // Polinizadores: lo que expone a las abejas en la floración (Kuniyoshi y Osorio, PEG Zamorano).
  { id: 'poli-coincidencia', de: ['plag.meses', 'poli.floracionVisitada'], a: 'riesgo.poli', sentido: '+',
    mecanismo: 'Aplicar cuando las abejas visitan las flores las expone al producto.',
    estado: 'criterio propio', evidencia: [{ ...K, postura: 'menciona', nota: 'Señala la exposición a agroquímicos como un factor que no midió.' }],
    contexto: SPATHODEA, usadoEn: rubrica('poli', 'coincidencia', 'src/modules/polinizadores.js') },
  { id: 'poli-hq', de: ['plag.hq', 'poli.floracionVisitada'], a: 'riesgo.poli', sentido: '+',
    mecanismo: 'HQ = dosis ÷ DL50 por contacto: si supera el umbral, la dosis aplicada en floración puede matar abejas por contacto.',
    estado: 'con fuente', evidencia: [
      { cita: FUENTES_PLAG.fao.cita, postura: 'a favor', nota: 'Umbrales de 42 y 85.' },
      { cita: FUENTES_PLAG.ppdb.cita, postura: 'a favor', nota: 'DL50 de cada ingrediente.' },
      { cita: FUENTES_PLAG.arena.cita, postura: 'a favor', nota: 'Margen ×10 para abejas sin aguijón: derivación, no norma.' },
    ], usadoEn: rubrica('poli', 'claseEnFloracion', 'src/modules/polinizadores.js') },
  { id: 'poli-abundancia', de: ['poli.abundanciaRiesgo'], a: 'riesgo.poli', sentido: '+',
    mecanismo: 'Más flores de la especie de riesgo, más abejas muertas bajo ellas.',
    estado: 'con fuente', evidencia: [{ ...K, postura: 'a favor', nota: 'Relación positiva pero débil (R² = 0,21, no significativa).' }],
    contexto: SPATHODEA, nota: 'Un solo estudio y una relación débil: conviene más evidencia. El volumen de copa sale de Osorio (2025), Ec. 3.',
    usadoEn: rubrica('poli', 'abundanciaRiesgo', 'src/modules/polinizadores.js') },
  { id: 'poli-sin-alternativas', de: ['poli.floracionRiesgo', 'poli.sinOtrasFlores'], a: 'riesgo.poli', sentido: '+',
    mecanismo: 'Sin otras flores disponibles, las abejas dependen más de la especie de riesgo.',
    estado: 'por validar', evidencia: [{ ...K, postura: 'menciona', nota: 'Señala la disponibilidad de otras especies en floración como un factor que no midió.' }],
    contexto: SPATHODEA, usadoEn: rubrica('poli', 'alternativas', 'src/modules/polinizadores.js') },
  { id: 'poli-agua-seca', de: ['poli.floracionRiesgo', 'clima.mesesSecos'], a: 'riesgo.poli', sentido: '+',
    mecanismo: 'En época seca las abejas podrían buscar el líquido que se acumula en la corola de la especie de riesgo.',
    estado: 'por validar', evidencia: [{ ...K, postura: 'menciona', nota: 'Menciona la disponibilidad de agua y la acumulación de líquidos en la corola como posibles factores.' }],
    contexto: SPATHODEA, usadoEn: rubrica('poli', 'aguaSeca', 'src/modules/polinizadores.js') },
  { id: 'poli-foliar', de: ['fert.foliar', 'poli.floracionVisitada'], a: 'riesgo.poli', sentido: '+',
    mecanismo: 'Un producto foliar aplicado en floración puede llegar a las flores que visitan las abejas.',
    estado: 'por validar', evidencia: [{ ...K, postura: 'menciona', nota: 'Cita la exposición a agroquímicos sin medirla.' }],
    contexto: SPATHODEA, usadoEn: rubrica('poli', 'foliarEnFloracion', 'src/modules/polinizadores.js') },
  { id: 'poli-clima', de: ['clima.floracion', 'poli.floracionRiesgo'], a: 'riesgo.poli', sentido: '?',
    mecanismo: 'La temperatura, la humedad y la lluvia durante la floración podrían influir en la muerte de abejas; no se sabe en qué dirección.',
    estado: 'por validar', evidencia: [{ ...K, postura: 'menciona', nota: 'Los menciona como factores que no midió.' }],
    contexto: SPATHODEA, nota: 'Solo informa: peso 0 hasta que se mida su efecto.',
    usadoEn: rubrica('poli', 'climaFloracion', 'src/modules/polinizadores.js') },

  // Cadenas tróficas.
  { id: 'troficas-amplio-plaga', de: ['plag.amplio', 'plagas.meses'], a: 'riesgo.troficas', sentido: '+',
    mecanismo: 'Un producto de amplio espectro aplicado cuando hay plaga mata también a los enemigos naturales que la controlan.',
    estado: 'criterio propio', evidencia: [], usadoEn: rubrica('troficas', 'amplioEnPlaga', 'src/modules/troficas.js') },
];

// Peso con el que el vínculo suma al índice: el de su variable en la rúbrica; 0 si solo avisa.
export const pesoDe = (v, cfg = CONFIG) => (v.usadoEn?.modulo ? cfg.rubrica[v.usadoEn.modulo]?.[v.usadoEn.variable]?.peso ?? 0 : 0);

// Errores de un vínculo. Una prueba exige que todos salgan limpios.
export function validarVinculo(v, cfg = CONFIG) {
  const e = [];
  if (!v.id) e.push('falta id');
  if (!Array.isArray(v.de) || !v.de.length) e.push('falta de qué variable sale');
  for (const x of [...(v.de ?? []), v.a]) if (!VARIABLES[x]) e.push(`variable desconocida: ${x}`);
  if (v.de?.includes(v.a)) e.push('una variable no se afecta a sí misma');
  if (!SENTIDOS[v.sentido]) e.push(`sentido desconocido: ${v.sentido}`);
  if (!v.mecanismo?.trim()) e.push('falta el mecanismo');
  if (!ESTADOS.includes(v.estado)) e.push(`estado desconocido: ${v.estado}`);
  for (const ev of v.evidencia ?? []) {
    if (!ev.cita?.trim()) e.push('evidencia sin cita');
    if (!POSTURAS.includes(ev.postura)) e.push(`postura desconocida: ${ev.postura}`);
  }
  const aFavor = (v.evidencia ?? []).some((ev) => ev.postura === 'a favor');
  if (v.estado === 'con fuente' && !aFavor) e.push('dice «con fuente» pero ninguna fuente lo respalda');
  if (v.estado === 'por validar' && aFavor) e.push('tiene una fuente a favor: debería decir «con fuente» o «criterio propio»');
  if (!v.usadoEn?.archivo) e.push('falta dónde se usa');
  if (v.usadoEn?.modulo && !cfg.rubrica[v.usadoEn.modulo]?.[v.usadoEn.variable]) e.push(`la rúbrica no tiene ${v.usadoEn.modulo}.${v.usadoEn.variable}`);
  return e;
}

// Vínculos con fuentes a favor y en contra a la vez: los revisa una persona.
export const enConflicto = (vs = VINCULOS) => vs.filter((v) => {
  const p = new Set((v.evidencia ?? []).map((ev) => ev.postura));
  return p.has('a favor') && p.has('en contra');
});

// Conteos para el panel de administración.
export function resumenVinculos(vs = VINCULOS, cfg = CONFIG) {
  const r = { total: vs.length, 'con fuente': 0, 'criterio propio': 0, 'por validar': 0, sinValidar: 0, conflicto: enConflicto(vs).length, hipotesisQuePuntuan: 0 };
  for (const v of vs) {
    r[v.estado]++;
    if (!v.validado) r.sinValidar++;
    if (v.estado === 'por validar' && pesoDe(v, cfg) > 0) r.hipotesisQuePuntuan++;
  }
  return r;
}
