// Punto de entrada: renderizado y eventos.
import { uniq } from './core/utils.js';
import { S, demoFarm, emptyFarm, blankDrafts } from './core/state.js';
import { exportarTexto, importarTexto, guardarLocal, cargarLocal, configBase, cargarCasos, guardarCasos, normalizarFinca, configEfectiva, normalizarAjustes, respaldoDemasiadoGrande, MENSAJE_RESPALDO_GRANDE } from './core/storage.js';
import { guardado, TEXTO_AVISO } from './core/aviso-guardado.js';
import { viewDashboard, viewAuditoria, extraRiego } from './ui/dashboard.js';
import { grupoDe, subMenu } from './ui/grupos.js';
import { CONFIG } from './core/config.js';
import { viewWizard, STEPS, SECCIONES } from './ui/wizard.js';
import { aplicarRapido } from './core/rapido.js';
import { viewBienvenida, PASOS_BV } from './ui/bienvenida.js';
import { viewEntrar, htmlCuenta } from './ui/entrar.js';
import { leerCuenta, guardarCuenta, mostrarEntrada } from './core/cuenta.js';
import { mostrarBienvenida, guardarBienvenida, leerBienvenida } from './core/bienvenida.js';
import { viewTemplates } from './ui/templates.js';
import { viewSettings } from './ui/settings.js';
import { viewCasos } from './ui/casos.js';
import { montarMapa, reiniciarMapa, marcarSitioEnMapa, centrarMapa, ubicacionActual } from './ui/mapa.js';
import { descargarImagenPlan } from './ui/plan-imagen.js';
import { apiRadar } from './apiradar/diagnostico.js';
import { marcarManual } from './ui/clima.js';
import { llenarRiego } from './clima/normales.js';
import { producto, UNIDADES } from './fert/catalogo.js';
import { nombreCultivoPrincipal } from './casos/perfil.js';
import { casoAnonimo } from './casos/anonimo.js';
import { decidirAlEntrar, debeSubir, huella } from './nube/sincronia.js';
import { crearCliente, cargarSesion, guardarSesion, borrarSesion, sesionDeHash, necesitaRenovar, ErrorNube } from './nube/cliente.js';
import { riegoVacio } from './riego/calculo.js';
import { riegoInicial } from './riego/guardado.js';
import { normalizarPlag, plagBorrador, componenteVacio } from './plag/modelo.js';
import { desdeSag, alElegirIngrediente, alElegirFormulacion } from './plag/calculo.js';
import { ingrediente } from './plag/catalogo.js';
import { crearCargador, conIntento } from './core/carga-diferida.js';
import { crearGuardado } from './core/guardado-diferido.js';
import { anunciar } from './ui/avisos.js';
import { htmlErrorVista } from './ui/error-vista.js';
import { selectorDeFoco, controlParaFoco } from './ui/foco.js';

// Recupera lo último guardado en este navegador (finca, ajustes, plantillas, plan y tema).
const previo = cargarLocal(S.tpl);
if (previo) Object.assign(S, previo);
S.casos = cargarCasos();
// Primera vez en este navegador: la bienvenida va antes del dashboard (solo una vez).
if (mostrarBienvenida(!!previo)) S.view = 'bienvenida';

// Nube (opcional): si falta la configuración o la conexión, todo sigue en local.
const nube = crearCliente();
const delHash = sesionDeHash(location.hash); // al volver del enlace del correo
if (delHash) { guardarSesion(delHash); history.replaceState(null, '', location.pathname + location.search); }
S.nube.sesion = delHash || cargarSesion();
// Pantalla de entrada: al volver de Google o del correo se va directo al tablero y se recuerda la cuenta.
S.cuenta = leerCuenta();
if (delHash) {
  S.cuenta = { email: delHash.email, proveedor: delHash.proveedor, sinCuenta: false }; guardarCuenta(S.cuenta);
  if (S.view !== 'bienvenida') S.view = 'dashboard';
  S.msg = `Sesión iniciada como ${delHash.email || 'tu cuenta'}.`;
} else if (S.nube.sesion && !S.cuenta.email) {
  // Sesiones abiertas antes de esta pantalla: se recuerda la cuenta para la próxima entrada.
  S.cuenta = { email: S.nube.sesion.email || '', proveedor: S.nube.sesion.proveedor || '', sinCuenta: false }; guardarCuenta(S.cuenta);
} else if (mostrarEntrada({ nubeActiva: nube.activo, sesion: S.nube.sesion, vista: S.view, cuenta: S.cuenta })) S.view = 'entrar';
// Sesión lista para usarse: si el token está por vencer, se renueva con el de renovación (una sola renovación a la vez).
let renovando = null;
function sesionLista() {
  const n = S.nube;
  if (!n.sesion || !necesitaRenovar(n.sesion)) return Promise.resolve(n.sesion);
  renovando ??= nube.renovarSesion(n.sesion).then((s) => { guardarSesion(s); n.sesion = s; return s; }).finally(() => { renovando = null; });
  return renovando;
}

