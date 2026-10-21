// Este prefijo agrupa las cachés propias para retirar versiones anteriores.
const CACHE_PREFIX = 'trofaxis-shell-';
const CACHE_NAME = 'trofaxis-shell-2026-10-20-pwa1';
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/pwa.js",
  "/pwa.css",
  "/icons/trofaxis-192.png",
  "/icons/trofaxis-512.png",
  "/icons/trofaxis-maskable-192.png",
  "/icons/trofaxis-maskable-512.png",
  "/src/app.js",
  "/src/styles.css",
  "/src/admin/cerebro.css",
  "/src/admin/cerebro.js",
  "/src/apiradar/censo.js",
  "/src/apiradar/diagnostico.js",
  "/src/casos/anonimo.js",
  "/src/casos/ejemplos.js",
  "/src/casos/memoria.js",
  "/src/casos/perfil.js",
  "/src/casos/referencia.js",
  "/src/casos/relaciones.js",
  "/src/cerebro/consulta.js",
  "/src/cerebro/grafo.js",
  "/src/cerebro/hechos.js",
  "/src/cerebro/obsidian.js",
  "/src/cerebro/vinculos.js",
  "/src/clima/normales.js",
  "/src/clima/servicio.js",
  "/src/core/aviso-guardado.js",
  "/src/core/bienvenida.js",
  "/src/core/carga-diferida.js",
  "/src/core/completitud.js",
  "/src/core/config.js",
  "/src/core/cuenta.js",
  "/src/core/engine.js",
  "/src/core/fuentes.js",
  "/src/core/guardado-diferido.js",
  "/src/core/rapido.js",
  "/src/core/rubrica.js",
  "/src/core/state.js",
  "/src/core/storage.js",
  "/src/core/utils.js",
  "/src/especies/plagas.js",
  "/src/especies/presencia.js",
  "/src/fert/calculo.js",
  "/src/fert/catalogo.js",
  "/src/fert/extraer.js",
  "/src/fonts/fuentes.css",
  "/src/fonts/inter-latin-wght-normal.woff2",
  "/src/fonts/jetbrains-mono-latin-wght-normal.woff2",
  "/src/mapa/geo.js",
  "/src/mapa/ubicacion.js",
  "/src/modules/agua.js",
  "/src/modules/fertilizacion.js",
  "/src/modules/index.js",
  "/src/modules/polinizadores.js",
  "/src/modules/suelo.js",
  "/src/modules/troficas.js",
  "/src/nube/cliente.js",
  "/src/nube/sincronia.js",
  "/src/plag/calculo.js",
  "/src/plag/catalogo.js",
  "/src/plag/modelo.js",
  "/src/plag/sag.js",
  "/src/riego/calculo.js",
  "/src/riego/csv.js",
  "/src/riego/extraer.js",
  "/src/riego/guardado.js",
  "/src/riego/hidraulica.js",
  "/src/riego/referencias.js",
  "/src/riego/reglas.js",
  "/src/riego/xlsx.js",
  "/src/ui/apiradar.js",
  "/src/ui/avisos.js",
  "/src/ui/bienvenida.js",
  "/src/ui/casos.js",
  "/src/ui/charts.js",
  "/src/ui/clima.js",
  "/src/ui/components.js",
  "/src/ui/dashboard.js",
  "/src/ui/entrar.js",
  "/src/ui/error-vista.js",
  "/src/ui/explicaciones.js",
  "/src/ui/fertilizacion.js",
  "/src/ui/foco.js",
  "/src/ui/grupos.js",
  "/src/ui/mapa.js",
  "/src/ui/mapariesgo.js",
  "/src/ui/plaguicidas.js",
  "/src/ui/plan-imagen.js",
  "/src/ui/riego.js",
  "/src/ui/settings.js",
  "/src/ui/templates.js",
  "/src/ui/wizard.js"
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(caches.keys().then((claves) => Promise.all(
    claves.filter((clave) => clave.startsWith(CACHE_PREFIX) && clave !== CACHE_NAME).map((clave) => caches.delete(clave)),
  )).then(() => self.clients.claim()));
});

self.addEventListener('message', (evento) => {
  if (evento.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function consultarRed(request) {
  const respuesta = await fetch(request);
  if (respuesta.ok && respuesta.type === 'basic') {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, respuesta.clone());
    } catch {
      // Una falla al guardar no debe ocultar una respuesta válida de la red.
    }
  }
  return respuesta;
}

async function responderRedPrimero(request, respaldo) {
  try {
    return await consultarRed(request);
  } catch (error) {
    const guardada = await caches.match(request);
    if (guardada) return guardada;
    if (respaldo) {
      const alternativa = await caches.match(respaldo);
      if (alternativa) return alternativa;
    }
    throw error;
  }
}

self.addEventListener('fetch', (evento) => {
  const request = evento.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    evento.respondWith(responderRedPrimero(request, '/'));
    return;
  }

  const esAppShell = APP_SHELL.some((recurso) => new URL(recurso, self.location.origin).pathname === url.pathname);
  if (!esAppShell) return;
  evento.respondWith(responderRedPrimero(request));
});
