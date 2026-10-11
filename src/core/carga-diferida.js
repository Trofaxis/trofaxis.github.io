// El navegador recuerda un import() que falló y lo rechaza de nuevo sin pedir el archivo otra vez.
// Tras un fallo se usa otra dirección (?r=N) para que el reintento sí llegue a la red.
export const conIntento = (ruta, intento) => (intento ? `${ruta}?r=${intento}` : ruta);

// Descarga una vista la primera vez que se abre (import() del navegador, sin build).
// `cargadores` asigna a cada nombre una función (intento) que devuelve la promesa de la vista;
// `intento` es 0 la primera vez y sube con cada fallo (ver conIntento).
// `alCambiar(nombre)` avisa cuando la vista llegó o falló, para volver a dibujar.
export function crearCargador(cargadores, { alCambiar = () => {} } = {}) {
  const listas = {};
  const pendientes = {};
  const fallos = {};
  const intentos = {};
  const cargador = {
    incluye: (nombre) => Object.hasOwn(cargadores, nombre),
    vista: (nombre) => listas[nombre] ?? null,
    fallo: (nombre) => !!fallos[nombre],
    pedir(nombre) {
      if (!cargador.incluye(nombre) || listas[nombre] || pendientes[nombre] || fallos[nombre]) return;
      pendientes[nombre] = Promise.resolve()
        .then(() => cargadores[nombre](intentos[nombre] ?? 0))
        .then((vista) => { listas[nombre] = vista; }, () => { fallos[nombre] = true; intentos[nombre] = (intentos[nombre] ?? 0) + 1; })
        .finally(() => { delete pendientes[nombre]; alCambiar(nombre); });
    },
    reintentar(nombre) { delete fallos[nombre]; cargador.pedir(nombre); },
  };
  return cargador;
}