function applyTheme(){const r=document.documentElement;if(S.theme==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',S.theme);
}
// Guardado en el navegador con espera: tras ~500 ms sin cambios y siempre al ocultar o cerrar la página (issue 49).
const guardador=crearGuardado(()=>{guardarLocal(S);anunciar(avisoGuardado());if(S.nube.sesion)subidor.pedir();});
// Con sesión iniciada, la finca también se sube sola a la nube unos segundos después del último cambio.
const subidor=crearGuardado(()=>{subirSola();},{espera:4000});
async function subirSola(){
  const n=S.nube;
  if(!nube.activo||!debeSubir({sesion:n.sesion,listo:n.listo,local:S.farm,demo:S.demo,conflicto:n.conflicto,ultima:n.ultima}))return;
  try{const ses=await sesionLista();if(!ses)return;const h=huella(S.farm);await nube.guardarFinca(S.farm,ses);n.ultima=h;n.estado='Guardada en la nube.';}
  catch(err){if(err instanceof ErrorNube&&err.estado===401){borrarSesion();n.sesion=null;}n.estado='No se pudo subir a la nube; se reintentará con el próximo cambio.';}
  if(S.view==='casos')render();
}
// Al entrar (o abrir la app con sesión) se compara la finca de este navegador con la de la nube.
async function sincronizarAlEntrar(){
  const n=S.nube;
  try{
    const ses=await sesionLista();if(!ses)return;
    const enNube=await nube.cargarFinca(ses);
    const paso=decidirAlEntrar({local:S.farm,demo:S.demo,enNube});
    if(paso==='cargar'){S.farm=enNube;S.demo=false;S.done={};n.ultima=huella(enNube);S.msg=`Se cargó tu finca "${enNube.nombre||'sin nombre'}" desde la nube.`;}
    else if(paso==='conflicto'){n.conflicto=true;n.ultima=huella(enNube);}
    else if(paso==='nada'&&enNube)n.ultima=huella(enNube);
    n.listo=true;
    if(paso==='subir')subidor.pedir();
  }catch(err){if(err instanceof ErrorNube&&err.estado===401){borrarSesion();n.sesion=null;}}
  render();
}
addEventListener('pagehide',()=>guardador.ahora());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')guardador.ahora();});
// Aviso fijo arriba de la vista mientras el navegador no deje guardar (el último intento manda).
// Devuelve el texto solo cuando el aviso aparece por primera vez, para anunciarlo una vez y no en cada redibujado.
let avisoVisible=false;
function avisoGuardado(){const app=document.getElementById('app');if(!app)return'';app.querySelector('#aviso-guardado')?.remove();
  const visible=guardado.fallo&&!guardado.descartado;
  if(visible)app.insertAdjacentHTML('afterbegin',`<div class="notice" id="aviso-guardado"><span>${TEXTO_AVISO}</span><button class="btn sm" data-act="export">Exportar finca</button><button class="btn sm" data-act="guardado-ok">Entendido</button></div>`);
  const nuevo=visible&&!avisoVisible;avisoVisible=visible;return nuevo?TEXTO_AVISO:'';}
function getRef(path){const p=path.split('.');let o=S;for(let i=0;i<p.length-1;i++)o=o[p[i]];return[o,p[p.length-1]];}
// Vistas que se descargan la primera vez que se abren; las demás vienen con la página.
const VISTAS={bienvenida:viewBienvenida,entrar:viewEntrar,dashboard:viewDashboard,auditoria:viewAuditoria,wizard:viewWizard,plantillas:viewTemplates,casos:viewCasos,ajustes:viewSettings};
const cargador=crearCargador({
  riego:(i)=>import(conIntento('./ui/riego.js',i)).then(m=>m.viewRiego),
  fertilizacion:(i)=>import(conIntento('./ui/fertilizacion.js',i)).then(m=>m.viewFertilizacion),
  plaguicidas:(i)=>import(conIntento('./ui/plaguicidas.js',i)).then(m=>m.viewPlaguicidas),
},{alCambiar:(nombre)=>{if(S.view===nombre)render();}});
const htmlCargando=(fallo)=>fallo
  ?'<div class="notice" role="alert"><span>No se pudo descargar esta pestaña. Revisa la conexión.</span><button class="btn sm" data-act="reintentar-vista">Reintentar</button></div>'
  :'<p class="muted" aria-busy="true">Cargando…</p>';
function render(){
  // Conserva el foco y el cursor del control que se estaba usando (campo, botón de mes, simulador o acción de fila).
  const app=document.getElementById('app');
  const ae=document.activeElement;const sel=app&&app.contains(ae)?selectorDeFoco(ae):null;let ss=null;try{ss=ae&&ae.selectionStart;}catch(e){}
  const vista=cargador.incluye(S.view)?cargador.vista(S.view):(VISTAS[S.view]||viewDashboard);
  if(!vista)cargador.pedir(S.view);
  let html;
  try{html=vista?vista():htmlCargando(cargador.fallo(S.view));}catch(e){console.error(e);html=htmlErrorVista(S.view,e);}
  app.innerHTML=subMenu(S.view)+html;
  const msg=S.msg;S.msg='';
  document.body.classList.toggle('en-bienvenida',S.view==='bienvenida'||S.view==='entrar');
  const cta=document.getElementById('cuenta');if(cta)cta.innerHTML=htmlCuenta();
  const grupo=grupoDe(S.view)?.id;document.querySelectorAll('nav.tabs button').forEach(b=>b.setAttribute('aria-current',b.dataset.grupo===grupo?'page':'false'));
  montarMapa();applyTheme();guardador.pedir();anunciar([msg,avisoGuardado()].filter(Boolean).join(' '));
  const el=controlParaFoco(app,sel);if(el){el.focus({preventScroll:true});try{if(ss!=null)el.setSelectionRange(ss,ss);}catch(e){}}
}
const DRAFTS={cultivos:'draftCult',especies:'draftEsp',plagas:'draftPlaga',cultivosAledanos:'draftVecino'};
// Pestaña Plaguicidas: el formulario edita una copia; la aplicación queda en la lista hasta guardar los cambios.
const alFormPlag=()=>queueMicrotask(()=>document.getElementById('plag-form')?.scrollIntoView({block:'start'}));
const limpiarPlag=()=>{S.draftPlag=plagBorrador();S.plagEdit=null;S.plagNotas=[];};
const aBorrador=(x)=>{const d={...plagBorrador(),...structuredClone(x)};if(!d.componentes.length)d.componentes=[componenteVacio()];
  d.grupoAuto=!d.grupo;d.usoAuto=!d.uso;return d;}; // lo ya guardado se respeta al cambiar de ingrediente
// Acciones de los botones con data-act. Cada una recibe el botón pulsado `a` y la finca `f`.
// Al terminar, el manejador de clics vuelve a dibujar la pantalla; una acción que devuelve `false`
// (porque no cambió nada o porque ya dibujó o delega en otra función) evita ese dibujo.
const ACCIONES_QUE_SUBEN = new Set(['next', 'prev', 'finish', 'rapido-listo', 'wiz-modo', 'wiz-paso', 'start-empty', 'load-demo', 'reset-yes',
  'bv-siguiente', 'bv-atras', 'bv-saltar', 'bv-cuestionario', 'bv-saltar-cuestionario', 'bv-ver']);

const accionesGenerales = {
  'guardado-ok': () => { guardado.descartado = true; },
  'reintentar-vista': () => { cargador.reintentar(S.view); },
  'reset-ajustes': () => { S.ajustes = configBase(); },
  'toggle-mod': (a) => {
    const id = a.dataset.id, on = S.ajustes.modulosActivos;
    S.ajustes.modulosActivos = on.includes(id) ? on.filter((x) => x !== id) : [...on, id];
  },
  'vista-tecnica': () => { S.vistaTecnica = !S.vistaTecnica; },
  'sim-reset': () => { Object.keys(S.sim).forEach((k) => { S.sim[k] = false; }); },
  'reset': () => { S.confirmReset = true; },
  'reset-no': () => { S.confirmReset = false; },
  'reset-yes': () => {
    reiniciarMapa(); S.farm = emptyFarm(); S.demo = false; S.done = {}; S.tpl.rows = []; S.riego = riegoInicial();
    S.confirmReset = false; S.view = 'wizard'; S.step = 0; S.wizModo = 'rapido'; S.ioMsg = 'Datos borrados.';
  },
  'io-copy': () => {
    const txt = exportarTexto(S.farm, S.ajustes, S.tpl); S.io = txt; render();
    const box = document.getElementById('io-box'), m = document.getElementById('io-msg');
    const sel = () => { if (box) { box.focus(); box.select(); } if (m) m.textContent = 'Respaldo seleccionado: cópialo con Ctrl+C.'; };
    try { navigator.clipboard.writeText(txt).then(() => { if (m) m.textContent = 'Respaldo copiado.'; }, sel); } catch (err) { sel(); }
    return false;
  },
  'io-load': () => {
    try {
      const r = importarTexto(S.io); S.farm = r.farm; S.ajustes = r.ajustes; if (r.tpl) S.tpl = r.tpl;
      S.demo = false; S.done = {}; S.io = ''; S.ioMsg = 'Respaldo cargado.';
    } catch (err) { S.ioMsg = `No se pudo cargar: ${err.message} Copia uno con "Copiar respaldo".`; }
  },
  'export': () => { descargar(); return false; },
  'import': () => { abrirArchivo(); return false; },
};

const accionesCuestionario = {
  'next': () => { S.step = Math.min(STEPS.length - 1, S.step + 1); },
  'prev': () => { S.step = Math.max(0, S.step - 1); },
  'finish': () => { S.view = 'dashboard'; },
  'wiz-paso': (a) => { S.wizModo = 'completo'; S.step = +a.dataset.step || 0; S.view = 'wizard'; },
  'rapido-opc': (a) => { S.rapido[a.dataset.k] = a.dataset.v; },
  'rapido-listo': () => { S.farm = aplicarRapido(S.farm, S.rapido); S.rapidoDe = S.farm; S.demo = false; S.view = 'dashboard'; },
  'wiz-modo': (a) => {
    if (S.rapido && S.rapidoDe === S.farm && a.dataset.v === 'completo') { S.farm = aplicarRapido(S.farm, S.rapido); S.rapidoDe = S.farm; }
    S.wizModo = a.dataset.v === 'completo' ? 'completo' : 'rapido'; S.view = 'wizard';
  },
  'start-empty': () => { reiniciarMapa(); S.farm = emptyFarm(); S.demo = false; S.done = {}; S.view = 'wizard'; S.step = 0; S.wizModo = 'rapido'; },
  'load-demo': () => {
    reiniciarMapa(); S.farm = demoFarm(); S.demo = true; S.done = {}; S.view = 'dashboard'; S.msg = 'Se cargó la finca de ejemplo.';
  },
  'cult-yes': (a, f) => { f.tieneCultivos = true; },
  'cult-no': (a, f) => { f.tieneCultivos = false; },
  'gg': (a, f) => { f.gg = a.dataset.v; },
  'rm': (a, f) => { f[a.dataset.list].splice(+a.dataset.i, 1); },
  'edit': (a, f) => {
    const l = a.dataset.list, i = +a.dataset.i;
    S[DRAFTS[l]] = { ...blankDrafts()[DRAFTS[l]], ...structuredClone(f[l][i]) }; f[l].splice(i, 1);
    if (l === 'especies') S.espSeccion = Object.keys(SECCIONES).find((k) => SECCIONES[k].tipos.includes(S.draftEsp.tipo)) || 'arboles';
  },
  'esp-seccion': (a) => {
    const sec = a.dataset.sec; S.espSeccion = sec;
    S.draftEsp = { ...blankDrafts().draftEsp, ...(sec ? { tipo: SECCIONES[sec].tipos[0] } : {}) };
  },
  'proposito': (a, f) => {
    const id = a.dataset.id; f.proposito = f.proposito.includes(id) ? f.proposito.filter((x) => x !== id) : [...f.proposito, id]; S.demo = false;
  },
  'add-vecino': (a, f) => {
    const d = S.draftVecino; if (!d.nombre.trim()) return false;
    f.cultivosAledanos.push({ nombre: d.nombre.trim(), distancia: d.distancia > 0 ? Number(d.distancia) : null });
    S.draftVecino = blankDrafts().draftVecino; S.demo = false;
  },
  'plaga-sug': (a, f) => {
    if (!f.plagas.some((p) => p.nombre === a.dataset.n)) f.plagas.push({ nombre: a.dataset.n, cultivo: a.dataset.c, meses: [], severidad: 'media' });
    S.demo = false;
  },
  'add-esp': (a, f) => {
    if (!S.draftEsp.nombre.trim()) return false;
    f.especies.push({ ...S.draftEsp, floracion: [...S.draftEsp.floracion] }); S.draftEsp = blankDrafts().draftEsp; S.espSeccion = '';
  },
  'add-plaga': (a, f) => {
    if (!S.draftPlaga.nombre.trim()) return false;
    f.plagas.push({ ...S.draftPlaga, meses: [...S.draftPlaga.meses] }); S.draftPlaga = blankDrafts().draftPlaga;
  },
  'add-cult': (a, f) => {
    if (!S.draftCult.nombre.trim()) return false;
    f.cultivos.push({ ...S.draftCult, ha: Number(S.draftCult.ha) || 0, siembra: [...S.draftCult.siembra], cosecha: [...S.draftCult.cosecha] });
    S.draftCult = blankDrafts().draftCult;
  },
  'add-nc': (a, f) => {
    if (!S.draftNC.criterio.trim()) return false;
    f.nc.push({ criterio: S.draftNC.criterio, dias: Number(S.draftNC.dias) || 0 }); S.draftNC = blankDrafts().draftNC;
  },
  'rm-nc': (a, f) => { f.nc.splice(+a.dataset.i, 1); },
};

// Bienvenida de primera vez. Al terminarla (con o sin cuestionario) queda marcada como vista.
// Con datos propios ya cargados (si se vuelve a ver desde Ajustes), nunca se borra la finca.
// La primera vez, si respondió algo, las respuestas se mandan anónimas a la nube (sin esperar ni avisar si falla).
const terminarBienvenida = () => {
  const primera = !leerBienvenida().vista, { fuente, usos } = S.bv;
  guardarBienvenida(S.bv); S.bv.paso = 0;
  if (primera && nube.activo && (fuente || usos.length)) nube.enviarBienvenida({ fuente, usos }).catch(() => {});
};
// Pantalla de entrada y menú de cuenta (src/ui/entrar.js).
const accionesCuenta = {
  'cuenta-menu': () => { S.cuentaMenu = !S.cuentaMenu; },
  'cuenta-entrar': () => { S.cuentaMenu = false; S.entrarCorreo = false; S.view = 'entrar'; },
  'tema-set': (a) => { S.theme = ['system', 'light', 'dark'].includes(a.dataset.tema) ? a.dataset.tema : 'system'; },
  'entrar-cuenta': () => {
    if (S.cuenta.proveedor === 'google') { nubeAccion('nube-google'); return false; }
    S.nube.email = S.cuenta.email; S.entrarCorreo = true;
  },
  'entrar-olvidar': () => { S.cuenta = { ...S.cuenta, email: '', proveedor: '' }; guardarCuenta(S.cuenta); },
  'entrar-correo': () => { S.entrarCorreo = true; },
  'entrar-sin-cuenta': () => { S.cuenta = { ...S.cuenta, sinCuenta: true }; guardarCuenta(S.cuenta); S.entrarCorreo = false; S.view = 'dashboard'; },
  'cuenta-salir': () => { S.cuentaMenu = false; S.confirmarSalir = true; },
  'salir-cancelar': () => { S.confirmarSalir = false; },
  'salir-confirmar': () => { S.confirmarSalir = false; nubeAccion('nube-salir'); return false; },
};
const accionesBienvenida = {
  'bv-siguiente': () => { S.bv.paso = Math.min(PASOS_BV.length - 1, S.bv.paso + 1); },
  'bv-atras': () => { S.bv.paso = Math.max(0, S.bv.paso - 1); },
  'bv-saltar': () => { S.bv.paso = PASOS_BV.length - 1; },
  'bv-fuente': (a) => { S.bv.fuente = S.bv.fuente === a.dataset.id ? '' : a.dataset.id; },
  'bv-uso': (a) => { const id = a.dataset.id, u = S.bv.usos; S.bv.usos = u.includes(id) ? u.filter((x) => x !== id) : [...u, id]; },
  'bv-cuestionario': () => {
    terminarBienvenida();
    if (S.demo) { reiniciarMapa(); S.farm = emptyFarm(); S.demo = false; S.done = {}; }
    S.view = 'wizard'; S.step = 0;
  },
  'bv-saltar-cuestionario': () => {
    terminarBienvenida(); S.view = 'dashboard';
    S.msg = S.demo ? 'Estás viendo una finca de ejemplo. Cuando quieras, llena tus datos en Mi finca.' : '';
  },
  'bv-ver': () => { S.bv = { ...leerBienvenida(), paso: 0 }; S.view = 'bienvenida'; },
};

const accionesPlantillas = {
  'rm-row': (a) => { S.tpl.rows.splice(+a.dataset.i, 1); },
  'add-row': () => {
    const d = S.draftRow; if (!d.fecha || d.valor === '' || isNaN(Number(d.valor))) return false;
    S.tpl.rows.push({ fecha: d.fecha, lote: d.lote || 'Sin lote', valor: Number(d.valor) }); S.draftRow = { fecha: '', lote: d.lote, valor: '' };
  },
  'paste': () => {
    const lines = S.tpl.paste.split(/\r?\n/).map((l) => l.trim()).filter(Boolean); let ok = 0, bad = 0;
    lines.forEach((l) => {
      const c = l.split(/\t|;|,/).map((x) => x.trim()); const val = Number((c[2] || '').replace(',', '.'));
      if (c.length >= 3 && !isNaN(val)) { S.tpl.rows.push({ fecha: c[0], lote: c[1], valor: val }); ok++; } else bad++;
    });
    S.tpl.paste = ''; render();
    const m = document.getElementById('paste-msg');
    if (m) m.textContent = `Se agregaron ${ok} filas${bad ? `; ${bad} no tenían el formato fecha, lote, valor` : ''}.`;
    return false;
  },
};

const accionesApiRadar = {
  'apiradar': (a) => {
    S.problema = a.dataset.p;
    // Animación de análisis (referencia: Astra AI). Con «reducir movimiento» se salta.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    S.arCargando = true;
    setTimeout(() => { S.arCargando = false; render(); }, CONFIG.apiradar.msAnalisis);
    queueMicrotask(() => document.getElementById('apiradar')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  },
  'apiradar-sitio': () => { marcarSitioEnMapa(); return false; },
  'apiradar-ir': (a) => { centrarMapa([+a.dataset.lat, +a.dataset.lon]); return false; },
  'apiradar-imagen': () => {
    const cfg = configEfectiva(normalizarAjustes(S.ajustes));
    const R = apiRadar(S.farm, cfg, extraRiego(), S.problema || 'spathodea', ubicacionActual(), S.arExcluir);
    descargarImagenPlan({ R, finca: S.farm, ubic: ubicacionActual(), cfg, hechas: S.done }).then((m) => { S.msg = m; render(); });
    return false;
  },
  'apiradar-imprimir': () => {
    document.body.classList.add('imprimir-ar');
    window.addEventListener('afterprint', () => document.body.classList.remove('imprimir-ar'), { once: true });
    window.print();
    return false;
  },
  'apiradar-cerrar': () => { S.problema = ''; },
  'apiradar-censo': () => {
    S.abiertos['mapa-arboles'] = true;
    queueMicrotask(() => { const c = document.getElementById('censo'); c?.scrollIntoView({ block: 'start' }); document.getElementById('censo-id')?.focus({ preventScroll: true }); });
  },
};

const accionesPlaguicidas = {
  'add-plag': (a, f) => {
    const d = S.draftPlag;
    if (!d.producto.trim()) { S.plagMsg = { nivel: 'error', texto: 'Escribe el nombre del producto.' }; document.getElementById('pq-prod')?.focus(); }
    else if (!d.meses.length) { S.plagMsg = { nivel: 'error', texto: 'Marca al menos un mes de aplicación.' }; }
    else {
      const x = normalizarPlag(d), ed = S.plagEdit != null && S.plagEdit < f.plaguicidas.length;
      if (ed) f.plaguicidas[S.plagEdit] = x; else f.plaguicidas.push(x);
      limpiarPlag();
      S.plagMsg = { nivel: 'ok', texto: ed ? `Se guardaron los cambios de ${x.producto}.` : `Se agregó ${x.producto}. Ya aparece en la tabla de aplicaciones; puedes registrar otra.` };
    }
  },
  'plag-edit': (a, f) => {
    const i = +a.dataset.i; if (!f.plaguicidas[i]) return false;
    S.draftPlag = aBorrador(f.plaguicidas[i]); S.plagEdit = i; S.plagNotas = []; alFormPlag();
  },
  'plag-dup': (a, f) => {
    const i = +a.dataset.i; if (!f.plaguicidas[i]) return false;
    S.draftPlag = { ...aBorrador(f.plaguicidas[i]), meses: [] }; S.plagEdit = null; S.plagNotas = [];
    S.plagMsg = { nivel: 'ok', texto: `Copia de ${f.plaguicidas[i].producto || 'la aplicación'} lista: marca los meses de la nueva aplicación y agrégala.` };
    alFormPlag();
  },
  'plag-cancel': () => { limpiarPlag(); },
  'plag-rm': (a, f) => {
    const i = +a.dataset.i; f.plaguicidas.splice(i, 1);
    if (S.plagEdit === i) limpiarPlag(); else if (S.plagEdit != null && S.plagEdit > i) S.plagEdit--;
  },
  'plag-add-comp': () => { if (S.draftPlag.componentes.length < 3) S.draftPlag.componentes.push(componenteVacio()); },
  'plag-rm-comp': (a) => {
    S.draftPlag.componentes.splice(+a.dataset.i, 1);
    if (!S.draftPlag.componentes.length) S.draftPlag.componentes.push(componenteVacio());
  },
  'plag-vol': (a) => { S.draftPlag.volumen = Number(a.dataset.v) || null; },
};

const accionesFertilizacion = {
  'fert-import': () => { importarFert(); return false; },
  'fert-plantilla': () => {
    import(conIntento('./fert/extraer.js', intentoPlantilla)).then(
      (m) => bajar(m.PLANTILLA_CSV, 'plantilla-fertilizacion.csv', 'text/csv;charset=utf-8'),
      () => { intentoPlantilla++; S.msg = 'No se pudo descargar la plantilla. Revisa la conexión.'; render(); },
    );
    return false;
  },
  'fert-unidad': (a) => { S.fertUnidad = UNIDADES[a.dataset.u] ? a.dataset.u : 'kgha'; },
  'add-fert': (a, f) => {
    const d = S.draftFert, dos = Number(d.dosis);
    if (!(dos > 0)) { S.msg = 'Escribe una dosis mayor que cero.'; render(); return false; }
    const g = producto(d.producto), otro = g.id === 'otro', pct = (x) => Math.min(100, Math.max(0, Number(x) || 0));
    f.fertPlan.push({
      mes: Number(d.mes) || 0, producto: g.id, n: otro ? pct(d.n) : g.n, p: otro ? pct(d.p) : g.p, k: otro ? pct(d.k) : g.k,
      dosis: dos * UNIDADES[S.fertUnidad].aKgHa, metodo: d.metodo,
    });
    f.fertPlan.sort((x, y) => x.mes - y.mes); S.draftFert = { ...d, dosis: '' }; S.demo = false;
  },
  'rm-fert': (a, f) => { f.fertPlan.splice(+a.dataset.i, 1); S.demo = false; },
  'edit-fert': (a, f) => {
    const x = f.fertPlan.splice(+a.dataset.i, 1)[0];
    S.draftFert = { mes: x.mes, producto: x.producto, n: x.n, p: x.p, k: x.k, dosis: +(x.dosis / UNIDADES[S.fertUnidad].aKgHa).toFixed(2), metodo: x.metodo };
  },
};

const accionesCasos = {
  'caso-guardar': (a, f) => {
    const finca = normalizarFinca(structuredClone(f)); const cult = nombreCultivoPrincipal(finca);
    S.casos.push({ id: 'propio-' + Date.now().toString(36), origen: S.demo ? 'ejemplo' : 'propio', etiqueta: `${finca.nombre || 'Finca sin nombre'}${cult ? ' · ' + cult : ''}`, guardado: new Date().toISOString(), finca });
    S.msg = guardarCasos(S.casos) ? `Caso guardado. La memoria tiene ${S.casos.length} caso(s) tuyos.` : 'El caso quedó en esta sesión, pero el navegador no permitió guardarlo.';
  },
  'caso-rm': (a) => { S.casos = S.casos.filter((c) => c.id !== a.dataset.id); guardarCasos(S.casos); S.msg = 'Caso quitado de la memoria.'; },
};

const accionesRiego = {
  'riego-import': () => { importarRiego(); return false; },
  'riego-ejemplo': () => { S.riego = riegoInicial(); },
  'riego-blanco': () => {
    S.riego = { datos: riegoVacio(), fuente: 'manual', archivo: '', origen: {}, declarados: {}, faltan: [], omitidas: [] }; climaARiego();
  },
  'riego-add-suelo': () => {
    S.riego.datos.suelo.push({ nombre: `Parte ${S.riego.datos.suelo.length + 1}`, area: null, textura: '', da: null, cc: null, pmp: null, pedregosidad: null, infiltracion: null });
  },
  'riego-rm-suelo': (a) => { S.riego.datos.suelo.splice(+a.dataset.i, 1); },
  'riego-add-tramo': () => {
    const p = S.riego.datos.hidraulica.principal; p.push({ nombre: String(p.length + 1), caudal: null, largo: null, di: null, c: 140 });
  },
  'riego-rm-tramo': (a) => { S.riego.datos.hidraulica.principal.splice(+a.dataset.i, 1); },
};

const ACCIONES = {
  ...accionesGenerales, ...accionesBienvenida, ...accionesCuestionario, ...accionesApiRadar, ...accionesPlaguicidas,
  ...accionesFertilizacion, ...accionesCasos, ...accionesRiego, ...accionesPlantillas, ...accionesCuenta,
};

document.addEventListener('click',e=>{
  // El menú de cuenta se cierra al tocar fuera de él o al elegir algo (menos el tema, que se ve al instante).
  if(S.cuentaMenu&&!e.target.closest('[data-act="cuenta-menu"],[data-act="tema-set"]')){S.cuentaMenu=false;if(!e.target.closest('[data-act],[data-view]')){render();return;}}
  // Secciones plegables con data-keep: se recuerda lo que el usuario abrió o cerró (el navegador hace el cambio).
  const su=e.target.closest('summary');if(su&&su.parentElement.dataset.keep){S.abiertos[su.parentElement.dataset.keep]=!su.parentElement.open;return;}
  const v=e.target.closest('[data-view]');if(v){if(S.climaUI.estado==='ok')S.climaUI={estado:'',msg:'',llenos:[]};S.view=v.dataset.view;render();window.scrollTo(0,0);return;}
  const st=e.target.closest('[data-step]');if(st){S.step=+st.dataset.step;render();return;}
  const ap=e.target.closest('[data-arplan]');if(ap){S.arExcluir[ap.dataset.arplan]=!S.arExcluir[ap.dataset.arplan];render();return;}
  const sm=e.target.closest('[data-sim]');if(sm&&!sm.disabled){S.sim[sm.dataset.sim]=!S.sim[sm.dataset.sim];render();return;}
  const mb=e.target.closest('[data-month]');if(mb){S.plagMsg=null;const[o,k]=getRef(mb.dataset.path);const i=+mb.dataset.month;o[k]=o[k].includes(i)?o[k].filter(x=>x!==i):uniq([...o[k],i]);render();return;}
  const a=e.target.closest('[data-act]');if(!a)return;const act=a.dataset.act;
  S.ioMsg='';S.plagMsg=null;
  if(act.startsWith('nube-')){nubeAccion(act);return;}
  // Una acción sin función asociada solo vuelve a dibujar, como antes.
  if(Object.hasOwn(ACCIONES,act)&&ACCIONES[act](a,S.farm)===false)return;
  render();if(ACCIONES_QUE_SUBEN.has(act))window.scrollTo(0,0);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(S.cuentaMenu||S.confirmarSalir)){S.cuentaMenu=false;S.confirmarSalir=false;render();}});
function bindValue(el){const[o,k]=getRef(el.dataset.bind);
  if('lines' in el.dataset)o[k]=el.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,30);
  else if(el.type==='checkbox')o[k]=el.checked;else if(el.type==='number')o[k]=el.value===''?('nullable' in el.dataset?null:0):Number(el.value);else if(el.tagName==='SELECT'&&el.value===''&&'nullable' in el.dataset)o[k]=null;else o[k]=el.value;
  if(el.dataset.bind.startsWith('farm.'))S.demo=false;}
