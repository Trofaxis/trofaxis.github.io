// Casos de REFERENCIA: datos reales con fuente, separados de la finca demostrativa y de los casos de ejemplo.
// Se leen y se comparan, pero no se editan, no se suben a la nube y no entran a la búsqueda de fincas parecidas
// (no son fincas completas: solo traen lo que su fuente midió). Nunca llevan coordenadas.
// No copian cifras: leen src/core/fuentes.js (tesis) y el caso del Lab de Riego (src/riego/calculo.js).
// Crecen por PR: una tesis nueva suma sus `datos` en fuentes.js y aparece aquí sola.
import { FUENTES } from '../core/fuentes.js';
import { casoEjemplo } from '../riego/calculo.js';

const LAB_RIEGO = 'Almendárez (2025), Lab de Riego Zamorano';

const deTesis = (...claves) => claves.flatMap((k) => FUENTES[k].datos.map((d) => ({
  titulo: d.titulo, valor: d.valor, unidad: d.unidad, fuente: FUENTES[k].corta, donde: d.donde, nota: d.nota || '',
})));

function labRiego() {
  const c = casoEjemplo(), hoja = 'hoja «Emisores – Diseño Agronómico 2025»';
  const d = (titulo, valor, unidad, nota = '') => ({ titulo, valor, unidad, fuente: LAB_RIEGO, donde: hoja, nota });
  return [
    d('Cultivo', c.cultivo, ''),
    d('Área del lote', c.areaLote, 'ha'),
    d('Kc inicial, medio y final', [c.kcIni, c.kcMed, c.kcFin].join(' · '), ''),
    d('Duración de etapas', c.etapas.join(' · '), 'días'),
    d('ETo de diseño', c.eto, 'mm/día'),
    d('Caudal del emisor', c.caudalEmisor, 'L/h'),
    d('Emisores × laterales', `${c.distEmisores} × ${c.distLaterales}`, 'm'),
    d('Eficiencia de aplicación', c.eficiencia, ''),
    d('Secciones de suelo', c.suelo.map((s) => `${s.nombre}: ${s.textura}, ${s.area} ha`).join('; '), ''),
  ];
}

export const CASOS_REFERENCIA = [
  {
    id: 'ref-zamorano-spathodea', origen: 'referencia', etiqueta: 'Campus Zamorano · Spathodea y abejas nativas',
    lugar: 'Campus de la Universidad Zamorano, Valle del Yeguare, Honduras',
    resumen: 'Lo que midieron dos tesis de Zamorano sobre Spathodea campanulata y las abejas que mueren en sus flores. Es la base del ApiRadar.',
    citas: [FUENTES.osorio.cita, FUENTES.kuniyoshi.cita],
    datos: deTesis('osorio', 'kuniyoshi'),
    pendientes: ['Tejeda et al. (2025), mortalidad de insectos en flores de Spathodea: con embargo en bdigital.zamorano.edu; se suma cuando se pueda leer.'],
  },
  {
    id: 'ref-lab-riego-maiz', origen: 'referencia', etiqueta: 'Lab de Riego Zamorano · maíz por goteo',
    lugar: 'Zamorano, Honduras',
    resumen: 'Diseño agronómico real de maíz por goteo, publicado con autorización del autor. Es el caso que abre la pestaña Riego.',
    citas: ['Almendárez, A. (2025). Emisores – Diseño Agronómico 2025 y Diseño Hidráulico Lab de riego 2025. Laboratorio de Riego, Universidad Zamorano. Publicado con autorización del autor.'],
    datos: labRiego(),
    pendientes: [],
  },
];
