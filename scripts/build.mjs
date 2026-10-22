// Prepara la copia que se publica en GitHub Pages (ver docs/build.md).
// Copia a dist/ los archivos del repo, junta en app/app.js los módulos que src/app.js carga al abrir
// y genera el sw.js de esa copia. src/ se sigue publicando porque el panel de administración lo importa.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CARPETA_APP = 'app';
const SCRIPT_FUENTE = '<script type="module" src="src/app.js"></script>';
const SCRIPT_PUBLICADO = `<script type="module" src="${CARPETA_APP}/app.js"></script>`;

// Las vistas que se cargan al abrirlas usan import(conIntento('./ruta.js', intento)) (ver
// src/core/carga-diferida.js). Cada destino se empaqueta como su propio archivo en la misma ruta
// relativa, así el import() del código, que esbuild no toca, lo encuentra también con ?r=N.
const IMPORT_DIFERIDO = /\bimport\(\s*conIntento\(\s*'([^']+)'/g;
const IMPORT_LITERAL = /\bimport\(\s*(['"`])[^'"`$]+\1\s*\)/g;
const CUALQUIER_IMPORT = /\bimport\(\s*(?!\))/g;

export function importsDiferidos(codigo, archivo) {
  const destinos = [...codigo.matchAll(IMPORT_DIFERIDO)].map((m) => m[1]);
  const conocidos = destinos.length + [...codigo.matchAll(IMPORT_LITERAL)].length;
  const total = [...codigo.matchAll(CUALQUIER_IMPORT)].length;
  if (total !== conocidos) {
    throw new Error(`${archivo}: import() con un argumento que el build no sabe empaquetar; usa import(conIntento('./ruta.js', intento)).`);
  }
  return destinos;
}

function archivosJs(directorio) {
  return fs.readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) return archivosJs(ruta);
    return entrada.name.endsWith('.js') ? [ruta] : [];
  });
}

// Rutas relativas a src/ de cada vista diferida, sin repetir.
export function entradasDiferidas(raiz = RAIZ) {
  const src = path.join(raiz, 'src');
  const entradas = new Set();
  for (const archivo of archivosJs(src)) {
    for (const destino of importsDiferidos(fs.readFileSync(archivo, 'utf8'), path.relative(raiz, archivo))) {
      const absoluto = path.resolve(path.dirname(archivo), destino);
      if (!fs.existsSync(absoluto)) throw new Error(`${path.relative(raiz, archivo)} importa ${destino}, que no existe.`);
      entradas.add(path.relative(src, absoluto).split(path.sep).join('/'));
    }
  }
  return [...entradas].sort();
}

// `precargas`: los archivos comunes que app.js importa al abrir. Con modulepreload el navegador los
// pide junto con app.js, en vez de esperar a leer app.js para descubrirlos (una vuelta de red menos).
export function reescribirIndex(html, precargas = []) {
  const partes = html.split(SCRIPT_FUENTE);
  if (partes.length !== 2) throw new Error(`index.html debe tener una sola vez ${SCRIPT_FUENTE}`);
  const sangria = partes[0].match(/[\t ]*$/)[0];
  const enlaces = precargas.map((ruta) => `<link rel="modulepreload" href="${ruta}">\n${sangria}`).join('');
  return partes.join(enlaces + SCRIPT_PUBLICADO);
}

export function leerAppShell(sw) {
  const bloque = sw.match(/const APP_SHELL = (\[[\s\S]*?\]);/);
  if (!bloque) throw new Error('sw.js no tiene APP_SHELL');
  return JSON.parse(bloque[1]);
}

// Los módulos de src/ quedan fuera de la caché: la app publicada usa los de app/. Se conservan
// estilos, fuentes, íconos y la página. Los mapas de fuente solo los piden las herramientas del navegador.
export function appShellPublicado(shellFuente, archivosApp) {
  const sinModulos = shellFuente.filter((recurso) => !(recurso.startsWith('/src/') && recurso.endsWith('.js')));
  const app = archivosApp.filter((ruta) => !ruta.endsWith('.map')).map((ruta) => `/${ruta}`).sort();
  return [...sinModulos, ...app];
}

