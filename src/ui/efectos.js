// Movimiento de la interfaz: los números que cuentan al entrar a una vista y la finca 3D que se inclina con el puntero.
// Con «reducir movimiento» activado en el sistema no se anima nada. Es solo presentación: no cambia ningún dato.
const consulta = (q) => !!globalThis.window?.matchMedia?.(q)?.matches;
export const sinMovimiento = () => consulta('(prefers-reduced-motion: reduce)');

// Cuenta de 0 al valor final (data-contar) en ~0,9 s. El texto final ya está en el HTML: si algo falla, se ve igual.
// `ya`: ms que lleva la entrada (si se redibujó a mitad, sigue desde ahí).
function contar(raiz, ya) {
  const raf = globalThis.window?.requestAnimationFrame, dura = 900;
  if (!raf || ya >= dura) return;
  for (const el of raiz.querySelectorAll('[data-contar]')) {
    const fin = Number(el.dataset.contar);
    if (!Number.isFinite(fin) || fin <= 0) continue;
    const inicio = performance.now() - ya;
    const paso = (t) => {
      const x = Math.min(1, Math.max(0, (t - inicio) / dura)), suave = 1 - (1 - x) ** 3;
      el.textContent = String(Math.round(fin * suave));
      if (x < 1 && el.isConnected) raf(paso);
    };
    paso(performance.now()); // sin esperar al primer cuadro: así no se ve el número final un instante
  }
}

// La escena 3D sigue un poco al puntero (solo con mouse); al salir vuelve a su sitio.
function inclinar(raiz) {
  if (!consulta('(pointer: fine)')) return;
  for (const el of raiz.querySelectorAll('[data-inclinar]')) {
    if (el.dataset.inclinarListo) continue;
    el.dataset.inclinarListo = '1';
    el.addEventListener('pointermove', (ev) => {
      const r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }
}

// Se llama después de cada dibujo; `msEntrada` son los ms desde que se entró a la vista, o null si la entrada ya terminó.
export function montarEfectos(raiz, msEntrada) {
  if (!raiz?.querySelectorAll || sinMovimiento()) return;
  if (msEntrada != null) contar(raiz, msEntrada);
  inclinar(raiz);
}
