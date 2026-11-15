// «Instalar Trofaxis» en la página de presentación (/conoce/): que sea un clic, sin listas de pasos.
// Trofaxis es una aplicación web instalable (manifest.webmanifest, alcance «/»). Qué hace el botón en cada caso:
//  1. El navegador ya entregó su oferta (evento beforeinstallprompt: Chrome, Edge y Android). Un clic abre el cuadro de
//     instalación del propio navegador. Esa confirmación la pone el navegador: ninguna página puede saltársela.
//  2. Existe navigator.install() (Web Install API, anunciada para Chrome 156 de escritorio). Hace lo mismo aunque la
//     oferta no haya llegado y, si Trofaxis ya estaba instalada, el navegador ofrece abrirla.
//  3. Computadora con Chrome o Edge y sin oferta. Casi siempre es que Trofaxis ya está instalada (el navegador no
//     ofrece instalar dos veces): el botón pasa a «Abrir Trofaxis», la abre en su propia ventana y la página dice
//     que ya está instalada. La página no puede preguntárselo al navegador: lo sabe con certeza por la marca
//     CLAVE_INSTALADA, que deja la app cuando corre en su propia ventana (pwa.js), y si no, lo presume.
//  4. Navegadores que no dejan instalar desde un botón (iPhone, iPad, Safari, Firefox en Android). Se dice en una
//     frase el único gesto que hace falta y la app queda a un clic.
//  5. Firefox en computadora no instala aplicaciones web: el botón dice «Abrir Trofaxis» y la abre ahí mismo.
// Lo medido en Chromium 153 está en docs/conoce.md. detectarNavegador y guiaDe son funciones puras (se prueban en
// tests/conoce.test.js); montarInstalar toca el DOM.

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

// oferta: el navegador entrega su cuadro de instalación y basta un clic · escritorio: computadora, no teléfono ·
// instala: se puede instalar ahí · nota: la línea bajo el botón de la sección «Instalar» · titulo, gesto y detalle:
// lo único que se muestra cuando el botón no puede instalar por su cuenta. El gesto es una frase, nunca una lista.
// Los nombres de los menús son los de cada navegador en español y pueden variar un poco entre versiones.
const UN_CLIC = 'Un clic, confirmas en tu navegador y queda instalada.';
export const NAVEGADORES = {
  chrome: {
    nombre: 'Chrome', oferta: true, escritorio: true, instala: true, nota: UN_CLIC,
    titulo: 'Está en tu barra de direcciones',
    gesto: 'Pulsa el ícono de instalar, al final de la barra de direcciones.',
  },
  edge: {
    nombre: 'Edge', oferta: true, escritorio: true, instala: true, nota: UN_CLIC,
    titulo: 'Está en tu barra de direcciones',
    gesto: 'Pulsa el ícono de instalar, al final de la barra de direcciones.',
  },
  android: {
    nombre: 'Android', oferta: true, escritorio: false, instala: true,
    nota: 'Un toque, confirmas y queda con tus otras apps.',
    titulo: 'Está en el menú de tu navegador',
    gesto: 'Abre el menú ⋮ y toca «Instalar app».',
  },
  ios: {
    nombre: 'iPhone o iPad', oferta: false, escritorio: false, instala: true, compartir: true,
    nota: 'En iPhone y iPad, Apple solo permite instalarla desde el botón Compartir. Son dos toques.',
    titulo: 'En iPhone y iPad son dos toques',
    gesto: 'Toca Compartir y luego «Agregar a Inicio».',
    detalle: 'En algunos equipos dice «Añadir a pantalla de inicio».',
  },
  'safari-mac': {
    nombre: 'Safari en Mac', oferta: false, escritorio: true, instala: true,
    nota: 'En Safari se instala desde el menú Archivo.',
    titulo: 'En Safari va por el menú Archivo',
    gesto: 'Abre el menú Archivo y elige «Añadir al Dock».',
    detalle: 'Requiere macOS Sonoma (14) o posterior.',
  },
  'firefox-android': {
    nombre: 'Firefox en Android', oferta: false, escritorio: false, instala: true,
    nota: 'En Firefox se instala desde su menú.',
    titulo: 'Está en el menú de Firefox',
    gesto: 'Abre el menú ⋮ y toca «Instalar» o «Agregar a la pantalla de inicio».',
  },
  firefox: {
    nombre: 'Firefox en computadora', oferta: false, escritorio: true, instala: false,
    nota: 'Firefox para computadora no instala aplicaciones web. Ábrela aquí mismo, o entra con Chrome o Edge para instalarla.',
    titulo: 'Firefox no instala aplicaciones web',
    gesto: 'Ábrela aquí mismo y funciona igual. Para instalarla, entra con Chrome o Edge.',
  },
  otro: {
    nombre: 'otro navegador', oferta: false, escritorio: false, instala: true,
    nota: 'Se instala desde el menú de tu navegador.',
    titulo: 'Está en el menú de tu navegador',
    gesto: 'Busca «Instalar app» o «Agregar a la pantalla de inicio» en el menú de tu navegador.',
  },
};

