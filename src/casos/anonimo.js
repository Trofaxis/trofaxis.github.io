// Caso anonimizado: lo único que sale de la finca cuando el usuario marca el consentimiento.
// Sale: rasgos del perfil (escalas 0-1), riesgo por módulo, acciones y resultado.
// NO sale: nombre de la finca ni de personas, departamento, fuente de agua, especies, coordenadas.
// La base lo vuelve a exigir con una restricción CHECK (claves permitidas en perfil y resultado).
// Las acciones son texto libre: se limpian de coordenadas, correos, teléfonos y enlaces, y la app avisa al usuario.

import { CONFIG } from '../core/config.js';
import { normalizarFinca, normalizarResultado } from '../core/storage.js';
import { MODULOS } from '../modules/index.js';
import { perfil } from './perfil.js';

export const CLAVES_PERFIL = ['cultivo', 'riego', 'pendiente', 'distAgua', 'propNativas', 'mesesCoincidencia', 'scores', 'overall'];
export const CLAVES_RESULTADO = ['ncAntes', 'ncDespues', 'laminaAntes', 'laminaDespues'];
const RIEGOS = ['gravedad', 'aspersion', 'goteo', 'ninguno'];
const OMITIDO = '[dato omitido]';

// Quita de un texto libre lo que identifica a una persona o un lugar.
export function limpiarTexto(t, max = 200) {
  return String(t ?? '')
    .replace(/https?:\/\/\S+|www\.\S+/gi, OMITIDO)
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, OMITIDO)
    .replace(/-?\d{1,3}\s?°[^,;]*|-?\d{1,3}\.\d{3,}/g, OMITIDO) // coordenadas (decimales o grados)
    .replace(/\+?\d[\d\s().-]{6,}\d/g, OMITIDO) // teléfonos y otras cifras largas
    .replace(/\s+/g, ' ').trim().slice(0, max);
}

export function casoAnonimo(finca, cfg = CONFIG) {
  const f = normalizarFinca(finca);
  const { cultivoNombre, ...rasgos } = perfil(f, cfg);
  void cultivoNombre; // el nombre tal como se escribió no sale: solo la versión normalizada
  return {
    perfil: { ...rasgos, cultivo: rasgos.cultivo ? limpiarTexto(rasgos.cultivo, 40) || null : null },
    acciones: f.acciones.map((a) => limpiarTexto(a)).filter(Boolean).slice(0, 30),
    resultado: normalizarResultado(f.resultado),
  };
}

// Lo que baja de la nube nunca se da por bueno: se valida campo por campo, igual que un archivo importado.
const unidad = (x) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 1 ? x : null);
export function perfilDeNube(o) {
  if (!o || typeof o !== 'object') return null;
  const ids = MODULOS.map((m) => m.id);
  const scores = Object.fromEntries(ids.filter((id) => unidad(o.scores?.[id]) != null).map((id) => [id, o.scores[id]]));
  if (!Object.keys(scores).length) return null;
  return {
    cultivo: typeof o.cultivo === 'string' && o.cultivo.trim() ? o.cultivo.slice(0, 40) : null,
    cultivoNombre: null,
    pendiente: unidad(o.pendiente),
    riego: RIEGOS.includes(o.riego) ? o.riego : null,
    distAgua: unidad(o.distAgua),
    propNativas: unidad(o.propNativas),
    mesesCoincidencia: unidad(o.mesesCoincidencia),
    scores,
    overall: typeof o.overall === 'number' && Number.isFinite(o.overall) ? Math.max(0, Math.min(100, o.overall)) : 0,
  };
}

// Fila de la tabla `casos` → caso de la memoria. Origen "nube": nunca se confunde con uno de ejemplo ni uno propio.
export function casoDeNube(fila) {
  const p = perfilDeNube(fila?.perfil);
  if (!p || typeof fila.id !== 'string') return null;
  return {
    id: `nube-${fila.id.slice(0, 40)}`, origen: 'nube', etiqueta: 'Caso de la comunidad',
    perfil: p,
    acciones: Array.isArray(fila.acciones) ? fila.acciones.slice(0, 30).map((a) => limpiarTexto(a)).filter(Boolean) : [],
    resultado: normalizarResultado(fila.resultado),
  };
}
