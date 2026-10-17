// Estado de la app: finca de ejemplo, finca vacía y borradores de formularios.
import { CONFIG } from './config.js';
import { riegoInicial } from '../riego/guardado.js';
import { plagVacio, plagBorrador } from '../plag/modelo.js';

// Resultado de un caso: cómo le fue a la finca después de sus acciones (memoria de casos).
// ncAntes/ncDespues: n.º de no conformidades GLOBALG.A.P. antes y después.
// laminaAntes/laminaDespues: lámina aplicada / lámina requerida (ideal 0.9-1.2, rúbrica de agua v0.2).
export const resultadoVacio = () => ({ ncAntes: null, ncDespues: null, laminaAntes: null, laminaDespues: null });

// Finca demostrativa: 100 % ficticia. No lleva ningún valor de una tesis ni de una hoja real (esos viven en
// src/casos/referencia.js); una prueba lo revisa. Las especies se nombran, pero sus meses y medidas son inventados.
export function demoFarm() {
  return {
    nombre: 'Finca demostrativa', depto: 'Francisco Morazán', area: 45, areaProd: 28, altitud: 800, pendiente: 'ondulada',
    fuenteAgua: 'Quebrada', distAgua: 60, tieneCultivos: true,
    cultivos: [
      { nombre: 'Melón', ha: 20, siembra: [0, 1], cosecha: [2, 3] },
      { nombre: 'Maíz', ha: 8, siembra: [4, 5], cosecha: [8, 9] },
    ],
    especies: [
      { nombre: 'Spathodea campanulata', tipo: 'Árbol', origen: 'exótica', floracion: [0, 1, 2, 3], atrae: true, riesgo: true, cantidad: 3, copaD: 12, copaH: 9 },
      { nombre: 'Gliricidia sepium', tipo: 'Árbol', origen: 'nativa', floracion: [0, 1, 2], atrae: true, riesgo: false },
      { nombre: 'Trigona fulviventris', tipo: 'Fauna', origen: 'nativa', floracion: [], atrae: false, riesgo: false },
      { nombre: 'Plebeia melanica', tipo: 'Fauna', origen: 'nativa', floracion: [], atrae: false, riesgo: false },
      { nombre: 'Melón', tipo: 'Cultivo', origen: 'exótica', floracion: [1, 2], atrae: true, riesgo: false },
    ],
    riego: 'gravedad', nAplicado: 180, nObjetivo: 150, pObjetivo: 60, kObjetivo: 60, fertMeses: [0, 1, 5, 6], lluviaMeses: [5, 6, 8, 9],
    // Plan de fertilización (ficticio). Dosis en kg de producto por ha; grado en %.
    fertPlan: [
      { mes: 0, producto: '15-15-15', n: 15, p: 15, k: 15, dosis: 300, metodo: 'incorporado' },
      { mes: 1, producto: 'urea', n: 46, p: 0, k: 0, dosis: 100, metodo: 'voleo' },
      { mes: 5, producto: 'urea', n: 46, p: 0, k: 0, dosis: 100, metodo: 'voleo' },
      { mes: 6, producto: 'nitrato-amonio', n: 34, p: 0, k: 0, dosis: 127, metodo: 'voleo' },
    ],
    // Aplicaciones de plaguicidas (ficticias). Las dosis son entradas de ejemplo, no recomendaciones.
    plaguicidas: [
      { ...plagVacio(), producto: 'Insecticida de amplio espectro', clase: 'amplio', meses: [1, 2], uso: 'insecticida', registro: 'PQUA',
        componentes: [{ ia: 'imidacloprid', nombre: '', conc: 350, dl50: null, mayor: false }], concUnidad: 'g', grupo: '4A', formulacion: 'SC',
        dosis: 0.3, dosisUnidad: 'Lha', objetivo: 'Mosca blanca', monitoreo: true, hora: '07:00', viento: 6, temp: 24, hr: 70, ph: 6 },
      { ...plagVacio(), producto: 'Fungicida selectivo', clase: 'selectivo', meses: [6, 7], uso: 'fungicida', registro: 'PQUA',
        componentes: [{ ia: 'mancozeb', nombre: '', conc: 80, dl50: null, mayor: false }], concUnidad: 'pct', grupo: 'M3', formulacion: 'WP',
        dosis: 1000, dosisUnidad: 'gBarril', volumen: 300 },
    ],
    sueloDesnudoMeses: [3, 4, 5], labranza: 'convencional',
    plagas: [{ nombre: 'Mosca blanca (Bemisia tabaci)', meses: [1, 2, 3], severidad: 'alta', cultivo: 'Melón' }],
    gg: 'si', minorAplicables: 60, minorFallas: 1,
    nc: [{ criterio: 'Registro de aplicaciones incompleto', dias: 9 }],
    cultivosAledanos: [{ nombre: 'Café', distancia: 200 }], proposito: [], sinPlaguicidas: false,
    acciones: [], resultado: resultadoVacio(),
    clima: null, // ficticia: sin ubicación, sin clima
  };
}

