// Los textos que ve el usuario no hablan de cómo se construyó la app (etapas, variables internas,
// «la clase», «la app real»). Revisa las líneas de código que no son comentarios.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const archivos = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? archivos(path.join(dir, e.name)) : e.name.endsWith('.js') ? [path.join(dir, e.name)] : []);
const lineas = archivos('src').flatMap((a) => fs.readFileSync(a, 'utf8').split('\n')
  .map((l, i) => ({ a, n: i + 1, l })).filter(({ l }) => !/^\s*(\/\/|\*|\/\*)/.test(l)));

const prohibidas = [
  [/\bEtapa [0-9]/, 'etapas de desarrollo'],
  [/\bla clase (indica|pide|señala)/i, '«la clase» (usar la guía de Zamorano)'],
  [/app real/, '«la app real»'],
  [/CONFIG\.[a-z]+\.[a-z]+<\/code>/, 'nombres de variables internas en pantalla'],
  [/k-NN/, 'jerga técnica (k-NN)'],
  [/competidor/, 'argumento de venta para el creador'],
  [/documentos del proyecto/, '«documentos del proyecto»'],
  [/ahora se registran/, 'aviso de cambio de versión'],
];

for (const [re, que] of prohibidas) {
  test(`sin ${que} en los textos de la app`, () => {
    const hallazgos = lineas.filter(({ l }) => re.test(l)).map(({ a, n }) => `${a}:${n}`);
    assert.deepEqual(hallazgos, []);
  });
}
