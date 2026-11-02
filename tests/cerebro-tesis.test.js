// Piloto de lectura de tesis (2026-11-02): cada línea de cerebro/Tesis/ trae página y frase textual,
// y solo entra si un programa encontró la frase en esa página del PDF (cerebro/Tesis/_verificacion.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { construir, cargarCodigo, escribir } from '../scripts/cerebro.mjs';
import { leerSeccionTesis, buscarCita, normalizar, leerPagina, huella } from '../scripts/tesis.mjs';
import { TESIS } from '../src/cerebro/tesis.js';
import { VINCULOS } from '../src/cerebro/vinculos.js';

const codigo = await cargarCodigo();

test('las 13 tesis del piloto están en la bóveda y todas sus líneas están verificadas', () => {
  const r = construir(codigo);
  assert.deepEqual(r.errores, []);
  assert.equal(r.tesis.length, 13);
  const lineas = TESIS.tesis.reduce((s, t) => s + t.items.length, 0);
  assert.ok(lineas >= 70, `solo ${lineas} líneas`);
  for (const t of TESIS.tesis) for (const it of t.items) assert.ok(it.coincidencia, `${t.clave}: «${it.cita}» sin verificar`);
});

test('una línea de tesis exige sentido, base, página y una frase verificable', () => {
  const r = leerSeccionTesis([
    '- riego.sistema | riesgo.agua | + | medido | ahorra agua | pág. 4 | "se logró un ahorro de agua del 58.2%"',
    '- riego.sistema | riesgo.agua | mucho | medido | x | pág. 4 | "una frase suficientemente larga"',
    '- riego.sistema | riesgo.agua | + | supuesto | x | pág. 4 | "una frase suficientemente larga"',
    '- riego.sistema | riesgo.agua | + | medido | x | página cuatro | "una frase suficientemente larga"',
    '- riego.sistema | riesgo.agua | + | medido | x | pág. 4 | "corta"',
    '- riego.sistema | riesgo.agua | pág. 4 | "faltan campos en esta línea"',
  ].join('\n'), 'Relaciones');
  assert.equal(r.items.length, 1);
  assert.deepEqual(r.items[0].pagina, [4, 4]);
  assert.equal(r.errores.length, 5);
  assert.deepEqual(leerPagina('pág. 32–33'), [32, 33]);
  assert.equal(leerPagina('pág. 3-9'), null, 'un rango de más de tres páginas no sirve como cita');
});

test('el verificador encuentra la frase aunque el PDF la parta en líneas, y no en otra página ni con otra cifra', () => {
  const paginas = ['portada', 'Se logró un ahorro de agua del\n58.2% en relación al sistema\nde riego por codo.', 'otra página'];
  const it = (cita, p = 2) => ({ pagina: [p, p], cita });
  assert.equal(buscarCita(paginas, it('se logró un ahorro de agua del 58.2% en relación al sistema')).coincidencia, 'exacta');
  assert.equal(buscarCita(paginas, it('se logró un ahorro de agua del 58.2% en relación al sistema', 3)).ok, false);
  assert.equal(buscarCita(paginas, it('se logró un ahorro de agua del 85.2% en relación al sistema')).ok, false);
  assert.equal(buscarCita(paginas, it('se logró un ahorro de agua del 58.2% en relación al sistema', 9)).ok, false);
  assert.equal(normalizar('Ácido  “x”\n— y'), 'acido"x"-y');
});

test('en texto escaneado tolera letras mal leídas, pero nunca una cifra distinta', () => {
  const paginas = ['A mayor densidad se obtuvo mayor numero de bellotas cosechables por planta y se redujo Ia pudrici6n en 120,000 plt/ha.'];
  const it = (cita) => ({ pagina: [1, 1], cita });
  assert.match(buscarCita(paginas, it('A mayor densidad se obtuvo mayor número de bellotas cosechables por planta y se redujo la pudrición'), { ocr: true }).coincidencia, /^aproximada/);
  assert.equal(buscarCita(paginas, it('A mayor densidad se obtuvo mayor número de bellotas cosechables por planta en 210,000 plt/ha'), { ocr: true }).ok, false);
  assert.equal(buscarCita(paginas, it('A mayor densidad se obtuvo mayor número de bellotas cosechables por planta y se redujo la pudrición'), { ocr: false }).ok, false);
});

