// Consulta del cerebro: busca hechos por palabras, sin conexión y sin IA.
// No entiende preguntas libres ni razona: solo encuentra los hechos que contienen las palabras escritas
// (sin tildes ni mayúsculas) y los ordena por cuántas coinciden.
import { HECHOS, TEMAS } from './hechos.js';
import { normalizar } from '../riego/referencias.js';

// Palabras que no ayudan a buscar.
const VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'en', 'y', 'o', 'a', 'que', 'para', 'por', 'con', 'un', 'una', 'cual', 'cuanto', 'cuanta', 'es', 'se', 'mi', 'al']);

const palabras = (t) => normalizar(t).replace(/[^a-z0-9ñ.\- ]/g, ' ').split(' ').filter((p) => p.length > 1 && !VACIAS.has(p));
const textoDe = (h) => normalizar([h.titulo, h.valor, h.unidad, h.nota, TEMAS[h.tema], ...h.claves].join(' '));

// Hechos que contienen todas las palabras; si ninguno las tiene todas, los que tienen más. Máximo `max`.
export function buscar(texto, { tema = null, max = 20, hechos = HECHOS } = {}) {
  const q = palabras(texto);
  const base = tema ? hechos.filter((h) => h.tema === tema) : hechos;
  if (!q.length) return [];
  const puntuados = base.map((h) => { const t = textoDe(h); return { h, n: q.filter((p) => t.includes(p)).length }; }).filter((x) => x.n > 0);
  const tope = Math.max(0, ...puntuados.map((x) => x.n));
  return puntuados.filter((x) => x.n === tope).slice(0, max).map((x) => x.h);
}

// Conteo por estado, para mostrar cuánto del cerebro tiene fuente y cuánto es criterio propio.
export function resumen(hechos = HECHOS) {
  const r = { total: hechos.length, 'con fuente': 0, 'criterio propio': 0, 'por validar': 0 };
  for (const h of hechos) r[h.estado]++;
  return r;
}
