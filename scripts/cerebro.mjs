// Bóveda de Obsidian del cerebro (carpeta cerebro/): fuente de verdad del estado y la evidencia de cada vínculo.
//
//   npm run cerebro      → lee cerebro/, reescribe las partes que vienen del código y genera src/cerebro/boveda.js
//
// Qué se edita en Obsidian (y solo eso entra a la app):
//   - Vínculos/<id>.md: `estado`, `validado_por`, `validado_fecha` (propiedades) y la lista bajo «## Evidencia».
//   - Fuentes/<clave>.md con `origen: bóveda`: fuentes nuevas (cita y acceso).
// Lo demás (mecanismo, variables, dónde actúa, fuentes que ya están en el código) se reescribe desde el código:
// editarlo en Obsidian no sirve. Las pruebas (tests/cerebro-boveda.test.js) fallan si src/cerebro/boveda.js
// no coincide con las notas, si una evidencia cita una fuente que no existe o si el estado contradice la evidencia.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CARPETA = 'cerebro';
export const SALIDA = 'src/cerebro/boveda.js';
export const POR_COMPLETAR = 'por completar';
const POSTURAS = ['a favor', 'en contra', 'menciona'];
const ESTADOS = ['con fuente', 'criterio propio', 'por validar'];
const SENTIDOS = { '+': 'sube', '−': 'baja', '?': 'dirección desconocida' };

// --- Lectura de notas ---------------------------------------------------------------------------------------
// Propiedades (frontmatter) simples: «clave: valor» por línea. Los valores pueden ir entre comillas.
export function leerNota(texto) {
  const t = texto.replace(/\r\n/g, '\n');
  const m = t.match(/^---\n([\s\S]*?)\n---\n?/);
  const props = {};
  if (m) for (const linea of m[1].split('\n')) {
    const k = linea.match(/^([\w-]+):\s*(.*)$/);
    if (!k) continue;
    let v = k[2].trim();
    if (/^".*"$/.test(v)) { try { v = JSON.parse(v); } catch { /* se deja tal cual */ } }
    props[k[1]] = v;
  }
  const cuerpo = m ? t.slice(m[0].length) : t;
  return { props, cuerpo };
}

// Sección «## Título» del cuerpo, hasta el siguiente «## ».
export function seccion(cuerpo, titulo) {
  const lineas = cuerpo.split('\n');
  const i = lineas.findIndex((l) => l.trim().toLowerCase() === `## ${titulo}`.toLowerCase());
  if (i < 0) return null;
  const fin = lineas.findIndex((l, j) => j > i && /^##\s/.test(l));
  return lineas.slice(i + 1, fin < 0 ? undefined : fin).join('\n');
}

// Cada evidencia es una línea: «- postura | [[clave]] | dónde | nota». Dónde = página, tabla o sección.
export function leerEvidencia(texto) {
  const out = [], errores = [];
  for (const linea of (texto ?? '').split('\n')) {
    const l = linea.trim();
    if (!l.startsWith('- ')) continue;
    const partes = l.slice(2).replace(/\[\[([^\]|]+)\|[^\]]*\]\]/g, '[[$1]]').split('|').map((x) => x.trim());
    const [postura, enlace = '', donde = '', ...resto] = partes;
    const clave = enlace.match(/^\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]$/)?.[1]?.trim();
    if (!POSTURAS.includes(postura)) { errores.push(`postura desconocida en «${l}»`); continue; }
    if (!clave) { errores.push(`la fuente debe ser un enlace [[clave]] en «${l}»`); continue; }
    out.push({ fuente: clave, postura, donde: donde || POR_COMPLETAR, nota: resto.join(' | ').trim() });
  }
  return { evidencia: out, errores };
}

// --- Escritura de notas -------------------------------------------------------------------------------------
const yaml = (v) => (v == null || v === '' ? '' : /^[\w áéíóúñü.-]+$/i.test(String(v)) ? String(v) : JSON.stringify(String(v)));
const enlVar = (VARIABLES, id) => `[[${id}|${VARIABLES[id]?.nombre ?? id}]]`;

