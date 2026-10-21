import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leer = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('la política explica los datos de Supabase, servicios externos y borrado, con contacto por correo', () => {
  const politica = leer('privacidad/index.html');
  for (const texto of ['Supabase Auth', 'finca', 'casos compartidos', 'respuestas anónimas de bienvenida', 'Open-Meteo', 'EOX', 'borrar-cuenta/', 'support.trofaxis@gmail.com']) {
    assert.ok(politica.includes(texto), `falta ${texto}`);
  }
  assert.doesNotMatch(politica, /github\.com\/Trofaxis\/trofaxis\.github\.io\/issues/i);
});

test('la página pública permite pedir el borrado sin la app y distingue lo que se conserva', () => {
  const pagina = leer('privacidad/borrar-cuenta/index.html');
  assert.match(pagina, /Sin la app/);
  assert.match(pagina, /mailto:support\.trofaxis@gmail\.com/);
  assert.match(pagina, /Escribe <b>BORRAR<\/b>/);
  assert.match(pagina, /La finca local, el mapa y el censo/);
  assert.match(pagina, /respuestas anónimas de bienvenida/);
  assert.doesNotMatch(pagina, /<script/i);
});
