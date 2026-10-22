// Polen del fondo: puntos dorados y verdes que suben despacio detrás de los paneles. Es decoración, no muestra datos.
// Solo en escritorio con mouse y sin «reducir movimiento»; se detiene con la pestaña oculta.
const COLORES = ['217,164,65', '123,220,147', '244,213,141'];

export function montarPolen(canvas) {
  const w = globalThis.window, doc = globalThis.document;
  if (!canvas?.getContext || !w?.matchMedia || !w.requestAnimationFrame) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const apto = () => w.matchMedia('(min-width: 901px) and (pointer: fine)').matches && !w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let puntos = [], ancho = 0, alto = 0, cuadro = 0;
  const nuevo = (y) => ({
    x: Math.random() * ancho, y: y ?? Math.random() * alto, r: 0.6 + Math.random() * 1.7, vy: 0.08 + Math.random() * 0.22,
    fase: Math.random() * 6.28, vaiven: 6 + Math.random() * 14, a: 0.18 + Math.random() * 0.42, c: COLORES[(Math.random() * COLORES.length) | 0],
  });
  function medir() {
    const dpr = Math.min(w.devicePixelRatio || 1, 2);
    ancho = w.innerWidth; alto = w.innerHeight;
    canvas.width = Math.round(ancho * dpr); canvas.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    puntos = Array.from({ length: Math.round(Math.min(70, ancho * alto / 24000)) }, () => nuevo());
  }
  function dibujar() {
    ctx.clearRect(0, 0, ancho, alto);
    for (const p of puntos) {
      p.y -= p.vy; p.fase += 0.008;
      if (p.y < -8) Object.assign(p, nuevo(alto + 8));
      const brillo = p.a * (0.65 + 0.35 * Math.sin(p.fase * 3));
      ctx.fillStyle = `rgba(${p.c},${brillo.toFixed(3)})`;
      ctx.shadowColor = `rgba(${p.c},${(brillo * 0.8).toFixed(3)})`;
      ctx.shadowBlur = p.r * 5;
      ctx.beginPath(); ctx.arc(p.x + Math.sin(p.fase) * p.vaiven, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    cuadro = w.requestAnimationFrame(dibujar);
  }
  const parar = () => { if (cuadro) w.cancelAnimationFrame(cuadro); cuadro = 0; ctx.clearRect(0, 0, ancho, alto); };
  const arrancar = () => { if (cuadro || !apto() || doc?.hidden) return; medir(); cuadro = w.requestAnimationFrame(dibujar); };
  w.addEventListener('resize', () => { if (!apto()) parar(); else if (cuadro) medir(); else arrancar(); });
  doc?.addEventListener?.('visibilitychange', () => (doc.hidden ? parar() : arrancar()));
  arrancar();
  return { parar };
}