// Bóveda falsa en una carpeta temporal (incluye las tesis y su verificación), para probar las reglas.
function bovedaFalsa(editar) {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'trofaxis-tesis-'));
  escribir(construir(codigo).archivos, raiz);
  editar(path.join(raiz, 'cerebro'));
  return construir({ ...codigo, raiz });
}
const cambiar = (archivo, de, a) => { const t = fs.readFileSync(archivo, 'utf8'); assert.ok(t.includes(de)); fs.writeFileSync(archivo, t.replace(de, a)); };

test('cambiar una frase o una página de una tesis sin volver a verificarla es un error', () => {
  const r = bovedaFalsa((d) => cambiar(path.join(d, 'Tesis', 'molina-2009.md'), 'ahorro de agua del 58.2%', 'ahorro de agua del 85.2%'));
  assert.ok(r.errores.some((e) => e.includes('molina-2009') && e.includes('sin verificar')));
  const r2 = bovedaFalsa((d) => cambiar(path.join(d, 'Tesis', 'molina-2009.md'), '| pág. 4 | "se logró', '| pág. 5 | "se logró'));
  assert.ok(r2.errores.some((e) => e.includes('molina-2009') && e.includes('sin verificar')));
});

test('una evidencia que cita una tesis debe apuntar a una página con una frase verificada', () => {
  const r = bovedaFalsa((d) => cambiar(path.join(d, 'Vínculos', 'agua-sistema.md'), '| [[molina-2009]] | pág. 4 |', '| [[molina-2009]] | pág. 30 |'));
  assert.ok(r.errores.some((e) => e.includes('agua-sistema') && e.includes('molina-2009')));
  const r2 = bovedaFalsa((d) => cambiar(path.join(d, 'Vínculos', 'agua-sistema.md'), '| [[molina-2009]] | pág. 4 |', '| [[molina-2009]] | Resumen |'));
  assert.ok(r2.errores.some((e) => e.includes('agua-sistema') && e.includes('molina-2009')));
});

test('leer tesis no cambió el estado de ningún vínculo: los cortes siguen siendo criterio propio', () => {
  const estado = Object.fromEntries(VINCULOS.map((v) => [v.id, v.estado]));
  for (const id of ['agua-sistema', 'agua-fertirriego', 'suelo-pendiente']) assert.equal(estado[id], 'criterio propio', id);
  assert.equal(estado['poli-abundancia'], 'por validar');
  const k = TESIS.tesis.find((t) => t.clave === 'kuniyoshi').items.find((it) => it.seccion === 'Relaciones' && it.base === 'medido');
  assert.equal(k.sentido, '+ n.s.', 'Kuniyoshi: la relación flores-abejas no fue significativa');
});

test('los datos de tesis de la app no traen coordenadas', () => {
  const texto = JSON.stringify(TESIS);
  assert.doesNotMatch(texto, /-?8[67]\.\d{3,}|\b1[3-5]\.\d{4,}/, 'parece una coordenada de Honduras');
  assert.doesNotMatch(texto, /coordenadas? (?:de|del) (?:árbol|árboles)\s*[:=]/i);
});

test('la huella de una línea depende de la frase y la página, no de los espacios', () => {
  const a = { seccion: 'Datos', pagina: [4, 4], cita: 'Se obtuvo en promedio CUC de 95.8%' };
  assert.equal(huella(a), huella({ ...a, cita: 'Se obtuvo  en promedio\nCUC de 95.8%' }));
  assert.notEqual(huella(a), huella({ ...a, pagina: [5, 5] }));
});

test('el explorador del cerebro lista las tesis y muestra cada línea con su página', async () => {
  const { explorar, detalleTesis } = await import('../src/admin/cerebro.js');
  assert.equal(explorar({ tipo: 'tesis' }).tesis.length, 13);
  assert.ok(explorar({ texto: 'goteo codo' }).tesis.some((t) => t.clave === 'molina-2009'));
  const html = detalleTesis(TESIS.tesis.find((t) => t.clave === 'molina-2009'));
  assert.match(html, /pág\. 4 del PDF/);
  assert.match(html, /58\.2%/);
});