export function emptyFarm() {
  return {
    nombre: '', depto: '', area: 0, areaProd: 0, altitud: 0, pendiente: null, fuenteAgua: '', distAgua: null, tieneCultivos: false, // null = sin responder (no cuenta como dato)
    cultivos: [], especies: [], riego: null, nAplicado: 0, nObjetivo: 0, pObjetivo: 0, kObjetivo: 0, fertPlan: [], fertMeses: [], lluviaMeses: [], plaguicidas: [], sueloDesnudoMeses: [],
    labranza: null, plagas: [], gg: 'no', minorAplicables: 60, minorFallas: 0, nc: [],
    cultivosAledanos: [], proposito: [], sinPlaguicidas: false, // true = el usuario dijo que no aplica plaguicidas
    acciones: [], resultado: resultadoVacio(),
    // Clima por mes de la ubicación (src/clima/normales.js). Sin coordenadas: esas viven solo en el navegador.
    clima: null,
  };
}

export const blankDrafts = () => ({
  draftEsp: { nombre: '', tipo: 'Árbol', origen: 'nativa', floracion: [], atrae: false, riesgo: false, cantidad: null, copaD: null, copaH: null, presencia: '' },
  draftPlag: plagBorrador(),
  draftPlaga: { nombre: '', meses: [], severidad: 'media', cultivo: '', presencia: '' },
  draftVecino: { nombre: '', distancia: null },
  draftCult: { nombre: '', ha: 0, siembra: [], cosecha: [] },
  draftNC: { criterio: '', dias: 0 },
  draftRow: { fecha: '', lote: '', valor: '' },
  draftFert: { mes: 0, producto: 'urea', n: 46, p: 0, k: 0, dosis: '', metodo: 'incorporado' },
});

// Tipos de plantilla de registro. `pestana` indica que el tipo ya tiene pestaña propia:
// no se ofrece en Plantillas, solo se redirige a esa pestaña.
export const TPL = {
  fert: { nombre: 'Fertilización', unidad: 'kg N/ha', acum: true, obj: 'Dosis máxima anual', pestana: 'fertilizacion' },
  riego: { nombre: 'Riego', unidad: 'm³/semana', acum: false, obj: 'Volumen máximo por registro', pestana: 'riego' },
  mec: { nombre: 'Mecanización', unidad: 'horas de tractor', acum: true, obj: 'Horas máximas anuales' },
  custom: { nombre: 'Personalizada', unidad: 'unidades', acum: false, obj: 'Valor objetivo' },
};

// Tipos que se registran en la pestaña Plantillas (los que no tienen pestaña propia).
export const tiposPlantilla = () => Object.keys(TPL).filter((k) => !TPL[k].pestana);

// Estado global único de la app.
export const S = {
  farm: demoFarm(), demo: true, view: 'dashboard', step: 0,
  theme: 'system', // tema visual: system | light | dark
  wizModo: 'rapido', // cuestionario: rapido (lo básico, src/core/rapido.js) | completo (los 6 pasos)
  rapido: null, rapidoDe: null, // respuestas rápidas y la finca de la que salieron
  vistaTecnica: false, // dashboard: false = vista simple (semáforo y acciones), true = todo el detalle técnico
  problema: '', // problema abierto en el ApiRadar del dashboard: '' | spathodea
  arCargando: false, // animación de análisis al generar el ApiRadar
  bv: { paso: 0, fuente: '', usos: [] }, // bienvenida de primera vez (src/ui/bienvenida.js)
  arExcluir: {}, // acciones medibles del ApiRadar que el usuario sacó de su plan: { mover: true, … }
  done: {}, // recomendaciones del plan de acción marcadas como hechas
  sim: { n: false, pol: false, riego: false, suelo: false, selec: false }, // cambios activos en el simulador
  io: '', ioMsg: '', confirmReset: false, // respaldo en texto y confirmación de borrado
  // Ajustes personalizables (módulos activos y umbrales). Viajan con la finca al exportar.
  ajustes: { modulosActivos: [...CONFIG.modulosActivos], niveles: { ...CONFIG.niveles } },
  msg: '',
  casos: [],
  espSeccion: '', // sección de especies con el formulario abierto: fauna | arboles | malezas
  // Nube (Supabase): sesión por enlace al correo, casos de la comunidad y consentimiento de la sesión actual.
  cuenta: { email: '', proveedor: '', sinCuenta: false }, // cuenta recordada en este navegador (src/core/cuenta.js)
  cuentaMenu: false, confirmarSalir: false, entrarCorreo: false, // menú de cuenta, confirmación de cierre y correo en la entrada
  nube: { sesion: null, comunidad: [], consentimiento: false, email: '', ocupado: false, listo: false, conflicto: false, ultima: '', estado: '' },
  fertImport: null, // último archivo de fertilización cargado: { archivo, hoja, omitidas, avisos }
  fertUnidad: 'kgha', // unidad de dosis en la pestaña Fertilización: kgha | qqmz // casos guardados por el usuario en este navegador (memoria de casos)
  plagEdit: null, // índice de la aplicación de plaguicida que se está editando (null: agregando una nueva)
  plagNotas: [], // notas al llenar el formulario desde el cuadro SAG
  plagMsg: null, // mensaje junto al botón del formulario de plaguicidas: { nivel: 'ok' | 'error', texto }
  climaUI: { estado: '', msg: '', llenos: [] }, // descarga del clima: '' | cargando | ok | error, y qué se llenó solo
  abiertos: {}, // secciones plegables que el usuario abrió o cerró (se conservan al volver a dibujar la vista)
  // Módulo de riego: datos de entrada, de dónde salieron y lo que el archivo traía calculado.
  riego: riegoInicial(),
  ...blankDrafts(),
  tpl: {
    tipo: 'mec', objetivo: 0, paste: '',
    rows: [],
  },
};
