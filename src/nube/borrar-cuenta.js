// Llama a la función protegida de borrado. No contiene credenciales privadas.
import { CONFIG } from '../core/config.js';

export class ErrorBorrarCuenta extends Error {
  constructor(mensaje, estado = 0) { super(mensaje); this.estado = estado; }
}

export async function borrarCuentaRemota(sesion, { cfg = CONFIG, fetchFn = globalThis.fetch } = {}) {
  const { url, clavePublicable } = cfg.nube ?? {};
  if (!url || !clavePublicable) throw new ErrorBorrarCuenta('No se pudo conectar con el servicio de cuentas.');
  if (!sesion?.token) throw new ErrorBorrarCuenta('Tu sesión no está disponible. Inicia sesión e inténtalo de nuevo.', 401);

  let respuesta;
  try {
    respuesta = await fetchFn(`${url}/functions/v1/borrar-cuenta`, {
      method: 'POST',
      headers: {
        apikey: clavePublicable,
        Authorization: `Bearer ${sesion.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ confirmacion: 'BORRAR' }),
    });
  } catch {
    throw new ErrorBorrarCuenta('No hay conexión. Tu cuenta y los datos de este equipo siguen intactos.');
  }

  if (respuesta.ok) return true;
  let mensaje = '';
  try { mensaje = (await respuesta.json())?.error || ''; } catch { /* respuesta sin JSON */ }
  if (respuesta.status === 401) throw new ErrorBorrarCuenta('Tu sesión venció. Inicia sesión de nuevo y vuelve a solicitar el borrado.', 401);
  throw new ErrorBorrarCuenta(mensaje || 'No se pudo borrar la cuenta. No se hicieron cambios en este equipo. Inténtalo de nuevo o escribe a support.trofaxis@gmail.com.', respuesta.status);
}