document.addEventListener('input',e=>{if(e.target.dataset&&e.target.dataset.bind){bindValue(e.target);guardador.pedir();}});
document.addEventListener('change',e=>{const el=e.target;
  if(el.dataset&&el.dataset.done!==undefined){S.done[el.dataset.done]=el.checked;render();return;}
  if(!el.dataset||!el.dataset.bind)return;bindValue(el);
  cambioPlag(el.dataset.bind,el.value);marcarManual(el.dataset.bind);
  const vuelve=el.tagName==='SELECT'||'rerender' in el.dataset||['farm.area','farm.areaProd','farm.nAplicado','farm.nObjetivo'].includes(el.dataset.bind);
  if(vuelve)queueMicrotask(render);}); // diferido: el cambio puede llegar durante un blur
// Pestaña Plaguicidas: lo que se llena solo al elegir un producto del cuadro SAG o un ingrediente del catálogo.
function cambioPlag(bind,v){
  if(bind==='draftPlag.sag'){const r=desdeSag(S.draftPlag,v===''?null:Number(v));S.draftPlag=r.borrador;S.plagNotas=r.notas;}
  else if(bind==='draftPlag.enfermedad')S.draftPlag.enfermedad=v===''?null:Number(v);
  else if(bind==='draftPlag.grupo')S.draftPlag.grupoAuto=!v.trim(); // escrito por el usuario: ya no se reemplaza
  else if(bind==='draftPlag.uso')S.draftPlag.usoAuto=!v;
  else if(bind==='draftPlag.formulacion'){const r=alElegirFormulacion(S.draftPlag);if(r){S.draftPlag=r.borrador;S.plagNotas=r.notas;}}
  else if(bind==='draftPlag.dosis'||bind==='draftPlag.dosisUnidad')S.draftPlag.dosisDeTabla=false; // la escribió el usuario
  else if(/^draftPlag\.componentes\.\d+\.ia$/.test(bind)){
    const c=S.draftPlag.componentes[+bind.split('.')[2]];
    if(c&&ingrediente(c.ia)){c.nombre='';c.dl50=null;c.mayor=false;}
    S.draftPlag=alElegirIngrediente(S.draftPlag);}
}
// Riego nuevo o leído de un archivo: lo que quedó vacío se llena con el clima de la ubicación (Issue #8).
function climaARiego(){const ll=llenarRiego(S.riego.datos,S.farm.clima);S.climaUI=ll.length?{estado:'ok',msg:'Se usó el clima de tu ubicación.',llenos:ll}:{estado:'',msg:'',llenos:[]};}
// La descarga del clima y el mapa piden volver a dibujar cuando terminan.
document.addEventListener('biogap:render',()=>render());
applyTheme();render();
if(nube.activo&&S.nube.sesion)sincronizarAlEntrar(); // renueva la sesión al abrir y compara la finca con la de la nube
addEventListener('online',()=>{
  if(!nube.activo||!S.nube.sesion)return;
  if(S.nube.listo)subidor.pedir();else sincronizarAlEntrar();
}); // al volver la conexión, compara o sube los cambios locales pendientes
if(nube.activo)nubeAccion('nube-comunidad',true); // casos de la comunidad: lectura pública, sin sesión

