// Devuelve el foco al mismo control tras redibujar la vista (issue 39). Sin DOM propio: recibe el elemento o la raíz.

const comillas = (v) => String(v).replace(/["\\]/g, '\\$&');
const kebab = (k) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

// Selector que identifica el control enfocado: su id o, si es un botón, sus atributos data-*
// (data-month + data-path, data-sim, data-act + data-i, data-act + data-v...). Null si no hay forma segura.
export function selectorDeFoco(el) {
  if (!el) return null;
  if (el.id) return `[id="${comillas(el.id)}"]`;
  if (el.tagName !== 'BUTTON') return null;
  const datos = Object.entries(el.dataset || {});
  if (!datos.length) return null;
  return 'button' + datos.map(([k, v]) => `[data-${kebab(k)}="${comillas(v)}"]`).join('');
}

// El control del mismo selector en la vista nueva, solo si es uno solo: con varios iguales no se adivina cuál era.
export function controlParaFoco(raiz, selector) {
  if (!selector) return null;
  const hallados = raiz.querySelectorAll(selector);
  return hallados.length === 1 ? hallados[0] : null;
}
