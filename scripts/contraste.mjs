// Calcula el contraste WCAG 2.x entre dos colores hex. Lo usa el agente auditor-ux-movil para medir en vez de estimar.
// Uso: node scripts/contraste.mjs "#0F2A1E" "#EEF2EB"   → 13.05:1 AA ✓ AAA ✓
// Solo colores opacos (#RGB o #RRGGBB); un fondo translúcido hay que resolverlo antes contra su color de base.
import { fileURLToPath } from 'node:url';

export function luminancia(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Color no válido: ${hex} (usa #RGB o #RRGGBB)`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a, b) {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [a, b] = process.argv.slice(2);
  if (!a || !b) {
    console.error('Uso: node scripts/contraste.mjs "#texto" "#fondo"');
    process.exit(1);
  }
  const c = contraste(a, b);
  console.log(`${c.toFixed(2)}:1 AA ${c >= 4.5 ? '✓' : '✗'} AAA ${c >= 7 ? '✓' : '✗'}`);
}