// Exportar e importar la finca como archivo JSON.
function nombreArchivo(){const base=(S.farm.nombre||'finca').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase()||'finca';return `trofaxis-${base}.json`;}
function descargar(){
  const blob=new Blob([exportarTexto(S.farm,S.ajustes,S.tpl)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');
  link.href=url;link.download=nombreArchivo();document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  S.msg=`Se descargó ${nombreArchivo()}.`;render();
}
function abrirArchivo(){
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
  input.addEventListener('change',async()=>{
    const file=input.files&&input.files[0];if(!file)return;
    try{
      if(respaldoDemasiadoGrande(file.size))throw new Error(MENSAJE_RESPALDO_GRANDE);
      const {farm,ajustes,tpl}=importarTexto(await file.text());
      S.farm=farm;S.ajustes=ajustes;if(tpl)S.tpl=tpl;S.demo=false;S.done={};S.view='dashboard';
      S.msg=`Se importó la finca "${farm.nombre||'sin nombre'}".`;
    }catch(err){S.msg=`No se pudo importar: ${err.message}`;}
    render();
  });
  input.click();
}

// Descarga un texto como archivo.
function bajar(texto,nombre,tipo){const url=URL.createObjectURL(new Blob(['\ufeff'+texto],{type:tipo}));const l=document.createElement('a');l.href=url;l.download=nombre;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

// Lectores de .xlsx y .csv y el extractor de cada área: se descargan al elegir un archivo.
class ErrorCarga extends Error{}
let intentoLectores=0,intentoPlantilla=0;
async function lectores(extractor){
  const i=intentoLectores;
  try{const[x,c,e]=await Promise.all([import(conIntento('./riego/xlsx.js',i)),import(conIntento('./riego/csv.js',i)),extractor(i)]);
    return{leerXlsx:x.leerXlsx,ErrorLectura:x.ErrorLectura,leerCsv:c.leerCsv,...e};}
  catch(err){intentoLectores++;throw new ErrorCarga('no se pudo descargar el lector de archivos. Revisa la conexión y vuelve a intentarlo.');}
}
const mensajeLectura=(err,L)=>err instanceof ErrorCarga||(L&&err instanceof L.ErrorLectura)?err.message:'el archivo está dañado o no es compatible.';

// Importar el plan de fertilización desde Excel (.xlsx) o CSV. Nada sale del navegador.
function importarFert(){
  const input=document.createElement('input');input.type='file';input.accept='.xlsx,.csv,.txt';
  input.addEventListener('change',async()=>{
    const file=input.files&&input.files[0];if(!file)return;const nombre=file.name.toLowerCase();let L=null;
    try{
      L=await lectores((i)=>import(conIntento('./fert/extraer.js',i)));const{ErrorLectura,leerXlsx,leerCsv,extraerFert}=L;
      if(file.size>LIMITE_ARCHIVO)throw new ErrorLectura('El archivo pesa más de 100 MB.');
      let libro;
      if(nombre.endsWith('.xlsx'))libro=await leerXlsx(await file.arrayBuffer());
      else if(nombre.endsWith('.csv')||nombre.endsWith('.txt'))libro=leerCsv(await file.text(),file.name);
      else if(nombre.endsWith('.xls'))throw new ErrorLectura('Es un Excel antiguo (.xls): guárdalo como .xlsx o CSV y vuelve a cargarlo.');
      else throw new ErrorLectura('Formato no reconocido: usa .xlsx o .csv.');
      const x=extraerFert(libro);
      if(!x.hoja)throw new ErrorLectura('No encontré una fila de encabezados con "Producto" y "Dosis". Usa la plantilla como guía.');
      if(!x.plan.length)throw new ErrorLectura(`Encontré los encabezados en "${x.hoja}", pero ninguna fila se pudo leer.${x.omitidas[0]?' Fila '+x.omitidas[0].fila+': '+x.omitidas[0].motivo:''}`);
      S.farm.fertPlan=x.plan;S.demo=false;S.fertImport={archivo:file.name,hoja:x.hoja,omitidas:x.omitidas,avisos:x.avisos};S.view='fertilizacion';
      S.msg=`Se leyeron ${x.plan.length} aplicaciones de ${file.name}${x.omitidas.length?`; ${x.omitidas.length} fila(s) no se pudieron leer`:''}.`;
    }catch(err){S.msg=`No se pudo leer ${file.name}: ${mensajeLectura(err,L)}`;}
    render();
  });
  input.click();
}

// Importar datos de riego desde Excel (.xlsx) o CSV. Nada sale del navegador.
const LIMITE_ARCHIVO=100*1024*1024;
function importarRiego(){
  const input=document.createElement('input');input.type='file';input.accept='.xlsx,.xlsm,.csv,.txt';
  input.addEventListener('change',async()=>{
    const file=input.files&&input.files[0];if(!file)return;
    const nombre=file.name.toLowerCase();let L=null;
    try{
      L=await lectores((i)=>import(conIntento('./riego/extraer.js',i)));const{ErrorLectura,leerXlsx,leerCsv,extraerRiego}=L;
      if(file.size>LIMITE_ARCHIVO)throw new ErrorLectura('El archivo pesa más de 100 MB.');
      let libro;
      if(nombre.endsWith('.xlsx')||nombre.endsWith('.xlsm'))libro=await leerXlsx(await file.arrayBuffer());
      else if(nombre.endsWith('.csv')||nombre.endsWith('.txt'))libro=leerCsv(await file.text(),file.name);
      else if(nombre.endsWith('.xls'))throw new ErrorLectura('Es un Excel antiguo (.xls): guárdalo como .xlsx o CSV y vuelve a cargarlo.');
      else throw new ErrorLectura('Formato no reconocido: usa .xlsx, .xlsm o .csv.');
      const x=extraerRiego(libro);
      const encontrados=Object.keys(x.origen).length;
      if(!encontrados&&x.declarados.noRevisa?.length)throw new ErrorLectura(`el archivo trae ${x.declarados.noRevisa.join(' y ')}, y la app todavía no lee esas tablas del archivo. Copia los datos en las secciones Hidráulica y Reservorio de la pestaña Riego.`);
      if(!encontrados)throw new ErrorLectura('No se reconoció ningún dato de riego. Revisa que las etiquetas estén junto a sus valores, o escríbelos a mano.');
      S.riego={datos:x.datos,fuente:'archivo',archivo:file.name,origen:x.origen,declarados:x.declarados,faltan:x.faltan,omitidas:libro.omitidas||[]};climaARiego();
      S.view='riego';
      S.msg=`Se leyeron ${encontrados} datos de ${file.name}.`;
    }catch(err){S.msg=`No se pudo leer ${file.name}: ${mensajeLectura(err,L)}`;}
    render();
  });
  input.click();
}

// Acciones de la nube. Cada una avisa con un mensaje y nunca rompe la app si no hay conexión.
async function nubeAccion(act,silenciosa=false){
  const n=S.nube;if(n.ocupado)return;n.ocupado=true;if(!silenciosa)render();
  try{
    const ses=['nube-guardar','nube-cargar','nube-compartir','nube-retirar'].includes(act)?await sesionLista():null;
    if(['nube-guardar','nube-cargar','nube-compartir','nube-retirar'].includes(act)&&!ses)throw new ErrorNube('Inicia sesión para usar la nube.');
    if(act==='nube-google'){n.ocupado=false;location.assign(nube.urlGoogle(location.origin+location.pathname));return;}
    if(act==='nube-enlace'){
      const email=n.email.trim();if(!/^\S+@\S+\.\S+$/.test(email))throw new ErrorNube('Escribe un correo válido.');
      await nube.enviarEnlace(email,location.origin+location.pathname);S.msg=`Te enviamos un enlace a ${email}. Ábrelo en este navegador para iniciar sesión.`;}
    else if(act==='nube-salir'){borrarSesion();n.sesion=null;n.consentimiento=false;n.listo=false;n.conflicto=false;n.ultima='';n.estado='';S.entrarCorreo=false;S.view='entrar';S.msg='Sesión cerrada.';}
    else if(act==='nube-guardar'){const h=huella(S.farm);await nube.guardarFinca(S.farm,ses);n.ultima=h;n.conflicto=false;n.listo=true;S.msg='Tu finca quedó guardada en la nube (privada).';}
    else if(act==='nube-cargar'){const f=await nube.cargarFinca(ses);
      if(!f)S.msg='Todavía no hay una finca tuya en la nube.';
      else{S.farm=f;S.demo=false;S.done={};n.ultima=huella(f);n.conflicto=false;n.listo=true;S.msg=`Se cargó la finca "${f.nombre||'sin nombre'}" desde la nube.`;}}
    else if(act==='nube-compartir'){
      if(!n.consentimiento||S.demo)throw new ErrorNube('Marca el consentimiento con tu finca real para compartir.');
      await nube.compartirCaso(casoAnonimo(S.farm,configEfectiva(normalizarAjustes(S.ajustes))),ses);
      n.consentimiento=false;S.msg='Gracias: tu caso anónimo quedó compartido.';
      n.comunidad=await nube.casosComunidad();}
    else if(act==='nube-retirar'){await nube.retirarMisCasos(ses);S.msg='Se retiraron todos tus casos compartidos.';n.comunidad=await nube.casosComunidad();}
    else if(act==='nube-comunidad'){n.comunidad=await nube.casosComunidad();if(!silenciosa)S.msg=`Se descargaron ${n.comunidad.length} caso(s) de la comunidad.`;}
  }catch(err){
    if(err instanceof ErrorNube){if(err.estado===401){borrarSesion();n.sesion=null;}if(!silenciosa)S.msg=err.message;}
    else if(!silenciosa)S.msg='No se pudo completar: la nube respondió algo inesperado.';
  }
  n.ocupado=false;render();
}
