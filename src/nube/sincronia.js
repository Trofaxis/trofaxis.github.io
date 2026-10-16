// Guardado automático en la nube mientras hay sesión (decisión de Diego, 2026-10-16).
// Funciones puras: qué hacer al entrar y si vale la pena subir. Las llamadas a la red están en app.js.
import { normalizarFinca } from '../core/storage.js';

// Una finca «con datos» es la que el usuario empezó a llenar; una vacía nunca pisa la copia de la nube.
export function fincaConDatos(f) {
  if (!f) return false;
  return Boolean(String(f.nombre || '').trim() || String(f.depto || '').trim() || Number(f.area) > 0
    || f.cultivos?.length || f.especies?.length || f.plaguicidas?.length || f.fertPlan?.length);
}

export const huella = (f) => JSON.stringify(normalizarFinca(f));

// Al iniciar sesión (o abrir la app con sesión):
// - 'cargar': hay finca en la nube y la de este navegador es la de ejemplo o está vacía.
// - 'subir': no hay finca en la nube y la de este navegador tiene datos reales.
// - 'conflicto': las dos tienen datos y son distintas; no se pisa ninguna hasta que el usuario elija.
// - 'nada': son iguales, o no hay nada que mover.
export function decidirAlEntrar({ local, demo, enNube }) {
  const localReal = !demo && fincaConDatos(local);
  if (!enNube) return localReal ? 'subir' : 'nada';
  if (!localReal) return 'cargar';
  return huella(local) === huella(enNube) ? 'nada' : 'conflicto';
}

// Subir solo si hay sesión, ya se comparó con la nube al entrar (listo), la finca es real,
// no hay conflicto pendiente y cambió desde la última subida.
export function debeSubir({ sesion, listo, local, demo, conflicto, ultima }) {
  return Boolean(sesion) && Boolean(listo) && !demo && !conflicto && fincaConDatos(local) && huella(local) !== ultima;
}
