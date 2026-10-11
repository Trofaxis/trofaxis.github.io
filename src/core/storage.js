// Guardar y cargar fincas: archivo JSON (exportar/importar) y autoguardado en el navegador.
// Todo lo que entra desde un archivo se valida campo por campo contra la finca vacía,
// así un archivo viejo, incompleto o editado a mano nunca rompe la app.

import { emptyFarm, TPL, tiposPlantilla } from './state.js';
import { CONFIG } from './config.js';
import { MODULOS } from '../modules/index.js';
import { normalizarPlag } from '../plag/modelo.js';
import { normalizarClima } from '../clima/normales.js';
import { marcarGuardado } from './aviso-guardado.js';
import { riegoAGuardar, normalizarRiego } from '../riego/guardado.js';

export const FORMATO = 'biogap-finca';
export const VERSION = 1;
const CLAVE_LOCAL = 'biogap:v1';

const esMes = (x) => Number.isInteger(x) && x >= 0 && x <= 11;
const meses = (a) => (Array.isArray(a) ? [...new Set(a.filter(esMes))].sort((x, y) => x - y) : []);
const numONulo = (x, max = Infinity) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= max ? x : null);
const num = (x, d = 0) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : d);
const txt = (x, d = '') => (typeof x === 'string' ? x.slice(0, 200) : d);
const opcion = (x, ops, d) => (ops.includes(x) ? x : d);
const bool = (x) => x === true;
// Nivel de presencia observado (opcional). Los umbrales de cada nivel están por definir.
export const PRESENCIA = ['baja', 'media', 'alta'];
const lista = (a, fn) => (Array.isArray(a) ? a.slice(0, 500).map(fn).filter(Boolean) : []);

// Convierte cualquier objeto en una finca válida. Lo que no se reconoce se descarta.
export function normalizarFinca(o) {
  const v = emptyFarm();
  if (!o || typeof o !== 'object') return v;
  return {
    nombre: txt(o.nombre), depto: txt(o.depto),
    area: num(o.area), areaProd: num(o.areaProd), altitud: num(o.altitud),
    pendiente: opcion(o.pendiente, ['plana', 'ondulada', 'fuerte'], v.pendiente),
    fuenteAgua: txt(o.fuenteAgua), distAgua: numONulo(o.distAgua, 1e6),
    tieneCultivos: bool(o.tieneCultivos),
    cultivos: lista(o.cultivos, (c) => c && { nombre: txt(c.nombre), ha: num(c.ha), siembra: meses(c.siembra), cosecha: meses(c.cosecha) }),
    especies: lista(o.especies, (e) => e && {
      nombre: txt(e.nombre),
      tipo: opcion(e.tipo, ['Árbol', 'Arbusto', 'Maleza', 'Cultivo', 'Fauna'], 'Árbol'),
      origen: opcion(e.origen, ['nativa', 'exótica', 'desconocido'], 'desconocido'),
      floracion: meses(e.floracion), atrae: bool(e.atrae), riesgo: bool(e.riesgo),
      ...(PRESENCIA.includes(e.presencia) ? { presencia: e.presencia } : {}),
      // Opcionales: número de individuos y medidas de copa en m (para el volumen de copa, Osorio 2025).
      ...Object.fromEntries([['cantidad', numONulo(e.cantidad, 1e6)], ['copaD', numONulo(e.copaD, 100)], ['copaH', numONulo(e.copaH, 100)]].filter(([, v]) => v != null)),
    }),
    riego: opcion(o.riego, ['gravedad', 'aspersion', 'goteo', 'ninguno'], v.riego),
    nAplicado: num(o.nAplicado), nObjetivo: num(o.nObjetivo), pObjetivo: num(o.pObjetivo), kObjetivo: num(o.kObjetivo),
    fertPlan: lista(o.fertPlan, (a) => a && esMes(a.mes) && num(a.dosis) > 0 && {
      mes: a.mes, producto: txt(a.producto, 'otro').slice(0, 40), dosis: Math.min(num(a.dosis), 5000),
      n: Math.min(num(a.n), 100), p: Math.min(num(a.p), 100), k: Math.min(num(a.k), 100),
      metodo: opcion(a.metodo, ['incorporado', 'voleo', 'fertirriego', 'foliar'], 'voleo'),
    }).slice(0, 60),
    fertMeses: meses(o.fertMeses), lluviaMeses: meses(o.lluviaMeses),
    // Aplicaciones de plaguicidas (pestaña Plaguicidas). Un archivo viejo con { producto, clase, meses } se carga igual.
    plaguicidas: lista(o.plaguicidas, normalizarPlag).slice(0, 200),
    sueloDesnudoMeses: meses(o.sueloDesnudoMeses),
    labranza: opcion(o.labranza, ['convencional', 'minima', 'cero'], v.labranza),
    plagas: lista(o.plagas, (p) => p && { nombre: txt(p.nombre), meses: meses(p.meses), severidad: opcion(p.severidad, ['baja', 'media', 'alta'], 'media'),
      ...(txt(p.cultivo) ? { cultivo: txt(p.cultivo) } : {}), ...(PRESENCIA.includes(p.presencia) ? { presencia: p.presencia } : {}) }),
    cultivosAledanos: lista(o.cultivosAledanos, (c) => c && txt(c.nombre).trim() && { nombre: txt(c.nombre).trim(), distancia: numONulo(c.distancia, 1e5) }).slice(0, 30),
    proposito: Array.isArray(o.proposito) ? CONFIG.propositos.map((p) => p.id).filter((id) => o.proposito.includes(id)) : [],
    gg: opcion(o.gg, ['si', 'quiero', 'no'], v.gg),
    minorAplicables: num(o.minorAplicables, v.minorAplicables), minorFallas: num(o.minorFallas),
    nc: lista(o.nc, (n) => n && { criterio: txt(n.criterio), dias: num(n.dias) }),
    acciones: lista(o.acciones, (a) => typeof a === 'string' && a.trim() ? txt(a.trim()) : null).slice(0, 30),
    resultado: normalizarResultado(o.resultado),
    clima: normalizarClima(o.clima),
  };
}