export const guiaDe = (id) => NAVEGADORES[id] ?? NAVEGADORES.otro;

// Criterio propio. En Chromium 153 la oferta llegó entre 0,2 y 0,7 s después de cargar la página.
// ESPERA: tras un clic sin oferta, cuánto se espera a que llegue. Debe caber en los 5 s que el navegador da por válido
// un clic para abrir una ventana (a los 4,5 s la abrió; a los 6 s la bloqueó).
export const ESPERA_OFERTA_MS = 2500;
// GRACIA: en computadora, pasado este tiempo sin oferta se da por instalada y el botón pasa a «Abrir Trofaxis».
export const GRACIA_MS = 4000;
export const AVISO_VISIBLE_MS = 8000;

// La app la escribe cuando corre en su propia ventana o se acaba de instalar, y la borra cuando el navegador vuelve a
// ofrecer la instalación (pwa.js usa la misma clave; hay una prueba). Así esta página sabe que ya está instalada.
export const CLAVE_INSTALADA = 'biogap:instalada:v1';

export const TEXTOS = {
  instalar: 'Instalar Trofaxis',
  abrir: 'Abrir Trofaxis',
  preparando: 'Preparando…',
  instalando: 'Instalando Trofaxis…',
  instalada: 'Trofaxis quedó instalada. Búscala en tu escritorio o entre tus aplicaciones.',
  cancelada: 'No se instaló. Puedes pulsar «Instalar Trofaxis» cuando quieras.',
  // Al abrirla en vez de instalarla se dice por qué: si no, parece que la instalación falló.
  abiertaInstalada: 'Trofaxis ya está instalada en este equipo. La abrimos.',
  abiertaSinOferta: 'Abrimos Trofaxis. Tu navegador no ofrece instalarla aquí: lo usual es que ya esté instalada.',
  notaInstalada: 'Trofaxis ya está instalada en este equipo.',
  notaSinOferta: 'Tu navegador no ofrece instalarla aquí: lo usual es que ya esté instalada en este equipo.',
  hojaLista: 'Ya puedes instalarla',
  hojaListaGesto: 'Tu navegador ya lo permite: un toque y confirmas.',
};

// En localhost el service worker serviría el código guardado y no el que se acaba de editar (misma regla que pwa.js).
const esLocal = (host) => ['localhost', '127.0.0.1'].includes(host);

