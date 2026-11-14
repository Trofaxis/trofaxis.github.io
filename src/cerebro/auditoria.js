// Auditoría de integridad del cerebro: revisa las tesis, las variables y los vínculos y devuelve lo que una persona
// tiene que mirar. Es una función pura (sin DOM ni red): el panel la muestra y las pruebas exigen que `errores`
// salga vacío. No cambia ningún dato ni puntaje; solo señala.
//
//   errores        → rompen la regla del diccionario (variable sin ficha, ficha sobrante o mal escrita). CI falla.
//   sinRevisar     → tesis sin `revisado_por`: la frase está en la página, pero nadie confirmó la interpretación.
//   ocr            → líneas verificadas por parecido (documento escaneado): una cifra pudo leerse mal.
//   contradicciones→ pares medidos en los que unas tesis dicen «sube», otras «baja» o «sin efecto». Casi siempre es
//                    el contexto (cultivo, suelo, lugar), no un error: por eso se listan con su cultivo.
//   porRevisar     → posibles duplicados del diccionario (POR_REVISAR).
//   aisladas       → variables que salen de una sola tesis: evidencia sin réplica.
//   sinUnidad      → umbrales y datos con una cifra pero sin unidad reconocible (a veces es un conteo y está bien).
//   capas          → cuántas relaciones unen cada par de capas (un vínculo une además sus variables de origen,
//                    que actúan juntas) y qué uniones bióticas–abióticas faltan.
import { TESIS } from './tesis.js';
import { VARIABLES, VINCULOS } from './vinculos.js';
import { FICHAS, POR_REVISAR, TIPOS_VAR, CAPAS, ESCALAS, DATOS } from './diccionario.js';

// Uniones que la visión de Trofaxis necesita (lote con riego, fertilización, plagas y polinizadores).
export const UNIONES_CLAVE = [
  ['riego', 'fertilizacion'], ['riego', 'suelo'], ['fertilizacion', 'suelo'], ['fertilizacion', 'agua'],
  ['clima', 'riego'], ['clima', 'plagas'], ['clima', 'polinizadores'], ['riego', 'plagas'], ['fertilizacion', 'plagas'],
  ['fertilizacion', 'polinizadores'], ['plaguicidas', 'polinizadores'], ['plaguicidas', 'plagas'], ['plagas', 'cultivo'],
];

const SENTIDO = { '+': 'sube', '−': 'baja', '0': 'sinEfecto', '+ n.s.': 'sinEfecto', '− n.s.': 'sinEfecto' };
const UNIDAD = /(%|‰|°\s?C|\b(k?g|mg|µg|t|kg|ha|m|cm|mm|km|m²|m³|L|mL|dS|mS|ppm|meq|cmol|bar|kPa|MPa|h|horas?|centibares|cb|hect[aá]reas?|d[ií]as?|meses|años?|semanas?|plantas?|plt|ciclos?|flores?|abejas?|insectos?|árboles?|lps|gpm|USD|L\/h)\b|\/ha\b|kg\/|t\/|g\/)/i;
// Lo que lleva cifras pero no es una medida: valores P, R², años, figuras, tablas y cuadros.
const NO_MEDIDA = /\(?\s*P\s*[<=>≤]\s*[\d.,]+\s*\)?|R²\s*=\s*[\d.,]+|\b(19|20)\d{2}\b|\b(Figura|Tabla|Cuadro|Fig\.|Ec\.|Ecuación|pág\.?)\s*\d+/gi;

export function validarFicha(id, x) {
  const e = [];
  if (!x.unidad?.trim()) e.push('falta la unidad');
  if (!TIPOS_VAR.includes(x.tipo)) e.push(`tipo desconocido: ${x.tipo}`);
  if (!CAPAS[x.capa]) e.push(`capa desconocida: ${x.capa}`);
  if (!ESCALAS.includes(x.escala)) e.push(`escala desconocida: ${x.escala}`);
  if (!DATOS[x.dato]) e.push(`origen del dato desconocido: ${x.dato}`);
  if (x.rango && !(Array.isArray(x.rango) && x.rango.length === 2 && x.rango[0] < x.rango[1])) e.push('rango mal escrito');
  if (x.rango && !x.rangoFuente) e.push('un rango necesita decir por qué (rangoFuente)');
  if (x.tipo === 'riesgo' && !id.startsWith('riesgo.')) e.push('solo los riesgo.* son de tipo riesgo');
  return e;
}

