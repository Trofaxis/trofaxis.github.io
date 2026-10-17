// Exporta el cerebro como una bóveda de Obsidian: una nota .md por hecho, variable, tema y fuente, unidas con [[enlaces]].
// Abrir la carpeta en Obsidian muestra el mismo grafo. Obsidian es opcional: la app no lo necesita.
// El .zip se arma aquí mismo (sin compresión, formato ZIP estándar), sin bibliotecas ni conexión.
import { armarGrafo } from './grafo.js';
import { TEMAS } from './hechos.js';
import { VINCULOS, SENTIDOS } from './vinculos.js';

const CARPETA = 'Trofaxis cerebro';
const limpio = (t) => String(t).replace(/[\\/:*?"<>|#^[\]]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 90);

// Nombre de nota único por nodo (Obsidian enlaza por nombre de archivo).
function nombres(grafo) {
  const usados = new Set(), out = new Map();
  for (const n of grafo.nodos) {
    let base = limpio(n.tipo === 'tema' ? `Tema - ${n.titulo}` : n.tipo === 'fuente' ? `Fuente - ${n.titulo}` : n.titulo);
    let nombre = base, k = 2;
    while (usados.has(nombre.toLowerCase())) nombre = `${base} (${k++})`;
    usados.add(nombre.toLowerCase()); out.set(n.id, nombre);
  }
  return out;
}

const SUB = { tema: 'Temas', fuente: 'Fuentes', hecho: 'Hechos', variable: 'Variables' };
const yaml = (v) => JSON.stringify(String(v ?? ''));

// Lista de { ruta, contenido } de la bóveda.
export function notasObsidian(grafo = armarGrafo()) {
  const nom = nombres(grafo), enl = (id) => `[[${nom.get(id)}]]`;
  const de = (id, tipo) => grafo.aristas.filter((e) => e.tipo === tipo && (e.a === id || e.b === id)).map((e) => ({ otro: e.a === id ? e.b : e.a, donde: e.donde }));
  const notas = grafo.nodos.map((n) => {
    let c;
    if (n.tipo === 'hecho') {
      const h = n.hecho;
      c = ['---', `id: ${yaml(h.id)}`, `estado: ${yaml(h.estado)}`, `tema: ${yaml(TEMAS[h.tema])}`, `valor: ${yaml(h.valor)}`, `unidad: ${yaml(h.unidad)}`, `archivo: ${yaml(h.donde)}`, '---', '',
        `# ${h.titulo}`, '', `**Valor:** ${h.valor}${h.unidad ? ' ' + h.unidad : ''}`, '', `**Estado:** ${h.estado}`, '',
        `**Tema:** ${enl('tema:' + h.tema)}`, ''];
      const f = de(n.id, 'fuente')[0];
      c.push(f ? `**Fuente:** ${enl(f.otro)}${h.fuente.url ? ` ([enlace](${h.fuente.url}))` : ''}` : `**Fuente:** ninguna todavía (${h.estado}).`, '');
      if (h.nota) c.push(`> ${h.nota}`, '');
      const juntos = de(n.id, 'formula');
      if (juntos.length) c.push('## Se usa junto con', '', ...juntos.map((j) => `- ${enl(j.otro)} (fórmula en \`${j.donde}\`)`), '');
      const usan = de(n.id, 'dato');
      if (usan.length) c.push('## Lo usan estas variables', '', ...usan.map((j) => `- ${enl(j.otro)}`), '');
    } else if (n.tipo === 'variable') {
      const vinculo = (v) => [`- **${v.de.map(enl).join(' + ')} → ${enl(v.a)}** (${SENTIDOS[v.sentido]}; ${v.estado})`, `  - ${v.mecanismo}`,
        ...v.evidencia.map((ev) => `  - ${ev.postura}: ${ev.cita}${ev.nota ? ` (${ev.nota})` : ''}`)].join('\n');
      const sale = VINCULOS.filter((v) => v.de.includes(n.id)), entra = VINCULOS.filter((v) => v.a === n.id);
      const datos = de(n.id, 'dato');
      c = ['---', `id: ${yaml(n.id)}`, 'tipo: "variable"', '---', '', `# ${n.titulo}`, '',
        ...(datos.length ? ['**Usa los valores:** ' + datos.map((d) => enl(d.otro)).join(', '), ''] : []),
        ...(sale.length ? ['## Afecta a', '', ...sale.map(vinculo), ''] : []),
        ...(entra.length ? ['## Lo afectan', '', ...entra.map(vinculo), ''] : [])];
    } else {
      const tipo = n.tipo === 'tema' ? 'tema' : 'fuente';
      const hechos = de(n.id, tipo).map((x) => x.otro);
      c = [`# ${n.titulo}`, '', n.url ? `Enlace: ${n.url}` : '', '', `## ${n.tipo === 'tema' ? 'Hechos y variables' : 'Hechos'} (${hechos.length})`, '', ...hechos.map((id) => `- ${enl(id)}`), ''];
    }
    return { ruta: `${CARPETA}/${SUB[n.tipo]}/${nom.get(n.id)}.md`, contenido: c.join('\n') };
  });
  notas.unshift({ ruta: `${CARPETA}/Léeme.md`, contenido: ['# Cerebro de Trofaxis', '',
    'Exportado desde la app. Cada nota es un hecho, una variable de la finca, un tema o una fuente; las líneas del grafo de Obsidian son los enlaces entre notas. Los vínculos entre variables (qué afecta a qué y por qué) están en las notas de Variables.',
    'Editar estas notas no cambia la app: los valores viven en el código de Trofaxis.', '',
    ...Object.keys(TEMAS).map((t) => `- ${enl('tema:' + t)}`), ''].join('\n') });
  return notas;
}

// --- ZIP sin compresión -------------------------------------------------------------------------------------
const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
export function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = TABLA_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Archivos { ruta, contenido } → bytes de un .zip.
export function zip(archivos, fecha = new Date(2026, 0, 1)) {
  const te = new TextEncoder(), partes = [], central = [];
  const dosHora = (fecha.getHours() << 11) | (fecha.getMinutes() << 5) | (fecha.getSeconds() >> 1);
  const dosFecha = ((fecha.getFullYear() - 1980) << 9) | ((fecha.getMonth() + 1) << 5) | fecha.getDate();
  let offset = 0;
  for (const a of archivos) {
    const nombre = te.encode(a.ruta), datos = te.encode(a.contenido), crc = crc32(datos);
    const cab = (firma, extra) => {
      const b = new DataView(new ArrayBuffer(extra));
      b.setUint32(0, firma, true); return b;
    };
    const local = cab(0x04034b50, 30);
    [[4, 20], [6, 0x0800], [8, 0], [10, dosHora], [12, dosFecha]].forEach(([o, v]) => local.setUint16(o, v, true));
    local.setUint32(14, crc, true); local.setUint32(18, datos.length, true); local.setUint32(22, datos.length, true);
    local.setUint16(26, nombre.length, true); local.setUint16(28, 0, true);
    const cen = cab(0x02014b50, 46);
    [[4, 20], [6, 20], [8, 0x0800], [10, 0], [12, dosHora], [14, dosFecha]].forEach(([o, v]) => cen.setUint16(o, v, true));
    cen.setUint32(16, crc, true); cen.setUint32(20, datos.length, true); cen.setUint32(24, datos.length, true);
    cen.setUint16(28, nombre.length, true); cen.setUint32(42, offset, true);
    partes.push(new Uint8Array(local.buffer), nombre, datos);
    central.push(new Uint8Array(cen.buffer), nombre);
    offset += 30 + nombre.length + datos.length;
  }
  const tamCentral = central.reduce((s, p) => s + p.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true); fin.setUint16(8, archivos.length, true); fin.setUint16(10, archivos.length, true);
  fin.setUint32(12, tamCentral, true); fin.setUint32(16, offset, true);
  const todo = [...partes, ...central, new Uint8Array(fin.buffer)];
  const out = new Uint8Array(todo.reduce((s, p) => s + p.length, 0));
  let i = 0; for (const p of todo) { out.set(p, i); i += p.length; }
  return out;
}