// Misma regla que tests/pwa.test.js: SHA-256 de rutas y contenidos del app shell.
export function versionCache(raiz, shell) {
  const hash = createHash('sha256');
  for (const recurso of shell) {
    const ruta = path.join(raiz, recurso === '/' ? 'index.html' : recurso.replace(/^\//, ''));
    const bytes = fs.readFileSync(ruta);
    const contenido = /\.(?:png|woff2)$/i.test(ruta) ? bytes : bytes.toString('utf8').replace(/\r\n?/g, '\n');
    hash.update(recurso).update('\0').update(contenido).update('\0');
  }
  return `trofaxis-shell-${hash.digest('hex').slice(0, 12)}`;
}

export function reescribirSw(sw, shell, nombreCache) {
  if (!/const CACHE_NAME = '[^']+';/.test(sw)) throw new Error('sw.js no tiene CACHE_NAME');
  leerAppShell(sw);
  return sw
    .replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = '${nombreCache}';`)
    .replace(/const APP_SHELL = \[[\s\S]*?\];/, `const APP_SHELL = ${JSON.stringify(shell, null, 2)};`);
}

// Lo mismo que GitHub Pages publica hoy desde la rama: los archivos del repo, sin la configuración de Git.
function copiarSitio(raiz, destino) {
  const archivos = execFileSync('git', ['ls-files', '-z'], { cwd: raiz, encoding: 'utf8' }).split('\0').filter(Boolean);
  for (const archivo of archivos) {
    if (archivo.startsWith('.github/') || archivo === '.gitignore') continue;
    const origen = path.join(raiz, archivo);
    if (!fs.existsSync(origen)) continue;
    fs.mkdirSync(path.dirname(path.join(destino, archivo)), { recursive: true });
    fs.copyFileSync(origen, path.join(destino, archivo));
  }
}

export async function construir({ raiz = RAIZ, destino = path.join(raiz, 'dist') } = {}) {
  const { build } = await import('esbuild');
  fs.rmSync(destino, { recursive: true, force: true });
  copiarSitio(raiz, destino);

  const diferidas = entradasDiferidas(raiz);
  const salidaApp = path.join(destino, CARPETA_APP);
  const resultado = await build({
    absWorkingDir: raiz,
    entryPoints: ['app.js', ...diferidas].map((entrada) => path.join(raiz, 'src', entrada)),
    outbase: path.join(raiz, 'src'),
    outdir: salidaApp,
    bundle: true,
    splitting: true,
    format: 'esm',
    minify: true,
    sourcemap: 'linked',
    charset: 'utf8',
    entryNames: '[dir]/[name]',
    chunkNames: 'comun/[name]-[hash]',
    metafile: true,
    logLevel: 'warning',
    // Los import(conIntento(...)) quedan sin empaquetar a propósito: apuntan a las entradas de arriba.
    logOverride: { 'unsupported-dynamic-import': 'silent' },
  });

  for (const entrada of diferidas) {
    if (!fs.existsSync(path.join(salidaApp, entrada))) throw new Error(`falta ${CARPETA_APP}/${entrada} en dist`);
  }
  // El metafile da las rutas relativas a absWorkingDir (raiz); aquí se pasan a rutas dentro de dist.
  const aDist = (salida) => path.relative(destino, path.resolve(raiz, salida)).split(path.sep).join('/');
  const archivosApp = Object.keys(resultado.metafile.outputs).map(aDist);
  const salidaPrincipal = Object.keys(resultado.metafile.outputs).find((salida) => aDist(salida) === `${CARPETA_APP}/app.js`);
  const precargas = resultado.metafile.outputs[salidaPrincipal].imports
    .filter((i) => i.kind === 'import-statement')
    .map((i) => aDist(i.path));
  const rutaIndex = path.join(destino, 'index.html');
  fs.writeFileSync(rutaIndex, reescribirIndex(fs.readFileSync(rutaIndex, 'utf8'), precargas));

  const rutaSw = path.join(destino, 'sw.js');
  const swFuente = fs.readFileSync(rutaSw, 'utf8');
  const shell = appShellPublicado(leerAppShell(swFuente), archivosApp);
  for (const recurso of shell) {
    const ruta = path.join(destino, recurso === '/' ? 'index.html' : recurso.replace(/^\//, ''));
    if (!fs.existsSync(ruta)) throw new Error(`el app shell publicado apunta a un archivo inexistente: ${recurso}`);
  }
  fs.writeFileSync(rutaSw, reescribirSw(swFuente, shell, versionCache(destino, shell)));

  const js = archivosApp.filter((ruta) => ruta.endsWith('.js'));
  const bytes = js.reduce((total, ruta) => total + fs.statSync(path.join(destino, ruta)).size, 0);
  return { destino, archivos: js, bytes, diferidas };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { destino, archivos, bytes, diferidas } = await construir();
  console.log(`dist listo en ${path.relative(process.cwd(), destino) || '.'}: ${archivos.length} archivos JS (${Math.round(bytes / 1024)} KB), ${diferidas.length} vistas diferidas.`);
}