// Conecta los botones [data-instalar], la nota de la sección, la línea de estado, el aviso y la hoja del gesto.
// alNavegar: ir a la app en esta misma ventana · abrirAparte: abrirla en otra (si está instalada, en su propia ventana).
export function montarInstalar({
  ventana = window,
  doc = document,
  alNavegar = (url) => { ventana.location.href = url; },
  abrirAparte = (url) => { ventana.open(url, '_blank', 'noopener'); },
} = {}) {
  const nav = ventana.navigator;
  const navegador = detectarNavegador({ ua: nav.userAgent, plataforma: nav.platform, toques: nav.maxTouchPoints });
  const info = guiaDe(navegador);
  const dialogo = doc.getElementById('dlg-instalar');
  const aviso = doc.getElementById('instalar-aviso');
  const nota = doc.getElementById('instalar-nota');
  const botones = [...doc.querySelectorAll('[data-instalar]')];
  const estados = [...doc.querySelectorAll('[data-estado-instalar]')];
  const modoApp = ventana.matchMedia?.('(display-mode: standalone)');
  const esLaApp = () => modoApp?.matches === true || nav.standalone === true;
  const despues = (fn, ms) => ventana.setTimeout(fn, ms);
  const tieneApi = typeof nav.install === 'function';

  const leerMarca = () => { try { return ventana.localStorage?.getItem(CLAVE_INSTALADA) === '1'; } catch { return false; } };
  const marcar = (si) => {
    try {
      if (si) ventana.localStorage?.setItem(CLAVE_INSTALADA, '1'); else ventana.localStorage?.removeItem(CLAVE_INSTALADA);
    } catch { /* sin almacenamiento, la página funciona igual */ }
  };

  let pendiente = null;      // la oferta del navegador, guardada para el clic
  let instalada = esLaApp(); // dentro de la app instalada, o recién instalada
  let sabida = leerMarca();  // la app dejó dicho que está instalada en este equipo
  let sinOferta = !info.instala || sabida; // el botón abre la app: aquí no se instala, ya está instalada o no llegó la oferta
  let cancelada = false;     // la persona dijo que no en el cuadro del navegador
  let apiFallo = false;
  let ocupado = false;
  let recien = false;
  let turno = 0;
  let dicho = '';
  let hojaAbierta = false;
  const enEspera = [];

  const decir = (texto) => {
    if (!aviso) return;
    dicho = texto;
    aviso.textContent = texto;
    aviso.hidden = !texto;
    const mio = ++turno;
    if (texto) despues(() => { if (mio === turno) { aviso.textContent = ''; aviso.hidden = true; } }, AVISO_VISIBLE_MS);
  };
  // El rótulo siempre dice lo que va a hacer el clic.
  const abre = () => instalada || (sinOferta && !pendiente);
  const seSabe = () => instalada || sabida; // con certeza; si no, «ya instalada» es solo lo usual
  const rotular = () => {
    const texto = ocupado ? TEXTOS.preparando : abre() ? TEXTOS.abrir : TEXTOS.instalar;
    for (const b of botones) {
      (b.querySelector('[data-rotulo]') ?? b).textContent = texto;
      b.setAttribute('aria-busy', String(ocupado));
    }
    doc.documentElement.classList.toggle('instalable', Boolean(pendiente));
    doc.documentElement.classList.toggle('abre-app', !ocupado && abre());
    const yaEsta = abre() && info.instala;
    const estado = seSabe() ? TEXTOS.notaInstalada : TEXTOS.notaSinOferta;
    if (nota) nota.textContent = yaEsta ? estado : info.nota;
    // Junto a los botones de la portada: que no parezca que instalar falló.
    for (const e of estados) {
      (e.querySelector('[data-estado-texto]') ?? e).textContent = yaEsta ? estado : '';
      e.hidden = !yaEsta;
    }
  };

  // Deja el app shell guardado para que la app instalada abra sin conexión desde la primera vez.
  const prepararSinConexion = () => {
    if (!('serviceWorker' in nav) || esLocal(ventana.location.hostname)) return;
    nav.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  };

  // Lo único que se muestra cuando el botón no puede instalar: una frase con el gesto y la app a un clic.
  // conOferta: la oferta llegó con la hoja abierta (en el teléfono puede tardar); la hoja deja de pedir un gesto
  // y ofrece instalar con un toque.
  const llenarHoja = (conOferta) => {
    dialogo.querySelector('[data-guia-titulo]').textContent = conOferta ? TEXTOS.hojaLista : info.titulo;
    dialogo.querySelector('[data-guia-gesto]').textContent = conOferta ? TEXTOS.hojaListaGesto : info.gesto;
    const detalle = dialogo.querySelector('[data-guia-detalle]');
    detalle.textContent = conOferta ? '' : info.detalle ?? '';
    detalle.hidden = conOferta || !info.detalle;
    dialogo.querySelector('[data-guia-icono]').hidden = conOferta || info.compartir !== true;
    const instalar = dialogo.querySelector('[data-guia-instalar]');
    if (instalar) instalar.hidden = !conOferta;
    const abrirAhora = dialogo.querySelector('[data-guia-abrir]');
    if (abrirAhora) abrirAhora.hidden = conOferta;
  };
  const guiar = () => {
    if (!dialogo) return;
    llenarHoja(false);
    hojaAbierta = true;
    if (typeof dialogo.showModal === 'function') dialogo.showModal(); else dialogo.setAttribute('open', '');
  };
  const cerrarHoja = () => { hojaAbierta = false; dialogo?.close?.(); };

  // Dentro de la app, o donde no se instala, se abre aquí mismo. En otra ventana, Chrome y Edge la abren en la suya
  // si está instalada (y en una pestaña nueva si no lo está).
  const abrir = () => {
    if (esLaApp() || !info.instala) { alNavegar('/'); return; }
    abrirAparte('/');
    decir(seSabe() ? TEXTOS.abiertaInstalada : TEXTOS.abiertaSinOferta);
  };

  const ofrecer = async () => {
    const oferta = pendiente;
    pendiente = null; // cada oferta sirve una vez; si la persona cancela, el navegador entrega otra
    rotular();
    try {
      await oferta.prompt();
      const { outcome } = await oferta.userChoice;
      if (outcome === 'accepted') { decir(TEXTOS.instalando); prepararSinConexion(); } else { cancelada = true; decir(TEXTOS.cancelada); }
    } catch {
      guiar();
    }
  };

  const instalarConApi = async () => {
    try {
      await nav.install(); // instala o, si ya estaba instalada, el navegador ofrece abrirla
      instalada = true;
      marcar(true);
      rotular();
      prepararSinConexion();
    } catch (error) {
      if (error?.name === 'AbortError') { cancelada = true; decir(TEXTOS.cancelada); return; }
      apiFallo = true;
      guiar();
    }
  };

  // Tras un clic sin oferta: se espera un momento a que el navegador la entregue, sin perder el clic.
  const esperarOferta = () => new Promise((resolver) => {
    const fin = (llego) => {
      const i = enEspera.indexOf(fin);
      if (i < 0) return;
      enEspera.splice(i, 1);
      resolver(llego);
    };
    enEspera.push(fin);
    despues(() => fin(false), ESPERA_OFERTA_MS);
  });

  // Chrome y Edge de escritorio pasan esta pestaña a la ventana de la app al instalar: se entra a la app sin otro clic.
  const entrarSiEsLaApp = () => {
    if (!recien || !esLaApp()) return;
    recien = false;
    alNavegar('/');
  };

  ventana.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault(); // se guarda para ofrecerlo cuando la persona pulse el botón
    pendiente = ev;
    sinOferta = false;
    sabida = false; // el navegador ofrece instalarla: ya no está instalada
    marcar(false);
    rotular();
    if (hojaAbierta) llenarHoja(true);
    for (const fin of [...enEspera]) fin(true);
  });
  ventana.addEventListener('appinstalled', () => {
    pendiente = null;
    instalada = true;
    sinOferta = false;
    recien = true;
    marcar(true);
    rotular();
    decir(TEXTOS.instalada);
    cerrarHoja();
    prepararSinConexion();
    entrarSiEsLaApp();
    despues(entrarSiEsLaApp, 900);
  });
  modoApp?.addEventListener?.('change', entrarSiEsLaApp);
  // La app, al abrirse en su propia ventana, deja la marca: lo que se presumía pasa a saberse.
  ventana.addEventListener('storage', (ev) => {
    if (ev?.key !== CLAVE_INSTALADA) return;
    sabida = leerMarca();
    if (sabida && !pendiente) sinOferta = true;
    rotular();
    if (sabida && dicho === TEXTOS.abiertaSinOferta) decir(TEXTOS.abiertaInstalada);
  });

  const alPulsar = async () => {
    if (ocupado) return;
    decir('');
    if (instalada || (sabida && !pendiente)) { abrir(); return; }
    if (pendiente) { await ofrecer(); return; }
    if (tieneApi && !apiFallo) { await instalarConApi(); return; }
    if (info.oferta && !sinOferta && !cancelada) {
      ocupado = true;
      rotular();
      const llego = await esperarOferta();
      ocupado = false;
      if (llego) { await ofrecer(); return; }
      if (info.escritorio) sinOferta = true;
      rotular();
    }
    if (sinOferta) { abrir(); return; }
    guiar();
  };
  for (const b of botones) b.addEventListener('click', alPulsar);
  for (const b of dialogo?.querySelectorAll('[data-cerrar]') ?? []) b.addEventListener('click', cerrarHoja);
  // Un clic en el fondo de la hoja la cierra.
  dialogo?.addEventListener('click', (ev) => { if (ev.target === dialogo) cerrarHoja(); });
  dialogo?.addEventListener('close', () => { hojaAbierta = false; });
  dialogo?.querySelector('[data-guia-instalar]')?.addEventListener('click', () => { cerrarHoja(); return alPulsar(); });

  // En computadora, si el navegador no ofreció instalar al poco de cargar, el botón pasa a abrir la app.
  if (info.oferta && info.escritorio && !tieneApi && !instalada && !sabida) {
    const vencer = () => despues(() => {
      if (pendiente || cancelada || instalada || ocupado) return;
      sinOferta = true;
      rotular();
    }, GRACIA_MS);
    if (doc.readyState === 'complete') vencer(); else ventana.addEventListener('load', vencer, { once: true });
  }

  rotular();
  return { navegador, estaInstalada: () => instalada, hayOferta: () => Boolean(pendiente), abre, seSabe };
}
