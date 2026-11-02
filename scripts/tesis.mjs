// Tesis en la bóveda (cerebro/Tesis/): lo que una tesis dice, línea por línea, con la página y la frase textual.
// Es el primer paso para que el cerebro lea cientos de tesis sin inventar nada:
//   1. Una persona (o una IA, y luego una persona) escribe la nota de la tesis: relaciones entre variables,
//      umbrales, fórmulas y datos. Cada línea termina con «pág. N | "frase textual"».
//   2. El verificador busca cada frase en esa página del PDF (texto sacado con pdftotext, páginas separadas por \f).
//      Si la frase no está, la línea no entra. El resultado se guarda en cerebro/Tesis/_verificacion.json.
//   3. scripts/cerebro.mjs junta todo: qué pares de variables tienen evidencia, con qué sentido y cuántas tesis,
//      qué umbrales hay para cada variable y qué variables nuevas aparecen (cerebro/Tesis/_Resumen.md).
// Nada de esto cambia un puntaje: una relación entra a la rúbrica solo con un PR que Diego revisa.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const SUBCARPETA = 'Tesis';
export const VERIFICACION = '_verificacion.json';
// Campos de cada sección, antes de «pág. N | "frase"».
export const SECCIONES = {
  Relaciones: ['de', 'a', 'sentido', 'base', 'resultado'],
  Umbrales: ['variable', 'umbral'],
  Fórmulas: ['nombre', 'formula'],
  Datos: ['dato', 'valor'],
};
// + sube, − baja, 0 sin efecto significativo, ? no se sabe. «n.s.»: tendencia sin significancia estadística.
export const SENTIDOS = ['+', '−', '0', '?', '+ n.s.', '− n.s.'];
// medido: lo midió la tesis. citado: lo dice otra fuente que la tesis cita. afirmado: la tesis lo afirma sin medirlo.
export const BASES = ['medido', 'citado', 'afirmado'];
const SIMILITUD_OCR = 0.8;

