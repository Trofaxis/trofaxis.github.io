// Censo de árboles de riesgo y sitios candidatos para colonias o refugios (ApiRadar). Funciones puras, sin DOM.
// Cada árbol: { id, lat, lon, dap, d, h }. El volumen de copa es el del módulo Polinizadores (Osorio 2025, Ec. 3).
import { CONFIG } from '../core/config.js';
import { volumenCopa } from '../modules/polinizadores.js';
import { distanciaM } from '../mapa/geo.js';

// Riesgo de cada árbol por percentil de volumen de copa dentro del censo (criterio propio, ver CONFIG.apiradar.percentilesRiesgo).
// Usa el rango medio para los empates. Un árbol sin diámetro o altura de copa no se clasifica (clase null).
export function clasificarArboles(arboles, pct = CONFIG.apiradar.percentilesRiesgo) {
  const con = (arboles ?? []).map((a) => ({ ...a, vol: a.d > 0 && a.h > 0 ? volumenCopa(a.d, a.h) : null }));
  const vols = con.filter((a) => a.vol != null).map((a) => a.vol);
  return con.map((a) => {
    if (a.vol == null) return { ...a, clase: null, q: null };
    const menor = vols.filter((v) => v < a.vol).length, igual = vols.filter((v) => v === a.vol).length;
    const q = (menor + igual / 2) / vols.length;
    return { ...a, q, clase: q >= pct[1] ? 'alto' : q >= pct[0] ? 'medio' : 'bajo' };
  });
}

export function resumenCenso(clasificados) {
  const porClase = { alto: { n: 0, vol: 0 }, medio: { n: 0, vol: 0 }, bajo: { n: 0, vol: 0 } };
  let volumen = 0, conMedidas = 0;
  clasificados.forEach((a) => { if (a.clase) { porClase[a.clase].n++; porClase[a.clase].vol += a.vol; volumen += a.vol; conMedidas++; } });
  return { n: clasificados.length, conMedidas, sinMedidas: clasificados.length - conMedidas, volumen, porClase };
}

// Veredicto de cada sitio candidato: distancia al árbol censado más cercano contra el radio de exclusión.
// cerca: dentro del radio mínimo · revisar: entre el mínimo y el conservador · lejos: fuera del conservador.
// El radio se aplica a todos los árboles del censo (Osorio censó 23 en la franja: se calcula contra todos, no solo contra los de más volumen).
export function evaluarSitios(arboles, sitios, radios = CONFIG.apiradar.radioExclusionM) {
  const [rMin, rMax] = radios;
  return (sitios ?? []).map((s) => {
    let cerca = null, enMin = 0, enMax = 0;
    for (const a of arboles ?? []) {
      const d = distanciaM([s.lat, s.lon], [a.lat, a.lon]);
      if (!cerca || d < cerca.d) cerca = { d, a };
      if (d < rMin) enMin++;
      if (d < rMax) enMax++;
    }
    if (!cerca) return { ...s, veredicto: null, distanciaM: null, arbol: null, enMin, enMax };
    const veredicto = cerca.d < rMin ? 'cerca' : cerca.d < rMax ? 'revisar' : 'lejos';
    return { ...s, veredicto, distanciaM: Math.round(cerca.d), arbol: { id: cerca.a.id, clase: cerca.a.clase ?? null }, enMin, enMax };
  });
}

export const VEREDICTO = {
  cerca: { texto: 'Cerca', nivel: 'Alto', frase: 'dentro del radio mínimo' },
  revisar: { texto: 'Revisar', nivel: 'Medio', frase: 'entre el radio mínimo y el conservador' },
  lejos: { texto: 'Lejos', nivel: 'Bajo', frase: 'fuera del radio conservador' },
};

export const nombreSitio = (s) => (/^sitio/i.test(s.id) ? s.id : `Sitio ${s.id}`);

// Censo ficticio para ver cómo funciona la app: coordenadas inventadas alrededor de un punto de referencia, no son de ninguna finca.
// Medidas en metros respecto de la referencia (este, norte). Se muestra siempre como «Ejemplo».
const REF = [14.0, -87.0];
const MP = (Math.PI / 180) * 6378137;
const aGrados = (x, y) => [+(REF[0] + y / MP).toFixed(6), +(REF[1] + x / (MP * Math.cos((REF[0] * Math.PI) / 180))).toFixed(6)];
const ARBOLES = [
  [1, 0, 0, 80, 18, 18], [2, -45, -12, 70, 17, 15], [3, -45, -8, 40, 15, 14], [4, -20, -2, 45, 16, 14], [5, 8, 4, 35, 10, 10],
  [6, 12, 8, 30, 9, 9], [7, -900, 450, 22, 14, 13], [8, -800, 420, 16, 13, 11], [9, -1000, 480, 40, 9, 8], [10, -700, 380, 25, 8, 7],
  [11, -150, -400, 30, 7, 7], [12, -190, -450, 20, 6, 6], [13, -300, -600, 15, 5, 5], [14, -350, -640, 12, 5, 4],
];
export function censoEjemplo() {
  const arboles = ARBOLES.map(([id, x, y, dap, d, h]) => { const [lat, lon] = aGrados(x, y); return { id: String(id), lat, lon, dap, d, h }; });
  const sitios = [['A', 150, 120], ['B', -520, -280], ['C', 600, -450]].map(([id, x, y]) => { const [lat, lon] = aGrados(x, y); return { id, lat, lon }; });
  const contorno = [[-1100, -700], [700, -700], [700, 600], [-1100, 600]].map(([x, y]) => aGrados(x, y));
  return { arboles, sitios, contorno };
}
