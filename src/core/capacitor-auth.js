import { sesionDeHash } from '../nube/cliente.js';

export const URL_RETORNO_NATIVA = 'io.github.trofaxis.app://login';

export function esCapacitorNativo(capacitor) {
  return capacitor?.isNativePlatform?.() === true;
}

export function urlRetornoAuth(capacitor, ubicacion) {
  return esCapacitorNativo(capacitor)
    ? URL_RETORNO_NATIVA
    : `${ubicacion.origin}${ubicacion.pathname}`;
}

export function sesionDeURLProfunda(url) {
  try {
    const enlace = new URL(url);
    if (enlace.protocol !== 'io.github.trofaxis.app:' || enlace.hostname !== 'login') return null;
    return sesionDeHash(enlace.hash);
  } catch {
    return null;
  }
}

export function crearPuenteCapacitor(capacitor) {
  if (!esCapacitorNativo(capacitor) || typeof capacitor.registerPlugin !== 'function') return null;

  const app = capacitor.registerPlugin('App');
  const browser = capacitor.registerPlugin('Browser');
  let ultimoEnlace = '';

  async function recibirEnlace(url, procesar) {
    if (typeof url !== 'string' || !url || url === ultimoEnlace) return;
    ultimoEnlace = url;
    try { await browser.close(); } catch { /* Browser puede haberse cerrado al volver desde el sistema. */ }
    procesar(url);
  }

  return {
    nativo: true,
    abrirLogin(url) {
      return browser.open({ url });
    },
    async preparar(procesar) {
      await app.addListener('appUrlOpen', ({ url }) => recibirEnlace(url, procesar));
      const inicio = await app.getLaunchUrl();
      if (inicio?.url) await recibirEnlace(inicio.url, procesar);
    },
  };
}
