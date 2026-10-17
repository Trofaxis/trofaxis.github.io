// Cerebro de Trofaxis: todo lo que la app «sabe», en una sola lista de hechos con su fuente.
// No guarda cifras nuevas: lee los mismos datos que usan las fórmulas (config.js, catálogos y referencias),
// así un valor se cambia en un solo lugar. Funciona en el navegador, sin conexión y sin ninguna IA.
//
// Cada hecho: { id, tema, titulo, valor, unidad, estado, fuente, donde, nota }
//   estado: 'con fuente'      → trae fuente { cita, url } verificable.
//           'criterio propio' → valor elegido por el equipo, por validar; fuente null.
//           'por validar'     → dato sugerido sin fuente todavía; no entra en ningún puntaje.
import { CONFIG } from '../core/config.js';
import { FUENTES as FUENTES_ECO } from '../core/fuentes.js';
import { INGREDIENTES, CONSULTA_PPDB } from '../plag/catalogo.js';
import { FUENTES_PLAG } from '../plag/calculo.js';
import { FUENTES as FUENTES_RIEGO, CULTIVOS, TEXTURAS, EFICIENCIA_GOTEO } from '../riego/referencias.js';
import { filasValidacion } from '../especies/plagas.js';

export const ESTADOS = ['con fuente', 'criterio propio', 'por validar'];
export const TEMAS = {
  plaguicidas: 'Plaguicidas y abejas',
  riego: 'Riego y suelo',
  polinizadores: 'Polinizadores y ApiRadar',
  clima: 'Clima',
  motor: 'Motor de riesgo',
  plagas: 'Plagas por cultivo',
};

const conFuente = (f) => ({ estado: 'con fuente', fuente: { cita: f.cita, url: f.url || '' } });
const propio = { estado: 'criterio propio', fuente: null };
const lista = (a) => a.join(' a ');

function plaguicidas() {
  const p = CONFIG.plag, F = FUENTES_PLAG, d = 'src/core/config.js';
  const hechos = [
    { id: 'plag.umbralHQ', titulo: 'Umbral del cociente de peligro (HQ) para abejas adultas por contacto', valor: `${p.umbralHQ.abajo} (aspersión hacia abajo) y ${p.umbralHQ.arriba} (hacia arriba o de lado)`, unidad: 'HQ', ...conFuente(F.fao), donde: d },
    { id: 'plag.epa', titulo: 'Clases de toxicidad aguda por contacto de la EPA', valor: `≤ ${p.epa.alta} altamente tóxico; menor de ${p.epa.baja} tóxico; desde ${p.epa.baja} relativamente no tóxico`, unidad: 'µg/abeja', ...conFuente(F.epa), donde: d },
    { id: 'plag.sinAguijon', titulo: 'Margen para abejas sin aguijón', valor: `HQ × ${p.factorSinAguijon}`, unidad: '', ...conFuente(F.arena), donde: d, nota: 'Derivación, no norma.' },
    { id: 'plag.gusAlto', titulo: 'Índice GUS desde el que la lixiviación es alta', valor: `mayor de ${p.gusAlto}`, unidad: 'GUS', ...conFuente(F.gus), donde: d },
    { id: 'plag.horario', titulo: 'Horario de aplicación', valor: p.horario.map(([a, b]) => `${hora(a)}-${hora(b)}`).join(' y '), unidad: 'h', ...conFuente(F.aplicacion), donde: d },
    { id: 'plag.viento', titulo: 'Viento máximo para aplicar', valor: p.vientoMax, unidad: 'km/h', ...conFuente(F.aplicacion), donde: d },
    { id: 'plag.temp', titulo: 'Temperatura para aplicar', valor: lista(p.temp), unidad: '°C', ...conFuente(F.aplicacion), donde: d },
    { id: 'plag.hr', titulo: 'Humedad relativa mínima para aplicar', valor: p.hrMin, unidad: '%', ...conFuente(F.aplicacion), donde: d },
    { id: 'plag.lluvia', titulo: 'Horas sin lluvia después de aplicar', valor: p.lluviaMinH, unidad: 'h', ...conFuente(F.aplicacion), donde: d },
    { id: 'plag.ph', titulo: 'pH del agua de la mezcla', valor: lista(p.ph), unidad: 'pH', ...conFuente(F.aplicacion), donde: d, nota: 'La tabla SAG dice 5 a 6.' },
    { id: 'plag.phCobre', titulo: 'pH del agua para productos a base de cobre', valor: lista(p.phCobre), unidad: 'pH', ...conFuente(F.sag), donde: d },
    { id: 'plag.toleranciaCopas', titulo: 'Diferencia aceptada entre copas por bomba y dosis por barril (tabla SAG)', valor: p.toleranciaCopas * 100, unidad: '%', ...propio, donde: d },
  ];
  for (const i of INGREDIENTES) {
    const f = { cita: `Ficha PPDB/BPDB de ${i.nombre} (actualizada ${i.actualizado}; consultada ${CONSULTA_PPDB})`, url: i.url };
    hechos.push({ id: `plag.dl50.${i.id}`, titulo: `DL50 aguda por contacto para Apis mellifera: ${i.nombre} (${i.uso})`, valor: `${i.mayor ? '> ' : ''}${i.dl50}`, unidad: 'µg/abeja', ...conFuente(f), donde: 'src/plag/catalogo.js', nota: i.nota, claves: [i.nombre, ...i.sinonimos] });
    if (i.gus != null) hechos.push({ id: `plag.gus.${i.id}`, titulo: `Índice GUS de lixiviación: ${i.nombre}`, valor: i.gus, unidad: 'GUS', ...conFuente(f), donde: 'src/plag/catalogo.js', claves: [i.nombre, ...i.sinonimos] });
  }
  return hechos;
}

