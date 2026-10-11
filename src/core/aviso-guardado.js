// ¿Pudo el navegador guardar? El autoguardado es la única copia de la finca (la nube es opcional): si falla
// (modo privado, almacenamiento lleno o datos del sitio bloqueados), la app lo dice en vez de callarlo.
export const guardado = { fallo: false, descartado: false };

// Registra el resultado de un intento de guardar y lo devuelve. El último intento manda.
export const marcarGuardado = (ok) => { guardado.fallo = !ok; return ok; };

export const TEXTO_AVISO = 'Tus cambios no se están guardando en este navegador (modo privado, almacenamiento lleno o datos del sitio bloqueados). Exporta tu finca para no perderlos.';
