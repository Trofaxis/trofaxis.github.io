const CLAVE_FINCA = 'biogap:v1';
const CLAVE_SESION = 'biogap:sesion:v1';

const banner = document.getElementById('estado-pwa');
const mensaje = document.getElementById('mensaje-pwa');
const accion = document.getElementById('accion-pwa');
let instalacionPendiente = null;
let workerEnEspera = null;
let recargarAlCambiar = false;

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
  } else if (accion.dataset.accion === 'actualizar' && workerEnEspera) {
    recargarAlCambiar = true;
    workerEnEspera.postMessage({ type: 'SKIP_WAITING' });
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargarAlCambiar) window.location.reload();
  });

  navigator.serviceWorker.register('./sw.js', { scope: '/' }).then((registro) => {
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
    window.addEventListener('online', () => registro.update().catch(() => {}));
  }).catch(() => {
    // Si el navegador no permite service workers, la versión web sigue funcionando.
  });
}

actualizarAviso();