export function notaVinculo(v, editable, { VARIABLES, pesoDe }) {
  const donde = v.usadoEn.modulo
    ? `\`${v.usadoEn.archivo}\`, variable \`${v.usadoEn.variable}\` de la rúbrica (peso ${pesoDe(v)})`
    : `\`${v.usadoEn.archivo}\`, aviso «${v.usadoEn.aviso}» (no suma al puntaje)`;
  return [
    '---', `id: ${v.id}`, `estado: ${editable.estado}`, `validado_por: ${yaml(editable.validado?.por)}`,
    `validado_fecha: ${yaml(editable.validado?.fecha)}`, 'tipo: vínculo', '---', '',
    `# ${v.de.map((x) => VARIABLES[x]?.nombre ?? x).join(' + ')} → ${VARIABLES[v.a]?.nombre ?? v.a}`, '',
    '## Evidencia', '',
    '<!-- Una línea por fuente: - postura | [[clave de la fuente]] | página, tabla o sección | nota.',
    '     postura: a favor, en contra o menciona. «con fuente» exige al menos una «a favor» con página. -->',
    ...editable.evidencia.map((e) => `- ${e.postura} | [[${e.fuente}]] | ${e.donde || POR_COMPLETAR} | ${e.nota ?? ''}`.trimEnd()),
    '',
    '## Del código (no editar aquí)', '',
    `- **Variables:** ${v.de.map((x) => enlVar(VARIABLES, x)).join(' + ')} → ${enlVar(VARIABLES, v.a)} (${SENTIDOS[v.sentido]})`,
    `- **Mecanismo:** ${v.mecanismo}`,
    ...(v.contexto ? [`- **Contexto:** ${v.contexto}`] : []),
    `- **Dónde actúa:** ${donde}`,
    ...(v.nota ? [`- **Nota:** ${v.nota}`] : []),
    '',
  ].join('\n');
}

export function notaFuente(clave, f, origen) {
  return ['---', `clave: ${clave}`, `origen: ${origen}`, `cita: ${JSON.stringify(f.cita)}`, `acceso: ${JSON.stringify(f.acceso || f.url || POR_COMPLETAR)}`, '---', '',
    `# ${f.cita}`, '', origen === 'código'
      ? 'Esta fuente vive en el código de Trofaxis; se reescribe sola. Para cambiarla, cambia el código con un PR.'
      : 'Fuente agregada desde Obsidian. `cita` y `acceso` (enlace, handle o dónde está el documento) son obligatorios.', ''].join('\n');
}

export function notaVariable(id, v, VINCULOS) {
  const rel = VINCULOS.filter((x) => x.de.includes(id) || x.a === id).map((x) => `- [[${x.id}]]`);
  return ['---', `id: ${id}`, 'tipo: variable', '---', '', `# ${v.nombre}`, '', '## Vínculos', '', ...rel, ''].join('\n');
}

const LEEME = `# Cerebro de Trofaxis

Esta carpeta es una bóveda de Obsidian. Ábrela con «Abrir carpeta como bóveda».

**Qué se edita aquí y entra a la app**
- En cada nota de \`Vínculos/\`: la propiedad \`estado\` (con fuente, criterio propio o por validar), \`validado_por\`,
  \`validado_fecha\` y la lista bajo «## Evidencia».
- Fuentes nuevas: una nota en \`Fuentes/\` con \`origen: bóveda\`, \`cita\` y \`acceso\` (enlace, handle o dónde está el documento).

**Reglas (las revisan las pruebas)**
- Nada sin fuente se marca «con fuente». «con fuente» exige al menos una evidencia «a favor» con página, tabla o sección.
- Una evidencia «a favor» sin página queda como «${POR_COMPLETAR}» y aparece en la lista de pendientes.
- No se inventan citas: toda evidencia enlaza una nota de \`Fuentes/\`.
- «por validar» no puede tener evidencia «a favor»: si la hay, es «con fuente» o «criterio propio».

**Después de editar**
1. \`npm run cerebro\` (reescribe lo que viene del código y genera \`src/cerebro/boveda.js\`).
2. \`npm test\`.
3. PR. Diego revisa y une.
`;

