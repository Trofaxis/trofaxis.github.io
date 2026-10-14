// Bienvenida de primera vez: si ya se vio y lo que respondió el usuario (cómo conoció la app y para qué la usará).
// Se guarda solo en este navegador, aparte de la finca. No cambia ningún cálculo.
const CLAVE = 'biogap:bienvenida:v1';

export const FUENTES_BV = [
  ['zamorano', 'En Zamorano (clase o proyecto)'],
  ['colega', 'Por un colega o productor'],
  ['evento', 'En una capacitación o evento'],
  ['redes', 'En redes sociales'],
  ['buscador', 'Buscando en internet'],
  ['otro', 'Otro'],
];
export const USOS_BV = [
  ['certificacion', 'Preparar o mantener GLOBALG.A.P.', 'Ver qué secciones de IFA v6 toca cada riesgo'],
  ['riesgo', 'Conocer el riesgo ambiental de mi finca', 'Agua, suelo, fertilización, polinizadores y cadenas tróficas'],
  ['abejas', 'Proteger abejas y polinizadores', 'Incluye el ApiRadar para árboles de riesgo como Spathodea'],
  ['asesorar', 'Asesorar a otras fincas', 'Comparar fincas y guardar casos'],
  ['estudiar', 'Estudiar o investigar', 'Practicar con la finca de ejemplo'],
];

const ids = (lista) => lista.map((x) => x[0]);

export function normalizarBienvenida(o) {
  const v = o && typeof o === 'object' ? o : {};
  return {
    vista: v.vista === true,
    fuente: ids(FUENTES_BV).includes(v.fuente) ? v.fuente : '',
    usos: Array.isArray(v.usos) ? ids(USOS_BV).filter((id) => v.usos.includes(id)) : [],
  };
}

export function leerBienvenida() {
  try { return normalizarBienvenida(JSON.parse(localStorage.getItem(CLAVE) || 'null')); } catch { return normalizarBienvenida(null); }
}

export function guardarBienvenida(bv) {
  try { localStorage.setItem(CLAVE, JSON.stringify({ ...normalizarBienvenida({ ...bv, vista: true }), fecha: new Date().toISOString() })); return true; } catch { return false; }
}

// Se muestra solo la primera vez: ni a quien ya la vio ni a quien ya tenía datos guardados de antes.
export const mostrarBienvenida = (hayDatosPrevios) => !hayDatosPrevios && !leerBienvenida().vista;
