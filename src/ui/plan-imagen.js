// Descarga del plan ApiRadar (o del mapa de la finca) como imagen PNG, para mirar, imprimir o compartir.
// Dibuja en un <canvas>: imagen satelital (si hay conexión), árboles de riesgo con su radio, sitios para colonias con su
// veredicto, el punto más alejado, las coordenadas y los pasos del plan. Sin librerías. Las teselas se piden con CORS;
// si no llegan, el mapa sale sobre fondo liso con un aviso.
import { CONFIG } from '../core/config.js';
import { aPixel, teselasVisibles, urlTesela, sitiosFuera } from '../mapa/geo.js';
import { clasificarArboles, evaluarSitios, nombreSitio, VEREDICTO } from '../apiradar/censo.js';

const W = 1200, PAD = 40, MAPA = { w: W - 2 * PAD, h: 640 };
const COL = { verde: '#2C5F4E', claro: '#7BDC93', tinta: '#1A1A1A', gris: '#5F6B66', linea: '#E3E8E5', alto: '#DC2626', medio: '#B45309', bajo: '#16803C', sin: '#8A958F', fondo: '#F4F7F5' };
const VER = { cerca: COL.alto, revisar: COL.medio, lejos: COL.bajo };
const fuente = (peso, px) => `${peso} ${px}px Inter, "Segoe UI", system-ui, sans-serif`;
const coord = (p) => `${p[0].toFixed(5)}, ${p[1].toFixed(5)}`;

// Parte un texto en líneas que caben en `ancho` píxeles.
export function partir(ctx, texto, ancho) {
  const out = [];
  let linea = '';
  for (const p of String(texto).split(/\s+/)) {
    const prueba = linea ? `${linea} ${p}` : p;
    if (ctx.measureText(prueba).width > ancho && linea) { out.push(linea); linea = p; } else linea = prueba;
  }
  if (linea) out.push(linea);
  return out;
}

// Encuadre del mapa: el zoom más alto en el que caben todos los puntos más el radio conservador.
export function encuadre(puntos, margenM, caja = MAPA, zMax = CONFIG.mapa.zoomMax) {
  if (!puntos.length) return null;
  const lats = puntos.map((p) => p[0]), lons = puntos.map((p) => p[1]);
  const lat0 = (Math.min(...lats) + Math.max(...lats)) / 2;
  const dLat = margenM / 111320, dLon = margenM / (111320 * Math.cos((lat0 * Math.PI) / 180));
  const n = Math.max(...lats) + dLat, s = Math.min(...lats) - dLat, e = Math.max(...lons) + dLon, o = Math.min(...lons) - dLon;
  for (let z = zMax; z >= 3; z--) {
    const a = aPixel(n, o, z), b = aPixel(s, e, z);
    if (b.x - a.x <= caja.w && b.y - a.y <= caja.h) return { lat: (n + s) / 2, lon: (e + o) / 2, z };
  }
  return { lat: (n + s) / 2, lon: (e + o) / 2, z: 3 };
}

const cargar = (url, ms = 8000) => new Promise((ok) => {
  const img = new Image();
  const t = setTimeout(() => ok(null), ms);
  img.crossOrigin = 'anonymous';
  img.onload = () => { clearTimeout(t); ok(img); };
  img.onerror = () => { clearTimeout(t); ok(null); };
  img.src = url;
});

function rombo(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); }
function etiqueta(ctx, t, x, y) { ctx.font = fuente(700, 15); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.strokeText(t, x, y); ctx.fillStyle = '#fff'; ctx.fillText(t, x, y); }

