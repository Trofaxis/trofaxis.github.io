// Genera conoce/datos-demo.js: los números que muestra la página de presentación (/conoce/).
// Nada se escribe a mano: el índice, los temas y la rueda salen del mismo motor que usa la app con la finca
// demostrativa (ficticia), y las cifras y citas salen de los catálogos y del cerebro. Una prueba
// (tests/conoce.test.js) falla si el archivo generado queda desactualizado.
// Uso: node scripts/conoce-datos.mjs
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CONFIG } from '../src/core/config.js';
import { demoFarm } from '../src/core/state.js';
import { evaluar } from '../src/core/engine.js';
import { conPlan } from '../src/fert/calculo.js';
import { mesesRueda } from '../src/ui/rueda.js';
import { MODULOS } from '../src/modules/index.js';
import { PRODUCTOS_SAG } from '../src/plag/sag.js';
import { INGREDIENTES } from '../src/plag/catalogo.js';
import { TESIS } from '../src/cerebro/tesis.js';

// Citas que muestra la página: tesis, página y cómo empieza la frase. Si la frase deja de estar verificada
// en el cerebro, este script falla en vez de publicar una cita sin respaldo.
const CITAS = [
  { clave: 'alpizar-2000', pagina: '8', empieza: 'El movimiento del agua a través del perfil del suelo' },
  { clave: 'echeverria-2015', pagina: '19', empieza: 'El sistema de goteo fue el que utilizó la menor cantidad de agua' },
  { clave: 'osorio', pagina: '35', empieza: 'manejar los árboles mediante podas o control de rebrotes' },
];

function cita({ clave, pagina, empieza }) {
  const tesis = TESIS.tesis.find((t) => t.clave === clave);
  if (!tesis) throw new Error(`conoce: no existe la tesis ${clave} en el cerebro`);
  const item = tesis.items.find((i) => String(i.pagina) === pagina && i.cita.startsWith(empieza));
  if (!item) throw new Error(`conoce: la frase de ${clave}, p. ${pagina}, ya no está verificada en el cerebro`);
  return { clave, pagina, frase: item.cita, fuente: tesis.cita };
}

export function datosDemo() {
  // Igual que el inicio de la app: la finca con su plan de fertilización y la configuración por defecto.
  const finca = conPlan(demoFarm());
  const R = evaluar(finca, CONFIG, {});
  const nivelGlobal = R.overall >= CONFIG.niveles.alto ? 'Alto' : R.overall >= CONFIG.niveles.medio ? 'Medio' : 'Bajo';
  return {
    finca: { nombre: finca.nombre, depto: finca.depto, area: finca.area, cultivos: finca.cultivos.map((c) => ({ nombre: c.nombre, ha: c.ha })) },
    indice: { v: R.overall, nivel: nivelGlobal, cortes: { medio: CONFIG.niveles.medio, alto: CONFIG.niveles.alto } },
    temas: R.mods.map((m) => ({ id: m.id, nombre: m.nombre, v: Math.round(m.score), nivel: m.level })),
    meses: mesesRueda(R, finca),
    cifras: {
      temas: MODULOS.length,
      productosSag: PRODUCTOS_SAG.length,
      ingredientes: INGREDIENTES.length,
      aniosClima: CONFIG.clima.anios,
      tesis: TESIS.tesis.length,
      frases: TESIS.tesis.reduce((s, t) => s + t.items.length, 0),
    },
    citas: CITAS.map(cita),
  };
}

export function archivoDemo() {
  return `// Generado por scripts/conoce-datos.mjs. No editar a mano: corre \`node scripts/conoce-datos.mjs\`.
// Finca demostrativa (ficticia) evaluada con el motor de la app, y cifras tomadas de los catálogos y del cerebro.
export const DEMO = ${JSON.stringify(datosDemo(), null, 2)};
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(new URL('../conoce/', import.meta.url), { recursive: true });
  fs.writeFileSync(new URL('../conoce/datos-demo.js', import.meta.url), archivoDemo());
  console.log('conoce/datos-demo.js actualizado');
}
