// Lotes de la finca: polígonos dibujados en el mapa (src/mapa/ubicacion.js) y lo que la app ya sabe de cada uno.
// Funciones puras, sin DOM. No calculan riesgo por lote: el índice de Trofaxis se calcula por finca, y las
// aplicaciones y la fertilización se registran por finca, no por lote. Lo que sale de aquí lo dice así.
import { areaHa } from './geo.js';

export const NOMBRES_MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const norm = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

// Centro aproximado (promedio de los vértices). Basta para poner la etiqueta y pedir el clima a ~1 km.
export function centroide(contorno) {
  if (!Array.isArray(contorno) || !contorno.length) return null;
  const s = contorno.reduce((a, [la, lo]) => [a[0] + la, a[1] + lo], [0, 0]);
  return [s[0] / contorno.length, s[1] / contorno.length];
}

// ¿El punto [lat, lon] cae dentro del polígono? Rayo horizontal; en un lote de pocas hectáreas la curvatura no importa.
export function puntoEnPoligono([la, lo], contorno) {
  let dentro = false;
  for (let i = 0, j = contorno.length - 1; i < contorno.length; j = i++) {
    const [ai, oi] = contorno[i], [aj, oj] = contorno[j];
    if ((ai > la) !== (aj > la) && lo < ((oj - oi) * (la - ai)) / (aj - ai) + oi) dentro = !dentro;
  }
  return dentro;
}

// El lote más pequeño que contiene el punto (si hay lotes encimados, el de adentro).
export function loteEn(p, lotes) {
  return (lotes ?? []).filter((l) => puntoEnPoligono(p, l.contorno)).sort((a, b) => areaHa(a.contorno) - areaHa(b.contorno))[0] ?? null;
}

// Siguiente id libre: L1, L2…
export function siguienteIdLote(lotes) {
  const usados = new Set((lotes ?? []).map((l) => l.id));
  let n = (lotes?.length ?? 0) + 1;
  while (usados.has(`L${n}`)) n++;
  return `L${n}`;
}

// Punto para pedir el clima de ahora: el lote elegido, la ubicación de la finca, su contorno o el primer lote.
export function puntoClima(u, loteId) {
  const l = u.lotes?.find((x) => x.id === loteId);
  if (l) return centroide(l.contorno);
  if (u.punto) return u.punto;
  if (u.contorno?.length >= 3) return centroide(u.contorno);
  return u.lotes?.length ? centroide(u.lotes[0].contorno) : null;
}

// Nombre del lugar de ese punto, para la tarjeta del clima («Ahora en Lote 2»). Sigue el mismo orden que puntoClima.
export function lugarClima(u, loteId) {
  const l = u.lotes?.find((x) => x.id === loteId);
  if (l) return l.nombre;
  if (u.punto || u.contorno?.length >= 3) return 'la finca';
  return u.lotes?.[0]?.nombre ?? '';
}

// Lo que la app sabe del lote: área dibujada, su cultivo (si coincide con uno de la finca) y las actividades del mes.
// finca: la finca con el plan de fertilización ya aplicado (conPlan). mes: 0 = enero.
export function resumenLote(lote, finca, mes) {
  const cultivo = lote.cultivo ? (finca.cultivos ?? []).find((c) => norm(c.nombre) === norm(lote.cultivo)) ?? null : null;
  const delLote = [];
  if (cultivo?.siembra?.includes(mes)) delLote.push(`Siembra de ${cultivo.nombre}`);
  if (cultivo?.cosecha?.includes(mes)) delLote.push(`Cosecha de ${cultivo.nombre}`);
  const deFinca = [];
  const aplic = (finca.plaguicidas ?? []).filter((p) => p.meses?.includes(mes));
  if (aplic.length) deFinca.push(`${aplic.length} aplicación(es) de plaguicida: ${[...new Set(aplic.map((p) => p.producto || 'sin nombre'))].slice(0, 3).join(', ')}${aplic.length > 3 ? '…' : ''}`);
  if (finca.fertMeses?.includes(mes)) deFinca.push('Fertilización');
  return {
    area: areaHa(lote.contorno),
    cultivo,
    cultivoSinRegistro: !!lote.cultivo && !cultivo,
    delLote, deFinca,
  };
}