async function dibujarMapa(ctx, x0, y0, ubic, cfg) {
  const [rMin, rMax] = cfg.apiradar.radioExclusionM;
  const arboles = clasificarArboles(ubic.arboles ?? []);
  const sitios = evaluarSitios(arboles, ubic.sitios ?? [], [rMin, rMax]);
  const fuera = sitiosFuera(arboles.map((a) => [a.lat, a.lon]), ubic.contorno, [rMin, rMax]);
  const mejor = fuera?.fraccionMin > 0 ? fuera.mejor : null;
  const puntos = [...arboles.map((a) => [a.lat, a.lon]), ...sitios.map((s) => [s.lat, s.lon]), ...(ubic.contorno ?? []), ...(ubic.punto ? [ubic.punto] : []), ...(mejor ? [mejor.punto] : [])];
  const v = encuadre(puntos, arboles.length ? rMax : 100);
  if (!v) return { satelite: false, arboles, sitios, mejor };
  const c = aPixel(v.lat, v.lon, v.z);
  const xy = ([la, lo]) => { const p = aPixel(la, lo, v.z); return [x0 + p.x - c.x + MAPA.w / 2, y0 + p.y - c.y + MAPA.h / 2]; };
  const mPorPx = (156543.03392 * Math.cos((v.lat * Math.PI) / 180)) / 2 ** v.z;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y0, MAPA.w, MAPA.h); ctx.clip();
  ctx.fillStyle = '#DDE6E0'; ctx.fillRect(x0, y0, MAPA.w, MAPA.h);
  const teselas = teselasVisibles(v.lat, v.lon, v.z, MAPA.w, MAPA.h);
  const imgs = await Promise.all(teselas.map((t) => cargar(urlTesela(t))));
  let satelite = imgs.some(Boolean);
  try {
    imgs.forEach((img, i) => { if (img) ctx.drawImage(img, x0 + teselas[i].px, y0 + teselas[i].py, 256, 256); });
    ctx.getImageData(x0, y0, 1, 1); // falla si el lienzo quedó «contaminado» (sin CORS): entonces se usa el fondo liso
  } catch { satelite = false; ctx.fillStyle = '#DDE6E0'; ctx.fillRect(x0, y0, MAPA.w, MAPA.h); }
  if (!satelite) { // rejilla para dar escala sin la imagen
    ctx.strokeStyle = 'rgba(44,95,78,.15)'; ctx.lineWidth = 1;
    for (let gx = x0; gx < x0 + MAPA.w; gx += 80) { ctx.beginPath(); ctx.moveTo(gx, y0); ctx.lineTo(gx, y0 + MAPA.h); ctx.stroke(); }
    for (let gy = y0; gy < y0 + MAPA.h; gy += 80) { ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + MAPA.w, gy); ctx.stroke(); }
  }
  if ((ubic.contorno ?? []).length >= 3) {
    ctx.beginPath(); ubic.contorno.map(xy).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = 'rgba(123,220,147,.12)'; ctx.fill(); ctx.strokeStyle = COL.claro; ctx.lineWidth = 3; ctx.stroke();
  }
  arboles.forEach((a) => {
    const [x, y] = xy([a.lat, a.lon]);
    ctx.beginPath(); ctx.arc(x, y, rMin / mPorPx, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(220,38,38,.10)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,120,110,.9)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([10, 7]); ctx.beginPath(); ctx.arc(x, y, rMax / mPorPx, 0, 2 * Math.PI); ctx.strokeStyle = 'rgba(255,190,90,.9)'; ctx.stroke(); ctx.setLineDash([]);
  });
  arboles.forEach((a) => {
    const [x, y] = xy([a.lat, a.lon]);
    ctx.beginPath(); ctx.arc(x, y, 7, 0, 2 * Math.PI); ctx.fillStyle = COL[a.clase ?? 'sin']; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    etiqueta(ctx, a.id, x + 10, y + 5);
  });
  if (mejor) {
    const [x, y] = xy(mejor.punto);
    ctx.beginPath(); ctx.arc(x, y, 13, 0, 2 * Math.PI); ctx.strokeStyle = COL.claro; ctx.lineWidth = 4; ctx.stroke();
    etiqueta(ctx, 'Punto más alejado', x + 17, y + 5);
  }
  sitios.forEach((s) => {
    const [x, y] = xy([s.lat, s.lon]);
    rombo(ctx, x, y, 12); ctx.fillStyle = VER[s.veredicto] ?? COL.sin; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
    etiqueta(ctx, `${nombreSitio(s)}${s.veredicto ? ` (${VEREDICTO[s.veredicto].texto.toLowerCase()})` : ''}`, x + 16, y + 5);
  });
  if (ubic.punto && !arboles.length) { const [x, y] = xy(ubic.punto); ctx.beginPath(); ctx.arc(x, y, 9, 0, 2 * Math.PI); ctx.fillStyle = '#9A6A0E'; ctx.fill(); }
  // Norte y escala
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(x0 + MAPA.w - 62, y0 + 12, 50, 50);
  ctx.fillStyle = COL.tinta; ctx.font = fuente(700, 20); ctx.textAlign = 'center'; ctx.fillText('N', x0 + MAPA.w - 37, y0 + 34); ctx.fillText('↑', x0 + MAPA.w - 37, y0 + 55); ctx.textAlign = 'left';
  const escala = [50, 100, 200, 500, 1000, 2000, 5000].find((m) => m / mPorPx >= 90) ?? 5000;
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(x0 + 12, y0 + MAPA.h - 44, escala / mPorPx + 70, 32);
  ctx.fillStyle = COL.tinta; ctx.fillRect(x0 + 22, y0 + MAPA.h - 24, escala / mPorPx, 4); ctx.font = fuente(600, 14); ctx.fillText(`${escala >= 1000 ? `${escala / 1000} km` : `${escala} m`}`, x0 + 28 + escala / mPorPx, y0 + MAPA.h - 18);
  if (satelite) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = fuente(400, 11); const t = 'EOxCloudless (Copernicus Sentinel 2024), CC BY-NC-SA 4.0'; ctx.fillRect(x0 + MAPA.w - ctx.measureText(t).width - 16, y0 + MAPA.h - 20, ctx.measureText(t).width + 16, 20); ctx.fillStyle = COL.tinta; ctx.fillText(t, x0 + MAPA.w - ctx.measureText(t).width - 8, y0 + MAPA.h - 6); }
  ctx.restore();
  ctx.strokeStyle = COL.linea; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, MAPA.w, MAPA.h);
  return { satelite, arboles, sitios, mejor, hayMapa: true };
}

