// Preguntas rápidas: lo mínimo para ver un primer resultado (cultivo, abejas nativas, Spathodea, insecticidas).
// El nombre, el área, la ubicación y el riego se escriben directo en la finca; el resto vive en S.rapido
// y se pasa a la finca con aplicarRapido() sin borrar lo que el cuestionario completo ya tenía.
import { plagVacio, normalizarPlag } from '../plag/modelo.js';
import { abejasSinAguijon } from '../plag/calculo.js';
import { normalizar } from '../plag/catalogo.js';

// Nombres de lo que crean las preguntas rápidas. abejasSinAguijon() reconoce «sin aguijón» en el nombre (margen ×10).
export const NOMBRE_ABEJAS = 'Abejas nativas sin aguijón';
export const NOMBRE_SPATHODEA = 'Spathodea campanulata';
export const NOMBRE_INSECTICIDA = 'Insecticida sin detallar';

const esSpathodea = (e) => /spathodea|tulipan africano/.test(normalizar(e.nombre));
const esRapido = (p) => p.producto === NOMBRE_INSECTICIDA;

export const rapidoVacio = () => ({ cultivo: '', ha: null, cosecha: [], abejas: '', spathodea: '', spaN: null, spaFlor: [], insect: '', insectClase: 'amplio', insectMeses: [] });

// Respuestas rápidas a partir de lo que la finca ya tiene (para volver a editarlas).
export function rapidoDeFinca(f) {
  const r = rapidoVacio();
  const c = f.cultivos?.[0];
  if (c) Object.assign(r, { cultivo: c.nombre, ha: c.ha || null, cosecha: [...(c.cosecha ?? [])] });
  if (abejasSinAguijon(f).length) r.abejas = 'si';
  const sp = (f.especies ?? []).find(esSpathodea);
  if (sp) Object.assign(r, { spathodea: 'si', spaN: sp.cantidad ?? null, spaFlor: [...(sp.floracion ?? [])] });
  const q = (f.plaguicidas ?? []).find(esRapido);
  if (q) Object.assign(r, { insect: 'si', insectClase: q.clase, insectMeses: [...q.meses] });
  else if ((f.plaguicidas ?? []).length) r.insect = 'si';
  else if (f.sinPlaguicidas) r.insect = 'no';
  return r;
}

// Pasa las respuestas rápidas a una copia de la finca. «No sé» (vacío) no cambia nada.
export function aplicarRapido(f0, r) {
  const f = structuredClone(f0);
  const nom = (r.cultivo ?? '').trim();
  if (nom) {
    const c = { nombre: nom, ha: r.ha > 0 ? r.ha : 0, siembra: f.cultivos[0]?.siembra ?? [], cosecha: [...r.cosecha] };
    f.tieneCultivos = true;
    if (f.cultivos.length) f.cultivos[0] = { ...f.cultivos[0], ...c }; else f.cultivos.push(c);
  }
  if (r.abejas === 'si' && !abejasSinAguijon(f).length) f.especies.push({ nombre: NOMBRE_ABEJAS, tipo: 'Fauna', origen: 'nativa', floracion: [], atrae: false, riesgo: false, cantidad: null, copaD: null, copaH: null, presencia: '' });
  if (r.abejas === 'no') f.especies = f.especies.filter((e) => e.nombre !== NOMBRE_ABEJAS);
  if (r.spathodea === 'si') {
    const i = f.especies.findIndex(esSpathodea);
    const datos = { floracion: [...r.spaFlor], cantidad: r.spaN > 0 ? r.spaN : null };
    if (i >= 0) f.especies[i] = { ...f.especies[i], ...datos, riesgo: true };
    else f.especies.push({ nombre: NOMBRE_SPATHODEA, tipo: 'Árbol', origen: 'exótica', atrae: true, riesgo: true, copaD: null, copaH: null, presencia: '', ...datos });
  }
  if (r.spathodea === 'no') f.especies = f.especies.filter((e) => !esSpathodea(e));
  const detalladas = f.plaguicidas.filter((p) => !esRapido(p));
  if (r.insect === 'si' && !detalladas.length) {
    const q = normalizarPlag({ ...plagVacio(), producto: NOMBRE_INSECTICIDA, uso: 'insecticida', clase: r.insectClase, meses: r.insectMeses });
    f.plaguicidas = [q];
  }
  if (r.insect === 'no') f.plaguicidas = detalladas;
  if (r.insect) f.sinPlaguicidas = r.insect === 'no' && !f.plaguicidas.length;
  return f;
}
