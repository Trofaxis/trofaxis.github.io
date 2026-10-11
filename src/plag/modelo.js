// Modelo de una aplicación de plaguicida. Solo el producto y los meses son obligatorios:
// con más datos la app calcula más (dosis de ingrediente activo, peligro para abejas, avisos);
// con menos, baja la confianza y no inventa. Los .json viejos ({ producto, clase, meses }) se
// cargan igual y dan el mismo puntaje que antes.

export const USOS = [['', 'No sé'], ['insecticida', 'Insecticida'], ['fungicida', 'Fungicida'], ['herbicida', 'Herbicida'],
  ['acaricida', 'Acaricida'], ['nematicida', 'Nematicida'], ['bactericida', 'Bactericida'], ['otro', 'Otro']];
// Espectro sobre otros organismos (lo usa Cadenas tróficas). "Biológico" ya no baja el peligro para abejas
// cuando el ingrediente tiene DL50: el spinosad es de origen biológico y es altamente tóxico.
export const CLASES = [['amplio', 'Amplio espectro'], ['selectivo', 'Selectivo'], ['biologico', 'Biológico']];
// Clase del registro en la etiqueta (clase de Protección Vegetal: Clasificación de plaguicidas).
export const REGISTROS = [['', 'No sé'], ['PQUA', 'PQUA: químico de uso agrícola'], ['PBUA', 'PBUA: bioquímico o microbiano'], ['RCP', 'RCP: regulador de crecimiento']];
// Formulaciones (códigos internacionales de formulación). liquido: la dosis se mide en volumen.
export const FORMULACIONES = [
  ['EC', 'EC: concentrado emulsionable', true], ['SC', 'SC: suspensión concentrada', true], ['SL', 'SL: concentrado soluble', true],
  ['EW', 'EW: emulsión en agua', true], ['ME', 'ME: microemulsión', true], ['OD', 'OD: dispersión en aceite', true],
  ['SE', 'SE: suspoemulsión', true], ['CS', 'CS: suspensión de cápsulas', true], ['OL', 'OL: líquido miscible en aceite', true],
  ['WP', 'WP: polvo mojable', false], ['WG', 'WG: gránulos dispersables', false], ['DF', 'DF: gránulos secos fluidos', false],
  ['SP', 'SP: polvo soluble', false], ['SG', 'SG: gránulos solubles', false], ['DP', 'DP: polvo para espolvoreo', false],
  ['GR', 'GR: gránulos', false],
];
export const esLiquida = (codigo) => FORMULACIONES.find((x) => x[0] === codigo)?.[2] ?? null;
// Unidades de dosis: tanque (barril de 200 L o bomba de 18 L), copas de 25 ml por bomba, o por hectárea.
export const UNIDADES_DOSIS = {
  mlBarril: { nombre: 'ml por barril de 200 L', volumen: true, tanque: 'barril', medida: 'ml' },
  gBarril: { nombre: 'g por barril de 200 L', volumen: false, tanque: 'barril', medida: 'g' },
  mlBomba: { nombre: 'ml por bomba de 18 L', volumen: true, tanque: 'bomba', medida: 'ml' },
  gBomba: { nombre: 'g por bomba de 18 L', volumen: false, tanque: 'bomba', medida: 'g' },
  copas: { nombre: 'copas de 25 ml por bomba de 18 L', volumen: true, tanque: 'bomba', medida: 'copas' },
  Lha: { nombre: 'L de producto por ha', volumen: true, tanque: null, medida: 'L' },
  kgha: { nombre: 'kg de producto por ha', volumen: false, tanque: null, medida: 'kg' },
};
export const METODOS = [['foliar', 'Aspersión al follaje'], ['suelo', 'Al suelo (drench o incorporado)'], ['riego', 'Por el sistema de riego'], ['semilla', 'Tratamiento de semilla']];
export const DIRECCIONES = [['abajo', 'Hacia abajo (cultivos bajos)'], ['arriba', 'Hacia arriba o de lado (frutales, árboles)']];

