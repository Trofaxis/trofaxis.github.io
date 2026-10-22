const CLAVE_FINCA = 'biogap:v1';
const CLAVE_SESION = 'biogap:sesion:v1';

const banner = document.getElementById('estado-pwa');
const mensaje = document.getElementById('mensaje-pwa');
const accion = document.getElementById('accion-pwa');
let instalacionPendiente = null;
let workerEnEspera = null;
let recargarAlCambiar = false;
let recargaSolicitada = false;
let activandoActualizacion = false;
let actualizacionPospuestaPorEdicion = false;
let registroPwa = null;
let ultimaBusquedaActualizacion = null;
let busquedaActualizacion = null;
// Otra ventana activó la versión nueva: esta sigue con la anterior en memoria y debe recargar.
let actualizadaEnOtraVentana = false;
const INTERVALO_BUSQUEDA_ACTUALIZACION = 60_000;

function hayFincaGuardada() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_FINCA) || 'null');
    return Boolean(guardado?.farm && typeof guardado.farm === 'object');
  } catch {
    return false;
  }
}

function haySesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null');
    return Boolean(sesion && typeof sesion.token === 'string');
  } catch {
    return false;
  }
}

function mostrar(texto, textoAccion = '', tipoAccion = '') {
  mensaje.textContent = texto;
  accion.textContent = textoAccion;
  accion.hidden = !textoAccion;
  accion.dataset.accion = tipoAccion;
  banner.hidden = false;
}

function ocultar() {
  banner.hidden = true;
  mensaje.textContent = '';
  accion.hidden = true;
  accion.dataset.accion = '';
}

function esCampoEditable(elemento) {
  if (!elemento) return false;
  if (elemento.isContentEditable) return true;
  if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(elemento.tagName)) return false;
  return !['button', 'submit', 'reset'].includes((elemento.type || '').toLowerCase());
}

function esAccionActualizar(elemento) {
  return elemento === accion || Boolean(accion.contains?.(elemento));
}

function buscarActualizacion() {
  if (!registroPwa || typeof registroPwa.update !== 'function') return Promise.resolve();
  if (busquedaActualizacion) return busquedaActualizacion;
  const ahora = Date.now();
  if (ultimaBusquedaActualizacion !== null && ahora - ultimaBusquedaActualizacion < INTERVALO_BUSQUEDA_ACTUALIZACION) {
    return Promise.resolve();
  }
  ultimaBusquedaActualizacion = ahora;
  try {
    busquedaActualizacion = Promise.resolve(registroPwa.update())
      .catch(() => {})
      .finally(() => { busquedaActualizacion = null; });
  } catch {
    busquedaActualizacion = null;
    return Promise.resolve();
  }
  return busquedaActualizacion;
}

function actualizarAviso() {
  if (!navigator.onLine) {
    const finca = hayFincaGuardada()
      ? 'Se abrió la última finca guardada en este equipo. '
      : 'Todavía no hay una finca guardada en este equipo. ';
    const red = haySesion()
      ? 'Sin conexión: tus cambios se guardan en este equipo y se suben al volver.'
      : 'Sin conexión: tus cambios se guardan en este equipo.';
    mostrar(`${finca}${red}`);
    return;
  }
  if (actualizadaEnOtraVentana) {
    mostrar('Trofaxis se actualizó en otra ventana. Recarga esta para seguir.', 'Recargar', 'recargar');
    return;
  }
  if (workerEnEspera) {
    mostrar('Hay una versión nueva de Trofaxis.', 'Actualizar', 'actualizar');
    return;
  }
  if (instalacionPendiente) {
    mostrar('Puedes instalar Trofaxis en este equipo.', 'Instalar', 'instalar');
    return;
  }
  ocultar();
}