// --- Sincronizar --------------------------------------------------------------------------------------------
function leerCarpeta(dir) {
  if (!fs.existsSync(dir)) return {};
  return Object.fromEntries(fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => [f.slice(0, -3), fs.readFileSync(path.join(dir, f), 'utf8')]));
}

// Fuentes que ya están en el código, con la clave que se usa en los enlaces.
export function fuentesDelCodigo(FUENTES_ECO, FUENTES_PLAG) {
  const out = {};
  for (const [k, f] of Object.entries(FUENTES_ECO)) out[k] = { cita: f.cita, url: f.url || '' };
  for (const [k, f] of Object.entries(FUENTES_PLAG)) out[`plag-${k}`] = { cita: f.cita, url: f.url || '' };
  return out;
}

// Devuelve { archivos: {ruta: contenido}, boveda, errores }. No escribe nada: sincronizar() lo hace.
export function construir({ raiz = RAIZ, VINCULOS, VARIABLES, pesoDe, FUENTES_ECO, FUENTES_PLAG, semilla = {} }) {
  const dir = path.join(raiz, CARPETA), errores = [], archivos = {};
  const notasV = leerCarpeta(path.join(dir, 'Vínculos'));
  const notasF = leerCarpeta(path.join(dir, 'Fuentes'));
  const codigo = fuentesDelCodigo(FUENTES_ECO, FUENTES_PLAG);
  const fuentes = {};
  for (const [k, f] of Object.entries(codigo)) { fuentes[k] = { ...f, origen: 'código' }; archivos[`${CARPETA}/Fuentes/${k}.md`] = notaFuente(k, f, 'código'); }
  for (const [k, txt] of Object.entries(notasF)) {
    const { props } = leerNota(txt);
    if (codigo[k]) continue;
    if (props.origen !== 'bóveda') { errores.push(`Fuentes/${k}.md: no está en el código y no dice «origen: bóveda»`); continue; }
    if (!props.cita?.trim()) errores.push(`Fuentes/${k}.md: falta la cita`);
    if (!props.acceso?.trim()) errores.push(`Fuentes/${k}.md: falta el acceso (enlace, handle o dónde está el documento)`);
    fuentes[k] = { cita: props.cita ?? '', url: /^https?:\/\//.test(props.acceso ?? '') ? props.acceso : '', acceso: props.acceso ?? '', origen: 'bóveda' };
    archivos[`${CARPETA}/Fuentes/${k}.md`] = notaFuente(k, fuentes[k], 'bóveda');
  }
  const vinculos = {};
  for (const v of VINCULOS) {
    let editable;
    if (notasV[v.id] != null) {
      const { props, cuerpo } = leerNota(notasV[v.id]);
      const ev = leerEvidencia(seccion(cuerpo, 'Evidencia'));
      ev.errores.forEach((e) => errores.push(`Vínculos/${v.id}.md: ${e}`));
      const por = (props.validado_por ?? '').trim(), fecha = (props.validado_fecha ?? '').trim();
      editable = { estado: props.estado, evidencia: ev.evidencia, validado: por ? { por, fecha } : null };
    } else if (semilla[v.id]) editable = semilla[v.id];
    else { errores.push(`Vínculos/${v.id}.md: falta la nota del vínculo`); continue; }
    if (!ESTADOS.includes(editable.estado)) errores.push(`Vínculos/${v.id}.md: estado desconocido «${editable.estado}»`);
    for (const e of editable.evidencia) if (!fuentes[e.fuente]) errores.push(`Vínculos/${v.id}.md: la fuente [[${e.fuente}]] no existe en Fuentes/`);
    const aFavor = editable.evidencia.filter((e) => e.postura === 'a favor');
    if (editable.estado === 'con fuente' && !aFavor.some((e) => e.donde !== POR_COMPLETAR)) errores.push(`Vínculos/${v.id}.md: dice «con fuente» pero ninguna evidencia «a favor» tiene página, tabla o sección`);
    if (editable.estado === 'por validar' && aFavor.length) errores.push(`Vínculos/${v.id}.md: «por validar» con evidencia «a favor»: debería ser «con fuente» o «criterio propio»`);
    vinculos[v.id] = {
      estado: editable.estado, validado: editable.validado,
      evidencia: editable.evidencia.map((e) => ({ fuente: e.fuente, cita: fuentes[e.fuente]?.cita ?? '', postura: e.postura, donde: e.donde, nota: e.nota ?? '' })),
    };
    archivos[`${CARPETA}/Vínculos/${v.id}.md`] = notaVinculo(v, editable, { VARIABLES, pesoDe });
  }
  for (const id of Object.keys(notasV)) if (!VINCULOS.some((v) => v.id === id)) errores.push(`Vínculos/${id}.md: no hay un vínculo con ese id en src/cerebro/vinculos.js`);
  for (const [id, v] of Object.entries(VARIABLES)) archivos[`${CARPETA}/Variables/${id}.md`] = notaVariable(id, v, VINCULOS);
  archivos[`${CARPETA}/Léeme.md`] = LEEME;
  const boveda = { vinculos, fuentes };
  archivos[SALIDA] = `// Generado por \`npm run cerebro\` desde la bóveda de Obsidian (cerebro/). No editar a mano: edita las notas.\nexport const BOVEDA = ${JSON.stringify(boveda, null, 2)};\n`;
  return { archivos, boveda, errores };
}

// Pendientes de la bóveda: evidencias «a favor» sin página y fuentes sin acceso.
export function pendientes(boveda) {
  const p = [];
  for (const [id, v] of Object.entries(boveda.vinculos)) for (const e of v.evidencia) if (e.postura === 'a favor' && e.donde === POR_COMPLETAR) p.push(`${id}: falta la página de [[${e.fuente}]]`);
  for (const [k, f] of Object.entries(boveda.fuentes)) if (f.origen === 'bóveda' && (f.acceso ?? '') === POR_COMPLETAR) p.push(`Fuente ${k}: falta el acceso`);
  return p;
}

export async function cargarCodigo() {
  const { VINCULOS_CODIGO, VARIABLES, pesoDe } = await import('../src/cerebro/vinculos.js');
  const { FUENTES } = await import('../src/core/fuentes.js');
  const { FUENTES_PLAG } = await import('../src/plag/calculo.js');
  return { VINCULOS: VINCULOS_CODIGO, VARIABLES, pesoDe, FUENTES_ECO: FUENTES, FUENTES_PLAG };
}

export function escribir(archivos, raiz = RAIZ) {
  const dir = path.join(raiz, CARPETA);
  for (const sub of ['Vínculos', 'Variables', 'Fuentes']) {
    const d = path.join(dir, sub);
    if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith('.md') && !archivos[`${CARPETA}/${sub}/${f}`]) fs.rmSync(path.join(d, f));
  }
  for (const [ruta, contenido] of Object.entries(archivos)) {
    fs.mkdirSync(path.dirname(path.join(raiz, ruta)), { recursive: true });
    fs.writeFileSync(path.join(raiz, ruta), contenido);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = construir(await cargarCodigo());
  if (r.errores.length) { console.error('La bóveda tiene errores; no se escribió nada:\n- ' + r.errores.join('\n- ')); process.exit(1); }
  escribir(r.archivos);
  const p = pendientes(r.boveda);
  console.log(`Bóveda al día: ${Object.keys(r.boveda.vinculos).length} vínculos, ${Object.keys(r.boveda.fuentes).length} fuentes.${p.length ? `\nPendientes (${p.length}):\n- ${p.join('\n- ')}` : ''}`);
}