export function auditar({ tesis = TESIS, variables = VARIABLES, vinculos = VINCULOS, fichas = FICHAS, porRevisar = POR_REVISAR } = {}) {
  const items = tesis.tesis.flatMap((t) => t.items.map((it) => ({ ...it, t })));
  const rels = items.filter((it) => it.seccion === 'Relaciones');

  // Variables usadas y en cuántas tesis aparece cada una.
  const enTesis = new Map();
  const anota = (id, clave) => { if (!id) return; if (!enTesis.has(id)) enTesis.set(id, new Set()); enTesis.get(id).add(clave); };
  for (const it of items) { anota(it.de, it.t.clave); anota(it.a, it.t.clave); anota(it.variable, it.t.clave); }
  const usadas = new Set([...Object.keys(variables), ...enTesis.keys(), ...vinculos.flatMap((v) => [...v.de, v.a])]);
  const nombre = (id) => variables[id]?.nombre ?? tesis.candidatas.find((c) => c.id === id)?.nombre ?? id;

  const sinFicha = [...usadas].filter((id) => !fichas[id]).sort();
  const sobrantes = Object.keys(fichas).filter((id) => !usadas.has(id)).sort();
  const invalidas = Object.entries(fichas).map(([id, x]) => ({ id, errores: validarFicha(id, x) })).filter((x) => x.errores.length);
  const errores = [
    ...sinFicha.map((id) => `«${id}» no tiene ficha en el diccionario (src/cerebro/diccionario.js)`),
    ...sobrantes.map((id) => `la ficha «${id}» no corresponde a ninguna variable usada`),
    ...invalidas.flatMap((x) => x.errores.map((e) => `ficha «${x.id}»: ${e}`)),
    ...porRevisar.flatMap((p) => p.ids.filter((id) => !fichas[id]).map((id) => `POR_REVISAR nombra «${id}», que no tiene ficha`)),
  ];

  // Revisión humana y OCR.
  const sinRevisar = tesis.tesis.filter((t) => !t.revisado).map((t) => t.clave);
  const ocr = items.filter((it) => !String(it.coincidencia).startsWith('exacta'))
    .map((it) => ({ tesis: it.t.clave, seccion: it.seccion, pagina: it.pagina, cita: it.cita, coincidencia: it.coincidencia }));

  // Contradicciones entre líneas medidas del mismo par.
  const pares = new Map();
  for (const it of rels) {
    const s = it.base === 'medido' && SENTIDO[it.sentido];
    if (!s) continue;
    const k = `${it.de}>${it.a}`;
    if (!pares.has(k)) pares.set(k, { de: it.de, a: it.a, sube: [], baja: [], sinEfecto: [] });
    pares.get(k)[s].push({ tesis: it.t.clave, cultivo: it.t.cultivo || 'sin cultivo' });
  }
  const contradicciones = [...pares.values()].filter((p) => ['sube', 'baja', 'sinEfecto'].filter((s) => p[s].length).length > 1)
    .map((p) => ({ ...p, nombre: `${nombre(p.de)} → ${nombre(p.a)}`, opuesto: p.sube.length > 0 && p.baja.length > 0 }));

  // Evidencia aislada: variable de tesis que sale de una sola tesis y no es variable de Trofaxis.
  const aisladas = [...enTesis].filter(([id, s]) => s.size === 1 && !variables[id]).map(([id, s]) => ({ id, nombre: nombre(id), tesis: [...s][0] }))
    .sort((x, y) => x.id.localeCompare(y.id));

  // Umbrales y datos con cifra pero sin unidad.
  const sinUnidad = items.filter((it) => it.seccion === 'Umbrales' || it.seccion === 'Datos').map((it) => ({ it, texto: it.umbral ?? it.valor ?? '' }))
    .filter(({ texto }) => { const limpio = texto.replace(NO_MEDIDA, ''); return /\d/.test(limpio) && !UNIDAD.test(limpio); })
    .map(({ it, texto }) => ({ tesis: it.t.clave, seccion: it.seccion, pagina: it.pagina, texto }));

  // Matriz de capas: relaciones de tesis (cada par una vez) y vínculos (cada variable de origen con su efecto).
  const capa = (id) => fichas[id]?.capa;
  const matriz = {};
  const suma = (a, b, fuente) => {
    const ca = capa(a), cb = capa(b);
    if (!ca || !cb || ca === cb) return;
    const k = [ca, cb].sort().join('|');
    matriz[k] ??= { tesis: 0, vinculos: 0 };
    matriz[k][fuente]++;
  };
  for (const r of tesis.relaciones) suma(r.de, r.a, 'tesis');
  // Un vínculo une sus variables de origen entre sí (actúan juntas) y cada una con su efecto.
  for (const v of vinculos) {
    v.de.forEach((d, i) => { suma(d, v.a, 'vinculos'); for (const o of v.de.slice(i + 1)) suma(d, o, 'vinculos'); });
  }
  const uniones = UNIONES_CLAVE.map(([a, b]) => {
    const m = matriz[[a, b].sort().join('|')] ?? { tesis: 0, vinculos: 0 };
    return { a, b, nombre: `${CAPAS[a]} ↔ ${CAPAS[b]}`, ...m, total: m.tesis + m.vinculos };
  });
  const porTipo = {};
  for (const id of usadas) { const tp = fichas[id]?.tipo ?? 'sin ficha'; porTipo[tp] = (porTipo[tp] ?? 0) + 1; }
  const porDato = {};
  for (const id of usadas) { const d = fichas[id]?.dato ?? 'sin ficha'; porDato[d] = (porDato[d] ?? 0) + 1; }

  const exactas = items.length - ocr.length;
  return {
    resumen: {
      tesis: tesis.tesis.length, lineas: items.length, exactas, ocr: ocr.length, revisadas: tesis.tesis.length - sinRevisar.length,
      variables: usadas.size, conFicha: usadas.size - sinFicha.length, contradicciones: contradicciones.length,
      opuestas: contradicciones.filter((c) => c.opuesto).length, porRevisar: porRevisar.length, aisladas: aisladas.length,
      sinUnidad: sinUnidad.length, huecos: uniones.filter((u) => !u.total).length, errores: errores.length,
    },
    errores, sinRevisar, ocr, contradicciones, porRevisar: porRevisar.map((p) => ({ ...p, nombres: p.ids.map(nombre) })),
    aisladas, sinUnidad, capas: { matriz, uniones }, porTipo, porDato,
  };
}
