// Grafo del cerebro, al estilo del de Obsidian: cada hecho es un nodo y las líneas salen de relaciones reales.
// Tres clases de línea, ninguna inventada:
//   tema    → el hecho pertenece a ese tema de la app.
//   fuente  → el hecho sale de esa fuente (dos hechos con la misma cita quedan unidos por ella).
//   formula → una fórmula de la app usa los dos valores juntos (el archivo se nombra en cada regla).
import { HECHOS, TEMAS } from './hechos.js';

// Reglas de «se usan juntos en una fórmula». Cada una dice dónde está esa fórmula.
const FORMULAS = [
  // HQ = dosis ÷ DL50, comparado con el umbral; la DL50 da también la clase EPA (src/plag/calculo.js, peligroAbejas y claseEPA).
  { de: /^plag\.dl50\./, a: ['plag.umbralHQ', 'plag.epa'], donde: 'src/plag/calculo.js' },
  // El margen para abejas sin aguijón multiplica el HQ (src/plag/calculo.js).
  { de: /^plag\.sinAguijon$/, a: ['plag.umbralHQ'], donde: 'src/plag/calculo.js' },
  // GUS de cada ingrediente contra el corte de lixiviación alta (src/plag/calculo.js).
  { de: /^plag\.gus\./, a: ['plag.gusAlto'], donde: 'src/plag/calculo.js' },
  // Lámina aprovechable = (CC − PMP) · Da · p · profundidad radicular (src/riego/calculo.js).
  { de: /^riego\.textura\./, a: (id, H) => H.filter((h) => /^riego\.(p|raiz)\./.test(h.id)).map((h) => h.id), donde: 'src/riego/calculo.js' },
  { de: /^riego\.p\.(.+)$/, a: (id) => [id.replace('.p.', '.raiz.')], donde: 'src/riego/calculo.js' },
  // ETc = Kc · ETo, por etapa; la ETo de diseño sale del clima (src/riego/calculo.js, src/clima/normales.js).
  { de: /^riego\.kc\.(.+)\.[a-z]+$/, a: (id) => [id.replace(/^riego\.kc\.(.+)\.[a-z]+$/, 'riego.etapas.$1'), 'clima.etoDiseno'], donde: 'src/riego/calculo.js' },
  // Índice global: pesos de los módulos, confianza mínima y cortes de nivel (src/core/engine.js).
  { de: /^motor\.pesos$/, a: ['motor.niveles', 'motor.confianza', 'motor.rubrica'], donde: 'src/core/engine.js' },
  // Los meses de lluvia fuerte entran a las rúbricas de fertilización y suelo (src/modules/).
  { de: /^clima\.lluviaFuerte$/, a: ['motor.rubrica'], donde: 'src/modules/fertilizacion.js, src/modules/suelo.js' },
  // El sistema de riego es una variable de la rúbrica de agua (src/modules/agua.js).
  { de: /^motor\.sistemaRiego$/, a: ['motor.rubrica'], donde: 'src/modules/agua.js' },
  // El ApiRadar aplica el radio a los árboles del censo ordenados por percentil (src/apiradar/censo.js).
  { de: /^poli\.percentiles$/, a: ['poli.radioExclusion'], donde: 'src/apiradar/censo.js' },
];

