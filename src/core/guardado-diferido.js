// Guardado con espera (issue 49): en cada tecleo se pide guardar, pero solo se guarda tras un rato sin cambios
// o cuando la página se oculta o se cierra. Así no se serializa la finca completa en cada letra.
export function crearGuardado(guardar, { espera = 500, programar = setTimeout, cancelar = clearTimeout } = {}) {
  let temporizador = null;
  let pendiente = false;
  const ahora = () => {
    if (temporizador != null) { cancelar(temporizador); temporizador = null; }
    if (!pendiente) return false;
    pendiente = false;
    guardar();
    return true;
  };
  const pedir = () => {
    pendiente = true;
    if (temporizador != null) cancelar(temporizador);
    temporizador = programar(ahora, espera);
  };
  return { pedir, ahora };
}