function riego() {
  const r = CONFIG.riego, F = FUENTES_RIEGO, d = 'src/riego/referencias.js';
  const fr = (k) => (F[k]?.url || k !== 'referencia' ? conFuente(F[k]) : { estado: 'por validar', fuente: null });
  const hechos = [];
  for (const [id, c] of Object.entries(CULTIVOS)) {
    for (const [etapa, k] of Object.entries(c.kc)) {
      hechos.push({ id: `riego.kc.${id}.${etapa}`, titulo: `Kc ${etapa} de ${c.nombre}`, valor: k.valor, unidad: '', ...fr(k.fuente), donde: d, nota: [k.nota, `La app acepta de ${k.min} a ${k.max} (tolerancia: criterio propio).`].filter(Boolean).join(' '), claves: c.sinonimos });
    }
    hechos.push({ id: `riego.etapas.${id}`, titulo: `Duración de etapas de ${c.nombre} (inicial, desarrollo, media, final)`, valor: c.etapas.valor.join(', '), unidad: 'días', ...fr(c.etapas.fuente), donde: d, claves: c.sinonimos });
    hechos.push({ id: `riego.p.${id}`, titulo: `Fracción de agotamiento p de ${c.nombre}`, valor: c.p.valor, unidad: '', ...fr(c.p.fuente), donde: d, claves: c.sinonimos });
    hechos.push({ id: `riego.raiz.${id}`, titulo: `Profundidad radicular de ${c.nombre}`, valor: lista([c.raiz.min, c.raiz.max]), unidad: 'm', ...fr(c.raiz.fuente), donde: d, claves: c.sinonimos });
  }
  for (const [cod, t] of Object.entries(TEXTURAS)) {
    hechos.push({ id: `riego.textura.${cod}`, titulo: `Propiedades del suelo ${t.nombre.toLowerCase()} (${cod})`, valor: `Da ${t.da} g/cm³; CC ${t.cc} %; PMP ${t.pmp} %; infiltración ${t.infiltracion ?? 'sin dato'} mm/h`, unidad: '', ...conFuente(F.cimmyt2012), donde: d });
  }
  hechos.push(
    { id: 'riego.eficienciaGoteo', titulo: 'Eficiencia de aplicación del goteo', valor: lista([EFICIENCIA_GOTEO.min, EFICIENCIA_GOTEO.max]), unidad: '', ...fr(EFICIENCIA_GOTEO.fuente), donde: d, nota: F.referencia.cita },
    { id: 'riego.hfMax', titulo: 'Pérdida de carga máxima en el lateral', valor: r.hfMaxFraccion * 100, unidad: '% de la presión de operación', ...conFuente({ cita: 'Hoja Lateral (C11) del Lab de Riego, Zamorano' }), donde: 'src/core/config.js' },
    { id: 'riego.velocidadMax', titulo: 'Velocidad máxima del agua en tubería de PVC', valor: r.velocidadMax, unidad: 'm/s', ...propio, donde: 'src/core/config.js', nota: 'Valor común de diseño; la hoja del Lab usa 2 m/s para principales.' },
    { id: 'riego.evaporacion', titulo: 'Fracción de la radiación que evapora agua del reservorio', valor: r.fraccionEvaporacion, unidad: '', ...conFuente({ cita: 'Cubicación de reservorio del Lab de Riego, Zamorano (celda G30)' }), donde: 'src/core/config.js' },
    { id: 'riego.bordeLibre', titulo: 'Borde libre del reservorio', valor: r.bordeLibre * 100, unidad: '% de la profundidad', ...conFuente({ cita: 'Cubicación de reservorio del Lab de Riego, Zamorano (celda R20)' }), donde: 'src/core/config.js' },
  );
  return hechos;
}

