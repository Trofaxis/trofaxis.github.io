// «Instalar Trofaxis» en la página de presentación (/conoce/).
// Trofaxis es una aplicación web instalable (manifest.webmanifest, alcance «/»): en Chrome y Edge el navegador ofrece
// su propio cuadro de instalación (evento beforeinstallprompt) y la app queda en el escritorio o en el teléfono.
// Safari y Firefox no dan ese evento: ahí se muestran los pasos del navegador, sin prometer un botón que no existe.
// detectarNavegador y pasosDe son funciones puras (se prueban en tests/conoce.test.js); montarInstalar toca el DOM.

// ua: navigator.userAgent · plataforma: navigator.platform · toques: navigator.maxTouchPoints.
export function detectarNavegador({ ua = '', plataforma = '', toques = 0 } = {}) {
  const es = (re) => re.test(ua);
  // iPadOS se presenta como Mac: se distingue por la pantalla táctil.
  if (es(/iPad|iPhone|iPod/) || (plataforma === 'MacIntel' && toques > 1)) return 'ios';
  if (es(/Android/)) return es(/Firefox\//) ? 'firefox-android' : 'android';
  if (es(/Firefox\//)) return 'firefox';
  if (es(/Edg\//)) return 'edge';
  if (es(/Chrome\/|Chromium\//)) return 'chrome';
  if (es(/Safari\//) && es(/Macintosh/)) return 'safari-mac';
  return 'otro';
}

// Los nombres de los menús son los de cada navegador en español y pueden variar un poco entre versiones.
export const NAVEGADORES = {
  chrome: {
    nombre: 'Chrome (Windows, Mac o Linux)',
    instala: true,
    pasos: [
      'Pulsa el ícono de instalar al final de la barra de direcciones (una pantalla con una flecha hacia abajo).',
      'Si no lo ves, abre el menú ⋮ de Chrome, entra a «Transmitir, guardar y compartir» y elige «Instalar Trofaxis…».',
      'Confirma con «Instalar». Trofaxis se abre en su propia ventana y queda en tu escritorio y en el menú de inicio.',
    ],
  },
  edge: {
    nombre: 'Edge (Windows o Mac)',
    instala: true,
    pasos: [
      'Pulsa el ícono de instalar al final de la barra de direcciones (tres cuadros y un signo +).',
      'Si no lo ves, abre el menú … de Edge, entra a «Aplicaciones» y elige «Instalar Trofaxis».',
      'Confirma con «Instalar». Puedes anclarla a la barra de tareas y al menú de inicio.',
    ],
  },
  'safari-mac': {
    nombre: 'Safari en Mac',
    instala: true,
    pasos: [
      'En la barra de menús, abre «Archivo».',
      'Elige «Añadir al Dock…».',
      'Confirma con «Añadir». Trofaxis queda en el Dock como una app aparte.',
    ],
    nota: 'Requiere macOS Sonoma (14) o posterior.',
  },
  ios: {
    nombre: 'iPhone o iPad',
    instala: true,
    pasos: [
      'Pulsa el botón Compartir (un cuadro con una flecha hacia arriba).',
      'Baja en la lista y elige «Añadir a pantalla de inicio».',
      'Confirma con «Añadir». El ícono de Trofaxis queda junto a tus otras apps.',
    ],
  },
  android: {
    nombre: 'Android (Chrome)',
    instala: true,
    pasos: [
      'Abre el menú ⋮ de Chrome.',
      'Elige «Instalar app» o «Agregar a la pantalla principal».',
      'Confirma con «Instalar». Trofaxis queda con tus otras apps.',
    ],
  },
  'firefox-android': {
    nombre: 'Android (Firefox)',
    instala: true,
    pasos: [
      'Abre el menú ⋮ de Firefox.',
      'Elige «Instalar» o «Agregar a la pantalla de inicio».',
      'Confirma. El ícono de Trofaxis queda en tu pantalla de inicio.',
    ],
  },
  firefox: {
    nombre: 'Firefox (computadora)',
    instala: false,
    pasos: [
      'Firefox para computadora no instala aplicaciones web.',
      'Abre esta página en Chrome o en Edge y pulsa «Instalar Trofaxis».',
      'O usa Trofaxis en el navegador: funciona igual, solo que sin ícono propio.',
    ],
  },
  otro: {
    nombre: 'Otro navegador',
    instala: false,
    pasos: [
      'Busca en el menú de tu navegador una opción como «Instalar app» o «Agregar a la pantalla de inicio».',
      'Si no aparece, abre esta página en Chrome o en Edge y pulsa «Instalar Trofaxis».',
      'También puedes usar Trofaxis en el navegador, sin instalar nada.',
    ],
  },
};

export const pasosDe = (id) => NAVEGADORES[id] ?? NAVEGADORES.otro;

// En localhost el service worker serviría el código guardado y no el que se acaba de editar (misma regla que pwa.js).
const esLocal = (host) => ['localhost', '127.0.0.1'].includes(host);

// Conecta los botones [data-instalar], el cuadro de pasos y los avisos. Devuelve el estado para las pruebas manuales.
export function montarInstalar({ ventana = window, doc = document, alNavegar = (url) => { ventana.location.href = url; } } = {}) {
  const nav = ventana.navigator;
  const navegador = detectarNavegador({ ua: nav.userAgent, plataforma: nav.platform, toques: nav.maxTouchPoints });
  const dialogo = doc.getElementById('dlg-instalar');
  const aviso = doc.getElementById('instalar-aviso');
  const botones = [...doc.querySelectorAll('[data-instalar]')];
  const dentroDeLaApp = ventana.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true;
  let pendiente = null;
  let instalada = dentroDeLaApp;

  const decir = (texto) => { if (aviso) { aviso.textContent = texto; aviso.hidden = !texto; } };
  const rotular = () => {
    for (const b of botones) {
      const t = b.querySelector('[data-rotulo]') ?? b;
      t.textContent = instalada ? 'Abrir Trofaxis' : 'Instalar Trofaxis';
    }
    doc.documentElement.classList.toggle('instalable', Boolean(pendiente));
  };

  // Deja el app shell guardado para que la app instalada abra sin conexión desde la primera vez.
  const prepararSinConexion = () => {
    if (!('serviceWorker' in nav) || esLocal(ventana.location.hostname)) return;
    nav.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  };

  const mostrarPasos = (id) => {
    if (!dialogo) return;
    const info = pasosDe(id);
    dialogo.querySelector('[data-pasos-titulo]').textContent = info.instala ? `Instalar en ${info.nombre}` : info.nombre;
    const lista = dialogo.querySelector('[data-pasos]');
    lista.replaceChildren(...info.pasos.map((p) => Object.assign(doc.createElement('li'), { textContent: p })));
    const nota = dialogo.querySelector('[data-pasos-nota]');
    nota.textContent = info.nota ?? '';
    nota.hidden = !info.nota;
    for (const b of dialogo.querySelectorAll('[data-navegador]')) b.setAttribute('aria-pressed', String(b.dataset.navegador === id));
  };

  const abrirPasos = () => {
    if (!dialogo) return;
    mostrarPasos(navegador);
    if (typeof dialogo.showModal === 'function') dialogo.showModal(); else dialogo.setAttribute('open', '');
  };

  ventana.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault(); // se guarda para ofrecerlo cuando la persona pulse el botón
    pendiente = ev;
    rotular();
  });
  ventana.addEventListener('appinstalled', () => {
    pendiente = null;
    instalada = true;
    rotular();
    decir('Trofaxis quedó instalada. Búscala en tu escritorio o entre tus aplicaciones.');
    dialogo?.close?.();
    prepararSinConexion();
  });

  for (const b of botones) {
    b.addEventListener('click', async () => {
      if (instalada) { alNavegar('/'); return; }
      if (!pendiente) { abrirPasos(); return; }
      const oferta = pendiente;
      pendiente = null; // el navegador solo deja usar cada oferta una vez
      rotular();
      try {
        await oferta.prompt();
        const { outcome } = await oferta.userChoice;
        if (outcome === 'accepted') { decir('Instalando Trofaxis…'); prepararSinConexion(); } else decir('No se instaló. Puedes pulsar «Instalar Trofaxis» cuando quieras.');
      } catch {
        abrirPasos();
      }
    });
  }
  for (const b of dialogo?.querySelectorAll('[data-navegador]') ?? []) b.addEventListener('click', () => mostrarPasos(b.dataset.navegador));
  for (const b of dialogo?.querySelectorAll('[data-cerrar]') ?? []) b.addEventListener('click', () => dialogo.close());
  // Un clic en el fondo del cuadro lo cierra.
  dialogo?.addEventListener('click', (ev) => { if (ev.target === dialogo) dialogo.close(); });

  // Pasos del navegador de quien visita, a la vista en la sección «Instalar» sin tener que abrir el cuadro.
  const enLinea = doc.getElementById('instalar-pasos');
  if (enLinea) {
    const info = pasosDe(navegador);
    enLinea.querySelector('[data-pasos-titulo]').textContent = info.instala ? `En ${info.nombre}` : info.nombre;
    enLinea.querySelector('[data-pasos]').replaceChildren(...info.pasos.map((p) => Object.assign(doc.createElement('li'), { textContent: p })));
  }
  for (const b of doc.querySelectorAll('[data-ver-pasos]')) b.addEventListener('click', abrirPasos);

  rotular();
  return { navegador, estaInstalada: () => instalada, hayOferta: () => Boolean(pendiente) };
}