// Resultado del caso. Un valor faltante o inválido queda en null (sin dato), nunca en 0.
export function normalizarResultado(r) {
  const o = r && typeof r === 'object' ? r : {};
  return {
    ncAntes: numONulo(o.ncAntes, 10000), ncDespues: numONulo(o.ncDespues, 10000),
    laminaAntes: numONulo(o.laminaAntes, 10), laminaDespues: numONulo(o.laminaDespues, 10),
  };
}

// Casos que el usuario guardó en este navegador (la memoria local de la Etapa 1;
// la Etapa 2 suma la nube, ver src/nube/ y src/casos/anonimo.js; esta memoria local sigue igual).
const CLAVE_CASOS = 'biogap:casos:v1';
export function normalizarCaso(c) {
  if (!c || typeof c !== 'object' || typeof c.id !== 'string') return null;
  return {
    id: c.id.slice(0, 80), origen: opcion(c.origen, ['ejemplo', 'propio'], 'propio'),
    etiqueta: txt(c.etiqueta) || 'Caso sin nombre', guardado: txt(c.guardado), finca: normalizarFinca(c.finca),
  };
}
export function cargarCasos() {
  try { const o = JSON.parse(localStorage.getItem(CLAVE_CASOS) || '[]'); return Array.isArray(o) ? o.slice(0, 500).map(normalizarCaso).filter(Boolean) : []; } catch { return []; }
}
export function guardarCasos(casos) {
  try { localStorage.setItem(CLAVE_CASOS, JSON.stringify(casos)); return marcarGuardado(true); } catch { return marcarGuardado(false); }
}

// Solo la parte personalizable de la configuración viaja con la finca.
export function configBase() {
  return { modulosActivos: [...CONFIG.modulosActivos], niveles: { ...CONFIG.niveles } };
}