// Datos de las tesis tal como están en src/core/fuentes.js, cada uno con la página o la sección donde se leyó.
function datosDeTesis() {
  return Object.entries(FUENTES_ECO).flatMap(([k, f]) => (f.datos ?? []).map((x) => ({
    id: `poli.${k}.${x.id}`, titulo: x.titulo, valor: x.valor, unidad: x.unidad, ...conFuente(f), donde: 'src/core/fuentes.js',
    pagina: x.donde, nota: [`${f.corta}, ${x.donde}.`, x.nota].filter(Boolean).join(' '), claves: x.claves,
  })));
}

function polinizadores() {
  const a = CONFIG.apiradar, d = 'src/core/config.js';
  return [
    { id: 'poli.radioExclusion', titulo: 'Radio de exclusión alrededor de los árboles de riesgo (rango de vuelo de Trigona fulviventris)', valor: lista(a.radioExclusionM), unidad: 'm', ...conFuente(FUENTES_ECO.barrantes), donde: d, nota: 'Verificado en el resumen en inglés, no en el texto completo. Para Plebeia melanica se usa el mismo radio como criterio propio.', claves: ['spathodea', 'abejas', 'apiradar', 'refugio'] },
    { id: 'poli.percentiles', titulo: 'Cortes de riesgo de cada árbol del censo por volumen de copa', valor: 'tercios del propio censo', unidad: '', ...propio, donde: d, claves: ['spathodea', 'censo', 'apiradar'] },
    { id: 'poli.corteCopa', titulo: 'Cortes de riesgo por volumen de copa de las especies de riesgo', valor: CONFIG.rubrica.poli.abundanciaRiesgo.cortes.join(' y '), unidad: 'm³', ...propio, donde: d, nota: `${FUENTES_ECO.osorio.corta}, pág. 26: la mayoría de las copas del campus mide ≤ 1 000 m³. Usar esa cifra como corte es criterio propio.`, claves: ['spathodea', 'copa'] },
    ...datosDeTesis(),
    ...Object.entries(CONFIG.presencia).map(([g, p]) => ({ id: `poli.presencia.${g}`, titulo: `Nivel de presencia de ${g}: baja, media o alta`, valor: `baja < ${p.cortes[0]}; media < ${p.cortes[1]}; alta desde ${p.cortes[1]}`, unidad: p.unidad, ...propio, donde: d, nota: p.fuenteMetodo ? `El método de muestreo sí tiene fuente: ${p.fuenteMetodo}.` : 'Informativo: no entra en ninguna fórmula.' })),
  ];
}

