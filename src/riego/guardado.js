// Guardar y cargar los datos de la pestaña Riego en el navegador. Todo lo que vuelve del almacenamiento se
// valida contra la plantilla vacía, igual que la finca: un dato dañado se descarta y nunca rompe la vista.
import { riegoVacio, casoEjemplo, declaradosEjemplo } from './calculo.js';

// Filas de las listas: sus campos y valores por defecto salen de lo que crea la pestaña (riego-add-suelo, riego-add-tramo).
const FILAS = {
  suelo: { nombre: '', area: null, textura: '', da: null, cc: null, pmp: null, pedregosidad: null, infiltracion: null },
  principal: { nombre: '', caudal: null, largo: null, di: null, c: 140 },
};
const FUENTES = ['ejemplo', 'manual', 'archivo'];
const fin = (x) => typeof x === 'number' && Number.isFinite(x);
const txt = (x, n = 300) => (typeof x === 'string' ? x.slice(0, n) : '');
const lista = (a, n, fn) => (Array.isArray(a) ? a.slice(0, n).map(fn).filter(Boolean) : []);

// Ajusta x a la forma de `base`: mismos campos, mismos tipos, mismas longitudes (12 meses, 4 etapas).
function ajustar(x, base, clave) {
  if (Array.isArray(base)) {
    if (!Array.isArray(x)) return structuredClone(base);
    if (FILAS[clave]) return x.slice(0, 60).map((r) => (r && typeof r === 'object' ? ajustar(r, FILAS[clave]) : null)).filter(Boolean);
    return base.map((b, i) => ajustar(x[i], b));
  }
  if (base && typeof base === 'object') {
    const o = x && typeof x === 'object' && !Array.isArray(x) ? x : {};
    return Object.fromEntries(Object.entries(base).map(([k, b]) => [k, ajustar(o[k], b, k)]));
  }
  if (typeof base === 'string') return typeof x === 'string' ? x.slice(0, 200) : base;
  if (typeof base === 'boolean') return x === true;
  if (typeof base === 'number') return fin(x) ? x : base;
  return fin(x) ? x : null; // base null: dato opcional
}

// Lo que el archivo cargado traía calculado y de dónde salió cada dato. Solo se leen los campos que la app usa.
const CLAVES_NUM = ['etc', 'pp', 'tiempoRiego', 'caudalHa', 'sectores', 'caudalSector', 'volumenCiclo'];
function declarados(o) {
  const d = o && typeof o === 'object' ? o : {};
  const r = {};
  CLAVES_NUM.forEach((k) => { if (fin(d[k])) r[k] = d[k]; });
  if (Array.isArray(d.laa)) r.laa = d.laa.slice(0, 20).map((x) => (fin(x) ? x : null));
  if (d.etoEsMaximo === true) r.etoEsMaximo = true;
  r.numerosFijos = lista(d.numerosFijos, 100, (n) => n && typeof n === 'object'
    && { celda: txt(n.celda), formula: txt(n.formula), numero: txt(String(n.numero ?? '')), etiqueta: txt(n.etiqueta), coincide: txt(n.coincide) });
  r.calculosAMano = lista(d.calculosAMano, 100, (c) => (typeof c === 'string' ? txt(c) : null));
  r.noRevisa = lista(d.noRevisa, 10, (c) => (typeof c === 'string' ? txt(c) : null));
  return r;
}
function origen(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return {};
  return Object.fromEntries(Object.entries(o).slice(0, 100).filter(([, v]) => v && typeof v === 'object')
    .map(([k, v]) => [txt(k, 60), { nombre: txt(v.nombre), valor: fin(v.valor) ? v.valor : txt(String(v.valor ?? '')), celda: txt(v.celda), etiqueta: txt(v.etiqueta) }]));
}

// Estado inicial de la pestaña: el caso de ejemplo del Lab de Riego (no cuenta como dato del usuario).
export const riegoInicial = () => ({ datos: casoEjemplo(), fuente: 'ejemplo', archivo: '', origen: {}, declarados: declaradosEjemplo(), faltan: [], omitidas: [] });

// Lo que se guarda: null mientras sea el ejemplo, para no hacerlo pasar por datos del usuario.
export const riegoAGuardar = (R) => (!R || R.fuente === 'ejemplo' ? null : {
  datos: R.datos, fuente: R.fuente, archivo: R.archivo, origen: R.origen, declarados: R.declarados, faltan: R.faltan, omitidas: R.omitidas,
});

// Devuelve el estado de Riego listo para S.riego, o null si no hay nada guardado que usar.
export function normalizarRiego(o) {
  if (!o || typeof o !== 'object' || !FUENTES.includes(o.fuente) || o.fuente === 'ejemplo') return null;
  return {
    datos: ajustar(o.datos, riegoVacio()), fuente: o.fuente, archivo: txt(o.archivo, 200),
    origen: origen(o.origen), declarados: declarados(o.declarados),
    faltan: lista(o.faltan, 60, (s) => (typeof s === 'string' ? txt(s, 100) : null)),
    omitidas: lista(o.omitidas, 60, (h) => h && typeof h === 'object' && { nombre: txt(h.nombre, 100), motivo: txt(h.motivo, 200) }),
  };
}
