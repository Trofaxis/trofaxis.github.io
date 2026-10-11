// Región de avisos para lectores de pantalla (issue 40). Es lo único de la página que se anuncia solo:
// la vista entera se redibuja en cada cambio y no debe leerse de nuevo.
export function anunciar(texto, region = document.getElementById('avisos'), esperar = setTimeout) {
  if (!region) return;
  region.textContent = ''; // vaciar primero: así un mismo aviso repetido se vuelve a leer
  if (texto) esperar(() => { region.textContent = texto; }, 50);
}