// Bloques de texto bajo el mapa: [{ titulo, lineas: [{ t, color?, negrita? }] }].
function bloques(R, mapa, hechas, cfg) {
  const [rMin, rMax] = cfg.apiradar.radioExclusionM;
  const out = [];
  if (R) {
    out.push({ titulo: 'Qué hacer, en orden', items: R.acciones.map((a, i) => ({
      t: `${hechas?.[`ar|${a.id}`] ? '✓ ' : ''}${i + 1}. ${a.titulo}`,
      sub: [`Cuándo: ${a.cuando}.${a.incluida === false ? ' Fuera de tu plan.' : a.delta == null ? '' : a.delta < 0 ? ` Baja el riesgo ${-a.delta} punto(s).` : a.delta > 0 ? ` Sube el riesgo ${a.delta} punto(s) en este orden.` : ' No cambia el puntaje.'}`,
        ...(a.donde?.punto ? [`Dónde: ${a.donde.nombre}, ${coord(a.donde.punto)} (a ${a.donde.distanciaM} m del árbol de riesgo más cercano).`] : []),
        ...(a.donde?.arboles ? [`Dónde: árboles ${a.donde.arboles.map((x) => `${x.id} (${coord(x.punto)})`).join(', ')}.`] : [])],
    })) });
  }
  if (mapa.sitios.length || mapa.mejor) {
    out.push({ titulo: 'Sitios para colonias o refugios', items: [
      ...mapa.sitios.map((s) => ({ t: `${nombreSitio(s)}: ${coord([s.lat, s.lon])}`, sub: [s.veredicto ? `${VEREDICTO[s.veredicto].texto}: a ${s.distanciaM} m del árbol ${s.arbol.id} (${VEREDICTO[s.veredicto].frase}).` : 'Sin árboles para comparar.'], color: VER[s.veredicto] })),
      ...(mapa.mejor ? [{ t: `Punto más alejado de los árboles: ${coord(mapa.mejor.punto)}`, sub: [`A ${mapa.mejor.distanciaM} m del árbol de riesgo más cercano.`], color: COL.bajo }] : []),
    ] });
  }
  if (mapa.arboles.length) {
    const top = [...mapa.arboles].filter((a) => a.vol != null).sort((a, b) => b.vol - a.vol).slice(0, 8);
    if (top.length) out.push({ titulo: 'Árboles de riesgo con más copa', items: top.map((a) => ({ t: `Árbol ${a.id} · riesgo ${a.clase}: ${coord([a.lat, a.lon])}`, sub: [`${Math.round(a.vol).toLocaleString('es-HN')} m³ de copa.`], color: COL[a.clase] })) });
  }
  out.push({ titulo: 'Cómo leer el mapa', items: [{ t: `Círculo rojo: a menos de ${rMin} m de un árbol de riesgo. Círculo punteado: ${rMax} m. Pon las colonias fuera de ambos.`, sub: [`Radio: Barrantes-Vásquez et al. (2018) para Trigona fulviventris; para otras abejas es una referencia. Coordenadas en grados decimales (WGS84).`] }] });
  return out;
}