window.addEventListener('offline', actualizarAviso);
window.addEventListener('online', actualizarAviso);
window.addEventListener('storage', actualizarAviso);
window.addEventListener('online', () => { void buscarActualizacion(); });
window.addEventListener('pageshow', (evento) => {
  if (evento.persisted) void buscarActualizacion();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') void buscarActualizacion();
});
document.addEventListener('pointerdown', (evento) => {
  if (['actualizar', 'recargar'].includes(accion.dataset.accion)
    && esAccionActualizar(evento.target)
    && esCampoEditable(document.activeElement)) {
    actualizacionPospuestaPorEdicion = true;
  }
}, true);
document.addEventListener('focusout', (evento) => {
  if (['actualizar', 'recargar'].includes(accion.dataset.accion)
    && esCampoEditable(evento.target)
    && esAccionActualizar(evento.relatedTarget)) {
    actualizacionPospuestaPorEdicion = true;
  }
}, true);

window.addEventListener('beforeinstallprompt', (evento) => {
  evento.preventDefault();
  instalacionPendiente = evento;
  actualizarAviso();
});

window.addEventListener('appinstalled', () => {
  instalacionPendiente = null;
  actualizarAviso();
});

accion.addEventListener('click', async () => {
  if (accion.dataset.accion === 'instalar' && instalacionPendiente) {
    const evento = instalacionPendiente;
    instalacionPendiente = null;
    await evento.prompt();
    actualizarAviso();
  } else if (accion.dataset.accion === 'actualizar' && workerEnEspera && !activandoActualizacion) {
    const estabaEditando = actualizacionPospuestaPorEdicion || esCampoEditable(document.activeElement);
    actualizacionPospuestaPorEdicion = false;
    if (estabaEditando) {
      mostrar('Termina o guarda lo que estás escribiendo antes de actualizar.', 'Actualizar', 'actualizar');
      return;
    }
    recargarAlCambiar = true;
    activandoActualizacion = true;
    workerEnEspera.postMessage({ type: 'SKIP_WAITING' });
  } else if (accion.dataset.accion === 'recargar') {
    const estabaEditando = actualizacionPospuestaPorEdicion || esCampoEditable(document.activeElement);
    actualizacionPospuestaPorEdicion = false;
    if (estabaEditando) {
      mostrar('Termina o guarda lo que estás escribiendo antes de recargar.', 'Recargar', 'recargar');
      return;
    }
    window.location.reload();
  }
});

// En localhost el service worker serviría el código guardado y no el que se acaba de editar.
// Se activa solo con ?sw en la dirección (para probar la app instalada o sin conexión).
const esDesarrolloLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  && !/[?&]sw(?:[=&]|$)/.test(window.location.search || '');

if ('serviceWorker' in navigator && esDesarrolloLocal) {
  navigator.serviceWorker.getRegistrations?.().then((registros) => registros.forEach((r) => r.unregister())).catch(() => {});
} else if ('serviceWorker' in navigator) {
  const teniaControlador = Boolean(navigator.serviceWorker.controller);
  // register() ya solicita una comprobación al abrir; cuenta para el límite de frecuencia.
  ultimaBusquedaActualizacion = Date.now();
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargarAlCambiar && !recargaSolicitada) {
      recargaSolicitada = true;
      window.location.reload();
    } else if (teniaControlador && !recargarAlCambiar) {
      // La versión nueva ya está activa: el aviso «Actualizar» de esta ventana no tendría efecto.
      actualizadaEnOtraVentana = true;
      workerEnEspera = null;
      activandoActualizacion = false;
      actualizarAviso();
    }
  });

  navigator.serviceWorker.register('./sw.js', { scope: '/' }).then((registro) => {
    registroPwa = registro;
    const revisarWorker = () => {
      if (registro.waiting && navigator.serviceWorker.controller) {
        workerEnEspera = registro.waiting;
        actualizarAviso();
      }
    };
    revisarWorker();
    registro.addEventListener('updatefound', () => {
      const nuevo = registro.installing;
      if (!nuevo) return;
      nuevo.addEventListener('statechange', () => {
        if (nuevo.state === 'installed') revisarWorker();
      });
    });
  }).catch(() => {
    // Si el navegador no permite service workers, la versión web sigue funcionando.
  });
}

actualizarAviso();
