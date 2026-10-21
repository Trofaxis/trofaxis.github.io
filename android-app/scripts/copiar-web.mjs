import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directorioScript = path.dirname(fileURLToPath(import.meta.url));
const archivosWeb = ['index.html', 'manifest.webmanifest', 'pwa.js', 'pwa.css', 'sw.js'];
const directoriosWeb = ['src', 'icons', 'privacidad'];

export function copiarWeb({ raizRepo = path.resolve(directorioScript, '../..'), destino = path.resolve(directorioScript, '../www') } = {}) {
  const raiz = path.resolve(raizRepo);
  const salida = path.resolve(destino);
  fs.mkdirSync(salida, { recursive: true });

  for (const archivo of archivosWeb) {
    fs.copyFileSync(path.join(raiz, archivo), path.join(salida, archivo));
  }
  for (const directorio of directoriosWeb) {
    fs.cpSync(path.join(raiz, directorio), path.join(salida, directorio), { recursive: true });
  }

  // La app lleva sus assets empaquetados; omite el arranque PWA solo en esta copia nativa.
  const rutaIndex = path.join(salida, 'index.html');
  const index = fs.readFileSync(rutaIndex, 'utf8');
  const indexNativo = index.replace(/[\t ]*<script type="module" src="pwa\.js"><\/script>\r?\n?/, '');
  if (indexNativo === index) throw new Error('No se encontró la etiqueta PWA esperada en index.html.');
  fs.writeFileSync(rutaIndex, indexNativo);
  return salida;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const salida = copiarWeb();
    console.log(`Web copiada para Android en ${salida}`);
  } catch (error) {
    console.error(`No se pudo preparar la web para Android: ${error.message}`);
    process.exitCode = 1;
  }
}