export async function dibujarPlan({ R, finca, ubic, cfg = CONFIG, hechas = {} }, crearLienzo = () => document.createElement('canvas')) {
  const medir = crearLienzo().getContext('2d');
  // Primero el mapa en un lienzo aparte, para saber qué hay; luego se mide el texto y se arma la imagen final.
  const lienzoMapa = crearLienzo(); lienzoMapa.width = MAPA.w; lienzoMapa.height = MAPA.h;
  const mapa = await dibujarMapa(lienzoMapa.getContext('2d'), 0, 0, ubic, cfg);
  const bs = bloques(R, mapa, hechas, cfg);
  const ancho = W - 2 * PAD - 24;
  let alto = 130 + (R ? 120 : 0) + (mapa.hayMapa ? MAPA.h + 50 : 0);
  const lineas = bs.map((b) => ({ ...b, items: b.items.map((it) => {
    medir.font = fuente(700, 17); const t = partir(medir, it.t, ancho);
    medir.font = fuente(400, 15); const sub = it.sub.flatMap((x) => partir(medir, x, ancho));
    return { ...it, t, sub };
  }) }));
  lineas.forEach((b) => { alto += 44; b.items.forEach((it) => { alto += it.t.length * 24 + it.sub.length * 21 + 10; }); });
  alto += 70;
  const lz = crearLienzo(); lz.width = W; lz.height = alto;
  const ctx = lz.getContext('2d');
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, alto);
  ctx.fillStyle = COL.verde; ctx.fillRect(0, 0, W, 110);
  ctx.fillStyle = COL.claro; ctx.font = fuente(700, 15); ctx.fillText(R ? 'TROFAXIS · PLAN APIRADAR · ABEJAS NATIVAS Y SPATHODEA' : 'TROFAXIS · MAPA DE LA FINCA', PAD, 40);
  ctx.fillStyle = '#FFFFFF'; ctx.font = fuente(700, 30); ctx.fillText(finca?.nombre || 'Finca sin nombre', PAD, 80);
  ctx.font = fuente(400, 15); ctx.textAlign = 'right'; ctx.fillText(new Date().toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' }), W - PAD, 80); ctx.textAlign = 'left';
  let y = 130;
  if (R) {
    const tono = (v) => (v >= cfg.niveles.alto ? COL.alto : v >= cfg.niveles.medio ? COL.medio : COL.bajo);
    ctx.fillStyle = COL.gris; ctx.font = fuente(600, 14); ctx.fillText('RIESGO HOY', PAD, y + 18); ctx.fillText('CON TU PLAN', PAD + 220, y + 18);
    ctx.font = fuente(800, 56); ctx.fillStyle = tono(R.score); ctx.fillText(String(R.score), PAD, y + 76);
    ctx.fillStyle = COL.gris; ctx.font = fuente(400, 40); ctx.fillText('→', PAD + 130, y + 72);
    ctx.font = fuente(800, 56); ctx.fillStyle = tono(R.total.a); ctx.fillText(String(R.total.a), PAD + 220, y + 76);
    ctx.fillStyle = COL.tinta; ctx.font = fuente(400, 17);
    partir(ctx, `${R.total.delta < 0 ? `El plan baja el riesgo ${-R.total.delta} puntos. ` : ''}${R.resumen}`, W - PAD - (PAD + 360)).slice(0, 4).forEach((l, i) => ctx.fillText(l, PAD + 360, y + 30 + i * 24));
    y += 120;
  }
  if (mapa.hayMapa) {
    ctx.drawImage(lienzoMapa, PAD, y);
    y += MAPA.h + 10;
    ctx.fillStyle = COL.gris; ctx.font = fuente(400, 13);
    ctx.fillText(mapa.satelite ? 'Imagen satelital Sentinel-2 (~10 m por píxel): sirve para ubicarse, no para medir con precisión.' : 'Sin imagen satelital (sin conexión o el servicio no respondió): el mapa muestra solo los puntos.', PAD, y + 14);
    y += 40;
  }
  lineas.forEach((b) => {
    ctx.fillStyle = COL.verde; ctx.font = fuente(700, 20); ctx.fillText(b.titulo, PAD, y + 26); y += 44;
    b.items.forEach((it) => {
      if (it.color) { ctx.fillStyle = it.color; ctx.fillRect(PAD, y + 6, 6, it.t.length * 24 + it.sub.length * 21 - 6); }
      ctx.fillStyle = COL.tinta; ctx.font = fuente(700, 17); it.t.forEach((l) => { ctx.fillText(l, PAD + 18, y + 20); y += 24; });
      ctx.fillStyle = COL.gris; ctx.font = fuente(400, 15); it.sub.forEach((l) => { ctx.fillText(l, PAD + 18, y + 17); y += 21; });
      y += 10;
    });
  });
  ctx.fillStyle = COL.linea; ctx.fillRect(PAD, alto - 50, W - 2 * PAD, 1);
  ctx.fillStyle = COL.gris; ctx.font = fuente(400, 13);
  ctx.fillText('Hecho con Trofaxis (trofaxis.github.io). Lleva coordenadas de tu finca: compártelo con cuidado. Cifras de riesgo por validar en campo.', PAD, alto - 24);
  return { lienzo: lz, satelite: mapa.satelite };
}

// Dibuja y descarga. Devuelve el mensaje para el usuario.
export async function descargarImagenPlan(opciones) {
  try {
    const { lienzo, satelite } = await dibujarPlan(opciones);
    const blob = await new Promise((ok) => lienzo.toBlob(ok, 'image/png'));
    if (!blob) throw new Error('el navegador no pudo crear la imagen');
    const nombre = `trofaxis-${opciones.R ? 'plan-apiradar' : 'mapa'}-${new Date().toISOString().slice(0, 10)}.png`;
    const url = URL.createObjectURL(blob);
    const l = document.createElement('a'); l.href = url; l.download = nombre;
    document.body.appendChild(l); l.click(); l.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return `Se descargó ${nombre}${satelite ? '' : ' (sin imagen satelital: no hubo conexión con el servicio de mapas)'}.`;
  } catch (e) {
    return `No se pudo crear la imagen: ${e.message}.`;
  }
}