export function normalizarAjustes(o) {
  const base = configBase();
  if (!o || typeof o !== 'object') return base;
  const ids = MODULOS.map((m) => m.id);
  const activos = Array.isArray(o.modulosActivos) ? ids.filter((id) => o.modulosActivos.includes(id)) : base.modulosActivos;
  const alto = num(o.niveles?.alto, base.niveles.alto);
  const medio = num(o.niveles?.medio, base.niveles.medio);
  const valido = medio < alto && alto <= 100;
  return { modulosActivos: activos, niveles: valido ? { alto, medio } : base.niveles };
}

// Configuración completa que usa el motor: la base fija más los ajustes del usuario.
export const configEfectiva = (ajustes) => ({ ...CONFIG, ...ajustes });

// Registros de plantillas: solo filas con fecha, lote y valor numérico.
export function normalizarTpl(o, base) {
  if (!o || typeof o !== 'object') return base;
  // Respaldos antiguos con fertilización o riego: esos registros ya no viven en Plantillas.
  if (TPL[o.tipo]?.pestana) return base;
  const rows = Array.isArray(o.rows) ? o.rows.slice(0, 5000).filter((r) => r && typeof r.valor === 'number' && Number.isFinite(r.valor))
    .map((r) => ({ fecha: txt(r.fecha), lote: txt(r.lote), valor: r.valor })) : base.rows;
  return { tipo: opcion(o.tipo, tiposPlantilla(), base.tipo), objetivo: num(o.objetivo, base.objetivo), rows, paste: '' };
}
// Recomendaciones marcadas como hechas: { clave: true }.
const normalizarHechas = (o) => (o && typeof o === 'object' && !Array.isArray(o)
  ? Object.fromEntries(Object.entries(o).filter(([k, v]) => typeof k === 'string' && k.length < 400 && v === true).slice(0, 500)) : {});
const TEMAS = ['system', 'light', 'dark'];

export function exportarTexto(farm, ajustes, tpl) {
  return JSON.stringify({ formato: FORMATO, version: VERSION, guardado: new Date().toISOString(), finca: farm, ajustes, ...(tpl ? { plantillas: { ...tpl, paste: '' } } : {}) }, null, 2);
}

// Devuelve { farm, ajustes } o lanza un Error con un mensaje para el usuario.
export function importarTexto(texto) {
  let o;
  try { o = JSON.parse(texto); } catch { throw new Error('El archivo no es un JSON válido.'); }
  if (!o || o.formato !== FORMATO) throw new Error('El archivo no es una finca de BioG.A.P.');
  if (typeof o.version !== 'number' || o.version > VERSION) throw new Error('El archivo viene de una versión más nueva de la app.');
  return { farm: normalizarFinca(o.finca), ajustes: normalizarAjustes(o.ajustes), tpl: o.plantillas ? normalizarTpl(o.plantillas, { tipo: 'mec', objetivo: 0, rows: [], paste: '' }) : null };
}

// Autoguardado en el navegador. Devuelve si pudo guardar; si no, la app muestra el aviso (src/core/aviso-guardado.js).
export function guardarLocal(S) {
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify({ farm: S.farm, ajustes: S.ajustes, demo: S.demo, tpl: { ...S.tpl, paste: '' }, done: S.done, theme: S.theme, riego: riegoAGuardar(S.riego) }));
    return marcarGuardado(true);
  } catch { return marcarGuardado(false); }
}

export function cargarLocal(tplBase) {
  try {
    const raw = localStorage.getItem(CLAVE_LOCAL);
    if (!raw) return null;
    const o = JSON.parse(raw);
    const riego = normalizarRiego(o.riego); // sin datos propios guardados, S.riego se queda con el ejemplo
    return {
      farm: normalizarFinca(o.farm), ajustes: normalizarAjustes(o.ajustes), demo: o.demo === true,
      tpl: normalizarTpl(o.tpl, tplBase), done: normalizarHechas(o.done), theme: opcion(o.theme, TEMAS, 'system'),
      ...(riego ? { riego } : {}),
    };
  } catch { return null; }
}

export function borrarLocal() {
  try { localStorage.removeItem(CLAVE_LOCAL); } catch { /* sin almacenamiento */ }
}
