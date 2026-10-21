// Pantalla de entrada y cuenta recordada (pedido de Diego, 2026-10-16, flujo como el de OpenAI Platform).
// Se guarda solo en este navegador: el correo de la última cuenta y si el usuario eligió seguir sin cuenta.
// Nunca se guardan tokens aquí (la sesión vive en src/nube/cliente.js).
const CLAVE = 'biogap:cuenta:v1';
const PROVEEDORES = ['google', 'email'];

export function normalizarCuenta(o) {
  const v = o && typeof o === 'object' ? o : {};
  const email = typeof v.email === 'string' && /^\S+@\S+\.\S+$/.test(v.email) ? v.email.slice(0, 200) : '';
  return {
    email,
    proveedor: email && PROVEEDORES.includes(v.proveedor) ? v.proveedor : (email ? 'email' : ''),
    sinCuenta: v.sinCuenta === true,
  };
}

export function leerCuenta() {
  try { return normalizarCuenta(JSON.parse(localStorage.getItem(CLAVE) || 'null')); } catch { return normalizarCuenta(null); }
}

export function guardarCuenta(c) {
  try { localStorage.setItem(CLAVE, JSON.stringify(normalizarCuenta(c))); return true; } catch { return false; }
}

// Borrar cuenta elimina el dato recordado, pero no borra la finca ni el mapa de este equipo.
export function borrarCuentaRecordada() { try { localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ } }

// La entrada sale al abrir la app si la nube está activa, no hay sesión, no es la bienvenida de primera vez
// y el usuario no eligió «Seguir sin cuenta».
export function mostrarEntrada({ nubeActiva, sesion, vista, cuenta }) {
  return Boolean(nubeActiva) && !sesion && vista !== 'bienvenida' && !cuenta.sinCuenta;
}

export const inicial = (email) => (String(email || '').trim()[0] || '?').toUpperCase();