const sha = (t) => crypto.createHash('sha256').update(t).digest('hex');
// Normaliza para comparar: sin tildes, minúsculas, mismas comillas y guiones, sin espacios
// (los saltos de línea y la separación en sílabas del PDF no deben impedir encontrar la frase).
export function normalizar(t) {
  return String(t).normalize('NFKD').replace(/[̀-ͯ­]/g, '').toLowerCase()
    .replace(/[“”«»„"]/g, '"').replace(/[‘’`´]/g, "'").replace(/[‐‑‒–—―−]/g, '-').replace(/\s+/g, '');
}

// «pág. 4», «pág. 32-33» o «pág. 32–33» → [desde, hasta]. Son páginas del archivo PDF (1 = primera hoja).
export function leerPagina(t) {
  const m = String(t).trim().match(/^p[áa]g\.?\s*(\d+)(?:\s*[-–]\s*(\d+))?$/i);
  if (!m) return null;
  const a = Number(m[1]), b = Number(m[2] ?? m[1]);
  return b >= a && b - a <= 2 ? [a, b] : null;
}

const sinComillas = (t) => t.trim().replace(/^["“«]\s*/, '').replace(/\s*["”»]$/, '');

// Líneas de una sección: «- campo | campo | … | pág. N | "frase"». Devuelve { items, errores }.
export function leerSeccionTesis(texto, nombre) {
  const campos = SECCIONES[nombre], items = [], errores = [];
  for (const linea of (texto ?? '').split('\n')) {
    const l = linea.trim();
    if (!l.startsWith('- ')) continue;
    const partes = l.slice(2).split(' | ').map((x) => x.trim());
    if (partes.length < campos.length + 2) { errores.push(`${nombre}: faltan campos en «${l}»`); continue; }
    const cita = sinComillas(partes.pop()), pagTxt = partes.pop();
    const pagina = leerPagina(pagTxt);
    if (!pagina) { errores.push(`${nombre}: página no válida «${pagTxt}» (se escribe «pág. N»)`); continue; }
    if (cita.length < 20) { errores.push(`${nombre}: la frase textual es muy corta para verificarla en «${l}»`); continue; }
    const item = { seccion: nombre, pagina, cita };
    campos.forEach((c, i) => { item[c] = i === campos.length - 1 ? partes.slice(i).join(' | ') : partes[i] ?? ''; });
    if (nombre === 'Relaciones') {
      if (!SENTIDOS.includes(item.sentido)) { errores.push(`Relaciones: sentido «${item.sentido}» no válido (${SENTIDOS.join(', ')})`); continue; }
      if (!BASES.includes(item.base)) { errores.push(`Relaciones: base «${item.base}» no válida (${BASES.join(', ')})`); continue; }
    }
    items.push(item);
  }
  return { items, errores };
}

// Huella de una línea: si se cambia la frase o la página, hay que volver a verificarla.
export const huella = (it) => sha(`${it.seccion}|${it.pagina.join('-')}|${normalizar(it.cita)}`).slice(0, 16);

// Lee una nota de tesis. leerNota y seccion vienen de scripts/cerebro.mjs (se pasan para no importarlo en círculo).
export function leerTesis(clave, texto, { leerNota, seccion }) {
  const { props, cuerpo } = leerNota(texto);
  const errores = [], items = [];
  for (const s of ['cita', 'texto', 'tema']) if (!props[s]?.trim()) errores.push(`Tesis/${clave}.md: falta «${s}»`);
  for (const nombre of Object.keys(SECCIONES)) {
    const r = leerSeccionTesis(seccion(cuerpo, nombre), nombre);
    r.errores.forEach((e) => errores.push(`Tesis/${clave}.md: ${e}`));
    items.push(...r.items);
  }
  if (!items.length) errores.push(`Tesis/${clave}.md: no tiene ninguna línea con página y frase`);
  const alertas = (seccion(cuerpo, 'Alertas') ?? '').split('\n').map((l) => l.trim()).filter((l) => l.startsWith('- ')).map((l) => l.slice(2));
  // Variables que esta tesis trae y Trofaxis todavía no tiene: «- id | nombre en palabras».
  const variablesNuevas = [];
  for (const l of (seccion(cuerpo, 'Variables nuevas') ?? '').split('\n').map((x) => x.trim()).filter((x) => x.startsWith('- '))) {
    const [id, nombre = ''] = l.slice(2).split(' | ').map((x) => x.trim());
    if (!/^[a-z]+\.[A-Za-z]+$/.test(id) || !nombre) errores.push(`Tesis/${clave}.md: variable nueva mal escrita «${l}» (se escribe «- area.nombreEnCamello | Nombre en palabras»)`);
    else variablesNuevas.push({ id, nombre });
  }
  return { clave, props, items, alertas, variablesNuevas, errores };
}

// Parecido entre dos textos (pares de letras en común, de 0 a 1). Solo para texto escaneado (OCR).
function parecido(a, b) {
  const pares = (t) => { const m = new Map(); for (let i = 0; i < t.length - 1; i++) { const p = t.slice(i, i + 2); m.set(p, (m.get(p) ?? 0) + 1); } return m; };
  const A = pares(a), B = pares(b);
  let comun = 0;
  for (const [p, n] of A) comun += Math.min(n, B.get(p) ?? 0);
  return (2 * comun) / Math.max(1, a.length - 1 + b.length - 1);
}

// Busca la frase en las páginas indicadas. Exacta (después de normalizar) o, si la tesis es OCR, aproximada.
export function buscarCita(paginas, item, { ocr = false } = {}) {
  const [a, b] = item.pagina;
  if (a < 1 || b > paginas.length) return { ok: false, motivo: `el PDF tiene ${paginas.length} páginas` };
  const texto = normalizar(paginas.slice(a - 1, b).join(' '));
  const cita = normalizar(item.cita);
  if (texto.includes(cita)) return { ok: true, coincidencia: 'exacta' };
  if (!ocr) return { ok: false, motivo: 'la frase no está en esa página' };
  let mejor = 0;
  const paso = Math.max(1, Math.floor(cita.length / 10));
  for (let i = 0; i + cita.length <= texto.length + paso; i += paso) mejor = Math.max(mejor, parecido(cita, texto.slice(i, i + cita.length)));
  if (mejor < SIMILITUD_OCR) return { ok: false, motivo: `no está en esa página (parecido OCR ${mejor.toFixed(2)})` };
  // En texto escaneado se tolera una letra mal leída, nunca un número: cada cifra de la frase debe estar tal cual.
  const faltan = (cita.match(/\d+(?:[.,]\d+)*/g) ?? []).filter((n) => !texto.includes(n));
  return faltan.length
    ? { ok: false, motivo: `parecido OCR ${mejor.toFixed(2)}, pero no aparecen las cifras ${faltan.join(', ')}` }
    : { ok: true, coincidencia: `aproximada (OCR, ${mejor.toFixed(2)})` };
}

// Verifica todas las tesis contra sus textos (dir: carpeta con <texto>.txt). Devuelve { registro, fallas }.
export function verificar(tesis, dir) {
  const registro = {}, fallas = [];
  for (const t of tesis) {
    const archivo = path.join(dir, `${t.props.texto}.txt`);
    if (!fs.existsSync(archivo)) { fallas.push(`${t.clave}: no encuentro ${archivo}`); continue; }
    const crudo = fs.readFileSync(archivo, 'utf8');
    const paginas = crudo.split('\f');
    const items = {};
    for (const it of t.items) {
      const r = buscarCita(paginas, it, { ocr: /^s[ií]$/i.test(t.props.ocr ?? '') });
      if (r.ok) items[huella(it)] = r.coincidencia;
      else fallas.push(`${t.clave} · ${it.seccion} · pág. ${it.pagina.join('-')}: ${r.motivo}: «${it.cita}»`);
    }
    registro[t.clave] = { texto_sha256: sha(crudo), items };
  }
  return { registro, fallas };
}

// Cruza las notas con el registro de verificación: cada línea debe estar verificada tal como está escrita.
export function sinVerificar(tesis, registro) {
  const out = [];
  for (const t of tesis) for (const it of t.items) if (!registro?.[t.clave]?.items?.[huella(it)]) out.push(`Tesis/${t.clave}.md · ${it.seccion} · pág. ${it.pagina.join('-')}: sin verificar «${it.cita.slice(0, 60)}…»`);
  return out;
}

// --- Agregado: lo que dicen todas las tesis juntas -----------------------------------------------------------
export function agregar(tesis, { VARIABLES, VINCULOS }) {
  const pares = new Map(), umbrales = new Map(), candidatas = new Map(), nombres = new Map(), errores = [];
  for (const t of tesis) for (const v of t.variablesNuevas ?? []) {
    if (VARIABLES[v.id]) errores.push(`Tesis/${t.clave}.md: «${v.id}» ya es variable de Trofaxis; no va en «Variables nuevas»`);
    else if (nombres.has(v.id) && nombres.get(v.id).nombre !== v.nombre) errores.push(`Tesis/${t.clave}.md: «${v.id}» ya tiene otro nombre en Tesis/${nombres.get(v.id).clave}.md`);
    else if (!nombres.has(v.id)) nombres.set(v.id, { nombre: v.nombre, clave: t.clave });
  }
  const nota = (id, clave) => { if (!VARIABLES[id]) { if (!candidatas.has(id)) candidatas.set(id, new Set()); candidatas.get(id).add(clave); } };
  for (const t of tesis) for (const it of t.items) {
    if (it.seccion === 'Relaciones') {
      const k = `${it.de} → ${it.a}`;
      if (!pares.has(k)) pares.set(k, { de: it.de, a: it.a, items: [] });
      pares.get(k).items.push({ ...it, clave: t.clave });
      nota(it.de, t.clave); nota(it.a, t.clave);
    } else if (it.seccion === 'Umbrales') {
      if (!umbrales.has(it.variable)) umbrales.set(it.variable, []);
      umbrales.get(it.variable).push({ ...it, clave: t.clave });
      nota(it.variable, t.clave);
    }
  }
  const vinculoDe = (de, a) => VINCULOS.filter((v) => v.a === a && v.de.includes(de)).map((v) => v.id);
  const relaciones = [...pares.values()].map((p) => {
    const cuenta = (f) => p.items.filter(f).length;
    return {
      ...p, tesis: [...new Set(p.items.map((x) => x.clave))],
      medido: { sube: cuenta((x) => x.base === 'medido' && x.sentido === '+'), baja: cuenta((x) => x.base === 'medido' && x.sentido === '−'),
        sinEfecto: cuenta((x) => x.base === 'medido' && (x.sentido === '0' || x.sentido.endsWith('n.s.'))) },
      otras: cuenta((x) => x.base !== 'medido'),
      vinculos: vinculoDe(p.de, p.a),
    };
  }).sort((x, y) => y.tesis.length - x.tesis.length || x.de.localeCompare(y.de));
  // Toda variable candidata necesita un nombre en palabras (sección «Variables nuevas» de alguna tesis).
  for (const id of candidatas.keys()) if (!nombres.has(id)) errores.push(`Tesis: la variable candidata «${id}» no tiene nombre; agrégala en «## Variables nuevas» de la tesis que la usa`);
  for (const [id, n] of nombres) if (!candidatas.has(id)) errores.push(`Tesis/${n.clave}.md: «${id}» está en «Variables nuevas» pero ninguna línea la usa`);
  return {
    relaciones, umbrales: [...umbrales.entries()].sort(), errores,
    candidatas: [...candidatas.entries()].map(([id, s]) => ({ id, nombre: nombres.get(id)?.nombre ?? id, tesis: [...s] })).sort((x, y) => x.id.localeCompare(y.id)),
  };
}

const nombreVar = (VARIABLES, id, ag) => (VARIABLES[id] ? `[[${id}|${VARIABLES[id].nombre}]]` : `${ag?.candidatas.find((c) => c.id === id)?.nombre ?? id} (\`${id}\`, candidata)`);
const pag = (it) => `pág. ${[...new Set(it.pagina)].join('–')}`;

export function notaResumen(tesis, ag, { VARIABLES }) {
  const lineas = ['# Lo que dicen las tesis (generado)', '',
    '> Generado por `node scripts/cerebro.mjs` a partir de las notas de esta carpeta. No editar: edita la nota de cada tesis.',
    '> Solo entra lo verificado: cada frase está en la página que se indica del PDF. Nada de esto cambia un puntaje por sí solo.', '',
    `**${tesis.length} tesis · ${tesis.reduce((s, t) => s + t.items.length, 0)} líneas verificadas · ${ag.relaciones.length} pares de variables · ${ag.candidatas.length} variables candidatas**`, '',
    '## Relaciones entre variables', '',
    '| De → a | Tesis | Medido: sube / baja / sin efecto | Otras (citado o afirmado) | Vínculo de Trofaxis |', '|---|---|---|---|---|',
    ...ag.relaciones.map((r) => `| ${nombreVar(VARIABLES, r.de, ag)} → ${nombreVar(VARIABLES, r.a, ag)} | ${r.tesis.map((c) => `[[${c}]]`).join(', ')} | ${r.medido.sube} / ${r.medido.baja} / ${r.medido.sinEfecto} | ${r.otras} | ${r.vinculos.length ? r.vinculos.map((v) => `[[${v}]]`).join(', ') : 'ninguno (candidato)'} |`),
    '', '### Detalle', ''];
  for (const r of ag.relaciones) {
    lineas.push(`**${nombreVar(VARIABLES, r.de, ag)} → ${nombreVar(VARIABLES, r.a, ag)}**`, '');
    for (const it of r.items) lineas.push(`- ${it.sentido} · ${it.base} · ${it.resultado} — [[${it.clave}]], ${pag(it)}: «${it.cita}»`);
    lineas.push('');
  }
  lineas.push('## Umbrales y rangos por variable', '', '> Candidatos para los cortes de las rúbricas. No están programados: los cortes siguen siendo criterio propio hasta que un especialista los valide.', '');
  for (const [v, its] of ag.umbrales) {
    lineas.push(`**${nombreVar(VARIABLES, v, ag)}**`, '');
    for (const it of its) lineas.push(`- ${it.umbral} — [[${it.clave}]], ${pag(it)}: «${it.cita}»`);
    lineas.push('');
  }
  lineas.push('## Fórmulas', '');
  for (const t of tesis) for (const it of t.items.filter((x) => x.seccion === 'Fórmulas')) lineas.push(`- **${it.nombre}:** ${it.formula} — [[${t.clave}]], ${pag(it)}`);
  lineas.push('', '## Variables candidatas', '', '> Aparecen en las tesis pero todavía no son variables de Trofaxis.', '');
  for (const c of ag.candidatas) lineas.push(`- **${c.nombre}** (\`${c.id}\`) — ${c.tesis.map((k) => `[[${k}]]`).join(', ')}`);
  const alertas = tesis.filter((t) => t.alertas.length);
  if (alertas.length) {
    lineas.push('', '## Alertas', '');
    for (const t of alertas) for (const a of t.alertas) lineas.push(`- [[${t.clave}]]: ${a}`);
  }
  lineas.push('');
  return lineas.join('\n');
}

// Datos de las tesis para la app (solo lo verificado, sin el texto completo de la tesis).
export function datosApp(tesis, registro, ag) {
  return {
    tesis: tesis.map((t) => ({
      clave: t.clave, cita: t.props.cita, tema: t.props.tema, cultivo: t.props.cultivo ?? '', lugar: t.props.lugar ?? '', aporta: t.props.aporta ?? '',
      items: t.items.map((it) => ({ ...it, pagina: [...new Set(it.pagina)].join('–'), coincidencia: registro[t.clave].items[huella(it)] })),
      alertas: t.alertas,
    })),
    relaciones: ag.relaciones.map((r) => ({ de: r.de, a: r.a, tesis: r.tesis, medido: r.medido, otras: r.otras, vinculos: r.vinculos })),
    candidatas: ag.candidatas,
  };
}
