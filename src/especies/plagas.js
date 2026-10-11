// Plagas y enfermedades comunes por cultivo, para sugerirlas en el cuestionario (issue #11).
// ESTADO: tabla NO VALIDADA. Por validar con un entomólogo o fitopatólogo de Zamorano antes de
// usarla para puntuar. Hoy solo ayuda a recordar; el usuario puede agregar cualquier otra plaga.
// Columnas que pide la validación: cultivo · plaga · nombre científico · zona/altitud · meses de
// mayor presión · factores que favorecen la propagación · fuente. Lo que no tiene fuente queda en
// null ("por validar"): no se rellena con supuestos. Plantilla para el especialista:
// docs/validacion-plagas.csv (la genera filasValidacion(); una prueba revisa que esté al día).
import { normalizar } from '../riego/referencias.js';

export const ESTADO_TABLA_PLAGAS = 'no validado';

// Fuentes citables de alguna fila. "Sugerida" = lista inicial sin fuente (PR #4).
const FUENTES = {
  sugerida: null,
  monitoreoAH: 'Monitoreo en Cultivos Hortícolas, AH Protección Vegetal (Zamorano), diap. 7-18, que cita a Agro Alpha (2022)',
};

// [nombre común, nombre científico, tipo, fuente]
const I = 'insecto', E = 'enfermedad', A = 'ácaro', N = 'nematodo', M = 'molusco', V = 'vertebrado';
const TABLA = {
  maiz: [['Gusano cogollero', 'Spodoptera frugiperda', I], ['Gallina ciega', 'Phyllophaga spp.', I], ['Chicharrita', 'Dalbulus maidis', I], ['Gusano elotero', 'Helicoverpa zea', I]],
  frijol: [['Mosca blanca', 'Bemisia tabaci', I], ['Picudo de la vaina', 'Apion godmani', I], ['Babosa', 'Sarasinula plebeia', M], ['Crisomélidos', 'Diabrotica spp.', I]],
  arroz: [['Sogata', 'Tagosodes orizicolus', I], ['Chinche de la espiga', 'Oebalus spp.', I], ['Barrenador del tallo', 'Diatraea spp.', I]],
  banano: [['Picudo negro', 'Cosmopolites sordidus', I], ['Nematodo barrenador', 'Radopholus similis', N], ['Sigatoka negra', 'Pseudocercospora fijiensis', E]],
  platano: [['Picudo negro', 'Cosmopolites sordidus', I], ['Nematodo barrenador', 'Radopholus similis', N], ['Sigatoka negra', 'Pseudocercospora fijiensis', E]],
  sorgo: [['Gusano cogollero', 'Spodoptera frugiperda', I], ['Pulgón amarillo', 'Melanaphis sacchari', I], ['Mosquita del sorgo', 'Stenodiplosis sorghicola', I]],
  cafe: [['Broca del café', 'Hypothenemus hampei', I], ['Roya del café', 'Hemileia vastatrix', E], ['Minador de la hoja', 'Leucoptera coffeella', I]],
  'cana de azucar': [['Barrenador', 'Diatraea spp.', I], ['Salivazo', 'Aeneolamia spp.', I]],
  melon: [['Mosca blanca', 'Bemisia tabaci', I], ['Pulgón', 'Aphis gossypii', I], ['Minador', 'Liriomyza spp.', I]],
  chile: [
    ['Picudo del chile', 'Anthonomus eugenii', I, 'monitoreoAH'], ['Ácaro rojo', 'Tetranychus urticae', A, 'monitoreoAH'],
    ['Trips', 'Frankliniella occidentalis', I, 'monitoreoAH'], ['Mosca blanca', 'Bemisia tabaci', I, 'monitoreoAH'],
    ['Gusano cogollero', 'Spodoptera sp.', I, 'monitoreoAH'], ['Ácaro blanco', 'Polyphagotarsonemus latus', A, 'monitoreoAH'],
    ['Grillo', 'Gryllus sp.', I, 'monitoreoAH'], ['Ratón', 'Mus musculus', V, 'monitoreoAH'],
    ['Moho gris', 'Botrytis cinerea', E, 'monitoreoAH'], ['Mildiu polvoso', 'Erysiphe, Podosphaera, Oidium, Leveillula', E, 'monitoreoAH'],
    ['Cercospora', 'Cercospora capsici', E, 'monitoreoAH'], ['Virus del mosaico del tabaco (TMV)', 'Tobamovirus', E, 'monitoreoAH'],
  ],
};
const NOMBRE_CULTIVO = { maiz: 'Maíz', frijol: 'Frijol', arroz: 'Arroz', banano: 'Banano', platano: 'Plátano', sorgo: 'Sorgo', cafe: 'Café', 'cana de azucar': 'Caña de azúcar', melon: 'Melón', chile: 'Chile' };

const nombre = ([comun, cient]) => `${comun} (${cient})`;

// Plagas sugeridas para un cultivo escrito por el usuario ("Maíz", "maiz amarillo", "Caña"...).
export function plagasDe(cultivo) {
  const c = normalizar(String(cultivo ?? ''));
  const clave = Object.keys(TABLA).find((k) => c === k || c.startsWith(k + ' ') || (k === 'cana de azucar' && c.startsWith('cana')));
  return clave ? TABLA[clave].map(nombre) : [];
}

// Filas completas para la validación, con las columnas pedidas en el issue #11.
export function filasValidacion() {
  return Object.entries(TABLA).flatMap(([k, filas]) => filas.map(([comun, cient, tipo, fuente]) => ({
    cultivo: NOMBRE_CULTIVO[k], plaga: comun, cientifico: cient, tipo,
    zona: null, mesesPresion: null, factores: null, // por validar: sin fuente todavía
    fuente: FUENTES[fuente ?? 'sugerida'], estado: 'por validar',
  })));
}

const COLS = ['cultivo', 'plaga', 'cientifico', 'tipo', 'zona', 'mesesPresion', 'factores', 'fuente', 'estado', 'validado_por', 'comentarios'];
const celda = (v) => { const t = v == null ? '' : String(v); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
// CSV para que el especialista llene las columnas vacías (zona, meses, factores, fuente).
export function csvValidacion() {
  return [COLS.join(','), ...filasValidacion().map((f) => COLS.map((c) => celda(f[c])).join(','))].join('\n') + '\n';
}