// Clave de una fuente: la misma cita es el mismo nodo.
const claveFuente = (f) => 'fuente:' + f.cita.replace(/\s*\(actualizada.*$/, '');

export function armarGrafo(hechos = HECHOS) {
  const nodos = new Map();
  const aristas = [];
  const ids = new Set(hechos.map((h) => h.id));
  for (const [id, nombre] of Object.entries(TEMAS)) nodos.set('tema:' + id, { id: 'tema:' + id, tipo: 'tema', titulo: nombre });
  for (const h of hechos) {
    nodos.set(h.id, { id: h.id, tipo: 'hecho', titulo: h.titulo, estado: h.estado, hecho: h });
    aristas.push({ a: h.id, b: 'tema:' + h.tema, tipo: 'tema' });
    if (h.fuente) {
      const k = claveFuente(h.fuente);
      if (!nodos.has(k)) nodos.set(k, { id: k, tipo: 'fuente', titulo: k.slice(7), url: h.fuente.url });
      aristas.push({ a: h.id, b: k, tipo: 'fuente' });
    }
  }
  const vistas = new Set();
  for (const h of hechos) {
    for (const r of FORMULAS) {
      if (!r.de.test(h.id)) continue;
      const destinos = typeof r.a === 'function' ? r.a(h.id, hechos) : r.a;
      for (const b of destinos) {
        const clave = [h.id, b].sort().join('|');
        if (b === h.id || !ids.has(b) || vistas.has(clave)) continue;
        vistas.add(clave);
        aristas.push({ a: h.id, b, tipo: 'formula', donde: r.donde });
      }
    }
  }
  const lista = [...nodos.values()];
  const grado = new Map(lista.map((n) => [n.id, 0]));
  for (const e of aristas) { grado.set(e.a, grado.get(e.a) + 1); grado.set(e.b, grado.get(e.b) + 1); }
  for (const n of lista) n.grado = grado.get(n.id);
  return { nodos: lista, aristas };
}

// Vecinos de un nodo, para el panel de detalle.
export function vecinos(grafo, id) {
  return grafo.aristas.filter((e) => e.a === id || e.b === id).map((e) => ({ id: e.a === id ? e.b : e.a, tipo: e.tipo, donde: e.donde }));
}

// Posiciones iniciales en círculos por tema (deterministas: el mismo grafo siempre arranca igual).
export function posicionesIniciales(grafo, radio = 300) {
  const temas = grafo.nodos.filter((n) => n.tipo === 'tema');
  const centro = new Map(temas.map((t, i) => {
    const ang = (2 * Math.PI * i) / temas.length;
    return [t.id, { x: Math.cos(ang) * radio, y: Math.sin(ang) * radio }];
  }));
  const temaDe = new Map(grafo.aristas.filter((e) => e.tipo === 'tema').map((e) => [e.a, e.b]));
  grafo.nodos.forEach((n, i) => {
    const c = centro.get(n.tipo === 'tema' ? n.id : temaDe.get(n.id)) ?? { x: 0, y: 0 };
    const ang = i * 2.399963, r = n.tipo === 'tema' ? 0 : 30 + (i % 7) * 12; // ángulo áureo: reparte sin azar
    n.x = c.x + Math.cos(ang) * r; n.y = c.y + Math.sin(ang) * r; n.vx = 0; n.vy = 0;
  });
  return grafo;
}

// Un paso de la simulación de fuerzas: los nodos se repelen y las líneas los atraen como resortes.
// `fijo` es el id de un nodo que el usuario está arrastrando (no se mueve por las fuerzas).
// Como en d3-force, cada resorte se reparte según el grado del nodo más conectado y la velocidad tiene tope: así un
// nodo con muchas líneas (el umbral HQ, un tema) no hace oscilar el grafo.
export function paso(grafo, { repulsion = 900, largo = 40, rigidez = 0.5, gravedad = 0.004, friccion = 0.6, vmax = 15, fijo = null } = {}) {
  const N = grafo.nodos, idx = new Map(N.map((n, i) => [n.id, i]));
  const fx = new Float64Array(N.length), fy = new Float64Array(N.length);
  for (let i = 0; i < N.length; i++) {
    for (let j = i + 1; j < N.length; j++) {
      let dx = N[i].x - N[j].x, dy = N[i].y - N[j].y, d2 = dx * dx + dy * dy;
      if (d2 < 0.01) { dx = 0.1 * (i - j); dy = 0.1; d2 = dx * dx + dy * dy; }
      if (d2 > 250000) continue; // más de 500 unidades: la fuerza ya es despreciable
      const f = repulsion / d2, d = Math.sqrt(d2);
      fx[i] += (f * dx) / d; fy[i] += (f * dy) / d; fx[j] -= (f * dx) / d; fy[j] -= (f * dy) / d;
    }
  }
  for (const e of grafo.aristas) {
    const i = idx.get(e.a), j = idx.get(e.b), dx = N[j].x - N[i].x, dy = N[j].y - N[i].y, d = Math.hypot(dx, dy) || 0.01;
    const f = (rigidez / Math.max(N[i].grado, N[j].grado, 1)) * (d - largo);
    fx[i] += (f * dx) / d; fy[i] += (f * dy) / d; fx[j] -= (f * dx) / d; fy[j] -= (f * dy) / d;
  }
  let energia = 0;
  N.forEach((n, i) => {
    if (n.id === fijo) { n.vx = 0; n.vy = 0; return; }
    n.vx = (n.vx + fx[i] - n.x * gravedad) * friccion;
    n.vy = (n.vy + fy[i] - n.y * gravedad) * friccion;
    const v = Math.hypot(n.vx, n.vy);
    if (v > vmax) { n.vx *= vmax / v; n.vy *= vmax / v; }
    n.x += n.vx; n.y += n.vy; energia += n.vx * n.vx + n.vy * n.vy;
  });
  return energia / N.length;
}