function clima() {
  const c = CONFIG.clima, d = 'src/core/config.js';
  return [
    { id: 'clima.lluviaFuerte', titulo: 'Mes de lluvia fuerte', valor: `${c.lluviaFuerteMm} o más`, unidad: 'mm/mes', ...propio, donde: d },
    { id: 'clima.anios', titulo: 'Años que se promedian para el clima típico', valor: c.anios, unidad: 'años', ...propio, donde: d, nota: 'La normal de la OMM usa 30.' },
    { id: 'clima.etoDiseno', titulo: 'ETo de diseño del riego', valor: `percentil ${c.percentilEtoDiseno * 100} de la ETo diaria del mes más exigente`, unidad: '', ...propio, donde: d },
    { id: 'clima.cache', titulo: 'Días que se reutiliza el clima ya descargado de un punto', valor: c.cacheDias, unidad: 'días', ...propio, donde: d, nota: 'Mientras dure, el clima funciona sin conexión.' },
  ];
}

function motor() {
  const d = 'src/core/config.js';
  return [
    { id: 'motor.niveles', titulo: 'Cortes del índice de riesgo 0-100', valor: `medio desde ${CONFIG.niveles.medio}; alto desde ${CONFIG.niveles.alto}`, unidad: 'puntos', ...propio, donde: d },
    { id: 'motor.pesos', titulo: 'Peso de cada módulo en el índice global', valor: Object.entries(CONFIG.pesos).map(([k, v]) => `${k} ${v}`).join('; '), unidad: '', ...propio, donde: d },
    { id: 'motor.confianza', titulo: 'Confianza mínima para calificar un módulo', valor: CONFIG.confianzaMinima, unidad: 'fracción del peso con dato', ...propio, donde: d },
    { id: 'motor.rubrica', titulo: 'Pesos y cortes de la rúbrica de cada módulo', valor: `${Object.keys(CONFIG.rubrica).length} módulos`, unidad: '', ...propio, donde: d, nota: 'Salvo que config.js diga otra fuente al lado del valor.' },
    { id: 'motor.sistemaRiego', titulo: 'Puntaje del sistema de riego según su eficiencia de aplicación', valor: Object.entries(CONFIG.categorias.sistemaRiego).map(([k, v]) => `${k} ${v}`).join('; '), unidad: 'puntos', ...conFuente({ cita: 'FAO, eficiencia de aplicación (TM4, Tabla 8): goteo 90 %, aspersión 75 %, superficie 60 %' }), donde: d, nota: 'La eficiencia tiene fuente; pasarla a 0, 50 y 100 puntos es criterio propio.' },
  ];
}

function plagas() {
  return filasValidacion().map((f, n) => ({
    id: `plagas.${n}`, titulo: `${f.plaga} (${f.cientifico}) en ${f.cultivo}`, valor: f.tipo, unidad: '',
    ...(f.fuente ? conFuente({ cita: f.fuente }) : { estado: 'por validar', fuente: null }),
    donde: 'src/especies/plagas.js', nota: 'Tabla no validada: solo sugiere, no puntúa.', claves: [f.cultivo],
  }));
}

const hora = (h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

// Lista completa, armada una vez al cargar el módulo.
export const HECHOS = Object.entries({ plaguicidas, riego, polinizadores, clima, motor, plagas })
  .flatMap(([tema, armar]) => armar().map((h) => ({ tema, unidad: '', nota: '', claves: [], ...h })));

// Errores de un hecho: sin fuente ni criterio propio, estado desconocido o campos vacíos.
export function validarHecho(h) {
  const e = [];
  if (!h.id || !h.titulo) e.push('falta id o título');
  if (!ESTADOS.includes(h.estado)) e.push(`estado desconocido: ${h.estado}`);
  if (h.estado === 'con fuente' && !h.fuente?.cita) e.push('dice «con fuente» pero no trae cita');
  if (h.estado !== 'con fuente' && h.fuente) e.push('trae fuente pero no dice «con fuente»');
  if (h.valor == null || h.valor === '') e.push('sin valor');
  if (!TEMAS[h.tema]) e.push(`tema desconocido: ${h.tema}`);
  return e;
}

// Documentos del proyecto que el cerebro conoce por nombre pero cuyos datos todavía no tiene cargados.
// No se inventa lo que dicen: cuando estén en el repo, cada dato entra como hecho con su página.
export const PENDIENTES = [
  { fuente: 'Tejeda et al. (2025)', falta: 'Con embargo en bdigital.zamorano.edu (handle 11036/8207). Kuniyoshi (2026) la cita y reproduce una figura suya, pero sus datos no se citan sin el documento.' },
];
