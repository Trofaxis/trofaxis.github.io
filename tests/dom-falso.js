// DOM mínimo para probar las vistas y las acciones de src/app.js en Node, sin navegador ni dependencias.
// No es un archivo de pruebas (no termina en .test.js): lo importan las pruebas de humo.
export function instalarDOM() {
  const escuchas = {}; // del documento
  const escuchasVentana = {}; // de la ventana (pagehide…)
  const elementos = {};
  const crear = (id = '') => ({
    id, innerHTML: '', textContent: '', dataset: {}, style: {}, value: '', checked: false, tagName: 'DIV', children: [],
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    contains: () => false, closest: () => null, querySelector: () => null, querySelectorAll: () => [],
    insertAdjacentHTML(pos, html) { this.innerHTML = pos === 'afterbegin' ? html + this.innerHTML : this.innerHTML + html; },
    setAttribute() {}, removeAttribute() {}, getAttribute: () => null, addEventListener() {}, removeEventListener() {},
    focus() {}, select() {}, click() {}, remove() {}, scrollIntoView() {}, appendChild() {}, getBoundingClientRect: () => ({ width: 0, height: 0, top: 0, left: 0 }),
  });
  elementos.app = crear('app');
  elementos.cuenta = crear('cuenta');
  elementos['cuenta-borrar-confirmar'] = crear('cuenta-borrar-confirmar');
  elementos.avisos = crear('avisos');
  const almacen = new Map();
  globalThis.localStorage = {
    getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
    setItem: (k, v) => { if (globalThis.__sinAlmacen) throw new Error('QuotaExceededError'); almacen.set(k, String(v)); },
    removeItem: (k) => { almacen.delete(k); },
  };
  globalThis.document = {
    activeElement: null, visibilityState: 'visible', body: crear('body'), documentElement: crear('html'),
    getElementById: (id) => elementos[id] ?? null,
    querySelector: () => null, querySelectorAll: () => [], createElement: (t) => crear(t), dispatchEvent() {},
    addEventListener: (tipo, fn) => { (escuchas[tipo] ??= []).push(fn); },
  };
  const alVentana = (tipo, fn) => { (escuchasVentana[tipo] ??= []).push(fn); };
  globalThis.addEventListener = alVentana;
  globalThis.window = { scrollTo() {}, addEventListener: alVentana, matchMedia: () => ({ matches: false, addEventListener() {} }) };
  globalThis.location = { hash: '', pathname: '/', search: '', origin: 'http://prueba.local' };
  globalThis.history = { replaceState() {} };
  const emitir = (tipo, evento) => (escuchas[tipo] ?? []).forEach((fn) => fn(evento));
  return {
    app: elementos.app, cuenta: elementos.cuenta, avisos: elementos.avisos, almacen,
    // Un clic sobre un control con data-act (y los data-* que se indiquen), como lo ve el manejador de app.js.
    clic(act, datos = {}) {
      const control = { dataset: { act, ...datos }, disabled: false };
      emitir('click', { target: { closest: (sel) => {
        if (sel === '[data-act]' || sel === '[data-act],[data-view]') return control;
        if (sel.includes('[data-act="cuenta-menu"]') && act === 'cuenta-menu') return control;
        if (sel.includes('[data-act="tema-set"]') && act === 'tema-set') return control;
        return null;
      } } });
    },
    // Un clic sobre una pestaña (data-view).
    irA(vista) { emitir('click', { target: { closest: (sel) => (sel === '[data-view]' ? { dataset: { view: vista } } : null) } }); },
    escribir(id, value) { emitir('input', { target: { id, value, dataset: {} } }); },
    pantalla: () => elementos.app.innerHTML,
    // La persona cierra o esconde la página: la app guarda lo pendiente (si guarda con espera, aquí se fuerza; si no, no hace nada).
    cerrarPagina() { (escuchasVentana.pagehide ?? []).forEach((fn) => fn({})); },
  };
}