export const componenteVacio = () => ({ ia: '', nombre: '', conc: null, dl50: null, mayor: false });

export const plagVacio = () => ({
  producto: '', clase: 'amplio', meses: [],
  uso: '', registro: '', sag: null,
  componentes: [], concUnidad: 'g', grupo: '', formulacion: '',
  dosis: null, dosisUnidad: 'mlBarril', volumen: null, metodo: 'foliar', direccion: 'abajo',
  etiquetaAbejas: false, noFloracion: false,
  diasCosecha: null, reingreso: null, aplicMax: null, franja: null, phMin: null, phMax: null,
  enfermedad: null, objetivo: '', monitoreo: false,
  hora: '', viento: null, temp: null, hr: null, lluviaH: null, ph: null,
});
// Borrador del formulario: igual, con una fila de ingrediente lista para llenar.
export const plagBorrador = () => ({ ...plagVacio(), componentes: [componenteVacio()] });

const esMes = (x) => Number.isInteger(x) && x >= 0 && x <= 11;
const meses = (a) => (Array.isArray(a) ? [...new Set(a.filter(esMes))].sort((x, y) => x - y) : []);
const txt = (x, max = 200) => (typeof x === 'string' ? x.slice(0, max) : '');
const opcion = (x, ops, d) => (ops.includes(x) ? x : d);
const num = (x, max = Infinity) => {
  const v = typeof x === 'string' && x.trim() !== '' ? Number(x) : x;
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max ? v : null;
};
const entero = (x, max) => { const v = num(x, max); return v != null && Number.isInteger(v) ? v : null; };
const hora = (x) => (typeof x === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(x) ? x : '');
const ids = (pares) => pares.map((p) => p[0]);

function componente(c) {
  if (!c || typeof c !== 'object') return null;
  const ia = txt(c.ia, 40), nombre = txt(c.nombre, 80).trim();
  if (!ia && !nombre) return null;
  return { ia, nombre, conc: num(c.conc, 1000), dl50: num(c.dl50, 1e6), mayor: c.mayor === true };
}

// Convierte cualquier objeto en una aplicación válida. Lo que no se reconoce se descarta.
export function normalizarPlag(p) {
  if (!p || typeof p !== 'object') return null;
  const v = plagVacio();
  return {
    producto: txt(p.producto), clase: opcion(p.clase, ids(CLASES), 'amplio'), meses: meses(p.meses),
    uso: opcion(p.uso, ids(USOS), ''), registro: opcion(p.registro, ids(REGISTROS), ''), sag: entero(p.sag, 10000),
    componentes: Array.isArray(p.componentes) ? p.componentes.slice(0, 3).map(componente).filter(Boolean) : [],
    concUnidad: opcion(p.concUnidad, ['g', 'pct'], 'g'), grupo: txt(p.grupo, 40), formulacion: opcion(p.formulacion, FORMULACIONES.map((x) => x[0]), ''),
    dosis: num(p.dosis, 1e6), dosisUnidad: opcion(p.dosisUnidad, Object.keys(UNIDADES_DOSIS), v.dosisUnidad),
    volumen: num(p.volumen, 10000), metodo: opcion(p.metodo, ids(METODOS), 'foliar'), direccion: opcion(p.direccion, ids(DIRECCIONES), 'abajo'),
    etiquetaAbejas: p.etiquetaAbejas === true, noFloracion: p.noFloracion === true,
    diasCosecha: num(p.diasCosecha, 1000), reingreso: num(p.reingreso, 10000), aplicMax: entero(p.aplicMax, 100),
    franja: num(p.franja, 10000), phMin: num(p.phMin, 14), phMax: num(p.phMax, 14),
    enfermedad: entero(p.enfermedad, 1000), objetivo: txt(p.objetivo, 120), monitoreo: p.monitoreo === true,
    hora: hora(p.hora), viento: num(p.viento, 300), temp: num(p.temp, 60), hr: num(p.hr, 100), lluviaH: num(p.lluviaH, 1000), ph: num(p.ph, 14),
  };
}
