import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const manifiesto = JSON.parse(readFileSync(path.join(raiz, 'manifest.webmanifest'), 'utf8'));

const iconosOriginales = [
  { src: '/icons/trofaxis-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/icons/trofaxis-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: '/icons/trofaxis-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
  { src: '/icons/trofaxis-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];
const hashesIconosOriginales = {
  '/icons/trofaxis-192.png': '5B3201317CDE16EFDA5EE5A8AC21817B52973D050574EA505F51116483019651',
  '/icons/trofaxis-512.png': '04A21D2971119946B0ED59AD178A22E3965DCE719CC81C43B81D996B5EA4E4BF',
  '/icons/trofaxis-maskable-192.png': '198F1DBDE55C24DECAFFFECF015B494CA0DFA89977FADC1D503AAC8FBF270C7A',
  '/icons/trofaxis-maskable-512.png': '2754FEA23FBA539C2AE4C0C7DBD68C6AD1DF8CD4E6F884C255D2C712184C3A9C',
};

test('el manifiesto incluye capturas PNG reales en formato ancho y angosto con tamaños válidos', () => {
  assert.ok(Array.isArray(manifiesto.screenshots), 'faltan las capturas del manifiesto');
  assert.ok(manifiesto.screenshots.some((captura) => captura.form_factor === 'wide'), 'falta una captura wide');
  assert.ok(manifiesto.screenshots.some((captura) => captura.form_factor === 'narrow'), 'falta una captura narrow');

  for (const captura of manifiesto.screenshots) {
    assert.equal(captura.type, 'image/png', `${captura.src} debe declararse como PNG`);
    assert.match(captura.sizes, /^\d+x\d+$/, `${captura.src} debe declarar sus medidas`);
    const ruta = path.join(raiz, captura.src.replace(/^\/+/, ''));
    assert.ok(existsSync(ruta), 'falta el archivo de captura: ' + captura.src);
    const png = readFileSync(ruta);
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${captura.src} no es PNG`);
    const [ancho, alto] = captura.sizes.split('x').map(Number);
    assert.equal(png.readUInt32BE(16), ancho, `ancho incorrecto: ${captura.src}`);
    assert.equal(png.readUInt32BE(20), alto, `alto incorrecto: ${captura.src}`);
  }
});

test('el manifiesto queda listo para Store sin alterar alcance ni íconos instalables', () => {
  assert.ok(Array.isArray(manifiesto.categories), 'faltan las categorías del manifiesto');
  assert.ok(manifiesto.categories.includes('productivity'));
  assert.ok(manifiesto.categories.includes('utilities'));
  assert.equal(manifiesto.prefer_related_applications, false);
  assert.equal(manifiesto.id, '/');
  assert.equal(manifiesto.start_url, '/');
  assert.equal(manifiesto.scope, '/');
  assert.deepEqual(manifiesto.icons, iconosOriginales);

  for (const [ruta, hash] of Object.entries(hashesIconosOriginales)) {
    const bytes = readFileSync(path.join(raiz, ruta.replace(/^\/+/, '')));
    assert.equal(createHash('sha256').update(bytes).digest('hex').toUpperCase(), hash, `cambió el ícono ${ruta}`);
  }
});
